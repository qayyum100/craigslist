import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListing, useUpdateListing } from '@/hooks/useListings';
import { useCategories } from '@/hooks/useListings';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function EditListing() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { data, isLoading } = useListing(id!);
    const { data: categories } = useCategories();
    const updateListing = useUpdateListing();

    const [form, setForm] = useState({ title: '', description: '', price: '', location: '', category_id: '', status: '' });

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
            });
        }
    }, [data]);

    if (isLoading) return <PageLoader />;
    if (!data?.listing) return <div className="text-center py-20 text-slate-500">Listing not found</div>;

    // Authorization check
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
                },
            });
            toast.success('Listing updated!');
            navigate(`/listings/${id}`);
        } catch {
            toast.error('Failed to update listing');
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="section-title mb-2">Edit Listing</h1>
            <p className="section-subtitle mb-8">Update your listing&apos;s details.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card p-6 space-y-5">
                    <div>
                        <label className="label">Title</label>
                        <input type="text" value={form.title} onChange={set('title')} className="input" maxLength={150} required />
                    </div>
                    <div>
                        <label className="label">Category</label>
                        <select value={form.category_id} onChange={set('category_id')} className="input" required>
                            {(categories || []).map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                            ))}
                        </select>
                    </div>
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
                    <div>
                        <label className="label">Status</label>
                        <select value={form.status} onChange={set('status')} className="input">
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="sold">Sold</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea value={form.description} onChange={set('description')} className="input resize-none" rows={6} minLength={10} maxLength={5000} required />
                        <p className="text-xs text-slate-600 mt-1">{form.description.length}/5000</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary btn-lg flex-1">Cancel</button>
                    <button type="submit" disabled={updateListing.isPending} className="btn btn-primary btn-lg flex-1">
                        {updateListing.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
