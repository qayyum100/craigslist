interface Props {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner = ({ size = 'md', className = '' }: Props) => {
    const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-3' };
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`${sizes[size]} animate-spin rounded-full border-slate-700 border-t-brand-500`} />
        </div>
    );
};

export const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-slate-500 text-sm animate-pulse">Loading...</p>
        </div>
    </div>
);
