// src/api/endpoints/rentings.ts
import axiosInstance from '../axiosConfig';
import type { ApiResponse, ApiRenting, CheckInRequest, DirectRentRequest } from '../types/apiResponses';

export const rentingsApi = {
  // Get all rentings
  getAll: async (): Promise<ApiRenting[]> => {
    const response = await axiosInstance.get<ApiResponse<ApiRenting[]>>('/rentings');
    return response.data.data;
  },

  // Get renting by ID
  getById: async (rentingId: number): Promise<ApiRenting> => {
    const response = await axiosInstance.get<ApiResponse<ApiRenting>>(`/rentings/${rentingId}`);
    return response.data.data;
  },

  // Check in (convert booking to renting)
  checkIn: async (data: CheckInRequest): Promise<ApiRenting> => {
    const response = await axiosInstance.post<ApiResponse<ApiRenting>>('/rentings/check-in', data);
    return response.data.data;
  },

  // Direct rental (walk-in customer)
  directRent: async (data: DirectRentRequest): Promise<ApiRenting> => {
    const response = await axiosInstance.post<ApiResponse<ApiRenting>>('/rentings/direct', data);
    return response.data.data;
  },

  // Check out (complete rental and process payment)
  checkOut: async (rentingId: number, paymentAmount: number, paymentMethod: string): Promise<ApiRenting> => {
    const response = await axiosInstance.post<ApiResponse<ApiRenting>>(`/rentings/${rentingId}/check-out`, {
      payment_amount: paymentAmount,
      payment_method: paymentMethod,
    });
    return response.data.data;
  },
};