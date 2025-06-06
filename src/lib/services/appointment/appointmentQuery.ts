import { collection, query, where, getDocs, getDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase/schema";
import { format } from 'date-fns';
import { appointmentApi } from '@/lib/api/appointmentApi';

export const getUserAppointments = async (userId: string) => {
  try {
    if (!userId) {
      console.error("❌ Invalid user ID provided to getUserAppointments");
      return [];
    }

    console.log("🔍 Getting appointments for user:", userId);
    const appointmentsCollection = collection(db, COLLECTIONS.APPOINTMENTS);

    // Sadece userId ile filtrele - index gerektirmez
    const q = query(
      appointmentsCollection,
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    console.log("📅 Found appointments count:", snapshot.docs.length);

    const appointments = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log("📋 Raw appointment data:", { id: doc.id, ...data });
      return {
        id: doc.id,
        ...data
      } as any;
    });

    // Client-side'da tarihe göre sırala - en son alınan önce
    const sortedAppointments = appointments.sort((a: any, b: any) => {
      // Canceled appointments: most recently canceled first
      if (a.status === 'canceled' && b.status === 'canceled') {
        const canceledAtA = a.canceledAt?.toDate ? a.canceledAt.toDate() : new Date(a.canceledAt || a.updatedAt || a.createdAt);
        const canceledAtB = b.canceledAt?.toDate ? b.canceledAt.toDate() : new Date(b.canceledAt || b.updatedAt || b.createdAt);
        return canceledAtB.getTime() - canceledAtA.getTime();
      }

      // Regular appointments: most recently created first
      const createdAtA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const createdAtB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return createdAtB.getTime() - createdAtA.getTime();
    });

    console.log("✅ Successfully retrieved appointments:", sortedAppointments);
    return sortedAppointments;
  } catch (error) {
    console.error("❌ Error getting user appointments:", error);
    throw new Error(`Randevular alınamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
};

// API kullanarak kullanıcı randevularını getir
export const getUserAppointmentsViaApi = async () => {
  try {
    console.log("🔍 Getting user appointments via API");
    const response = await appointmentApi.getUserAppointments();

    if (response.success && response.data) {
      console.log("✅ Successfully retrieved appointments via API:", response.data.length);
      return response.data;
    } else {
      console.error("❌ Error getting user appointments via API:", response.error);
      return [];
    }
  } catch (error) {
    console.error("❌ Error getting user appointments via API:", error);
    return [];
  }
};

export const getShopAppointments = async (shopId: string) => {
  try {
    if (!shopId) {
      console.error("Invalid shop ID");
      return [];
    }

    console.log("Getting appointments for shop:", shopId);
    const appointmentsCollection = collection(db, COLLECTIONS.APPOINTMENTS);

    // Sadece shopId ile filtrele
    const q = query(
      appointmentsCollection,
      where("shopId", "==", shopId)
    );

    const snapshot = await getDocs(q);
    console.log("Found shop appointments:", snapshot.docs.length);

    const appointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Client-side sıralama - en yeni önce
    return appointments.sort((a: any, b: any) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Error getting shop appointments:", error);
    throw new Error("İşletme randevuları alınamadı");
  }
};

export const getAppointmentsForDate = async (shopId: string, date: Date) => {
  try {
    if (!shopId || !date) {
      console.error("Invalid shop ID or date");
      return [];
    }

    console.log("Getting appointments for date:", format(date, 'yyyy-MM-dd'));
    const appointmentsCollection = collection(db, COLLECTIONS.APPOINTMENTS);

    // Sadece shopId ile filtrele
    const q = query(
      appointmentsCollection,
      where("shopId", "==", shopId)
    );

    const snapshot = await getDocs(q);
    console.log("Found appointments for shop:", snapshot.docs.length);

    const allAppointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Client-side'da tarihe göre filtrele
    const targetDate = format(date, 'yyyy-MM-dd');
    const filteredAppointments = allAppointments.filter((app: any) => {
      const appDate = app.date?.toDate ? app.date.toDate() : new Date(app.date);
      const appDateStr = format(appDate, 'yyyy-MM-dd');
      return appDateStr === targetDate;
    });

    // Saate göre sırala
    const sortedAppointments = filteredAppointments.sort((a: any, b: any) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    console.log("Found appointments for date:", sortedAppointments.length);
    return sortedAppointments;
  } catch (error) {
    console.error("Error getting appointments for date:", error);
    throw new Error("Belirtilen tarihteki randevular alınamadı");
  }
};

export const getAppointmentDetails = async (appointmentId: string) => {
  try {
    if (!appointmentId) {
      console.error("Invalid appointment ID");
      return null;
    }

    console.log("Getting appointment details for:", appointmentId);
    const appointmentDoc = await getDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId));

    if (!appointmentDoc.exists()) {
      console.error("Appointment not found");
      return null;
    }

    const appointmentData = {
      id: appointmentDoc.id,
      ...appointmentDoc.data()
    } as any;

    // İşletme bilgilerini al
    let shopData = {};
    if (appointmentData.shopId) {
      const shopDoc = await getDoc(doc(db, COLLECTIONS.SHOPS, appointmentData.shopId));
      shopData = shopDoc.exists() ? shopDoc.data() : {};
    }

    // Servis bilgilerini al
    let serviceData = {};
    if (appointmentData.serviceId) {
      const serviceDoc = await getDoc(doc(db, COLLECTIONS.SERVICES, appointmentData.serviceId));
      serviceData = serviceDoc.exists() ? serviceDoc.data() : {};
    }

    // Personel bilgilerini al (eğer personel seçilmişse)
    let staffData = {};
    if (appointmentData.staffId) {
      const staffDoc = await getDoc(doc(db, COLLECTIONS.STAFF, appointmentData.staffId));
      staffData = staffDoc.exists() ? staffDoc.data() : {};
    }

    return {
      ...appointmentData,
      shop: shopData,
      service: serviceData,
      staff: appointmentData.staffId ? staffData : null
    };
  } catch (error) {
    console.error("Error getting appointment details:", error);
    throw new Error("Randevu detayları alınamadı");
  }
};
