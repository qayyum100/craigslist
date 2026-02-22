import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';

const listingSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(150),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    price: z.number().min(0).max(9999999).nullable().optional(),
    location: z.string().min(2).max(200),
    category_id: z.number().int().positive(),
    status: z.enum(['active', 'pending', 'sold']).optional().default('active'),
});

const listingsQuerySchema = z.object({
    page: z.string().optional().transform(v => Math.max(1, parseInt(v || '1', 10))),
    limit: z.string().optional().transform(v => Math.min(50, Math.max(1, parseInt(v || '12', 10)))),
    category: z.string().optional(),
    location: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
    maxPrice: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'oldest']).optional().default('newest'),
});

export const getListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const query = listingsQuerySchema.parse(req.query);
        const { page, limit, category, location, search, minPrice, maxPrice, sort } = query;
        const offset = (page - 1) * limit;

        let dbQuery = supabase
            .from('listings')
            .select(`
        id, title, description, price, location, status, views, created_at, updated_at,
        user_id,
        profiles!listings_user_id_fkey(username, avatar_url),
        categories!listings_category_id_fkey(name, slug),
        listing_images(id, url, is_primary)
      `, { count: 'exact' })
            .eq('status', 'active')
            .range(offset, offset + limit - 1);

        if (category) dbQuery = dbQuery.eq('categories.slug', category);
        if (location) dbQuery = dbQuery.ilike('location', `%${location}%`);
        if (search) dbQuery = dbQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        if (minPrice !== undefined) dbQuery = dbQuery.gte('price', minPrice);
        if (maxPrice !== undefined) dbQuery = dbQuery.lte('price', maxPrice);

        switch (sort) {
            case 'price_asc': dbQuery = dbQuery.order('price', { ascending: true, nullsFirst: false }); break;
            case 'price_desc': dbQuery = dbQuery.order('price', { ascending: false, nullsFirst: false }); break;
            case 'oldest': dbQuery = dbQuery.order('created_at', { ascending: true }); break;
            default: dbQuery = dbQuery.order('created_at', { ascending: false });
        }

        const { data, count, error } = await dbQuery;

        if (error) { next(error); return; }

        res.json({
            listings: data,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getListingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        // Increment view count
        await supabase.rpc('increment_listing_views', { listing_id: id });

        const { data, error } = await supabase
            .from('listings')
            .select(`
        *,
        profiles!listings_user_id_fkey(id, username, avatar_url),
        categories!listings_category_id_fkey(id, name, slug, icon),
        listing_images(id, url, is_primary)
      `)
            .eq('id', id)
            .single();

        if (error || !data) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }

        // Check if bookmarked by current user
        let isBookmarked = false;
        if (req.user) {
            const { data: bm } = await supabase
                .from('bookmarks')
                .select('listing_id')
                .eq('user_id', req.user.id)
                .eq('listing_id', id)
                .single();
            isBookmarked = !!bm;
        }

        res.json({ listing: { ...data, isBookmarked } });
    } catch (err) {
        next(err);
    }
};

export const createListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const body = listingSchema.parse(req.body);

        const { data, error } = await supabase
            .from('listings')
            .insert({ ...body, user_id: req.user!.id })
            .select('*')
            .single();

        if (error) { next(error); return; }

        res.status(201).json({ listing: data, message: 'Listing created successfully' });
    } catch (err) {
        next(err);
    }
};

export const updateListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const body = listingSchema.partial().parse(req.body);

        // Verify ownership
        const { data: existing } = await supabase
            .from('listings')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!existing) { res.status(404).json({ error: 'Listing not found' }); return; }
        if (existing.user_id !== req.user!.id && req.user!.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden: You do not own this listing' });
            return;
        }

        const { data, error } = await supabase
            .from('listings')
            .update({ ...body, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*')
            .single();

        if (error) { next(error); return; }

        res.json({ listing: data });
    } catch (err) {
        next(err);
    }
};

export const deleteListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const { data: existing } = await supabase
            .from('listings')
            .select('user_id, listing_images(url)')
            .eq('id', id)
            .single();

        if (!existing) { res.status(404).json({ error: 'Listing not found' }); return; }
        if (existing.user_id !== req.user!.id && req.user!.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden: You do not own this listing' });
            return;
        }

        // Delete images from storage
        if (existing.listing_images && existing.listing_images.length > 0) {
            const paths = existing.listing_images
                .map((img: { url: string }) => {
                    const url = new URL(img.url);
                    return url.pathname.split('/object/public/listings/')[1];
                })
                .filter(Boolean);
            if (paths.length > 0) {
                await supabase.storage.from('listings').remove(paths);
            }
        }

        const { error } = await supabase.from('listings').delete().eq('id', id);
        if (error) { next(error); return; }

        res.json({ message: 'Listing deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const uploadListingImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            res.status(400).json({ error: 'No images provided' });
            return;
        }

        if (files.length > 5) {
            res.status(400).json({ error: 'Maximum 5 images allowed per listing' });
            return;
        }

        // Verify ownership
        const { data: listing } = await supabase
            .from('listings')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!listing) { res.status(404).json({ error: 'Listing not found' }); return; }
        if (listing.user_id !== req.user!.id && req.user!.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        // Check existing image count
        const { count: existingCount } = await supabase
            .from('listing_images')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', id);

        if ((existingCount || 0) + files.length > 5) {
            res.status(400).json({ error: `Cannot add more images. Max 5 per listing (${existingCount} already uploaded)` });
            return;
        }

        const uploadedImages = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = `${id}/${Date.now()}-${i}.${file.mimetype.split('/')[1]}`;

            const { error: uploadError } = await supabase.storage
                .from('listings')
                .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(fileName);

            const { data: imgRecord } = await supabase
                .from('listing_images')
                .insert({
                    listing_id: id,
                    url: publicUrl,
                    is_primary: existingCount === 0 && i === 0,
                })
                .select()
                .single();

            uploadedImages.push(imgRecord);
        }

        res.status(201).json({ images: uploadedImages });
    } catch (err) {
        next(err);
    }
};

export const deleteListingImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id, imageId } = req.params;

        const { data: image } = await supabase
            .from('listing_images')
            .select('*')
            .eq('id', imageId)
            .eq('listing_id', id)
            .single();

        if (!image) { res.status(404).json({ error: 'Image not found' }); return; }

        const filePath = new URL(image.url).pathname.split('/object/public/listings/')[1];
        if (filePath) await supabase.storage.from('listings').remove([filePath]);

        await supabase.from('listing_images').delete().eq('id', imageId);
        res.json({ message: 'Image deleted' });
    } catch (err) {
        next(err);
    }
};

export const getUserListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
        const limit = 10;
        const offset = (page - 1) * limit;

        const { data, count, error } = await supabase
            .from('listings')
            .select('*, listing_images(id, url, is_primary), categories!listings_category_id_fkey(name, slug)', { count: 'exact' })
            .eq('user_id', req.user!.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) { next(error); return; }

        res.json({
            listings: data,
            pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
        });
    } catch (err) {
        next(err);
    }
};
