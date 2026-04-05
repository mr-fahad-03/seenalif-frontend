"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ImageUpload from "../../components/ImageUpload"
import { ArrowLeft } from "lucide-react"
import axios from "axios"

import config from "../../config/config"
const REQUEST_TIMEOUT_MS = 30000

const AddBrand = () => {
  const navigate = useNavigate()
  const { id } = useParams() // id for edit mode
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    website: "",
    isActive: true,
  })
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    if (id) {
      setIsEdit(true)
      fetchBrand(id)
    } else {
      setIsEdit(false)
      setFormData({
        name: "",
        description: "",
        logo: "",
        website: "",
        isActive: true,
      })
    }
  }, [id])

  const fetchBrand = async (brandId) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/brands/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFormData({
        name: data.name || "",
        description: data.description || "",
        logo: data.logo || "",
        website: data.website || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
      })
    } catch (error) {
      showToast("Failed to load brand for editing", "error")
      navigate("/admin/brands")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleLogoUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      logo: imageUrl,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      if (isEdit && id) {
        await axios.put(`${config.API_URL}/api/brands/${id}`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: REQUEST_TIMEOUT_MS,
        })
        showToast("Brand updated successfully!", "success")
      } else {
        await axios.post(`${config.API_URL}/api/brands`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: REQUEST_TIMEOUT_MS,
        })
        showToast("Brand added successfully!", "success")
      }
      navigate("/admin/brands")
    } catch (error) {
      const isTimeout = error.code === "ECONNABORTED" || error.response?.status === 504
      if (isTimeout) {
        showToast("Request timed out. Please try again in a few seconds.", "error")
      } else {
        showToast(error.response?.data?.message || "Failed to save brand", "error")
      }
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
              <button onClick={() => navigate("/admin/brands")} className="hover:text-blue-600 flex items-center gap-1">
                <ArrowLeft size={16} />
                Brands
              </button>
              <span>/</span>
              <span className="text-gray-900">{isEdit ? "Edit Brand" : "Add Brand"}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{isEdit ? "Edit Brand" : "Add New Brand"}</h1>
          </div>
          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name <span className="text-red-500">*</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter brand description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo (WebP only)</label>
                <ImageUpload onImageUpload={handleLogoUpload} currentImage={formData.logo} label="Brand Logo" isProduct={true} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Active Brand</label>
              </div>
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/admin/brands")}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save Changes" : "Add Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddBrand
