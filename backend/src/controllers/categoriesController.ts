import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) { next(error); return; }

        // Enrich each category with listing count
        const categoriesWithCount = await Promise.all(
            (data || []).map(async (cat) => {
                const { count } = await supabase
                    .from('listings')
                    .select('*', { count: 'exact', head: true })
                    .eq('category_id', cat.id)
                    .eq('status', 'active');
                return { ...cat, listing_count: count || 0 };
            })
        );

        res.json({ categories: categoriesWithCount });
    } catch (err) {
        next(err);
    }
};
