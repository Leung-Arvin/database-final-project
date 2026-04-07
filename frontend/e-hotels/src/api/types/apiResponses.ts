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
  rating: number;
  address: string;
  area: string;
  contact_email: string;
  manager_employee_id: number | null;
}

/**
 * Base Room entity shape, matching the Room relation in your schema.
 */
export interface ApiRoomBase {
  hotel_id: number;
  room_number: number;
  base_price: number;
  capacity: number;
  view_type: 'Sea' | 'Mountain';
  extendable: boolean | number; // Might be able to be tightened to just boolean
}

/**
 * Enriched room shape returned by the backend service layer.
 * This matches what the UI can receive from room search/get endpoints.
 */
export interface ApiRoom extends ApiRoomBase {
  amenities?: string[];
  hasDamage?: boolean;
  damageDescription?: string | null;
  activeProblemId?: number | null;
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
  ssn_sin: number | string;
  role: string;
  email: string;
  phone: string;
}

export interface ApiBooking {
  booking_id: number;
  customer_id: number;
  hotel_id: number | null;
  room_number: number | null;
  hotel_name_snapshot: string | null;
  hotel_address_snapshot: string | null;
  room_number_snapshot: number | null;
  start_date: string;
  end_date: string;
  checkin_time: string | null;
  checkout_time: string | null;
  booking_price: number;
  status: 'active' | 'cancelled' | 'converted_to_renting';
  isDeleted: number;
}

export interface ApiRenting {
  renting_id: number;
  customer_id: number;
  hotel_id: number | null;
  room_number: number | null;
  employee_id: number;
  booking_id: number | null;
  hotel_name_snapshot: string | null;
  hotel_address_snapshot: string | null;
  room_number_snapshot: number | null;
  check_in_date: string;
  check_out_date: string;
  actual_check_in: string | null;
  actual_check_out: string | null;
  price: number;
  total_amount: number;
  payment_method: string | null;
  isDeleted: number;
}

// Request types
export interface SearchRoomsRequest {
  hotel_id?: number;
  start_date?: string;
  end_date?: string;
  capacity?: number;
  area?: string;
  hotel_chain_id?: number;
  rating?: number;
  min_price?: number;
  max_price?: number;
}

export interface CreateBookingRequest {
  customer_id: number;
  hotel_id: number;
  room_number: number;
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
  ssn_sin: number | string;
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
  manager_employee_id?: number | null;
}

export interface CreateRoomRequest extends ApiRoomBase {}

export interface CheckInRequest {
  booking_id: number;
  employee_id: number;
  payment_amount?: number;
  payment_method?: string;
}

export interface DirectRentRequest {
  customer_id: number;
  hotel_id: number;
  room_number: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  payment_amount: number;
  payment_method: string;
}