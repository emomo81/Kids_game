import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { emailClient } from '@/api/emailClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Star, AlertCircle } from 'lucide-react';

export default function Signup({ onSwitchToLogin }) {
    const { signup } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fullName || !email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setLoading(true);
        const result = await signup(email, password, fullName);
        setLoading(false);

        if (result.success) {
            // Send Welcome Email asynchronously
            emailClient.sendEmail({
                to_name: fullName,
                to_email: email,
                message: "Welcome to Math Adventure! We are so excited to have you join us. Get ready to solve problems, earn stars, and unlock awesome badges!",
            }).catch(err => console.error("Failed to send welcome email:", err));
        } else {
            setError(result.error || 'Failed to create account');
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Star className="w-8 h-8 fill-current" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Join the Fun!</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Create your explorer account</p>
            </div>

            {error && (
                <div className="mb-6 bg-rose-50 text-rose-600 text-sm p-3 rounded-xl border border-rose-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Your Name</label>
                    <Input
                        type="text"
                        placeholder="Explorer Alex"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Email</label>
                    <Input
                        type="email"
                        placeholder="alex@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Secret Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                    {loading ? 'Creating account...' : (
                        <span className="flex items-center justify-center gap-2">
                            <UserPlus className="w-5 h-5" /> Start Adventure
                        </span>
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                    Already playing?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-amber-600 font-bold hover:underline"
                    >
                        Log in here
                    </button>
                </p>
            </div>
        </div>
    );
}
