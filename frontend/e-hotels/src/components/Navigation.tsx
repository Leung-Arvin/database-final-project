// src/components/Navigation.tsx
import { Link, useLocation } from 'react-router-dom'

interface NavigationProps {
  userRole: 'customer' | 'employee'
  setUserRole: (role: 'customer' | 'employee') => void
}

export default function Navigation({ userRole, setUserRole }: NavigationProps) {
  const location = useLocation()
  
  const customerNavItems = [
    { href: '/', label: 'Search Hotels' },
    { href: '/my-bookings', label: 'My Bookings' },
    { href: '/customer/profile', label: 'My Profile' },
  ]
  
  const employeeNavItems = [
    { href: '/employee/dashboard', label: 'Dashboard' },
    { href: '/employee/hotel-chains', label: 'Hotel Chains' },  // NEW
    { href: '/employee/hotels', label: 'Hotels' },               // NEW
    { href: '/employee/rooms', label: 'Rooms' },                 // Keep
    { href: '/employee/bookings', label: 'Manage Bookings' },
    { href: '/employee/check-in', label: 'Check-In/Out' },
    { href: '/employee/customers', label: 'Customers' },
    { href: '/employee/employees', label: 'Staff' },
    { href: '/employee/reports', label: 'Reports' },
  ]
  
  const navItems = userRole === 'customer' ? customerNavItems : employeeNavItems
  
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              e-Hotels
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'border-b-2 border-white text-white'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Role Toggle Switch */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-blue-400">
              <span className={`text-sm ${userRole === 'customer' ? 'text-white font-semibold' : 'text-blue-200'}`}>
                👤 Customer
              </span>
              <button
                onClick={() => setUserRole(userRole === 'customer' ? 'employee' : 'customer')}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${userRole === 'employee' ? 'bg-green-500' : 'bg-gray-400'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${userRole === 'employee' ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
              <span className={`text-sm ${userRole === 'employee' ? 'text-white font-semibold' : 'text-blue-200'}`}>
                👔 Employee
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}