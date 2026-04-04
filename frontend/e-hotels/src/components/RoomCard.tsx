// src/components/RoomCard.tsx
import type { Room, Hotel } from '../types'

interface RoomCardProps {
  room: Room
  hotel: Hotel
  onBook: () => void
}

export default function RoomCard({ room, hotel, onBook }: RoomCardProps) {
  const getViewIcon = (view: string) => {
    switch(view) {
      case 'sea': return '🌊'
      case 'mountain': return '⛰️'
      default: return '🏙️'
    }
  }
  
  const getCapacityText = (capacity: string) => {
    switch(capacity) {
      case 'single': return 'Single Bed'
      case 'double': return 'Double Bed'
      case 'triple': return 'Triple Room'
      case 'quad': return 'Quad Room'
      default: return capacity
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Room {room.roomNumber}
            </h3>
            <p className="text-sm text-gray-600">{hotel.name}</p>
            <p className="text-xs text-gray-500">{hotel.city}, {hotel.state}</p>
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">${room.price}</span>
            <span className="text-sm text-gray-600">/night</span>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getViewIcon(room.view)}</span>
            <span className="text-sm text-gray-700 capitalize">{room.view} view</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Capacity:</span>
            <span className="text-sm text-gray-600">{getCapacityText(room.capacity)}</span>
          </div>
          
          {room.isExtendable && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600">✓ Extendable</span>
            </div>
          )}
          
          {room.hasDamage && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">⚠️ Minor damages reported</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Amenities:</p>
          <div className="flex flex-wrap gap-2">
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
        
        <button
          onClick={onBook}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  )
}