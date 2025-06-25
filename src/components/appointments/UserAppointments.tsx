import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, CheckCircle, Clock, XCircle, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { cancelAppointmentViaApi } from '@/lib/services/appointment/appointmentApiService';
import { shopApi } from '@/lib/api/shopApi';
import LoadingSpinner from '../ui/loading-spinner';
import AppointmentsError from './AppointmentsError';
import { useAppointments } from '@/hooks/useAppointments';

// Randevu durumlarına göre renkler ve ikonlar
const statusConfig: Record<string, { color: string; icon: JSX.Element }> = {
  confirmed: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="h-4 w-4 text-green-600" />
  },
  pending: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Clock className="h-4 w-4 text-yellow-600" />
  },
  canceled: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="h-4 w-4 text-red-600" />
  },
  completed: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <CheckCircle className="h-4 w-4 text-blue-600" />
  },
  scheduled: {
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: <Calendar className="h-4 w-4 text-purple-600" />
  }
};

const translateStatus = (status: string) => {
  const translations: Record<string, string> = {
    confirmed: 'Onaylandı',
    pending: 'Beklemede',
    canceled: 'İptal Edildi',
    completed: 'Tamamlandı',
    scheduled: 'Planlandı'
  };
  return translations[status] || status;
};

interface UserAppointmentsProps {
  statusFilter?: string;
}

// Shop resimlerini cache'le
const shopImageCache = new Map<string, string>();

const UserAppointments: React.FC<UserAppointmentsProps> = ({ statusFilter = 'all' }) => {
  const [activeTab, setActiveTab] = useState(statusFilter);
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { appointments, loading, error, refetch, refresh } = useAppointments();
  const [canceling, setCanceling] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [shopImages, setShopImages] = useState<Record<string, string>>({});

  useEffect(() => {
    setActiveTab(statusFilter);
  }, [statusFilter]);

  // Randevular yüklendiğinde eksik resimleri al
  useEffect(() => {
    if (appointments.length > 0) {
      fetchMissingShopImages();
    }
  }, [appointments]);

  const fetchMissingShopImages = async () => {
    const appointmentsWithoutImages = appointments.filter(appointment => {
      const hasImage = appointment.shopImage &&
        appointment.shopImage !== "/placeholder.svg" &&
        appointment.shopImage !== "";
      return !hasImage && appointment.shopId;
    });

    console.log(`🔍 Found ${appointmentsWithoutImages.length} appointments without images`);

    for (const appointment of appointmentsWithoutImages) {
      // Cache'den kontrol et
      if (shopImageCache.has(appointment.shopId)) {
        const cachedImage = shopImageCache.get(appointment.shopId)!;
        setShopImages(prev => ({
          ...prev,
          [appointment.shopId]: cachedImage
        }));
        continue;
      }

      try {
        console.log(`🖼️ Fetching image for shop ${appointment.shopId}`);
        const shopResponse = await shopApi.getDetails(appointment.shopId);

        if (shopResponse.success && shopResponse.data) {
          const shopData = shopResponse.data;

          // Farklı resim field'larını dene
          const possibleImages = [
            shopData.images?.main,
            shopData.images?.logo,
            shopData.images?.thumbnail,
            shopData.image,
            shopData.imageUrl,
            shopData.logo,
            shopData.avatar,
            shopData.photo,
            shopData.picture
          ].filter(Boolean);

          const finalImage = possibleImages[0] || "/placeholder.svg";

          // Cache'e ekle
          shopImageCache.set(appointment.shopId, finalImage);

          // State'i güncelle
          setShopImages(prev => ({
            ...prev,
            [appointment.shopId]: finalImage
          }));

          console.log(`✅ Image found for shop ${appointment.shopId}:`, finalImage);
        } else {
          console.warn(`⚠️ Failed to fetch shop details for ${appointment.shopId}`);
          shopImageCache.set(appointment.shopId, "/placeholder.svg");
        }
      } catch (error) {
        console.error(`❌ Error fetching shop image for ${appointment.shopId}:`, error);
        shopImageCache.set(appointment.shopId, "/placeholder.svg");
      }
    }
  };

  console.log("UserAppointments - Current appointments:", appointments);
  console.log("UserAppointments - Shop images:", shopImages);
  console.log("UserAppointments - Loading:", loading);
  console.log("UserAppointments - Error:", error);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      if (!currentUser) {
        toast.error('Lütfen önce giriş yapın');
        return;
      }

      await cancelAppointmentViaApi(appointmentId, 'Kullanıcı tarafından iptal edildi');

      // Randevuları yeniden yükle
      refetch();

      toast.success('Randevu başarıyla iptal edildi');
    } catch (error) {
      console.error('Randevu iptali sırasında hata:', error);
      toast.error('Randevu iptal edilirken bir hata oluştu');
    }
  };

  const formatAppointmentDate = (date: Date | string | any) => {
    if (!date) return '';

    let appointmentDate: Date;

    // Firestore timestamp object (API'den gelirken)
    if (date && typeof date === 'object' && date._seconds) {
      appointmentDate = new Date(date._seconds * 1000);
    }
    // Firestore timestamp (backend'den gelirken)
    else if (date?.toDate) {
      appointmentDate = date.toDate();
    }
    // Timestamp object ise
    else if (date?.seconds) {
      appointmentDate = new Date(date.seconds * 1000);
    }
    // String ise
    else if (typeof date === 'string') {
      appointmentDate = new Date(date);
    }
    // Date object ise
    else if (date instanceof Date) {
      appointmentDate = date;
    }
    else {
      console.warn('Unknown date format:', date);
      return 'Geçersiz tarih';
    }

    return format(appointmentDate, 'dd MMMM yyyy, EEEE', { locale: tr });
  };

  const filteredAppointments = activeTab === 'all'
    ? appointments
    : appointments.filter(a => a.status === activeTab);

  // Randevuları tarihe göre sırala - en yeni en üstte
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    // En yeni randevular en üstte (desc order)
    return dateB.getTime() - dateA.getTime();
  });

  const handleShopClick = (shopId: string) => {
    if (!shopId) {
      console.error("Shop ID is missing");
      toast.error("Geçersiz işletme ID'si");
      return;
    }

    console.log("Navigating to shop:", shopId);
    navigate(`/shops/${shopId}`);
  };

  const handleAppointmentClick = (appointmentId: string) => {
    navigate(`/appointments/${appointmentId}`);
  };

  const handleRetry = () => {
    refetch();
  };

  // Manual refresh fonksiyonu
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
      toast.success("Randevular güncellendi");
    } catch (error) {
      toast.error("Güncelleme sırasında hata oluştu");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Randevularınız yükleniyor..." />;
  }

  if (error) {
    return <AppointmentsError error={error} onRetry={handleRetry} />;
  }

  const renderAppointments = (appointments: any[]) => {
    if (appointments.length === 0) {
      return (
        <div className="text-center py-10">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Bu durumda randevunuz bulunmuyor.</p>
          <Button
            className="mt-4"
            onClick={() => navigate('/shops')}
          >
            Randevu Al
          </Button>
        </div>
      );
    }

    return appointments.map((appointment) => {
      // Kapsamlı resim alma sistemi
      const shopImage = shopImages[appointment.shopId] ||
        appointment.shopImage ||
        appointment.shop?.images?.main ||
        appointment.shop?.images?.logo ||
        appointment.shop?.image ||
        appointment.shop?.imageUrl ||
        appointment.images?.main ||
        appointment.image ||
        appointment.imageUrl ||
        "/placeholder.svg";

      // Debug için detaylı log
      console.log(`🖼️ Appointment ${appointment.id} (${appointment.shopName}) image resolution:`, {
        shopId: appointment.shopId,
        fromShopImages: shopImages[appointment.shopId],
        fromAppointment: appointment.shopImage,
        fromShopData: appointment.shop?.images?.main,
        finalImage: shopImage,
        hasShopImages: Object.keys(shopImages).length > 0,
        allSources: {
          shopImages: shopImages[appointment.shopId],
          appointmentShopImage: appointment.shopImage,
          shopImagesMain: appointment.shop?.images?.main,
          shopImagesLogo: appointment.shop?.images?.logo,
          shopImage: appointment.shop?.image,
          shopImageUrl: appointment.shop?.imageUrl,
          imagesMain: appointment.images?.main,
          image: appointment.image,
          imageUrl: appointment.imageUrl
        }
      });

      return (
        <Card key={appointment.id} className="mb-4 overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
          <div className="flex flex-col md:flex-row">
            {/* İşletme resmi - İyileştirilmiş */}
            <div
              className="w-full md:w-1/4 cursor-pointer relative group"
              onClick={() => handleShopClick(appointment.shopId)}
            >
              <div className="relative h-32 md:h-full overflow-hidden">
                <img
                  src={shopImage}
                  alt={appointment.shopName}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    console.log(`❌ Image failed to load for appointment ${appointment.id}:`, {
                      failed: shopImage,
                      appointmentId: appointment.id,
                      shopId: appointment.shopId,
                      shopName: appointment.shopName
                    });
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                  onLoad={() => {
                    console.log(`✅ Image loaded successfully for appointment ${appointment.id}:`, shopImage);
                  }}
                />
                {/* Loading overlay when image is being fetched */}
                {!shopImages[appointment.shopId] && !appointment.shopImage && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">İşletmeyi Görüntüle</span>
                </div>
              </div>
            </div>

            {/* Randevu detayları */}
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="font-bold text-lg cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleShopClick(appointment.shopId)}
                >
                  {appointment.shopName}
                </h3>
                <Badge className={statusConfig[appointment.status]?.color || 'bg-gray-100 text-gray-800'}>
                  <span className="flex items-center gap-1">
                    {statusConfig[appointment.status]?.icon || <Clock className="h-4 w-4" />}
                    <span>{translateStatus(appointment.status)}</span>
                  </span>
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="font-medium text-blue-600">{appointment.serviceName}</p>
                  {appointment.staffName && (
                    <p className="text-sm text-gray-600">Personel: {appointment.staffName}</p>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="font-medium">{formatAppointmentDate(appointment.date)}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Saat: {appointment.time}</span>
                  <span className="ml-3">({appointment.duration} dakika)</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{appointment.address}</span>
                </div>

                {appointment.notes && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Notlar: </span>
                    <span>{appointment.notes}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <p className="font-semibold text-lg text-blue-600">
                    {appointment.price} TL
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAppointmentClick(appointment.id)}
                    >
                      Detaylar
                    </Button>

                    {appointment.status !== 'canceled' && appointment.status !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="text-red-600 hover:bg-red-50 border-red-200"
                      >
                        İptal Et
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container max-w-4xl py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Randevularım</h1>
            <p className="text-gray-600">Mevcut ve geçmiş randevularınız</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Güncelleniyor...' : 'Yenile'}
            </Button>

            <Button
              onClick={() => navigate('/shops')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Yeni Randevu Al
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">Tümü ({appointments.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Planlandı</TabsTrigger>
            <TabsTrigger value="confirmed">Onaylı</TabsTrigger>
            <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
            <TabsTrigger value="canceled">İptal</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {renderAppointments(sortedAppointments)}
          </TabsContent>
          <TabsContent value="scheduled" className="mt-6">
            {renderAppointments(sortedAppointments)}
          </TabsContent>
          <TabsContent value="confirmed" className="mt-6">
            {renderAppointments(sortedAppointments)}
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            {renderAppointments(sortedAppointments)}
          </TabsContent>
          <TabsContent value="canceled" className="mt-6">
            {renderAppointments(sortedAppointments)}
          </TabsContent>
        </Tabs>

        {appointments.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={refetch}
            >
              Randevuları Yenile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAppointments;
