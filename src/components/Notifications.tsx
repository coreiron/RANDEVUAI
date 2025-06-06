
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/sonner';
import { getTestNotifications } from '@/lib/services/testDataService';

// Notification types
export type NotificationType = 'appointment' | 'message' | 'system' | 'review';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date | any; // Firestore timestamp or Date
  userId: string;
  relatedId?: string; // ID of related item (appointment, message, etc.)
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Get test notifications
      const testNotifications = getTestNotifications();
      
      // Convert to proper types
      const typedNotifications = testNotifications.map(notification => ({
        ...notification,
        type: notification.type as NotificationType,
        isRead: notification.isRead || false
      }));
      
      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Bildirimler getirilirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // In real app, this would update Firebase
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? {...n, isRead: true} : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Bildirim işaretlenirken hata:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // In real app, this would update Firebase
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      setUnreadCount(0);
      toast.success("Tüm bildirimler okundu olarak işaretlendi");
    } catch (error) {
      console.error("Bildirimler işaretlenirken hata:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'appointment' && notification.relatedId) {
      navigate(`/appointments`);
    } else if (notification.type === 'message' && notification.relatedId) {
      navigate(`/messages?shopId=${notification.relatedId}`);
    } else if (notification.type === 'review' && notification.relatedId) {
      navigate(`/shops/${notification.relatedId}`);
    } else {
      navigate('/notifications');
    }

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Bildirimler</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-appointme-primary border-t-transparent"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 text-gray-300" />
              <p>Henüz hiç bildiriminiz yok</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-muted/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {notification.createdAt && typeof notification.createdAt === 'object' && 'toDate' in notification.createdAt
                      ? notification.createdAt.toDate().toLocaleDateString()
                      : typeof notification.createdAt === 'string'
                        ? new Date(notification.createdAt).toLocaleDateString()
                        : 'Geçersiz tarih'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-center"
            onClick={() => {
              navigate('/notifications');
              setOpen(false);
            }}
          >
            Tüm Bildirimleri Gör
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;
