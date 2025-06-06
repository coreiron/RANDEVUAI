import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth, getCurrentUser } from "../firebase";
import { COLLECTIONS } from "../firebase/schema";
import { toast } from "@/components/ui/sonner";

// Kullanıcı profili oluştur veya güncelle
export const updateUserProfile = async (profileData: {
  displayName?: string;
  phone?: string;
  photoURL?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    },
    language?: string;
    theme?: "light" | "dark";
  },
  address?: {
    title?: string;
    street?: string;
    district?: string;
    city?: string;
    zipCode?: string;
  }
}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Profil güncellemek için giriş yapmalısınız.");
      throw new Error("Kullanıcı oturum açmamış");
    }

    const userRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
    const userDoc = await getDoc(userRef);

    const updateData = {
      ...profileData,
      updatedAt: serverTimestamp()
    };

    if (userDoc.exists()) {
      // Mevcut kullanıcıyı güncelle
      await updateDoc(userRef, updateData);
    } else {
      // Yeni kullanıcı oluştur
      await setDoc(userRef, {
        ...updateData,
        email: currentUser.email,
        displayName: profileData.displayName || currentUser.displayName,
        role: "user",
        createdAt: serverTimestamp()
      });
    }

    toast.success("Profil başarıyla güncellendi.");
    return true;
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    toast.error("Profil güncellenirken bir hata oluştu.");
    throw error;
  }
};

// Kullanıcı profilini getir
export const getUserProfile = async (userId?: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser && !userId) {
      return null;
    }

    const targetUserId = userId || currentUser!.uid;
    const userRef = doc(db, COLLECTIONS.USERS, targetUserId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }

    return null;
  } catch (error) {
    console.error("Profil getirme hatası:", error);
    throw error;
  }
};

// Adres ekle
export const addUserAddress = async (addressData: {
  title: string;
  street: string;
  district?: string;
  city: string;
  zipCode?: string;
  isDefault?: boolean;
}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Adres eklemek için giriş yapmalısınız.");
      throw new Error("Kullanıcı oturum açmamış");
    }

    const userRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      toast.error("Kullanıcı profili bulunamadı.");
      throw new Error("Kullanıcı profili bulunamadı");
    }

    const userData = userDoc.data();
    const addresses = userData.addresses || [];

    // Yeni adres ID'si oluştur
    const addressId = Date.now().toString();

    // Yeni adresi ekle
    const newAddress = {
      id: addressId,
      title: addressData.title,
      street: addressData.street,
      district: addressData.district || "",
      city: addressData.city,
      zipCode: addressData.zipCode || "",
      isDefault: addressData.isDefault || addresses.length === 0
    };

    // Varsayılan adres olarak işaretlendiyse, diğer adreslerin varsayılan değerini kaldır
    if (newAddress.isDefault) {
      addresses.forEach(address => {
        address.isDefault = false;
      });
    }

    addresses.push(newAddress);

    await updateDoc(userRef, {
      addresses,
      updatedAt: serverTimestamp()
    });

    toast.success("Adres başarıyla eklendi.");
    return addressId;
  } catch (error) {
    console.error("Adres ekleme hatası:", error);
    toast.error("Adres eklenirken bir hata oluştu.");
    throw error;
  }
};

// Favorilere işletme ekle/çıkar
export const toggleFavorite = async (shopId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Favorileri güncellemek için giriş yapmalısınız.");
      throw new Error("Kullanıcı oturum açmamış");
    }

    const userRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      toast.error("Kullanıcı profili bulunamadı.");
      throw new Error("Kullanıcı profili bulunamadı");
    }

    const userData = userDoc.data();
    let favorites = userData.favorites || [];

    // Favorilerde var mı kontrol et
    const isFavorite = favorites.includes(shopId);

    if (isFavorite) {
      // Favorilerden çıkar
      favorites = favorites.filter(id => id !== shopId);
      toast.success("İşletme favorilerden çıkarıldı.");
    } else {
      // Favorilere ekle
      favorites.push(shopId);
      toast.success("İşletme favorilere eklendi.");
    }

    await updateDoc(userRef, {
      favorites,
      updatedAt: serverTimestamp()
    });

    return !isFavorite; // Yeni favori durumunu döndür
  } catch (error) {
    console.error("Favori güncelleme hatası:", error);
    toast.error("Favoriler güncellenirken bir hata oluştu.");
    throw error;
  }
};

// Kullanıcı tipini güncelle (eksikse business olarak ayarla)
export const ensureBusinessUserType = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const userRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    const data = userDoc.data();
    if (!data.userType || data.userType !== 'business') {
      await updateDoc(userRef, { userType: 'business' });
      console.log('userType alanı business olarak güncellendi');
    }
  }
};
