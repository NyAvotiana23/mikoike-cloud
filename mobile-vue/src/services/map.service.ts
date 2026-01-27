import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { environment } from '@/environments/environment';

class MapService {
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

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
    return marker;
  }

  clearMarkers() {
    this.markers.forEach(m => m.remove());
    this.markers = [];
  }

  private getStatusIcon(status: string) {
    const colors = {
      nouveau: '#FFB74D',
      en_cours: '#64B5F6',
      termine: '#81C784'
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
        <p class="font-bold">${data.status || 'N/A'}</p>
        <p>Date: ${new Date(data.date).toLocaleDateString()}</p>
        <p>Surface: ${data.surface} m²</p>
        <p>Budget: ${data.budget} Ar</p>
        <p>Entreprise: ${data.entreprise || 'N/A'}</p>
      </div>
    `;
  }
}

export default new MapService();