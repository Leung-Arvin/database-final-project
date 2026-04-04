// src/api/endpoints/hotels.ts
import axiosInstance from '../axiosConfig';
import type { ApiResponse, ApiHotel } from '../types/apiResponses';

export const hotelsApi = {
  // Get all hotels (with optional filters)
  getAll: async (filters?: {
    chain_id?: number;
    rating?: number;
    area?: string;
  }): Promise<ApiHotel[]> => {
    const response = await axiosInstance.get<ApiResponse<ApiHotel[]>>('/hotels', { params: filters });
    return response.data.data;
  },

  // Get hotel by ID
  getById: async (hotelId: number): Promise<ApiHotel> => {
    const response = await axiosInstance.get<ApiResponse<ApiHotel>>(`/hotels/${hotelId}`);
    return response.data.data;
  },

  // Create new hotel
  create: async (data: Omit<ApiHotel, 'hotel_id'>): Promise<ApiHotel> => {
    const response = await axiosInstance.post<ApiResponse<ApiHotel>>('/hotels', data);
    return response.data.data;
  },

  // Update hotel
  update: async (hotelId: number, data: Partial<ApiHotel>): Promise<ApiHotel> => {
    const response = await axiosInstance.put<ApiResponse<ApiHotel>>(`/hotels/${hotelId}`, data);
    return response.data.data;
  },

  // Delete hotel
  delete: async (hotelId: number): Promise<void> => {
    await axiosInstance.delete(`/hotels/${hotelId}`);
  },

  // Get rooms for a hotel
  getRooms: async (hotelId: number): Promise<any[]> => {
    const response = await axiosInstance.get<ApiResponse<any[]>>(`/hotels/${hotelId}/rooms`);
    return response.data.data;
  },
};