import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, Clock, MapPin, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormattedAppointment } from '@/hooks/useAppointments';
import { useNavigate } from 'react-router-dom';
import AppointmentStatusManager from './AppointmentStatusManager';

interface AppointmentItemProps {
  appointment: FormattedAppointment;
  onCancelClick: (appointment: FormattedAppointment) => void;
  onRefresh?: () => void;
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({ appointment, onCancelClick, onRefresh }) => {
  const navigate = useNavigate();

  const formatAppointmentDate = (date: Date | any) => {
    if (!date) return '';

    let appointmentDate: Date;

    // Firestore timestamp object (API'den gelirken)
    if (date && typeof date === 'object' && date._seconds) {
      appointmentDate = new Date(date._seconds * 1000);
    }
    // Firestore timestamp (backend'den gelirken)
    else if (date?.toDate) {
      appointmentDate = date.toDate();
    }
    // Timestamp object ise
    else if (date?.seconds) {
      appointmentDate = new Date(date.seconds * 1000);
    }
    // String ise
    else if (typeof date === 'string') {
      appointmentDate = new Date(date);
    }
    // Date object ise
    else if (date instanceof Date) {
      appointmentDate = date;
    }
    else {
      console.warn('Unknown date format in AppointmentItem:', date);
      return 'Geçersiz tarih';
    }

    return format(appointmentDate, 'dd MMMM yyyy, EEEE', { locale: tr });
  };

  const handleShopClick = () => {
    if (appointment.shopId) {
      navigate(`/shops/${appointment.shopId}`);
    }
  };

  const handleAppointmentClick = () => {
    navigate(`/appointments/${appointment.id}`);
  };

  const handleStatusChange = (newStatus: string) => {
    // Update local appointment status if needed
    if (onRefresh) {
      onRefresh();
    }
  };

  const shopImage = appointment.shopImage || appointment.shop?.images?.main || appointment.shop?.image || appointment.shop?.imageUrl || "/placeholder.svg";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* İşletme Resmi */}
          <div
            className="w-full md:w-32 h-32 cursor-pointer"
            onClick={handleShopClick}
          >
            <img
              src={shopImage}
              alt={appointment.shopName}
              className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>

          {/* Randevu Detayları */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3
                  className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleShopClick}
                >
                  {appointment.shopName}
                </h3>
                <p className="text-gray-600 font-medium">{appointment.serviceName}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatAppointmentDate(appointment.date)}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{appointment.time} ({appointment.duration} dk)</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="line-clamp-1">{appointment.address}</span>
              </div>

              <div className="flex items-center text-sm font-medium text-gray-800">
                <span>Ücret: {appointment.price} TL</span>
              </div>
            </div>

            {/* Status Manager */}
            <div className="mb-4">
              <AppointmentStatusManager
                appointmentId={appointment.id}
                status={appointment.status}
                onStatusChange={handleStatusChange}
                isBusinessOwner={false}
                canEdit={true}
                onRefresh={onRefresh}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleAppointmentClick}
                className="flex-1 md:flex-none"
              >
                Randevu Detayları
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShopClick}
                className="flex-1 md:flex-none"
              >
                İşletmeyi Görüntüle
              </Button>

              {appointment.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/shops/${appointment.shopId}?tab=reviews&write=true`)}
                  className="flex items-center gap-1 text-yellow-600 hover:bg-yellow-50"
                >
                  <Star className="h-3 w-3" />
                  Değerlendir
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentItem;
