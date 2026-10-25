import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all kiosks (Public/Student)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const kiosks = await prisma.kiosk.findMany({
      include: {
        _count: {
          select: {
            orders: {
              where: {
                status: { in: ['CONFIRMED', 'QUEUED', 'PRINTING', 'PACKING', 'READY_FOR_PICKUP'] }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const enriched = kiosks.map(k => ({
      ...k,
      activeOrdersCount: k._count.orders,
      isDemonstration: true, // Tag demonstration locations
      estimatedWaitTimeMin: Math.round(k.queueDepth * 1.5)
    }));

    res.json({ success: true, kiosks: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single kiosk details with pickup slots
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const kiosk = await prisma.kiosk.findUnique({
      where: { id: req.params.id },
      include: {
        slots: {
          where: {
            isAvailable: true,
            startTime: { gte: new Date() }
          },
          orderBy: { startTime: 'asc' },
          take: 20
        }
      }
    });

    if (!kiosk) {
      res.status(404).json({ success: false, error: 'Kiosk not found' });
      return;
    }

    res.json({ success: true, kiosk });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Update Kiosk Status / Telemetry
router.patch('/:id/telemetry', authenticateJWT, requireRole('ADMIN', 'OPERATOR'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, paperLevelPercent, tonerLevelPercent, ppmSpeed } = req.body;

    const updated = await prisma.kiosk.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(paperLevelPercent !== undefined && { paperLevelPercent: Number(paperLevelPercent) }),
        ...(tonerLevelPercent !== undefined && { tonerLevelPercent: Number(tonerLevelPercent) }),
        ...(ppmSpeed !== undefined && { ppmSpeed: Number(ppmSpeed) })
      }
    });

    // Create audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user!.userId,
        action: 'KIOSK_TELEMETRY_UPDATE',
        targetType: 'KIOSK',
        targetId: updated.id,
        details: `Updated kiosk ${updated.name}: Status=${updated.status}, Paper=${updated.paperLevelPercent}%, Toner=${updated.tonerLevelPercent}%`
      }
    });

    res.json({ success: true, kiosk: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
