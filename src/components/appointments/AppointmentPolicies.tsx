
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, XCircle, Calendar, AlertTriangle, DollarSign } from 'lucide-react';

interface PolicyRule {
  timeframe: string;
  description: string;
  penalty?: string;
  icon: React.ReactNode;
  type: 'info' | 'warning' | 'error';
}

const AppointmentPolicies = () => {
  const cancelationPolicies: PolicyRule[] = [
    {
      timeframe: '24+ saat önce',
      description: 'Ücretsiz iptal edilebilir',
      icon: <Clock className="h-4 w-4 text-green-600" />,
      type: 'info'
    },
    {
      timeframe: '12-24 saat önce',
      description: 'Randevu ücretinin %25\'i kesinti',
      penalty: '%25 kesinti',
      icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      type: 'warning'
    },
    {
      timeframe: '2-12 saat önce',
      description: 'Randevu ücretinin %50\'si kesinti',
      penalty: '%50 kesinti',
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
      type: 'warning'
    },
    {
      timeframe: '2 saat içinde',
      description: 'Randevu ücretinin tamamı tahsil edilir',
      penalty: '%100 ücret',
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      type: 'error'
    }
  ];

  const reschedulePolicies: PolicyRule[] = [
    {
      timeframe: '24+ saat önce',
      description: 'Ücretsiz erteleme yapılabilir',
      icon: <Calendar className="h-4 w-4 text-green-600" />,
      type: 'info'
    },
    {
      timeframe: '12-24 saat önce',
      description: 'Bir kez ücretsiz erteleme hakkı',
      icon: <Calendar className="h-4 w-4 text-yellow-600" />,
      type: 'warning'
    },
    {
      timeframe: '12 saat içinde',
      description: 'Erteleme yapılamaz, iptal politikası geçerli',
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      type: 'error'
    }
  ];

  const generalRules = [
    'Randevu iptal ve erteleme işlemleri sadece uygulama üzerinden yapılabilir',
    'Telefon ile yapılan iptal/erteleme talepleri geçerli değildir',
    'Hastalık durumunda doktor raporu ile ücretsiz iptal yapılabilir',
    'Doğal afet veya olağanüstü durumlarda özel koşullar uygulanır',
    'İşletme tarafından yapılan iptal/ertelemelerde tam ücret iadesi yapılır'
  ];

  const PolicyCard = ({ title, policies, icon }: { title: string, policies: PolicyRule[], icon: React.ReactNode }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {policies.map((policy, index) => (
            <Alert key={index} className={`border-l-4 ${
              policy.type === 'info' ? 'border-l-green-500 bg-green-50' :
              policy.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
              'border-l-red-500 bg-red-50'
            }`}>
              <div className="flex items-start gap-3">
                {policy.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{policy.timeframe}</span>
                    {policy.penalty && (
                      <Badge variant={policy.type === 'error' ? 'destructive' : 'secondary'}>
                        {policy.penalty}
                      </Badge>
                    )}
                  </div>
                  <AlertDescription className="text-sm">
                    {policy.description}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PolicyCard 
          title="İptal Politikası" 
          policies={cancelationPolicies}
          icon={<XCircle className="h-5 w-5" />}
        />
        
        <PolicyCard 
          title="Erteleme Politikası" 
          policies={reschedulePolicies}
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      {/* Genel Kurallar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Genel Kurallar ve Koşullar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {generalRules.map((rule, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Önemli Uyarı */}
      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertDescription>
          <strong>Önemli:</strong> İptal ve erteleme politikaları randevu zamanına göre otomatik olarak uygulanır. 
          Lütfen randevunuzu almadan önce bu kuralları dikkatlice okuyun.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AppointmentPolicies;
