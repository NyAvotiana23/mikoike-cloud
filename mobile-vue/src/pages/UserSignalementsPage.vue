<template>
  <ion-page>
    <app-header title="Mes Signalements"></app-header>

    <ion-content>
      <!-- Statistiques -->
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card">
          <div class="stat-value stat-primary">{{ stats.nouveau }}</div>
          <div class="stat-label">Nouveau</div>
        </div>
        <div class="stat-card">
          <div class="stat-value stat-warning">{{ stats.en_cours }}</div>
          <div class="stat-label">En cours</div>
        </div>
        <div class="stat-card">
          <div class="stat-value stat-success">{{ stats.termine }}</div>
          <div class="stat-label">Terminé</div>
        </div>
      </div>

      <!-- Budget et Surface -->
      <div class="summary-container">
        <div class="summary-item">
          <ion-icon :icon="cashOutline" class="summary-icon"></ion-icon>
          <div>
            <div class="summary-value">{{ formatCurrency(stats.totalBudget) }}</div>
            <div class="summary-label">Budget total</div>
          </div>
        </div>
        <div class="summary-item">
          <ion-icon :icon="resizeOutline" class="summary-icon"></ion-icon>
          <div>
            <div class="summary-value">{{ stats.totalSurface }} m²</div>
            <div class="summary-label">Surface totale</div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filter-container">
        <ion-button @click="showFilters = !showFilters" fill="outline" size="small">
          <ion-icon slot="start" :icon="filterOutline"></ion-icon>
          Filtres
        </ion-button>
      </div>

      <div v-if="showFilters" class="filters-panel">
        <div class="filter-group">
          <ion-label class="filter-label">Statut</ion-label>
          <ion-select
            v-model="filters.status"
            multiple
            placeholder="Tous les statuts"
            @ionChange="applyFilters"
          >
            <ion-select-option value="nouveau">Nouveau</ion-select-option>
            <ion-select-option value="en_cours">En cours</ion-select-option>
            <ion-select-option value="termine">Terminé</ion-select-option>
            <ion-select-option value="annule">Annulé</ion-select-option>
          </ion-select>
        </div>

        <div class="filter-group">
          <ion-label class="filter-label">Priorité</ion-label>
          <ion-select
            v-model="filters.priorite"
            multiple
            placeholder="Toutes les priorités"
            @ionChange="applyFilters"
          >
            <ion-select-option value="basse">Basse</ion-select-option>
            <ion-select-option value="moyenne">Moyenne</ion-select-option>
            <ion-select-option value="haute">Haute</ion-select-option>
          </ion-select>
        </div>

        <ion-button expand="block" @click="resetFilters" fill="clear" size="small">
          Réinitialiser les filtres
        </ion-button>
      </div>

      <!-- Liste des signalements -->
      <div class="signalements-list">
        <div v-if="filteredSignalements.length === 0" class="empty-state">
          <ion-icon :icon="alertCircleOutline" class="empty-icon"></ion-icon>
          <p>Aucun signalement trouvé</p>
        </div>

        <ion-card v-for="signalement in filteredSignalements" :key="signalement.id" class="signalement-card">
          <ion-card-header>
            <div class="card-header-content">
              <ion-card-title>{{ signalement.titre || 'Signalement #' + signalement.id.slice(0, 8) }}</ion-card-title>
              <ion-badge :color="getStatusColor(signalement.status)">
                {{ getStatusLabel(signalement.status) }}
              </ion-badge>
            </div>
            <ion-card-subtitle class="card-subtitle">
              <ion-icon :icon="calendarOutline"></ion-icon>
              {{ formatDate(signalement.date) }}
              <span v-if="signalement.photos && signalement.photos.length > 0" class="photo-badge">
                <ion-icon :icon="imagesOutline"></ion-icon>
                {{ signalement.photos.length }}
              </span>
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <div class="signalement-details">
              <div class="detail-item" v-if="signalement.priorite">
                <ion-icon :icon="flagOutline" :class="getPriorityClass(signalement.priorite)"></ion-icon>
                <span>{{ getPriorityLabel(signalement.priorite) }}</span>
              </div>

              <div class="detail-item">
                <ion-icon :icon="locationOutline"></ion-icon>
                <span>{{ signalement.location.lat.toFixed(5) }}, {{ signalement.location.lng.toFixed(5) }}</span>
              </div>

              <div class="detail-item" v-if="signalement.entreprise">
                <ion-icon :icon="businessOutline"></ion-icon>
                <span>{{ signalement.entreprise }}</span>
              </div>

              <div class="detail-item">
                <ion-icon :icon="resizeOutline"></ion-icon>
                <span>{{ signalement.surface }} m²</span>
              </div>

              <div class="detail-item">
                <ion-icon :icon="cashOutline"></ion-icon>
                <span>{{ formatCurrency(signalement.budget) }}</span>
              </div>

              <!-- Photos Preview -->
              <div v-if="signalement.photos && signalement.photos.length > 0" class="photos-preview">
                <div class="photos-preview-grid">
                  <div
                    v-for="(photo, index) in signalement.photos.slice(0, 4)"
                    :key="index"
                    class="photo-preview-item"
                    @click="viewDetails(signalement)"
                  >
                    <img :src="photo" :alt="`Photo ${index + 1}`" />
                    <div v-if="index === 3 && signalement.photos.length > 4" class="more-photos-overlay">
                      +{{ signalement.photos.length - 4 }}
                    </div>
                  </div>
                </div>
              </div>

              <p v-if="signalement.description" class="description">
                {{ signalement.description }}
              </p>
            </div>

            <div class="card-actions">
              <ion-button fill="outline" size="small" @click="viewOnMap(signalement)">
                <ion-icon slot="start" :icon="mapOutline"></ion-icon>
                Voir sur la carte
              </ion-button>
              <ion-button fill="outline" size="small" @click="viewDetails(signalement)">
                <ion-icon slot="start" :icon="eyeOutline"></ion-icon>
                Détails
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>

    <!-- Modal détails signalement -->
    <SignalementDetailModal
      :is-open="showDetailsModal"
      :signalement="selectedSignalement"
      :show-actions="true"
      :show-edit-button="true"
      @close="closeDetailsModal"
      @viewOnMap="viewOnMap"
      @edit="editSignalement"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonBadge,
  IonSelect, IonSelectOption, IonLabel
} from '@ionic/vue';
import {
  cashOutline, resizeOutline, filterOutline, calendarOutline,
  flagOutline, locationOutline, businessOutline, mapOutline,
  alertCircleOutline, imagesOutline, eyeOutline
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import SignalementDetailModal from '@/components/SignalementDetailModal.vue';
import signalementsService from '@/services/signalements.service.firebase';
import { useUserContext } from '@/services/user-context.service';
import type { Signalement, SignalementFilters, SignalementStats } from '@/types/signalement';

const router = useRouter();
const { userContext } = useUserContext();

const signalements = ref<Signalement[]>([]);
const showFilters = ref(false);
const filters = ref<SignalementFilters>({
  status: [],
  priorite: []
});

// Details modal
const showDetailsModal = ref(false);
const selectedSignalement = ref<Signalement | null>(null);


const stats = computed<SignalementStats>(() => {
  const filtered = signalements.value;
  return {
    total: filtered.length,
    nouveau: filtered.filter(s => s.status === 'nouveau').length,
    en_cours: filtered.filter(s => s.status === 'en_cours').length,
    termine: filtered.filter(s => s.status === 'termine').length,
    annule: filtered.filter(s => s.status === 'annule').length,
    totalSurface: filtered.reduce((sum, s) => sum + s.surface, 0),
    totalBudget: filtered.reduce((sum, s) => sum + s.budget, 0),
    avancement: filtered.length > 0
      ? Math.round((filtered.filter(s => s.status === 'termine').length / filtered.length) * 100)
      : 0
  };
});

const filteredSignalements = computed(() => {
  let result = signalements.value;

  if (filters.value.status && filters.value.status.length > 0) {
    result = result.filter(s => filters.value.status?.includes(s.status));
  }

  if (filters.value.priorite && filters.value.priorite.length > 0) {
    result = result.filter(s => s.priorite && filters.value.priorite?.includes(s.priorite));
  }

  return result;
});

onMounted(async () => {
  await loadSignalements();
});

const loadSignalements = async () => {
  try {
    await signalementsService.loadSignalements();
    if (userContext.value.userId) {
      signalements.value = signalementsService.getAll(userContext.value.userId);
    }
  } catch (error) {
    console.error('Erreur chargement signalements:', error);
  }
};

const applyFilters = () => {
  // Les filtres sont appliqués automatiquement via computed
};

const resetFilters = () => {
  filters.value = {
    status: [],
    priorite: []
  };
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR');
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

const getPriorityClass = (priorite: string) => {
  const classes: Record<string, string> = {
    basse: 'priority-low',
    moyenne: 'priority-medium',
    haute: 'priority-high'
  };
  return classes[priorite] || '';
};

const getPriorityLabel = (priorite: string) => {
  const labels: Record<string, string> = {
    basse: 'Priorité basse',
    moyenne: 'Priorité moyenne',
    haute: 'Priorité haute'
  };
  return labels[priorite] || priorite;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const viewOnMap = (signalement: Signalement) => {
  closeDetailsModal();
  router.push({
    path: '/tabs/map',
    query: {
      lat: signalement.location.lat.toString(),
      lng: signalement.location.lng.toString(),
      id: signalement.id
    }
  });
};

const viewDetails = (signalement: Signalement) => {
  selectedSignalement.value = signalement;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedSignalement.value = null;
};

const editSignalement = (signalement: Signalement) => {
  console.log('Edit signalement:', signalement.id);
  closeDetailsModal();
};
</script>

<style scoped>
/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  padding: 1rem;
  background: white;
}

.stat-card {
  text-align: center;
  padding: 1rem 0.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-primary {
  color: #0ea5e9;
}

.stat-warning {
  color: #f59e0b;
}

.stat-success {
  color: #10b981;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Summary Container */
.summary-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: white;
  margin-top: 0.5rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.summary-icon {
  font-size: 2rem;
  color: #0ea5e9;
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Filters */
.filter-container {
  padding: 1rem;
  background: white;
  margin-top: 0.5rem;
  color: #1f2937;
}

.filters-panel {
  padding: 1rem;
  background: #f8f9fa;
  margin: 0.5rem 1rem;
  border-radius: 12px;
  color: #1f2937;
}

.filter-group {
  margin-bottom: 1rem;
  color: #1f2937;
}

.filter-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1f2937;
}

/* Signalements List */
.signalements-list {
  padding: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.signalement-card {
  margin-bottom: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.card-header-content ion-card-title {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
}

.card-subtitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.photo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #0ea5e9;
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

/* Signalement Details */
.signalement-details {
  margin-top: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.detail-item ion-icon {
  font-size: 1.25rem;
  color: #0ea5e9;
}

.priority-low {
  color: #10b981 !important;
}

.priority-medium {
  color: #f59e0b !important;
}

.priority-high {
  color: #ef4444 !important;
}

/* Photos Preview in Card */
.photos-preview {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.photos-preview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.photo-preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.photo-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.photo-preview-item:hover img {
  transform: scale(1.05);
}

.more-photos-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
}

.description {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.card-actions ion-button {
  flex: 1;
}


/* Responsive */
@media (max-width: 640px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-container {
    grid-template-columns: 1fr;
  }

  .photos-preview-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

