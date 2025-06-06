import { shopApi } from '@/lib/api/shopApi';
import { toast } from '@/components/ui/sonner';

// API-based shop service (new backend integration)
export const getShopsViaApi = async () => {
  try {
    console.log("🏪 Getting shops via API");

    const response = await shopApi.getAll();

    if (response.success) {
      console.log("✅ Shops retrieved via API:", response.data?.length || 0);
      return response.data || [];
    } else {
      console.error("❌ API Error:", response.error);
      toast.error(response.error || "İşletmeler alınamadı");
      return [];
    }
  } catch (error) {
    console.error("❌ Error getting shops via API:", error);
    toast.error("İşletmeler alınırken bir hata oluştu");
    return [];
  }
};

export const searchShopsViaApi = async (searchParams: { q?: string; category?: string; location?: string }) => {
  try {
    console.log("🔍 Searching shops via API:", searchParams);

    const response = await shopApi.search(searchParams);

    if (response.success) {
      console.log("✅ Shop search results via API:", response.data?.length || 0);
      return response.data || [];
    } else {
      console.error("❌ API Search Error:", response.error);
      toast.error(response.error || "Arama yapılamadı");
      return [];
    }
  } catch (error) {
    console.error("❌ Error searching shops via API:", error);
    toast.error("Arama sırasında bir hata oluştu");
    return [];
  }
};

export const getShopDetailsViaApi = async (shopId: string) => {
  try {
    console.log("🔍 Getting shop details via API:", shopId);

    const response = await shopApi.getDetails(shopId);

    if (response.success) {
      console.log("✅ Shop details retrieved via API:", response.data?.name);
      return response.data;
    } else {
      console.error("❌ API Error:", response.error);
      toast.error(response.error || "İşletme detayları alınamadı");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting shop details via API:", error);
    toast.error("İşletme detayları alınırken bir hata oluştu");
    return null;
  }
};

export const getShopsByCategoryViaApi = async (category: string) => {
  try {
    console.log("🔍 Getting shops by category via API:", category);

    const response = await shopApi.getByCategory(category);

    if (response.success) {
      console.log("✅ Shops by category retrieved via API:", response.data?.length || 0);
      return response.data || [];
    } else {
      console.error("❌ API Error:", response.error);
      toast.error(response.error || "Kategoriye göre işletmeler alınamadı");
      return [];
    }
  } catch (error) {
    console.error("❌ Error getting shops by category via API:", error);
    toast.error("Kategoriye göre işletmeler alınırken bir hata oluştu");
    return [];
  }
};

export const getUserShopsViaApi = async () => {
  try {
    console.log("👤 Getting user shops via API");

    const response = await shopApi.getUserShops();

    if (response.success) {
      console.log("✅ User shops retrieved via API:", response.data?.length || 0);
      return response.data || [];
    } else {
      console.error("❌ API Error:", response.error);
      toast.error(response.error || "Kullanıcı işletmeleri alınamadı");
      return [];
    }
  } catch (error) {
    console.error("❌ Error getting user shops via API:", error);
    toast.error("Kullanıcı işletmeleri alınırken bir hata oluştu");
    return [];
  }
};

export const getShopServicesViaApi = async (shopId: string) => {
  try {
    console.log("🛠️ Getting shop services via API:", shopId);

    const response = await shopApi.getServices(shopId);

    if (response.success) {
      console.log("✅ Shop services retrieved via API:", response.data?.length || 0);
      return response.data || [];
    } else {
      console.error("❌ API Error:", response.error);
      toast.error(response.error || "İşletme hizmetleri alınamadı");
      return [];
    }
  } catch (error) {
    console.error("❌ Error getting shop services via API:", error);
    toast.error("İşletme hizmetleri alınırken bir hata oluştu");
    return [];
  }
};

export const getShopStaffViaApi = async (shopId: string) => {
  try {
    console.log("👥 Getting shop staff via API:", shopId);

    const response = await shopApi.getStaff(shopId);

    if (response.success) {
      console.log("✅ Shop staff retrieved via API:", response.data?.length || 0);
      return response.data || [];
    } else {
      console.error("❌ API Error:", response.error);
      toast.error(response.error || "İşletme personeli alınamadı");
      return [];
    }
  } catch (error) {
    console.error("❌ Error getting shop staff via API:", error);
    toast.error("İşletme personeli alınırken bir hata oluştu");
    return [];
  }
};
