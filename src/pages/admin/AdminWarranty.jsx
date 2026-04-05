"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Plus, Edit, Trash2, Shield, Eye, EyeOff } from "lucide-react"
import { useToast } from "../../context/ToastContext"
import { apiRequest } from "../../services/api"
import config from "../../config/config"

const AdminWarranty = () => {
  const [warranties, setWarranties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingWarranty, setEditingWarranty] = useState(null)
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    durationType: "months",
    description: "",
    isActive: true,
  })

  useEffect(() => {
    fetchWarranties()
  }, [])

  const fetchWarranties = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        setError("No authentication token found. Please login again.")
        setLoading(false)
        return
      }

      const response = await fetch(`${config.API_URL}/api/warranty/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setWarranties(data.filter((warranty) => !warranty.isDeleted))
      } else if (response.status === 401) {
        setError("Authentication failed. Please login again.")
      } else {
        setError("Failed to load warranties. Please try again later.")
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching warranties:", error)
      setError("Failed to load warranties. Please try again later.")
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("adminToken")
      if (editingWarranty) {
        await apiRequest(`/api/warranties/${editingWarranty._id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        showToast("Warranty updated successfully", "success")
      } else {
        await apiRequest("/api/warranties", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        showToast("Warranty created successfully", "success")
      }
      fetchWarranties()
      setShowForm(false)
      setEditingWarranty(null)
      setFormData({
        name: "",
        duration: "",
        durationType: "months",
        description: "",
        isActive: true,
      })
    } catch (error) {
      console.error("Warranty save error:", error)
      showToast("Failed to save warranty. Please try again.", "error")
    }
  }

  const handleEdit = (warranty) => {
    setEditingWarranty(warranty)
    setFormData({
      name: warranty.name,
      duration: warranty.duration,
      durationType: warranty.durationType,
      description: warranty.description || "",
      isActive: warranty.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (warrantyId) => {
    if (window.confirm("Are you sure you want to delete this warranty?")) {
      try {
        const token = localStorage.getItem("adminToken")
        await apiRequest(`/api/warranties/${warrantyId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("Warranty deleted successfully", "success")
        fetchWarranties()
      } catch (error) {
        console.error("Warranty delete error:", error)
        showToast("Failed to delete warranty", "error")
      }
    }
  }

  const handleToggleStatus = async (warrantyId) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      const warranty = warranties.find(w => w._id === warrantyId)
      if (!warranty) return

      const newStatus = !warranty.isActive

      const response = await fetch(`${config.API_URL}/api/warranty/${warrantyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        // Update the warranty in the local state
        setWarranties(warranties.map(w => 
          w._id === warrantyId ? { ...w, isActive: newStatus } : w
        ))
        showToast(`Warranty ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
      } else {
        showToast("Failed to update warranty status", "error")
      }
    } catch (error) {
      console.error("Failed to toggle warranty status:", error)
      showToast("Failed to update warranty status", "error")
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingWarranty(null)
    setFormData({
      name: "",
      duration: "",
      durationType: "months",
      description: "",
      isActive: true,
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 min-h-screen">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Warranty</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-lime-400 text-black font-medium py-2 px-4 rounded-md flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Add New Warranty
            </button>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

          {showForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">{editingWarranty ? "Edit Warranty" : "Add New Warranty"}</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Standard Warranty"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 12"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration Type</label>
                    <select
                      value={formData.durationType}
                      onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter warranty description"
                  />
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
                    {editingWarranty ? "Update" : "Create"} Warranty
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
                        Warranty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
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
                    {warranties.length > 0 ? (
                      warranties.map((warranty) => (
                        <tr key={warranty._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
                                  <Shield className="h-5 w-5 text-green-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{warranty.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {warranty.duration} {warranty.durationType}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {warranty.description || "No description"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                warranty.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {warranty.isActive ? (
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
                            <button
                              onClick={() => handleToggleStatus(warranty._id)}
                              className="ml-2 text-blue-600 hover:text-blue-900 text-xs"
                            >
                              {warranty.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleToggleStatus(warranty._id)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                  warranty.isActive 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                                title={warranty.isActive ? 'Click to deactivate' : 'Click to activate'}
                              >
                                {warranty.isActive ? 'Active' : 'Inactive'}
                              </button>
                              <button
                                onClick={() => handleEdit(warranty)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(warranty._id)}
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
                          No warranties found
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

export default AdminWarranty
