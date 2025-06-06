import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { getShopsViaApi } from '@/lib/services/shop/shopApiService';
import { useAuth } from '@/lib/authContext';
import { toast } from '@/components/ui/sonner';
import { getCategoriesWithCounts } from '@/lib/services/categoryService';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [featuredShops, setFeaturedShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Featured business images
  const businessImages = [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=500',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
    'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=500',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("🏠 Loading Home page data via API...");

      const [shopsData, categoriesData] = await Promise.all([
        getShopsViaApi(),
        getCategoriesWithCounts()
      ]);

      console.log("📊 Shops loaded via API:", shopsData.length);
      console.log("📂 Categories loaded:", categoriesData.length);

      // Featured shops - en yüksek puana sahip ilk 6 işletme
      const sortedShops = shopsData
        .filter((shop: any) => shop.rating?.average > 0)
        .sort((a: any, b: any) => (b.rating?.average || 0) - (a.rating?.average || 0))
        .slice(0, 6);

      console.log("⭐ Featured shops found:", sortedShops.length);

      if (sortedShops.length === 0) {
        console.log("🔄 No featured shops, getting top shops");
        // Eğer puanlı işletme yoksa, ilk 6 işletmeyi al
        const topShops = shopsData.slice(0, 6);
        setFeaturedShops(topShops);
        console.log("✨ Final featured shops count:", topShops.length);
      } else {
        setFeaturedShops(sortedShops);
        console.log("✨ Final featured shops count:", sortedShops.length);
      }

      setCategories(categoriesData);

      console.log("✅ Home page data loaded successfully via API");
    } catch (error) {
      console.error('❌ Error loading Home page data via API:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/shops?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/shops');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  const handleShopClick = (shopId: string) => {
    navigate(`/shops/${shopId}`);
  };

  const handleAppointmentsClick = () => {
    navigate('/appointments');
  };

  const stats = [
    { icon: <Users className="h-6 w-6" />, value: "10,000+", label: "Kullanıcı" },
    { icon: <Calendar className="h-6 w-6" />, value: "50,000+", label: "Randevu" },
    { icon: <Star className="h-6 w-6" />, value: "4.8", label: "Ortalama Puan" },
    { icon: <TrendingUp className="h-6 w-6" />, value: "98%", label: "Memnuniyet" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ana sayfa yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Randevu Al, Zamanını Planla
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Güzellik salonu, berber, doktor, fitness antrenörü ve daha fazlası için
            kolayca randevu alın. Hızlı, güvenli ve ücretsiz!
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Hizmet, işletme veya konum ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={handleSearch}
                size="lg"
                className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
              >
                Ara
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Button
              variant="outline"
              onClick={() => navigate('/shops')}
              className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
            >
              Tüm İşletmeler
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant="outline"
                  onClick={handleAppointmentsClick}
                  className="bg-white/80 backdrop-blur-sm border-green-200 hover:bg-green-50"
                >
                  Randevularım
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/favorites')}
                  className="bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-purple-50"
                >
                  Favorilerim
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-blue-600 flex justify-center mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Popüler Kategoriler
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category: any) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-white border-0 shadow-md"
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{category.count} işletme</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Shops */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Öne Çıkan İşletmeler</h2>
            <Button
              variant="outline"
              onClick={() => navigate('/shops')}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Tümünü Gör
            </Button>
          </div>

          {featuredShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredShops.map((shop: any) => (
                <Card
                  key={shop.id}
                  className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-white border-0 shadow-lg overflow-hidden"
                  onClick={() => handleShopClick(shop.id)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={shop.images?.main || shop.image || '/placeholder.svg'}
                      alt={shop.name}
                      className="w-full h-full object-cover transition-transform hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
                      {shop.category}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{shop.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{shop.location?.district}, {shop.location?.city}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{shop.rating?.average?.toFixed(1) || '0.0'}</span>
                      <span className="text-sm text-gray-500">({shop.rating?.count || 0} değerlendirme)</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {shop.description || 'Kaliteli hizmet için bizi tercih edin.'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Henüz öne çıkan işletme bulunmuyor.</p>
              <Button
                onClick={() => navigate('/shops')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Tüm İşletmeleri Gör
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            İşletme Sahibi misiniz?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            İşletmenizi platforma ekleyin ve daha fazla müşteriye ulaşın
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/business-register')}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            İşletme Kaydet
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
