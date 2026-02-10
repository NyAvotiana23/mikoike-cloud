<template>
  <ion-page>
    <app-header title="Mon Compte"></app-header>

    <ion-content>
      <div class="account-container">
        <!-- Profil utilisateur -->
        <div class="profile-section">
          <div class="avatar">
            <ion-icon :icon="personCircle" class="avatar-icon"></ion-icon>
          </div>
          <h2 class="user-name">{{ userContext.name || userContext.displayName || 'Utilisateur' }}</h2>
          <p class="user-email">{{ userContext.email }}</p>
        </div>

        <!-- Statistiques rapides -->
        <div class="quick-stats">
          <div class="stat-item">
            <div class="stat-icon">
              <ion-icon :icon="documentText" class="icon-primary"></ion-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ userStats.total }}</div>
              <div class="stat-label">Signalements</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <ion-icon :icon="checkmarkCircle" class="icon-success"></ion-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ userStats.termine }}</div>
              <div class="stat-label">Terminés</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <ion-icon :icon="time" class="icon-warning"></ion-icon>
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
            <ion-label class="section-header">Paramètres</ion-label>
          </ion-list-header>

          <ion-item button @click="goToSignalements" class="option-item">
            <ion-icon slot="start" :icon="list"></ion-icon>
            <ion-label>Mes signalements</ion-label>
            <ion-icon slot="end" :icon="chevronForward"></ion-icon>
          </ion-item>

          <ion-item button @click="goToNotifications" class="option-item">
            <ion-icon slot="start" :icon="notifications"></ion-icon>
            <ion-label>Notifications</ion-label>
            <ion-badge v-if="unreadNotificationsCount > 0" color="danger" slot="end" class="notif-badge">
              {{ unreadNotificationsCount }}
            </ion-badge>
            <ion-icon slot="end" :icon="chevronForward"></ion-icon>
          </ion-item>

          <ion-item button class="option-item">
            <ion-icon slot="start" :icon="language"></ion-icon>
            <ion-label>Langue</ion-label>
            <ion-note slot="end">Français</ion-note>
          </ion-item>
        </ion-list>

        <!-- Informations de l'application -->
        <ion-list class="app-info">
          <ion-list-header>
            <ion-label class="section-header">À propos</ion-label>
          </ion-list-header>

          <ion-item class="option-item">
            <ion-icon slot="start" :icon="informationCircle"></ion-icon>
            <ion-label>Version</ion-label>
            <ion-note slot="end">1.0.0</ion-note>
          </ion-item>

          <ion-item button class="option-item">
            <ion-icon slot="start" :icon="help"></ion-icon>
            <ion-label>Aide & Support</ion-label>
            <ion-icon slot="end" :icon="chevronForward"></ion-icon>
          </ion-item>

          <ion-item button class="option-item">
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
            class="logout-button"
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
  IonIcon, IonButton, IonBadge, IonNote, alertController, toastController
} from '@ionic/vue';
import {
  personCircle, documentText, checkmarkCircle, time, list, notifications,
  language, informationCircle, help, document, logOut, chevronForward
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import { useUserContext } from '@/services/user-context.service';
import { useAuth } from '@/services/auth.service';
import signalementsService from '@/services/signalements.service.firebase';
import notificationsService from '@/services/notifications.service';

const router = useRouter();
const { userContext, clearContext } = useUserContext();
const { logout } = useAuth();

const unreadNotificationsCount = ref(0);

const userStats = ref({
  total: 0,
  termine: 0,
  en_cours: 0,
  nouveau: 0
});

onMounted(async () => {
  await loadUserStats();
  loadUnreadNotificationsCount();
});

const loadUserStats = async () => {
  if (userContext.value.userId) {
    await signalementsService.loadSignalements();
    const signalements = signalementsService.getAll(userContext.value.userId);
    userStats.value = {
      total: signalements.length,
      termine: signalements.filter(s => s.status === 'termine').length,
      en_cours: signalements.filter(s => s.status === 'en_cours').length,
      nouveau: signalements.filter(s => s.status === 'nouveau').length
    };
  }
};

const loadUnreadNotificationsCount = () => {
  if (userContext.value.userId) {
    unreadNotificationsCount.value = notificationsService.getUnreadCount(userContext.value.userId);
  } else {
    unreadNotificationsCount.value = 0;
  }
};

const goToSignalements = () => {
  router.push('/tabs/signalements');
};

const goToNotifications = () => {
  router.push('/tabs/notifications');
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
        text: 'Se déconnecter',
        role: 'destructive',
        handler: async () => {
          const result = await logout();

          if (result.success) {
            clearContext();

            const toast = await toastController.create({
              message: 'Déconnexion réussie',
              duration: 2000,
              color: 'success',
              position: 'top'
            });
            await toast.present();

            router.push('/');
          } else {
            const toast = await toastController.create({
              message: result.error || 'Erreur lors de la déconnexion',
              duration: 3000,
              color: 'danger',
              position: 'top'
            });
            await toast.present();
          }
        }
      }
    ]
  });

  await alert.present();
};
</script>

<style scoped>
.account-container {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

/* Profile Section */
.profile-section {
  text-align: center;
  padding: 2rem 1rem;
  background: white;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar {
  margin-bottom: 1rem;
}

.avatar-icon {
  font-size: 5rem;
  color: #0ea5e9;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.user-email {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  margin-bottom: 0.5rem;
}

.icon-primary {
  font-size: 2rem;
  color: #0ea5e9;
}

.icon-success {
  font-size: 2rem;
  color: #10b981;
}

.icon-warning {
  font-size: 2rem;
  color: #f59e0b;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Lists */
.account-options,
.app-info {
  background: white;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  font-weight: 600;
  font-size: 1rem;
  color: #1f2937;
}

.option-item {
  --padding-start: 1rem;
  --padding-end: 1rem;
  --min-height: 56px;
}

/* Logout Section */
.logout-section {
  margin-top: 2rem;
  padding: 1rem 0 2rem;
}

.logout-button {
  --border-radius: 12px;
  --border-width: 2px;
  height: 56px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 640px) {
  .quick-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-item {
    padding: 0.75rem 0.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }
}
</style>