
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Clock } from 'lucide-react';
import { Service } from '@/types/Shop';
import { cn } from '@/lib/utils';

interface ServiceSelectionProps {
  services: Service[];
  selectedService: string | null;
  onServiceSelect: (serviceId: string) => void;
  className?: string;
}

export const ServiceSelection = ({
  services,
  selectedService,
  onServiceSelect,
  className
}: ServiceSelectionProps) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-md p-5", className)}>
      <h3 className="font-bold text-lg mb-4 text-appointme-primary">Hizmet Seçin</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {services.map(service => (
          <Button
            key={service.id}
            variant="outline"
            className={cn(
              "flex justify-between items-center h-auto p-3 border rounded-lg w-full text-left",
              selectedService === service.id 
                ? "border-appointme-primary bg-appointme-primary/10" 
                : "hover:border-appointme-primary"
            )}
            onClick={() => onServiceSelect(service.id)}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">{service.name}</span>
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" /> {service.duration}
              </span>
            </div>
            
            <div className="flex items-center">
              {service.price && (
                <span className="font-bold text-appointme-primary mr-2">{service.price.toLocaleString('tr-TR')} ₺</span>
              )}
              
              {selectedService === service.id && (
                <div className="bg-appointme-primary text-white rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
