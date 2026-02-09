import { Geolocation } from '@capacitor/geolocation';
import { environment } from '@/environments/environment';

class GeolocationService {
  async requestPermissions() {
    try {
      const permission = await Geolocation.requestPermissions();
      console.log('Permission GPS accordée:', permission);
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
        console.warn('Permission de géolocalisation refusée, utilisation de la position par défaut (Antananarivo)');
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
      console.warn('Erreur de géolocalisation, utilisation de la position par défaut (Antananarivo)', error);
      return this.getDefaultLocation();
    }
  }

  getDefaultLocation() {
    return {
      lat: environment.defaultLocation.lat,
      lng: environment.defaultLocation.lng
    };
  }
}

export default new GeolocationService();