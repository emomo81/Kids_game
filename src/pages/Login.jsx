import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, Sparkles, AlertCircle, Eye, EyeOff, User, Lock } from 'lucide-react';

export default function Login({ onSwitchToSignup }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (!result.success) {
            setError(result.error || 'Failed to login');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto relative pt-8">
            {/* The Tab */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-xl px-8 py-3 rounded-b-3xl shadow-lg z-20 flex justify-center items-center">
                <h1 className="text-3xl font-medium text-slate-800 tracking-wide">Login</h1>
                {/* Custom styling to merge tab into the card like the image */}
                <div className="absolute top-0 -left-6 w-6 h-6 bg-transparent rounded-tr-3xl shadow-[5px_-5px_0_0_rgba(255,255,255,0.7)]" style={{ transform: 'scaleX(-1)' }}></div>
                <div className="absolute top-0 -right-6 w-6 h-6 bg-transparent rounded-tl-3xl shadow-[-5px_-5px_0_0_rgba(255,255,255,0.7)]" style={{ transform: 'scaleX(-1)' }}></div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-10 pt-16 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/20 relative z-10">

                {error && (
                    <div className="mb-6 bg-rose-500/20 text-rose-200 text-sm p-3 rounded-2xl border border-rose-500/30 flex items-start gap-2 backdrop-blur-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="relative group">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-14 pl-6 pr-12 rounded-full bg-white/5 border border-white/40 text-white placeholder:text-white/70 focus:bg-white/10 focus:border-white/60 focus:ring-4 focus:ring-white/10 transition-all font-medium text-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                        />
                        <User className="absolute right-5 top-1/2 -translate-y-1/2 text-white w-5 h-5 opacity-80 group-focus-within:opacity-100 transition-opacity" />
                    </div>

                    <div className="relative group">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-14 pl-6 pr-20 rounded-full bg-white/5 border border-white/40 text-white placeholder:text-white/70 focus:bg-white/10 focus:border-white/60 focus:ring-4 focus:ring-white/10 transition-all font-medium text-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-white opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
                            >
                                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                            <Lock className="text-white w-5 h-5 opacity-80 group-focus-within:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-white/90 px-2 text-sm font-medium">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center justify-center w-4 h-4 rounded border border-white/60 bg-white/10 group-hover:bg-white/20 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="absolute opacity-0 w-full h-full cursor-pointer"
                                />
                                {rememberMe && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
                                )}
                            </div>
                            Remember me
                        </label>
                        <a href="#" className="hover:text-white hover:underline transition-all">Forgot Password?</a>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 mt-4 bg-white/90 hover:bg-white text-slate-800 font-bold text-lg rounded-full shadow-lg transition-all active:scale-95 duration-200"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="mt-8 text-center px-2">
                    <p className="text-sm text-white/90 font-medium">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToSignup}
                            className="text-white font-bold hover:underline transition-all"
                        >
                            Register
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
