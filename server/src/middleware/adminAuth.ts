import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : (req.query.token as string);
  if (!token || token !== config.adminToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
