// src/lib/data.ts
import type { HotelChain, Hotel, Room, Customer, Employee, Booking, Renting } from '../types'

export const hotelChains: HotelChain[] = [
  {
    id: 1,
    name: 'Luxury Hotels International',
    centralOfficeAddress: '123 Park Avenue, New York, NY 10001',
    numberOfHotels: 12,
    contactEmail: 'corporate@luxuryhotels.com',
    contactPhone: '+1-212-555-0100'
  },
  {
    id: 2,
    name: 'Premier Inn Group',
    centralOfficeAddress: '456 Bay Street, Toronto, ON M5H 2T5',
    numberOfHotels: 15,
    contactEmail: 'headquarters@premierinn.com',
    contactPhone: '+1-416-555-0200'
  },
  {
    id: 3,
    name: 'Coast Hotels & Resorts',
    centralOfficeAddress: '789 Granville Street, Vancouver, BC V6Z 1L1',
    numberOfHotels: 8,
    contactEmail: 'corporate@coasthotels.com',
    contactPhone: '+1-604-555-0300'
  },
  {
    id: 4,
    name: 'Metropolitan Hospitality',
    centralOfficeAddress: '321 Michigan Avenue, Chicago, IL 60601',
    numberOfHotels: 10,
    contactEmail: 'info@metropolitanhotels.com',
    contactPhone: '+1-312-555-0400'
  },
  {
    id: 5,
    name: 'Sunset Resorts Worldwide',
    centralOfficeAddress: '999 Ocean Drive, Miami Beach, FL 33139',
    numberOfHotels: 14,
    contactEmail: 'corporate@sunsetresorts.com',
    contactPhone: '+1-305-555-0500'
  }
]

export const hotels: Hotel[] = [
  { id: 1, chainId: 1, name: 'The Grand Manhattan', category: 5, numberOfRooms: 250, address: '100 Broadway', city: 'New York', state: 'NY', zipCode: '10005', contactEmail: 'manhattan@luxuryhotels.com', contactPhone: '+1-212-555-1100', managerId: 1 },
  { id: 2, chainId: 1, name: 'The Plaza Downtown', category: 4, numberOfRooms: 180, address: '500 5th Avenue', city: 'New York', state: 'NY', zipCode: '10036', contactEmail: 'plaza@luxuryhotels.com', contactPhone: '+1-212-555-1200', managerId: 2 },
  { id: 3, chainId: 1, name: 'Boston Harbor Hotel', category: 4, numberOfRooms: 150, address: '70 Rowes Wharf', city: 'Boston', state: 'MA', zipCode: '02110', contactEmail: 'boston@luxuryhotels.com', contactPhone: '+1-617-555-1300', managerId: 3 },
  { id: 4, chainId: 2, name: 'Premier Inn Toronto Downtown', category: 3, numberOfRooms: 200, address: '200 Front Street', city: 'Toronto', state: 'ON', zipCode: 'M5V 3L1', contactEmail: 'toronto@premierinn.com', contactPhone: '+1-416-555-2100', managerId: 4 },
  { id: 5, chainId: 2, name: 'Premier Inn Ottawa', category: 3, numberOfRooms: 120, address: '150 Albert Street', city: 'Ottawa', state: 'ON', zipCode: 'K1P 5G2', contactEmail: 'ottawa@premierinn.com', contactPhone: '+1-613-555-2200', managerId: 5 },
  { id: 6, chainId: 2, name: 'Premier Inn Montreal', category: 3, numberOfRooms: 160, address: '1000 Rue de la Gauchetière', city: 'Montreal', state: 'QC', zipCode: 'H3B 4W5', contactEmail: 'montreal@premierinn.com', contactPhone: '+1-514-555-2300', managerId: 6 },
  { id: 7, chainId: 3, name: 'Coast Coal Harbour Hotel', category: 4, numberOfRooms: 120, address: '1180 West Hastings Street', city: 'Vancouver', state: 'BC', zipCode: 'V6E 4R5', contactEmail: 'coalharbour@coasthotels.com', contactPhone: '+1-604-555-3100', managerId: 7 },
  { id: 8, chainId: 3, name: 'Coast Victoria Hotel', category: 3, numberOfRooms: 90, address: '146 Kingston Street', city: 'Victoria', state: 'BC', zipCode: 'V8V 1V4', contactEmail: 'victoria@coasthotels.com', contactPhone: '+1-250-555-3200', managerId: 8 },
  { id: 9, chainId: 4, name: 'Metropolitan Chicago', category: 4, numberOfRooms: 220, address: '300 E Wacker Dr', city: 'Chicago', state: 'IL', zipCode: '60601', contactEmail: 'chicago@metropolitanhotels.com', contactPhone: '+1-312-555-4100', managerId: 9 },
  { id: 10, chainId: 4, name: 'Metropolitan Detroit', category: 3, numberOfRooms: 100, address: '150 W Jefferson Ave', city: 'Detroit', state: 'MI', zipCode: '48226', contactEmail: 'detroit@metropolitanhotels.com', contactPhone: '+1-313-555-4200', managerId: 10 },
  { id: 11, chainId: 5, name: 'Sunset Miami Beach', category: 5, numberOfRooms: 300, address: '1 Ocean Drive', city: 'Miami Beach', state: 'FL', zipCode: '33139', contactEmail: 'miami@sunsetresorts.com', contactPhone: '+1-305-555-5100', managerId: 11 },
  { id: 12, chainId: 5, name: 'Sunset Orlando Resort', category: 4, numberOfRooms: 280, address: '5000 Universal Blvd', city: 'Orlando', state: 'FL', zipCode: '32819', contactEmail: 'orlando@sunsetresorts.com', contactPhone: '+1-407-555-5200', managerId: 12 }
]

export const rooms: Room[] = [
  { id: 1, hotelId: 1, roomNumber: '101', price: 450, amenities: ['TV', 'AC', 'Fridge', 'Mini Bar', 'WiFi'], capacity: 'single', view: 'city', isExtendable: false, hasDamage: true, damageDescription: 'Someone robbed this room' },
  { id: 2, hotelId: 1, roomNumber: '102', price: 550, amenities: ['TV', 'AC', 'Fridge', 'Mini Bar', 'WiFi', 'Jacuzzi'], capacity: 'double', view: 'city', isExtendable: true, hasDamage: false },
  { id: 3, hotelId: 1, roomNumber: '201', price: 650, amenities: ['TV', 'AC', 'Fridge', 'Mini Bar', 'WiFi', 'Ocean View'], capacity: 'double', view: 'sea', isExtendable: true, hasDamage: false },
  { id: 4, hotelId: 1, roomNumber: '202', price: 750, amenities: ['TV', 'AC', 'Fridge', 'Mini Bar', 'WiFi', 'Ocean View', 'Balcony'], capacity: 'triple', view: 'sea', isExtendable: true, hasDamage: false },
  { id: 5, hotelId: 1, roomNumber: '301', price: 850, amenities: ['TV', 'AC', 'Fridge', 'Mini Bar', 'WiFi', 'Ocean View', 'Suite'], capacity: 'quad', view: 'sea', isExtendable: true, hasDamage: false },
  { id: 6, hotelId: 4, roomNumber: '101', price: 180, amenities: ['TV', 'AC', 'Fridge', 'WiFi'], capacity: 'single', view: 'city', isExtendable: false, hasDamage: false },
  { id: 7, hotelId: 4, roomNumber: '102', price: 220, amenities: ['TV', 'AC', 'Fridge', 'WiFi', 'Coffee Maker'], capacity: 'double', view: 'city', isExtendable: true, hasDamage: false },
  { id: 8, hotelId: 4, roomNumber: '201', price: 250, amenities: ['TV', 'AC', 'Fridge', 'WiFi', 'City View'], capacity: 'double', view: 'city', isExtendable: true, hasDamage: false },
  { id: 9, hotelId: 4, roomNumber: '202', price: 300, amenities: ['TV', 'AC', 'Fridge', 'WiFi', 'City View', 'Work Desk'], capacity: 'triple', view: 'city', isExtendable: true, hasDamage: false },
  { id: 10, hotelId: 7, roomNumber: '401', price: 320, amenities: ['TV', 'AC', 'Fridge', 'WiFi', 'Mountain View'], capacity: 'double', view: 'mountain', isExtendable: false, hasDamage: false },
  { id: 11, hotelId: 7, roomNumber: '402', price: 380, amenities: ['TV', 'AC', 'Fridge', 'WiFi', 'Mountain View', 'Balcony'], capacity: 'double', view: 'mountain', isExtendable: true, hasDamage: false },
  { id: 12, hotelId: 7, roomNumber: '501', price: 450, amenities: ['TV', 'AC', 'Fridge', 'WiFi', 'Harbor View', 'Mini Bar'], capacity: 'triple', view: 'sea', isExtendable: true, hasDamage: false },
  { id: 13, hotelId: 11, roomNumber: '101', price: 550, amenities: ['TV', 'AC', 'Fridge', 'WiFi', 'Ocean View', 'Mini Bar'], capacity: 'double', view: 'sea', isExtendable: true, hasDamage: false },
  { id: 14, hotelId: 11, roomNumber: '102', price: 650, amenities: ['TV', 'AC', 'Fridge', 'WiFi', 'Ocean View', 'Mini Bar', 'Balcony'], capacity: 'double', view: 'sea', isExtendable: true, hasDamage: false },
  { id: 15, hotelId: 11, roomNumber: '201', price: 750, amenities: ['TV', 'AC', 'Fridge', 'WiFi', 'Ocean View', 'Jacuzzi'], capacity: 'triple', view: 'sea', isExtendable: true, hasDamage: false }
]

export const customers: Customer[] = [
  { id: 1, firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', address: '123 Main St, Toronto, ON', phone: '+1-416-555-1001', idType: 'DRIVING_LICENSE', idNumber: 'DL123456', registrationDate: new Date('2024-01-15') },
  { id: 2, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', address: '456 Oak Ave, Vancouver, BC', phone: '+1-604-555-1002', idType: 'SSN', idNumber: 'SSN789012', registrationDate: new Date('2024-01-20') },
  { id: 3, firstName: 'Michael', lastName: 'Brown', email: 'michael.b@email.com', address: '789 Pine St, New York, NY', phone: '+1-212-555-1003', idType: 'SIN', idNumber: 'SIN345678', registrationDate: new Date('2024-02-01') },
  { id: 4, firstName: 'Emily', lastName: 'Davis', email: 'emily.d@email.com', address: '321 Elm St, Chicago, IL', phone: '+1-312-555-1004', idType: 'DRIVING_LICENSE', idNumber: 'DL987654', registrationDate: new Date('2024-02-10') },
  { id: 5, firstName: 'David', lastName: 'Wilson', email: 'david.w@email.com', address: '654 Maple Dr, Miami, FL', phone: '+1-305-555-1005', idType: 'SSN', idNumber: 'SSN456789', registrationDate: new Date('2024-02-15') }
]

export const employees: Employee[] = [
  { id: 1, firstName: 'Robert', lastName: 'Anderson', email: 'robert.a@luxuryhotels.com', address: '100 Park Ave, NY', sin: 'SIN001', hotelId: 1, role: 'General Manager', isManager: true },
  { id: 2, firstName: 'Jennifer', lastName: 'Martinez', email: 'jennifer.m@luxuryhotels.com', address: '200 5th Ave, NY', sin: 'SIN002', hotelId: 2, role: 'Hotel Manager', isManager: true },
  { id: 3, firstName: 'William', lastName: 'Taylor', email: 'william.t@luxuryhotels.com', address: '300 Beacon St, Boston', sin: 'SIN003', hotelId: 3, role: 'General Manager', isManager: true },
  { id: 4, firstName: 'Lisa', lastName: 'Thomas', email: 'lisa.t@premierinn.com', address: '400 Front St, Toronto', sin: 'SIN004', hotelId: 4, role: 'Hotel Manager', isManager: true },
  { id: 5, firstName: 'James', lastName: 'White', email: 'james.w@premierinn.com', address: '500 Albert St, Ottawa', sin: 'SIN005', hotelId: 5, role: 'General Manager', isManager: true },
  { id: 6, firstName: 'Patricia', lastName: 'Harris', email: 'patricia.h@premierinn.com', address: '600 Gauchetière, Montreal', sin: 'SIN006', hotelId: 6, role: 'Hotel Manager', isManager: true },
  { id: 7, firstName: 'Charles', lastName: 'Clark', email: 'charles.c@coasthotels.com', address: '700 Hastings, Vancouver', sin: 'SIN007', hotelId: 7, role: 'General Manager', isManager: true },
  { id: 8, firstName: 'Barbara', lastName: 'Lewis', email: 'barbara.l@coasthotels.com', address: '800 Kingston, Victoria', sin: 'SIN008', hotelId: 8, role: 'Hotel Manager', isManager: true },
  { id: 9, firstName: 'Richard', lastName: 'Walker', email: 'richard.w@metropolitanhotels.com', address: '900 Wacker, Chicago', sin: 'SIN009', hotelId: 9, role: 'General Manager', isManager: true },
  { id: 10, firstName: 'Susan', lastName: 'Hall', email: 'susan.h@metropolitanhotels.com', address: '1000 Jefferson, Detroit', sin: 'SIN010', hotelId: 10, role: 'Hotel Manager', isManager: true },
  { id: 11, firstName: 'Thomas', lastName: 'Young', email: 'thomas.y@sunsetresorts.com', address: '1100 Ocean Dr, Miami', sin: 'SIN011', hotelId: 11, role: 'General Manager', isManager: true },
  { id: 12, firstName: 'Nancy', lastName: 'King', email: 'nancy.k@sunsetresorts.com', address: '1200 Universal, Orlando', sin: 'SIN012', hotelId: 12, role: 'Hotel Manager', isManager: true }
]

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)

const twoDaysLater = new Date(today)
twoDaysLater.setDate(today.getDate() + 2)

const threeDaysLater = new Date(today)
threeDaysLater.setDate(today.getDate() + 3)

const fiveDaysLater = new Date(today)
fiveDaysLater.setDate(today.getDate() + 5)

const nextWeek = new Date(today)
nextWeek.setDate(today.getDate() + 7)

const lastWeek = new Date(today)
lastWeek.setDate(today.getDate() - 7)

export const bookings: Booking[] = [
  // TODAY'S CHECK-INS (Status: confirmed, startDate = today)
  {
    id: 1,
    customerId: 1,
    roomId: 3,
    hotelId: 1,
    startDate: today,
    endDate: threeDaysLater,
    status: 'confirmed',
    totalPrice: 1950, // 3 nights * $650
    bookingDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) // Booked 7 days ago
  },
  {
    id: 2,
    customerId: 2,
    roomId: 7,
    hotelId: 4,
    startDate: today,
    endDate: twoDaysLater,
    status: 'confirmed',
    totalPrice: 440, // 2 nights * $220
    bookingDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) // Booked 3 days ago
  },
  {
    id: 3,
    customerId: 3,
    roomId: 11,
    hotelId: 7,
    startDate: today,
    endDate: fiveDaysLater,
    status: 'confirmed',
    totalPrice: 1900, // 5 nights * $380
    bookingDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000) // Booked 10 days ago
  },
  {
    id: 4,
    customerId: 4,
    roomId: 14,
    hotelId: 11,
    startDate: today,
    endDate: tomorrow,
    status: 'confirmed',
    totalPrice: 650, // 1 night * $650
    bookingDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) // Booked 2 days ago
  },
  
  // TOMORROW'S CHECK-INS (Status: confirmed, startDate = tomorrow)
  {
    id: 5,
    customerId: 5,
    roomId: 2,
    hotelId: 1,
    startDate: tomorrow,
    endDate: threeDaysLater,
    status: 'confirmed',
    totalPrice: 1100, // 2 nights * $550
    bookingDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000) // Booked 5 days ago
  },
  {
    id: 6,
    customerId: 1,
    roomId: 9,
    hotelId: 4,
    startDate: tomorrow,
    endDate: fiveDaysLater,
    status: 'confirmed',
    totalPrice: 1200, // 4 nights * $300
    bookingDate: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000) // Booked 8 days ago
  },
  
  // CURRENT ACTIVE STAYS (Status: checked_in)
  {
    id: 7,
    customerId: 2,
    roomId: 5,
    hotelId: 1,
    startDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    endDate: tomorrow,
    status: 'checked_in',
    totalPrice: 1700, // 2 nights * $850
    bookingDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000) // Booked 14 days ago
  },
  {
    id: 8,
    customerId: 3,
    roomId: 12,
    hotelId: 7,
    startDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    endDate: twoDaysLater,
    status: 'checked_in',
    totalPrice: 900, // 2 nights * $450
    bookingDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000) // Booked 6 days ago
  },
  
  // PAST COMPLETED STAYS (Status: checked_out)
  {
    id: 9,
    customerId: 4,
    roomId: 1,
    hotelId: 1,
    startDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    endDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    status: 'checked_out',
    totalPrice: 1350, // 3 nights * $450
    bookingDate: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000) // Booked 20 days ago
  },
  {
    id: 10,
    customerId: 5,
    roomId: 6,
    hotelId: 4,
    startDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    endDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    status: 'checked_out',
    totalPrice: 360, // 2 nights * $180
    bookingDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000) // Booked 15 days ago
  },
  
  // FUTURE BOOKINGS (Status: confirmed, future dates)
  {
    id: 11,
    customerId: 1,
    roomId: 4,
    hotelId: 1,
    startDate: nextWeek,
    endDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
    status: 'confirmed',
    totalPrice: 3000, // 4 nights * $750
    bookingDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) // Booked 3 days ago
  },
  {
    id: 12,
    customerId: 2,
    roomId: 10,
    hotelId: 7,
    startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    endDate: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000),
    status: 'confirmed',
    totalPrice: 1280, // 4 nights * $320
    bookingDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000) // Booked 1 day ago
  },
  
  // PENDING BOOKINGS (Awaiting employee confirmation)
  {
    id: 13,
    customerId: 3,
    roomId: 8,
    hotelId: 4,
    startDate: twoDaysLater,
    endDate: fiveDaysLater,
    status: 'pending',
    totalPrice: 750, // 3 nights * $250
    bookingDate: new Date() // Booked today
  },
  {
    id: 14,
    customerId: 4,
    roomId: 15,
    hotelId: 11,
    startDate: threeDaysLater,
    endDate: new Date(threeDaysLater.getTime() + 4 * 24 * 60 * 60 * 1000),
    status: 'pending',
    totalPrice: 3000, // 4 nights * $750
    bookingDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000) // Booked yesterday
  },
  {
    id: 15,
    customerId: 5,
    roomId: 13,
    hotelId: 11,
    startDate: nextWeek,
    endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
    status: 'pending',
    totalPrice: 1100, // 2 nights * $550
    bookingDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) // Booked 2 days ago
  },
  
  // CANCELLED BOOKINGS
  {
    id: 16,
    customerId: 1,
    roomId: 2,
    hotelId: 1,
    startDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000),
    status: 'cancelled',
    totalPrice: 1100,
    bookingDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000) // Booked 5 days ago, cancelled 3 days ago
  }
]


export const rentings: Renting[] = [
  {
    id: 1,
    bookingId: 1,
    customerId: 1,
    roomId: 3,
    hotelId: 1,
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-03-20'),
    totalPrice: 3250,
    paymentStatus: 'paid',
    paymentDate: new Date('2025-03-15')
  }
]