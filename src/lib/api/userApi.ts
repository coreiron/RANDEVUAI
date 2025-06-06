import { apiClient } from './client';

export interface ApiResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}

export const userApi = {
    getProfile: async (): Promise<ApiResponse> => {
        try {
            const response = await apiClient.get('/users/profile');
            return response;
        } catch (error: any) {
            console.error('Error getting user profile:', error);
            return {
                success: false,
                error: error.message || 'Failed to get user profile'
            };
        }
    },

    updateProfile: async (profileData: any): Promise<ApiResponse> => {
        try {
            const response = await apiClient.put('/users/profile', profileData);
            return response;
        } catch (error: any) {
            console.error('Error updating user profile:', error);
            return {
                success: false,
                error: error.message || 'Failed to update user profile'
            };
        }
    },

    updatePreferences: async (preferences: any): Promise<ApiResponse> => {
        try {
            const response = await apiClient.put('/users/preferences', preferences);
            return response;
        } catch (error: any) {
            console.error('Error updating user preferences:', error);
            return {
                success: false,
                error: error.message || 'Failed to update user preferences'
            };
        }
    },

    createBusinessAuthAccounts: async (): Promise<ApiResponse> => {
        try {
            const response = await apiClient.post('/users/create-business-accounts');
            return response;
        } catch (error: any) {
            console.error('Error creating business accounts:', error);
            return {
                success: false,
                error: error.message || 'Failed to create business accounts'
            };
        }
    }
}; 