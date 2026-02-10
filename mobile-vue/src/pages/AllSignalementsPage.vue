<template>
  <ion-page>
    <app-header title="Tous les signalements"></app-header>

    <ion-content :fullscreen="true">
      <!-- Barre de filtres -->
      <div class="filters-container">
        <div class="filter-section">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Rechercher..."
            @ionInput="applyFilters"
            :debounce="300"
          ></ion-searchbar>
        </div>

        <div class="filter-chips">
          <ion-chip
            :color="selectedStatus === null ? 'primary' : 'medium'"
            @click="filterByStatus(null)"
          >
            <ion-label>Tous</ion-label>
          </ion-chip>
          <ion-chip
            :color="selectedStatus === 'nouveau' ? 'primary' : 'medium'"
            @click="filterByStatus('nouveau')"
          >
            <ion-label>Nouveau</ion-label>
          </ion-chip>
          <ion-chip
            :color="selectedStatus === 'en_cours' ? 'warning' : 'medium'"
            @click="filterByStatus('en_cours')"
          >
            <ion-label>En cours</ion-label>
          </ion-chip>
          <ion-chip
            :color="selectedStatus === 'termine' ? 'success' : 'medium'"
            @click="filterByStatus('termine')"
          >
            <ion-label>Terminé</ion-label>
          </ion-chip>
        </div>

        <!-- Statistiques -->
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-value">{{ filteredSignalements.length }}</div>
            <div class="stat-label">Signalements</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.nouveau }}</div>
            <div class="stat-label">Nouveau</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.en_cours }}</div>
            <div class="stat-label">En cours</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.termine }}</div>
            <div class="stat-label">Terminés</div>
          </div>
        </div>
      </div>

      <!-- Tableau des signalements -->
      <div class="table-container">
        <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <div v-if="loading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Chargement des signalements...</p>
        </div>

        <div v-else-if="filteredSignalements.length === 0" class="empty-state">
          <ion-icon :icon="alertCircleOutline" class="empty-icon"></ion-icon>
          <h3>Aucun signalement trouvé</h3>
          <p>Essayez de modifier vos filtres</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="signalements-table">
            <thead>
              <tr>
                <th @click="sortBy('date')">
                  Date
                  <ion-icon :icon="sortColumn === 'date' ? (sortDirection === 'asc' ? arrowUp : arrowDown) : swapVertical" class="sort-icon"></ion-icon>
                </th>
                <th @click="sortBy('titre')">
                  Titre
                  <ion-icon :icon="sortColumn === 'titre' ? (sortDirection === 'asc' ? arrowUp : arrowDown) : swapVertical" class="sort-icon"></ion-icon>
                </th>
                <th @click="sortBy('status')">
                  Statut
                  <ion-icon :icon="sortColumn === 'status' ? (sortDirection === 'asc' ? arrowUp : arrowDown) : swapVertical" class="sort-icon"></ion-icon>
                </th>
                <th @click="sortBy('priorite')">
                  Priorité
                  <ion-icon :icon="sortColumn === 'priorite' ? (sortDirection === 'asc' ? arrowUp : arrowDown) : swapVertical" class="sort-icon"></ion-icon>
                </th>
                <th @click="sortBy('surface')">
                  Surface
                  <ion-icon :icon="sortColumn === 'surface' ? (sortDirection === 'asc' ? arrowUp : arrowDown) : swapVertical" class="sort-icon"></ion-icon>
                </th>
                <th @click="sortBy('budget')">
                  Budget
                  <ion-icon :icon="sortColumn === 'budget' ? (sortDirection === 'asc' ? arrowUp : arrowDown) : swapVertical" class="sort-icon"></ion-icon>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="signalement in paginatedSignalements" :key="signalement.id" @click="viewDetails(signalement)">
                <td>{{ formatDate(signalement.date) }}</td>
                <td class="title-cell">
                  <div class="title-content">
                    {{ signalement.titre || 'Sans titre' }}
                    <span v-if="signalement.photos && signalement.photos.length > 0" class="photo-indicator">
                      <ion-icon :icon="imageOutline"></ion-icon>
                      <span class="photo-count">{{ signalement.photos.length }}</span>
                    </span>
                  </div>
                </td>
                <td>
                  <ion-badge :color="getStatusColor(signalement.status)">
                    {{ getStatusLabel(signalement.status) }}
                  </ion-badge>
                </td>
                <td>
                  <ion-badge :color="getPriorityColor(signalement.priorite)">
                    {{ getPriorityLabel(signalement.priorite) }}
                  </ion-badge>
                </td>
                <td>{{ signalement.surface }} m²</td>
                <td>{{ formatCurrency(signalement.budget) }}</td>
                <td>
                  <div class="action-buttons">
                    <ion-button size="small" fill="clear" @click.stop="viewOnMap(signalement)">
                      <ion-icon slot="icon-only" :icon="locationOutline"></ion-icon>
                    </ion-button>
                    <ion-button size="small" fill="clear" @click.stop="viewDetails(signalement)">
                      <ion-icon slot="icon-only" :icon="eyeOutline"></ion-icon>
                    </ion-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <ion-button
            fill="outline"
            size="small"
            :disabled="currentPage === 1"
            @click="previousPage"
          >
            <ion-icon slot="start" :icon="chevronBack"></ion-icon>
            Précédent
          </ion-button>

          <span class="page-info">Page {{ currentPage }} / {{ totalPages }}</span>

          <ion-button
            fill="outline"
            size="small"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            Suivant
            <ion-icon slot="end" :icon="chevronForward"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>

    <!-- Modal détails signalement -->
    <SignalementDetailModal
      :is-open="showDetailsModal"
      :signalement="selectedSignalement"
      :show-actions="true"
      @close="closeDetailsModal"
      @viewOnMap="viewOnMap"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonContent, IonSearchbar, IonChip, IonLabel, IonBadge,
  IonButton, IonIcon, IonSpinner, IonRefresher, IonRefresherContent,
  toastController
} from '@ionic/vue';
import {
  alertCircleOutline, locationOutline, eyeOutline,
  chevronBack, chevronForward, arrowUp, arrowDown, swapVertical, imageOutline
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import SignalementDetailModal from '@/components/SignalementDetailModal.vue';
import signalementsService from '@/services/signalements.service.firebase';
import type { Signalement } from '@/types/signalement';

const router = useRouter();

const allSignalements = ref<Signalement[]>([]);
const filteredSignalements = ref<Signalement[]>([]);
const searchQuery = ref('');
const selectedStatus = ref<string | null>(null);
const loading = ref(false);
const showDetailsModal = ref(false);
const selectedSignalement = ref<Signalement | null>(null);


// Tri
const sortColumn = ref<string>('date');
const sortDirection = ref<'asc' | 'desc'>('desc');

// Pagination
const currentPage = ref(1);
const itemsPerPage = 20;

const stats = computed(() => {
  const all = filteredSignalements.value;
  return {
    total: all.length,
    nouveau: all.filter(s => s.status === 'nouveau').length,
    en_cours: all.filter(s => s.status === 'en_cours').length,
    termine: all.filter(s => s.status === 'termine').length,
    annule: all.filter(s => s.status === 'annule').length,
  };
});

const totalPages = computed(() => {
  return Math.ceil(filteredSignalements.value.length / itemsPerPage);
});

const paginatedSignalements = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredSignalements.value.slice(start, end);
});

onMounted(async () => {
  await loadSignalements();
});

const loadSignalements = async () => {
  loading.value = true;
  try {
    await signalementsService.loadSignalements();
    allSignalements.value = signalementsService.getAll();
    applyFilters();
  } catch (error) {
    console.error('Erreur lors du chargement des signalements:', error);
    const toast = await toastController.create({
      message: 'Erreur lors du chargement des signalements',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  let filtered = [...allSignalements.value];

  // Filtre par statut
  if (selectedStatus.value) {
    filtered = filtered.filter(s => s.status === selectedStatus.value);
  }

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(s =>
      (s.titre?.toLowerCase().includes(query)) ||
      (s.description?.toLowerCase().includes(query)) ||
      (s.entreprise?.toLowerCase().includes(query))
    );
  }

  // Tri
  filtered.sort((a, b) => {
    let aValue: any = a[sortColumn.value as keyof Signalement];
    let bValue: any = b[sortColumn.value as keyof Signalement];

    if (sortColumn.value === 'date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });

  filteredSignalements.value = filtered;
  currentPage.value = 1; // Reset à la première page
};

const filterByStatus = (status: string | null) => {
  selectedStatus.value = status;
  applyFilters();
};

const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
  applyFilters();
};

const viewDetails = (signalement: Signalement) => {
  selectedSignalement.value = signalement;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedSignalement.value = null;
};

const viewOnMap = (signalement: Signalement) => {
  // Retirer le focus pour éviter l'erreur aria-hidden
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
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


const handleRefresh = async (event: any) => {
  await loadSignalements();
  event.target.complete();
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
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

const getPriorityColor = (priorite?: string) => {
  const colors: Record<string, string> = {
    basse: 'success',
    moyenne: 'warning',
    haute: 'danger'
  };
  return colors[priorite || 'moyenne'] || 'medium';
};

const getPriorityLabel = (priorite?: string) => {
  const labels: Record<string, string> = {
    basse: 'Basse',
    moyenne: 'Moyenne',
    haute: 'Haute'
  };
  return labels[priorite || 'moyenne'] || 'Moyenne';
};
</script>

<style scoped>
/* Filters Container */
.filters-container {
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #e2e8f0;
}

.filter-section {
  margin-bottom: 1rem;
}

.filter-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 0.75rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0ea5e9;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

/* Table Container */
.table-container {
  padding: 1rem;
  overflow-x: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #64748b;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.signalements-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  min-width: 800px;
}

.signalements-table thead {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
}

.signalements-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}

.signalements-table th:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sort-icon {
  margin-left: 0.25rem;
  font-size: 1rem;
  vertical-align: middle;
}

.signalements-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background 0.2s ease;
}

.signalements-table tbody tr:hover {
  background: #f8fafc;
}

.signalements-table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #1f2937;
}

.title-cell {
  max-width: 200px;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.photo-indicator {
  color: #0ea5e9;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.photo-count {
  font-size: 0.75rem;
  font-weight: 600;
  background: #0ea5e9;
  color: white;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.page-info {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
}


/* Responsive */
@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .signalements-table {
    font-size: 0.75rem;
  }

  .signalements-table th,
  .signalements-table td {
    padding: 0.5rem;
  }
}
</style>
