import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { initializeNotifications } from './lib/notificationUtils'
import { initializeAppointmentSystem } from './lib/appointmentAdvancedUtils'
import { initializeMockServices } from './lib/mockServices'
import { auth } from './lib/firebase'
import { createFirestoreIndexes } from './lib/firebase/createIndexes'
import { deployFirestoreRules } from './lib/firebase/deployRules'
import { initializeFirestoreCollections, connectToEmulator } from './lib/firebase/initializeFirestore'
import { toast } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from './lib/authContext'

// Firebase ve diğer sistemleri başlat
try {
  // Geliştirme modunda emülatöre bağlan
  if (import.meta.env.DEV) {
    connectToEmulator();
  }

  // Firestore koleksiyonlarını başlat (sadece geliştirme modunda)
  // NOT: Bu fonksiyon devre dışı bırakıldı çünkü permission hataları veriyor
  // Koleksiyonlar ihtiyaç duyulduğunda otomatik olarak oluşturuluyor
  if (import.meta.env.DEV && false) { // false ile devre dışı bırakıldı
    initializeFirestoreCollections().then(result => {
      if (result.success) {
        console.log("Firestore koleksiyonları başarıyla oluşturuldu:", result.collections);
        toast.success("Firestore koleksiyonları başarıyla oluşturuldu");
      } else {
        console.error("Firestore koleksiyonları oluşturulurken hata:", result.message);
        toast.error("Firestore koleksiyonları oluşturulurken hata: " + result.message);
      }
    }).catch(error => {
      console.error("Firestore koleksiyonları başlatma hatası:", error);
      // Production'da bu hata kullanıcıyı rahatsız etmemeli
    });
  } else {
    console.log("📊 Firestore koleksiyon initialization atlandı (Koleksiyonlar ihtiyaç duyulduğunda otomatik oluşturulacak)");
  }

  // Geliştirme modunda Firebase yapılandırma bilgilerini konsola yazdır
  if (import.meta.env.DEV) {
    console.log("=== Firebase Yapılandırma Bilgileri ===");
    createFirestoreIndexes();
    deployFirestoreRules();
    console.log("======================================");
  }

  // Diğer sistemleri başlat
  initializeAppointmentSystem();
  initializeNotifications();
  initializeMockServices();
} catch (error) {
  console.error('Sistemler başlatılırken hata:', error);
  toast.error("Sistem başlatılırken bir hata oluştu");
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  </BrowserRouter>
);
