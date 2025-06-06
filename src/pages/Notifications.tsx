import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/authContext';
import { notificationApi } from '@/lib/api/notificationApi';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  relatedId?: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getUserNotifications();

      if (response.success) {
        const notificationsData = response.data?.notifications || [];
        setNotifications(notificationsData);
        setUnreadCount(response.data?.unreadCount || 0);
      } else {
        console.error("Error fetching notifications:", response.error);
        toast.error(response.error || "Bildirimler alınamadı");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Bildirimler alınırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await notificationApi.markAsRead(notificationId);

      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success("Bildirim okundu olarak işaretlendi");
      } else {
        toast.error(response.error || "Bildirim güncellenemedi");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Bildirim güncellenirken bir hata oluştu");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // API'de tüm bildirimleri okundu olarak işaretleme endpoint'i henüz yok
      // Geçici olarak teker teker işaretle
      const unreadNotifications = notifications.filter(n => !n.read);

      for (const notification of unreadNotifications) {
        await notificationApi.markAsRead(notification.id);
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("Tüm bildirimler okundu olarak işaretlendi");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Bildirimler güncellenirken bir hata oluştu");
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    try {
      let parsedDate: Date;

      if (date?.toDate) {
        parsedDate = date.toDate();
      } else if (date?.seconds) {
        parsedDate = new Date(date.seconds * 1000);
      } else if (date instanceof Date) {
        parsedDate = date;
      } else {
        parsedDate = new Date(date);
      }

      return format(parsedDate, 'dd MMM yyyy, HH:mm', { locale: tr });
    } catch (error) {
      console.error("Date formatting error:", error);
      return '';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl py-10 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Bildirimler</h1>
        <p>Bildirimleri görüntülemek için giriş yapmanız gerekiyor.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Bildirimler</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
        <Separator />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Henüz bildirim yok</h3>
          <p className="text-gray-600">Yeni bildirimler burada görünecek.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{notification.title}</CardTitle>
                  {!notification.read && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Yeni</Badge>
                    </div>
                  )}
                </div>
                <CardDescription>{formatDate(notification.createdAt)}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p>{notification.message}</p>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Okundu İşaretle
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
