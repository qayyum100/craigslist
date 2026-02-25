export interface User {
    id: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
    avatar_url?: string | null;
    created_at?: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    listing_count?: number;
}

export interface ListingImage {
    id: string;
    listing_id: string;
    url: string;
    is_primary: boolean;
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
        id?: string;
        username: string;
        avatar_url?: string | null;
        email?: string;
    };
    categories?: {
        id?: number;
        name: string;
        slug: string;
        icon?: string | null;
    };
    isBookmarked?: boolean;
    condition?: string;
    brand?: string | null;
    year?: number | null;
}

export interface Conversation {
    id: string;
    listing_id: string;
    buyer_id: string;
    seller_id: string;
    last_message: string | null;
    updated_at: string;
    unread_count?: number;
    listings?: Listing;
    buyer?: User;
    seller?: User;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    text: string;
    created_at: string;
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
    profiles?: { username: string };
    listings?: { id: string; title: string; status: string };
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ListingsResponse {
    listings: Listing[];
    pagination: PaginationMeta;
}

export interface ListingFilters {
    page?: number;
    limit?: number;
    category?: string;
    location?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'oldest';
}

export interface AdminStats {
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    totalUsers: number;
    pendingReports: number;
}
