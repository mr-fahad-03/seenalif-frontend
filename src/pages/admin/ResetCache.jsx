"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { RefreshCw, Clock, User, AlertTriangle, CheckCircle, Trash2 } from "lucide-react"
import { useToast } from "../../context/ToastContext"
import config from "../../config/config"

const ResetCache = () => {
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [currentVersion, setCurrentVersion] = useState(1)
  const [lastResetAt, setLastResetAt] = useState(null)
  const [history, setHistory] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchCacheHistory()
  }, [])

  const fetchCacheHistory = async () => {
    try {
      setHistoryLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      
      const { data } = await axios.get(`${config.API_URL}/api/cache/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      setCurrentVersion(data.currentVersion || 1)
      setLastResetAt(data.lastResetAt)
      setHistory(data.history || [])
    } catch (error) {
      console.error("Error fetching cache history:", error)
      showToast("Failed to load cache history", "error")
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleResetCache = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      
      const { data } = await axios.post(
        `${config.API_URL}/api/cache/reset`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      showToast(data.message, "success")
      setShowConfirm(false)
      fetchCacheHistory()
    } catch (error) {
      console.error("Error resetting cache:", error)
      showToast(error.response?.data?.message || "Failed to reset cache", "error")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return "Never"
    return new Date(date).toLocaleString("en-AE", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 md:ml-64">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-600" />
              Reset Cache
            </h1>
            <p className="text-gray-600 mt-2">
              Force all users to receive fresh content by resetting the cache version.
              When you make changes to your website, users may see old cached versions.
              Clicking "Reset Cache" will force all browsers to load the latest version.
            </p>
          </div>

          {/* Current Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Cache Version</div>
                <div className="text-3xl font-bold text-blue-700 mt-1">v{currentVersion}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 font-medium">Last Reset</div>
                <div className="text-lg font-semibold text-gray-800 mt-1">
                  {formatDate(lastResetAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Reset Button Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reset Cache</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">What happens when you reset?</h3>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• All users will get a fresh version of the website on their next visit</li>
                    <li>• Cached product data, images, and settings will be refreshed</li>
                    <li>• Any UI/styling changes will be visible immediately</li>
                  </ul>
                  <h3 className="font-medium text-green-800 mt-3">What is preserved?</h3>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>✓ User login sessions (users stay logged in)</li>
                    <li>✓ Shopping cart items</li>
                    <li>✓ Wishlist items</li>
                  </ul>
                </div>
              </div>
            </div>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full md:w-auto px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Reset Cache for All Users
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-4">
                  Are you sure you want to reset the cache for all users?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleResetCache}
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Yes, Reset Cache
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Reset History
            </h2>
            
            {historyLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                <p className="text-gray-500 mt-2">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No cache resets yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Version</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Reset At</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Reset By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            v{item.version}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(item.resetAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {item.resetBy?.name || item.resetBy?.email || "Admin"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetCache
