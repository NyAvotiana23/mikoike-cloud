// src/services/api/signalementApiService.js
// Service pour interagir avec l'API REST Spring Boot

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Classe utilitaire pour gérer les erreurs d'API
 */
class ApiErrorHandler {
  static handle(error) {
    if (error.response) {
      // Erreur de réponse du serveur
      const message = error.response.data?.message || 'Une erreur est survenue';
      throw new Error(message);
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      throw new Error('Aucune réponse du serveur. Vérifiez votre connexion.');
    } else {
      // Erreur lors de la configuration de la requête
      throw new Error(error.message || 'Erreur inconnue');
    }
  }
}

/**
 * Service d'API pour les signalements
 */
class SignalementApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/signalements`;
  }

  /**
   * Récupère l'en-tête d'autorisation depuis le sessionStorage
   * @returns {Object} Headers
   */
  getAuthHeaders() {
    const token = sessionStorage.getItem('sessionId');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Récupère tous les signalements
   * @returns {Promise<Array>} Liste des signalements
   */
  async getAllSignalements() {
    try {
      const response = await fetch(this.baseURL, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements:', error);
      return ApiErrorHandler.handle(error);
    }
  }

  /**
   * Récupère un signalement par son ID
   * @param {number} id
   * @returns {Promise<Object|null>} Le signalement ou null
   */
  async getSignalementById(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        headers: this.getAuthHeaders()
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération du signalement ${id}:`, error);
      return ApiErrorHandler.handle(error);
    }
  }

  /**
   * Récupère les signalements par statut
   * @param {string} statusCode
   * @returns {Promise<Array>}
   */
  async getSignalementsByStatus(statusCode) {
    try {
      const response = await fetch(`${this.baseURL}/status/${statusCode}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des signalements par statut ${statusCode}:`, error);
      return ApiErrorHandler.handle(error);
    }
  }

  /**
   * Récupère les signalements pour la carte
   * @returns {Promise<Array>}
   */
  async getSignalementsForMap() {
    try {
      const response = await fetch(`${this.baseURL}/map`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements pour la carte:', error);
      return ApiErrorHandler.handle(error);
    }
  }

  /**
   * Calcule les statistiques des signalements
   * Correspond à l'endpoint GET /api/signalements/statistics
   * @returns {Promise<Object>} StatisticsDTO {total, totalSurface, totalBudget, nouveau, enCours, termine, avancement}
   */
  async getStatistics() {
    try {
      const response = await fetch(`${this.baseURL}/statistics`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return ApiErrorHandler.handle(error);
    }
  }



  /**
   * Crée un nouveau signalement
   * @param {Object} signalement Données du signalement
   * @returns {Promise<Object>} Signalement créé
   */
  async createSignalement(signalement) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(signalement)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du signalement:', error);
      return ApiErrorHandler.handle(error);
    }
  }

  /**
   * Met à jour un signalement
   * @param {number} id
   * @param {Object} signalement Données à mettre à jour
   * @returns {Promise<Object>}
   */
  async updateSignalement(id, signalement) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(signalement)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du signalement ${id}:`, error);
      return ApiErrorHandler.handle(error);
    }
  }

  /**
   * Supprime un signalement
   * @param {number} id
   * @returns {Promise<void>}
   */
  async deleteSignalement(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression du signalement ${id}:`, error);
      return ApiErrorHandler.handle(error);
    }
  }

  /**
   * Recherche des signalements par localisation
   * @param {Object} filter {latitude, longitude, radiusKm}
   * @returns {Promise<Array>}
   */
  async getSignalementsByLocation(filter) {
    try {
      const params = new URLSearchParams({
        latitude: filter.latitude.toString(),
        longitude: filter.longitude.toString(),
        radiusKm: (filter.radiusKm || 5.0).toString()
      });

      const response = await fetch(`${this.baseURL}/location?${params}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la recherche par localisation:', error);
      return ApiErrorHandler.handle(error);
    }
  }

  /**
   * Change le statut d'un signalement
   * @param {number} id
   * @param {number} newStatusId
   * @param {string} [commentaire]
   * @returns {Promise<Object>}
   */
  async changeStatus(id, newStatusId, commentaire) {
    try {
      const params = new URLSearchParams({ newStatusId: newStatusId.toString() });
      if (commentaire) {
        params.append('commentaire', commentaire);
      }

      const response = await fetch(`${this.baseURL}/${id}/change-status?${params}`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur lors du changement de statut du signalement ${id}:`, error);
      return ApiErrorHandler.handle(error);
    }
  }
}

/**
 * Service d'API pour les entreprises
 */
class EntrepriseApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/entreprises`;
  }

  getAuthHeaders() {
    const token = sessionStorage.getItem('sessionId');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getAllEntreprises() {
    const response = await fetch(this.baseURL, {
      headers: this.getAuthHeaders()
    });
    return await response.json();
  }

  async getActiveEntreprises() {
    const response = await fetch(`${this.baseURL}/active`, {
      headers: this.getAuthHeaders()
    });
    return await response.json();
  }

  async getTopRatedEntreprises() {
    const response = await fetch(`${this.baseURL}/top-rated`, {
      headers: this.getAuthHeaders()
    });
    return await response.json();
  }

  async getEntrepriseById(id) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      headers: this.getAuthHeaders()
    });
    if (response.status === 404) return null;
    return await response.json();
  }

  async getEntreprisesBySpecialite(specialite) {
    const params = new URLSearchParams({ specialite });
    const response = await fetch(`${this.baseURL}/by-specialite?${params}`, {
      headers: this.getAuthHeaders()
    });
    return await response.json();
  }
}

// Export des instances de service
const signalementApiService = new SignalementApiService();
const entrepriseApiService = new EntrepriseApiService();

export { signalementApiService, entrepriseApiService };
export default signalementApiService;