// src/config/mapConfig.js
export const mapConfig = {
    // Tile Servers - can be switched based on environment
    tileServers: {
        production: {
            url: import.meta.env.VITE_MAP_TILE_SERVER || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: import.meta.env.VITE_MAP_ATTRIBUTION || '© OpenStreetMap contributors',
            maxZoom: 19
        },
        docker: {
            url: import.meta.env.VITE_MAP_DOCKER_SERVER || 'http://localhost:8080/tile/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        },
        // Add more providers as needed
        mapbox: {
            url: `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`,
            attribution: '© Mapbox © OpenStreetMap',
            maxZoom: 19,
            id: 'mapbox/streets-v11',
            accessToken: import.meta.env.VITE_MAPBOX_TOKEN
        }
    },

    // Default map settings
    defaults: {
        center: [
            parseFloat(import.meta.env.VITE_MAP_DEFAULT_LAT) || -18.8792,
            parseFloat(import.meta.env.VITE_MAP_DEFAULT_LNG) || 47.5079
        ],
        zoom: parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 13,
        minZoom: parseInt(import.meta.env.VITE_MAP_MIN_ZOOM) || 3,
        maxZoom: parseInt(import.meta.env.VITE_MAP_MAX_ZOOM) || 19
    },

    // Feature flags
    features: {
        clustering: true,
        heatmap: true,
        routing: false,
        search: true
    }
};

// Get active tile server based on environment
export const getActiveTileServer = () => {
    const env = import.meta.env.MODE; // 'development' or 'production'

    if (env === 'development' && import.meta.env.VITE_USE_DOCKER_TILES === 'true') {
        return mapConfig.tileServers.docker;
    }

    return mapConfig.tileServers.production;
};