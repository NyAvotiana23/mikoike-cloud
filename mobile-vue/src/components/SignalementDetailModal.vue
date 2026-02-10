<template>
  <!-- Modal détails signalement -->
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')" class="details-modal">
    <ion-header>
      <ion-toolbar>
        <ion-title>Détails du signalement </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Fermer</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" v-if="signalement">
      <div class="details-container">
        <h2 class="details-title">
          {{ signalement.titre || 'Signalement #' + signalement.id.slice(0, 8) }}
        </h2>

        <div class="badges-row">
          <ion-badge :color="getStatusColor(signalement.status)" class="status-badge">
            {{ getStatusLabel(signalement.status) }}
          </ion-badge>
          <ion-badge v-if="signalement.priorite" :color="getPriorityColor(signalement.priorite)">
            {{ getPriorityLabel(signalement.priorite) }}
          </ion-badge>
        </div>

        <!-- Section Photos -->
        <div class="photos-section">
          <h3 class="section-title">
            <ion-icon :icon="imagesOutline"></ion-icon>
            Photos ({{ allPhotos.length }})
            <ion-spinner v-if="loadingPhotos" name="crescent" class="photos-spinner"></ion-spinner>
          </h3>
          <div v-if="allPhotos.length > 0" class="photos-grid">
            <div
              v-for="(photo, index) in allPhotos"
              :key="index"
              class="photo-thumbnail"
              @click="openPhotoViewer(index)"
            >
              <img :src="photo" :alt="`Photo ${index + 1}`" />
              <div class="photo-overlay">
                <ion-icon :icon="expandOutline"></ion-icon>
              </div>
            </div>
          </div>
          <p v-else-if="!loadingPhotos" class="no-photos-text">Aucune photo disponible</p>
        </div>

        <div class="detail-section">
          <div class="detail-row">
            <ion-icon :icon="calendarOutline" class="detail-icon"></ion-icon>
            <span>{{ formatDate(signalement.date) }}</span>
          </div>

          <div class="detail-row">
            <ion-icon :icon="locationOutline" class="detail-icon"></ion-icon>
            <span>{{ signalement.location.lat.toFixed(5) }}, {{ signalement.location.lng.toFixed(5) }}</span>
          </div>

          <div class="detail-row" v-if="signalement.entreprise">
            <ion-icon :icon="businessOutline" class="detail-icon"></ion-icon>
            <span>{{ signalement.entreprise }}</span>
          </div>

          <div class="detail-row">
            <ion-icon :icon="resizeOutline" class="detail-icon"></ion-icon>
            <span>Surface : {{ signalement.surface }} m²</span>
          </div>

          <div class="detail-row">
            <ion-icon :icon="cashOutline" class="detail-icon"></ion-icon>
            <span>Budget : {{ formatCurrency(signalement.budget) }}</span>
          </div>
        </div>

        <div v-if="signalement.description" class="description-section">
          <h3 class="section-title">Description</h3>
          <p>{{ signalement.description }}</p>
        </div>

        <!-- Actions optionnelles -->
        <div v-if="showActions" class="modal-actions">
          <ion-button expand="block" @click="$emit('viewOnMap', signalement)">
            <ion-icon slot="start" :icon="mapOutline"></ion-icon>
            Voir sur la carte
          </ion-button>
          <ion-button v-if="showEditButton" expand="block" fill="outline" @click="$emit('edit', signalement)">
            <ion-icon slot="start" :icon="createOutline"></ion-icon>
            Modifier
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-modal>

  <!-- Modal visionneuse de photos -->
  <ion-modal :is-open="showPhotoViewer" @didDismiss="closePhotoViewer" class="photo-viewer-modal">
    <ion-header>
      <ion-toolbar color="dark">
        <ion-title>Photo {{ currentPhotoIndex + 1 }} / {{ allPhotos.length }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closePhotoViewer" color="light">
            <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="photo-viewer-content">
      <div class="photo-viewer-container" v-if="allPhotos.length > 0">
        <ion-button
          v-if="currentPhotoIndex > 0"
          fill="clear"
          class="nav-btn nav-prev"
          @click="prevPhoto"
        >
          <ion-icon :icon="chevronBackOutline" slot="icon-only"></ion-icon>
        </ion-button>

        <img
          :src="allPhotos[currentPhotoIndex]"
          class="fullscreen-photo"
          :alt="`Photo ${currentPhotoIndex + 1}`"
        />

        <ion-button
          v-if="currentPhotoIndex < allPhotos.length - 1"
          fill="clear"
          class="nav-btn nav-next"
          @click="nextPhoto"
        >
          <ion-icon :icon="chevronForwardOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonBadge, IonIcon, IonSpinner
} from '@ionic/vue';
import {
  calendarOutline, locationOutline, businessOutline, resizeOutline,
  cashOutline, imagesOutline, expandOutline, chevronBackOutline,
  chevronForwardOutline, closeOutline, mapOutline, createOutline
} from 'ionicons/icons';
import type { Signalement } from '@/types/signalement';
import type { PhotoSignalement } from '@/types/photo-signalement';
import photoSignalementService from '@/services/photo-signalement.service';


interface Props {
  isOpen: boolean;
  signalement: Signalement | null;
  showActions?: boolean;
  showEditButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  showEditButton: false
});



defineEmits<{
  (e: 'close'): void;
  (e: 'viewOnMap', signalement: Signalement): void;
  (e: 'edit', signalement: Signalement): void;
}>();

// Photo viewer state
const showPhotoViewer = ref(false);
const currentPhotoIndex = ref(0);

// Photos from Firebase
const photosFromFirebase = ref<PhotoSignalement[]>([]);
const loadingPhotos = ref(false);

// Computed pour combiner les photos locales et Firebase
const allPhotos = computed(() => {
  // Priorité aux photos Firebase si disponibles
  if (photosFromFirebase.value.length > 0) {
    return photosFromFirebase.value.map(p => p.url);
  }
  // Sinon utiliser les photos du signalement
  return props.signalement?.photos || [];
});

// Watcher pour charger les photos quand le modal s'ouvre
watch(
  () => ({ isOpen: props.isOpen, signalementId: props.signalement?.id }),
  async ({ isOpen, signalementId }) => {
    if (isOpen && signalementId) {
      await loadPhotosFromFirebase(signalementId);
    } else if (!isOpen) {
      // Reset quand le modal se ferme
      photosFromFirebase.value = [];
    }
  },
  { immediate: true }
);

// Charger les photos depuis Firebase
async function loadPhotosFromFirebase(signalementId: string) {
  loadingPhotos.value = true;
  try {
    const photos = await photoSignalementService.loadPhotosForSignalement(signalementId);
    photosFromFirebase.value = photos;
    console.log(`✅ ${photos.length} photos chargées depuis Firebase`);
  } catch (error) {
    console.error('❌ Erreur chargement photos:', error);
    // Fallback vers les photos du signalement
    photosFromFirebase.value = [];
  } finally {
    loadingPhotos.value = false;
  }
}

// Photo viewer functions
const openPhotoViewer = (index: number) => {
  currentPhotoIndex.value = index;
  showPhotoViewer.value = true;
};

const closePhotoViewer = () => {
  showPhotoViewer.value = false;
};

const prevPhoto = () => {
  if (currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--;
  }
};

const nextPhoto = () => {
  if (currentPhotoIndex.value < allPhotos.value.length - 1) {
    currentPhotoIndex.value++;
  }
};

// Utility functions
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

const getPriorityColor = (priorite: string) => {
  const colors: Record<string, string> = {
    basse: 'success',
    moyenne: 'warning',
    haute: 'danger'
  };
  return colors[priorite] || 'medium';
};

const getPriorityLabel = (priorite: string) => {
  const labels: Record<string, string> = {
    basse: 'Priorité basse',
    moyenne: 'Priorité moyenne',
    haute: 'Priorité haute'
  };
  return labels[priorite] || priorite;
};
</script>

<style scoped>
/* Details Modal */
.details-modal {
  --height: 90%;
}

.details-container {
  padding: 1rem;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.details-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem 0;
}

.badges-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.status-badge {
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

/* Photos Section */
.photos-section {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.photos-spinner {
  --color: #0ea5e9;
  width: 18px;
  height: 18px;
  margin-left: 0.5rem;
}

.no-photos-text {
  color: #6b7280;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
  margin: 0;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
}

.photo-thumbnail {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.photo-thumbnail:hover img {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-thumbnail:hover .photo-overlay {
  opacity: 1;
}

.photo-overlay ion-icon {
  color: white;
  font-size: 1.5rem;
}

.detail-section {
  margin: 1.5rem 0;
  background: #ffffff;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  font-size: 0.95rem;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-icon {
  font-size: 1.5rem;
  color: #0ea5e9;
  flex-shrink: 0;
}

.description-section {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.description-section p {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

/* Modal Actions */
.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-actions ion-button {
  --border-radius: 12px;
  font-weight: 600;
}

/* Photo Viewer Modal */
.photo-viewer-modal {
  --background: #000000;
}

.photo-viewer-content {
  --background: #000000;
}

.photo-viewer-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
}

.fullscreen-photo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  --color: white;
  font-size: 2rem;
}

.nav-prev {
  left: 10px;
}

.nav-next {
  right: 10px;
}
</style>
