import { appointmentApi } from '@/lib/api/appointmentApi';
import { toast } from '@/components/ui/sonner';

// API-based appointment service
export const createAppointmentViaApi = async (appointmentData: {
  shopId: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
  staffId?: string;
  price?: number;
}) => {
  try {
    console.log("📅 Creating appointment via API:", appointmentData);

    const response = await appointmentApi.create(appointmentData);

    if (response.success) {
      console.log("✅ Appointment created via API:", response.data);
      toast.success("Randevu başarıyla oluşturuldu");
      return response.data;
    } else {
      console.error("❌ API Error:", response.error);
      toast.error(response.error || "Randevu oluşturulamadı");
      return null;
    }
  } catch (error) {
    console.error("❌ Error creating appointment via API:", error);
    toast.error("Randevu oluşturulurken bir hata oluştu");
    return null;
  }
};

export const getUserAppointmentsViaApi = async () => {
  try {
    console.log("📅 Getting user appointments via API");

    const response = await appointmentApi.getUserAppointments();

    if (response.success) {
      console.log("✅ User appointments retrieved via API:", response.data?.length || 0);
      return response.data || [];
    } else {
      console.error("❌ API Error:", response.error);
      toast.error(response.error || "Randevular alınamadı");
      return [];
    }
  } catch (error) {
    console.error("❌ Error getting user appointments via API:", error);
    toast.error("Randevular alınırken bir hata oluştu");
    return [];
  }
};

export const getBusinessAppointmentsViaApi = async (shopId: string) => {
  try {
    console.log("🏪 Getting business appointments via API:", shopId);

    const response = await appointmentApi.getBusinessAppointments(shopId);

    if (response.success) {
      console.log("✅ Business appointments retrieved via API:", response.data?.length || 0);
      return response.data || [];
    } else {
      console.error("❌ API Error:", response.error);
      toast.error(response.error || "İşletme randevuları alınamadı");
      return [];
    }
  } catch (error) {
    console.error("❌ Error getting business appointments via API:", error);
    toast.error("İşletme randevuları alınırken bir hata oluştu");
    return [];
  }
};

export const updateAppointmentStatusViaApi = async (appointmentId: string, status: string, reason?: string) => {
  try {
    console.log("🔄 Updating appointment status via API:", { appointmentId, status, reason });

    const response = await appointmentApi.updateStatus(appointmentId, { status, reason });

    if (response.success) {
      console.log("✅ Appointment status updated via API:", response.data);
      toast.success("Randevu durumu güncellendi");
      return response.data;
    } else {
      console.error("❌ API Error:", response.error);
      toast.error(response.error || "Randevu durumu güncellenemedi");
      return null;
    }
  } catch (error) {
    console.error("❌ Error updating appointment status via API:", error);
    toast.error("Randevu durumu güncellenirken bir hata oluştu");
    return null;
  }
};

export const cancelAppointmentViaApi = async (appointmentId: string, reason?: string) => {
  try {
    console.log("❌ Canceling appointment via API:", { appointmentId, reason });

    const response = await appointmentApi.cancel(appointmentId, { reason });

    if (response.success) {
      console.log("✅ Appointment canceled via API:", response.data);
      toast.success("Randevu iptal edildi");
      return response.data;
    } else {
      console.error("❌ API Error:", response.error);
      toast.error(response.error || "Randevu iptal edilemedi");
      return null;
    }
  } catch (error) {
    console.error("❌ Error canceling appointment via API:", error);
    toast.error("Randevu iptal edilirken bir hata oluştu");
    return null;
  }
};
