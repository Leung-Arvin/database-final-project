// src/pages/employee/Staff.tsx
import { useState } from 'react'
import type { Employee, Hotel } from '../../types'

interface EmployeeStaffProps {
  employees: Employee[]
  hotels: Hotel[]
}

export default function EmployeeStaff({ employees, hotels }: EmployeeStaffProps) {
  const [selectedHotel, setSelectedHotel] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredEmployees = employees.filter(employee => {
    const hotelMatch = selectedHotel === 'all' || employee.hotelId === parseInt(selectedHotel)
    const searchMatch = searchTerm === '' || 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase())
    return hotelMatch && searchMatch
  })
  
  const getHotelName = (hotelId: number) => {
    const hotel = hotels.find(h => h.id === hotelId)
    return hotel ? hotel.name : 'Unknown'
  }
  
  const managers = filteredEmployees.filter(e => e.isManager)
  const staff = filteredEmployees.filter(e => !e.isManager)
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Add New Employee
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-3xl font-bold text-gray-900">{filteredEmployees.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Managers</p>
          <p className="text-3xl font-bold text-blue-600">{managers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Staff</p>
          <p className="text-3xl font-bold text-green-600">{staff.length}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Hotel</label>
            <select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Hotels</option>
              {hotels.map(hotel => (
                <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{employee.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{employee.firstName} {employee.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{employee.email}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{employee.role}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{getHotelName(employee.hotelId)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.isManager ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {employee.isManager ? 'Manager' : 'Staff'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}