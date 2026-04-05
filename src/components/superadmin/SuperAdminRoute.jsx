"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const SuperAdminRoute = ({ children }) => {
  const { isAdminAuthenticated, isSuperAdmin, loading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">Loading Super Admin Portal...</p>
        </div>
      </div>
    )
  }

  // Redirect to super admin login if not authenticated
  if (!isAdminAuthenticated) {
    return <Navigate to="/grabiansuperadmin/login" state={{ from: location }} replace />
  }

  // Redirect to regular admin if not super admin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">
            You don't have Super Admin privileges to access this area.
          </p>
          <a
            href="/admin/dashboard"
            className="inline-block px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-200"
          >
            Go to Admin Panel
          </a>
        </div>
      </div>
    )
  }

  return children
}

export default SuperAdminRoute
