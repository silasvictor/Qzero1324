import { Router, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all notifications for user
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' }
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id }
    });

    if (!notification || notification.userId !== req.user!.userId) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });

    res.json({ success: true, notification: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark all as read
router.patch('/read-all', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
