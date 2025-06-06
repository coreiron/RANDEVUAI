import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { verifyEmail, resendVerificationEmail } from '@/lib/firebase';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const oobCode = searchParams.get('oobCode');

    useEffect(() => {
        const verifyEmailCode = async () => {
            if (!oobCode) return;

            setIsVerifying(true);
            try {
                await verifyEmail(oobCode);
                toast.success('E-posta adresiniz başarıyla doğrulandı!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } catch (error: any) {
                console.error('E-posta doğrulama hatası:', error);
                toast.error('E-posta doğrulama işlemi başarısız oldu.');
            } finally {
                setIsVerifying(false);
            }
        };

        verifyEmailCode();
    }, [oobCode, navigate]);

    const handleResendVerification = async () => {
        setIsResending(true);
        try {
            await resendVerificationEmail();
            toast.success('Yeni doğrulama e-postası gönderildi');
        } catch (error) {
            toast.error('Doğrulama e-postası gönderilemedi');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>E-posta Doğrulama</CardTitle>
                    <CardDescription>
                        {oobCode
                            ? 'E-posta adresiniz doğrulanıyor...'
                            : 'E-posta adresinizi doğrulamanız gerekiyor'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isVerifying ? (
                        <div className="text-center">
                            <p>Doğrulama işlemi devam ediyor...</p>
                        </div>
                    ) : oobCode ? (
                        <div className="text-center">
                            <p className="text-green-600">
                                E-posta adresiniz başarıyla doğrulandı!
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Giriş sayfasına yönlendiriliyorsunuz...
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p>
                                Hesabınızı kullanabilmek için e-posta adresinizi doğrulamanız gerekmektedir.
                                E-posta kutunuzu kontrol edin ve gönderilen bağlantıya tıklayın.
                            </p>
                            <p className="text-sm text-gray-500">
                                E-posta almadıysanız spam klasörünü kontrol edin veya yeni bir doğrulama e-postası gönderin.
                            </p>
                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/login')}
                                >
                                    Giriş Sayfasına Dön
                                </Button>
                                <Button
                                    onClick={handleResendVerification}
                                    disabled={isResending}
                                >
                                    {isResending ? 'Gönderiliyor...' : 'Yeniden Gönder'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 