import { Navigate, Route, Routes } from "react-router-dom"

import SuperAdminHeader from "../components/superadmin/SuperAdminHeader"
import SuperAdminRoute from "../components/superadmin/SuperAdminRoute"
import SuperAdminSidebar from "../components/superadmin/SuperAdminSidebar"

import SuperAdminActivityLogs from "../pages/superadmin/SuperAdminActivityLogs"
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard"
import SuperAdminManagement from "../pages/superadmin/SuperAdminManagement"
import SuperAdminReports from "../pages/superadmin/SuperAdminReports"

const SuperAdminPortal = () => {
  return (
    <SuperAdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <SuperAdminSidebar />
        <SuperAdminHeader />
        <div className="lg:ml-72 pt-20 p-6">
          <Routes>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="admins" element={<SuperAdminManagement />} />
            <Route path="admins/add" element={<SuperAdminManagement />} />
            <Route path="permissions" element={<SuperAdminManagement />} />
            <Route path="activity-logs" element={<SuperAdminActivityLogs />} />
            <Route path="activity-logs/login" element={<SuperAdminActivityLogs />} />
            <Route path="activity-logs/changes" element={<SuperAdminActivityLogs />} />
            <Route path="reports" element={<SuperAdminReports />} />
            <Route path="settings" element={<SuperAdminDashboard />} />
            <Route path="profile" element={<SuperAdminDashboard />} />
            <Route path="*" element={<Navigate to="/superadmin/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </SuperAdminRoute>
  )
}

export default SuperAdminPortal
