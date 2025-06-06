import { toast } from '@/components/ui/sonner';

interface OTPData {
  email: string;
  code: string;
  expiresAt: Date;
  appointmentData?: any;
  type: 'appointment' | 'password-reset' | 'password-change';
}

// In-memory storage for demo purposes
// In production, this should be stored in a secure backend
const otpStorage: Map<string, OTPData> = new Map();

// EmailJS configuration - bu bilgileri gerçek değerlerle değiştirin
const EMAIL_SERVICE_CONFIG = {
  serviceId: 'service_9j6e8ep', // EmailJS service ID'nizi buraya girin
  templateId: 'template_otp_verify', // EmailJS template ID'nizi buraya girin
  publicKey: 'MvLZB-cP9FjEhQdBk', // EmailJS public key'inizi buraya girin
};

export const sendOTPToEmail = async (email: string, appointmentData?: any): Promise<boolean> => {
  try {
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    // Store OTP
    otpStorage.set(email, {
      email,
      code: otpCode,
      expiresAt,
      appointmentData,
      type: 'appointment'
    });
    
    console.log(`📧 Sending OTP email to: ${email}`);
    console.log(`🔐 OTP Code: ${otpCode}`);
    console.log(`⏰ Expires at: ${expiresAt.toLocaleTimeString('tr-TR')}`);
    
    return await sendEmailViaEmailJS(email, otpCode, expiresAt, 'Randevu Doğrulama');
  } catch (error) {
    console.error('❌ OTP gönderme hatası:', error);
    toast.error('OTP kodu gönderilemedi. Lütfen tekrar deneyin.');
    return false;
  }
};

export const sendPasswordResetOTP = async (email: string): Promise<boolean> => {
  try {
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (10 minutes for password reset)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Store OTP with password reset type
    otpStorage.set(`reset_${email}`, {
      email,
      code: otpCode,
      expiresAt,
      type: 'password-reset'
    });
    
    console.log(`📧 Sending Password Reset OTP to: ${email}`);
    console.log(`🔐 Password Reset OTP Code: ${otpCode}`);
    console.log(`⏰ Expires at: ${expiresAt.toLocaleTimeString('tr-TR')}`);
    
    return await sendEmailViaEmailJS(email, otpCode, expiresAt, 'Şifre Sıfırlama');
  } catch (error) {
    console.error('❌ Şifre sıfırlama OTP gönderme hatası:', error);
    toast.error('Şifre sıfırlama kodu gönderilemedi. Lütfen tekrar deneyin.');
    return false;
  }
};

export const sendPasswordChangeOTP = async (email: string): Promise<boolean> => {
  try {
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (10 minutes for password change)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Store OTP with password change type
    otpStorage.set(`change_${email}`, {
      email,
      code: otpCode,
      expiresAt,
      type: 'password-change'
    });
    
    console.log(`📧 Sending Password Change OTP to: ${email}`);
    console.log(`🔐 Password Change OTP Code: ${otpCode}`);
    console.log(`⏰ Expires at: ${expiresAt.toLocaleTimeString('tr-TR')}`);
    
    return await sendEmailViaEmailJS(email, otpCode, expiresAt, 'Şifre Değiştirme');
  } catch (error) {
    console.error('❌ Şifre değiştirme OTP gönderme hatası:', error);
    toast.error('Şifre değiştirme kodu gönderilemedi. Lütfen tekrar deneyin.');
    return false;
  }
};

// EmailJS ile email gönderme fonksiyonu
const sendEmailViaEmailJS = async (email: string, otpCode: string, expiresAt: Date, purpose: string): Promise<boolean> => {
  // Check if EmailJS is available
  if (typeof window === 'undefined' || !window.emailjs) {
    toast.error('Email servisi kullanılabilir değil. Sayfa yenilemeyi deneyin.');
    return false;
  }

  // Check if EmailJS is configured
  if (EMAIL_SERVICE_CONFIG.serviceId === 'service_9j6e8ep') {
    toast.error('EmailJS henüz yapılandırılmamış. Lütfen yöneticiyle iletişime geçin.');
    return false;
  }

  try {
    const templateParams = {
      to_email: email,
      otp_code: otpCode,
      expires_time: expiresAt.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      app_name: 'RandevuAI',
      purpose: purpose
    };

    console.log('📤 Sending email via EmailJS with params:', templateParams);
    
    const response = await window.emailjs.send(
      EMAIL_SERVICE_CONFIG.serviceId,
      EMAIL_SERVICE_CONFIG.templateId,
      templateParams,
      EMAIL_SERVICE_CONFIG.publicKey
    );
    
    console.log('✅ Email sent successfully via EmailJS:', response);
    toast.success('Doğrulama kodu e-posta adresinize gönderildi');
    return true;
    
  } catch (emailError: any) {
    console.error('❌ EmailJS error:', emailError);
    toast.error('Email gönderilemedi. Lütfen tekrar deneyin.');
    return false;
  }
};

export const verifyPasswordResetOTP = (email: string, inputCode: string): { success: boolean; message: string } => {
  const otpData = otpStorage.get(`reset_${email}`);
  
  if (!otpData) {
    return {
      success: false,
      message: 'Bu e-posta için şifre sıfırlama kodu bulunamadı. Yeni kod talep edin.'
    };
  }
  
  if (new Date() > otpData.expiresAt) {
    otpStorage.delete(`reset_${email}`);
    return {
      success: false,
      message: 'Şifre sıfırlama kodunun süresi dolmuş. Yeni kod talep edin.'
    };
  }
  
  if (otpData.code !== inputCode) {
    return {
      success: false,
      message: 'Geçersiz şifre sıfırlama kodu. Lütfen tekrar deneyin.'
    };
  }
  
  // OTP is valid, mark as verified
  otpStorage.set(`reset_${email}`, {
    ...otpData,
    code: 'VERIFIED'
  });
  
  return {
    success: true,
    message: 'Şifre sıfırlama kodu doğrulandı'
  };
};

export const verifyPasswordChangeOTP = (email: string, inputCode: string): { success: boolean; message: string } => {
  const otpData = otpStorage.get(`change_${email}`);
  
  if (!otpData) {
    return {
      success: false,
      message: 'Bu e-posta için şifre değiştirme kodu bulunamadı. Yeni kod talep edin.'
    };
  }
  
  if (new Date() > otpData.expiresAt) {
    otpStorage.delete(`change_${email}`);
    return {
      success: false,
      message: 'Şifre değiştirme kodunun süresi dolmuş. Yeni kod talep edin.'
    };
  }
  
  if (otpData.code !== inputCode) {
    return {
      success: false,
      message: 'Geçersiz şifre değiştirme kodu. Lütfen tekrar deneyin.'
    };
  }
  
  // OTP is valid, mark as verified
  otpStorage.set(`change_${email}`, {
    ...otpData,
    code: 'VERIFIED'
  });
  
  return {
    success: true,
    message: 'Şifre değiştirme kodu doğrulandı'
  };
};

export const verifyOTP = (email: string, inputCode: string): { success: boolean; appointmentData?: any; message: string } => {
  const otpData = otpStorage.get(email);
  
  if (!otpData) {
    return {
      success: false,
      message: 'Bu e-posta için OTP kodu bulunamadı. Yeni kod talep edin.'
    };
  }
  
  if (new Date() > otpData.expiresAt) {
    otpStorage.delete(email);
    return {
      success: false,
      message: 'OTP kodunun süresi dolmuş. Yeni kod talep edin.'
    };
  }
  
  if (otpData.code !== inputCode) {
    return {
      success: false,
      message: 'Geçersiz OTP kodu. Lütfen tekrar deneyin.'
    };
  }
  
  // OTP is valid, remove it from storage
  const appointmentData = otpData.appointmentData;
  otpStorage.delete(email);
  
  return {
    success: true,
    appointmentData,
    message: 'OTP kodu başarıyla doğrulandı'
  };
};

export const resendOTP = async (email: string): Promise<boolean> => {
  const existingOTP = otpStorage.get(email);
  if (existingOTP) {
    return await sendOTPToEmail(email, existingOTP.appointmentData);
  }
  
  console.warn('No existing OTP found for resend');
  return false;
};

export const resendPasswordResetOTP = async (email: string): Promise<boolean> => {
  return await sendPasswordResetOTP(email);
};

export const resendPasswordChangeOTP = async (email: string): Promise<boolean> => {
  return await sendPasswordChangeOTP(email);
};

export const isPasswordResetOTPVerified = (email: string): boolean => {
  const otpData = otpStorage.get(`reset_${email}`);
  return otpData?.code === 'VERIFIED';
};

export const isPasswordChangeOTPVerified = (email: string): boolean => {
  const otpData = otpStorage.get(`change_${email}`);
  return otpData?.code === 'VERIFIED';
};

export const clearPasswordResetOTP = (email: string): void => {
  otpStorage.delete(`reset_${email}`);
};

export const clearPasswordChangeOTP = (email: string): void => {
  otpStorage.delete(`change_${email}`);
};

// EmailJS kurulum kontrolü
export const checkEmailJSSetup = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hasEmailJS = !!window.emailjs;
  const hasConfig = EMAIL_SERVICE_CONFIG.serviceId !== 'service_9j6e8ep'; // Default değer kontrolü
  
  console.log('📧 EmailJS Setup Status:', {
    emailJSLoaded: hasEmailJS,
    configured: hasConfig,
    serviceId: EMAIL_SERVICE_CONFIG.serviceId
  });
  
  return hasEmailJS && hasConfig;
};

// EmailJS setup instructions
export const setupEmailJS = () => {
  console.log(`
📧 EmailJS Kurulum Talimatları:

1. https://www.emailjs.com/ adresine git ve ücretsiz hesap oluştur
2. Email servisi ekle (Gmail, Outlook, vb.)
3. Email template oluştur şu değişkenlerle:
   - {{to_email}} - Alıcı email
   - {{otp_code}} - OTP kodu  
   - {{expires_time}} - Geçerlilik süresi
   - {{app_name}} - Uygulama adı

4. Aşağıdaki bilgileri otpService.ts dosyasında güncelle:
   - serviceId: 'service_xxxxxxx'
   - templateId: 'template_xxxxxxx' 
   - publicKey: 'xxxxxxxxxxxxxxx'

5. EmailJS script'i index.html'de mevcut (otomatik eklendi)
  `);
};

declare global {
  interface Window {
    emailjs: any;
  }
}
