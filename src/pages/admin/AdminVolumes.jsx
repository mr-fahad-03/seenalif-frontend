"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Plus, Edit, Trash2, Box, Eye, EyeOff } from "lucide-react"
import { useToast } from "../../context/ToastContext"

import config from "../../config/config"
const AdminVolumes = () => {
  const [volumes, setVolumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingVolume, setEditingVolume] = useState(null)
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    value: "",
    unit: "",
    isActive: true,
  })

  useEffect(() => {
    fetchVolumes()
  }, [])

  const fetchVolumes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        setError("No authentication token found. Please login again.")
        setLoading(false)
        return
      }

      const response = await fetch(`${config.API_URL}/api/volumes/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setVolumes(data.filter((volume) => !volume.isDeleted))
      } else if (response.status === 401) {
        setError("Authentication failed. Please login again.")
      } else {
        setError("Failed to load volumes. Please try again later.")
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching volumes:", error)
      setError("Failed to load volumes. Please try again later.")
      setLoading(false)
    }
  }

  const handleToggleStatus = async (volumeId) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      const volume = volumes.find(v => v._id === volumeId)
      if (!volume) return

      const newStatus = !volume.isActive

      const response = await fetch(`${config.API_URL}/api/volumes/${volumeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        // Update the volume in the local state
        setVolumes(volumes.map(v => 
          v._id === volumeId ? { ...v, isActive: newStatus } : v
        ))
        showToast(`Volume ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
      } else {
        showToast("Failed to update volume status", "error")
      }
    } catch (error) {
      console.error("Failed to toggle volume status:", error)
      showToast("Failed to update volume status", "error")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (editingVolume) {
        await axios.put(`${config.API_URL}/api/volumes/${editingVolume._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Volume updated successfully", "success")
      } else {
        await axios.post(`${config.API_URL}/api/volumes`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Volume created successfully", "success")
      }

      fetchVolumes()
      setShowForm(false)
      setEditingVolume(null)
      setFormData({
        name: "",
        value: "",
        unit: "",
        isActive: true,
      })
    } catch (error) {
      console.error("Volume save error:", error)
      showToast("Failed to save volume. Please try again.", "error")
    }
  }

  const handleEdit = (volume) => {
    setEditingVolume(volume)
    setFormData({
      name: volume.name,
      value: volume.value,
      unit: volume.unit,
      isActive: volume.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (volumeId) => {
    if (window.confirm("Are you sure you want to delete this volume?")) {
      try {
        const token =
          localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
        await axios.delete(`${config.API_URL}/api/volumes/${volumeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Volume deleted successfully", "success")
        fetchVolumes()
      } catch (error) {
        console.error("Volume delete error:", error)
        showToast("Failed to delete volume", "error")
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingVolume(null)
    setFormData({
      name: "",
      value: "",
      unit: "",
      isActive: true,
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 min-h-screen">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Volumes</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-lime-400 text-black font-medium py-2 px-4 rounded-md flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Add New Volume
            </button>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

          {showForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">{editingVolume ? "Edit Volume" : "Add New Volume"}</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Volume Name</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <input
                      type="text"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 500, 1000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Unit</option>
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="oz">oz</option>
                      <option value="lb">lb</option>
                    </select>
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
                    {editingVolume ? "Update" : "Create"} Volume
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
                        Volume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
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
                    {volumes.length > 0 ? (
                      volumes.map((volume) => (
                        <tr key={volume._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                                  <Box className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{volume.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{volume.value}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{volume.unit}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                volume.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {volume.isActive ? (
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
                                onClick={() => handleToggleStatus(volume._id)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                  volume.isActive 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                                title={volume.isActive ? 'Click to deactivate' : 'Click to activate'}
                              >
                                {volume.isActive ? 'Active' : 'Inactive'}
                              </button>
                              <button
                                onClick={() => handleEdit(volume)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(volume._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No volumes found
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

export default AdminVolumes
