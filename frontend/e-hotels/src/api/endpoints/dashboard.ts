import { bookingsApi } from './bookings'
import { employeesApi } from './employees'
import { hotelsApi } from './hotels'
import { rentingsApi } from './rentings'
import { roomsApi } from './rooms'
import type {
  ApiBooking,
  ApiEmployee,
  ApiHotel,
  ApiRenting,
  ApiRoom,
} from '../types/apiResponses'

export interface DashboardData {
  hotels: ApiHotel[]
  rooms: ApiRoom[]
  bookings: ApiBooking[]
  employees: ApiEmployee[]
  rentings: ApiRenting[]
}

export const dashboardApi = {
  getAllData: async (): Promise<DashboardData> => {
    const [hotels, rooms, bookings, employees, rentings] = await Promise.all([
      hotelsApi.getAll(),
      roomsApi.search({}),
      bookingsApi.getAll(),
      employeesApi.getAll(),
      rentingsApi.getAll(),
    ])

    return {
      hotels,
      rooms,
      bookings,
      employees,
      rentings,
    }
  },
}