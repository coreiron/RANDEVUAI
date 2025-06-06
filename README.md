# RANDEVUAI

Modern bir randevu yönetim sistemi. İşletmeler ve müşteriler arasında kolay randevu planlama ve yönetimi sağlar.

## Özellikler

### Müşteriler İçin
- İşletme arama ve filtreleme
- Online randevu oluşturma
- Randevu takibi ve iptal etme
- İşletme değerlendirme ve yorum
- Favori işletmeler listesi
- Mesajlaşma sistemi

### İşletmeler İçin
- İşletme profili yönetimi
- Hizmet ve personel tanımlama
- Randevu takvimi ve yönetimi
- Müşteri iletişimi
- Raporlama ve analitik
- Çalışma saatleri ayarlama

## Teknolojiler

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Shadcn/ui
- **Backend**: Node.js, Express, Firebase Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting

## Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Firebase CLI

### Frontend Kurulumu
```bash
npm install
npm run dev
```

### Backend Kurulumu
```bash
cd backend/functions
npm install
npm run serve
```

### Firebase Yapılandırması
1. Firebase Console'da yeni proje oluşturun
2. Authentication, Firestore ve Storage servislerini aktifleştirin
3. Firebase config bilgilerini `src/lib/firebase.ts` dosyasına ekleyin
4. Firebase rules'larını deploy edin:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Kullanım

1. Uygulamayı başlatın: `npm run dev`
2. Tarayıcıda `http://localhost:5173` adresine gidin
3. Yeni hesap oluşturun veya giriş yapın
4. İşletme hesabı için özel kurulum sürecini tamamlayın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
