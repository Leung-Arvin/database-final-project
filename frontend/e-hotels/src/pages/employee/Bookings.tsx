// src/pages/employee/Bookings.tsx
import { useEffect, useMemo, useState } from 'react'
import { bookingsApi } from '../../api/endpoints/bookings'
import type { ApiBooking } from '../../api/types/apiResponses'

type BookingUI = {
  id: number
  customerName: string
  hotelName: string
  roomNumber: string
  startDate: Date
  endDate: Date
  totalPrice: number
  status: string
}

export default function EmployeeBookings() {
  const [bookings, setBookings] = useState<BookingUI[]>([])
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedHotel, setSelectedHotel] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapBooking = (b: ApiBooking): BookingUI => ({
    id: b.booking_id,
    customerName: `Customer #${b.customer_id}`, // no snapshot → fallback
    hotelName: b.hotel_name_snapshot,
    roomNumber: b.room_number_snapshot,
    startDate: new Date(b.start_date),
    endDate: new Date(b.end_date),
    totalPrice: b.booking_price,
    status: b.status,
  })

  const loadBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await bookingsApi.getAll()
      setBookings(data.map(mapBooking))
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const statusMatch = selectedStatus === 'all' || booking.status === selectedStatus
      const hotelMatch =
        selectedHotel === 'all' || booking.hotelName === selectedHotel

      const searchMatch =
        searchTerm === '' ||
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toString().includes(searchTerm)

      return statusMatch && hotelMatch && searchMatch
    })
  }, [bookings, selectedStatus, selectedHotel, searchTerm])

  const uniqueHotels = [...new Set(bookings.map((b) => b.hotelName))]

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      checked_in: 'bg-blue-100 text-blue-800',
      checked_out: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const handleUpdateStatus = async (booking: BookingUI, newStatus: string) => {
    try {
      await bookingsApi.updateStatus(booking.id, newStatus)

      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: newStatus } : b
        )
      )

      alert(`Booking #${booking.id} updated to ${newStatus}`)
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to update status')
    }
  }

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    checkedIn: bookings.filter((b) => b.status === 'checked_in').length,
    checkedOut: bookings.filter((b) => b.status === 'checked_out').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
  }

  if (loading) return <div className="p-6">Loading bookings...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Bookings</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Stat label="Total" value={stats.total} color="blue" />
        <Stat label="Confirmed" value={stats.confirmed} color="green" />
        <Stat label="Pending" value={stats.pending} color="yellow" />
        <Stat label="Checked In" value={stats.checkedIn} color="blue" />
        <Stat label="Checked Out" value={stats.checkedOut} color="gray" />
        <Stat label="Cancelled" value={stats.cancelled} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={selectedHotel}
          onChange={(e) => setSelectedHotel(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Hotels</option>
          {uniqueHotels.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <Th>ID</Th>
              <Th>Customer</Th>
              <Th>Hotel</Th>
              <Th>Room</Th>
              <Th>Dates</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="border-t">
                <Td>#{booking.id}</Td>
                <Td>{booking.customerName}</Td>
                <Td>{booking.hotelName}</Td>
                <Td>{booking.roomNumber}</Td>
                <Td>
                  {booking.startDate.toLocaleDateString()} →{' '}
                  {booking.endDate.toLocaleDateString()}
                </Td>
                <Td>${booking.totalPrice}</Td>
                <Td>
                  <span className={`px-2 py-1 rounded ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </Td>
                <Td>
                  <select
                    value={booking.status}
                    onChange={(e) =>
                      handleUpdateStatus(booking, e.target.value)
                    }
                    className="border p-1 rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirm</option>
                    <option value="checked_in">Check In</option>
                    <option value="checked_out">Check Out</option>
                    <option value="cancelled">Cancel</option>
                  </select>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 text-center">
      <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  )
}

function Th({ children }: any) {
  return <th className="px-4 py-2 text-left text-xs text-gray-500">{children}</th>
}

function Td({ children }: any) {
  return <td className="px-4 py-2 text-sm text-gray-700">{children}</td>
}