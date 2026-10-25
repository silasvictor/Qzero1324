import { Router, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Submit a support ticket
router.post('/tickets', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { orderId, category = 'GENERAL', subject, description } = req.body;

    if (!subject || !description) {
      res.status(400).json({ success: false, error: 'Subject and description are required' });
      return;
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        orderId: orderId || null,
        category,
        subject,
        description,
        status: 'OPEN'
      }
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId,
        title: 'Support Ticket Created 🎫',
        message: `Your ticket regarding "${subject}" has been received. Ticket ID: #${ticket.id.slice(0, 8)}`,
        type: 'SYSTEM',
        link: '/support'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully',
      ticket
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user's support tickets
router.get('/tickets', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, tickets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Get all tickets
router.get('/admin/tickets', authenticateJWT, requireRole('ADMIN'), async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            rollNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, tickets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Respond to and resolve ticket
router.patch('/admin/tickets/:id', authenticateJWT, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, adminResponse } = req.body;

    const ticket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: {
        status,
        adminResponse
      },
      include: { user: true }
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: ticket.userId,
        title: `Ticket Updated: #${ticket.id.slice(0, 8)}`,
        message: `Status: ${status}. Admin response: "${adminResponse}"`,
        type: 'SYSTEM',
        link: '/support'
      }
    });

    res.json({ success: true, ticket });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
