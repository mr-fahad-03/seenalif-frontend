"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { LogOut, User, ChevronDown } from "lucide-react"

const AdminHeader = () => {
  const { admin, adminLogout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    adminLogout()
    navigate("/grabiansadmin/login")
  }

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname
    if (path === "/admin/dashboard") return "Dashboard"
    return "Admin Panel"
  }

  return (
    <header className="h-20 flex items-center justify-between px-6 ml-64 top-0 right-0 left-64 z-40 bg-white">
      <div className="flex items-center bg-white  px-6 py-3 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Admin User Info */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-white bg-white transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{admin?.name || "Admin User"}</p>
              <p className="text-xs text-gray-500">{admin?.email || "admin@grabatoz.ae"}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{admin?.name || "Admin User"}</p>
                <p className="text-xs text-gray-500">{admin?.email || "admin@grabatoz.ae"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
