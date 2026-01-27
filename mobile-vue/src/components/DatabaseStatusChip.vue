<template>
  <div class="fixed top-16 right-4 z-50">
    <ion-chip 
      :color="statusColor" 
      @click="showDetails = !showDetails"
      class="cursor-pointer shadow-lg"
    >
      <ion-icon :icon="statusIcon"></ion-icon>
      <ion-label class="font-semibold">{{ statusText }}</ion-label>
    </ion-chip>

    <!-- Détails du statut -->
    <ion-card v-if="showDetails" class="mt-2 shadow-xl max-w-sm">
      <ion-card-header>
        <ion-card-title class="text-lg">État de la Base de Données</ion-card-title>
      </ion-card-header>

      <ion-card-content>
        <div class="space-y-3">
          <!-- Mode actuel -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Mode:</span>
            <ion-badge :color="statusColor">{{ modeText }}</ion-badge>
          </div>

          <!-- Firebase disponible -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Firebase:</span>
            <ion-icon 
              :icon="config.firebaseAvailable ? checkmarkCircle : closeCircle"
              :color="config.firebaseAvailable ? 'success' : 'danger'"
              class="text-xl"
            ></ion-icon>
          </div>

          <!-- Dernière sync -->
          <div v-if="config.lastSync" class="flex items-center justify-between">
            <span class="text-sm font-medium">Dernière sync:</span>
            <span class="text-xs text-gray-600">{{ formatDate(config.lastSync) }}</span>
          </div>

          <!-- Signalements en attente -->
          <div v-if="pendingCount > 0" class="flex items-center justify-between">
            <span class="text-sm font-medium">En attente:</span>
            <ion-badge color="warning">{{ pendingCount }}</ion-badge>
          </div>

          <!-- Actions -->
          <div class="space-y-2 pt-2 border-t">
            <ion-button 
              v-if="config.firebaseAvailable"
              expand="block" 
              size="small"
              @click="handleSync"
              :disabled="syncing"
            >
              <ion-icon slot="start" :icon="syncOutline"></ion-icon>
              {{ syncing ? 'Synchronisation...' : 'Synchroniser' }}
            </ion-button>

            <ion-button 
              expand="block" 
              size="small"
              fill="outline"
              @click="handleReload"
              :disabled="reloading"
            >
              <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
              {{ reloading ? 'Rechargement...' : 'Recharger Config' }}
            </ion-button>
          </div>
        </div>
      </ion-card-content>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  IonChip, 
  IonIcon, 
  IonLabel, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonBadge,
  IonButton,
  toastController
} from '@ionic/vue';
import { 
  cloudOutline, 
  cloudOfflineOutline, 
  syncOutline,
  refreshOutline,
  checkmarkCircle,
  closeCircle,
  timeOutline
} from 'ionicons/icons';
import databaseService from '@/services/database.service';
import signalementsService from '@/services/signalements.service.hybrid';

const showDetails = ref(false);
const syncing = ref(false);
const reloading = ref(false);

const config = computed(() => databaseService.getConfig().value);
const pendingCount = computed(() => signalementsService.getPendingSync().length);

const statusColor = computed(() => {
  switch (config.value.mode) {
    case 'firebase': return 'success';
    case 'local': return 'warning';
    default: return 'medium';
  }
});

const statusIcon = computed(() => {
  switch (config.value.mode) {
    case 'firebase': return cloudOutline;
    case 'local': return cloudOfflineOutline;
    default: return timeOutline;
  }
});

const statusText = computed(() => {
  switch (config.value.mode) {
    case 'firebase': return 'En ligne';
    case 'local': return 'Hors ligne';
    default: return 'Vérification...';
  }
});

const modeText = computed(() => {
  switch (config.value.mode) {
    case 'firebase': return 'FIREBASE';
    case 'local': return 'LOCAL';
    default: return 'CHECKING';
  }
});

const handleSync = async () => {
  syncing.value = true;
  
  try {
    // Synchroniser vers Firebase
    const syncResult = await signalementsService.syncToFirebase();
    
    if (syncResult.success) {
      // Puis récupérer depuis Firebase
      await signalementsService.syncFromFirebase();
      
      const toast = await toastController.create({
        message: `✅ Synchronisation réussie (${syncResult.count || 0} éléments)`,
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    } else {
      throw new Error(syncResult.error);
    }
  } catch (error: any) {
    const toast = await toastController.create({
      message: `❌ Erreur: ${error.message}`,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  } finally {
    syncing.value = false;
  }
};

const handleReload = async () => {
  reloading.value = true;
  
  try {
    await databaseService.reload();
    
    const toast = await toastController.create({
      message: '✅ Configuration rechargée',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    
    // Recharger les données
    if (config.value.mode === 'firebase') {
      await signalementsService.syncFromFirebase();
    }
  } catch (error: any) {
    const toast = await toastController.create({
      message: `❌ Erreur: ${error.message}`,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  } finally {
    reloading.value = false;
  }
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  console.log('DatabaseStatusChip mounted');
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
