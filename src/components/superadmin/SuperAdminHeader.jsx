"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import {
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  ShieldCheck,
  Menu,
} from "lucide-react"

const SuperAdminHeader = () => {
  const { admin, adminLogout } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = async () => {
    try {
      await adminLogout()
      navigate("/grabiansuperadmin/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white border-b border-green-100 z-30 shadow-sm">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center">
            {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            </div> */}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-green-50 text-slate-600 hover:text-green-600 transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-green-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-green-100">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                </div>
                <div className="py-8 text-center text-slate-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No new notifications</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-green-50 transition-all duration-200"
            >
              <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-900">{admin?.name || "Super Admin"}</p>
                <p className="text-xs text-green-600">Super Administrator</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-green-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-green-100">
                  <p className="font-semibold text-slate-900">{admin?.name}</p>
                  <p className="text-sm text-slate-500">{admin?.email}</p>
                </div>
                <div className="py-2">
                  <Link
                    to="/superadmin/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-green-50 hover:text-green-600 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/superadmin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-green-50 hover:text-green-600 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </div>
                <div className="border-t border-green-100 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default SuperAdminHeader
