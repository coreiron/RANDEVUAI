import {
  addDoc,
  collection,
  doc,
  setDoc,
  Timestamp,
  writeBatch,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from './schema';
import { auth } from "../firebase";

/**
 * Bu fonksiyon test için Firestore'a örnek veriler eklemek amacıyla kullanılır.
 * Gerçek uygulamada bu işlem genellikle admin paneli veya backend tarafından yapılır.
 */
export const seedFirestoreWithSampleData = async (userId: string) => {
  try {
    console.log("Firestore'a örnek veriler ekleniyor...");

    // Kullanıcı profili oluştur
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, {
      displayName: "Test User",
      email: "testuser@example.com",
      phone: "+905551234567",
      role: "user",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        language: "tr",
        theme: "light"
      }
    }, { merge: true });

    // Örnek işletmeler oluştur
    const shop1Ref = collection(db, COLLECTIONS.SHOPS);
    const shop1Doc = await addDoc(shop1Ref, {
      ownerId: "shop_owner_1",
      name: "Seyfi Erkek Kuaförü",
      description: "Modern erkek kuaför salonu",
      shortDescription: "Modern saç kesimleri ve sakal tıraşı",
      category: "berber",
      subcategory: "erkek",
      images: {
        main: "https://example.com/shop1.jpg",
        gallery: ["https://example.com/shop1_1.jpg", "https://example.com/shop1_2.jpg"]
      },
      contact: {
        phone: "+905551234567",
        email: "seyfi@example.com",
        website: "https://seyfi.example.com",
        socialMedia: {
          instagram: "seyfi_berber",
          facebook: "seyfi.berber"
        }
      },
      location: {
        address: "Bağdat Caddesi No:123",
        district: "Kadıköy",
        city: "İstanbul",
        zipCode: "34000",
        coordinates: {
          latitude: 40.9812,
          longitude: 29.0321
        }
      },
      workingHours: {
        monday: { open: "09:00", close: "19:00" },
        tuesday: { open: "09:00", close: "19:00" },
        wednesday: { open: "09:00", close: "19:00" },
        thursday: { open: "09:00", close: "19:00" },
        friday: { open: "09:00", close: "19:00" },
        saturday: { open: "09:00", close: "18:00" },
        sunday: { open: null, close: null }
      },
      priceLevel: 2,
      rating: {
        average: 4.7,
        count: 123
      },
      tags: ["erkek", "saç", "sakal", "modern"],
      policies: {
        cancellation: "24 saat öncesine kadar ücretsiz iptal",
        payment: ["nakit", "kredi kartı", "havale"]
      },
      isVerified: true,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      popularityScore: 94
    });

    const shop2Ref = collection(db, COLLECTIONS.SHOPS);
    const shop2Doc = await addDoc(shop2Ref, {
      ownerId: "shop_owner_2",
      name: "Narin Güzellik Salonu",
      description: "Her türlü güzellik ve bakım hizmetleri",
      shortDescription: "Profesyonel güzellik ve bakım hizmetleri",
      category: "güzellik",
      subcategory: "kadın",
      images: {
        main: "https://example.com/shop2.jpg",
        gallery: ["https://example.com/shop2_1.jpg", "https://example.com/shop2_2.jpg"]
      },
      contact: {
        phone: "+905557654321",
        email: "narin@example.com",
        website: "https://narin.example.com",
        socialMedia: {
          instagram: "narin_guzellik",
          facebook: "narin.guzellik"
        }
      },
      location: {
        address: "İstiklal Caddesi No:456",
        district: "Beyoğlu",
        city: "İstanbul",
        zipCode: "34000",
        coordinates: {
          latitude: 41.0341,
          longitude: 28.9833
        }
      },
      workingHours: {
        monday: { open: "10:00", close: "20:00" },
        tuesday: { open: "10:00", close: "20:00" },
        wednesday: { open: "10:00", close: "20:00" },
        thursday: { open: "10:00", close: "20:00" },
        friday: { open: "10:00", close: "20:00" },
        saturday: { open: "10:00", close: "20:00" },
        sunday: { open: "12:00", close: "18:00" }
      },
      priceLevel: 3,
      rating: {
        average: 4.9,
        count: 215
      },
      tags: ["kadın", "manikür", "pedikür", "saç", "cilt bakımı"],
      policies: {
        cancellation: "12 saat öncesine kadar ücretsiz iptal",
        payment: ["nakit", "kredi kartı", "havale", "sms ödeme"]
      },
      isVerified: true,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      popularityScore: 98
    });

    // Örnek hizmetler oluştur
    const servicesRef = collection(db, COLLECTIONS.SERVICES);
    const services = [
      {
        shopId: shop1Doc.id,
        name: "Saç Kesimi",
        description: "Profesyonel erkek saç kesimi",
        duration: 30,
        price: 100,
        category: "saç",
        image: "https://example.com/haircut.jpg",
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        shopId: shop1Doc.id,
        name: "Sakal Tıraşı",
        description: "Özel bakım ürünleri ile sakal şekillendirme",
        duration: 20,
        price: 70,
        category: "sakal",
        image: "https://example.com/beard.jpg",
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        shopId: shop2Doc.id,
        name: "Manikür",
        description: "Profesyonel tırnak bakımı",
        duration: 45,
        price: 120,
        category: "tırnak",
        image: "https://example.com/manicure.jpg",
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        shopId: shop2Doc.id,
        name: "Saç Boyama",
        description: "Kalıcı saç boyama ve bakım",
        duration: 90,
        price: 350,
        discountedPrice: 300,
        category: "saç",
        image: "https://example.com/haircolor.jpg",
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    for (const service of services) {
      await addDoc(servicesRef, service);
    }

    // Örnek personeller oluştur
    const staffRef = collection(db, COLLECTIONS.STAFF);
    const staff = [
      {
        shopId: shop1Doc.id,
        name: "Mehmet Usta",
        title: "Baş Berber",
        bio: "15 yıllık tecrübe",
        photoURL: "https://example.com/staff1.jpg",
        specialties: ["klasik saç kesimi", "sakal şekillendirme"],
        serviceIds: [], // Hizmet ID'leri daha sonra eklenecek
        workingHours: {
          monday: { start: "09:00", end: "17:00" },
          tuesday: { start: "09:00", end: "17:00" },
          wednesday: { start: "09:00", end: "17:00" },
          thursday: { start: "09:00", end: "17:00" },
          friday: { start: "09:00", end: "17:00" },
          saturday: { start: "09:00", end: "16:00" },
          sunday: { start: null, end: null }
        },
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        shopId: shop2Doc.id,
        name: "Ayşe Hanım",
        title: "Güzellik Uzmanı",
        bio: "10 yıllık tecrübe ile profesyonel güzellik hizmetleri",
        photoURL: "https://example.com/staff2.jpg",
        specialties: ["manikür", "pedikür", "cilt bakımı"],
        serviceIds: [], // Hizmet ID'leri daha sonra eklenecek
        workingHours: {
          monday: { start: "10:00", end: "18:00" },
          tuesday: { start: "10:00", end: "18:00" },
          wednesday: { start: "10:00", end: "18:00" },
          thursday: { start: "10:00", end: "18:00" },
          friday: { start: "10:00", end: "18:00" },
          saturday: { start: "10:00", end: "16:00" },
          sunday: { start: null, end: null }
        },
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    for (const staffMember of staff) {
      await addDoc(staffRef, staffMember);
    }

    // Örnek randevu oluştur
    const appointmentsRef = collection(db, COLLECTIONS.APPOINTMENTS);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);

    await addDoc(appointmentsRef, {
      shopId: shop1Doc.id,
      userId,
      serviceId: "service_1", // Gerçek service id ile değiştir
      staffId: "staff_1",     // Gerçek staff id ile değiştir
      date: Timestamp.fromDate(tomorrow),
      endTime: Timestamp.fromDate(new Date(tomorrow.getTime() + 30 * 60000)), // 30 dakika sonra
      status: "confirmed",
      notes: "İlk ziyaretim",
      price: 100,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      reminderSent: false,
      followupSent: false
    });

    // Örnek mesaj oluştur
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);

    await addDoc(messagesRef, {
      shopId: shop1Doc.id,
      senderId: shop1Doc.id,
      senderName: "Seyfi Erkek Kuaförü",
      receiverId: userId,
      receiverName: "Test User",
      text: "Merhaba, randevu talebinizi aldık. Size uygun bir saat önerebilir miyiz?",
      createdAt: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 1 gün önce
      read: true,
      readAt: Timestamp.fromDate(new Date(Date.now() - 23.5 * 60 * 60 * 1000))  // 23.5 saat önce
    });

    await addDoc(messagesRef, {
      shopId: shop1Doc.id,
      senderId: userId,
      senderName: "Test User",
      receiverId: shop1Doc.id,
      receiverName: "Seyfi Erkek Kuaförü",
      text: "Evet, yarın öğleden sonra müsaitim.",
      createdAt: Timestamp.fromDate(new Date(Date.now() - 23 * 60 * 60 * 1000)), // 23 saat önce
      read: true,
      readAt: Timestamp.fromDate(new Date(Date.now() - 22.5 * 60 * 60 * 1000))  // 22.5 saat önce
    });

    await addDoc(messagesRef, {
      shopId: shop2Doc.id,
      senderId: shop2Doc.id,
      senderName: "Narin Güzellik Salonu",
      receiverId: userId,
      receiverName: "Test User",
      text: "Kampanyamızdan haberdar olmak ister misiniz?",
      createdAt: Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000)), // 12 saat önce
      read: false
    });

    // Örnek bildirimler oluştur
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);

    await addDoc(notificationsRef, {
      userId,
      title: "Randevu Onayı",
      message: "Yarın saat 14:00'daki randevunuz onaylandı.",
      type: "appointment_confirmation",
      data: {
        appointmentId: "appointment_1",
        shopId: shop1Doc.id
      },
      createdAt: serverTimestamp(),
      read: false
    });

    await addDoc(notificationsRef, {
      userId,
      title: "Yeni Mesaj",
      message: "Narin Güzellik Salonu size bir mesaj gönderdi.",
      type: "new_message",
      data: {
        shopId: shop2Doc.id,
        messageId: "message_id"
      },
      createdAt: Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000)), // 12 saat önce
      read: false
    });

    // Örnek promosyon kodları oluştur
    const promocodesRef = collection(db, COLLECTIONS.PROMOCODES);

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await addDoc(promocodesRef, {
      shopId: shop1Doc.id,
      code: "WELCOME20",
      description: "Yeni müşteriler için %20 indirim",
      discountType: "percentage",
      discountValue: 20,
      minPurchase: 50,
      maxDiscount: 100,
      validFrom: Timestamp.fromDate(new Date()),
      validUntil: Timestamp.fromDate(nextMonth),
      usageLimit: 100,
      usageCount: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log("Örnek veriler başarıyla eklendi!");
    return {
      success: true,
      shopIds: {
        shop1: shop1Doc.id,
        shop2: shop2Doc.id
      }
    };
  } catch (error) {
    console.error("Örnek veri ekleme hatası:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * Bu fonksiyon Firestore'daki kullanıcı verilerini temizler (test amaçlı).
 * Gerçek uygulamada bu işlem genellikle admin paneli üzerinden yapılır.
 */
export const clearUserData = async (userId: string) => {
  try {
    const batch = writeBatch(db);

    // Kullanıcının randevularını sil
    const appointmentsQuery = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where("userId", "==", userId)
    );
    const appointmentSnapshot = await getDocs(appointmentsQuery);

    appointmentSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Kullanıcının mesajlarını sil
    const messagesQuery1 = query(
      collection(db, COLLECTIONS.MESSAGES),
      where("senderId", "==", userId)
    );
    const messagesSnapshot1 = await getDocs(messagesQuery1);
    messagesSnapshot1.forEach(doc => {
      batch.delete(doc.ref);
    });

    const messagesQuery2 = query(
      collection(db, COLLECTIONS.MESSAGES),
      where("receiverId", "==", userId)
    );
    const messagesSnapshot2 = await getDocs(messagesQuery2);
    messagesSnapshot2.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Kullanıcının bildirimlerini sil
    const notificationsQuery = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    notificationsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error("Veri temizleme hatası:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * Kullanıcının tüm verilerini temizle - test amaçlı
 */
export const clearCurrentUserData = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("❌ No user logged in");
      return { success: false, error: "Kullanıcı oturum açmamış" };
    }

    console.log("🗑️ Clearing all data for user:", currentUser.uid);
    const result = await clearUserData(currentUser.uid);

    if (result.success) {
      console.log("✅ User data cleared successfully");
    } else {
      console.error("❌ Failed to clear user data:", result.error);
    }

    return result;
  } catch (error) {
    console.error("❌ Error clearing user data:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * Test verileri dışındaki tüm işletmeleri sil
 */
export const cleanupExtraShops = async () => {
  try {
    console.log("🧹 Cleaning up extra shops, keeping only test data...");

    // Test için eklediğimiz işletmelerin isimlerini belirle
    const keepShops = [
      "Seyfi Erkek Kuaförü",
      "Narin Güzellik Salonu"
    ];

    // Tüm işletmeleri al
    const shopsSnapshot = await getDocs(collection(db, COLLECTIONS.SHOPS));
    const batch = writeBatch(db);
    let deletedCount = 0;

    shopsSnapshot.forEach(doc => {
      const shopData = doc.data();
      const shopName = shopData.name;

      // Test işletmeleri değilse sil
      if (!keepShops.includes(shopName)) {
        console.log(`🗑️ Deleting shop: ${shopName}`);
        batch.delete(doc.ref);
        deletedCount++;
      } else {
        console.log(`✅ Keeping test shop: ${shopName}`);
      }
    });

    if (deletedCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully deleted ${deletedCount} extra shops`);
    } else {
      console.log("✅ No extra shops to delete");
    }

    return { success: true, deletedCount };
  } catch (error) {
    console.error("❌ Error cleaning up shops:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * Test işletmelerinin kategorilerini düzelt
 */
export const fixTestShopCategories = async () => {
  try {
    console.log("🔧 Fixing test shop categories...");

    const shopsSnapshot = await getDocs(collection(db, COLLECTIONS.SHOPS));
    const batch = writeBatch(db);
    let updatedCount = 0;

    shopsSnapshot.forEach(doc => {
      const shopData = doc.data();
      const shopName = shopData.name;

      let newCategory = null;

      if (shopName === "Seyfi Erkek Kuaförü") {
        newCategory = "beauty"; // Güzellik & Bakım kategorisi
      } else if (shopName === "Narin Güzellik Salonu") {
        newCategory = "beauty"; // Güzellik & Bakım kategorisi
      }

      if (newCategory && shopData.category !== newCategory) {
        console.log(`🔧 Updating ${shopName} category to: ${newCategory}`);
        batch.update(doc.ref, {
          category: newCategory,
          updatedAt: serverTimestamp()
        });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully updated ${updatedCount} shop categories`);
    } else {
      console.log("✅ All shop categories are already correct");
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error("❌ Error fixing shop categories:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * Tüm test verilerini tamamen temizle
 */
export const clearAllTestData = async () => {
  try {
    console.log("🧹 Clearing ALL test data from Firestore...");

    const batch = writeBatch(db);
    let deletedCount = 0;

    // Tüm koleksiyonları temizle
    const collections = [
      'shops',
      'services',
      'staff',
      'appointments',
      'messages',
      'notifications',
      'reviews',
      'promocodes'
    ];

    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      console.log(`🗑️ Deleting ${snapshot.size} documents from ${collectionName}`);

      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });
    }

    // Belirli kullanıcının verilerini temizle
    const userEmail = "nyalcinozdemir96@gmail.com";
    console.log(`🗑️ Clearing data for user: ${userEmail}`);

    await batch.commit();

    console.log(`✅ Successfully deleted ${deletedCount} documents from all collections`);
    return { success: true, deletedCount };
  } catch (error) {
    console.error("❌ Error clearing all test data:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * Gerçek işletme verilerini oluştur
 */
export const createRealBusinessData = async () => {
  try {
    console.log("🏗️ Creating real business data...");

    // Gerçek işletme verileri
    const businesses = [
      {
        name: "Elite Güzellik Merkezi",
        description: "Modern cilt bakım ve estetik hizmetleri sunan güzellik merkezi",
        category: "beauty",
        subcategory: "kadın",
        email: "info@eliteguzellik.com",
        phone: "+905551234567",
        address: "Bağdat Caddesi No:234, Kadıköy",
        district: "Kadıköy",
        city: "İstanbul",
        mainImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
        services: [
          { name: "Cilt Bakımı", duration: 60, price: 350, image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop" },
          { name: "Klasik Manikür", duration: 45, price: 120, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop" },
          { name: "Pedikür", duration: 50, price: 140, image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=300&fit=crop" },
          { name: "Kaş Şekillendirme", duration: 30, price: 80, image: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=400&h=300&fit=crop" },
          { name: "Saç Boyama", duration: 120, price: 450, image: "https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=400&h=300&fit=crop" }
        ],
        staff: [
          { name: "Ayşe Yılmaz", title: "Güzellik Uzmanı", photo: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=300&h=300&fit=crop&crop=face" },
          { name: "Zeynep Kaya", title: "Cilt Bakım Uzmanı", photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face" },
          { name: "Merve Demir", title: "Saç Stilisti", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face" },
          { name: "Fatma Öztürk", title: "Manikür Uzmanı", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face" },
          { name: "Selin Akar", title: "Kaş Uzmanı", photo: "https://images.unsplash.com/photo-1494790108755-2616b612b550?w=300&h=300&fit=crop&crop=face" }
        ]
      },
      {
        name: "Modern Erkek Kuaförü",
        description: "Geleneksel ve modern saç kesim teknikleri",
        category: "beauty",
        subcategory: "erkek",
        email: "info@modernerkek.com",
        phone: "+905552345678",
        address: "İstiklal Caddesi No:456, Beyoğlu",
        district: "Beyoğlu",
        city: "İstanbul",
        mainImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop",
        services: [
          { name: "Saç Kesimi", duration: 30, price: 100, image: "https://images.unsplash.com/photo-1621647509542-395d2fc83ba8?w=400&h=300&fit=crop" },
          { name: "Sakal Kesimi", duration: 20, price: 60, image: "https://images.unsplash.com/photo-1506629905607-c60fd9031c85?w=400&h=300&fit=crop" },
          { name: "Saç + Sakal", duration: 45, price: 140, image: "https://images.unsplash.com/photo-1599951753653-04d6ec5f4f7e?w=400&h=300&fit=crop" },
          { name: "Klasik Tıraş", duration: 25, price: 70, image: "https://images.unsplash.com/photo-1585747721671-b4a7b6c42069?w=400&h=300&fit=crop" },
          { name: "Saç Yıkama", duration: 15, price: 40, image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop" }
        ],
        staff: [
          { name: "Mehmet Usta", title: "Baş Berber", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face" },
          { name: "Ali Keskin", title: "Berber", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" },
          { name: "Hasan Çelik", title: "Berber", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face" },
          { name: "Emre Yıldız", title: "Saç Stilisti", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face" },
          { name: "Burak Arslan", title: "Berber", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face" }
        ]
      },
      {
        name: "Fit Life Spor Salonu",
        description: "Modern ekipmanlar ve uzman eğitmenlerle fitness",
        category: "fitness",
        subcategory: "spor",
        email: "info@fitlife.com",
        phone: "+905553456789",
        address: "Akasya AVM Yanı, Acıbadem",
        district: "Üsküdar",
        city: "İstanbul",
        mainImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
        services: [
          { name: "Kişisel Antrenman", duration: 60, price: 200, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop" },
          { name: "Grup Dersi", duration: 45, price: 80, image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop" },
          { name: "Yoga Dersi", duration: 60, price: 100, image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop" },
          { name: "Crossfit", duration: 50, price: 120, image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop" },
          { name: "Pilates", duration: 55, price: 110, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop" }
        ],
        staff: [
          { name: "Can Yılmaz", title: "Antrenör", photo: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=300&h=300&fit=crop&crop=face" },
          { name: "Deniz Kaya", title: "Yoga Eğitmeni", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face" },
          { name: "Mert Demir", title: "Crossfit Antrenörü", photo: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&h=300&fit=crop&crop=face" },
          { name: "Elif Öztürk", title: "Pilates Eğitmeni", photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face" },
          { name: "Oğuzhan Akar", title: "Kişisel Antrenör", photo: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300&h=300&fit=crop&crop=face" }
        ]
      },
      {
        name: "Lezzet Mutfağı",
        description: "Türk ve Dünya mutfağından özel lezzetler",
        category: "food",
        subcategory: "restoran",
        email: "info@lezzetmutfagi.com",
        phone: "+905554567890",
        address: "Nişantaşı Merkez, Şişli",
        district: "Şişli",
        city: "İstanbul",
        mainImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
        services: [
          { name: "Masa Rezervasyonu", duration: 120, price: 0, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop" },
          { name: "Özel Etkinlik", duration: 240, price: 2000, image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop" },
          { name: "Şef Menüsü", duration: 90, price: 350, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop" },
          { name: "Açık Büfe", duration: 150, price: 180, image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop" },
          { name: "Kahvaltı", duration: 60, price: 85, image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&fit=crop" }
        ],
        staff: [
          { name: "Ahmet Şef", title: "Baş Aşçı", photo: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=300&fit=crop&crop=face" },
          { name: "Gül Hanım", title: "Garson", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face" },
          { name: "Kemal Bey", title: "Maître", photo: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&h=300&fit=crop&crop=face" },
          { name: "Leyla Hanım", title: "Garson", photo: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=300&h=300&fit=crop&crop=face" },
          { name: "Cem Bey", title: "Barista", photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=face" }
        ]
      },
      {
        name: "Sağlık Merkezi Plus",
        description: "Genel sağlık hizmetleri ve uzman doktor muayeneleri",
        category: "health",
        subcategory: "hastane",
        email: "info@saglikplus.com",
        phone: "+905555678901",
        address: "Etiler Mahallesi, Beşiktaş",
        district: "Beşiktaş",
        city: "İstanbul",
        mainImage: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop",
        services: [
          { name: "Genel Pratisyen", duration: 30, price: 300, image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop" },
          { name: "Kardiyoloji", duration: 45, price: 500, image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop" },
          { name: "Dahiliye", duration: 40, price: 400, image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=300&fit=crop" },
          { name: "Check-up", duration: 120, price: 1200, image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=300&fit=crop" },
          { name: "Laboratuvar", duration: 15, price: 150, image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop" }
        ],
        staff: [
          { name: "Dr. Mehmet Yıldız", title: "Genel Pratisyen", photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face" },
          { name: "Dr. Ayşe Kara", title: "Kardiyolog", photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face" },
          { name: "Dr. Fatma Demir", title: "Dahiliye", photo: "https://images.unsplash.com/photo-1594824309495-4b4c55fa2b97?w=300&h=300&fit=crop&crop=face" },
          { name: "Hemşire Elif", title: "Hemşire", photo: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&h=300&fit=crop&crop=face" },
          { name: "Lab. Tekn. Hasan", title: "Laboratuvar Teknisyeni", photo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face" }
        ]
      },
      {
        name: "TechFix Bilgisayar",
        description: "Bilgisayar ve elektronik cihaz tamiri",
        category: "tech",
        subcategory: "tamir",
        email: "info@techfix.com",
        phone: "+905556789012",
        address: "Teknokent AVM, Kağıthane",
        district: "Kağıthane",
        city: "İstanbul",
        mainImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop",
        services: [
          { name: "Bilgisayar Tamiri", duration: 90, price: 200, image: "https://images.unsplash.com/photo-1518709268805-4e9042af2ac1?w=400&h=300&fit=crop" },
          { name: "Telefon Tamiri", duration: 60, price: 150, image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=300&fit=crop" },
          { name: "Veri Kurtarma", duration: 120, price: 400, image: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400&h=300&fit=crop" },
          { name: "Yazılım Kurulumu", duration: 45, price: 100, image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop" },
          { name: "Format Atma", duration: 60, price: 80, image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop" }
        ],
        staff: [
          { name: "Emre Teknisyen", title: "Bilgisayar Uzmanı", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" },
          { name: "Burak Yazılımcı", title: "Yazılım Uzmanı", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face" },
          { name: "Deniz Tekniker", title: "Donanım Uzmanı", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face" },
          { name: "Oğuz Veri", title: "Veri Uzmanı", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face" },
          { name: "Serkan Telefon", title: "Telefon Uzmanı", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face" }
        ]
      },
      {
        name: "Kreatif Sanat Atölyesi",
        description: "Yaratıcı sanat aktiviteleri ve atölye çalışmaları",
        category: "education",
        subcategory: "kurs",
        email: "info@kreatifatolye.com",
        phone: "+905557890123",
        address: "Cihangir Mahallesi, Beyoğlu",
        district: "Beyoğlu",
        city: "İstanbul",
        mainImage: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
        services: [
          { name: "Resim Kursu", duration: 90, price: 150, image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop" },
          { name: "Seramik Atölyesi", duration: 120, price: 200, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop" },
          { name: "Takı Tasarımı", duration: 75, price: 180, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop" },
          { name: "Kaligrafi", duration: 60, price: 120, image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop" },
          { name: "Çocuk Sanat", duration: 45, price: 80, image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop" }
        ],
        staff: [
          { name: "Sanat. Aylin", title: "Resim Öğretmeni", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face" },
          { name: "Usta Kemal", title: "Seramik Ustası", photo: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&h=300&fit=crop&crop=face" },
          { name: "Tasarımcı Ece", title: "Takı Tasarımcısı", photo: "https://images.unsplash.com/photo-1494790108755-2616b612b550?w=300&h=300&fit=crop&crop=face" },
          { name: "Hoca Mehmet", title: "Kaligrafi Ustası", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" },
          { name: "Öğretmen Selin", title: "Çocuk Eğitmeni", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face" }
        ]
      },
      {
        name: "Oto Bakım Merkezi",
        description: "Araç bakım ve onarım hizmetleri",
        category: "auto",
        subcategory: "servis",
        email: "info@otobakimmerkezi.com",
        phone: "+905558901234",
        address: "Hadımköy OSB, Arnavutköy",
        district: "Arnavutköy",
        city: "İstanbul",
        mainImage: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop",
        services: [
          { name: "Yağ Değişimi", duration: 30, price: 250, image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop" },
          { name: "Lastik Değişimi", duration: 45, price: 100, image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop" },
          { name: "Fren Kontrolü", duration: 60, price: 200, image: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400&h=300&fit=crop" },
          { name: "Genel Bakım", duration: 120, price: 400, image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&h=300&fit=crop" },
          { name: "Araç Yıkama", duration: 20, price: 50, image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&h=300&fit=crop" }
        ],
        staff: [
          { name: "Usta Hüseyin", title: "Baş Teknisyen", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face" },
          { name: "Teknisyen Ali", title: "Oto Elektrikiçisi", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face" },
          { name: "Mekanik Veli", title: "Motor Uzmanı", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face" },
          { name: "Boyacı Mehmet", title: "Boya Uzmanı", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" },
          { name: "Yıkamacı Can", title: "Detay Uzmanı", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face" }
        ]
      },
      {
        name: "Pet Bakım Salonu",
        description: "Evcil hayvan bakım ve güzellik hizmetleri",
        category: "pets",
        subcategory: "bakım",
        email: "info@petbakimsalonu.com",
        phone: "+905559012345",
        address: "Etiler Pet Street, Beşiktaş",
        district: "Beşiktaş",
        city: "İstanbul",
        mainImage: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop",
        services: [
          { name: "Köpek Tıraşı", duration: 60, price: 120, image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop" },
          { name: "Kedi Bakımı", duration: 45, price: 100, image: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400&h=300&fit=crop" },
          { name: "Tırnak Kesimi", duration: 20, price: 40, image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop" },
          { name: "Yıkama", duration: 30, price: 80, image: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400&h=300&fit=crop" },
          { name: "Diş Temizliği", duration: 25, price: 60, image: "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=300&fit=crop" }
        ],
        staff: [
          { name: "Veteriner Zeynep", title: "Veteriner Hekim", photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face" },
          { name: "Bakım Uzm. Ahmet", title: "Pet Groomer", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" },
          { name: "Eğitmen Canan", title: "Hayvan Eğitmeni", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face" },
          { name: "Teknisyen Murat", title: "Veteriner Teknisyeni", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face" },
          { name: "Yardımcı Elif", title: "Hayvan Bakıcısı", photo: "https://images.unsplash.com/photo-1494790108755-2616b612b550?w=300&h=300&fit=crop&crop=face" }
        ]
      }
    ];

    // İşletmeleri oluştur
    for (const businessData of businesses) {
      console.log(`🏪 Creating business: ${businessData.name}`);

      // İşletme dökümanı oluştur
      const shopRef = await addDoc(collection(db, COLLECTIONS.SHOPS), {
        name: businessData.name,
        description: businessData.description,
        category: businessData.category,
        subcategory: businessData.subcategory,
        email: businessData.email,
        contact: {
          phone: businessData.phone,
          email: businessData.email
        },
        location: {
          address: businessData.address,
          district: businessData.district,
          city: businessData.city,
          coordinates: {
            latitude: 41.0082 + (Math.random() - 0.5) * 0.1,
            longitude: 28.9784 + (Math.random() - 0.5) * 0.1
          }
        },
        images: {
          main: businessData.mainImage,
          gallery: [businessData.mainImage]
        },
        workingHours: {
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "18:00" },
          saturday: { open: "09:00", close: "17:00" },
          sunday: { open: "10:00", close: "16:00" }
        },
        rating: {
          average: 4.5 + Math.random() * 0.5,
          count: Math.floor(Math.random() * 100) + 20
        },
        priceLevel: Math.floor(Math.random() * 3) + 1,
        isVerified: true,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        popularityScore: Math.floor(Math.random() * 30) + 70
      });

      // Hizmetleri oluştur
      const serviceIds: string[] = [];
      for (const serviceData of businessData.services) {
        const serviceRef = await addDoc(collection(db, COLLECTIONS.SERVICES), {
          shopId: shopRef.id,
          name: serviceData.name,
          duration: serviceData.duration,
          price: serviceData.price,
          category: businessData.category,
          image: serviceData.image,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        serviceIds.push(serviceRef.id);
      }

      // Personelleri oluştur
      const staffIds: string[] = [];
      for (const staffData of businessData.staff) {
        const staffRef = await addDoc(collection(db, COLLECTIONS.STAFF), {
          shopId: shopRef.id,
          name: staffData.name,
          title: staffData.title,
          photoURL: staffData.photo,
          serviceIds: serviceIds, // Tüm hizmetleri verebilir
          workingHours: {
            monday: { start: "09:00", end: "17:00" },
            tuesday: { start: "09:00", end: "17:00" },
            wednesday: { start: "09:00", end: "17:00" },
            thursday: { start: "09:00", end: "17:00" },
            friday: { start: "09:00", end: "17:00" },
            saturday: { start: "09:00", end: "16:00" },
            sunday: { start: "10:00", end: "15:00" }
          },
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        staffIds.push(staffRef.id);
      }

      // 30 gün için uygunluk oluştur
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const availabilityDate = new Date(today);
        availabilityDate.setDate(today.getDate() + i);
        availabilityDate.setHours(0, 0, 0, 0);

        // Her personel için uygunluk saatleri
        for (const staffId of staffIds) {
          const timeSlots = [];
          for (let hour = 9; hour < 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
              const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              timeSlots.push(timeString);
            }
          }

          await addDoc(collection(db, COLLECTIONS.AVAILABILITY || 'availability'), {
            shopId: shopRef.id,
            staffId,
            date: Timestamp.fromDate(availabilityDate),
            timeSlots,
            isAvailable: true,
            createdAt: serverTimestamp()
          });
        }
      }

      console.log(`✅ Business ${businessData.name} created successfully with ${serviceIds.length} services and ${staffIds.length} staff`);
    }

    console.log("✅ All real business data created successfully!");
    return { success: true, businessCount: businesses.length };
  } catch (error) {
    console.error("❌ Error creating real business data:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * Belirli kullanıcının randevularını temizle
 */
export const clearUserAppointments = async (userEmail: string) => {
  try {
    console.log(`🗑️ Clearing appointments for user: ${userEmail}`);

    // Firebase Auth'dan kullanıcı ID'sini bul
    const userRecord = await auth.currentUser;
    if (!userRecord || userRecord.email !== userEmail) {
      console.log("User not found or not logged in");
      return { success: false, error: "Kullanıcı bulunamadı" };
    }

    const userId = userRecord.uid;

    // Kullanıcının randevularını sil
    const appointmentsQuery = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where("userId", "==", userId)
    );
    const appointmentSnapshot = await getDocs(appointmentsQuery);

    const batch = writeBatch(db);
    appointmentSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`✅ Deleted ${appointmentSnapshot.size} appointments for user: ${userEmail}`);
    return { success: true, deletedCount: appointmentSnapshot.size };
  } catch (error) {
    console.error("❌ Error clearing user appointments:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * Sadece gerçek 10 işletmeyi bırakıp geri kalanını sil
 */
export const keepOnlyRealBusinesses = async () => {
  try {
    console.log("🧹 Keeping only real businesses, removing all test data...");

    // Gerçek işletme isimleri
    const realBusinessNames = [
      "Elite Güzellik Merkezi",
      "Modern Erkek Kuaförü",
      "Fit Life Spor Salonu",
      "Lezzet Mutfağı",
      "Sağlık Merkezi Plus",
      "TechFix Bilgisayar",
      "Kreatif Sanat Atölyesi",
      "Oto Bakım Merkezi",
      "Pet Bakım Salonu"
    ];

    // Tüm işletmeleri al
    const shopsSnapshot = await getDocs(collection(db, COLLECTIONS.SHOPS));
    const batch = writeBatch(db);
    let deletedCount = 0;
    let keptCount = 0;

    // Silinecek işletmelerin ID'lerini topla
    const shopIdsToDelete: string[] = [];

    shopsSnapshot.forEach(doc => {
      const shopData = doc.data();
      const shopName = shopData.name;

      if (!realBusinessNames.includes(shopName)) {
        console.log(`🗑️ Will delete shop: ${shopName}`);
        shopIdsToDelete.push(doc.id);
        batch.delete(doc.ref);
        deletedCount++;
      } else {
        console.log(`✅ Keeping real shop: ${shopName}`);
        keptCount++;
      }
    });

    // İşletmeleri sil
    if (deletedCount > 0) {
      await batch.commit();
      console.log(`✅ Deleted ${deletedCount} test shops, kept ${keptCount} real shops`);
    }

    // Bu silinen işletmelere ait tüm ilgili verileri de sil
    const collections = [
      { name: COLLECTIONS.SERVICES, field: 'shopId' },
      { name: COLLECTIONS.STAFF, field: 'shopId' },
      { name: COLLECTIONS.APPOINTMENTS, field: 'shopId' },
      { name: COLLECTIONS.MESSAGES, field: 'shopId' },
      { name: COLLECTIONS.REVIEWS, field: 'shopId' },
      { name: COLLECTIONS.AVAILABILITY, field: 'shopId' }
    ];

    let totalRelatedDeleted = 0;

    for (const col of collections) {
      const batch2 = writeBatch(db);
      let batchCount = 0;

      for (const shopId of shopIdsToDelete) {
        const relatedQuery = query(
          collection(db, col.name),
          where(col.field, "==", shopId)
        );
        const relatedSnapshot = await getDocs(relatedQuery);

        relatedSnapshot.forEach(doc => {
          if (batchCount < 500) { // Firestore batch limit
            batch2.delete(doc.ref);
            batchCount++;
            totalRelatedDeleted++;
          }
        });
      }

      if (batchCount > 0) {
        await batch2.commit();
        console.log(`🗑️ Deleted ${batchCount} documents from ${col.name}`);
      }
    }

    console.log(`✅ Cleanup completed: Deleted ${deletedCount} shops and ${totalRelatedDeleted} related documents`);
    console.log(`✅ Kept ${keptCount} real businesses`);

    return {
      success: true,
      deletedShops: deletedCount,
      keptShops: keptCount,
      deletedRelated: totalRelatedDeleted
    };
  } catch (error) {
    console.error("❌ Error in cleanup:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * Büyük veri setlerini küçük parçalarda temizle (Firebase batch limit çözümü)
 */
export const clearAllDataInBatches = async () => {
  try {
    console.log("🧹 Clearing ALL data in small batches...");

    const collections = [
      'shops',
      'services',
      'staff',
      'appointments',
      'messages',
      'notifications',
      'reviews',
      'promocodes',
      'availability'
    ];

    let totalDeleted = 0;

    for (const collectionName of collections) {
      console.log(`🗑️ Processing collection: ${collectionName}`);

      let hasMore = true;
      while (hasMore) {
        // Her seferinde 400 döküman al (500 limitinin altında)
        const snapshot = await getDocs(query(collection(db, collectionName)));

        if (snapshot.empty) {
          hasMore = false;
          continue;
        }

        const batch = writeBatch(db);
        let batchCount = 0;

        snapshot.forEach(doc => {
          if (batchCount < 400) { // 400 limit güvenlik için
            batch.delete(doc.ref);
            batchCount++;
            totalDeleted++;
          }
        });

        if (batchCount > 0) {
          await batch.commit();
          console.log(`✅ Deleted ${batchCount} documents from ${collectionName}`);

          // Kısa bir bekleme ekle
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Eğer 400'den az döküman varsa, koleksiyon boş demektir
        if (batchCount < 400) {
          hasMore = false;
        }
      }
    }

    console.log(`✅ Total deleted: ${totalDeleted} documents from all collections`);
    return { success: true, deletedCount: totalDeleted };
  } catch (error) {
    console.error("❌ Error clearing data in batches:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 10 gerçek işletme için işletme hesapları oluştur
 */
export const createBusinessAccounts = async () => {
  try {
    console.log("🏢 Creating business accounts for all shops...");

    // Gerçek işletme hesap verileri
    const businessAccounts = [
      {
        shopName: "Elite Güzellik Merkezi",
        email: "info@eliteguzellik.com",
        password: "Elite2024!",
        phone: "+905551234567",
        ownerName: "Ayşe Yılmaz",
        role: "business_owner"
      },
      {
        shopName: "Modern Erkek Kuaförü",
        email: "info@modernerkek.com",
        password: "Modern2024!",
        phone: "+905552345678",
        ownerName: "Mehmet Usta",
        role: "business_owner"
      },
      {
        shopName: "Fit Life Spor Salonu",
        email: "info@fitlife.com",
        password: "FitLife2024!",
        phone: "+905553456789",
        ownerName: "Can Yılmaz",
        role: "business_owner"
      },
      {
        shopName: "Lezzet Mutfağı",
        email: "info@lezzetmutfagi.com",
        password: "Lezzet2024!",
        phone: "+905554567890",
        ownerName: "Ahmet Şef",
        role: "business_owner"
      },
      {
        shopName: "Sağlık Merkezi Plus",
        email: "info@saglikplus.com",
        password: "Saglik2024!",
        phone: "+905555678901",
        ownerName: "Dr. Mehmet Yıldız",
        role: "business_owner"
      },
      {
        shopName: "TechFix Bilgisayar",
        email: "info@techfix.com",
        password: "TechFix2024!",
        phone: "+905556789012",
        ownerName: "Emre Teknisyen",
        role: "business_owner"
      },
      {
        shopName: "Kreatif Sanat Atölyesi",
        email: "info@kreatifatolye.com",
        password: "Kreatif2024!",
        phone: "+905557890123",
        ownerName: "Sanat. Aylin",
        role: "business_owner"
      },
      {
        shopName: "Oto Bakım Merkezi",
        email: "info@otobakimmerkezi.com",
        password: "OtoBakim2024!",
        phone: "+905558901234",
        ownerName: "Usta Hüseyin",
        role: "business_owner"
      },
      {
        shopName: "Pet Bakım Salonu",
        email: "info@petbakimsalonu.com",
        password: "PetBakim2024!",
        phone: "+905559012345",
        ownerName: "Veteriner Zeynep",
        role: "business_owner"
      }
    ];

    const createdAccounts = [];

    for (const accountData of businessAccounts) {
      try {
        console.log(`🏪 Creating business account for: ${accountData.shopName}`);

        // Önce bu işletmenin ID'sini bul
        const shopsQuery = query(
          collection(db, COLLECTIONS.SHOPS),
          where("name", "==", accountData.shopName)
        );
        const shopSnapshot = await getDocs(shopsQuery);

        if (shopSnapshot.empty) {
          console.warn(`⚠️ Shop not found: ${accountData.shopName}`);
          continue;
        }

        const shopDoc = shopSnapshot.docs[0];
        const shopId = shopDoc.id;
        const shopData = shopDoc.data();

        // İşletme hesabını users koleksiyonuna ekle
        const businessUserRef = await addDoc(collection(db, COLLECTIONS.USERS), {
          email: accountData.email,
          displayName: accountData.ownerName,
          name: accountData.ownerName,
          phone: accountData.phone,
          role: accountData.role,
          businessInfo: {
            shopId: shopId,
            shopName: accountData.shopName,
            isOwner: true,
            permissions: ['manage_appointments', 'manage_staff', 'manage_services', 'view_analytics'],
            joinedAt: serverTimestamp()
          },
          profile: {
            avatar: shopData.images?.main || "/placeholder.svg",
            bio: `${accountData.shopName} işletme sahibi`,
            location: shopData.location?.city || "İstanbul"
          },
          settings: {
            notifications: {
              email: true,
              push: true,
              sms: true
            },
            privacy: {
              profileVisible: true,
              contactVisible: true
            }
          },
          isActive: true,
          isVerified: true,
          emailVerified: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          // Firebase Auth placeholder - gerçek uygulamada Firebase Auth ile oluşturulacak
          authUid: `business_${shopId}_${Date.now()}`,
          temporaryPassword: accountData.password // Geçici şifre - güvenlik için
        });

        // İşletme bilgilerini güncelle - sahip bilgisi ekle
        await updateDoc(doc(db, COLLECTIONS.SHOPS, shopId), {
          ownerId: businessUserRef.id,
          ownerEmail: accountData.email,
          businessAccount: {
            userId: businessUserRef.id,
            email: accountData.email,
            ownerName: accountData.ownerName,
            createdAt: serverTimestamp()
          },
          updatedAt: serverTimestamp()
        });

        createdAccounts.push({
          shopName: accountData.shopName,
          email: accountData.email,
          userId: businessUserRef.id,
          shopId: shopId,
          ownerName: accountData.ownerName
        });

        console.log(`✅ Business account created for ${accountData.shopName}`);
        console.log(`   📧 Email: ${accountData.email}`);
        console.log(`   🔑 Password: ${accountData.password}`);
        console.log(`   👤 Owner: ${accountData.ownerName}`);
        console.log(`   🏪 Shop ID: ${shopId}`);

      } catch (error) {
        console.error(`❌ Error creating account for ${accountData.shopName}:`, error);
      }
    }

    console.log(`✅ Created ${createdAccounts.length} business accounts`);
    console.log("\n📋 Business Account Summary:");
    console.log("=".repeat(60));

    createdAccounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.shopName}`);
      console.log(`   📧 Email: ${account.email}`);
      console.log(`   👤 Owner: ${account.ownerName}`);
      console.log(`   🏪 Shop ID: ${account.shopId}`);
      console.log("");
    });

    return {
      success: true,
      accountCount: createdAccounts.length,
      accounts: createdAccounts
    };

  } catch (error) {
    console.error("❌ Error creating business accounts:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * İşletme hesabı girişini simüle et (test için)
 */
export const simulateBusinessLogin = async (shopName: string) => {
  try {
    console.log(`🔐 Simulating business login for: ${shopName}`);

    // İşletme hesabını bul
    const usersQuery = query(
      collection(db, COLLECTIONS.USERS),
      where("role", "==", "business_owner"),
      where("businessInfo.shopName", "==", shopName)
    );

    const userSnapshot = await getDocs(usersQuery);

    if (userSnapshot.empty) {
      return { success: false, error: "İşletme hesabı bulunamadı" };
    }

    const businessUser = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;

    console.log(`✅ Business login simulated for ${shopName}`);
    console.log(`   👤 User: ${businessUser.displayName}`);
    console.log(`   📧 Email: ${businessUser.email}`);
    console.log(`   🏪 Shop ID: ${businessUser.businessInfo.shopId}`);

    return {
      success: true,
      user: businessUser,
      userId: userId,
      shopId: businessUser.businessInfo.shopId
    };

  } catch (error) {
    console.error("❌ Error simulating business login:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};
