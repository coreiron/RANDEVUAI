
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import EmailVerificationBanner from '../auth/EmailVerificationBanner';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <EmailVerificationBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
