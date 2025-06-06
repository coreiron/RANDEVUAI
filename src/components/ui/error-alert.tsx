
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface ErrorAlertProps {
  title?: string;
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = "Bir hata oluştu",
  error,
  onRetry,
  className = ''
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <Alert variant="destructive" className={`flex flex-col items-center p-4 ${className}`}>
      <AlertTriangle className="h-6 w-6 mb-2" />
      <AlertTitle className="mb-2 text-center">{title}</AlertTitle>
      <AlertDescription className="text-center">
        {errorMessage}
        
        {onRetry && (
          <div className="mt-3">
            <Button
              variant="outline"
              onClick={onRetry}
              className="hover:bg-red-50"
            >
              Tekrar Dene
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
