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

// Form şeması
const registerSchema = z.object({
  firstName: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyisim en az 2 karakter olmalıdır'),
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

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterUser = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form yönetimi
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
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

  const handleRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      console.log("Kayıt işlemi başlatılıyor:", values);
      const displayName = `${values.firstName} ${values.lastName}`;
      await registerUser(values.email, values.password, displayName);
      console.log("Kayıt başarılı");
      toast.success("Kayıt başarılı! Giriş yapılıyor...");
      navigate('/');
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      toast.error(error.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-center mb-6">Bireysel Kayıt</h1>
          <p className="text-center text-gray-600 mb-8">
            Randevu almak için hesap oluşturun
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Adınız" 
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
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyad *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Soyadınız" 
                          className="w-full" 
                          disabled={isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta *</FormLabel>
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre *</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
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
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
              </Button>
            </form>
          </Form>
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

export default RegisterUser;
