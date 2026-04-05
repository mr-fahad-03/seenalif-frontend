"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import SafeDeleteModal from "../../components/admin/SafeDeleteModal"
import MoveProductsModal from "../../components/admin/MoveProductsModal"
import { Edit, Trash2, Plus } from "lucide-react"
import axios from "axios"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [productsToMove, setProductsToMove] = useState([])
  const [deletionPending, setDeletionPending] = useState(null)
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      // Try different possible token keys
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        setLoading(false)
        return
      }

      const response = await fetch(`${config.API_URL}/api/categories/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Filter to show only parent categories (level 0) and not deleted
        setCategories(data.filter((cat) => !cat.isDeleted && cat.level === 0))
      } else if (response.status === 401) {
        showToast("Authentication failed. Please login again.", "error")
      } else {
        showToast("Error fetching categories", "error")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      showToast("Error fetching categories", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const category = categories.find(c => c._id === id)
    if (category) {
      setCategoryToDelete(category)
      setDeleteModalOpen(true)
    }
  }

  const handleDeleteConfirm = async (categoryId, shouldMoveProducts) => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      if (shouldMoveProducts) {
        // Store category ID for later and show move modal
        setDeletionPending(categoryId)
        
        // Fetch all products that need to be moved
        const { data } = await axios.get(`${config.API_URL}/api/products/admin`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            parentCategory: categoryId,
            limit: 1000 // Get all products
          }
        })
        
        setProductsToMove(data.products || [])
        setDeleteModalOpen(false)
        setShowMoveModal(true)
      } else {
        // Proceed with cascading deletion
        const response = await axios.delete(
          `${config.API_URL}/api/categories/${categoryId}/cascade`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { moveProducts: "false" }
          }
        )

        if (response.status === 200) {
          showToast("Category and all related data deleted successfully", "success")
          setDeleteModalOpen(false)
          setCategoryToDelete(null)
          fetchCategories()
        }
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      if (error.response?.status === 401) {
        showToast("Authentication failed. Please login again.", "error")
      } else {
        showToast(error.response?.data?.message || "Error deleting category", "error")
      }
    }
  }

  const handleProductsMove = async (moveData) => {
    try {
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      // Move all products to the new category/subcategory
      const productIds = productsToMove.map(p => p._id)
      
      await axios.put(
        `${config.API_URL}/api/products/bulk-move`,
        {
          productIds,
          ...moveData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Now delete the category with cascading (no products to worry about)
      await axios.delete(
        `${config.API_URL}/api/categories/${deletionPending}/cascade`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { moveProducts: "false" }
        }
      )

      showToast("Products moved and category deleted successfully", "success")
      setShowMoveModal(false)
      setDeletionPending(null)
      setProductsToMove([])
      fetchCategories()
    } catch (error) {
      console.error("Error moving products:", error)
      showToast(error.response?.data?.message || "Error moving products", "error")
    }
  }

  const handleToggleStatus = async (categoryId) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      const category = categories.find(c => c._id === categoryId)
      if (!category) return

      const newStatus = !category.isActive

      const response = await fetch(`${config.API_URL}/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        // Update the category in the local state
        setCategories(categories.map(c => 
          c._id === categoryId ? { ...c, isActive: newStatus } : c
        ))
        showToast(`Category ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
      } else {
        showToast("Failed to update category status", "error")
      }
    } catch (error) {
      console.error("Failed to toggle category status:", error)
      showToast("Failed to update category status", "error")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      {/* Safe Delete Modal */}
      <SafeDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setCategoryToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        item={categoryToDelete}
        type="category"
      />

      {/* Move Products Modal */}
      <MoveProductsModal
        isOpen={showMoveModal}
        onClose={() => {
          setShowMoveModal(false)
          setDeletionPending(null)
          setProductsToMove([])
        }}
        selectedCount={productsToMove.length}
        onMove={handleProductsMove}
      />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Parent Categories</h1>
              <p className="text-gray-600 mt-2">Manage your product categories • <span className="font-semibold">{categories.length} Total Categories</span></p>
            </div>
            {/* <Link
              to="/admin/add-category"
              className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Plus size={20} />
              <span>Add New Category</span>
            </Link> */}
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sort Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        Loading categories...
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No categories found
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-4 flex-shrink-0">
                              {category.image ? (
                                <div className="relative h-10 w-10">
                                  <img
                                    src={getFullImageUrl(category.image)}
                                    alt={category.name}
                                    className="h-10 w-10 rounded-lg object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.classList.add("hidden")
                                      const fallback = e.currentTarget.parentElement?.querySelector(
                                        "[data-image-error]",
                                      )
                                      if (fallback) fallback.classList.remove("hidden")
                                    }}
                                  />
                                  <div
                                    data-image-error
                                    className="hidden h-10 w-10 rounded-lg border border-orange-400 bg-orange-50 flex items-center justify-center px-1"
                                    title="Image exists but failed to load"
                                  >
                                    <span className="text-[9px] leading-tight font-semibold text-orange-700 text-center line-clamp-2">
                                      {category.name}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="h-10 w-10 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center"
                                  title="No image added"
                                >
                                  <span className="text-[10px] font-semibold text-gray-400">N/A</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {category.description || "No description"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              category.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.sortOrder || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleStatus(category._id)}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                category.isActive 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                              title={category.isActive ? 'Click to deactivate' : 'Click to activate'}
                            >
                              {category.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <Link
                              to={`/admin/categories/edit/${category._id}`}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={() => handleDelete(category._id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCategories
