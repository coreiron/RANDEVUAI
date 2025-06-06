import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface ProtectedBusinessRouteProps {
  children: React.ReactNode;
}

const ProtectedBusinessRoute: React.FC<ProtectedBusinessRouteProps> = ({ children }) => {
  const { isAuthenticated, isBusiness, loading, userProfile } = useAuth();

  // Debug için state değişikliklerini logla
  React.useEffect(() => {
    console.log("ProtectedBusinessRoute State:", {
      isAuthenticated,
      isBusiness,
      userType: userProfile?.userType,
      loading
    });
  }, [isAuthenticated, isBusiness, userProfile, loading]);

  // Yükleme durumu için timeout ekle
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (loading) {
      timeoutId = setTimeout(() => {
        console.error("Yetki kontrolü zaman aşımına uğradı");
        // Timeout durumunda loading'i false yap
        if (loading) {
          console.log("Forcing loading state to false due to timeout");
        }
      }, 10000); // 10 saniye timeout
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

  // Yükleme durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-appointme-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Yetki kontrol ediliyor...</p>
          <p className="text-sm text-gray-500 mt-2">Bu işlem birkaç saniye sürebilir</p>
        </div>
      </div>
    );
  }

  // Giriş yapmamışsa login'e yönlendir
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // İşletme hesabı kontrolü
  const isBusinessUser = isBusiness && userProfile?.userType === 'business';
  console.log("Business user check:", { isBusiness, userType: userProfile?.userType, isBusinessUser });

  if (!isBusinessUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Erişim Engellendi:</strong> Bu sayfa sadece işletme hesapları için geçerlidir.
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => window.history.back()} variant="outline" className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
              <Button
                onClick={() => window.location.href = '/register/business'}
                className="flex-1"
              >
                İşletme Hesabı Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // İşletme hesabıysa içeriği göster
  return <>{children}</>;
};

export default ProtectedBusinessRoute;
