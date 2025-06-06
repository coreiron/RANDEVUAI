
import React, { useState } from 'react';
import { Calendar, Filter, CalendarDays, Repeat, Bell, FileText } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { Navigate } from 'react-router-dom';
import UserAppointments from '@/components/appointments/UserAppointments';
import AppointmentCalendarView from '@/components/appointments/AppointmentCalendarView';
import RecurringAppointment from '@/components/appointments/RecurringAppointment';
import AppointmentReminders from '@/components/appointments/AppointmentReminders';
import AppointmentPolicies from '@/components/appointments/AppointmentPolicies';
import OTPVerification from '@/components/appointments/OTPVerification';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

type AppointmentStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'canceled';

const Appointments = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  
  // Demo data for OTP verification
  const [pendingAppointment, setPendingAppointment] = useState({
    shopName: 'Güzellik Salonu',
    serviceName: 'Saç Kesimi',
    date: '15 Ocak 2025',
    time: '14:00',
    price: 150
  });
  
  const allowWithoutAuth = true;
  
  if (!isAuthenticated && !currentUser && !allowWithoutAuth) {
    console.log("User is not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  const handleRecurringSave = (recurringData: any) => {
    console.log('Recurring appointment data:', recurringData);
    toast.success('Tekrarlayan randevu planı oluşturuldu');
    setShowRecurring(false);
  };

  const handleOTPVerifySuccess = () => {
    toast.success('Randevunuz başarıyla onaylandı!');
    setShowOTPVerification(false);
  };

  const handleReminderSave = (settings: any) => {
    console.log('Reminder settings:', settings);
    toast.success('Hatırlatıcı ayarları güncellendi');
  };

  // Demo function to trigger OTP verification
  const triggerOTPDemo = () => {
    setShowOTPVerification(true);
  };

  if (showOTPVerification) {
    return (
      <div className="pb-20 pt-4 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
        <div className="px-4 max-w-4xl mx-auto">
          <OTPVerification
            email={currentUser?.email || 'demo@example.com'}
            appointmentData={pendingAppointment}
            onVerifySuccess={handleOTPVerifySuccess}
            onCancel={() => setShowOTPVerification(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-4 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      <div className="px-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="text-appointme-primary" />
            <h1 className="text-2xl font-bold">Randevu Yönetimi (API)</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Filtrele {showFilters ? '▲' : '▼'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowRecurring(true)}
              className="flex items-center gap-1"
            >
              <Repeat className="h-4 w-4" />
              Tekrarlayan
            </Button>

            <Button 
              size="sm"
              onClick={triggerOTPDemo}
              className="flex items-center gap-1"
            >
              <Bell className="h-4 w-4" />
              OTP Demo
            </Button>
          </div>
        </div>

        {showRecurring && (
          <div className="mb-6">
            <RecurringAppointment
              onSave={handleRecurringSave}
              onCancel={() => setShowRecurring(false)}
            />
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Takvim
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Hatırlatıcılar
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Politikalar
            </TabsTrigger>
            <TabsTrigger value="recurring" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Tekrarlayan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {showFilters && (
              <div className="mb-6">
                <Tabs 
                  defaultValue="all" 
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as AppointmentStatus)}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="all">Tümü</TabsTrigger>
                    <TabsTrigger value="pending">Bekleyen</TabsTrigger>
                    <TabsTrigger value="confirmed">Onaylı</TabsTrigger>
                    <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
                    <TabsTrigger value="canceled">İptal Edilen</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            <Card className="bg-white rounded-lg shadow p-6">
              {selectedStatus === 'all' ? (
                <UserAppointments />
              ) : (
                <UserAppointments statusFilter={selectedStatus} />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <AppointmentCalendarView />
          </TabsContent>

          <TabsContent value="reminders" className="mt-6">
            <AppointmentReminders
              appointmentId="demo-appointment"
              onSave={handleReminderSave}
            />
          </TabsContent>

          <TabsContent value="policies" className="mt-6">
            <AppointmentPolicies />
          </TabsContent>

          <TabsContent value="recurring" className="mt-6">
            <RecurringAppointment
              onSave={handleRecurringSave}
              onCancel={() => setActiveTab('list')}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8 bg-gradient-to-r from-blue-100 to-green-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-appointme-primary">Randevu Yönetimi İpuçları (API ile)</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>Tüm randevu işlemleri artık REST API üzerinden yapılır</li>
            <li>Backend'de güvenli Firebase Admin SDK kullanılır</li>
            <li>Tekrarlayan randevular oluşturarak zamanınızı daha iyi planlayabilirsiniz</li>
            <li>E-posta doğrulaması ile randevularınız otomatik onaylanır</li>
            <li>Hatırlatıcıları aktifleştirerek randevularınızı kaçırmayın</li>
            <li>Takvim görünümü ile tüm randevularınızı bir arada görün</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
