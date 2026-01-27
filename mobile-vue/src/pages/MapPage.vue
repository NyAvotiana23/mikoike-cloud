<template>
  <ion-page>
    <app-header title="Carte des Travaux"></app-header>
    
    <!-- Database Status Chip -->
    <database-status-chip />
    
    <ion-content>
      <!-- Filtre pour afficher mes signalements uniquement -->
      <div class="p-4 bg-white shadow-md">
        <ion-toggle v-model="showOnlyMine">
          Mes signalements uniquement
        </ion-toggle>
      </div>

      <!-- Container Carte -->
      <div id="map" class="h-full"></div>

      <!-- FAB pour signaler un problème -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="primary" @click="reportIssue">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { 
  IonPage, 
  IonContent, 
  IonFab, 
  IonFabButton, 
  IonIcon, 
  IonToggle, 
  alertController, 
  toastController 
} from '@ionic/vue';
import { add } from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import DatabaseStatusChip from '@/components/DatabaseStatusChip.vue';
import mapService from '@/services/map.service';
import geolocationService from '@/services/geolocation.service';
import signalementsService from '@/services/signalements.service.hybrid';
import { useAuth } from '@/services/auth.service.hybrid';

const { currentUser } = useAuth();
const showOnlyMine = ref(false);
const signalements = ref<any[]>([]);

onMounted(async () => {
  mapService.initMap('map');
  await loadSignalements();
});

const loadSignalements = async () => {
  if (showOnlyMine.value && currentUser.value) {
    signalements.value = signalementsService.getAll(currentUser.value.id);
  } else {
    signalements.value = signalementsService.getAll();
  }
  displayMarkers();
};

const displayMarkers = () => {
  mapService.clearMarkers();
  signalements.value.forEach(sig => {
    if (sig.location) {
      mapService.addMarker(sig.location.lat, sig.location.lng, {
        status: sig.status,
        date: sig.date,
        surface: sig.surface,
        budget: sig.budget,
        entreprise: sig.entreprise
      });
    }
  });
};

const reportIssue = async () => {
  const position = await geolocationService.getCurrentPosition();
  
  const alert = await alertController.create({
    header: 'Nouveau Signalement',
    message: `Créer un signalement à cette position ?<br>Lat: ${position.lat.toFixed(5)}, Lng: ${position.lng.toFixed(5)}`,
    buttons: [
      { text: 'Annuler', role: 'cancel' },
      { 
        text: 'Confirmer',
        handler: async () => {
          await saveSignalement(position);
        }
      }
    ]
  });
  await alert.present();
};

const saveSignalement = async (position: { lat: number, lng: number }) => {
  if (!currentUser.value) return;

  try {
    await signalementsService.create({
      userId: currentUser.value.id,
      location: position,
      date: new Date().toISOString(),
      status: 'nouveau',
      surface: 0,
      budget: 0,
      entreprise: '',
      description: ''
    });

    await loadSignalements(); // Recharger les signalements

    const toast = await toastController.create({
      message: 'Signalement créé avec succès !',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde', error);
    
    const toast = await toastController.create({
      message: 'Erreur lors de la création du signalement',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }
};

watch(showOnlyMine, () => {
  loadSignalements();
});
</script>

<style scoped>
#map {
  width: 100%;
  height: calc(100vh - 160px);
}
</style>
