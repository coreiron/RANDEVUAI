import { connectFirestoreEmulator, collection, doc, setDoc } from "firebase/firestore";
import { app, db } from "../firebase";
import { COLLECTIONS, REQUIRED_INDEXES } from "./schema";

// Geliştirme modunda emülatöre bağlan
export const connectToEmulator = () => {
  if (import.meta.env.DEV) {
    try {
      // Yerel emülatör bağlantısı - Firebase emülatörü yerel olarak çalıştırırken kullanılmalıdır
      // connectFirestoreEmulator(db, 'localhost', 8080);
      console.log("Geliştirme ortamı tespit edildi. Yerel Firebase emülatörü kullanmak için yukarıdaki satırı yorum işaretinden çıkarın.");
      return true;
    } catch (error) {
      console.error("Emülatör bağlantı hatası:", error);
      return false;
    }
  }
  return false;
};

// Şemaya göre Firestore koleksiyonlarını oluştur
export const initializeFirestoreCollections = async () => {
  try {
    console.log("🔧 Firestore koleksiyon initialization çağrıldı");

    // Bu fonksiyon artık hiçbir şey yapmıyor - sadece bilgi veriyor
    console.log("📊 Not: Koleksiyonlar ihtiyaç duyulduğunda Firebase tarafından otomatik oluşturulacak");
    console.log("💡 Placeholder document'ler artık oluşturulmuyor (permission sorunlarını önlemek için)");

    return {
      success: true,
      message: "Koleksiyon initialization atlandı - otomatik oluşturulacak",
      collections: []
    };
  } catch (error) {
    console.error("Firestore koleksiyonlarını oluştururken hata:", error);
    return {
      success: false,
      message: "Firestore koleksiyonlarını oluşturulamadı",
      error: (error as Error).message
    };
  }
};

// Firestore için gerekli indeksleri döndüren fonksiyon
export const getRequiredIndexes = () => {
  return REQUIRED_INDEXES;
};
