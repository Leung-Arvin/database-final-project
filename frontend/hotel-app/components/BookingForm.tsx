// components/BookingForm.tsx
'use client'

import { useState } from 'react'
import { Room, Hotel, Customer } from '../types'

interface BookingFormProps {
  room: Room
  hotel: Hotel
  onClose: () => void
  filters: {
    startDate: string
    endDate: string
    capacity: string
    area: string
    hotelChain: string
    category: string
    minPrice: string
    maxPrice: string
  }
  customers: Customer[]
}

export default function BookingForm({ room, hotel, onClose, filters, customers }: BookingFormProps) {
  const [formData, setFormData] = useState({
    customerId: '',
    startDate: filters.startDate,
    endDate: filters.endDate
  })
  
  const [bookingSuccess, setBookingSuccess] = useState(false)
  
  const calculateNights = () => {
    if (!formData.startDate || !formData.endDate) return 0
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
  
  const nights = calculateNights()
  const totalPrice = nights * room.price
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would save to database here
    console.log('Booking submitted:', {
      ...formData,
      roomId: room.id,
      hotelId: hotel.id,
      totalPrice,
      bookingDate: new Date()
    })
    setBookingSuccess(true)
    setTimeout(() => {
      setBookingSuccess(false)
      onClose()
    }, 2000)
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Booking</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          {bookingSuccess ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600">Your booking has been successfully created.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
                <p className="text-sm text-gray-600">Hotel: {hotel.name}</p>
                <p className="text-sm text-gray-600">Room: {room.roomNumber} - {room.capacity}</p>
                <p className="text-sm text-gray-600">Price: ${room.price}/night</p>
                <p className="text-sm text-gray-600">Nights: {nights}</p>
                <p className="text-lg font-bold text-blue-600 mt-2">Total: ${totalPrice}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer
                </label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}