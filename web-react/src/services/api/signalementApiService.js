// src/services/api/signalementApiService.js
// Service pour interagir avec l'API REST Spring Boot

const API_BASE_URL = meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Service d'API pour les signalements
 */
const signalementApiService = {
    /**
     * Récupère tous les signalements
     * @returns {Promise<Array>} Liste des signalements
     */
    getAllSignalements: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/signalements`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des signalements:', error);
            throw error;
        }
    },

    /**
     * Récupère un signalement par son ID
     * @param {number} id - ID du signalement
     * @returns {Promise<Object|null>} Le signalement ou null
     */
    getSignalementById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/signalements/${id}`);
            if (response.status === 404) {
                return null;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la récupération du signalement ${id}:`, error);
            throw error;
        }
    },

    /**
     * Récupère les signalements par statut
     * @param {string} statusCode - Code du statut (nouveau, en_cours, termine)
     * @returns {Promise<Array>} Liste des signalements filtrés
     */
    getSignalementsByStatus: async (statusCode) => {
        try {
            const response = await fetch(`${API_BASE_URL}/signalements/status/${statusCode}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la récupération des signalements par statut ${statusCode}:`, error);
            throw error;
        }
    },

    /**
     * Récupère les signalements pour la carte
     * @returns {Promise<Array>} Liste des signalements avec coordonnées
     */
    getSignalementsForMap: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/signalements/map`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des signalements pour la carte:', error);
            throw error;
        }
    },

    /**
     * Calcule les statistiques des signalements
     * @returns {Promise<Object>} Statistiques
     */
    getStatistics: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/signalements/statistics`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw error;
        }
    },

    /**
     * Crée un nouveau signalement
     * @param {Object} signalement - Données du signalement
     * @returns {Promise<Object>} Le signalement créé
     */
    createSignalement: async (signalement) => {
        try {
            const response = await fetch(`${API_BASE_URL}/signalements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Ajouter le token d'authentification si nécessaire
                    // 'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(signalement)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la création du signalement:', error);
            throw error;
        }
    },

    /**
     * Met à jour un signalement
     * @param {number} id - ID du signalement
     * @param {Object} signalement - Nouvelles données
     * @returns {Promise<Object>} Le signalement mis à jour
     */
    updateSignalement: async (id, signalement) => {
        try {
            const response = await fetch(`${API_BASE_URL}/signalements/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signalement)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du signalement ${id}:`, error);
            throw error;
        }
    },

    /**
     * Supprime un signalement
     * @param {number} id - ID du signalement
     * @returns {Promise<void>}
     */
    deleteSignalement: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/signalements/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Erreur lors de la suppression du signalement ${id}:`, error);
            throw error;
        }
    },

    /**
     * Recherche des signalements par localisation
     * @param {number} latitude - Latitude
     * @param {number} longitude - Longitude
     * @param {number} radiusKm - Rayon en km (défaut: 5)
     * @returns {Promise<Array>} Liste des signalements dans le rayon
     */
    getSignalementsByLocation: async (latitude, longitude, radiusKm = 5.0) => {
        try {
            const params = new URLSearchParams({
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                radiusKm: radiusKm.toString()
            });
            const response = await fetch(`${API_BASE_URL}/signalements/location?${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la recherche par localisation:', error);
            throw error;
        }
    },

    /**
     * Change le statut d'un signalement
     * @param {number} id - ID du signalement
     * @param {number} newStatusId - ID du nouveau statut
     * @param {string} commentaire - Commentaire optionnel
     * @returns {Promise<Object>} Le signalement mis à jour
     */
    changeStatus: async (id, newStatusId, commentaire = null) => {
        try {
            const params = new URLSearchParams({ newStatusId: newStatusId.toString() });
            if (commentaire) {
                params.append('commentaire', commentaire);
            }
            const response = await fetch(`${API_BASE_URL}/signalements/${id}/change-status?${params}`, {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors du changement de statut du signalement ${id}:`, error);
            throw error;
        }
    }
};

/**
 * Service d'API pour les entreprises
 */
const entrepriseApiService = {
    getAllEntreprises: async () => {
        const response = await fetch(`${API_BASE_URL}/entreprises`);
        return await response.json();
    },

    getActiveEntreprises: async () => {
        const response = await fetch(`${API_BASE_URL}/entreprises/active`);
        return await response.json();
    },

    getTopRatedEntreprises: async () => {
        const response = await fetch(`${API_BASE_URL}/entreprises/top-rated`);
        return await response.json();
    },

    getEntrepriseById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/entreprises/${id}`);
        if (response.status === 404) return null;
        return await response.json();
    },

    getEntreprisesBySpecialite: async (specialite) => {
        const params = new URLSearchParams({ specialite });
        const response = await fetch(`${API_BASE_URL}/entreprises/by-specialite?${params}`);
        return await response.json();
    }
};

/**
 * Service d'API pour les actions
 */
const actionApiService = {
    getAllActions: async () => {
        const response = await fetch(`${API_BASE_URL}/actions`);
        return await response.json();
    },

    getActionsBySignalement: async (signalementId) => {
        const response = await fetch(`${API_BASE_URL}/actions/signalement/${signalementId}`);
        return await response.json();
    },

    getActionsByEntreprise: async (entrepriseId) => {
        const response = await fetch(`${API_BASE_URL}/actions/entreprise/${entrepriseId}`);
        return await response.json();
    },

    getActionsEnCours: async () => {
        const response = await fetch(`${API_BASE_URL}/actions/en-cours`);
        return await response.json();
    },

    getActionsEnRetard: async () => {
        const response = await fetch(`${API_BASE_URL}/actions/en-retard`);
        return await response.json();
    },

    getStatistics: async () => {
        const response = await fetch(`${API_BASE_URL}/actions/statistics`);
        return await response.json();
    },

    demarrerTravaux: async (actionId) => {
        const response = await fetch(`${API_BASE_URL}/actions/${actionId}/demarrer`, {
            method: 'POST'
        });
        return await response.json();
    },

    terminerTravaux: async (actionId, conformes, commentaire = null) => {
        const params = new URLSearchParams({ conformes: conformes.toString() });
        if (commentaire) params.append('commentaire', commentaire);
        const response = await fetch(`${API_BASE_URL}/actions/${actionId}/terminer?${params}`, {
            method: 'POST'
        });
        return await response.json();
    }
};

/**
 * Service d'API pour l'historique
 */
const historiqueApiService = {
    getHistoriqueBySignalement: async (signalementId) => {
        const response = await fetch(`${API_BASE_URL}/historiques/signalement/${signalementId}`);
        return await response.json();
    },

    getLastStatusChange: async (signalementId) => {
        const response = await fetch(`${API_BASE_URL}/historiques/signalement/${signalementId}/dernier`);
        if (response.status === 404) return null;
        return await response.json();
    }
};

export { 
    signalementApiService, 
    entrepriseApiService, 
    actionApiService, 
    historiqueApiService 
};

export default signalementApiService;