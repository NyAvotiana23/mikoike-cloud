<template>
  <ion-page>
    <app-header title="Notifications" :show-back="true"></app-header>

    <ion-content>
      <div class="notifications-container">
        <!-- Paramètres des notifications -->
        <ion-list class="settings-section">
          <ion-list-header>
            <ion-label class="section-header">Paramètres</ion-label>
          </ion-list-header>

          <ion-item class="setting-item">
            <ion-icon slot="start" :icon="notificationsOutline"></ion-icon>
            <ion-label>Activer les notifications</ion-label>
            <ion-toggle
              :checked="settings.enabled"
              @ionChange="toggleMainSetting"
            ></ion-toggle>
          </ion-item>

          <ion-item class="setting-item" :disabled="!settings.enabled">
            <ion-icon slot="start" :icon="swapHorizontal"></ion-icon>
            <ion-label>Changements de statut</ion-label>
            <ion-toggle
              :checked="settings.statusChanges"
              :disabled="!settings.enabled"
              @ionChange="(e: any) => updateSetting('statusChanges', e.detail.checked)"
            ></ion-toggle>
          </ion-item>

          <ion-item class="setting-item" :disabled="!settings.enabled">
            <ion-icon slot="start" :icon="business"></ion-icon>
            <ion-label>Nouvelles assignations</ion-label>
            <ion-toggle
              :checked="settings.newAssignments"
              :disabled="!settings.enabled"
              @ionChange="(e: any) => updateSetting('newAssignments', e.detail.checked)"
            ></ion-toggle>
          </ion-item>

          <ion-item class="setting-item" :disabled="!settings.enabled">
            <ion-icon slot="start" :icon="alarm"></ion-icon>
            <ion-label>Rappels</ion-label>
            <ion-toggle
              :checked="settings.reminders"
              :disabled="!settings.enabled"
              @ionChange="(e: any) => updateSetting('reminders', e.detail.checked)"
            ></ion-toggle>
          </ion-item>
        </ion-list>

        <!-- Liste des notifications -->
        <div class="notifications-header">
          <h2 class="section-title">Mes notifications</h2>
          <ion-button
            v-if="unreadCount > 0"
            fill="clear"
            size="small"
            @click="markAllRead"
          >
            Tout marquer comme lu
          </ion-button>
        </div>

        <!-- Badge pour les non lues -->
        <div v-if="unreadCount > 0" class="unread-badge">
          <ion-chip color="primary">
            <ion-icon :icon="mailUnread"></ion-icon>
            <ion-label>{{ unreadCount }} non lue(s)</ion-label>
          </ion-chip>
        </div>

        <!-- Liste vide -->
        <div v-if="notifications.length === 0" class="empty-state">
          <ion-icon :icon="notificationsOffOutline" class="empty-icon"></ion-icon>
          <p class="empty-text">Aucune notification</p>
        </div>

        <!-- Notifications -->
        <ion-list v-else class="notifications-list">
          <ion-item-sliding v-for="notification in notifications" :key="notification.id">
            <ion-item
              class="notification-item"
              :class="{ 'unread': !notification.read }"
              @click="openNotification(notification)"
              button
            >
              <div slot="start" class="notification-icon-wrapper">
                <ion-icon
                  :icon="getNotificationIcon(notification.type)"
                  :class="getNotificationIconClass(notification.type)"
                ></ion-icon>
                <div v-if="!notification.read" class="unread-dot"></div>
              </div>
              <ion-label>
                <h3 class="notification-title">{{ notification.title }}</h3>
                <p class="notification-message">{{ notification.message }}</p>
                <p class="notification-date">
                  <ion-icon :icon="timeOutline" size="small"></ion-icon>
                  {{ formatDate(notification.date) }}
                </p>
              </ion-label>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option color="danger" @click="deleteNotification(notification.id)">
                <ion-icon slot="icon-only" :icon="trash"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  IonPage, IonContent, IonList, IonListHeader, IonItem, IonLabel,
  IonIcon, IonToggle, IonButton, IonChip, IonItemSliding,
  IonItemOptions, IonItemOption, alertController, toastController
} from '@ionic/vue';
import {
  notificationsOutline, swapHorizontal, business, alarm, mailUnread,
  notificationsOffOutline, timeOutline, trash,
  informationCircle, megaphone
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import { useUserContext } from '@/services/user-context.service';
import notificationsService from '@/services/notifications.service';
import type { Notification, NotificationSettings } from '@/types/notification';

const { userContext } = useUserContext();

const notifications = ref<Notification[]>([]);
const settings = ref<NotificationSettings>(notificationsService.getSettings());

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

onMounted(() => {
  loadNotifications();
});

const loadNotifications = () => {
  if (userContext.value.userId) {
    notifications.value = notificationsService.getAll(userContext.value.userId);
  }
};

const toggleMainSetting = (event: any) => {
  settings.value = notificationsService.updateSettings({ enabled: event.detail.checked });
};

const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
  settings.value = notificationsService.updateSettings({ [key]: value });
};

const markAllRead = async () => {
  if (userContext.value.userId) {
    notificationsService.markAllAsRead(userContext.value.userId);
    loadNotifications();

    const toast = await toastController.create({
      message: 'Toutes les notifications marquées comme lues',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }
};

const openNotification = async (notification: Notification) => {
  notificationsService.markAsRead(notification.id);
  loadNotifications();

  const alert = await alertController.create({
    header: notification.title,
    message: notification.message,
    buttons: ['OK']
  });
  await alert.present();
};

const deleteNotification = async (id: string) => {
  const alert = await alertController.create({
    header: 'Supprimer',
    message: 'Voulez-vous supprimer cette notification ?',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Supprimer',
        role: 'destructive',
        handler: async () => {
          notificationsService.delete(id);
          loadNotifications();

          const toast = await toastController.create({
            message: 'Notification supprimée',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          await toast.present();
        }
      }
    ]
  });
  await alert.present();
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'status_change':
      return swapHorizontal;
    case 'new_assignment':
      return business;
    case 'reminder':
      return alarm;
    case 'info':
      return informationCircle;
    default:
      return megaphone;
  }
};

const getNotificationIconClass = (type: string) => {
  switch (type) {
    case 'status_change':
      return 'icon-status';
    case 'new_assignment':
      return 'icon-assignment';
    case 'reminder':
      return 'icon-reminder';
    case 'info':
      return 'icon-info';
    default:
      return 'icon-default';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return "À l'instant";
  } else if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};
</script>

<style scoped>
.notifications-container {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

/* Settings Section */
.settings-section {
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

.setting-item {
  --padding-start: 1rem;
  --padding-end: 1rem;
  --min-height: 56px;
}

/* Notifications Header */
.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Unread Badge */
.unread-badge {
  margin-bottom: 1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-text {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

/* Notifications List */
.notifications-list {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.notification-item {
  --padding-start: 1rem;
  --padding-end: 1rem;
  --min-height: 80px;
  border-bottom: 1px solid #f3f4f6;
}

.notification-item.unread {
  background: #f0f9ff;
}

.notification-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f3f4f6;
  margin-right: 0.5rem;
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
}

.icon-status {
  font-size: 1.5rem;
  color: #0ea5e9;
}

.icon-assignment {
  font-size: 1.5rem;
  color: #8b5cf6;
}

.icon-reminder {
  font-size: 1.5rem;
  color: #f59e0b;
}

.icon-info {
  font-size: 1.5rem;
  color: #6b7280;
}

.icon-default {
  font-size: 1.5rem;
  color: #6b7280;
}

.notification-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
}
</style>
