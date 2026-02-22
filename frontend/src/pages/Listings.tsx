import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useListings, useCategories } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { Pagination } from '@/components/common/Pagination';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ListingFilters } from '@/types';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
];

export default function Listings() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filters: ListingFilters = {
        page: parseInt(searchParams.get('page') || '1'),
        category: searchParams.get('category') || undefined,
        location: searchParams.get('location') || undefined,
        search: searchParams.get('search') || undefined,
        minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
        maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
        sort: (searchParams.get('sort') as ListingFilters['sort']) || 'newest',
        limit: 12,
    };

    const { data, isLoading } = useListings(filters);
    const { data: categories } = useCategories();

    const setFilter = (key: string, value: string | undefined) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value); else next.delete(key);
        next.delete('page');
        setSearchParams(next);
    };

    const clearFilters = () => {
        setSearchParams(new URLSearchParams());
    };

    const activeFilterCount = [filters.category, filters.location, filters.minPrice, filters.maxPrice].filter(Boolean).length;
    const listings = data?.listings || [];
    const pagination = data?.pagination;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="section-title">Browse Listings</h1>
                            <p className="section-subtitle">
                                {pagination ? `${pagination.total.toLocaleString()} listings found` : 'Loading...'}
                                {filters.search && ` for "${filters.search}"`}
                                {filters.category && ` in ${filters.category}`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="btn btn-secondary btn-sm relative"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                            {/* Sort */}
                            <div className="relative">
                                <select
                                    value={filters.sort}
                                    onChange={(e) => setFilter('sort', e.target.value)}
                                    className="input py-2 pr-8 text-sm appearance-none cursor-pointer"
                                    aria-label="Sort listings"
                                >
                                    {SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
                {/* Filter Sidebar */}
                {sidebarOpen && (
                    <aside className="w-64 shrink-0">
                        <div className="card p-4 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-slate-200 flex items-center gap-2"><Filter className="h-4 w-4" />Filters</h2>
                                {activeFilterCount > 0 && (
                                    <button onClick={clearFilters} className="text-xs text-brand-400 hover:text-brand-300">Clear all</button>
                                )}
                            </div>

                            {/* Category */}
                            <div className="mb-5">
                                <label className="label">Category</label>
                                <div className="space-y-1">
                                    <button onClick={() => setFilter('category', undefined)}
                                        className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!filters.category ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:bg-slate-800'}`}>
                                        All Categories
                                    </button>
                                    {(categories || []).map((cat: any) => (
                                        <button key={cat.id} onClick={() => setFilter('category', cat.slug)}
                                            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${filters.category === cat.slug ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:bg-slate-800'}`}>
                                            <span>{cat.icon}</span>
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="mb-5">
                                <label className="label">Location</label>
                                <input
                                    type="text"
                                    placeholder="City, state..."
                                    defaultValue={filters.location || ''}
                                    onBlur={(e) => setFilter('location', e.target.value || undefined)}
                                    className="input text-sm"
                                />
                            </div>

                            {/* Price range */}
                            <div className="mb-5">
                                <label className="label">Price Range</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" placeholder="Min" min="0"
                                        defaultValue={filters.minPrice || ''}
                                        onBlur={(e) => setFilter('minPrice', e.target.value || undefined)}
                                        className="input text-sm" />
                                    <input type="number" placeholder="Max" min="0"
                                        defaultValue={filters.maxPrice || ''}
                                        onBlur={(e) => setFilter('maxPrice', e.target.value || undefined)}
                                        className="input text-sm" />
                                </div>
                            </div>

                            <button onClick={() => setSidebarOpen(false)} className="btn btn-ghost btn-sm w-full">
                                <X className="h-4 w-4" /> Close
                            </button>
                        </div>
                    </aside>
                )}

                {/* Listings grid */}
                <main className="flex-1 min-w-0">
                    {/* Active filter chips */}
                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {filters.category && (
                                <span className="badge badge-green cursor-pointer" onClick={() => setFilter('category', undefined)}>
                                    {filters.category} <X className="h-3 w-3 ml-1" />
                                </span>
                            )}
                            {filters.location && (
                                <span className="badge badge-blue cursor-pointer" onClick={() => setFilter('location', undefined)}>
                                    📍 {filters.location} <X className="h-3 w-3 ml-1" />
                                </span>
                            )}
                        </div>
                    )}

                    {isLoading ? (
                        <PageLoader />
                    ) : listings.length === 0 ? (
                        <EmptyState
                            title="No listings found"
                            description="Try adjusting your filters or search terms."
                            action={<button onClick={clearFilters} className="btn btn-primary btn-sm">Clear Filters</button>}
                        />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {listings.map((listing) => (
                                    <ListingCard key={listing.id} listing={listing} showBookmark />
                                ))}
                            </div>
                            {pagination && (
                                <Pagination
                                    page={pagination.page}
                                    totalPages={pagination.totalPages}
                                    onPageChange={(p) => setFilter('page', String(p))}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
