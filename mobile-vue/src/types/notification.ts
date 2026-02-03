export type NotificationType = 'status_change' | 'new_assignment' | 'reminder' | 'info';

export interface Notification {
  id: string;
  userId: string;
  signalementId?: string;
  signalementTitre?: string;
  type: NotificationType;
  title: string;
  message: string;
  oldStatus?: string;
  newStatus?: string;
  date: string;
  read: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  statusChanges: boolean;
  newAssignments: boolean;
  reminders: boolean;
}
