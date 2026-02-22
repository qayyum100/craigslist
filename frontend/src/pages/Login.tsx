import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const login = useLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        login.mutate({ email, password });
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-grid-pattern">
            <div className="w-full max-w-md space-y-8 animate-slide-up">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
                        <LogIn className="h-6 w-6 text-brand-400" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-slate-500 text-sm">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium font-sans">
                            Create an account
                        </Link>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="card p-8 space-y-5 bg-slate-900/50 backdrop-blur-xl">
                    <div className="space-y-1.5">
                        <label className="label" htmlFor="email">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input pl-11"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="label" htmlFor="password">Password</label>
                            <button type="button" className="text-xs text-brand-500 hover:text-brand-400 font-medium">
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input pl-11"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={login.isPending}
                        className="btn btn-primary btn-lg w-full mt-4"
                    >
                        {login.isPending ? 'Signing in...' : 'Sign in'}
                        {!login.isPending && <ArrowRight className="h-4 w-4" />}
                    </button>
                </form>

                {/* Back link */}
                <p className="text-center">
                    <Link to="/" className="text-slate-500 hover:text-slate-400 text-sm flex items-center justify-center gap-2">
                        Home
                    </Link>
                </p>
            </div>
        </div>
    );
}
