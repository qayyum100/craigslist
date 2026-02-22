import { LucideIcon } from 'lucide-react';

interface Props {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState = ({ icon: Icon, title, description, action, className = '' }: Props) => (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
        {Icon && (
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                <Icon className="h-8 w-8 text-slate-500" />
            </div>
        )}
        <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
        {description && <p className="text-slate-500 text-sm max-w-xs mb-4">{description}</p>}
        {action}
    </div>
);
