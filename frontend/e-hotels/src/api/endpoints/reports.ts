import axiosInstance from '../axiosConfig'
import type { ApiResponse } from '../types/apiResponses'

export interface AvailableRoomsPerAreaReportRow {
  area: string
  available_rooms: number
}

export interface RoomCapacityByHotelReportRow {
  hotel_id: number
  chain_name: string
  area: string
  address: string
  total_rooms: number
  total_capacity: number
}

export interface HotelAboveAverageCapacityRow {
  hotel_id: number
  chain_name: string
  area: string
  address: string
  total_rooms: number
  total_capacity: number
}

export const reportsApi = {
  getAvailableRoomsPerArea: async (): Promise<AvailableRoomsPerAreaReportRow[]> => {
    const response = await axiosInstance.get<ApiResponse<AvailableRoomsPerAreaReportRow[]>>(
      '/reports/available-rooms-per-area'
    )
    return response.data.data
  },

  getRoomCapacityByHotel: async (): Promise<RoomCapacityByHotelReportRow[]> => {
    const response = await axiosInstance.get<ApiResponse<RoomCapacityByHotelReportRow[]>>(
      '/reports/room-capacity-by-hotel'
    )
    return response.data.data
  },

  getRoomCapacityByHotelId: async (
    hotelId: number
  ): Promise<RoomCapacityByHotelReportRow> => {
    const response = await axiosInstance.get<ApiResponse<RoomCapacityByHotelReportRow>>(
      `/reports/room-capacity-by-hotel/${hotelId}`
    )
    return response.data.data
  },

  getHotelsAboveAverageCapacity: async (): Promise<HotelAboveAverageCapacityRow[]> => {
    const response = await axiosInstance.get<ApiResponse<HotelAboveAverageCapacityRow[]>>(
      '/reports/hotels-above-average-capacity'
    )
    return response.data.data
  },
}