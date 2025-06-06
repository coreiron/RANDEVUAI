
import React from 'react';
import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AppointmentItem from './AppointmentItem';
import { FormattedAppointment } from '@/hooks/useAppointments';
import LoadingSpinner from '../ui/loading-spinner';
import AppointmentsError from './AppointmentsError';

interface AppointmentsListProps {
  appointments: FormattedAppointment[];
  loading: boolean;
  error: Error | null;
  onCancelClick: (appointment: FormattedAppointment) => void;
  onRetry?: () => void;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ 
  appointments, 
  loading, 
  error,
  onCancelClick,
  onRetry
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner fullPage text="Randevularınız yükleniyor..." />;
  }

  if (error) {
    return <AppointmentsError error={error} onRetry={onRetry} />;
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarClock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg text-gray-500 mb-4">Henüz bir randevunuz bulunmuyor.</p>
        <Button onClick={() => navigate('/shops')}>
          Randevu Alın
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentItem 
          key={appointment.id} 
          appointment={appointment} 
          onCancelClick={onCancelClick}
        />
      ))}
    </div>
  );
};

export default AppointmentsList;
