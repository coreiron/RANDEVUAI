
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import Logo from '@/components/layout/Logo';
import { toast } from '@/components/ui/sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { registerUser } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import PhoneVerification from '@/components/auth/PhoneVerification';

// İşletme kayıt şeması - telefon numarası zorunlu
const registerBusinessSchema = z.object({
  businessName: z.string().min(2, 'İşletme adı en az 2 karakter olmalıdır'),
  contactName: z.string().min(2, 'İletişim kişisi adı en az 2 karakter olmalıdır'),
  phoneNumber: z.string().min(10, 'Geçerli bir telefon numarası giriniz').regex(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir Türkiye telefon numarası giriniz'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  passwordConfirm: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Kullanım şartlarını kabul etmeniz gerekmektedir',
  }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Şifreler eşleşmiyor",
  path: ["passwordConfirm"],
});

type RegisterBusinessFormValues = z.infer<typeof registerBusinessSchema>;

const RegisterBusiness = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [formData, setFormData] = useState<RegisterBusinessFormValues | null>(null);
  
  // Form yönetimi
  const form = useForm<RegisterBusinessFormValues>({
    resolver: zodResolver(registerBusinessSchema),
    defaultValues: {
      businessName: '',
      contactName: '',
      phoneNumber: '',
      email: '',
      password: '',
      passwordConfirm: '',
      acceptTerms: false,
    },
  });

  // Eğer kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handlePhoneVerificationStep = (values: RegisterBusinessFormValues) => {
    setFormData(values);
    setShowPhoneVerification(true);
  };

  const handlePhoneVerified = () => {
    setPhoneVerified(true);
    setShowPhoneVerification(false);
    // Telefon doğrulandıktan sonra hesabı oluştur
    if (formData) {
      handleCreateAccount(formData);
    }
  };

  const handleCreateAccount = async (values: RegisterBusinessFormValues) => {
    setIsLoading(true);
    try {
      console.log("İşletme hesabı açılıyor:", values);
      
      // İşletme bilgilerini ek veri olarak hazırlayalım
      const additionalData = {
        businessName: values.businessName,
        contactName: values.contactName,
        phoneNumber: values.phoneNumber,
        phoneVerified: phoneVerified,
      };

      await registerUser(
        values.email, 
        values.password, 
        values.businessName, 
        'business', 
        additionalData
      );
      
      console.log("İşletme hesabı başarıyla açıldı");
      toast.success("İşletme hesabı başarıyla açıldı! E-posta doğrulama bağlantısı gönderildi.");
      navigate('/');
    } catch (error: any) {
      console.error("İşletme hesabı açma hatası:", error);
      toast.error(error.message || "Hesap açılırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: RegisterBusinessFormValues) => {
    // Önce telefon numarasını doğrulat
    handlePhoneVerificationStep(values);
  };

  if (showPhoneVerification && formData) {
    return (
      <PhoneVerification
        phoneNumber={formData.phoneNumber}
        onVerified={handlePhoneVerified}
        onCancel={() => setShowPhoneVerification(false)}
        purpose="business-registration"
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Üst kısım geri butonu ve logo */}
      <div className="p-4 flex items-center justify-between">
        <Link to="/register" className="text-appointme-primary">
          ← Geri
        </Link>
        <Logo />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-center mb-6">İşletme Hesabı Aç</h1>
          <p className="text-center text-gray-600 mb-8">
            İşletmeniz için hesap oluşturun. Telefon numaranızı doğruladıktan sonra hesabınız aktif olacak.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İşletme Adı *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="İşletmenizin adı" 
                        className="w-full" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İletişim Kişisi *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="İletişim kurulacak kişinin adı" 
                        className="w-full" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon Numarası *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+90 555 123 45 67 veya 0555 123 45 67" 
                        className="w-full" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="isletme@mail.com" 
                        className="w-full" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre *</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="En az 6 karakter"
                        className="w-full"
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre Tekrar *</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Şifrenizi tekrar girin"
                        className="w-full"
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        <span className="text-sm text-gray-700">
                          <Link to="/terms" className="text-appointme-primary hover:underline">Kullanım şartlarını</Link> ve <Link to="/privacy" className="text-appointme-primary hover:underline">Gizlilik politikasını</Link> kabul ediyorum
                        </span>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? 'İşlem Devam Ediyor...' : 'Telefon Numarasını Doğrula'}
              </Button>
            </form>
          </Form>

          {/* Telefon doğrulama bilgilendirmesi */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              📱 <strong>Telefon Doğrulama:</strong> Hesabınızı oluşturmak için telefon numaranızı SMS ile doğrulamanız gerekecek.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-appointme-primary font-medium hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterBusiness;
