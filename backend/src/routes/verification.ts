import { Router, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Lookup Order for Kiosk Operator by Tracking Code
router.get('/lookup/:trackingCode', authenticateJWT, requireRole('OPERATOR', 'ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { trackingCode } = req.params;

    const order = await prisma.printOrder.findUnique({
      where: { trackingCode: trackingCode.trim().toUpperCase() },
      include: {
        document: true,
        printSettings: true,
        kiosk: true,
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
            department: true,
            phone: true,
            studentProfile: true
          }
        },
        verificationRecord: {
          include: {
            operator: {
              select: { name: true, role: true }
            }
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Tracking code not found in fleet database' });
      return;
    }

    res.json({
      success: true,
      order,
      verificationChecklist: {
        trackingCode: order.trackingCode,
        studentName: order.user.name,
        expectedRollNumber: order.user.rollNumber,
        universityCardId: order.user.studentProfile?.universityCardId || 'N/A',
        kioskLocation: order.kiosk.name,
        envelopeStatus: order.status === 'READY_FOR_PICKUP' ? 'SEALED & IN TRAY' : 'NOT READY',
        removableTrackingMargin: order.printSettings.includeTrackingMargin
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Complete Secure Handover & Verification
router.post('/confirm-handover', authenticateJWT, requireRole('OPERATOR', 'ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const operatorId = req.user!.userId;
    const {
      orderId,
      studentRollNoVerified = true,
      cardVerified = true,
      envelopeCodeVerified = true,
      otpVerified = false,
      verificationNotes = 'Verified university ID card and sealed envelope barcode match'
    } = req.body;

    const order = await prisma.printOrder.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        kiosk: true
      }
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (order.status === 'COLLECTED') {
      res.status(400).json({ success: false, error: 'Order has already been collected' });
      return;
    }

    // Create verification record
    const record = await prisma.verificationRecord.upsert({
      where: { orderId: order.id },
      update: {
        operatorId,
        studentRollNoVerified: Boolean(studentRollNoVerified),
        cardVerified: Boolean(cardVerified),
        envelopeCodeVerified: Boolean(envelopeCodeVerified),
        otpVerified: Boolean(otpVerified),
        verificationNotes,
        verifiedAt: new Date()
      },
      create: {
        orderId: order.id,
        operatorId,
        studentRollNoVerified: Boolean(studentRollNoVerified),
        cardVerified: Boolean(cardVerified),
        envelopeCodeVerified: Boolean(envelopeCodeVerified),
        otpVerified: Boolean(otpVerified),
        verificationNotes,
        verifiedAt: new Date()
      }
    });

    // Update order status to COLLECTED
    const updatedOrder = await prisma.printOrder.update({
      where: { id: order.id },
      data: {
        status: 'COLLECTED',
        collectedAt: new Date()
      }
    });

    // Decrement kiosk queue
    await prisma.kiosk.update({
      where: { id: order.kioskId },
      data: { queueDepth: { decrement: 1 } }
    });

    // Send collection receipt notification to student
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: 'Documents Collected! 📦',
        message: `Your print order #${order.trackingCode} was safely collected at ${order.kiosk.name}. Thank you for using QueueZero!`,
        type: 'ORDER_CONFIRMED',
        link: `/orders/${order.trackingCode}`
      }
    });

    res.json({
      success: true,
      message: 'Collection verified and order status updated to COLLECTED',
      order: updatedOrder,
      verificationRecord: record
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
