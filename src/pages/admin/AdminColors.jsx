"use client"

import { useState, useEffect } from "react"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"

import config from "../../config/config"
const AdminColors = () => {
  const [colors, setColors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingColor, setEditingColor] = useState(null)
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    hexCode: "#000000",
    isActive: true,
  })

  useEffect(() => {
    fetchColors()
  }, [])

  const fetchColors = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        setError("No authentication token found. Please login again.")
        setLoading(false)
        return
      }

      const response = await fetch(`${config.API_URL}/api/colors/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Colors data:", data)
        setColors(Array.isArray(data) ? data.filter((color) => !color.isDeleted) : [])
      } else if (response.status === 401) {
        setError("Authentication failed. Please login again.")
      } else {
        setError("Failed to load colors. Please try again later.")
      }
      setLoading(false)
    } catch (error) {
      console.error("Colors fetch error:", error)
      setError("Failed to load colors. Please try again later.")
      setLoading(false)
    }
  }

  const handleToggleStatus = async (colorId) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      const color = colors.find(c => c._id === colorId)
      if (!color) return

      const newStatus = !color.isActive

      const response = await fetch(`${config.API_URL}/api/colors/${colorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        // Update the color in the local state
        setColors(colors.map(c => 
          c._id === colorId ? { ...c, isActive: newStatus } : c
        ))
        showToast(`Color ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
      } else {
        showToast("Failed to update color status", "error")
      }
    } catch (error) {
      console.error("Failed to toggle color status:", error)
      showToast("Failed to update color status", "error")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (editingColor) {
        const response = await fetch(`${config.API_URL}/api/colors/${editingColor._id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          showToast("Color updated successfully", "success")
        } else {
          showToast("Error updating color", "error")
        }
      } else {
        const response = await fetch(`${config.API_URL}/api/colors`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          showToast("Color created successfully", "success")
        } else {
          showToast("Error creating color", "error")
        }
      }

      fetchColors()
      setShowForm(false)
      setEditingColor(null)
      setFormData({
        name: "",
        hexCode: "#000000",
        isActive: true,
      })
    } catch (error) {
      console.error("Color save error:", error)
      showToast("Failed to save color. Please try again.", "error")
    }
  }

  const handleEdit = (color) => {
    setEditingColor(color)
    setFormData({
      name: color.name,
      hexCode: color.hexCode || color.code || "#000000",
      isActive: color.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (colorId) => {
    if (window.confirm("Are you sure you want to delete this color?")) {
      try {
        const token =
          localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

        const response = await fetch(`${config.API_URL}/api/colors/${colorId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          showToast("Color moved to trash successfully", "success")
          fetchColors()
        } else {
          const errorData = await response.json()
          showToast(errorData.message || "Error deleting color", "error")
        }
      } catch (error) {
        console.error("Color delete error:", error)
        showToast("Failed to delete color.", "error")
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingColor(null)
    setFormData({
      name: "",
      hexCode: "#000000",
      isActive: true,
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 min-h-screen">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Colors</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-lime-400 text-black font-medium py-2 px-4 rounded-md flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Add New Color
            </button>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

          {showForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">{editingColor ? "Edit Color" : "Add New Color"}</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Red, Blue, Green"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hex Code</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.hexCode}
                        onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                        className="h-10 w-16 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        value={formData.hexCode}
                        onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#FF0000"
                        required
                      />
                    </div>
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
                    {editingColor ? "Update" : "Create"} Color
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
                        Color
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hex Code
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
                    {colors.length > 0 ? (
                      colors.map((color) => (
                        <tr key={color._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div
                                  className="h-10 w-10 rounded-md border border-gray-300"
                                  style={{ backgroundColor: color.hexCode || color.code || "#ccc" }}
                                ></div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{color.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">{color.hexCode || color.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                color.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {color.isActive ? (
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
                                onClick={() => handleToggleStatus(color._id)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                  color.isActive 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                                title={color.isActive ? 'Click to deactivate' : 'Click to activate'}
                              >
                                {color.isActive ? 'Active' : 'Inactive'}
                              </button>
                              <button
                                onClick={() => handleEdit(color)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit size={18} />
                              </button>
                              <button onClick={() => handleDelete(color._id)} className="text-red-600 hover:text-red-900">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                          No colors found
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

export default AdminColors
