
import { Shop } from '@/types/Shop';

// Arama ve filtreleme işlemleri için yardımcı fonksiyonlar

// Metin içinde arama yapar (case insensitive)
export const textSearch = (items: Shop[], searchText: string, fields: string[] = ['name', 'description']): Shop[] => {
  if (!searchText || searchText.trim() === '') return items;
  
  const lowerCaseSearch = searchText.toLowerCase().trim();
  
  return items.filter(item => {
    return fields.some(field => {
      // @ts-ignore - Dinamik alan erişimi
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerCaseSearch);
      }
      return false;
    });
  });
};

// Kategori filtresi uygular
export const filterByCategory = (items: Shop[], category: string | null): Shop[] => {
  if (!category) return items;
  
  return items.filter(item => item.category === category);
};

// Alt kategori filtresi uygular
export const filterBySubcategory = (items: Shop[], subcategory: string | null): Shop[] => {
  if (!subcategory) return items;
  
  return items.filter(item => item.subcategory === subcategory);
};

// Konum filtresi uygular
export const filterByLocation = (items: Shop[], location: string | null): Shop[] => {
  if (!location) return items;
  
  return items.filter(item => 
    item.location?.city?.toLowerCase().includes(location.toLowerCase()) || 
    item.location?.district?.toLowerCase().includes(location.toLowerCase()) || 
    item.location?.neighborhood?.toLowerCase().includes(location.toLowerCase())
  );
};

// Rating filtreleri uygular (min ve max)
export const filterByRating = (items: Shop[], minRating: number | null, maxRating: number | null): Shop[] => {
  return items.filter(item => {
    // Rating nesne veya sayı olabilir
    let rating: number;
    
    if (typeof item.rating === 'number') {
      rating = item.rating;
    } else if (typeof item.rating === 'object' && item.rating?.average) {
      rating = item.rating.average;
    } else {
      // Rating yoksa 0 kabul et
      rating = 0;
    }
    
    const passesMinRating = minRating === null || rating >= minRating;
    const passesMaxRating = maxRating === null || rating <= maxRating;
    
    return passesMinRating && passesMaxRating;
  });
};

// Popülerliğe göre sıralama
export const sortByPopularity = (items: Shop[]): Shop[] => {
  return [...items].sort((a, b) => {
    const popA = a.popularity || 0;
    const popB = b.popularity || 0;
    return popB - popA;
  });
};

// Rating'e göre sıralama
export const sortByRating = (items: Shop[]): Shop[] => {
  return [...items].sort((a, b) => {
    // Rating nesne veya sayı olabilir
    let ratingA: number;
    let ratingB: number;
    
    if (typeof a.rating === 'number') {
      ratingA = a.rating;
    } else if (typeof a.rating === 'object' && a.rating?.average) {
      ratingA = a.rating.average;
    } else {
      ratingA = 0;
    }
    
    if (typeof b.rating === 'number') {
      ratingB = b.rating;
    } else if (typeof b.rating === 'object' && b.rating?.average) {
      ratingB = b.rating.average;
    } else {
      ratingB = 0;
    }
    
    return ratingB - ratingA;
  });
};

// Premium olanları öne çıkar
export const prioritizePremium = (items: Shop[]): Shop[] => {
  return [...items].sort((a, b) => {
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;
    return 0;
  });
};

// Kullanıcının konumunu al
export const getUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
};

// Tüm filtreleri uygula
export const applyAllFilters = (
  items: Shop[],
  filters: {
    searchText?: string;
    category?: string | null;
    subcategory?: string | null;
    location?: string | null;
    minRating?: number | null;
    maxRating?: number | null;
    sortBy?: 'popularity' | 'rating' | null;
    onlyPremium?: boolean;
  }
): Shop[] => {
  let results = [...items];
  
  // Metin araması
  if (filters.searchText) {
    results = textSearch(results, filters.searchText);
  }
  
  // Kategori filtresi
  if (filters.category) {
    results = filterByCategory(results, filters.category);
  }
  
  // Alt kategori filtresi
  if (filters.subcategory) {
    results = filterBySubcategory(results, filters.subcategory);
  }
  
  // Konum filtresi
  if (filters.location) {
    results = filterByLocation(results, filters.location);
  }
  
  // Rating filtresi
  if (filters.minRating !== undefined || filters.maxRating !== undefined) {
    results = filterByRating(results, filters.minRating || null, filters.maxRating || null);
  }
  
  // Sadece premium
  if (filters.onlyPremium) {
    results = results.filter(item => item.isPremium);
  }
  
  // Sıralama
  if (filters.sortBy === 'popularity') {
    results = sortByPopularity(results);
  } else if (filters.sortBy === 'rating') {
    results = sortByRating(results);
  } else {
    // Varsayılan olarak premium olanları öne çıkar
    results = prioritizePremium(results);
  }
  
  return results;
};
