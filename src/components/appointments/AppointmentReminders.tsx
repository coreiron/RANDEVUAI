
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Smartphone, Clock } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface ReminderSettings {
  enabled: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
  timing: '1hour' | '2hours' | '4hours' | '1day' | '2days';
}

interface AppointmentRemindersProps {
  appointmentId: string;
  currentSettings?: ReminderSettings;
  onSave: (settings: ReminderSettings) => void;
}

const AppointmentReminders: React.FC<AppointmentRemindersProps> = ({
  appointmentId,
  currentSettings,
  onSave
}) => {
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: true,
    email: true,
    sms: false,
    push: true,
    timing: '1day',
    ...currentSettings
  });

  const timingOptions = [
    { value: '1hour', label: '1 saat önce' },
    { value: '2hours', label: '2 saat önce' },
    { value: '4hours', label: '4 saat önce' },
    { value: '1day', label: '1 gün önce' },
    { value: '2days', label: '2 gün önce' }
  ];

  const handleSave = () => {
    onSave(settings);
    toast.success('Hatırlatıcı ayarları güncellendi');
  };

  const getActiveReminderCount = () => {
    let count = 0;
    if (settings.email) count++;
    if (settings.sms) count++;
    if (settings.push) count++;
    return count;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Randevu Hatırlatıcıları
          {settings.enabled && getActiveReminderCount() > 0 && (
            <Badge variant="secondary">
              {getActiveReminderCount()} aktif
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ana Switch */}
        <div className="flex items-center justify-between">
          <Label htmlFor="reminder-enabled" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Hatırlatıcıları Aktifleştir
          </Label>
          <Switch
            id="reminder-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Zamanlama */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hatırlatma Zamanı
              </Label>
              <Select
                value={settings.timing}
                onValueChange={(timing: any) => setSettings(prev => ({ ...prev, timing }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timingOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hatırlatma Türleri */}
            <div className="space-y-3">
              <Label>Hatırlatma Yöntemleri</Label>
              
              {/* E-posta */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">E-posta</div>
                    <div className="text-sm text-gray-600">E-posta ile hatırlatma</div>
                  </div>
                </div>
                <Switch
                  checked={settings.email}
                  onCheckedChange={(email) => setSettings(prev => ({ ...prev, email }))}
                />
              </div>

              {/* SMS */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">SMS</div>
                    <div className="text-sm text-gray-600">SMS ile hatırlatma</div>
                  </div>
                </div>
                <Switch
                  checked={settings.sms}
                  onCheckedChange={(sms) => setSettings(prev => ({ ...prev, sms }))}
                />
              </div>

              {/* Push Bildirimi */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Push Bildirimi</div>
                    <div className="text-sm text-gray-600">Uygulama bildirimi</div>
                  </div>
                </div>
                <Switch
                  checked={settings.push}
                  onCheckedChange={(push) => setSettings(prev => ({ ...prev, push }))}
                />
              </div>
            </div>

            {/* Özet */}
            {getActiveReminderCount() > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1">Hatırlatıcı Özeti:</div>
                <div className="text-sm text-blue-700">
                  Randevunuzdan {timingOptions.find(t => t.value === settings.timing)?.label} 
                  {' '}
                  {settings.email && 'e-posta'}
                  {settings.email && settings.sms && ', '}
                  {settings.sms && 'SMS'}
                  {(settings.email || settings.sms) && settings.push && ' ve '}
                  {settings.push && 'push bildirimi'}
                  {' ile hatırlatılacaksınız.'}
                </div>
              </div>
            )}

            <Button onClick={handleSave} className="w-full">
              Ayarları Kaydet
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentReminders;
