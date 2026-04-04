// src/pages/employee/Rooms.tsx - CORRECTED VERSION
import { useState } from 'react'
import type { Hotel, Room, RoomFormData } from '../../types'

interface EmployeeRoomsProps {
  hotels: Hotel[]
  rooms: Room[]
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>
}

export default function EmployeeRooms({ hotels, rooms, setRooms }: EmployeeRoomsProps) {
  const [selectedHotel, setSelectedHotel] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  // Track which room is being edited for price
  const [editingPriceRoomId, setEditingPriceRoomId] = useState<number | null>(null)
  const [tempPrice, setTempPrice] = useState<number>(0)
  const [formData, setFormData] = useState<RoomFormData>({
    hotelId: hotels[0]?.id || 0,
    roomNumber: '',
    price: 100,
    amenities: [],
    capacity: 'double',
    view: 'city',
    isExtendable: false,
    hasDamage: false,
    damageDescription: ''
  })
  const [amenityInput, setAmenityInput] = useState('')
  
  // Filter rooms based on hotel selection and search
  const filteredRooms = rooms.filter(room => {
    const hotelMatch = selectedHotel === 'all' || room.hotelId === parseInt(selectedHotel)
    const searchMatch = searchTerm === '' || 
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getHotelName(room.hotelId).toLowerCase().includes(searchTerm.toLowerCase())
    return hotelMatch && searchMatch
  })
  
  const getHotelName = (hotelId: number) => {
    const hotel = hotels.find(h => h.id === hotelId)
    return hotel ? hotel.name : 'Unknown'
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked
      : e.target.value
      
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }
  
  const addAmenity = () => {
    if (amenityInput && !formData.amenities.includes(amenityInput)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput]
      })
      setAmenityInput('')
    }
  }
  
  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity)
    })
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingRoom) {
      // Update existing room
      const updatedRooms = rooms.map(room => 
        room.id === editingRoom.id 
          ? { ...room, ...formData }
          : room
      )
      setRooms(updatedRooms)
      alert(`Room ${formData.roomNumber} updated successfully!`)
    } else {
      // Create new room
      const newRoom: Room = {
        id: Math.max(...rooms.map(r => r.id), 0) + 1,
        ...formData
      }
      setRooms([...rooms, newRoom])
      alert(`Room ${formData.roomNumber} created successfully!`)
    }
    
    resetForm()
  }
  
  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      hotelId: room.hotelId,
      roomNumber: room.roomNumber,
      price: room.price,
      amenities: room.amenities,
      capacity: room.capacity,
      view: room.view,
      isExtendable: room.isExtendable,
      hasDamage: room.hasDamage,
      damageDescription: room.damageDescription || ''
    })
    setShowForm(true)
  }
  
  const handleDelete = (roomId: number) => {
    if (confirm('Are you sure you want to delete this room?')) {
      setRooms(rooms.filter(r => r.id !== roomId))
      alert('Room deleted successfully!')
    }
  }
  
  const handleToggleMaintenance = (room: Room) => {
    const updatedRooms = rooms.map(r => 
      r.id === room.id 
        ? { ...r, hasDamage: !r.hasDamage, damageDescription: !r.hasDamage ? 'Under maintenance' : '' }
        : r
    )
    setRooms(updatedRooms)
    alert(`Room ${room.roomNumber} ${!room.hasDamage ? 'marked as under maintenance' : 'marked as available'}`)
  }
  
  const startPriceEdit = (room: Room) => {
    setEditingPriceRoomId(room.id)
    setTempPrice(room.price)
  }
  
  const cancelPriceEdit = () => {
    setEditingPriceRoomId(null)
    setTempPrice(0)
  }
  
  const savePriceEdit = (roomId: number) => {
    if (tempPrice > 0) {
      const updatedRooms = rooms.map(r => 
        r.id === roomId ? { ...r, price: tempPrice } : r
      )
      setRooms(updatedRooms)
      alert(`Price updated to $${tempPrice}`)
    }
    setEditingPriceRoomId(null)
  }
  
  const resetForm = () => {
    setShowForm(false)
    setEditingRoom(null)
    setFormData({
      hotelId: hotels[0]?.id || 0,
      roomNumber: '',
      price: 100,
      amenities: [],
      capacity: 'double',
      view: 'city',
      isExtendable: false,
      hasDamage: false,
      damageDescription: ''
    })
    setAmenityInput('')
  }
  
  // Statistics
  const stats = {
    total: filteredRooms.length,
    available: filteredRooms.filter(r => !r.hasDamage).length,
    damaged: filteredRooms.filter(r => r.hasDamage).length,
    averagePrice: filteredRooms.length > 0 
      ? (filteredRooms.reduce((sum, r) => sum + r.price, 0) / filteredRooms.length).toFixed(0)
      : '0',
    byCapacity: {
      single: filteredRooms.filter(r => r.capacity === 'single').length,
      double: filteredRooms.filter(r => r.capacity === 'double').length,
      triple: filteredRooms.filter(r => r.capacity === 'triple').length,
      quad: filteredRooms.filter(r => r.capacity === 'quad').length
    },
    byView: {
      sea: filteredRooms.filter(r => r.view === 'sea').length,
      mountain: filteredRooms.filter(r => r.view === 'mountain').length,
      city: filteredRooms.filter(r => r.view === 'city').length
    }
  }
  
  const commonAmenities = ['TV', 'AC', 'WiFi', 'Fridge', 'Mini Bar', 'Jacuzzi', 'Ocean View', 'Mountain View', 'City View', 'Balcony', 'Work Desk', 'Coffee Maker']
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Add New Room
        </button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-3xl">🛏️</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
            <div className="text-3xl">✓</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Under Maintenance</p>
              <p className="text-2xl font-bold text-red-600">{stats.damaged}</p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Price</p>
              <p className="text-2xl font-bold text-blue-600">${stats.averagePrice}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Hotel</label>
            <select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Hotels ({hotels.length})</option>
              {hotels.map(hotel => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name} ({rooms.filter(r => r.hotelId === hotel.id).length} rooms)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Rooms</label>
            <input
              type="text"
              placeholder="Search by room number or hotel name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const hotel = hotels.find(h => h.id === room.hotelId)!
          const isEditingPrice = editingPriceRoomId === room.id
          
          return (
            <div 
              key={room.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                room.hasDamage ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-gray-900">Room {room.roomNumber}</h3>
                      {room.isExtendable && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Extendable</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{hotel.name}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(hotel.category)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price with inline edit */}
                  <div className="text-right">
                    {isEditingPrice ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-right font-bold"
                          min="0"
                        />
                        <button
                          onClick={() => savePriceEdit(room.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelPriceEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer hover:opacity-75"
                        onClick={() => startPriceEdit(room)}
                      >
                        <p className="text-2xl font-bold text-blue-600">${room.price}</p>
                        <p className="text-xs text-gray-500">/night (click to edit)</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-24">Capacity:</span>
                    <span className="text-sm text-gray-600 capitalize">{room.capacity}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-24">View:</span>
                    <span className="text-sm text-gray-600 capitalize flex items-center gap-1">
                      {room.view === 'sea' && '🌊'}
                      {room.view === 'mountain' && '⛰️'}
                      {room.view === 'city' && '🏙️'}
                      {room.view}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-24">Hotel:</span>
                    <span className="text-sm text-gray-600">{hotel.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-24">Location:</span>
                    <span className="text-sm text-gray-600">{hotel.city}, {hotel.state}</span>
                  </div>
                  
                  {room.hasDamage && room.damageDescription && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600 font-medium">Maintenance Note:</p>
                      <p className="text-xs text-red-700">{room.damageDescription}</p>
                    </div>
                  )}
                </div>
                
                {/* Amenities */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 4).map((amenity, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        +{room.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(room)}
                    className="flex-1 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm font-medium"
                  >
                    Edit Room
                  </button>
                  <button
                    onClick={() => handleToggleMaintenance(room)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium ${
                      room.hasDamage 
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {room.hasDamage ? 'Mark Available' : 'Mark Maintenance'}
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {filteredRooms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">🛏️</div>
          <p className="text-gray-500">No rooms found. Click "Add New Room" to create one.</p>
        </div>
      )}
      
      {/* Add/Edit Room Modal - Keep this part the same */}
      {showForm && (
        // ... your existing modal code ...
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Hotel Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel *</label>
                  <select
                    name="hotelId"
                    value={formData.hotelId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {hotels.map(hotel => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name} - {hotel.city}, {hotel.state} ({hotel.category}★)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
                    <input
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 101, 202A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price per Night ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
                    <select
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="single">Single (1 person)</option>
                      <option value="double">Double (2 people)</option>
                      <option value="triple">Triple (3 people)</option>
                      <option value="quad">Quad (4 people)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">View *</label>
                    <select
                      name="view"
                      value={formData.view}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="city">City View</option>
                      <option value="mountain">Mountain View</option>
                      <option value="sea">Sea View</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center pt-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isExtendable"
                        checked={formData.isExtendable}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Room is extendable</span>
                    </label>
                  </div>
                </div>
                
                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <div className="flex gap-2 mb-3">
                    <select
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select an amenity...</option>
                      {commonAmenities.filter(a => !formData.amenities.includes(a)).map(amenity => (
                        <option key={amenity} value={amenity}>{amenity}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addAmenity}
                      disabled={!amenityInput}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                      {formData.amenities.map((amenity, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-white border rounded-md text-sm">
                          {amenity}
                          <button
                            type="button"
                            onClick={() => removeAmenity(amenity)}
                            className="text-red-500 hover:text-red-700 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Maintenance Status */}
                <div>
                  <label className="flex items-center cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      name="hasDamage"
                      checked={formData.hasDamage}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Room has damage/needs maintenance</span>
                  </label>
                  
                  {formData.hasDamage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Damage Description</label>
                      <textarea
                        name="damageDescription"
                        value={formData.damageDescription}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Describe the damage or maintenance issue..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
                  >
                    {editingRoom ? 'Update Room' : 'Create Room'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold"
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