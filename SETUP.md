
# AppointMe - Tam Kurulum Kılavuzu

Bu proje artık backend API ile çalışan tam stack bir uygulamadır.

## 🔧 Kurulum Adımları

### 1. Repository'yi Clone Edin
```bash
git clone <repository-url>
cd appointme
```

### 2. Frontend Kurulumu
```bash
# Ana dizinde
npm install

# Frontend environment variables
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Firebase Configuration (mevcut değerlerinizi koruyun)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
# ... diğer Firebase ayarları
```

### 3. Backend Kurulumu
```bash
# Backend dizinine geçin
cd backend

# Bağımlılıkları yükleyin
npm install

# Environment variables ayarlayın
cp .env.example .env
```

`backend/.env` dosyasını düzenleyin:
```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# JWT Secret
JWT_SECRET=your-very-secure-random-secret

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Firebase Admin SDK Ayarları

1. Firebase Console'a gidin: https://console.firebase.google.com
2. Projenizi seçin
3. ⚙️ Project Settings > Service Accounts sekmesi
4. "Generate new private key" butonuna tıklayın
5. İndirilen JSON dosyasını açın ve şu bilgileri kopyalayın:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

**Önemli:** Private key'deki `\n` karakterlerini koruyun!

## 🚀 Uygulamayı Çalıştırma

### Terminal 1: Backend
```bash
cd backend
npm run dev
```
Backend http://localhost:3001 adresinde çalışacak.

### Terminal 2: Frontend
```bash
# Ana dizinde
npm run dev
```
Frontend http://localhost:5173 adresinde çalışacak.

## 🔍 Test Etme

1. Backend sağlık kontrolü: http://localhost:3001/api/health
2. Frontend'e gidin: http://localhost:5173
3. Giriş yapın ve randevu işlemlerini test edin

## 📋 Özellikler

### ✅ Çalışan Özellikler
- ✅ Kullanıcı authentication (Firebase Auth)
- ✅ İşletme listesi (REST API)
- ✅ Randevu oluşturma (REST API)
- ✅ Randevu yönetimi (REST API)
- ✅ Mesajlaşma (Firebase Firestore)
- ✅ Profil yönetimi
- ✅ Favori işletmeler
- ✅ Geriye uyumlu Firebase service'ler

### 🔄 API Transition Status
- ✅ Shop operations → Backend REST API
- ✅ Appointment operations → Backend REST API
- 🔄 Message operations → Firebase (mevcut)
- 🔄 User operations → Firebase (mevcut)
- 🔄 Review operations → Firebase (mevcut)

## 🛠️ Geliştirme Notları

1. **Hybrid Yapı**: Uygulama hem backend API hem de Firebase service'leri kullanır
2. **Geriye Uyumluluk**: Eski Firebase service'ler hala çalışır
3. **Gradual Migration**: İşlemler aşamalı olarak API'ye taşınır
4. **Security**: Backend Firebase Admin SDK kullanır, frontend ise Firebase Client SDK

## 🐛 Sorun Giderme

### Backend bağlantı problemi:
- Backend'in çalıştığını kontrol edin: http://localhost:3001/api/health
- CORS ayarlarını kontrol edin
- Environment variables'ları doğrulayın

### Firebase Authentication problemi:
- Firebase config'i kontrol edin
- API keys'in doğru olduğundan emin olun

### Build hataları:
- `npm install` komutunu tekrar çalıştırın
- Node.js versiyonunu kontrol edin (16+ önerili)
