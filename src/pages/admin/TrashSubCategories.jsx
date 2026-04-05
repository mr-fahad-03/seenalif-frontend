"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { ArrowLeft, RotateCcw, Trash2, Package } from "lucide-react"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"
import { apiRequest } from "../../services/api"

const TrashSubCategories = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrashSubCategories()
  }, [])

  const fetchTrashSubCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const data = await apiRequest("/api/subcategories/trash", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSubcategories(data)
    } catch (error) {
      console.error("Error fetching trash subcategories:", error)
      showToast("Failed to fetch trash subcategories", "error")
    } finally {
      setLoading(false)
    }
  }

  const restoreSubCategory = async (id) => {
    if (window.confirm("Are you sure you want to restore this subcategory?")) {
      try {
        const token = localStorage.getItem("adminToken")
        
        const response = await fetch(`${config.API_URL}/api/subcategories/${id}/restore`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          showToast("Subcategory restored successfully!", "success")
          fetchTrashSubCategories()
        } else {
          const errorData = await response.json()
          showToast(errorData.message || "Failed to restore subcategory", "error")
        }
      } catch (error) {
        console.error("Error restoring subcategory:", error)
        showToast("Failed to restore subcategory", "error")
      }
    }
  }

  const permanentDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this subcategory? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("adminToken")
        
        const response = await fetch(`${config.API_URL}/api/subcategories/${id}/permanent`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          showToast("Subcategory permanently deleted!", "success")
          fetchTrashSubCategories()
        } else {
          const errorData = await response.json()
          showToast(errorData.message || "Failed to delete subcategory", "error")
        }
      } catch (error) {
        console.error("Error deleting subcategory:", error)
        showToast("Failed to delete subcategory", "error")
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading trash subcategories...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <button
                onClick={() => navigate("/admin/subcategories")}
                className="hover:text-blue-600 flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Sub Categories
              </button>
              <span>/</span>
              <span className="text-gray-900">Trash</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Trash Sub Categories</h1>
            <p className="text-gray-600 mt-2">Restore or permanently delete subcategories</p>
          </div>

          {/* SubCategories List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {subcategories.length === 0 ? (
              <div className="p-8 text-center">
                <Trash2 size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subcategories in trash</h3>
                <p className="text-gray-600">Deleted subcategories will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subcategory
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parent Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deleted At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subcategories.map((subcategory) => (
                      <tr key={subcategory._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {subcategory.image ? (
                                <img
                                  src={getFullImageUrl(subcategory.image) || "/placeholder.svg"}
                                  alt={subcategory.name}
                                  className="h-10 w-10 rounded-md object-cover opacity-60"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center opacity-60">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-500">{subcategory.name}</div>
                              <div className="text-sm text-gray-400">/{subcategory.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {subcategory.categoryName || subcategory.category?.name || "Unknown"}
                          </div>
                          {subcategory.parentSubCategoryName && (
                            <div className="text-xs text-gray-500">
                              Parent: {subcategory.parentSubCategoryName}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Level {subcategory.level || 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {subcategory.description || "No description"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {subcategory.deletedAt ? new Date(subcategory.deletedAt).toLocaleDateString() : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => restoreSubCategory(subcategory._id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <RotateCcw size={14} className="mr-1" />
                              Restore
                            </button>
                            <button
                              onClick={() => permanentDelete(subcategory._id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Delete Forever
                            </button>
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

export default TrashSubCategories
