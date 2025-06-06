
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
    console.log("Firestore koleksiyonları şemaya göre oluşturuluyor...");
    
    // schema.ts'den tüm koleksiyonları al
    const collections = Object.values(COLLECTIONS);
    
    // Oluşturulacak koleksiyonları günlüğe kaydet
    console.log(`${collections.length} koleksiyon oluşturuluyor: ${collections.join(', ')}`);
    
    // Firestore'da koleksiyonlar belgeler eklendiğinde otomatik olarak oluşturulur
    // Bu nedenle, varlıklarını sağlamak için her koleksiyona bir yer tutucu belge ekleyeceğiz
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const placeholderId = `placeholder_${Date.now()}`;
      
      // Sorgulardan gizlenecek bir yer tutucu belge ekle
      await setDoc(doc(collectionRef, placeholderId), {
        isPlaceholder: true,
        createdAt: new Date(),
        note: "Bu belge koleksiyonu oluşturmak için kullanılmıştır. Silebilirsiniz."
      });
      
      console.log(`Koleksiyon oluşturuldu: ${collectionName}`);
    }
    
    return {
      success: true,
      message: `Şema ${collections.length} koleksiyon ile başarıyla oluşturuldu`,
      collections
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
