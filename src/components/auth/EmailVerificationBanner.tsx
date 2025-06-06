import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { resendVerificationEmail } from '@/lib/firebase';
import { toast } from '@/components/ui/sonner';

const EmailVerificationBanner = () => {
  const { isAuthenticated, isEmailVerified, refreshEmailVerification } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!isAuthenticated || isEmailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      setResending(true);
      await resendVerificationEmail();
    } catch (error) {
      // Error is already handled in the service
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setChecking(true);
      await refreshEmailVerification();

      // Wait a moment then check again
      setTimeout(async () => {
        await refreshEmailVerification();
        setChecking(false);
      }, 1000);
    } catch (error) {
      console.error('Error checking verification:', error);
      toast.error('Doğrulama durumu kontrol edilemedi');
      setChecking(false);
    }
  };

  return (
    <Alert className="mx-4 my-2 border-orange-200 bg-orange-50">
      <Mail className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="text-orange-800">
          <strong>E-posta adresinizi doğrulayın.</strong> Gelen kutunuzu kontrol edin ve doğrulama bağlantısına tıklayın.
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckVerification}
            disabled={checking}
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Kontrol Et
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={resending}
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            {resending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Yeniden Gönder
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationBanner;
