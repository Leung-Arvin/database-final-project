// src/api/types/apiResponses.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Entity types matching your schema
export interface ApiHotelChain {
  chain_id: number;
  chain_name: string;
  central_office_address: string;
}

export interface ApiHotel {
  hotel_id: number;
  chain_id: number;
  chain_name: string;
  rating: number;
  address: string;
  area: string;
  contact_email: string;
  manager_employee_id: number | null;
}

export interface ApiRoom {
  hotel_id: number;
  room_number: string;
  base_price: number;
  capacity: string;
  view_type: string;
  extendable: boolean;
}

export interface ApiCustomer {
  customer_id: number;
  full_name: string;
  address: string;
  id_type: string;
  id_number: string;
  registration_date: string;
  email: string;
  phone: string;
}

export interface ApiEmployee {
  employee_id: number;
  hotel_id: number;
  full_name: string;
  address: string;
  ssn_sin: string;
  role: string;
  email: string;
  phone: string;
  isManager: boolean;
}

export interface ApiBooking {
  booking_id: number;
  customer_id: number;
  hotel_id: number;
  room_number: string;
  hotel_name_snapshot: string;
  hotel_address_snapshot: string;
  room_number_snapshot: string;
  start_date: string;
  end_date: string;
  booking_price: number;
  status: string;
  isDeleted: boolean;
}

export interface ApiRenting {
  renting_id: number;
  customer_id: number;
  hotel_id: number;
  room_number: string;
  employee_id: number;
  booking_id: number | null;
  hotel_name_snapshot: string;
  hotel_address_snapshot: string;
  room_number_snapshot: string;
  check_in_date: string;
  check_out_date: string;
  actual_check_in: string | null;
  actual_check_out: string | null;
  price: number;
  total_amount: number;
  isDeleted: boolean;
}

// Request types
export interface SearchRoomsRequest {
  start_date?: string;
  end_date?: string;
  capacity?: string;
  area?: string;
  hotel_chain_id?: number;
  rating?: number;
  min_price?: number;
  max_price?: number;
}

export interface CreateBookingRequest {
  customer_id: number;
  hotel_id: number;
  room_number: string;
  start_date: string;
  end_date: string;
  booking_price: number;
}

export interface CreateCustomerRequest {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  id_type: string;
  id_number: string;
}

export interface CreateEmployeeRequest {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  hotel_id: number;
  role: string;
  ssn_sin: string;
  isManager: boolean;
}

export interface CreateHotelChainRequest {
  chain_name: string;
  central_office_address: string;
}

export interface CreateHotelRequest {
  chain_id: number;
  rating: number;
  address: string;
  area: string;
  contact_email: string;
  manager_employee_id?: number;
}

export interface CreateRoomRequest {
  hotel_id: number;
  room_number: string;
  base_price: number;
  capacity: string;
  view_type: string;
  extendable: boolean;
}

export interface CheckInRequest {
  booking_id: number;
  employee_id: number;
  payment_amount?: number;
  payment_method?: string;
}

export interface DirectRentRequest {
  customer_id: number;
  hotel_id: number;
  room_number: string;
  employee_id: number;
  start_date: string;
  end_date: string;
  payment_amount: number;
  payment_method: string;
}