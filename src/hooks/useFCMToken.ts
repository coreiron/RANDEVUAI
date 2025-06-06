import { useEffect } from 'react';
import { auth, db, requestNotificationPermissionAndGetToken } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const useFCMToken = () => {
    useEffect(() => {
        const saveToken = async () => {
            const user = auth.currentUser;
            if (!user) return;
            const token = await requestNotificationPermissionAndGetToken();
            if (token) {
                await setDoc(doc(db, 'users', user.uid), { fcmToken: token }, { merge: true });
                console.log(`FCM token Firestore'a kaydedildi: `, token);
            }
        };
        saveToken();
    }, []);
}; 