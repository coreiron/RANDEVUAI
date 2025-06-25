
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAppointments } from '@/hooks/useAppointments';

const AppointmentCalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { appointments, loading } = useAppointments();

  const getDayAppointments = (date: Date) => {
    return appointments.filter(appointment => {
      let appointmentDate: Date;

      // Tarih formatını düzelt
      if (appointment.date && typeof appointment.date === 'object' && appointment.date._seconds) {
        appointmentDate = new Date(appointment.date._seconds * 1000);
      } else if (appointment.date?.toDate) {
        appointmentDate = appointment.date.toDate();
      } else if (appointment.date?.seconds) {
        appointmentDate = new Date(appointment.date.seconds * 1000);
      } else if (typeof appointment.date === 'string') {
        appointmentDate = new Date(appointment.date);
      } else if (appointment.date instanceof Date) {
        appointmentDate = appointment.date;
      } else {
        return false;
      }

      return isSameDay(appointmentDate, date);
    });
  };

  const getAppointmentsByStatus = (appointments: any[]) => {
    return appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {});
  };

  const selectedDayAppointments = getDayAppointments(selectedDate);
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    canceled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  };

  const statusLabels = {
    confirmed: 'Onaylı',
    pending: 'Beklemede',
    canceled: 'İptal',
    completed: 'Tamamlandı'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Takvim */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Randevu Takvimi
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[120px] text-center">
                  {format(currentMonth, 'MMMM yyyy', { locale: tr })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="w-full"
              modifiers={{
                hasAppointment: (date) => getDayAppointments(date).length > 0
              }}
              modifiersClassNames={{
                hasAppointment: "bg-blue-100 text-blue-900 font-medium"
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Seçili Gün Detayları */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'dd MMMM yyyy', { locale: tr })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Bu gün için randevunuz bulunmuyor.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDayAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{appointment.shopName}</span>
                      <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                        {statusLabels[appointment.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        {appointment.time}
                      </div>
                      <div>{appointment.serviceName}</div>
                      <div className="font-medium text-blue-600 mt-1">
                        {appointment.price} TL
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* İstatistikler */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Bu Ay Özeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(getAppointmentsByStatus(appointments)).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm">{statusLabels[status as keyof typeof statusLabels]}</span>
                  <Badge variant="outline">{count as number}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentCalendarView;
