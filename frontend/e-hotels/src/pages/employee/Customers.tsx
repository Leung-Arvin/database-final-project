// src/pages/employee/Customers.tsx
import { useState } from 'react'
import type { Customer } from '../../types'

interface EmployeeCustomersProps {
  customers: Customer[]
}

export default function EmployeeCustomers({ customers }: EmployeeCustomersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  const filteredCustomers = customers.filter(customer => 
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Customer Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <input
          type="text"
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member Since</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{customer.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{customer.firstName} {customer.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{customer.email}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{customer.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{customer.registrationDate.toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3">
              <p><strong>Name:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
              <p><strong>Email:</strong> {selectedCustomer.email}</p>
              <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
              <p><strong>Address:</strong> {selectedCustomer.address}</p>
              <p><strong>ID Type:</strong> {selectedCustomer.idType.replace('_', ' ')}</p>
              <p><strong>ID Number:</strong> {selectedCustomer.idNumber}</p>
              <p><strong>Member Since:</strong> {selectedCustomer.registrationDate.toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}