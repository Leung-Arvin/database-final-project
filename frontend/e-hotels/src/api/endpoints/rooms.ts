import axiosInstance from '../axiosConfig';
import type {
  ApiResponse,
  ApiRoom,
  ApiRoomBase,
  CreateRoomRequest,
  SearchRoomsRequest,
} from '../types/apiResponses';

export const roomsApi = {
  // Search rooms
  search: async (params: SearchRoomsRequest): Promise<ApiRoom[]> => {
    const response = await axiosInstance.post<ApiResponse<ApiRoom[]>>(
      '/rooms/search',
      params
    );
    return response.data.data;
  },

  // Get room by composite key
  getByCompositeKey: async (
    hotelId: number,
    roomNumber: number
  ): Promise<ApiRoom> => {
    const response = await axiosInstance.get<ApiResponse<ApiRoom>>(
      `/rooms/${hotelId}/${roomNumber}`
    );
    return response.data.data;
  },

  // Create new room
  create: async (data: CreateRoomRequest): Promise<ApiRoom> => {
    const response = await axiosInstance.post<ApiResponse<ApiRoom>>(
      '/rooms',
      data
    );
    return response.data.data;
  },

  // Update room
  update: async (
    hotelId: number,
    roomNumber: number,
    data: Partial<ApiRoomBase>
  ): Promise<ApiRoom> => {
    const response = await axiosInstance.put<ApiResponse<ApiRoom>>(
      `/rooms/${hotelId}/${roomNumber}`,
      data
    );
    return response.data.data;
  },

  // Delete room
  delete: async (hotelId: number, roomNumber: number): Promise<void> => {
    await axiosInstance.delete(`/rooms/${hotelId}/${roomNumber}`);
  },

  // Get room amenities
  getAmenities: async (
    hotelId: number,
    roomNumber: number
  ): Promise<string[]> => {
    const response = await axiosInstance.get<ApiResponse<string[]>>(
      `/rooms/${hotelId}/${roomNumber}/amenities`
    );
    return response.data.data;
  },

  // Add amenity to room
  addAmenity: async (
    hotelId: number,
    roomNumber: number,
    amenity: string
  ): Promise<void> => {
    await axiosInstance.post(
      `/rooms/${hotelId}/${roomNumber}/amenities`,
      { amenity }
    );
  },

  // Remove amenity from room
  removeAmenity: async (
    hotelId: number,
    roomNumber: number,
    amenity: string
  ): Promise<void> => {
    await axiosInstance.delete(
      `/rooms/${hotelId}/${roomNumber}/amenities/${encodeURIComponent(amenity)}`
    );
  },

  // Report room problem
  reportProblem: async (
    hotelId: number,
    roomNumber: number,
    description: string
  ): Promise<void> => {
    await axiosInstance.post(
      `/rooms/${hotelId}/${roomNumber}/problems`,
      { description }
    );
  },

  // Resolve room problem
  resolveProblem: async (problemId: number): Promise<void> => {
    await axiosInstance.put(`/rooms/problems/${problemId}/resolve`);
  },
};