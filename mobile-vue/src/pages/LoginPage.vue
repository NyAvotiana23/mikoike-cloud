<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="flex flex-col items-center justify-center min-h-full gradient-bg">
        <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
            Road Works Tracker
          </h1>

          <form @submit.prevent="handleLogin">
            <ion-item class="mb-4">
              <ion-label position="floating">Email</ion-label>
              <ion-input
                v-model="email"
                type="email"
                required
                autocomplete="email"
              ></ion-input>
            </ion-item>

            <ion-item class="mb-6">
              <ion-label position="floating">Mot de passe</ion-label>
              <ion-input
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
              ></ion-input>
            </ion-item>

            <ion-button
              expand="block"
              type="submit"
              :disabled="loading"
              class="mb-4"
            >
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>Se connecter</span>
            </ion-button>
          </form>

          <div class="text-center">
            <p class="text-sm text-gray-600 mb-4">
              Pas de compte ? Contactez un manager pour créer un compte.
            </p>

            <ion-button fill="clear" size="small" @click="goBack">
              <ion-icon slot="start" :icon="arrowBack"></ion-icon>
              Retour à l'accueil
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonIcon, toastController } from '@ionic/vue';
import { arrowBack } from 'ionicons/icons';
import { useAuth } from '@/services/auth.service';
import { useUserContext } from '@/services/user-context.service';

const router = useRouter();
const { login } = useAuth();
const { setAuthenticatedUser } = useUserContext();

const email = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  
  const result = await login(email.value, password.value);
  
  loading.value = false;

  if (result.success && result.user) {
    // Mettre à jour le contexte utilisateur
    setAuthenticatedUser(result.user);

    const toast = await toastController.create({
      message: 'Connexion réussie !',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    router.push('/tabs/map');
  } else {
    const toast = await toastController.create({
      message: result.error || 'Erreur de connexion',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
