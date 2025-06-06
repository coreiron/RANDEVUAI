
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppointmentsErrorProps {
  error: Error | string;
  onRetry?: () => void;
}

const AppointmentsError: React.FC<AppointmentsErrorProps> = ({ error, onRetry }) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="text-center py-6 px-4 bg-red-50 rounded-lg border border-red-100 my-4">
      <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
      <h3 className="font-medium text-lg text-red-700 mb-2">Randevular yüklenirken bir hata oluştu</h3>
      <p className="mb-4 text-red-600">{errorMessage}</p>
      
      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline" 
          className="mt-2"
        >
          Tekrar Dene
        </Button>
      )}
    </div>
  );
};

export default AppointmentsError;
