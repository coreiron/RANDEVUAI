
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getUnreadNotificationCount } from '@/lib/services/notificationService';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/authContext';
import { toast } from '@/components/ui/sonner';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isAuthenticated || !currentUser) {
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Bildirim sayısı alınırken hata oluştu:', error);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCount();

    // Her 30 saniyede bir bildirim sayısını güncelle
    const intervalId = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, currentUser]);

  const handleNotificationClick = () => {
    if (!isAuthenticated) {
      toast.error("Bildirimleri görmek için giriş yapmalısınız");
    }
  };

  return (
    <Link to={isAuthenticated ? "/notifications" : "/login"} onClick={handleNotificationClick} className="relative inline-block">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative mr-1 h-10 w-10 rounded-full bg-white hover:bg-gray-100"
      >
        <Bell className="h-5 w-5 text-appointme-primary" />
        {!isLoading && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
};

export default NotificationBell;
