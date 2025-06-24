import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy, limit, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '../firebase/schema';

export interface AvailabilitySlot {
    id: string;
    shopId: string;
    staffId: string;
    date: Date;
    timeSlots: string[];
    bookedSlots: string[];
    isAvailable: boolean;
    createdAt: Date;
}

/**
 * Belirli bir işletme ve tarih için uygunluk verilerini al
 */
export const getAvailabilityByShopAndDate = async (shopId: string, date: Date): Promise<AvailabilitySlot[]> => {
    try {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const availabilityQuery = query(
            collection(db, COLLECTIONS.AVAILABILITY),
            where("shopId", "==", shopId),
            where("date", "==", Timestamp.fromDate(targetDate)),
            where("isAvailable", "==", true)
        );

        const snapshot = await getDocs(availabilityQuery);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            shopId: doc.data().shopId,
            staffId: doc.data().staffId,
            date: doc.data().date.toDate(),
            timeSlots: doc.data().timeSlots || [],
            bookedSlots: doc.data().bookedSlots || [],
            isAvailable: doc.data().isAvailable,
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Uygunluk verileri alınırken hata:', error);
        return [];
    }
};

/**
 * Belirli bir personel için uygunluk verilerini al
 */
export const getAvailabilityByStaff = async (staffId: string, startDate?: Date, endDate?: Date): Promise<AvailabilitySlot[]> => {
    try {
        let availabilityQuery = query(
            collection(db, COLLECTIONS.AVAILABILITY),
            where("staffId", "==", staffId),
            where("isAvailable", "==", true),
            orderBy("date", "asc")
        );

        if (startDate) {
            availabilityQuery = query(
                collection(db, COLLECTIONS.AVAILABILITY),
                where("staffId", "==", staffId),
                where("date", ">=", Timestamp.fromDate(startDate)),
                where("isAvailable", "==", true),
                orderBy("date", "asc")
            );
        }

        const snapshot = await getDocs(availabilityQuery);
        let results = snapshot.docs.map(doc => ({
            id: doc.id,
            shopId: doc.data().shopId,
            staffId: doc.data().staffId,
            date: doc.data().date.toDate(),
            timeSlots: doc.data().timeSlots || [],
            bookedSlots: doc.data().bookedSlots || [],
            isAvailable: doc.data().isAvailable,
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        // endDate filtresi
        if (endDate) {
            results = results.filter(slot => slot.date <= endDate);
        }

        return results;
    } catch (error) {
        console.error('Personel uygunluk verileri alınırken hata:', error);
        return [];
    }
};

/**
 * Uygun zaman slotları al
 */
export const getAvailableTimeSlots = async (shopId: string, staffId: string, date: Date): Promise<string[]> => {
    try {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const availabilityQuery = query(
            collection(db, COLLECTIONS.AVAILABILITY),
            where("shopId", "==", shopId),
            where("staffId", "==", staffId),
            where("date", "==", Timestamp.fromDate(targetDate)),
            where("isAvailable", "==", true)
        );

        const snapshot = await getDocs(availabilityQuery);

        if (snapshot.empty) {
            return [];
        }

        const availabilityData = snapshot.docs[0].data();
        const allSlots = availabilityData.timeSlots || [];
        const bookedSlots = availabilityData.bookedSlots || [];

        // Rezerve edilmemiş slotları döndür
        return allSlots.filter((slot: string) => !bookedSlots.includes(slot));
    } catch (error) {
        console.error('Uygun zaman slotları alınırken hata:', error);
        return [];
    }
};

/**
 * Zaman slotunu rezerve et
 */
export const bookTimeSlot = async (shopId: string, staffId: string, date: Date, timeSlot: string): Promise<boolean> => {
    try {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const availabilityQuery = query(
            collection(db, COLLECTIONS.AVAILABILITY),
            where("shopId", "==", shopId),
            where("staffId", "==", staffId),
            where("date", "==", Timestamp.fromDate(targetDate))
        );

        const snapshot = await getDocs(availabilityQuery);

        if (snapshot.empty) {
            console.error('Bu tarih için uygunluk bulunamadı');
            return false;
        }

        const availabilityDoc = snapshot.docs[0];
        const availabilityData = availabilityDoc.data();
        const currentBookedSlots = availabilityData.bookedSlots || [];

        // Eğer slot zaten rezerve edilmişse
        if (currentBookedSlots.includes(timeSlot)) {
            console.error('Bu zaman slotu zaten rezerve edilmiş');
            return false;
        }

        // Yeni rezerve edilen slotu ekle
        const updatedBookedSlots = [...currentBookedSlots, timeSlot];

        await updateDoc(doc(db, COLLECTIONS.AVAILABILITY, availabilityDoc.id), {
            bookedSlots: updatedBookedSlots
        });

        return true;
    } catch (error) {
        console.error('Zaman slotu rezerve edilirken hata:', error);
        return false;
    }
};

/**
 * Zaman slotu rezervasyonunu iptal et
 */
export const cancelTimeSlot = async (shopId: string, staffId: string, date: Date, timeSlot: string): Promise<boolean> => {
    try {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const availabilityQuery = query(
            collection(db, COLLECTIONS.AVAILABILITY),
            where("shopId", "==", shopId),
            where("staffId", "==", staffId),
            where("date", "==", Timestamp.fromDate(targetDate))
        );

        const snapshot = await getDocs(availabilityQuery);

        if (snapshot.empty) {
            console.error('Bu tarih için uygunluk bulunamadı');
            return false;
        }

        const availabilityDoc = snapshot.docs[0];
        const availabilityData = availabilityDoc.data();
        const currentBookedSlots = availabilityData.bookedSlots || [];

        // Rezervasyonu iptal et
        const updatedBookedSlots = currentBookedSlots.filter((slot: string) => slot !== timeSlot);

        await updateDoc(doc(db, COLLECTIONS.AVAILABILITY, availabilityDoc.id), {
            bookedSlots: updatedBookedSlots
        });

        return true;
    } catch (error) {
        console.error('Zaman slotu rezervasyonu iptal edilirken hata:', error);
        return false;
    }
};

/**
 * İşletme için yaklaşan müsait randevuları al
 */
export const getUpcomingAvailability = async (shopId: string, days: number = 30): Promise<AvailabilitySlot[]> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = new Date(today);
        endDate.setDate(today.getDate() + days);

        const availabilityQuery = query(
            collection(db, COLLECTIONS.AVAILABILITY),
            where("shopId", "==", shopId),
            where("date", ">=", Timestamp.fromDate(today)),
            where("date", "<=", Timestamp.fromDate(endDate)),
            where("isAvailable", "==", true),
            orderBy("date", "asc"),
            limit(100)
        );

        const snapshot = await getDocs(availabilityQuery);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            shopId: doc.data().shopId,
            staffId: doc.data().staffId,
            date: doc.data().date.toDate(),
            timeSlots: doc.data().timeSlots || [],
            bookedSlots: doc.data().bookedSlots || [],
            isAvailable: doc.data().isAvailable,
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Yaklaşan uygunluk verileri alınırken hata:', error);
        return [];
    }
};

export const availabilityService = {
    getAvailabilityByShopAndDate,
    getAvailabilityByStaff,
    getAvailableTimeSlots,
    bookTimeSlot,
    cancelTimeSlot,
    getUpcomingAvailability
}; 