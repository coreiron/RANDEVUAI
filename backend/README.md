
# AppointMe Backend API

Node.js/TypeScript/Express tabanlı REST API backend.

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle
```bash
cd backend
npm install
```

### 2. Environment Variables Ayarla
`.env.example` dosyasını `.env` olarak kopyalayın:
```bash
cp .env.example .env
```

Sonra `.env` dosyasını düzenleyerek Firebase Admin SDK bilgilerini girin:

```env
# Firebase Admin SDK - Firebase Console'dan Service Account key'i alın
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# JWT Secret - güvenli bir rastgele string
JWT_SECRET=your-very-secure-jwt-secret-key

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Firebase Admin SDK Setup
1. Firebase Console'a gidin: https://console.firebase.google.com
2. Projenizi seçin
3. Project Settings > Service Accounts
4. "Generate new private key" butonuna tıklayın
5. İndirilen JSON dosyasından şu bilgileri alın:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (dikkat: \n karakterleri korunmalı)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### 4. Backend'i Başlat
```bash
npm run dev
```

Backend http://localhost:3001 adresinde çalışacak.

## 📚 API Endpoints

### Authentication
Tüm korumalı endpoint'ler için Authorization header'ı gerekli:
```
Authorization: Bearer <firebase-id-token>
```

### Appointments
- `GET /api/appointments/user` - Kullanıcının randevuları
- `POST /api/appointments` - Yeni randevu oluştur
- `PUT /api/appointments/:id/status` - Randevu durumu güncelle
- `PUT /api/appointments/:id/cancel` - Randevu iptal et
- `GET /api/appointments/business/:shopId` - İşletme randevuları

### Shops
- `GET /api/shops` - Tüm işletmeler
- `GET /api/shops/:id` - İşletme detayları
- `GET /api/shops/category/:category` - Kategoriye göre işletmeler
- `GET /api/shops/user/my-shops` - Kullanıcının işletmeleri
- `GET /api/shops/:id/services` - İşletme hizmetleri
- `GET /api/shops/:id/staff` - İşletme personeli

### Health Check
- `GET /api/health` - API durumu kontrolü

## 🔧 Development

### Scripts
- `npm run dev` - Development mode (nodemon ile auto-reload)
- `npm start` - Production mode
- `npm run build` - TypeScript build

### Project Structure
```
backend/
├── src/
│   ├── config/          # Firebase ve database konfigürasyonu
│   ├── controllers/     # Route handler'ları
│   ├── middleware/      # Authentication middleware
│   ├── routes/         # API route tanımları
│   └── server.ts       # Express server setup
├── .env                # Environment variables
└── package.json
```

## 🛡️ Security

- Firebase Admin SDK ile güvenli authentication
- CORS middleware ile origin kontrolü
- Helmet middleware ile security headers
- JWT token validasyonu
- Input validation ve sanitization

## 📝 Notes

- Backend Firebase Firestore'u Firebase Admin SDK ile kullanır
- Frontend hala mevcut Firebase Client SDK'yı kullanabilir (geriye uyumluluk)
- Tüm API yanıtları standardize edilmiş format kullanır:
  ```json
  {
    "success": true,
    "data": {...},
    "message": "Success message"
  }
  ```

## 🔗 Frontend Integration

Frontend `.env` dosyasına backend URL'i ekleyin:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

API client kullanımı:
```typescript
import { apiClient } from '@/lib/api/client';

const response = await apiClient.get('/appointments/user');
if (response.success) {
  console.log(response.data);
}
```
