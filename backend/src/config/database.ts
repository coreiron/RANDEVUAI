import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
}

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
  PROMOCODES: 'promocodes'
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const createResponse = <T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponse<T> => ({
  success,
  data,
  message,
  error
});
