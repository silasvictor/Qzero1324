import { Router, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Process Order Payment
router.post('/pay', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { orderId, method = 'WALLET' } = req.body; // 'WALLET' | 'RAZORPAY_SANDBOX' | 'UPI_MOCK'

    const order = await prisma.printOrder.findUnique({
      where: { id: orderId },
      include: {
        user: { include: { studentProfile: true } },
        document: true,
        kiosk: true
      }
    });

    if (!order || order.userId !== userId) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (order.status !== 'PENDING_PAYMENT') {
      res.status(400).json({ success: false, error: `Order is already ${order.status}` });
      return;
    }

    const receiptNumber = `RCP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const transactionId = `TXN-${method.substring(0, 3)}-${Date.now()}`;

    // Wallet settlement logic
    if (method === 'WALLET') {
      const studentProfile = order.user.studentProfile;
      const currentBalance = studentProfile?.balance ?? 0;

      if (currentBalance < order.amount) {
        res.status(400).json({
          success: false,
          error: `Insufficient wallet balance (₹${currentBalance.toFixed(2)}). Total required: ₹${order.amount.toFixed(2)}. Please top up or select Razorpay/UPI.`
        });
        return;
      }

      // Deduct balance atomically
      await prisma.studentProfile.update({
        where: { userId },
        data: {
          balance: { decrement: order.amount },
          loyaltyPoints: { increment: Math.floor(order.amount * 2) }
        }
      });
    }

    // Record payment
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        amount: order.amount,
        currency: 'INR',
        method,
        status: 'SUCCESS',
        transactionId,
        receiptNumber,
        paidAt: new Date()
      }
    });

    // Advance order to QUEUED
    const updatedOrder = await prisma.printOrder.update({
      where: { id: order.id },
      data: {
        status: 'QUEUED'
      },
      include: {
        document: true,
        kiosk: true,
        printSettings: true,
        payment: true
      }
    });

    // Send confirmation in-app notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Payment Confirmed & Order Queued! 🖨️',
        message: `Order #${updatedOrder.trackingCode} is queued at ${order.kiosk.name}. Total paid: ₹${order.amount.toFixed(2)}.`,
        type: 'PAYMENT_SUCCESS',
        link: `/orders/${updatedOrder.trackingCode}`
      }
    });

    res.json({
      success: true,
      message: 'Payment verified successfully! Order queued for printing.',
      payment,
      order: updatedOrder
    });
  } catch (err: any) {
    console.error('Payment error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Top-up Campus Wallet
router.post('/top-up-wallet', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { amount = 100 } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      res.status(400).json({ success: false, error: 'Minimum top-up amount is ₹10' });
      return;
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        balance: { increment: numAmount }
      }
    });

    await prisma.notification.create({
      data: {
        userId,
        title: 'Wallet Recharged! 💳',
        message: `₹${numAmount.toFixed(2)} added to your campus wallet. New balance: ₹${updatedProfile.balance.toFixed(2)}.`,
        type: 'SYSTEM'
      }
    });

    res.json({
      success: true,
      message: `Successfully added ₹${numAmount.toFixed(2)} to wallet`,
      newBalance: updatedProfile.balance
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User Payment History
router.get('/history', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user!.userId },
      include: {
        order: {
          include: {
            document: true,
            kiosk: true
          }
        }
      },
      orderBy: { paidAt: 'desc' }
    });

    res.json({ success: true, payments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
