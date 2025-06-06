import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { messageApi } from '@/lib/api/messageApi';

export interface MessageSchema {
  id: string;
  shopId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  text: string;
  createdAt: any;
  read: boolean;
  participants: string[];
}

export const useShopMessages = (shopId: string) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<MessageSchema[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!currentUser || !shopId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching messages for shop:', shopId, 'user:', currentUser.uid);

      const response = await messageApi.getShopMessages(shopId);

      if (response.success) {
        setMessages(response.data || []);
        console.log('Messages fetched successfully:', response.data?.length || 0);
      } else {
        console.error('Error fetching messages:', response.error);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentUser, shopId]);

  const sendMessage = async (text: string) => {
    if (!currentUser || !shopId || !text.trim()) {
      throw new Error('Missing required data for sending message');
    }

    try {
      console.log('Sending message via API:', { shopId, text, senderId: currentUser.uid });

      const response = await messageApi.send({
        shopId,
        text: text.trim(),
        receiverId: shopId
      });

      if (response.success) {
        console.log('Message sent successfully via API');
        // Mesajları yeniden yükle
        await fetchMessages();
        return response.data?.messageId;
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message via API:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage
  };
};
