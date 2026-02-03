import { ref } from 'vue';
import type { Notification, NotificationSettings } from '@/types/notification';

const NOTIFICATIONS_STORAGE_KEY = 'road_works_notifications';
const SETTINGS_STORAGE_KEY = 'road_works_notification_settings';

// Données de notifications mockées
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    userId: '1',
    signalementId: '3',
    signalementTitre: 'Réparation post-inondation',
    type: 'status_change',
    title: 'Signalement terminé',
    message: 'Votre signalement "Réparation post-inondation" a été marqué comme terminé.',
    oldStatus: 'en_cours',
    newStatus: 'termine',
    date: new Date('2026-01-25T14:30:00').toISOString(),
    read: false
  },
  {
    id: '2',
    userId: '1',
    signalementId: '7',
    signalementTitre: 'Rénovation carrefour principal',
    type: 'status_change',
    title: 'Signalement terminé',
    message: 'Votre signalement "Rénovation carrefour principal" a été marqué comme terminé. Les travaux sont achevés.',
    oldStatus: 'en_cours',
    newStatus: 'termine',
    date: new Date('2026-01-26T10:15:00').toISOString(),
    read: false
  },
  {
    id: '3',
    userId: '1',
    signalementId: '1',
    signalementTitre: 'Réparation avenue Indépendance',
    type: 'status_change',
    title: 'Travaux démarrés',
    message: 'Les travaux sur votre signalement "Réparation avenue Indépendance" ont commencé.',
    oldStatus: 'nouveau',
    newStatus: 'en_cours',
    date: new Date('2026-01-20T09:00:00').toISOString(),
    read: true
  },
  {
    id: '4',
    userId: '1',
    signalementId: '4',
    signalementTitre: 'Route Analakely dégradée',
    type: 'new_assignment',
    title: 'Entreprise assignée',
    message: 'Une entreprise a été assignée à votre signalement "Route Analakely dégradée". Infrastructure Pro prendra en charge les travaux.',
    date: new Date('2026-01-28T11:45:00').toISOString(),
    read: false
  },
  {
    id: '5',
    userId: '1',
    signalementId: '6',
    signalementTitre: 'Affaissement chaussée',
    type: 'reminder',
    title: 'Rappel',
    message: 'Votre signalement "Affaissement chaussée" est toujours en attente de traitement. Nous y travaillons.',
    date: new Date('2026-02-01T08:00:00').toISOString(),
    read: false
  },
  {
    id: '6',
    userId: '1',
    type: 'info',
    title: 'Mise à jour de l\'application',
    message: 'Une nouvelle version de l\'application est disponible avec des améliorations de performance.',
    date: new Date('2026-02-02T15:00:00').toISOString(),
    read: true
  },
  {
    id: '7',
    userId: '2',
    signalementId: '8',
    signalementTitre: 'Réparation mineure (annulée)',
    type: 'status_change',
    title: 'Signalement annulé',
    message: 'Votre signalement "Réparation mineure (annulée)" a été annulé suite à un changement de priorité.',
    oldStatus: 'nouveau',
    newStatus: 'annule',
    date: new Date('2026-01-25T16:20:00').toISOString(),
    read: false
  },
  {
    id: '8',
    userId: '2',
    signalementId: '2',
    signalementTitre: 'Réfection Route Digue',
    type: 'status_change',
    title: 'Travaux en cours',
    message: 'Les travaux sur votre signalement "Réfection Route Digue" ont commencé.',
    oldStatus: 'nouveau',
    newStatus: 'en_cours',
    date: new Date('2026-01-12T08:30:00').toISOString(),
    read: true
  }
];

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  statusChanges: true,
  newAssignments: true,
  reminders: true
};

class NotificationsService {
  private notifications = ref<Notification[]>([]);
  private settings = ref<NotificationSettings>(DEFAULT_SETTINGS);

  constructor() {
    this.loadNotifications();
    this.loadSettings();
  }

  private loadNotifications() {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      this.notifications.value = JSON.parse(stored);
    } else {
      this.notifications.value = MOCK_NOTIFICATIONS;
      this.saveNotificationsToStorage();
    }
  }

  private loadSettings() {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      this.settings.value = JSON.parse(stored);
    } else {
      this.settings.value = DEFAULT_SETTINGS;
      this.saveSettingsToStorage();
    }
  }

  private saveNotificationsToStorage() {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(this.notifications.value));
  }

  private saveSettingsToStorage() {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings.value));
  }

  // Récupérer toutes les notifications d'un utilisateur
  getAll(userId: string): Notification[] {
    return this.notifications.value;
  }

  // Récupérer les notifications non lues d'un utilisateur
  getUnread(userId: string): Notification[] {
    return this.getAll(userId).filter(n => !n.read);
  }

  // Nombre de notifications non lues
  getUnreadCount(userId: string): number {
    return this.getUnread(userId).length;
  }

  // Marquer une notification comme lue
  markAsRead(id: string): boolean {
    const notification = this.notifications.value.find(n => n.id === id);
    if (!notification) return false;

    notification.read = true;
    this.saveNotificationsToStorage();
    return true;
  }

  // Marquer toutes les notifications comme lues
  markAllAsRead(userId: string): void {
    this.notifications.value
      .filter(n => n.userId === userId)
      .forEach(n => n.read = true);
    this.saveNotificationsToStorage();
  }

  // Supprimer une notification
  delete(id: string): boolean {
    const index = this.notifications.value.findIndex(n => n.id === id);
    if (index === -1) return false;

    this.notifications.value.splice(index, 1);
    this.saveNotificationsToStorage();
    return true;
  }

  // Ajouter une nouvelle notification
  add(notification: Omit<Notification, 'id' | 'date' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      read: false
    };

    this.notifications.value.push(newNotification);
    this.saveNotificationsToStorage();
    return newNotification;
  }

  // Récupérer les paramètres de notifications
  getSettings(): NotificationSettings {
    return { ...this.settings.value };
  }

  // Mettre à jour les paramètres
  updateSettings(updates: Partial<NotificationSettings>): NotificationSettings {
    this.settings.value = {
      ...this.settings.value,
      ...updates
    };
    this.saveSettingsToStorage();
    return this.getSettings();
  }

  // Vérifier si les notifications sont activées
  isEnabled(): boolean {
    return this.settings.value.enabled;
  }

  // Activer/désactiver les notifications
  setEnabled(enabled: boolean): void {
    this.updateSettings({ enabled });
  }
}

export default new NotificationsService();
