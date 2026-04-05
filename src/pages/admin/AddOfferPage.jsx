"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ImageUpload from "../../components/ImageUpload"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import axios from "axios"
import config from "../../config/config"

const AddOfferPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    heroImage: "",
    cardImages: [],
    isActive: true,
    order: 1,
  })
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    if (id) {
      setIsEdit(true)
      fetchOfferPage(id)
    } else {
      setIsEdit(false)
    }
  }, [id])

  const fetchOfferPage = async (pageId) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/offer-pages/${pageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFormData({
        name: data.name || "",
        slug: data.slug || "",
        heroImage: data.heroImage || "",
        cardImages: data.cardImages || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order || 1,
      })
    } catch (error) {
      showToast("Failed to load offer page for editing", "error")
      navigate("/admin/offer-pages")
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

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    const slug = generateSlug(name)
    
    setFormData((prev) => ({
      ...prev,
      name: name,
      slug: isEdit ? prev.slug : slug,
    }))
  }

  const addCardImage = () => {
    if (formData.cardImages.length >= 3) {
      showToast("Maximum 3 card images allowed", "warning")
      return
    }
    setFormData((prev) => ({
      ...prev,
      cardImages: [
        ...prev.cardImages,
        { image: "", order: prev.cardImages.length + 1 },
      ],
    }))
  }

  const removeCardImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      cardImages: prev.cardImages.filter((_, i) => i !== index),
    }))
  }

  const updateCardImage = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      cardImages: prev.cardImages.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      ),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      if (isEdit && id) {
        await axios.put(`${config.API_URL}/api/offer-pages/${id}`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Offer page updated successfully!", "success")
      } else {
        await axios.post(`${config.API_URL}/api/offer-pages`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Offer page created successfully!", "success")
      }
      navigate("/admin/offer-pages")
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to save offer page",
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this offer page? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`${config.API_URL}/api/offer-pages/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("Offer page deleted successfully!", "success")
        navigate("/admin/offer-pages")
      } catch (error) {
        showToast("Failed to delete offer page", "error")
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate("/admin/offer-pages")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Offer Pages
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? "Edit Offer Page" : "Add Offer Page"}
            </h1>
            <p className="text-gray-600 mt-2">
              Create offer page layout. Add products to it later from the Offer Pages list.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                  Basic Information
                </h2>
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Boom Offer, Flash Sale, 70% Off"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., boom-offer, flash-sale"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be used in the URL: /offers/{formData.slug || 'your-slug'}
                  </p>
                </div>

                {/* Is Active */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Active (visible to users)
                    </span>
                  </label>
                </div>
              </div>

              {/* Hero Image */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                  Hero Section Image
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Banner Image
                  </label>
                  <ImageUpload
                    key="hero-banner"
                    currentImage={formData.heroImage || ""}
                    onImageUpload={(url) => setFormData(prev => ({ ...prev, heroImage: url }))}
                    folder="offer-pages"
                  />
                </div>
              </div>

              {/* Card Images (Max 3) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                      Card Images (Optional - Max 3)
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                      Add up to 3 promotional card images to display below the hero section
                    </p>
                  </div>
                  {formData.cardImages.length < 3 && (
                    <button
                      type="button"
                      onClick={addCardImage}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Card
                    </button>
                  )}
                </div>

                {formData.cardImages.map((card, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900">Card {index + 1} of 3</h3>
                      <button
                        type="button"
                        onClick={() => removeCardImage(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Image
                      </label>
                      <ImageUpload
                        key={`card-${index}`}
                        currentImage={card.image || ""}
                        onImageUpload={(url) => updateCardImage(index, 'image', url)}
                        folder="offer-pages/cards"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Next Step</h3>
                <p className="text-sm text-blue-800">
                  After creating this page, go to the Offer Pages list, select this page, and then add products to it.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-between gap-4 pt-4 border-t">
                <div>
                  {isEdit && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                      disabled={loading}
                    >
                      Delete Offer Page
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/offer-pages")}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {loading ? "Saving..." : isEdit ? "Update Offer Page" : "Create Offer Page"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddOfferPage
