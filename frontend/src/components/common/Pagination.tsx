import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: Props) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        if (totalPages <= 7) return i + 1;
        if (page <= 4) return i + 1;
        if (page >= totalPages - 3) return totalPages - 6 + i;
        return page - 3 + i;
    });

    return (
        <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="btn btn-secondary btn-sm disabled:opacity-40"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {pages[0] > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} className="btn btn-ghost btn-sm w-9 h-9">1</button>
                    {pages[0] > 2 && <span className="text-slate-600 px-1">…</span>}
                </>
            )}

            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`btn btn-sm w-9 h-9 ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                    aria-current={p === page ? 'page' : undefined}
                >
                    {p}
                </button>
            ))}

            {pages[pages.length - 1] < totalPages && (
                <>
                    {pages[pages.length - 1] < totalPages - 1 && <span className="text-slate-600 px-1">…</span>}
                    <button onClick={() => onPageChange(totalPages)} className="btn btn-ghost btn-sm w-9 h-9">{totalPages}</button>
                </>
            )}

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="btn btn-secondary btn-sm disabled:opacity-40"
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </nav>
    );
};
