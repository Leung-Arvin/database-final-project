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
  
  // Payment details for check-in
  const [checkinPayment, setCheckinPayment] = useState({
    amount: '',
    method: 'credit_card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardholderName: ''
  })
  
  // Direct rental form
  const [directRentForm, setDirectRentForm] = useState({
    customerId: '',
    roomId: '',
    startDate: '',
    endDate: '',
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardholderName: ''
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
      alert('No confirmed booking found')
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
  
  const handleCheckInWithPayment = () => {
    if (foundBooking && checkinPayment.amount) {
      const nights = Math.ceil((foundBooking.endDate.getTime() - foundBooking.startDate.getTime()) / (1000 * 60 * 60 * 24))
      const expectedTotal = foundBooking.totalPrice
      const paidAmount = parseFloat(checkinPayment.amount)
      
      if (paidAmount < expectedTotal) {
        if (!confirm(`Payment amount $${paidAmount} is less than the total $${expectedTotal}. The customer will need to pay the remaining $${expectedTotal - paidAmount} at checkout. Continue?`)) {
          return
        }
      }
      
      // Update booking status
      const updatedBookings = bookings.map(b => 
        b.id === foundBooking.id 
          ? { ...b, status: 'checked_in' as const }
          : b
      )
      setBookings(updatedBookings)
      
      // Create renting record with payment info
      const newRenting: Renting = {
        id: Date.now(),
        bookingId: foundBooking.id,
        customerId: foundBooking.customerId,
        roomId: foundBooking.roomId,
        hotelId: foundBooking.hotelId,
        startDate: foundBooking.startDate,
        endDate: foundBooking.endDate,
        totalPrice: expectedTotal,
        amountPaid: paidAmount,
        remainingBalance: expectedTotal - paidAmount,
        paymentStatus: paidAmount >= expectedTotal ? 'paid' : 'partial',
        paymentMethod: checkinPayment.method,
        paymentDate: new Date(),
        paymentDetails: {
          cardLast4: checkinPayment.cardNumber ? checkinPayment.cardNumber.slice(-4) : undefined,
          cardholderName: checkinPayment.cardholderName
        }
      }
      setRentings(prev => [...prev, newRenting])
      
      alert(`Check-in completed! ${paidAmount >= expectedTotal ? 'Full payment' : `Partial payment of $${paidAmount}`} received. Remaining balance: $${expectedTotal - paidAmount}`)
      
      // Reset form
      setFoundBooking(null)
      setSearchValue('')
      setCheckinPayment({
        amount: '',
        method: 'credit_card',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cardholderName: ''
      })
    } else {
      alert('Please enter payment amount')
    }
  }
  
  const handleCheckOut = () => {
    if (foundBooking && paymentAmount) {
      // Find the renting record
      const renting = rentings.find(r => r.bookingId === foundBooking.id)
      const remainingBalance = renting?.remainingBalance || foundBooking.totalPrice
      const paidAmount = parseFloat(paymentAmount)
      
      if (paidAmount < remainingBalance) {
        alert(`Error: Payment amount $${paidAmount} is less than remaining balance $${remainingBalance}`)
        return
      }
      
      const updatedBookings = bookings.map(b => 
        b.id === foundBooking.id 
          ? { ...b, status: 'checked_out' as const }
          : b
      )
      setBookings(updatedBookings)
      
      // Update renting with final payment
      setRentings(prev => prev.map(r => 
        r.bookingId === foundBooking.id
          ? { 
              ...r, 
              paymentStatus: 'paid', 
              paymentDate: new Date(),
              totalPaid: (r.amountPaid || 0) + paidAmount,
              remainingBalance: 0
            }
          : r
      ))
      
      alert(`Checkout completed! Final payment of $${paymentAmount} received via ${paymentMethod}.`)
      setFoundBooking(null)
      setSearchValue('')
      setPaymentAmount('')
    } else {
      alert('Please enter payment amount')
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
    
    if (nights <= 0) {
      alert('Invalid date range')
      return
    }
    
    const newRenting: Renting = {
      id: Date.now(),
      customerId: parseInt(directRentForm.customerId),
      roomId: parseInt(directRentForm.roomId),
      hotelId: room?.hotelId || 0,
      startDate: new Date(directRentForm.startDate),
      endDate: new Date(directRentForm.endDate),
      totalPrice: totalPrice,
      amountPaid: totalPrice,
      remainingBalance: 0,
      paymentStatus: 'paid',
      paymentMethod: directRentForm.paymentMethod,
      paymentDate: new Date(),
      paymentDetails: {
        cardLast4: directRentForm.cardNumber ? directRentForm.cardNumber.slice(-4) : undefined,
        cardholderName: directRentForm.cardholderName
      }
    }
    
    setRentings(prev => [...prev, newRenting])
    alert(`Direct rental created! Full payment of $${totalPrice} processed.`)
    
    setDirectRentForm({
      customerId: '',
      roomId: '',
      startDate: '',
      endDate: '',
      paymentMethod: 'credit_card',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardholderName: ''
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
  
  // Helper to format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(' ') : cleaned
  }
  
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
                              <p className="text-sm text-gray-600">Total Amount</p>
                              <p className="font-bold text-green-600">${foundBooking.totalPrice}</p>
                            </div>
                          </div>
                          
                          {actionType === 'checkin' && foundBooking.status === 'confirmed' && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                              <h4 className="font-semibold text-gray-900 mb-3">Payment Collection (Check-in)</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
                                  <input
                                    type="number"
                                    value={checkinPayment.amount}
                                    onChange={(e) => setCheckinPayment({...checkinPayment, amount: e.target.value})}
                                    placeholder={`Enter amount (Total: $${foundBooking.totalPrice})`}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Can accept full or partial payment. Remaining balance will be collected at checkout.
                                  </p>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                  <select
                                    value={checkinPayment.method}
                                    onChange={(e) => setCheckinPayment({...checkinPayment, method: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  >
                                    <option value="credit_card">Credit Card</option>
                                    <option value="debit_card">Debit Card</option>
                                    <option value="cash">Cash</option>
                                    <option value="gift_card">Gift Card</option>
                                  </select>
                                </div>
                                
                                {(checkinPayment.method === 'credit_card' || checkinPayment.method === 'debit_card') && (
                                  <div className="space-y-3 border-t pt-3 mt-2">
                                    <h5 className="text-sm font-medium text-gray-700">Card Details</h5>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Card Number</label>
                                      <input
                                        type="text"
                                        value={checkinPayment.cardNumber}
                                        onChange={(e) => setCheckinPayment({...checkinPayment, cardNumber: e.target.value})}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength={19}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Expiry Date</label>
                                        <input
                                          type="text"
                                          value={checkinPayment.cardExpiry}
                                          onChange={(e) => setCheckinPayment({...checkinPayment, cardExpiry: e.target.value})}
                                          placeholder="MM/YY"
                                          maxLength={5}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">CVV</label>
                                        <input
                                          type="text"
                                          value={checkinPayment.cardCvv}
                                          onChange={(e) => setCheckinPayment({...checkinPayment, cardCvv: e.target.value})}
                                          placeholder="123"
                                          maxLength={4}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Cardholder Name</label>
                                      <input
                                        type="text"
                                        value={checkinPayment.cardholderName}
                                        onChange={(e) => setCheckinPayment({...checkinPayment, cardholderName: e.target.value})}
                                        placeholder="Name on card"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                <button
                                  onClick={handleCheckInWithPayment}
                                  disabled={!checkinPayment.amount}
                                  className={`w-full mt-4 py-3 rounded-md font-semibold ${
                                    checkinPayment.amount
                                      ? 'bg-green-600 text-white hover:bg-green-700'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  Process Check-In & Payment
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {actionType === 'checkout' && foundBooking.status === 'checked_in' && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Final Payment Amount</label>
                              <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="Enter remaining balance"
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
                              <button
                                onClick={handleCheckOut}
                                disabled={!paymentAmount}
                                className={`w-full mt-4 py-3 rounded-md font-semibold ${
                                  paymentAmount
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                Process Check-Out & Final Payment
                              </button>
                            </div>
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
                      value={directRentForm.paymentMethod}
                      onChange={(e) => setDirectRentForm({...directRentForm, paymentMethod: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  
                  {(directRentForm.paymentMethod === 'credit_card' || directRentForm.paymentMethod === 'debit_card') && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700">Card Details</h4>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={directRentForm.cardNumber}
                          onChange={(e) => setDirectRentForm({...directRentForm, cardNumber: e.target.value})}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={directRentForm.cardExpiry}
                            onChange={(e) => setDirectRentForm({...directRentForm, cardExpiry: e.target.value})}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">CVV</label>
                          <input
                            type="text"
                            value={directRentForm.cardCvv}
                            onChange={(e) => setDirectRentForm({...directRentForm, cardCvv: e.target.value})}
                            placeholder="123"
                            maxLength={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={directRentForm.cardholderName}
                          onChange={(e) => setDirectRentForm({...directRentForm, cardholderName: e.target.value})}
                          placeholder="Name on card"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                  )}
                  
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
                    <p className="text-xs text-gray-500">Total: ${booking.totalPrice}</p>
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
                const renting = rentings.find(r => r.bookingId === booking.id)
                const remainingBalance = renting?.remainingBalance || booking.totalPrice
                return (
                  <div key={booking.id} className="p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100" onClick={() => {
                    setFoundBooking(booking)
                    setSearchValue(booking.id.toString())
                    setActionType('checkout')
                  }}>
                    <p className="font-medium text-gray-900">{customer?.firstName} {customer?.lastName}</p>
                    <p className="text-sm text-gray-600">Room {room?.roomNumber}</p>
                    <p className="text-xs text-red-600">Remaining: ${remainingBalance}</p>
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