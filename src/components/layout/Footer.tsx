
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, Heart, User, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

const Footer: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 h-16">
        <Link to="/" className="flex flex-col items-center justify-center text-gray-500 hover:text-appointme-primary transition-colors">
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/appointments" className="flex flex-col items-center justify-center text-gray-500 hover:text-appointme-primary transition-colors">
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Appointments</span>
        </Link>
        <Link to="/favorites" className="flex flex-col items-center justify-center text-gray-500 hover:text-appointme-primary transition-colors">
          <Heart className="h-5 w-5" />
          <span className="text-xs mt-1">Favorites</span>
        </Link>
        <Link to="/messages" className="flex flex-col items-center justify-center text-gray-500 hover:text-appointme-primary transition-colors">
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs mt-1">Messages</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center text-gray-500 hover:text-appointme-primary transition-colors">
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
