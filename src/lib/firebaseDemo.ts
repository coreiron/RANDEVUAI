
import { auth } from './firebase';
import { seedFirestoreWithSampleData } from './firebase/seedData';
import { initializeFirestoreCollections } from './firebase/initializeFirestore';
import { 
  getShops, 
  getShopServices, 
  getShopStaff, 
  getUserAppointments, 
  getUserProfile,
  getShopReviews,
  getUserNotifications,
  deleteUserData
} from './firebase/firestoreUtils';
import { toast } from '@/components/ui/sonner';

// Firebase'e örnek veri ekleme ve doğrulama fonksiyonu
export const setupFirebaseDemo = async () => {
  try {
    console.log("Firebase demo başlatılıyor...");
    
    // Kullanıcının oturum açtığını kontrol et
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Demo için önce giriş yapmanız gerekiyor.");
      return { success: false, error: "Kullanıcı girişi yapılmamış" };
    }
    
    // Firestore koleksiyonları başlat
    const schemaResult = await initializeFirestoreCollections();
    if (!schemaResult.success) {
      toast.error("Firestore şeması oluşturulurken hata oluştu: " + schemaResult.message);
      return { success: false, error: schemaResult.message };
    }
    
    // Örnek verileri ekle
    console.log("Örnek veriler Firebase'e yükleniyor...");
    const seedResult = await seedFirestoreWithSampleData(currentUser.uid);
    
    if (!seedResult.success) {
      toast.error("Örnek veri yüklenirken hata oluştu: " + seedResult.error);
      return seedResult;
    }
    
    // Verilerin başarıyla yüklendiğini bildir
    toast.success("Örnek veriler başarıyla yüklendi!");
    console.log("Örnek veriler başarıyla yüklendi:", seedResult);
    
    return { 
      success: true, 
      shopIds: seedResult.shopIds 
    };
  } catch (error) {
    console.error("Firebase demo hatası:", error);
    toast.error("Demo başlatılırken bir hata oluştu");
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
};

// Firebase'deki verileri doğrula
export const verifyFirebaseData = async (shopIds?: {shop1: string, shop2: string}) => {
  try {
    console.log("Firebase verileri doğrulanıyor...");
    
    // Kullanıcı bilgilerini kontrol et
    const user = await getUserProfile();
    console.log("Kullanıcı profili:", user);
    
    // İşletmeleri kontrol et
    const shops = await getShops();
    console.log("İşletmeler:", shops);
    
    // İşletme detaylarını kontrol et
    if (shopIds && shopIds.shop1) {
      console.log("---- İşletme 1 Detayları ----");
      
      // Hizmetleri kontrol et
      const services = await getShopServices(shopIds.shop1);
      console.log("Hizmetler (İşletme 1):", services);
      
      // Personelleri kontrol et
      const staff = await getShopStaff(shopIds.shop1);
      console.log("Personel (İşletme 1):", staff);
      
      // Değerlendirmeleri kontrol et
      const reviews = await getShopReviews(shopIds.shop1);
      console.log("Değerlendirmeler (İşletme 1):", reviews);
    }
    
    // Kullanıcının randevularını kontrol et
    const appointments = await getUserAppointments();
    console.log("Kullanıcı Randevuları:", appointments);
    
    // Kullanıcının bildirimlerini kontrol et
    const notifications = await getUserNotifications();
    console.log("Bildirimler:", notifications);
    
    toast.success("Firebase verileri başarıyla doğrulandı!");
    return { 
      success: true, 
      data: {
        user,
        shops,
        appointments,
        notifications
      }
    };
  } catch (error) {
    console.error("Firebase veri doğrulama hatası:", error);
    toast.error("Veriler doğrulanırken bir hata oluştu");
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
};

// Firebase demo verilerini temizle
export const clearFirebaseDemo = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Temizlemek için önce giriş yapmanız gerekiyor");
      return { success: false };
    }
    
    // Kullanıcıya ait demo verilerini temizle
    const result = await deleteUserData(currentUser.uid);
    
    if (result.success) {
      toast.success("Demo verileri başarıyla temizlendi");
    } else {
      toast.error("Veriler temizlenirken bir hata oluştu");
    }
    
    return result;
  } catch (error) {
    console.error("Demo verisi temizleme hatası:", error);
    toast.error("Veriler temizlenirken bir hata oluştu");
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
};
