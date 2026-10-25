import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'qzero_super_secret_jwt_key_hackathon_2026_dev_mode';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'OPERATOR';
  name: string;
  rollNumber?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, error: 'Invalid or expired authentication token' });
  }
}

export function requireRole(...roles: ('STUDENT' | 'ADMIN' | 'OPERATOR')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Role must be one of: ${roles.join(', ')}`
      });
      return;
    }

    next();
  };
}
