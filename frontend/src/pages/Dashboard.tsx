import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutDashboard, Bookmark, Edit, Trash2, Package } from 'lucide-react';
import { useMyListings, useDeleteListing } from '@/hooks/useListings';
import { useBookmarks, useRemoveBookmark } from '@/hooks/useBookmarks';
import { useAuthStore } from '@/store/authStore';
import { ListingCard } from '@/components/listings/ListingCard';
import { Pagination } from '@/components/common/Pagination';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

type Tab = 'listings' | 'bookmarks';

export default function Dashboard() {
    const { user } = useAuthStore();
    const [tab, setTab] = useState<Tab>('listings');
    const [listingsPage, setListingsPage] = useState(1);
    const [bookmarksPage, setBookmarksPage] = useState(1);

    const { data: myListings, isLoading: listingsLoading } = useMyListings(listingsPage);
    const { data: bookmarksData, isLoading: bookmarksLoading } = useBookmarks(bookmarksPage);
    const deleteListing = useDeleteListing();
    const removeBookmark = useRemoveBookmark();

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this listing?')) return;
        try {
            await deleteListing.mutateAsync(id);
            toast.success('Listing deleted');
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="section-title">Dashboard</h1>
                    <p className="section-subtitle">Welcome back, <span className="text-brand-400">{user?.username}</span></p>
                </div>
                <Link to="/listings/new" className="btn btn-primary btn-md">
                    <Plus className="h-4 w-4" /> Post New Listing
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl mb-8 w-fit">
                {([['listings', LayoutDashboard, 'My Listings'], ['bookmarks', Bookmark, 'Bookmarks']] as const).map(([t, Icon, label]) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                        <Icon className="h-4 w-4" /> {label}
                    </button>
                ))}
            </div>

            {/* My Listings Tab */}
            {tab === 'listings' && (
                listingsLoading ? <PageLoader /> :
                    !myListings?.listings?.length ? (
                        <EmptyState icon={Package} title="No listings yet" description="Create your first listing to start selling."
                            action={<Link to="/listings/new" className="btn btn-primary btn-sm">Create Listing</Link>} />
                    ) : (
                        <>
                            <div className="space-y-3">
                                {myListings.listings.map((listing) => (
                                    <div key={listing.id} className="card p-4 flex items-start gap-4">
                                        <div className="w-20 h-16 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                                            {listing.listing_images?.[0] && (
                                                <img src={listing.listing_images[0].url} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <Link to={`/listings/${listing.id}`}
                                                    className="font-medium text-slate-200 hover:text-brand-400 transition-colors text-sm line-clamp-1">
                                                    {listing.title}
                                                </Link>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Link to={`/listings/${listing.id}/edit`} className="btn btn-ghost btn-sm w-8 h-8 p-0" aria-label="Edit">
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Link>
                                                    <button onClick={() => handleDelete(listing.id)} disabled={deleteListing.isPending}
                                                        className="btn btn-ghost btn-sm w-8 h-8 p-0 text-red-400 hover:text-red-300" aria-label="Delete">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                <span className={`badge ${listing.status === 'active' ? 'badge-green' : 'badge-slate'}`}>{listing.status}</span>
                                                <span>{listing.price != null ? `$${listing.price.toLocaleString()}` : 'Negotiable'}</span>
                                                <span>{formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Pagination page={listingsPage} totalPages={myListings.pagination.totalPages} onPageChange={setListingsPage} />
                        </>
                    )
            )}

            {/* Bookmarks Tab */}
            {tab === 'bookmarks' && (
                bookmarksLoading ? <PageLoader /> :
                    !bookmarksData?.bookmarks?.length ? (
                        <EmptyState icon={Bookmark} title="No bookmarks yet" description="Save listings to find them quickly later."
                            action={<Link to="/listings" className="btn btn-primary btn-sm">Browse Listings</Link>} />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {bookmarksData.bookmarks.map((bm: any) =>
                                    bm.listings && (
                                        <ListingCard key={bm.listing_id || bm.listings.id} listing={{ ...bm.listings, isBookmarked: true } as any}
                                            showBookmark onBookmarkToggle={() => removeBookmark.mutate(bm.listings!.id)} />
                                    )
                                )}
                            </div>
                            <Pagination page={bookmarksPage} totalPages={bookmarksData.pagination.totalPages} onPageChange={setBookmarksPage} />
                        </>
                    )
            )}
        </div>
    );
}
