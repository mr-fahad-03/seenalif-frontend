"use client"

import { useState, useEffect } from "react"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Plus, Edit, Trash2, Calculator, Eye, EyeOff } from "lucide-react"
import { apiRequest } from "../../services/api"
import config from "../../config/config"

const AdminTax = () => {
  const [taxes, setTaxes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTax, setEditingTax] = useState(null)
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    rate: "",
    type: "percentage",
    description: "",
    isActive: true,
  })

  useEffect(() => {
    fetchTaxes()
  }, [])

  const fetchTaxes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        setError("No authentication token found. Please login again.")
        setLoading(false)
        return
      }

      const response = await fetch(`${config.API_URL}/api/tax/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTaxes(data.filter((tax) => !tax.isDeleted))
      } else if (response.status === 401) {
        setError("Authentication failed. Please login again.")
      } else {
        setError("Failed to load taxes. Please try again later.")
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching taxes:", error)
      setError("Failed to load taxes. Please try again later.")
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("adminToken")
      if (editingTax) {
        await apiRequest(`/api/taxes/${editingTax._id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        showToast("Tax updated successfully", "success")
      } else {
        await apiRequest("/api/taxes", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        showToast("Tax created successfully", "success")
      }
      fetchTaxes()
      setShowForm(false)
      setEditingTax(null)
      setFormData({
        name: "",
        rate: "",
        type: "percentage",
        description: "",
        isActive: true,
      })
    } catch (error) {
      console.error("Tax save error:", error)
      showToast("Failed to save tax. Please try again.", "error")
    }
  }

  const handleEdit = (tax) => {
    setEditingTax(tax)
    setFormData({
      name: tax.name,
      rate: tax.rate,
      type: tax.type,
      description: tax.description || "",
      isActive: tax.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (taxId) => {
    if (window.confirm("Are you sure you want to delete this tax?")) {
      try {
        const token = localStorage.getItem("adminToken")
        await apiRequest(`/api/taxes/${taxId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("Tax deleted successfully", "success")
        fetchTaxes()
      } catch (error) {
        console.error("Tax delete error:", error)
        showToast("Failed to delete tax.", "error")
      }
    }
  }

  const handleToggleStatus = async (taxId) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      const tax = taxes.find(t => t._id === taxId)
      if (!tax) return

      const newStatus = !tax.isActive

      const response = await fetch(`${config.API_URL}/api/tax/${taxId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        // Update the tax in the local state
        setTaxes(taxes.map(t => 
          t._id === taxId ? { ...t, isActive: newStatus } : t
        ))
        showToast(`Tax ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
      } else {
        showToast("Failed to update tax status", "error")
      }
    } catch (error) {
      console.error("Failed to toggle tax status:", error)
      showToast("Failed to update tax status", "error")
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTax(null)
    setFormData({
      name: "",
      rate: "",
      type: "percentage",
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
            <h1 className="text-2xl font-bold text-gray-900">Tax</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-lime-400 text-black font-medium py-2 px-4 rounded-md flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Add New Tax
            </button>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

          {showForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">{editingTax ? "Edit Tax" : "Add New Tax"}</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., VAT, GST"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 15.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount</option>
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
                    placeholder="Enter tax description"
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
                    {editingTax ? "Update" : "Create"} Tax
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
                        Tax
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
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
                    {taxes.length > 0 ? (
                      taxes.map((tax) => (
                        <tr key={tax._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-md bg-orange-100 flex items-center justify-center">
                                  <Calculator className="h-5 w-5 text-orange-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{tax.name}</div>
                                <div className="text-sm text-gray-500">{tax.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {tax.rate}
                              {tax.type === "percentage" ? "%" : " AED"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                              {tax.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                tax.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {tax.isActive ? (
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
                                onClick={() => handleToggleStatus(tax._id)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                  tax.isActive 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                                title={tax.isActive ? 'Click to deactivate' : 'Click to activate'}
                              >
                                {tax.isActive ? 'Active' : 'Inactive'}
                              </button>
                              <button onClick={() => handleEdit(tax)} className="text-blue-600 hover:text-blue-900">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => handleDelete(tax._id)} className="text-red-600 hover:text-red-900">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No taxes found
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

export default AdminTax
