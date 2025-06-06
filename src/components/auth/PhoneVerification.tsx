
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { Phone, ArrowLeft, RefreshCw } from 'lucide-react';
import { sendPhoneVerificationCode, verifyPhoneCode } from '@/lib/services/phoneVerificationService';

interface PhoneVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
  onCancel: () => void;
  purpose: 'business-registration' | 'profile-update' | 'password-change';
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  phoneNumber,
  onVerified,
  onCancel,
  purpose
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  // Geri sayım timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Sayfa yüklendiğinde ilk SMS'i gönder
  useEffect(() => {
    handleSendCode();
  }, []);

  const handleSendCode = async () => {
    setIsSending(true);
    try {
      console.log(`📱 Sending verification code to: ${phoneNumber}`);
      
      const result = await sendPhoneVerificationCode(phoneNumber);
      if (result.success && result.verificationId) {
        setVerificationId(result.verificationId);
        setTimeLeft(60);
        setCanResend(false);
        toast.success('Doğrulama kodu gönderildi');
      } else {
        toast.error(result.message || 'Kod gönderilemedi');
      }
    } catch (error) {
      console.error('❌ Error sending verification code:', error);
      toast.error('Doğrulama kodu gönderilemedi');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Lütfen 6 haneli kodu tam olarak girin');
      return;
    }

    if (!verificationId) {
      toast.error('Doğrulama ID bulunamadı. Yeni kod talep edin.');
      return;
    }

    setIsVerifying(true);
    try {
      console.log(`🔐 Verifying code: ${otpCode}`);
      
      // Telefon numarasını da parametre olarak geç
      const result = await verifyPhoneCode(verificationId, otpCode, phoneNumber);
      if (result.success) {
        toast.success('Telefon numarası başarıyla doğrulandı!');
        onVerified();
      } else {
        toast.error(result.message || 'Geçersiz kod');
        setOtpCode('');
      }
    } catch (error) {
      console.error('❌ Error verifying code:', error);
      toast.error('Kod doğrulanırken hata oluştu');
      setOtpCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const getPurposeText = () => {
    switch (purpose) {
      case 'business-registration':
        return 'İşletme hesabınızı oluşturmak için';
      case 'profile-update':
        return 'Profil güncellemesi için';
      case 'password-change':
        return 'Şifre değişikliği için';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Phone className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Telefon Doğrulama</CardTitle>
          <p className="text-gray-600">
            {getPurposeText()} telefon numaranızı doğrulayın
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>{phoneNumber}</strong> numarasına gönderilen 6 haneli kodu girin
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={(value) => setOtpCode(value)}
                disabled={isVerifying}
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

            <Button
              onClick={handleVerifyCode}
              disabled={isVerifying || otpCode.length !== 6}
              className="w-full"
            >
              {isVerifying ? 'Doğrulanıyor...' : 'Doğrula'}
            </Button>
          </div>

          <div className="text-center space-y-2">
            {!canResend ? (
              <p className="text-sm text-gray-600">
                Yeni kod isteyebilirsiniz: {timeLeft} saniye
              </p>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSendCode}
                disabled={isSending}
                className="text-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSending ? 'animate-spin' : ''}`} />
                {isSending ? 'Gönderiliyor...' : 'Yeni Kod Gönder'}
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneVerification;
