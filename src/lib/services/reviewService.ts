import { addDoc, collection, query, where, getDocs, orderBy, limit, serverTimestamp, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { COLLECTIONS } from "../firebase/schema";
import { toast } from "@/components/ui/sonner";

// Değerlendirme gönderme
export const submitReview = async (reviewData: {
  shopId: string;
  appointmentId?: string;
  rating: number;
  comment: string;
}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Değerlendirme yapmak için giriş yapmalısınız.");
      throw new Error("Kullanıcı oturum açmamış");
    }

    // Get shop data for shop name
    const shopDoc = await getDoc(doc(db, COLLECTIONS.SHOPS, reviewData.shopId));
    const shopData = shopDoc.exists() ? shopDoc.data() : {};

    // Aynı randevu için önceki değerlendirmeleri kontrol et
    if (reviewData.appointmentId) {
      const existingReviews = query(
        collection(db, COLLECTIONS.REVIEWS),
        where("userId", "==", currentUser.uid),
        where("appointmentId", "==", reviewData.appointmentId)
      );
      
      const reviewsSnapshot = await getDocs(existingReviews);
      if (!reviewsSnapshot.empty) {
        toast.error("Bu randevu için zaten bir değerlendirme yapmışsınız.");
        return null;
      }
    }

    // Yeni değerlendirme oluştur
    const reviewsCollection = collection(db, COLLECTIONS.REVIEWS);
    const docRef = await addDoc(reviewsCollection, {
      shopId: reviewData.shopId,
      shopName: shopData.name || 'Bilinmeyen İşletme',
      appointmentId: reviewData.appointmentId || null,
      userId: currentUser.uid,
      userName: currentUser.displayName || 'Kullanıcı',
      userPhoto: currentUser.photoURL,
      rating: reviewData.rating,
      comment: reviewData.comment,
      isPublished: true,
      createdAt: serverTimestamp(),
      helpfulCount: 0
    });

    // Randevu değerlendirme durumunu güncelle
    if (reviewData.appointmentId) {
      const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, reviewData.appointmentId);
      await updateDoc(appointmentRef, {
        hasReview: true,
        reviewId: docRef.id
      });
    }

    // İşletme ratinglerini güncelle
    await updateShopRating(reviewData.shopId);

    toast.success("Değerlendirmeniz başarıyla gönderildi.");
    return docRef.id;
  } catch (error) {
    console.error("Değerlendirme gönderme hatası:", error);
    toast.error("Değerlendirme gönderilirken bir hata oluştu.");
    throw error;
  }
};

// İşletme değerlendirmelerini getir
export const getShopReviews = async (shopId: string, limitCount = 10) => {
  try {
    const reviewsCollection = collection(db, COLLECTIONS.REVIEWS);
    const q = query(
      reviewsCollection,
      where("shopId", "==", shopId),
      where("isPublished", "==", true),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    const reviewsSnapshot = await getDocs(q);
    
    return reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Değerlendirmeleri getirme hatası:", error);
    toast.error("Değerlendirmeler yüklenirken bir hata oluştu.");
    return [];
  }
};

// Kullanıcının değerlendirmelerini getir
export const getUserReviews = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return [];
    }
    
    const reviewsCollection = collection(db, COLLECTIONS.REVIEWS);
    const q = query(
      reviewsCollection,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    
    const reviewsSnapshot = await getDocs(q);
    
    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Enrich reviews with shop names if missing
    const enrichedReviews = await Promise.all(
      reviews.map(async (review: any) => {
        if (!review.shopName && review.shopId) {
          try {
            const shopDoc = await getDoc(doc(db, COLLECTIONS.SHOPS, review.shopId));
            const shopData = shopDoc.exists() ? shopDoc.data() : {};
            return {
              ...review,
              shopName: shopData.name || 'Bilinmeyen İşletme'
            };
          } catch (error) {
            console.error("Error fetching shop data for review:", error);
            return {
              ...review,
              shopName: 'Bilinmeyen İşletme'
            };
          }
        }
        return review;
      })
    );

    return enrichedReviews;
  } catch (error) {
    console.error("Kullanıcı değerlendirmelerini getirme hatası:", error);
    toast.error("Değerlendirmeleriniz yüklenirken bir hata oluştu.");
    return [];
  }
};

// Değerlendirme sil
export const deleteReview = async (reviewId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Değerlendirme silmek için giriş yapmalısınız.");
      throw new Error("Kullanıcı oturum açmamış");
    }

    const reviewRef = doc(db, COLLECTIONS.REVIEWS, reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
      toast.error("Değerlendirme bulunamadı.");
      throw new Error("Değerlendirme bulunamadı");
    }
    
    const reviewData = reviewDoc.data();
    
    if (reviewData.userId !== currentUser.uid) {
      toast.error("Bu değerlendirmeyi silme yetkiniz yok.");
      throw new Error("Yetki hatası");
    }
    
    if (reviewData.appointmentId) {
      const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, reviewData.appointmentId);
      const appointmentDoc = await getDoc(appointmentRef);
      
      if (appointmentDoc.exists()) {
        await updateDoc(appointmentRef, {
          hasReview: false,
          reviewId: null
        });
      }
    }

    await deleteDoc(reviewRef);
    await updateShopRating(reviewData.shopId);
    
    toast.success("Değerlendirmeniz başarıyla silindi.");
    return true;
  } catch (error) {
    console.error("Değerlendirme silme hatası:", error);
    toast.error("Değerlendirme silinirken bir hata oluştu.");
    throw error;
  }
};

// Değerlendirme güncelle
export const updateReview = async (reviewId: string, updateData: {
  rating?: number;
  comment?: string;
}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Değerlendirme güncellemek için giriş yapmalısınız.");
      throw new Error("Kullanıcı oturum açmamış");
    }

    const reviewRef = doc(db, COLLECTIONS.REVIEWS, reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
      toast.error("Değerlendirme bulunamadı.");
      throw new Error("Değerlendirme bulunamadı");
    }
    
    const reviewData = reviewDoc.data();
    
    if (reviewData.userId !== currentUser.uid) {
      toast.error("Bu değerlendirmeyi güncelleme yetkiniz yok.");
      throw new Error("Yetki hatası");
    }
    
    const updates: any = {
      updatedAt: serverTimestamp()
    };
    
    if (updateData.rating !== undefined) {
      updates.rating = updateData.rating;
    }
    
    if (updateData.comment !== undefined) {
      updates.comment = updateData.comment;
    }
    
    await updateDoc(reviewRef, updates);
    
    if (updateData.rating !== undefined) {
      await updateShopRating(reviewData.shopId);
    }
    
    toast.success("Değerlendirmeniz başarıyla güncellendi.");
    return true;
  } catch (error) {
    console.error("Değerlendirme güncelleme hatası:", error);
    toast.error("Değerlendirme güncellenirken bir hata oluştu.");
    throw error;
  }
};

// İşletme puanlarını güncelle
const updateShopRating = async (shopId: string) => {
  try {
    const reviewsCollection = collection(db, COLLECTIONS.REVIEWS);
    const q = query(
      reviewsCollection,
      where("shopId", "==", shopId),
      where("isPublished", "==", true)
    );
    
    const reviewsSnapshot = await getDocs(q);
    
    if (reviewsSnapshot.empty) {
      // Değerlendirme yoksa rating'i sıfırla
      const shopRef = doc(db, COLLECTIONS.SHOPS, shopId);
      await updateDoc(shopRef, {
        "rating.average": 0,
        "rating.count": 0,
        updatedAt: serverTimestamp()
      });
      return;
    }
    
    // Puanları topla ve ağırlıklı ortalama hesapla
    let totalRating = 0;
    let ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const reviewCount = reviewsSnapshot.size;
    
    reviewsSnapshot.forEach((doc) => {
      const rating = doc.data().rating;
      totalRating += rating;
      ratingCounts[rating as keyof typeof ratingCounts]++;
    });
    
    // Basit ortalama
    const simpleAverage = totalRating / reviewCount;
    
    // Bayesian average (Wilson score interval) - daha güvenilir
    const confidence = 0.95;
    const z = 1.96; // 95% confidence interval
    
    // 5 üzerinden puanı 0-1 arasına normalize et
    const positiveRatings = (ratingCounts[4] + ratingCounts[5]);
    const totalVotes = reviewCount;
    
    let bayesianScore = simpleAverage;
    
    if (totalVotes >= 5) { // En az 5 oy varsa Bayesian kullan
      const phat = positiveRatings / totalVotes;
      bayesianScore = (phat + z * z / (2 * totalVotes) - z * Math.sqrt((phat * (1 - phat) + z * z / (4 * totalVotes)) / totalVotes)) / (1 + z * z / totalVotes);
      bayesianScore = bayesianScore * 5; // 5 üzerinden puana çevir
    }
    
    // Final average - review sayısına göre ağırlıklandır
    const finalAverage = totalVotes < 10 
      ? simpleAverage * 0.8 + 2.5 * 0.2 // Az review varsa ortalamaya yaklaştır
      : Math.max(simpleAverage, bayesianScore);
    
    // İşletme bilgisini güncelle
    const shopRef = doc(db, COLLECTIONS.SHOPS, shopId);
    await updateDoc(shopRef, {
      "rating.average": Math.round(finalAverage * 10) / 10, // 1 ondalık
      "rating.count": reviewCount,
      "rating.distribution": ratingCounts,
      updatedAt: serverTimestamp()
    });

    console.log(`Shop ${shopId} rating updated: ${finalAverage} (${reviewCount} reviews)`);
  } catch (error) {
    console.error("İşletme puanı güncelleme hatası:", error);
  }
};
