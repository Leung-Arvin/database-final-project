// src/components/EmployeePages.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import EmployeeDashboard from '../pages/employee/Dashboard'
import EmployeeBookings from '../pages/employee/Bookings'
import EmployeeCheckInOut from '../pages/employee/CheckInOut'
import EmployeeRooms from '../pages/employee/Rooms'
import EmployeeCustomers from '../pages/employee/Customers'
import EmployeeStaff from '../pages/employee/Staff'
import EmployeeReports from '../pages/employee/Reports'
import EmployeeHotelChains from '../pages/employee/HotelChains'
import EmployeeHotels from '../pages/employee/Hotels'
import type { Hotel, Room, Customer, Employee, Booking, Renting, HotelChain } from '../types'

interface EmployeePagesProps {
  hotels: Hotel[]
  rooms: Room[]
  customers: Customer[]
  employees: Employee[]
  bookings: Booking[]
  rentings: Renting[]
  hotelChains: HotelChain[]
  setHotels: React.Dispatch<React.SetStateAction<Hotel[]>>
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>
  setRentings: React.Dispatch<React.SetStateAction<Renting[]>>
  setHotelChains: React.Dispatch<React.SetStateAction<HotelChain[]>>
}

export default function EmployeePages({ 
  hotels, 
  rooms, 
  customers, 
  employees, 
  bookings,
  rentings,
  hotelChains,
  setHotels,
  setRooms,
  setCustomers,
  setEmployees,
  setBookings,
  setRentings,
  setHotelChains
}: EmployeePagesProps) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
      <Route path="/employee/dashboard" element={
        <EmployeeDashboard 
          hotels={hotels}
          rooms={rooms}
          bookings={bookings}
          employees={employees}
          rentings={rentings}
        />
      } />
      <Route path="/employee/hotel-chains" element={
        <EmployeeHotelChains 
          hotelChains={hotelChains}
          setHotelChains={setHotelChains}
        />
      } />
      <Route path="/employee/hotels" element={
        <EmployeeHotels 
          hotels={hotels}
          hotelChains={hotelChains}
          setHotels={setHotels}
        />
      } />
      <Route path="/employee/rooms" element={
        <EmployeeRooms 
          hotels={hotels}
          rooms={rooms}
          setRooms={setRooms}
        />
      } />
      <Route path="/employee/bookings" element={
        <EmployeeBookings 
          bookings={bookings}
          customers={customers}
          hotels={hotels}
          rooms={rooms}
          setBookings={setBookings}
        />
      } />
      <Route path="/employee/check-in" element={
        <EmployeeCheckInOut 
          bookings={bookings}
          customers={customers}
          hotels={hotels}
          rooms={rooms}
          setBookings={setBookings}
          setRentings={setRentings}
        />
      } />
      <Route path="/employee/customers" element={
        <EmployeeCustomers 
          customers={customers}
          setCustomers={setCustomers}
        />
      } />
      <Route path="/employee/employees" element={
        <EmployeeStaff 
          employees={employees}
          hotels={hotels}
          setEmployees={setEmployees}
        />
      } />
      <Route path="/employee/reports" element={
        <EmployeeReports 
          hotels={hotels}
          rooms={rooms}
          bookings={bookings}
          customers={customers}
          rentings={rentings}
        />
      } />
      <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
    </Routes>
  )
}