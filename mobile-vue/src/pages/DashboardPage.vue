<template>
  <ion-page>
    <app-header title="Récapitulatif"></app-header>
    
    <ion-content class="ion-padding">
      <div class="dashboard-container">
        <!-- Carte de statistiques globales -->
        <div class="stats-card">
          <h2 class="card-title">Statistiques Générales</h2>
          
          <div class="stats-grid">
            <div class="stat-box stat-blue">
              <p class="stat-label">Total Signalements</p>
              <p class="stat-value">{{ stats.total }}</p>
            </div>

            <div class="stat-box stat-green">
              <p class="stat-label">Avancement</p>
              <p class="stat-value">{{ stats.avancement }}%</p>
            </div>

            <div class="stat-box stat-purple">
              <p class="stat-label">Surface Totale</p>
              <p class="stat-value-sm">{{ stats.totalSurface }} m²</p>
            </div>

            <div class="stat-box stat-orange">
              <p class="stat-label">Budget Total</p>
              <p class="stat-value-sm">{{ formatBudget(stats.totalBudget) }}</p>
            </div>
          </div>
        </div>

        <!-- Synchronisation Firebase -->
        <div class="sync-card">
          <h2 class="card-title">
            Synchronisation Firebase
            <ion-icon
              :icon="cloudDone"
              color="success"
              class="sync-icon"
            ></ion-icon>
          </h2>
          
          <div class="sync-content">
            <p class="sync-info">
              Tous les signalements sont automatiquement synchronisés avec Firebase.
            </p>

            <ion-button 
              expand="block"
              @click="syncNow"
              :disabled="syncing"
              class="sync-button"
            >
              <ion-icon slot="start" :icon="syncOutline"></ion-icon>
              {{ syncing ? 'Actualisation...' : 'Actualiser les données' }}
            </ion-button>
          </div>
        </div>

        <!-- Répartition par statut -->
        <div class="status-card">
          <h2 class="card-title">Répartition par Statut</h2>
          
          <div class="status-content">
            <div class="status-item status-nouveau">
              <span class="status-label">Nouveau</span>
              <span class="status-value">{{ stats.nouveau }}</span>
            </div>

            <div class="status-item status-en-cours">
              <span class="status-label">En Cours</span>
              <span class="status-value">{{ stats.en_cours }}</span>
            </div>

            <div class="status-item status-termine">
              <span class="status-label">Terminé</span>
              <span class="status-value">{{ stats.termine }}</span>
            </div>
          </div>
        </div>

        <!-- Liste des derniers signalements -->
        <div class="recent-card">
          <h2 class="card-title">Derniers Signalements</h2>
          
          <div class="recent-list">
            <div
              v-for="sig in recentSignalements"
              :key="sig.id"
              class="recent-item"
              :class="{
                'border-nouveau': sig.status === 'nouveau',
                'border-en-cours': sig.status === 'en_cours',
                'border-termine': sig.status === 'termine'
              }"
            >
              <!-- Badge de sync -->
              <div class="sync-badge">
                <ion-icon 
                  v-if="sig.syncStatus === 'synced'"
                  :icon="cloudDone"
                  color="success"
                  class="badge-icon"
                ></ion-icon>
                <ion-icon 
                  v-else-if="sig.syncStatus === 'pending' || sig.syncStatus === 'local'"
                  :icon="cloudUpload"
                  color="warning"
                  class="badge-icon"
                ></ion-icon>
              </div>

              <div class="recent-content">
                <div class="recent-header">
                  <p class="recent-entreprise">{{ sig.entreprise || 'Non assigné' }}</p>
                  <span class="recent-status"
                    :class="{
                      'badge-nouveau': sig.status === 'nouveau',
                      'badge-en-cours': sig.status === 'en_cours',
                      'badge-termine': sig.status === 'termine'
                    }"
                  >
                    {{ sig.status.replace('_', ' ').toUpperCase() }}
                  </span>
                </div>
                <p class="recent-date">{{ formatDate(sig.date) }}</p>
                <p class="recent-info">{{ sig.surface }} m² - {{ formatBudget(sig.budget) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon, toastController } from '@ionic/vue';
import { cloudDone, cloudUpload, syncOutline } from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import signalementsService from '@/services/signalements.service.firebase';

const stats = ref({
  total: 0,
  nouveau: 0,
  en_cours: 0,
  termine: 0,
  totalSurface: 0,
  totalBudget: 0,
  avancement: 0
});

const allSignalements = ref<any[]>([]);
const syncing = ref(false);

const recentSignalements = computed(() => {
  return [...allSignalements.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
});

onMounted(() => {
  loadData();
});

const loadData = async () => {
  await signalementsService.loadSignalements();
  stats.value = signalementsService.getStats();
  allSignalements.value = signalementsService.getAll();
};

const syncNow = async () => {
  syncing.value = true;
  
  try {
    await signalementsService.loadSignalements();

    const toast = await toastController.create({
      message: '✅ Signalements synchronisés depuis Firebase',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    loadData();
  } catch (error: any) {
    const toast = await toastController.create({
      message: `❌ Erreur: ${error.message}`,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    syncing.value = false;
  }
};

const formatBudget = (value: number) => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Cards */
.stats-card,
.sync-card,
.status-card,
.recent-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sync-icon {
  font-size: 1.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-box {
  padding: 1rem;
  border-radius: 12px;
}

.stat-blue {
  background: #dbeafe;
}

.stat-green {
  background: #d1fae5;
}

.stat-purple {
  background: #e9d5ff;
}

.stat-orange {
  background: #fed7aa;
}

.stat-label {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0 0 0.5rem 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.stat-blue .stat-value {
  color: #2563eb;
}

.stat-green .stat-value {
  color: #059669;
}

.stat-purple .stat-value {
  color: #7c3aed;
}

.stat-orange .stat-value {
  color: #ea580c;
}

.stat-value-sm {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.stat-purple .stat-value-sm {
  color: #7c3aed;
}

.stat-orange .stat-value-sm {
  color: #ea580c;
}

/* Sync Content */
.sync-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sync-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
}

.sync-success {
  background: #d1fae5;
}

.sync-warning {
  background: #fef3c7;
}

.sync-label {
  font-weight: 600;
  color: #1f2937;
}

.sync-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.sync-success .sync-value {
  color: #059669;
}

.sync-warning .sync-value {
  color: #d97706;
}

.sync-button {
  --border-radius: 12px;
  margin-top: 0.5rem;
}

/* Status Content */
.status-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
}

.status-nouveau {
  background: rgba(14, 165, 233, 0.1);
}

.status-en-cours {
  background: rgba(245, 158, 11, 0.1);
}

.status-termine {
  background: rgba(16, 185, 129, 0.1);
}

.status-label {
  font-weight: 600;
  color: #1f2937;
}

.status-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

/* Recent List */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recent-item {
  padding: 0.75rem;
  border-left: 4px solid;
  background: #f8f9fa;
  border-radius: 8px;
  position: relative;
}

.border-nouveau {
  border-left-color: #0ea5e9;
}

.border-en-cours {
  border-left-color: #f59e0b;
}

.border-termine {
  border-left-color: #10b981;
}

.sync-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.badge-icon {
  font-size: 1rem;
}

.recent-content {
  padding-right: 2rem;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
}

.recent-entreprise {
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.recent-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-nouveau {
  background: #0ea5e9;
  color: white;
}

.badge-en-cours {
  background: #f59e0b;
  color: white;
}

.badge-termine {
  background: #10b981;
  color: white;
}

.recent-date {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.recent-info {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>