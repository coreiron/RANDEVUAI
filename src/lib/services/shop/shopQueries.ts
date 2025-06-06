
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter,
  QueryConstraint 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase/schema";
import { formatShopData } from './shopDataFormatter';
import { Shop } from '@/types/Shop';

interface ShopQueryParams {
  category?: string | null;
  city?: string | null;
  district?: string | null;
  page?: number;
  limit?: number;
  sortBy?: "rating" | "popularity" | "priceLevel";
}

export const buildShopQuery = (params: ShopQueryParams) => {
  const {
    category,
    city,
    district,
    sortBy = "rating",
    limit: pageLimit = 10
  } = params;

  const shopsCollection = collection(db, COLLECTIONS.SHOPS);
  const constraints: QueryConstraint[] = [
    where("isActive", "==", true)
  ];

  // Filtreler ekle
  if (category) {
    constraints.push(where("category", "==", category));
  }

  if (city) {
    constraints.push(where("location.city", "==", city));
  }

  if (district) {
    constraints.push(where("location.district", "==", district));
  }

  // Sıralama ekle
  switch (sortBy) {
    case "rating":
      constraints.push(orderBy("rating.average", "desc"));
      break;
    case "popularity":
      constraints.push(orderBy("popularityScore", "desc"));
      break;
    case "priceLevel":
      constraints.push(orderBy("priceLevel", "asc"));
      break;
  }

  constraints.push(limit(pageLimit));

  return query(shopsCollection, ...constraints);
};

export const executeShopQuery = async (params: ShopQueryParams): Promise<{
  shops: Shop[];
  hasMore: boolean;
}> => {
  try {
    console.log("Executing shop query with params:", params);
    
    const q = buildShopQuery(params);
    const snapshot = await getDocs(q);
    
    console.log("Query complete, docs count:", snapshot.docs.length);
    
    const shops = snapshot.docs.map(doc => formatShopData(doc));
    const hasMore = snapshot.docs.length === (params.limit || 10);
    
    return { shops, hasMore };
  } catch (error) {
    console.error("Error executing shop query:", error);
    throw error;
  }
};
