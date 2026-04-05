"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import {
  Activity,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Clock,
  FileText,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  X,
  BarChart3,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { superAdminAPI } from "../../services/api"

const ActivityLogs = () => {
  const { isSuperAdmin, hasPermission } = useAuth()
  
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    module: "",
    action: "",
    userId: "",
    startDate: "",
    endDate: ""
  })
  
  // Stats
  const [stats, setStats] = useState(null)
  const [showStats, setShowStats] = useState(false)
  
  // Detail modal
  const [selectedLog, setSelectedLog] = useState(null)
  
  // Cleanup modal
  const [showCleanupModal, setShowCleanupModal] = useState(false)
  const [cleanupDays, setCleanupDays] = useState(90)
  const [cleanupLoading, setCleanupLoading] = useState(false)

  const modules = [
    "PRODUCTS", "CATEGORIES", "SUBCATEGORIES", "BRANDS", "ORDERS", "USERS",
    "REVIEWS", "BLOGS", "BANNERS", "HOME_SECTIONS", "OFFER_PAGES", "GAMING_ZONE",
    "COUPONS", "DELIVERY_CHARGES", "SETTINGS", "EMAIL_TEMPLATES", "NEWSLETTER",
    "REQUEST_CALLBACKS", "BULK_PURCHASE", "BUYER_PROTECTION", "STOCK_ADJUSTMENT",
    "SEO_SETTINGS", "CACHE", "VOLUMES", "WARRANTY", "COLORS", "UNITS", "TAX",
    "SIZES", "ADMIN_MANAGEMENT", "AUTH", "PERMISSIONS", "OTHER"
  ]

  const actions = [
    "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "VIEW", "EXPORT",
    "IMPORT", "STATUS_CHANGE", "PERMISSION_CHANGE", "BULK_ACTION", "OTHER"
  ]

  const canAccess = isSuperAdmin || hasPermission("activityLogs")

  useEffect(() => {
    if (canAccess) {
      fetchLogs()
    }
  }, [page, canAccess])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = { page, limit: 50 }
      
      if (filters.search) params.search = filters.search
      if (filters.module) params.module = filters.module
      if (filters.action) params.action = filters.action
      if (filters.userId) params.userId = filters.userId
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      
      const data = await superAdminAPI.getActivityLogs(params)
      setLogs(data.logs || [])
      setTotalPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message || "Failed to fetch activity logs")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await superAdminAPI.getActivityLogStats(7)
      setStats(data)
      setShowStats(true)
    } catch (err) {
      setError(err.message || "Failed to fetch stats")
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchLogs()
  }

  const handleResetFilters = () => {
    setFilters({
      search: "",
      module: "",
      action: "",
      userId: "",
      startDate: "",
      endDate: ""
    })
    setPage(1)
    setTimeout(fetchLogs, 100)
  }

  const handleCleanup = async () => {
    try {
      setCleanupLoading(true)
      const data = await superAdminAPI.cleanupActivityLogs(cleanupDays)
      setSuccess(data.message)
      setShowCleanupModal(false)
      fetchLogs()
    } catch (err) {
      setError(err.message || "Failed to cleanup logs")
    } finally {
      setCleanupLoading(false)
    }
  }

  const getActionColor = (action) => {
    const colors = {
      CREATE: "bg-green-100 text-green-800",
      UPDATE: "bg-blue-100 text-blue-800",
      DELETE: "bg-red-100 text-red-800",
      LOGIN: "bg-purple-100 text-purple-800",
      LOGOUT: "bg-gray-100 text-gray-800",
      VIEW: "bg-cyan-100 text-cyan-800",
      EXPORT: "bg-yellow-100 text-yellow-800",
      IMPORT: "bg-indigo-100 text-indigo-800",
      STATUS_CHANGE: "bg-orange-100 text-orange-800",
      PERMISSION_CHANGE: "bg-pink-100 text-pink-800",
      BULK_ACTION: "bg-teal-100 text-teal-800",
      OTHER: "bg-gray-100 text-gray-800"
    }
    return colors[action] || colors.OTHER
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    }
  }

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="ml-64 p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">You don't have permission to view activity logs.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-8 w-8 text-lime-600" />
              Activity Logs
            </h1>
            <p className="text-gray-600 mt-1">Track all admin activities and changes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchStats}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <BarChart3 className="h-5 w-5" />
              Stats
            </button>
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              Refresh
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setShowCleanupModal(true)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="h-5 w-5" />
                Cleanup
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-700 font-medium"
          >
            <Filter className="h-5 w-5" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                <select
                  value={filters.module}
                  onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                >
                  <option value="">All Modules</option>
                  {modules.map(m => (
                    <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                >
                  <option value="">All Actions</option>
                  {actions.map(a => (
                    <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Panel */}
        {showStats && stats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Activity Statistics ({stats.period})</h3>
              <button onClick={() => setShowStats(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total Activities</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalCount}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Top Module</p>
                <p className="text-xl font-bold text-green-800">
                  {stats.byModule[0]?._id?.replace(/_/g, ' ') || 'N/A'}
                </p>
                <p className="text-sm text-green-600">{stats.byModule[0]?.count || 0} actions</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Top Action</p>
                <p className="text-xl font-bold text-purple-800">
                  {stats.byAction[0]?._id?.replace(/_/g, ' ') || 'N/A'}
                </p>
                <p className="text-sm text-purple-600">{stats.byAction[0]?.count || 0} times</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-600 font-medium">Most Active User</p>
                <p className="text-xl font-bold text-orange-800">
                  {stats.byUser[0]?.userName || 'N/A'}
                </p>
                <p className="text-sm text-orange-600">{stats.byUser[0]?.count || 0} actions</p>
              </div>
            </div>
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-medium text-gray-900">
              {total} Total Logs
            </h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Activity className="h-12 w-12 mb-2" />
              <p>No activity logs found</p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => {
                    const { date, time } = formatDate(log.createdAt)
                    return (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-gray-900">{date}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                              <div className="text-xs text-gray-500">{log.userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {log.module.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 max-w-xs truncate" title={log.description}>
                            {log.description}
                          </p>
                          {log.targetName && (
                            <p className="text-xs text-gray-500 mt-1">Target: {log.targetName}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-6 py-4 border-t flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Activity Log Details</h2>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">User</label>
                  <p className="text-gray-900">{selectedLog.userName}</p>
                  <p className="text-sm text-gray-500">{selectedLog.userEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Time</label>
                  <p className="text-gray-900">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Action</label>
                  <p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Module</label>
                  <p className="text-gray-900">{selectedLog.module.replace(/_/g, ' ')}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{selectedLog.description}</p>
              </div>

              {selectedLog.targetId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Target ID</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedLog.targetId}</p>
                </div>
              )}

              {selectedLog.targetName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Target Name</label>
                  <p className="text-gray-900">{selectedLog.targetName}</p>
                </div>
              )}

              {selectedLog.ipAddress && (
                <div>
                  <label className="text-sm font-medium text-gray-500">IP Address</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedLog.ipAddress}</p>
                </div>
              )}

              {selectedLog.previousData && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Previous Data</label>
                  <pre className="mt-1 p-3 bg-gray-100 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.previousData, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newData && (
                <div>
                  <label className="text-sm font-medium text-gray-500">New Data</label>
                  <pre className="mt-1 p-3 bg-gray-100 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cleanup Modal */}
      {showCleanupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Cleanup Old Logs</h2>
              <p className="text-gray-500 text-center mb-6">
                Delete activity logs older than the specified number of days.
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delete logs older than (days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={cleanupDays}
                  onChange={(e) => setCleanupDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                />
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowCleanupModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCleanup}
                  disabled={cleanupLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {cleanupLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Old Logs
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityLogs
