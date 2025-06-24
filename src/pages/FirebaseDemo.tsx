import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { initializeFirestoreCollections } from '@/lib/firebase/initializeFirestore';
import { createFirestoreIndexes } from '@/lib/firebase/createIndexes';
import { REQUIRED_INDEXES } from '@/lib/firebase/schema';
import { toast } from '@/components/ui/sonner';
import {
  clearAllDataInBatches,
  createRealBusinessData,
  keepOnlyRealBusinesses,
  clearUserAppointments,
  clearCurrentUserData,
  createBusinessAccounts,
  simulateBusinessLogin,
  addAvailabilityToAllShops,
  testAvailabilityWrite,
  addOnlyAvailabilityToShops
} from '@/lib/firebase/seedData';
import { userApi } from '@/lib/api/userApi';

const FirebaseDemo = () => {
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const checkCollections = async () => {
    setLoading(true);
    try {
      // Firebase'de tüm koleksiyonları listeleyen API yok, bu yüzden bilinen koleksiyonları kontrol edeceğiz
      const knownCollections = ['users', 'shops', 'services', 'appointments', 'reviews', 'staff', 'messages', 'notifications'];
      const existingCollections = [];

      for (const collectionName of knownCollections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          if (snapshot.docs.length >= 0) { // Koleksiyon varsa (boş olsa bile)
            existingCollections.push(`${collectionName} (${snapshot.docs.length} döküman)`);
          }
        } catch (error) {
          // Koleksiyon yoksa hata verir, bu normal
        }
      }

      setCollections(existingCollections);
    } catch (error) {
      console.error('Koleksiyonlar kontrol edilirken hata:', error);
      toast.error('Koleksiyonlar kontrol edilemedi');
    } finally {
      setLoading(false);
    }
  };

  const initializeSchema = async () => {
    setLoading(true);
    try {
      const result = await initializeFirestoreCollections();

      if (result.success) {
        toast.success(result.message);
        checkCollections(); // Koleksiyonları yeniden kontrol et
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Şema oluşturulurken hata:', error);
      toast.error('Şema oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const showIndexes = () => {
    const result = createFirestoreIndexes();
    if (result.success) {
      toast.success('Index bilgileri konsola yazdırıldı');
    }
  };

  // Veri Yönetim Fonksiyonları
  const handleClearAllData = async () => {
    if (!confirm('Tüm verileri silmek istediğinizden emin misiniz?')) return;

    setDataLoading(true);
    try {
      const result = await clearAllDataInBatches();
      if (result.success) {
        toast.success(`✅ ${result.deletedCount} döküman silindi`);
        checkCollections();
      } else {
        toast.error(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      toast.error('Temizlik sırasında hata oluştu');
    } finally {
      setDataLoading(false);
    }
  };

  const handleCreateRealData = async () => {
    setDataLoading(true);
    try {
      const result = await createRealBusinessData();
      if (result.success) {
        toast.success(`✅ ${result.businessCount} gerçek işletme oluşturuldu`);
        checkCollections();
      } else {
        toast.error(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      toast.error('Veri oluşturma sırasında hata oluştu');
    } finally {
      setDataLoading(false);
    }
  };

  const handleKeepOnlyReal = async () => {
    if (!confirm('Sadece 10 gerçek işletmeyi bırakıp geri kalanını silmek istediğinizden emin misiniz?')) return;

    setDataLoading(true);
    try {
      const result = await keepOnlyRealBusinesses();
      if (result.success) {
        toast.success(`✅ ${result.deletedShops} test işletme silindi, ${result.keptShops} gerçek işletme kaldı`);
        checkCollections();
      } else {
        toast.error(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      toast.error('Temizlik sırasında hata oluştu');
    } finally {
      setDataLoading(false);
    }
  };

  const handleFullReset = async () => {
    if (!confirm('Sistemi tamamen sıfırlamak istediğinizden emin misiniz?')) return;

    setDataLoading(true);
    try {
      toast.info('Sistem sıfırlanıyor...');

      // 1. Tüm verileri temizle
      const clearResult = await clearAllDataInBatches();
      if (!clearResult.success) {
        throw new Error(clearResult.error);
      }

      // 2. Gerçek verileri oluştur
      const createResult = await createRealBusinessData();
      if (!createResult.success) {
        throw new Error(createResult.error);
      }

      toast.success(`✅ Sistem başarıyla sıfırlandı! ${createResult.businessCount} gerçek işletme oluşturuldu`);
      checkCollections();
    } catch (error) {
      toast.error('Sistem sıfırlama sırasında hata oluştu: ' + error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleClearUserData = async () => {
    if (!confirm('Mevcut kullanıcının tüm verilerini silmek istediğinizden emin misiniz?')) return;

    setDataLoading(true);
    try {
      const result = await clearCurrentUserData();
      if (result.success) {
        toast.success('✅ Kullanıcı verileri temizlendi');
      } else {
        toast.error(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      toast.error('Kullanıcı veri temizleme sırasında hata oluştu');
    } finally {
      setDataLoading(false);
    }
  };

  const handleClearMyAppointments = async () => {
    if (!confirm('nyalcinozdemir96@gmail.com hesabının randevularını silmek istediğinizden emin misiniz?')) return;

    setDataLoading(true);
    try {
      const result = await clearUserAppointments("nyalcinozdemir96@gmail.com");
      if (result.success) {
        toast.success(`✅ ${result.deletedCount} randevu silindi`);
      } else {
        toast.error(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      toast.error('Randevu temizleme sırasında hata oluştu');
    } finally {
      setDataLoading(false);
    }
  };

  // İşletme hesabı yönetim fonksiyonları
  const handleCreateBusinessAccounts = async () => {
    if (!confirm('10 işletme için işletme hesapları oluşturmak istediğinizden emin misiniz?')) return;

    setDataLoading(true);
    try {
      const result = await createBusinessAccounts();
      if (result.success) {
        toast.success(`✅ ${result.accountCount} işletme hesabı oluşturuldu`);
        checkCollections();
      } else {
        toast.error(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      toast.error('İşletme hesapları oluşturulurken hata oluştu');
    } finally {
      setDataLoading(false);
    }
  };

  const handleCreateRealFirebaseAccounts = async () => {
    if (!confirm('10 işletme için GERÇEK Firebase Authentication hesapları oluşturmak istediğinizden emin misiniz? Bu hesaplarla giriş yapabilecekler.')) return;

    setDataLoading(true);
    try {
      const result = await userApi.createBusinessAuthAccounts();
      if (result.success) {
        toast.success(`✅ ${result.data.created} gerçek Firebase hesabı oluşturuldu!`);
        console.log('📋 Oluşturulan hesaplar:', result.data.accounts);
        checkCollections();
      } else {
        toast.error(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      toast.error('Firebase hesapları oluşturulurken hata oluştu');
    } finally {
      setDataLoading(false);
    }
  };

  const handleBusinessLogin = async (shopName: string) => {
    setDataLoading(true);
    try {
      const result = await simulateBusinessLogin(shopName);
      if (result.success) {
        toast.success(`✅ ${shopName} işletme hesabına giriş simüle edildi`);
        console.log('Business Login Details:', result);
      } else {
        toast.error(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      toast.error('İşletme girişi simüle edilirken hata oluştu');
    } finally {
      setDataLoading(false);
    }
  };

  // Uygunluk test fonksiyonu
  const handleTestAvailability = async () => {
    setDataLoading(true);
    try {
      const result = await testAvailabilityWrite();
      if (result.success) {
        toast.success(`✅ ${result.message}`);
      } else {
        toast.error(`❌ Test başarısız: ${result.error}`);
      }
    } catch (error) {
      console.error('Availability test hatası:', error);
      toast.error('Test sırasında hata oluştu: ' + error);
    } finally {
      setDataLoading(false);
    }
  };

  // Sadece uygunluk ekleme fonksiyonu (ULTRA HIZLI)
  const handleAddOnlyAvailability = async () => {
    if (!confirm('SADECE tüm işletmelere uygunluk eklemek istediğinizden emin misiniz?\n\nBu ultra hızlı versiyon, sadece uygunluk ekler, diğer hiçbir şeyi değiştirmez.')) return;

    setDataLoading(true);
    toast.info('🚀 Sadece uygunluk ekleniyor... (Ultra hızlı mod)');

    try {
      const result = await addOnlyAvailabilityToShops();
      if (result.success) {
        toast.success(`✅ BAŞARILI! ${result.processedShops} işletme için ${result.totalAvailability} uygunluk kaydı eklendi!`);
        checkCollections();
      } else {
        toast.error(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      console.error('Uygunluk ekleme hatası:', error);
      toast.error('Uygunluk ekleme sırasında hata oluştu: ' + error);
    } finally {
      setDataLoading(false);
    }
  };

  // Uygunluk ekleme fonksiyonu
  const handleAddAvailability = async () => {
    if (!confirm('Tüm işletmelere 2 personel, 2 hizmet ve 30 gün uygunluk eklemek istediğinizden emin misiniz?\n\nBu işlem optimized batch modda çalışacak ve çok hızlı olacak.')) return;

    setDataLoading(true);
    toast.info('🕐 Uygunluk ekleme başladı... (Bu işlem 30-60 saniye sürebilir)');

    try {
      const result = await addAvailabilityToAllShops();
      if (result.success) {
        toast.success(`✅ Başarılı! ${result.processedShops} işletme, ${result.totalAvailability} uygunluk kaydı eklendi!`);
        checkCollections();
      } else {
        toast.error(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      console.error('Uygunluk ekleme hatası:', error);
      toast.error('Uygunluk ekleme sırasında hata oluştu: ' + error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    checkCollections();
  }, []);

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Firebase Demo & Veri Yönetimi</h1>

      <Tabs defaultValue="collections" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="collections">Koleksiyonlar</TabsTrigger>
          <TabsTrigger value="indexes">İndeksler</TabsTrigger>
          <TabsTrigger value="data">Veri Yönetimi</TabsTrigger>
          <TabsTrigger value="business">İşletme Hesapları</TabsTrigger>
          <TabsTrigger value="tools">Araçlar</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Firestore Koleksiyonları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={checkCollections} disabled={loading}>
                  {loading ? 'Kontrol Ediliyor...' : 'Koleksiyonları Kontrol Et'}
                </Button>
                <Button onClick={initializeSchema} disabled={loading} variant="outline">
                  Şemayı Oluştur
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Mevcut Koleksiyonlar:</h3>
                {collections.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {collections.map((collection) => (
                      <li key={collection} className="text-green-600">
                        ✅ {collection}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Koleksiyon bulunamadı</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indexes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Firestore İndeksleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={showIndexes}>
                İndeks Bilgilerini Göster
              </Button>

              <div>
                <h3 className="text-lg font-semibold mb-2">Gerekli İndeksler:</h3>
                <div className="space-y-2">
                  {REQUIRED_INDEXES.map((index, i) => (
                    <div key={i} className="border rounded p-3">
                      <div><strong>Koleksiyon:</strong> {index.collection}</div>
                      <div><strong>Alanlar:</strong> {index.fields.join(', ')}</div>
                      <div><strong>Kapsam:</strong> {index.queryScope}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🗂️ Veri Yönetimi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Tehlikeli İşlemler</h3>
                <div className="space-y-2">
                  <Button
                    onClick={handleClearAllData}
                    disabled={dataLoading}
                    variant="destructive"
                    className="w-full"
                  >
                    {dataLoading ? '🧹 Temizlik İşlemi Devam Ediyor...' : '🗑️ Tüm Verileri Temizle'}
                  </Button>
                  <p className="text-sm text-red-600">Tüm koleksiyonlardaki tüm verileri siler (güvenli şekilde, küçük parçalarda)</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">🏗️ Veri Oluşturma</h3>
                <div className="space-y-2">
                  <Button
                    onClick={handleCreateRealData}
                    disabled={dataLoading}
                    className="w-full"
                  >
                    {dataLoading ? '🏪 Oluşturma İşlemi Devam Ediyor...' : '🏪 10 Gerçek İşletme Oluştur'}
                  </Button>
                  <p className="text-sm text-blue-600">10 gerçek işletme, her biri için 5 hizmet, 5 personel ve 30 gün uygunluk oluşturur</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">🎯 Akıllı Temizlik</h3>
                <div className="space-y-2">
                  <Button
                    onClick={handleKeepOnlyReal}
                    disabled={dataLoading}
                    className="w-full"
                  >
                    {dataLoading ? '🧹 Temizlik İşlemi Devam Ediyor...' : '✨ Sadece 10 Gerçek İşletmeyi Bırak'}
                  </Button>
                  <p className="text-sm text-green-600">Test verilerini siler, sadece gerçek 10 işletmeyi ve ilgili verilerini bırakır</p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">🔄 Tam Sıfırlama</h3>
                <div className="space-y-2">
                  <Button
                    onClick={handleFullReset}
                    disabled={dataLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {dataLoading ? '🔄 Sıfırlama İşlemi Devam Ediyor...' : '🔄 Sistemi Tamamen Sıfırla'}
                  </Button>
                  <p className="text-sm text-purple-600">Tüm verileri temizler, sonra 10 gerçek işletme oluşturur (En güvenli seçenek)</p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">🕐 Uygunluk İşlemleri</h3>
                <div className="space-y-2">
                  <Button
                    onClick={handleTestAvailability}
                    disabled={dataLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {dataLoading ? '🧪 Test Ediliyor...' : '🧪 Availability İzin Testi'}
                  </Button>
                  <Button
                    onClick={handleAddOnlyAvailability}
                    disabled={dataLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    {dataLoading ? '🚀 SADECE Uygunluk Ekleniyor...' : '🚀 SADECE UYGUNLUK EKLE (Ultra Hızlı)'}
                  </Button>
                  <Button
                    onClick={handleAddAvailability}
                    disabled={dataLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {dataLoading ? '🕐 Uygunluk Ekleniyor...' : '🕐 Personel+Hizmet+Uygunluk Ekle'}
                  </Button>
                  <p className="text-sm text-orange-600">
                    <span className="block">🧪 1. Önce izin testini çalıştırın</span>
                    <span className="block">🚀 2. SADECE UYGUNLUK EKLE butonunu kullanın (ÖNERİLEN)</span>
                    <span className="block text-gray-500">🕐 3. Veya tam versiyon: Personel+Hizmet+Uygunluk</span>
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">👤 Kullanıcı İşlemleri</h3>
                <div className="space-y-2">
                  <Button
                    onClick={handleClearUserData}
                    disabled={dataLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {dataLoading ? '🧹 Temizlik İşlemi Devam Ediyor...' : '🧹 Mevcut Kullanıcı Verilerini Temizle'}
                  </Button>
                  <Button
                    onClick={handleClearMyAppointments}
                    disabled={dataLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {dataLoading ? '📅 Temizlik İşlemi Devam Ediyor...' : '📅 nyalcinozdemir96@gmail.com Randevularını Temizle'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🏢 İşletme Hesap Yönetimi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Hesap Oluşturma</h3>
                <div className="space-y-3">
                  <div>
                    <Button
                      onClick={handleCreateBusinessAccounts}
                      disabled={dataLoading}
                      className="w-full"
                      variant="outline"
                    >
                      {dataLoading ? '🏢 Firestore Hesapları Oluşturuluyor...' : '📊 Firestore İşletme Verileri Oluştur'}
                    </Button>
                    <p className="text-sm text-blue-600 mt-1">Sadece Firestore'a işletme verisi ekler (giriş yapamazlar)</p>
                  </div>

                  <div>
                    <Button
                      onClick={handleCreateRealFirebaseAccounts}
                      disabled={dataLoading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {dataLoading ? '🔐 Gerçek Hesaplar Oluşturuluyor...' : '🔐 GERÇEK Firebase Auth Hesapları Oluştur'}
                    </Button>
                    <p className="text-sm text-green-600 mt-1">Email ve şifre ile giriş yapabilecekleri gerçek hesaplar oluşturur</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-4">İşletme Hesaplarına Giriş Simülasyonu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Elite Güzellik Merkezi",
                    "Modern Erkek Kuaförü",
                    "Fit Life Spor Salonu",
                    "Lezzet Mutfağı",
                    "Sağlık Merkezi Plus",
                    "TechFix Bilgisayar",
                    "Kreatif Sanat Atölyesi",
                    "Oto Bakım Merkezi",
                    "Pet Bakım Salonu"
                  ].map((shopName, index) => (
                    <Button
                      key={shopName}
                      onClick={() => handleBusinessLogin(shopName)}
                      disabled={dataLoading}
                      variant="outline"
                      className="text-left justify-start"
                    >
                      <span className="mr-2">{index + 1}.</span>
                      {shopName}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-green-600 mt-3">
                  Bu butonlar işletme hesabı girişini simüle eder ve randevu yönetimi için gerekli bilgileri konsola yazdırır
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">📋 İşletme Hesap Bilgileri</h3>
                <div className="text-sm space-y-2">
                  <div><strong>Hesap Türü:</strong> İşletme Sahibi (business_owner)</div>
                  <div><strong>Yetkiler:</strong> Randevu yönetimi, personel yönetimi, hizmet yönetimi, analitik görüntüleme</div>
                  <div><strong>Email Formatı:</strong> info@[işletmeadı].com</div>
                  <div><strong>Şifre Formatı:</strong> [İşletmeAdı]2024!</div>
                  <div className="mt-3 p-2 bg-yellow-100 rounded">
                    <strong>Örnek:</strong> Elite Güzellik Merkezi
                    <br />📧 info@eliteguzellik.com
                    <br />🔑 Elite2024!
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🛠️ Geliştirici Araçları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>📊 Durum:</strong> {dataLoading ? 'İşlem devam ediyor...' : 'Hazır'}</p>
                <p><strong>🗃️ Toplam Koleksiyon:</strong> {collections.length}</p>
                <p><strong>🔥 Firebase:</strong> Bağlı ve çalışıyor</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Önerilen İş Akışı:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Sistemi Tamamen Sıfırla (En güvenli)</li>
                  <li>Koleksiyonları Kontrol Et</li>
                  <li>Uygulamada test et</li>
                  <li>Gerekirse kullanıcı verilerini temizle</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FirebaseDemo;
