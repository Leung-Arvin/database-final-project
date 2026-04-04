// src/pages/employee/Hotels.tsx
import { useState } from 'react'
import type { Hotel, HotelChain, HotelFormData } from '../../types'

interface HotelsProps {
  hotels: Hotel[]
  hotelChains: HotelChain[]
  setHotels: React.Dispatch<React.SetStateAction<Hotel[]>>
}

export default function Hotels({ hotels, hotelChains, setHotels }: HotelsProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [selectedChain, setSelectedChain] = useState('all')
  const [formData, setFormData] = useState<HotelFormData>({
    chainId: hotelChains[0]?.id || 0,
    name: '',
    category: 3,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactEmail: '',
    contactPhone: '',
    numberOfRooms: 0,
    managerId: 0
  })
  
  const filteredHotels = selectedChain === 'all' 
    ? hotels 
    : hotels.filter(h => h.chainId === parseInt(selectedChain))
  
  const getChainName = (chainId: number) => {
    const chain = hotelChains.find(c => c.id === chainId)
    return chain ? chain.name : 'Unknown'
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'category' || e.target.name === 'chainId' || e.target.name === 'managerId' || e.target.name === 'numberOfRooms'
        ? parseInt(e.target.value)
        : e.target.value
    })
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingHotel) {
      const updatedHotels = hotels.map(hotel => 
        hotel.id === editingHotel.id 
          ? { ...hotel, ...formData }
          : hotel
      )
      setHotels(updatedHotels)
      alert(`Hotel "${formData.name}" updated successfully!`)
    } else {
      const newHotel: Hotel = {
        id: Math.max(...hotels.map(h => h.id), 0) + 1,
        ...formData
      }
      setHotels([...hotels, newHotel])
      alert(`Hotel "${formData.name}" created successfully!`)
    }
    
    resetForm()
  }
  
  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel)
    setFormData({
      chainId: hotel.chainId,
      name: hotel.name,
      category: hotel.category,
      address: hotel.address,
      city: hotel.city,
      state: hotel.state,
      zipCode: hotel.zipCode,
      contactEmail: hotel.contactEmail,
      contactPhone: hotel.contactPhone,
      numberOfRooms: hotel.numberOfRooms,
      managerId: hotel.managerId
    })
    setShowForm(true)
  }
  
  const handleDelete = (hotelId: number) => {
    if (confirm('Are you sure you want to delete this hotel? This will also delete all associated rooms.')) {
      setHotels(hotels.filter(h => h.id !== hotelId))
      alert('Hotel deleted successfully!')
    }
  }
  
  const resetForm = () => {
    setShowForm(false)
    setEditingHotel(null)
    setFormData({
      chainId: hotelChains[0]?.id || 0,
      name: '',
      category: 3,
      address: '',
      city: '',
      state: '',
      zipCode: '',
      contactEmail: '',
      contactPhone: '',
      numberOfRooms: 0,
      managerId: 0
    })
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hotels Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Add Hotel
        </button>
      </div>
      
      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Hotel Chain</label>
        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Chains</option>
          {hotelChains.map(chain => (
            <option key={chain.id} value={chain.id}>{chain.name}</option>
          ))}
        </select>
      </div>
      
      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`p-4 text-white ${hotel.category >= 4 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{hotel.name}</h3>
                  <p className="text-sm opacity-90 mt-1">{getChainName(hotel.chainId)}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl">⭐</span>
                  <p className="text-sm font-bold">{hotel.category} Star</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 min-w-[80px]">📍 Location:</span>
                  <span className="text-gray-700 text-sm">{hotel.city}, {hotel.state}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 min-w-[80px]">📮 Address:</span>
                  <span className="text-gray-700 text-sm">{hotel.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 min-w-[80px]">🛏️ Rooms:</span>
                  <span className="text-gray-700 font-semibold">{hotel.numberOfRooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 min-w-[80px]">📧 Email:</span>
                  <span className="text-gray-700 text-sm">{hotel.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 min-w-[80px]">📞 Phone:</span>
                  <span className="text-gray-700">{hotel.contactPhone}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(hotel)}
                  className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(hotel.id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Chain *</label>
                    <select
                      name="chainId"
                      value={formData.chainId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {hotelChains.map(chain => (
                        <option key={chain.id} value={chain.id}>{chain.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category (Stars) *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {[1, 2, 3, 4, 5].map(star => (
                          <option key={star} value={star}>{star} Star{star !== 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rooms *</label>
                      <input
                        type="number"
                        name="numberOfRooms"
                        value={formData.numberOfRooms}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager ID</label>
                    <input
                      type="number"
                      name="managerId"
                      value={formData.managerId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingHotel ? 'Update Hotel' : 'Create Hotel'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
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