export const COLLECTIONS = {
  USERS: 'users',
  SHOPS: 'shops',
  SERVICES: 'services',
  APPOINTMENTS: 'appointments',
  REVIEWS: 'reviews',
  FAVORITES: 'favorites',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  STAFF: 'staff',
  CATEGORIES: 'categories',
  PROMOCODES: 'promocodes',
  AVAILABILITY: 'availability'
};

export interface UserProfile {
  userType: 'user' | 'business';
  email: string;
  displayName: string;
  phoneNumber?: string;
  emailVerified: boolean;
  phoneVerified?: boolean;
  businessId?: string;
  businessName?: string;
  contactName?: string;
  hasCompletedBusinessSetup?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Add UserSchema alias for compatibility
export interface UserSchema extends UserProfile {
  id: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  ownerId: string;
  location: {
    address: string;
    city: string;
    district: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  workingHours: {
    [key: string]: {
      open: string;
      close: string;
    } | null;
  };
  images: {
    main: string;
    gallery?: string[];
  };
  rating: {
    average: number;
    count: number;
  };
  services: string[]; // Service IDs
  staff?: string[]; // Staff IDs
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Add ShopSchema alias for compatibility
export interface ShopSchema extends Shop { }

export interface Service {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  category: string;
  duration: number; // in minutes
  price: number;
  discountedPrice?: number;
  isActive: boolean;
  staffIds?: string[]; // Staff who can provide this service
  createdAt: Date;
  updatedAt: Date;
}

// Add ServiceSchema alias for compatibility
export interface ServiceSchema extends Service { }

export interface Appointment {
  id: string;
  userId: string;
  shopId: string;
  serviceId: string;
  staffId?: string;
  date: Date;
  endTime: Date;
  status: 'pending_user_confirmation' | 'pending_business_confirmation' | 'confirmed' | 'completed' | 'canceled';
  price: number;
  notes?: string;
  userEmail: string;
  userConfirmed: boolean;
  businessConfirmed: boolean;
  cancelReason?: string;
  canceledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Add AppointmentSchema alias for compatibility
export interface AppointmentSchema extends Appointment { }

export interface Staff {
  id: string;
  shopId: string;
  name: string;
  title?: string;
  bio?: string;
  photoURL?: string;
  specialties?: string[];
  availableServices?: string[]; // Service IDs this staff can provide
  workingHours?: {
    [key: string]: {
      open: string;
      close: string;
    } | null;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Add StaffSchema alias for compatibility
export interface StaffSchema extends Staff { }

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment_created' | 'appointment_confirmed' | 'appointment_canceled' | 'appointment_reminder' | 'shop_update' | 'review_received';
  title: string;
  message: string;
  data?: any; // Additional data like appointment ID, shop ID etc.
  isRead: boolean;
  createdAt: Date;
}

// Add NotificationSchema alias for compatibility
export interface NotificationSchema extends Notification { }

export interface Review {
  id: string;
  userId: string;
  shopId: string;
  appointmentId?: string;
  rating: number; // 1-5
  comment?: string;
  isVerified: boolean; // true if user had an appointment
  response?: {
    message: string;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Add ReviewSchema alias for compatibility
export interface ReviewSchema extends Review { }

export interface Favorite {
  id: string;
  userId: string;
  shopId: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  shopId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  text: string;
  createdAt: Date;
  read: boolean;
  participants: string[];
}

// Add MessageSchema alias for compatibility
export interface MessageSchema extends Message { }

// Required indexes for Firestore
export const REQUIRED_INDEXES = [
  {
    collection: 'shops',
    fields: ['isActive', 'rating.average', '__name__'],
    queryScope: 'COLLECTION'
  },
  {
    collection: 'appointments',
    fields: ['userId', 'date'],
    queryScope: 'COLLECTION'
  },
  {
    collection: 'appointments',
    fields: ['shopId', 'date'],
    queryScope: 'COLLECTION'
  },
  {
    collection: 'services',
    fields: ['shopId', 'isActive'],
    queryScope: 'COLLECTION'
  },
  {
    collection: 'reviews',
    fields: ['shopId', 'isPublished', 'createdAt'],
    queryScope: 'COLLECTION'
  },
  {
    collection: 'messages',
    fields: ['shopId', 'participants', 'createdAt'],
    queryScope: 'COLLECTION'
  }
];
