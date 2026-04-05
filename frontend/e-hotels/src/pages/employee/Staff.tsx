import { useEffect, useMemo, useState } from 'react'
import { employeesApi } from '../../api/endpoints/employees'
import { hotelsApi } from '../../api/endpoints/hotels'
import type { ApiEmployee, ApiHotel } from '../../api/types/apiResponses'

type EmployeeFormState = {
  firstName: string
  lastName: string
  email: string
  address: string
  phone: string
  ssnSin: string
  hotelId: string
  role: string
  isManager: boolean
}

const emptyForm: EmployeeFormState = {
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  phone: '',
  ssnSin: '',
  hotelId: '',
  role: '',
  isManager: false,
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

function getHotelDisplayName(hotel: ApiHotel) {
  return `${hotel.chain_name} - ${hotel.area}`
}

export default function EmployeeStaff() {
  const [employees, setEmployees] = useState<ApiEmployee[]>([])
  const [hotels, setHotels] = useState<ApiHotel[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedHotel, setSelectedHotel] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<ApiEmployee | null>(null)
  const [formData, setFormData] = useState<EmployeeFormState>(emptyForm)

  const loadPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [employeesData, hotelsData] = await Promise.all([
        employeesApi.getAll(),
        hotelsApi.getAll(),
      ])

      setEmployees(employeesData)
      setHotels(hotelsData)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load staff data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return employees.filter((employee) => {
      const hotelMatch =
        selectedHotel === 'all' || employee.hotel_id === Number(selectedHotel)

      const searchMatch =
        query === '' ||
        employee.full_name.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query)

      return hotelMatch && searchMatch
    })
  }, [employees, selectedHotel, searchTerm])

  const managers = filteredEmployees.filter((employee) => employee.isManager)
  const staff = filteredEmployees.filter((employee) => !employee.isManager)

  const availableRoles = [
    'manager',
    'front desk',
    'housekeeping',
    'concierge',
    'maintenance',
    'security',
    'food & beverage',
    'sales',
    'accountant',
    'clerk',
  ]

  const getHotelName = (hotelId: number) => {
    const hotel = hotels.find((h) => h.hotel_id === hotelId)
    return hotel ? getHotelDisplayName(hotel) : 'Unknown'
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }))
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingEmployee(null)
    setFormData(emptyForm)
  }

  const handleEdit = (employee: ApiEmployee) => {
    const { firstName, lastName } = splitFullName(employee.full_name)

    setEditingEmployee(employee)
    setFormData({
      firstName,
      lastName,
      email: employee.email,
      address: employee.address,
      phone: employee.phone || '',
      ssnSin: employee.ssn_sin,
      hotelId: employee.hotel_id.toString(),
      role: employee.role,
      isManager: employee.isManager,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const fullName = `${formData.firstName} ${formData.lastName}`.trim()

    if (
      !fullName ||
      !formData.email ||
      !formData.address ||
      !formData.phone ||
      !formData.ssnSin ||
      !formData.hotelId ||
      !formData.role
    ) {
      alert('Please fill in all required fields.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const payload = {
        hotel_id: Number(formData.hotelId),
        full_name: fullName,
        address: formData.address,
        ssn_sin: formData.ssnSin,
        role: formData.role,
        email: formData.email,
        phone: formData.phone,
        isManager: formData.isManager,
      }

      if (editingEmployee) {
        await employeesApi.update(editingEmployee.employee_id, payload)
        alert(`Employee ${fullName} updated successfully!`)
      } else {
        await employeesApi.create(payload)
        alert(`Employee ${fullName} added successfully!`)
      }

      resetForm()
      await loadPageData()
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to save employee')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (employeeId: number, employeeName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete employee "${employeeName}"? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      setError(null)
      await employeesApi.delete(employeeId)
      alert(`Employee ${employeeName} deleted successfully!`)
      await loadPageData()
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete employee')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-700">
          Loading employees...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <button
          onClick={() => {
            setEditingEmployee(null)
            setFormData(emptyForm)
            setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Add New Employee
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-3xl font-bold text-gray-900">
            {filteredEmployees.length}
          </p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Hotel
            </label>
            <select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Hotels</option>
              {hotels.map((hotel) => (
                <option key={hotel.hotel_id} value={hotel.hotel_id}>
                  {getHotelDisplayName(hotel)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Staff
            </label>
            <input
              type="text"
              placeholder="Search by name, role, or email..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hotel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Manager
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <tr key={employee.employee_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {employee.employee_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {employee.full_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {employee.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {employee.role}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {getHotelName(employee.hotel_id)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {employee.isManager ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(employee.employee_id, employee.full_name)
                      }
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredEmployees.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-gray-500 text-sm"
                >
                  No employees found.
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
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SSN / SIN
                </label>
                <input
                  name="ssnSin"
                  type="text"
                  value={formData.ssnSin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel
                  </label>
                  <select
                    name="hotelId"
                    value={formData.hotelId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a hotel</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.hotel_id} value={hotel.hotel_id}>
                        {getHotelDisplayName(hotel)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a role</option>
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 pt-2">
                <input
                  name="isManager"
                  type="checkbox"
                  checked={formData.isManager}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">Is Manager</span>
              </label>

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
                    : editingEmployee
                    ? 'Save Changes'
                    : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}