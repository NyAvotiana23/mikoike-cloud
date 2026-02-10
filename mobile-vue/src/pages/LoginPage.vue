<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="login-wrapper">
        <div class="login-container">
          <!-- Logo/Icon -->
          <div class="logo-section">
            <ion-icon :icon="construct" class="logo-icon"></ion-icon>
            <h1 class="main-title">
              Connexion
            </h1>
            <p class="subtitle">
              Road Works Tracker
            </p>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="input-group">
              <ion-item lines="none" class="custom-input">
                <ion-label position="floating">Email Test : <strong>anjara@anjara.com</strong></ion-label>
                <ion-input
                  v-model="email"
                  type="email"
                  required
                  autocomplete="email"
                ></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-item lines="none" class="custom-input">
                <ion-label position="floating">Mot de passe  Test : <strong>anjara</strong></ion-label>
                <ion-input
                  v-model="password"
                  type="password"
                  required
                  autocomplete="current-password"
                ></ion-input>
              </ion-item>
            </div>

            <ion-button
              expand="block"
              type="submit"
              :disabled="loading"
              class="login-submit-button"
            >
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>SE CONNECTER</span>
            </ion-button>
          </form>

          <!-- Info Box -->
          <div class="info-box">
            <p class="info-text">
              Les comptes sont gérés par le manager web
            </p>
          </div>

          <!-- Back Button -->
          <ion-button
            fill="clear"
            expand="block"
            @click="goBack"
            class="back-button"
          >
            <ion-icon slot="start" :icon="arrowBack"></ion-icon>
            Retour à l'accueil
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonIcon, toastController } from '@ionic/vue';
import { arrowBack, construct } from 'ionicons/icons';
import { useAuth } from '@/services/auth.service';
import { useUserContext } from '@/services/user-context.service';

const router = useRouter();
const { login } = useAuth();
const { setAuthenticatedUser } = useUserContext();

const email = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  // Validation basique
  if (!email.value || !password.value) {
    const toast = await toastController.create({
      message: 'Veuillez remplir tous les champs',
      duration: 2500,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
    return;
  }

  loading.value = true;
  
  try {
    const result = await login(email.value, password.value);

    loading.value = false;

    if (result.success && result.user) {
      setAuthenticatedUser(result.user);

      const toast = await toastController.create({
        message: `Bienvenue ${result.user.email} !`,
        duration: 2000,
        color: 'success',
        position: 'top',
        icon: 'checkmark-circle'
      });
      await toast.present();

      // Redirection vers la carte
      router.push('/tabs/map');
    } else {
      // Afficher le message d'erreur spécifique
      const errorMessage = result.error || 'Erreur de connexion';
      const toast = await toastController.create({
        message: errorMessage,
        duration: 4000,
        color: 'danger',
        position: 'top',
        icon: 'alert-circle'
      });
      await toast.present();

      // Log pour debug
      console.error('Erreur de connexion:', result.errorCode, result.error);
    }
  } catch (err: any) {
    loading.value = false;
    console.error('Erreur inattendue:', err);

    const toast = await toastController.create({
      message: 'Une erreur inattendue est survenue. Vérifiez votre connexion internet.',
      duration: 4000,
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
/* Reset Ionic padding */
ion-content {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}

.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  max-width: 450px;
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
  font-size: 3.5rem;
  color: #0ea5e9;
  margin-bottom: 0.75rem;
}

.main-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Form */
.login-form {
  margin-bottom: 1.5rem;
}

.input-group {
  margin-bottom: 1.25rem;
}

.custom-input {
  --background: #f8f9fa;
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  border-radius: 12px;
  background: #f8f9fa;
}

.custom-input ion-label {
  --color: #6b7280;
  font-weight: 500;
}

.custom-input ion-input {
  --color: #1f2937;
  font-size: 1rem;
}

/* Submit Button */
.login-submit-button {
  --border-radius: 12px;
  --background: #0ea5e9;
  --background-hover: #0284c7;
  --background-activated: #0369a1;
  --box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  height: 56px;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  margin-top: 0.5rem;
}

.login-submit-button ion-spinner {
  width: 24px;
  height: 24px;
}

/* Info Box */
.info-box {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  text-align: center;
}

.info-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

/* Back Button */
.back-button {
  --color: #6b7280;
  --color-hover: #4b5563;
  font-size: 0.9rem;
  height: 44px;
}

.back-button ion-icon {
  font-size: 1.25rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .login-container {
    padding: 2rem 1.5rem;
  }

  .main-title {
    font-size: 1.625rem;
  }

  .logo-icon {
    font-size: 3rem;
  }
}
</style>