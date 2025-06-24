import { format, parse } from 'date-fns';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS } from './firebase/schema';
import { getAvailabilityByShopAndDate } from './services/availabilityService';

// Örnek veri - gerçek uygulamada API'den veya Firestore'dan gelecek
export const availableTimeSlots = {
  "2025-05-20": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  "2025-05-21": ["10:00", "11:00", "13:00", "14:00", "15:00"],
  "2025-05-22": ["09:00", "12:00", "15:00", "16:00", "17:00"],
  "2025-05-23": ["10:00", "11:00", "14:00", "16:00"],
  "2025-05-24": ["09:00", "10:00", "12:00", "15:00"],
  "2025-05-25": ["11:00", "13:00", "14:00", "16:00"],
  "2025-05-26": ["09:00", "10:00", "15:00", "17:00"],
  "2025-05-27": ["10:00", "12:00", "14:00", "16:00"],
  "2025-05-28": ["09:00", "11:00", "13:00", "15:00"],
  "2025-05-29": ["10:00", "12:00", "14:00", "16:00"],
  "2025-05-30": ["09:00", "11:00", "13:00", "15:00", "17:00"],
  "2025-06-01": ["10:00", "12:00", "14:00", "16:00"],
  "2025-06-02": ["09:00", "11:00", "13:00", "15:00"],
  "2025-06-03": ["10:00", "12:00", "14:00", "16:00"],
  "2025-06-04": ["09:00", "11:00", "13:00", "15:00"],
  "2025-06-05": ["10:00", "12:00", "14:00", "16:00"],
  "2025-06-06": ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
};

// Firestore'dan varolan randevuları getir - index gerektirmeyen basit sorgu
export const getExistingAppointments = async (shopId: string, date?: Date) => {
  try {
    // Sadece shopId ile filtrele - index gerektirmez
    const appointmentsQuery = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where("shopId", "==", shopId)
    );

    const querySnapshot = await getDocs(appointmentsQuery);
    console.log("📅 Found appointments count:", querySnapshot.docs.length);

    const appointments = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // İptal edilmiş randevuları hariç tut
      if (data.status === 'canceled') {
        return;
      }

      // Eğer tarih filtresi varsa, client-side'da filtrele
      if (date) {
        const appointmentDate = data.date?.toDate?.() || new Date(data.date);
        const targetDate = new Date(date);

        // Aynı gün kontrolü
        if (appointmentDate.toDateString() === targetDate.toDateString()) {
          appointments.push({
            id: doc.id,
            ...data
          });
        }
      } else {
        appointments.push({
          id: doc.id,
          ...data
        });
      }
    });

    return appointments;
  } catch (error) {
    console.error("Error getting existing appointments:", error);
    return [];
  }
};

// Seçilen tarihteki müsait saatleri getir
export const getAvailableTimesForDate = async (date: Date | undefined, shopId: string) => {
  if (!date) return [];

  try {
    console.log("🔍 Fetching availability for:", { shopId, date: format(date, 'yyyy-MM-dd') });

    // Firebase'den gerçek availability verilerini çek
    const availabilitySlots = await getAvailabilityByShopAndDate(shopId, date);
    console.log("📊 Found availability slots:", availabilitySlots.length);

    if (availabilitySlots.length === 0) {
      console.log("⚠️ No availability slots found for this date");
      return [];
    }

    // Tüm müsait zaman slotlarını topla
    const allAvailableSlots: string[] = [];
    availabilitySlots.forEach(slot => {
      const timeSlots = slot.timeSlots || [];
      const bookedSlots = slot.bookedSlots || [];

      // Rezerve edilmemiş slotları ekle
      const freeSlots = timeSlots.filter(time => !bookedSlots.includes(time));
      allAvailableSlots.push(...freeSlots);
    });

    // Duplikat saatleri kaldır ve sırala
    const uniqueSlots = [...new Set(allAvailableSlots)].sort();
    console.log("✅ Available time slots:", uniqueSlots);

    // Aynı tarih ve işletmedeki mevcut randevuları kontrol et
    const existingAppointments = await getExistingAppointments(shopId, date);

    // Dolu saatleri çıkar (iptal edilmiş randevular hariç)
    const bookedTimes = existingAppointments
      .filter((app: any) => app.status !== 'canceled')
      .map((app: any) =>
        typeof app.date === 'object' && app.date.toDate
          ? format(app.date.toDate(), 'HH:mm')
          : format(new Date(app.date), 'HH:mm')
      );

    const finalAvailableSlots = uniqueSlots.filter(time => !bookedTimes.includes(time));
    console.log("🎯 Final available slots after filtering appointments:", finalAvailableSlots);

    return finalAvailableSlots;
  } catch (error) {
    console.error("❌ Error getting available times:", error);
    return []; // Hata durumunda boş array döndür
  }
};

// Tarih formatını yyyy-MM-dd olarak döndürür
export const formatDateForStorage = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

// Tarih ve saat birleştirerek tam tarih objesi oluşturur
export const combineDateTime = (date: Date, timeString: string) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return parse(`${dateStr} ${timeString}`, 'yyyy-MM-dd HH:mm', new Date());
};
