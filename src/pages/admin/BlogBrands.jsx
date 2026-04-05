"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Plus, Search, Edit, Trash2, Tag, Package } from "lucide-react"
import axios from "axios"
import config from "../../config/config"
import { getFullImageUrl } from "../../utils/imageUtils"

const BlogBrands = () => {
  const { showToast } = useToast()
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await axios.get(`${config.API_URL}/api/blog-brands`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setBrands(response.data.blogBrands || response.data || [])
    } catch (error) {
      console.error("Error fetching blog brands:", error)
      showToast("Failed to fetch blog brands", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog brand?")) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`${config.API_URL}/api/blog-brands/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("Blog brand deleted successfully!", "success")
        fetchBrands()
      } catch (error) {
        console.error("Error deleting blog brand:", error)
        showToast("Failed to delete blog brand", "error")
      }
    }
  }

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog brands...</p>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Blog Brands</h1>
              <p className="text-gray-600 mt-2">Manage brands specifically for blog content</p>
            </div>
            <Link
              to="/admin/blog-brands/add"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Brand
            </Link>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search blog brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Brands Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredBrands.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Package size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog brands found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first blog brand"}
                </p>
                <Link
                  to="/admin/blog-brands/add"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Add First Brand
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredBrands.map((brand) => (
                  <div
                    key={brand._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {brand.logo ? (
                          <img
                            src={getFullImageUrl(brand.logo)}
                            alt={brand.name}
                            className="w-12 h-12 object-contain rounded"
                          />
                        ) : (
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Package className="text-purple-600" size={20} />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                          <p className="text-sm text-gray-500">{brand.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/blog-brands/edit/${brand._id}`}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit Brand"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(brand._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Brand"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {brand.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{brand.description}</p>
                    )}

                    {brand.website && (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:underline mb-4 block truncate"
                      >
                        {brand.website}
                      </a>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Tag size={14} />
                        <span>{brand.blogCount || 0} blogs</span>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs ${
                          brand.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {brand.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{brands.length}</div>
              <div className="text-sm text-gray-600">Total Brands</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{brands.filter((b) => b.isActive).length}</div>
              <div className="text-sm text-gray-600">Active Brands</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {brands.reduce((total, b) => total + (b.blogCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Blogs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogBrands
