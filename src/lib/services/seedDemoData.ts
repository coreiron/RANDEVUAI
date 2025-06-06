
import { toast } from '@/components/ui/sonner';
import { collection, doc, setDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from '../firebase/schema';
import { 
  getPopularTestShops, 
  berberShops, 
  kuaforShops, 
  guzellikMerkeziShops, 
  spaShops, 
  tirnakShops,
  allTestShops
} from './testDataService';

// Format shop data for Firebase
const prepareShopData = (shop) => {
  // Rating formatını kontrol et
  let rating = shop.rating;
  if (!rating) {
    rating = { average: 0, count: 0 };
  } else if (typeof rating === 'number') {
    rating = { average: rating, count: 0 };
  }
  
  // Images formatını kontrol et
  let images = shop.images;
  if (!images) {
    if (shop.imageUrl) {
      images = { main: shop.imageUrl };
    } else if (shop.image) {
      images = { main: shop.image };
    } else {
      images = { main: "/placeholder.svg", gallery: [] };
    }
  }
  
  return {
    ...shop,
    rating,
    images,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    popularityScore: shop.popularityScore || shop.popularity || Math.floor(Math.random() * 100)
  };
};

// Seed all demo data
export const seedDemoData = async () => {
  try {
    toast.info("Demo verileri yükleniyor...");
    
    // Test verilerini hazırla
    try {
      console.log("Demo veri yükleme başladı");
      
      // Tüm işletmeleri kontrol et
      console.log("Toplam işletme sayısı:", allTestShops.length);
      
      // İşletmeleri Firestore'a ekle
      const shopsCollection = collection(db, COLLECTIONS.SHOPS);
      
      // Önce mevcut işletmeleri kontrol et
      const existingShopsSnapshot = await getDocs(shopsCollection);
      
      if (existingShopsSnapshot.docs.length > 0) {
        console.log("İşletmeler zaten yüklenmiş. Toplam:", existingShopsSnapshot.docs.length);
        
        // Popüler işletmeleri yükle
        const popularShops = getPopularTestShops();
        console.log("Popüler işletmeler:", popularShops.length);
        
        // Kategori bazlı işletmeleri yükle
        console.log("Berber işletmeleri:", berberShops.length);
        console.log("Kuaför işletmeleri:", kuaforShops.length);
        console.log("Güzellik Merkezi işletmeleri:", guzellikMerkeziShops.length);
        console.log("Spa işletmeleri:", spaShops.length);
        console.log("Tırnak Bakımı işletmeleri:", tirnakShops.length);
        
        // Mevcut verileri güncelle
        console.log("Mevcut işletmelerin formatlarını güncelleme");
        for (const doc of existingShopsSnapshot.docs) {
          const shopData = doc.data();
          const updatedData = prepareShopData(shopData);
          await setDoc(doc.ref, updatedData, { merge: true });
        }
        
        toast.success("Demo veriler zaten yüklenmiş ve formatları güncellendi!");
        return true;
      }
      
      // İşletmeleri Firestore'a ekle
      for (const shop of allTestShops) {
        console.log(`İşletme ekleniyor: ${shop.name}`);
        const formattedShop = prepareShopData(shop);
        await setDoc(doc(db, COLLECTIONS.SHOPS, shop.id), formattedShop);
      }
      
      // Popüler işletmeleri yükle
      const popularShops = getPopularTestShops();
      console.log("Popüler işletmeler yüklendi:", popularShops.length);
      
      // Kategori bazlı işletmeleri yükle
      console.log("Berber işletmeleri:", berberShops.length);
      console.log("Kuaför işletmeleri:", kuaforShops.length);
      console.log("Güzellik Merkezi işletmeleri:", guzellikMerkeziShops.length);
      console.log("Spa işletmeleri:", spaShops.length);
      console.log("Tırnak Bakımı işletmeleri:", tirnakShops.length);
      
      toast.success("Demo verileri başarıyla yüklendi!");
      return true;
    } catch (error) {
      console.error("Demo verileri hazırlanırken hata:", error);
      throw error;
    }
  } catch (error) {
    console.error("Demo veri yükleme hatası:", error);
    toast.error("Demo verileri yüklenirken bir hata oluştu: " + (error instanceof Error ? error.message : String(error)));
    return false;
  }
};
