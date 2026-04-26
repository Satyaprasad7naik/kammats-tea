import express from 'express';
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { generateInvoicePDF } from '../utils/invoice';

const router = express.Router();
const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxx',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxx',
});

// Create an order
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      items, // Array of { productId, quantity }
    } = req.body;

    if (!customerName || !phone || !address || !city || !state || !pincode || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Fetch products to calculate exact prices (never trust frontend prices)
    let subtotal = 0;
    let gstTotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ error: `Product with id ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
      }

      const itemSubtotal = product.price * item.quantity;
      const itemGstAmount = (itemSubtotal * product.gstRate) / 100;
      const lineTotal = itemSubtotal + itemGstAmount;

      subtotal += itemSubtotal;
      gstTotal += itemGstAmount;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        gstRate: product.gstRate,
        hsnCode: product.hsnCode,
        gstAmount: itemGstAmount,
        lineTotal: lineTotal
      });
    }

    const grandTotal = subtotal + gstTotal;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // 2. Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(grandTotal * 100), // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: orderNumber,
    });

    // 3. Create Order Transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          phone,
          email,
          address,
          city,
          state,
          pincode,
          subtotal,
          gstTotal,
          grandTotal,
          paymentStatus: 'PENDING',
          orderStatus: 'PROCESSING',
          razorpayOrderId: razorpayOrder.id,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: true
        }
      });

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    res.status(201).json(order);

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify Payment Signature
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxx';

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Payment is successful, update order status
    const order = await prisma.order.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        paymentStatus: 'PAID',
        razorpayPaymentId: razorpay_payment_id,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
      },
    });

    res.json({ status: 'success', order });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});


// Generate Invoice
router.get('/:id/invoice', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus !== 'PAID') {
      return res.status(400).json({ error: 'Cannot generate invoice for unpaid order' });
    }

    generateInvoicePDF(order, res);

  } catch (error) {
    console.error('Error generating invoice:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate invoice' });
    }
  }
});

// Get a single order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;