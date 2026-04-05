import { useEffect, useMemo, useState } from 'react'
import { hotelsApi } from '../../api/endpoints/hotels'
import { roomsApi } from '../../api/endpoints/rooms'
import type { ApiHotel, ApiRoom } from '../../api/types/apiResponses'

type RoomFormState = {
  hotel_id: string
  room_number: string
  base_price: string
  amenities: string[]
  capacity: string
  view_type: string
  extendable: boolean
  hasDamage: boolean
  damageDescription: string
}

const emptyForm: RoomFormState = {
  hotel_id: '',
  room_number: '',
  base_price: '100',
  amenities: [],
  capacity: 'double',
  view_type: 'city',
  extendable: false,
  hasDamage: false,
  damageDescription: '',
}

function getHotelDisplayName(hotel: ApiHotel) {
  return `${hotel.chain_name} - ${hotel.area}`
}

export default function EmployeeRooms() {
  const [hotels, setHotels] = useState<ApiHotel[]>([])
  const [rooms, setRooms] = useState<ApiRoom[]>([])

  const [selectedHotel, setSelectedHotel] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<ApiRoom | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingPriceKey, setEditingPriceKey] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState<number>(0)

  const [formData, setFormData] = useState<RoomFormState>(emptyForm)
  const [amenityInput, setAmenityInput] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const roomKey = (hotelId: number, roomNumber: string) => `${hotelId}-${roomNumber}`

  const loadPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const hotelsData = await hotelsApi.getAll()
      setHotels(hotelsData)

      const roomsData =
        selectedHotel === 'all'
          ? await roomsApi.search({})
          : await roomsApi.search({ hotel_id: Number(selectedHotel) })

      setRooms(roomsData)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHotel])

  const getHotelName = (hotelId: number) => {
    const hotel = hotels.find((h) => h.hotel_id === hotelId)
    return hotel ? getHotelDisplayName(hotel) : 'Unknown'
  }

  const filteredRooms = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return rooms.filter((room) => {
      if (!query) return true

      return (
        room.room_number.toLowerCase().includes(query) ||
        getHotelName(room.hotel_id).toLowerCase().includes(query)
      )
    })
  }, [rooms, searchTerm, hotels])

  const stats = useMemo(() => {
    return {
      total: filteredRooms.length,
      available: filteredRooms.filter((r) => !r.hasDamage).length,
      damaged: filteredRooms.filter((r) => r.hasDamage).length,
      averagePrice:
        filteredRooms.length > 0
          ? (
              filteredRooms.reduce((sum, r) => sum + Number(r.base_price), 0) /
              filteredRooms.length
            ).toFixed(0)
          : '0',
      byCapacity: {
        single: filteredRooms.filter((r) => r.capacity === 'single').length,
        double: filteredRooms.filter((r) => r.capacity === 'double').length,
        triple: filteredRooms.filter((r) => r.capacity === 'triple').length,
        quad: filteredRooms.filter((r) => r.capacity === 'quad').length,
      },
      byView: {
        sea: filteredRooms.filter((r) => r.view_type === 'sea').length,
        mountain: filteredRooms.filter((r) => r.view_type === 'mountain').length,
        city: filteredRooms.filter((r) => r.view_type === 'city').length,
      },
    }
  }, [filteredRooms])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }))
  }

  const addAmenity = () => {
    if (amenityInput && !formData.amenities.includes(amenityInput)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput],
      }))
      setAmenityInput('')
    }
  }

  const removeAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }))
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingRoom(null)
    setFormData({
      hotel_id: hotels[0] ? String(hotels[0].hotel_id) : '',
      room_number: '',
      base_price: '100',
      amenities: [],
      capacity: 'double',
      view_type: 'city',
      extendable: false,
      hasDamage: false,
      damageDescription: '',
    })
    setAmenityInput('')
  }

  const handleEdit = (room: ApiRoom) => {
    setEditingRoom(room)
    setFormData({
      hotel_id: String(room.hotel_id),
      room_number: room.room_number,
      base_price: String(room.base_price),
      amenities: room.amenities || [],
      capacity: room.capacity,
      view_type: room.view_type,
      extendable: room.extendable,
      hasDamage: !!room.hasDamage,
      damageDescription: room.damageDescription || '',
    })
    setShowForm(true)
  }

  const syncAmenities = async (
    hotelId: number,
    roomNumber: string,
    previousAmenities: string[],
    nextAmenities: string[]
  ) => {
    const toAdd = nextAmenities.filter((a) => !previousAmenities.includes(a))
    const toRemove = previousAmenities.filter((a) => !nextAmenities.includes(a))

    await Promise.all([
      ...toAdd.map((amenity) => roomsApi.addAmenity(hotelId, roomNumber, amenity)),
      ...toRemove.map((amenity) =>
        roomsApi.removeAmenity(hotelId, roomNumber, amenity)
      ),
    ])
  }

  const syncDamage = async (
    room: ApiRoom | null,
    hotelId: number,
    roomNumber: string,
    wantsDamage: boolean,
    damageDescription: string
  ) => {
    if (!room) {
      if (wantsDamage) {
        await roomsApi.reportProblem(
          hotelId,
          roomNumber,
          damageDescription.trim() || 'Under maintenance'
        )
      }
      return
    }

    const hadDamage = !!room.hasDamage

    if (!hadDamage && wantsDamage) {
      await roomsApi.reportProblem(
        hotelId,
        roomNumber,
        damageDescription.trim() || 'Under maintenance'
      )
      return
    }

    if (hadDamage && !wantsDamage) {
      if (!room.activeProblemId) {
        throw new Error(
          'Backend must expose activeProblemId to allow resolving maintenance from this page.'
        )
      }

      await roomsApi.resolveProblem(room.activeProblemId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.hotel_id ||
      !formData.room_number ||
      !formData.base_price ||
      !formData.capacity ||
      !formData.view_type
    ) {
      alert('Please fill in all required fields.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const payload = {
        hotel_id: Number(formData.hotel_id),
        room_number: formData.room_number.trim(),
        base_price: Number(formData.base_price),
        capacity: formData.capacity,
        view_type: formData.view_type,
        extendable: formData.extendable,
      }

      if (editingRoom) {
        await roomsApi.update(editingRoom.hotel_id, editingRoom.room_number, {
          base_price: payload.base_price,
          capacity: payload.capacity,
          view_type: payload.view_type,
          extendable: payload.extendable,
        })

        await syncAmenities(
          editingRoom.hotel_id,
          editingRoom.room_number,
          editingRoom.amenities || [],
          formData.amenities
        )

        await syncDamage(
          editingRoom,
          editingRoom.hotel_id,
          editingRoom.room_number,
          formData.hasDamage,
          formData.damageDescription
        )

        alert(`Room ${payload.room_number} updated successfully!`)
      } else {
        await roomsApi.create(payload)

        for (const amenity of formData.amenities) {
          await roomsApi.addAmenity(payload.hotel_id, payload.room_number, amenity)
        }

        await syncDamage(
          null,
          payload.hotel_id,
          payload.room_number,
          formData.hasDamage,
          formData.damageDescription
        )

        alert(`Room ${payload.room_number} created successfully!`)
      }

      resetForm()
      await loadPageData()
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || 'Failed to save room'
      setError(message)
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (room: ApiRoom) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    try {
      setError(null)
      await roomsApi.delete(room.hotel_id, room.room_number)
      alert('Room deleted successfully!')
      await loadPageData()
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to delete room'
      setError(message)
      alert(message)
    }
  }

  const handleToggleMaintenance = async (room: ApiRoom) => {
    try {
      setError(null)

      if (room.hasDamage) {
        if (!room.activeProblemId) {
          throw new Error(
            'Backend must expose activeProblemId to allow resolving maintenance from this page.'
          )
        }

        await roomsApi.resolveProblem(room.activeProblemId)
        alert(`Room ${room.room_number} marked as available`)
      } else {
        await roomsApi.reportProblem(
          room.hotel_id,
          room.room_number,
          room.damageDescription || 'Under maintenance'
        )
        alert(`Room ${room.room_number} marked as under maintenance`)
      }

      await loadPageData()
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to update maintenance status'
      setError(message)
      alert(message)
    }
  }

  const startPriceEdit = (room: ApiRoom) => {
    setEditingPriceKey(roomKey(room.hotel_id, room.room_number))
    setTempPrice(Number(room.base_price))
  }

  const cancelPriceEdit = () => {
    setEditingPriceKey(null)
    setTempPrice(0)
  }

  const savePriceEdit = async (room: ApiRoom) => {
    if (tempPrice <= 0) return

    try {
      setError(null)
      await roomsApi.update(room.hotel_id, room.room_number, {
        base_price: tempPrice,
      })
      alert(`Price updated to $${tempPrice}`)
      setEditingPriceKey(null)
      await loadPageData()
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to update price'
      setError(message)
      alert(message)
    }
  }

  const commonAmenities = [
    'TV',
    'AC',
    'WiFi',
    'Fridge',
    'Mini Bar',
    'Jacuzzi',
    'Ocean View',
    'Mountain View',
    'City View',
    'Balcony',
    'Work Desk',
    'Coffee Maker',
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-700">
          Loading rooms...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
        <button
          onClick={() => {
            setEditingRoom(null)
            setFormData({
              ...emptyForm,
              hotel_id: hotels[0] ? String(hotels[0].hotel_id) : '',
            })
            setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Add New Room
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

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

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Hotel
            </label>
            <select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Hotels ({hotels.length})</option>
              {hotels.map((hotel) => (
                <option key={hotel.hotel_id} value={hotel.hotel_id}>
                  {getHotelDisplayName(hotel)} (
                  {rooms.filter((r) => r.hotel_id === hotel.hotel_id).length} rooms)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Rooms
            </label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const hotel = hotels.find((h) => h.hotel_id === room.hotel_id)
          const isEditingPrice = editingPriceKey === roomKey(room.hotel_id, room.room_number)

          if (!hotel) return null

          return (
            <div
              key={roomKey(room.hotel_id, room.room_number)}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                room.hasDamage ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Room {room.room_number}
                      </h3>
                      {room.extendable && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Extendable
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{getHotelDisplayName(hotel)}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(hotel.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    {isEditingPrice ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-right font-bold"
                          min="0"
                        />
                        <button
                          onClick={() => savePriceEdit(room)}
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
                        <p className="text-2xl font-bold text-blue-600">${room.base_price}</p>
                        <p className="text-xs text-gray-500">/night (click to edit)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-24">Capacity:</span>
                    <span className="text-sm text-gray-600 capitalize">{room.capacity}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-24">View:</span>
                    <span className="text-sm text-gray-600 capitalize flex items-center gap-1">
                      {room.view_type === 'sea' && '🌊'}
                      {room.view_type === 'mountain' && '⛰️'}
                      {room.view_type === 'city' && '🏙️'}
                      {room.view_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-24">Hotel:</span>
                    <span className="text-sm text-gray-600">{getHotelDisplayName(hotel)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-24">Location:</span>
                    <span className="text-sm text-gray-600">{hotel.address}</span>
                  </div>

                  {room.hasDamage && room.damageDescription && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600 font-medium">Maintenance Note:</p>
                      <p className="text-xs text-red-700">{room.damageDescription}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {(room.amenities || []).slice(0, 4).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {(room.amenities || []).length > 4 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        +{(room.amenities || []).length - 4} more
                      </span>
                    )}
                  </div>
                </div>

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
                    onClick={() => handleDelete(room)}
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

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel *</label>
                  <select
                    name="hotel_id"
                    value={formData.hotel_id}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingRoom}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a hotel</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.hotel_id} value={hotel.hotel_id}>
                        {getHotelDisplayName(hotel)} ({hotel.rating}★)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleInputChange}
                      required
                      disabled={!!editingRoom}
                      placeholder="e.g., 101, 202A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Night ($) *
                    </label>
                    <input
                      type="number"
                      name="base_price"
                      value={formData.base_price}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity *
                    </label>
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
                      name="view_type"
                      value={formData.view_type}
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
                        name="extendable"
                        checked={formData.extendable}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Room is extendable</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <div className="flex gap-2 mb-3">
                    <select
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select an amenity...</option>
                      {commonAmenities
                        .filter((a) => !formData.amenities.includes(a))
                        .map((amenity) => (
                          <option key={amenity} value={amenity}>
                            {amenity}
                          </option>
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
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white border rounded-md text-sm"
                        >
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

                <div>
                  <label className="flex items-center cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      name="hasDamage"
                      checked={formData.hasDamage}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Room has damage/needs maintenance
                    </span>
                  </label>

                  {formData.hasDamage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Damage Description
                      </label>
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
                    disabled={submitting}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold disabled:opacity-60"
                  >
                    {submitting
                      ? 'Saving...'
                      : editingRoom
                      ? 'Update Room'
                      : 'Create Room'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
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