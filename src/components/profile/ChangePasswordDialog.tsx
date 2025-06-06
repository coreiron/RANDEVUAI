
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/sonner';
import { Lock } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifrenizi girin'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ChangePasswordDialogProps {
  children: React.ReactNode;
}

const ChangePasswordDialog = ({ children }: ChangePasswordDialogProps) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleChangePassword = async (values: PasswordFormValues) => {
    if (!currentUser?.email) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    setIsLoading(true);
    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(currentUser.email, values.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, values.newPassword);
      
      toast.success('Şifreniz başarıyla değiştirildi');
      setIsOpen(false);
      form.reset();
    } catch (error: any) {
      console.error("Password change error:", error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error('Mevcut şifreniz hatalı');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Yeni şifre en az 6 karakter olmalıdır');
      } else {
        toast.error('Şifre değiştirme sırasında bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Şifre Değiştir</DialogTitle>
        </DialogHeader>
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Şifre Değiştir</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleChangePassword)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mevcut Şifre</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Mevcut şifrenizi girin" 
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
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yeni Şifre</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="En az 6 karakter" 
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre Tekrar</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Yeni şifrenizi tekrar girin" 
                          disabled={isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClose}
                    disabled={isLoading}
                    type="button"
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
