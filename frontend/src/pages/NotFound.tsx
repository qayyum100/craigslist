import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-8 animate-bounce shadow-2xl">
                <HelpCircle className="h-10 w-10 text-brand-500" />
            </div>

            <h1 className="text-7xl font-display font-black text-white mb-4">404</h1>
            <h2 className="text-2xl font-bold text-slate-200 mb-4">Page Not Found</h2>

            <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
                Wait, where did it go? The page you&apos;re looking for doesn&apos;t exist or has been moved to another universe.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="btn btn-secondary btn-lg"
                >
                    <ArrowLeft className="h-4 w-4" /> Go Back
                </button>
                <Link to="/" className="btn btn-primary btn-lg">
                    <Home className="h-4 w-4" /> Back to Home
                </Link>
            </div>
        </div>
    );
}
