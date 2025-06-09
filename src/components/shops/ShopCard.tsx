import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shop } from '@/types/Shop';
import { MapPin, Clock, Star } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ShopCardProps {
  shop: Shop;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  // Bugünün haftanın hangi günü olduğunu bul
  const today = format(new Date(), 'EEEE', { locale: tr }).toLowerCase();

  // İşletmenin bugün açık olup olmadığını kontrol et
  const isOpenToday = shop.workingHours &&
    shop.workingHours[today] &&
    shop.workingHours[today].open !== null;

  // Bugünün çalışma saatlerini formatlı şekilde göster
  const getTodayHours = () => {
    if (!isOpenToday) return "Bugün Kapalı";

    const hours = shop.workingHours![today];
    return `${hours.open} - ${hours.close}`;
  };

  // Kapsamlı resim URL kontrolü
  const getShopImageUrl = () => {
    const possibleImages = [
      shop.photoURL,
      shop.images?.main,
      shop.images?.logo,
      shop.images?.thumbnail,
      shop.image,
      shop.imageUrl,
      shop.mainImage,
      shop.logo,
      shop.avatar,
      shop.picture,
      shop.photo
    ];

    // İlk geçerli resim URL'sini bul
    const validImage = possibleImages.find(url =>
      url &&
      typeof url === 'string' &&
      url.trim() !== '' &&
      url !== '/placeholder.svg' &&
      !url.includes('undefined') &&
      !url.includes('null') &&
      (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:'))
    );

    console.log(`🖼️ ShopCard - Shop ${shop.name} image resolution:`, {
      shopId: shop.id,
      availableImages: possibleImages.filter(Boolean),
      selectedImage: validImage || '/placeholder.svg'
    });

    return validImage || '/placeholder.svg';
  };

  const shopImageUrl = getShopImageUrl();

  // Rating değerini düzgün şekilde al
  const rating = typeof shop.rating === 'number'
    ? { average: shop.rating, count: 0 }
    : (shop.rating || { average: 0, count: 0 });

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="relative h-40 overflow-hidden">
        <img
          src={shopImageUrl}
          alt={shop.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />

        <div className="absolute top-2 right-2">
          {shop.isVerified && (
            <Badge className="bg-appointme-primary">Onaylı İşletme</Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="font-bold">{shop.name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {shop.location.district || shop.location.city || "Konum bilgisi yok"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2 flex-grow">
        <div className="flex items-center mb-2 text-sm">
          <Star className="h-4 w-4 text-yellow-400 mr-1" />
          <span className="font-medium">{rating.average.toFixed(1)}</span>
          <span className="text-gray-600 ml-1">({rating.count} değerlendirme)</span>
        </div>

        {shop.workingHours && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-3 w-3 mr-1" />
            {getTodayHours()}
          </div>
        )}

        {shop.shortDescription && (
          <p className="mt-2 text-sm line-clamp-2">{shop.shortDescription}</p>
        )}
      </CardContent>

      <CardFooter className="pt-0 mt-auto">
        <Button variant="outline" className="w-full" asChild>
          <Link to={`/shops/${shop.id}`}>İşletmeyi Gör</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShopCard;
