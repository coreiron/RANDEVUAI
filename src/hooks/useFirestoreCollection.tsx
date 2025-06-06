
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, QueryConstraint, orderBy, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Firestore koleksiyonunu gerçek zamanlı olarak dinleyen hook
 * @param collectionName Dinlenecek koleksiyon adı
 * @param constraints Sorgu kısıtlamaları (where, orderBy vs.)
 * @returns Koleksiyon verisi, yükleniyor durumu ve hata bilgisi
 */
export const useFirestoreCollection = <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      
      // Koleksiyonu querySnapshot ile dinle
      const collectionRef = collection(db, collectionName);
      const q = constraints.length > 0 
        ? query(collectionRef, ...constraints) 
        : query(collectionRef);
      
      // Unsubscribe fonksiyonu, temizleme işlemleri için
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const fetchedData = querySnapshot.docs.map(doc => {
            // Her dökümanı T tipine dönüştür
            return {
              id: doc.id,
              ...doc.data()
            } as unknown as T;  // TypeScript hatasını gidermek için unknown kullanıyoruz
          });
          
          setData(fetchedData);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Firestore collection error:", err);
          setError(err);
          setLoading(false);
        }
      );
      
      // Cleanup function for useEffect
      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up collection listener:", err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      return () => {};
    }
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
};

/**
 * Firestore koleksiyonunu where koşuluyla gerçek zamanlı olarak dinleyen hook
 * @param collectionName Koleksiyon adı
 * @param fieldPath Alan yolu
 * @param operator Karşılaştırma operatörü
 * @param value Karşılaştırılacak değer
 * @param sortField Sıralama alanı (isteğe bağlı)
 * @param sortDirection Sıralama yönü (isteğe bağlı)
 */
export const useFirestoreQuery = <T extends DocumentData>(
  collectionName: string,
  fieldPath: string,
  operator: any,
  value: any,
  sortField?: string,
  sortDirection?: 'asc' | 'desc'
) => {
  const constraints: QueryConstraint[] = [
    where(fieldPath, operator, value)
  ];
  
  if (sortField) {
    constraints.push(orderBy(sortField, sortDirection || 'asc'));
  }
  
  return useFirestoreCollection<T>(collectionName, constraints);
};
