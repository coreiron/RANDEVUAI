import { Timestamp } from "firebase/firestore";

/**
 * Firebase Timestamp'i Date nesnesine dönüştürür
 * @param timestamp Firebase timestamp veya tarih verisi
 * @returns JavaScript Date nesnesi
 */
export const timestampToDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();

  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  } else if (timestamp.seconds && timestamp.nanoseconds) {
    // Firestore timestamp objesi
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  } else if (timestamp instanceof Date) {
    return timestamp;
  } else if (typeof timestamp === 'string') {
    return new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }

  // Fallback
  return new Date();
};

/**
 * Farklı formattaki rating verilerini standart formata dönüştürür
 * @param rating Rating verisi
 * @returns Standartlaştırılmış rating objesi
 */
export const formatRating = (rating: any): { average: number; count: number } => {
  if (!rating) {
    return { average: 0, count: 0 };
  }

  if (typeof rating === 'number') {
    return { average: rating, count: 0 };
  }

  if (typeof rating === 'object') {
    return {
      average: rating.average || 0,
      count: rating.count || 0
    };
  }

  return { average: 0, count: 0 };
};

/**
 * Farklı formatlardaki resim verilerini standart formata dönüştürür
 * @param data Firestore veri objesi
 * @returns Standartlaştırılmış images objesi
 */
export const formatImages = (data: any): { main: string; gallery?: string[] } => {
  // Debug için resim alanlarını loglayalım
  console.log("🖼️ formatImages - Input data:", {
    images: data.images,
    photoURL: data.photoURL,
    imageUrl: data.imageUrl,
    image: data.image,
    mainImage: data.mainImage,
    logo: data.logo,
    avatar: data.avatar,
    picture: data.picture,
    photo: data.photo
  });

  // Eğer zaten doğru formatta ise kullan
  if (data.images && typeof data.images === 'object') {
    const result = {
      main: data.images.main || data.images.logo || data.images.thumbnail || '/placeholder.svg',
      gallery: Array.isArray(data.images.gallery) ? data.images.gallery : []
    };
    console.log("🖼️ formatImages - Using images object:", result);
    return result;
  }

  // Tüm olası resim alanlarını kontrol et (öncelik sırasına göre)
  const possibleImageFields = [
    data.photoURL,
    data.mainImage,
    data.imageUrl,
    data.image,
    data.logo,
    data.avatar,
    data.picture,
    data.photo
  ];

  // İlk geçerli resim URL'sini bul
  const mainImage = possibleImageFields.find(url =>
    url &&
    typeof url === 'string' &&
    url.trim() !== '' &&
    url !== '/placeholder.svg' &&
    !url.includes('undefined') &&
    !url.includes('null')
  ) || '/placeholder.svg';

  const result = { main: mainImage, gallery: [] };
  console.log("🖼️ formatImages - Result:", result);

  return result;
};

/**
 * Firebase dokümanını uygulama modelimize dönüştürür
 * @param doc Firebase dokümanı
 * @param includeData Ekstra dönüşümler
 * @returns Dönüştürülmüş model objesi
 */
export const formatFirestoreDocument = (doc: any, includeData: boolean = true): any => {
  if (!doc) return null;

  const data = includeData ? doc.data() : {};
  const result = {
    id: doc.id,
    ...data,
    createdAt: data.createdAt ? timestampToDate(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? timestampToDate(data.updatedAt) : new Date()
  };

  // Özel alanları formatla
  if (data.rating) {
    result.rating = formatRating(data.rating);
  }

  // Resim formatını standardize et
  result.images = formatImages(data);

  return result;
};
