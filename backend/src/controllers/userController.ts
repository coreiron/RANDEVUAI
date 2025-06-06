import { Request, Response } from 'express';
import { db, admin, COLLECTIONS, createResponse, AuthenticatedRequest } from '../config';
import { Timestamp } from 'firebase-admin/firestore';

// ... existing functions ...

/**
 * 10 işletme için gerçek Firebase Authentication hesapları oluştur
 */
export const createBusinessAuthAccounts = async (req: Request, res: Response) => {
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
                const shopsSnapshot = await db.collection(COLLECTIONS.SHOPS)
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
                        joinedAt: Timestamp.now()
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
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    lastLoginAt: Timestamp.now(),
                    authUid: userRecord.uid
                };

                // Firestore'a kullanıcı profili ekle
                await db.collection(COLLECTIONS.USERS).doc(userRecord.uid).set(userProfileData, { merge: true });

                // İşletme bilgilerini güncelle
                await db.collection(COLLECTIONS.SHOPS).doc(shopId).update({
                    ownerId: userRecord.uid,
                    ownerEmail: accountData.email,
                    businessAccount: {
                        userId: userRecord.uid,
                        email: accountData.email,
                        ownerName: accountData.ownerName,
                        createdAt: Timestamp.now()
                    },
                    updatedAt: Timestamp.now()
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

        res.json(createResponse(
            true,
            {
                created: createdAccounts.length,
                accounts: createdAccounts,
                errors: errors.length > 0 ? errors : undefined
            },
            `${createdAccounts.length} Firebase Auth hesabı oluşturuldu/güncellendi`
        ));

    } catch (error: any) {
        console.error("❌ Error creating Firebase Auth accounts:", error);
        res.status(500).json(createResponse(false, null, '', `Hesap oluşturma hatası: ${error.message}`));
    }
}; 