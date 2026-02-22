import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getAllListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
        const limit = 20;
        const offset = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        let query = supabase
            .from('listings')
            .select(`
        *,
        profiles!listings_user_id_fkey(id, username, email),
        categories!listings_category_id_fkey(name, slug),
        listing_images(id, url, is_primary)
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) query = query.eq('status', status);

        const { data, count, error } = await query;
        if (error) { next(error); return; }

        res.json({
            listings: data,
            pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
        });
    } catch (err) {
        next(err);
    }
};

export const approveListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('listings')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error || !data) { res.status(404).json({ error: 'Listing not found' }); return; }
        res.json({ listing: data, message: 'Listing approved' });
    } catch (err) {
        next(err);
    }
};

export const rejectListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('listings')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error || !data) { res.status(404).json({ error: 'Listing not found' }); return; }
        res.json({ listing: data, message: 'Listing rejected' });
    } catch (err) {
        next(err);
    }
};

export const getAllReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
        const limit = 20;
        const offset = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        let query = supabase
            .from('reports')
            .select(`
        *,
        profiles!reports_reporter_id_fkey(username),
        listings!reports_listing_id_fkey(id, title, status)
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) query = query.eq('status', status);

        const { data, count, error } = await query;
        if (error) { next(error); return; }

        res.json({
            reports: data,
            pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
        });
    } catch (err) {
        next(err);
    }
};

export const resolveReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('reports')
            .update({ status: 'resolved' })
            .eq('id', id)
            .select()
            .single();

        if (error || !data) { res.status(404).json({ error: 'Report not found' }); return; }
        res.json({ report: data, message: 'Report resolved' });
    } catch (err) {
        next(err);
    }
};

export const getAdminStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const [
            { count: totalListings },
            { count: activeListings },
            { count: pendingListings },
            { count: totalUsers },
            { count: pendingReports },
        ] = await Promise.all([
            supabase.from('listings').select('*', { count: 'exact', head: true }),
            supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);

        res.json({
            stats: {
                totalListings,
                activeListings,
                pendingListings,
                totalUsers,
                pendingReports,
            },
        });
    } catch (err) {
        next(err);
    }
};
