<template>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-buttons slot="start">
        <ion-menu-button></ion-menu-button>
      </ion-buttons>
      <ion-title>{{ title }}</ion-title>
      <ion-buttons slot="end" v-if="isAuthenticated">
        <ion-button @click="handleLogout">
          <ion-icon :icon="logOut"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonMenuButton, IonIcon } from '@ionic/vue';
import { logOut } from 'ionicons/icons';
import { useAuth } from '@/services/auth.service';
import { useRouter } from 'vue-router';

defineProps<{ title: string }>();

const { isAuthenticated, logout } = useAuth();
const router = useRouter();

const handleLogout = async () => {
  await logout();
  router.push('/login');
};
</script>