// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Charger l'utilisateur depuis le localStorage au démarrage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedSessionId = localStorage.getItem('sessionId');

        if (storedUser && storedSessionId) {
            setUser(JSON.parse(storedUser));
            setSessionId(storedSessionId);
        }
        setLoading(false);
    }, []);

    const login = (userData, session) => {
        setUser(userData);
        setSessionId(session);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('sessionId', session);
    };

    const logout = () => {
        setUser(null);
        setSessionId(null);
        localStorage.removeItem('user');
        localStorage.removeItem('sessionId');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        sessionId,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user && !!sessionId,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};