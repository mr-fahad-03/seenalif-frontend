"use client"

import { useState, useEffect } from "react"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import axios from "axios"
import Modal from "react-modal"
import { Trash2, Edit2, Plus, Search, X } from "lucide-react"
import config from "../../config/config"

// Set app element for react-modal accessibility
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root')
}

const AdminSEOSettings = () => {
  const { showToast } = useToast()
  const [redirects, setRedirects] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingRedirect, setEditingRedirect] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const [formData, setFormData] = useState({
    redirectFrom: "",
    redirectTo: "",
    redirectType: "301",
    status: "Active",
    description: "",
  })

  // Fetch all redirects
  const fetchRedirects = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      const response = await axios.get(`${config.API_URL}/api/redirects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setRedirects(response.data)
    } catch (error) {
      console.error("Error fetching redirects:", error)
      showToast("Failed to fetch redirects", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRedirects()
  }, [])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Add or update redirect
  const handleSaveRedirect = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.redirectFrom.trim()) {
      showToast("Redirect From URL is required", "error")
      return
    }

    if (!formData.redirectTo.trim()) {
      showToast("Redirect To URL is required", "error")
      return
    }

    if (!formData.redirectFrom.startsWith("/")) {
      showToast("Redirect From URL must start with /", "error")
      return
    }

    // Normalize URLs: remove trailing slashes (except for root)
    let normalizedFrom = formData.redirectFrom.trim()
    if (normalizedFrom.length > 1 && normalizedFrom.endsWith('/')) {
      normalizedFrom = normalizedFrom.slice(0, -1)
    }

    let normalizedTo = formData.redirectTo.trim()
    // Only normalize internal URLs (not external)
    if (!normalizedTo.startsWith('http://') && !normalizedTo.startsWith('https://')) {
      if (normalizedTo.length > 1 && normalizedTo.endsWith('/')) {
        normalizedTo = normalizedTo.slice(0, -1)
      }
    }

    try {
      const token = localStorage.getItem("adminToken")
      const axiosConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }

      const normalizedData = {
        ...formData,
        redirectFrom: normalizedFrom,
        redirectTo: normalizedTo
      }

      if (editingRedirect) {
        // Update existing redirect
        const response = await axios.put(
          `${config.API_URL}/api/redirects/${editingRedirect._id}`,
          normalizedData,
          axiosConfig,
        )
        setRedirects(redirects.map((r) => (r._id === response.data._id ? response.data : r)))
        showToast("Redirect updated successfully", "success")
      } else {
        // Create new redirect
        const response = await axios.post(`${config.API_URL}/api/redirects`, normalizedData, axiosConfig)
        setRedirects([response.data, ...redirects])
        showToast("Redirect added successfully", "success")
      }

      // Reset form
      setFormData({
        redirectFrom: "",
        redirectTo: "",
        redirectType: "301",
        status: "Active",
        description: "",
      })
      setEditingRedirect(null)
      setShowModal(false)
    } catch (error) {
      console.error("Error saving redirect:", error)
      showToast(error.response?.data?.message || "Failed to save redirect", "error")
    }
  }

  // Edit redirect
  const handleEditRedirect = (redirect) => {
    setEditingRedirect(redirect)
    setFormData({
      redirectFrom: redirect.redirectFrom,
      redirectTo: redirect.redirectTo,
      redirectType: redirect.redirectType,
      status: redirect.status,
      description: redirect.description || "",
    })
    setShowModal(true)
  }

  // Delete redirect
  const handleDeleteRedirect = async (id) => {
    if (!window.confirm("Are you sure you want to delete this redirect?")) {
      return
    }

    try {
      const token = localStorage.getItem("adminToken")
      await axios.delete(`${config.API_URL}/api/redirects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setRedirects(redirects.filter((r) => r._id !== id))
      showToast("Redirect deleted successfully", "success")
    } catch (error) {
      console.error("Error deleting redirect:", error)
      showToast("Failed to delete redirect", "error")
    }
  }

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRedirect(null)
    setFormData({
      redirectFrom: "",
      redirectTo: "",
      redirectType: "301",
      status: "Active",
      description: "",
    })
  }

  // Filter and search redirects
  const filteredRedirects = redirects.filter((redirect) => {
    const matchesSearch =
      !searchTerm ||
      redirect.redirectFrom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redirect.redirectTo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !filterStatus || redirect.status === filterStatus

    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SEO Settings</h1>
            <p className="text-gray-600 mt-1">Manage URL redirects for your store</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-lime-500 text-white px-4 py-2 rounded-lg hover:bg-lime-600 transition"
          >
            <Plus size={20} />
            Add Redirect
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search redirects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Redirects Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading redirects...</div>
          ) : filteredRedirects.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {redirects.length === 0
                ? "No redirects added yet. Add one to get started!"
                : "No redirects match your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">From URL</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">To URL</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRedirects.map((redirect) => (
                    <tr key={redirect._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono break-all">{redirect.redirectFrom}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono break-all">{redirect.redirectTo}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {redirect.redirectType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            redirect.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {redirect.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditRedirect(redirect)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRedirect(redirect._id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition"
                          >
                            <Trash2 size={16} />
                            Delete
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

        {/* Add/Edit Modal */}
        <Modal
        isOpen={showModal}
        onRequestClose={handleCloseModal}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
        style={{
          content: {
            position: 'relative',
            inset: 'auto',
          }
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingRedirect ? "Edit Product Redirect" : "Add Product Redirect"}
            </h2>
            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 transition">
              <X size={24} />
            </button>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            {editingRedirect ? "Update the redirect information" : "Add a new URL redirect for products"}
          </p>

          <form onSubmit={handleSaveRedirect} className="space-y-6">
            {/* Redirect From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Redirect From</label>
              <input
                type="text"
                name="redirectFrom"
                value={formData.redirectFrom}
                onChange={handleInputChange}
                placeholder="/old-product-url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
              <p className="text-xs text-gray-500 mt-1">The URL path to redirect from (must start with /). Trailing slashes will be automatically removed.</p>
            </div>

            {/* Redirect To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Redirect To</label>
              <input
                type="text"
                name="redirectTo"
                value={formData.redirectTo}
                onChange={handleInputChange}
                placeholder="/new-product-url or https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
              <p className="text-xs text-gray-500 mt-1">The destination URL (internal path or external URL). Trailing slashes will be automatically removed for internal URLs.</p>
            </div>

            {/* Redirect Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Redirect Type</label>
              <select
                name="redirectType"
                value={formData.redirectType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              >
                <option value="301">301 - Permanent Redirect</option>
                <option value="302">302 - Temporary Redirect</option>
                <option value="307">307 - Temporary Redirect (Preserve Method)</option>
                <option value="308">308 - Permanent Redirect (Preserve Method)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">HTTP status code for the redirect</p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Whether this redirect is currently active</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add notes about this redirect..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition font-medium"
              >
                {editingRedirect ? "Update Redirect" : "Add Redirect"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSEOSettings
