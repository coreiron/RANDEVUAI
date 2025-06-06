
import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import UserReviews from '@/components/reviews/UserReviews';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Comments = () => {
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
      <div className="page-container">
        <div className="px-4 max-w-4xl mx-auto">
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-appointme-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="px-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="text-appointme-primary" />
            <h1 className="text-2xl font-bold">Yorumlarım</h1>
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-center bg-white shadow-md rounded-lg">
            <div className="w-40 h-40 mb-6 text-appointme-primary">
              <MessageSquare size={160} strokeWidth={1} />
            </div>
            <h2 className="text-xl font-semibold mb-2">Yorumları görmek için giriş yapmalısınız</h2>
            <p className="text-gray-600 mb-6">
              Yorum geçmişinize erişmek için lütfen giriş yapın.
            </p>
            <Link 
              to="/login"
              className="px-6 py-2 bg-appointme-primary text-white rounded-full hover:bg-appointme-secondary transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="px-4 max-w-4xl mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="text-appointme-primary" />
          <h1 className="text-2xl font-bold">Yorumlarım</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <UserReviews />
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/shops">
              Yeni Yorum Yapmak İçin İşletmeleri Keşfedin
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Comments;
