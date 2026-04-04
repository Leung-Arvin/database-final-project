// src/components/CustomerPages.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import CustomerHomePage from '../pages/customer/HomePage'
import CustomerBookingsPage from '../pages/customer/BookingsPage'
import CustomerProfilePage from '../pages/customer/ProfilePage'
import type { HotelChain, Hotel, Room, Customer, Booking } from '../types'

interface CustomerPagesProps {
  hotelChains: HotelChain[]
  hotels: Hotel[]
  rooms: Room[]
  customers: Customer[]
  bookings: Booking[]
}

export default function CustomerPages({ 
  hotelChains, 
  hotels, 
  rooms, 
  customers, 
  bookings 
}: CustomerPagesProps) {
  // For demo, using first customer. In real app, would use logged-in customer
  const currentCustomer = customers[0]
  
  // Filter bookings for the current customer
  const customerBookings = bookings.filter(b => b.customerId === currentCustomer.id)
  
  return (
    <Routes>
      <Route path="/" element={
        <CustomerHomePage 
          hotelChains={hotelChains}
          hotels={hotels}
          rooms={rooms}
          currentCustomer={currentCustomer}
        />
      } />
      <Route path="/my-bookings" element={
        <CustomerBookingsPage 
          bookings={customerBookings}
          hotels={hotels}
          rooms={rooms}
        />
      } />
      <Route path="/customer/profile" element={
        <CustomerProfilePage customer={currentCustomer} />
      } />
      {/* Redirect any unknown customer routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}