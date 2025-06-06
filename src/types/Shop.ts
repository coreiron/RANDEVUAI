import { Timestamp } from "firebase/firestore";

export interface Shop {
  id: string;
  name: string;
  ownerId?: string;
  photoURL?: string;
  rating?: number | {
    average: number;
    count: number;
  };
  imageUrl?: string;
  image?: string;
  images?: {
    main?: string;
    gallery?: string[];
  };
  category?: string;
  subcategory?: string;
  description?: string;
  shortDescription?: string;
  priceLevel?: number; // 1-3 (€, €€, €€€)
  popularity?: number;
  popularityScore?: number; // Aliases for backward compatibility
  isPopular?: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: Date | Timestamp | any;
  updatedAt?: Date | Timestamp | any;
  location: {
    address?: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  workingHours?: {
    [key: string]: { open: string | null; close: string | null };
  };
  services?: Service[];
  comments?: Comment[];
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
      youtube?: string;
    };
  };
  staff?: Staff[];
  reviews?: Review[];
}

export interface Service {
  id: string;
  shopId?: string;
  name: string;
  description?: string;
  duration: string | number;
  price?: number;
  discountedPrice?: number;
  category?: string;
  image?: string;
  isActive?: boolean;
  staffIds?: string[];
  createdAt?: Date | Timestamp | any;
  updatedAt?: Date | Timestamp | any;
}

export interface Staff {
  id: string;
  shopId: string;
  name: string;
  title?: string;
  bio?: string;
  photoURL?: string;
  specialties?: string[];
  serviceIds?: string[];
  workingHours?: {
    [key: string]: {
      start: string | null;
      end: string | null;
      breaks?: Array<{ start: string; end: string }>;
    };
  };
  isActive?: boolean;
  createdAt?: Date | Timestamp | any;
  updatedAt?: Date | Timestamp | any;
}

export interface Review {
  id: string;
  shopId: string;
  userId: string;
  appointmentId?: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt?: Date | Timestamp | any;
  updatedAt?: Date | Timestamp | any;
  reply?: {
    text: string;
    timestamp: Date | Timestamp | any;
  };
  isVerified?: boolean;
  isPublished?: boolean;
  helpfulCount?: number;
}

export interface Comment {
  id: string;
  username: string;
  date: string;
  text: string;
  rating: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  text: string;
  date: string;
  read: boolean;
  isRead?: boolean; // For backward compatibility
  shopId: string;
}

export interface Appointment {
  id: string;
  userId: string;
  shopId: string;
  serviceId: string;
  staffId?: string;
  date: Date | Timestamp | any;
  endTime?: Date | Timestamp | any;
  status: "pending" | "confirmed" | "completed" | "canceled" | "no-show";
  notes?: string;
  staffNotes?: string;
  price: number;
  createdAt?: Date | Timestamp | any;
  updatedAt?: Date | Timestamp | any;
  cancellationReason?: string;
  reminderSent?: boolean;
  followupSent?: boolean;
}
