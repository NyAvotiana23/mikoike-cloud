// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Charger l'utilisateur depuis le localStorage au démarrage
    useEffect(() => {
        const storedUser = localStorage.getItem('userId');
        const storedSessionId = localStorage.getItem('sessionId');

        // Si les deux variables contiennent quelque chose (ne sont pas null, ni undefined, ni vide)
        if (storedUser && storedSessionId) {
            try {
                setUser(storedUser);
                setSessionId(storedSessionId);
                console.log(user);
            } catch (error) {
                // Sécurité : Si le JSON dans le storage est corrompu, on évite le crash
                console.error("Erreur de lecture du storage", error);
                localStorage.clear(); 
            }
        }
        
        setLoading(false);
    }, []);

    const login = (userData, session) => {
        setUser(userData);
        setSessionId(session);
        localStorage.setItem('userId', userData);
        localStorage.setItem('sessionId', session);
    };

    const logout = () => {
        setUser(null);
        setSessionId(null);
        localStorage.removeItem('userId');
        localStorage.removeItem('sessionId');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('userId',userData);
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