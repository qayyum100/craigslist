import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, KeyRound } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            await axios.post('/api/auth/forgot-password', { email });
            setIsSent(true);
            toast.success('Reset link sent to your email');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-grid-pattern">
            <div className="w-full max-w-md space-y-8 animate-slide-up">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
                        <KeyRound className="h-6 w-6 text-brand-400" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">Forgot Password?</h2>
                    <p className="mt-2 text-slate-500 text-sm">
                        Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>

                {/* Form */}
                {isSent ? (
                    <div className="card p-8 text-center space-y-6 bg-slate-900/50 backdrop-blur-xl border-emerald-500/20">
                        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Mail className="h-8 w-8 text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Check your email</h3>
                            <p className="text-slate-400 text-sm">
                                We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
                            </p>
                        </div>
                        <Link to="/login" className="btn btn-primary w-full inline-flex items-center justify-center">
                            Back to Login
                        </Link>
                    </div>
                ) : (
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary btn-lg w-full mt-4"
                        >
                            {isLoading ? 'Sending link...' : 'Send Reset Link'}
                            {!isLoading && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </form>
                )}

                {/* Back link */}
                {!isSent && (
                    <p className="text-center">
                        <Link to="/login" className="text-slate-500 hover:text-slate-400 text-sm flex items-center justify-center gap-2">
                            Back to Login
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
