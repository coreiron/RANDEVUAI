
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { confirmUserAppointment } from '@/lib/services/appointment/appointmentUpdate';
import { getAppointmentDetails } from '@/lib/services/appointment/appointmentQuery';
import { toast } from '@/components/ui/sonner';
import LoadingSpinner from '@/components/ui/loading-spinner';

const ConfirmAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_confirmed'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadAppointment(id);
    } else {
      setStatus('error');
      setError('Geçersiz randevu bağlantısı');
      setLoading(false);
    }
  }, [id]);

  const loadAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      const appointmentData = await getAppointmentDetails(appointmentId);
      
      if (!appointmentData) {
        setStatus('error');
        setError('Randevu bulunamadı');
        return;
      }

      setAppointment(appointmentData);
      
      // Check if already confirmed
      if (appointmentData.status === 'pending_business_confirmation' || 
          appointmentData.status === 'confirmed' || 
          appointmentData.status === 'completed') {
        setStatus('already_confirmed');
      } else if (appointmentData.status === 'pending_user_confirmation') {
        setStatus('success');
      } else {
        setStatus('error');
        setError('Bu randevu artık onaylanamaz');
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      setStatus('error');
      setError('Randevu bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!id) return;
    
    try {
      setConfirming(true);
      await confirmUserAppointment(id);
      
      toast.success('Randevunuz onaylandı! İşletme onayını bekliyor.');
      setStatus('already_confirmed');
      
      // Redirect to appointments page after 3 seconds
      setTimeout(() => {
        navigate('/appointments');
      }, 3000);
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error('Randevu onaylanırken hata oluştu');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Randevu bilgileri yükleniyor..." />;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4">
              {status === 'success' && (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              )}
              {status === 'already_confirmed' && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              )}
              {status === 'error' && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900">
              {status === 'success' && 'Randevu Onayı'}
              {status === 'already_confirmed' && 'Randevu Onaylandı'}
              {status === 'error' && 'Onay Hatası'}
            </CardTitle>
          </CardHeader>

          <CardContent className="pb-8">
            {status === 'error' && (
              <div className="text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <p className="text-red-800 font-medium mb-2">Randevu Onaylanamadı</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
                
                <Button 
                  onClick={() => navigate('/appointments')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Randevularım
                </Button>
              </div>
            )}

            {(status === 'success' || status === 'already_confirmed') && appointment && (
              <div>
                {/* Appointment Details */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-lg mb-4 text-gray-900">Randevu Detayları</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">İşletme:</span>
                      <span className="font-medium">{appointment.shopName}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hizmet:</span>
                      <span className="font-medium">{appointment.serviceName}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarih:</span>
                      <span className="font-medium">{formatDate(appointment.date.toDate())}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saat:</span>
                      <span className="font-medium">{formatTime(appointment.date.toDate())}</span>
                    </div>
                    
                    {appointment.price && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ücret:</span>
                        <span className="font-medium text-blue-600">{appointment.price} TL</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Section */}
                {status === 'success' && (
                  <div className="text-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-blue-800 text-sm">
                        Randevunuzu onaylamak için aşağıdaki butona tıklayın. 
                        Onaylandıktan sonra işletme tarafından da onaylanması gerekecektir.
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleConfirm}
                      disabled={confirming}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                      size="lg"
                    >
                      {confirming ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Onaylanıyor...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Randevuyu Onayla
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {status === 'already_confirmed' && (
                  <div className="text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <p className="text-green-800 font-medium mb-1">✅ Randevunuz başarıyla onaylandı!</p>
                      <p className="text-green-700 text-sm">
                        İşletme onayını bekliyor. Randevu durumunuzu takip edebilirsiniz.
                      </p>
                    </div>
                    
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={() => navigate('/appointments')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Randevularım
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      
                      <Button 
                        onClick={() => navigate('/')}
                        variant="outline"
                      >
                        Ana Sayfa
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmAppointment;
