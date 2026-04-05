"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { useToast } from "../../context/ToastContext"
import { Calendar, User, TrendingUp, TrendingDown, Eye, Filter } from "lucide-react"
import config from "../../config/config"

const PriceAdjustmentReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedReport, setSelectedReport] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const REPORTS_PER_PAGE = 20
  const { showToast } = useToast()

  // Get admin token with proper validation
  const getAdminToken = () => {
    const adminToken = localStorage.getItem("adminToken")
    const regularToken = localStorage.getItem("token")
    const token = adminToken || regularToken
    return token
  }

  useEffect(() => {
    fetchReports()
  }, [page, startDate, endDate])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const token = getAdminToken()

      if (!token) {
        setError("Authentication required. Please login again.")
        return
      }

      const params = { page, limit: REPORTS_PER_PAGE }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const { data } = await axios.get(`${config.API_URL}/api/price-adjustment/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      })

      setReports(data.reports || [])
      setTotalPages(data.totalPages || 1)
      setLoading(false)
    } catch (error) {
      console.error("Failed to load reports:", error)
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.")
        window.location.href = "/grabiansadmin/login"
      } else {
        setError("Failed to load reports. Please try again later.")
      }
      setLoading(false)
    }
  }

  const fetchReportDetail = async (reportId) => {
    try {
      const token = getAdminToken()
      if (!token) return

      const { data } = await axios.get(`${config.API_URL}/api/price-adjustment/reports/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setSelectedReport(data)
      setShowDetailModal(true)
    } catch (error) {
      console.error("Failed to load report details:", error)
      showToast("Failed to load report details", "error")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const formatPrice = (price) => {
    return `AED ${price.toLocaleString()}`
  }

  const getAdjustmentTypeLabel = (type) => {
    switch (type) {
      case "both":
        return "Both Prices"
      case "base_only":
        return "Base Price Only"
      case "offer_only":
        return "Offer Price Only"
      default:
        return type
    }
  }

  const getAdjustmentMethodLabel = (method) => {
    switch (method) {
      case "percentage":
        return "Percentage"
      case "fixed_amount":
        return "Fixed Amount"
      default:
        return method
    }
  }

  const clearFilters = () => {
    setStartDate("")
    setEndDate("")
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 min-h-screen">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Price Adjustment Reports</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
              {error.includes("Authentication") && (
                <button
                  onClick={() => (window.location.href = "/grabiansadmin/login")}
                  className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Login Again
                </button>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <Filter size={16} />
                Clear Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date & Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Adjusted By
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Products Affected
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Adjustment Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Method & Value
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Notes
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar size={16} className="text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(report.createdAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User size={16} className="text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900">{report.adjustedByName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {report.totalProductsAffected} products
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {getAdjustmentTypeLabel(report.adjustmentType)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getAdjustmentMethodLabel(report.adjustmentMethod)}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              {report.adjustmentValue > 0 ? (
                                <TrendingUp size={14} className="text-green-500 mr-1" />
                              ) : (
                                <TrendingDown size={14} className="text-red-500 mr-1" />
                              )}
                              {report.adjustmentMethod === "percentage"
                                ? `${report.adjustmentValue}%`
                                : `${report.adjustmentValue} AED`}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{report.notes || "No notes"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => fetchReportDetail(report._id)}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                            >
                              <Eye size={16} />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          No reports found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 my-4">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              {(() => {
                const pages = []
                // Always show first page
                pages.push(
                  <button
                    key={1}
                    className={`px-3 py-1 border rounded ${page === 1 ? "bg-blue-500 text-white" : ""}`}
                    onClick={() => setPage(1)}
                  >
                    1
                  </button>,
                )

                // Determine window
                let start = Math.max(2, page)
                let end = Math.min(totalPages - 1, page + 2)

                // If on first or second page, show 2 and 3
                if (page === 1) {
                  start = 2
                  end = Math.min(totalPages - 1, 3)
                } else if (page === 2) {
                  start = 2
                  end = Math.min(totalPages - 1, 4)
                }
                // If on last or near-last page, show last-2, last-1
                if (page >= totalPages - 2) {
                  start = Math.max(2, totalPages - 2)
                  end = totalPages - 1
                }

                // Add ellipsis if needed
                if (start > 2) {
                  pages.push(
                    <span key="start-ellipsis" className="px-2">
                      ...
                    </span>,
                  )
                }

                for (let i = start; i <= end; i++) {
                  pages.push(
                    <button
                      key={i}
                      className={`px-3 py-1 border rounded ${page === i ? "bg-blue-500 text-white" : ""}`}
                      onClick={() => setPage(i)}
                    >
                      {i}
                    </button>,
                  )
                }

                // Add ellipsis if needed
                if (end < totalPages - 1) {
                  pages.push(
                    <span key="end-ellipsis" className="px-2">
                      ...
                    </span>,
                  )
                }

                // Always show last page if more than 1
                if (totalPages > 1) {
                  pages.push(
                    <button
                      key={totalPages}
                      className={`px-3 py-1 border rounded ${page === totalPages ? "bg-blue-500 text-white" : ""}`}
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </button>,
                  )
                }

                return pages
              })()}
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Price Adjustment Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>

            {/* Report Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Date & Time</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Adjusted By</label>
                  <p className="text-sm text-gray-900">{selectedReport.adjustedByName}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Products Affected</label>
                  <p className="text-sm text-gray-900">{selectedReport.totalProductsAffected}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Adjustment</label>
                  <p className="text-sm text-gray-900">
                    {getAdjustmentMethodLabel(selectedReport.adjustmentMethod)}:{" "}
                    {selectedReport.adjustmentMethod === "percentage"
                      ? `${selectedReport.adjustmentValue}%`
                      : `${selectedReport.adjustmentValue} AED`}
                  </p>
                </div>
              </div>
              {selectedReport.notes && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase">Notes</label>
                  <p className="text-sm text-gray-900">{selectedReport.notes}</p>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Product Changes</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Previous Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">New Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                      {selectedReport.adjustmentType !== "base_only" && (
                        <>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Previous Offer
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">New Offer</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Offer Change
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedReport.products.map((product) => (
                      <tr key={product.productId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{product.productName}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{product.sku || "N/A"}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatPrice(product.previousPrice)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatPrice(product.newPrice)}</td>
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`inline-flex items-center ${
                              product.priceChange > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {product.priceChange > 0 ? (
                              <TrendingUp size={14} className="mr-1" />
                            ) : (
                              <TrendingDown size={14} className="mr-1" />
                            )}
                            {formatPrice(Math.abs(product.priceChange))} ({product.priceChangePercentage.toFixed(1)}%)
                          </span>
                        </td>
                        {selectedReport.adjustmentType !== "base_only" && (
                          <>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {product.previousOfferPrice > 0 ? formatPrice(product.previousOfferPrice) : "N/A"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {product.newOfferPrice > 0 ? formatPrice(product.newOfferPrice) : "N/A"}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {product.offerPriceChange !== 0 ? (
                                <span
                                  className={`inline-flex items-center ${
                                    product.offerPriceChange > 0 ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {product.offerPriceChange > 0 ? (
                                    <TrendingUp size={14} className="mr-1" />
                                  ) : (
                                    <TrendingDown size={14} className="mr-1" />
                                  )}
                                  {formatPrice(Math.abs(product.offerPriceChange))} (
                                  {product.offerPriceChangePercentage.toFixed(1)}%)
                                </span>
                              ) : (
                                "No change"
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PriceAdjustmentReports
