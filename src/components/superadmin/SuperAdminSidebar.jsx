"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  Users,
  Activity,
  UserCog,
  ShieldCheck,
  LogOut,
  ChevronDown,
  ChevronRight,
  Settings,
  Shield,
  ClipboardList,
  Menu,
  X,
  FileText,
  BarChart3,
} from "lucide-react"

const SuperAdminSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminLogout, admin } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState({
    adminManagement: false,
    activityLogs: false,
  })

  // Auto-open dropdowns based on current route
  useEffect(() => {
    const path = location.pathname

    setOpenDropdowns(prev => {
      const shouldOpenAdminManagement = path.includes("/superadmin/admins")
      const shouldOpenActivityLogs = path.includes("/superadmin/activity-logs")
      
      // Only update if values actually change
      if (prev.adminManagement === shouldOpenAdminManagement && 
          prev.activityLogs === shouldOpenActivityLogs) {
        return prev
      }
      
      return {
        ...prev,
        adminManagement: shouldOpenAdminManagement || prev.adminManagement,
        activityLogs: shouldOpenActivityLogs || prev.activityLogs,
      }
    })
  }, [location.pathname])

  const toggleDropdown = (dropdown) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }))
  }

  const handleLogout = async () => {
    try {
      await adminLogout()
      navigate("/grabiansuperadmin/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const isActive = (path) => location.pathname === path
  const isActiveDropdown = (paths) => paths.some((path) => location.pathname.includes(path))

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/superadmin/dashboard",
    },
    {
      title: "Admin Management",
      icon: UserCog,
      dropdown: "adminManagement",
      items: [
        { title: "All Admins", path: "/superadmin/admins" },
      //  { title: "Add Admin", path: "/superadmin/admins/add" },
        // { title: "Permissions", path: "/superadmin/permissions" },
      ],
    },
    {
      title: "Activity Logs",
      icon: Activity,
      dropdown: "activityLogs",
      items: [
        { title: "All Logs", path: "/superadmin/activity-logs" },
       // { title: "Login History", path: "/superadmin/activity-logs/login" },
       // { title: "System Changes", path: "/superadmin/activity-logs/changes" },
      ],
    },
    {
      title: "Reports",
      icon: BarChart3,
      path: "/superadmin/reports",
    },
    {
      title: "System Settings",
      icon: Settings,
      path: "/superadmin/settings",
    },
  ]

  const renderMenuItem = (item, index) => {
    const Icon = item.icon

    if (item.dropdown) {
      const isOpen = openDropdowns[item.dropdown]
      const dropdownPaths = item.items.map((i) => i.path)
      const isDropdownActive = isActiveDropdown(dropdownPaths)

      return (
        <div key={index}>
          <button
            onClick={() => toggleDropdown(item.dropdown)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
              isDropdownActive
                ? "bg-green-100 text-green-700"
                : "text-slate-600 hover:bg-green-50 hover:text-green-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </div>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {isOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-green-200 pl-4">
              {item.items.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  to={subItem.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`block px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(subItem.path)
                      ? "bg-green-500 text-white"
                      : "text-slate-600 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  {subItem.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={index}
        to={item.path}
        onClick={() => setIsMobileOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive(item.path)
            ? "bg-green-500 text-white shadow-lg shadow-green-200"
            : "text-slate-600 hover:bg-green-50 hover:text-green-600"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{item.title}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-500 text-white rounded-xl shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-green-100 shadow-xl z-40 transform transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Super Admin</h1>
              <p className="text-sm text-green-600">Control Panel</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 mx-4 mt-4 bg-green-50 rounded-2xl border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {admin?.name || "Super Admin"}
              </p>
              <p className="text-xs text-green-600 truncate">{admin?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
          {menuItems.map(renderMenuItem)}
        </nav>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-100 bg-white">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-green-50 hover:text-green-600 transition-all duration-200 mb-2"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="font-medium">Go to Admin Panel</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default SuperAdminSidebar
