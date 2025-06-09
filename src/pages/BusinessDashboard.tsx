import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, TrendingUp, Clock, Star, AlertCircle, User } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { getBusinessAppointmentsViaApi } from '@/lib/services/appointment/appointmentApiService';
import { shopApi } from '@/lib/api/shopApi';
import BusinessAppointmentsList from '@/components/business/BusinessAppointmentsList';
import { toast } from '@/components/ui/sonner';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Shop } from '@/lib/firebase/schema';

const BusinessDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    today: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  useEffect(() => {
    if (selectedShop) {
      loadAppointments();
    }
  }, [selectedShop]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Load user's shops via API
      const response = await shopApi.getUserShops();
      if (response.success && response.data) {
        console.log("📊 API Response success:", response.success);
        console.log("📊 API Response data:", response.data);
        console.log("📊 Number of shops:", response.data.length);
        response.data.forEach((shop, index) => {
          console.log(`🏪 Shop ${index + 1}:`, {
            id: shop.id,
            name: shop.name,
            ownerId: shop.ownerId,
            category: shop.category,
            location: shop.location,
            services: shop.services,
            staff: shop.staff,
            workingHours: shop.workingHours,
            photoURL: shop.photoURL || shop.images?.main,
            contact: shop.contact
          });
        });

        setShops(response.data as any[]);

        // Select first shop by default
        if (response.data.length > 0) {
          setSelectedShop(response.data[0].id);
          console.log("🎯 Selected shop ID:", response.data[0].id);
        } else {
          toast.warning("İşletme bulunamadı. Lütfen işletme bilgilerinizi tamamlayın.");
        }
      } else {
        console.error("❌ Failed to load shops:", response.error);
        console.error("❌ Full response:", response);
        toast.error("İşletme bilgileri yüklenirken hata oluştu");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Dashboard verileri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    if (!selectedShop) return;

    try {
      setAppointmentsLoading(true);

      const shopAppointments = await getBusinessAppointmentsViaApi(selectedShop);
      console.log("📅 Loaded appointments via API:", shopAppointments);
      console.log("📅 Appointments array length:", shopAppointments.length);
      if (shopAppointments.length > 0) {
        console.log("📋 First appointment details:", shopAppointments[0]);
        console.log("📋 Appointment status:", shopAppointments[0].status);
        console.log("📋 Appointment date:", shopAppointments[0].date);
        console.log("📋 Appointment user:", shopAppointments[0].userName || shopAppointments[0].customerName);
      }

      setAppointments(shopAppointments);

      // Calculate stats
      const today = new Date().toDateString();
      const newStats = {
        total: shopAppointments.length,
        pending: shopAppointments.filter(a =>
          a.status === 'pending_business_confirmation' || a.status === 'pending'
        ).length,
        confirmed: shopAppointments.filter(a => a.status === 'confirmed').length,
        completed: shopAppointments.filter(a => a.status === 'completed').length,
        today: shopAppointments.filter(a => {
          try {
            let appointmentDate: Date;

            if (!a.date) {
              return false;
            }

            // Firestore Timestamp with _seconds and _nanoseconds format
            if (a.date._seconds !== undefined) {
              appointmentDate = new Date(a.date._seconds * 1000);
            }
            // Regular Firestore Timestamp object with toDate method
            else if (a.date.toDate && typeof a.date.toDate === 'function') {
              appointmentDate = a.date.toDate();
            }
            // Regular Date object
            else if (a.date instanceof Date) {
              appointmentDate = a.date;
            }
            // String or number date
            else if (typeof a.date === 'string' || typeof a.date === 'number') {
              appointmentDate = new Date(a.date);
            } else {
              console.warn('Invalid appointment date format:', a.date);
              return false;
            }

            // Date objesinin geçerli olup olmadığını kontrol et
            if (isNaN(appointmentDate.getTime())) {
              console.warn('Invalid appointment date value:', a.date);
              return false;
            }

            return appointmentDate.toDateString() === today;
          } catch (error) {
            console.error('Error processing appointment date for stats:', error, a.date);
            return false;
          }
        }).length
      };

      setStats(newStats);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Randevular yüklenirken hata oluştu");
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleRefreshAppointments = () => {
    loadAppointments();
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Dashboard yükleniyor..." />;
  }

  // İşletme bilgileri kontrolü - eğer shops varsa setup tamamlanmış sayılır
  const hasBusinessSetup = userProfile?.hasCompletedBusinessSetup || shops.length > 0;

  if (!hasBusinessSetup && shops.length === 0) {
    return (
      <div className="container max-w-4xl py-8 px-4">
        <Card className="border-orange-200">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">İşletme Bilgileri Eksik</h2>
            <p className="text-gray-600 mb-6">
              Dashboard'ı kullanabilmek için önce işletme bilgilerinizi tamamlamanız gerekiyor.
            </p>
            <Button asChild>
              <a href="/business-register">İşletme Bilgilerini Tamamla</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container max-w-7xl py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {(() => {
              const currentShop = shops.find(s => s.id === selectedShop);

              // Kapsamlı resim URL kontrolü
              const getShopImageUrl = () => {
                if (!currentShop) return null;

                const possibleImages = [
                  currentShop.photoURL,
                  currentShop.images?.main,
                  currentShop.images?.logo,
                  currentShop.images?.thumbnail,
                  currentShop.image,
                  currentShop.imageUrl,
                  currentShop.mainImage,
                  currentShop.logo,
                  currentShop.avatar,
                  currentShop.picture,
                  currentShop.photo
                ];

                // İlk geçerli resim URL'sini bul
                const validImage = possibleImages.find(url =>
                  url &&
                  typeof url === 'string' &&
                  url.trim() !== '' &&
                  url !== '/placeholder.svg' &&
                  !url.includes('undefined') &&
                  !url.includes('null') &&
                  (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:'))
                );

                console.log(`🖼️ BusinessDashboard - Shop ${currentShop.name} image resolution:`, {
                  shopId: currentShop.id,
                  availableImages: possibleImages.filter(Boolean),
                  selectedImage: validImage || null
                });

                return validImage;
              };

              const shopImageUrl = getShopImageUrl();

              return shopImageUrl ? (
                <img
                  src={shopImageUrl}
                  alt={currentShop?.name}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-md"
                  onError={(e) => {
                    console.log(`❌ BusinessDashboard image failed to load:`, shopImageUrl);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log(`✅ BusinessDashboard image loaded successfully:`, shopImageUrl);
                  }}
                />
              ) : null;
            })()}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                İşletme Paneli
                {shops.length > 0 && (
                  <span className="text-2xl text-blue-600 ml-2">- {shops.find(s => s.id === selectedShop)?.name}</span>
                )}
              </h1>
              <p className="text-gray-600">Randevularınızı yönetin ve işletmenizi takip edin</p>
              {shops.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>İşletme ID: {selectedShop}</span>
                  <span>Kategori: {shops.find(s => s.id === selectedShop)?.category}</span>
                  {shops.find(s => s.id === selectedShop)?.location?.address && (
                    <span>Adres: {shops.find(s => s.id === selectedShop)?.location?.address}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shop Selector */}
        {shops.length > 1 && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <label className="font-medium">İşletme Seçin:</label>
                <select
                  value={selectedShop}
                  onChange={(e) => setSelectedShop(e.target.value)}
                  className="border rounded-lg px-3 py-2 min-w-64"
                >
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Randevu</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Onay Bekliyor</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Planlandı</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tamamlandı</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bugün</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="appointments">Randevular</TabsTrigger>
            <TabsTrigger value="services">Hizmetler</TabsTrigger>
            <TabsTrigger value="staff">Personel</TabsTrigger>
            <TabsTrigger value="schedule">Çalışma Saatleri</TabsTrigger>
            <TabsTrigger value="settings">Ayarlar</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Randevu Yönetimi</CardTitle>
                <Button onClick={handleRefreshAppointments} variant="outline" size="sm">
                  Yenile
                </Button>
              </CardHeader>
              <CardContent>
                <BusinessAppointmentsList
                  appointments={appointments}
                  loading={appointmentsLoading}
                  onRefresh={handleRefreshAppointments}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Hizmetler</CardTitle>
                <Button asChild variant="outline" size="sm">
                  <a href="/business-register">Hizmetleri Düzenle</a>
                </Button>
              </CardHeader>
              <CardContent>
                {(() => {
                  const currentShop = shops.find(s => s.id === selectedShop);
                  console.log("🔍 Current shop for services:", currentShop);
                  console.log("🔍 Services data:", currentShop?.services);
                  console.log("🔍 Services length:", currentShop?.services?.length);
                  console.log("🔍 Services type:", typeof currentShop?.services);
                  console.log("🔍 Services is array:", Array.isArray(currentShop?.services));

                  const services = currentShop?.services || [];
                  const hasValidServices = Array.isArray(services) && services.length > 0;

                  if (selectedShop && hasValidServices) {
                    return (
                      <div>
                        <p className="text-sm text-green-600 mb-4">✅ {services.length} hizmet bulundu</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {services.map((service: any, index: number) => (
                            <Card key={index} className="border border-gray-200">
                              <CardContent className="p-4">
                                {service.photoURL && (
                                  <img
                                    src={service.photoURL}
                                    alt={service.name}
                                    className="w-full h-32 object-cover rounded-md mb-3"
                                  />
                                )}
                                <h3 className="font-semibold text-lg mb-2">{service.name || 'İsimsiz Hizmet'}</h3>
                                <p className="text-gray-600 text-sm mb-3">{service.description || 'Açıklama yok'}</p>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {service.duration || 60} dk
                                  </span>
                                  <span className="font-semibold text-green-600">
                                    {service.price || 0} ₺
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 mb-2">Henüz hizmet eklenmemiş.</p>
                        <p className="text-xs text-gray-400 mb-4">
                          Debug: selectedShop={selectedShop}, services exist={!!currentShop?.services}, services count={services.length}, is array={Array.isArray(services)}
                        </p>
                        <Button asChild>
                          <a href="/business-register">Hizmet Ekle</a>
                        </Button>
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personel</CardTitle>
                <Button asChild variant="outline" size="sm">
                  <a href="/business-register">Personeli Düzenle</a>
                </Button>
              </CardHeader>
              <CardContent>
                {(() => {
                  const currentShop = shops.find(s => s.id === selectedShop);
                  console.log("🔍 Current shop for staff:", currentShop);
                  console.log("🔍 Staff data:", currentShop?.staff);
                  console.log("🔍 Staff length:", currentShop?.staff?.length);
                  console.log("🔍 Staff type:", typeof currentShop?.staff);
                  console.log("🔍 Staff is array:", Array.isArray(currentShop?.staff));

                  const staff = currentShop?.staff || [];
                  const hasValidStaff = Array.isArray(staff) && staff.length > 0;

                  if (selectedShop && hasValidStaff) {
                    return (
                      <div>
                        <p className="text-sm text-green-600 mb-4">✅ {staff.length} personel bulundu</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {staff.map((member: any, index: number) => (
                            <Card key={index} className="border border-gray-200">
                              <CardContent className="p-4 text-center">
                                {member.photoURL ? (
                                  <img
                                    src={member.photoURL}
                                    alt={member.name}
                                    className="w-20 h-20 object-cover rounded-full mx-auto mb-3"
                                  />
                                ) : (
                                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                                    <User className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                                <h3 className="font-semibold text-lg mb-1">{member.name || 'İsimsiz Personel'}</h3>
                                <p className="text-gray-600 text-sm mb-2">{member.title || 'Unvan belirtilmemiş'}</p>
                                {member.specialties && member.specialties.length > 0 && (
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {member.specialties.map((specialty: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                      >
                                        {specialty}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 mb-2">Henüz personel eklenmemiş.</p>
                        <p className="text-xs text-gray-400 mb-4">
                          Debug: selectedShop={selectedShop}, staff exist={!!currentShop?.staff}, staff count={staff.length}, is array={Array.isArray(staff)}
                        </p>
                        <Button asChild>
                          <a href="/business-register">Personel Ekle</a>
                        </Button>
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Çalışma Saatleri</CardTitle>
                <Button asChild variant="outline" size="sm">
                  <a href="/business-register">Saatleri Düzenle</a>
                </Button>
              </CardHeader>
              <CardContent>
                {(() => {
                  const currentShop = shops.find(s => s.id === selectedShop);
                  console.log("🔍 Current shop for schedule:", currentShop);
                  console.log("🔍 Working hours data:", currentShop?.workingHours);

                  if (selectedShop && currentShop?.workingHours) {
                    return (
                      <div>
                        <p className="text-sm text-green-600 mb-4">✅ Çalışma saatleri bulundu</p>
                        <div className="space-y-3">
                          {Object.entries(currentShop.workingHours).map(([day, hours]: [string, any]) => {
                            const dayNames: any = {
                              monday: 'Pazartesi',
                              tuesday: 'Salı',
                              wednesday: 'Çarşamba',
                              thursday: 'Perşembe',
                              friday: 'Cuma',
                              saturday: 'Cumartesi',
                              sunday: 'Pazar'
                            };

                            return (
                              <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">{dayNames[day]}</span>
                                <div className="flex items-center gap-2">
                                  {hours?.isOpen ? (
                                    <>
                                      <Clock className="h-4 w-4 text-green-600" />
                                      <span className="text-green-600">{hours.open || '09:00'} - {hours.close || '18:00'}</span>
                                    </>
                                  ) : (
                                    <span className="text-red-600">Kapalı</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 mb-2">Çalışma saatleri belirlenmemiş.</p>
                        <p className="text-xs text-gray-400 mb-4">
                          Debug: selectedShop={selectedShop}, workingHours exists={!!currentShop?.workingHours}
                        </p>
                        <Button asChild>
                          <a href="/business-register">Çalışma Saatleri Belirle</a>
                        </Button>
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>İşletme Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">İşletme Bilgileri</h3>
                      <p className="text-sm text-gray-600 mb-3">İşletme adı, açıklama, iletişim bilgileri</p>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <a href="/business-register">Düzenle</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Hizmetler ve Fiyatlar</h3>
                      <p className="text-sm text-gray-600 mb-3">Sunduğunuz hizmetleri ve fiyatları yönetin</p>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <a href="/business-register">Düzenle</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Personel Yönetimi</h3>
                      <p className="text-sm text-gray-600 mb-3">Çalışan ekibinizi yönetin</p>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <a href="/business-register">Düzenle</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Çalışma Saatleri</h3>
                      <p className="text-sm text-gray-600 mb-3">Haftalık çalışma programınızı belirleyin</p>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <a href="/business-register">Düzenle</a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessDashboard;
