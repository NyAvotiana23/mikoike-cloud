// src/services/mapService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const mapService = {
    // Fetch user's saved locations
    async getSavedLocations(userId) {
        const response = await axios.get(`${API_URL}/users/${userId}/locations`);
        return response.data;
    },

    // Save new location
    async saveLocation(userId, location) {
        const response = await axios.post(`${API_URL}/users/${userId}/locations`, location);
        return response.data;
    },

    // Update location
    async updateLocation(userId, locationId, updates) {
        const response = await axios.put(`${API_URL}/users/${userId}/locations/${locationId}`, updates);
        return response.data;
    },

    // Delete location
    async deleteLocation(userId, locationId) {
        await axios.delete(`${API_URL}/users/${userId}/locations/${locationId}`);
    },

    // Get map configuration from server
    async getMapConfig() {
        const response = await axios.get(`${API_URL}/config/map`);
        return response.data;
    }
};