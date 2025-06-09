import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  applyActionCode
} from "firebase/auth";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { toast } from '@/components/ui/sonner';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { ensureBusinessUserType } from './services/profileService';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZQ15TayS0BWaP6viKwGWY1v3O314iAkg",
  authDomain: "randevuai-b0249.firebaseapp.com",
  projectId: "randevuai-b0249",
  storageBucket: "randevuai-b0249.firebasestorage.app",
  messagingSenderId: "621524791942",
  appId: "1:621524791942:web:fd5a990fd6a4c1cd649707",
  measurementId: "G-GS3PSFCPBS"
};

// Initialize Firebase once and export the instances
console.log("Initializing Firebase");
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Storage CORS ayarları
const corsConfig = {
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAgeSeconds: 3600
};

console.log("Firebase initialized successfully");

// Authentication functions
export const registerUser = async (email: string, password: string, displayName: string, userType: 'user' | 'business' = 'user', additionalData?: any) => {
  try {
    console.log("Starting registration process:", { email, displayName, userType });

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update user display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // Save user profile to Firestore
      const { setDoc, doc } = await import('firebase/firestore');
      const userProfile = {
        userType,
        email,
        displayName,
        emailVerified: false,
        createdAt: new Date(),
        ...additionalData
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

      // Send email verification
      await sendEmailVerification(userCredential.user);

      console.log("User registration completed:", userCredential.user.uid);
      toast.success("Kayıt işlemi başarılı! E-posta adresinize doğrulama bağlantısı gönderildi.");
      return userCredential.user;
    }
    throw new Error("User could not be created");
  } catch (error: any) {
    console.error("Registration error (detailed):", error);

    if (error.code === 'auth/email-already-in-use') {
      toast.error('Bu e-posta adresi zaten kullanımda');
      throw new Error('Bu e-posta adresi zaten kullanımda');
    } else if (error.code === 'auth/invalid-email') {
      toast.error('Geçersiz e-posta adresi');
      throw new Error('Geçersiz e-posta adresi');
    } else if (error.code === 'auth/weak-password') {
      toast.error('Şifre en az 6 karakter olmalıdır');
      throw new Error('Şifre en az 6 karakter olmalıdır');
    } else if (error.code === 'auth/operation-not-allowed') {
      toast.error('E-posta/şifre ile kayıt etkin değil');
      throw new Error('E-posta/şifre ile kayıt etkin değil');
    } else if (error.code === 'auth/network-request-failed') {
      toast.error('Ağ hatası, lütfen internet bağlantınızı kontrol edin');
      throw new Error('Ağ hatası, lütfen internet bağlantınızı kontrol edin');
    } else if (error.code === 'auth/api-key-not-valid') {
      toast.error('API anahtarı geçersiz. Firebase yapılandırmanızı kontrol edin');
      throw new Error('API anahtarı geçersiz. Firebase yapılandırmanızı kontrol edin');
    } else {
      toast.error(error.message || "Kayıt sırasında bir hata oluştu");
      throw new Error(error.message || "Kayıt sırasında bir hata oluştu");
    }
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    console.log("Starting login process:", { email });

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Kullanıcı tipini kontrol et
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("User type:", userData.userType);

      // İşletme hesabı ise userType'ı güncelle
      if (userData.userType === 'business') {
        await ensureBusinessUserType();
      }
    }

    // Check email verification
    if (!userCredential.user.emailVerified) {
      console.log("Email not verified, sending verification email");
      await sendEmailVerification(userCredential.user);
      toast.warning("E-posta adresiniz doğrulanmamış. Yeni doğrulama bağlantısı gönderildi.");
    } else {
      toast.success("Giriş başarılı!");
    }

    console.log("Login successful:", userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error("Login error:", error);

    if (error.code === 'auth/invalid-email') {
      toast.error('Geçersiz e-posta adresi');
      throw new Error('Geçersiz e-posta adresi');
    } else if (error.code === 'auth/user-not-found') {
      toast.error('Bu e-posta adresiyle kayıtlı hesap bulunamadı');
      throw new Error('Bu e-posta adresiyle kayıtlı hesap bulunamadı');
    } else if (error.code === 'auth/wrong-password') {
      toast.error('Hatalı şifre');
      throw new Error('Hatalı şifre');
    } else if (error.code === 'auth/network-request-failed') {
      toast.error('Ağ hatası, lütfen internet bağlantınızı kontrol edin');
      throw new Error('Ağ hatası, lütfen internet bağlantınızı kontrol edin');
    } else if (error.code === 'auth/too-many-requests') {
      toast.error('Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin');
      throw new Error('Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin');
    } else if (error.code === 'auth/user-disabled') {
      toast.error('Bu hesap devre dışı bırakılmış');
      throw new Error('Bu hesap devre dışı bırakılmış');
    } else if (error.code === 'auth/api-key-not-valid') {
      toast.error('API anahtarı geçersiz. Firebase yapılandırmanızı kontrol edin');
      throw new Error('API anahtarı geçersiz. Firebase yapılandırmanızı kontrol edin');
    } else {
      toast.error(error.message || "Giriş sırasında bir hata oluştu");
      throw new Error(error.message || "Giriş sırasında bir hata oluştu");
    }
  }
};

export const logoutUser = async () => {
  try {
    console.log("Starting logout process");

    await signOut(auth);
    console.log("Logout successful");
    toast.success("Başarıyla çıkış yapıldı");
    return true;
  } catch (error: any) {
    console.error("Logout error:", error);
    toast.error("Çıkış yaparken bir hata oluştu");
    throw new Error(error.message || "Çıkış sırasında bir hata oluştu");
  }
};

// Email verification functions
export const verifyEmail = async (oobCode: string) => {
  try {
    await applyActionCode(auth, oobCode);
    return true;
  } catch (error: any) {
    console.error("Email verification error:", error);
    throw new Error(error.message || "E-posta doğrulama işlemi başarısız oldu");
  }
};

export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }

    // Son gönderim zamanını kontrol et
    const lastSentTime = localStorage.getItem('lastVerificationEmailSent');
    if (lastSentTime) {
      const timeDiff = Date.now() - parseInt(lastSentTime);
      if (timeDiff < 60000) { // 1 dakika bekleme süresi
        const remainingTime = Math.ceil((60000 - timeDiff) / 1000);
        toast.error(`Lütfen ${remainingTime} saniye bekleyin`);
        return false;
      }
    }

    await sendEmailVerification(user);
    localStorage.setItem('lastVerificationEmailSent', Date.now().toString());
    toast.success('Doğrulama e-postası yeniden gönderildi');
    return true;
  } catch (error: any) {
    console.error("Resend verification error:", error);

    if (error.code === 'auth/too-many-requests') {
      toast.error('Çok fazla deneme yaptınız. Lütfen bir süre bekleyin.');
    } else {
      toast.error('Doğrulama e-postası gönderilemedi');
    }
    throw new Error(error.message || 'Doğrulama e-postası gönderilemedi');
  }
};

export const checkEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    await user.reload();
    return user.emailVerified;
  } catch (error) {
    console.error("Check email verification error:", error);
    return false;
  }
};

// Password reset functions
export const resetPassword = async (email: string) => {
  try {
    console.log("Sending password reset email to:", email);

    await sendPasswordResetEmail(auth, email);
    toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
    return true;
  } catch (error: any) {
    console.error("Password reset error:", error);

    if (error.code === 'auth/user-not-found') {
      toast.error('Bu e-posta adresiyle kayıtlı hesap bulunamadı');
      throw new Error('Bu e-posta adresiyle kayıtlı hesap bulunamadı');
    } else if (error.code === 'auth/invalid-email') {
      toast.error('Geçersiz e-posta adresi');
      throw new Error('Geçersiz e-posta adresi');
    } else {
      toast.error('Şifre sıfırlama e-postası gönderilemedi');
      throw new Error(error.message || 'Şifre sıfırlama e-postası gönderilemedi');
    }
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'Access-Control-Allow-Origin': '*'
      }
    };
    await uploadBytes(storageRef, file, metadata);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    throw error;
  }
}

// FCM: Bildirim izni al ve token döndür
export const requestNotificationPermissionAndGetToken = async (): Promise<string | null> => {
  try {
    const messaging = getMessaging();
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Bildirim izni verilmedi');
      return null;
    }
    // VAPID anahtarını buraya ekle (Firebase Console > Cloud Messaging > Web Push certificates)
    const vapidKey = 'BLSR4EGHzQTCMNJTUE1jCO8yWxnDatXHJqB7-ZlQK0vTHnFjHOuv0DKdRgASA1CmAI6oCXgzs6kWoOS7YaWZAB0';
    const token = await getToken(messaging, { vapidKey });
    if (token) {
      console.log('FCM Token:', token);
      return token;
    } else {
      console.warn('FCM token alınamadı');
      return null;
    }
  } catch (error) {
    console.error('FCM token alma hatası:', error);
    return null;
  }
};

// FCM: Uygulama açıkken gelen mesajları dinle
export const onForegroundMessage = (callback: (payload: any) => void) => {
  const messaging = getMessaging();
  onMessage(messaging, callback);
};
