import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi, type DashboardData } from '../../api/endpoints/dashboard'
import type {
  ApiBooking,
  ApiHotel,
  ApiRenting,
  ApiRoom,
} from '../../api/types/apiResponses'

function getHotelDisplayName(hotel: ApiHotel) {
  return `Hotel ${hotel.hotel_id} - ${hotel.area}`
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const dashboardData = await dashboardApi.getAllData()
      setData(dashboardData)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const hotels = data?.hotels ?? []
  const rooms = data?.rooms ?? []
  const bookings = data?.bookings ?? []
  const employees = data?.employees ?? []
  const rentings = data?.rentings ?? []

  const today = useMemo(() => {
    const value = new Date()
    value.setHours(0, 0, 0, 0)
    return value.getTime()
  }, [])

  const totalRooms = rooms.length
  const availableRooms = rooms.filter((r) => !r.hasDamage).length
  const damagedRooms = rooms.filter((r) => r.hasDamage).length
  const occupancyRate =
    totalRooms > 0
      ? (((totalRooms - availableRooms) / totalRooms) * 100).toFixed(1)
      : '0.0'

  const todayCheckIns = bookings.filter((b) => {
    const bookingDate = new Date(b.start_date)
    bookingDate.setHours(0, 0, 0, 0)
    return (
      b.status === 'active' &&
      b.isDeleted === 0 &&
      bookingDate.getTime() === today
    )
  }).length

  const todayCheckOuts = rentings.filter((r) => {
    const checkoutDate = new Date(r.check_out_date)
    checkoutDate.setHours(0, 0, 0, 0)
    return !r.actual_check_out && checkoutDate.getTime() === today
  }).length

  const activeGuests = rentings.filter((r) => !r.actual_check_out).length

  const totalRevenue = bookings.reduce((sum, b) => sum + b.booking_price, 0)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyRevenue = bookings
    .filter((b) => {
      const startDate = new Date(b.start_date)
      return (
        startDate.getMonth() === currentMonth &&
        startDate.getFullYear() === currentYear
      )
    })
    .reduce((sum, b) => sum + b.booking_price, 0)

  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'active' && b.isDeleted === 0
  ).length

  const cancelledBookingsCount = bookings.filter(
    (b) => b.status === 'cancelled'
  ).length

  const convertedBookingsCount = bookings.filter(
    (b) => b.status === 'converted_to_renting'
  ).length

  const stats = [
    { title: 'Total Hotels', value: hotels.length, icon: '🏨', color: 'bg-blue-500' },
    { title: 'Total Rooms', value: totalRooms, icon: '🛏️', color: 'bg-green-500' },
    { title: 'Available Rooms', value: availableRooms, icon: '✓', color: 'bg-teal-500' },
    { title: 'Damaged Rooms', value: damagedRooms, icon: '⚠️', color: 'bg-red-500' },
    { title: 'Occupancy Rate', value: `${occupancyRate}%`, icon: '📊', color: 'bg-purple-500' },
    { title: 'Active Guests', value: activeGuests, icon: '👥', color: 'bg-indigo-500' },
    { title: "Today's Check-ins", value: todayCheckIns, icon: '📥', color: 'bg-orange-500' },
    { title: "Today's Check-outs", value: todayCheckOuts, icon: '📤', color: 'bg-yellow-500' },
    { title: 'Total Employees', value: employees.length, icon: '👔', color: 'bg-pink-500' },
    { title: 'Monthly Revenue', value: `$${monthlyRevenue.toLocaleString()}`, icon: '💰', color: 'bg-emerald-500' },
    { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: '💵', color: 'bg-cyan-500' },
    { title: 'Active Bookings', value: activeBookingsCount, icon: '📋', color: 'bg-amber-500' },
  ]

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    )
    .slice(0, 5)

  const topHotels = hotels
    .map((hotel) => {
      const hotelBookings = bookings.filter((b) => b.hotel_id === hotel.hotel_id)
      const revenue = hotelBookings.reduce((sum, b) => sum + b.booking_price, 0)

      return {
        ...hotel,
        revenue,
        bookingsCount: hotelBookings.length,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-700">
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md p-6 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Employee Dashboard</h1>
        <p className="text-blue-100">
          Welcome back! Here&apos;s what&apos;s happening with your hotels today.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} rounded-lg shadow-md p-6 text-white transform hover:scale-105 transition-transform`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">{stat.icon}</div>
            </div>
            <p className="text-sm opacity-90 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/employee/bookings" className="text-sm text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map((booking: ApiBooking) => (
              <div
                key={booking.booking_id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Booking #{booking.booking_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${booking.booking_price} - {booking.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(booking.start_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    to {new Date(booking.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentBookings.length === 0 && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
                No bookings found.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Top Performing Hotels
          </h2>
          <div className="space-y-4">
            {topHotels.map((hotel, index) => (
              <div key={hotel.hotel_id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {getHotelDisplayName(hotel)}
                    </p>
                    <p className="text-sm text-gray-600">{hotel.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ${hotel.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {hotel.bookingsCount} bookings
                  </p>
                </div>
              </div>
            ))}
            {topHotels.length === 0 && (
              <div className="text-sm text-gray-500">No hotel performance data found.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/employee/bookings"
              className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
            >
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm font-medium text-gray-900">All Bookings</p>
            </Link>
            <Link
              to="/employee/check-in"
              className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
            >
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-medium text-gray-900">Check In</p>
            </Link>
            <Link
              to="/employee/check-in"
              className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors"
            >
              <div className="text-3xl mb-2">🚪</div>
              <p className="text-sm font-medium text-gray-900">Check Out</p>
            </Link>
            <Link
              to="/employee/rooms"
              className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
            >
              <div className="text-3xl mb-2">🛏️</div>
              <p className="text-sm font-medium text-gray-900">Manage Rooms</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Alerts & Notifications
          </h2>
          <div className="space-y-3">
            {damagedRooms > 0 && (
              <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <p className="text-sm font-medium text-red-800">
                  ⚠️ {damagedRooms} rooms require maintenance
                </p>
              </div>
            )}
            {todayCheckIns > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="text-sm font-medium text-green-800">
                  📥 {todayCheckIns} guests checking in today
                </p>
              </div>
            )}
            {todayCheckOuts > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm font-medium text-yellow-800">
                  📤 {todayCheckOuts} guests checking out today
                </p>
              </div>
            )}
            {activeBookingsCount > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <p className="text-sm font-medium text-orange-800">
                  📋 {activeBookingsCount} active bookings in the system
                </p>
              </div>
            )}
            {cancelledBookingsCount > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-500">
                <p className="text-sm font-medium text-gray-800">
                  ❌ {cancelledBookingsCount} cancelled bookings recorded
                </p>
              </div>
            )}
            {convertedBookingsCount > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm font-medium text-blue-800">
                  🔄 {convertedBookingsCount} bookings converted to rentings
                </p>
              </div>
            )}
            {damagedRooms === 0 &&
              todayCheckIns === 0 &&
              todayCheckOuts === 0 &&
              activeBookingsCount === 0 &&
              cancelledBookingsCount === 0 &&
              convertedBookingsCount === 0 && (
                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                  <p className="text-sm font-medium text-gray-700">
                    No alerts right now.
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}