
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/layout/Logo';
import { toast } from '@/components/ui/sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { resetPassword } from '@/lib/firebase';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type Step = 'email' | 'success';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const handleSendResetEmail = async (values: EmailFormValues) => {
    setIsLoading(true);
    try {
      await resetPassword(values.email);
      setEmail(values.email);
      setCurrentStep('success');
    } catch (error: any) {
      // Error is already handled in the firebase service
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'email':
        return (
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Şifremi Unuttum</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 mb-6">
                E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
              </p>

              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleSendResetEmail)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta Adresi</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="ornek@mail.com" 
                            className="w-full" 
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Şifrenizi hatırladınız mı?{' '}
                  <Link to="/login" className="text-appointme-primary hover:underline">
                    Giriş Yap
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 'success':
        return (
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>E-posta Gönderildi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600">
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderildi.
              </p>
              <p className="text-center text-sm text-gray-500">
                E-postadaki bağlantıyı kullanarak yeni şifrenizi belirleyebilirsiniz.
              </p>
              <Button 
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Giriş Sayfasına Dön
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="p-4 flex items-center justify-between">
        <Link to="/login" className="text-appointme-primary flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Link>
        <Logo />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {renderStep()}
      </div>
    </div>
  );
};

export default ForgotPassword;
