// src/api/endpoints/customers.ts
import axiosInstance from '../axiosConfig';
import type { ApiResponse, ApiCustomer } from '../types/apiResponses';

export const customersApi = {
  // Get all customers
  getAll: async (): Promise<ApiCustomer[]> => {
    const response = await axiosInstance.get<ApiResponse<ApiCustomer[]>>('/customers');
    return response.data.data;
  },

  // Get customer by ID
  getById: async (customerId: number): Promise<ApiCustomer> => {
    const response = await axiosInstance.get<ApiResponse<ApiCustomer>>(`/customers/${customerId}`);
    return response.data.data;
  },

  // Create new customer
  create: async (data: Omit<ApiCustomer, 'customer_id' | 'registration_date'>): Promise<ApiCustomer> => {
    const response = await axiosInstance.post<ApiResponse<ApiCustomer>>('/customers', data);
    return response.data.data;
  },

  // Update customer
  update: async (customerId: number, data: Partial<ApiCustomer>): Promise<ApiCustomer> => {
    const response = await axiosInstance.put<ApiResponse<ApiCustomer>>(`/customers/${customerId}`, data);
    return response.data.data;
  },

  // Delete customer
  delete: async (customerId: number): Promise<void> => {
    await axiosInstance.delete(`/customers/${customerId}`);
  },

  // Get customer bookings
  getBookings: async (customerId: number): Promise<any[]> => {
    const response = await axiosInstance.get<ApiResponse<any[]>>(`/customers/${customerId}/bookings`);
    return response.data.data;
  },
};