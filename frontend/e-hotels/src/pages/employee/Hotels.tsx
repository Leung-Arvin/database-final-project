import { useEffect, useMemo, useState } from 'react'
import { hotelsApi } from '../../api/endpoints/hotels'
import { hotelChainsApi } from '../../api/endpoints/hotelChains'
import type { ApiHotel, ApiHotelChain } from '../../api/types/apiResponses'

type HotelFormState = {
  chain_id: string
  rating: string
  address: string
  area: string
  contact_email: string
  manager_employee_id: string
}

const emptyForm: HotelFormState = {
  chain_id: '',
  rating: '3',
  address: '',
  area: '',
  contact_email: '',
  manager_employee_id: '',
}

function getChainName(chainId: number, chains: ApiHotelChain[]) {
  const chain = chains.find((c) => c.chain_id === chainId)
  return chain ? chain.chain_name : 'Unknown'
}

function getHotelDisplayName(hotel: ApiHotel) {
  return `${hotel.chain_name} - ${hotel.area}`
}

export default function EmployeeHotels() {
  const [hotels, setHotels] = useState<ApiHotel[]>([])
  const [hotelChains, setHotelChains] = useState<ApiHotelChain[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingHotel, setEditingHotel] = useState<ApiHotel | null>(null)
  const [selectedChain, setSelectedChain] = useState('all')
  const [formData, setFormData] = useState<HotelFormState>(emptyForm)

  const loadPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [hotelsData, hotelChainsData] = await Promise.all([
        hotelsApi.getAll(),
        hotelChainsApi.getAll(),
      ])

      setHotels(hotelsData)
      setHotelChains(hotelChainsData)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load hotels data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  const filteredHotels = useMemo(() => {
    if (selectedChain === 'all') return hotels
    return hotels.filter((hotel) => hotel.chain_id === Number(selectedChain))
  }, [hotels, selectedChain])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingHotel(null)
    setFormData({
      ...emptyForm,
      chain_id: hotelChains[0] ? String(hotelChains[0].chain_id) : '',
    })
  }

  const handleEdit = (hotel: ApiHotel) => {
    setEditingHotel(hotel)
    setFormData({
      chain_id: String(hotel.chain_id),
      rating: String(hotel.rating),
      address: hotel.address,
      area: hotel.area,
      contact_email: hotel.contact_email,
      manager_employee_id:
        hotel.manager_employee_id === null || hotel.manager_employee_id === undefined
          ? ''
          : String(hotel.manager_employee_id),
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.chain_id ||
      !formData.rating ||
      !formData.address ||
      !formData.area ||
      !formData.contact_email
    ) {
      alert('Please fill in all required fields.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const payload = {
        chain_id: Number(formData.chain_id),
        rating: Number(formData.rating),
        address: formData.address,
        area: formData.area,
        contact_email: formData.contact_email,
        manager_employee_id:
          formData.manager_employee_id.trim() === ''
            ? null
            : Number(formData.manager_employee_id),
      }

      if (editingHotel) {
        await hotelsApi.update(editingHotel.hotel_id, payload)
        alert(`Hotel "${getHotelDisplayName(editingHotel)}" updated successfully!`)
      } else {
        await hotelsApi.create(payload)
        alert('Hotel created successfully!')
      }

      resetForm()
      await loadPageData()
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to save hotel')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (hotelId: number, hotelName: string) => {
    if (!confirm(`Are you sure you want to delete "${hotelName}"?`)) {
      return
    }

    try {
      setError(null)
      await hotelsApi.delete(hotelId)
      alert(`Hotel "${hotelName}" deleted successfully!`)
      await loadPageData()
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete hotel')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-700">
          Loading hotels...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hotels Management</h1>
        <button
          onClick={() => {
            setEditingHotel(null)
            setFormData({
              ...emptyForm,
              chain_id: hotelChains[0] ? String(hotelChains[0].chain_id) : '',
            })
            setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Add Hotel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Hotel Chain
        </label>
        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Chains</option>
          {hotelChains.map((chain) => (
            <option key={chain.chain_id} value={chain.chain_id}>
              {chain.chain_name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <div
            key={hotel.hotel_id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div
              className={`p-4 text-white ${
                hotel.rating >= 4
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{getHotelDisplayName(hotel)}</h3>
                  <p className="text-sm opacity-90 mt-1">
                    {getChainName(hotel.chain_id, hotelChains)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Rating</p>
                  <p className="font-bold">{hotel.rating}★</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-gray-500 min-w-[110px]">📍 Address:</span>
                <span className="text-gray-700">{hotel.address}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-gray-500 min-w-[110px]">🌍 Area:</span>
                <span className="text-gray-700">{hotel.area}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-gray-500 min-w-[110px]">✉️ Email:</span>
                <span className="text-gray-700 break-all">{hotel.contact_email}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-gray-500 min-w-[110px]">👔 Manager ID:</span>
                <span className="text-gray-700">
                  {hotel.manager_employee_id ?? 'None'}
                </span>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => handleEdit(hotel)}
                  className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    handleDelete(hotel.hotel_id, getHotelDisplayName(hotel))
                  }
                  className="flex-1 px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredHotels.length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            No hotels found.
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingHotel ? 'Edit Hotel' : 'Add Hotel'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Chain
                  </label>
                  <select
                    name="chain_id"
                    value={formData.chain_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a chain</option>
                    {hotelChains.map((chain) => (
                      <option key={chain.chain_id} value={chain.chain_id}>
                        {chain.chain_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area
                </label>
                <input
                  name="area"
                  type="text"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Example: Toronto, ON"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager Employee ID
                </label>
                <input
                  name="manager_employee_id"
                  type="number"
                  value={formData.manager_employee_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Optional"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving...'
                    : editingHotel
                    ? 'Save Changes'
                    : 'Create Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}