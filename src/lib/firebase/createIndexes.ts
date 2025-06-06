
import { REQUIRED_INDEXES } from "./schema";

/**
 * Bu fonksiyon Firestore indekslerini oluşturmak için gerekli bilgileri gösterir.
 * Gerçek bir uygulama için Firebase Console veya CLI üzerinden indeksler manuel olarak eklenir.
 */
export const createFirestoreIndexes = () => {
  console.log("Firestore'da aşağıdaki indeksleri oluşturmanız gerekiyor:");
  
  REQUIRED_INDEXES.forEach((index, i) => {
    console.log(`${i+1}. Koleksiyon: ${index.collection}`);
    console.log(`   Alanlar: ${index.fields.join(', ')}`);
    console.log(`   Sorgu kapsamı: ${index.queryScope}`);
    console.log("---");
  });
  
  console.log(`
Bu indeksleri Firebase Console üzerinden şu adımları izleyerek ekleyebilirsiniz:
1. Firebase Console'da projenizi açın: https://console.firebase.google.com/
2. Firestore Database bölümüne gidin
3. "Indexes" sekmesine tıklayın
4. "Composite" sekmesinde "Add index" butonuna tıklayın
5. Koleksiyon adını ve alanları ekleyin, sorgu kapsamını seçin
6. "Create" butonuna tıklayın

HEMEN YAPMANIZ GEREKEN:
Bu linke tıklayın ve index'i oluşturun:
https://console.firebase.google.com/v1/r/project/randevuai-b0249/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9yYW5kZXZ1YWktYjAyNDkvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Nob3BzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaEgoOcmF0aW5nLmF2ZXJhZ2UQAhoMCghfX25hbWVfXxAC

Alternatif olarak, bu değişiklik ile index'e ihtiyaç olmadan da çalışır.
  `);
  
  return {
    success: true,
    indexes: REQUIRED_INDEXES
  };
};

/**
 * Hata mesajından index linkini çıkartan yardımcı fonksiyon
 */
export const extractIndexLinkFromError = (errorMessage: string): string | null => {
  const linkRegex = /https:\/\/console\.firebase\.google\.com[^\s]*/;
  const match = errorMessage.match(linkRegex);
  return match ? match[0] : null;
};

/**
 * Index hatasını kontrol eden ve kullanıcıya yardımcı olan fonksiyon
 */
export const handleIndexError = (error: any) => {
  if (error.code === 'failed-precondition' && error.message.includes('index')) {
    const indexLink = extractIndexLinkFromError(error.message);
    
    console.error("Firebase Index Hatası!");
    console.error("Bu index'i oluşturmanız gerekiyor:");
    if (indexLink) {
      console.error("Index oluşturma linki:", indexLink);
    }
    console.error("Alternatif: Kod güncellemesi ile index'siz çalışacak şekilde düzenlendi.");
    
    return {
      isIndexError: true,
      indexLink,
      message: "Firestore index'i eksik. Lütfen verilen linke tıklayarak index'i oluşturun veya güncellenmiş kodu kullanın."
    };
  }
  
  return {
    isIndexError: false,
    indexLink: null,
    message: error.message || "Bilinmeyen hata"
  };
};
