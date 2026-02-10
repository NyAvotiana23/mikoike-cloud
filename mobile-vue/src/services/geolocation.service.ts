import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { environment } from '@/environments/environment';

class GeolocationService {
  // Détecte si on est sur une plateforme native ou web
  private isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  async requestPermissions() {
    try {
      if (this.isNative()) {
        // Sur mobile natif, utiliser Capacitor
        const permission = await Geolocation.requestPermissions();
        console.log('Permission GPS accordée:', permission);
        return permission.location === 'granted';
      } else {
        // Sur le web, vérifier si l'API de géolocalisation est disponible
        if ('geolocation' in navigator) {
          console.log('API de géolocalisation du navigateur disponible');
          return true;
        } else {
          console.error('API de géolocalisation non disponible dans ce navigateur');
          return false;
        }
      }
    } catch (error) {
      console.error('Permission GPS refusée', error);
      return false;
    }
  }

  async getCurrentPosition() {
    try {
      if (this.isNative()) {
        // Sur mobile natif, utiliser Capacitor
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
      } else {
        // Sur le web, utiliser l'API navigator.geolocation
        return new Promise<{ lat: number, lng: number }>((resolve, reject) => {
          if (!('geolocation' in navigator)) {
            console.warn('Géolocalisation non disponible, utilisation de la position par défaut');
            resolve(this.getDefaultLocation());
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Position obtenue via navigateur:', position.coords);
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => {
              console.warn('Erreur de géolocalisation (web):', error.message);
              console.warn('Utilisation de la position par défaut (Antananarivo)');
              resolve(this.getDefaultLocation());
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });
      }
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