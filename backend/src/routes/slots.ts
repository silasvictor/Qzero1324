import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

const router = Router();

// Get slots for a kiosk
router.get('/kiosk/:kioskId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { kioskId } = req.params;
    const { date } = req.query; // YYYY-MM-DD or default today

    const kiosk = await prisma.kiosk.findUnique({ where: { id: kioskId } });
    if (!kiosk) {
      res.status(404).json({ success: false, error: 'Kiosk not found' });
      return;
    }

    let queryDate = new Date();
    if (date && typeof date === 'string') {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) queryDate = parsed;
    }

    const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 8, 0, 0);
    const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 20, 0, 0);

    let slots = await prisma.pickupSlot.findMany({
      where: {
        kioskId,
        startTime: { gte: startOfDay, lte: endOfDay }
      },
      orderBy: { startTime: 'asc' }
    });

    // Auto-generate realistic demo slots for the day if empty
    if (slots.length === 0) {
      const demoSlotsData = [];
      const now = new Date();

      for (let hour = 9; hour < 19; hour++) {
        for (let min of [0, 30]) {
          const sTime = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), hour, min, 0);
          const eTime = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), hour, min + 25, 0);

          // Randomize some bookings for realistic feel
          const booked = Math.floor(Math.random() * 6);
          const isAvailable = sTime > now && booked < 10;

          demoSlotsData.push({
            kioskId,
            startTime: sTime,
            endTime: eTime,
            capacity: 10,
            bookedCount: booked,
            isAvailable
          });
        }
      }

      await prisma.pickupSlot.createMany({
        data: demoSlotsData
      });

      slots = await prisma.pickupSlot.findMany({
        where: {
          kioskId,
          startTime: { gte: startOfDay, lte: endOfDay }
        },
        orderBy: { startTime: 'asc' }
      });
    }

    res.json({ success: true, slots });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
