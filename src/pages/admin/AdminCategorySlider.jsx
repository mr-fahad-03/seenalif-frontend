"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { useToast } from "../../context/ToastContext"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"
import { Search } from "lucide-react"

const AdminCategorySlider = () => {
  const [allCategories, setAllCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState("all") // all, parent, 1, 2, 3, 4
  const [statusFilter, setStatusFilter] = useState("all") // all, active, inactive
  const [sliderFilter, setSliderFilter] = useState("all") // all, showing, notShowing
  const [sliderShape, setSliderShape] = useState("circle")
  const [layoutType, setLayoutType] = useState("default")
  const [parentCategories, setParentCategories] = useState([]) // List of parent categories
  const [selectedParentId, setSelectedParentId] = useState("all") // Selected parent for hierarchical filtering
  const [customSliderItems, setCustomSliderItems] = useState([]) // Custom slider-only items
  const [showCustomItemModal, setShowCustomItemModal] = useState(false)
  const [editingCustomItem, setEditingCustomItem] = useState(null)
  const [customItemForm, setCustomItemForm] = useState({ name: "", image: "", redirectUrl: "", isActive: true })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchAllCategories()
    fetchSettings()
    fetchCustomSliderItems()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, levelFilter, statusFilter, sliderFilter, selectedParentId, allCategories])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      const response = await fetch(`${config.API_URL}/api/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setSliderShape(data.categorySliderShape || "circle")
      setLayoutType(data.categorySliderLayoutType || "default")
    } catch (err) {
      console.error("Error fetching settings:", err)
    }
  }

  const updateSettings = async (updates) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      
      if (!token) {
        showToast("No authentication token found. Please login.", "error")
        return
      }

      const response = await fetch(`${config.API_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        showToast("Settings updated successfully! Refreshing...", "success")
        // Update local state
        if (updates.categorySliderShape) setSliderShape(updates.categorySliderShape)
        if (updates.categorySliderLayoutType) setLayoutType(updates.categorySliderLayoutType)
        
        // Refresh the page after a short delay to see changes on home page
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        console.error("Settings update failed:", data)
        showToast(data.message || "Failed to update settings", "error")
      }
    } catch (err) {
      console.error("Error updating settings:", err)
      showToast("Error updating settings: " + err.message, "error")
    }
  }

  const fetchAllCategories = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) {
        showToast("No authentication token found. Please login.", "error")
        setLoading(false)
        return
      }

      // Fetch both categories and subcategories
      const [catRes, subRes] = await Promise.all([
        fetch(`${config.API_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }),
        fetch(`${config.API_URL}/api/subcategories`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }),
      ])

      if (!catRes.ok || !subRes.ok) {
        showToast("Failed to load categories", "error")
        setLoading(false)
        return
      }

      const categories = await catRes.json()
      const subcategories = await subRes.json()

      // Store parent categories separately for the dropdown
      const parents = categories
        .filter((c) => !c.isDeleted)
        .map((c) => ({
          _id: c._id,
          name: c.name,
        }))
      setParentCategories(parents)

      // Combine and mark level
      const allItems = [
        ...categories
          .filter((c) => !c.isDeleted)
          .map((c) => ({
            ...c,
            levelType: "parent",
            levelLabel: "Parent Category",
            displayName: c.name,
            type: "category",
            parentCategoryId: null,
            parentCategoryName: null,
          })),
        ...subcategories
          .filter((s) => !s.isDeleted)
          .map((s) => {
            // Get parent category info
            const parentCatId = typeof s.category === 'object' ? s.category?._id : s.category
            const parentCat = categories.find(c => c._id === parentCatId)
            
            // Get parent subcategory info (for levels 2+)
            const parentSubId = typeof s.parentSubCategory === 'object' ? s.parentSubCategory?._id : s.parentSubCategory
            const parentSub = parentSubId ? subcategories.find(sub => sub._id === parentSubId) : null
            
            return {
              ...s,
              levelType: s.level || 1,
              levelLabel: `Level ${s.level || 1}`,
              displayName: `${s.name}`,
              type: "subcategory",
              parentCategoryId: parentCatId,
              parentCategoryName: parentCat?.name || s.categoryName || "Unknown",
              parentSubCategoryId: parentSubId,
              parentSubCategoryName: parentSub?.name || null,
            }
          }),
      ]

      setAllCategories(allItems)
      setFilteredCategories(allItems)
    } catch (err) {
      console.error(err)
      showToast("Error loading categories", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomSliderItems = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) return

      const response = await fetch(`${config.API_URL}/api/custom-slider-items`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCustomSliderItems(data)
      }
    } catch (err) {
      console.error("Error fetching custom slider items:", err)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate WEBP format only
      if (file.type !== 'image/webp') {
        showToast("Only WEBP image format is allowed. Please select a .webp file.", "error")
        e.target.value = '' // Clear the input
        return
      }

      // Validate max size (10MB)
      const maxSizeBytes = 10 * 1024 * 1024
      if (file.size > maxSizeBytes) {
        showToast("Image is too large. Maximum size is 10MB.", "error")
        e.target.value = ""
        return
      }
      
      setSelectedImage(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!selectedImage) return null

    try {
      setUploadingImage(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) {
        showToast("No authentication token found. Please login.", "error")
        return null
      }

      // Prefer the WebP-only endpoint first; fallback to generic single upload.
      const uploadEndpoints = [
        `${config.API_URL}/api/upload/product-image`,
        `${config.API_URL}/api/upload/single`,
      ]

      let lastError = "Upload failed"

      for (const endpoint of uploadEndpoints) {
        const formData = new FormData()
        formData.append("image", selectedImage)
        let timeout = null

        try {
          const controller = new AbortController()
          timeout = setTimeout(() => controller.abort(), 45000)

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
            signal: controller.signal,
          })

          clearTimeout(timeout)

          let data = null
          try {
            data = await response.json()
          } catch {
            data = null
          }

          if (response.ok) {
            return data?.url || data?.path || null
          }

          lastError = data?.message || `Upload failed (${response.status})`
          console.error(`Upload failed at ${endpoint}:`, lastError)
        } catch (err) {
          if (err?.name === "AbortError") {
            lastError = "Upload timed out. Please try again or use a smaller image."
          } else {
            lastError = err?.message || "Network error during upload"
          }
          console.error(`Upload error at ${endpoint}:`, err)
        } finally {
          if (timeout) clearTimeout(timeout)
        }
      }

      showToast(lastError, "error")
      return null
    } catch (err) {
      console.error("Error uploading image:", err)
      showToast(err?.message || "Error uploading image", "error")
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCustomItemSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) {
        showToast("No authentication token found. Please login.", "error")
        return
      }

      // Upload image if a new one is selected
      let imagePath = customItemForm.image
      if (selectedImage) {
        const uploadedPath = await uploadImage()
        if (!uploadedPath) {
          showToast("Failed to upload image. Please try again.", "error")
          return
        }
        imagePath = uploadedPath
      }

      if (!imagePath) {
        showToast("Please select an image", "error")
        return
      }

      const url = editingCustomItem 
        ? `${config.API_URL}/api/custom-slider-items/${editingCustomItem._id}`
        : `${config.API_URL}/api/custom-slider-items`
      
      const method = editingCustomItem ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...customItemForm,
          image: imagePath,
        }),
      })

      if (response.ok) {
        showToast(`Custom slider item ${editingCustomItem ? "updated" : "created"} successfully`, "success")
        setShowCustomItemModal(false)
        setEditingCustomItem(null)
        setCustomItemForm({ name: "", image: "", redirectUrl: "", isActive: true })
        setSelectedImage(null)
        setImagePreview(null)
        fetchCustomSliderItems()
      } else {
        const data = await response.json()
        showToast(data.message || "Failed to save custom slider item", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("Error saving custom slider item", "error")
    }
  }

  const handleDeleteCustomItem = async (id) => {
    if (!confirm("Are you sure you want to delete this custom slider item?")) return

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) {
        showToast("No authentication token found. Please login.", "error")
        return
      }

      const response = await fetch(`${config.API_URL}/api/custom-slider-items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        showToast("Custom slider item deleted successfully", "success")
        fetchCustomSliderItems()
      } else {
        showToast("Failed to delete custom slider item", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("Error deleting custom slider item", "error")
    }
  }

  const handleEditCustomItem = (item) => {
    setEditingCustomItem(item)
    setCustomItemForm({
      name: item.name,
      image: item.image,
      redirectUrl: item.redirectUrl,
      isActive: item.isActive
    })
    setSelectedImage(null)
    setImagePreview(getFullImageUrl(item.image))
    setShowCustomItemModal(true)
  }

  const toggleCustomItemStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) {
        showToast("No authentication token found. Please login.", "error")
        return
      }

      const response = await fetch(`${config.API_URL}/api/custom-slider-items/${id}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        showToast(`Custom item ${!currentStatus ? "activated" : "deactivated"} successfully`, "success")
        fetchCustomSliderItems()
      } else {
        showToast("Failed to update status", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("Error updating status", "error")
    }
  }

  const applyFilters = () => {
    let filtered = [...allCategories]

    // Apply parent category filter first (hierarchical)
    if (selectedParentId !== "all") {
      filtered = filtered.filter((item) => {
        // Include the parent category itself
        if (item.type === "category" && item._id === selectedParentId) {
          return true
        }
        // Include all subcategories that belong to this parent
        if (item.type === "subcategory" && item.parentCategoryId === selectedParentId) {
          return true
        }
        return false
      })
    }

    // Apply level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter((item) => String(item.levelType) === String(levelFilter))
    }

    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((item) => item.isActive === true)
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((item) => item.isActive === false)
    }

    // Apply slider filter
    if (sliderFilter === "showing") {
      filtered = filtered.filter((item) => item.showInSlider === true)
    } else if (sliderFilter === "notShowing") {
      filtered = filtered.filter((item) => item.showInSlider === false)
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.displayName?.toLowerCase().includes(term) ||
          item.parentCategoryName?.toLowerCase().includes(term) ||
          item.categoryName?.toLowerCase().includes(term)
      )
    }

    setFilteredCategories(filtered)
  }

  const toggleSlider = async (id, type, current) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) {
        showToast("No authentication token found. Please login.", "error")
        return
      }

      const newVal = !current
      // Optimistic UI
      setAllCategories(
        allCategories.map((it) => (it._id === id && it.type === type ? { ...it, showInSlider: newVal } : it))
      )

      const endpoint = type === "category" ? `${config.API_URL}/api/categories/${id}` : `${config.API_URL}/api/subcategories/${id}`

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ showInSlider: newVal }),
      })

      if (!res.ok) {
        showToast("Failed to update slider setting", "error")
        // revert
        setAllCategories(
          allCategories.map((it) => (it._id === id && it.type === type ? { ...it, showInSlider: current } : it))
        )
        return
      }

      showToast(`${newVal ? "Added to" : "Removed from"} slider`, "success")
    } catch (err) {
      console.error(err)
      showToast("Error updating slider", "error")
      setAllCategories(
        allCategories.map((it) => (it._id === id && it.type === type ? { ...it, showInSlider: current } : it))
      )
    }
  }

  const toggleStatus = async (id, type, current) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) {
        showToast("No authentication token found. Please login.", "error")
        return
      }

      const newVal = !current
      // Optimistic UI
      setAllCategories(
        allCategories.map((it) => (it._id === id && it.type === type ? { ...it, isActive: newVal } : it))
      )

      const endpoint = type === "category" ? `${config.API_URL}/api/categories/${id}` : `${config.API_URL}/api/subcategories/${id}`

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newVal }),
      })

      if (!res.ok) {
        showToast("Failed to update status", "error")
        // revert
        setAllCategories(
          allCategories.map((it) => (it._id === id && it.type === type ? { ...it, isActive: current } : it))
        )
        return
      }

      showToast(`${newVal ? "Activated" : "Deactivated"} successfully`, "success")
    } catch (err) {
      console.error(err)
      showToast("Error updating status", "error")
      setAllCategories(
        allCategories.map((it) => (it._id === id && it.type === type ? { ...it, isActive: current } : it))
      )
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Category Slider Manager</h1>
            <p className="text-sm text-gray-600">Select which categories should appear in the Home slider</p>
          </div>

          {/* Custom Slider Items Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900"> Custom Slider Items</h2>
                <p className="text-sm text-gray-600">Create promotional slides with custom URLs (not linked to products)</p>
              </div>
              <button
                onClick={() => {
                  setEditingCustomItem(null)
                  setCustomItemForm({ name: "", image: "", redirectUrl: "", isActive: true })
                  setSelectedImage(null)
                  setImagePreview(null)
                  setShowCustomItemModal(true)
                }}
                className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors font-medium"
              >
                + Add Custom Item
              </button>
            </div>

            {/* Custom Items List - Table View */}
            {customSliderItems.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-lime-50 border-b border-lime-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Redirect URL
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customSliderItems.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            {item.image ? (
                              <img
                                src={getFullImageUrl(item.image)}
                                alt={item.name}
                                className="h-12 w-12 object-cover rounded"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                                N/A
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={item.redirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm hover:underline max-w-xs truncate block"
                              title={item.redirectUrl}
                            >
                              {item.redirectUrl}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleCustomItemStatus(item._id, item.isActive)}
                              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                                item.isActive
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditCustomItem(item)}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCustomItem(item._id)}
                                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No custom slider items yet. Click "Add Custom Item" to create one!</p>
              </div>
            )}
          </div>

          {/* Custom Item Modal */}
          {showCustomItemModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingCustomItem ? "Edit Custom Slider Item" : "Add Custom Slider Item"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowCustomItemModal(false)
                        setEditingCustomItem(null)
                        setCustomItemForm({ name: "", image: "", redirectUrl: "", isActive: true })
                        setSelectedImage(null)
                        setImagePreview(null)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCustomItemSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customItemForm.name}
                        onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                        placeholder="e.g., Summer Sale, New Arrivals"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image *
                      </label>
                      
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="mb-3">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-32 w-auto object-cover rounded-lg border-2 border-gray-200"
                          />
                        </div>
                      )}

                      {/* File Upload Input */}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/webp"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="customItemImage"
                        />
                        <label
                          htmlFor="customItemImage"
                          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-lime-500 hover:bg-lime-50 transition-colors"
                        >
                          <div className="text-center">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <p className="mt-1 text-sm text-gray-600">
                              {selectedImage ? selectedImage.name : "Click to upload WEBP image"}
                            </p>
                            <p className="text-xs text-gray-500">Only WEBP format allowed (up to 10MB)</p>
                          </div>
                        </label>
                      </div>
                      
                      {!editingCustomItem && !selectedImage && (
                        <p className="text-xs text-red-500 mt-1">* Please select a WEBP image</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Redirect URL *
                      </label>
                      <input
                        type="text"
                        required
                        value={customItemForm.redirectUrl}
                        onChange={(e) => setCustomItemForm({ ...customItemForm, redirectUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                        placeholder="e.g., /shop/summer-sale or https://example.com/promo"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Where should users go when they click? (internal path or full URL)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="customItemActive"
                        checked={customItemForm.isActive}
                        onChange={(e) => setCustomItemForm({ ...customItemForm, isActive: e.target.checked })}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="customItemActive" className="text-sm text-gray-700">
                        Active (show in slider)
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={uploadingImage}
                        className="flex-1 px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors font-medium disabled:bg-lime-400 disabled:cursor-not-allowed"
                      >
                        {uploadingImage ? "Uploading..." : editingCustomItem ? "Update Item" : "Create Item"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomItemModal(false)
                          setEditingCustomItem(null)
                          setCustomItemForm({ name: "", image: "", redirectUrl: "", isActive: true })
                          setSelectedImage(null)
                          setImagePreview(null)
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Slider Design Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Slider Design Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Shape Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Image Shape</label>
                <select
                  value={sliderShape}
                  onChange={(e) => {
                    setSliderShape(e.target.value)
                    updateSettings({ categorySliderShape: e.target.value })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="circle">Circle</option>
                  <option value="square">Square</option>
                  <option value="octagon">Octagon</option>
                </select>
              </div>

              {/* Layout Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Card Design Type</label>
                <select
                  value={layoutType}
                  onChange={(e) => {
                    setLayoutType(e.target.value)
                    updateSettings({ categorySliderLayoutType: e.target.value })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="default">Default - Standard layout</option>
                  <option value="compact">Compact - Smaller with tight spacing</option>
                  <option value="modern">Modern - Rounded with shadow effects</option>
                  <option value="minimal">Minimal - Clean with subtle borders</option>
                  <option value="card">Card - Elevated card design</option>
                  <option value="banner">Banner - Gradient background style</option>
                  <option value="circularCard">Circular Card - Entire card in circular shape</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            {/* Hierarchical Parent Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📁 Select Parent Category (Hierarchical Filter)
              </label>
              <select
                value={selectedParentId}
                onChange={(e) => {
                  setSelectedParentId(e.target.value)
                  // Reset level filter when changing parent to show all levels under that parent
                  if (e.target.value !== "all") {
                    setLevelFilter("all")
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white"
              >
                <option value="all">🌐 All Categories (No Parent Filter)</option>
                {parentCategories.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    📂 {parent.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedParentId === "all" 
                  ? "Showing all categories from all parents"
                  : `Showing only categories under "${parentCategories.find(p => p._id === selectedParentId)?.name}"`
                }
              </p>
            </div>
            
            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All ({allCategories.length})
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "active"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Active ({allCategories.filter(c => c.isActive).length})
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "inactive"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Inactive ({allCategories.filter(c => !c.isActive).length})
              </button>
            </div>
              


               {/* Slider Status Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSliderFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sliderFilter === "all"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All ({allCategories.length})
              </button>
              <button
                onClick={() => setSliderFilter("showing")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sliderFilter === "showing"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Showing in Slider ({allCategories.filter(c => c.showInSlider).length})
              </button>
              <button
                onClick={() => setSliderFilter("notShowing")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sliderFilter === "notShowing"
                    ? "bg-gray-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Not Showing ({allCategories.filter(c => !c.showInSlider).length})
              </button>
            </div>
            {/* Level Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setLevelFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  levelFilter === "all"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All Levels {selectedParentId !== "all" && "(under selected parent)"}
              </button>
              <button
                onClick={() => setLevelFilter("parent")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  levelFilter === "parent"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                disabled={selectedParentId !== "all"}
                title={selectedParentId !== "all" ? "Parent filter is already selected above" : ""}
              >
                Parent Category
              </button>
              <button
                onClick={() => setLevelFilter("1")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  levelFilter === "1"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Level 1
              </button>
              <button
                onClick={() => setLevelFilter("2")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  levelFilter === "2"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Level 2
              </button>
              <button
                onClick={() => setLevelFilter("3")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  levelFilter === "3"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Level 3
              </button>
              <button
                onClick={() => setLevelFilter("4")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  levelFilter === "4"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Level 4
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Bulk Actions */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                {/* Slider Selection Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Slider:</span>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
                      if (!token) {
                        showToast("No authentication token found. Please login.", "error")
                        return
                      }
                      
                      try {
                        const updatePromises = filteredCategories.map(item => {
                          const endpoint = item.type === "category" 
                            ? `${config.API_URL}/api/categories/${item._id}` 
                            : `${config.API_URL}/api/subcategories/${item._id}`
                          
                          return fetch(endpoint, {
                            method: "PUT",
                            headers: { 
                              Authorization: `Bearer ${token}`, 
                              "Content-Type": "application/json" 
                            },
                            body: JSON.stringify({ showInSlider: true }),
                          })
                        })
                        
                        await Promise.all(updatePromises)
                        
                        setAllCategories(allCategories.map(cat => {
                          const isFiltered = filteredCategories.some(f => f._id === cat._id && f.type === cat.type)
                          return isFiltered ? { ...cat, showInSlider: true } : cat
                        }))
                        
                        showToast("All categories selected successfully", "success")
                      } catch (err) {
                        console.error(err)
                        showToast("Error selecting all categories", "error")
                      }
                    }}
                    className="px-3 py-1.5 bg-lime-500 text-white text-sm rounded-lg hover:bg-lime-600 transition-colors font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
                      if (!token) {
                        showToast("No authentication token found. Please login.", "error")
                        return
                      }
                      
                      try {
                        const updatePromises = filteredCategories.map(item => {
                          const endpoint = item.type === "category" 
                            ? `${config.API_URL}/api/categories/${item._id}` 
                            : `${config.API_URL}/api/subcategories/${item._id}`
                          
                          return fetch(endpoint, {
                            method: "PUT",
                            headers: { 
                              Authorization: `Bearer ${token}`, 
                              "Content-Type": "application/json" 
                            },
                            body: JSON.stringify({ showInSlider: false }),
                          })
                        })
                        
                        await Promise.all(updatePromises)
                        
                        setAllCategories(allCategories.map(cat => {
                          const isFiltered = filteredCategories.some(f => f._id === cat._id && f.type === cat.type)
                          return isFiltered ? { ...cat, showInSlider: false } : cat
                        }))
                        
                        showToast("All categories deselected successfully", "success")
                      } catch (err) {
                        console.error(err)
                        showToast("Error deselecting all categories", "error")
                      }
                    }}
                    className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Deselect All
                  </button>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-gray-300"></div>

                {/* Status Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
                      if (!token) {
                        showToast("No authentication token found. Please login.", "error")
                        return
                      }
                      
                      try {
                        const updatePromises = filteredCategories.map(item => {
                          const endpoint = item.type === "category" 
                            ? `${config.API_URL}/api/categories/${item._id}` 
                            : `${config.API_URL}/api/subcategories/${item._id}`
                          
                          return fetch(endpoint, {
                            method: "PUT",
                            headers: { 
                              Authorization: `Bearer ${token}`, 
                              "Content-Type": "application/json" 
                            },
                            body: JSON.stringify({ isActive: true }),
                          })
                        })
                        
                        await Promise.all(updatePromises)
                        
                        setAllCategories(allCategories.map(cat => {
                          const isFiltered = filteredCategories.some(f => f._id === cat._id && f.type === cat.type)
                          return isFiltered ? { ...cat, isActive: true } : cat
                        }))
                        
                        showToast("All categories activated successfully", "success")
                      } catch (err) {
                        console.error(err)
                        showToast("Error activating all categories", "error")
                      }
                    }}
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Activate All
                  </button>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
                      if (!token) {
                        showToast("No authentication token found. Please login.", "error")
                        return
                      }
                      
                      try {
                        const updatePromises = filteredCategories.map(item => {
                          const endpoint = item.type === "category" 
                            ? `${config.API_URL}/api/categories/${item._id}` 
                            : `${config.API_URL}/api/subcategories/${item._id}`
                          
                          return fetch(endpoint, {
                            method: "PUT",
                            headers: { 
                              Authorization: `Bearer ${token}`, 
                              "Content-Type": "application/json" 
                            },
                            body: JSON.stringify({ isActive: false }),
                          })
                        })
                        
                        await Promise.all(updatePromises)
                        
                        setAllCategories(allCategories.map(cat => {
                          const isFiltered = filteredCategories.some(f => f._id === cat._id && f.type === cat.type)
                          return isFiltered ? { ...cat, isActive: false } : cat
                        }))
                        
                        showToast("All categories deactivated successfully", "success")
                      } catch (err) {
                        console.error(err)
                        showToast("Error deactivating all categories", "error")
                      }
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Deactivate All
                  </button>
                </div>

                {/* Stats */}
                <div className="ml-auto text-sm text-gray-600">
                  <span className="font-medium">{filteredCategories.filter(c => c.showInSlider).length}</span> selected | 
                  <span className="font-medium ml-1">{filteredCategories.filter(c => c.isActive).length}</span> active
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checkbox</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hierarchy Path</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No categories found
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((item) => (
                      <tr key={`${item.type}-${item._id}`} className="hover:bg-gray-50 border-b">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={!!item.showInSlider}
                            onChange={() => toggleSlider(item._id, item.type, !!item.showInSlider)}
                            className="w-4 h-4 text-lime-500 border-gray-300 rounded focus:ring-lime-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          {item.image ? (
                            <img
                              src={getFullImageUrl(item.image)}
                              alt={item.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                              N/A
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.levelLabel}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-700">
                            {item.type === "category" ? (
                              <span className="font-semibold text-blue-600">🏠 Root Parent</span>
                            ) : (
                              <div className="space-y-1">
                                <div>
                                  <span className="font-semibold">Parent:</span>{" "}
                                  <span className="text-blue-600">{item.parentCategoryName}</span>
                                </div>
                                {item.parentSubCategoryName && (
                                  <div>
                                    <span className="font-semibold">Under:</span>{" "}
                                    <span className="text-purple-600">{item.parentSubCategoryName}</span>
                                  </div>
                                )}
                                <div className="text-gray-500 italic">
                                  {item.levelType === 1 && `${item.parentCategoryName} → ${item.name}`}
                                  {item.levelType === 2 && `${item.parentCategoryName} → ... → ${item.name}`}
                                  {item.levelType === 3 && `${item.parentCategoryName} → ... → ... → ${item.name}`}
                                  {item.levelType === 4 && `${item.parentCategoryName} → ... → ... → ... → ${item.name}`}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">
                            {item.showInSlider ? (
                              <span className="text-lime-600">Showing</span>
                            ) : (
                              <span className="text-gray-600">Not Showing</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleStatus(item._id, item.type, !!item.isActive)}
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full focus:outline-none transition-colors ${
                              item.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                            title={item.isActive ? "Click to deactivate" : "Click to activate"}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredCategories.length} of {allCategories.length} categories
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminCategorySlider
