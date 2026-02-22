import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories, useCreateListing, useUploadImages } from '@/hooks/useListings';
import { ImageUpload } from '@/components/listings/ImageUpload';
import toast from 'react-hot-toast';

export default function CreateListing() {
    const navigate = useNavigate();
    const { data: categories } = useCategories();
    const createListing = useCreateListing();
    const uploadImages = useUploadImages();

    const [form, setForm] = useState({
        title: '', description: '', price: '', location: '', category_id: '',
    });
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.location || !form.category_id) {
            toast.error('Please fill in all required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            const { listing } = await createListing.mutateAsync({
                title: form.title,
                description: form.description,
                price: form.price ? parseFloat(form.price) : null,
                location: form.location,
                category_id: parseInt(form.category_id),
            });

            if (files.length > 0) {
                await uploadImages.mutateAsync({ id: listing.id, files });
            }

            toast.success('Listing created!');
            navigate(`/listings/${listing.id}`);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create listing';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="section-title mb-2">Post a Listing</h1>
            <p className="section-subtitle mb-8">Fill in the details below to create your listing.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card p-6 space-y-5">
                    <div>
                        <label className="label">Title <span className="text-red-400">*</span></label>
                        <input type="text" value={form.title} onChange={set('title')} className="input" placeholder="e.g. iPhone 15 Pro Max, 256GB" maxLength={150} required />
                    </div>
                    <div>
                        <label className="label">Category <span className="text-red-400">*</span></label>
                        <select value={form.category_id} onChange={set('category_id')} className="input" required>
                            <option value="">Select a category</option>
                            {(categories || []).map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Price</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                            <input type="number" value={form.price} onChange={set('price')} className="input pl-8" placeholder="Leave empty for 'Price negotiable'" min="0" step="0.01" />
                        </div>
                    </div>
                    <div>
                        <label className="label">Location <span className="text-red-400">*</span></label>
                        <input type="text" value={form.location} onChange={set('location')} className="input" placeholder="e.g. San Francisco, CA" required />
                    </div>
                    <div>
                        <label className="label">Description <span className="text-red-400">*</span></label>
                        <textarea value={form.description} onChange={set('description')} className="input resize-none" rows={6}
                            placeholder="Describe your item in detail — condition, features, why you're selling..." minLength={10} maxLength={5000} required />
                        <p className="text-xs text-slate-600 mt-1">{form.description.length}/5000</p>
                    </div>
                </div>

                <div className="card p-6">
                    <label className="label mb-3">Photos (up to 5)</label>
                    <ImageUpload onFilesChange={setFiles} maxFiles={5} />
                </div>

                <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full">
                    {isSubmitting ? 'Creating...' : 'Post Listing'}
                </button>
            </form>
        </div>
    );
}
