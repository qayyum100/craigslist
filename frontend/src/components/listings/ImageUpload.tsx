import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface Props {
    onFilesChange: (files: File[]) => void;
    maxFiles?: number;
    className?: string;
}

export const ImageUpload = ({ onFilesChange, maxFiles = 5, className = '' }: Props) => {
    const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const remaining = maxFiles - previews.length;
        const toAdd = acceptedFiles.slice(0, remaining).map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        const updated = [...previews, ...toAdd];
        setPreviews(updated);
        onFilesChange(updated.map((p) => p.file));
    }, [previews, maxFiles, onFilesChange]);

    const remove = (index: number) => {
        const updated = previews.filter((_, i) => i !== index);
        URL.revokeObjectURL(previews[index].url);
        setPreviews(updated);
        onFilesChange(updated.map((p) => p.file));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
        maxSize: 5 * 1024 * 1024,
        disabled: previews.length >= maxFiles,
    });

    return (
        <div className={className}>
            {/* Drop zone */}
            {previews.length < maxFiles && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'
                        }`}
                >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-300 font-medium text-sm">
                        {isDragActive ? 'Drop images here…' : 'Drag & drop images here'}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                        or <span className="text-brand-400">browse files</span> · JPG, PNG, WebP · Max 5MB each · {maxFiles - previews.length} remaining
                    </p>
                </div>
            )}

            {/* Previews */}
            {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                    {previews.map((p, i) => (
                        <div key={i} className="relative group aspect-square">
                            <img
                                src={p.url}
                                alt={`Preview ${i + 1}`}
                                className="w-full h-full object-cover rounded-xl border border-slate-700"
                            />
                            {i === 0 && (
                                <span className="absolute bottom-1 left-1 text-[10px] badge badge-green">Primary</span>
                            )}
                            <button
                                onClick={() => remove(i)}
                                type="button"
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/90 border border-slate-700 flex items-center justify-center
                           opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/80 hover:border-red-700"
                                aria-label="Remove image"
                            >
                                <X className="h-3 w-3 text-white" />
                            </button>
                        </div>
                    ))}
                    {previews.length === 0 && (
                        <div className="aspect-square bg-slate-800 rounded-xl border border-dashed border-slate-700 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-slate-600" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
