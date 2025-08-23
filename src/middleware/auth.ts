import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';
import { JwtPayload, AuthUser, UserRole } from '../types';
import { createResponse } from '../utils/helper';
import prisma from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json(
        createResponse(false, 'Access token required')
      );
      return;
    }

    const decoded = jwt.verify(token, JWT_CONFIG.secret) as JwtPayload;
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      res.status(401).json(
        createResponse(false, 'User not found')
      );
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json(
      createResponse(false, 'Invalid or expired token')
    );
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(
        createResponse(false, 'Authentication required')
      );
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(
        createResponse(false, 'Insufficient permissions')
      );
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole([UserRole.ADMIN]);