import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Plus, Search, Shield, LayoutDashboard, BookmarkIcon, MessageSquare, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useChat';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { isAuthenticated, user } = useAuthStore();
    const logout = useLogout();
    const navigate = useNavigate();
    const { data: conversations } = useConversations();

    const totalUnread = conversations?.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) || 0;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <header className="sticky top-0 z-50 glass border-b border-slate-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
                            <span className="text-white font-display font-bold text-sm">C</span>
                        </div>
                        <span className="font-display font-bold text-white text-lg hidden xs:block">
                            Cragi<span className="text-gradient">list</span>
                        </span>
                    </Link>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search listings..."
                                className="input pl-10 py-2 text-sm"
                            />
                        </div>
                    </form>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-2">
                        <Link to="/listings" className="btn btn-ghost btn-sm">Browse</Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/listings/new" className="btn btn-primary btn-sm">
                                    <Plus className="h-4 w-4" />
                                    Post Ad
                                </Link>
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 btn btn-ghost btn-sm"
                                        id="user-menu-button"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                                            <User className="h-4 w-4 text-brand-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-200">{user?.username}</span>
                                    </button>

                                    {userMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-48 card shadow-xl shadow-black/30 animate-scale-in py-1 z-50">
                                            <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                                                <LayoutDashboard className="h-4 w-4" /> Dashboard
                                            </Link>
                                            <Link to="/dashboard?tab=bookmarks" onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                                                <BookmarkIcon className="h-4 w-4" /> Bookmarks
                                            </Link>
                                            <Link to="/messages" onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <MessageSquare className="h-4 w-4" /> Messages
                                                </div>
                                                {totalUnread > 0 && (
                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white shadow-lg shadow-brand-500/30">
                                                        {totalUnread}
                                                    </span>
                                                )}
                                            </Link>
                                            {user?.role === 'admin' && (
                                                <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                                                    <Shield className="h-4 w-4" /> Admin Panel
                                                </Link>
                                            )}
                                            <hr className="border-slate-800 my-1" />
                                            <button onClick={() => { logout(); setUserMenuOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors">
                                                <LogOut className="h-4 w-4" /> Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile menu toggle */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden btn btn-ghost btn-sm" aria-label="Toggle menu">
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-slate-800 space-y-2 animate-slide-up">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search listings..." className="input pl-10 py-2.5 text-sm" />
                        </form>
                        <Link to="/listings" onClick={() => setIsOpen(false)} className="block btn btn-ghost btn-md w-full justify-start">Browse Listings</Link>
                        {isAuthenticated ? (
                            <>
                                <Link to="/listings/new" onClick={() => setIsOpen(false)} className="block btn btn-primary btn-md w-full">
                                    <Plus className="h-4 w-4" /> Post Ad
                                </Link>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block btn btn-ghost btn-md w-full justify-start">
                                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                                </Link>
                                <Link to="/messages" onClick={() => setIsOpen(false)} className="flex items-center justify-between btn btn-ghost btn-md w-full">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="h-4 w-4" /> Messages
                                    </div>
                                    {totalUnread > 0 && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                                            {totalUnread}
                                        </span>
                                    )}
                                </Link>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block btn btn-ghost btn-md w-full justify-start">
                                        <Shield className="h-4 w-4" /> Admin Panel
                                    </Link>
                                )}
                                <button onClick={() => { logout(); setIsOpen(false); }} className="w-full btn btn-danger btn-md">
                                    <LogOut className="h-4 w-4" /> Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="block btn btn-secondary btn-md w-full">Sign in</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="block btn btn-primary btn-md w-full">Get Started</Link>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Backdrop for user menu */}
            {userMenuOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
            )}
        </header>
    );
};
