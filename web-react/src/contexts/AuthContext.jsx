// Updated file: src/contexts/AuthContext.jsx
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Charger l'utilisateur depuis le sessionStorage au démarrage
    useEffect(() => {
        const storedUserId = sessionStorage.getItem('userId');
        const storedSessionId = sessionStorage.getItem('sessionId');

        // Si les deux variables contiennent quelque chose (ne sont pas null, ni undefined, ni vide)
        if (storedUserId && storedSessionId) {
            // Vérifier la validité de la session avec le backend
            authService.verifySession(storedSessionId)
                .then(isValid => {
                    if (isValid) {
                        // Si valide, charger l'utilisateur (vous pouvez fetch plus de détails si besoin)
                        setUser({ id: storedUserId }); // Adapter selon les données utilisateur stockées
                        setSessionId(storedSessionId);
                    } else {
                        // Session invalide, cleanup
                        sessionStorage.clear();
                        setUser(null);
                        setSessionId(null);
                    }
                })
                .catch(() => {
                    sessionStorage.clear();
                    setUser(null);
                    setSessionId(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (userData, session) => {
        setUser(userData);
        setSessionId(session);
        sessionStorage.setItem('userId', userData.id);
        sessionStorage.setItem('sessionId', session);
    };

    const logout = () => {
        authService.logout()
            .then(() => {
                setUser(null);
                setSessionId(null);
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('sessionId');
            })
            .catch(error => console.error('Erreur lors de la déconnexion:', error));
    };

    const updateUser = (userData) => {
        setUser(userData);
        // Mettre à jour le sessionStorage si nécessaire
        sessionStorage.setItem('userId', userData.id);
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