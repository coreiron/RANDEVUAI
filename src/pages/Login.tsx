import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Logo from '@/components/layout/Logo';
import { toast } from '@/components/ui/sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loginUser } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Form şeması
const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [activeTab, setActiveTab] = useState('user');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, userProfile, loading } = useAuth();

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      if (userProfile.userType === 'business') {
        navigate('/business-dashboard', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  }, [isAuthenticated, userProfile, loading, navigate]);

  // Form yönetimi
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Giriş işlemi fonksiyonu
  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      console.log("Giriş denemesi:", values.email);
      const user = await loginUser(values.email, values.password);

      // Kullanıcı tipini kontrol et
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Login sonrası kullanıcı tipi:", userData.userType);

        if (userData.userType === 'business') {
          navigate('/business-dashboard', { replace: true });
        } else {
          navigate('/profile', { replace: true });
        }
      }
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      toast.error(error.message || "Giriş sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  // Ana içerik renderı 
  console.log("Login form renderlanıyor");
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Geri butonu ve logo */}
      <div className="p-4 flex items-center justify-between">
        <Link to="/" className="text-appointme-primary">
          ← Geri
        </Link>
        <Logo />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-center mb-6">Giriş Yap</h1>
          <p className="text-center text-gray-600 mb-8">
            Daha fazla özelliğe erişmek için lütfen giriş yapın
          </p>

          <Tabs defaultValue="user" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="user">Kullanıcı Girişi</TabsTrigger>
              <TabsTrigger value="business">İşletme Girişi</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
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

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                  </Button>

                  <div className="mt-4 text-center">
                    <Link to="/forgot-password" className="text-sm text-appointme-primary hover:underline">
                      Şifremi Unuttum?
                    </Link>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="business">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İşletme E-postası *</FormLabel>
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
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Giriş Yapılıyor...' : 'İşletme Girişi Yap'}
                  </Button>

                  <div className="mt-4 text-center">
                    <Link to="/forgot-password" className="text-sm text-appointme-primary hover:underline">
                      Şifremi Unuttum?
                    </Link>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-appointme-primary font-medium hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
