import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { app } from '@/lib/firebase';
import { toast } from '@/components/ui/sonner';

const messaging = getMessaging(app);

// FCM token'ı al ve topic'lere subscribe ol
export const initializeMessaging = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            });

            // Token'ı Firestore'a kaydet
            const user = auth.currentUser;
            if (user) {
                await setDoc(doc(db, 'users', user.uid), {
                    fcmToken: token,
                    updatedAt: serverTimestamp()
                }, { merge: true });
            }

            // Topic'lere subscribe ol
            await subscribeToTopics(token);

            return token;
        }
    } catch (error) {
        console.error('FCM token alınamadı:', error);
        toast.error('Bildirim izni alınamadı');
    }
};

// Topic'lere subscribe ol
const subscribeToTopics = async (token: string) => {
    try {
        console.log('Topic subscription geçici olarak devre dışı (CORS hatası için)');
        return; // Geçici olarak devre dışı bırak

        const functions = getFunctions(app);
        const subscribeToTopic = httpsCallable(functions, 'subscribeToTopic');

        // Randevu bildirimleri için subscribe ol
        await subscribeToTopic({
            token,
            topic: 'appointment_notifications'
        });

        // Randevu durum bildirimleri için subscribe ol
        await subscribeToTopic({
            token,
            topic: 'appointment_status_notifications'
        });

        console.log('Topic\'lere başarıyla subscribe olundu');
    } catch (error) {
        console.error('Topic\'lere subscribe olunamadı:', error);
    }
};

// Gelen bildirimleri dinle
export const listenToMessages = () => {
    onMessage(messaging, (payload) => {
        console.log('Yeni bildirim alındı:', payload);

        // Bildirim içeriğini göster
        if (payload.notification) {
            toast.info(payload.notification.body || 'Yeni bir bildiriminiz var');
        }

        // HTML içeriği varsa göster
        if (payload.data?.html) {
            // HTML içeriğini modal veya sayfa olarak göster
            // Bu kısmı uygulamanızın ihtiyaçlarına göre özelleştirebilirsiniz
        }
    });
}; 