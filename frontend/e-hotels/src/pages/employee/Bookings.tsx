// src/pages/employee/Bookings.tsx
import { useState } from 'react'
import type { Booking, Customer, Hotel, Room } from '../../types'

interface EmployeeBookingsProps {
  bookings: Booking[]
  customers: Customer[]
  hotels: Hotel[]
  rooms: Room[]
}

export default function EmployeeBookings({ bookings, customers, hotels, rooms }: EmployeeBookingsProps) {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedHotel, setSelectedHotel] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  
  const filteredBookings = bookings.filter(booking => {
    const statusMatch = selectedStatus === 'all' || booking.status === selectedStatus
    const hotelMatch = selectedHotel === 'all' || booking.hotelId === parseInt(selectedHotel)
    const customer = customers.find(c => c.id === booking.customerId)
    const searchMatch = searchTerm === '' || 
      customer?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toString().includes(searchTerm)
    return statusMatch && hotelMatch && searchMatch
  })
  
  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'
  }
  
  const getHotelName = (hotelId: number) => {
    const hotel = hotels.find(h => h.id === hotelId)
    return hotel ? hotel.name : 'Unknown'
  }
  
  const getRoomNumber = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId)
    return room ? room.roomNumber : 'Unknown'
  }
  
  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      checked_in: 'bg-blue-100 text-blue-800',
      checked_out: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }
  
  const handleUpdateStatus = (booking: Booking, newStatus: Booking['status']) => {
    console.log(`Updating booking ${booking.id} status to ${newStatus}`)
    alert(`Booking #${booking.id} status updated to ${newStatus}`)
  }
  
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    checkedIn: bookings.filter(b => b.status === 'checked_in').length,
    checkedOut: bookings.filter(b => b.status === 'checked_out').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0)
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Bookings</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          <p className="text-xs text-gray-600">Confirmed</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-600">Pending</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.checkedIn}</p>
          <p className="text-xs text-gray-600">Checked In</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.checkedOut}</p>
          <p className="text-xs text-gray-600">Checked Out</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-xs text-gray-600">Cancelled</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
            <select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Hotels</option>
              {hotels.map(hotel => (
                <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Booking ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{booking.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getCustomerName(booking.customerId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getHotelName(booking.hotelId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getRoomNumber(booking.roomId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {booking.startDate.toLocaleDateString()}<br/>
                  <span className="text-xs">to</span><br/>
                  {booking.endDate.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.totalPrice}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    onChange={(e) => handleUpdateStatus(booking, e.target.value as Booking['status'])}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    value={booking.status}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirm</option>
                    <option value="checked_in">Check In</option>
                    <option value="checked_out">Check Out</option>
                    <option value="cancelled">Cancel</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}