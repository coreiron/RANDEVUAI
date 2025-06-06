import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccount = require(path.resolve(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://randevuai-b0249-default-rtdb.firebaseio.com"
    });
}

const db = admin.firestore();

const shopImages = [
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1470259078422-826894b933aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
];

const shopNames = [
    'Seyfi Erkek Kuaförü',
    'Elite Bayan Kuaför',
    'Modern Güzellik Merkezi',
    'Relax Spa',
    'Star Berber',
    'Lüks Tırnak Salonu',
    'Gold Masaj Salonu',
    'Fresh Barber',
    'Şık Saç Tasarım',
    'Güzellik Atölyesi',
];

const categories = [
    'Berber',
    'Kuaför',
    'Güzellik Merkezi',
    'Spa',
    'Berber',
    'Tırnak Salonu',
    'Masaj Salonu',
    'Berber',
    'Kuaför',
    'Güzellik Merkezi',
];

const createWorkingHours = () => {
    const workingHours: any = {};
    const days = [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ];
    days.forEach(day => {
        workingHours[day] = { open: '09:00', close: '18:00' };
    });
    return workingHours;
};

const addShopsAndAppointments = async () => {
    const userId = 'test-user-1'; // Örnek kullanıcı
    const userEmail = 'testuser@example.com';
    const now = new Date();

    for (let i = 0; i < 10; i++) {
        // 1. İşletme ekle
        const shopRef = db.collection('shops').doc();
        const shopId = shopRef.id;
        const shopData = {
            name: shopNames[i],
            category: categories[i],
            description: `${shopNames[i]} - ${categories[i]} alanında hizmet verir.`,
            shortDescription: `${categories[i]} hizmetleri.`,
            location: {
                address: 'Örnek Mah. No: ' + (i + 1),
                city: 'İstanbul',
                district: 'Kadıköy',
            },
            contact: {
                phone: '+90555555555' + i,
                email: `info${i}@ornek.com`,
            },
            images: {
                main: shopImages[i],
                gallery: [shopImages[(i + 1) % 10], shopImages[(i + 2) % 10]]
            },
            rating: { average: 4.5 + (i % 3) * 0.1, count: 10 + i },
            isActive: true,
            isVerified: true,
            priceLevel: 2,
            workingHours: createWorkingHours(),
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
        };
        await shopRef.set(shopData);

        // 2. 30 günlük uygunluk (örnek: Firestore'da workingHours zaten haftalık, gün gün eklemeye gerek yok)

        // 3. Her işletmeden bir randevu ekle
        const appointmentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 10, 0, 0);
        const appointmentRef = db.collection('appointments').doc();
        await appointmentRef.set({
            shopId,
            userId,
            userEmail,
            serviceId: 'service-1',
            status: 'confirmed',
            date: admin.firestore.Timestamp.fromDate(appointmentDate),
            time: '10:00',
            duration: 60,
            price: 200 + i * 10,
            notes: 'Otomatik oluşturulmuş örnek randevu',
            shopName: shopNames[i],
            shopImage: shopImages[i],
            serviceName: 'Saç Kesimi',
            address: shopData.location.address + ', ' + shopData.location.district + ', ' + shopData.location.city,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
        });
    }
    console.log('10 işletme ve 10 randevu başarıyla eklendi!');
};

addShopsAndAppointments().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 