"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaEdit, FaTrash, FaPlus, FaSearch, FaExclamationTriangle, FaTools } from "react-icons/fa"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { getFullImageUrl } from "../../utils/imageUtils"

import config from "../../config/config"
const AdminBrands = () => {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [brandsPerPage] = useState(10)
  const { showToast } = useToast()

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        setError("No authentication token found. Please login again.")
        setLoading(false)
        return
      }

      const response = await fetch(`${config.API_URL}/api/brands/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBrands(data.filter((brand) => !brand.isDeleted))
      } else if (response.status === 401) {
        setError("Authentication failed. Please login again.")
      } else {
        setError("Failed to load brands. Please try again later.")
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching brands:", error)
      setError("Failed to load brands. Please try again later.")
      setLoading(false)
    }
  }

  const deleteBrand = async (id) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        const token = localStorage.getItem("adminToken")
        const response = await fetch(`${config.API_URL}/api/brands/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setBrands(brands.filter((brand) => brand._id !== id))
        } else {
          alert("Failed to delete brand")
        }
      } catch (error) {
        console.error("Error deleting brand:", error)
        alert("Error deleting brand")
      }
    }
  }

  const fixBrandName = async (brandId, currentName) => {
    const newName = prompt("Enter the correct brand name:", currentName)
    if (newName && newName.trim() && newName !== currentName) {
      try {
        const token = localStorage.getItem("adminToken")
        const response = await fetch(`${config.API_URL}/api/brands/${brandId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newName.trim(),
            slug: newName
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
          }),
        })

        if (response.ok) {
          fetchBrands() // Refresh the list
        } else {
          alert("Failed to update brand name")
        }
      } catch (error) {
        console.error("Error updating brand:", error)
        alert("Error updating brand")
      }
    }
  }

  const handleToggleStatus = async (brandId) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      const brand = brands.find(b => b._id === brandId)
      if (!brand) return

      const newStatus = !brand.isActive

      const response = await fetch(`${config.API_URL}/api/brands/${brandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        // Update the brand in the local state
        setBrands(brands.map(b => 
          b._id === brandId ? { ...b, isActive: newStatus } : b
        ))
        showToast(`Brand ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
      } else {
        showToast("Failed to update brand status", "error")
      }
    } catch (error) {
      console.error("Failed to toggle brand status:", error)
      showToast("Failed to update brand status", "error")
    }
  }

  // Helper function to detect if a name looks like an ID
  const isLikelyId = (name) => {
    if (!name) return true
    const str = String(name)
    return (
      str.match(/^[0-9a-fA-F]{24}$/) ||
      str.match(/^[0-9a-fA-F]{12,}$/) ||
      str.length > 20
    )
  }

  // Helper function to get display name
  const getDisplayName = (brand) => {
    if (brand.name && !isLikelyId(brand.name)) {
      return brand.name
    }
    if (brand.slug && !isLikelyId(brand.slug)) {
      return brand.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
    if (brand.description && !isLikelyId(brand.description)) {
      return brand.description
    }
    return "Invalid Brand Data"
  }

  // Helper function to check if brand has data issues
  const hasBrandDataIssues = (brand) => {
    return isLikelyId(brand.name) || !brand.name || brand.name.trim() === ""
  }

  // Filter brands based on search term
  const filteredBrands = brands.filter((brand) => {
    const displayName = getDisplayName(brand).toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return (
      displayName.includes(searchLower) ||
      (brand.description && brand.description.toLowerCase().includes(searchLower)) ||
      (brand.slug && brand.slug.toLowerCase().includes(searchLower))
    )
  })

  // Separate brands with issues from valid brands
  const validBrands = filteredBrands.filter((brand) => !hasBrandDataIssues(brand))
  const problematicBrands = filteredBrands.filter((brand) => hasBrandDataIssues(brand))

  // Combine them with problematic brands first for visibility
  const sortedBrands = [...problematicBrands, ...validBrands]

  // Pagination
  const indexOfLastBrand = currentPage * brandsPerPage
  const indexOfFirstBrand = indexOfLastBrand - brandsPerPage
  const currentBrands = sortedBrands.slice(indexOfFirstBrand, indexOfLastBrand)
  const totalPages = Math.ceil(sortedBrands.length / brandsPerPage)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading brands...</div>
      </div>
    )
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Brands</h1>
          <Link
            to="/admin/add-brand"
            className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add New Brand
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
          />
        </div>

        {/* Data Issues Warning */}
        {problematicBrands.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <h3 className="font-semibold text-yellow-800">Data Issues Detected ({problematicBrands.length} brands)</h3>
            </div>
            <p className="text-yellow-700 text-sm">
              Some brands are showing IDs instead of proper names. Use the "Fix" button to correct them.
            </p>
          </div>
        )}

        {/* Brands Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBrands.map((brand) => {
                  const hasIssues = hasBrandDataIssues(brand)
                  const displayName = getDisplayName(brand)

                  return (
                    <tr
                      key={brand._id}
                      className={hasIssues ? "bg-yellow-50 border-l-4 border-yellow-400" : "hover:bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {brand.logo ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={getFullImageUrl(brand.logo) || "/placeholder.svg"}
                                alt={displayName}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 text-xs">No Logo</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${hasIssues ? "text-yellow-800" : "text-gray-900"}`}>
                              {displayName}
                              {hasIssues && <span className="ml-2 text-yellow-600">⚠️</span>}
                            </div>
                            <div className="text-sm text-gray-500">/{brand.slug || generateSlug(displayName)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {brand.description || "No description"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {brand.website ? (
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lime-600 hover:text-lime-900"
                          >
                            {brand.website}
                          </a>
                        ) : (
                          "No website"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            brand.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {brand.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleStatus(brand._id)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              brand.isActive 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                            title={brand.isActive ? 'Click to deactivate' : 'Click to activate'}
                          >
                            {brand.isActive ? 'Active' : 'Inactive'}
                          </button>
                          <Link
                            to={`/admin/edit-brand/${brand._id}`}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                          >
                            <FaEdit size={16} />
                          </Link>
                          <button
                            onClick={() => deleteBrand(brand._id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstBrand + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(indexOfLastBrand, sortedBrands.length)}</span> of{" "}
                    <span className="font-medium">{sortedBrands.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-lime-50 border-lime-500 text-lime-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {sortedBrands.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No brands found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export default AdminBrands
