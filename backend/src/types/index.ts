export interface AuthUser {
    id: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
}

export interface Listing {
    id: string;
    user_id: string;
    category_id: number;
    title: string;
    description: string;
    price: number | null;
    location: string;
    status: 'active' | 'pending' | 'rejected' | 'sold';
    views: number;
    created_at: string;
    updated_at: string;
    listing_images?: ListingImage[];
    profiles?: {
        username: string;
        avatar_url: string | null;
    };
    categories?: {
        name: string;
        slug: string;
    };
}

export interface ListingImage {
    id: string;
    listing_id: string;
    url: string;
    is_primary: boolean;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
}

export interface Bookmark {
    user_id: string;
    listing_id: string;
    created_at: string;
    listings?: Listing;
}

export interface Report {
    id: string;
    reporter_id: string;
    listing_id: string;
    reason: string;
    status: 'pending' | 'resolved';
    created_at: string;
    profiles?: {
        username: string;
    };
    listings?: {
        title: string;
    };
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
