<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <!-- Tab Carte - Toujours visible -->
        <ion-tab-button tab="map" href="/tabs/map">
          <ion-icon :icon="map"></ion-icon>
          <ion-label>Carte</ion-label>
        </ion-tab-button>

        <!-- Tab Tous les signalements - Toujours visible -->
        <ion-tab-button tab="all-signalements" href="/tabs/all-signalements">
          <ion-icon :icon="listCircle"></ion-icon>
          <ion-label>Tous</ion-label>
        </ion-tab-button>

        <!-- Tabs pour utilisateurs connectés -->
        <template v-if="isAuthenticated">
          <ion-tab-button tab="signalements" href="/tabs/signalements">
            <ion-icon :icon="list"></ion-icon>
            <ion-label>Mes signalements</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="account" href="/tabs/account">
            <ion-icon :icon="person"></ion-icon>
            <ion-label>Mon compte</ion-label>
          </ion-tab-button>
        </template>

        <!-- Tab pour visiteurs -->
        <ion-tab-button v-else tab="login" href="/login">
          <ion-icon :icon="logIn"></ion-icon>
          <ion-label>Se connecter</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/vue';
import { map, list, person, logIn, listCircle } from 'ionicons/icons';
import { useUserContext } from '@/services/user-context.service';

const { isAuthenticated } = useUserContext();
</script>