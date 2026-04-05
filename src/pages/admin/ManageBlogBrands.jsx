"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Plus, Search, Filter, Edit, Trash2, Eye, Globe, X, Save } from "lucide-react"
import axios from "axios"
import config from "../../config/config"
import { getFullImageUrl } from "../../utils/imageUtils"

const ManageBlogBrands = () => {
  const { showToast } = useToast()
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [selectedBrands, setSelectedBrands] = useState([])

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
    website: "",
    isActive: true,
    metaTitle: "",
    metaDescription: "",
  })

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        showToast("Please login as admin first", "error")
        return
      }

      const { data } = await axios.get(`${config.API_URL}/api/blog-brands`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setBrands(data.blogBrands || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching blog brands:", error)
      showToast(error.response?.data?.message || "Failed to fetch blog brands", "error")
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Auto-generate slug from name
    if (name === "name" && !editingBrand) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("adminToken")
      const headers = { Authorization: `Bearer ${token}` }

      if (editingBrand) {
        await axios.put(`${config.API_URL}/api/blog-brands/${editingBrand._id}`, formData, { headers })
        showToast("Blog brand updated successfully", "success")
      } else {
        await axios.post(`${config.API_URL}/api/blog-brands`, formData, { headers })
        showToast("Blog brand created successfully", "success")
      }

      resetForm()
      fetchBrands()
    } catch (error) {
      console.error("Error saving blog brand:", error)
      showToast(error.response?.data?.message || "Failed to save blog brand", "error")
    }
  }

  const handleEdit = (brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || "",
      logo: brand.logo || "",
      website: brand.website || "",
      isActive: brand.isActive,
      metaTitle: brand.metaTitle || "",
      metaDescription: brand.metaDescription || "",
    })
    setShowEditModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog brand?")) return

    try {
      const token = localStorage.getItem("adminToken")
      await axios.delete(`${config.API_URL}/api/blog-brands/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      showToast("Blog brand deleted successfully", "success")
      fetchBrands()
    } catch (error) {
      console.error("Error deleting blog brand:", error)
      showToast(error.response?.data?.message || "Failed to delete blog brand", "error")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedBrands.length === 0) {
      showToast("Please select brands to delete", "warning")
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedBrands.length} brand(s)?`)) return

    try {
      const token = localStorage.getItem("adminToken")
      await axios.post(
        `${config.API_URL}/api/blog-brands/bulk-delete`,
        { ids: selectedBrands },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      showToast("Brands deleted successfully", "success")
      setSelectedBrands([])
      fetchBrands()
    } catch (error) {
      console.error("Error deleting brands:", error)
      showToast(error.response?.data?.message || "Failed to delete brands", "error")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      logo: "",
      website: "",
      isActive: true,
      metaTitle: "",
      metaDescription: "",
    })
    setEditingBrand(null)
    setShowAddModal(false)
    setShowEditModal(false)
  }

  const toggleBrandSelection = (id) => {
    setSelectedBrands((prev) => (prev.includes(id) ? prev.filter((brandId) => brandId !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedBrands.length === filteredBrands.length) {
      setSelectedBrands([])
    } else {
      setSelectedBrands(filteredBrands.map((brand) => brand._id))
    }
  }

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) || brand.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? brand.isActive : !brand.isActive)

    return matchesSearch && matchesStatus
  })

  const BrandForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
        <input
          type="text"
          name="logo"
          value={formData.logo}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
          <input
            type="text"
            name="metaTitle"
            value={formData.metaTitle}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
          <input
            type="text"
            name="metaDescription"
            value={formData.metaDescription}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="mr-2" />
        <label className="text-sm font-medium text-gray-700">Active</label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
          <Save className="w-4 h-4" />
          {editingBrand ? "Update" : "Create"} Brand
        </button>
      </div>
    </form>
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-600">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog Brands</h1>
              <p className="text-gray-600 mt-1">Manage your blog brands</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Brand
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {selectedBrands.length > 0 && (
                <button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedBrands.length})
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" checked={selectedBrands.length === filteredBrands.length && filteredBrands.length > 0} onChange={toggleSelectAll} />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blogs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((brand) => (
                    <tr key={brand._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input type="checkbox" checked={selectedBrands.includes(brand._id)} onChange={() => toggleBrandSelection(brand._id)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {brand.logo && <img src={getFullImageUrl(brand.logo)} alt={brand.name} className="w-10 h-10 rounded-full mr-3 object-cover" />}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                            {brand.description && <div className="text-sm text-gray-500 line-clamp-1">{brand.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{brand.slug}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {brand.website && (
                          <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            Visit
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{brand.blogCount || 0}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${brand.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                        >
                          {brand.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleEdit(brand)} className="text-blue-600 hover:text-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(brand._id)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No brands found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Add Blog Brand</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <BrandForm />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Blog Brand</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <BrandForm />
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageBlogBrands
