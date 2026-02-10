<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="welcome-wrapper">
        <div class="welcome-container">
          <!-- Logo/Icon -->
          <div class="logo-section">
            <ion-icon :icon="construct" class="logo-icon"></ion-icon>
            <h1 class="main-title">
              Mikoike Cloud
            </h1>
            <p class="subtitle">
              Suivi des travaux routiers
            </p>
          </div>

          <!-- Description -->
          <div class="description-box">
            <p class="description-text">
              Bienvenue sur l'application de suivi des travaux routiers.
              Cette plateforme vous permet de :
            </p>
            <ul class="feature-list">
              <li class="feature-item">
                <ion-icon :icon="mapOutline" class="feature-icon"></ion-icon>
                <span>Visualiser les travaux en cours sur la carte</span>
              </li>
              <li class="feature-item">
                <ion-icon :icon="addCircleOutline" class="feature-icon"></ion-icon>
                <span>Signaler de nouveaux travaux (compte requis)</span>
              </li>
              <li class="feature-item">
                <ion-icon :icon="statsChartOutline" class="feature-icon"></ion-icon>
                <span>Suivre l'avancement de vos signalements</span>
              </li>
              <li class="feature-item">
                <ion-icon :icon="peopleOutline" class="feature-icon"></ion-icon>
                <span>Gérer les informations des entreprises</span>
              </li>
            </ul>
          </div>

          <!-- Buttons -->
          <div class="buttons-container">
            <ion-button
                expand="block"
                size="large"
                color="primary"
                @click="goToLogin"
                class="action-button login-button"
            >
              <ion-icon slot="start" :icon="logIn"></ion-icon>
              SE CONNECTER
            </ion-button>

            <ion-button
                expand="block"
                size="large"
                fill="outline"
                color="primary"
                @click="visitAsGuest"
                class="action-button guest-button"
            >
              <ion-icon slot="start" :icon="eye"></ion-icon>
              VISITER SEULEMENT
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { construct, logIn, eye, mapOutline, addCircleOutline, statsChartOutline, peopleOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useUserContext } from '@/services/user-context.service';

const router = useRouter();
const { setVisitor } = useUserContext();

const goToLogin = () => {
  router.push('/login');
};

const visitAsGuest = () => {
  setVisitor();
  router.push('/tabs/map');
};
</script>

<style scoped>
/* Reset Ionic padding that might interfere */
ion-content {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}

.welcome-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.welcome-container {
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo Section */
.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 4rem;
  color: #0ea5e9;
  margin-bottom: 1rem;
}

.main-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

/* Description Box */
.description-box {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.description-text {
  color: #374151;
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.95rem;
  color: #4b5563;
}

.feature-icon {
  font-size: 1.5rem;
  color: #0ea5e9;
  flex-shrink: 0;
}

/* Buttons */
.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-button {
  --border-radius: 12px;
  height: 56px;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}

.login-button {
  --background: #0ea5e9;
  --background-hover: #0284c7;
  --background-activated: #0369a1;
  --box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.guest-button {
  --border-color: #0ea5e9;
  --color: #0ea5e9;
  --border-width: 2px;
}

.guest-button:hover {
  --background: rgba(14, 165, 233, 0.05);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .welcome-container {
    padding: 2rem 1.5rem;
  }

  .main-title {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .logo-icon {
    font-size: 3.5rem;
  }
}
</style>