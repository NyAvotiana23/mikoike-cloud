import api from '../httpClient';

const HTTP_UNAUTHORIZED = 401;
const HTTP_UNPROCESSABLE = 422;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_SERVER_ERROR = 500;

const bearer = (sessionId) => ({ headers: { Authorization: `Bearer ${sessionId}` } });

/**
 * Authentification des managers auprès du backend (/api/admin/login, /api/auth/*).
 */
class AuthService {
    /**
     * Connecte un manager.
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{user: {id, email, name, role}, sessionId: string}>}
     * @throws {Error} message utilisateur lisible
     */
    async login(email, password) {
        try {
            const { data } = await api.post('/admin/login', { email, password });
            return {
                user: { id: data.userId, email: data.email, name: data.name, role: data.role },
                sessionId: data.token,
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Crée un compte utilisateur (réservé à un manager connecté).
     * @param {string} email
     * @param {string} password
     * @param {string} name nom complet
     * @returns {Promise<{user: {id, email, name, role}, message: string}>}
     */
    async register(email, password, name) {
        try {
            const { data } = await api.post(
                '/auth/register',
                { email, password, name },
                bearer(sessionStorage.getItem('sessionId')),
            );
            return {
                user: { id: data.userId, email: data.email, name: data.name, role: data.role },
                message: data.message,
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Termine la session côté serveur. Les erreurs sont journalisées, jamais propagées :
     * la session locale doit toujours pouvoir être nettoyée.
     */
    async logout(sessionId = sessionStorage.getItem('sessionId')) {
        try {
            await api.post('/auth/logout', null, bearer(sessionId));
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    }

    /**
     * Vérifie auprès du backend qu'une session est encore valide.
     * @param {string} sessionId
     * @returns {Promise<boolean>} false si session invalide, expirée ou backend injoignable
     */
    async verifySession(sessionId) {
        try {
            const { data } = await api.get('/auth/validate', bearer(sessionId));
            return data.valid === true;
        } catch {
            return false;
        }
    }

    /**
     * Convertit une erreur axios en Error au message affichable.
     * @param {Error & {response?: {status: number, data?: {message?: string}}}} error
     * @returns {Error}
     */
    handleError(error) {
        if (!error.response) {
            return error;
        }

        const { status, data } = error.response;
        const message = data?.message;

        if (status === HTTP_UNAUTHORIZED) return new Error(message || 'Email ou mot de passe incorrect');
        if (status === HTTP_UNPROCESSABLE) return new Error(message || 'Données invalides');
        if (status === HTTP_TOO_MANY_REQUESTS) return new Error('Trop de tentatives. Réessayez plus tard');
        if (status >= HTTP_SERVER_ERROR) return new Error('Erreur serveur. Réessayez plus tard');

        return new Error(message || 'Une erreur est survenue');
    }
}

export default new AuthService();
