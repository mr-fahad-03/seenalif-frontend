"use client"

import { useState, useEffect } from "react"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Plus, Edit, Trash2, Ruler, Eye, EyeOff } from "lucide-react"

import config from "../../config/config"
const AdminSizes = () => {
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSize, setEditingSize] = useState(null)
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "clothing",
    sortOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchSizes()
  }, [])

  const fetchSizes = async () => {
    try {
      setLoading(true)
      // Try different possible token keys
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        setError("No authentication token found. Please login again.")
        setLoading(false)
        return
      }

      // Use correct API endpoint - /api/sizes/admin
      const response = await fetch(`${config.API_URL}/api/sizes/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSizes(data.filter((size) => !size.isDeleted))
      } else if (response.status === 401) {
        setError("Authentication failed. Please login again.")
      } else {
        setError("Failed to load sizes. Please try again later.")
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching sizes:", error)
      setError("Failed to load sizes. Please try again later.")
      setLoading(false)
    }
  }

  const handleToggleStatus = async (sizeId) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      const size = sizes.find(s => s._id === sizeId)
      if (!size) return

      const newStatus = !size.isActive

      const response = await fetch(`${config.API_URL}/api/sizes/${sizeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        // Update the size in the local state
        setSizes(sizes.map(s => 
          s._id === sizeId ? { ...s, isActive: newStatus } : s
        ))
        showToast(`Size ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
      } else {
        showToast("Failed to update size status", "error")
      }
    } catch (error) {
      console.error("Failed to toggle size status:", error)
      showToast("Failed to update size status", "error")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (editingSize) {
        const response = await fetch(`${config.API_URL}/api/sizes/${editingSize._id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          showToast("Size updated successfully", "success")
        } else {
          showToast("Error updating size", "error")
        }
      } else {
        const response = await fetch(`${config.API_URL}/api/sizes`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          showToast("Size created successfully", "success")
        } else {
          showToast("Error creating size", "error")
        }
      }

      fetchSizes()
      setShowForm(false)
      setEditingSize(null)
      setFormData({
        name: "",
        code: "",
        category: "clothing",
        sortOrder: 0,
        isActive: true,
      })
    } catch (error) {
      console.error("Size save error:", error)
      showToast("Failed to save size. Please try again.", "error")
    }
  }

  const handleEdit = (size) => {
    setEditingSize(size)
    setFormData({
      name: size.name,
      code: size.code,
      category: size.category,
      sortOrder: size.sortOrder,
      isActive: size.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (sizeId) => {
    if (window.confirm("Are you sure you want to delete this size?")) {
      try {
        const token =
          localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

        const response = await fetch(`${config.API_URL}/api/sizes/${sizeId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          showToast("Size moved to trash successfully", "success")
          fetchSizes()
        } else {
          const errorData = await response.json()
          showToast(errorData.message || "Error deleting size", "error")
        }
      } catch (error) {
        console.error("Size delete error:", error)
        showToast("Failed to delete size.", "error")
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSize(null)
    setFormData({
      name: "",
      code: "",
      category: "clothing",
      sortOrder: 0,
      isActive: true,
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 min-h-screen">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Sizes</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-lime-400 text-black font-medium py-2 px-4 rounded-md flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Add New Size
            </button>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

          {showForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">{editingSize ? "Edit Size" : "Add New Size"}</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Small, Medium, Large"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., S, M, L"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="clothing">Clothing</option>
                      <option value="shoes">Shoes</option>
                      <option value="accessories">Accessories</option>
                      <option value="electronics">Electronics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: Number.parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {editingSize ? "Update" : "Create"} Size
                  </button>
                </div>
              </form>
            </div>
          )}

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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sort Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sizes.length > 0 ? (
                      sizes.map((size) => (
                        <tr key={size._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center">
                                  <Ruler className="h-5 w-5 text-indigo-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{size.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">{size.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                              {size.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{size.sortOrder}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                size.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {size.isActive ? (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleToggleStatus(size._id)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                  size.isActive 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                                title={size.isActive ? 'Click to deactivate' : 'Click to activate'}
                              >
                                {size.isActive ? 'Active' : 'Inactive'}
                              </button>
                              <button onClick={() => handleEdit(size)} className="text-blue-600 hover:text-blue-900">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => handleDelete(size._id)} className="text-red-600 hover:text-red-900">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No sizes found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSizes
