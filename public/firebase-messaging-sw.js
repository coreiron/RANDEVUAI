importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBLSR4EGHzQTCMNJTUE1jCO8yWxnDatXHJqB7",
    authDomain: "randevuai-b0249.firebaseapp.com",
    projectId: "randevuai-b0249",
    storageBucket: "randevuai-b0249.appspot.com",
    messagingSenderId: "111372742104390873210",
    appId: "1:111372742104390873210:web:xxxxxxxxxxxxxxxxxxxx"
});

const messaging = firebase.messaging();

// Arka planda bildirim geldiğinde
messaging.onBackgroundMessage((payload) => {
    console.log('Arka planda bildirim alındı:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
}); 