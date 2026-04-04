// src/pages/employee/CheckInOut.tsx
import { useState } from 'react'
import type { Booking, Customer, Hotel, Room, Renting } from '../../types'

interface EmployeeCheckInOutProps {
  bookings: Booking[]
  customers: Customer[]
  hotels: Hotel[]
  rooms: Room[]
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>
  setRentings: React.Dispatch<React.SetStateAction<Renting[]>>
}

export default function EmployeeCheckInOut({ 
  bookings, 
  customers, 
  hotels, 
  rooms, 
  setBookings,
  setRentings
}: EmployeeCheckInOutProps) {
  const [searchType, setSearchType] = useState<'bookingId' | 'customerName'>('bookingId')
  const [searchValue, setSearchValue] = useState('')
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null)
  const [actionType, setActionType] = useState<'checkin' | 'checkout' | 'directRent'>('checkin')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  
  // Direct rental form
  const [directRentForm, setDirectRentForm] = useState({
    customerId: '',
    roomId: '',
    startDate: '',
    endDate: '',
    paymentAmount: ''
  })
  
  const handleSearch = () => {
    let booking: Booking | undefined
    
    if (searchType === 'bookingId') {
      booking = bookings.find(b => b.id === parseInt(searchValue))
    } else {
      const customer = customers.find(c => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchValue.toLowerCase())
      )
      if (customer) {
        booking = bookings.find(b => b.customerId === customer.id && b.status === 'confirmed')
      }
    }
    
    setFoundBooking(booking || null)
    if (!booking) {
      alert('No booking found')
    }
  }
  
  const getCustomerDetails = (customerId: number) => {
    return customers.find(c => c.id === customerId)
  }
  
  const getHotelDetails = (hotelId: number) => {
    return hotels.find(h => h.id === hotelId)
  }
  
  const getRoomDetails = (roomId: number) => {
    return rooms.find(r => r.id === roomId)
  }
  
  const handleCheckIn = () => {
    if (foundBooking) {
      const updatedBookings = bookings.map(b => 
        b.id === foundBooking.id 
          ? { ...b, status: 'checked_in' as const }
          : b
      )
      setBookings(updatedBookings)
      
      // Create renting record
      const newRenting: Renting = {
        id: Date.now(),
        bookingId: foundBooking.id,
        customerId: foundBooking.customerId,
        roomId: foundBooking.roomId,
        hotelId: foundBooking.hotelId,
        startDate: foundBooking.startDate,
        endDate: foundBooking.endDate,
        totalPrice: foundBooking.totalPrice,
        paymentStatus: 'pending',
      }
      setRentings(prev => [...prev, newRenting])
      
      alert(`Guest checked in successfully! Payment will be collected at checkout.`)
      setFoundBooking(null)
      setSearchValue('')
    }
  }
  
  const handleCheckOut = () => {
    if (foundBooking && paymentAmount) {
      const updatedBookings = bookings.map(b => 
        b.id === foundBooking.id 
          ? { ...b, status: 'checked_out' as const }
          : b
      )
      setBookings(updatedBookings)
      
      // Update renting with payment
      setRentings(prev => prev.map(r => 
        r.bookingId === foundBooking.id
          ? { 
              ...r, 
              paymentStatus: 'paid', 
              paymentDate: new Date(),
              totalPrice: parseFloat(paymentAmount)
            }
          : r
      ))
      
      alert(`Checkout completed! Payment of $${paymentAmount} received via ${paymentMethod}.`)
      setFoundBooking(null)
      setSearchValue('')
      setPaymentAmount('')
    }
  }
  
  const handleDirectRent = (e: React.FormEvent) => {
    e.preventDefault()
    
    const nights = Math.ceil(
      (new Date(directRentForm.endDate).getTime() - new Date(directRentForm.startDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    )
    const room = rooms.find(r => r.id === parseInt(directRentForm.roomId))
    const totalPrice = (room?.price || 0) * nights
    
    const newRenting: Renting = {
      id: Date.now(),
      customerId: parseInt(directRentForm.customerId),
      roomId: parseInt(directRentForm.roomId),
      hotelId: room?.hotelId || 0,
      startDate: new Date(directRentForm.startDate),
      endDate: new Date(directRentForm.endDate),
      totalPrice: totalPrice,
      paymentStatus: 'paid',
      paymentDate: new Date()
    }
    
    setRentings(prev => [...prev, newRenting])
    alert(`Direct rental created! Payment of $${totalPrice} processed.`)
    
    setDirectRentForm({
      customerId: '',
      roomId: '',
      startDate: '',
      endDate: '',
      paymentAmount: ''
    })
    setActionType('checkin')
  }
  
  const todayBookings = bookings.filter(b => 
    b.status === 'confirmed' && 
    new Date(b.startDate).toDateString() === new Date().toDateString()
  )
  
  const todayCheckouts = bookings.filter(b => 
    b.status === 'checked_in' && 
    new Date(b.endDate).toDateString() === new Date().toDateString()
  )
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Check-In / Check-Out / Direct Rental</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setActionType('checkin')}
                className={`flex-1 py-2 rounded-md font-semibold transition-colors ${
                  actionType === 'checkin' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Check In (Booking)
              </button>
              <button
                onClick={() => setActionType('checkout')}
                className={`flex-1 py-2 rounded-md font-semibold transition-colors ${
                  actionType === 'checkout' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Check Out
              </button>
              <button
                onClick={() => setActionType('directRent')}
                className={`flex-1 py-2 rounded-md font-semibold transition-colors ${
                  actionType === 'directRent' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Direct Rental
              </button>
            </div>
            
            {(actionType === 'checkin' || actionType === 'checkout') && (
              <>
                <div className="mb-6">
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setSearchType('bookingId')}
                      className={`px-4 py-2 rounded-md text-sm ${
                        searchType === 'bookingId' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Search by Booking ID
                    </button>
                    <button
                      onClick={() => setSearchType('customerName')}
                      className={`px-4 py-2 rounded-md text-sm ${
                        searchType === 'customerName' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Search by Customer Name
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type={searchType === 'bookingId' ? 'number' : 'text'}
                      placeholder={searchType === 'bookingId' ? 'Enter Booking ID' : 'Enter Customer Name'}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Search
                    </button>
                  </div>
                </div>
                
                {foundBooking && (
                  <div className="border-t pt-6">
                    {(() => {
                      const customer = getCustomerDetails(foundBooking.customerId)
                      const hotel = getHotelDetails(foundBooking.hotelId)
                      const room = getRoomDetails(foundBooking.roomId)
                      const nights = Math.ceil((foundBooking.endDate.getTime() - foundBooking.startDate.getTime()) / (1000 * 60 * 60 * 24))
                      
                      return (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Customer</p>
                              <p className="font-medium">{customer?.firstName} {customer?.lastName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Booking ID</p>
                              <p className="font-medium">#{foundBooking.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Hotel</p>
                              <p className="font-medium">{hotel?.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Room</p>
                              <p className="font-medium">{room?.roomNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Dates</p>
                              <p className="font-medium">
                                {foundBooking.startDate.toLocaleDateString()} - {foundBooking.endDate.toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total</p>
                              <p className="font-bold text-green-600">${foundBooking.totalPrice}</p>
                            </div>
                          </div>
                          
                          {actionType === 'checkout' && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                              <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                              />
                              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                              <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="credit_card">Credit Card</option>
                                <option value="debit_card">Debit Card</option>
                                <option value="cash">Cash</option>
                                <option value="gift_card">Gift Card</option>
                              </select>
                            </div>
                          )}
                          
                          {actionType === 'checkin' && foundBooking.status === 'confirmed' && (
                            <button
                              onClick={handleCheckIn}
                              className="w-full mt-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
                            >
                              Confirm Check-In
                            </button>
                          )}
                          
                          {actionType === 'checkout' && foundBooking.status === 'checked_in' && (
                            <button
                              onClick={handleCheckOut}
                              disabled={!paymentAmount}
                              className={`w-full mt-4 py-3 rounded-md font-semibold ${
                                paymentAmount
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Process Check-Out & Payment
                            </button>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </>
            )}
            
            {actionType === 'directRent' && (
              <form onSubmit={handleDirectRent}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                    <select
                      required
                      value={directRentForm.customerId}
                      onChange={(e) => setDirectRentForm({...directRentForm, customerId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Customer</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room *</label>
                    <select
                      required
                      value={directRentForm.roomId}
                      onChange={(e) => setDirectRentForm({...directRentForm, roomId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Room</option>
                      {rooms.filter(r => !r.hasDamage).map(r => {
                        const hotel = hotels.find(h => h.id === r.hotelId)
                        return (
                          <option key={r.id} value={r.id}>
                            {hotel?.name} - Room {r.roomNumber} (${r.price}/night)
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date *</label>
                      <input
                        type="date"
                        required
                        value={directRentForm.startDate}
                        onChange={(e) => setDirectRentForm({...directRentForm, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date *</label>
                      <input
                        type="date"
                        required
                        value={directRentForm.endDate}
                        onChange={(e) => setDirectRentForm({...directRentForm, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                    <select
                      required
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-semibold"
                  >
                    Process Direct Rental & Payment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Today's Schedule */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📥</span> Today's Check-ins ({todayBookings.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayBookings.map(booking => {
                const customer = customers.find(c => c.id === booking.customerId)
                const room = rooms.find(r => r.id === booking.roomId)
                return (
                  <div key={booking.id} className="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100" onClick={() => {
                    setFoundBooking(booking)
                    setSearchValue(booking.id.toString())
                    setActionType('checkin')
                  }}>
                    <p className="font-medium text-gray-900">{customer?.firstName} {customer?.lastName}</p>
                    <p className="text-sm text-gray-600">Room {room?.roomNumber}</p>
                    <p className="text-xs text-gray-500">ID: #{booking.id}</p>
                  </div>
                )
              })}
              {todayBookings.length === 0 && (
                <p className="text-sm text-gray-500 text-center">No check-ins scheduled for today</p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📤</span> Today's Check-outs ({todayCheckouts.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayCheckouts.map(booking => {
                const customer = customers.find(c => c.id === booking.customerId)
                const room = rooms.find(r => r.id === booking.roomId)
                return (
                  <div key={booking.id} className="p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100" onClick={() => {
                    setFoundBooking(booking)
                    setSearchValue(booking.id.toString())
                    setActionType('checkout')
                  }}>
                    <p className="font-medium text-gray-900">{customer?.firstName} {customer?.lastName}</p>
                    <p className="text-sm text-gray-600">Room {room?.roomNumber}</p>
                    <p className="text-xs text-gray-500">ID: #{booking.id}</p>
                  </div>
                )
              })}
              {todayCheckouts.length === 0 && (
                <p className="text-sm text-gray-500 text-center">No check-outs scheduled for today</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}