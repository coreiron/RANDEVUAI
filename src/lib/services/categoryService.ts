import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase/schema";
import { shopApi } from "@/lib/api/shopApi";

export interface Category {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

export const getCategoriesWithCounts = async (): Promise<Category[]> => {
  try {
    console.log("🏷️ Getting categories with business counts via API");

    const categories = [
      { id: "beauty", name: "Güzellik & Bakım", icon: "✨" },
      { id: "health", name: "Sağlık", icon: "🏥" },
      { id: "fitness", name: "Fitness", icon: "💪" },
      { id: "automotive", name: "Otomotiv", icon: "🚗" },
      { id: "education", name: "Eğitim", icon: "📚" },
      { id: "food", name: "Yeme İçme", icon: "🍽️" }
    ];

    // Get all shops from API
    const shopsResponse = await shopApi.getAll();
    const allShops = shopsResponse.success ? shopsResponse.data : [];

    console.log("📊 Total shops from API:", allShops.length);

    // Calculate counts for each category
    const categoriesWithCounts = categories.map(category => {
      const count = allShops.filter((shop: any) =>
        shop.category === category.id ||
        shop.categoryId === category.id
      ).length;

      console.log(`📈 Category ${category.name}: ${count} shops`);

      return {
        ...category,
        count
      };
    });

    console.log("✅ Categories with counts:", categoriesWithCounts);
    return categoriesWithCounts;
  } catch (error) {
    console.error("❌ Error getting categories with counts:", error);

    // Fallback: Return categories without counts
    const categories = [
      { id: "beauty", name: "Güzellik & Bakım", icon: "✨", count: 0 },
      { id: "health", name: "Sağlık", icon: "🏥", count: 0 },
      { id: "fitness", name: "Fitness", icon: "💪", count: 0 },
      { id: "automotive", name: "Otomotiv", icon: "🚗", count: 0 },
      { id: "education", name: "Eğitim", icon: "📚", count: 0 },
      { id: "food", name: "Yeme İçme", icon: "🍽️", count: 0 }
    ];

    return categories;
  }
};

export const getShopsByCategory = async (categoryId: string) => {
  try {
    console.log("🔍 Getting shops for category via API:", categoryId);

    // Use API search with category filter
    const searchResponse = await shopApi.search({ category: categoryId });
    const shops = searchResponse.success ? searchResponse.data : [];

    console.log("✅ Found shops for category:", shops.length);
    return shops;
  } catch (error) {
    console.error("❌ Error getting shops by category:", error);
    return [];
  }
};
