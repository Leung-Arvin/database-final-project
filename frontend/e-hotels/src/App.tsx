// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import CustomerHomePage from './pages/customer/HomePage'
import CustomerBookingsPage from './pages/customer/BookingsPage'
import CustomerProfilePage from './pages/customer/ProfilePage'
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeBookings from './pages/employee/Bookings'
import EmployeeCheckInOut from './pages/employee/CheckInOut'
import EmployeeRooms from './pages/employee/Rooms'
import EmployeeCustomers from './pages/employee/Customers'
import EmployeeStaff from './pages/employee/Staff'
import EmployeeReports from './pages/employee/Reports'
import EmployeeHotels from './pages/employee/Hotels'
import { 
  hotelChains as initialHotelChains, 
  hotels as initialHotels, 
  rooms as initialRooms, 
  customers as initialCustomers, 
  employees as initialEmployees, 
  bookings as initialBookings,
  rentings as initialRentings
} from './lib/data'

function App() {
  const [userRole, setUserRole] = useState<'customer' | 'employee'>('customer')
  const [hotelChains, setHotelChains] = useState(initialHotelChains)
  const [hotels, setHotels] = useState(initialHotels)
  const [rooms, setRooms] = useState(initialRooms)
  const [customers, setCustomers] = useState(initialCustomers)
  const [employees, setEmployees] = useState(initialEmployees)
  const [bookings, setBookings] = useState(initialBookings)
  const [rentings, setRentings] = useState(initialRentings)
  
  // For demo, using first customer. In real app, would use logged-in customer
  const currentCustomer = customers[0]
  const currentEmployee = employees[0]
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation userRole={userRole} setUserRole={setUserRole} />
        <main>
          {userRole === 'customer' ? (
            <Routes>
              <Route path="/" element={
                <CustomerHomePage 
                  hotelChains={hotelChains}
                  hotels={hotels}
                  rooms={rooms}
                  currentCustomer={currentCustomer}
                  bookings={bookings}
                  setBookings={setBookings}
                />
              } />
              <Route path="/my-bookings" element={
                <CustomerBookingsPage 
                  bookings={bookings.filter(b => b.customerId === currentCustomer.id)}
                  hotels={hotels}
                  rooms={rooms}
                  setBookings={setBookings}
                />
              } />
              <Route path="/customer/profile" element={
                <CustomerProfilePage 
                  customer={currentCustomer}
                  setCustomers={setCustomers}
                />
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
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
          )}
        </main>
      </div>
    </Router>
  )
}

export default App