"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ImageUpload from "../../components/ImageUpload"
import { ArrowLeft } from "lucide-react"
import axios from "axios"
import config from "../../config/config"

const AddHomeSection = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    key: "",
    description: "",
    isActive: true,
    order: 1,
    sectionType: "arrow-slider",
    settings: {
      cardsCount: 5,
      showArrows: true,
      backgroundColor: "#f3f4f6",
      sideImage: "",
    },
  })
  const [isEdit, setIsEdit] = useState(false)

  const sectionTypeOptions = [
    { value: "arrow-slider", label: "Arrow Slider Section (Choose 3-6 cards)" },
    { value: "background-image", label: "Background Image Section (5 cards on bg)" },
    { value: "cards-left-image-right", label: "3 Cards Left + Image Right (8+4 grid)" },
    { value: "cards-right-image-left", label: "3 Cards Right + Image Left (4+8 grid)" },
    { value: "simple-cards", label: "Simple Section (5 cards, optional bg color)" },
    { value: "vertical-grid", label: "Vertical Grid Section (Cards wrap to new rows)" },
  ]

  useEffect(() => {
    if (id) {
      setIsEdit(true)
      fetchHomeSection(id)
    } else {
      setIsEdit(false)
    }
  }, [id])

  const fetchHomeSection = async (sectionId) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/home-sections/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFormData({
        name: data.name || "",
        slug: data.slug || "",
        key: data.key || "",
        description: data.description || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order || 1,
        sectionType: data.sectionType || "arrow-slider",
        settings: data.settings || {
          cardsCount: 5,
          showArrows: true,
          backgroundColor: "#f3f4f6",
          sideImage: "",
        },
      })
    } catch (error) {
      showToast("Failed to load section for editing", "error")
      navigate("/admin/home-sections")
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

  const handleSectionTypeChange = (e) => {
    const newType = e.target.value
    
    // Set default settings based on section type
    let defaultSettings = {}
    
    switch(newType) {
      case "arrow-slider":
        defaultSettings = {
          cardsCount: 5,
          showArrows: true,
          backgroundColor: "#f3f4f6",
        }
        break
      case "background-image":
        defaultSettings = {
          cardsCount: 5,
          backgroundImage: "",
          overlayOpacity: 0.2,
        }
        break
      case "cards-left-image-right":
      case "cards-right-image-left":
        defaultSettings = {
          cardsCount: 3,
          sideImage: "",
          backgroundColor: "#f3f4f6",
        }
        break
      case "simple-cards":
        defaultSettings = {
          cardsCount: 5,
          backgroundColor: "#f3f4f6",
        }
        break
      case "vertical-grid":
        defaultSettings = {
          cardsPerRow: 4,
          backgroundColor: "#f3f4f6",
        }
        break
      default:
        defaultSettings = {}
    }
    
    setFormData((prev) => ({
      ...prev,
      sectionType: newType,
      settings: defaultSettings,
    }))
  }

  const handleSettingsChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }))
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const generateKey = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    const slug = "home-" + generateSlug(name)
    const key = generateKey(name) + "Cards"
    
    setFormData((prev) => ({
      ...prev,
      name: name,
      slug: slug,
      key: key,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      if (isEdit && id) {
        console.log('🔵 ADMIN: Saving section with settings:', JSON.stringify(formData.settings, null, 2))
        const response = await axios.put(`${config.API_URL}/api/home-sections/${id}`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        console.log('🟢 ADMIN: Server response after update:', JSON.stringify(response.data.settings, null, 2))
        showToast("Section updated successfully!", "success")
      } else {
        await axios.post(`${config.API_URL}/api/home-sections`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Section created successfully!", "success")
      }
      navigate("/admin/home-sections")
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to save section",
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this section? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`${config.API_URL}/api/home-sections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("Section deleted successfully!", "success")
        navigate("/admin/home-sections")
      } catch (error) {
        showToast("Failed to delete section", "error")
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
              onClick={() => navigate("/admin/home-sections")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home Sections
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? "Edit Home Section" : "Add Home Section"}
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter section name (e.g., Boom Offer)"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of this section"
                />
              </div>

              {/* Section Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Type *
                </label>
                <select
                  name="sectionType"
                  value={formData.sectionType}
                  onChange={handleSectionTypeChange}
                  required
                  disabled={isEdit}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEdit ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                >
                  {sectionTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {isEdit 
                    ? "Section Type cannot be changed after creation. Create a new section to use a different type."
                    : "The layout will be automatically created based on this type"
                  }
                </p>
              </div>

              {/* Dynamic Settings Based on Section Type */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Layout Settings</h3>
                
                {/* Arrow Slider Settings */}
                {formData.sectionType === "arrow-slider" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Cards to Display *
                      </label>
                      <select
                        value={formData.settings.cardsCount || 5}
                        onChange={(e) => handleSettingsChange('cardsCount', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={2}>2 Cards</option>
                        <option value={3}>3 Cards</option>
                        <option value={4}>4 Cards</option>
                        <option value={5}>5 Cards</option>
                        <option value={6}>6 Cards</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.settings.showArrows !== false}
                          onChange={(e) => handleSettingsChange('showArrows', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show Navigation Arrows</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                      </label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="color"
                          value={formData.settings.backgroundColor || "#f3f4f6"}
                          onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                          className="w-20 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.settings.backgroundColor || "#f3f4f6"}
                          onChange={(e) => handleSettingsChange('backgroundColor', e.target.value.trim())}
                          placeholder="#f3f4f6 or rgb(243,244,246)"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Paste hex (#f3f4f6) or RGB (rgb(243,244,246)) color code
                      </p>
                    </div>
                  </div>
                )}

                {/* Background Image Settings */}
                {formData.sectionType === "background-image" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Cards to Display *
                      </label>
                      <select
                        value={formData.settings.cardsCount || 5}
                        onChange={(e) => handleSettingsChange('cardsCount', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={2}>2 Cards</option>
                        <option value={3}>3 Cards</option>
                        <option value={4}>4 Cards</option>
                        <option value={5}>5 Cards</option>
                        <option value={6}>6 Cards</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Image *
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Upload the background image for this section
                      </p>
                      <ImageUpload
                        key="background-image"
                        currentImage={formData.settings.backgroundImage || ""}
                        onImageUpload={(url) => handleSettingsChange('backgroundImage', url)}
                        folder="home-sections"
                      />
                    </div>
                    <div>
                    </div>
                  </div>
                )}

                {/* Cards Left/Right + Image Settings */}
                {(formData.sectionType === "cards-left-image-right" || 
                  formData.sectionType === "cards-right-image-left") && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Cards (Fixed: 3)
                      </label>
                      <input
                        type="text"
                        value="3 Cards"
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Side Image *
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Upload the image that will appear alongside the cards
                      </p>
                      <ImageUpload
                        key="side-image"
                        currentImage={formData.settings.sideImage || ""}
                        onImageUpload={(url) => handleSettingsChange('sideImage', url)}
                        folder="home-sections"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                      </label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="color"
                          value={formData.settings.backgroundColor || "#f3f4f6"}
                          onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                          className="w-20 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.settings.backgroundColor || "#f3f4f6"}
                          onChange={(e) => handleSettingsChange('backgroundColor', e.target.value.trim())}
                          placeholder="#f3f4f6 or rgb(243,244,246)"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Paste hex (#f3f4f6) or RGB (rgb(243,244,246)) color code
                      </p>
                    </div>
                    <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                      <strong>Layout:</strong> {formData.sectionType === "cards-left-image-right" 
                        ? "8-grid (3 cards) + 4-grid (image)" 
                        : "4-grid (image) + 8-grid (3 cards)"}
                    </div>
                  </div>
                )}

                {/* Simple Cards Settings */}
                {formData.sectionType === "simple-cards" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Cards to Display *
                      </label>
                      <select
                        value={formData.settings.cardsCount || 5}
                        onChange={(e) => handleSettingsChange('cardsCount', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={2}>2 Cards</option>
                        <option value={3}>3 Cards</option>
                        <option value={4}>4 Cards</option>
                        <option value={5}>5 Cards</option>
                        <option value={6}>6 Cards</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color (Optional)
                      </label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="color"
                          value={formData.settings.backgroundColor || "#f3f4f6"}
                          onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                          className="w-20 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.settings.backgroundColor || "#f3f4f6"}
                          onChange={(e) => handleSettingsChange('backgroundColor', e.target.value.trim())}
                          placeholder="#f3f4f6 or rgb(243,244,246)"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Paste hex (#f3f4f6) or RGB (rgb(243,244,246)) color code
                      </p>
                    </div>
                  </div>
                )}

                {/* Vertical Grid Settings */}
                {formData.sectionType === "vertical-grid" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cards Per Row (Inline) *
                      </label>
                      <select
                        value={formData.settings.cardsPerRow || 4}
                        onChange={(e) => handleSettingsChange('cardsPerRow', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={2}>2 Cards Per Row</option>
                        <option value={3}>3 Cards Per Row</option>
                        <option value={4}>4 Cards Per Row</option>
                        <option value={5}>5 Cards Per Row</option>
                        <option value={6}>6 Cards Per Row</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Select how many cards to show horizontally. Additional cards will wrap to new rows automatically.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color (Optional)
                      </label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="color"
                          value={formData.settings.backgroundColor || "#f3f4f6"}
                          onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                          className="w-20 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.settings.backgroundColor || "#f3f4f6"}
                          onChange={(e) => handleSettingsChange('backgroundColor', e.target.value.trim())}
                          placeholder="#f3f4f6 or rgb(243,244,246)"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Paste hex (#f3f4f6) or RGB (rgb(243,244,246)) color code
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-gray-700">
                      <strong>How it works:</strong> Cards will be displayed in rows. If you add 12 cards and select 4 cards per row, they'll appear as 3 rows (4+4+4). You can add unlimited cards.
                    </div>
                  </div>
                )}
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order * (Position on Homepage)
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the exact position where you want this section to appear (e.g., 1 = first, 6 = sixth position). Each section must have a unique order number.
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
                    Active (show on home page)
                  </span>
                </label>
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
                      Delete Section
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/home-sections")}
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
                    {loading ? "Saving..." : isEdit ? "Update Section" : "Create Section"}
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

export default AddHomeSection
