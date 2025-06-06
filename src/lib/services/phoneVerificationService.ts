
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { toast } from '@/components/ui/sonner';

// reCAPTCHA verifier instance
let recaptchaVerifier: RecaptchaVerifier | null = null;

interface PhoneVerificationResult {
  success: boolean;
  verificationId?: string;
  message?: string;
}

interface CodeVerificationResult {
  success: boolean;
  message?: string;
}

// Telefon numarasını Türkiye formatına çevir
const formatPhoneNumber = (phoneNumber: string): string => {
  // Boşlukları ve özel karakterleri temizle
  let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // +90 ile başlıyorsa olduğu gibi bırak
  if (cleaned.startsWith('+90')) {
    return cleaned;
  }
  
  // 0 ile başlıyorsa +90 ekle
  if (cleaned.startsWith('0')) {
    return '+90' + cleaned.substring(1);
  }
  
  // 5 ile başlıyorsa +90 ekle
  if (cleaned.startsWith('5')) {
    return '+90' + cleaned;
  }
  
  // Diğer durumlarda +90 ekle
  return '+90' + cleaned;
};

// reCAPTCHA verifier oluştur
const setupRecaptcha = (): Promise<RecaptchaVerifier> => {
  return new Promise((resolve, reject) => {
    try {
      // Mevcut verifier'ı temizle
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }

      // Yeni reCAPTCHA verifier oluştur
      recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('✅ reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('❌ reCAPTCHA expired');
          toast.error('reCAPTCHA süresi doldu, tekrar deneyin');
        }
      });

      resolve(recaptchaVerifier);
    } catch (error) {
      console.error('❌ reCAPTCHA setup error:', error);
      reject(error);
    }
  });
};

// Telefon numarasına doğrulama kodu gönder
export const sendPhoneVerificationCode = async (phoneNumber: string): Promise<PhoneVerificationResult> => {
  try {
    console.log(`📱 Sending verification code to: ${phoneNumber}`);
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log(`📱 Formatted phone: ${formattedPhone}`);

    // reCAPTCHA container ekle (eğer yoksa)
    if (!document.getElementById('recaptcha-container')) {
      const container = document.createElement('div');
      container.id = 'recaptcha-container';
      container.style.display = 'none';
      document.body.appendChild(container);
    }

    // reCAPTCHA verifier oluştur
    const appVerifier = await setupRecaptcha();
    
    // SMS gönder
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    
    console.log('✅ SMS sent successfully');
    return {
      success: true,
      verificationId: confirmationResult.verificationId,
      message: 'Doğrulama kodu gönderildi'
    };
    
  } catch (error: any) {
    console.error('❌ SMS sending error:', error);
    
    // reCAPTCHA container'ı temizle
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.remove();
    }
    
    if (error.code === 'auth/invalid-phone-number') {
      return {
        success: false,
        message: 'Geçersiz telefon numarası formatı'
      };
    } else if (error.code === 'auth/too-many-requests') {
      return {
        success: false,
        message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin'
      };
    } else if (error.code === 'auth/quota-exceeded') {
      return {
        success: false,
        message: 'SMS kotası aşıldı. Lütfen daha sonra tekrar deneyin'
      };
    } else {
      return {
        success: false,
        message: error.message || 'SMS gönderilemedi'
      };
    }
  }
};

// Doğrulama kodunu kontrol et ve telefon numarasını kullanıcı profiline kaydet
export const verifyPhoneCode = async (verificationId: string, code: string, phoneNumber: string): Promise<CodeVerificationResult> => {
  try {
    console.log(`🔐 Verifying code: ${code} for verificationId: ${verificationId}`);
    
    // PhoneAuthCredential oluştur
    const credential = PhoneAuthProvider.credential(verificationId, code);
    
    // Kodu doğrula (giriş yapmadan)
    await signInWithCredential(auth, credential);
    
    console.log('✅ Phone verification successful');
    
    // Telefon numarasını kullanıcı profiline kaydet
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('📱 Saving phone number to user profile');
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        phoneNumber: formatPhoneNumber(phoneNumber),
        phoneVerified: true,
        updatedAt: new Date()
      });
      console.log('✅ Phone number saved to profile');
    }
    
    // reCAPTCHA container'ı temizle
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.remove();
    }
    
    return {
      success: true,
      message: 'Telefon numarası başarıyla doğrulandı'
    };
    
  } catch (error: any) {
    console.error('❌ Phone verification error:', error);
    
    if (error.code === 'auth/invalid-verification-code') {
      return {
        success: false,
        message: 'Geçersiz doğrulama kodu'
      };
    } else if (error.code === 'auth/code-expired') {
      return {
        success: false,
        message: 'Doğrulama kodunun süresi dolmuş'
      };
    } else {
      return {
        success: false,
        message: error.message || 'Kod doğrulanamadı'
      };
    }
  }
};

// Cleanup function
export const cleanupRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  
  const container = document.getElementById('recaptcha-container');
  if (container) {
    container.remove();
  }
};
