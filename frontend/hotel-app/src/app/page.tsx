// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import HotelSearch from '../../components/HotelSearch'
import RoomCard from '../../components/RoomCard'
import BookingForm from '../../components/BookingForm'
import { Hotel, Room, HotelChain } from '../../types'
import { hotelChains, hotels, rooms, customers } from '../../lib/data'

export default function Page() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    capacity: '',
    area: '',
    hotelChain: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  })
  
  const [showBookingForm, setShowBookingForm] = useState(false)
  
  // Compute unique areas from hotels data
  const areas = Array.from(new Set(hotels.map(h => `${h.city}, ${h.state}`)))
  
  // Get unique categories
  const categories = Array.from(new Set(hotels.map(h => h.category))).sort()
  
  const handleSearch = () => {
    let filtered = [...rooms]
    
    // Filter by area
    if (filters.area) {
      const areaHotels = hotels.filter(h => `${h.city}, ${h.state}` === filters.area)
      filtered = filtered.filter(r => areaHotels.some(h => h.id === r.hotelId))
    }
    
    // Filter by hotel chain
    if (filters.hotelChain) {
      const chainHotels = hotels.filter(h => h.chainId === parseInt(filters.hotelChain))
      filtered = filtered.filter(r => chainHotels.some(h => h.id === r.hotelId))
    }
    
    // Filter by category
    if (filters.category) {
      const categoryHotels = hotels.filter(h => h.category === parseInt(filters.category))
      filtered = filtered.filter(r => categoryHotels.some(h => h.id === r.hotelId))
    }
    
    // Filter by capacity
    if (filters.capacity) {
      filtered = filtered.filter(r => r.capacity === filters.capacity)
    }
    
    // Filter by price
    if (filters.minPrice) {
      filtered = filtered.filter(r => r.price >= parseInt(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(r => r.price <= parseInt(filters.maxPrice))
    }
    
    setFilteredRooms(filtered)
  }
  
  useEffect(() => {
    setFilteredRooms(rooms)
  }, [])
  
  const handleBookRoom = (room: Room) => {
    const hotel = hotels.find(h => h.id === room.hotelId)
    setSelectedRoom(room)
    setSelectedHotel(hotel || null)
    setShowBookingForm(true)
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Find Your Perfect Hotel Room
      </h1>
      
      {/* Pass all necessary data as props */}
      <HotelSearch 
        filters={filters} 
        setFilters={setFilters} 
        onSearch={handleSearch}
        areas={areas}
        categories={categories}
        hotelChains={hotelChains}
      />
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Available Rooms ({filteredRooms.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              hotel={hotels.find(h => h.id === room.hotelId)!}
              onBook={() => handleBookRoom(room)}
            />
          ))}
        </div>
      </div>
      
      {showBookingForm && selectedRoom && selectedHotel && (
        <BookingForm
          room={selectedRoom}
          hotel={selectedHotel}
          onClose={() => setShowBookingForm(false)}
          filters={filters}
          customers={customers}
        />
      )}
    </div>
  )
}