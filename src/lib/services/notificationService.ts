
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { COLLECTIONS } from "../firebase/schema";
import { toast } from "@/components/ui/sonner";

// Kullanıcı bildirimlerini getir
export const getUserNotifications = async (page = 1, pageLimit = 20) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { notifications: [], page, limit: pageLimit, hasMore: false, unreadCount: 0 };
    }

    const notificationsCollection = collection(db, COLLECTIONS.NOTIFICATIONS);
    
    // Sadece userId ile filtrele - index gerektirmez
    const q = query(
      notificationsCollection,
      where("userId", "==", currentUser.uid),
      limit(pageLimit)
    );
    
    const snapshot = await getDocs(q);
    
    // Client-side'da tarihe göre sırala ve okunmayan sayısını hesapla
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const sortedNotifications = notifications.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    const unreadCount = notifications.filter((n: any) => !n.read).length;
    
    return {
      notifications: sortedNotifications,
      page,
      limit: pageLimit,
      hasMore: snapshot.docs.length === pageLimit,
      unreadCount
    };
  } catch (error) {
    console.error("Bildirimleri getirme hatası:", error);
    return { notifications: [], page, limit: pageLimit, hasMore: false, unreadCount: 0 };
  }
};

// Bildirimi okundu olarak işaretle
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Kullanıcı oturum açmamış");
    }

    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Bildirim güncelleme hatası:", error);
    throw error;
  }
};

// Tüm bildirimleri okundu olarak işaretle
export const markAllNotificationsAsRead = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Kullanıcı oturum açmamış");
    }

    const notificationsCollection = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = query(
      notificationsCollection,
      where("userId", "==", currentUser.uid),
      where("read", "==", false)
    );
    
    const snapshot = await getDocs(q);
    
    // Her bir bildirimi güncelle
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        read: true,
        readAt: serverTimestamp()
      })
    );
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Bildirimleri güncelleme hatası:", error);
    throw error;
  }
};

// Bildirim sayısını al
export const getUnreadNotificationCount = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return 0;
    }

    const notificationsCollection = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = query(
      notificationsCollection,
      where("userId", "==", currentUser.uid),
      where("read", "==", false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Bildirim sayısı getirme hatası:", error);
    return 0;
  }
};

// Randevu bildirimi oluştur
export const createAppointmentNotification = async (
  userId: string, 
  type: 'created' | 'canceled' | 'confirmed', 
  appointmentId: string,
  shopName: string,
  serviceName: string,
  appointmentDate: Date
) => {
  try {
    const messages = {
      created: `${shopName} işletmesinde ${serviceName} için randevunuz oluşturuldu.`,
      canceled: `${shopName} işletmesindeki randevunuz iptal edildi.`,
      confirmed: `${shopName} işletmesindeki randevunuz onaylandı.`
    };

    const titles = {
      created: 'Yeni Randevu Oluşturuldu',
      canceled: 'Randevu İptal Edildi',
      confirmed: 'Randevu Onaylandı'
    };

    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      userId,
      title: titles[type],
      message: messages[type],
      type: 'appointment',
      read: false,
      relatedId: appointmentId,
      data: {
        appointmentId,
        shopName,
        serviceName,
        appointmentDate: appointmentDate.toISOString(),
        notificationType: type
      },
      createdAt: serverTimestamp()
    });

    console.log("Appointment notification created successfully");
  } catch (error) {
    console.error("Error creating appointment notification:", error);
  }
};
