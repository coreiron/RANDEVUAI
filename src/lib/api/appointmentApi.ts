import { apiClient, ApiResponse } from './client';

export interface CreateAppointmentData {
  shopId: string;
  serviceId: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  notes?: string;
  staffId?: string;
  price?: number;
}

export interface UpdateAppointmentStatusData {
  status: string;
  reason?: string;
}

export interface CancelAppointmentData {
  reason?: string;
}

export const appointmentApi = {
  // Create new appointment
  create: async (data: CreateAppointmentData): Promise<ApiResponse> => {
    return apiClient.post('/appointments', data);
  },

  // Get user's appointments
  getUserAppointments: async (): Promise<ApiResponse> => {
    return apiClient.get('/appointments/user');
  },

  // Get business appointments
  getBusinessAppointments: async (shopId: string): Promise<ApiResponse> => {
    return apiClient.get(`/appointments/business/${shopId}`);
  },

  // Update appointment status
  updateStatus: async (
    appointmentId: string,
    data: UpdateAppointmentStatusData
  ): Promise<ApiResponse> => {
    return apiClient.put(`/appointments/${appointmentId}/status`, data);
  },

  // Cancel appointment
  cancel: async (
    appointmentId: string,
    data: CancelAppointmentData
  ): Promise<ApiResponse> => {
    return apiClient.put(`/appointments/${appointmentId}/cancel`, data);
  },
};
