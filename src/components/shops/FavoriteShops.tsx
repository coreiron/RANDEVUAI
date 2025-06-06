import React, { useState, useEffect } from 'react';
import { Search, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/authContext';
import { toast } from '@/components/ui/sonner';
import { getFavoriteShops, removeFromFavorites } from '@/lib/services/shopService';
import { Shop } from '@/types/Shop';
import ShopCard from '@/components/shops/ShopCard';
import { useNavigate } from 'react-router-dom';

const FavoriteShops = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [favoriteShops, setFavoriteShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [useTestData, setUseTestData] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated || useTestData) {
      fetchFavoriteShops();
    }
  }, [isAuthenticated, useTestData, currentUser]);

  const fetchFavoriteShops = async () => {
    try {
      setLoading(true);

      if (useTestData) {
        try {
          const { getFavoriteShops: getTestFavoriteShops } = require('@/lib/services/testDataService');
          const shops = getTestFavoriteShops();
          // Sort by most recently added (simulate with random date)
          const sortedShops = shops.sort((a: any, b: any) => {
            // Simulate addedToFavorites timestamp
            const aTime = a.addedToFavorites || Date.now() - Math.random() * 1000000;
            const bTime = b.addedToFavorites || Date.now() - Math.random() * 1000000;
            return bTime - aTime; // Most recent first
          });
          setFavoriteShops(sortedShops);
          setFilteredShops(sortedShops);
        } catch (error) {
          console.error("Test verileri yüklenirken hata:", error);
          setFavoriteShops([]);
          setFilteredShops([]);
        }
      } else if (isAuthenticated && currentUser?.uid) {
        const shops = await getFavoriteShops(currentUser.uid);
        // Sort by most recently added to favorites
        const sortedShops = shops.sort((a: any, b: any) => {
          const aTime = a.addedToFavorites?.toDate ? a.addedToFavorites.toDate().getTime() : 0;
          const bTime = b.addedToFavorites?.toDate ? b.addedToFavorites.toDate().getTime() : 0;
          return bTime - aTime; // Most recent first
        });
        setFavoriteShops(sortedShops);
        setFilteredShops(sortedShops);
      }
    } catch (error) {
      console.error("Favori işletmeler getirilirken hata:", error);
      toast.error("Favori işletmelerin yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = favoriteShops.filter(shop =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shop.category && shop.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredShops(filtered);
  };

  const handleRemoveFavorite = async (shopId: string) => {
    try {
      if (!useTestData && isAuthenticated && currentUser?.uid) {
        await removeFromFavorites(currentUser.uid, shopId);
      }

      const updatedShops = favoriteShops.filter(shop => shop.id !== shopId);
      setFavoriteShops(updatedShops);
      setFilteredShops(updatedShops.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.category && shop.category.toLowerCase().includes(searchQuery.toLowerCase()))
      ));

      toast.success("İşletme favorilerden çıkarıldı");
    } catch (error) {
      console.error("Favori kaldırma hatası:", error);
      toast.error("İşletmeyi favorilerden çıkarırken bir hata oluştu");
    }
  };

  const handleShopClick = (shopId: string) => {
    console.log("Navigating to shop:", shopId);
    navigate(`/shops/${shopId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-appointme-primary border-t-transparent"></div>
      </div>
    );
  }

  if (filteredShops.length === 0) {
    return (
      <div className="text-center py-10">
        <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Henüz favori işletmeniz yok</h3>
        <p className="text-gray-600 mb-4">İşletmeleri inceleyerek favorilerinize ekleyebilirsiniz.</p>
        <Button onClick={() => navigate('/shops')}>İşletmeleri Keşfet</Button>

        <div className="mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setUseTestData(!useTestData);
              if (!useTestData) {
                toast.info("Test verileri kullanılıyor");
              } else {
                toast.info("Gerçek veriler kullanılıyor");
              }
              fetchFavoriteShops();
            }}
          >
            {useTestData ? "Gerçek verileri kullan" : "Test verilerini kullan"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Favori işletmelerde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShops.map(shop => (
          <div key={shop.id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-white/80 text-red-500 hover:text-red-600 hover:bg-white/90"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFavorite(shop.id);
              }}
            >
              <Heart className="h-5 w-5 fill-current" />
            </Button>
            <div
              onClick={() => handleShopClick(shop.id)}
              className="cursor-pointer"
            >
              <ShopCard shop={{
                ...shop,
                images: shop.images || {},
                image: shop.image || '',
                imageUrl: shop.imageUrl || '',
                photoURL: shop.photoURL || '',
              }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button
          variant="outline"
          onClick={() => {
            setUseTestData(!useTestData);
            if (!useTestData) {
              toast.info("Test verileri kullanılıyor");
            } else {
              toast.info("Gerçek veriler kullanılıyor");
            }
            fetchFavoriteShops();
          }}
        >
          {useTestData ? "Gerçek verileri kullan" : "Test verilerini kullan"}
        </Button>
      </div>
    </div>
  );
};

export default FavoriteShops;
