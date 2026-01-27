<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="flex flex-col items-center justify-center min-h-full gradient-bg">
        <div class="welcome-container">
          <!-- Logo/Icon -->
          <div class="text-center mb-6">
            <ion-icon :icon="construct" class="text-6xl text-primary mb-4"></ion-icon>
            <h1 class="text-4xl font-bold text-gray-800 mb-2">
              Road Works Tracker
            </h1>
            <p class="text-lg text-gray-600">
              Suivi des travaux routiers
            </p>
          </div>

          <!-- Description -->
          <div class="description-box">
            <p class="text-gray-700 mb-4">
              Bienvenue sur l'application de suivi des travaux routiers.
              Cette plateforme vous permet de :
            </p>
            <ul class="feature-list">
              <li>
                <ion-icon :icon="mapOutline" class="text-primary"></ion-icon>
                <span>Visualiser les travaux en cours sur la carte</span>
              </li>
              <li>
                <ion-icon :icon="addCircleOutline" class="text-primary"></ion-icon>
                <span>Signaler de nouveaux travaux (compte requis)</span>
              </li>
              <li>
                <ion-icon :icon="statsChartOutline" class="text-primary"></ion-icon>
                <span>Suivre l'avancement de vos signalements</span>
              </li>
              <li>
                <ion-icon :icon="peopleOutline" class="text-primary"></ion-icon>
                <span>Gérer les informations des entreprises</span>
              </li>
            </ul>
          </div>

          <!-- Buttons -->
          <div class="buttons-container">
            <ion-button
              expand="block"
              size="large"
              @click="goToLogin"
              class="mb-4"
            >
              <ion-icon slot="start" :icon="logIn"></ion-icon>
              Se connecter
            </ion-button>

            <ion-button
              expand="block"
              size="large"
              fill="outline"
              @click="visitAsGuest"
            >
              <ion-icon slot="start" :icon="eye"></ion-icon>
              Visiter seulement
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
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.welcome-container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.description-box {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.95rem;
}

.feature-list ion-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.buttons-container {
  margin-top: 1rem;
}
</style>
