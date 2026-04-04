// app/views/page.tsx
'use client'

import { useState } from 'react'
import { hotels, rooms } from '../../../lib/data'

export default function ViewsPage() {
  const [selectedHotel, setSelectedHotel] = useState('')
  
  // View 1: Available rooms per area
  const getAvailableRoomsPerArea = () => {
    const areaMap = new Map()
    
    hotels.forEach(hotel => {
      const area = `${hotel.city}, ${hotel.state}`
      const hotelRooms = rooms.filter(r => r.hotelId === hotel.id)
      // Simulating available rooms (in real app, would check bookings)
      const availableRooms = hotelRooms.filter(r => !r.hasDamage).length
      
      areaMap.set(area, (areaMap.get(area) || 0) + availableRooms)
    })
    
    return Array.from(areaMap.entries()).map(([area, count]) => ({
      area,
      availableRooms: count
    }))
  }
  
  // View 2: Aggregated capacity per hotel
  const getAggregatedCapacity = () => {
    const capacityMap = new Map()
    
    hotels.forEach(hotel => {
      const hotelRooms = rooms.filter(r => r.hotelId === hotel.id)
      const totalCapacity = hotelRooms.reduce((sum, room) => {
        switch(room.capacity) {
          case 'single': return sum + 1
          case 'double': return sum + 2
          case 'triple': return sum + 3
          case 'quad': return sum + 4
          default: return sum
        }
      }, 0)
      
      capacityMap.set(hotel.id, {
        hotelName: hotel.name,
        totalRooms: hotelRooms.length,
        totalCapacity,
        averageCapacity: totalCapacity > 0 ? (totalCapacity / hotelRooms.length).toFixed(1) : '0'
      })
    })
    
    return Array.from(capacityMap.entries()).map(([id, data]) => ({
      id,
      ...data
    }))
  }
  
  const availableRoomsData = getAvailableRoomsPerArea()
  const aggregatedCapacityData = getAggregatedCapacity()
  const selectedHotelData = selectedHotel 
    ? aggregatedCapacityData.find(d => d.id === parseInt(selectedHotel))
    : null
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Views</h1>
      
      {/* View 1: Available Rooms per Area */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          View 1: Available Rooms per Area
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Shows the total number of available rooms (rooms without damages) in each area.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableRoomsData.map((data) => (
            <div key={data.area} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">{data.area}</h3>
              <p className="text-2xl font-bold text-blue-600">{data.availableRooms}</p>
              <p className="text-sm text-gray-600">Available Rooms</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* View 2: Aggregated Capacity per Hotel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          View 2: Aggregated Capacity per Hotel
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Shows the total capacity (total guests that can be accommodated) for each hotel.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select a Hotel to View Details
          </label>
          <select
            value={selectedHotel}
            onChange={(e) => setSelectedHotel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a hotel...</option>
            {aggregatedCapacityData.map(hotel => (
              <option key={hotel.id} value={hotel.id}>{hotel.hotelName}</option>
            ))}
          </select>
        </div>
        
        {selectedHotelData && (
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedHotelData.hotelName}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{selectedHotelData.totalRooms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-900">{selectedHotelData.totalCapacity}</p>
                <p className="text-xs text-gray-500">Maximum guests</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Capacity per Room</p>
                <p className="text-2xl font-bold text-gray-900">{selectedHotelData.averageCapacity}</p>
                <p className="text-xs text-gray-500">Guests per room</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Rooms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Capacity/Room
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aggregatedCapacityData.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {hotel.hotelName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {hotel.totalRooms}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {hotel.totalCapacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {hotel.averageCapacity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}