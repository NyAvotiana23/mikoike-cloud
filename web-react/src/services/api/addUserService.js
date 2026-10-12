import api from '../httpClient';

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${sessionStorage.getItem('sessionId')}` },
});

const ERROR_MESSAGES = {
    400: 'Données invalides',
    401: 'Non autorisé. Veuillez vous reconnecter',
    403: 'Accès refusé. Permissions insuffisantes',
    404: 'Utilisateur non trouvé',
};
const HTTP_SERVER_ERROR = 500;

/**
 * Lecture et suppression des utilisateurs mobiles via /api/users.
 * La création passe par authService.register.
 */
class UserService {
    /** @returns {Promise<Array<{id, prenom, nom, email, role, createdAt}>>} */
    async getUsers() {
        return this.#request(() => api.get('/users', authHeaders()));
    }

    /**
     * @param {string|number} userId
     * @returns {Promise<{id, prenom, nom, email, role, createdAt}>}
     */
    async getUserById(userId) {
        return this.#request(() => api.get(`/users/${userId}`, authHeaders()));
    }

    /**
     * @param {string|number} userId
     * @throws {Error} si l'utilisateur est introuvable ou référencé par d'autres données (409)
     */
    async deleteUser(userId) {
        await this.#request(() => api.delete(`/users/${userId}`, authHeaders()));
    }

    async #request(call) {
        try {
            return (await call()).data;
        } catch (error) {
            throw this.handleError(error);
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
        if (status === 409) return new Error(data?.message || 'Opération impossible : conflit de données');
        if (status >= HTTP_SERVER_ERROR) return new Error('Erreur serveur. Réessayez plus tard');
        return new Error(ERROR_MESSAGES[status] || data?.message || 'Une erreur est survenue');
    }
}

export default new UserService();
