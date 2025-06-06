import { toast } from '@/components/ui/sonner';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const db = getFirestore(app);

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface AppointmentEmailData {
  userEmail: string;
  userName: string;
  appointmentId: string;
  shopName: string;
  serviceName: string;
  appointmentDate: Date;
  appointmentTime: string;
  confirmationUrl: string;
}

export const createAppointmentConfirmationEmail = (data: AppointmentEmailData): EmailTemplate => {
  const dateStr = data.appointmentDate.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = `Randevu Onayı - ${data.shopName}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Randevu Onayı</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Randevunuzu Onaylayın</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Merhaba <strong>${data.userName}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
          <strong>${data.shopName}</strong> işletmesinde randevunuz oluşturulmuştur. 
          Randevunuzu onaylamak için aşağıdaki butona tıklayın.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="color: #007bff; margin: 0 0 15px 0;">Randevu Detayları</h3>
          <p style="margin: 5px 0;"><strong>İşletme:</strong> ${data.shopName}</p>
          <p style="margin: 5px 0;"><strong>Hizmet:</strong> ${data.serviceName}</p>
          <p style="margin: 5px 0;"><strong>Tarih:</strong> ${dateStr}</p>
          <p style="margin: 5px 0;"><strong>Saat:</strong> ${data.appointmentTime}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.confirmationUrl}" 
             style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
            Randevuyu Onayla
          </a>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>Not:</strong> Bu bağlantı 24 saat içerisinde geçerlidir. 
            Randevunuzu onaylamazsanız otomatik olarak iptal edilecektir.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #6c757d; text-align: center; margin: 0;">
          Bu e-posta otomatik olarak gönderilmiştir. Yanıtlamayınız.
        </p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Randevu Onayı - ${data.shopName}
    
    Merhaba ${data.userName},
    
    ${data.shopName} işletmesinde randevunuz oluşturulmuştur.
    
    Randevu Detayları:
    - İşletme: ${data.shopName}
    - Hizmet: ${data.serviceName}
    - Tarih: ${dateStr}
    - Saat: ${data.appointmentTime}
    
    Randevunuzu onaylamak için: ${data.confirmationUrl}
    
    Bu bağlantı 24 saat içerisinde geçerlidir.
  `;

  return { subject, htmlContent, textContent };
};

export const sendAppointmentConfirmationEmail = async (data: AppointmentEmailData): Promise<boolean> => {
  try {
    console.log("📧 Sending appointment confirmation email to:", data.userEmail);

    const emailTemplate = createAppointmentConfirmationEmail(data);
    const functions = getFunctions(app);
    const functionUrl = 'https://us-central1-randevuai-b0249.cloudfunctions.net/sendAppointmentEmail';

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify({
        to: data.userEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.htmlContent,
        text: emailTemplate.textContent,
        appointmentId: data.appointmentId,
        shopName: data.shopName,
        serviceName: data.serviceName,
        appointmentDate: data.appointmentDate.toISOString(),
        appointmentTime: data.appointmentTime,
        confirmationUrl: data.confirmationUrl
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'E-posta gönderilemedi');
    }

    console.log("✅ Email sent successfully");
    toast.success("Onay e-postası gönderildi!");

    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    toast.error("E-posta gönderilemedi: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
    return false;
  }
};

export const sendAppointmentStatusEmail = async (
  userEmail: string,
  userName: string,
  shopName: string,
  serviceName: string,
  appointmentDate: Date,
  status: 'confirmed' | 'canceled' | 'completed'
): Promise<boolean> => {
  try {
    console.log(`📧 Sending ${status} email to:`, userEmail);

    const functionUrl = 'https://us-central1-randevuai-b0249.cloudfunctions.net/sendAppointmentStatusEmail';

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify({
        to: userEmail,
        userName,
        shopName,
        serviceName,
        appointmentDate: appointmentDate.toISOString(),
        status
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Durum e-postası gönderilemedi');
    }

    console.log("✅ Status email sent successfully");
    toast.success(`${status === 'confirmed' ? 'Onay' : status === 'canceled' ? 'İptal' : 'Tamamlanma'} e-postası gönderildi!`);

    return true;
  } catch (error) {
    console.error("❌ Error sending status email:", error);
    toast.error("Durum e-postası gönderilemedi: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
    return false;
  }
};
