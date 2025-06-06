import { apiClient } from './client';

export const profileApi = {
    // Profil güncelle
    updateProfile: async (profileData: {
        displayName?: string;
        phone?: string;
        photoURL?: string;
        address?: any;
        preferences?: any;
    }) => {
        return apiClient.put('/profile', profileData);
    },

    // Profil getir
    getProfile: async () => {
        return apiClient.get('/profile');
    },

    // Favori ekle/çıkar
    toggleFavorite: async (shopId: string) => {
        return apiClient.put(`/profile/favorites/${shopId}`);
    },
}; 