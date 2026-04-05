"use client"

import { useState, useEffect, useMemo } from "react"
import { useToast } from "../../context/ToastContext"
import { useAuth } from "../../context/AuthContext"
import axios from "axios"
import {
  Star,
  Eye,
  Check,
  X,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  MessageSquare,
  ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Shield,
  Mail,
} from "lucide-react"

const ReviewManagement = () => {
  const { showToast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  })

  // Filter and pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" })

  // Modal states
  const [selectedReview, setSelectedReview] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch reviews when dependencies change
  useEffect(() => {
    if (!authLoading) {
      fetchReviews()
    }
  }, [currentPage, statusFilter, debouncedSearchTerm, dateFilter, customDateRange, authLoading])

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  // Get the correct API base URL
  const getApiBaseUrl = () => {
    const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    return isDevelopment ? "http://localhost:5000" : "https://api.grabatoz.ae"
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)

      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        console.log("No token found")
        showToast("Please login as admin first", "error")
        return
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (debouncedSearchTerm.trim()) {
        params.append("search", debouncedSearchTerm.trim())
      }

      if (dateFilter !== "all") {
        const now = new Date()
        let startDate, endDate

        switch (dateFilter) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
            break
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            endDate = now
            break
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            break
          case "custom":
            if (customDateRange.start && customDateRange.end) {
              startDate = new Date(customDateRange.start)
              endDate = new Date(customDateRange.end)
              endDate.setHours(23, 59, 59, 999) // End of day
            }
            break
        }

        if (startDate && endDate) {
          params.append("startDate", startDate.toISOString())
          params.append("endDate", endDate.toISOString())
        }
      }

      const baseURL = getApiBaseUrl()
      const url = `${baseURL}/api/admin/reviews?${params}`

      console.log("Fetching from:", url)

      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      })

      console.log("Reviews response:", response.data)

      if (response.data) {
        setReviews(response.data.reviews || [])
        setStats(response.data.stats || { pending: 0, approved: 0, rejected: 0, total: 0 })
        setTotalPages(response.data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)

      if (error.response?.status === 401) {
        showToast("Authentication failed. Please login as admin.", "error")
      } else if (error.response?.status === 403) {
        showToast("Access denied. Admin privileges required.", "error")
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Error loading reviews"
        showToast(errorMessage, "error")
      }
    } finally {
      setLoading(false)
    }
  }

  // Image component with fallbacks
  const ImageWithFallback = ({ imagePath, alt = "Review Image" }) => {
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0)
    const [hasError, setHasError] = useState(false)

    const possibleUrls = useMemo(() => {
      if (!imagePath) return []

      const baseURL = getApiBaseUrl()

      return [
        `${baseURL}/uploads/reviews/${imagePath}`,
        `${baseURL}/uploads/${imagePath}`,
        `${baseURL}${imagePath}`,
        imagePath.startsWith("http") ? imagePath : `${baseURL}/${imagePath}`,
      ]
    }, [imagePath])

    const handleImageError = () => {
      console.log("❌ Image failed to load:", possibleUrls[currentUrlIndex])

      if (currentUrlIndex < possibleUrls.length - 1) {
        setCurrentUrlIndex(currentUrlIndex + 1)
        console.log("🔄 Trying next URL:", possibleUrls[currentUrlIndex + 1])
      } else {
        setHasError(true)
        console.log("❌ All image URLs failed")
      }
    }

    const handleImageLoad = () => {
      console.log("✅ Image loaded successfully:", possibleUrls[currentUrlIndex])
      setHasError(false)
    }

    if (!imagePath || hasError) {
      return (
        <div className="w-32 h-32 bg-gray-200 rounded-lg border flex flex-col items-center justify-center text-gray-500 text-xs p-2">
          <ImageIcon className="w-8 h-8 mb-1" />
          <span>No Image</span>
        </div>
      )
    }

    return (
      <div className="relative">
        <img
          src={possibleUrls[currentUrlIndex] || "/placeholder.svg"}
          alt={alt}
          className="w-32 h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90"
          onError={handleImageError}
          onLoad={handleImageLoad}
          onClick={() => window.open(possibleUrls[currentUrlIndex], "_blank")}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
          URL {currentUrlIndex + 1}/{possibleUrls.length}
        </div>
      </div>
    )
  }

  const handleApproveReview = async (reviewId, adminNotes = "") => {
    try {
      setActionLoading(true)
      const baseURL = getApiBaseUrl()

      const response = await axios.put(
        `${baseURL}/api/admin/reviews/${reviewId}/approve`,
        { adminNotes },
        { headers: getAuthHeaders() },
      )

      showToast("Review approved successfully", "success")
      fetchReviews()
      setShowDetailModal(false)
    } catch (error) {
      console.error("Error approving review:", error)
      const errorMessage = error.response?.data?.message || "Error approving review"
      showToast(errorMessage, "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectReview = async () => {
    if (!rejectReason.trim()) {
      showToast("Please provide a reason for rejection", "error")
      return
    }

    try {
      setActionLoading(true)
      const baseURL = getApiBaseUrl()

      const response = await axios.put(
        `${baseURL}/api/admin/reviews/${selectedReview._id}/reject`,
        { adminNotes: rejectReason },
        { headers: getAuthHeaders() },
      )

      showToast("Review rejected successfully", "success")
      fetchReviews()
      setShowRejectModal(false)
      setShowDetailModal(false)
      setRejectReason("")
    } catch (error) {
      console.error("Error rejecting review:", error)
      const errorMessage = error.response?.data?.message || "Error rejecting review"
      showToast(errorMessage, "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return
    }

    try {
      setActionLoading(true)
      const baseURL = getApiBaseUrl()

      const response = await axios.delete(`${baseURL}/api/admin/reviews/${reviewId}`, {
        headers: getAuthHeaders(),
      })

      showToast("Review deleted successfully", "success")
      fetchReviews()
      setShowDetailModal(false)
    } catch (error) {
      console.error("Error deleting review:", error)
      const errorMessage = error.response?.data?.message || "Error deleting review"
      showToast(errorMessage, "error")
    } finally {
      setActionLoading(false)
    }
  }

  const openDetailModal = async (review) => {
    try {
      const baseURL = getApiBaseUrl()
      const response = await axios.get(`${baseURL}/api/admin/reviews/${review._id}`, {
        headers: getAuthHeaders(),
      })

      setSelectedReview(response.data.review)
      setShowDetailModal(true)
    } catch (error) {
      console.error("Error fetching review details:", error)
      const errorMessage = error.response?.data?.message || "Error loading review details"
      showToast(errorMessage, "error")
    }
  }

  // Render functions
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))}
      </div>
    )
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800",
        text: "Pending",
      },
      approved: {
        icon: CheckCircle,
        color: "bg-green-100 text-green-800",
        text: "Approved",
      },
      rejected: {
        icon: XCircle,
        color: "bg-red-100 text-red-800",
        text: "Rejected",
      },
    }

    const config = statusConfig[status] || statusConfig.pending
    const IconComponent = config.icon

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  const getReviewTypeBadge = (review) => {
    if (review.user) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Shield className="w-3 h-3 mr-1" />
          Registered User
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Mail className="w-3 h-3 mr-1" />
          Guest (Email Verified)
        </span>
      )
    }
  }

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Management</h1>
            <p className="text-gray-600">Manage customer reviews and ratings</p>
          </div>
          <button
            onClick={fetchReviews}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Auto-Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-xs text-gray-500">Logged-in users + verified guests</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-gray-500">Manual review required</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Reviews</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or comment..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange((prev) => ({ ...prev, start: e.target.value }))}
                />
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-gray-600">Loading reviews...</p>
                    </div>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">No reviews found</p>
                      <p className="text-gray-500 text-sm">Reviews will appear here once customers submit them</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{review.name}</div>
                          <div className="text-sm text-gray-500">{review.email}</div>
                          <div className="mt-1">{getReviewTypeBadge(review)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{review.product?.name || "Product not found"}</div>
                      {review.image && (
                        <div className="flex items-center mt-1 text-xs text-blue-600">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          <span>Has Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(review.rating)}
                      <div className="text-sm text-gray-500">{review.rating}/5</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{review.comment}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(review.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailModal(review)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {review.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveReview(review._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                              disabled={actionLoading}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReview(review)
                                setShowRejectModal(true)
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                              disabled={actionLoading}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          disabled={actionLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1
                    if (
                      page === currentPage ||
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span
                          key={page}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      )
                    }
                    return null
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Review Details</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 block">Customer Name</span>
                    <span className="font-medium">{selectedReview.name}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block">Email</span>
                    <span className="font-medium">{selectedReview.email}</span>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600 block">Review Type</span>
                  {getReviewTypeBadge(selectedReview)}
                </div>

                <div>
                  <span className="text-sm text-gray-600 block">Product</span>
                  <span className="font-medium">{selectedReview.product?.name || "Product not found"}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 block">Rating</span>
                    <div className="flex items-center space-x-2">
                      {renderStars(selectedReview.rating)}
                      <span className="text-sm text-gray-600">({selectedReview.rating}/5)</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block">Status</span>
                    {getStatusBadge(selectedReview.status)}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600 block mb-1">Comment</span>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReview.comment}</p>
                </div>

                {selectedReview.image && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Attached Image</span>
                    <ImageWithFallback imagePath={selectedReview.image} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="block">Submitted</span>
                    <span>{new Date(selectedReview.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedReview.approvedAt && (
                    <div>
                      <span className="block">Approved</span>
                      <span>{new Date(selectedReview.approvedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {selectedReview.adminNotes && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Admin Notes</span>
                    <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      {selectedReview.adminNotes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {selectedReview.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApproveReview(selectedReview._id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteReview(selectedReview._id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reject Review</h3>
                <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for rejection</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="4"
                  placeholder="Please provide a reason for rejecting this review..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectReview}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Rejecting..." : "Reject Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewManagement
