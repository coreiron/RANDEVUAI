import { apiClient, ApiResponse } from './client';

export const notificationApi = {
    // Get user's notifications
    getUserNotifications: async (): Promise<ApiResponse> => {
        return apiClient.get('/notifications/user');
    },

    // Mark notification as read
    markAsRead: async (notificationId: string): Promise<ApiResponse> => {
        return apiClient.put(`/notifications/${notificationId}/read`);
    },
}; 