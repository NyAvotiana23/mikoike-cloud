<template>
  <ion-page>
    <app-header title="Mon Compte"></app-header>

    <ion-content>
      <div class="account-container">
        <!-- Profil utilisateur -->
        <div class="profile-section">
          <div class="avatar">
            <ion-icon :icon="personCircle" class="text-6xl text-primary"></ion-icon>
          </div>
          <h2 class="user-name">{{ userContext.prenom }} {{ userContext.nom }}</h2>
          <p class="user-email">{{ userContext.email }}</p>
        </div>

        <!-- Statistiques rapides -->
        <div class="quick-stats">
          <div class="stat-item">
            <div class="stat-icon">
              <ion-icon :icon="documentText" class="text-primary"></ion-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ userStats.total }}</div>
              <div class="stat-label">Signalements</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <ion-icon :icon="checkmarkCircle" class="text-success"></ion-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ userStats.termine }}</div>
              <div class="stat-label">Terminés</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <ion-icon :icon="time" class="text-warning"></ion-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ userStats.en_cours }}</div>
              <div class="stat-label">En cours</div>
            </div>
          </div>
        </div>

        <!-- Options du compte -->
        <ion-list class="account-options">
          <ion-list-header>
            <ion-label>Paramètres</ion-label>
          </ion-list-header>

          <ion-item button @click="goToSignalements">
            <ion-icon slot="start" :icon="list"></ion-icon>
            <ion-label>Mes signalements</ion-label>
            <ion-icon slot="end" :icon="chevronForward"></ion-icon>
          </ion-item>

          <ion-item button>
            <ion-icon slot="start" :icon="notifications"></ion-icon>
            <ion-label>Notifications</ion-label>
            <ion-toggle :checked="notificationsEnabled" @ionChange="toggleNotifications"></ion-toggle>
          </ion-item>

          <ion-item button>
            <ion-icon slot="start" :icon="language"></ion-icon>
            <ion-label>Langue</ion-label>
            <ion-note slot="end">Français</ion-note>
          </ion-item>
        </ion-list>

        <!-- Informations de l'application -->
        <ion-list class="app-info">
          <ion-list-header>
            <ion-label>À propos</ion-label>
          </ion-list-header>

          <ion-item>
            <ion-icon slot="start" :icon="informationCircle"></ion-icon>
            <ion-label>Version</ion-label>
            <ion-note slot="end">1.0.0</ion-note>
          </ion-item>

          <ion-item button>
            <ion-icon slot="start" :icon="help"></ion-icon>
            <ion-label>Aide & Support</ion-label>
            <ion-icon slot="end" :icon="chevronForward"></ion-icon>
          </ion-item>

          <ion-item button>
            <ion-icon slot="start" :icon="document"></ion-icon>
            <ion-label>Conditions d'utilisation</ion-label>
            <ion-icon slot="end" :icon="chevronForward"></ion-icon>
          </ion-item>
        </ion-list>

        <!-- Bouton déconnexion -->
        <div class="logout-section">
          <ion-button
            expand="block"
            color="danger"
            fill="outline"
            @click="confirmLogout"
          >
            <ion-icon slot="start" :icon="logOut"></ion-icon>
            Se déconnecter
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonContent, IonList, IonListHeader, IonItem, IonLabel,
  IonIcon, IonButton, IonToggle, IonNote, alertController, toastController
} from '@ionic/vue';
import {
  personCircle, documentText, checkmarkCircle, time, list, notifications,
  language, informationCircle, help, document, logOut, chevronForward
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import { useUserContext } from '@/services/user-context.service';
import { useAuth } from '@/services/auth.service';
import signalementsService from '@/services/signalements.service';

const router = useRouter();
const { userContext, setVisitor } = useUserContext();
const { logout } = useAuth();

const notificationsEnabled = ref(true);
const userStats = ref({
  total: 0,
  termine: 0,
  en_cours: 0,
  nouveau: 0
});

onMounted(() => {
  loadUserStats();
});

const loadUserStats = () => {
  if (userContext.value.userId) {
    const signalements = signalementsService.getAll(userContext.value.userId);
    userStats.value = {
      total: signalements.length,
      termine: signalements.filter(s => s.status === 'termine').length,
      en_cours: signalements.filter(s => s.status === 'en_cours').length,
      nouveau: signalements.filter(s => s.status === 'nouveau').length
    };
  }
};

const goToSignalements = () => {
  router.push('/tabs/signalements');
};

const toggleNotifications = (event: any) => {
  notificationsEnabled.value = event.detail.checked;
  // TODO: Implémenter la logique de notifications
};

const confirmLogout = async () => {
  const alert = await alertController.create({
    header: 'Déconnexion',
    message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Déconnexion',
        role: 'confirm',
        handler: async () => {
          await handleLogout();
        }
      }
    ]
  });

  await alert.present();
};

const handleLogout = async () => {
  await logout();
  setVisitor();

  const toast = await toastController.create({
    message: 'Vous êtes déconnecté',
    duration: 2000,
    color: 'success'
  });
  await toast.present();

  router.push('/');
};
</script>

<style scoped>
.account-container {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.profile-section {
  text-align: center;
  padding: 2rem 1rem;
  background: white;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.avatar {
  margin-bottom: 1rem;
}

.user-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.user-email {
  color: #666;
  font-size: 0.95rem;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
}

.account-options,
.app-info {
  margin-bottom: 1rem;
  border-radius: 12px;
  overflow: hidden;
}

.logout-section {
  margin-top: 2rem;
  padding: 1rem 0;
}
</style>
