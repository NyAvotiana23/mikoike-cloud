<template>
  <ion-page>
    <app-header title="Récapitulatif"></app-header>
    
    <!-- Database Status Chip -->
    <database-status-chip />
    
    <ion-content class="ion-padding">
      <div class="space-y-4">
        <!-- Carte de statistiques globales -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4 text-gray-800">Statistiques Générales</h2>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Total Signalements</p>
              <p class="text-3xl font-bold text-blue-600">{{ stats.total }}</p>
            </div>

            <div class="bg-green-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Avancement</p>
              <p class="text-3xl font-bold text-green-600">{{ stats.avancement }}%</p>
            </div>

            <div class="bg-purple-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Surface Totale</p>
              <p class="text-2xl font-bold text-purple-600">{{ stats.totalSurface }} m²</p>
            </div>

            <div class="bg-orange-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Budget Total</p>
              <p class="text-2xl font-bold text-orange-600">{{ formatBudget(stats.totalBudget) }}</p>
            </div>
          </div>
        </div>

        <!-- Statut de synchronisation -->
        <div v-if="stats.syncStatus" class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold mb-4 text-gray-800">
            Synchronisation
            <ion-icon 
              :icon="stats.syncStatus.isFirebaseAvailable ? cloudDone : cloudOffline"
              :color="stats.syncStatus.isFirebaseAvailable ? 'success' : 'warning'"
              class="ml-2"
            ></ion-icon>
          </h2>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-green-50 rounded">
              <span class="font-semibold">Synchronisés</span>
              <span class="text-2xl font-bold text-green-600">{{ stats.syncStatus.synced }}</span>
            </div>

            <div v-if="stats.syncStatus.pending > 0" class="flex items-center justify-between p-3 bg-yellow-50 rounded">
              <span class="font-semibold">En attente</span>
              <span class="text-2xl font-bold text-yellow-600">{{ stats.syncStatus.pending }}</span>
            </div>

            <ion-button 
              v-if="stats.syncStatus.isFirebaseAvailable && stats.syncStatus.pending > 0"
              expand="block"
              @click="syncNow"
              :disabled="syncing"
            >
              <ion-icon slot="start" :icon="syncOutline"></ion-icon>
              {{ syncing ? 'Synchronisation...' : 'Synchroniser maintenant' }}
            </ion-button>
          </div>
        </div>

        <!-- Répartition par statut -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold mb-4 text-gray-800">Répartition par Statut</h2>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-status-nouveau bg-opacity-20 rounded">
              <span class="font-semibold">Nouveau</span>
              <span class="text-2xl font-bold">{{ stats.nouveau }}</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-status-en_cours bg-opacity-20 rounded">
              <span class="font-semibold">En Cours</span>
              <span class="text-2xl font-bold">{{ stats.en_cours }}</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-status-termine bg-opacity-20 rounded">
              <span class="font-semibold">Terminé</span>
              <span class="text-2xl font-bold">{{ stats.termine }}</span>
            </div>
          </div>
        </div>

        <!-- Liste des derniers signalements -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold mb-4 text-gray-800">Derniers Signalements</h2>
          
          <div class="space-y-2">
            <div
              v-for="sig in recentSignalements"
              :key="sig.id"
              class="p-3 border-l-4 bg-gray-50 rounded relative"
              :class="{
                'border-status-nouveau': sig.status === 'nouveau',
                'border-status-en_cours': sig.status === 'en_cours',
                'border-status-termine': sig.status === 'termine'
              }"
            >
              <!-- Badge de sync -->
              <div class="absolute top-2 right-2">
                <ion-icon 
                  v-if="sig.syncStatus === 'synced'"
                  :icon="cloudDone"
                  color="success"
                  class="text-sm"
                ></ion-icon>
                <ion-icon 
                  v-else-if="sig.syncStatus === 'pending' || sig.syncStatus === 'local'"
                  :icon="cloudUpload"
                  color="warning"
                  class="text-sm"
                ></ion-icon>
              </div>

              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold">{{ sig.entreprise || 'Non assigné' }}</p>
                  <p class="text-sm text-gray-600">{{ formatDate(sig.date) }}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-status-nouveau text-white': sig.status === 'nouveau',
                    'bg-status-en_cours text-white': sig.status === 'en_cours',
                    'bg-status-termine text-white': sig.status === 'termine'
                  }"
                >
                  {{ sig.status.replace('_', ' ').toUpperCase() }}
                </span>
              </div>
              <p class="text-sm mt-2">{{ sig.surface }} m² - {{ formatBudget(sig.budget) }}</p>
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
import { cloudDone, cloudOffline, cloudUpload, syncOutline } from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import DatabaseStatusChip from '@/components/DatabaseStatusChip.vue';
import signalementsService from '@/services/signalements.service.hybrid';

const stats = ref({
  total: 0,
  nouveau: 0,
  en_cours: 0,
  termine: 0,
  totalSurface: 0,
  totalBudget: 0,
  avancement: 0,
  syncStatus: {
    synced: 0,
    pending: 0,
    isFirebaseAvailable: false
  }
});

const allSignalements = ref<any[]>([]);
const syncing = ref(false);

const recentSignalements = computed(() => {
  return allSignalements.value
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
});

onMounted(() => {
  loadData();
});

const loadData = () => {
  stats.value = signalementsService.getStats();
  allSignalements.value = signalementsService.getAll();
};

const syncNow = async () => {
  syncing.value = true;
  
  try {
    const result = await signalementsService.syncToFirebase();
    
    if (result.success) {
      await signalementsService.syncFromFirebase();
      
      const toast = await toastController.create({
        message: `✅ ${result.count || 0} signalement(s) synchronisé(s)`,
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      // Recharger les stats
      loadData();
    } else {
      throw new Error(result.error);
    }
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
