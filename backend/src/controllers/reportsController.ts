import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';

const reportSchema = z.object({
    reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
});

export const createReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { listingId } = req.params;
        const { reason } = reportSchema.parse(req.body);

        const { data: listing } = await supabase
            .from('listings')
            .select('id')
            .eq('id', listingId)
            .single();

        if (!listing) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }

        // Check for duplicate report from same user
        const { data: existingReport } = await supabase
            .from('reports')
            .select('id')
            .eq('reporter_id', req.user!.id)
            .eq('listing_id', listingId)
            .eq('status', 'pending')
            .single();

        if (existingReport) {
            res.status(409).json({ error: 'You have already reported this listing' });
            return;
        }

        const { data, error } = await supabase
            .from('reports')
            .insert({ reporter_id: req.user!.id, listing_id: listingId, reason })
            .select()
            .single();

        if (error) { next(error); return; }

        res.status(201).json({ report: data, message: 'Report submitted successfully' });
    } catch (err) {
        next(err);
    }
};
