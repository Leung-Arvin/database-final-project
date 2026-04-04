// src/components/EmployeePages.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import EmployeeDashboard from '../pages/employee/Dashboard'
import EmployeeBookings from '../pages/employee/Bookings'
import EmployeeCheckInOut from '../pages/employee/CheckInOut'
import EmployeeRooms from '../pages/employee/Rooms'
import EmployeeCustomers from '../pages/employee/Customers'
import EmployeeStaff from '../pages/employee/Staff'
import EmployeeReports from '../pages/employee/Reports'
import type { Hotel, Room, Customer, Employee, Booking } from '../types'

interface EmployeePagesProps {
  hotels: Hotel[]
  rooms: Room[]
  customers: Customer[]
  employees: Employee[]
  bookings: Booking[]
}

export default function EmployeePages({ 
  hotels, 
  rooms, 
  customers, 
  employees, 
  bookings 
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
        />
      } />
      <Route path="/employee/bookings" element={
        <EmployeeBookings 
          bookings={bookings}
          customers={customers}
          hotels={hotels}
          rooms={rooms}
        />
      } />
      <Route path="/employee/check-in" element={
        <EmployeeCheckInOut 
          bookings={bookings}
          customers={customers}
          hotels={hotels}
          rooms={rooms}
        />
      } />
      <Route path="/employee/rooms" element={
        <EmployeeRooms 
          hotels={hotels}
          rooms={rooms}
        />
      } />
      <Route path="/employee/customers" element={
        <EmployeeCustomers customers={customers} />
      } />
      <Route path="/employee/employees" element={
        <EmployeeStaff employees={employees} hotels={hotels} />
      } />
      <Route path="/employee/reports" element={
        <EmployeeReports 
          hotels={hotels}
          rooms={rooms}
          bookings={bookings}
          customers={customers}
        />
      } />
      {/* Redirect any unknown employee routes to dashboard */}
      <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
    </Routes>
  )
}