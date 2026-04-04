// src/types/index.ts
export interface HotelChain {
  id: number;
  name: string;
  centralOfficeAddress: string;
  numberOfHotels: number;
  contactEmail: string;
  contactPhone: string;
}

export interface Hotel {
  id: number;
  chainId: number;
  name: string;
  category: number;
  numberOfRooms: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactEmail: string;
  contactPhone: string;
  managerId: number;
}

export interface Room {
  id: number;
  hotelId: number;
  roomNumber: string;
  price: number;
  amenities: string[];
  capacity: string;
  view: 'sea' | 'mountain' | 'city';
  isExtendable: boolean;
  hasDamage: boolean;
  damageDescription?: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phone: string;
  idType: 'SSN' | 'SIN' | 'DRIVING_LICENSE';
  idNumber: string;
  registrationDate: Date;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  sin: string;
  hotelId: number;
  role: string;
  isManager: boolean;
}

export interface Booking {
  id: number;
  customerId: number;
  roomId: number;
  hotelId: number;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  totalPrice: number;
  bookingDate: Date;
}

export interface Renting {
  id: number;
  bookingId?: number;
  customerId: number;
  roomId: number;
  hotelId: number;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentDate?: Date;
}

export interface HotelChainFormData {
  name: string
  centralOfficeAddress: string
  numberOfHotels: number
  contactEmail: string
  contactPhone: string
}

export interface HotelFormData {
  chainId: number
  name: string
  category: number
  address: string
  city: string
  state: string
  zipCode: string
  contactEmail: string
  contactPhone: string
  numberOfRooms: number
  managerId: number
}

export interface RoomFormData {
  hotelId: number
  roomNumber: string
  price: number
  amenities: string[]
  capacity: 'single' | 'double' | 'triple' | 'quad'
  view: 'sea' | 'mountain' | 'city'
  isExtendable: boolean
  hasDamage: boolean
  damageDescription?: string
}
