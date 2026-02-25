import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('/api/auth/reset-password', { token, password });
            setIsSuccess(true);
            toast.success('Password reset successful');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to reset password');
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
                        <Lock className="h-6 w-6 text-brand-400" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">Set New Password</h2>
                    <p className="mt-2 text-slate-500 text-sm">
                        Please enter your new password below.
                    </p>
                </div>

                {/* Form */}
                {isSuccess ? (
                    <div className="card p-8 text-center space-y-6 bg-slate-900/50 backdrop-blur-xl border-emerald-500/20">
                        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Password Reset!</h3>
                            <p className="text-slate-400 text-sm">
                                Your password has been successfully updated. Redirecting to login...
                            </p>
                        </div>
                        <Link to="/login" className="btn btn-primary w-full">
                            Go to Login Now
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="card p-8 space-y-5 bg-slate-900/50 backdrop-blur-xl">
                        <div className="space-y-1.5">
                            <label className="label" htmlFor="password">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-11 pr-11"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="label" htmlFor="confirmPassword">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input pl-11"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary btn-lg w-full mt-4"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                            {!isLoading && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
