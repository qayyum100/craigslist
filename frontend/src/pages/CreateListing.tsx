import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories, useCreateListing, useUploadImages } from '@/hooks/useListings';
import { useGeolocation } from '@/hooks/useGeolocation';
import { ImageUpload } from '@/components/listings/ImageUpload';
import { MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Salvagable'];

export default function CreateListing() {
    const navigate = useNavigate();
    const { data: categories } = useCategories();
    const createListing = useCreateListing();
    const uploadImages = useUploadImages();
    const { getAddress, isLoading: isDetecting } = useGeolocation();

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        category_id: '',
        condition: 'Good',
        brand: '',
        year: '',
    });
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleDetectLocation = async () => {
        const address = await getAddress();
        if (address) {
            setForm(f => ({ ...f, location: address }));
            toast.success('Location detected!');
        }
    };

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
                condition: form.condition,
                brand: form.brand || null,
                year: form.year ? parseInt(form.year) : null,
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="section-title mb-2">Post a Listing</h1>
            <p className="section-subtitle mb-8">Fill in the details below to create your listing.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card p-6 space-y-6">
                    <h2 className="text-lg font-bold text-white mb-2">Basic Information</h2>

                    <div>
                        <label className="label">Title <span className="text-red-400">*</span></label>
                        <input type="text" value={form.title} onChange={set('title')} className="input" placeholder="e.g. iPhone 15 Pro Max, 256GB" maxLength={150} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <label className="label">Condition <span className="text-red-400">*</span></label>
                            <select value={form.condition} onChange={set('condition')} className="input" required>
                                {CONDITIONS.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                                <input type="number" value={form.price} onChange={set('price')} className="input pl-8" placeholder="Negotiable" min="0" step="0.01" />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="label">Location <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <input type="text" value={form.location} onChange={set('location')} className="input pr-12" placeholder="e.g. San Francisco, CA" required />
                                <button
                                    type="button"
                                    onClick={handleDetectLocation}
                                    disabled={isDetecting}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-400 hover:text-brand-300 disabled:opacity-50 transition-colors"
                                    title="Detect my location"
                                >
                                    {isDetecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
                                </button>
                            </div>
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
                        <label className="label">Description <span className="text-red-400">*</span></label>
                        <textarea value={form.description} onChange={set('description')} className="input resize-none" rows={6}
                            placeholder="Describe your item in detail — condition, features, why you're selling..." minLength={10} maxLength={5000} required />
                        <div className="flex justify-between mt-1">
                            <p className="text-xs text-slate-600">Minimum 10 characters</p>
                            <p className="text-xs text-slate-600">{form.description.length}/5000</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Photos (up to 5)</h2>
                    <ImageUpload onFilesChange={setFiles} maxFiles={5} />
                </div>

                <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full py-4 text-lg">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Creating your listing...
                        </>
                    ) : 'Post Listing'}
                </button>
            </form>
        </div>
    );
}
