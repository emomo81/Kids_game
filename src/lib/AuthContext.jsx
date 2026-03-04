import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [appPublicSettings, setAppPublicSettings] = useState(null);

    useEffect(() => {
        checkAppState();
    }, []);

    const checkAppState = async () => {
        setIsLoadingPublicSettings(true);
        setAuthError(null);
        setAppPublicSettings({ name: "Math Game Offline" });
        setIsLoadingPublicSettings(false);
        await checkUserAuth();
    };

    const checkUserAuth = async () => {
        try {
            setIsLoadingAuth(true);
            const currentUser = await base44.auth.me();
            if (currentUser) {
                setUser(currentUser);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setIsLoadingAuth(false);
        } catch (error) {
            console.error('User auth check failed:', error);
            setUser(null);
            setIsAuthenticated(false);
            setIsLoadingAuth(false);
        }
    };

    const logout = (shouldRedirect = true) => {
        setUser(null);
        setIsAuthenticated(false);
        base44.auth.logout();
    };

    const login = async (email, password) => {
        setIsLoadingAuth(true);
        try {
            const userData = await base44.auth.login(email, password);
            setUser(userData);
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
            return { success: true };
        } catch (error) {
            setIsLoadingAuth(false);
            return { success: false, error: error.message };
        }
    };

    const signup = async (email, password, fullName) => {
        setIsLoadingAuth(true);
        try {
            const userData = await base44.auth.signup(email, password, fullName);
            setUser(userData);
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
            return { success: true };
        } catch (error) {
            setIsLoadingAuth(false);
            return { success: false, error: error.message };
        }
    };

    const navigateToLogin = () => {
        base44.auth.redirectToLogin();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoadingAuth,
            isLoadingPublicSettings,
            authError,
            appPublicSettings,
            logout,
            login,
            signup,
            navigateToLogin,
            checkAppState
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
