import axiosInstance from '../axiosConfig';
import type { ApiResponse, ApiEmployee } from '../types/apiResponses';

export const employeesApi = {
  getAll: async (filters?: {
    hotel_id?: number;
    role?: string;
    isManager?: boolean;
  }): Promise<ApiEmployee[]> => {
    const response = await axiosInstance.get<ApiResponse<ApiEmployee[]>>('/employees', {
      params: filters,
    });
    return response.data.data;
  },

  getById: async (employeeId: number): Promise<ApiEmployee> => {
    const response = await axiosInstance.get<ApiResponse<ApiEmployee>>(`/employees/${employeeId}`);
    return response.data.data;
  },

  create: async (data: Omit<ApiEmployee, 'employee_id'>): Promise<ApiEmployee> => {
    const response = await axiosInstance.post<ApiResponse<ApiEmployee>>('/employees', data);
    return response.data.data;
  },

  update: async (employeeId: number, data: Partial<ApiEmployee>): Promise<ApiEmployee> => {
    const response = await axiosInstance.put<ApiResponse<ApiEmployee>>(`/employees/${employeeId}`, data);
    return response.data.data;
  },

  delete: async (employeeId: number): Promise<void> => {
    await axiosInstance.delete(`/employees/${employeeId}`);
  },
};