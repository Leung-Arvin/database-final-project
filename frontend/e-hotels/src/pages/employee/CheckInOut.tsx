import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { bookingsApi } from '../../api/endpoints/bookings'
import { customersApi } from '../../api/endpoints/customers'
import { employeesApi } from '../../api/endpoints/employees'
import { hotelsApi } from '../../api/endpoints/hotels'
import { rentingsApi } from '../../api/endpoints/rentings'
import { roomsApi } from '../../api/endpoints/rooms'
import type {
  ApiBooking,
  ApiCustomer,
  ApiEmployee,
  ApiHotel,
  ApiRenting,
  ApiRoom,
} from '../../api/types/apiResponses'

export default function EmployeeCheckInOut() {
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [rentings, setRentings] = useState<ApiRenting[]>([])
  const [customers, setCustomers] = useState<ApiCustomer[]>([])
  const [hotels, setHotels] = useState<ApiHotel[]>([])
  const [rooms, setRooms] = useState<ApiRoom[]>([])
  const [employees, setEmployees] = useState<ApiEmployee[]>([])
  const [availableDirectRentRooms, setAvailableDirectRentRooms] = useState<ApiRoom[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchType, setSearchType] = useState<'bookingId' | 'customerName'>('bookingId')
  const [searchValue, setSearchValue] = useState('')
  const [foundBooking, setFoundBooking] = useState<ApiBooking | null>(null)
  const [foundRenting, setFoundRenting] = useState<ApiRenting | null>(null)
  const [actionType, setActionType] = useState<'checkin' | 'checkout' | 'directRent'>('checkin')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')

  const [bookingSearchResults, setBookingSearchResults] = useState<ApiBooking[]>([])
  const [rentingSearchResults, setRentingSearchResults] = useState<ApiRenting[]>([])

  const [checkinPayment, setCheckinPayment] = useState({
    amount: '',
    method: 'credit_card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardholderName: '',
  })

  const [directRentForm, setDirectRentForm] = useState({
    customerId: '',
    roomKey: '',
    startDate: '',
    endDate: '',
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardholderName: '',
  })

  const currentEmployee = employees[0] || null

  const loadPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        bookingsData,
        rentingsData,
        customersData,
        hotelsData,
        roomsData,
        employeesData,
      ] = await Promise.all([
        bookingsApi.getAll(),
        rentingsApi.getAll(),
        customersApi.getAll(),
        hotelsApi.getAll(),
        roomsApi.search({}),
        employeesApi.getAll(),
      ])

      setBookings(bookingsData)
      setRentings(rentingsData)
      setCustomers(customersData)
      setHotels(hotelsData)
      setRooms(roomsData)
      setEmployees(employeesData)
      setAvailableDirectRentRooms(roomsData.filter((room) => !room.hasDamage))
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load check-in/check-out data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  useEffect(() => {
    const loadAvailableRooms = async () => {
      try {
        if (
          actionType === 'directRent' &&
          directRentForm.startDate &&
          directRentForm.endDate
        ) {
          const searchedRooms = await roomsApi.search({
            start_date: directRentForm.startDate,
            end_date: directRentForm.endDate,
          })

          setAvailableDirectRentRooms(
            searchedRooms.filter((room) => !room.hasDamage)
          )
          return
        }

        setAvailableDirectRentRooms(rooms.filter((room) => !room.hasDamage))
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load available rooms')
        setAvailableDirectRentRooms(rooms.filter((room) => !room.hasDamage))
      }
    }

    loadAvailableRooms()
  }, [actionType, directRentForm.startDate, directRentForm.endDate, rooms])

  const getCustomerDetails = (customerId: number) => {
    return customers.find((c) => c.customer_id === customerId) || null
  }

  const getHotelDetails = (hotelId: number | null) => {
    if (hotelId == null) return null
    return hotels.find((h) => h.hotel_id === hotelId) || null
  }

  const getRoomDetails = (hotelId: number | null, roomNumber: number | null) => {
    if (hotelId == null || roomNumber == null) return null
    return (
      rooms.find(
        (r) => r.hotel_id === hotelId && r.room_number === roomNumber
      ) || null
    )
  }

  const handleSearch = () => {
    setFoundBooking(null)
    setFoundRenting(null)
    setBookingSearchResults([])
    setRentingSearchResults([])

    const trimmed = searchValue.trim().toLowerCase()

    if (actionType === 'checkin') {
      let results: ApiBooking[] = []

      if (!trimmed) {
        results = bookings.filter(
          (b) => b.status === 'active' && b.isDeleted === 0
        )
      } else if (searchType === 'bookingId') {
        const bookingId = Number(trimmed)
        results = bookings.filter(
          (b) =>
            b.booking_id === bookingId &&
            b.status === 'active' &&
            b.isDeleted === 0
        )
      } else {
        const matchedCustomerIds = customers
          .filter((c) => c.full_name.toLowerCase().includes(trimmed))
          .map((c) => c.customer_id)

        results = bookings.filter(
          (b) =>
            matchedCustomerIds.includes(b.customer_id) &&
            b.status === 'active' &&
            b.isDeleted === 0
        )
      }

      if (results.length === 1) {
        setFoundBooking(results[0])
      } else {
        setBookingSearchResults(results)
      }

      if (results.length === 0) {
        alert('No active bookings found')
      }

      return
    }

    if (actionType === 'checkout') {
      let results: ApiRenting[] = []

      if (!trimmed) {
        results = rentings.filter((r) => !r.actual_check_out)
      } else if (searchType === 'bookingId') {
        const bookingId = Number(trimmed)
        results = rentings.filter(
          (r) => r.booking_id === bookingId && !r.actual_check_out
        )
      } else {
        const matchedCustomerIds = customers
          .filter((c) => c.full_name.toLowerCase().includes(trimmed))
          .map((c) => c.customer_id)

        results = rentings.filter(
          (r) =>
            matchedCustomerIds.includes(r.customer_id) &&
            !r.actual_check_out
        )
      }

      if (results.length === 1) {
        setFoundRenting(results[0])
        setPaymentAmount(String(results[0].total_amount ?? ''))
      } else {
        setRentingSearchResults(results)
      }

      if (results.length === 0) {
        alert('No active rentings found')
      }
    }
  }

  const handleSelectBooking = (booking: ApiBooking) => {
    setFoundBooking(booking)
    setFoundRenting(null)
    setBookingSearchResults([])
    setRentingSearchResults([])
    setSearchValue(String(booking.booking_id))
  }

  const handleSelectRenting = (renting: ApiRenting) => {
    setFoundRenting(renting)
    setFoundBooking(null)
    setBookingSearchResults([])
    setRentingSearchResults([])
    setSearchValue(renting.booking_id ? String(renting.booking_id) : '')
    setPaymentAmount(String(renting.total_amount ?? ''))
  }

  const handleCheckInWithPayment = async () => {
    if (!foundBooking) {
      alert('No booking selected')
      return
    }

    if (!currentEmployee) {
      alert('No employee available for check-in')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await rentingsApi.checkIn({
        booking_id: foundBooking.booking_id,
        employee_id: currentEmployee.employee_id,
        payment_amount: checkinPayment.amount ? Number(checkinPayment.amount) : undefined,
        payment_method: checkinPayment.method || undefined,
      })

      alert('Check-in completed successfully!')

      setFoundBooking(null)
      setSearchValue('')
      setCheckinPayment({
        amount: '',
        method: 'credit_card',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cardholderName: '',
      })

      await loadPageData()
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to check in booking'
      setError(message)
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCheckOut = async () => {
    if (!foundRenting || !paymentAmount) {
      alert('Please enter payment amount')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await rentingsApi.checkOut(
        foundRenting.renting_id,
        Number(paymentAmount),
        paymentMethod
      )

      alert(`Checkout completed! Final payment of $${paymentAmount} received via ${paymentMethod}.`)

      setFoundRenting(null)
      setSearchValue('')
      setPaymentAmount('')

      await loadPageData()
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to check out renting'
      setError(message)
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDirectRent = async (e: FormEvent) => {
    e.preventDefault()

    if (!currentEmployee) {
      alert('No employee available for direct rental')
      return
    }

    const [hotelIdRaw, roomNumberRaw] = directRentForm.roomKey.split('::')
    const hotelId = Number(hotelIdRaw)
    const roomNumber = Number(roomNumberRaw)

    const room = availableDirectRentRooms.find(
      (r) => r.hotel_id === hotelId && r.room_number === roomNumber
    )

    if (!room) {
      alert('Selected room was not found')
      return
    }

    const nights = Math.ceil(
      (new Date(directRentForm.endDate).getTime() -
        new Date(directRentForm.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (nights <= 0) {
      alert('Invalid date range')
      return
    }

    const totalPrice = Number(room.base_price) * nights

    try {
      setSubmitting(true)
      setError(null)

      await rentingsApi.directRent({
        customer_id: Number(directRentForm.customerId),
        hotel_id: hotelId,
        room_number: roomNumber,
        employee_id: currentEmployee.employee_id,
        start_date: directRentForm.startDate,
        end_date: directRentForm.endDate,
        payment_amount: totalPrice,
        payment_method: directRentForm.paymentMethod,
      })

      alert(`Direct rental created! Full payment of $${totalPrice} processed.`)

      setDirectRentForm({
        customerId: '',
        roomKey: '',
        startDate: '',
        endDate: '',
        paymentMethod: 'credit_card',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cardholderName: '',
      })
      setActionType('checkin')

      await loadPageData()
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to create direct rental'
      setError(message)
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  const todayBookings = useMemo(() => {
    const today = new Date().toDateString()

    return bookings.filter(
      (b) =>
        b.status === 'active' &&
        b.isDeleted === 0 &&
        new Date(b.start_date).toDateString() === today
    )
  }, [bookings])

  const todayCheckouts = useMemo(() => {
    const today = new Date().toDateString()

    return rentings.filter(
      (r) =>
        !r.actual_check_out &&
        new Date(r.check_out_date).toDateString() === today
    )
  }, [rentings])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-700">
          Loading check-in / check-out data...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Check-In / Check-Out / Direct Rental</h1>
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => {
                  setActionType('checkin')
                  setFoundRenting(null)
                }}
                className={`flex-1 py-2 rounded-md font-semibold transition-colors ${
                  actionType === 'checkin'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Check In (Booking)
              </button>
              <button
              onClick={() => {
                setActionType('checkout')
                setFoundBooking(null)
                setBookingSearchResults([])
                setRentingSearchResults([])
              }}
                className={`flex-1 py-2 rounded-md font-semibold transition-colors ${
                  actionType === 'checkout'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Check Out
              </button>
              <button
                onClick={() => {
                  setActionType('directRent')
                  setFoundBooking(null)
                  setFoundRenting(null)
                  setBookingSearchResults([])
                  setRentingSearchResults([])
                }}
                className={`flex-1 py-2 rounded-md font-semibold transition-colors ${
                  actionType === 'directRent'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Direct Rental
              </button>
            </div>
            {(actionType === 'checkin' || actionType === 'checkout') && (
              <>
                <div className="mb-6">
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setSearchType('bookingId')}
                      className={`px-4 py-2 rounded-md text-sm ${
                        searchType === 'bookingId'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Search by Booking ID
                    </button>
                    <button
                      onClick={() => setSearchType('customerName')}
                      className={`px-4 py-2 rounded-md text-sm ${
                        searchType === 'customerName'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Search by Customer Name
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type={searchType === 'bookingId' ? 'number' : 'text'}
                      placeholder={searchType === 'bookingId' ? 'Enter Booking ID' : 'Enter Customer Name'}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Search
                    </button>
                  </div>
                  {actionType === 'checkin' && bookingSearchResults.length > 0 && (
  <div className="mt-4 space-y-2">
    <p className="text-sm font-medium text-gray-700">
      Select a booking:
    </p>
    {bookingSearchResults.map((booking) => {
      const customer = getCustomerDetails(booking.customer_id)
      const hotel = getHotelDetails(booking.hotel_id)

      return (
        <button
          key={booking.booking_id}
          type="button"
          onClick={() => handleSelectBooking(booking)}
          className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50"
        >
          <p className="font-medium text-gray-900">
            Booking #{booking.booking_id} — {customer?.full_name ?? 'Unknown customer'}
          </p>
          <p className="text-sm text-gray-600">
            {hotel ? `Hotel ${hotel.hotel_id} - ${hotel.area}` : booking.hotel_name_snapshot}
            {' '}• Room {booking.room_number_snapshot ?? booking.room_number}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
          </p>
        </button>
      )
    })}
  </div>
)}

{actionType === 'checkout' && rentingSearchResults.length > 0 && (
  <div className="mt-4 space-y-2">
    <p className="text-sm font-medium text-gray-700">
      Select a renting:
    </p>
    {rentingSearchResults.map((renting) => {
      const customer = getCustomerDetails(renting.customer_id)
      const hotel = getHotelDetails(renting.hotel_id)

      return (
        <button
          key={renting.renting_id}
          type="button"
          onClick={() => handleSelectRenting(renting)}
          className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50"
        >
          <p className="font-medium text-gray-900">
            Renting #{renting.renting_id} — {customer?.full_name ?? 'Unknown customer'}
          </p>
          <p className="text-sm text-gray-600">
            {hotel ? `Hotel ${hotel.hotel_id} - ${hotel.area}` : renting.hotel_name_snapshot}
            {' '}• Room {renting.room_number_snapshot ?? renting.room_number}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(renting.check_in_date).toLocaleDateString()} - {new Date(renting.check_out_date).toLocaleDateString()}
          </p>
        </button>
      )
    })}
  </div>
)}
                </div>

                {actionType === 'checkin' && foundBooking && (
                  <div className="border-t pt-6">
                    {(() => {
                      const customer = getCustomerDetails(foundBooking.customer_id)
                      const hotel = getHotelDetails(foundBooking.hotel_id)
                      const room = getRoomDetails(
                        foundBooking.hotel_id,
                        foundBooking.room_number
                      )

                      return (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Customer</p>
                              <p className="font-medium">{customer?.full_name ?? 'Unknown customer'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Booking ID</p>
                              <p className="font-medium">#{foundBooking.booking_id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Hotel</p>
                              <p className="font-medium">
                                {hotel ? `Hotel ${hotel.hotel_id} - ${hotel.area}` : foundBooking.hotel_name_snapshot}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Room</p>
                              <p className="font-medium">{room?.room_number ?? foundBooking.room_number_snapshot}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Dates</p>
                              <p className="font-medium">
                                {new Date(foundBooking.start_date).toLocaleDateString()} -{' '}
                                {new Date(foundBooking.end_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Amount</p>
                              <p className="font-bold text-green-600">${foundBooking.booking_price}</p>
                            </div>
                          </div>

                          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">Payment Collection (Check-in)</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                                <input
                                  type="number"
                                  value={checkinPayment.amount}
                                  onChange={(e) =>
                                    setCheckinPayment({ ...checkinPayment, amount: e.target.value })
                                  }
                                  placeholder="Optional amount"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                  value={checkinPayment.method}
                                  onChange={(e) =>
                                    setCheckinPayment({ ...checkinPayment, method: e.target.value })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                  <option value="credit_card">Credit Card</option>
                                  <option value="debit_card">Debit Card</option>
                                  <option value="cash">Cash</option>
                                  <option value="gift_card">Gift Card</option>
                                </select>
                              </div>

                              {(checkinPayment.method === 'credit_card' ||
                                checkinPayment.method === 'debit_card') && (
                                <div className="space-y-3 border-t pt-3 mt-2">
                                  <h5 className="text-sm font-medium text-gray-700">Card Details</h5>
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Card Number</label>
                                    <input
                                      type="text"
                                      value={checkinPayment.cardNumber}
                                      onChange={(e) =>
                                        setCheckinPayment({
                                          ...checkinPayment,
                                          cardNumber: e.target.value,
                                        })
                                      }
                                      placeholder="1234 5678 9012 3456"
                                      maxLength={19}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Expiry Date</label>
                                      <input
                                        type="text"
                                        value={checkinPayment.cardExpiry}
                                        onChange={(e) =>
                                          setCheckinPayment({
                                            ...checkinPayment,
                                            cardExpiry: e.target.value,
                                          })
                                        }
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">CVV</label>
                                      <input
                                        type="text"
                                        value={checkinPayment.cardCvv}
                                        onChange={(e) =>
                                          setCheckinPayment({
                                            ...checkinPayment,
                                            cardCvv: e.target.value,
                                          })
                                        }
                                        placeholder="123"
                                        maxLength={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Cardholder Name</label>
                                    <input
                                      type="text"
                                      value={checkinPayment.cardholderName}
                                      onChange={(e) =>
                                        setCheckinPayment({
                                          ...checkinPayment,
                                          cardholderName: e.target.value,
                                        })
                                      }
                                      placeholder="Name on card"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                  </div>
                                </div>
                              )}

                              <button
                                onClick={handleCheckInWithPayment}
                                disabled={submitting}
                                className={`w-full mt-4 py-3 rounded-md font-semibold ${
                                  submitting
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                {submitting ? 'Processing...' : 'Process Check-In & Payment'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {actionType === 'checkout' && foundRenting && (
                  <div className="border-t pt-6">
                    {(() => {
                      const customer = getCustomerDetails(foundRenting.customer_id)
                      const hotel = getHotelDetails(foundRenting.hotel_id)
                      const room = getRoomDetails(
                        foundRenting.hotel_id,
                        foundRenting.room_number
                      )

                      return (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">Renting Details</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Customer</p>
                              <p className="font-medium">{customer?.full_name ?? 'Unknown customer'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Renting ID</p>
                              <p className="font-medium">#{foundRenting.renting_id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Hotel</p>
                              <p className="font-medium">
                                {hotel ? `Hotel ${hotel.hotel_id} - ${hotel.area}` : foundRenting.hotel_name_snapshot}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Room</p>
                              <p className="font-medium">{room?.room_number ?? foundRenting.room_number_snapshot}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Dates</p>
                              <p className="font-medium">
                                {new Date(foundRenting.check_in_date).toLocaleDateString()} -{' '}
                                {new Date(foundRenting.check_out_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Amount Due</p>
                              <p className="font-bold text-green-600">${foundRenting.total_amount}</p>
                            </div>
                          </div>

                          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Final Payment Amount</label>
                            <input
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder="Enter payment amount"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                              <option value="credit_card">Credit Card</option>
                              <option value="debit_card">Debit Card</option>
                              <option value="cash">Cash</option>
                              <option value="gift_card">Gift Card</option>
                            </select>
                            <button
                              onClick={handleCheckOut}
                              disabled={!paymentAmount || submitting}
                              className={`w-full mt-4 py-3 rounded-md font-semibold ${
                                !paymentAmount || submitting
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {submitting ? 'Processing...' : 'Process Check-Out & Final Payment'}
                            </button>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </>
            )}

            {actionType === 'directRent' && (
              <form onSubmit={handleDirectRent}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                    <select
                      required
                      value={directRentForm.customerId}
                      onChange={(e) => setDirectRentForm({ ...directRentForm, customerId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Customer</option>
                      {customers.map((c) => (
                        <option key={c.customer_id} value={c.customer_id}>
                          {c.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room *</label>
                    <select
                      required
                      value={directRentForm.roomKey}
                      onChange={(e) => setDirectRentForm({ ...directRentForm, roomKey: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Room</option>
                      {availableDirectRentRooms.map((r) => {
                        const hotel = hotels.find((h) => h.hotel_id === r.hotel_id)
                        return (
                          <option key={`${r.hotel_id}-${r.room_number}`} value={`${r.hotel_id}::${r.room_number}`}>
                            {hotel ? `Hotel ${hotel.hotel_id} - ${hotel.area}` : `Hotel ${r.hotel_id}`} - Room {r.room_number} (${r.base_price}/night)
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date *</label>
                      <input
                        type="date"
                        required
                        value={directRentForm.startDate}
                        onChange={(e) => setDirectRentForm({ ...directRentForm, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date *</label>
                      <input
                        type="date"
                        required
                        value={directRentForm.endDate}
                        onChange={(e) => setDirectRentForm({ ...directRentForm, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                    <select
                      required
                      value={directRentForm.paymentMethod}
                      onChange={(e) => setDirectRentForm({ ...directRentForm, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>

                  {(directRentForm.paymentMethod === 'credit_card' || directRentForm.paymentMethod === 'debit_card') && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700">Card Details</h4>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={directRentForm.cardNumber}
                          onChange={(e) => setDirectRentForm({ ...directRentForm, cardNumber: e.target.value })}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={directRentForm.cardExpiry}
                            onChange={(e) => setDirectRentForm({ ...directRentForm, cardExpiry: e.target.value })}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">CVV</label>
                          <input
                            type="text"
                            value={directRentForm.cardCvv}
                            onChange={(e) => setDirectRentForm({ ...directRentForm, cardCvv: e.target.value })}
                            placeholder="123"
                            maxLength={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={directRentForm.cardholderName}
                          onChange={(e) => setDirectRentForm({ ...directRentForm, cardholderName: e.target.value })}
                          placeholder="Name on card"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3 rounded-md font-semibold ${
                      submitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {submitting ? 'Processing...' : 'Process Direct Rental & Payment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📥</span> Today's Check-ins ({todayBookings.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayBookings.map((booking) => {
                const customer = customers.find((c) => c.customer_id === booking.customer_id)
                const room = rooms.find(
                  (r) =>
                    r.hotel_id === booking.hotel_id &&
                    r.room_number === booking.room_number
                )

                return (
                  <div
                    key={booking.booking_id}
                    className="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100"
                    onClick={() => {
                      setFoundBooking(booking)
                      setFoundRenting(null)
                      setSearchValue(booking.booking_id.toString())
                      setActionType('checkin')
                    }}
                  >
                    <p className="font-medium text-gray-900">{customer?.full_name ?? 'Unknown customer'}</p>
                    <p className="text-sm text-gray-600">
                      Room {room?.room_number ?? booking.room_number_snapshot}
                    </p>
                    <p className="text-xs text-gray-500">Total: ${booking.booking_price}</p>
                  </div>
                )
              })}
              {todayBookings.length === 0 && (
                <p className="text-sm text-gray-500 text-center">No check-ins scheduled for today</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📤</span> Today's Check-outs ({todayCheckouts.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayCheckouts.map((renting) => {
                const customer = customers.find((c) => c.customer_id === renting.customer_id)
                const room = rooms.find(
                  (r) =>
                    r.hotel_id === renting.hotel_id &&
                    r.room_number === renting.room_number
                )

                return (
                  <div
                    key={renting.renting_id}
                    className="p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100"
                    onClick={() => {
                      setFoundRenting(renting)
                      setFoundBooking(null)
                      setSearchValue(renting.booking_id ? String(renting.booking_id) : '')
                      setPaymentAmount(String(renting.total_amount ?? ''))
                      setActionType('checkout')
                    }}
                  >
                    <p className="font-medium text-gray-900">{customer?.full_name ?? 'Unknown customer'}</p>
                    <p className="text-sm text-gray-600">
                      Room {room?.room_number ?? renting.room_number_snapshot}
                    </p>
                    <p className="text-xs text-red-600">Remaining: ${renting.total_amount}</p>
                  </div>
                )
              })}
              {todayCheckouts.length === 0 && (
                <p className="text-sm text-gray-500 text-center">No check-outs scheduled for today</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}