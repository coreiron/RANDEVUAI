
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Clock, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface OTPVerificationProps {
  email: string;
  appointmentData: any;
  onVerifySuccess: () => void;
  onCancel: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  appointmentData,
  onVerifySuccess,
  onCancel
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 dakika
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

  const sendOTP = async () => {
    try {
      setResendLoading(true);
      
      // Simulate OTP sending - in real app this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('OTP sent to:', email);
      console.log('Generated OTP: 123456'); // In real app, this would be generated server-side
      
      toast.success('Doğrulama kodu e-posta adresinize gönderildi');
      setTimeLeft(300);
      setCanResend(false);
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Doğrulama kodu gönderilemedi');
    } finally {
      setResendLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error('Lütfen 6 haneli doğrulama kodunu girin');
      return;
    }

    setLoading(true);
    try {
      // Simulate OTP verification - in real app this would verify against server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept "123456" as valid OTP
      if (otpCode === '123456') {
        toast.success('Doğrulama başarılı! Randevunuz onaylandı.');
        onVerifySuccess();
      } else {
        toast.error('Geçersiz doğrulama kodu');
        setOtpCode('');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Doğrulama sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Auto-send OTP when component mounts
  useEffect(() => {
    sendOTP();
  }, []);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center">
          <Mail className="h-5 w-5" />
          E-posta Doğrulaması
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              onClick={sendOTP}
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
            <strong>Demo için:</strong> Doğrulama kodu olarak <code className="bg-gray-100 px-1 rounded">123456</code> girin.
          </AlertDescription>
        </Alert>

        {/* Appointment Summary */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Randevu Özeti:</h4>
          <div className="text-sm space-y-1">
            <div>İşletme: {appointmentData.shopName}</div>
            <div>Hizmet: {appointmentData.serviceName}</div>
            <div>Tarih: {appointmentData.date}</div>
            <div>Saat: {appointmentData.time}</div>
            <div>Ücret: {appointmentData.price} TL</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={verifyOTP} 
            disabled={loading || otpCode.length !== 6}
            className="flex-1"
          >
            {loading ? 'Doğrulanıyor...' : 'Onayla'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            İptal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OTPVerification;
