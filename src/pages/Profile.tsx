import React, { useState, useEffect } from 'react';
import { User, LogOut, Bell, Calendar, Heart, MessageSquare, Lock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { logoutUser } from '@/lib/firebase';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserAppointments from '@/components/appointments/UserAppointments';
import FavoriteShops from '@/components/shops/FavoriteShops';
import UserReviews from '@/components/reviews/UserReviews';
import ProfileEditor from '@/components/profile/ProfileEditor';
import { getUserProfile } from '@/lib/services/profileService';
import ChangePasswordDialog from '@/components/profile/ChangePasswordDialog';
import { shopApi } from '@/lib/api/shopApi';

const Profile = () => {
  const { isAuthenticated, currentUser, userProfile: authUserProfile, isBusiness } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userShops, setUserShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserProfile();
      if (isBusiness) {
        loadUserShops();
      }
    }
  }, [isAuthenticated, isBusiness]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserShops = async () => {
    try {
      const response = await shopApi.getUserShops();
      if (response.success && response.data) {
        setUserShops(response.data);
      }
    } catch (error) {
      console.error("Error loading user shops:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Başarıyla çıkış yapıldı");
      navigate('/');
    } catch (error) {
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  const handleProfileUpdateSuccess = () => {
    loadUserProfile();
  };

  if (!isAuthenticated) {
    return (
      <div className="pb-20 pt-4 px-4">
        <div className="max-w-md mx-auto flex flex-col items-center justify-center py-16 text-center">
          <User className="h-16 w-16 text-appointme-primary mb-4" />
          <h1 className="text-2xl font-bold mb-4">Profilim</h1>
          <p className="text-gray-600 mb-8">
            Profilinize ve randevularınıza erişmek için lütfen giriş yapın
          </p>
          <Link to="/login">
            <Button className="bg-appointme-primary hover:bg-appointme-secondary">
              Giriş Yap
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-appointme-primary hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-4">
      <div className="px-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <User className="text-appointme-primary" />
          <h1 className="text-2xl font-bold">Hesabım</h1>
          {isBusiness && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">İşletme Hesabı</span>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex flex-col items-center gap-3">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt="Profil"
                  className="w-24 h-24 rounded-full object-cover border"
                />
              ) : (
                <div className="w-24 h-24 bg-appointme-primary text-white rounded-full flex items-center justify-center text-3xl font-bold">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'K'}
                </div>
              )}

              {isBusiness && userShops.length > 0 && (() => {
                const shop = userShops[0];
                const possibleImages = [
                  shop.photoURL,
                  shop.images?.main,
                  shop.images?.logo,
                  shop.images?.thumbnail,
                  shop.image,
                  shop.imageUrl,
                  shop.mainImage,
                  shop.logo,
                  shop.avatar,
                  shop.picture,
                  shop.photo
                ];

                const validImage = possibleImages.find(url =>
                  url &&
                  typeof url === 'string' &&
                  url.trim() !== '' &&
                  url !== '/placeholder.svg' &&
                  !url.includes('undefined') &&
                  !url.includes('null') &&
                  (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:'))
                );

                return validImage ? (
                  <div className="flex flex-col items-center">
                    <p className="text-xs text-gray-500 mb-1">İşletme</p>
                    <img
                      src={validImage}
                      alt={shop.name}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-blue-200"
                      onError={(e) => {
                        console.log(`❌ Profile business image failed to load:`, validImage);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : null;
              })()}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold">{currentUser?.displayName || 'Kullanıcı'}</h2>
              <p className="text-gray-600">{currentUser?.email}</p>

              {isBusiness && userShops.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">{userShops[0].name}</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    {userShops[0].category} • {userShops[0].location?.address}
                  </p>
                  <Link to="/business-dashboard">
                    <Button size="sm" className="mt-2">
                      İşletme Paneli
                    </Button>
                  </Link>
                </div>
              )}

              <div className="mt-6 grid gap-4">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setIsProfileEditorOpen(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profil Bilgilerimi Güncelle
                </Button>

                {isBusiness && (
                  <Button
                    asChild
                    variant="outline"
                    className="justify-start"
                  >
                    <Link to="/business-register">
                      <Building2 className="mr-2 h-4 w-4" />
                      İşletme Bilgilerimi Güncelle
                    </Link>
                  </Button>
                )}

                <ChangePasswordDialog>
                  <Button
                    variant="outline"
                    className="justify-start"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Şifremi Değiştir
                  </Button>
                </ChangePasswordDialog>

                <Button
                  variant="outline"
                  className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid mb-6 ${isBusiness ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Profilim</span>
            </TabsTrigger>
            {isBusiness && (
              <TabsTrigger value="business">
                <Building2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">İşletmem</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="appointments">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Randevularım</span>
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Favorilerim</span>
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Yorumlarım</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Hesap Bilgilerim</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Ad Soyad</p>
                <p>{currentUser?.displayName || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">E-posta</p>
                <p>{currentUser?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p>{userProfile?.phone || authUserProfile?.phoneNumber || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hesap Türü</p>
                <p>{isBusiness ? 'İşletme Hesabı' : 'Kullanıcı Hesabı'}</p>
              </div>
              {userProfile?.address && (
                <div>
                  <p className="text-sm text-gray-500">Adres</p>
                  <p>{userProfile.address.title || ''} {userProfile.address.street || ''}, {userProfile.address.city || ''}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {isBusiness && (
            <TabsContent value="business" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">İşletme Bilgilerim</h2>
              {userShops.length > 0 ? (
                <div className="space-y-6">
                  {userShops.map((shop: any, index: number) => (
                    <div key={shop.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        {(() => {
                          const possibleImages = [
                            shop.photoURL,
                            shop.images?.main,
                            shop.images?.logo,
                            shop.images?.thumbnail,
                            shop.image,
                            shop.imageUrl,
                            shop.mainImage,
                            shop.logo,
                            shop.avatar,
                            shop.picture,
                            shop.photo
                          ];

                          const validImage = possibleImages.find(url =>
                            url &&
                            typeof url === 'string' &&
                            url.trim() !== '' &&
                            url !== '/placeholder.svg' &&
                            !url.includes('undefined') &&
                            !url.includes('null') &&
                            (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:'))
                          );

                          return validImage ? (
                            <img
                              src={validImage}
                              alt={shop.name}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                console.log(`❌ Profile business detail image failed to load:`, validImage);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-8 w-8 text-gray-400" />
                            </div>
                          );
                        })()}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{shop.name}</h3>
                          <p className="text-gray-600 mb-2">{shop.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Kategori</p>
                              <p>{shop.category}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Telefon</p>
                              <p>{shop.contact?.phone || 'Belirtilmemiş'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">E-posta</p>
                              <p>{shop.contact?.email || 'Belirtilmemiş'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Adres</p>
                              <p>{shop.location?.address || 'Belirtilmemiş'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Hizmet Sayısı</p>
                              <p>{shop.services?.length || 0} adet</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Personel Sayısı</p>
                              <p>{shop.staff?.length || 0} kişi</p>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button asChild size="sm">
                              <Link to="/business-dashboard">İşletme Paneli</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link to="/business-register">Düzenle</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">Henüz işletme bilgileri eklenmemiş.</p>
                  <Button asChild>
                    <Link to="/business-register">İşletme Bilgilerini Tamamla</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="appointments" className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Randevularım</h2>
            <UserAppointments />
          </TabsContent>

          <TabsContent value="favorites" className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Favorilerim</h2>
            <FavoriteShops />
          </TabsContent>

          <TabsContent value="comments" className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Yorumlarım</h2>
            <UserReviews />
          </TabsContent>
        </Tabs>
      </div>

      <ProfileEditor
        isOpen={isProfileEditorOpen}
        onClose={() => setIsProfileEditorOpen(false)}
        onSuccess={handleProfileUpdateSuccess}
      />
    </div>
  );
};

export default Profile;
