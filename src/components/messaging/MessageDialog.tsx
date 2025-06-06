
import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { toast } from '@/components/ui/sonner';
import { Shop } from '@/types/Shop';
import { useShopMessages } from '@/hooks/useShopMessages';

interface MessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop;
}

const MessageDialog: React.FC<MessageDialogProps> = ({ isOpen, onClose, shop }) => {
  const { currentUser } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, loading } = useShopMessages(shop.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(messageText.trim());
      setMessageText('');
      toast.success('Mesaj gönderildi');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Mesaj gönderilemedi');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">{shop.name}</div>
              <div className="text-sm text-white/80">Mesajlaşma</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle className="h-12 w-12 mb-2" />
              <p>Henüz mesaj yok</p>
              <p className="text-sm">İlk mesajı gönderin!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.senderId === currentUser?.uid;
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white border rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          isCurrentUser ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          <User className="h-3 w-3" />
                        </div>
                        <span className={`text-xs font-medium ${
                          isCurrentUser ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {message.senderName || (isCurrentUser ? 'Siz' : shop.name)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <div className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-white/60' : 'text-gray-400'
                      }`}>
                        {formatMessageTime(message.createdAt)}
                        {message.read && isCurrentUser && (
                          <span className="ml-2">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t bg-white p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Mesajınızı yazın..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 min-h-[40px] max-h-[120px] resize-none"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isSending}
              className="bg-blue-500 hover:bg-blue-600 px-4"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
