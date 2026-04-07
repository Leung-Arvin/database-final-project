import { useEffect, useMemo, useState } from 'react'
import { bookingsApi } from '../../api/endpoints/bookings'
import { hotelChainsApi } from '../../api/endpoints/hotelChains'
import { hotelsApi } from '../../api/endpoints/hotels'
import {
  reportsApi,
  type RoomCapacityByHotelReportRow,
} from '../../api/endpoints/reports'
import { roomsApi } from '../../api/endpoints/rooms'
import type {
  ApiHotel,
  ApiHotelChain,
  ApiRoom,
} from '../../api/types/apiResponses'

type SearchCriteria = {
  customerId: string
  startDate: string
  endDate: string
  capacity: string
  area: string
  hotelChain: string
  category: string
  minRooms: string
  maxRooms: string
  minPrice: string
  maxPrice: string
}

type DisplayRoom = ApiRoom & {
  hotel: ApiHotel | null
  chain: ApiHotelChain | null
  totalRoomsInHotel: number | null
}

const emptyCriteria: SearchCriteria = {
  customerId: '',
  startDate: '',
  endDate: '',
  capacity: '',
  area: '',
  hotelChain: '',
  category: '',
  minRooms: '',
  maxRooms: '',
  minPrice: '',
  maxPrice: '',
}

function createUTCDate(dateString: string): Date {
  if (!dateString) return new Date(NaN)
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function getTodayString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getHotelDisplayName(hotel: ApiHotel, hotelChains: ApiHotelChain[]) {
  const chain = hotelChains.find((c) => c.chain_id === hotel.chain_id)
  return `${chain?.chain_name ?? `Chain ${hotel.chain_id}`} - ${hotel.area}`
}

export default function CustomerHomePage() {
  const [criteria, setCriteria] = useState<SearchCriteria>(emptyCriteria)

  const [hotelChains, setHotelChains] = useState<ApiHotelChain[]>([])
  const [hotels, setHotels] = useState<ApiHotel[]>([])
  const [capacityRows, setCapacityRows] = useState<RoomCapacityByHotelReportRow[]>([])
  const [availableRooms, setAvailableRooms] = useState<DisplayRoom[]>([])

  const [selectedRoom, setSelectedRoom] = useState<DisplayRoom | null>(null)
  const [selectedHotel, setSelectedHotel] = useState<ApiHotel | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDates, setBookingDates] = useState({ startDate: '', endDate: '' })

  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [bookingInProgress, setBookingInProgress] = useState(false)
  const [dateError, setDateError] = useState('')
  const [error, setError] = useState<string | null>(null)

  const capacityLookup = useMemo(() => {
    const map = new Map<number, number>()
    capacityRows.forEach((row) => {
      map.set(row.hotel_id, row.total_rooms)
    })
    return map
  }, [capacityRows])

  const parsedCustomerId =
    criteria.customerId.trim() === '' ? null : Number(criteria.customerId)

  const areas = useMemo(() => {
    return Array.from(new Set(hotels.map((h) => h.area))).sort()
  }, [hotels])

  const validateDates = (startDateStr: string, endDateStr: string): boolean => {
    if (!startDateStr || !endDateStr) {
      setDateError('')
      return true
    }

    const startDate = createUTCDate(startDateStr)
    const endDate = createUTCDate(endDateStr)
    const today = new Date()
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    )

    if (startDate < todayUTC) {
      setDateError('Check-in date cannot be in the past')
      return false
    }

    if (endDate <= startDate) {
      setDateError('Check-out date must be after check-in date')
      return false
    }

    setDateError('')
    return true
  }

  const calculateNights = (startDateStr: string, endDateStr: string): number => {
    if (!startDateStr || !endDateStr) return 0
    const start = createUTCDate(startDateStr)
    const end = createUTCDate(endDateStr)
    const diffTime = end.getTime() - start.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const loadPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [chainsData, hotelsData, capacityData] = await Promise.all([
        hotelChainsApi.getAll(),
        hotelsApi.getAll(),
        reportsApi.getRoomCapacityByHotel(),
      ])

      setHotelChains(chainsData)
      setHotels(hotelsData)
      setCapacityRows(capacityData)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load home page data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  useEffect(() => {
    const newStartDate = criteria.startDate
    const newEndDate = criteria.endDate
    validateDates(newStartDate, newEndDate)
  }, [criteria.startDate, criteria.endDate])

  useEffect(() => {
    const runSearch = async () => {
      try {
        setSearching(true)
        setError(null)

        if (criteria.startDate && criteria.endDate) {
          const isValid = validateDates(criteria.startDate, criteria.endDate)
          if (!isValid) {
            setAvailableRooms([])
            return
          }
        }

        const roomResults = await roomsApi.search({
          start_date: criteria.startDate || undefined,
          end_date: criteria.endDate || undefined,
          capacity: criteria.capacity ? Number(criteria.capacity) : undefined,
          area: criteria.area || undefined,
          hotel_chain_id: criteria.hotelChain ? Number(criteria.hotelChain) : undefined,
          rating: criteria.category ? Number(criteria.category) : undefined,
          min_price: criteria.minPrice ? Number(criteria.minPrice) : undefined,
          max_price: criteria.maxPrice ? Number(criteria.maxPrice) : undefined,
        })

        const enrichedRooms: DisplayRoom[] = roomResults.map((room) => {
          const hotel = hotels.find((h) => h.hotel_id === room.hotel_id) ?? null
          const chain =
            hotel != null
              ? hotelChains.find((c) => c.chain_id === hotel.chain_id) ?? null
              : null

          return {
            ...room,
            hotel,
            chain,
            totalRoomsInHotel: capacityLookup.get(room.hotel_id) ?? null,
          }
        })

        const minRooms = criteria.minRooms ? Number(criteria.minRooms) : null
        const maxRooms = criteria.maxRooms ? Number(criteria.maxRooms) : null

        const filtered = enrichedRooms.filter((room) => {
          if (minRooms !== null) {
            if (room.totalRoomsInHotel === null || room.totalRoomsInHotel < minRooms) {
              return false
            }
          }

          if (maxRooms !== null) {
            if (room.totalRoomsInHotel === null || room.totalRoomsInHotel > maxRooms) {
              return false
            }
          }

          return true
        })

        setAvailableRooms(filtered)
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to search rooms')
        setAvailableRooms([])
      } finally {
        setSearching(false)
      }
    }

    if (hotels.length > 0 && hotelChains.length > 0 && capacityRows.length > 0) {
      runSearch()
    }
  }, [criteria, hotels, hotelChains, capacityRows, capacityLookup])

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setCriteria((prev) => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: value,
    }))
  }

  const handleCriteriaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setCriteria((prev) => ({ ...prev, [name]: value }))
  }

  const handleReset = () => {
    setCriteria(emptyCriteria)
    setBookingDates({ startDate: '', endDate: '' })
    setDateError('')
    setSelectedRoom(null)
    setSelectedHotel(null)
    setShowBookingModal(false)
  }

  const handleBookRoom = (room: DisplayRoom) => {
    if (room.hasDamage) {
      alert(
        `This room is currently under maintenance: ${
          room.damageDescription || 'Issue reported'
        }. Please choose another room.`
      )
      return
    }

    if (!criteria.customerId || Number.isNaN(parsedCustomerId)) {
      alert('Please enter a valid customer ID before booking.')
      return
    }

    if (!criteria.startDate || !criteria.endDate) {
      alert('Please select both check-in and check-out dates before booking')
      return
    }

    if (!validateDates(criteria.startDate, criteria.endDate)) {
      alert(dateError || 'Invalid dates selected')
      return
    }

    const hotel = hotels.find((h) => h.hotel_id === room.hotel_id) ?? null

    setSelectedRoom(room)
    setSelectedHotel(hotel)
    setBookingDates({
      startDate: criteria.startDate,
      endDate: criteria.endDate,
    })
    setShowBookingModal(true)
  }

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRoom || !selectedHotel) {
      alert('No room selected.')
      return
    }

    if (!parsedCustomerId || Number.isNaN(parsedCustomerId)) {
      alert('Please enter a valid customer ID.')
      return
    }

    if (!validateDates(bookingDates.startDate, bookingDates.endDate)) {
      alert(dateError || 'Invalid dates selected')
      return
    }

    const nights = calculateNights(bookingDates.startDate, bookingDates.endDate)
    if (nights <= 0) {
      alert('Invalid date range. Check-out date must be after check-in date.')
      return
    }

    const totalPrice = Number(selectedRoom.base_price) * nights

    if (selectedRoom.hasDamage) {
      alert(
        `Sorry, this room is now under maintenance: ${
          selectedRoom.damageDescription || 'Issue reported'
        }. Please choose another room.`
      )
      setShowBookingModal(false)
      return
    }

    try {
      setBookingInProgress(true)
      setError(null)

      await bookingsApi.create({
        customer_id: parsedCustomerId,
        hotel_id: selectedRoom.hotel_id,
        room_number: selectedRoom.room_number,
        start_date: bookingDates.startDate,
        end_date: bookingDates.endDate,
        booking_price: totalPrice,
      })

      alert('Booking submitted successfully!')
      setShowBookingModal(false)
      setSelectedRoom(null)
      setSelectedHotel(null)
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to create booking'
      setError(message)
      alert(message)
    } finally {
      setBookingInProgress(false)
    }
  }

  const getMinCheckOutDate = (): string => {
    if (criteria.startDate) {
      const startDate = createUTCDate(criteria.startDate)
      const nextDay = new Date(startDate)
      nextDay.setUTCDate(startDate.getUTCDate() + 1)
      return nextDay.toISOString().split('T')[0]
    }
    return getTodayString()
  }

  const isBookingDisabled = (room: DisplayRoom) => {
    if (room.hasDamage) return true
    return (
      !criteria.customerId ||
      Number.isNaN(parsedCustomerId) ||
      !criteria.startDate ||
      !criteria.endDate ||
      !!dateError ||
      calculateNights(criteria.startDate, criteria.endDate) <= 0
    )
  }

  const nights = calculateNights(criteria.startDate, criteria.endDate)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-700">
          Loading home page...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome! 👋</h1>
        <p className="text-blue-100">
          Find and book the perfect room for your next stay
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Search Available Rooms
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Results update automatically as you change any criteria
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer ID *
            </label>
            <input
              type="number"
              name="customerId"
              value={criteria.customerId}
              onChange={handleCriteriaChange}
              placeholder="Enter customer ID"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={criteria.startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              min={getTodayString()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Date *
            </label>
            <input
              type="date"
              name="endDate"
              value={criteria.endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              min={getMinCheckOutDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {criteria.startDate && criteria.endDate && (
            <div className="col-span-full">
              {dateError ? (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {dateError}
                </p>
              ) : nights > 0 ? (
                <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✓ Valid dates selected - {nights} night(s)
                </p>
              ) : null}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Capacity
            </label>
            <select
              name="capacity"
              value={criteria.capacity}
              onChange={handleCriteriaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1 guest</option>
              <option value="2">2 guests</option>
              <option value="3">3 guests</option>
              <option value="4">4 guests</option>
              <option value="5">5+ guests</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area
            </label>
            <select
              name="area"
              value={criteria.area}
              onChange={handleCriteriaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Areas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hotel Chain
            </label>
            <select
              name="hotelChain"
              value={criteria.hotelChain}
              onChange={handleCriteriaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Chains</option>
              {hotelChains.map((chain) => (
                <option key={chain.chain_id} value={chain.chain_id}>
                  {chain.chain_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hotel Category
            </label>
            <select
              name="category"
              value={criteria.category}
              onChange={handleCriteriaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hotel Size (Min Rooms)
            </label>
            <input
              type="number"
              name="minRooms"
              value={criteria.minRooms}
              onChange={handleCriteriaChange}
              placeholder="Min rooms"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hotel Size (Max Rooms)
            </label>
            <input
              type="number"
              name="maxRooms"
              value={criteria.maxRooms}
              onChange={handleCriteriaChange}
              placeholder="Max rooms"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price ($)
            </label>
            <input
              type="number"
              name="minPrice"
              value={criteria.minPrice}
              onChange={handleCriteriaChange}
              placeholder="Min price"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price ($)
            </label>
            <input
              type="number"
              name="maxPrice"
              value={criteria.maxPrice}
              onChange={handleCriteriaChange}
              placeholder="Max price"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Reset All Filters
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          Found{' '}
          <span className="font-bold text-blue-600">{availableRooms.length}</span>{' '}
          rooms
        </p>
        {searching && (
          <p className="text-sm text-gray-500 mt-1">Updating results...</p>
        )}
        {criteria.startDate && criteria.endDate && !dateError && nights > 0 && (
          <p className="text-sm text-green-600 mt-1">
            ✓ Showing availability for{' '}
            {new Date(criteria.startDate).toLocaleDateString()} to{' '}
            {new Date(criteria.endDate).toLocaleDateString()} ({nights} nights)
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableRooms.map((room) => {
          const hotel = room.hotel
          const totalPrice = nights * Number(room.base_price)

          return (
            <div
              key={`${room.hotel_id}-${room.room_number}`}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                room.hasDamage ? 'border-l-4 border-red-500' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Room {room.room_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {hotel
                        ? getHotelDisplayName(hotel, hotelChains)
                        : `Hotel ${room.hotel_id}`}
                    </p>
                    {hotel && (
                      <div className="flex items-center mt-1">
                        {[...Array(hotel.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-sm">
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {hotel?.address ?? 'Address unavailable'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      ${room.base_price}
                    </p>
                    <p className="text-xs text-gray-500">/night</p>
                    {nights > 0 && !dateError && !room.hasDamage && (
                      <p className="text-sm font-semibold text-green-600 mt-2">
                        Total: ${totalPrice}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Capacity:
                    </span>
                    <span className="text-sm text-gray-600">{room.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      View:
                    </span>
                    <span className="text-sm text-gray-600 capitalize">
                      {room.view_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Hotel rooms:
                    </span>
                    <span className="text-sm text-gray-600">
                      {room.totalRoomsInHotel ?? 'N/A'}
                    </span>
                  </div>
                  {room.extendable && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600">✓ Extendable</span>
                    </div>
                  )}
                </div>

                {room.hasDamage && room.damageDescription && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <div className="flex items-start gap-2">
                      <span className="text-red-500">⚠️</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800">
                          Under Maintenance
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          {room.damageDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {room.amenities && room.amenities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Amenities:</p>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="text-xs px-2 py-1 bg-gray-100 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          +{room.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleBookRoom(room)}
                  disabled={isBookingDisabled(room)}
                  className={`w-full py-2 rounded-md transition-colors ${
                    !isBookingDisabled(room)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {room.hasDamage
                    ? '⚠️ Under Maintenance'
                    : !criteria.customerId
                    ? 'Enter Customer ID'
                    : !criteria.startDate || !criteria.endDate
                    ? 'Select Dates First'
                    : dateError
                    ? 'Invalid Dates'
                    : nights <= 0
                    ? 'Invalid Date Range'
                    : 'Book Now'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {availableRooms.length === 0 &&
        criteria.startDate &&
        criteria.endDate &&
        !dateError &&
        nights > 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md mt-6">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500">
              No rooms available for the selected filters. Try different criteria.
            </p>
          </div>
        )}

      {availableRooms.length === 0 &&
        (!criteria.startDate || !criteria.endDate) && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md mt-6">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-500">
              Please select check-in and check-out dates to see available rooms.
            </p>
          </div>
        )}

      {showBookingModal && selectedRoom && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Confirm Booking
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmBooking}>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Booking Details
                  </h3>
                  <p className="text-sm text-gray-600">
                    Hotel: {getHotelDisplayName(selectedHotel, hotelChains)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Room: {selectedRoom.room_number} - Capacity {selectedRoom.capacity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Price: ${selectedRoom.base_price}/night
                  </p>
                  <p className="text-sm text-gray-600">
                    Check-in: {bookingDates.startDate}
                  </p>
                  <p className="text-sm text-gray-600">
                    Check-out: {bookingDates.endDate}
                  </p>
                  <p className="text-sm text-gray-600">
                    Nights: {calculateNights(bookingDates.startDate, bookingDates.endDate)}
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    Total: $
                    {Number(selectedRoom.base_price) *
                      calculateNights(bookingDates.startDate, bookingDates.endDate)}
                  </p>
                </div>

                {calculateNights(bookingDates.startDate, bookingDates.endDate) <= 0 && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">
                      ⚠️ Invalid date range. Check-out date must be after check-in date.
                    </p>
                  </div>
                )}

                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Booking as customer ID: <strong>{criteria.customerId}</strong>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={
                      bookingInProgress ||
                      calculateNights(bookingDates.startDate, bookingDates.endDate) <= 0
                    }
                    className={`flex-1 py-2 rounded-md font-semibold ${
                      !bookingInProgress &&
                      calculateNights(bookingDates.startDate, bookingDates.endDate) > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {bookingInProgress ? 'Booking...' : 'Confirm Booking'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    disabled={bookingInProgress}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}