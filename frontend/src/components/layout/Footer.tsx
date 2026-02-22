import { Link } from 'react-router-dom';

export const Footer = () => (
    <footer className="border-t border-slate-800 bg-slate-950 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">C</span>
                        </div>
                        <span className="font-display font-bold text-white">Cragialist</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        The modern classified marketplace. Buy, sell, and connect locally.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-300 mb-3 text-sm">Browse</h4>
                    <ul className="space-y-2">
                        {['For Sale', 'Housing', 'Jobs', 'Services', 'Community'].map((cat) => (
                            <li key={cat}>
                                <Link to={`/listings?category=${cat.toLowerCase().replace(' ', '-')}`}
                                    className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{cat}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-300 mb-3 text-sm">Account</h4>
                    <ul className="space-y-2">
                        {[['Sign In', '/login'], ['Create Account', '/register'], ['Dashboard', '/dashboard'], ['Post an Ad', '/listings/new']].map(([label, href]) => (
                            <li key={label}>
                                <Link to={href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-300 mb-3 text-sm">Help</h4>
                    <ul className="space-y-2">
                        {['Safety Tips', 'Posting Guidelines', 'Terms of Service', 'Privacy Policy'].map((item) => (
                            <li key={item}>
                                <span className="text-slate-500 text-sm cursor-pointer hover:text-slate-300 transition-colors">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
                <p className="text-slate-600 text-sm">© {new Date().getFullYear()} Cragialist. All rights reserved.</p>
                <p className="text-slate-700 text-xs">Built with React, Vite & Supabase</p>
            </div>
        </div>
    </footer>
);
