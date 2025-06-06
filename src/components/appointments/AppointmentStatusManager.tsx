import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle, Star, AlertCircle, Mail } from 'lucide-react';
import { updateAppointmentStatusViaApi } from '@/lib/services/appointment/appointmentApiService';
import { toast } from '@/components/ui/sonner';

interface AppointmentStatusManagerProps {
  appointmentId: string;
  status: string;
  onStatusChange?: (newStatus: string) => void;
  isBusinessOwner?: boolean;
  canEdit?: boolean;
  onRefresh?: () => void;
}

const statusConfig = {
  pending_user_confirmation: {
    label: 'E-posta Onayı Bekliyor',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: <Mail className="h-4 w-4" />,
    description: 'Kullanıcı e-posta onayını bekliyor'
  },
  pending_business_confirmation: {
    label: 'İşletme Onayında',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Clock className="h-4 w-4" />,
    description: 'İşletme onayını bekliyor'
  },
  confirmed: {
    label: 'Planlandı',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="h-4 w-4" />,
    description: 'Randevu onaylandı ve planlandı'
  },
  completed: {
    label: 'Tamamlandı',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: <Star className="h-4 w-4" />,
    description: 'Randevu tamamlandı'
  },
  canceled: {
    label: 'İptal Edildi',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="h-4 w-4" />,
    description: 'Randevu iptal edildi'
  }
};

const AppointmentStatusManager: React.FC<AppointmentStatusManagerProps> = ({
  appointmentId,
  status,
  onStatusChange,
  isBusinessOwner,
  canEdit = true,
  onRefresh
}) => {
  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_user_confirmation;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateAppointmentStatusViaApi(appointmentId, newStatus);

      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge className={currentStatus.color}>
          <span className="flex items-center gap-1">
            {currentStatus.icon}
            {currentStatus.label}
          </span>
        </Badge>
      </div>

      <p className="text-sm text-gray-600">{currentStatus.description}</p>

      {/* User email confirmation reminder */}
      {status === 'pending_user_confirmation' && !isBusinessOwner && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-orange-800">
            <Mail className="h-4 w-4" />
            <span className="text-sm font-medium">E-posta kutunuzu kontrol edin</span>
          </div>
          <p className="text-xs text-orange-700 mt-1">
            Randevunuzu onaylamak için e-posta adresinize gönderilen bağlantıya tıklayın.
          </p>
        </div>
      )}

      {/* Business owner actions */}
      {isBusinessOwner && canEdit && status === 'pending_business_confirmation' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleStatusChange('confirmed')}
            className="bg-green-600 hover:bg-green-700"
          >
            Onayla
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange('canceled')}
            className="text-red-600 hover:bg-red-50"
          >
            Reddet
          </Button>
        </div>
      )}

      {/* Mark as completed */}
      {isBusinessOwner && canEdit && status === 'confirmed' && (
        <Button
          size="sm"
          onClick={() => handleStatusChange('completed')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Tamamlandı Olarak İşaretle
        </Button>
      )}

      {/* Cancel option for users */}
      {!isBusinessOwner && canEdit && (status === 'pending_user_confirmation' || status === 'pending_business_confirmation' || status === 'confirmed') && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange('canceled')}
          className="text-red-600 hover:bg-red-50 border-red-200"
        >
          Randevuyu İptal Et
        </Button>
      )}
    </div>
  );
};

export default AppointmentStatusManager;
