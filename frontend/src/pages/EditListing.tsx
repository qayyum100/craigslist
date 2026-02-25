import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListing, useUpdateListing, useCategories } from '@/hooks/useListings';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Salvagable'];

export default function EditListing() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { data, isLoading } = useListing(id!);
    const { data: categories } = useCategories();
    const updateListing = useUpdateListing();

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        category_id: '',
        status: '',
        condition: 'Good',
        brand: '',
        year: '',
    });

    useEffect(() => {
        if (data?.listing) {
            const l = data.listing;
            setForm({
                title: l.title,
                description: l.description,
                price: l.price !== null ? String(l.price) : '',
                location: l.location,
                category_id: String(l.category_id),
                status: l.status,
                condition: l.condition || 'Good',
                brand: l.brand || '',
                year: l.year !== null ? String(l.year) : '',
            });
        }
    }, [data]);

    if (isLoading) return <PageLoader />;
    if (!data?.listing) return <div className="text-center py-20 text-slate-500">Listing not found</div>;

    if (data.listing.user_id !== user?.id && user?.role !== 'admin') {
        navigate('/');
        return null;
    }

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateListing.mutateAsync({
                id: id!,
                payload: {
                    title: form.title,
                    description: form.description,
                    price: form.price ? parseFloat(form.price) : null,
                    location: form.location,
                    category_id: parseInt(form.category_id),
                    status: form.status as 'active' | 'pending' | 'sold',
                    condition: form.condition,
                    brand: form.brand || null,
                    year: form.year ? parseInt(form.year) : null,
                },
            });
            toast.success('Listing updated!');
            navigate(`/listings/${id}`);
        } catch {
            toast.error('Failed to update listing');
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="section-title mb-2">Edit Listing</h1>
            <p className="section-subtitle mb-8">Update your listing&apos;s details.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card p-6 space-y-6">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold text-white">Basic Information</h2>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Status</label>
                            <select value={form.status} onChange={set('status')} className="bg-slate-800 border-none rounded-lg text-xs font-bold text-brand-400 focus:ring-0 cursor-pointer px-3 py-1.5">
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="sold">Sold</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Title</label>
                        <input type="text" value={form.title} onChange={set('title')} className="input" maxLength={150} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Category</label>
                            <select value={form.category_id} onChange={set('category_id')} className="input" required>
                                {(categories || []).map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Condition</label>
                            <select value={form.condition} onChange={set('condition')} className="input" required>
                                {CONDITIONS.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Price (empty = negotiable)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                <input type="number" value={form.price} onChange={set('price')} className="input pl-8" min="0" step="0.01" />
                            </div>
                        </div>
                        <div>
                            <label className="label">Location</label>
                            <input type="text" value={form.location} onChange={set('location')} className="input" required />
                        </div>
                    </div>
                </div>

                <div className="card p-6 space-y-6">
                    <h2 className="text-lg font-bold text-white mb-2">Item Details (Optional)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Brand</label>
                            <input type="text" value={form.brand} onChange={set('brand')} className="input" placeholder="e.g. Apple, Toyota" />
                        </div>
                        <div>
                            <label className="label">Year</label>
                            <input type="number" value={form.year} onChange={set('year')} className="input" placeholder="e.g. 2024" min="1900" max={new Date().getFullYear() + 1} />
                        </div>
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea value={form.description} onChange={set('description')} className="input resize-none" rows={6} minLength={10} maxLength={5000} required />
                        <div className="flex justify-end mt-1">
                            <p className="text-xs text-slate-600">{form.description.length}/5000</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary btn-lg flex-1">Cancel</button>
                    <button type="submit" disabled={updateListing.isPending} className="btn btn-primary btn-lg flex-1">
                        {updateListing.isPending ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Saving Changes...
                            </>
                        ) : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
