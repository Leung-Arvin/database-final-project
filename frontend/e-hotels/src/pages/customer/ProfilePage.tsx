import { useState } from 'react'
import { customersApi } from '../../api/endpoints/customers'
import type { ApiCustomer } from '../../api/types/apiResponses'

interface ProfileFormState {
  full_name: string
  email: string
  phone: string
  address: string
  id_type: string
  id_number: string
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

function formatIdType(idType: string) {
  return idType.replaceAll('_', ' ')
}

export default function CustomerProfilePage() {
  const [customerIdInput, setCustomerIdInput] = useState('')
  const [customer, setCustomer] = useState<ApiCustomer | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profile, setProfile] = useState<ProfileFormState>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    id_type: '',
    id_number: '',
  })

  const loadCustomer = async () => {
    const customerId = Number(customerIdInput)

    if (!customerIdInput.trim() || Number.isNaN(customerId)) {
      alert('Please enter a valid customer ID.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setIsEditing(false)

      const customerData = await customersApi.getById(customerId)

      setCustomer(customerData)
      setProfile({
        full_name: customerData.full_name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        id_type: customerData.id_type,
        id_number: customerData.id_number,
      })
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to load customer profile'
      setError(message)
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!customer) return

    if (
      !profile.full_name.trim() ||
      !profile.email.trim() ||
      !profile.phone.trim() ||
      !profile.address.trim() ||
      !profile.id_type.trim() ||
      !profile.id_number.trim()
    ) {
      alert('Please fill in all fields.')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const updatedCustomer = await customersApi.update(customer.customer_id, {
        full_name: profile.full_name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        address: profile.address.trim(),
        id_type: profile.id_type.trim(),
        id_number: profile.id_number.trim(),
      })

      setCustomer(updatedCustomer)
      setProfile({
        full_name: updatedCustomer.full_name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        id_type: updatedCustomer.id_type,
        id_number: updatedCustomer.id_number,
      })

      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to update profile'
      setError(message)
      alert(message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (!customer) {
      setIsEditing(false)
      return
    }

    setProfile({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      id_type: customer.id_type,
      id_number: customer.id_number,
    })
    setIsEditing(false)
  }

  const nameParts = customer ? splitFullName(customer.full_name) : { firstName: '', lastName: '' }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Load Profile</h2>
          <div className="flex gap-3 max-w-md">
            <input
              type="number"
              value={customerIdInput}
              onChange={(e) => setCustomerIdInput(e.target.value)}
              placeholder="Enter customer ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={loadCustomer}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Loading...' : 'Load'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 bg-red-50 text-red-700 border border-red-200 rounded-lg p-4">
            {error}
          </div>
        )}

        {!customer && !loading && !error && (
          <div className="p-10 text-center text-gray-500">
            Enter a customer ID to view a profile.
          </div>
        )}

        {customer && (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center text-4xl">
                  👤
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">
                    {nameParts.firstName} {nameParts.lastName}
                  </h1>
                  <p className="text-blue-100">
                    Member since {new Date(customer.registration_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`px-4 py-2 text-white rounded-md ${
                        saving
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900">{customer.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900">{customer.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900">{customer.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900">{customer.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Type
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.id_type}
                        onChange={(e) =>
                          setProfile({ ...profile, id_type: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="text-gray-900">{formatIdType(customer.id_type)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.id_number}
                        onChange={(e) =>
                          setProfile({ ...profile, id_number: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="text-gray-900">{customer.id_number}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}