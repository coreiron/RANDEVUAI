import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getShopsViaApi, searchShopsViaApi } from '@/lib/services/shop/shopApiService';
import { getCategoriesWithCounts } from '@/lib/services/categoryService';
import SearchFilters from '@/components/search/SearchFilters';
import { toast } from '@/components/ui/sonner';

const Shops = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Debounced search function
  const debounceSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchFn: () => void) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(searchFn, 500); // 500ms delay
      };
    })(),
    []
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  // Separate useEffect for search term with debouncing
  useEffect(() => {
    debounceSearch(() => {
      searchShops();
    });
  }, [searchTerm, debounceSearch]);

  // Immediate search for filters (category, city)
  useEffect(() => {
    if (selectedCategory || selectedCity) {
      searchShops();
    }
  }, [selectedCategory, selectedCity]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log("🏪 Loading initial Shops page data via API...");

      const categoriesData = await getCategoriesWithCounts();
      setCategories(categoriesData);

      // İlk yükleme için tüm işletmeleri getir
      await searchShops();

      console.log("✅ Initial shops page data loaded successfully via API");
    } catch (error) {
      console.error('❌ Error loading initial Shops page data via API:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const searchShops = async () => {
    try {
      // Don't show loading for debounced searches
      if (loading === false) {
        // Show subtle loading indicator only for filter changes
        if (selectedCategory || selectedCity) {
          setLoading(true);
        }
      }

      const searchParams = {
        q: searchTerm || undefined,
        category: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined,
        location: selectedCity && selectedCity !== 'all' ? selectedCity : undefined
      };

      console.log("🔍 Searching shops with params:", searchParams);

      const searchResults = await searchShopsViaApi(searchParams);

      console.log("📊 Search results:", searchResults.length);
      setShops(searchResults);

    } catch (error) {
      console.error('❌ Error searching shops via API:', error);
      toast.error('Arama yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleShopClick = (shopId: string) => {
    navigate(`/shops/${shopId}`);
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setSearchTerm('');
  };

  // Manual search trigger for enter key
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchShops();
  };

  if (loading && shops.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">İşletmeler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">İşletmeler</h1>

          {/* Search and Filter */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="İşletme, hizmet veya konum ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200 focus:border-blue-500"
              />
              {loading && searchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Filter className="h-4 w-4" />
              Filtrele
            </Button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4">
              <SearchFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
                onReset={handleResetFilters}
              />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {shops.length} işletme bulundu
            {searchTerm && ` "${searchTerm}" için`}
            {selectedCategory && selectedCategory !== 'all' && (
              ` ${categories.find((c: any) => c.id === selectedCategory)?.name || ''} kategorisinde`
            )}
          </p>
          {shops.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Toplam {shops.length} işletme sistemde kayıtlı (API üzerinden)
            </p>
          )}
        </div>

        {/* Shops Grid */}
        {shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop: any) => (
              <Card
                key={shop.id}
                className="cursor-pointer hover:shadow-lg transition-shadow bg-white border-blue-100"
                onClick={() => handleShopClick(shop.id)}
              >
                <CardContent className="p-0">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={shop.images?.main || shop.image || shop.imageUrl || '/placeholder.svg'}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                    {shop.isPremium && (
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{shop.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{shop.location?.city || shop.address || 'Konum bilgisi yok'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">
                          {shop.rating?.average ? shop.rating.average.toFixed(1) :
                            (typeof shop.rating === 'number' ? shop.rating.toFixed(1) : '5.0')}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({shop.rating?.count || shop.reviewCount || 0} değerlendirme)
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {shop.category || 'Genel'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {shops.length === 0 ? 'Henüz İşletme Bulunamadı' : 'Sonuç Bulunamadı'}
            </h3>
            <p className="text-gray-600 mb-6">
              {shops.length === 0
                ? 'Sistemde henüz aktif işletme bulunmuyor. İlk işletmeyi siz ekleyin!'
                : 'Arama kriterlerinize uygun işletme bulunamadı. Farklı kriterler deneyin.'
              }
            </p>
            <div className="flex gap-4 justify-center">
              {shops.length === 0 ? (
                <Button
                  onClick={() => navigate('/business-register')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  İşletme Ekle
                </Button>
              ) : (
                <Button
                  onClick={handleResetFilters}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Filtreleri Temizle
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shops;
