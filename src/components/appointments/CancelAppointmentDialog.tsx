import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import { cancelAppointment } from '@/lib/services/appointment/appointmentCancel';
import { toast } from '@/hooks/use-toast';

interface AppointmentDetails {
  shopName: string;
  serviceName: string;
  date: string;
  time: string;
}

interface CancelAppointmentDialogProps {
  appointmentId: string;
  appointmentDetails: AppointmentDetails;
  onSuccess: () => void;
  onCancel: () => void;
}

const CANCEL_REASONS = [
  { id: 'schedule_conflict', label: 'Program çakışması' },
  { id: 'personal_reasons', label: 'Kişisel sebepler' },
  { id: 'health_issues', label: 'Sağlık sorunları' },
  { id: 'found_alternative', label: 'Başka bir seçenek buldum' },
  { id: 'price_concerns', label: 'Fiyat endişeleri' },
  { id: 'other', label: 'Diğer (açıklama yazın)' }
];

const CancelAppointmentDialog: React.FC<CancelAppointmentDialogProps> = ({
  appointmentId,
  appointmentDetails,
  onSuccess,
  onCancel
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    try {
      setIsSubmitting(true);

      const reason = selectedReason === 'other' ? customReason :
        CANCEL_REASONS.find(r => r.id === selectedReason)?.label || '';

      await cancelAppointment({
        appointmentId,
        reason,
        canceledBy: 'user'
      });

      toast({
        title: "Randevu İptal Edildi",
        description: "Randevunuz başarıyla iptal edildi.",
      });

      onSuccess();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast({
        title: "Hata",
        description: "Randevu iptal edilirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onCancel();
  };

  const isFormValid = selectedReason && (selectedReason !== 'other' || customReason.trim());

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Randevu İptal Et
          </DialogTitle>
          <DialogDescription>
            <strong>{appointmentDetails.shopName}</strong> işletmesindeki randevunuzu iptal etmek istediğinizden emin misiniz?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{appointmentDetails.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{appointmentDetails.serviceName} • {appointmentDetails.time}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">İptal Sebebi</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-2">
              {CANCEL_REASONS.map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <Label htmlFor={reason.id} className="text-sm">{reason.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === 'other' && (
            <div>
              <Label htmlFor="custom-reason" className="text-sm font-medium">
                Açıklama
              </Label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="İptal sebebinizi açıklayın..."
                className="mt-1"
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Vazgeç
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isSubmitting || !isFormValid}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                İptal Ediliyor...
              </>
            ) : (
              'Randevuyu İptal Et'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelAppointmentDialog;
