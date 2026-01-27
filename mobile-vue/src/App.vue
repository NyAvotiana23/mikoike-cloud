<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useAuth } from '@/services/auth.service';
import { useUserContext } from '@/services/user-context.service';
import '@/services/leaflet-icon-fix';

const { currentUser } = useAuth();
const { setAuthenticatedUser, setVisitor } = useUserContext();

onMounted(() => {
  console.log('App initialisée');

  // Initialiser le contexte utilisateur en fonction de l'état d'authentification
  const user = currentUser.value;
  if (user && user.id) {
    setAuthenticatedUser(user);
  } else {
    setVisitor();
  }
});
</script>