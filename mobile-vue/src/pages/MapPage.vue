<template>
  <ion-page>
    <app-header title="Carte des Travaux"></app-header>
    
    <ion-content>
      <!-- Filtre pour utilisateurs connectés -->
      <div v-if="isAuthenticated" class="filter-bar">
        <ion-toggle v-model="showOnlyMine">
          Mes signalements uniquement
        </ion-toggle>
      </div>

      <!-- Message pour visiteurs -->
      <div v-else class="visitor-message">
        <div class="message-content">
          <ion-icon :icon="informationCircle" class="message-icon"></ion-icon>
          <span>Mode visiteur : vous pouvez voir les signalements. Connectez-vous pour en ajouter.</span>
        </div>
      </div>

      <!-- Container Carte -->
      <div id="map" class="map-container"></div>

      <!-- FAB pour signaler (uniquement utilisateurs connectés) -->
      <ion-fab v-if="isAuthenticated" vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="primary" @click="reportIssue">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <!-- Modal détails signalement -->
    <ion-modal :is-open="showDetailsModal" @didDismiss="closeDetailsModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Détails du signalement</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeDetailsModal">Fermer</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding" v-if="selectedSignalement">
        <div class="details-container">
          <h2 class="details-title">
            {{ selectedSignalement.titre || 'Signalement #' + selectedSignalement.id.slice(0, 8) }}
          </h2>

          <ion-badge :color="getStatusColor(selectedSignalement.status)" class="status-badge">
            {{ getStatusLabel(selectedSignalement.status) }}
          </ion-badge>

          <div class="detail-section">
            <div class="detail-row">
              <ion-icon :icon="calendarOutline" class="detail-icon"></ion-icon>
              <span>{{ formatDate(selectedSignalement.date) }}</span>
            </div>

            <div class="detail-row" v-if="selectedSignalement.priorite">
              <ion-icon :icon="flagOutline" class="detail-icon"></ion-icon>
              <span>{{ getPriorityLabel(selectedSignalement.priorite) }}</span>
            </div>

            <div class="detail-row">
              <ion-icon :icon="locationOutline" class="detail-icon"></ion-icon>
              <span>{{ selectedSignalement.location.lat.toFixed(5) }}, {{ selectedSignalement.location.lng.toFixed(5) }}</span>
            </div>

            <div class="detail-row" v-if="selectedSignalement.entreprise">
              <ion-icon :icon="businessOutline" class="detail-icon"></ion-icon>
              <span>{{ selectedSignalement.entreprise }}</span>
            </div>

            <div class="detail-row">
              <ion-icon :icon="resizeOutline" class="detail-icon"></ion-icon>
              <span>Surface : {{ selectedSignalement.surface }} m²</span>
            </div>

            <div class="detail-row">
              <ion-icon :icon="cashOutline" class="detail-icon"></ion-icon>
              <span>Budget : {{ formatCurrency(selectedSignalement.budget) }}</span>
            </div>
          </div>

          <div v-if="selectedSignalement.description" class="description-section">
            <h3 class="description-title">Description</h3>
            <p>{{ selectedSignalement.description }}</p>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Modal ajout signalement -->
    <ion-modal :is-open="showAddModal" @didDismiss="closeAddModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Nouveau Signalement</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeAddModal">Annuler</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <form @submit.prevent="saveSignalement" class="add-form">
          <ion-item class="form-item">
            <ion-label position="floating">Titre</ion-label>
            <ion-input v-model="newSignalement.titre" required></ion-input>
          </ion-item>

          <ion-item class="form-item">
            <ion-label position="floating">Description</ion-label>
            <ion-textarea v-model="newSignalement.description" rows="3"></ion-textarea>
          </ion-item>

          <ion-item class="form-item">
            <ion-label>Priorité</ion-label>
            <ion-select v-model="newSignalement.priorite">
              <ion-select-option value="basse">Basse</ion-select-option>
              <ion-select-option value="moyenne">Moyenne</ion-select-option>
              <ion-select-option value="haute">Haute</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item class="form-item">
            <ion-label position="floating">Surface (m²)</ion-label>
            <ion-input v-model.number="newSignalement.surface" type="number" required></ion-input>
          </ion-item>

          <ion-item class="form-item">
            <ion-label position="floating">Budget (€)</ion-label>
            <ion-input v-model.number="newSignalement.budget" type="number" required></ion-input>
          </ion-item>

          <ion-item class="form-item">
            <ion-label position="floating">Entreprise</ion-label>
            <ion-input v-model="newSignalement.entreprise"></ion-input>
          </ion-item>

          <ion-button expand="block" type="submit" class="submit-button">
            Créer le signalement
          </ion-button>
        </form>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
  IonPage, IonContent, IonFab, IonFabButton, IonIcon, IonModal,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonItem,
  IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption,
  IonBadge, IonToggle, toastController
} from '@ionic/vue';
import {
  add, informationCircle, calendarOutline, flagOutline, locationOutline,
  businessOutline, resizeOutline, cashOutline
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import { useUserContext } from '@/services/user-context.service';
import signalementsService from '@/services/signalements.service';
import mapService from '@/services/map.service';

const { isAuthenticated, userContext } = useUserContext();

const signalements = ref<any[]>([]);
const showOnlyMine = ref(false);
const showDetailsModal = ref(false);
const showAddModal = ref(false);
const selectedSignalement = ref<any>(null);
const clickedPosition = ref<any>(null);

const newSignalement = ref({
  titre: '',
  description: '',
  priorite: 'moyenne',
  surface: 0,
  budget: 0,
  entreprise: ''
});

onMounted(async () => {
  await mapService.initMap('map');
  loadSignalements();
  
  mapService.onMarkerClick((markerId: string) => {
    const sig = signalements.value.find(s => s.id === markerId);
    if (sig) {
      selectedSignalement.value = sig;
      showDetailsModal.value = true;
    }
  });
});

const loadSignalements = () => {
  if (showOnlyMine.value && userContext.value.userId) {
    signalements.value = signalementsService.getAll(userContext.value.userId);
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
        id: sig.id,
        status: sig.status,
        titre: sig.titre
      });
    }
  });
};

const reportIssue = () => {
  const center = mapService.getMapCenter();
  clickedPosition.value = center;
  showAddModal.value = true;
};

const saveSignalement = async () => {
  if (!userContext.value.userId || !clickedPosition.value) return;

  try {
    signalementsService.create({
      userId: userContext.value.userId,
      location: clickedPosition.value,
      date: new Date().toISOString(),
      status: 'nouveau',
      titre: newSignalement.value.titre,
      description: newSignalement.value.description,
      priorite: newSignalement.value.priorite as any,
      surface: newSignalement.value.surface,
      budget: newSignalement.value.budget,
      entreprise: newSignalement.value.entreprise
    });

    loadSignalements();

    const toast = await toastController.create({
      message: 'Signalement créé avec succès !',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    closeAddModal();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde', error);
  }
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedSignalement.value = null;
};

const closeAddModal = () => {
  showAddModal.value = false;
  clickedPosition.value = null;
  newSignalement.value = {
    titre: '',
    description: '',
    priorite: 'moyenne',
    surface: 0,
    budget: 0,
    entreprise: ''
  };
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    nouveau: 'primary',
    en_cours: 'warning',
    termine: 'success',
    annule: 'danger'
  };
  return colors[status] || 'medium';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    nouveau: 'Nouveau',
    en_cours: 'En cours',
    termine: 'Terminé',
    annule: 'Annulé'
  };
  return labels[status] || status;
};

const getPriorityLabel = (priorite: string) => {
  const labels: Record<string, string> = {
    basse: 'Priorité basse',
    moyenne: 'Priorité moyenne',
    haute: 'Priorité haute'
  };
  return labels[priorite] || priorite;
};

watch(showOnlyMine, () => {
  loadSignalements();
});
</script>

<style scoped>
/* Filter Bar */
.filter-bar {
  padding: 1rem;
  background: white;
  color: #1f2937;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Visitor Message */
.visitor-message {
  padding: 1rem;
  background: #eff6ff;
  border-bottom: 2px solid #bfdbfe;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1e40af;
  font-size: 0.875rem;
}

.message-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

/* Map Container */
.map-container {
  width: 100%;
  height: calc(100vh - 160px);
}

/* Details Modal */
.details-container {
  padding: 1rem;
}

.details-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.status-badge {
  margin-bottom: 1.5rem;
}

.detail-section {
  margin: 1.5rem 0;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-icon {
  font-size: 1.5rem;
  color: #0ea5e9;
}

.description-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.description-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

/* Add Form */
.add-form {
  padding: 1rem 0;
}

.form-item {
  margin-bottom: 1rem;
  --background: #f8f9fa;
  --border-radius: 12px;
}

.submit-button {
  --border-radius: 12px;
  height: 56px;
  margin-top: 1rem;
  font-weight: 600;
}
</style>