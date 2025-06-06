
import React from 'react';
import { MessageSquare, Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="page-container">
      <div className="px-4 max-w-4xl mx-auto">
        <div className="app-gradient text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare />
            <h1 className="text-2xl font-bold">İletişim Bilgileri</h1>
          </div>
          <p>Sorularınız ve önerileriniz için bize ulaşın</p>
        </div>

        <div className="bg-white rounded-b-lg shadow p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-3 p-4 border-b hover:bg-blue-50 transition-colors rounded-md">
                <Mail className="text-appointme-primary mt-1" />
                <div>
                  <span className="font-medium text-gray-700 block mb-1">E-posta</span>
                  <span className="text-appointme-primary">info@randevual.com</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 border-b hover:bg-blue-50 transition-colors rounded-md">
                <Phone className="text-appointme-primary mt-1" />
                <div>
                  <span className="font-medium text-gray-700 block mb-1">Telefon</span>
                  <span className="text-appointme-primary">+90 (555) 123 45 67</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 hover:bg-blue-50 transition-colors rounded-md">
                <MapPin className="text-appointme-primary mt-1" />
                <div>
                  <span className="font-medium text-gray-700 block mb-1">Adres</span>
                  <span className="text-gray-600">İstanbul / Türkiye</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-100 to-green-100 p-6 rounded-lg text-center flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-4 text-appointme-primary">Yardıma mı ihtiyacınız var?</h3>
              <p className="text-gray-700 mb-6">
                Uygulamamız hakkında her türlü soru ve öneriniz için
                size yardımcı olmaktan memnuniyet duyarız.
              </p>
              <a 
                href="mailto:info@randevual.com" 
                className="mx-auto px-6 py-3 bg-appointme-primary text-white rounded-full hover:bg-appointme-secondary transition-colors"
              >
                Bize E-posta Gönderin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
