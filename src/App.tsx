import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedBusinessRoute from './components/layout/ProtectedBusinessRoute';
import { useFCMToken } from './hooks/useFCMToken';
import { onForegroundMessage } from './lib/firebase';
import { toast } from '@/components/ui/sonner';
import { initializeMessaging, listenToMessages } from '@/lib/services/messagingService';
import { clearCurrentUserData, cleanupExtraShops, fixTestShopCategories, clearAllTestData, createRealBusinessData, clearUserAppointments, keepOnlyRealBusinesses, clearAllDataInBatches } from '@/lib/firebase/seedData';

// Sayfalar
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterUser from './pages/RegisterUser';
import RegisterBusiness from './pages/RegisterBusiness';
import BusinessRegister from './pages/BusinessRegister';
import BusinessDashboard from './pages/BusinessDashboard';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Shops from './pages/Shops';
import ShopDetail from './pages/ShopDetail';
import Appointments from './pages/Appointments';
import Favorites from './pages/Favorites';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import FirebaseDemo from './pages/FirebaseDemo';
import Comments from './pages/Comments';
import CategoryPage from './pages/CategoryPage';
import ForgotPassword from './pages/ForgotPassword';
import ConfirmAppointment from './pages/ConfirmAppointment';
import AppointmentDetail from './pages/AppointmentDetail';
import './App.css';

function App() {
  useFCMToken();

  useEffect(() => {
    // FCM'i başlat ve bildirimleri dinle
    initializeMessaging().then(() => {
      listenToMessages();
    });
  }, []);

  React.useEffect(() => {
    onForegroundMessage((payload) => {
      const notification = payload.notification;
      toast(
        notification?.title || 'Yeni Bildirim',
        {
          description: notification?.body,
          duration: 6000
        }
      );
    });
  }, []);

  useEffect(() => {
    // Global fonksiyon olarak ekle - test amaçlı
    (window as any).clearUserData = async () => {
      try {
        const result = await clearCurrentUserData();
        if (result.success) {
          console.log("✅ Kullanıcı verileri başarıyla temizlendi");
        } else {
          console.error("❌ Veri temizleme hatası:", result.error);
        }
        return result;
      } catch (error) {
        console.error("❌ Veri temizleme hatası:", error);
        return { success: false, error: (error as Error).message };
      }
    };

    // Ekstra işletmeleri temizle
    (window as any).cleanupShops = async () => {
      try {
        const result = await cleanupExtraShops();
        if (result.success) {
          console.log(`✅ ${result.deletedCount} ekstra işletme silindi`);
        } else {
          console.error("❌ İşletme temizleme hatası:", result.error);
        }
        return result;
      } catch (error) {
        console.error("❌ İşletme temizleme hatası:", error);
        return { success: false, error: (error as Error).message };
      }
    };

    // İşletme kategorilerini düzelt
    (window as any).fixCategories = async () => {
      try {
        const result = await fixTestShopCategories();
        if (result.success) {
          console.log(`✅ ${result.updatedCount} işletme kategorisi güncellendi`);
        } else {
          console.error("❌ Kategori düzeltme hatası:", result.error);
        }
        return result;
      } catch (error) {
        console.error("❌ Kategori düzeltme hatası:", error);
        return { success: false, error: (error as Error).message };
      }
    };

    // TÜM test verilerini temizle
    (window as any).clearAllData = async () => {
      try {
        const result = await clearAllTestData();
        if (result.success) {
          console.log(`✅ ${result.deletedCount} test verisi silindi`);
        } else {
          console.error("❌ Test veri temizleme hatası:", result.error);
        }
        return result;
      } catch (error) {
        console.error("❌ Test veri temizleme hatası:", error);
        return { success: false, error: (error as Error).message };
      }
    };

    // TÜM test verilerini küçük parçalarda temizle (batch limit sorunu için)
    (window as any).clearAllDataSafe = async () => {
      try {
        const result = await clearAllDataInBatches();
        if (result.success) {
          console.log(`✅ ${result.deletedCount} test verisi güvenli şekilde silindi`);
        } else {
          console.error("❌ Güvenli veri temizleme hatası:", result.error);
        }
        return result;
      } catch (error) {
        console.error("❌ Güvenli veri temizleme hatası:", error);
        return { success: false, error: (error as Error).message };
      }
    };

    // Gerçek işletme verilerini oluştur
    (window as any).createRealData = async () => {
      try {
        const result = await createRealBusinessData();
        if (result.success) {
          console.log(`✅ ${result.businessCount} gerçek işletme oluşturuldu`);
        } else {
          console.error("❌ Gerçek veri oluşturma hatası:", result.error);
        }
        return result;
      } catch (error) {
        console.error("❌ Gerçek veri oluşturma hatası:", error);
        return { success: false, error: (error as Error).message };
      }
    };

    // Belirli kullanıcının randevularını temizle
    (window as any).clearMyAppointments = async () => {
      try {
        const result = await clearUserAppointments("nyalcinozdemir96@gmail.com");
        if (result.success) {
          console.log(`✅ ${result.deletedCount} randevu silindi`);
        } else {
          console.error("❌ Randevu temizleme hatası:", result.error);
        }
        return result;
      } catch (error) {
        console.error("❌ Randevu temizleme hatası:", error);
        return { success: false, error: (error as Error).message };
      }
    };

    // Tam sistem sıfırlama
    (window as any).fullSystemReset = async () => {
      try {
        console.log("🔄 Full system reset başlıyor...");

        // 1. Tüm test verilerini temizle
        console.log("1️⃣ Test verileri temizleniyor...");
        await clearAllTestData();

        // 2. Gerçek işletme verilerini oluştur
        console.log("2️⃣ Gerçek veriler oluşturuluyor...");
        await createRealBusinessData();

        console.log("✅ Full system reset tamamlandı! Sayfayı yenileyin.");
        return { success: true };
      } catch (error) {
        console.error("❌ Full system reset hatası:", error);
        return { success: false, error: (error as Error).message };
      }
    };

    // Sadece gerçek işletmeleri bırak
    (window as any).keepOnlyReal = async () => {
      try {
        const result = await keepOnlyRealBusinesses();
        if (result.success) {
          console.log(`✅ ${result.deletedShops} test işletme silindi, ${result.keptShops} gerçek işletme kaldı`);
        } else {
          console.error("❌ Temizleme hatası:", result.error);
        }
        return result;
      } catch (error) {
        console.error("❌ Temizleme hatası:", error);
        return { success: false, error: (error as Error).message };
      }
    };

    console.log("🔧 Global functions available:");
    console.log("- clearAllData() - Tüm test verilerini sil");
    console.log("- clearAllDataSafe() - Tüm test verilerini güvenli şekilde sil (büyük veri için)");
    console.log("- createRealData() - Gerçek işletme verilerini oluştur");
    console.log("- keepOnlyReal() - Sadece 10 gerçek işletmeyi bırak, geri kalanını sil");
    console.log("- clearMyAppointments() - Belirli kullanıcının randevularını sil");
    console.log("- fullSystemReset() - Sistemi tamamen sıfırla ve gerçek verilerle doldur");
    console.log("- clearUserData() - Mevcut kullanıcının verilerini temizle");
  }, []);

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="register/user" element={<RegisterUser />} />
          <Route path="register/business" element={<RegisterBusiness />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="confirm-appointment/:id" element={<ConfirmAppointment />} />
          <Route path="profile" element={<Profile />} />
          <Route path="shops" element={<Shops />} />
          <Route path="shops/:id" element={<ShopDetail />} />
          <Route path="shop/:id" element={<ShopDetail />} />
          <Route path="category/:category" element={<CategoryPage />} />
          <Route path="services" element={<Shops />} />
          <Route path="services/:category" element={<CategoryPage />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/:appointmentId" element={<AppointmentDetail />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="comments" element={<Comments />} />
          <Route path="firebase-demo" element={<FirebaseDemo />} />

          {/* İşletme Korumalı Rotalar */}
          <Route
            path="business-register"
            element={
              <ProtectedBusinessRoute>
                <BusinessRegister />
              </ProtectedBusinessRoute>
            }
          />
          <Route
            path="business-dashboard"
            element={
              <ProtectedBusinessRoute>
                <BusinessDashboard />
              </ProtectedBusinessRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
