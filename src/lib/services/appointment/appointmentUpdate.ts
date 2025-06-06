
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase/schema";
import { toast } from "@/components/ui/sonner";
import { createAppointmentNotification } from "@/lib/services/notificationService";

export const updateAppointmentStatus = async (
  appointmentId: string, 
  newStatus: string,
  reason?: string
) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Kullanıcı oturum açmamış");
    }

    console.log("🔄 Updating appointment status:", { appointmentId, newStatus });

    const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
    const appointmentDoc = await getDoc(appointmentRef);
    
    if (!appointmentDoc.exists()) {
      throw new Error("Randevu bulunamadı");
    }

    const appointmentData = appointmentDoc.data();
    
    // Update the appointment status
    const updateData: any = {
      status: newStatus,
      updatedAt: serverTimestamp(),
    };

    // Set confirmation flags based on status
    if (newStatus === 'confirmed') {
      updateData.businessConfirmed = true;
    } else if (newStatus === 'canceled') {
      updateData.canceledAt = serverTimestamp();
      if (reason) {
        updateData.cancelReason = reason;
      }
    } else if (newStatus === 'completed') {
      updateData.completedAt = serverTimestamp();
    }

    await updateDoc(appointmentRef, updateData);

    // Get shop and service details for notification
    try {
      const shopDoc = await getDoc(doc(db, COLLECTIONS.SHOPS, appointmentData.shopId));
      const serviceDoc = await getDoc(doc(db, COLLECTIONS.SERVICES, appointmentData.serviceId));
      
      const shopName = shopDoc.exists() ? shopDoc.data()?.name || 'Bilinmeyen İşletme' : 'Bilinmeyen İşletme';
      const serviceName = serviceDoc.exists() ? serviceDoc.data()?.name || 'Bilinmeyen Hizmet' : 'Bilinmeyen Hizmet';

      // Create notification for the user
      let notificationType: 'confirmed' | 'canceled' | 'created' = 'confirmed';
      if (newStatus === 'canceled') notificationType = 'canceled';
      else if (newStatus === 'confirmed') notificationType = 'confirmed';

      await createAppointmentNotification(
        appointmentData.userId,
        notificationType,
        appointmentId,
        shopName,
        serviceName,
        appointmentData.date.toDate()
      );
      
      console.log("📬 Notification created for status update");
    } catch (notificationError) {
      console.warn("⚠️ Could not create notification:", notificationError);
    }

    // Show success message
    const statusMessages = {
      confirmed: "Randevu onaylandı",
      canceled: "Randevu iptal edildi", 
      completed: "Randevu tamamlandı olarak işaretlendi",
      pending_business_confirmation: "Randevu işletme onayına gönderildi"
    };

    toast.success(statusMessages[newStatus as keyof typeof statusMessages] || "Randevu durumu güncellendi");
    
    return true;
  } catch (error) {
    console.error("❌ Error updating appointment status:", error);
    toast.error("Randevu durumu güncellenemedi: " + (error as Error).message);
    throw error;
  }
};

export const confirmUserAppointment = async (appointmentId: string) => {
  return updateAppointmentStatus(appointmentId, "pending_business_confirmation");
};

export const businessConfirmAppointment = async (appointmentId: string) => {
  return updateAppointmentStatus(appointmentId, "confirmed");
};

export const businessRejectAppointment = async (appointmentId: string, reason?: string) => {
  return updateAppointmentStatus(appointmentId, "canceled", reason);
};

export const markAppointmentCompleted = async (appointmentId: string) => {
  return updateAppointmentStatus(appointmentId, "completed");
};
