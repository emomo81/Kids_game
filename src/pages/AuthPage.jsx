import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <>
            <AnimatedBackground />
            <div className="min-h-screen flex items-center justify-center p-4 relative z-10 text-slate-800">
                {isLogin ? (
                    <Login onSwitchToSignup={() => setIsLogin(false)} />
                ) : (
                    <Signup onSwitchToLogin={() => setIsLogin(true)} />
                )}
            </div>
        </>
    );
}
