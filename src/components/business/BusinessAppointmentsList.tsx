import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone, Mail, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BusinessAppointment } from '@/lib/services/appointment/businessAppointmentQuery';
import AppointmentStatusManager from '@/components/appointments/AppointmentStatusManager';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface BusinessAppointmentsListProps {
  appointments: BusinessAppointment[];
  loading: boolean;
  onRefresh: () => void;
}

const BusinessAppointmentsList: React.FC<BusinessAppointmentsListProps> = ({
  appointments,
  loading,
  onRefresh
}) => {
  const [filter, setFilter] = useState<string>('all');

  console.log("🎯 BusinessAppointmentsList received:", {
    appointmentsLength: appointments.length,
    loading,
    filter
  });

  if (appointments.length > 0) {
    console.log("📋 First appointment in list:", appointments[0]);
  }

  if (loading) {
    return <LoadingSpinner fullPage text="Randevular yükleniyor..." />;
  }

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  console.log("🔍 Filtered appointments:", {
    total: appointments.length,
    filtered: filteredAppointments.length,
    filter
  });

  const getStatusCount = (status: string) => {
    return appointments.filter(app => app.status === status).length;
  };

  const formatDate = (date: any): string => {
    try {
      let dateObj: Date;

      if (!date) {
        console.warn('Date is null or undefined');
        return 'Tarih belirtilmemiş';
      }

      // Firestore Timestamp with _seconds and _nanoseconds format
      if (date._seconds !== undefined) {
        dateObj = new Date(date._seconds * 1000);
      }
      // Regular Firestore Timestamp object with toDate method
      else if (date.toDate && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      }
      // Regular Date object
      else if (date instanceof Date) {
        dateObj = date;
      }
      // String or number date
      else if (typeof date === 'string' || typeof date === 'number') {
        dateObj = new Date(date);
      }
      else {
        console.error('Invalid date format:', date);
        return 'Geçersiz tarih';
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date value:', date);
        return 'Geçersiz tarih';
      }

      return dateObj.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Tarih hatası';
    }
  };

  const formatTime = (date: any): string => {
    try {
      let dateObj: Date;

      if (!date) {
        console.warn('Time is null or undefined');
        return 'Saat belirtilmemiş';
      }

      // Firestore Timestamp with _seconds and _nanoseconds format
      if (date._seconds !== undefined) {
        dateObj = new Date(date._seconds * 1000);
      }
      // Regular Firestore Timestamp object with toDate method
      else if (date.toDate && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      }
      // Regular Date object
      else if (date instanceof Date) {
        dateObj = date;
      }
      // String or number date
      else if (typeof date === 'string' || typeof date === 'number') {
        dateObj = new Date(date);
      }
      else {
        console.error('Invalid time format:', date);
        return 'Geçersiz saat';
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid time value:', date);
        return 'Geçersiz saat';
      }

      return dateObj.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting time:', error, date);
      return 'Saat hatası';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="relative"
        >
          Tümü
          <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
            {appointments.length}
          </Badge>
        </Button>

        <Button
          variant={filter === 'pending_business_confirmation' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending_business_confirmation')}
          className="relative"
        >
          Onay Bekliyor
          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
            {getStatusCount('pending_business_confirmation')}
          </Badge>
        </Button>

        <Button
          variant={filter === 'confirmed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('confirmed')}
        >
          Planlandı
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
            {getStatusCount('confirmed')}
          </Badge>
        </Button>

        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Tamamlandı
          <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
            {getStatusCount('completed')}
          </Badge>
        </Button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {filter === 'all' ? 'Henüz randevu bulunmuyor.' : 'Bu durumda randevu bulunmuyor.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Customer Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          {appointment.userName}
                        </h3>
                        <p className="text-gray-600 font-medium">{appointment.serviceName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formatTime(appointment.date)} ({appointment.duration} dk)</span>
                      </div>

                      {appointment.userEmail && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{appointment.userEmail}</span>
                        </div>
                      )}

                      {appointment.userPhone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{appointment.userPhone}</span>
                        </div>
                      )}

                      <div className="flex items-center text-sm font-medium text-gray-800">
                        <span>Ücret: {appointment.price} TL</span>
                      </div>

                      {appointment.staffName && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>Personel: {appointment.staffName}</span>
                        </div>
                      )}
                    </div>

                    {appointment.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Not:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status and Actions */}
                  <div className="lg:w-64">
                    <AppointmentStatusManager
                      appointmentId={appointment.id}
                      status={appointment.status}
                      isBusinessOwner={true}
                      canEdit={true}
                      onRefresh={onRefresh}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessAppointmentsList;
