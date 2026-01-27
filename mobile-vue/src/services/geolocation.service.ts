import { Geolocation } from '@capacitor/geolocation';
import { environment } from '@/environments/environment';

class GeolocationService {
  async requestPermissions() {
    try {
      const permission = await Geolocation.requestPermissions();
      return permission.location === 'granted';
    } catch (error) {
      console.error('Permission GPS refusée', error);
      return false;
    }
  }

  async getCurrentPosition() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return this.getDefaultLocation();
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (error) {
      console.warn('Géolocalisation échouée, utilisation position par défaut', error);
      return this.getDefaultLocation();
    }
  }

  private getDefaultLocation() {
    return {
      lat: environment.defaultLocation.lat,
      lng: environment.defaultLocation.lng
    };
  }
}

export default new GeolocationService();