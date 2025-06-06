
import { collection, addDoc, serverTimestamp, Timestamp, getDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase/schema";
import { toast } from "@/components/ui/sonner";
import { createAppointmentNotification } from "@/lib/services/notificationService";
import { sendAppointmentConfirmationEmail } from "@/lib/services/emailService";

export const createAppointmentWithEmailConfirmation = async (appointmentData: {
  shopId: string;
  serviceId: string;
  date: Date;
  time: string; 
  notes?: string;
  staffId?: string;
  price?: number;
}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      toast.error("Randevu oluşturmak için giriş yapmalısınız.");
      throw new Error("Kullanıcı oturum açmamış veya e-posta adresi yok");
    }

    console.log("🔧 Creating appointment with email confirmation:", appointmentData);

    // Create appointment date-time
    const [hours, minutes] = appointmentData.time.split(':').map(Number);
    const appointmentDateTime = new Date(appointmentData.date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Calculate end time (assuming 1 hour default duration)
    const endTime = new Date(appointmentDateTime);
    endTime.setHours(endTime.getHours() + 1);

    // Get service details for better data
    let serviceData: any = {};
    try {
      const serviceDoc = await getDoc(doc(db, COLLECTIONS.SERVICES, appointmentData.serviceId));
      serviceData = serviceDoc.exists() ? serviceDoc.data() : {};
    } catch (error) {
      console.warn("Could not fetch service data:", error);
    }

    // Get shop details
    let shopData: any = {};
    try {
      const shopDoc = await getDoc(doc(db, COLLECTIONS.SHOPS, appointmentData.shopId));
      shopData = shopDoc.exists() ? shopDoc.data() : {};
    } catch (error) {
      console.warn("Could not fetch shop data:", error);
    }

    // Prepare appointment data with "pending_user_confirmation" status
    const appointmentToCreate: any = {
      shopId: appointmentData.shopId,
      serviceId: appointmentData.serviceId,
      userId: currentUser.uid,
      status: "pending_user_confirmation", // Initial status - waiting for user email confirmation
      date: Timestamp.fromDate(appointmentDateTime),
      endTime: Timestamp.fromDate(endTime),
      notes: appointmentData.notes || '',
      price: appointmentData.price || serviceData?.price || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userEmail: currentUser.email,
      userConfirmed: false,
      businessConfirmed: false,
    };

    if (appointmentData.staffId && appointmentData.staffId !== 'any') {
      appointmentToCreate.staffId = appointmentData.staffId;
    }

    console.log("💾 Creating appointment with pending status:", appointmentToCreate);
    
    // Create appointment in Firestore
    const appointmentRef = await addDoc(
      collection(db, COLLECTIONS.APPOINTMENTS),
      appointmentToCreate
    );

    console.log("✅ Appointment created with ID:", appointmentRef.id);

    const shopName = shopData?.name || 'Bilinmeyen İşletme';
    const serviceName = serviceData?.name || 'Bilinmeyen Hizmet';
    const userName = currentUser.displayName || currentUser.email || 'Kullanıcı';

    // Create confirmation URL
    const confirmationUrl = `${window.location.origin}/confirm-appointment/${appointmentRef.id}`;

    try {
      // Send email confirmation
      await sendAppointmentConfirmationEmail({
        userEmail: currentUser.email,
        userName,
        appointmentId: appointmentRef.id,
        shopName,
        serviceName,
        appointmentDate: appointmentDateTime,
        appointmentTime: appointmentData.time,
        confirmationUrl
      });

      // Create notification
      await createAppointmentNotification(
        currentUser.uid,
        'created',
        appointmentRef.id,
        shopName,
        serviceName,
        appointmentDateTime
      );
      
      console.log("📬 Email and notification sent successfully");
      toast.success("Randevunuz oluşturuldu! E-posta adresinize gönderilen onay bağlantısına tıklayın.");
    } catch (notificationError) {
      console.warn("⚠️ Could not send email or create notification:", notificationError);
      toast.warning("Randevunuz oluşturuldu ancak e-posta gönderilemedi. Lütfen randevularım bölümünden kontrol edin.");
    }
    
    return {
      success: true,
      appointmentId: appointmentRef.id,
      message: "Randevunuz oluşturuldu. E-posta adresinize gönderilen onay bağlantısına tıklayın."
    };
  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    toast.error("Randevu oluşturulurken bir hata oluştu: " + (error as Error).message);
    throw error;
  }
};

// User confirms appointment via email link
export const confirmUserAppointment = async (appointmentId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Kullanıcı oturum açmamış");
    }

    const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
    const appointmentDoc = await getDoc(appointmentRef);
    
    if (!appointmentDoc.exists()) {
      throw new Error("Randevu bulunamadı");
    }

    const appointmentData = appointmentDoc.data();
    
    if (appointmentData.userId !== currentUser.uid) {
      throw new Error("Bu randevuyu onaylama yetkiniz yok");
    }

    // Update to pending business confirmation
    await updateDoc(appointmentRef, {
      status: "pending_business_confirmation",
      userConfirmed: true,
      updatedAt: serverTimestamp()
    });

    toast.success("Randevunuz onaylandı! İşletme onayını bekliyor.");
    return true;
  } catch (error) {
    console.error("Error confirming appointment:", error);
    throw error;
  }
};

// Legacy function for backward compatibility
export const createAppointmentWithOTP = createAppointmentWithEmailConfirmation;

export const createAppointment = async (appointmentData: any) => {
  // This is now just an alias to the new function
  return createAppointmentWithEmailConfirmation(appointmentData);
};
