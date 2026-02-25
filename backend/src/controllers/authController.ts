import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import { supabase } from '../config/supabase';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signToken = (payload: object) =>
    jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password, username } = registerSchema.parse(req.body);

        // Check if username taken
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .maybeSingle();

        if (existingUser) {
            res.status(409).json({ error: 'Username already taken' });
            return;
        }

        // Check if email taken
        const { data: emailCheck } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (emailCheck) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const { data: profile, error } = await supabase
            .from('profiles')
            .insert({
                email,
                username,
                password_hash: hashedPassword,
                role: 'user',
            })
            .select('id, email, username, role, created_at')
            .single();

        if (error) {
            next(error);
            return;
        }

        const token = signToken({ id: profile.id, email: profile.email, username: profile.username, role: profile.role });

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: { id: profile.id, email: profile.email, username: profile.username, role: profile.role },
        });
    } catch (err) {
        next(err);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, email, username, role, password_hash')
            .eq('email', email)
            .maybeSingle();

        if (error || !profile) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const isValid = await bcrypt.compare(password, profile.password_hash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const token = signToken({ id: profile.id, email: profile.email, username: profile.username, role: profile.role });

        res.json({
            token,
            user: { id: profile.id, email: profile.email, username: profile.username, role: profile.role },
        });
    } catch (err) {
        next(err);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', email)
            .maybeSingle();

        if (error) {
            next(error);
            return;
        }

        if (!profile) {
            // Return success anyway for security to prevent email enumeration
            res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                reset_token: hashedToken,
                reset_token_expires: expires.toISOString(),
            })
            .eq('id', profile.id);

        if (updateError) {
            next(updateError);
            return;
        }

        // IMPORTANT: In production, send this via email. For now, we return it for testing.
        console.log(`Password reset token for ${email}: ${resetToken}`);

        res.json({
            message: 'If an account with that email exists, a password reset link has been sent.',
            _debug_token: resetToken // Only for development convenience
        });
    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token, password } = resetPasswordSchema.parse(req.body);
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, reset_token_expires')
            .eq('reset_token', hashedToken)
            .gt('reset_token_expires', new Date().toISOString())
            .maybeSingle();

        if (error) {
            next(error);
            return;
        }

        if (!profile) {
            res.status(400).json({ error: 'Invalid or expired password reset token' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                password_hash: hashedPassword,
                reset_token: null,
                reset_token_expires: null,
            })
            .eq('id', profile.id);

        if (updateError) {
            next(updateError);
            return;
        }

        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, email, username, role, avatar_url, created_at')
            .eq('id', req.user!.id)
            .single();

        if (error || !profile) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ user: profile });
    } catch (err) {
        next(err);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updateSchema = z.object({
            username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
            avatar_url: z.string().url().optional(),
        });
        const updates = updateSchema.parse(req.body);

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', req.user!.id)
            .select('id, email, username, role, avatar_url')
            .single();

        if (error) {
            next(error);
            return;
        }

        res.json({ user: data });
    } catch (err) {
        next(err);
    }
};
