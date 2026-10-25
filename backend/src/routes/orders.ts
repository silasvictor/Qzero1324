import { Router, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { generateTrackingCode } from '../utils/trackingCode.js';
import { calculatePrintPrice } from '../services/priceEngine.js';
import { calculatePriorityRank } from '../services/queueEngine.js';

const router = Router();

// Create new print order
router.post('/create', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      documentId,
      kioskId,
      pickupSlotId,
      printMode = 'SCHEDULED'
    } = req.body;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { printSettings: true }
    });

    if (!document || document.userId !== userId) {
      res.status(404).json({ success: false, error: 'Document not found' });
      return;
    }

    const kiosk = await prisma.kiosk.findUnique({ where: { id: kioskId } });
    if (!kiosk) {
      res.status(404).json({ success: false, error: 'Selected kiosk not found' });
      return;
    }

    const settings = document.printSettings;
    const pricing = calculatePrintPrice({
      pageCount: document.pageCount,
      colorMode: (settings?.colorMode as any) || 'BW',
      duplexMode: (settings?.duplexMode as any) || 'DOUBLE',
      paperSize: (settings?.paperSize as any) || 'A4',
      copies: settings?.copies || 1,
      printMode: printMode as any,
      bindingOption: (settings?.bindingOption as any) || 'NONE'
    });

    // Check slot if scheduled
    let pickupWindowStart: Date | null = null;
    let pickupWindowEnd: Date | null = null;

    if (printMode === 'SCHEDULED' && pickupSlotId) {
      const slot = await prisma.pickupSlot.findUnique({ where: { id: pickupSlotId } });
      if (slot) {
        pickupWindowStart = slot.startTime;
        pickupWindowEnd = slot.endTime;
        // Increment slot booking count
        await prisma.pickupSlot.update({
          where: { id: slot.id },
          data: {
            bookedCount: { increment: 1 },
            isAvailable: slot.bookedCount + 1 < slot.capacity
          }
        });
      }
    } else {
      // Instant printing mode: pickup ready in 5-10 minutes
      const now = new Date();
      pickupWindowStart = new Date(now.getTime() + 5 * 60 * 1000);
      pickupWindowEnd = new Date(now.getTime() + 60 * 60 * 1000);
    }

    // Generate unique 8-character tracking code
    let trackingCode = generateTrackingCode();
    while (await prisma.printOrder.findUnique({ where: { trackingCode } })) {
      trackingCode = generateTrackingCode();
    }

    const initialPriority = calculatePriorityRank({
      orderId: 'temp',
      trackingCode,
      printMode: printMode as any,
      estimatedPrintTimeSec: pricing.estimatedPrintTimeSec,
      createdAt: new Date()
    });

    const order = await prisma.printOrder.create({
      data: {
        trackingCode,
        userId,
        documentId: document.id,
        printSettingsId: settings!.id,
        kioskId: kiosk.id,
        pickupSlotId: pickupSlotId || null,
        printMode,
        status: 'PENDING_PAYMENT',
        priorityScore: initialPriority,
        estimatedPrintTimeSec: pricing.estimatedPrintTimeSec,
        totalPages: document.pageCount * (settings?.copies || 1),
        amount: pricing.totalAmount,
        currency: 'INR',
        pickupWindowStart,
        pickupWindowEnd
      },
      include: {
        document: true,
        printSettings: true,
        kiosk: true,
        pickupSlot: true
      }
    });

    // Update kiosk queue depth
    await prisma.kiosk.update({
      where: { id: kiosk.id },
      data: { queueDepth: { increment: 1 } }
    });

    res.status(201).json({
      success: true,
      message: 'Print order initiated. Please complete payment.',
      order,
      pricing
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User's Orders
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const userId = req.user!.userId;

    const whereClause: any = { userId };
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { trackingCode: { contains: search } },
        { document: { originalName: { contains: search } } },
        { kiosk: { name: { contains: search } } }
      ];
    }

    const orders = await prisma.printOrder.findMany({
      where: whereClause,
      include: {
        document: true,
        printSettings: true,
        kiosk: true,
        pickupSlot: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Upcoming Pickup & Order Statistics for Student Dashboard
router.get('/dashboard-summary', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const orders = await prisma.printOrder.findMany({
      where: { userId },
      include: {
        document: true,
        printSettings: true,
        kiosk: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'COLLECTED').length;
    const activeOrders = orders.filter(o => ['CONFIRMED', 'QUEUED', 'PRINTING', 'PACKING', 'READY_FOR_PICKUP'].includes(o.status)).length;
    const scheduledOrders = orders.filter(o => o.printMode === 'SCHEDULED' && o.status !== 'COLLECTED' && o.status !== 'CANCELLED').length;

    // Upcoming pickup: first active order ready or scheduled soonest
    const upcoming = orders.find(o => ['READY_FOR_PICKUP', 'PACKING', 'PRINTING', 'QUEUED', 'CONFIRMED'].includes(o.status));

    // Recent 5 orders
    const recentOrders = orders.slice(0, 5);

    res.json({
      success: true,
      statistics: {
        totalOrders,
        completedOrders,
        activeOrders,
        scheduledOrders
      },
      upcomingPickup: upcoming || null,
      recentOrders
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Single Order Details by ID or Tracking Code
router.get('/:identifier', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const order = await prisma.printOrder.findFirst({
      where: {
        OR: [
          { id: identifier },
          { trackingCode: identifier }
        ]
      },
      include: {
        document: true,
        printSettings: true,
        kiosk: true,
        pickupSlot: true,
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            department: true,
            email: true
          }
        },
        verificationRecord: true
      }
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // Role check: Students can only view their own orders; Admins and Operators can view any
    if (role === 'STUDENT' && order.userId !== userId) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
