
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/layout/Logo';
import { User } from 'lucide-react';

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Üst kısım geri butonu ve logo */}
      <div className="p-4 flex items-center justify-between bg-white shadow-sm">
        <Link to="/" className="text-appointme-primary">
          ← Geri
        </Link>
        <Logo />
      </div>

      <div className="flex-1 flex items-center justify-center bg-purple-50 p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Kayıt Ol</h1>
          </div>

          <div className="grid gap-6">
            <Link to="/register/user">
              <Button 
                variant="outline"
                className="w-full h-32 bg-gradient-to-r from-appointme-primary to-appointme-secondary text-white border-0 text-xl flex flex-col gap-2 items-center justify-center hover:opacity-90 transition-opacity"
              >
                <User size={40} />
                <span className="font-bold">Bireysel Hesap</span>
              </Button>
            </Link>

            <Link to="/register/business">
              <Button 
                variant="outline"
                className="w-full h-32 bg-blue-500 text-white border-0 text-xl flex flex-col gap-2 items-center justify-center hover:opacity-90 transition-opacity"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 21H21M4 21V8L12 3L20 8V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21V13H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-bold">İşletme Kaydı</span>
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-appointme-primary font-medium hover:underline">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
