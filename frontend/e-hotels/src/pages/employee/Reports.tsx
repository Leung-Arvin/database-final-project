// src/pages/employee/Reports.tsx (with View 1 and View 2 from requirement 2f)
import { useState } from 'react'
import type { Hotel, Room, Booking, Customer, Renting } from '../../types'

interface EmployeeReportsProps {
  hotels: Hotel[]
  rooms: Room[]
  bookings: Booking[]
  customers: Customer[]
  rentings: Renting[]
}

export default function EmployeeReports({ hotels, rooms, bookings, customers, rentings }: EmployeeReportsProps) {
  const [reportType, setReportType] = useState<'views' | 'occupancy' | 'revenue' | 'customers'>('views')
  
  // VIEW 1: Number of available rooms per area (from requirement 2f)
  const getAvailableRoomsPerArea = () => {
    const areaMap = new Map<string, { total: number; available: number; hotels: string[] }>()
    
    hotels.forEach(hotel => {
      const area = `${hotel.city}, ${hotel.state}`
      const hotelRooms = rooms.filter(r => r.hotelId === hotel.id)
      // Available rooms are those without damage (simplified - in real app would check bookings)
      const availableRooms = hotelRooms.filter(r => !r.hasDamage).length
      
      if (!areaMap.has(area)) {
        areaMap.set(area, { total: 0, available: 0, hotels: [] })
      }
      const data = areaMap.get(area)!
      data.total += hotelRooms.length
      data.available += availableRooms
      data.hotels.push(hotel.name)
    })
    
    return Array.from(areaMap.entries()).map(([area, data]) => ({
      area,
      totalRooms: data.total,
      availableRooms: data.available,
      occupancyRate: ((data.total - data.available) / data.total * 100).toFixed(1),
      hotels: data.hotels
    }))
  }
  
  // VIEW 2: Aggregated capacity of all rooms of a specific hotel (from requirement 2f)
  const getAggregatedCapacity = (hotelId?: number) => {
    const targetHotels = hotelId ? hotels.filter(h => h.id === hotelId) : hotels
    
    return targetHotels.map(hotel => {
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
      
      const capacityByType = {
        single: hotelRooms.filter(r => r.capacity === 'single').length,
        double: hotelRooms.filter(r => r.capacity === 'double').length,
        triple: hotelRooms.filter(r => r.capacity === 'triple').length,
        quad: hotelRooms.filter(r => r.capacity === 'quad').length
      }
      
      return {
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelCategory: hotel.category,
        totalRooms: hotelRooms.length,
        totalCapacity,
        averageCapacity: hotelRooms.length > 0 ? (totalCapacity / hotelRooms.length).toFixed(1) : '0',
        capacityByType,
        priceRange: {
          min: Math.min(...hotelRooms.map(r => r.price), 0),
          max: Math.max(...hotelRooms.map(r => r.price), 0)
        }
      }
    })
  }
  
  const availableRoomsData = getAvailableRoomsPerArea()
  const aggregatedCapacityData = getAggregatedCapacity()
  const [selectedHotel, setSelectedHotel] = useState('')
  const selectedHotelData = selectedHotel ? getAggregatedCapacity(parseInt(selectedHotel))[0] : null
  
  // Additional metrics
  const totalRevenue = rentings.reduce((sum, r) => sum + r.totalPrice, 0)
  const completedRentals = rentings.filter(r => r.paymentStatus === 'paid').length
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>
      
      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setReportType('views')}
            className={`px-6 py-2 rounded-md font-semibold ${
              reportType === 'views' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            SQL Views (Required)
          </button>
          <button
            onClick={() => setReportType('occupancy')}
            className={`px-6 py-2 rounded-md font-semibold ${
              reportType === 'occupancy' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Occupancy Report
          </button>
          <button
            onClick={() => setReportType('revenue')}
            className={`px-6 py-2 rounded-md font-semibold ${
              reportType === 'revenue' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Revenue Report
          </button>
          <button
            onClick={() => setReportType('customers')}
            className={`px-6 py-2 rounded-md font-semibold ${
              reportType === 'customers' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Customer Insights
          </button>
        </div>
      </div>
      
      {/* SQL VIEWS - Requirement 2f */}
      {reportType === 'views' && (
        <div className="space-y-8">
          {/* View 1: Available rooms per area */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">View 1: Available Rooms per Area</h2>
              <p className="text-sm text-gray-500 mt-1">SQL View showing room availability grouped by geographical area</p>
              <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                {`CREATE VIEW available_rooms_per_area AS
SELECT 
    CONCAT(h.city, ', ', h.state) as area,
    COUNT(r.id) as total_rooms,
    SUM(CASE WHEN r.has_damage = false THEN 1 ELSE 0 END) as available_rooms,
    ROUND((SUM(CASE WHEN r.has_damage = false THEN 1 ELSE 0 END) / COUNT(r.id)) * 100, 1) as occupancy_rate
FROM hotels h
JOIN rooms r ON h.id = r.hotel_id
GROUP BY area;`}
              </pre>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availableRoomsData.map((data) => (
                <div key={data.area} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{data.area}</h3>
                      <p className="text-xs text-gray-500 mt-1">{data.hotels.length} hotels</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{data.availableRooms}</p>
                      <p className="text-xs text-gray-500">available</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Occupancy Rate</span>
                      <span>{data.occupancyRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 rounded-full h-2 transition-all"
                        style={{ width: `${data.occupancyRate}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p>Total rooms: {data.totalRooms} | Available: {data.availableRooms}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* View 2: Aggregated capacity per hotel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">View 2: Aggregated Capacity per Hotel</h2>
              <p className="text-sm text-gray-500 mt-1">SQL View showing total guest capacity for each hotel</p>
              <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                {`CREATE VIEW hotel_capacity AS
SELECT 
    h.id as hotel_id,
    h.name as hotel_name,
    COUNT(r.id) as total_rooms,
    SUM(
        CASE r.capacity
            WHEN 'single' THEN 1
            WHEN 'double' THEN 2
            WHEN 'triple' THEN 3
            WHEN 'quad' THEN 4
        END
    ) as total_capacity,
    ROUND(AVG(
        CASE r.capacity
            WHEN 'single' THEN 1
            WHEN 'double' THEN 2
            WHEN 'triple' THEN 3
            WHEN 'quad' THEN 4
        END
    ), 1) as avg_capacity_per_room
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id
GROUP BY h.id, h.name;`}
              </pre>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a Hotel to View Details
              </label>
              <select
                value={selectedHotel}
                onChange={(e) => setSelectedHotel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Hotels</option>
                {aggregatedCapacityData.map(hotel => (
                  <option key={hotel.hotelId} value={hotel.hotelId}>{hotel.hotelName}</option>
                ))}
              </select>
            </div>
            
            {selectedHotelData && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🏨</span>
                  {selectedHotelData.hotelName}
                  <span className="text-sm bg-yellow-400 text-yellow-900 px-2 py-1 rounded">
                    {selectedHotelData.hotelCategory} Star
                  </span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">Total Rooms</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedHotelData.totalRooms}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">Total Capacity</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedHotelData.totalCapacity}</p>
                    <p className="text-xs text-gray-500">Maximum guests</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">Avg Capacity/Room</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedHotelData.averageCapacity}</p>
                    <p className="text-xs text-gray-500">Guests per room</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">Price Range</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${selectedHotelData.priceRange.min} - ${selectedHotelData.priceRange.max}
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Room Type Distribution</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Single</p>
                      <p className="text-lg font-bold text-blue-600">{selectedHotelData.capacityByType.single}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Double</p>
                      <p className="text-lg font-bold text-green-600">{selectedHotelData.capacityByType.double}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Triple</p>
                      <p className="text-lg font-bold text-orange-600">{selectedHotelData.capacityByType.triple}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Quad</p>
                      <p className="text-lg font-bold text-purple-600">{selectedHotelData.capacityByType.quad}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Rooms</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Capacity/Room</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aggregatedCapacityData.map((hotel) => (
                    <tr key={hotel.hotelId} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedHotel(hotel.hotelId.toString())}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hotel.hotelName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          {hotel.hotelCategory} Star
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{hotel.totalRooms}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{hotel.totalCapacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{hotel.averageCapacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Other report types - keep existing implementation */}
      {reportType === 'occupancy' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Occupancy Report</h2>
          <p className="text-gray-600">Occupancy statistics coming soon...</p>
        </div>
      )}
      
      {reportType === 'revenue' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Completed Rentals</p>
              <p className="text-3xl font-bold text-blue-600">{completedRentals}</p>
            </div>
          </div>
        </div>
      )}
      
      {reportType === 'customers' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-purple-600">{customers.length}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600">Average Spend</p>
              <p className="text-3xl font-bold text-indigo-600">
                ${(totalRevenue / customers.length).toFixed(0)}
              </p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-gray-600">Repeat Customers</p>
              <p className="text-3xl font-bold text-pink-600">
                {customers.filter(c => rentings.filter(r => r.customerId === c.id).length > 1).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}