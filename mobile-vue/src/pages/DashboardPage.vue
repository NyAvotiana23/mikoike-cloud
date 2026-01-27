<template>
  <ion-page>
    <app-header title="Récapitulatif"></app-header>
    
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
              class="p-3 border-l-4 bg-gray-50 rounded"
              :class="{
                'border-status-nouveau': sig.status === 'nouveau',
                'border-status-en_cours': sig.status === 'en_cours',
                'border-status-termine': sig.status === 'termine'
              }"
            >
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
import { IonPage, IonContent } from '@ionic/vue';
import AppHeader from '@/components/AppHeader.vue';
import signalementsService from '@/services/signalements.service';

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