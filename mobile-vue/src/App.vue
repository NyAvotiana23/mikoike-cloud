<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useAuth } from '@/services/auth.service';
import '@/services/leaflet-icon-fix';

const { currentUser } = useAuth();

onMounted(() => {
  console.log('App initialisée');
});
</script>