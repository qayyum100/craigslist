import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../types';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
            req.user = decoded;
        } catch {
            // silently ignore invalid token for optional auth
        }
    }
    next();
};
