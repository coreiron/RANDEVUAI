
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase/schema";
import { format } from 'date-fns';

export interface BusinessAppointment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  shopId: string;
  shopName: string;
  serviceId: string;
  serviceName: string;
  staffId?: string;
  staffName?: string;
  date: Date;
  time: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed' | 'scheduled';
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const getBusinessAppointments = async (shopId: string): Promise<BusinessAppointment[]> => {
  try {
    if (!shopId) {
      console.error("❌ Invalid shop ID provided to getBusinessAppointments");
      return [];
    }

    console.log("🔍 Getting appointments for business:", shopId);
    const appointmentsCollection = collection(db, COLLECTIONS.APPOINTMENTS);
    
    // İşletme ID'sine göre randevuları getir
    const q = query(
      appointmentsCollection,
      where("shopId", "==", shopId)
    );

    const snapshot = await getDocs(q);
    console.log("📅 Found business appointments count:", snapshot.docs.length);

    const appointments: BusinessAppointment[] = [];

    for (const appointmentDoc of snapshot.docs) {
      const data = appointmentDoc.data();
      console.log("📋 Processing appointment:", { id: appointmentDoc.id, ...data });

      try {
        // Kullanıcı bilgilerini al
        let userName = "Bilinmeyen Kullanıcı";
        let userEmail = "";
        let userPhone = "";
        
        if (data.userId) {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, data.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userName = userData.displayName || userData.name || "Bilinmeyen Kullanıcı";
            userEmail = userData.email || "";
            userPhone = userData.phone || "";
          }
        }

        // Servis bilgilerini al
        let serviceName = "Bilinmeyen Servis";
        if (data.serviceId) {
          const serviceDoc = await getDoc(doc(db, COLLECTIONS.SERVICES, data.serviceId));
          if (serviceDoc.exists()) {
            const serviceData = serviceDoc.data();
            serviceName = serviceData.name || "Bilinmeyen Servis";
          }
        }

        // Personel bilgilerini al (eğer varsa)
        let staffName = "";
        if (data.staffId) {
          const staffDoc = await getDoc(doc(db, COLLECTIONS.STAFF, data.staffId));
          if (staffDoc.exists()) {
            const staffData = staffDoc.data();
            staffName = staffData.name || "";
          }
        }

        // İşletme bilgilerini al
        let shopName = "Bilinmeyen İşletme";
        if (data.shopId) {
          const shopDoc = await getDoc(doc(db, COLLECTIONS.SHOPS, data.shopId));
          if (shopDoc.exists()) {
            const shopData = shopDoc.data();
            shopName = shopData.name || "Bilinmeyen İşletme";
          }
        }

        // Tarih dönüşümü
        const appointmentDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);

        const appointment: BusinessAppointment = {
          id: appointmentDoc.id,
          userId: data.userId || "",
          userName,
          userEmail,
          userPhone,
          shopId: data.shopId || "",
          shopName,
          serviceId: data.serviceId || "",
          serviceName,
          staffId: data.staffId,
          staffName,
          date: appointmentDate,
          time: data.time || format(appointmentDate, 'HH:mm'),
          duration: data.duration || 30,
          price: data.price || 0,
          status: data.status || 'pending',
          notes: data.notes || "",
          createdAt: createdAtDate,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined
        };

        appointments.push(appointment);
      } catch (error) {
        console.error("Error processing appointment:", appointmentDoc.id, error);
      }
    }

    // En yeni randevular önce gelsin
    const sortedAppointments = appointments.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    console.log("✅ Successfully processed business appointments:", sortedAppointments.length);
    return sortedAppointments;
  } catch (error) {
    console.error("❌ Error getting business appointments:", error);
    throw new Error(`İşletme randevuları alınamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
};

export const getBusinessAppointmentsByStatus = async (shopId: string, status: string): Promise<BusinessAppointment[]> => {
  try {
    const allAppointments = await getBusinessAppointments(shopId);
    return allAppointments.filter(appointment => appointment.status === status);
  } catch (error) {
    console.error("Error getting business appointments by status:", error);
    return [];
  }
};

export const getTodayBusinessAppointments = async (shopId: string): Promise<BusinessAppointment[]> => {
  try {
    const allAppointments = await getBusinessAppointments(shopId);
    const today = format(new Date(), 'yyyy-MM-dd');
    
    return allAppointments.filter(appointment => {
      const appointmentDate = format(appointment.date, 'yyyy-MM-dd');
      return appointmentDate === today;
    });
  } catch (error) {
    console.error("Error getting today's business appointments:", error);
    return [];
  }
};
