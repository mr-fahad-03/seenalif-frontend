"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react"
import axios from "axios"

import config from "../../config/config"
const AdminDeliveryCharges = () => {
  const { showToast } = useToast()
  const [deliveryCharges, setDeliveryCharges] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: "" })

  useEffect(() => {
    fetchDeliveryCharges()
  }, [])

  const fetchDeliveryCharges = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      const { data } = await axios.get(`${config.API_URL}/api/delivery-charges/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setDeliveryCharges(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching delivery charges:", error)
      showToast("Failed to fetch delivery charges", "error")
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      await axios.patch(
        `${config.API_URL}/api/delivery-charges/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      showToast("Status updated successfully", "success")
      fetchDeliveryCharges()
    } catch (error) {
      console.error("Error updating status:", error)
      showToast("Failed to update status", "error")
    }
  }

  const handleDelete = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      await axios.delete(`${config.API_URL}/api/delivery-charges/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      showToast("Delivery charge deleted successfully", "success")
      setDeleteModal({ show: false, id: null, name: "" })
      fetchDeliveryCharges()
    } catch (error) {
      console.error("Error deleting delivery charge:", error)
      showToast("Failed to delete delivery charge", "error")
    }
  }

  const filteredDeliveryCharges = deliveryCharges.filter(
    (charge) =>
      charge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatPrice = (price) => {
    return `${Number(price).toLocaleString()} AED`
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Delivery Charges</h1>
              <p className="text-gray-600 mt-2">Manage delivery charges and shipping options</p>
            </div>
          
          </div>

          {/* Search and Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search delivery charges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{deliveryCharges.length}</div>
                  <div className="text-gray-600">Total Charges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {deliveryCharges.filter((charge) => charge.isActive).length}
                  </div>
                  <div className="text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {deliveryCharges.filter((charge) => !charge.isActive).length}
                  </div>
                  <div className="text-gray-600">Inactive</div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Charges Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Name</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Charge</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Order Range</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Delivery Time</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Areas</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDeliveryCharges.length > 0 ? (
                    filteredDeliveryCharges.map((charge) => (
                      <tr key={charge._id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-gray-900">{charge.name}</div>
                            {charge.description && (
                              <div className="text-sm text-gray-500 mt-1">{charge.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{formatPrice(charge.charge)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {charge.minOrderAmount > 0 && `Min: ${formatPrice(charge.minOrderAmount)}`}
                            {charge.minOrderAmount > 0 && charge.maxOrderAmount && <br />}
                            {charge.maxOrderAmount && `Max: ${formatPrice(charge.maxOrderAmount)}`}
                            {charge.minOrderAmount === 0 && !charge.maxOrderAmount && "No limits"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">{charge.deliveryTime}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {charge.applicableAreas && charge.applicableAreas.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {charge.applicableAreas.slice(0, 2).map((area, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {area}
                                  </span>
                                ))}
                                {charge.applicableAreas.length > 2 && (
                                  <span className="text-xs text-gray-500">
                                    +{charge.applicableAreas.length - 2} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              "All areas"
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleStatus(charge._id)}
                            className={`flex items-center ${
                              charge.isActive ? "text-green-600" : "text-gray-400"
                            } hover:opacity-75 transition-opacity`}
                          >
                            {charge.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                            <span className="ml-2 text-sm">{charge.isActive ? "Active" : "Inactive"}</span>
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Link
                              to={`/admin/delivery-charges/edit/${charge._id}`}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() =>
                                setDeleteModal({
                                  show: true,
                                  id: charge._id,
                                  name: charge.name,
                                })
                              }
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="text-gray-500">
                          {searchTerm
                            ? "No delivery charges found matching your search."
                            : "No delivery charges found."}
                        </div>
                        {!searchTerm && (
                          <Link
                            to="/admin/delivery-charges/add"
                            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <Plus size={16} className="mr-1" />
                            Add your first delivery charge
                          </Link>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Delivery Charge</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteModal.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteModal({ show: false, id: null, name: "" })}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDeliveryCharges
