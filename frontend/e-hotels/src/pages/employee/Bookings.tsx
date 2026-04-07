import { useEffect, useMemo, useState } from 'react'
import { bookingsApi } from '../../api/endpoints/bookings'
import { customersApi } from '../../api/endpoints/customers'
import { hotelsApi } from '../../api/endpoints/hotels'
import type {
  ApiBooking,
  ApiCustomer,
  ApiHotel,
} from '../../api/types/apiResponses'

type BookingUI = {
  id: number
  customerId: number
  customerName: string
  hotelId: number | null
  hotelName: string
  roomNumber: string
  startDate: Date
  endDate: Date
  totalPrice: number
  status: ApiBooking['status']
  raw: ApiBooking
}

function getHotelDisplayName(hotel: ApiHotel) {
  return `Hotel ${hotel.hotel_id} - ${hotel.area}`
}

export default function EmployeeBookings() {
  const [bookings, setBookings] = useState<BookingUI[]>([])
  const [customers, setCustomers] = useState<ApiCustomer[]>([])
  const [hotels, setHotels] = useState<ApiHotel[]>([])
  const [selectedHotel, setSelectedHotel] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapBooking = (
    b: ApiBooking,
    customersData: ApiCustomer[],
    hotelsData: ApiHotel[]
  ): BookingUI => {
    const customer = customersData.find((c) => c.customer_id === b.customer_id)
    const hotel =
      b.hotel_id != null
        ? hotelsData.find((h) => h.hotel_id === b.hotel_id)
        : null

    return {
      id: b.booking_id,
      customerId: b.customer_id,
      customerName: customer?.full_name ?? `Customer #${b.customer_id}`,
      hotelId: b.hotel_id,
      hotelName:
        b.hotel_name_snapshot ||
        (hotel ? getHotelDisplayName(hotel) : 'Unknown hotel'),
      roomNumber:
        b.room_number_snapshot != null
          ? String(b.room_number_snapshot)
          : b.room_number != null
          ? String(b.room_number)
          : 'N/A',
      startDate: new Date(b.start_date),
      endDate: new Date(b.end_date),
      totalPrice: b.booking_price,
      status: b.status,
      raw: b,
    }
  }

  const loadBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      const [bookingsData, customersData, hotelsData] = await Promise.all([
        bookingsApi.getAll(),
        customersApi.getAll(),
        hotelsApi.getAll(),
      ])

      setCustomers(customersData)
      setHotels(hotelsData)
      setBookings(
        bookingsData.map((booking) =>
          mapBooking(booking, customersData, hotelsData)
        )
      )
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
    const query = searchTerm.trim().toLowerCase()

    return bookings.filter((booking) => {
      const activeMatch = booking.status === 'active'

      const hotelMatch =
        selectedHotel === 'all' || String(booking.hotelId) === selectedHotel

      const searchMatch =
        query === '' ||
        booking.customerName.toLowerCase().includes(query) ||
        booking.hotelName.toLowerCase().includes(query) ||
        booking.id.toString().includes(query) ||
        booking.roomNumber.toLowerCase().includes(query)

      return activeMatch && hotelMatch && searchMatch
    })
  }, [bookings, selectedHotel, searchTerm])

  const uniqueHotels = useMemo(() => {
    const seen = new Set<number>()
    return hotels.filter((hotel) => {
      if (seen.has(hotel.hotel_id)) return false
      seen.add(hotel.hotel_id)
      return true
    })
  }, [hotels])

  const getStatusColor = (status: ApiBooking['status']) => {
    const colors: Record<ApiBooking['status'], string> = {
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      converted_to_renting: 'bg-blue-100 text-blue-800',
    }

    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleCancelBooking = async (booking: BookingUI) => {
    if (
      !confirm(`Are you sure you want to cancel booking #${booking.id}?`)
    ) {
      return
    }

    try {
      await bookingsApi.cancel(booking.id)

      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: 'cancelled' } : b
        )
      )

      alert(`Booking #${booking.id} cancelled successfully`)
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to cancel booking')
    }
  }

  const stats = {
    total: bookings.filter((b) => b.status === 'active').length,
  }

  if (loading) {
    return <div className="p-6">Loading bookings...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Active Bookings</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
        <Stat label="Total Active Bookings" value={stats.total} valueClassName="text-blue-600" />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={selectedHotel}
          onChange={(e) => setSelectedHotel(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Hotels</option>
          {uniqueHotels.map((hotel) => (
            <option key={hotel.hotel_id} value={hotel.hotel_id}>
              {getHotelDisplayName(hotel)}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by booking ID, customer, hotel, or room..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

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
                  <span
                    className={`px-2 py-1 rounded ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancelBooking(booking)}
                      disabled={booking.status !== 'active'}
                      className={`px-3 py-1 rounded ${
                        booking.status !== 'active'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </Td>
              </tr>
            ))}

            {filteredBookings.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: number
  valueClassName: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 text-center">
      <p className={`text-2xl font-bold ${valueClassName}`}>{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2 text-left text-xs text-gray-500">{children}</th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-2 text-sm text-gray-700">{children}</td>
}