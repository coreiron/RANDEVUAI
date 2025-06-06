
import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Service, Shop } from '@/types/Shop';
import { Clock, Calendar, MapPin, User, CreditCard, MessageSquare } from 'lucide-react';

interface AppointmentSummaryProps {
  shop: Shop;
  selectedService: Service | undefined;
  selectedDate: Date | undefined;
  selectedTime: string | null;
  notes: string;
  className?: string;
}

export const AppointmentSummary = ({
  shop,
  selectedService,
  selectedDate,
  selectedTime,
  notes,
  className
}: AppointmentSummaryProps) => {
  if (!selectedService || !selectedDate || !selectedTime) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-5 ${className}`}>
      <h3 className="font-bold text-lg mb-4 text-appointme-primary">Randevu Özeti</h3>
      
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-blue-50">
          <div className="flex items-start border-b border-blue-100 pb-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
              <User className="h-6 w-6 text-appointme-primary" />
            </div>
            <div>
              <h4 className="font-bold text-appointme-primary">{shop.name}</h4>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" /> 
                {shop.location.district}, {shop.location.city}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>Tarih:</span>
              </div>
              <span className="font-medium">
                {format(selectedDate, 'PPP', { locale: tr })}
              </span>
            </div>
            
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>Saat:</span>
              </div>
              <span className="font-medium">{selectedTime}</span>
            </div>
            
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                <span>Hizmet:</span>
              </div>
              <span className="font-medium">{selectedService.name}</span>
            </div>
            
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>Süre:</span>
              </div>
              <span className="font-medium">{selectedService.duration}</span>
            </div>
            
            <div className="flex justify-between border-t border-blue-100 pt-2 mt-2">
              <div className="flex items-center text-sm font-medium">
                <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                <span>Toplam Tutar:</span>
              </div>
              <span className="font-bold text-appointme-primary">
                {selectedService.price?.toLocaleString('tr-TR')} ₺
              </span>
            </div>
          </div>
          
          {notes && (
            <div className="mt-4 pt-3 border-t border-blue-100">
              <div className="flex items-start">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium mb-1">Notlar:</p>
                  <p className="text-sm bg-white p-2 rounded">{notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
