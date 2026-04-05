"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ImageUpload from "../../components/ImageUpload"
import TipTapEditor from "../../components/TipTapEditor"
import { ArrowLeft } from "lucide-react"
import axios from "axios"

import config from "../../config/config"
const AddCategory = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    seoContent: "",
    metaTitle: "",
    metaDescription: "",
    customSchema: "",
    redirectUrl: "",
    image: "",
    isActive: true,
    sortOrder: 0,
  })
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    if (id) {
      setIsEdit(true)
      setLoading(true)
      // Fetch category data
      const token = localStorage.getItem("adminToken")
      fetch(`${config.API_URL}/api/categories/${id}/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            name: data.name || "",
            description: data.description || "",
            seoContent: data.seoContent || "",
            metaTitle: data.metaTitle || "",
            metaDescription: data.metaDescription || "",
            customSchema: data.customSchema || "",
            redirectUrl: data.redirectUrl || "",
            image: data.image || "",
            isActive: data.isActive !== undefined ? data.isActive : true,
            sortOrder: data.sortOrder || 0,
          })
        })
        .catch((err) => {
          showToast("Failed to load category", "error")
        })
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }))
  }

  const handleSeoContentChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      seoContent: content,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      if (isEdit) {
        await axios.put(`${config.API_URL}/api/categories/${id}`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Category updated successfully!", "success")
      } else {
        await axios.post(`${config.API_URL}/api/categories`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Category added successfully!", "success")
      }
      navigate("/admin/categories")
    } catch (error) {
      console.error("Error saving category:", error)
      showToast(error.response?.data?.message || `Failed to ${isEdit ? "update" : "add"} category`, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <button
                onClick={() => navigate("/admin/categories")}
                className="hover:text-blue-600 flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Categories
              </button>
              <span>/</span>
              <span className="text-gray-900">{isEdit ? "Edit Category" : "Add Category"}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{isEdit ? "Edit Category" : "Add New Category"}</h1>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Content</label>
                <TipTapEditor
                  content={formData.seoContent}
                  onChange={handleSeoContentChange}
                  placeholder="Enter detailed SEO content for this category..."
                />
                <p className="text-sm text-gray-500 mt-1">This content will be displayed on the category page for SEO purposes.</p>
              </div>

              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                  <span className="text-gray-500 text-xs ml-2">(Up to 100 characters)</span>
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Best Printers & Copiers in UAE | Grabatoz"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-500">
                    SEO title that appears in search engine results
                  </p>
                  <span className="text-xs text-gray-400">
                    {formData.metaTitle.length}/100
                  </span>
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                  <span className="text-gray-500 text-xs ml-2">(Up to 300 characters)</span>
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={3}
                  maxLength={300}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Shop top-quality printers and copiers in UAE. Free delivery, expert support, and warranty included. Browse Canon, HP, Epson and more."
                />
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-500">
                    Description that appears below the title in search results
                  </p>
                  <span className="text-xs text-gray-400">
                    {formData.metaDescription.length}/300
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Schema Markup (HTML/JS)
                </label>
                <textarea
                  name="customSchema"
                  value={formData.customSchema}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder={'<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "CollectionPage",\n  "name": "Category Name"\n}\n</script>'}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Paste schema script/HTML. It is injected into page head for Google and not shown to users.
                </p>
              </div>

              {/* Redirect URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redirect URL
                  <span className="text-gray-500 text-xs ml-2">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="redirectUrl"
                  value={formData.redirectUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., /shop/new-category-name or https://example.com/page"
                />
                <p className="text-sm text-gray-500 mt-1">
                  If set, visitors will be redirected to this URL when accessing this category
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image (WebP only)</label>
                <ImageUpload onImageUpload={handleImageUpload} currentImage={formData.image} isProduct={true} />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Active Category</label>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/admin/categories")}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save Changes" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCategory
