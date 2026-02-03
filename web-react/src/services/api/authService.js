// src/services/api/authService.js
import api from '../httpClient';
// import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// import app from './firebase';

const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || 'local'; // 'local', 'firebase-dev', 'firebase-prod'

/**
 * Service d'authentification
 * Supporte PostgreSQL local et Firebase (dev/prod)
 */
class AuthService {
    /**
     * Connexion utilisateur
     * @param {string} email - Email de l'utilisateur
     * @param {string} password - Mot de passe
     * @returns {Promise<{user: object, sessionId: string}>}
     */
    async login(email, password) {
        try {
            // MOCK - Pour test uniquement
            // if (email === 'test@gmail.com' && password === 'test') {
            //     // Simuler un délai réseau
            //     await new Promise(resolve => setTimeout(resolve, 800));

            //     const mockUser = {
            //         id: '12345',
            //         email: 'test@gmail.com',
            //         name: 'Test User',
            //         role: 'user',
            //         createdAt: new Date().toISOString(),
            //     };

            //     const mockSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            //     return {
            //         user: mockUser,
            //         sessionId: mockSessionId,
            //     };
            // }

            // Cas où les identifiants sont incorrects
            // throw new Error('Email ou mot de passe incorrect');

            // MODE LOCAL - PostgreSQL
            if (AUTH_MODE === 'local') {
              const response = await api.post('/auth/login', {
                email,
                password,
              });
            
              return {
                userId: response.userId,
                sessionId: response.token,
              };
            }

            // MODE FIREBASE
        //     if (AUTH_MODE.startsWith('firebase')) {
        //       const auth = getAuth(app);
        //       const userCredential = await signInWithEmailAndPassword(auth, email, password);
        //       const user = userCredential.user;
            
        //       const token = await user.getIdToken();
            
        //       return {
        //         user: {
        //           id: user.uid,
        //           email: user.email,
        //           name: user.displayName || user.email.split('@')[0],
        //           emailVerified: user.emailVerified,
        //         },
        //         sessionId: token,
        //       };
        //     }

        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Inscription utilisateur
     * @param {string} email - Email de l'utilisateur
     * @param {string} password - Mot de passe
     * @param {string} name - Nom de l'utilisateur
     * @returns {Promise<{user: object, sessionId: string}>}
     */
    async register(email, password, name) {
        try {
            // MODE LOCAL - PostgreSQL
            if (AUTH_MODE === 'local') {
              const response = await api.post('/auth/register', {
                email,
                password,
                name,
              });
            
              return {
                user: response.data.userId,
                sessionId: response.data.sessionId,
              };
            }

            // MODE FIREBASE
            // if (AUTH_MODE.startsWith('firebase')) {
            //   const auth = getAuth(app);
            //   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            //   const user = userCredential.user;
            //
            //   await updateProfile(user, { displayName: name });
            //
            //   const token = await user.getIdToken();
            //
            //   return {
            //     user: {
            //       id: user.uid,
            //       email: user.email,
            //       name: name,
            //       emailVerified: user.emailVerified,
            //     },
            //     sessionId: token,
            //   };
            // }

            throw new Error('Mode d\'authentification non configuré');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Déconnexion utilisateur
     */
    async logout() {
        try {
            // MODE LOCAL - PostgreSQL
            if (AUTH_MODE === 'local') {
              await api.post('/auth/logout');
            }

            // MODE FIREBASE
            // if (AUTH_MODE.startsWith('firebase')) {
            //   const auth = getAuth(app);
            //   await signOut(auth);
            // }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    }

    /**
     * Vérifier si l'utilisateur est authentifié
     * @param {string} sessionId - ID de session
     * @returns {Promise<boolean>}
     */
    async verifySession(sessionId) {
        try {
            // MODE LOCAL - PostgreSQL
            // if (AUTH_MODE === 'local') {
            //   const response = await api.get('/auth/verify', {
            //     headers: { Authorization: `Bearer ${sessionId}` }
            //   });
            //   return response.data.valid;
            // }

            // MODE FIREBASE
            // if (AUTH_MODE.startsWith('firebase')) {
            //   const auth = getAuth(app);
            //   return !!auth.currentUser;
            // }

            return true; // Mock
        } catch (error) {
            return false;
        }
    }

    /**
     * Gestion des erreurs
     */
    handleError(error) {
        // Erreurs Firebase
        if (error.code) {
            const firebaseErrors = {
                'auth/invalid-email': 'Adresse email invalide',
                'auth/user-disabled': 'Ce compte a été désactivé',
                'auth/user-not-found': 'Aucun compte ne correspond à cet email',
                'auth/wrong-password': 'Mot de passe incorrect',
                'auth/email-already-in-use': 'Cet email est déjà utilisé',
                'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
                'auth/network-request-failed': 'Erreur de connexion au réseau',
                'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
            };

            return new Error(firebaseErrors[error.code] || error.message);
        }

        // Erreurs API
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message;

            if (status === 401) {
                return new Error(message || 'Email ou mot de passe incorrect');
            }
            if (status === 422) {
                return new Error(message || 'Données invalides');
            }
            if (status === 429) {
                return new Error('Trop de tentatives. Réessayez plus tard');
            }
            if (status >= 500) {
                return new Error('Erreur serveur. Réessayez plus tard');
            }

            return new Error(message || 'Une erreur est survenue');
        }

        // Erreur générique
        return error;
    }
}

export default new AuthService();