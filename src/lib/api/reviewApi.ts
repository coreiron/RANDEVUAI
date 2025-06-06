import { apiClient, ApiResponse } from './client';

export interface CreateReviewData {
    shopId: string;
    appointmentId?: string;
    rating: number;
    comment: string;
}

export const reviewApi = {
    // Submit a review
    create: async (data: CreateReviewData): Promise<ApiResponse> => {
        return apiClient.post('/reviews', data);
    },

    // Get shop reviews
    getShopReviews: async (shopId: string, limit?: number): Promise<ApiResponse> => {
        const endpoint = limit
            ? `/reviews/shop/${shopId}?limit=${limit}`
            : `/reviews/shop/${shopId}`;
        return apiClient.get(endpoint);
    },

    // Get user's reviews
    getUserReviews: async (): Promise<ApiResponse> => {
        return apiClient.get('/reviews/user');
    },
}; 