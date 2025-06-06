import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/lib/authContext';
import { addDoc, collection, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebase/schema';
import { Plus, Minus, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner';
import ImageUploader from '@/components/profile/ImageUploader';
import { shopApi } from '@/lib/api/shopApi';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface Service {
  name: string;
  description: string;
  duration: number;
  price: number;
  photoURL?: string;
}

interface Staff {
  name: string;
  title: string;
  specialties: string[];
  photoURL?: string;
}

interface WorkingHours {
  [key: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

const BusinessRegister = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, isEmailVerified, loading, refreshUser, isAuthenticated, isBusiness } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBusinessData, setIsLoadingBusinessData] = useState(false);
  const [existingShop, setExistingShop] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Business Info
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');

  // Contact Info
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  // Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');

  // Working Hours
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { open: '09:00', close: '18:00', isOpen: true },
    tuesday: { open: '09:00', close: '18:00', isOpen: true },
    wednesday: { open: '09:00', close: '18:00', isOpen: true },
    thursday: { open: '09:00', close: '18:00', isOpen: true },
    friday: { open: '09:00', close: '18:00', isOpen: true },
    saturday: { open: '09:00', close: '17:00', isOpen: true },
    sunday: { open: '10:00', close: '16:00', isOpen: false }
  });

  // Services
  const [services, setServices] = useState<Service[]>([
    { name: '', description: '', duration: 60, price: 0 }
  ]);

  // Staff
  const [staff, setStaff] = useState<Staff[]>([
    { name: '', title: '', specialties: [], photoURL: undefined }
  ]);

  const [photoURL, setPhotoURL] = useState<string | null>(null);

  const categories = [
    { value: "beauty", label: "Güzellik & Bakım" },
    { value: "health", label: "Sağlık" },
    { value: "fitness", label: "Fitness" },
    { value: "automotive", label: "Otomotiv" },
    { value: "education", label: "Eğitim" },
    { value: "food", label: "Yeme İçme" }
  ];

  const days = [
    { key: 'monday', label: 'Pazartesi' },
    { key: 'tuesday', label: 'Salı' },
    { key: 'wednesday', label: 'Çarşamba' },
    { key: 'thursday', label: 'Perşembe' },
    { key: 'friday', label: 'Cuma' },
    { key: 'saturday', label: 'Cumartesi' },
    { key: 'sunday', label: 'Pazar' }
  ];

  // Mevcut işletme bilgilerini yükle
  const loadExistingBusinessData = async () => {
    if (!currentUser) return;

    try {
      setIsLoadingBusinessData(true);
      console.log("🔍 Checking for existing business data...");

      const response = await shopApi.getUserShops();

      if (response.success && response.data && response.data.length > 0) {
        const shop = response.data[0]; // İlk işletmeyi al
        console.log("✅ Found existing business:", shop);

        setExistingShop(shop);
        setIsEditMode(true);

        // Form alanlarını doldur
        setBusinessName(shop.name || '');
        setCategory(shop.category || '');
        setDescription(shop.description || '');
        setShortDescription(shop.shortDescription || '');
        setPhotoURL(shop.photoURL || null);

        // İletişim bilgileri
        if (shop.contact) {
          setPhone(shop.contact.phone || userProfile?.phoneNumber || '');
          setEmail(shop.contact.email || currentUser.email || '');
          setWebsite(shop.contact.website || '');
        }

        // Konum bilgileri
        if (shop.location) {
          setAddress(shop.location.address || '');
          setCity(shop.location.city || '');
          setDistrict(shop.location.district || '');
        }

        // Çalışma saatleri
        if (shop.workingHours) {
          setWorkingHours(shop.workingHours);
        }

        // Hizmetler
        if (shop.services && shop.services.length > 0) {
          setServices(shop.services);
        } else {
          // Minimum bir hizmet alanı olması için
          setServices([{ name: '', description: '', duration: 60, price: 0 }]);
        }

        // Personel
        if (shop.staff && shop.staff.length > 0) {
          setStaff(shop.staff);
        } else {
          // Minimum bir personel alanı olması için
          setStaff([{ name: '', title: '', specialties: [], photoURL: undefined }]);
        }

        toast.success("Mevcut işletme bilgileri yüklendi. Düzenleme modunda çalışıyorsunuz.");
      } else {
        console.log("ℹ️ No existing business found, creating new one");
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("❌ Error loading existing business data:", error);
      toast.error("Mevcut işletme bilgileri yüklenirken hata oluştu");
    } finally {
      setIsLoadingBusinessData(false);
    }
  };

  // User profile'dan telefon numarasını yükle ve mevcut işletme verilerini kontrol et
  useEffect(() => {
    if (userProfile?.phoneNumber) {
      setPhone(userProfile.phoneNumber);
    }
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }

    // Mevcut işletme bilgilerini yükle
    loadExistingBusinessData();
  }, [userProfile, currentUser]);

  const addService = () => {
    setServices([...services, { name: '', description: '', duration: 60, price: 0 }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const addStaff = () => {
    setStaff([...staff, { name: '', title: '', specialties: [], photoURL: undefined }]);
  };

  const removeStaff = (index: number) => {
    setStaff(staff.filter((_, i) => i !== index));
  };

  const updateStaff = (index: number, field: keyof Staff, value: string | string[]) => {
    const updated = [...staff];
    updated[index] = { ...updated[index], [field]: value };
    setStaff(updated);
  };

  const updateWorkingHours = (day: string, field: string, value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const updateServiceImage = (index: number, url: string) => {
    setServices(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], photoURL: url };
      return updated;
    });
  };

  const updateStaffImage = (index: number, url: string) => {
    setStaff(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], photoURL: url };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Giriş yapmanız gerekiyor");
      return;
    }

    // Kullanıcı tipini kontrol et
    console.log("Current user profile:", userProfile);
    console.log("User type:", userProfile?.userType);

    if (!userProfile || userProfile.userType !== 'business') {
      toast.error("Bu işlem sadece işletme hesapları için geçerlidir. Lütfen işletme hesabıyla giriş yapın.");
      return;
    }

    if (!isEmailVerified) {
      toast.error("İşletme bilgilerini kaydetmek için önce e-posta adresinizi doğrulamanız gerekiyor");
      return;
    }

    if (!businessName || !category || !phone || !address) {
      toast.error("Lütfen gerekli alanları doldurun");
      return;
    }

    setIsLoading(true);
    try {
      console.log(isEditMode ? "Updating business with data:" : "Creating business with data:", {
        name: businessName,
        category,
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email
      });

      // Boş olmayan servisleri filtrele
      const validServices = services
        .filter(service => service.name && service.name.trim() !== '')
        .map(service => ({
          ...service,
          photoURL: service.photoURL || null
        }));

      // Boş olmayan personeli filtrele
      const validStaff = staff
        .filter(member => member.name && member.name.trim() !== '')
        .map(member => ({
          ...member,
          photoURL: member.photoURL || null
        }));

      console.log("📊 Valid Services to save:", validServices);
      console.log("📊 Valid Staff to save:", validStaff);
      console.log("📊 Working Hours to save:", workingHours);

      const businessData = {
        name: businessName,
        category,
        description: description || '',
        location: {
          address: `${address}, ${district}`,
          district,
          city,
          coordinates: null // Koordinat bilgisi şimdilik null
        },
        contact: {
          phone: phone || '',
          email: email || '',
          website: website || ''
        },
        images: {
          main: photoURL || '/placeholder.svg',
          gallery: []
        },
        photoURL: photoURL || '/placeholder.svg', // Business hesap resmi için
        workingHours: workingHours || {},
        services: validServices,
        staff: validStaff,
        isActive: true,
        rating: { average: 0, count: 0 },
        verified: false,
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email,
        updatedAt: new Date()
      };

      // Edit mode'da createdAt eklemeyelim, create mode'da ekleyelim
      if (!isEditMode) {
        (businessData as any).createdAt = new Date();
      }

      console.log("💾 Complete business data to save:", businessData);

      if (isEditMode && existingShop) {
        // Mevcut işletmeyi güncelle
        const shopRef = doc(db, COLLECTIONS.SHOPS, existingShop.id);
        await updateDoc(shopRef, businessData);
        console.log("Business updated successfully:", existingShop.id);
        toast.success("İşletme bilgileri başarıyla güncellendi!");
      } else {
        // Yeni işletme oluştur
        const businessRef = await addDoc(collection(db, COLLECTIONS.SHOPS), businessData);
        console.log("Business created with ID:", businessRef.id);

        // User profile'ını güncelle - işletme setup'ını tamamladığını belirt ve businessId ekle
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          hasCompletedBusinessSetup: true,
          businessId: businessRef.id,
          updatedAt: new Date()
        });

        console.log("User profile updated with business information");
        toast.success("İşletmeniz başarıyla kaydedildi!");
      }

      // Auth context'i yenile
      await refreshUser();

      navigate('/business-dashboard');
    } catch (error) {
      console.error("Error registering/updating business:", error);
      toast.error("İşletme kaydedilirken bir hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (loading || isLoadingBusinessData) {
    return <LoadingSpinner fullPage text={isLoadingBusinessData ? "İşletme bilgileri yükleniyor..." : "Hesap bilgileri kontrol ediliyor..."} />;
  }

  // Sayfa içeriğini direkt göster - ProtectedBusinessRoute zaten koruyor
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EmailVerificationBanner />

      {!isEmailVerified && (
        <Alert className="mx-4 mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>E-posta doğrulama gerekli:</strong> İşletme bilgilerinizi kaydetmek için önce e-posta adresinizi doğrulamanız gerekiyor.
          </AlertDescription>
        </Alert>
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/business-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard'a Dön
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode ? 'İşletme Bilgilerini Düzenle' : 'İşletme Bilgilerini Kaydet'}
          </h1>
          <p className="text-gray-600">
            {isEditMode
              ? 'Mevcut işletme bilgilerinizi güncelleyin'
              : 'İşletmenizi platforma ekleyin ve müşterilerinize ulaşın'
            }
          </p>
          {userProfile?.phoneNumber && (
            <p className="text-sm text-green-600 mt-2">✅ Telefon numarası doğrulandı: {userProfile.phoneNumber}</p>
          )}
          {isEditMode && existingShop && (
            <p className="text-sm text-blue-600 mt-1">ℹ️ Düzenleme modu: {existingShop.name}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Görsel yükleyici */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">İşletme Görseli</label>
            <ImageUploader onUpload={setPhotoURL} folder="shop-images" />
            {photoURL && <img src={photoURL} alt="İşletme" className="w-32 h-32 rounded-lg object-cover mt-2 border" />}
          </div>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">İşletme Adı *</label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="İşletmenizin adı"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kategori *</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kısa Açıklama</label>
                <Input
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="İşletmenizi kısaca tanımlayın"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Detaylı Açıklama</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="İşletmeniz hakkında detaylı bilgi"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Telefon *</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0555 123 45 67"
                    required
                    disabled={!!userProfile?.phoneNumber}
                  />
                  {userProfile?.phoneNumber && (
                    <p className="text-xs text-green-600 mt-1">Doğrulanmış telefon numarası</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">E-posta</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@isletme.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.isletme.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Konum Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Adres *</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Tam adresinizi girin"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Şehir</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="İstanbul"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">İlçe</label>
                  <Input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Kadıköy"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Çalışma Saatleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-24">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={workingHours[key].isOpen}
                        onChange={(e) => updateWorkingHours(key, 'isOpen', e.target.checked)}
                        className="mr-2"
                      />
                      {label}
                    </label>
                  </div>
                  {workingHours[key].isOpen && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={workingHours[key].open}
                        onChange={(e) => updateWorkingHours(key, 'open', e.target.value)}
                        className="w-32"
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={workingHours[key].close}
                        onChange={(e) => updateWorkingHours(key, 'close', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Hizmetler
                <Button type="button" onClick={addService} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Hizmet Ekle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Hizmet {index + 1}</h4>
                    {services.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hizmet Görseli</label>
                    <ImageUploader onUpload={(url) => updateServiceImage(index, url)} folder="service-images" />
                    {service.photoURL && <img src={service.photoURL} alt="Hizmet" className="w-24 h-24 rounded-lg object-cover mt-2 border" />}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Hizmet Adı</label>
                      <Input
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                        placeholder="Saç kesimi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Fiyat (₺)</label>
                      <Input
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(index, 'price', parseInt(e.target.value) || 0)}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Süre (dakika)</label>
                      <Input
                        type="number"
                        value={service.duration}
                        onChange={(e) => updateService(index, 'duration', parseInt(e.target.value) || 0)}
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Açıklama</label>
                      <Input
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        placeholder="Hizmet açıklaması"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Staff */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Personel
                <Button type="button" onClick={addStaff} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Personel Ekle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {staff.map((member, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Personel {index + 1}</h4>
                    {staff.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeStaff(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Personel Görseli</label>
                    <ImageUploader onUpload={(url) => updateStaffImage(index, url)} folder="staff-images" />
                    {member.photoURL && <img src={member.photoURL} alt="Personel" className="w-20 h-20 rounded-full object-cover mt-2 border" />}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Adı Soyadı</label>
                      <Input
                        value={member.name}
                        onChange={(e) => updateStaff(index, 'name', e.target.value)}
                        placeholder="Ahmet Yılmaz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Unvanı</label>
                      <Input
                        value={member.title}
                        onChange={(e) => updateStaff(index, 'title', e.target.value)}
                        placeholder="Berber, Kuaför vb."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isEmailVerified}
              className={!isEmailVerified ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isLoading
                ? (isEditMode ? 'Güncelleniyor...' : 'Kaydediliyor...')
                : (isEditMode ? 'Değişiklikleri Kaydet' : 'İşletmeyi Kaydet')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessRegister;
