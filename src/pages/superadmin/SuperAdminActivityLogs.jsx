"use client"

import { useState, useEffect } from "react"
import { superAdminAPI } from "../../services/api"
import { useToast } from "../../context/ToastContext"
import {
  Activity,
  Search,
  Calendar,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Clock,
  Monitor,
  Globe,
  FileText,
  Trash2,
  RefreshCw,
  Download,
  LogIn,
  Plus,
  Edit,
  Trash,
  Settings,
} from "lucide-react"

const SuperAdminActivityLogs = () => {
  const { showToast } = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  })
  const [filters, setFilters] = useState({
    action: "",
    module: "",
    user: "",
    startDate: "",
    endDate: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [pagination.page, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      }
      const response = await superAdminAPI.getActivityLogs(params)
      setLogs(response?.logs || response?.data?.logs || [])
      setPagination((prev) => ({
        ...prev,
        total: response?.pagination?.total || response?.data?.pagination?.total || 0,
        pages: response?.pagination?.pages || response?.data?.pagination?.pages || 1,
      }))
    } catch (error) {
      showToast("Failed to fetch activity logs", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await superAdminAPI.getActivityLogStats()
      setStats(response || response?.data || {})
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const handleCleanup = async (days = 30) => {
    if (!window.confirm(`Are you sure you want to delete logs older than ${days} days?`)) {
      return
    }
    try {
      await superAdminAPI.cleanupActivityLogs(days)
      showToast(`Logs older than ${days} days deleted`, "success")
      fetchLogs()
      fetchStats()
    } catch (error) {
      showToast("Failed to cleanup logs", "error")
    }
  }

  const getActionIcon = (action) => {
    switch (action) {
      case "login":
        return <LogIn className="w-4 h-4 text-green-500" />
      case "create":
        return <Plus className="w-4 h-4 text-blue-500" />
      case "update":
        return <Edit className="w-4 h-4 text-yellow-500" />
      case "delete":
        return <Trash className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-slate-400" />
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case "login":
        return "bg-green-100 text-green-700"
      case "create":
        return "bg-blue-100 text-blue-700"
      case "update":
        return "bg-yellow-100 text-yellow-700"
      case "delete":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const openDetailModal = (log) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  const clearFilters = () => {
    setFilters({
      action: "",
      module: "",
      user: "",
      startDate: "",
      endDate: "",
    })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>
          <p className="text-slate-600">Monitor all admin activities and changes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              showFilters ? "bg-green-500 text-white" : "bg-white border border-green-200 text-green-600 hover:bg-green-50"
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
          <button
            onClick={() => handleCleanup(30)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            Cleanup
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCount || 0}</p>
              <p className="text-sm text-slate-500">Total Logs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.todayCount || 0}</p>
              <p className="text-sm text-slate-500">Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.weekCount || 0}</p>
              <p className="text-sm text-slate-500">This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.uniqueUsers || 0}</p>
              <p className="text-sm text-slate-500">Active Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="view">View</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Module</label>
              <select
                value={filters.module}
                onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Modules</option>
                <option value="auth">Authentication</option>
                <option value="products">Products</option>
                <option value="orders">Orders</option>
                <option value="users">Users</option>
                <option value="admins">Admins</option>
                <option value="settings">Settings</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No activity logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50 border-b border-green-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Action</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">User</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Module</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Description</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Time</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-50">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-green-50/50 transition-all">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{log.userName}</p>
                          <p className="text-sm text-slate-500">{log.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm capitalize">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-600 max-w-xs truncate">{log.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetailModal(log)}
                          className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-green-100 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm text-slate-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-green-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Activity Details</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedLog(null)
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Action</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getActionColor(selectedLog.action)}`}>
                    {getActionIcon(selectedLog.action)}
                    {selectedLog.action}
                  </span>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Module</p>
                  <p className="font-medium text-slate-900 capitalize">{selectedLog.module}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">User</p>
                <p className="font-medium text-slate-900">{selectedLog.userName}</p>
                <p className="text-sm text-slate-600">{selectedLog.userEmail}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Description</p>
                <p className="text-slate-900">{selectedLog.description}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Timestamp</p>
                <p className="text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDate(selectedLog.createdAt)}
                </p>
              </div>
              {selectedLog.ipAddress && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">IP Address</p>
                  <p className="text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {selectedLog.ipAddress}
                  </p>
                </div>
              )}
              {selectedLog.userAgent && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">User Agent</p>
                  <p className="text-slate-900 text-sm flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}
              {selectedLog.previousData && (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Previous Data</p>
                  <pre className="text-sm text-slate-900 overflow-x-auto">
                    {JSON.stringify(selectedLog.previousData, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.newData && (
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">New Data</p>
                  <pre className="text-sm text-slate-900 overflow-x-auto">
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminActivityLogs
