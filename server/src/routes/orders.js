"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const invoice_1 = require("../utils/invoice");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxx',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxx',
});
// Create an order
router.post('/', async (req, res) => {
    try {
        const { customerName, phone, email, address, city, state, pincode, items, // Array of { productId, quantity }
         } = req.body;
        if (!customerName || !phone || !address || !city || !state || !pincode || !items || !items.length) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Validate quantities to prevent negative amounts or 0
        for (const item of items) {
            if (typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
                return res.status(400).json({ error: 'Invalid quantity provided' });
            }
        }
        // Move everything inside a transaction to prevent race conditions
        const orderResult = await prisma.$transaction(async (tx) => {
            // 1. Fetch products to calculate exact prices (never trust frontend prices)
            let subtotal = 0;
            let gstTotal = 0;
            const orderItemsData = [];
            for (const item of items) {
                // Lock the product row for update to prevent concurrent race conditions on stock
                const products = await tx.$queryRaw `SELECT * FROM "Product" WHERE "id" = ${item.productId} FOR UPDATE`;
                if (products.length === 0) {
                    throw new Error(`Product with id ${item.productId} not found`);
                }
                const product = products[0];
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}`);
                }
                const itemSubtotal = Number((product.price * item.quantity).toFixed(2));
                const itemGstAmount = Number(((itemSubtotal * product.gstRate) / 100).toFixed(2));
                const lineTotal = Number((itemSubtotal + itemGstAmount).toFixed(2));
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
            subtotal = Number(subtotal.toFixed(2));
            gstTotal = Number(gstTotal.toFixed(2));
            const grandTotal = Number((subtotal + gstTotal).toFixed(2));
            const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
            // 2. Create Razorpay Order
            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(grandTotal * 100), // amount in the smallest currency unit (paise)
                currency: 'INR',
                receipt: orderNumber,
            });
            // 3. Create the order
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
            return newOrder;
        });
        res.status(201).json(orderResult);
    }
    catch (error) {
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
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            throw new Error("Razorpay secret not configured");
        }
        const generated_signature = crypto_1.default
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');
        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }
        // Payment is successful, update order status
        const order = await prisma.$transaction(async (tx) => {
            // Use raw query for true row-level locking (SELECT ... FOR UPDATE) to prevent race conditions
            const existingOrders = await tx.$queryRaw `SELECT "paymentStatus" FROM "Order" WHERE "razorpayOrderId" = ${razorpay_order_id} FOR UPDATE`;
            if (existingOrders.length === 0) {
                throw new Error('Order not found');
            }
            if (existingOrders[0].paymentStatus === 'PAID') {
                throw new Error('Order already paid and verified');
            }
            const updatedOrder = await tx.order.update({
                where: { razorpayOrderId: razorpay_order_id },
                data: {
                    paymentStatus: 'PAID',
                    razorpayPaymentId: razorpay_payment_id,
                    invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
                },
                include: { items: true }
            });
            // Now decrement stock since payment is confirmed
            for (const item of updatedOrder.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                });
            }
            return updatedOrder;
        });
        res.json({ status: 'success', order });
    }
    catch (error) {
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
        (0, invoice_1.generateInvoicePDF)(order, res);
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map