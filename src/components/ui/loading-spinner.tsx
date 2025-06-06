
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text,
  className = '',
  fullPage = false
}) => {
  const sizeClass = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4'
  };
  
  const spinnerClass = `animate-spin rounded-full ${sizeClass[size]} border-appointme-primary border-t-transparent ${className}`;
  
  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClass}></div>
      {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
    </div>
  );
  
  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        {content}
      </div>
    );
  }
  
  return content;
};

export default LoadingSpinner;
