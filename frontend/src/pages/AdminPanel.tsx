import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, LayoutList, Flag, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { Pagination } from '@/components/common/Pagination';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import type { AdminStats } from '@/types';

type AdminTab = 'stats' | 'listings' | 'reports';

export default function AdminPanel() {
    const [tab, setTab] = useState<AdminTab>('stats');
    const [listingsPage, setListingsPage] = useState(1);
    const [reportsPage, setReportsPage] = useState(1);
    const qc = useQueryClient();

    const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
        queryKey: ['admin', 'stats'],
        queryFn: adminApi.getStats,
    });

    const { data: listingsData, isLoading: listingsLoading } = useQuery({
        queryKey: ['admin', 'listings', listingsPage],
        queryFn: () => adminApi.getListings(listingsPage),
        enabled: tab === 'listings',
    });

    const { data: reportsData, isLoading: reportsLoading } = useQuery({
        queryKey: ['admin', 'reports', reportsPage],
        queryFn: () => adminApi.getReports(reportsPage),
        enabled: tab === 'reports',
    });

    const approve = useMutation({ mutationFn: adminApi.approveListing, onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin'] }); toast.success('Listing approved'); } });
    const reject = useMutation({ mutationFn: adminApi.rejectListing, onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin'] }); toast.success('Listing rejected'); } });
    const resolve = useMutation({ mutationFn: adminApi.resolveReport, onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin'] }); toast.success('Report resolved'); } });

    const STAT_CARDS = stats ? [
        { label: 'Total Listings', value: stats.totalListings, icon: LayoutList, color: 'text-blue-400' },
        { label: 'Active Listings', value: stats.activeListings, icon: CheckCircle, color: 'text-brand-400' },
        { label: 'Pending Listings', value: stats.pendingListings, icon: TrendingUp, color: 'text-yellow-400' },
        { label: 'Total Users', value: stats.totalUsers, icon: Shield, color: 'text-purple-400' },
        { label: 'Pending Reports', value: stats.pendingReports, icon: Flag, color: 'text-red-400' },
    ] : [];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-brand-400" />
                </div>
                <div>
                    <h1 className="section-title">Admin Panel</h1>
                    <p className="section-subtitle">Moderation dashboard</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl mb-8 w-fit">
                {([['stats', TrendingUp, 'Overview'], ['listings', LayoutList, 'Listings'], ['reports', Flag, 'Reports']] as const).map(([t, Icon, label]) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                        <Icon className="h-4 w-4" /> {label}
                    </button>
                ))}
            </div>

            {/* Stats Tab */}
            {tab === 'stats' && (
                statsLoading ? <PageLoader /> : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="card p-5">
                                <Icon className={`h-6 w-6 ${color} mb-3`} />
                                <p className="text-2xl font-bold text-white">{(value ?? 0).toLocaleString()}</p>
                                <p className="text-slate-500 text-xs mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Listings Tab */}
            {tab === 'listings' && (
                listingsLoading ? <PageLoader /> :
                    !listingsData?.listings?.length ? <EmptyState title="No listings" icon={LayoutList} /> :
                        <>
                            <div className="space-y-3">
                                {listingsData.listings.map((l: { id: string; title: string; status: string; location: string; created_at: string; price: number | null; profiles?: { username: string; email?: string }; categories?: { name: string } }) => (
                                    <div key={l.id} className="card p-4 flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`badge ${l.status === 'active' ? 'badge-green' : l.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}>{l.status}</span>
                                                <Link to={`/listings/${l.id}`} className="text-slate-200 font-medium text-sm hover:text-brand-400 truncate">{l.title}</Link>
                                            </div>
                                            <div className="text-xs text-slate-500 flex gap-3">
                                                <span>by {l.profiles?.username}</span>
                                                <span>{l.categories?.name}</span>
                                                <span>{l.location}</span>
                                                <span>{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => approve.mutate(l.id)} disabled={approve.isPending || l.status === 'active'}
                                                className="btn btn-sm btn-ghost text-brand-400 hover:text-brand-300 disabled:opacity-30">
                                                <CheckCircle className="h-4 w-4" /> Approve
                                            </button>
                                            <button onClick={() => reject.mutate(l.id)} disabled={reject.isPending || l.status === 'rejected'}
                                                className="btn btn-sm btn-ghost text-red-400 hover:text-red-300 disabled:opacity-30">
                                                <XCircle className="h-4 w-4" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Pagination page={listingsPage} totalPages={listingsData.pagination.totalPages} onPageChange={setListingsPage} />
                        </>
            )}

            {/* Reports Tab */}
            {tab === 'reports' && (
                reportsLoading ? <PageLoader /> :
                    !reportsData?.reports?.length ? <EmptyState title="No reports" description="All clear!" icon={Flag} /> :
                        <>
                            <div className="space-y-3">
                                {reportsData.reports.map((r: { id: string; status: string; reason: string; created_at: string; profiles?: { username: string }; listings?: { id: string; title: string } }) => (
                                    <div key={r.id} className="card p-4 flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`badge ${r.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>{r.status}</span>
                                                <p className="text-sm text-slate-300 truncate">
                                                    Reported by <span className="text-slate-200 font-medium">{r.profiles?.username}</span>
                                                </p>
                                            </div>
                                            <p className="text-xs text-slate-400 italic mb-1">"{r.reason}"</p>
                                            <div className="text-xs text-slate-500 flex gap-3">
                                                {r.listings && <Link to={`/listings/${r.listings.id}`} className="text-brand-400 hover:underline">{r.listings.title}</Link>}
                                                <span>{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                        {r.status === 'pending' && (
                                            <button onClick={() => resolve.mutate(r.id)} disabled={resolve.isPending}
                                                className="btn btn-sm btn-ghost text-brand-400 hover:text-brand-300 shrink-0">
                                                <CheckCircle className="h-4 w-4" /> Resolve
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Pagination page={reportsPage} totalPages={reportsData.pagination.totalPages} onPageChange={setReportsPage} />
                        </>
            )}
        </div>
    );
}
