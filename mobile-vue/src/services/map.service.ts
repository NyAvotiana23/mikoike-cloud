import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { environment } from '@/environments/environment';

class MapService {
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private markerData: Map<L.Marker, string> = new Map(); // Associe markers aux IDs

  initMap(containerId: string) {
    if (this.map) {
      this.map.remove();
    }

    const { lat, lng, zoom } = environment.defaultLocation;
    
    this.map = L.map(containerId).setView([lat, lng], zoom);

    L.tileLayer(environment.osm.tileUrl, {
      attribution: environment.osm.attribution,
      maxZoom: 19
    }).addTo(this.map);

    return this.map;
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