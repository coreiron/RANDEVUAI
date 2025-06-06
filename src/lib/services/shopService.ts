
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  setDoc, 
  deleteDoc,
  arrayUnion,
  arrayRemove,
  updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase/schema";
import { Shop } from "@/types/Shop";
import { toast } from "@/components/ui/sonner";

export const getShopDetails = async (shopId: string) => {
  try {
    if (!shopId) {
      console.error("❌ Invalid shop ID");
      return null;
    }

    console.log("🔍 Getting shop details for:", shopId);
    const shopDoc = await getDoc(doc(db, COLLECTIONS.SHOPS, shopId));
    
    if (!shopDoc.exists()) {
      console.error("❌ Shop not found in database");
      return null;
    }
    
    const shopData = shopDoc.data();
    const completeShopData = {
      id: shopDoc.id,
      ...shopData
    } as Shop;
    
    console.log("✅ Shop details retrieved successfully:", {
      id: completeShopData.id,
      name: completeShopData.name || "No name",
      hasServices: !!completeShopData.services,
      servicesCount: completeShopData.services?.length || 0,
      hasContact: !!completeShopData.contact,
      hasLocation: !!completeShopData.location,
      description: completeShopData.description ? "Has description" : "No description"
    });
    
    return completeShopData;
  } catch (error) {
    console.error("❌ Error getting shop details:", error);
    toast.error("İşletme detayları getirilirken bir hata oluştu");
    return null;
  }
};

export const getShops = async () => {
  try {
    console.log("🔍 Getting all shops from collection:", COLLECTIONS.SHOPS);
    const shopsCollection = collection(db, COLLECTIONS.SHOPS);
    
    // Önce tüm dökümanları al, sonra filtrele
    const snapshot = await getDocs(shopsCollection);
    
    console.log("📊 Total documents found:", snapshot.docs.length);
    
    const shops = [];
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      console.log("📋 Processing shop:", { 
        id: docSnapshot.id, 
        name: data.name, 
        isActive: data.isActive,
        category: data.category,
        location: data.location 
      });
      
      // İşletme aktif olmalı (varsayılan olarak true kabul et eğer isActive yoksa)
      const isActive = data.isActive !== false; // undefined veya true ise dahil et
      
      if (isActive) {
        const shopData = {
          id: docSnapshot.id,
          ...data,
          // Eksik alanları varsayılan değerlerle doldur
          name: data.name || "İsimsiz İşletme",
          category: data.category || "other",
          location: data.location || { city: "Belirtilmemiş", district: "Belirtilmemiş" },
          rating: data.rating || { average: 0, count: 0 },
          isActive: true
        };
        
        shops.push(shopData);
        console.log("✅ Shop added to list:", shopData.name);
      } else {
        console.log("❌ Shop skipped (inactive):", data.name);
      }
    }

    console.log("📈 Final shops count:", shops.length);
    
    // İsme göre sırala
    const sortedShops = shops.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    
    return sortedShops;
  } catch (error) {
    console.error("❌ Error getting shops:", error);
    toast.error("İşletmeler getirilirken bir hata oluştu");
    return [];
  }
};

export const getShopsByCategory = async (category: string) => {
  try {
    console.log("Getting shops by category:", category);
    const allShops = await getShops();
    
    const filteredShops = allShops.filter(shop => shop.category === category);
    console.log("Found shops for category:", category, "count:", filteredShops.length);
    
    return filteredShops;
  } catch (error) {
    console.error("Error getting shops by category:", error);
    return [];
  }
};

export const getShopsByOwner = async (ownerId: string) => {
  try {
    console.log("Getting shops by owner:", ownerId);
    const shopsCollection = collection(db, COLLECTIONS.SHOPS);
    const q = query(
      shopsCollection,
      where("ownerId", "==", ownerId)
    );
    const snapshot = await getDocs(q);
    
    console.log("Found shops for owner:", ownerId, "count:", snapshot.docs.length);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting shops by owner:", error);
    return [];
  }
};

// Add the missing getUserShops function
export const getUserShops = async (userId: string) => {
  try {
    console.log("🔍 Getting user shops for:", userId);
    return await getShopsByOwner(userId);
  } catch (error) {
    console.error("❌ Error getting user shops:", error);
    toast.error("Kullanıcı işletmeleri getirilirken bir hata oluştu");
    return [];
  }
};

export const getFeaturedShops = async () => {
  try {
    console.log("🌟 Getting featured shops");
    const allShops = await getShops();
    
    // Önce featured olanları filtrele
    let featuredShops = allShops.filter(shop => shop.featured === true);
    
    console.log("📍 Featured shops found:", featuredShops.length);
    
    // Eğer featured işletme yoksa, rating'e göre en iyi 6 tanesini al
    if (featuredShops.length === 0) {
      console.log("🔄 No featured shops, getting top rated shops");
      featuredShops = allShops
        .sort((a, b) => {
          const ratingA = a.rating?.average || 0;
          const ratingB = b.rating?.average || 0;
          return ratingB - ratingA;
        })
        .slice(0, 6);
    }
    
    console.log("✨ Final featured shops count:", featuredShops.length);
    return featuredShops;
  } catch (error) {
    console.error("Error getting featured shops:", error);
    // Eğer hata olursa normal shop listesini döndür
    return getShops().then(shops => shops.slice(0, 6));
  }
};

export const getCategories = async () => {
  try {
    console.log("Getting categories");
    return [
      { id: "beauty", name: "Güzellik & Bakım", shops: [] },
      { id: "health", name: "Sağlık", shops: [] },
      { id: "fitness", name: "Fitness", shops: [] },
      { id: "automotive", name: "Otomotiv", shops: [] },
      { id: "education", name: "Eğitim", shops: [] },
      { id: "food", name: "Yeme İçme", shops: [] }
    ];
  } catch (error) {
    console.error("Error getting categories:", error);
    return [];
  }
};

// Staff ve Services için doğru collection'ları kullan
export const getShopStaff = async (shopId: string) => {
  try {
    if (!shopId) {
      return [];
    }

    // Önce 'staff' collection'ını dene
    let staffCollection = collection(db, "staff");
    let q = query(staffCollection, where("shopId", "==", shopId));
    let snapshot = await getDocs(q);
    
    if (snapshot.docs.length === 0) {
      // Eğer 'staff' collection'ında bulamazsa 'employees' collection'ını dene
      staffCollection = collection(db, "employees");
      q = query(staffCollection, where("shopId", "==", shopId));
      snapshot = await getDocs(q);
    }
    
    if (snapshot.docs.length === 0) {
      // Eğer hala bulamazsa shop document'ının içindeki staff array'ini kontrol et
      const shopDoc = await getDoc(doc(db, COLLECTIONS.SHOPS, shopId));
      if (shopDoc.exists()) {
        const shopData = shopDoc.data();
        if (shopData.staff && Array.isArray(shopData.staff)) {
          return shopData.staff.map((staff, index) => ({
            id: `staff_${index}`,
            ...staff,
            shopId
          }));
        }
      }
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting shop staff:", error);
    return [];
  }
};

export const getShopServices = async (shopId: string) => {
  try {
    if (!shopId) {
      return [];
    }

    // Önce 'services' collection'ını dene
    let servicesCollection = collection(db, "services");
    let q = query(servicesCollection, where("shopId", "==", shopId));
    let snapshot = await getDocs(q);
    
    if (snapshot.docs.length === 0) {
      // Eğer 'services' collection'ında bulamazsa shop document'ının içindeki services array'ini kontrol et
      const shopDoc = await getDoc(doc(db, COLLECTIONS.SHOPS, shopId));
      if (shopDoc.exists()) {
        const shopData = shopDoc.data();
        if (shopData.services && Array.isArray(shopData.services)) {
          return shopData.services.map((service, index) => ({
            id: `service_${index}`,
            ...service,
            shopId
          }));
        }
      }
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting shop services:", error);
    return [];
  }
};

// Favorite functions
export const addToFavorites = async (userId: string, shopId: string) => {
  try {
    if (!userId || !shopId) {
      throw new Error("User ID and Shop ID are required");
    }

    console.log("Adding shop to favorites:", { userId, shopId });
    
    const favoritesRef = doc(db, COLLECTIONS.USERS, userId, 'favorites', shopId);
    await setDoc(favoritesRef, {
      shopId,
      addedAt: new Date(),
    });

    console.log("Successfully added to favorites");
    return true;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, shopId: string) => {
  try {
    if (!userId || !shopId) {
      throw new Error("User ID and Shop ID are required");
    }

    console.log("Removing shop from favorites:", { userId, shopId });
    
    const favoritesRef = doc(db, COLLECTIONS.USERS, userId, 'favorites', shopId);
    await deleteDoc(favoritesRef);

    console.log("Successfully removed from favorites");
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

export const getFavoriteShops = async (userId: string) => {
  try {
    if (!userId) {
      console.error("Invalid user ID");
      return [];
    }

    console.log("Getting favorite shops for user:", userId);
    
    const favoritesCollection = collection(db, COLLECTIONS.USERS, userId, 'favorites');
    const favoritesSnapshot = await getDocs(favoritesCollection);
    
    if (favoritesSnapshot.empty) {
      console.log("No favorite shops found");
      return [];
    }

    const favoriteShops = [];
    for (const favoriteDoc of favoritesSnapshot.docs) {
      const shopId = favoriteDoc.data().shopId;
      const shopDetails = await getShopDetails(shopId);
      if (shopDetails) {
        favoriteShops.push(shopDetails);
      }
    }

    console.log("Found favorite shops:", favoriteShops.length);
    return favoriteShops;
  } catch (error) {
    console.error("Error getting favorite shops:", error);
    return [];
  }
};

export const isShopFavorite = async (userId: string, shopId: string): Promise<boolean> => {
  try {
    if (!userId || !shopId) {
      return false;
    }

    const favoritesRef = doc(db, COLLECTIONS.USERS, userId, 'favorites', shopId);
    const favoriteDoc = await getDoc(favoritesRef);
    
    return favoriteDoc.exists();
  } catch (error) {
    console.error("Error checking if shop is favorite:", error);
    return false;
  }
};
