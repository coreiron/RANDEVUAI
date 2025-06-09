import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from '@/components/ui/sonner';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Shop } from '@/types/Shop';
import { getShopDetails, getShopStaff, addToFavorites, removeFromFavorites, isShopFavorite, getShopServices } from '@/lib/services/shopService';
import { getAvailableTimesForDate } from '@/lib/appointmentUtils';
import { createAppointmentViaApi } from '@/lib/services/appointment/appointmentApiService';
import { getUserAppointments, getUserAppointmentsViaApi } from '@/lib/services/appointment/appointmentQuery';
import { useAuth } from '@/lib/authContext';
import ServicesView from '@/components/services/ServicesView';
import ReviewsList from '@/components/reviews/ReviewsList';
import ReviewForm from '@/components/reviews/ReviewForm';
import AppointmentOTPDialog from '@/components/appointments/AppointmentOTPDialog';
import { MapPin, Phone, Mail, Clock, Star, Calendar, User, Heart, MessageCircle } from 'lucide-react';
import MessageDialog from '@/components/messaging/MessageDialog';

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [isCreatingAppointment, setCreatingAppointment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  // OTP Dialog states
  const [isOTPDialogOpen, setIsOTPDialogOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [pendingAppointmentData, setPendingAppointmentData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchShopDetails(id);
      checkFavoriteStatus(id);
    } else {
      toast.error("İşletme bilgisi bulunamadı");
      setLoading(false);
    }
  }, [id, currentUser]);

  // Shop verisi yüklendikten sonra services ve staff'ı yükle
  useEffect(() => {
    if (shop && id) {
      fetchStaff(id);
      fetchServices(id);
    }
  }, [shop, id]);

  const fetchShopDetails = async (shopId: string) => {
    try {
      setLoading(true);
      console.log("🏪 Fetching shop details for:", shopId);
      const shopData = await getShopDetails(shopId);
      console.log("🏪 Shop data received:", shopData);

      // Resim debug bilgileri
      console.log("🖼️ Shop image debugging:", {
        shopName: shopData?.name,
        shopId: shopData?.id,
        photoURL: shopData?.photoURL,
        images: shopData?.images,
        imageUrl: shopData?.imageUrl,
        image: shopData?.image,
        mainImage: shopData?.mainImage,
        allImageFields: {
          photoURL: shopData?.photoURL,
          'images.main': shopData?.images?.main,
          'images.logo': shopData?.images?.logo,
          'images.thumbnail': shopData?.images?.thumbnail,
          imageUrl: shopData?.imageUrl,
          image: shopData?.image,
          mainImage: shopData?.mainImage,
          logo: shopData?.logo,
          avatar: shopData?.avatar,
          picture: shopData?.picture,
          photo: shopData?.photo
        }
      });

      if (shopData && shopData.id) {
        setShop(shopData as Shop);
      } else {
        toast.error("İşletme bulunamadı");
      }
    } catch (error) {
      console.error("Error fetching shop details:", error);
      toast.error("İşletme bilgileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async (shopId: string) => {
    try {
      console.log("🔍 Fetching staff for shop:", shopId);

      // SADECE shop verisini kullan - bu sayede tutarlılık sağlanır
      if (shop && shop.staff && Array.isArray(shop.staff)) {
        console.log("👥 Using staff from existing shop data:", shop.staff);
        setStaff(shop.staff);
        return;
      }

      // Shop verisi henüz yüklenmemişse tekrar al
      const shopResponse = await getShopDetails(shopId);

      if (shopResponse && shopResponse.staff && Array.isArray(shopResponse.staff)) {
        console.log("👥 Staff from fresh shop data:", shopResponse.staff);
        setStaff(shopResponse.staff);
      } else {
        console.log("⚠️ No staff data found in shop, setting empty array");
        setStaff([]);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaff([]);
    }
  };

  const fetchServices = async (shopId: string) => {
    try {
      console.log("🔍 Fetching services for shop:", shopId);

      // SADECE shop verisini kullan - bu sayede tutarlılık sağlanır
      if (shop && shop.services && Array.isArray(shop.services)) {
        console.log("🛠️ Using services from existing shop data:", shop.services);
        setServices(shop.services);
        return;
      }

      // Shop verisi henüz yüklenmemişse tekrar al
      const shopResponse = await getShopDetails(shopId);

      if (shopResponse && shopResponse.services && Array.isArray(shopResponse.services)) {
        console.log("🛠️ Services from fresh shop data:", shopResponse.services);
        setServices(shopResponse.services);
      } else {
        console.log("⚠️ No services data found in shop, setting empty array");
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  const checkFavoriteStatus = async (shopId: string) => {
    if (!currentUser) return;

    try {
      console.log("🔍 Checking favorite status for shop:", shopId, "user:", currentUser.uid);
      const favoriteStatus = await isShopFavorite(currentUser.uid, shopId);
      console.log("✅ Favorite status result:", favoriteStatus);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error("❌ Error checking favorite status:", error);
      // Firebase permission hatası durumunda favorisini false olarak kabul et
      setIsFavorite(false);
      // Sadece geliştiriciler için hata göster, kullanıcıyı rahatsız etme
      console.warn("Favori durumu kontrol edilemedi, varsayılan olarak false kabul ediliyor");
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !currentUser || !shop) {
      toast.error("Favorilere eklemek için giriş yapmalısınız");
      return;
    }

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await removeFromFavorites(currentUser.uid, shop.id);
        setIsFavorite(false);
        toast.success("İşletme favorilerden çıkarıldı");
      } else {
        // Check if already in favorites to prevent duplicates
        const alreadyFavorite = await isShopFavorite(currentUser.uid, shop.id);
        if (alreadyFavorite) {
          toast.info("Bu işletme zaten favorilerinizde");
          setIsFavorite(true);
          return;
        }

        await addToFavorites(currentUser.uid, shop.id);
        setIsFavorite(true);
        toast.success("İşletme favorilere eklendi");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Favori işlemi sırasında bir hata oluştu");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes

    if (date && id) {
      try {
        const times = await getAvailableTimesForDate(date, id);
        setAvailableTimes(times);
      } catch (error) {
        console.error("Error fetching available times:", error);
        setAvailableTimes([]);
      }
    } else {
      setAvailableTimes([]);
    }
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const checkExistingAppointment = async (date: Date, time: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // API kullanarak kullanıcının randevularını al
      const userAppointments = await getUserAppointmentsViaApi();

      // Check if user already has an appointment at the same time
      const appointmentDateTime = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const hasConflict = userAppointments.some((appointment: any) => {
        // Sadece iptal edilmemiş randevuları kontrol et
        if (appointment.status === 'canceled') return false;

        const existingDate = appointment.date instanceof Date ?
          appointment.date :
          (appointment.date?.toDate ? appointment.date.toDate() : new Date(appointment.date));

        return Math.abs(existingDate.getTime() - appointmentDateTime.getTime()) < 60000; // Within 1 minute
      });

      console.log("🕐 Checking appointment conflict:", {
        selectedDateTime: appointmentDateTime,
        existingAppointments: userAppointments.length,
        hasConflict
      });

      return hasConflict;
    } catch (error) {
      console.error("Error checking existing appointments:", error);
      return false; // Hata durumunda randevu oluşturmaya izin ver
    }
  };

  const handleCreateAppointment = async () => {
    if (!isAuthenticated || !currentUser) {
      toast.error("Randevu oluşturmak için giriş yapmalısınız");
      return;
    }

    if (!shop || !selectedService || !selectedDate || !selectedTime) {
      toast.error("Lütfen tüm randevu bilgilerini doldurun");
      return;
    }

    try {
      setCreatingAppointment(true);

      // Check for existing appointment at the same time
      const hasConflict = await checkExistingAppointment(selectedDate, selectedTime);
      if (hasConflict) {
        toast.error("Bu saatte zaten bir randevunuz var. Lütfen farklı bir saat seçin.");
        return;
      }

      console.log("Creating appointment via API:");
      console.log("- User:", currentUser.uid);
      console.log("- Shop:", shop.id);
      console.log("- Service:", selectedService.id);
      console.log("- Date:", selectedDate);
      console.log("- Time:", selectedTime);

      const appointmentData = {
        shopId: shop.id,
        serviceId: selectedService.id,
        date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD format
        time: selectedTime,
        notes: notes,
        price: selectedService.discountedPrice || selectedService.price,
        staffId: selectedStaff?.id,
      };

      console.log("Creating appointment via API:", appointmentData);

      // Create appointment via API
      const result = await createAppointmentViaApi(appointmentData);

      if (result) {
        // Reset form after successful appointment creation
        setSelectedService(null);
        setSelectedDate(undefined);
        setSelectedTime('');
        setNotes('');
        setSelectedStaff(null);
        setIsDialogOpen(false);

        toast.success("Randevu başarıyla oluşturuldu! Randevularınızı görüntülemek için yönlendiriliyorsunuz...");

        // 2 saniye sonra randevular sayfasına yönlendir
        setTimeout(() => {
          navigate('/appointments');
        }, 2000);
      } else {
        toast.error("Randevu oluşturulamadı");
      }
    } catch (error) {
      console.error("❌ Error creating appointment:", error);
      toast.error("Randevu oluşturulurken bir hata oluştu: " + (error as Error).message);
    } finally {
      setCreatingAppointment(false);
    }
  };

  const handleOTPSuccess = () => {
    // Reset form after successful appointment creation
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setNotes('');
    setSelectedStaff(null);
    setPendingAppointmentData(null);
    setOtpEmail('');
    setIsOTPDialogOpen(false);

    toast.success("Randevunuz başarıyla oluşturuldu ve onaylandı!");
  };

  const handleOTPCancel = () => {
    setIsOTPDialogOpen(false);
    setPendingAppointmentData(null);
    setOtpEmail('');
    toast.info("Randevu oluşturma işlemi iptal edildi");
  };

  const handleMessageClick = () => {
    if (!isAuthenticated || !currentUser) {
      toast.error("Mesaj göndermek için giriş yapmalısınız");
      return;
    }
    setIsMessageDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container max-w-6xl py-10 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container max-w-6xl py-10 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">İşletme Bulunamadı</h1>
        <p className="mb-6">İstediğiniz işletme bilgilerine ulaşılamadı.</p>
        <Button asChild>
          <a href="/shops">İşletmelere Dön</a>
        </Button>
      </div>
    );
  }

  const today = format(new Date(), 'EEEE', { locale: tr }).toLowerCase();
  const isOpenToday = shop.workingHours &&
    shop.workingHours[today] &&
    shop.workingHours[today].open !== null;

  const rating = typeof shop.rating === 'number'
    ? { average: shop.rating, count: 0 }
    : shop.rating || { average: 0, count: 0 };

  const getShopImageUrl = () => {
    const possibleImages = [
      shop?.photoURL,
      shop?.images?.main,
      shop?.images?.logo,
      shop?.images?.thumbnail,
      shop?.image,
      shop?.imageUrl,
      shop?.mainImage,
      shop?.logo,
      shop?.avatar,
      shop?.picture,
      shop?.photo
    ];

    console.log(`🖼️ ShopDetail getShopImageUrl - All possible images:`, {
      shopId: shop?.id,
      shopName: shop?.name,
      possibleImages: possibleImages.map((img, index) => ({ index, value: img })),
      validImages: possibleImages.filter(Boolean),
      totalPossible: possibleImages.length,
      totalValid: possibleImages.filter(Boolean).length
    });

    // İlk geçerli resim URL'sini bul
    const validImage = possibleImages.find(url =>
      url &&
      typeof url === 'string' &&
      url.trim() !== '' &&
      url !== '/placeholder.svg' &&
      !url.includes('undefined') &&
      !url.includes('null') &&
      !url.includes('example.com') && // Test URL'lerini geçersiz kabul et
      !url.includes('placeholder') && // Placeholder URL'lerini geçersiz kabul et
      !url.includes('demo') && // Demo URL'lerini geçersiz kabul et
      (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:'))
    );

    const finalImage = validImage || '/placeholder.svg';

    console.log(`🖼️ ShopDetail - Final image resolution:`, {
      shopId: shop?.id,
      shopName: shop?.name,
      selectedImage: validImage,
      finalImage: finalImage,
      fallbackUsed: !validImage
    });

    return finalImage;
  };

  const shopImageUrl = getShopImageUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container max-w-6xl py-8 px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{shop.name}</h1>
              <p className="text-lg text-gray-600">{shop.shortDescription || shop.description?.substring(0, 100)}</p>
            </div>

            <div className="flex gap-2">
              {isAuthenticated && (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleMessageClick}
                    className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Mesaj Gönder
                  </Button>

                  <Button
                    variant={isFavorite ? "default" : "outline"}
                    size="lg"
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                    className={`flex items-center gap-2 ${isFavorite
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "border-red-200 text-red-600 hover:bg-red-50"
                      }`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                    {favoriteLoading ? "..." : (isFavorite ? "Favoriden Çıkar" : "Favoriye Ekle")}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{rating.average.toFixed(1)}</span>
              <span>({rating.count} değerlendirme)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{shop.location?.district}, {shop.location?.city}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {isOpenToday ? (
                  `Açık: ${shop.workingHours?.[today]?.open} - ${shop.workingHours?.[today]?.close}`
                ) : (
                  "Bugün Kapalı"
                )}
              </span>
            </div>
          </div>
        </div>

        {shopImageUrl ? (
          <img
            src={shopImageUrl}
            alt={shop.name}
            className="w-full h-56 object-cover rounded-lg mb-6 border"
            onError={(e) => {
              console.log(`❌ ShopDetail main image failed to load:`, {
                attempted: shopImageUrl,
                shopName: shop?.name,
                shopId: shop?.id
              });
              const imgElement = e.target as HTMLImageElement;
              if (imgElement.src !== '/placeholder.svg') {
                console.log("🔄 Attempting to fallback to placeholder.svg");
                imgElement.src = '/placeholder.svg';
              } else {
                console.log("🚫 Even placeholder.svg failed, showing fallback div");
                // Even placeholder failed, hide the image
                imgElement.style.display = 'none';
                // Show a fallback div
                const parent = imgElement.parentElement;
                if (parent && !parent.querySelector('.fallback-image')) {
                  const fallbackDiv = document.createElement('div');
                  fallbackDiv.className = 'fallback-image w-full h-56 bg-gray-100 rounded-lg mb-6 border flex items-center justify-center text-gray-400';
                  fallbackDiv.innerHTML = '<span class="text-4xl">🖼️</span><span class="ml-2">Resim Yüklenemedi</span>';
                  parent.appendChild(fallbackDiv);
                }
              }
            }}
            onLoad={(e) => {
              const imgElement = e.target as HTMLImageElement;
              console.log(`✅ ShopDetail main image loaded successfully:`, {
                actualLoaded: imgElement.src, // Gerçekte yüklenen URL
                originalAttempt: shopImageUrl, // İlk denenen URL
                shopName: shop?.name,
                shopId: shop?.id,
                isPlaceholder: imgElement.src.includes('placeholder.svg')
              });
            }}
          />
        ) : (
          <div className="w-full h-56 bg-gray-100 rounded-lg mb-6 flex items-center justify-center text-gray-400 border">
            <span className="text-4xl">🖼️</span>
            <span className="ml-2">Resim Bulunamadı</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Card */}
            <Card className="overflow-hidden shadow-lg">
              <div className="relative h-80">
                <img
                  src={shopImageUrl}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">İletişim Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <p className="text-gray-700">{shop.location?.address}, {shop.location?.district}, {shop.location?.city}</p>
                  </div>

                  {shop.contact?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-green-600" />
                      <p className="text-gray-700">{shop.contact.phone}</p>
                    </div>
                  )}

                  {shop.contact?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-red-600" />
                      <p className="text-gray-700">{shop.contact.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Card className="shadow-md">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
                    <TabsTrigger value="services" className="rounded-none">Hizmetler</TabsTrigger>
                    <TabsTrigger value="staff" className="rounded-none">Personel</TabsTrigger>
                    <TabsTrigger value="description" className="rounded-none">Hakkında</TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-none">Yorumlar</TabsTrigger>
                  </TabsList>

                  <div className="p-6">
                    <TabsContent value="services" className="mt-0">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">İşletme Hizmetleri</h3>

                        {services.length > 0 ? (
                          <div className="grid gap-4">
                            {services.map((service, index) => (
                              <Card key={service.id || `service-${index}`} className="border border-gray-200">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-lg">{service.name}</h4>
                                      {service.description && (
                                        <p className="text-gray-600 mt-1">{service.description}</p>
                                      )}
                                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          {service.duration} dakika
                                        </span>
                                        <span className="font-medium text-blue-600">
                                          {service.discountedPrice || service.price} TL
                                        </span>
                                      </div>
                                    </div>
                                    {isAuthenticated && (
                                      <Button
                                        onClick={() => handleServiceSelect(service)}
                                        className="ml-4 bg-blue-600 hover:bg-blue-700"
                                      >
                                        Randevu Al
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">Bu işletme için hizmet bilgisi bulunamadı.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="staff" className="mt-0">
                      <div className="space-y-4">
                        {staff.length > 0 ? (
                          staff.map((staffMember, index) => (
                            <Card key={staffMember.id || `staff-${index}`} className="border border-gray-200">
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-4">
                                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                                    {staffMember.photoURL ? (
                                      <img
                                        src={staffMember.photoURL}
                                        alt={staffMember.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                      />
                                    ) : (
                                      <User className="h-8 w-8 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{staffMember.name}</h3>
                                    {staffMember.title && (
                                      <p className="text-blue-600 font-medium">{staffMember.title}</p>
                                    )}
                                    {staffMember.bio && (
                                      <p className="text-gray-600 mt-1">{staffMember.bio}</p>
                                    )}
                                    {staffMember.specialties && staffMember.specialties.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {staffMember.specialties.map((specialty: string, specialtyIndex: number) => (
                                          <span key={`specialty-${index}-${specialtyIndex}`} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {specialty}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Bu işletme için personel bilgisi bulunamadı.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="description" className="mt-0">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">İşletme Hakkında</h3>
                        {shop.description ? (
                          <p className="text-gray-700 leading-relaxed">{shop.description}</p>
                        ) : (
                          <p className="text-gray-500">Bu işletme için henüz bir açıklama eklenmemiş.</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-0">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Değerlendirmeler</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium text-lg">{rating.average.toFixed(1)}</span>
                            <span className="text-gray-500">({rating.count} değerlendirme)</span>
                          </div>
                        </div>

                        {isAuthenticated ? (
                          <div className="border-b pb-6">
                            <h4 className="text-sm font-medium mb-2">Değerlendirme Yapın</h4>
                            <ReviewForm shopId={id || ''} />
                          </div>
                        ) : (
                          <div className="border-b pb-6 text-center">
                            <p className="text-gray-600 mb-2">Değerlendirme yapmak için giriş yapmalısınız</p>
                            <Button asChild>
                              <a href="/login">Giriş Yap</a>
                            </Button>
                          </div>
                        )}

                        <ReviewsList shopId={id || ''} />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-6 shadow-lg border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Randevu Al
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Hizmet seçerek randevu oluşturun
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {!isAuthenticated ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Randevu oluşturmak için giriş yapmalısınız</p>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                      <a href="/login">Giriş Yap</a>
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3"
                    onClick={() => setActiveTab("services")}
                  >
                    Hizmet Seç ve Randevu Al
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Message Dialog */}
        <MessageDialog
          isOpen={isMessageDialogOpen}
          onClose={() => setIsMessageDialogOpen(false)}
          shop={shop}
        />

        {/* Remove the OTP Verification Dialog */}
        {/* AppointmentOTPDialog component removed */}

        {/* Appointment Booking Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Randevu Oluştur</DialogTitle>
              <DialogDescription>
                Lütfen randevu detaylarını eksiksiz doldurun.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {selectedService ? (
                <div>
                  <Label className="text-sm font-medium">Seçilen Hizmet</Label>
                  <div className="p-4 border rounded-lg mt-2 bg-blue-50 border-blue-200">
                    <p className="font-medium text-blue-900">{selectedService.name}</p>
                    <p className="text-sm text-blue-700 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" /> {selectedService.duration} dakika
                    </p>
                    <p className="text-sm font-medium mt-2 text-blue-800">
                      Ücret: {selectedService.discountedPrice || selectedService.price} TL
                    </p>
                  </div>
                </div>
              ) : null}

              {staff.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Personel Seçimi (İsteğe Bağlı)</Label>
                  <Select onValueChange={(value) => {
                    if (value === "any") {
                      setSelectedStaff(null);
                    } else {
                      setSelectedStaff(staff.find(s => s.id === value) || null);
                    }
                  }}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Personel seçin veya boş bırakın" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Fark etmez</SelectItem>
                      {staff.map((staffMember, index) => (
                        <SelectItem key={staffMember.id || `staff-select-${index}`} value={staffMember.id || `staff-${index}`}>
                          {staffMember.name} {staffMember.title && `- ${staffMember.title}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Tarih Seçimi</Label>
                <div className="mt-2 border rounded-lg p-3">
                  <CalendarUI
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md w-full pointer-events-auto"
                    locale={tr}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </div>
              </div>

              {selectedDate && (
                <div>
                  <Label className="text-sm font-medium">Saat Seçimi</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Saat seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.length > 0 ? (
                        availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-time" disabled>
                          Bu tarih için uygun saat yok
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Notlar (İsteğe Bağlı)</Label>
                <Textarea
                  placeholder="Randevunuzla ilgili özel isteklerinizi yazabilirsiniz..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button
                  onClick={handleCreateAppointment}
                  disabled={!selectedService || !selectedDate || !selectedTime || isCreatingAppointment}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreatingAppointment ? "Oluşturuluyor..." : "Randevu Oluştur"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ShopDetail;
