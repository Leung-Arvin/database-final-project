// src/api/endpoints/bookings.ts
import axiosInstance from '../axiosConfig';
import type { ApiResponse, ApiBooking, CreateBookingRequest } from '../types/apiResponses';

export const bookingsApi = {
  // Get all bookings
  getAll: async (filters?: {
    status?: string;
    hotel_id?: number;
    customer_id?: number;
  }): Promise<ApiBooking[]> => {
    const response = await axiosInstance.get<ApiResponse<ApiBooking[]>>('/bookings', { params: filters });
    return response.data.data;
  },

  // Get booking by ID
  getById: async (bookingId: number): Promise<ApiBooking> => {
    const response = await axiosInstance.get<ApiResponse<ApiBooking>>(`/bookings/${bookingId}`);
    return response.data.data;
  },

  // Create new booking
  create: async (data: CreateBookingRequest): Promise<ApiBooking> => {
    const response = await axiosInstance.post<ApiResponse<ApiBooking>>('/bookings', data);
    return response.data.data;
  },

  // Update booking status
  updateStatus: async (bookingId: number, status: string): Promise<ApiBooking> => {
    const response = await axiosInstance.patch<ApiResponse<ApiBooking>>(`/bookings/${bookingId}/status`, { status });
    return response.data.data;
  },

  // Cancel booking
  cancel: async (bookingId: number): Promise<void> => {
    await axiosInstance.post(`/bookings/${bookingId}/cancel`);
  },

  // Confirm booking (employee action)
  confirm: async (bookingId: number): Promise<ApiBooking> => {
    const response = await axiosInstance.post<ApiResponse<ApiBooking>>(`/bookings/${bookingId}/confirm`);
    return response.data.data;
  },
};