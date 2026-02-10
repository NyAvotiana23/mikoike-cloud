import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { environment } from '@/environments/environment';

class MapService {
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private markerData: Map<L.Marker, string> = new Map(); // Associe markers aux IDs
  private userMarker: L.Marker | null = null;

  initMap(containerId: string, lat?: number, lng?: number) {
    if (this.map) {
      this.map.remove();
    }

    // Utiliser les coordonnées fournies ou celles par défaut
    const centerLat = lat ?? environment.defaultLocation.lat;
    const centerLng = lng ?? environment.defaultLocation.lng;
    const { zoom } = environment.defaultLocation;

    this.map = L.map(containerId, {
      center: [centerLat, centerLng],
      zoom: zoom,
      zoomControl: true
    });

    L.tileLayer(environment.osm.tileUrl, {
      attribution: environment.osm.attribution,
      maxZoom: 19
    }).addTo(this.map);

    // Force la carte à se redimensionner et se centrer correctement après le chargement
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        this.map.setView([centerLat, centerLng], zoom);
      }
    }, 100);

    return this.map;
  }

  addUserMarker(lat: number, lng: number) {
    if (!this.map) return null;

    // Supprimer le marqueur utilisateur précédent s'il existe
    if (this.userMarker) {
      this.userMarker.remove();
    }

    // Créer une icône personnalisée pour l'utilisateur
    const userIcon = L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid rgba(59, 130, 246, 0.3);
            animation: ripple 2s infinite;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes ripple {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2.5); opacity: 0; }
          }
        </style>
      `,
      className: 'user-location-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    this.userMarker = L.marker([lat, lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong style="color: #3b82f6;">📍 Votre position</strong>
          <p style="margin: 4px 0; font-size: 0.85rem; color: #64748b;">
            ${lat.toFixed(5)}, ${lng.toFixed(5)}
          </p>
        </div>
      `);

    return this.userMarker;
  }

  addMarker(lat: number, lng: number, options: any = {}) {
    if (!this.map) return null;

    const icon = this.getStatusIcon(options.status);
    const marker = L.marker([lat, lng], { icon })
      .addTo(this.map)
      .bindPopup(this.createPopupContent(options));

    this.markers.push(marker);

    // Stocker l'ID du signalement
    if (options.id) {
      this.markerData.set(marker, options.id);
    }

    // Ajouter le listener de clic si une callback existe
    if (options.onClickCallback) {
      marker.on('click', () => {
        if (options.id) {
          options.onClickCallback(options.id);
        }
      });
    }

    return marker;
  }

  clearMarkers() {
    this.markers.forEach(m => m.remove());
    this.markers = [];
    this.markerData.clear();
  }

  onMapClick(callback: (lat: number, lng: number) => void) {
    if (!this.map) return;

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      callback(e.latlng.lat, e.latlng.lng);
    });
  }

  onMarkerClick(callback: (signalementId: string) => void) {
    // Cette méthode sera appelée lors de l'ajout de marqueurs
    this.markers.forEach(marker => {
      marker.on('click', () => {
        const id = this.markerData.get(marker);
        if (id) {
          callback(id);
        }
      });
    });
  }

  getMapCenter(): { lat: number, lng: number } {
    if (!this.map) {
      return { lat: 0, lng: 0 };
    }
    const center = this.map.getCenter();
    return { lat: center.lat, lng: center.lng };
  }

  setMapCenter(lat: number, lng: number, zoom?: number) {
    if (!this.map) return;
    this.map.setView([lat, lng], zoom || this.map.getZoom());
  }

  private getStatusIcon(status: string) {
    const colors = {
      nouveau: '#FFB74D',
      en_cours: '#64B5F6',
      termine: '#81C784',
      annule: '#E57373'
    };

    const color = colors[status as keyof typeof colors] || '#999';
    
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white;"></div>`,
      className: 'custom-marker',
      iconSize: [25, 25]
    });
  }

  private createPopupContent(data: any) {
    return `
      <div class="p-2">
        <p class="font-bold">${data.titre || data.status || 'N/A'}</p>
        <p>Date: ${new Date(data.date).toLocaleDateString()}</p>
        <p class="text-sm text-gray-600">Cliquez pour voir les détails</p>
      </div>
    `;
  }
}

export default new MapService();