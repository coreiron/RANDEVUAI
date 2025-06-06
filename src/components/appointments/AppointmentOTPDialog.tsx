
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Clock, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { verifyOTP, resendOTP } from '@/lib/services/otpService';
import { createAppointment } from '@/lib/services/appointment/appointmentCreate';

interface AppointmentOTPDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  appointmentData: any;
  onSuccess: () => void;
}

const AppointmentOTPDialog: React.FC<AppointmentOTPDialogProps> = ({
  isOpen,
  onClose,
  email,
  appointmentData,
  onSuccess
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      const success = await resendOTP(email);
      
      if (success) {
        toast.success('Yeni doğrulama kodu gönderildi');
        setTimeLeft(300);
        setCanResend(false);
        setOtpCode('');
      } else {
        toast.error('Doğrulama kodu gönderilemedi');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Doğrulama kodu gönderilemedi');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error('Lütfen 6 haneli doğrulama kodunu girin');
      return;
    }

    setLoading(true);
    try {
      const verificationResult = verifyOTP(email, otpCode);
      
      if (verificationResult.success && verificationResult.appointmentData) {
        // OTP verified, now create the actual appointment
        const appointmentId = await createAppointment(verificationResult.appointmentData);
        
        toast.success('Randevunuz başarıyla oluşturuldu ve onaylandı!');
        onSuccess();
        onClose();
      } else {
        toast.error(verificationResult.message);
        setOtpCode('');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Doğrulama sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-posta Doğrulaması
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>{email}</strong> adresine 6 haneli doğrulama kodu gönderildi.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Doğrulama Kodu</Label>
            <div className="flex justify-center">
              <InputOTP 
                maxLength={6} 
                value={otpCode} 
                onChange={setOtpCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="text-center">
            {timeLeft > 0 ? (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Yeni kod gönderme: {formatTime(timeLeft)}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="flex items-center gap-2"
              >
                {resendLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Yeni Kod Gönder
              </Button>
            )}
          </div>

          {/* Demo Help */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Demo için:</strong> Konsola yazdırılan OTP kodunu girin.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleVerifyOTP} 
              disabled={loading || otpCode.length !== 6}
              className="flex-1"
            >
              {loading ? 'Doğrulanıyor...' : 'Onayla ve Randevu Oluştur'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentOTPDialog;
