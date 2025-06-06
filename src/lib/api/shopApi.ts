import { apiClient, ApiResponse } from './client';

export const shopApi = {
  // Get all shops
  getAll: async (): Promise<ApiResponse> => {
    return apiClient.get('/shops');
  },

  // Search shops
  search: async (params: { q?: string; category?: string; location?: string }): Promise<ApiResponse> => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.category) searchParams.append('category', params.category);
    if (params.location) searchParams.append('location', params.location);

    return apiClient.get(`/search?${searchParams.toString()}`);
  },

  // Get shop details
  getDetails: async (shopId: string): Promise<ApiResponse> => {
    return apiClient.get(`/shops/${shopId}`);
  },

  // Get shops by category
  getByCategory: async (category: string): Promise<ApiResponse> => {
    return apiClient.get(`/shops/category/${category}`);
  },

  // Get user's shops (requires auth)
  getUserShops: async (): Promise<ApiResponse> => {
    return apiClient.get('/shops/user/my-shops');
  },

  // Get shop services
  getServices: async (shopId: string): Promise<ApiResponse> => {
    return apiClient.get(`/shops/${shopId}/services`);
  },

  // Get shop staff
  getStaff: async (shopId: string): Promise<ApiResponse> => {
    return apiClient.get(`/shops/${shopId}/staff`);
  },
};
