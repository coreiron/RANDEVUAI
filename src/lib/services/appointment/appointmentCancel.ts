
import { doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase/schema";
import { toast } from "@/components/ui/sonner";
import { createAppointmentNotification } from "@/lib/services/notificationService";

export interface CancelAppointmentParams {
  appointmentId: string;
  reason?: string;
  canceledBy?: 'user' | 'shop';
  userId?: string;
}

export const cancelAppointment = async (params: CancelAppointmentParams) => {
  try {
    const { appointmentId, reason = '', canceledBy = 'user', userId } = params;
    
    if (!appointmentId) {
      throw new Error("Randevu ID'si gereklidir");
    }

    console.log("Canceling appointment:", appointmentId, "Reason:", reason);
    
    // Get appointment details first
    const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
    const appointmentDoc = await getDoc(appointmentRef);
    
    if (!appointmentDoc.exists()) {
      throw new Error("Randevu bulunamadı");
    }
    
    const appointmentData = appointmentDoc.data();
    
    const updateData: any = {
      status: 'canceled',
      cancelReason: reason,
      canceledBy,
      canceledAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    if (userId) {
      updateData.canceledByUserId = userId;
    }

    await updateDoc(appointmentRef, updateData);
    
    // Create cancellation notification
    try {
      const shopDoc = await getDoc(doc(db, COLLECTIONS.SHOPS, appointmentData.shopId));
      const serviceDoc = await getDoc(doc(db, COLLECTIONS.SERVICES, appointmentData.serviceId));
      
      const shopName = shopDoc.exists() ? shopDoc.data()?.name || 'Bilinmeyen İşletme' : 'Bilinmeyen İşletme';
      const serviceName = serviceDoc.exists() ? serviceDoc.data()?.name || 'Bilinmeyen Hizmet' : 'Bilinmeyen Hizmet';
      const appointmentDate = appointmentData.date?.toDate ? appointmentData.date.toDate() : new Date();

      await createAppointmentNotification(
        appointmentData.userId,
        'canceled',
        appointmentId,
        shopName,
        serviceName,
        appointmentDate
      );
    } catch (notificationError) {
      console.warn("⚠️ Could not create cancellation notification:", notificationError);
    }
    
    console.log("Appointment canceled successfully");
    toast.success("Randevu başarıyla iptal edildi");
    
    return true;
  } catch (error) {
    console.error("Error canceling appointment:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Randevu iptal edilirken bir hata oluştu";
    toast.error(errorMessage);
    
    throw error;
  }
};

// Toplu randevu iptali için
export const cancelMultipleAppointments = async (appointmentIds: string[], reason?: string) => {
  try {
    const results = await Promise.allSettled(
      appointmentIds.map(id => cancelAppointment({ appointmentId: id, reason }))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    if (successful > 0) {
      toast.success(`${successful} randevu başarıyla iptal edildi`);
    }
    
    if (failed > 0) {
      toast.error(`${failed} randevu iptal edilirken hata oluştu`);
    }
    
    return { successful, failed };
  } catch (error) {
    console.error("Error canceling multiple appointments:", error);
    toast.error("Randevular iptal edilirken bir hata oluştu");
    throw error;
  }
};
