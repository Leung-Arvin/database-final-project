import { useEffect, useState } from 'react'
import { hotelChainsApi } from '../../api/endpoints/hotelChains'
import { hotelsApi } from '../../api/endpoints/hotels'
import type { ApiHotel, ApiHotelChain } from '../../api/types/apiResponses'

type HotelChainFormState = {
  chain_name: string
  central_office_address: string
}

const emptyForm: HotelChainFormState = {
  chain_name: '',
  central_office_address: '',
}

export default function HotelChains() {
  const [hotelChains, setHotelChains] = useState<ApiHotelChain[]>([])
  const [hotels, setHotels] = useState<ApiHotel[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingChain, setEditingChain] = useState<ApiHotelChain | null>(null)
  const [formData, setFormData] = useState<HotelChainFormState>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [chainsData, hotelsData] = await Promise.all([
        hotelChainsApi.getAll(),
        hotelsApi.getAll(),
      ])

      setHotelChains(chainsData)
      setHotels(hotelsData)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load hotel chains')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.chain_name.trim() || !formData.central_office_address.trim()) {
      alert('Please fill in all required fields.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const payload = {
        chain_name: formData.chain_name.trim(),
        central_office_address: formData.central_office_address.trim(),
      }

      if (editingChain) {
        await hotelChainsApi.update(editingChain.chain_id, payload)
        alert(`Hotel chain "${formData.chain_name}" updated successfully!`)
      } else {
        await hotelChainsApi.create(payload)
        alert(`Hotel chain "${formData.chain_name}" created successfully!`)
      }

      resetForm()
      await loadPageData()
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to save hotel chain'
      setError(message)
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (chain: ApiHotelChain) => {
    setEditingChain(chain)
    setFormData({
      chain_name: chain.chain_name,
      central_office_address: chain.central_office_address,
    })
    setShowForm(true)
  }

  const handleDelete = async (chainId: number, chainName: string) => {
    const linkedHotels = hotels.filter((hotel) => hotel.chain_id === chainId)

    if (linkedHotels.length > 0) {
      alert(
        `Cannot delete "${chainName}" because it still has ${linkedHotels.length} hotel(s) associated with it.`
      )
      return
    }

    if (!confirm(`Are you sure you want to delete "${chainName}"?`)) {
      return
    }

    try {
      setError(null)
      await hotelChainsApi.delete(chainId)
      alert('Hotel chain deleted successfully!')
      await loadPageData()
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to delete hotel chain'
      setError(message)
      alert(message)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingChain(null)
    setFormData(emptyForm)
  }

  const getHotelCount = (chainId: number) => {
    return hotels.filter((hotel) => hotel.chain_id === chainId).length
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-700">
          Loading hotel chains...
        </div>
      </div>
    )
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

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotelChains.map((chain) => (
          <div
            key={chain.chain_id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
              <h3 className="text-xl font-bold">{chain.chain_name}</h3>
              <p className="text-sm text-blue-100 mt-1">ID: {chain.chain_id}</p>
            </div>

            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 min-w-[100px]">📍 Address:</span>
                  <span className="text-gray-700">{chain.central_office_address}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 min-w-[100px]">🏨 Hotels:</span>
                  <span className="text-gray-700 font-semibold">
                    {getHotelCount(chain.chain_id)}
                  </span>
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
                  onClick={() => handleDelete(chain.chain_id, chain.chain_name)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {hotelChains.length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            No hotel chains found.
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingChain ? 'Edit Hotel Chain' : 'Add New Hotel Chain'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  disabled={submitting}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chain Name *
                    </label>
                    <input
                      type="text"
                      name="chain_name"
                      value={formData.chain_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Central Office Address *
                    </label>
                    <input
                      type="text"
                      name="central_office_address"
                      value={formData.central_office_address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 py-2 rounded-md ${
                      submitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {submitting
                      ? 'Saving...'
                      : editingChain
                      ? 'Update Chain'
                      : 'Create Chain'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
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