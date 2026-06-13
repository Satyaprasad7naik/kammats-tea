import express from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'No signature found' });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured.');
    }

    // Webhook uses raw body
    const bodyString = req.body.toString('utf8');

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(bodyString)
      .digest('hex');

    if (generated_signature !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event, payload } = JSON.parse(bodyString);

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;

      await prisma.$transaction(async (tx) => {
        // Use raw query for true row-level locking (SELECT ... FOR UPDATE) to prevent race conditions
        const existingOrders: any[] = await tx.$queryRaw`SELECT "paymentStatus" FROM "Order" WHERE "razorpayOrderId" = ${orderId} FOR UPDATE`;

        if (existingOrders.length > 0 && existingOrders[0].paymentStatus !== 'PAID') {
          const updatedOrder = await tx.order.update({
            where: { razorpayOrderId: orderId },
            data: {
              paymentStatus: 'PAID',
              razorpayPaymentId: payment.id,
              invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
            },
            include: { items: true }
          });

          // Decrement stock only when payment is actually confirmed via webhook
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
        }
      });
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error in webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;