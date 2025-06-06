
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowLeft, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getShopsByCategory } from '@/lib/services/testDataService';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState([]);
  
  useEffect(() => {
    if (!category) {
      toast.error('Kategori bulunamadı');
      navigate('/');
      return;
    }
    
    fetchShops();
  }, [category]);
  
  const fetchShops = async () => {
    try {
      setLoading(true);
      
      // Kategori adını doğru formata dönüştür
      const formattedCategory = formatCategory(category);
      
      // Test verilerini kategori bazlı getir
      const categoryShops = getShopsByCategory(formattedCategory);
      
      if (categoryShops && categoryShops.length > 0) {
        setShops(categoryShops);
      } else {
        toast.warning(`${formattedCategory} kategorisinde işletme bulunamadı`);
      }
    } catch (error) {
      console.error("Kategori işletmeleri getirilirken hata:", error);
      toast.error("İşletmeler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  const formatCategory = (categoryParam) => {
    // URL parametresini formatlayarak kategori ismini oluştur
    const categoryMap = {
      'berber': 'Berber',
      'kuafor': 'Kuaför',
      'guzellik-merkezi': 'Güzellik Merkezi',
      'spa': 'Spa',
      'tirnak-bakimi': 'Tırnak Bakımı'
    };
    
    return categoryMap[categoryParam] || categoryParam;
  };
  
  const getCategoryTitle = () => {
    return formatCategory(category);
  };
  
  const handleShopClick = (shopId) => {
    navigate(`/shops/${shopId}`);
  };

  return (
    <div className="pb-20 pt-4">
      <div className="container px-4">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{getCategoryTitle()} İşletmeleri</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm h-64 animate-pulse">
                <div className="bg-gray-200 h-36 w-full"></div>
                <div className="p-4 space-y-2">
                  <div className="bg-gray-200 h-5 w-3/4 rounded"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                  <div className="flex justify-between">
                    <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {shops.map(shop => (
              <div
                key={shop.id}
                onClick={() => handleShopClick(shop.id)}
                className={cn(
                  "bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md cursor-pointer",
                  "transition-all duration-200 hover:-translate-y-1"
                )}
              >
                {shop.isPremium && (
                  <div className="bg-amber-400 text-amber-900 font-medium text-xs py-0.5 px-2 absolute right-0 rounded-bl-lg">
                    Premium
                  </div>
                )}
                <img
                  src={shop.images?.main || shop.imageUrl || "/placeholder.svg"}
                  alt={shop.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg">{shop.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {shop.location?.district && `${shop.location.district}, `}
                    {shop.location?.city}
                  </p>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                      {shop.subcategory || shop.category}
                    </span>
                    <div className="flex items-center">
                      <span className="text-amber-500 mr-1">★</span>
                      <span className="text-sm font-medium">
                        {typeof shop.rating === 'number' 
                          ? shop.rating.toFixed(1)
                          : shop.rating?.average ? shop.rating.average.toFixed(1) : '0.0'}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full mt-3 gap-1"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Randevu Al
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">Bu kategoride işletme bulunamadı.</p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Ana Sayfaya Dön
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
