import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useListings, useCategories } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { PageLoader } from '@/components/common/LoadingSpinner';

const HERO_CATEGORIES = [
    { emoji: '🛍️', label: 'For Sale', slug: 'for-sale' },
    { emoji: '🏠', label: 'Housing', slug: 'housing' },
    { emoji: '💼', label: 'Jobs', slug: 'jobs' },
    { emoji: '🔧', label: 'Services', slug: 'services' },
    { emoji: '💻', label: 'Electronics', slug: 'electronics' },
    { emoji: '🚗', label: 'Vehicles', slug: 'vehicles' },
];

export default function Home() {
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const navigate = useNavigate();

    const { data: categoriesData } = useCategories();
    const { data: recentData, isLoading } = useListings({ limit: 8, sort: 'newest' });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (location) params.set('location', location);
        navigate(`/listings?${params}`);
    };

    const categories = categoriesData || [];
    const recentListings = recentData?.listings || [];

    return (
        <div className="min-h-screen">
            {/* ── Hero ────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 py-24 bg-grid-pattern">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent pointer-events-none" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center gap-2 badge badge-green mb-6 text-sm py-1.5 px-4">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Thousands of listings posted daily
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                        Your Local{' '}
                        <span className="text-gradient">Classified</span>{' '}
                        Marketplace
                    </h1>

                    <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
                        Buy, sell, find housing, jobs, and services in your community. Thousands of local listings at your fingertips.
                    </p>

                    {/* Search box */}
                    <form onSubmit={handleSearch}
                        className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto shadow-2xl shadow-black/30">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="What are you looking for?"
                                className="input pl-11 border-transparent focus:border-brand-500/30 bg-transparent"
                            />
                        </div>
                        <div className="relative sm:w-44">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Location"
                                className="input pl-11 border-transparent focus:border-brand-500/30 bg-transparent"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg shrink-0">
                            Search
                        </button>
                    </form>
                </div>
            </section>

            {/* ── Category Grid ────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {HERO_CATEGORIES.map((cat: any) => {
                        const full = categories.find((c: any) => c.slug === cat.slug);
                        return (
                            <Link
                                key={cat.slug}
                                to={`/listings?category=${cat.slug}`}
                                className="card-hover p-4 text-center group"
                            >
                                <div className="text-2xl mb-2">{cat.emoji}</div>
                                <p className="text-xs font-semibold text-slate-300 group-hover:text-brand-400 transition-colors">{cat.label}</p>
                                {full && (
                                    <p className="text-[10px] text-slate-600 mt-0.5">{full.listing_count?.toLocaleString() ?? 0}</p>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* ── Recent Listings ──────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="section-title">Recent Listings</h2>
                        <p className="section-subtitle">Fresh posts from your community</p>
                    </div>
                    <Link to="/listings" className="btn btn-ghost btn-sm gap-1">
                        View all <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {isLoading ? (
                    <PageLoader />
                ) : (
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {recentListings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} showBookmark />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Trust Badges ─────────────────────────────────────── */}
            <section className="border-t border-slate-800 bg-slate-900/30 py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                    {[
                        { icon: Shield, title: 'Secure & Safe', desc: 'JWT authentication and rate limiting protect every interaction.' },
                        { icon: Zap, title: 'Lightning Fast', desc: 'Powered by Supabase PostgreSQL with optimized indexes.' },
                        { icon: MapPin, title: 'Location-Based', desc: 'Find listings near you with location-based search filters.' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                                <Icon className="h-6 w-6 text-brand-400" />
                            </div>
                            <h3 className="font-semibold text-slate-200">{title}</h3>
                            <p className="text-slate-500 text-sm">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
