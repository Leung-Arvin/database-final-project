// src/pages/customer/HomePage.tsx
import { useState, useEffect } from 'react'
import type { Hotel, Room, HotelChain, Customer, Booking } from '../../types'

interface CustomerHomePageProps {
  hotelChains: HotelChain[]
  hotels: Hotel[]
  rooms: Room[]
  currentCustomer: Customer
  bookings: Booking[]
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>
}

export default function CustomerHomePage({ 
  hotelChains, 
  hotels, 
  rooms, 
  currentCustomer,
  bookings,
  setBookings
}: CustomerHomePageProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDates, setBookingDates] = useState({ startDate: '', endDate: '' })
  
  // Search criteria state
  const [criteria, setCriteria] = useState({
    startDate: '',
    endDate: '',
    capacity: '',
    area: '',
    hotelChain: '',
    category: '',
    minRooms: '',
    maxRooms: '',
    minPrice: '',
    maxPrice: ''
  })
  
  // Get unique values for dropdowns
  const areas = Array.from(new Set(hotels.map(h => `${h.city}, ${h.state}`)))
  const categories = Array.from(new Set(hotels.map(h => h.category))).sort()
  const capacities = ['single', 'double', 'triple', 'quad']
  
  // Real-time search - updates as any criteria changes
  useEffect(() => {
    let filtered = [...rooms]
    
    // Filter by area
    if (criteria.area) {
      const areaHotels = hotels.filter(h => `${h.city}, ${h.state}` === criteria.area)
      filtered = filtered.filter(r => areaHotels.some(h => h.id === r.hotelId))
    }
    
    // Filter by hotel chain
    if (criteria.hotelChain) {
      const chainHotels = hotels.filter(h => h.chainId === parseInt(criteria.hotelChain))
      filtered = filtered.filter(r => chainHotels.some(h => h.id === r.hotelId))
    }
    
    // Filter by category
    if (criteria.category) {
      const categoryHotels = hotels.filter(h => h.category === parseInt(criteria.category))
      filtered = filtered.filter(r => categoryHotels.some(h => h.id === r.hotelId))
    }
    
    // Filter by capacity
    if (criteria.capacity) {
      filtered = filtered.filter(r => r.capacity === criteria.capacity)
    }
    
    // Filter by number of rooms in hotel
    if (criteria.minRooms) {
      const minRooms = parseInt(criteria.minRooms)
      filtered = filtered.filter(r => {
        const hotel = hotels.find(h => h.id === r.hotelId)
        return hotel && hotel.numberOfRooms >= minRooms
      })
    }
    if (criteria.maxRooms) {
      const maxRooms = parseInt(criteria.maxRooms)
      filtered = filtered.filter(r => {
        const hotel = hotels.find(h => h.id === r.hotelId)
        return hotel && hotel.numberOfRooms <= maxRooms
      })
    }
    
    // Filter by price
    if (criteria.minPrice) {
      filtered = filtered.filter(r => r.price >= parseInt(criteria.minPrice))
    }
    if (criteria.maxPrice) {
      filtered = filtered.filter(r => r.price <= parseInt(criteria.maxPrice))
    }
    
    // Filter by date availability (simplified - in real app would check against existing bookings)
    if (criteria.startDate && criteria.endDate) {
      // Check if room is available for the selected dates
      filtered = filtered.filter(room => {
        const existingBookings = bookings.filter(b => 
          b.roomId === room.id && 
          b.status !== 'cancelled' &&
          new Date(b.startDate) < new Date(criteria.endDate) &&
          new Date(b.endDate) > new Date(criteria.startDate)
        )
        return existingBookings.length === 0
      })
    }
    
    setFilteredRooms(filtered)
  }, [criteria, rooms, hotels, bookings])
  
  const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCriteria(prev => ({ ...prev, [name]: value }))
  }
  
  const handleReset = () => {
    setCriteria({
      startDate: '',
      endDate: '',
      capacity: '',
      area: '',
      hotelChain: '',
      category: '',
      minRooms: '',
      maxRooms: '',
      minPrice: '',
      maxPrice: ''
    })
    setBookingDates({ startDate: '', endDate: '' })
  }
  
  const handleBookRoom = (room: Room) => {
    const hotel = hotels.find(h => h.id === room.hotelId)
    setSelectedRoom(room)
    setSelectedHotel(hotel || null)
    setBookingDates({
      startDate: criteria.startDate,
      endDate: criteria.endDate
    })
    setShowBookingModal(true)
  }
  
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault()
    
    const nights = Math.ceil(
      (new Date(bookingDates.endDate).getTime() - new Date(bookingDates.startDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    )
    const totalPrice = (selectedRoom?.price || 0) * nights
    
    const newBooking: Booking = {
      id: Math.max(...bookings.map(b => b.id), 0) + 1,
      customerId: currentCustomer.id,
      roomId: selectedRoom!.id,
      hotelId: selectedHotel!.id,
      startDate: new Date(bookingDates.startDate),
      endDate: new Date(bookingDates.endDate),
      status: 'pending',
      totalPrice: totalPrice,
      bookingDate: new Date()
    }
    
    setBookings([...bookings, newBooking])
    alert(`Booking confirmed! Total: $${totalPrice}`)
    setShowBookingModal(false)
  }
  
  const calculateNights = () => {
    if (!bookingDates.startDate || !bookingDates.endDate) return 0
    const start = new Date(bookingDates.startDate)
    const end = new Date(bookingDates.endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {currentCustomer.firstName}! 👋
        </h1>
        <p className="text-blue-100">
          Find and book the perfect room for your next stay
        </p>
      </div>
      
      {/* Search Form with All Criteria */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Available Rooms</h2>
        <p className="text-sm text-gray-600 mb-4">Results update automatically as you change any criteria</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
            <input
              type="date"
              name="startDate"
              value={criteria.startDate}
              onChange={handleCriteriaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
            <input
              type="date"
              name="endDate"
              value={criteria.endDate}
              onChange={handleCriteriaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Room Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Capacity</label>
            <select
              name="capacity"
              value={criteria.capacity}
              onChange={handleCriteriaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any</option>
              {capacities.map(cap => (
                <option key={cap} value={cap}>{cap.charAt(0).toUpperCase() + cap.slice(1)}</option>
              ))}
            </select>
          </div>
          
          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
            <select
              name="area"
              value={criteria.area}
              onChange={handleCriteriaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Areas</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          
          {/* Hotel Chain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Chain</label>
            <select
              name="hotelChain"
              value={criteria.hotelChain}
              onChange={handleCriteriaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Chains</option>
              {hotelChains.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>
          </div>
          
          {/* Hotel Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Category</label>
            <select
              name="category"
              value={criteria.category}
              onChange={handleCriteriaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat} Star{cat !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          
          {/* Number of Rooms in Hotel (Range) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Size (Min Rooms)</label>
            <input
              type="number"
              name="minRooms"
              value={criteria.minRooms}
              onChange={handleCriteriaChange}
              placeholder="Min rooms"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Size (Max Rooms)</label>
            <input
              type="number"
              name="maxRooms"
              value={criteria.maxRooms}
              onChange={handleCriteriaChange}
              placeholder="Max rooms"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price ($)</label>
            <input
              type="number"
              name="minPrice"
              value={criteria.minPrice}
              onChange={handleCriteriaChange}
              placeholder="Min price"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price ($)</label>
            <input
              type="number"
              name="maxPrice"
              value={criteria.maxPrice}
              onChange={handleCriteriaChange}
              placeholder="Max price"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Reset All Filters
          </button>
        </div>
      </div>
      
      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Found <span className="font-bold text-blue-600">{filteredRooms.length}</span> available rooms
        </p>
      </div>
      
      {/* Room Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const hotel = hotels.find(h => h.id === room.hotelId)!
          const nights = criteria.startDate && criteria.endDate 
            ? Math.ceil((new Date(criteria.endDate).getTime() - new Date(criteria.startDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0
          const totalPrice = nights * room.price
          
          return (
            <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Room {room.roomNumber}</h3>
                    <p className="text-sm text-gray-600">{hotel.name}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(hotel.category)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{hotel.city}, {hotel.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">${room.price}</p>
                    <p className="text-xs text-gray-500">/night</p>
                    {nights > 0 && (
                      <p className="text-sm font-semibold text-green-600 mt-2">
                        Total: ${totalPrice}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Capacity:</span>
                    <span className="text-sm text-gray-600 capitalize">{room.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">View:</span>
                    <span className="text-sm text-gray-600 capitalize">{room.view}</span>
                  </div>
                  {room.isExtendable && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600">✓ Extendable</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">{amenity}</span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">+{room.amenities.length - 3}</span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleBookRoom(room)}
                  disabled={!criteria.startDate || !criteria.endDate}
                  className={`w-full py-2 rounded-md transition-colors ${
                    criteria.startDate && criteria.endDate
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {criteria.startDate && criteria.endDate ? 'Book Now' : 'Select Dates First'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      
      {filteredRooms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500">No rooms match your criteria. Try adjusting your filters.</p>
        </div>
      )}
      
      {/* Booking Modal */}
      {showBookingModal && selectedRoom && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Confirm Booking</h2>
                <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <form onSubmit={handleConfirmBooking}>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
                  <p className="text-sm text-gray-600">Hotel: {selectedHotel.name}</p>
                  <p className="text-sm text-gray-600">Room: {selectedRoom.roomNumber} - {selectedRoom.capacity}</p>
                  <p className="text-sm text-gray-600">Price: ${selectedRoom.price}/night</p>
                  <p className="text-sm text-gray-600">Check-in: {bookingDates.startDate}</p>
                  <p className="text-sm text-gray-600">Check-out: {bookingDates.endDate}</p>
                  <p className="text-sm text-gray-600">Nights: {calculateNights()}</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">Total: ${(selectedRoom.price * calculateNights())}</p>
                </div>
                
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Booking as: <strong>{currentCustomer.firstName} {currentCustomer.lastName}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">{currentCustomer.email}</p>
                </div>
                
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Confirm Booking
                  </button>
                  <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
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