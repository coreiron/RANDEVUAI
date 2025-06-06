
import { toast } from '@/components/ui/sonner';

// Example notification types
export enum NotificationType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  APPOINTMENT_CANCELED = 'appointment_canceled',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',
  MESSAGE = 'message',
  SYSTEM = 'system'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

// Local storage key for notifications
const NOTIFICATIONS_STORAGE_KEY = 'appointme_notifications';

// Get all notifications
export const getNotifications = (): Notification[] => {
  const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (!storedNotifications) return [];
  
  try {
    return JSON.parse(storedNotifications);
  } catch (error) {
    console.error('Error parsing notifications:', error);
    return [];
  }
};

// Add a notification
export const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification => {
  const newNotification: Notification = {
    id: `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    read: false,
    ...notification
  };
  
  const notifications = getNotifications();
  notifications.unshift(newNotification);
  
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  
  // Show notification in UI
  toast.info(notification.title, {
    description: notification.message,
    action: {
      label: 'Göster',
      onClick: () => window.location.href = '/notifications',
    },
  });
  
  return newNotification;
};

// Mark notification as read
export const markNotificationAsRead = (notificationId: string): void => {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map(notification => 
    notification.id === notificationId ? { ...notification, read: true } : notification
  );
  
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
};

// Mark all notifications as read
export const markAllNotificationsAsRead = (): void => {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
  
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
};

// Delete a notification
export const deleteNotification = (notificationId: string): void => {
  const notifications = getNotifications();
  const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
  
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
};

// Clear all notifications
export const clearAllNotifications = (): void => {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
};

// Get unread notifications count
export const getUnreadNotificationsCount = (): number => {
  const notifications = getNotifications();
  return notifications.filter(notification => !notification.read).length;
};

// Schedule an appointment reminder
export const scheduleAppointmentReminder = (
  appointmentId: string,
  shopName: string,
  serviceName: string,
  appointmentDate: Date,
  reminderMinutesBefore: number = 60 // Default 1 hour before
): void => {
  const reminderTime = new Date(appointmentDate.getTime() - reminderMinutesBefore * 60 * 1000).getTime();
  const now = new Date().getTime();
  
  // Only schedule if the reminder time is in the future
  if (reminderTime > now) {
    const timeoutId = window.setTimeout(() => {
      addNotification({
        type: NotificationType.APPOINTMENT_REMINDER,
        title: 'Randevu Hatırlatması',
        message: `${shopName} işletmesindeki ${serviceName} randevunuz ${reminderMinutesBefore / 60} saat içerisinde başlayacak!`,
        data: { appointmentId }
      });
    }, reminderTime - now);
    
    // Store the timeout ID in localStorage to persist across page reloads
    const storedTimeouts = JSON.parse(localStorage.getItem('appointment_reminders') || '{}');
    storedTimeouts[appointmentId] = {
      timeoutId,
      reminderTime
    };
    localStorage.setItem('appointment_reminders', JSON.stringify(storedTimeouts));
  }
};

// Initialize reminders from localStorage on app start
export const initializeReminders = (): void => {
  const storedTimeouts = JSON.parse(localStorage.getItem('appointment_reminders') || '{}');
  const now = new Date().getTime();
  
  Object.entries(storedTimeouts).forEach(([appointmentId, data]: [string, any]) => {
    const { reminderTime } = data;
    
    // If the reminder time is in the future, reschedule it
    if (reminderTime > now) {
      const timeoutId = window.setTimeout(() => {
        // We would need to fetch the appointment details from a database in a real app
        // For now, just show a generic reminder
        addNotification({
          type: NotificationType.APPOINTMENT_REMINDER,
          title: 'Randevu Hatırlatması',
          message: 'Yaklaşan randevunuz var!',
          data: { appointmentId }
        });
      }, reminderTime - now);
      
      // Update the timeout ID
      storedTimeouts[appointmentId].timeoutId = timeoutId;
    } else {
      // Remove expired reminders
      delete storedTimeouts[appointmentId];
    }
  });
  
  localStorage.setItem('appointment_reminders', JSON.stringify(storedTimeouts));
};

// Initialize notifications system
export const initializeNotifications = (): void => {
  console.log('Initializing notification system');
  
  // Setup demo notifications if none exist
  if (getNotifications().length === 0) {
    // Add some example notifications for testing
    addNotification({
      type: NotificationType.SYSTEM,
      title: 'AppointMe\'ye Hoş Geldiniz!',
      message: 'Randevu yönetim sistemimizle randevularınızı kolayca yönetebilirsiniz.'
    });
  }
  
  // Initialize reminders
  initializeReminders();
};
