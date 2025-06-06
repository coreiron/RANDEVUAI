
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { app } from "../firebase";
import firestoreRules from "./firestoreRules.txt";

/**
 * Bu fonksiyon normalde kullanılmaz çünkü güvenlik kuralları
 * Firebase konsolundan veya Firebase CLI aracılığıyla deploy edilir.
 * 
 * Bu fonksiyon sadece örnek amaçlıdır ve gerçek bir ortamda çalışmaz.
 */
export const deployFirestoreRules = async () => {
  try {
    console.log("====================== FİRESTORE GÜVENLİK KURALLARI ======================");
    console.log("Aşağıdaki güvenlik kurallarını Firebase konsolundan deploy etmeniz gerekiyor:");
    console.log(firestoreRules);
    console.log("========================================================================");
    
    console.log(`
Bu güvenlik kurallarını Firebase Console üzerinden şu adımları izleyerek ekleyebilirsiniz:
1. Firebase Console'da projenizi açın: https://console.firebase.google.com/
2. Firestore Database bölümüne gidin
3. "Rules" sekmesine tıklayın
4. Yukarıdaki kuralları kopyalayıp yapıştırın
5. "Publish" butonuna tıklayın
    `);
    
    return {
      success: true,
      message: "Güvenlik kuralları konsola yazdırıldı. Firebase konsolundan bunları deploy edin."
    };
  } catch (error) {
    console.error("Error displaying rules:", error);
    return {
      success: false,
      message: "Güvenlik kuralları gösterilirken hata oluştu."
    };
  }
};

/**
 * Firebase Emülatör için bağlantı kurar (geliştirme ortamı için)
 */
export const connectToFirestoreEmulator = () => {
  try {
    const db = getFirestore(app);
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log("Firebase Emülatör bağlantısı kuruldu");
    return true;
  } catch (error) {
    console.error("Firebase Emülatör bağlantı hatası:", error);
    return false;
  }
};
