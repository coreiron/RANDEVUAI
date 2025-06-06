import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  Timestamp,
  onSnapshot,
  writeBatch,
  increment
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { 
  AppointmentSchema,
  MessageSchema,
  NotificationSchema,
  ReviewSchema,
  ServiceSchema,
  ShopSchema,
  StaffSchema,
  UserSchema,
  COLLECTIONS
} from "./schema";

// Convert Firestore Timestamp to JS Date
export const timestampToDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  } else if (timestamp.seconds && timestamp.nanoseconds) {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  }
  
  return new Date(timestamp);
};

// User profile operations
export const getUserProfile = async (): Promise<UserSchema | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    const userDocRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserSchema;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Shop operations
export const getShops = async (): Promise<ShopSchema[]> => {
  try {
    const shopsCollection = collection(db, COLLECTIONS.SHOPS);
    const shopsSnapshot = await getDocs(shopsCollection);
    
    return shopsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ShopSchema[];
  } catch (error) {
    console.error("Error getting shops:", error);
    throw error;
  }
};

export const getShop = async (shopId: string): Promise<ShopSchema | null> => {
  try {
    const shopDocRef = doc(db, COLLECTIONS.SHOPS, shopId);
    const shopDoc = await getDoc(shopDocRef);
    
    if (shopDoc.exists()) {
      return { id: shopDoc.id, ...shopDoc.data() } as ShopSchema;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting shop:", error);
    throw error;
  }
};

// Services operations
export const getShopServices = async (shopId: string): Promise<ServiceSchema[]> => {
  try {
    const servicesCollection = collection(db, COLLECTIONS.SERVICES);
    const q = query(servicesCollection, where("shopId", "==", shopId));
    const servicesSnapshot = await getDocs(q);
    
    return servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ServiceSchema[];
  } catch (error) {
    console.error("Error getting shop services:", error);
    throw error;
  }
};

// Staff operations
export const getShopStaff = async (shopId: string): Promise<StaffSchema[]> => {
  try {
    const staffCollection = collection(db, COLLECTIONS.STAFF);
    const q = query(staffCollection, where("shopId", "==", shopId));
    const staffSnapshot = await getDocs(q);
    
    return staffSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StaffSchema[];
  } catch (error) {
    console.error("Error getting shop staff:", error);
    throw error;
  }
};

// Appointment operations
export const createAppointment = async (appointmentData: {
  shopId: string;
  serviceId: string;
  staffId?: string;
  date: Timestamp;
  endTime: Timestamp;
  notes?: string;
  price: number;
}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Kullanıcı oturum açmamış");
    
    const appointmentsCollection = collection(db, COLLECTIONS.APPOINTMENTS);
    const docRef = await addDoc(appointmentsCollection, {
      ...appointmentData,
      userId: currentUser.uid,
      status: "scheduled", // Changed from "scheduled" to "scheduled" for consistency
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Also create a notification for the appointment
    const notificationsCollection = collection(db, COLLECTIONS.NOTIFICATIONS);
    await addDoc(notificationsCollection, {
      userId: currentUser.uid,
      title: "Yeni Randevu",
      message: "Randevunuz başarıyla oluşturuldu.",
      type: "appointment",
      read: false,
      relatedId: docRef.id,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

export const getUserAppointments = async (): Promise<AppointmentSchema[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];
    
    const appointmentsCollection = collection(db, COLLECTIONS.APPOINTMENTS);
    const q = query(
      appointmentsCollection,
      where("userId", "==", currentUser.uid),
      orderBy("date", "asc")
    );
    const appointmentsSnapshot = await getDocs(q);
    
    return appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AppointmentSchema[];
  } catch (error) {
    console.error("Error getting user appointments:", error);
    throw error;
  }
};

// Review operations
export const getShopReviews = async (shopId: string): Promise<ReviewSchema[]> => {
  try {
    const reviewsCollection = collection(db, COLLECTIONS.REVIEWS);
    const q = query(
      reviewsCollection,
      where("shopId", "==", shopId),
      where("isPublished", "==", true),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const reviewsSnapshot = await getDocs(q);
    
    return reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ReviewSchema[];
  } catch (error) {
    console.error("Error getting shop reviews:", error);
    throw error;
  }
};

// Message operations
export const getMessages = async (shopId: string): Promise<MessageSchema[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];
    
    const messagesCollection = collection(db, COLLECTIONS.MESSAGES);
    const q = query(
      messagesCollection,
      where("shopId", "==", shopId),
      orderBy("createdAt", "asc")
    );
    const messagesSnapshot = await getDocs(q);
    
    return messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MessageSchema[];
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
};

export const sendMessage = async (
  shopId: string,
  receiverId: string,
  receiverName: string,
  text: string
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Kullanıcı oturum açmamış");
    
    const messagesCollection = collection(db, COLLECTIONS.MESSAGES);
    await addDoc(messagesCollection, {
      shopId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      receiverId: receiverId,
      receiverName: receiverName,
      text: text,
      createdAt: serverTimestamp(),
      read: false
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const subscribeToShopMessages = (
  shopId: string,
  callback: (messages: MessageSchema[]) => void
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};
  
  const messagesCollection = collection(db, COLLECTIONS.MESSAGES);
  const q = query(
    messagesCollection,
    where("shopId", "==", shopId),
    orderBy("createdAt", "asc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MessageSchema[];
    callback(messages);
  });
};

// Notification operations
export const getUserNotifications = async (): Promise<NotificationSchema[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];
    
    const notificationsCollection = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = query(
      notificationsCollection,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const notificationsSnapshot = await getDocs(q);
    
    return notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NotificationSchema[];
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
};

// Utility functions
export const incrementPopularityScore = async (shopId: string, incrementValue: number) => {
  try {
    const shopRef = doc(db, COLLECTIONS.SHOPS, shopId);
    await updateDoc(shopRef, {
      popularityScore: increment(incrementValue)
    });
  } catch (error) {
    console.error("Error incrementing popularity score:", error);
    throw error;
  }
};

/**
 * Bu fonksiyon Firestore'daki kullanıcı verilerini temizler (test amaçlı).
 * Gerçek uygulamada bu işlem genellikle admin paneli üzerinden yapılır.
 */
export const deleteUserData = async (userId: string) => {
  try {
    const batch = writeBatch(db);
    
    // Kullanıcının randevularını sil
    const appointmentsQuery = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where("userId", "==", userId)
    );
    const appointmentSnapshot = await getDocs(appointmentsQuery);
    
    appointmentSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Kullanıcının mesajlarını sil
    const messagesQuery1 = query(
      collection(db, COLLECTIONS.MESSAGES),
      where("senderId", "==", userId)
    );
    const messagesSnapshot1 = await getDocs(messagesQuery1);
    messagesSnapshot1.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    const messagesQuery2 = query(
      collection(db, COLLECTIONS.MESSAGES),
      where("receiverId", "==", userId)
    );
    const messagesSnapshot2 = await getDocs(messagesQuery2);
    messagesSnapshot2.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Kullanıcının bildirimlerini sil
    const notificationsQuery = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    notificationsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return { success: true };
  } catch (error) {
    console.error("Veri temizleme hatası:", error);
    return { 
      success: false,
      error: (error as Error).message
    };
  }
};
