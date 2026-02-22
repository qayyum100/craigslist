import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Eye, Clock, Edit, Trash2, Bookmark, BookmarkX, Flag, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useListing, useDeleteListing } from '@/hooks/useListings';
import { useAddBookmark, useRemoveBookmark } from '@/hooks/useBookmarks';
import { reportsApi } from '@/api/bookmarks';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function ListingDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [currentImage, setCurrentImage] = useState(0);
    const [reportModal, setReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportLoading, setReportLoading] = useState(false);

    const { data, isLoading, error } = useListing(id!);
    const listing = data?.listing;

    const addBookmark = useAddBookmark();
    const removeBookmark = useRemoveBookmark();
    const deleteListing = useDeleteListing();

    if (isLoading) return <PageLoader />;
    if (error || !listing) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <p className="text-4xl mb-4">🔍</p>
                <h1 className="text-2xl font-bold mb-2 text-slate-200">Listing not found</h1>
                <p className="text-slate-500 mb-6">This listing may have been removed or is no longer active.</p>
                <Link to="/listings" className="btn btn-primary btn-md">Browse Listings</Link>
            </div>
        );
    }

    const images = listing.listing_images || [];
    const isOwner = user?.id === listing.user_id;
    const isAdmin = user?.role === 'admin';

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
        try {
            await deleteListing.mutateAsync(listing.id);
            toast.success('Listing deleted');
            navigate('/dashboard');
        } catch {
            toast.error('Failed to delete listing');
        }
    };

    const handleBookmark = () => {
        if (!isAuthenticated) { toast.error('Sign in to bookmark listings'); return; }
        if (listing.isBookmarked) {
            removeBookmark.mutate(listing.id);
        } else {
            addBookmark.mutate(listing.id);
        }
    };

    const handleReport = async (e: React.FormEvent) => {
        e.preventDefault();
        setReportLoading(true);
        try {
            await reportsApi.create(listing.id, reportReason);
            toast.success('Report submitted. Our team will review it.');
            setReportModal(false);
            setReportReason('');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to submit report';
            toast.error(msg);
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Link to="/listings" className="hover:text-slate-300 transition-colors">Browse</Link>
                <ChevronRight className="h-3 w-3" />
                {listing.categories && (
                    <>
                        <Link to={`/listings?category=${listing.categories.slug}`} className="hover:text-slate-300 transition-colors">
                            {listing.categories.name}
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                    </>
                )}
                <span className="text-slate-400 truncate">{listing.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left column — images + description */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Image gallery */}
                    <div className="card overflow-hidden">
                        <div className="aspect-[4/3] bg-slate-800 relative">
                            {images.length > 0 ? (
                                <img
                                    src={images[currentImage]?.url}
                                    alt={`${listing.title} - image ${currentImage + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-6xl opacity-20">📷</span>
                                </div>
                            )}
                            {images.length > 1 && (
                                <>
                                    <button onClick={() => setCurrentImage((i) => (i - 1 + images.length) % images.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 btn btn-secondary btn-sm w-9 h-9 p-0" aria-label="Previous image">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setCurrentImage((i) => (i + 1) % images.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-secondary btn-sm w-9 h-9 p-0" aria-label="Next image">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                        {images.map((_, i) => (
                                            <button key={i} onClick={() => setCurrentImage(i)} aria-label={`Go to image ${i + 1}`}
                                                className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-white' : 'bg-white/40'}`} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2 p-3 overflow-x-auto">
                                {images.map((img, i) => (
                                    <button key={img.id} onClick={() => setCurrentImage(i)}
                                        className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === currentImage ? 'border-brand-500' : 'border-slate-700'}`}>
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="card p-6">
                        <h2 className="font-semibold text-slate-200 mb-3">Description</h2>
                        <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
                    </div>
                </div>

                {/* Right column — details + actions */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="card p-6">
                        <h1 className="font-display font-bold text-xl text-white mb-2 leading-tight">{listing.title}</h1>

                        {listing.price !== null ? (
                            <div className="flex items-center gap-1.5 text-2xl font-bold text-brand-400 mb-4">
                                <DollarSign className="h-5 w-5" />
                                {listing.price === 0 ? 'Free' : listing.price.toLocaleString()}
                            </div>
                        ) : (
                            <p className="text-slate-500 italic mb-4">Price negotiable</p>
                        )}

                        <div className="space-y-2.5 mb-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2.5">
                                <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                                {listing.location}
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                                Posted {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Eye className="h-4 w-4 text-slate-500 shrink-0" />
                                {listing.views.toLocaleString()} views
                            </div>
                            {listing.categories && (
                                <Link to={`/listings?category=${listing.categories.slug}`}
                                    className="inline-flex items-center gap-1.5 badge badge-slate hover:bg-slate-600 transition-colors">
                                    {listing.categories.name}
                                </Link>
                            )}
                        </div>

                        {/* Seller info */}
                        {listing.profiles && (
                            <div className="border-t border-slate-800 pt-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                                        <User className="h-5 w-5 text-brand-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-200 text-sm">{listing.profiles.username}</p>
                                        <p className="text-xs text-slate-500">Seller</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="space-y-2">
                            {isOwner || isAdmin ? (
                                <>
                                    <Link to={`/listings/${listing.id}/edit`} className="btn btn-primary btn-md w-full">
                                        <Edit className="h-4 w-4" /> Edit Listing
                                    </Link>
                                    <button onClick={handleDelete} disabled={deleteListing.isPending} className="btn btn-danger btn-md w-full">
                                        <Trash2 className="h-4 w-4" />
                                        {deleteListing.isPending ? 'Deleting...' : 'Delete Listing'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleBookmark} className="btn btn-secondary btn-md w-full">
                                        {listing.isBookmarked
                                            ? <><BookmarkX className="h-4 w-4" /> Remove Bookmark</>
                                            : <><Bookmark className="h-4 w-4" /> Save Listing</>
                                        }
                                    </button>
                                    {isAuthenticated && (
                                        <button onClick={() => setReportModal(true)} className="btn btn-ghost btn-sm w-full text-red-400 hover:text-red-300">
                                            <Flag className="h-4 w-4" /> Report Listing
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {reportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReportModal(false)} />
                    <form onSubmit={handleReport} className="relative card p-6 w-full max-w-md animate-scale-in">
                        <h2 className="font-bold text-lg mb-4 text-white">Report Listing</h2>
                        <label className="label">Reason for reporting</label>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="input mb-4 resize-none"
                            rows={4}
                            placeholder="Describe why this listing violates our guidelines..."
                            minLength={10}
                            required
                        />
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setReportModal(false)} className="btn btn-secondary btn-md flex-1">Cancel</button>
                            <button type="submit" disabled={reportLoading} className="btn btn-danger btn-md flex-1">
                                {reportLoading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
