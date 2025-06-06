import { apiClient, ApiResponse } from './client';

export interface SendMessageData {
  shopId: string;
  text: string;
  receiverId?: string;
}

export const messageApi = {
  // Send a message
  send: async (data: SendMessageData): Promise<ApiResponse> => {
    return apiClient.post('/messages', data);
  },

  // Get user's messages
  getUserMessages: async (): Promise<ApiResponse> => {
    return apiClient.get('/messages/user');
  },

  // Get messages with a specific shop
  getShopMessages: async (shopId: string): Promise<ApiResponse> => {
    return apiClient.get(`/messages/shop/${shopId}`);
  },
}; 