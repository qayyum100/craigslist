import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational
        ? err.message
        : process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message;

    console.error(`[Error] ${statusCode}: ${err.message}`, err.stack);

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

export const createError = (message: string, statusCode: number): AppError => {
    const err: AppError = new Error(message);
    err.statusCode = statusCode;
    err.isOperational = true;
    return err;
};
