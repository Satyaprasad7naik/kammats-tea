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

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'xxxxxxxxxx';
    const body = req.body;

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error in webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;