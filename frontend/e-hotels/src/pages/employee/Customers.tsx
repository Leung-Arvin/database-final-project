import { useEffect, useMemo, useState } from 'react'
import { customersApi } from '../../api/endpoints/customers'
import type { ApiCustomer } from '../../api/types/apiResponses'

interface EmployeeCustomersProps {
  customers?: unknown[]
  setCustomers?: React.Dispatch<React.SetStateAction<any[]>>
}

type CustomerFormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  idType: string
  idNumber: string
}

const emptyForm: CustomerFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  idType: 'DRIVING_LICENSE',
  idNumber: '',
}

function splitFullName(fullName: string) {
  const trimmed = fullName.trim()
  if (!trimmed) {
    return { firstName: '', lastName: '' }
  }

  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

export default function EmployeeCustomers(_props: EmployeeCustomersProps) {
  const [customers, setCustomers] = useState<ApiCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<ApiCustomer | null>(null)
  const [formData, setFormData] = useState<CustomerFormState>(emptyForm)

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await customersApi.getAll()
      setCustomers(data)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) return customers

    return customers.filter((customer) => {
      return (
        customer.full_name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.id_number.toLowerCase().includes(query)
      )
    })
  }, [customers, searchTerm])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingCustomer(null)
    setFormData(emptyForm)
  }

  const handleEdit = (customer: ApiCustomer) => {
    const { firstName, lastName } = splitFullName(customer.full_name)

    setEditingCustomer(customer)
    setFormData({
      firstName,
      lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      idType: customer.id_type,
      idNumber: customer.id_number,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const fullName = `${formData.firstName} ${formData.lastName}`.trim()

    if (!fullName || !formData.email || !formData.phone || !formData.address || !formData.idType || !formData.idNumber) {
      alert('Please fill in all required fields.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const payload = {
        full_name: fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        id_type: formData.idType,
        id_number: formData.idNumber,
      }

      if (editingCustomer) {
        await customersApi.update(editingCustomer.customer_id, payload)
        alert(`Customer ${fullName} updated successfully!`)
      } else {
        await customersApi.create(payload)
        alert(`Customer ${fullName} added successfully!`)
      }

      resetForm()
      await loadCustomers()
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to save customer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (customerId: number, customerName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete customer "${customerName}"?`
      )
    ) {
      return
    }

    try {
      setError(null)
      await customersApi.delete(customerId)
      alert(`Customer ${customerName} deleted successfully!`)
      await loadCustomers()
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete customer')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-700">
          Loading customers...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <button
          onClick={() => {
            setEditingCustomer(null)
            setFormData(emptyForm)
            setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Add New Customer
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers by name, email, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          Total Customers:{' '}
          <span className="font-bold">{filteredCustomers.length}</span>
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registered
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.customer_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {customer.customer_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {customer.full_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {customer.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {customer.phone}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {customer.id_type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {customer.id_number}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {customer.registration_date}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(customer.customer_id, customer.full_name)
                      }
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredCustomers.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-gray-500 text-sm"
                >
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Type
                  </label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="SIN">SIN</option>
                    <option value="SSN">SSN</option>
                    <option value="PASSPORT">Passport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number
                  </label>
                  <input
                    name="idNumber"
                    type="text"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving...'
                    : editingCustomer
                    ? 'Save Changes'
                    : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}