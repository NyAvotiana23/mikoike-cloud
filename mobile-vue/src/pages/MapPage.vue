<template>
  <ion-page>

    <ion-content :fullscreen="true" class="map-content">
      <!-- Container principal avec positionnement relatif -->
      <div class="map-page-container">
        <!-- Filtre pour utilisateurs connectés -->
        <div v-if="isAuthenticated" class="filter-bar">
          <div class="filter-tabs">
            <button
              class="filter-tab"
              :class="{ active: !showOnlyMine && !filterStatus }"
              @click="toggleAllReports"
            >
              <ion-icon :icon="globeOutline" class="tab-icon"></ion-icon>
              <span>Tous les signalements</span>
            </button>
            <button
              class="filter-tab"
              :class="{ active: showOnlyMine }"
              @click="toggleMyReports"
            >
              <ion-icon :icon="personOutline" class="tab-icon"></ion-icon>
              <span>Mes signalements</span>
            </button>
          </div>

          <!-- Filtres de statut (visible uniquement dans "Tous les signalements") -->
          <div v-if="!showOnlyMine" class="status-filters">
            <button
              class="status-filter-btn"
              :class="{ active: !filterStatus }"
              @click="setStatusFilter(null)"
            >
              Tous
            </button>
            <button
              class="status-filter-btn nouveau"
              :class="{ active: filterStatus === 'nouveau' }"
              @click="setStatusFilter('nouveau')"
            >
              Nouveau
            </button>
            <button
              class="status-filter-btn en-cours"
              :class="{ active: filterStatus === 'en_cours' }"
              @click="setStatusFilter('en_cours')"
            >
              En cours
            </button>
            <button
              class="status-filter-btn termine"
              :class="{ active: filterStatus === 'termine' }"
              @click="setStatusFilter('termine')"
            >
              Terminé
            </button>
          </div>
        </div>

        <!-- Message pour visiteurs -->
        <div v-else class="visitor-message">
          <div class="message-content">
            <ion-icon :icon="informationCircle" class="message-icon"></ion-icon>
            <span>Mode visiteur : vous pouvez voir les signalements. Connectez-vous pour en ajouter.</span>
          </div>
        </div>

        <!-- Container Carte -->
        <div class="map-wrapper">
          <div id="map" class="map-container"></div>

          <!-- Message instruction pour le mode ajout (overlay sur la carte) -->
          <div v-if="isAddingReport" class="add-mode-banner">
            <div class="banner-content">
              <ion-icon :icon="locationOutline" class="banner-icon"></ion-icon>
              <span>Cliquez sur la carte pour placer votre rapport</span>
              <ion-button size="small" fill="clear" color="light" @click="cancelAddMode">
                <ion-icon :icon="close" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </div>

          <!-- Quick Info Panel pour signalement sélectionné -->
          <div v-if="quickInfoSignalement && !showDetailsModal" class="quick-info-panel">
            <div class="quick-info-header">
              <h3>{{ quickInfoSignalement.titre || 'Signalement #' + quickInfoSignalement.id.slice(0, 8) }}</h3>
              <ion-button size="small" fill="clear" @click="closeQuickInfo">
                <ion-icon :icon="close" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
            <div class="quick-info-content">
              <ion-badge :color="getStatusColor(quickInfoSignalement.status)" class="quick-badge">
                {{ getStatusLabel(quickInfoSignalement.status) }}
              </ion-badge>
              <span class="quick-date">{{ formatDate(quickInfoSignalement.date) }}</span>
            </div>
            <div class="quick-info-actions">
              <ion-button expand="block" size="small" @click="openDetailsFromQuickInfo">
                <ion-icon slot="start" :icon="eyeOutline"></ion-icon>
                Voir les détails
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <!-- FAB pour les actions (uniquement utilisateurs connectés) -->
      <div v-if="isAuthenticated" class="fab-container">
        <ion-fab-button
          :color="isAddingReport ? 'success' : 'primary'"
          @click="toggleAddMode"
          class="main-fab"
        >
          <ion-icon :icon="isAddingReport ? checkmark : add"></ion-icon>
        </ion-fab-button>
      </div>
    </ion-content>

    <!-- Modal détails signalement -->
    <SignalementDetailModal
      :is-open="showDetailsModal"
      :signalement="selectedSignalement"
      @close="closeDetailsModal"
    />

    <!-- Modal ajout signalement -->
    <ion-modal :is-open="showAddModal" @didDismiss="closeAddModal" class="add-modal">
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
          <!-- Localisation (en haut) -->
          <div class="form-group location-info">
            <label class="form-label-black">
              <ion-icon :icon="locationOutline"></ion-icon>
              Localisation sélectionnée
            </label>
            <div class="location-display">
              <span v-if="clickedPosition" >
                <ion-icon :icon="checkmarkCircle" color="success"></ion-icon>
                {{ clickedPosition.lat.toFixed(6) }}, {{ clickedPosition.lng.toFixed(6) }}
              </span>
              <span v-else class="no-location">
                <ion-icon :icon="alertCircle" color="danger"></ion-icon>
                Position non définie
              </span>
            </div>
          </div>

          <!-- Titre -->
          <div class="form-group">
            <label class="form-label">Titre *</label>
            <ion-input
              v-model="newSignalement.titre"
              placeholder="Ex: Rénovation trottoir rue principale"
              class="form-input"
              required
            ></ion-input>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">Description</label>
            <ion-textarea
              v-model="newSignalement.description"
              placeholder="Décrivez le signalement en détail..."
              :rows="4"
              class="form-textarea"
            ></ion-textarea>
          </div>

          <!-- Section Upload Photo -->
          <div class="form-group">
            <label class="form-label">
              <ion-icon :icon="imagesOutline"></ion-icon>
              Photos ({{ newSignalement.photos.length }}/10)
            </label>
            <div class="photo-upload-section">
              <div class="photo-buttons">
                <ion-button
                  expand="block"
                  fill="outline"
                  @click="takePhoto"
                  type="button"
                  size="small"
                  :disabled="newSignalement.photos.length >= 10"
                >
                  <ion-icon slot="start" :icon="cameraOutline"></ion-icon>
                  Prendre photo
                </ion-button>
                <ion-button
                  expand="block"
                  fill="outline"
                  @click="uploadPhoto"
                  type="button"
                  size="small"
                  :disabled="newSignalement.photos.length >= 10"
                >
                  <ion-icon slot="start" :icon="imagesOutline"></ion-icon>
                  Galerie
                </ion-button>
              </div>

              <!-- Aperçu des photos -->
              <div v-if="newSignalement.photos.length > 0" class="photo-preview-grid">
                <div v-for="(photo, index) in newSignalement.photos" :key="index" class="photo-preview-item">
                  <img :src="photo" :alt="`Photo ${index + 1}`" class="preview-image" />
                  <div class="photo-number">{{ index + 1 }}</div>
                  <ion-button
                    size="small"
                    color="danger"
                    fill="solid"
                    class="remove-photo-btn"
                    @click="removePhoto(index)"
                    type="button"
                  >
                    <ion-icon slot="icon-only" :icon="closeCircle"></ion-icon>
                  </ion-button>
                </div>
              </div>
              <p v-else class="photo-hint">
                <ion-icon :icon="cameraOutline"></ion-icon>
                Ajoutez jusqu'à 10 photos pour illustrer votre signalement
              </p>
            </div>
          </div>

          <!-- Priorité -->
          <div class="form-group">
            <label class="form-label">Priorité</label>
            <div class="priority-selector">
              <button
                type="button"
                class="priority-btn"
                :class="{ active: newSignalement.priorite === 'basse', 'priority-low': newSignalement.priorite === 'basse' }"
                @click="newSignalement.priorite = 'basse'"
              >
                <ion-icon :icon="flagOutline"></ion-icon>
                Basse
              </button>
              <button
                type="button"
                class="priority-btn"
                :class="{ active: newSignalement.priorite === 'moyenne', 'priority-medium': newSignalement.priorite === 'moyenne' }"
                @click="newSignalement.priorite = 'moyenne'"
              >
                <ion-icon :icon="flagOutline"></ion-icon>
                Moyenne
              </button>
              <button
                type="button"
                class="priority-btn"
                :class="{ active: newSignalement.priorite === 'haute', 'priority-high': newSignalement.priorite === 'haute' }"
                @click="newSignalement.priorite = 'haute'"
              >
                <ion-icon :icon="flagOutline"></ion-icon>
                Haute
              </button>
            </div>
          </div>

          <!-- Surface et Budget côte à côte -->
          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">
                <ion-icon :icon="resizeOutline"></ion-icon>
                Surface (m²) *
              </label>
              <ion-input
                v-model.number="newSignalement.surface"
                type="number"
                placeholder="0"
                class="form-input"
                min="0"
                required
              ></ion-input>
            </div>

            <div class="form-group half">
              <label class="form-label">
                <ion-icon :icon="cashOutline"></ion-icon>
                Budget (€) *
              </label>
              <ion-input
                v-model.number="newSignalement.budget"
                type="number"
                placeholder="0"
                class="form-input"
                min="0"
                required
              ></ion-input>
            </div>
          </div>

          <!-- Entreprise -->
          <div class="form-group">
            <label class="form-label">
              <ion-icon :icon="businessOutline"></ion-icon>
              Entreprise (optionnel)
            </label>
            <ion-input
              v-model="newSignalement.entreprise"
              placeholder="Nom de l'entreprise assignée"
              class="form-input"
            ></ion-input>
          </div>

          <!-- Boutons d'action -->
          <div class="form-actions">
            <ion-button expand="block" fill="outline" @click="closeAddModal" type="button" class="cancel-button">
              <ion-icon slot="start" :icon="close"></ion-icon>
              Annuler
            </ion-button>
            <ion-button expand="block" type="submit" class="submit-button" :disabled="!isFormValid">
              <ion-icon slot="start" :icon="checkmark"></ion-icon>
              Créer le signalement
            </ion-button>
          </div>
        </form>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonContent, IonFabButton, IonIcon, IonModal,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonInput,
  IonTextarea, IonBadge, toastController
} from '@ionic/vue';
import {
  add, informationCircle, calendarOutline, flagOutline, locationOutline,
  businessOutline, resizeOutline, cashOutline, checkmark, close,
  globeOutline, personOutline, cameraOutline, imagesOutline, closeCircle,
  checkmarkCircle, alertCircle, eyeOutline
} from 'ionicons/icons';
import SignalementDetailModal from '@/components/SignalementDetailModal.vue';
import { useUserContext } from '@/services/user-context.service';
import signalementsService from '@/services/signalements.service.firebase';
import mapService from '@/services/map.service';
import geolocationService from '@/services/geolocation.service';

const route = useRoute();
const { isAuthenticated, userContext } = useUserContext();

const signalements = ref<any[]>([]);
const allSignalements = ref<any[]>([]);
const showOnlyMine = ref(false);
const filterStatus = ref<string | null>(null);
const showDetailsModal = ref(false);
const showAddModal = ref(false);
const selectedSignalement = ref<any>(null);
const clickedPosition = ref<any>(null);
const isAddingReport = ref(false);
const userLocation = ref<{ lat: number, lng: number } | null>(null);

// Quick info panel
const quickInfoSignalement = ref<any>(null);


const newSignalement = ref({
  titre: '',
  description: '',
  priorite: 'moyenne',
  surface: 0,
  budget: 0,
  entreprise: '',
  photos: [] as string[]
});

const isFormValid = computed(() => {
  return newSignalement.value.titre.trim() !== '' &&
         newSignalement.value.surface > 0 &&
         newSignalement.value.budget > 0 &&
         clickedPosition.value !== null;
});

onMounted(async () => {
  try {
    const position = await geolocationService.getCurrentPosition();
    userLocation.value = position;

    await mapService.initMap('map', position.lat, position.lng);

    if (position.lat !== -18.8792 || position.lng !== 47.5079) {
      mapService.addUserMarker(position.lat, position.lng);
      const toast = await toastController.create({
        message: 'Position actuelle détectée',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    } else {
      const toast = await toastController.create({
        message: 'Carte centrée sur Antananarivo',
        duration: 2000,
        color: 'primary',
        position: 'top'
      });
      await toast.present();
    }
  } catch (error) {
    console.error('Erreur de géolocalisation:', error);

    const defaultLocation = geolocationService.getDefaultLocation();
    await mapService.initMap('map', defaultLocation.lat, defaultLocation.lng);

    const toast = await toastController.create({
      message: 'Carte centrée sur Antananarivo',
      duration: 2000,
      color: 'primary',
      position: 'top'
    });
    await toast.present();
  }

  await loadSignalements();

  // Gérer la navigation depuis une autre page (viewOnMap)
  if (route.query.id && route.query.lat && route.query.lng) {
    const signalementId = route.query.id as string;
    const lat = parseFloat(route.query.lat as string);
    const lng = parseFloat(route.query.lng as string);

    // Centrer la carte sur le signalement
    mapService.setMapCenter(lat, lng, 16);

    // Trouver et afficher le signalement
    const sig = signalements.value.find(s => s.id === signalementId);
    if (sig) {
      quickInfoSignalement.value = sig;
    }
  }

  mapService.onMarkerClick((markerId: string) => {
    if (!isAddingReport.value) {
      const sig = signalements.value.find(s => s.id === markerId);
      if (sig) {
        quickInfoSignalement.value = sig;
      }
    }
  });

  mapService.onMapClick((lat: number, lng: number) => {
    if (isAddingReport.value && isAuthenticated.value) {
      clickedPosition.value = { lat, lng };
      showAddModal.value = true;
      isAddingReport.value = false;
    } else {
      // Fermer le quick info si on clique ailleurs sur la carte
      quickInfoSignalement.value = null;
    }
  });
});

const loadSignalements = async () => {
  try {
    // Charger les signalements depuis Firebase
    await signalementsService.loadSignalements();

    if (showOnlyMine.value && userContext.value.userId) {
      allSignalements.value = signalementsService.getAll(userContext.value.userId);
    } else {
      allSignalements.value = signalementsService.getAll();
    }
    applyFilters();
  } catch (error) {
    console.error('Erreur lors du chargement des signalements:', error);

    const toast = await toastController.create({
      message: 'Erreur de chargement des signalements',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

const applyFilters = () => {
  let filtered = [...allSignalements.value];

  if (filterStatus.value) {
    filtered = filtered.filter(sig => sig.status === filterStatus.value);
  }

  signalements.value = filtered;
  displayMarkers();
};

const toggleAllReports = () => {
  showOnlyMine.value = false;
  filterStatus.value = null;
  loadSignalements();
};

const toggleMyReports = () => {
  showOnlyMine.value = true;
  filterStatus.value = null;
  loadSignalements();
};

const setStatusFilter = (status: string | null) => {
  filterStatus.value = status;
  applyFilters();
};

const displayMarkers = () => {
  mapService.clearMarkers();
  signalements.value.forEach(sig => {
    if (sig.location) {
      mapService.addMarker(sig.location.lat, sig.location.lng, {
        id: sig.id,
        status: sig.status,
        titre: sig.titre,
        date: sig.date,
        onClickCallback: (id: string) => {
          if (!isAddingReport.value) {
            const selectedSig = signalements.value.find(s => s.id === id);
            if (selectedSig) {
              quickInfoSignalement.value = selectedSig;
            }
          }
        }
      });
    }
  });
};

const toggleAddMode = () => {
  isAddingReport.value = !isAddingReport.value;
  if (isAddingReport.value) {
    quickInfoSignalement.value = null;
  }
};

const cancelAddMode = () => {
  isAddingReport.value = false;
};

// Quick info functions
const closeQuickInfo = () => {
  quickInfoSignalement.value = null;
};

const openDetailsFromQuickInfo = () => {
  selectedSignalement.value = quickInfoSignalement.value;
  quickInfoSignalement.value = null;
  showDetailsModal.value = true;
};


const takePhoto = async () => {
  try {
    if (newSignalement.value.photos.length >= 10) {
      const toast = await toastController.create({
        message: 'Maximum 10 photos autorisées',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const { Camera } = await import('@capacitor/camera');
    const { CameraResultType, CameraSource } = await import('@capacitor/camera');

    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    if (photo.dataUrl) {
      newSignalement.value.photos.push(photo.dataUrl);
    }
  } catch (error: any) {
    console.error('Erreur lors de la prise de photo:', error);
    if (error.message !== 'User cancelled photos app') {
      const toast = await toastController.create({
        message: 'Erreur lors de la prise de photo',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
};

const uploadPhoto = async () => {
  try {
    if (newSignalement.value.photos.length >= 10) {
      const toast = await toastController.create({
        message: 'Maximum 10 photos autorisées',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const { Camera } = await import('@capacitor/camera');
    const { CameraResultType, CameraSource } = await import('@capacitor/camera');

    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });

    if (photo.dataUrl) {
      newSignalement.value.photos.push(photo.dataUrl);
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'upload de photo:', error);
    if (error.message !== 'User cancelled photos app') {
      const toast = await toastController.create({
        message: 'Erreur lors de l\'upload de photo',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
};

const removePhoto = (index: number) => {
  newSignalement.value.photos.splice(index, 1);
};

const saveSignalement = async () => {
  if (!userContext.value.userId || !clickedPosition.value) return;

  try {
    // Afficher un toast de progression
    const loadingToast = await toastController.create({
      message: 'Création du signalement en cours...',
      duration: 0, // Pas de durée auto
      color: 'primary'
    });
    await loadingToast.present();

    // Séparer les photos base64 des URLs existantes
    const photosToUpload = newSignalement.value.photos.filter(p => p.startsWith('data:'));
    const existingPhotoUrls = newSignalement.value.photos.filter(p => !p.startsWith('data:'));

    // Créer le signalement d'abord (sans les photos base64)
    const signalement = await signalementsService.create({
      userId: userContext.value.userId,
      userEmail: userContext.value.email || '',
      location: clickedPosition.value,
      date: new Date().toISOString(),
      status: 'nouveau',
      titre: newSignalement.value.titre,
      description: newSignalement.value.description,
      priorite: newSignalement.value.priorite as any,
      surface: newSignalement.value.surface,
      budget: newSignalement.value.budget,
      entreprise: newSignalement.value.entreprise,
      photos: existingPhotoUrls, // Seulement les URLs existantes pour l'instant
      adresse: '',
      photoUrl: existingPhotoUrls.length > 0 ? existingPhotoUrls[0] : ''
    });

    // Uploader les photos base64 vers Cloudinary et les sauvegarder dans photo_signalement
    if (photosToUpload.length > 0) {
      loadingToast.message = `Upload des photos (0/${photosToUpload.length})...`;

      const uploadResult = await signalementsService.addPhotosToSignalement(
        signalement.id,
        photosToUpload
      );

      if (uploadResult.errors.length > 0) {
        console.warn('⚠️ Certaines photos n\'ont pas pu être uploadées:', uploadResult.errors);
      }

      // Mettre à jour le signalement avec les URLs des photos
      if (uploadResult.urls.length > 0) {
        signalement.photos = [...existingPhotoUrls, ...uploadResult.urls];
        signalement.photoUrl = signalement.photos[0];
      }
    }

    await loadingToast.dismiss();
    await loadSignalements();

    const toast = await toastController.create({
      message: 'Signalement créé avec succès !',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    closeAddModal();
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
    entreprise: '',
    photos: []
  };
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR');
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


watch(showOnlyMine, () => {
  loadSignalements();
});

watch(filterStatus, () => {
  if (!showOnlyMine.value) {
    applyFilters();
  }
});
</script>

<style scoped>
/* Page Container */
.map-content {
  --padding-top: 0;
  --padding-bottom: 0;
}

.map-page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
}

/* Filter Bar */
.filter-bar {
  padding: 0.75rem 1rem;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #e2e8f0;
  z-index: 500;
  flex-shrink: 0;
}

.filter-tabs {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  margin-bottom: 0.75rem;
}

.filter-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.filter-tab:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.filter-tab.active {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  border-color: #0ea5e9;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.filter-tab .tab-icon {
  font-size: 1.25rem;
}

/* Status Filters */
.status-filters {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  overflow-x: auto;
  padding: 0.25rem 0;
}

.status-filter-btn {
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  white-space: nowrap;
  min-width: fit-content;
}

.status-filter-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.status-filter-btn.active {
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-filter-btn.active:not(.nouveau):not(.en-cours):not(.termine) {
  background: #64748b;
  border-color: #64748b;
}

.status-filter-btn.nouveau.active {
  background: #3b82f6;
  border-color: #3b82f6;
}

.status-filter-btn.en-cours.active {
  background: #f59e0b;
  border-color: #f59e0b;
}

.status-filter-btn.termine.active {
  background: #10b981;
  border-color: #10b981;
}

/* Visitor Message */
.visitor-message {
  padding: 1rem;
  background: #eff6ff;
  border-bottom: 2px solid #bfdbfe;
  z-index: 500;
  flex-shrink: 0;
  position: relative;
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

/* Map Wrapper - Contains map and overlay */
.map-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}

/* Map Container */
.map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

/* Add Mode Banner - Overlay on map */
.add-mode-banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
}

.banner-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

/* Quick Info Panel */
.quick-info-panel {
  position: absolute;
  bottom: 60px;
  left: 16px;
  right: 16px;
  z-index: 200;
  background: white;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.quick-info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.quick-info-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  flex: 1;
  padding-right: 0.5rem;
}

.quick-info-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.quick-badge {
  font-size: 0.8rem;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
}

.quick-date {
  font-size: 0.85rem;
  color: #64748b;
}

.quick-info-actions {
  margin-top: 0.5rem;
}

.quick-info-actions ion-button {
  --border-radius: 10px;
  font-weight: 600;
}

/* FAB Container */
.fab-container {
  position: fixed;
  bottom: 90px;
  right: 16px;
  z-index: 1000;
}

.main-fab {
  --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

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
  color: #1f2937;
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

/* Add Modal */
.add-modal {
  --height: 95%;
}

/* Add Form */
.add-form {
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group.half {
  flex: 1;
}
.form-label-black {
  font-size: 0.9rem;
  font-weight: 600;
  color: black;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-input,
.form-textarea {
  --background: #f8fafc;
  --border-radius: 12px;
  --padding-start: 1rem;
  --padding-end: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
  color: black;
}

.form-input:focus-within,
.form-textarea:focus-within {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

/* Location Info */
.location-info {
  background: #f0fdf4;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid #86efac;
}

.location-display {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: monospace;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color:black;
}

.location-display ion-icon {
  font-size: 1.25rem;
}

.no-location {
  color: #dc2626;
}

/* Priority Selector */
.priority-selector {
  display: flex;
  gap: 0.5rem;
}

.priority-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.priority-btn ion-icon {
  font-size: 1.25rem;
}

.priority-btn:hover {
  background: #f1f5f9;
}

.priority-btn.active {
  color: white;
}

.priority-btn.priority-low.active {
  background: #10b981;
  border-color: #10b981;
}

.priority-btn.priority-medium.active {
  background: #f59e0b;
  border-color: #f59e0b;
}

.priority-btn.priority-high.active {
  background: #ef4444;
  border-color: #ef4444;
}

/* Photo Upload Section */
.photo-upload-section {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 1rem;
}

.photo-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.photo-buttons ion-button {
  --border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
}

.photo-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}

.photo-preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-number {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.remove-photo-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  --padding-start: 4px;
  --padding-end: 4px;
  --border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 1rem;
}

.photo-hint {
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
  margin: 0.5rem 0 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.cancel-button {
  flex: 1;
  --border-radius: 12px;
  height: 48px;
}

.submit-button {
  flex: 2;
  --border-radius: 12px;
  height: 48px;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.25);
}

.submit-button:disabled {
  opacity: 0.6;
}
</style>

