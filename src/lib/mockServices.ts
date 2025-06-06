
import { addNotification, NotificationType } from './notificationUtils';

// Add some mock notifications for testing
export const populateMockNotifications = () => {
  const now = Date.now();
  
  // System welcome notification
  setTimeout(() => {
    addNotification({
      type: NotificationType.SYSTEM,
      title: 'AppointMe\'ye Hoş Geldiniz!',
      message: 'Randevu yönetim sistemimizle randevularınızı kolayca yönetebilirsiniz.'
    });
  }, 2000);
  
  // Appointment confirmation
  setTimeout(() => {
    addNotification({
      type: NotificationType.APPOINTMENT_CONFIRMATION,
      title: 'Randevu Onaylandı',
      message: 'Seyfi Erkek Kuaförü randevunuz onaylandı. 25 Mayıs 2025, saat 10:00\'da sizi bekliyor olacağız.',
      data: {
        appointmentId: "1",
        shopId: "1",
        shopName: "Seyfi Erkek Kuaförü",
        appointmentDate: "2025-05-25",
        appointmentTime: "10:00"
      }
    });
  }, 5000);
  
  // New message notification
  setTimeout(() => {
    addNotification({
      type: NotificationType.MESSAGE,
      title: 'Yeni Mesaj',
      message: 'Show Kuaför Edremit: Merhaba, randevunuz için teşekkür ederiz. Herhangi bir özel isteğiniz var mı?',
      data: {
        messageId: "m1",
        shopId: "4",
        shopName: "Show Kuaför Edremit"
      }
    });
  }, 8000);
};

// Initialize mock services
export const initializeMockServices = () => {
  populateMockNotifications();
};
