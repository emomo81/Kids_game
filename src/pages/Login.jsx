import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';

export default function Login({ onSwitchToSignup }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
        <div className="w-full max-w-sm mx-auto bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back!</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Ready for another adventure?</p>
            </div>

            {error && (
                <div className="mb-6 bg-rose-50 text-rose-600 text-sm p-3 rounded-xl border border-rose-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Email</label>
                    <Input
                        type="email"
                        placeholder="player@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                    {loading ? 'Logging in...' : (
                        <span className="flex items-center justify-center gap-2">
                            <LogIn className="w-5 h-5" /> Let's Play!
                        </span>
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                    New here?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="text-indigo-600 font-bold hover:underline"
                    >
                        Create an account
                    </button>
                </p>
            </div>
        </div>
    );
}
