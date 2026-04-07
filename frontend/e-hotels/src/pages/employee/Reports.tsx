import { useEffect, useMemo, useState } from 'react'
import {
  reportsApi,
  type AvailableRoomsPerAreaReportRow,
  type RoomCapacityByHotelReportRow,
  type HotelAboveAverageCapacityRow,
} from '../../api/endpoints/reports'

export default function EmployeeReports() {
  const [reportType, setReportType] = useState<
    'views' | 'capacity' | 'aboveAverage'
  >('views')

  const [availableRoomsPerArea, setAvailableRoomsPerArea] = useState<
    AvailableRoomsPerAreaReportRow[]
  >([])
  const [roomCapacityByHotel, setRoomCapacityByHotel] = useState<
    RoomCapacityByHotelReportRow[]
  >([])
  const [hotelsAboveAverageCapacity, setHotelsAboveAverageCapacity] = useState<
    HotelAboveAverageCapacityRow[]
  >([])

  const [selectedHotel, setSelectedHotel] = useState('')
  const [selectedHotelDetails, setSelectedHotelDetails] =
    useState<RoomCapacityByHotelReportRow | null>(null)

  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReports = async () => {
    try {
      setLoading(true)
      setError(null)

      const [availableRoomsData, roomCapacityData, aboveAverageData] =
        await Promise.all([
          reportsApi.getAvailableRoomsPerArea(),
          reportsApi.getRoomCapacityByHotel(),
          reportsApi.getHotelsAboveAverageCapacity(),
        ])

      setAvailableRoomsPerArea(availableRoomsData)
      setRoomCapacityByHotel(roomCapacityData)
      setHotelsAboveAverageCapacity(aboveAverageData)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  useEffect(() => {
    const loadHotelDetails = async () => {
      if (!selectedHotel) {
        setSelectedHotelDetails(null)
        return
      }

      try {
        setDetailsLoading(true)
        const hotelDetails = await reportsApi.getRoomCapacityByHotelId(
          Number(selectedHotel)
        )
        setSelectedHotelDetails(hotelDetails)
      } catch (err: any) {
        setError(
          err?.response?.data?.error || 'Failed to load selected hotel details'
        )
      } finally {
        setDetailsLoading(false)
      }
    }

    loadHotelDetails()
  }, [selectedHotel])

  const totalAvailableRooms = useMemo(() => {
    return availableRoomsPerArea.reduce(
      (sum, row) => sum + row.available_rooms,
      0
    )
  }, [availableRoomsPerArea])

  const totalHotelsInCapacityView = roomCapacityByHotel.length

  const totalCapacityAcrossHotels = useMemo(() => {
    return roomCapacityByHotel.reduce((sum, row) => sum + row.total_capacity, 0)
  }, [roomCapacityByHotel])

  const totalRoomsAcrossHotels = useMemo(() => {
    return roomCapacityByHotel.reduce((sum, row) => sum + row.total_rooms, 0)
  }, [roomCapacityByHotel])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-700">
          Loading reports...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Reports & Analytics
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

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
            Available Rooms per Area
          </button>
          <button
            onClick={() => setReportType('capacity')}
            className={`px-6 py-2 rounded-md font-semibold ${
              reportType === 'capacity'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Room Capacity by Hotel
          </button>
          <button
            onClick={() => setReportType('aboveAverage')}
            className={`px-6 py-2 rounded-md font-semibold ${
              reportType === 'aboveAverage'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hotels Above Average Capacity
          </button>
        </div>
      </div>

      {reportType === 'views' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Areas Reported</p>
              <p className="text-3xl font-bold text-blue-600">
                {availableRoomsPerArea.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Total Available Rooms</p>
              <p className="text-3xl font-bold text-green-600">
                {totalAvailableRooms}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Available Rooms per Area
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Backend report from <code>/reports/available-rooms-per-area</code>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availableRoomsPerArea.map((row) => (
                <div
                  key={row.area}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {row.area}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Geographical area
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {row.available_rooms}
                      </p>
                      <p className="text-xs text-gray-500">available rooms</p>
                    </div>
                  </div>
                </div>
              ))}

              {availableRoomsPerArea.length === 0 && (
                <div className="lg:col-span-2 bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  No report data found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {reportType === 'capacity' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Hotels in Report</p>
              <p className="text-3xl font-bold text-blue-600">
                {totalHotelsInCapacityView}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Total Rooms</p>
              <p className="text-3xl font-bold text-green-600">
                {totalRoomsAcrossHotels}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Total Capacity</p>
              <p className="text-3xl font-bold text-purple-600">
                {totalCapacityAcrossHotels}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Room Capacity by Hotel
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Backend report from <code>/reports/room-capacity-by-hotel</code>
              </p>
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
                {roomCapacityByHotel.map((hotel) => (
                  <option key={hotel.hotel_id} value={hotel.hotel_id}>
                    {hotel.chain_name} - {hotel.area}
                  </option>
                ))}
              </select>
            </div>

            {detailsLoading && (
              <div className="mb-6 bg-gray-50 rounded-lg p-4 text-gray-600">
                Loading selected hotel details...
              </div>
            )}

            {selectedHotelDetails && !detailsLoading && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🏨</span>
                  {selectedHotelDetails.chain_name} - {selectedHotelDetails.area}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">Hotel ID</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedHotelDetails.hotel_id}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">Total Rooms</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedHotelDetails.total_rooms}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">Total Capacity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedHotelDetails.total_capacity}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-sm font-bold text-gray-900 break-words">
                      {selectedHotelDetails.address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hotel ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Chain Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Rooms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Capacity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roomCapacityByHotel.map((hotel) => (
                    <tr
                      key={hotel.hotel_id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedHotel(hotel.hotel_id.toString())}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {hotel.hotel_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {hotel.chain_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {hotel.area}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {hotel.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {hotel.total_rooms}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                        {hotel.total_capacity}
                      </td>
                    </tr>
                  ))}

                  {roomCapacityByHotel.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-500 text-sm"
                      >
                        No room capacity report data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'aboveAverage' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Hotels Above Average</p>
              <p className="text-3xl font-bold text-blue-600">
                {hotelsAboveAverageCapacity.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Combined Capacity</p>
              <p className="text-3xl font-bold text-green-600">
                {hotelsAboveAverageCapacity.reduce(
                  (sum, hotel) => sum + hotel.total_capacity,
                  0
                )}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Hotels Above Average Capacity
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Backend report from{' '}
                <code>/reports/hotels-above-average-capacity</code>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hotelsAboveAverageCapacity.map((hotel) => (
                <div
                  key={hotel.hotel_id}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {hotel.chain_name} - {hotel.area}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 break-words">
                        {hotel.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {hotel.total_capacity}
                      </p>
                      <p className="text-xs text-gray-500">capacity</p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700">
                    <p>Total rooms: {hotel.total_rooms}</p>
                    <p>Hotel ID: {hotel.hotel_id}</p>
                  </div>
                </div>
              ))}

              {hotelsAboveAverageCapacity.length === 0 && (
                <div className="lg:col-span-2 bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  No above-average-capacity hotels found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}