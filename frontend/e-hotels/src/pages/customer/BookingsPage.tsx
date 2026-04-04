// src/pages/customer/BookingsPage.tsx
import { useState } from 'react'
import type { Booking, Hotel, Room } from '../../types'
import { Link } from 'react-router-dom'


interface CustomerBookingsPageProps {
  bookings: Booking[]
  hotels: Hotel[]
  rooms: Room[]
}

export default function CustomerBookingsPage({ bookings, hotels, rooms }: CustomerBookingsPageProps) {
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  const filteredBookings = bookings.filter(booking => 
    selectedStatus === 'all' || booking.status === selectedStatus
  )
  
  const getHotelName = (hotelId: number) => {
    const hotel = hotels.find(h => h.id === hotelId)
    return hotel ? hotel.name : 'Unknown'
  }
  
  const getRoomNumber = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId)
    return room ? room.roomNumber : 'Unknown'
  }
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'checked_in': return 'text-blue-600 bg-blue-100'
      case 'checked_out': return 'text-gray-600 bg-gray-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'confirmed': return '✓'
      case 'pending': return '⏳'
      case 'checked_in': return '🏨'
      case 'checked_out': return '🚪'
      case 'cancelled': return '✗'
      default: return '📋'
    }
  }
  
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' && new Date(b.startDate) > new Date())
  const activeBookings = bookings.filter(b => b.status === 'checked_in')
  const pastBookings = bookings.filter(b => b.status === 'checked_out')
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
      
      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming Stays</p>
              <p className="text-3xl font-bold text-blue-600">{upcomingBookings.length}</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Stay</p>
              <p className="text-3xl font-bold text-green-600">{activeBookings.length}</p>
            </div>
            <div className="text-3xl">🏨</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Past Stays</p>
              <p className="text-3xl font-bold text-gray-600">{pastBookings.length}</p>
            </div>
            <div className="text-3xl">📜</div>
          </div>
        </div>
      </div>
      
      {/* Status Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['all', 'confirmed', 'pending', 'checked_in', 'checked_out', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-md capitalize transition-colors ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>
      
      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => {
          const nights = Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24))
          return (
            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-wrap justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{getHotelName(booking.hotelId)}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      <span>{getStatusIcon(booking.status)}</span>
                      <span>{booking.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">Room {getRoomNumber(booking.roomId)}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>{booking.startDate.toLocaleDateString()} - {booking.endDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🌙</span>
                      <span>{nights} nights</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💰</span>
                      <span className="font-semibold text-gray-900">${booking.totalPrice}</span>
                    </div>
                  </div>
                  
                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                        Confirm Payment
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">
                        Cancel Booking
                      </button>
                    </div>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <div className="bg-blue-50 rounded-lg p-3 mt-2">
                      <p className="text-sm text-blue-800">
                        ✓ Booking confirmed! Check-in available from {booking.startDate.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Booking #{booking.id}</p>
                  <p className="text-xs text-gray-400">Booked on {booking.bookingDate.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )
        })}
        
        {filteredBookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500">No bookings found</p>
            <Link to="/" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Browse Hotels
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}