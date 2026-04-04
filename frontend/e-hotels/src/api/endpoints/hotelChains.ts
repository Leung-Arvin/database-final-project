// src/api/endpoints/hotelChains.ts
import axiosInstance from '../axiosConfig';
import type { ApiResponse, ApiHotelChain } from '../types/apiResponses';

export const hotelChainsApi = {
  // Get all hotel chains
  getAll: async (): Promise<ApiHotelChain[]> => {
    const response = await axiosInstance.get<ApiResponse<ApiHotelChain[]>>('/hotel-chains');
    return response.data.data;
  },

  // Get hotel chain by ID
  getById: async (chainId: number): Promise<ApiHotelChain> => {
    const response = await axiosInstance.get<ApiResponse<ApiHotelChain>>(`/hotel-chains/${chainId}`);
    return response.data.data;
  },

  // Create new hotel chain
  create: async (data: Omit<ApiHotelChain, 'chain_id'>): Promise<ApiHotelChain> => {
    const response = await axiosInstance.post<ApiResponse<ApiHotelChain>>('/hotel-chains', data);
    return response.data.data;
  },

  // Update hotel chain
  update: async (chainId: number, data: Partial<ApiHotelChain>): Promise<ApiHotelChain> => {
    const response = await axiosInstance.put<ApiResponse<ApiHotelChain>>(`/hotel-chains/${chainId}`, data);
    return response.data.data;
  },

  // Delete hotel chain
  delete: async (chainId: number): Promise<void> => {
    await axiosInstance.delete(`/hotel-chains/${chainId}`);
  },

  // Get hotels under a chain
  getHotels: async (chainId: number): Promise<any[]> => {
    const response = await axiosInstance.get<ApiResponse<any[]>>(`/hotel-chains/${chainId}/hotels`);
    return response.data.data;
  },
};