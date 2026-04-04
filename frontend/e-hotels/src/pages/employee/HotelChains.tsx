// src/pages/employee/HotelChains.tsx
import { useState } from 'react'
import type { HotelChain, HotelChainFormData } from '../../types'

interface HotelChainsProps {
  hotelChains: HotelChain[]
  setHotelChains: React.Dispatch<React.SetStateAction<HotelChain[]>>
}

export default function HotelChains({ hotelChains, setHotelChains }: HotelChainsProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingChain, setEditingChain] = useState<HotelChain | null>(null)
  const [formData, setFormData] = useState<HotelChainFormData>({
    name: '',
    centralOfficeAddress: '',
    numberOfHotels: 0,
    contactEmail: '',
    contactPhone: ''
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'numberOfHotels' ? parseInt(e.target.value) : e.target.value
    })
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingChain) {
      // Update existing chain
      const updatedChains = hotelChains.map(chain => 
        chain.id === editingChain.id 
          ? { ...chain, ...formData }
          : chain
      )
      setHotelChains(updatedChains)
      alert(`Hotel chain "${formData.name}" updated successfully!`)
    } else {
      // Create new chain
      const newChain: HotelChain = {
        id: Math.max(...hotelChains.map(c => c.id), 0) + 1,
        ...formData
      }
      setHotelChains([...hotelChains, newChain])
      alert(`Hotel chain "${formData.name}" created successfully!`)
    }
    
    resetForm()
  }
  
  const handleEdit = (chain: HotelChain) => {
    setEditingChain(chain)
    setFormData({
      name: chain.name,
      centralOfficeAddress: chain.centralOfficeAddress,
      numberOfHotels: chain.numberOfHotels,
      contactEmail: chain.contactEmail,
      contactPhone: chain.contactPhone
    })
    setShowForm(true)
  }
  
  const handleDelete = (chainId: number) => {
    if (confirm('Are you sure you want to delete this hotel chain? This will also delete all associated hotels and rooms.')) {
      setHotelChains(hotelChains.filter(c => c.id !== chainId))
      alert('Hotel chain deleted successfully!')
    }
  }
  
  const resetForm = () => {
    setShowForm(false)
    setEditingChain(null)
    setFormData({
      name: '',
      centralOfficeAddress: '',
      numberOfHotels: 0,
      contactEmail: '',
      contactPhone: ''
    })
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hotel Chains Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Add Hotel Chain
        </button>
      </div>
      
      {/* Hotel Chains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotelChains.map((chain) => (
          <div key={chain.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
              <h3 className="text-xl font-bold">{chain.name}</h3>
              <p className="text-sm text-blue-100 mt-1">ID: {chain.id}</p>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 min-w-[100px]">📍 Address:</span>
                  <span className="text-gray-700">{chain.centralOfficeAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 min-w-[100px]">🏨 Hotels:</span>
                  <span className="text-gray-700 font-semibold">{chain.numberOfHotels}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 min-w-[100px]">📧 Email:</span>
                  <span className="text-gray-700 text-sm">{chain.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 min-w-[100px]">📞 Phone:</span>
                  <span className="text-gray-700">{chain.contactPhone}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(chain)}
                  className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(chain.id)}
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingChain ? 'Edit Hotel Chain' : 'Add New Hotel Chain'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chain Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Central Office Address *</label>
                    <input
                      type="text"
                      name="centralOfficeAddress"
                      value={formData.centralOfficeAddress}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Hotels *</label>
                      <input
                        type="number"
                        name="numberOfHotels"
                        value={formData.numberOfHotels}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
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
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingChain ? 'Update Chain' : 'Create Chain'}
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