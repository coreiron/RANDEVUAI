
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import { logoutUser } from '@/lib/firebase';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

const NavbarActions = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Başarıyla çıkış yapıldı");
      navigate('/');
    } catch (error) {
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  return (
    <div className="flex items-center gap-4">
      {isAuthenticated ? (
        <>
          <NotificationBell />
          
          <Link to="/profile">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-white hover:bg-gray-100 border border-gray-200"
            >
              <User className="h-5 w-5 text-appointme-primary" />
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="h-10 w-10 rounded-full bg-white hover:bg-gray-100 border border-gray-200"
          >
            <LogOut className="h-5 w-5 text-red-500" />
          </Button>
        </>
      ) : (
        <Link to="/login">
          <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-gray-100">
            <LogOut className="h-4 w-4" />
            <span>Giriş Yap</span>
          </Button>
        </Link>
      )}
    </div>
  );
};

export default NavbarActions;
