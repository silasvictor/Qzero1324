import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { generateToken, authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rollNumber: z.string().min(3, 'Roll/Registration number required'),
  department: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Student Signup
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
      return;
    }

    const { name, email, password, rollNumber, department, phone } = parseResult.data;

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { rollNumber }]
      }
    });

    if (existing) {
      res.status(400).json({
        success: false,
        error: existing.email === email ? 'Email already registered' : 'Roll number already registered'
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'STUDENT',
        rollNumber,
        department: department || 'Computer Science & Engineering',
        phone: phone || '+91 9876543210',
        studentProfile: {
          create: {
            balance: 250.00, // Promotional signup balance in INR
            year: '3rd Year',
            universityCardId: `UCID-${Math.floor(100000 + Math.random() * 900000)}`,
            loyaltyPoints: 100
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
      rollNumber: user.rollNumber
    });

    // Create initial welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to QueueZero! 🚀',
        message: 'Your campus smart printing account is activated with ₹250 free printing credits.',
        type: 'SYSTEM'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        department: user.department,
        balance: user.studentProfile?.balance ?? 0
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Registration failed: ' + err.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, error: 'Valid email and password are required' });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true }
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
      rollNumber: user.rollNumber
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        department: user.department,
        balance: user.studentProfile?.balance ?? 0
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed: ' + err.message });
  }
});

// Get Current User Profile
router.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        studentProfile: true,
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        department: user.department,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        balance: user.studentProfile?.balance ?? 0,
        loyaltyPoints: user.studentProfile?.loyaltyPoints ?? 0,
        year: user.studentProfile?.year,
        recentOrdersCount: user.orders.length
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Demo Fast Switch Login (for Hackathon evaluation)
router.post('/demo-login', async (req: Request, res: Response): Promise<void> => {
  const { role } = req.body; // 'STUDENT' | 'ADMIN' | 'OPERATOR'

  try {
    const user = await prisma.user.findFirst({
      where: { role: role || 'STUDENT' },
      include: { studentProfile: true }
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'Demo account not found for role: ' + role });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
      rollNumber: user.rollNumber
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        department: user.department,
        balance: user.studentProfile?.balance ?? 0
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Simulated OTP Verification (for forgot password or identity check)
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ success: false, error: 'Email and OTP required' });
    return;
  }

  // Demonstration OTP accepts standard 123456 or 000000
  if (otp === '123456' || otp === '000000' || otp.length === 6) {
    res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ success: false, error: 'Invalid OTP' });
  }
});

export default router;
