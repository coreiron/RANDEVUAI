import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Building2, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Logo from './Logo';
import { useAuth } from '@/lib/authContext';
import { logoutUser } from '@/lib/firebase';
import { toast } from '@/components/ui/sonner';
import NotificationBell from '@/components/notifications/NotificationBell';

const Navbar = () => {
  const { isAuthenticated, isBusiness, currentUser, userProfile } = useAuth();
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
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="text-lg font-bold">
            <Logo />
          </Link>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NotificationBell />

              {/* İşletme Hesabı için Özel Butonlar */}
              {isBusiness && (
                <>
                  {/* İşletme Dashboard Butonu */}
                  <Link to="/business-dashboard">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex items-center h-10 w-10 rounded-full bg-white hover:bg-gray-100"
                      title="İşletme Paneli"
                    >
                      <Building2 className="h-5 w-5 text-appointme-primary" />
                    </Button>
                  </Link>

                  {/* İşletme Kayıt/Düzenleme Butonu */}
                  {!userProfile?.hasCompletedBusinessSetup ? (
                    <Link to="/business-register">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                        title="İşletme Bilgilerini Kaydet"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="hidden md:inline">İşletme Kaydet</span>
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/business-register">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center h-10 w-10 rounded-full bg-white hover:bg-gray-100"
                        title="İşletme Bilgilerini Düzenle"
                      >
                        <Settings className="h-5 w-5 text-gray-600" />
                      </Button>
                    </Link>
                  )}
                </>
              )}

              {/* Normal Hesap için Profil Butonu */}
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center h-10 w-10 rounded-full bg-white hover:bg-gray-100"
                >
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt="Profil"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-appointme-primary" />
                  )}
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-10 w-10 rounded-full bg-white hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5 text-red-500" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button className="bg-appointme-primary hover:bg-appointme-secondary">
                  Giriş Yap
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" className="bg-white hover:bg-gray-100">
                  Kayıt Ol
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* İşletme Hesabı için Bilgi Çubuğu */}
      {isAuthenticated && isBusiness && !userProfile?.hasCompletedBusinessSetup && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-800">
              ⚠️ İşletme bilgilerinizi henüz tamamlamadınız.
            </span>
            <Link to="/business-register">
              <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-100">
                Şimdi Tamamla
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
