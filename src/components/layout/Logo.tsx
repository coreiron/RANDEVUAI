
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="rounded-md p-1 bg-gradient-app">
        <span className="text-white font-bold text-2xl">R</span>
      </div>
      <span className="font-bold text-2xl gradient-text">RandevuAl</span>
    </div>
  );
};

export default Logo;
