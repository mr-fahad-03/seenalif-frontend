"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { ArrowLeft, RotateCcw, Trash2, Package } from "lucide-react"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"
import { apiRequest } from "../../services/api"

const TrashCategories = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrashCategories()
  }, [])

  const fetchTrashCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const data = await apiRequest("/api/categories/trash", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCategories(data)
    } catch (error) {
      console.error("Error fetching trash categories:", error)
      showToast("Failed to fetch trash categories", "error")
    } finally {
      setLoading(false)
    }
  }

  const restoreCategory = async (id) => {
    if (window.confirm("Are you sure you want to restore this category?")) {
      try {
        const token = localStorage.getItem("adminToken")
        
        const response = await fetch(`${config.API_URL}/api/categories/${id}/restore`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          showToast("Category restored successfully!", "success")
          fetchTrashCategories()
        } else {
          const errorData = await response.json()
          showToast(errorData.message || "Failed to restore category", "error")
        }
      } catch (error) {
        console.error("Error restoring category:", error)
        showToast("Failed to restore category", "error")
      }
    }
  }

  const permanentDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this category? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("adminToken")
        
        const response = await fetch(`${config.API_URL}/api/categories/${id}/permanent`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          showToast("Category permanently deleted!", "success")
          fetchTrashCategories()
        } else {
          const errorData = await response.json()
          showToast(errorData.message || "Failed to delete category", "error")
        }
      } catch (error) {
        console.error("Error deleting category:", error)
        showToast("Failed to delete category", "error")
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
            <p className="mt-4 text-gray-600">Loading trash categories...</p>
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
                onClick={() => navigate("/admin/categories")}
                className="hover:text-blue-600 flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Categories
              </button>
              <span>/</span>
              <span className="text-gray-900">Trash</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Trash Categories</h1>
            <p className="text-gray-600 mt-2">Restore or permanently delete categories</p>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {categories.length === 0 ? (
              <div className="p-8 text-center">
                <Trash2 size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories in trash</h3>
                <p className="text-gray-600">Deleted categories will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
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
                    {categories.map((category) => (
                      <tr key={category._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {category.image ? (
                                <img
                                  src={getFullImageUrl(category.image) || "/placeholder.svg"}
                                  alt={category.name}
                                  className="h-10 w-10 rounded-md object-cover opacity-60"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center opacity-60">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-500">{category.name}</div>
                              <div className="text-sm text-gray-400">/{category.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{category.description || "No description"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(category.deletedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => restoreCategory(category._id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <RotateCcw size={14} className="mr-1" />
                              Restore
                            </button>
                            <button
                              onClick={() => permanentDelete(category._id)}
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

export default TrashCategories
