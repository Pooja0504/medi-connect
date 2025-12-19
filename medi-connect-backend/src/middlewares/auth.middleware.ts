import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export interface JwtPayload {
  sub: string;  // user ID
  role: string; // PATIENT | DOCTOR
  iat?: number;
  exp?: number;
}

export const authMiddleware = (
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Auth middleware - received request:', req.method, req.path);
    console.log('Auth header:', req.headers['authorization']);
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Token missing',
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Token missing',
      });
    }

    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = payload;

    next();
  } catch (err) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }
};
