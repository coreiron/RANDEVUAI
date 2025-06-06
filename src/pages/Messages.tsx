import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MessageCircle, Send, Search, User, ArrowLeft, Phone, Info, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/authContext';
import { messageApi } from '@/lib/api/messageApi';
import { shopApi } from '@/lib/api/shopApi';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { parseISO, isValid } from 'date-fns';

interface ConversationGroup {
  shopId: string;
  shopName: string;
  shopImage?: string;
  shopPhone?: string;
  lastMessage: any | null;
  unreadCount: number;
  messages: any[];
  isOnline?: boolean;
}

const Messages = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationGroup[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationGroup | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Kullanıcının tüm mesajlarını yükle ve grupla
  const loadMessages = useCallback(async () => {
    if (!currentUser) {
      console.log("❌ No current user for messages");
      return;
    }

    try {
      setLoading(true);
      console.log("📨 Loading messages for user:", currentUser.uid);

      // API'den mesajları al
      const response = await messageApi.getUserMessages();
      console.log("📨 API Response:", response);
      console.log("📨 Response success:", response.success);
      console.log("📨 Response data:", response.data);
      console.log("📨 Response data length:", response.data?.length);

      if (response.success && response.data) {
        console.log("📨 Raw messages from API:", response.data);

        if (response.data.length === 0) {
          console.log("⚠️ No messages found in API response");
          setConversations([]);
          return;
        }

        // Mesajları konuşmalara grupla
        const grouped = response.data.reduce((acc: any, message: any) => {
          console.log("📨 Processing message:", {
            id: message.id,
            shopId: message.shopId,
            senderId: message.senderId,
            receiverId: message.receiverId,
            text: message.text?.substring(0, 50) + '...'
          });

          const shopId = message.shopId;
          if (!acc[shopId]) {
            acc[shopId] = {
              shopId,
              shopName: message.shopName || 'Bilinmeyen İşletme',
              shopImage: message.shopImage || '/placeholder.svg',
              messages: [],
              lastMessage: null,
              lastMessageTime: null,
              unreadCount: 0
            };
          }

          const messageWithParsedDate = {
            ...message,
            createdAt: parseTimestampSafely(message.createdAt)
          };

          acc[shopId].messages.push(messageWithParsedDate);

          // Son mesajı güncelle
          if (!acc[shopId].lastMessage ||
            messageWithParsedDate.createdAt > parseTimestampSafely(acc[shopId].lastMessage.createdAt)) {
            acc[shopId].lastMessage = messageWithParsedDate;
            acc[shopId].lastMessageTime = messageWithParsedDate.createdAt;
          }

          // Okunmamış mesaj sayısını güncelle
          if (!message.read && message.senderId !== currentUser.uid) {
            acc[shopId].unreadCount++;
          }

          return acc;
        }, {});

        console.log("📨 Grouped conversations:", grouped);

        const conversationList = Object.values(grouped).map(async (conv: any) => {
          // İşletme bilgilerini al
          let shopInfo = null;
          try {
            const shopResponse = await shopApi.getDetails(conv.shopId);
            if (shopResponse.success) {
              shopInfo = shopResponse.data;
            }
          } catch (error) {
            console.warn(`Could not fetch shop info for ${conv.shopId}`);
          }

          return {
            ...conv,
            shopName: shopInfo?.name || conv.shopName,
            shopImage: shopInfo?.images?.main || shopInfo?.image || shopInfo?.imageUrl || conv.shopImage,
            messages: conv.messages.sort((a: any, b: any) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          };
        });

        const resolvedConversations = await Promise.all(conversationList);
        console.log("📨 Final conversations:", resolvedConversations);

        // Son mesaja göre sırala (en yeni önce)
        const sortedConversations = resolvedConversations.sort((a, b) =>
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );

        setConversations(sortedConversations);
      } else {
        console.error("❌ Failed to load messages:", response);
        setConversations([]);
      }
    } catch (error) {
      console.error("❌ Error loading messages:", error);
      toast.error("Mesajlar yüklenirken bir hata oluştu");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Mesajlar değiştiğinde en aşağı kaydır
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !currentUser || sending) return;

    try {
      setSending(true);
      // Doğru API fonksiyonunu kullan: send, sendMessage değil
      const response = await messageApi.send({
        shopId: selectedConversation.shopId,
        text: messageInput.trim(),
        receiverId: selectedConversation.shopId
      });

      if (response.success) {
        setMessageInput("");
        toast.success('Mesaj gönderildi');
        // Mesajları yeniden yükle
        await loadMessages();
      } else {
        toast.error(response.error || "Mesaj gönderilemedi");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Mesaj gönderilirken bir hata oluştu");
    } finally {
      setSending(false);
    }
  };

  // Güvenli timestamp parsing fonksiyonu
  const parseTimestampSafely = (timestamp: any): Date => {
    try {
      if (!timestamp) {
        return new Date(0);
      }

      // Firestore Timestamp with _seconds and _nanoseconds format
      if (timestamp._seconds !== undefined) {
        return new Date(timestamp._seconds * 1000);
      }

      // Regular Firestore Timestamp object with toDate method
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }

      // Regular Date object
      if (timestamp instanceof Date) {
        return timestamp;
      }

      // String date
      if (typeof timestamp === 'string') {
        const parsed = parseISO(timestamp);
        return isValid(parsed) ? parsed : new Date(timestamp);
      }

      // Number (Unix timestamp)
      if (typeof timestamp === 'number') {
        return new Date(timestamp);
      }

      console.warn('Unknown timestamp format:', timestamp);
      return new Date(0);
    } catch (error) {
      console.error('Error parsing timestamp:', error, timestamp);
      return new Date(0);
    }
  };

  // Güvenli tarih formatı fonksiyonu
  const formatMessageDate = (timestamp: any) => {
    if (!timestamp) return "";

    try {
      const date = parseTimestampSafely(timestamp);

      if (!isValid(date) || date.getTime() === 0) {
        return "";
      }

      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: tr });
      } else if (isYesterday(date)) {
        return 'Dün';
      } else if (isThisYear(date)) {
        return format(date, 'dd MMM', { locale: tr });
      } else {
        return format(date, 'dd.MM.yy', { locale: tr });
      }
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };

  const formatDetailedDate = (timestamp: any) => {
    if (!timestamp) return "";

    try {
      const date = parseTimestampSafely(timestamp);

      if (!isValid(date) || date.getTime() === 0) {
        return "";
      }

      return format(date, 'dd MMMM yyyy, HH:mm', { locale: tr });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };

  // Güvenli tarih karşılaştırma fonksiyonu
  const isSameDay = (timestamp1: any, timestamp2: any) => {
    try {
      if (!timestamp1 || !timestamp2) return false;

      const date1 = parseTimestampSafely(timestamp1);
      const date2 = parseTimestampSafely(timestamp2);

      if (!isValid(date1) || !isValid(date2) || date1.getTime() === 0 || date2.getTime() === 0) {
        return false;
      }

      return date1.toDateString() === date2.toDateString();
    } catch (error) {
      console.error("Date comparison error:", error);
      return false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = searchQuery
    ? conversations.filter(conv => conv.shopName.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  // Kullanıcının tüm mesajlarını yükle ve grupla
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadMessages();
    }
  }, [isAuthenticated, currentUser, loadMessages]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Giriş Yapın</h2>
          <p className="text-gray-600 mb-6">Mesajlarınızı görüntülemek için giriş yapmanız gerekiyor.</p>
          <Button onClick={() => navigate('/login')}>Giriş Yap</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mesajlarım</h1>
          <p className="text-gray-600">İşletmelerle yapılan konuşmalar</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[700px] bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Sol Panel - Konuşma Listesi */}
          <div className="col-span-1 flex flex-col border-r border-gray-200">
            {/* Arama Başlığı */}
            <div className="p-4 border-b bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Konuşma ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0 bg-white"
                />
              </div>
            </div>

            {/* Konuşma Listesi */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Henüz mesajınız yok</p>
                  <p className="text-sm text-gray-500 mt-2">İşletme detayında mesaj gönderebilirsiniz</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.shopId}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors relative ${selectedConversation?.shopId === conversation.shopId ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={conversation.shopImage || '/placeholder.svg'}
                            alt={conversation.shopName}
                          />
                          <AvatarFallback className="bg-blue-500 text-white">
                            {conversation.shopName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      {/* Mesaj İçeriği */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conversation.shopName}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {conversation.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatMessageDate(conversation.lastMessage.createdAt)}
                              </span>
                            )}
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-blue-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center p-0">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage.senderId === currentUser?.uid ? 'Siz: ' : ''}
                            {conversation.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sağ Panel - Mesaj Detayları */}
          <div className="col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedConversation.shopImage || '/placeholder.svg'}
                          alt={selectedConversation.shopName}
                        />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {selectedConversation.shopName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {selectedConversation.shopName}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.isOnline ? 'Çevrimiçi' : 'Son görülme bilinmiyor'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedConversation.shopPhone && (
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/shops/${selectedConversation.shopId}`)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Mesajlar */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
                  {selectedConversation.messages.map((message, index) => {
                    const isCurrentUser = message.senderId === currentUser?.uid;
                    const showDate = index === 0 ||
                      !isSameDay(message.createdAt, selectedConversation.messages[index - 1].createdAt);

                    return (
                      <div key={index}>
                        {/* Tarih Ayracı */}
                        {showDate && (
                          <div className="flex justify-center mb-4">
                            <span className="bg-white px-4 py-2 rounded-full text-xs text-gray-600 shadow-sm border">
                              {formatDetailedDate(message.createdAt)}
                            </span>
                          </div>
                        )}

                        {/* Mesaj Balonu */}
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                            {!isCurrentUser && (
                              <Avatar className="h-7 w-7 mb-1 border-2 border-white shadow-sm">
                                <AvatarImage
                                  src={selectedConversation.shopImage || '/placeholder.svg'}
                                  alt={selectedConversation.shopName}
                                />
                                <AvatarFallback className="bg-gray-400 text-white text-xs">
                                  {selectedConversation.shopName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-sm max-w-full ${isCurrentUser
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                                : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                                }`}
                            >
                              <p className="text-sm leading-5 whitespace-pre-wrap break-words">{message.text}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p
                                  className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                                    }`}
                                >
                                  {format(parseTimestampSafely(message.createdAt), 'HH:mm', { locale: tr })}
                                </p>
                                {isCurrentUser && (
                                  <div className="flex items-center space-x-1">
                                    <div className={`w-1 h-1 rounded-full ${message.read ? 'bg-blue-200' : 'bg-blue-300'}`}></div>
                                    <div className={`w-1 h-1 rounded-full ${message.read ? 'bg-blue-200' : 'bg-blue-300'}`}></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Scroll referansı */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Mesaj Gönderme */}
                <div className="p-4 bg-white border-t border-gray-200 shadow-sm">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Textarea
                          placeholder="Mesajınızı yazın... (Enter ile gönder)"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="min-h-[44px] max-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg"
                          rows={1}
                        />
                      </div>
                      {messageInput.length > 500 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {messageInput.length}/1000 karakter
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sending || messageInput.length > 1000}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 h-11 w-11 p-0 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Mesajlaşmaya Başlayın</h3>
                  <p className="text-gray-600 mb-4">Bir konuşma seçin ve mesajlaşmaya başlayın</p>
                  <Button
                    onClick={() => navigate('/shops')}
                    variant="outline"
                  >
                    İşletmeleri Keşfet
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
