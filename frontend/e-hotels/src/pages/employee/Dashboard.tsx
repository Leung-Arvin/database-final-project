// src/pages/employee/Dashboard.tsx
import type { Hotel, Room, Booking, Employee } from '../../types'
import { Link } from 'react-router-dom'

interface EmployeeDashboardProps {
  hotels: Hotel[]
  rooms: Room[]
  bookings: Booking[]
  employees: Employee[]
}

export default function EmployeeDashboard({ hotels, rooms, bookings, employees }: EmployeeDashboardProps) {
  // Calculate metrics
  const totalRooms = rooms.length
  const availableRooms = rooms.filter(r => !r.hasDamage).length
  const damagedRooms = rooms.filter(r => r.hasDamage).length
  const occupancyRate = ((totalRooms - availableRooms) / totalRooms * 100).toFixed(1)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayCheckIns = bookings.filter(b => 
    b.status === 'confirmed' && 
    new Date(b.startDate).setHours(0,0,0,0) === today.getTime()
  ).length
  
  const todayCheckOuts = bookings.filter(b => 
    b.status === 'checked_in' && 
    new Date(b.endDate).setHours(0,0,0,0) === today.getTime()
  ).length
  
  const activeGuests = bookings.filter(b => b.status === 'checked_in').length
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0)
  const monthlyRevenue = bookings
    .filter(b => new Date(b.startDate).getMonth() === new Date().getMonth())
    .reduce((sum, b) => sum + b.totalPrice, 0)
  
  const stats = [
    { title: 'Total Hotels', value: hotels.length, icon: '🏨', color: 'bg-blue-500', change: '+0%' },
    { title: 'Total Rooms', value: totalRooms, icon: '🛏️', color: 'bg-green-500', change: '+5%' },
    { title: 'Available Rooms', value: availableRooms, icon: '✓', color: 'bg-teal-500', change: '-2%' },
    { title: 'Damaged Rooms', value: damagedRooms, icon: '⚠️', color: 'bg-red-500', change: '+0%' },
    { title: 'Occupancy Rate', value: `${occupancyRate}%`, icon: '📊', color: 'bg-purple-500', change: '+3%' },
    { title: 'Active Guests', value: activeGuests, icon: '👥', color: 'bg-indigo-500', change: '+8%' },
    { title: "Today's Check-ins", value: todayCheckIns, icon: '📥', color: 'bg-orange-500', change: '+2' },
    { title: "Today's Check-outs", value: todayCheckOuts, icon: '📤', color: 'bg-yellow-500', change: '+1' },
    { title: 'Total Employees', value: employees.length, icon: '👔', color: 'bg-pink-500', change: '+0%' },
    { title: 'Monthly Revenue', value: `$${monthlyRevenue.toLocaleString()}`, icon: '💰', color: 'bg-emerald-500', change: '+12%' },
    { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: '💵', color: 'bg-cyan-500', change: '+25%' },
    { title: 'Pending Bookings', value: bookings.filter(b => b.status === 'pending').length, icon: '⏳', color: 'bg-amber-500', change: '+3' },
  ]
  
  const recentBookings = [...bookings]
    .sort((a, b) => b.bookingDate.getTime() - a.bookingDate.getTime())
    .slice(0, 5)
  
  const topHotels = hotels
    .map(hotel => ({
      ...hotel,
      revenue: bookings
        .filter(b => b.hotelId === hotel.id)
        .reduce((sum, b) => sum + b.totalPrice, 0),
      bookingsCount: bookings.filter(b => b.hotelId === hotel.id).length
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3)
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md p-6 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Employee Dashboard</h1>
        <p className="text-blue-100">Welcome back! Here's what's happening with your hotels today.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-lg shadow-md p-6 text-white transform hover:scale-105 transition-transform`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">{stat.icon}</div>
              <div className={`text-xs bg-white bg-opacity-30 rounded-full px-2 py-1 ${parseFloat(stat.change) > 0 ? 'text-green-200' : 'text-red-200'}`}>
                {stat.change}
              </div>
            </div>
            <p className="text-sm opacity-90 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/employee/bookings" className="text-sm text-blue-600 hover:text-blue-800">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">Booking #{booking.id}</p>
                  <p className="text-sm text-gray-600">${booking.totalPrice} - {booking.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{booking.startDate.toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">to {booking.endDate.toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Top Performing Hotels */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Hotels</h2>
          <div className="space-y-4">
            {topHotels.map((hotel, index) => (
              <div key={hotel.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{hotel.name}</p>
                    <p className="text-sm text-gray-600">{hotel.city}, {hotel.state}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${hotel.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{hotel.bookingsCount} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/employee/bookings" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm font-medium text-gray-900">All Bookings</p>
            </Link>
            <Link to="/employee/check-in" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-medium text-gray-900">Check In</p>
            </Link>
            <Link to="/employee/check-in" className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors">
              <div className="text-3xl mb-2">🚪</div>
              <p className="text-sm font-medium text-gray-900">Check Out</p>
            </Link>
            <Link to="/employee/rooms" className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
              <div className="text-3xl mb-2">🛏️</div>
              <p className="text-sm font-medium text-gray-900">Manage Rooms</p>
            </Link>
          </div>
        </div>
        
        {/* Alerts & Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
          <div className="space-y-3">
            {damagedRooms > 0 && (
              <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <p className="text-sm font-medium text-red-800">⚠️ {damagedRooms} rooms require maintenance</p>
              </div>
            )}
            {todayCheckIns > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="text-sm font-medium text-green-800">📥 {todayCheckIns} guests checking in today</p>
              </div>
            )}
            {todayCheckOuts > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm font-medium text-yellow-800">📤 {todayCheckOuts} guests checking out today</p>
              </div>
            )}
            {bookings.filter(b => b.status === 'pending').length > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <p className="text-sm font-medium text-orange-800">⏳ {bookings.filter(b => b.status === 'pending').length} pending bookings need confirmation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}