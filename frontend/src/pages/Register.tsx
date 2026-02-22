import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useRegister } from '@/hooks/useAuth';

export default function Register() {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const register = useRegister();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.username || !form.email || !form.password) return;
        register.mutate(form);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-grid-pattern">
            <div className="w-full max-w-md space-y-8 animate-slide-up">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
                        <UserPlus className="h-6 w-6 text-brand-400" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">Create Account</h2>
                    <p className="mt-2 text-slate-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium font-sans">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="card p-8 space-y-5 bg-slate-900/50 backdrop-blur-xl">
                    <div className="space-y-1.5">
                        <label className="label" htmlFor="username">Username</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                id="username"
                                type="text"
                                required
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                className="input pl-11"
                                placeholder="johndoe"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="label" htmlFor="email">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                id="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="input pl-11"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="label" htmlFor="password">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                id="password"
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="input pl-11"
                                placeholder="••••••••"
                                minLength={8}
                            />
                        </div>
                        <p className="text-[10px] text-slate-600">Must be at least 8 characters</p>
                    </div>

                    <button
                        type="submit"
                        disabled={register.isPending}
                        className="btn btn-primary btn-lg w-full mt-4"
                    >
                        {register.isPending ? 'Creating account...' : 'Create account'}
                        {!register.isPending && <ArrowRight className="h-4 w-4" />}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-600 max-w-xs mx-auto">
                    By creating an account, you agree to our Terms of Use and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
