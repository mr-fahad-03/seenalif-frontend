"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Plus, Edit, Trash2, Ruler, Eye, EyeOff } from "lucide-react"
import { useToast } from "../../context/ToastContext"

import config from "../../config/config"
const AdminUnits = () => {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingUnit, setEditingUnit] = useState(null)
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    type: "weight",
    isActive: true,
  })

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        setError("No authentication token found. Please login again.")
        setLoading(false)
        return
      }

      const response = await fetch(`${config.API_URL}/api/units/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUnits(data.filter((unit) => !unit.isDeleted))
      } else if (response.status === 401) {
        setError("Authentication failed. Please login again.")
      } else {
        setError("Failed to load units. Please try again later.")
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching units:", error)
      setError("Failed to load units. Please try again later.")
      setLoading(false)
    }
  }

  const handleToggleStatus = async (unitId) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      const unit = units.find(u => u._id === unitId)
      if (!unit) return

      const newStatus = !unit.isActive

      const response = await fetch(`${config.API_URL}/api/units/${unitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        // Update the unit in the local state
        setUnits(units.map(u => 
          u._id === unitId ? { ...u, isActive: newStatus } : u
        ))
        showToast(`Unit ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
      } else {
        showToast("Failed to update unit status", "error")
      }
    } catch (error) {
      console.error("Failed to toggle unit status:", error)
      showToast("Failed to update unit status", "error")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (editingUnit) {
        await axios.put(`${config.API_URL}/api/units/${editingUnit._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Unit updated successfully", "success")
      } else {
        await axios.post(`${config.API_URL}/api/units`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Unit created successfully", "success")
      }

      fetchUnits()
      setShowForm(false)
      setEditingUnit(null)
      setFormData({
        name: "",
        symbol: "",
        type: "weight",
        isActive: true,
      })
    } catch (error) {
      console.error("Unit save error:", error)
      showToast("Failed to save unit. Please try again.", "error")
    }
  }

  const handleEdit = (unit) => {
    setEditingUnit(unit)
    setFormData({
      name: unit.name,
      symbol: unit.symbol,
      type: unit.type,
      isActive: unit.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (unitId) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      try {
        const token =
          localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
        await axios.delete(`${config.API_URL}/api/units/${unitId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Unit deleted successfully", "success")
        fetchUnits()
      } catch (error) {
        console.error("Unit delete error:", error)
        showToast("Failed to delete unit", "error")
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingUnit(null)
    setFormData({
      name: "",
      symbol: "",
      type: "weight",
      isActive: true,
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 min-h-screen">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Units</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-lime-400 text-black font-medium py-2 px-4 rounded-md flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Add New Unit
            </button>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

          {showForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">{editingUnit ? "Edit Unit" : "Add New Unit"}</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Kilogram, Meter"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., kg, m"
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
                      <option value="weight">Weight</option>
                      <option value="length">Length</option>
                      <option value="volume">Volume</option>
                      <option value="area">Area</option>
                      <option value="piece">Piece</option>
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
                    {editingUnit ? "Update" : "Create"} Unit
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
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbol
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
                    {units.length > 0 ? (
                      units.map((unit) => (
                        <tr key={unit._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center">
                                  <Ruler className="h-5 w-5 text-purple-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">{unit.symbol}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                              {unit.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                unit.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {unit.isActive ? (
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
                                onClick={() => handleToggleStatus(unit._id)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                  unit.isActive 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                                title={unit.isActive ? 'Click to deactivate' : 'Click to activate'}
                              >
                                {unit.isActive ? 'Active' : 'Inactive'}
                              </button>
                              <button onClick={() => handleEdit(unit)} className="text-blue-600 hover:text-blue-900">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => handleDelete(unit._id)} className="text-red-600 hover:text-red-900">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No units found
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

export default AdminUnits
