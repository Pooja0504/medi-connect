import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from './auth.middleware';

export const rbacMiddleware = (rolesAllowed: string[]) => {
  return (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }

    if (!rolesAllowed.includes(req.user.role)) {
      return res.status(403).json({
        code: 'UNAUTHORIZED',
        message: 'Forbidden: insufficient role',
      });
    }

    next();
  };
};
