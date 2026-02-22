import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getBookmarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
        const limit = 12;
        const offset = (page - 1) * limit;

        const { data, count, error } = await supabase
            .from('bookmarks')
            .select(`
        created_at,
        listings(
          id, title, description, price, location, status, created_at,
          listing_images(id, url, is_primary),
          categories!listings_category_id_fkey(name, slug)
        )
      `, { count: 'exact' })
            .eq('user_id', req.user!.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) { next(error); return; }

        res.json({
            bookmarks: data,
            pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
        });
    } catch (err) {
        next(err);
    }
};

export const addBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { listingId } = req.params;

        const { data: listing } = await supabase
            .from('listings')
            .select('id')
            .eq('id', listingId)
            .single();

        if (!listing) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }

        const { error } = await supabase
            .from('bookmarks')
            .upsert({ user_id: req.user!.id, listing_id: listingId }, { onConflict: 'user_id,listing_id' });

        if (error) { next(error); return; }

        res.status(201).json({ message: 'Listing bookmarked' });
    } catch (err) {
        next(err);
    }
};

export const removeBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { listingId } = req.params;

        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', req.user!.id)
            .eq('listing_id', listingId);

        if (error) { next(error); return; }

        res.json({ message: 'Bookmark removed' });
    } catch (err) {
        next(err);
    }
};
