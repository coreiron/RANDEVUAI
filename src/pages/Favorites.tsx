
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import FavoriteShops from '@/components/shops/FavoriteShops';

const Favorites = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sayfa yüklendiğinde kısa bir yükleme göstergesi
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="pb-20 pt-4 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
        <div className="px-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="text-appointme-primary" />
            <h1 className="text-2xl font-bold">Favorilerim</h1>
          </div>
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-appointme-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Giriş yapmamış kullanıcılar için
    return (
      <div className="pb-20 pt-4 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
        <div className="px-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="text-appointme-primary" />
            <h1 className="text-2xl font-bold">Favorilerim</h1>
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-center bg-white shadow-md rounded-lg">
            <div className="w-40 h-40 mb-6 text-appointme-primary">
              <Heart size={160} strokeWidth={1} />
            </div>
            <h2 className="text-xl font-semibold mb-2">Favorileri görmek için giriş yapmalısınız</h2>
            <p className="text-gray-600 mb-6">
              Favori işletmelerinize erişmek için lütfen giriş yapın.
            </p>
            <button 
              className="px-6 py-2 bg-appointme-primary text-white rounded-full hover:bg-appointme-secondary transition-colors"
              onClick={() => navigate('/login')}
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-4 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      <div className="px-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="text-appointme-primary" />
          <h1 className="text-2xl font-bold">Favorilerim</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <FavoriteShops />
        </div>
      </div>
    </div>
  );
};

export default Favorites;
