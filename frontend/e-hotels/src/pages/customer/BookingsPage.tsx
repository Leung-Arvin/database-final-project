import { useEffect, useMemo, useState } from 'react'
import { bookingsApi } from '../../api/endpoints/bookings'
import { hotelsApi } from '../../api/endpoints/hotels'
import type { ApiBooking, ApiHotel } from '../../api/types/apiResponses'

function getHotelDisplayName(hotel: ApiHotel) {
  return `Hotel ${hotel.hotel_id} - ${hotel.area}`
}

function getStatusColor(status: ApiBooking['status']) {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100'
    case 'cancelled':
      return 'text-red-600 bg-red-100'
    case 'converted_to_renting':
      return 'text-blue-600 bg-blue-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

function getStatusIcon(status: ApiBooking['status']) {
  switch (status) {
    case 'active':
      return '✓'
    case 'cancelled':
      return '✗'
    case 'converted_to_renting':
      return '🏨'
    default:
      return '📋'
  }
}

export default function CustomerBookingsPage() {
  const [allBookings, setAllBookings] = useState<ApiBooking[]>([])
  const [hotels, setHotels] = useState<ApiHotel[]>([])
  const [customerIdInput, setCustomerIdInput] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [submittingBookingId, setSubmittingBookingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [bookingsData, hotelsData] = await Promise.all([
        bookingsApi.getAll(),
        hotelsApi.getAll(),
      ])

      setAllBookings(bookingsData)
      setHotels(hotelsData)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  const parsedCustomerId =
    customerIdInput.trim() === '' ? null : Number(customerIdInput)

  const customerBookings = useMemo(() => {
    if (!parsedCustomerId || Number.isNaN(parsedCustomerId)) return []

    return allBookings
      .filter((booking) => booking.customer_id === parsedCustomerId)
      .filter((booking) => {
        return selectedStatus === 'all' || booking.status === selectedStatus
      })
      .sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      )
  }, [allBookings, parsedCustomerId, selectedStatus])

  const upcomingBookings = customerBookings.filter(
    (b) => b.status === 'active' && new Date(b.start_date) > new Date()
  )

  const currentOrConvertedBookings = customerBookings.filter(
    (b) => b.status === 'converted_to_renting'
  )

  const cancelledBookings = customerBookings.filter(
    (b) => b.status === 'cancelled'
  )

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      setSubmittingBookingId(bookingId)
      setError(null)

      await bookingsApi.cancel(bookingId)

      setAllBookings((prev) =>
        prev.map((booking) =>
          booking.booking_id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      )

      alert('Booking cancelled successfully.')
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to cancel booking'
      setError(message)
      alert(message)
    } finally {
      setSubmittingBookingId(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-700">
          Loading bookings...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Find Your Bookings
        </h2>

        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer ID
          </label>
          <input
            type="number"
            value={customerIdInput}
            onChange={(e) => setCustomerIdInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter your customer ID"
          />
        </div>
      </div>

      {parsedCustomerId && !Number.isNaN(parsedCustomerId) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Upcoming Bookings</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {upcomingBookings.length}
                  </p>
                </div>
                <div className="text-3xl">📅</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Converted to Renting</p>
                  <p className="text-3xl font-bold text-green-600">
                    {currentOrConvertedBookings.length}
                  </p>
                </div>
                <div className="text-3xl">🏨</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cancelled</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {cancelledBookings.length}
                  </p>
                </div>
                <div className="text-3xl">📜</div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex gap-2 flex-wrap">
            {['all', 'active', 'converted_to_renting', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-md capitalize transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.replaceAll('_', ' ')}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="space-y-4">
        {parsedCustomerId && !Number.isNaN(parsedCustomerId) ? (
          customerBookings.map((booking) => {
            const hotel =
              booking.hotel_id != null
                ? hotels.find((h) => h.hotel_id === booking.hotel_id)
                : null

            const startDate = new Date(booking.start_date)
            const endDate = new Date(booking.end_date)
            const nights = Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            const canCancel = booking.status === 'active'

            return (
              <div
                key={booking.booking_id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-wrap justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.hotel_name_snapshot ||
                          (hotel ? getHotelDisplayName(hotel) : 'Unknown Hotel')}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        <span>{getStatusIcon(booking.status)}</span>
                        <span>{booking.status.replaceAll('_', ' ')}</span>
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      Room {booking.room_number_snapshot ?? booking.room_number ?? 'Unknown'}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>
                          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🌙</span>
                        <span>{nights} nights</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💰</span>
                        <span className="font-semibold text-gray-900">
                          ${booking.booking_price}
                        </span>
                      </div>
                    </div>

                    {booking.status === 'active' && (
                      <div className="bg-green-50 rounded-lg p-3 mt-2">
                        <p className="text-sm text-green-800">
                          ✓ Booking active. Please arrive on your selected dates.
                        </p>
                      </div>
                    )}

                    {booking.status === 'converted_to_renting' && (
                      <div className="bg-blue-50 rounded-lg p-3 mt-2">
                        <p className="text-sm text-blue-800">
                          🏨 This booking has been converted to a renting.
                        </p>
                      </div>
                    )}

                    {booking.status === 'cancelled' && (
                      <div className="bg-red-50 rounded-lg p-3 mt-2">
                        <p className="text-sm text-red-800">
                          ✗ This booking has been cancelled.
                        </p>
                      </div>
                    )}

                    {canCancel && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleCancelBooking(booking.booking_id)}
                          disabled={submittingBookingId === booking.booking_id}
                          className={`px-4 py-2 text-white rounded-md text-sm ${
                            submittingBookingId === booking.booking_id
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          {submittingBookingId === booking.booking_id
                            ? 'Cancelling...'
                            : 'Cancel Booking'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-right mt-4 md:mt-0">
                    <p className="text-sm text-gray-500">
                      Booking #{booking.booking_id}
                    </p>
                    <p className="text-xs text-gray-400">
                      Customer #{booking.customer_id}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">🪪</div>
            <p className="text-gray-500">Enter a customer ID to view your bookings</p>
          </div>
        )}

        {parsedCustomerId &&
          !Number.isNaN(parsedCustomerId) &&
          customerBookings.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500">No bookings found for this customer</p>
            </div>
          )}
      </div>
    </div>
  )
}