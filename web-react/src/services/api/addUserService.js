// src/services/api/addUserService.js
import api from '../httpClient';

/**
 * Service de gestion des utilisateurs
 * Pour l'ajout d'utilisateurs par un manager
 */
class AddUserService {
    /**
     * Créer un nouvel utilisateur
     * @param {Object} userData - Données de l'utilisateur
     * @param {string} userData.email - Email de l'utilisateur
     * @param {string} userData.password - Mot de passe
     * @param {string} userData.nom - Nom de famille
     * @param {string} userData.prenom - Prénom
     * @param {number|null} userData.age - Âge (optionnel)
     * @param {string|null} userData.location - Localisation (optionnel)
     * @returns {Promise<{user: object, message: string}>}
     */
    async createUser(userData) {
        try {
            // MOCK - Pour test uniquement
            // Simuler un délai réseau
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Validation basique
            if (!userData.email || !userData.password || !userData.nom || !userData.prenom) {
                throw new Error('Les champs email, password, nom et prenom sont requis');
            }

            // Simuler la création d'un utilisateur
            const mockUser = {
                id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                email: userData.email,
                nom: userData.nom,
                prenom: userData.prenom,
                age: userData.age || null,
                location: userData.location || null,
                role: 'user',
                createdAt: new Date().toISOString(),
                createdBy: 'manager_mock_id', // ID du manager qui a créé l'utilisateur
            };

            return {
                user: mockUser,
                message: 'Utilisateur créé avec succès',
            };

            // MODE PRODUCTION - API PostgreSQL/Firebase
            // const response = await api.post('/users', {
            //     email: userData.email,
            //     password: userData.password,
            //     nom: userData.nom,
            //     prenom: userData.prenom,
            //     age: userData.age,
            //     location: userData.location,
            // }, {
            //     headers: {
            //         'Authorization': `Bearer ${sessionStorage.getItem('sessionId')}`,
            //     }
            // });
            //
            // return {
            //     user: response.data.user,
            //     message: response.data.message || 'Utilisateur créé avec succès',
            // };

        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Récupérer la liste des utilisateurs
     * @returns {Promise<Array>}
     */
    async getUsers() {
        try {
            // MOCK - Pour test uniquement
            await new Promise(resolve => setTimeout(resolve, 500));

            // const mockUsers = [
            //     {
            //         id: '1',
            //         email: 'jean.dupont@example.com',
            //         nom: 'Dupont',
            //         prenom: 'Jean',
            //         age: 28,
            //         location: 'Paris, France',
            //         role: 'user',
            //         createdAt: '2024-01-15T10:30:00Z',
            //     },
            //     {
            //         id: '2',
            //         email: 'marie.martin@example.com',
            //         nom: 'Martin',
            //         prenom: 'Marie',
            //         age: 32,
            //         location: 'Lyon, France',
            //         role: 'user',
            //         createdAt: '2024-01-20T14:45:00Z',
            //     },
            // ];

            // return mockUsers;

            // MODE PRODUCTION
            const response = await api.get('/users', {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('sessionId')}`,
                }
            });
            
            return response.data.users;

        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Récupérer un utilisateur par ID
     * @param {string} userId - ID de l'utilisateur
     * @returns {Promise<object>}
     */
    async getUserById(userId) {
        try {
            // MOCK - Pour test uniquement
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockUsers = [
                {
                    id: '1',
                    email: 'jean.dupont@example.com',
                    nom: 'Dupont',
                    prenom: 'Jean',
                    age: 28,
                    date_naissance: '1996-03-15',
                    location: 'Paris, France',
                    role: 'user',
                    createdAt: '2024-01-15T10:30:00Z',
                },
                {
                    id: '2',
                    email: 'marie.martin@example.com',
                    nom: 'Martin',
                    prenom: 'Marie',
                    age: 32,
                    date_naissance: '1992-07-22',
                    location: 'Lyon, France',
                    role: 'manager',
                    createdAt: '2024-01-20T14:45:00Z',
                },
                {
                    id: '3',
                    email: 'admin@example.com',
                    nom: 'Admin',
                    prenom: 'Super',
                    age: 35,
                    date_naissance: '1989-11-08',
                    location: 'Marseille, France',
                    role: 'admin',
                    createdAt: '2023-12-01T09:00:00Z',
                },
            ];

            const user = mockUsers.find(u => u.id === userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            return user;

            // MODE PRODUCTION
            // const response = await api.get(`/users/${userId}`, {
            //     headers: {
            //         'Authorization': `Bearer ${sessionStorage.getItem('sessionId')}`,
            //     }
            // });
            //
            // return response.data.user;

        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Mettre à jour un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @param {Object} updates - Données à mettre à jour
     * @returns {Promise<object>}
     */
    async updateUser(userId, updates) {
        try {
            // MODE PRODUCTION
            // const response = await api.put(`/users/${userId}`, updates, {
            //     headers: {
            //         'Authorization': `Bearer ${sessionStorage.getItem('sessionId')}`,
            //     }
            // });
            //
            // return response.data.user;

            throw new Error('Méthode non implémentée en mode mock');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Supprimer un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @returns {Promise<void>}
     */
    async deleteUser(userId) {
        try {
            // MOCK - Pour test uniquement
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(`Utilisateur ${userId} supprimé (mock)`);
            return;

            // MODE PRODUCTION
            // await api.delete(`/users/${userId}`, {
            //     headers: {
            //         'Authorization': `Bearer ${sessionStorage.getItem('sessionId')}`,
            //     }
            // });

        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Gestion des erreurs
     */
    handleError(error) {
        // Erreurs API
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message;

            if (status === 400) {
                return new Error(message || 'Données invalides');
            }
            if (status === 401) {
                return new Error('Non autorisé. Veuillez vous reconnecter');
            }
            if (status === 403) {
                return new Error('Accès refusé. Permissions insuffisantes');
            }
            if (status === 404) {
                return new Error('Utilisateur non trouvé');
            }
            if (status === 409) {
                return new Error(message || 'Cet email est déjà utilisé');
            }
            if (status === 422) {
                return new Error(message || 'Données invalides');
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

export default new AddUserService();