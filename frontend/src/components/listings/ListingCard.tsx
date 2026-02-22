import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Bookmark, Eye } from 'lucide-react';
import { Listing } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
    listing: Listing;
    onBookmarkToggle?: (id: string, isBookmarked: boolean) => void;
    showBookmark?: boolean;
}

const getPrimaryImage = (listing: Listing): string | null => {
    if (!listing.listing_images?.length) return null;
    return (listing.listing_images.find((i) => i.is_primary) || listing.listing_images[0])?.url || null;
};

const statusBadge = (status: Listing['status']) => {
    const map = {
        active: 'badge-green',
        pending: 'badge-yellow',
        rejected: 'badge-red',
        sold: 'badge-slate',
    };
    return map[status];
};

export const ListingCard = ({ listing, onBookmarkToggle, showBookmark = false }: Props) => {
    const image = getPrimaryImage(listing);
    const timeAgo = formatDistanceToNow(new Date(listing.created_at), { addSuffix: true });

    return (
        <article className="card-hover group animate-fade-in">
            {/* Image */}
            <div className="aspect-[4/3] bg-slate-800 relative overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl opacity-30">📷</span>
                    </div>
                )}

                {/* Status badge */}
                {listing.status !== 'active' && (
                    <div className="absolute top-2 left-2">
                        <span className={statusBadge(listing.status)}>
                            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </span>
                    </div>
                )}

                {/* Category badge */}
                {listing.categories && (
                    <div className="absolute top-2 right-2">
                        <span className="badge badge-slate text-xs">
                            {listing.categories.name}
                        </span>
                    </div>
                )}

                {/* Bookmark button */}
                {showBookmark && onBookmarkToggle && (
                    <button
                        onClick={(e) => { e.preventDefault(); onBookmarkToggle(listing.id, listing.isBookmarked || false); }}
                        className="absolute bottom-2 right-2 p-2 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800 transition-all"
                        aria-label={listing.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    >
                        <Bookmark
                            className={`h-4 w-4 transition-colors ${listing.isBookmarked ? 'fill-brand-500 text-brand-500' : 'text-slate-400'}`}
                        />
                    </button>
                )}
            </div>

            {/* Content */}
            <Link to={`/listings/${listing.id}`} className="block p-4">
                <h3 className="font-semibold text-slate-100 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-brand-400 transition-colors">
                    {listing.title}
                </h3>

                <div className="flex items-center gap-3 mb-3">
                    {listing.price !== null ? (
                        <div className="flex items-center gap-1 text-brand-400 font-bold text-base">
                            <DollarSign className="h-4 w-4 shrink-0" />
                            {listing.price === 0 ? 'Free' : listing.price.toLocaleString()}
                        </div>
                    ) : (
                        <span className="text-slate-500 text-sm italic">Price negotiable</span>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{listing.location}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {listing.views}
                        </span>
                        <span>{timeAgo}</span>
                    </div>
                </div>
            </Link>
        </article>
    );
};
