import React, { useState, useEffect } from 'react';
import { getShopServices } from '@/lib/firebase/firestoreUtils';
import { ServiceSchema } from '@/lib/firebase/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';

interface ServicesViewProps {
  shopId: string;
  onSelectService?: (service: ServiceSchema) => void;
  selectedServiceId?: string;
  showBookButton?: boolean;
}

const ServicesView: React.FC<ServicesViewProps> = ({
  shopId,
  onSelectService,
  selectedServiceId,
  showBookButton = false
}) => {
  const [services, setServices] = useState<ServiceSchema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const servicesData = await getShopServices(shopId);
        setServices(servicesData);
      } catch (error) {
        console.error("Error loading services:", error);
        toast.error("Hizmetler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      loadServices();
    }
  }, [shopId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Bu işletme için hizmet bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <Card
          key={service.id}
          className={selectedServiceId === service.id ? "border-appointme-primary" : ""}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              {service.photoURL ? (
                <img src={service.photoURL} alt={service.name} className="w-16 h-16 rounded-lg object-cover border" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border">
                  <span className="text-2xl">🖼️</span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  {service.discountedPrice && service.discountedPrice < service.price && (
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300">
                      İndirimli!
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-3 w-3" /> {service.duration} dakika
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            {service.description && (
              <p className="text-sm text-gray-600 mb-2">{service.description}</p>
            )}

            <div className="flex items-center mt-2">
              <p className="font-medium">
                {service.discountedPrice ? (
                  <>
                    <span className="text-red-600">{service.discountedPrice} TL</span>
                    <span className="line-through text-gray-400 ml-2 text-sm">{service.price} TL</span>
                  </>
                ) : (
                  <span>{service.price} TL</span>
                )}
              </p>
            </div>
          </CardContent>

          {(onSelectService || showBookButton) && (
            <CardFooter className="pt-0">
              <Button
                variant={selectedServiceId === service.id ? "default" : "outline"}
                onClick={() => onSelectService && onSelectService(service)}
                className="w-full"
              >
                {selectedServiceId === service.id ? "Seçildi" : (showBookButton ? "Randevu Al" : "Seç")}
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ServicesView;
