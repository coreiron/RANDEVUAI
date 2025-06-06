
import { formatRating, formatImages, timestampToDate } from '@/lib/firebase/dataFormatUtils';
import { Shop } from '@/types/Shop';

export const formatShopData = (doc: any): Shop => {
  const data = doc.data();
  
  // Zorunlu alanlar için güvenlik kontrolleri
  const name = data.name || 'İsimsiz İşletme';
  const location = data.location || {
    address: 'Adres bilgisi bulunamadı',
    city: 'Bilinmiyor',
    district: 'Bilinmiyor'
  };

  // Rating ve images formatını standardize et
  const rating = formatRating(data.rating);
  const images = formatImages(data);

  return {
    id: doc.id,
    name,
    location,
    rating,
    images,
    category: data.category || '',
    subcategory: data.subcategory || '',
    description: data.description || '',
    shortDescription: data.shortDescription || '',
    priceLevel: data.priceLevel || 1,
    workingHours: data.workingHours || {},
    contact: data.contact || {},
    services: [],
    staff: [],
    reviews: [],
    isVerified: data.isVerified || false,
    popularity: data.popularityScore || 0,
    isActive: data.isActive !== false,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
};

export const applyClientSideFilters = (shops: Shop[], filters: {
  minRating?: number | null;
  category?: string | null;
}) => {
  let filteredShops = shops;

  // Min rating filtresi
  if (filters.minRating !== null && filters.minRating !== undefined) {
    filteredShops = filteredShops.filter(shop => {
      const shopRating = typeof shop.rating === 'number' ? 
        shop.rating : 
        shop.rating?.average || 0;
      
      return shopRating >= filters.minRating!;
    });
  }

  return filteredShops;
};
