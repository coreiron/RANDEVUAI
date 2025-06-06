import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import * as cors from 'cors';
import * as express from 'express';

admin.initializeApp();

// Shop interface
interface Shop {
    id: string;
    name?: string;
    description?: string;
    category?: string;
    address?: string;
    district?: string;
    city?: string;
    [key: string]: any;
}

// Middleware for authentication
const authenticateUser = async (req: any, res: any, next: any) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ success: false, error: 'Yetkilendirme token\'ı bulunamadı' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Geçersiz token' });
    }
};

// E-posta gönderici yapılandırması
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: functions.config().email.user,
        pass: functions.config().email.password
    },
    debug: true,
    logger: true
});

// Randevu onay e-postası gönder
export const sendAppointmentEmail = functions
    .region('us-central1')
    .runWith({
        timeoutSeconds: 300,
        memory: '256MB'
    })
    .https.onRequest((request, response) => {
        return cors({
            origin: true,
            methods: ['POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        })(request, response, async () => {
            try {
                const data = request.body;
                console.log('📧 E-posta gönderimi başlatılıyor:', JSON.stringify(data, null, 2));

                // E-posta yapılandırmasını kontrol et
                const emailConfig = {
                    user: functions.config().email.user,
                    hasPassword: !!functions.config().email.password,
                    passwordLength: functions.config().email.password ? functions.config().email.password.length : 0
                };
                console.log('📧 E-posta yapılandırması:', emailConfig);

                const { to, subject, html, text, appointmentId, shopName, serviceName, appointmentDate, appointmentTime } = data;

                if (!to || !subject || (!html && !text)) {
                    console.error('❌ Eksik parametreler:', { to, subject, hasHtml: !!html, hasText: !!text });
                    throw new Error('Eksik parametreler');
                }

                console.log('📧 E-posta gönderiliyor:', { to, subject });

                // E-posta gönder
                const mailOptions = {
                    from: `"RandevuAI" <${functions.config().email.user}>`,
                    to,
                    subject,
                    html,
                    text
                };

                console.log('📧 Mail options:', mailOptions);

                const info = await transporter.sendMail(mailOptions);

                console.log('✅ E-posta başarıyla gönderildi:', info.messageId);

                // E-posta gönderim kaydını tut
                await admin.firestore().collection('email_logs').add({
                    type: 'appointment_confirmation',
                    to,
                    appointmentId,
                    shopName,
                    serviceName,
                    appointmentDate,
                    appointmentTime,
                    sentAt: admin.firestore.FieldValue.serverTimestamp(),
                    messageId: info.messageId,
                    emailStatus: 'sent',
                    config: emailConfig
                });

                response.json({ success: true, messageId: info.messageId });
            } catch (error) {
                console.error('❌ E-posta gönderim hatası:', error);

                // Hata detaylarını logla
                if (error instanceof Error) {
                    console.error('Hata detayları:', {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    });
                }

                // Hata kaydını tut
                await admin.firestore().collection('email_logs').add({
                    type: 'appointment_confirmation',
                    to: request.body.to,
                    error: error instanceof Error ? error.message : 'Bilinmeyen hata',
                    sentAt: admin.firestore.FieldValue.serverTimestamp(),
                    emailStatus: 'error',
                    config: {
                        user: functions.config().email.user,
                        hasPassword: !!functions.config().email.password,
                        passwordLength: functions.config().email.password ? functions.config().email.password.length : 0
                    }
                });

                response.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Bilinmeyen hata'
                });
            }
        });
    });

// Randevu durum e-postası gönder
export const sendAppointmentStatusEmail = functions
    .region('us-central1')
    .runWith({
        timeoutSeconds: 300,
        memory: '256MB'
    })
    .https.onRequest((request, response) => {
        return cors({
            origin: true,
            methods: ['POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        })(request, response, async () => {
            try {
                const data = request.body;
                const { to, userName, shopName, serviceName, appointmentDate, status } = data;

                const statusMessages: Record<string, string> = {
                    confirmed: 'Randevunuz Onaylandı!',
                    canceled: 'Randevunuz İptal Edildi',
                    completed: 'Randevunuz Tamamlandı'
                };

                const statusMessage = statusMessages[status] || 'Randevu Durumu Güncellendi';
                const subject = `${statusMessage} - ${shopName}`;

                const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>${statusMessage}</title>
                </head>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">${statusMessage}</h1>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                            Merhaba <strong>${userName}</strong>,
                        </p>
                        
                        <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
                            <strong>${shopName}</strong> işletmesindeki randevunuzun durumu güncellendi.
                        </p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                            <h3 style="color: #007bff; margin: 0 0 15px 0;">Randevu Detayları</h3>
                            <p style="margin: 5px 0;"><strong>İşletme:</strong> ${shopName}</p>
                            <p style="margin: 5px 0;"><strong>Hizmet:</strong> ${serviceName}</p>
                            <p style="margin: 5px 0;"><strong>Tarih:</strong> ${new Date(appointmentDate).toLocaleDateString('tr-TR')}</p>
                            <p style="margin: 5px 0;"><strong>Durum:</strong> ${statusMessage}</p>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                        
                        <p style="font-size: 14px; color: #6c757d; text-align: center; margin: 0;">
                            Bu e-posta otomatik olarak gönderilmiştir. Yanıtlamayınız.
                        </p>
                    </div>
                </body>
                </html>
            `;

                const text = `
                ${statusMessage} - ${shopName}
                
                Merhaba ${userName},
                
                ${shopName} işletmesindeki randevunuzun durumu güncellendi.
                
                Randevu Detayları:
                - İşletme: ${shopName}
                - Hizmet: ${serviceName}
                - Tarih: ${new Date(appointmentDate).toLocaleDateString('tr-TR')}
                - Durum: ${statusMessage}
            `;

                // E-posta gönder
                const info = await transporter.sendMail({
                    from: `"RandevuAI" <${functions.config().email.user}>`,
                    to,
                    subject,
                    html,
                    text
                });

                console.log('Randevu durum e-postası gönderildi:', to);

                // E-posta gönderim kaydını tut
                await admin.firestore().collection('email_logs').add({
                    type: 'appointment_status',
                    to,
                    shopName,
                    serviceName,
                    appointmentDate,
                    appointmentStatus: status,
                    sentAt: admin.firestore.FieldValue.serverTimestamp(),
                    messageId: info.messageId,
                    emailStatus: 'sent'
                });

                response.json({ success: true, messageId: info.messageId });
            } catch (error) {
                console.error('E-posta gönderim hatası:', error);

                // Hata kaydını tut
                await admin.firestore().collection('email_logs').add({
                    type: 'appointment_status',
                    error: error instanceof Error ? error.message : 'Bilinmeyen hata',
                    sentAt: admin.firestore.FieldValue.serverTimestamp(),
                    emailStatus: 'error'
                });

                response.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Bilinmeyen hata'
                });
            }
        });
    });

// Topic'e subscribe ol
export const subscribeToTopic = functions
    .region('us-central1')
    .https.onCall(async (data: any, context: any) => {
        try {
            const { token, topic } = data.data;

            if (!token || !topic) {
                throw new Error('Eksik parametreler');
            }

            await admin.messaging().subscribeToTopic(token, topic);
            console.log(`Token başarıyla ${topic} topic'ine subscribe oldu`);

            return { success: true };
        } catch (error) {
            console.error('Topic subscription hatası:', error);
            throw new functions.https.HttpsError('internal', 'Topic\'e subscribe olunamadı');
        }
    });

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Tüm işletmeleri dönen endpoint
app.get('/shops', async (req, res) => {
    try {
        const snapshot = await admin.firestore()
            .collection('shops')
            .where('isActive', '==', true) // Sadece aktif işletmeler
            .get();

        const shops = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`📊 Returning ${shops.length} active shops`);
        return res.json({ success: true, data: shops });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// İşletme detayları
app.get('/shops/:shopId', async (req, res) => {
    try {
        const { shopId } = req.params;
        const doc = await admin.firestore().collection('shops').doc(shopId).get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'İşletme bulunamadı' });
        }

        const shop = { id: doc.id, ...doc.data() };
        return res.json({ success: true, data: shop });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Kategoriye göre işletmeler
app.get('/shops/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const snapshot = await admin.firestore()
            .collection('shops')
            .where('category', '==', category)
            .get();

        const shops = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.json({ success: true, data: shops });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// İşletme hizmetleri
app.get('/shops/:shopId/services', async (req, res) => {
    try {
        const { shopId } = req.params;
        const snapshot = await admin.firestore()
            .collection('services')
            .where('shopId', '==', shopId)
            .get();

        const services = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.json({ success: true, data: services });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// İşletme personeli
app.get('/shops/:shopId/staff', async (req, res) => {
    try {
        const { shopId } = req.params;
        const snapshot = await admin.firestore()
            .collection('staff')
            .where('shopId', '==', shopId)
            .get();

        const staff = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.json({ success: true, data: staff });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Arama endpoint'i
app.get('/search', async (req, res) => {
    try {
        const { q, category, location } = req.query;
        const snapshot = await admin.firestore()
            .collection('shops')
            .where('isActive', '==', true) // Sadece aktif işletmeler
            .get();

        let shops: Shop[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Shop[];

        // Kategori filtresi
        if (category && category !== 'all' && typeof category === 'string') {
            shops = shops.filter(shop => shop.category === category);
        }

        // Metin araması (basit string match)
        if (q && typeof q === 'string') {
            const searchTerm = q.toLowerCase();
            shops = shops.filter(shop =>
                shop.name?.toLowerCase().includes(searchTerm) ||
                shop.description?.toLowerCase().includes(searchTerm) ||
                shop.category?.toLowerCase().includes(searchTerm)
            );
        }

        // Lokasyon filtresi
        if (location && typeof location === 'string') {
            shops = shops.filter(shop =>
                shop.address?.toLowerCase().includes(location.toLowerCase()) ||
                shop.district?.toLowerCase().includes(location.toLowerCase()) ||
                shop.city?.toLowerCase().includes(location.toLowerCase())
            );
        }

        console.log(`🔍 Search returned ${shops.length} shops for query: "${q}", category: "${category}", location: "${location}"`);
        return res.json({ success: true, data: shops });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Kullanıcının işletmelerini getir (business owner için)
app.get('/shops/user/my-shops', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        console.log('🏪 Getting shops for user:', userId);

        // İşletme sahibine ait işletmeleri bul
        const snapshot = await admin.firestore()
            .collection('shops')
            .where('ownerId', '==', userId)
            .get();

        const shops = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ Found ${shops.length} shops for user ${userId}`);

        return res.json({ success: true, data: shops });
    } catch (error: any) {
        console.error('❌ Error getting user shops:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ======================
// APPOINTMENT ENDPOINTS
// ======================

// Randevu oluştur
app.post('/appointments', authenticateUser, async (req: any, res) => {
    try {
        const { shopId, serviceId, date, time, notes, staffId, price } = req.body;
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        // Get shop details
        const shopDoc = await admin.firestore().collection('shops').doc(shopId).get();
        const shopData = shopDoc.exists ? shopDoc.data() : {};
        const shopName = shopData?.name || 'Bilinmeyen İşletme';
        const shopAddress = shopData?.location?.address || shopData?.address || 'Adres bilgisi bulunamadı';

        // Get service details
        const serviceDoc = await admin.firestore().collection('services').doc(serviceId).get();
        const serviceData = serviceDoc.exists ? serviceDoc.data() : {};
        const serviceName = serviceData?.name || 'Bilinmeyen Servis';
        const serviceDuration = serviceData?.duration || 60;

        // Create appointment date-time
        const [hours, minutes] = time.split(':').map(Number);
        const appointmentDateTime = new Date(date);
        appointmentDateTime.setHours(hours, minutes, 0, 0);

        // Calculate end time (using service duration)
        const endTime = new Date(appointmentDateTime);
        endTime.setMinutes(endTime.getMinutes() + serviceDuration);

        const appointmentData: any = {
            shopId,
            shopName,
            shopAddress: shopAddress,
            serviceId,
            serviceName,
            serviceDuration,
            userId,
            status: "pending",
            date: admin.firestore.Timestamp.fromDate(appointmentDateTime),
            endTime: admin.firestore.Timestamp.fromDate(endTime),
            notes: notes || '',
            price: price || 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            userEmail: req.user?.email || '',
            userConfirmed: false,
            businessConfirmed: false,
        };

        if (staffId && staffId !== 'any') {
            appointmentData.staffId = staffId;

            // Get staff details
            const staffDoc = await admin.firestore().collection('staff').doc(staffId).get();
            if (staffDoc.exists) {
                const staffData = staffDoc.data();
                appointmentData.staffName = staffData?.name || 'Bilinmeyen Personel';
            }
        }

        const appointmentRef = await admin.firestore().collection('appointments').add(appointmentData);

        console.log('✅ Appointment created successfully:', appointmentRef.id);

        return res.status(201).json({
            success: true,
            data: { appointmentId: appointmentRef.id, ...appointmentData }
        });
    } catch (error: any) {
        console.error('❌ Error creating appointment:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Kullanıcının randevularını getir
app.get('/appointments/user', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        const snapshot = await admin.firestore()
            .collection('appointments')
            .where('userId', '==', userId)
            .get();

        const appointments = [];

        for (const appointmentDoc of snapshot.docs) {
            const data = appointmentDoc.data() as any;

            // Başlangıç appointment data
            const appointmentData: any = { id: appointmentDoc.id, ...data };

            // Get shop details if missing
            if (!data.shopName && data.shopId) {
                const shopDoc = await admin.firestore().collection('shops').doc(data.shopId).get();
                if (shopDoc.exists) {
                    const shopData = shopDoc.data();
                    appointmentData.shopName = shopData?.name || 'Bilinmeyen İşletme';
                    appointmentData.shopAddress = shopData?.location?.address || shopData?.address || 'Adres bilgisi bulunamadı';
                    appointmentData.shopImage = shopData?.images?.main || shopData?.image || shopData?.imageUrl;
                }
            }

            // Get service details if missing
            if (!data.serviceName && data.serviceId) {
                const serviceDoc = await admin.firestore().collection('services').doc(data.serviceId).get();
                if (serviceDoc.exists) {
                    const serviceData = serviceDoc.data();
                    appointmentData.serviceName = serviceData?.name || 'Bilinmeyen Servis';
                    appointmentData.serviceDuration = serviceData?.duration || 60;
                }
            }

            // Get staff details if missing and staffId exists
            if (!data.staffName && data.staffId) {
                const staffDoc = await admin.firestore().collection('staff').doc(data.staffId).get();
                if (staffDoc.exists) {
                    const staffData = staffDoc.data();
                    appointmentData.staffName = staffData?.name || 'Bilinmeyen Personel';
                }
            }

            // Ensure all required fields exist
            appointmentData.shopName = appointmentData.shopName || 'Bilinmeyen İşletme';
            appointmentData.serviceName = appointmentData.serviceName || 'Bilinmeyen Servis';
            appointmentData.address = appointmentData.shopAddress || appointmentData.address || 'Adres bilgisi bulunamadı';
            appointmentData.duration = appointmentData.serviceDuration || appointmentData.duration || 60;
            appointmentData.price = appointmentData.price || 0;

            appointments.push(appointmentData);
        }

        console.log(`✅ Retrieved ${appointments.length} appointments for user:`, userId);

        return res.json({ success: true, data: appointments });
    } catch (error: any) {
        console.error('❌ Error getting user appointments:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// İşletme randevularını getir
app.get('/appointments/business/:shopId', authenticateUser, async (req: any, res) => {
    try {
        const { shopId } = req.params;

        const snapshot = await admin.firestore()
            .collection('appointments')
            .where('shopId', '==', shopId)
            .get();

        const appointments = [];

        for (const appointmentDoc of snapshot.docs) {
            const data = appointmentDoc.data();

            // Get user details
            let userName = "Bilinmeyen Kullanıcı";
            let userEmail = "";
            let userPhone = "";

            if (data.userId) {
                try {
                    const userRecord = await admin.auth().getUser(data.userId);
                    userName = userRecord.displayName || "Bilinmeyen Kullanıcı";
                    userEmail = userRecord.email || "";
                    userPhone = userRecord.phoneNumber || "";
                } catch (error) {
                    console.log('User not found:', data.userId);
                }
            }

            // Get service details
            let serviceName = "Bilinmeyen Servis";
            if (data.serviceId) {
                const serviceDoc = await admin.firestore().collection('services').doc(data.serviceId).get();
                if (serviceDoc.exists) {
                    const serviceData = serviceDoc.data();
                    serviceName = serviceData?.name || "Bilinmeyen Servis";
                }
            }

            appointments.push({
                id: appointmentDoc.id,
                ...data,
                userName,
                userEmail,
                userPhone,
                serviceName
            });
        }

        return res.json({ success: true, data: appointments });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Randevu durumu güncelle
app.put('/appointments/:appointmentId/status', authenticateUser, async (req: any, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, reason } = req.body;

        if (!appointmentId) {
            return res.status(400).json({ success: false, error: 'Randevu ID gerekli' });
        }

        const appointmentRef = admin.firestore().collection('appointments').doc(appointmentId);
        const appointmentDoc = await appointmentRef.get();

        if (!appointmentDoc.exists) {
            return res.status(404).json({ success: false, error: 'Randevu bulunamadı' });
        }

        const updateData: any = {
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (reason) {
            updateData.statusReason = reason;
        }

        await appointmentRef.update(updateData);

        return res.json({ success: true, data: { id: appointmentId, ...updateData } });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Randevu iptal et
app.put('/appointments/:appointmentId/cancel', authenticateUser, async (req: any, res) => {
    try {
        const { appointmentId } = req.params;
        const { reason } = req.body;
        const userId = req.user?.uid;

        if (!appointmentId) {
            return res.status(400).json({ success: false, error: 'Randevu ID gerekli' });
        }

        const appointmentRef = admin.firestore().collection('appointments').doc(appointmentId);
        const appointmentDoc = await appointmentRef.get();

        if (!appointmentDoc.exists) {
            return res.status(404).json({ success: false, error: 'Randevu bulunamadı' });
        }

        const updateData = {
            status: 'canceled',
            cancelReason: reason || '',
            canceledBy: 'user',
            canceledByUserId: userId,
            canceledAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await appointmentRef.update(updateData);

        return res.json({ success: true, data: { appointmentId } });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ======================
// REVIEW ENDPOINTS
// ======================

// Değerlendirme gönder
app.post('/reviews', authenticateUser, async (req: any, res) => {
    try {
        const { shopId, appointmentId, rating, comment } = req.body;
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        // Get shop data for shop name
        const shopDoc = await admin.firestore().collection('shops').doc(shopId).get();
        const shopData = shopDoc.exists ? shopDoc.data() : {};

        // Check for existing review for this appointment
        if (appointmentId) {
            const existingReviews = await admin.firestore()
                .collection('reviews')
                .where('userId', '==', userId)
                .where('appointmentId', '==', appointmentId)
                .get();

            if (!existingReviews.empty) {
                return res.status(400).json({ success: false, error: 'Bu randevu için zaten bir değerlendirme yapmışsınız' });
            }
        }

        const reviewData = {
            shopId,
            shopName: shopData?.name || 'Bilinmeyen İşletme',
            appointmentId: appointmentId || null,
            userId,
            userName: req.user?.name || req.user?.email || 'Kullanıcı',
            userPhoto: req.user?.picture,
            rating,
            comment,
            isPublished: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            helpfulCount: 0
        };

        const reviewRef = await admin.firestore().collection('reviews').add(reviewData);

        // Update appointment if provided
        if (appointmentId) {
            await admin.firestore().collection('appointments').doc(appointmentId).update({
                hasReview: true,
                reviewId: reviewRef.id
            });
        }

        // Update shop rating
        await updateShopRating(shopId);

        return res.status(201).json({ success: true, data: { reviewId: reviewRef.id, ...reviewData } });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// İşletme değerlendirmelerini getir
app.get('/reviews/shop/:shopId', async (req, res) => {
    try {
        const { shopId } = req.params;
        const limit = parseInt(req.query.limit as string) || 10;

        const snapshot = await admin.firestore()
            .collection('reviews')
            .where('shopId', '==', shopId)
            .where('isPublished', '==', true)
            .get();

        let reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Client-side'da tarihe göre sırala
        reviews = reviews.sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
        });

        // Limit uygula
        reviews = reviews.slice(0, limit);

        return res.json({ success: true, data: reviews });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Kullanıcının değerlendirmelerini getir
app.get('/reviews/user', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        const snapshot = await admin.firestore()
            .collection('reviews')
            .where('userId', '==', userId)
            .get();

        let reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Client-side'da tarihe göre sırala
        reviews = reviews.sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
        });

        return res.json({ success: true, data: reviews });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ======================
// MESSAGE ENDPOINTS
// ======================

// Mesaj gönder
app.post('/messages', authenticateUser, async (req: any, res) => {
    try {
        const { shopId, text, receiverId } = req.body;
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        console.log('📨 Sending message:', {
            userId,
            shopId,
            receiverId,
            textLength: text?.length,
            text: text?.substring(0, 50) + '...'
        });

        const messageData = {
            shopId,
            senderId: userId,
            senderName: req.user?.name || req.user?.email || 'Kullanıcı',
            receiverId: receiverId || shopId,
            receiverName: '',
            text: text.trim(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
            participants: [userId, shopId]
        };

        console.log('📨 Message data to save:', {
            ...messageData,
            createdAt: 'ServerTimestamp'
        });

        const messageRef = await admin.firestore().collection('messages').add(messageData);

        console.log('📨 Message saved with ID:', messageRef.id);

        return res.status(201).json({ success: true, data: { messageId: messageRef.id, ...messageData } });
    } catch (error: any) {
        console.error('📨 Error sending message:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Kullanıcının mesajlarını getir
app.get('/messages/user', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        console.log('📨 Getting user messages for:', userId);

        const snapshot = await admin.firestore()
            .collection('messages')
            .where('participants', 'array-contains', userId)
            .get();

        console.log('📨 Found messages count:', snapshot.docs.length);

        let messages = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('📨 Message data:', {
                id: doc.id,
                shopId: data.shopId,
                senderId: data.senderId,
                receiverId: data.receiverId,
                text: data.text?.substring(0, 50) + '...',
                participants: data.participants,
                createdAt: data.createdAt
            });
            return {
                id: doc.id,
                ...data
            };
        });

        // Client-side'da tarihe göre sırala
        messages = messages.sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
        });

        console.log('📨 Returning messages count:', messages.length);

        return res.json({ success: true, data: messages });
    } catch (error: any) {
        console.error('📨 Error getting user messages:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// İşletme ile olan mesajları getir
app.get('/messages/shop/:shopId', authenticateUser, async (req: any, res) => {
    try {
        const { shopId } = req.params;
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        const snapshot = await admin.firestore()
            .collection('messages')
            .where('shopId', '==', shopId)
            .where('participants', 'array-contains', userId)
            .get();

        let messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Client-side'da tarihe göre sırala (eski mesajlar önce)
        messages = messages.sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateA.getTime() - dateB.getTime();
        });

        return res.json({ success: true, data: messages });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ======================
// NOTIFICATION ENDPOINTS  
// ======================

// Kullanıcının bildirimlerini getir
app.get('/notifications/user', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        const snapshot = await admin.firestore()
            .collection('notifications')
            .where('userId', '==', userId)
            .get();

        let notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Client-side'da tarihe göre sırala
        notifications = notifications.sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
        });

        // Limit uygula
        notifications = notifications.slice(0, 50);

        const unreadCount = notifications.filter((n: any) => !n.read).length;

        return res.json({
            success: true,
            data: {
                notifications,
                unreadCount
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Bildirimi okundu olarak işaretle
app.put('/notifications/:notificationId/read', authenticateUser, async (req: any, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        const notificationRef = admin.firestore().collection('notifications').doc(notificationId);
        const notificationDoc = await notificationRef.get();

        if (!notificationDoc.exists) {
            return res.status(404).json({ success: false, error: 'Bildirim bulunamadı' });
        }

        const notificationData = notificationDoc.data();
        if (notificationData?.userId !== userId) {
            return res.status(403).json({ success: false, error: 'Bu bildirimi güncelleme yetkiniz yok' });
        }

        await notificationRef.update({
            read: true,
            readAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.json({ success: true, data: { notificationId } });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Helper function: Update shop rating
async function updateShopRating(shopId: string) {
    try {
        const reviewsSnapshot = await admin.firestore()
            .collection('reviews')
            .where('shopId', '==', shopId)
            .where('isPublished', '==', true)
            .get();

        if (reviewsSnapshot.empty) {
            await admin.firestore().collection('shops').doc(shopId).update({
                'rating.average': 0,
                'rating.count': 0,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return;
        }

        let totalRating = 0;
        const reviewCount = reviewsSnapshot.size;

        reviewsSnapshot.forEach((doc) => {
            const rating = doc.data().rating;
            totalRating += rating;
        });

        const average = totalRating / reviewCount;

        await admin.firestore().collection('shops').doc(shopId).update({
            'rating.average': Math.round(average * 10) / 10,
            'rating.count': reviewCount,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Shop ${shopId} rating updated: ${average} (${reviewCount} reviews)`);
    } catch (error) {
        console.error('Error updating shop rating:', error);
    }
}

// ======================
// PROFILE ENDPOINTS
// ======================

// Kullanıcı profili güncelle
app.put('/profile', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user?.uid;
        const { displayName, phone, photoURL, address, preferences } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        const updateData: any = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (displayName) updateData.displayName = displayName;
        if (phone) updateData.phone = phone;
        if (photoURL) updateData.photoURL = photoURL;
        if (address) updateData.address = address;
        if (preferences) updateData.preferences = preferences;

        const userRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            await userRef.update(updateData);
        } else {
            await userRef.set({
                ...updateData,
                email: req.user?.email || '',
                displayName: displayName || req.user?.name || '',
                userType: 'user',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        return res.json({ success: true, data: updateData });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Kullanıcı profilini getir
app.get('/profile', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        const userRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            return res.json({
                success: true,
                data: {
                    id: userDoc.id,
                    ...userDoc.data()
                }
            });
        }

        return res.json({ success: true, data: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Favori ekle/çıkar
app.put('/profile/favorites/:shopId', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user?.uid;
        const { shopId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        const userRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ success: false, error: 'Kullanıcı profili bulunamadı' });
        }

        const userData = userDoc.data();
        const favorites = userData?.favorites || [];
        const isFavorite = favorites.includes(shopId);

        let updatedFavorites;
        if (isFavorite) {
            updatedFavorites = favorites.filter((id: string) => id !== shopId);
        } else {
            updatedFavorites = [...favorites, shopId];
        }

        await userRef.update({
            favorites: updatedFavorites,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.json({
            success: true,
            data: {
                isFavorite: !isFavorite,
                favoriteCount: updatedFavorites.length
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ======================
// USER ENDPOINTS
// ======================

/**
 * 10 işletme için gerçek Firebase Authentication hesapları oluştur
 */
app.post('/users/create-business-accounts', async (req: any, res) => {
    try {
        console.log("🏢 Creating Firebase Auth accounts for businesses...");

        // İşletme hesap verileri
        const businessAccounts = [
            {
                shopName: "Elite Güzellik Merkezi",
                email: "info@eliteguzellik.com",
                password: "Elite2024!",
                phone: "+905551234567",
                ownerName: "Ayşe Yılmaz"
            },
            {
                shopName: "Modern Erkek Kuaförü",
                email: "info@modernerkek.com",
                password: "Modern2024!",
                phone: "+905552345678",
                ownerName: "Mehmet Usta"
            },
            {
                shopName: "Fit Life Spor Salonu",
                email: "info@fitlife.com",
                password: "FitLife2024!",
                phone: "+905553456789",
                ownerName: "Can Yılmaz"
            },
            {
                shopName: "Lezzet Mutfağı",
                email: "info@lezzetmutfagi.com",
                password: "Lezzet2024!",
                phone: "+905554567890",
                ownerName: "Ahmet Şef"
            },
            {
                shopName: "Sağlık Merkezi Plus",
                email: "info@saglikplus.com",
                password: "Saglik2024!",
                phone: "+905555678901",
                ownerName: "Dr. Mehmet Yıldız"
            },
            {
                shopName: "TechFix Bilgisayar",
                email: "info@techfix.com",
                password: "TechFix2024!",
                phone: "+905556789012",
                ownerName: "Emre Teknisyen"
            },
            {
                shopName: "Kreatif Sanat Atölyesi",
                email: "info@kreatifatolye.com",
                password: "Kreatif2024!",
                phone: "+905557890123",
                ownerName: "Sanat. Aylin"
            },
            {
                shopName: "Oto Bakım Merkezi",
                email: "info@otobakimmerkezi.com",
                password: "OtoBakim2024!",
                phone: "+905558901234",
                ownerName: "Usta Hüseyin"
            },
            {
                shopName: "Pet Bakım Salonu",
                email: "info@petbakimsalonu.com",
                password: "PetBakim2024!",
                phone: "+905559012345",
                ownerName: "Veteriner Zeynep"
            }
        ];

        const createdAccounts = [];
        const errors = [];

        for (const accountData of businessAccounts) {
            try {
                console.log(`🏪 Creating Firebase Auth account for: ${accountData.shopName}`);

                // Önce bu email'in zaten var olup olmadığını kontrol et
                let userRecord;
                try {
                    userRecord = await admin.auth().getUserByEmail(accountData.email);
                    console.log(`⚠️ User already exists: ${accountData.email}, updating...`);

                    // Kullanıcı varsa şifresini güncelle
                    await admin.auth().updateUser(userRecord.uid, {
                        password: accountData.password,
                        displayName: accountData.ownerName,
                        phoneNumber: accountData.phone,
                        emailVerified: true
                    });

                } catch (error: any) {
                    if (error.code === 'auth/user-not-found') {
                        // Kullanıcı yoksa oluştur
                        console.log(`➕ Creating new user: ${accountData.email}`);
                        userRecord = await admin.auth().createUser({
                            email: accountData.email,
                            password: accountData.password,
                            displayName: accountData.ownerName,
                            phoneNumber: accountData.phone,
                            emailVerified: true
                        });
                    } else {
                        throw error;
                    }
                }

                // İşletmenin ID'sini bul
                const shopsSnapshot = await admin.firestore().collection('shops')
                    .where("name", "==", accountData.shopName)
                    .get();

                if (shopsSnapshot.empty) {
                    console.warn(`⚠️ Shop not found in Firestore: ${accountData.shopName}`);
                    continue;
                }

                const shopDoc = shopsSnapshot.docs[0];
                const shopId = shopDoc.id;
                const shopData = shopDoc.data();

                // Firestore'da kullanıcı profili oluştur/güncelle
                const userProfileData = {
                    email: accountData.email,
                    displayName: accountData.ownerName,
                    name: accountData.ownerName,
                    phone: accountData.phone,
                    role: "business_owner",
                    businessInfo: {
                        shopId: shopId,
                        shopName: accountData.shopName,
                        isOwner: true,
                        permissions: ['manage_appointments', 'manage_staff', 'manage_services', 'view_analytics'],
                        joinedAt: admin.firestore.FieldValue.serverTimestamp()
                    },
                    profile: {
                        avatar: shopData.images?.main || "/placeholder.svg",
                        bio: `${accountData.shopName} işletme sahibi`,
                        location: shopData.location?.city || "İstanbul"
                    },
                    settings: {
                        notifications: {
                            email: true,
                            push: true,
                            sms: true
                        },
                        privacy: {
                            profileVisible: true,
                            contactVisible: true
                        }
                    },
                    isActive: true,
                    isVerified: true,
                    emailVerified: true,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
                    authUid: userRecord.uid
                };

                // Firestore'a kullanıcı profili ekle
                await admin.firestore().collection('users').doc(userRecord.uid).set(userProfileData, { merge: true });

                // İşletme bilgilerini güncelle
                await admin.firestore().collection('shops').doc(shopId).update({
                    ownerId: userRecord.uid,
                    ownerEmail: accountData.email,
                    businessAccount: {
                        userId: userRecord.uid,
                        email: accountData.email,
                        ownerName: accountData.ownerName,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    },
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // Custom claims ekle (işletme sahibi yetkisi)
                await admin.auth().setCustomUserClaims(userRecord.uid, {
                    role: 'business_owner',
                    shopId: shopId,
                    shopName: accountData.shopName
                });

                createdAccounts.push({
                    uid: userRecord.uid,
                    email: accountData.email,
                    shopName: accountData.shopName,
                    ownerName: accountData.ownerName,
                    shopId: shopId,
                    password: accountData.password
                });

                console.log(`✅ Firebase Auth account created/updated for ${accountData.shopName}`);
                console.log(`   🆔 UID: ${userRecord.uid}`);
                console.log(`   📧 Email: ${accountData.email}`);
                console.log(`   🔑 Password: ${accountData.password}`);
                console.log(`   👤 Owner: ${accountData.ownerName}`);

            } catch (error: any) {
                console.error(`❌ Error creating account for ${accountData.shopName}:`, error);
                errors.push({
                    shopName: accountData.shopName,
                    email: accountData.email,
                    error: error.message
                });
            }
        }

        console.log(`\n✅ Created/Updated ${createdAccounts.length} Firebase Auth accounts`);
        console.log("\n📋 Business Account Summary:");
        console.log("=".repeat(80));

        createdAccounts.forEach((account, index) => {
            console.log(`${index + 1}. ${account.shopName}`);
            console.log(`   🆔 UID: ${account.uid}`);
            console.log(`   📧 Email: ${account.email}`);
            console.log(`   🔑 Password: ${account.password}`);
            console.log(`   👤 Owner: ${account.ownerName}`);
            console.log(`   🏪 Shop ID: ${account.shopId}`);
            console.log("");
        });

        if (errors.length > 0) {
            console.log("\n❌ Errors:");
            errors.forEach(error => {
                console.log(`   ${error.shopName}: ${error.error}`);
            });
        }

        res.json({
            success: true,
            data: {
                created: createdAccounts.length,
                accounts: createdAccounts,
                errors: errors.length > 0 ? errors : undefined
            },
            message: `${createdAccounts.length} Firebase Auth hesabı oluşturuldu/güncellendi`
        });

    } catch (error: any) {
        console.error("❌ Error creating Firebase Auth accounts:", error);
        res.status(500).json({
            success: false,
            error: `Hesap oluşturma hatası: ${error.message}`
        });
    }
});

// Kullanıcı profili routes
app.get('/users/profile', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        const userRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            return res.json({
                success: true,
                data: {
                    id: userDoc.id,
                    ...userDoc.data()
                }
            });
        }

        return res.json({ success: true, data: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/users/profile', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user?.uid;
        const profileData = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        const updateData = {
            ...profileData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const userRef = admin.firestore().collection('users').doc(userId);
        await userRef.set(updateData, { merge: true });

        return res.json({ success: true, data: updateData });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/users/preferences', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user?.uid;
        const preferences = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
        }

        const userRef = admin.firestore().collection('users').doc(userId);
        await userRef.update({
            preferences: preferences,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.json({ success: true, data: preferences });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ======================
// EXPRESS'I CLOUD FUNCTION OLARAK DıŞA AKTAR
// ======================

// Express'i Cloud Function olarak dışa aktar
export const api = functions.region('us-central1').https.onRequest(app); 