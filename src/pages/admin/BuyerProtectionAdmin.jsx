"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Plus, Edit, Trash2, Shield, CheckCircle, X, Search } from "lucide-react"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import config from "../../config/config"

const BuyerProtectionAdmin = () => {
  const [protections, setProtections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProtection, setEditingProtection] = useState(null)
  const { showToast } = useToast()

  // Category and Product data
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [products, setProducts] = useState([])
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [showProductSearch, setShowProductSearch] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    type: "warranty",
    duration: "",
    price: "",
    pricingType: "fixed",
    pricePercentage: "",
    minPrice: "",
    maxPrice: "",
    applicationType: "all",
    parentCategories: [],
    categories: [],
    subCategories2: [],
    subCategories3: [],
    subCategories4: [],
    specificProducts: [],
    icon: "",
    features: [""],
    description: "",
    isActive: true,
    sortOrder: 0,
  })

  const protectionTypes = [
    { value: "warranty", label: "Extended Warranty" },
    { value: "damage_protection", label: "Damage Protection" },
    { value: "accidental_extended", label: "Accidental & Extended Warranty" },
  ]

  useEffect(() => {
    fetchProtections()
    fetchCategories()
    fetchSubCategories()
    fetchProducts()
  }, [])

  const fetchProtections = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/buyer-protection/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProtections(data)
    } catch (error) {
      showToast("Failed to load protection plans", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/categories`)
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories", error)
    }
  }

  const fetchSubCategories = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/subcategories`)
      setSubCategories(data)
    } catch (error) {
      console.error("Failed to load subcategories", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProducts(data.products || data)
    } catch (error) {
      console.error("Failed to load products", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData((prev) => ({ ...prev, features: newFeatures }))
  }

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }))
  }

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const handleCategoryToggle = (categoryId, categoryLevel) => {
    setFormData((prev) => {
      const currentCategories = prev[categoryLevel] || []
      const isSelected = currentCategories.includes(categoryId)

      return {
        ...prev,
        [categoryLevel]: isSelected
          ? currentCategories.filter((id) => id !== categoryId)
          : [...currentCategories, categoryId],
      }
    })
  }

  const handleProductToggle = (productId) => {
    setFormData((prev) => {
      const isSelected = prev.specificProducts.includes(productId)
      return {
        ...prev,
        specificProducts: isSelected
          ? prev.specificProducts.filter((id) => id !== productId)
          : [...prev.specificProducts, productId],
      }
    })
  }

  const getFilteredProducts = () => {
    if (!productSearchTerm) return products.slice(0, 50) // Limit initial display
    return products.filter((product) =>
      product.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.slug?.toLowerCase().includes(productSearchTerm.toLowerCase())
    )
  }

  const calculateProtectionPrice = (productPrice) => {
    if (formData.pricingType === "percentage" && formData.pricePercentage) {
      let calculated = (productPrice * parseFloat(formData.pricePercentage)) / 100
      
      if (formData.minPrice && calculated < parseFloat(formData.minPrice)) {
        calculated = parseFloat(formData.minPrice)
      }
      if (formData.maxPrice && calculated > parseFloat(formData.maxPrice)) {
        calculated = parseFloat(formData.maxPrice)
      }
      
      return calculated.toFixed(2)
    }
    return formData.price || '0.00'
  }

  const getSubCategoriesByLevel = (level, parentId = null) => {
    return subCategories.filter(sub => {
      if (sub.level !== level) return false
      if (level === 1) {
        return formData.parentCategories.includes(sub.category?._id || sub.category)
      }
      return parentId ? (sub.parentSubCategory?._id || sub.parentSubCategory) === parentId : false
    })
  }

  const getSelectedSubCategoriesByLevel = (level) => {
    const fieldName = level === 1 ? 'categories' : `subCategories${level}`
    return formData[fieldName] || []
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("adminToken")
      const filteredFeatures = formData.features.filter((f) => f.trim() !== "")

      // Validation
      if (formData.pricingType === "percentage") {
        const percentValue = parseFloat(formData.pricePercentage)
        if (!formData.pricePercentage || isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
          showToast("Price percentage must be between 0 and 100", "error")
          return
        }
      }

      if (formData.pricingType === "fixed") {
        const priceValue = parseFloat(formData.price)
        if (!formData.price || isNaN(priceValue) || priceValue <= 0) {
          showToast("Price is required and must be greater than 0 for fixed pricing", "error")
          return
        }
      }

      const payload = {
        ...formData,
        features: filteredFeatures,
        sortOrder: Number(formData.sortOrder) || 0,
      }

      // Set pricing fields based on type
      if (formData.pricingType === "percentage") {
        payload.pricePercentage = parseFloat(formData.pricePercentage)
        payload.price = 0 // Set to 0 for percentage-based
        payload.minPrice = formData.minPrice ? parseFloat(formData.minPrice) : undefined
        payload.maxPrice = formData.maxPrice ? parseFloat(formData.maxPrice) : undefined
      } else {
        payload.price = parseFloat(formData.price)
        payload.pricePercentage = undefined
        payload.minPrice = undefined
        payload.maxPrice = undefined
      }

      console.log('Submitting payload:', payload)

      if (editingProtection) {
        await axios.put(`${config.API_URL}/api/buyer-protection/${editingProtection._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("Protection plan updated successfully", "success")
      } else {
        await axios.post(`${config.API_URL}/api/buyer-protection`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("Protection plan created successfully", "success")
      }

      fetchProtections()
      resetForm()
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save protection plan", "error")
    }
  }

  const handleEdit = (protection) => {
    setEditingProtection(protection)
    setFormData({
      name: protection.name,
      type: protection.type,
      duration: protection.duration,
      price: protection.price || "",
      pricingType: protection.pricingType || "fixed",
      pricePercentage: protection.pricePercentage || "",
      minPrice: protection.minPrice || "",
      maxPrice: protection.maxPrice || "",
      applicationType: protection.applicationType || "all",
      parentCategories: protection.parentCategories?.map((c) => c._id || c) || [],
      categories: protection.categories?.map((c) => c._id || c) || [],
      subCategories2: protection.subCategories2?.map((c) => c._id || c) || [],
      subCategories3: protection.subCategories3?.map((c) => c._id || c) || [],
      subCategories4: protection.subCategories4?.map((c) => c._id || c) || [],
      specificProducts: protection.specificProducts?.map((p) => p._id || p) || [],
      icon: protection.icon || "",
      features: protection.features.length > 0 ? protection.features : [""],
      description: protection.description || "",
      isActive: protection.isActive,
      sortOrder: protection.sortOrder,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this protection plan?")) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`${config.API_URL}/api/buyer-protection/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("Protection plan deleted successfully", "success")
        fetchProtections()
      } catch (error) {
        showToast("Failed to delete protection plan", "error")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "warranty",
      duration: "",
      price: "",
      pricingType: "fixed",
      pricePercentage: "",
      minPrice: "",
      maxPrice: "",
      applicationType: "all",
      parentCategories: [],
      categories: [],
      subCategories2: [],
      subCategories3: [],
      subCategories4: [],
      specificProducts: [],
      icon: "",
      features: [""],
      description: "",
      isActive: true,
      sortOrder: 0,
    })
    setEditingProtection(null)
    setShowModal(false)
    setProductSearchTerm("")
    setShowProductSearch(false)
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "warranty":
        return "bg-green-100 text-green-800"
      case "damage_protection":
        return "bg-yellow-100 text-yellow-800"
      case "accidental_extended":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl ml-64 ">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="text-blue-600" size={36} />
                Buyer Protection Plans
              </h1>
              <p className="text-gray-600 mt-2">Manage warranty and protection plans for your products</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus size={20} />
              Add Protection Plan
            </button>
          </div>

        {/* Protection Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {protections.map((protection) => (
            <div
              key={protection._id}
              className={`bg-white border-2 rounded-xl p-6 shadow-sm hover:shadow-md transition-all ${
                protection.isActive ? "border-blue-200" : "border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(protection.type)}`}>
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{protection.duration}</h3>
                    <p className={`text-xs px-2 py-1 rounded-full ${getTypeColor(protection.type)} inline-block mt-1`}>
                      {protectionTypes.find((t) => t.value === protection.type)?.label}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(protection)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(protection._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-gray-900 mb-2">{protection.name}</h4>
              
              {/* Pricing Display */}
              {protection.pricingType === "percentage" ? (
                <div className="mb-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {protection.pricePercentage}% of Product Price
                  </p>
                  {(protection.minPrice || protection.maxPrice) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {protection.minPrice && `Min: AED${protection.minPrice}`}
                      {protection.minPrice && protection.maxPrice && " • "}
                      {protection.maxPrice && `Max: AED${protection.maxPrice}`}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-2xl font-bold text-blue-600 mb-4">AED{protection.price.toFixed(2)}</p>
              )}

              {/* Application Type Badge */}
              <div className="mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  protection.applicationType === "all" ? "bg-purple-100 text-purple-700" :
                  protection.applicationType === "categories" ? "bg-orange-100 text-orange-700" :
                  "bg-teal-100 text-teal-700"
                }`}>
                  {protection.applicationType === "all" ? "All Products" :
                   protection.applicationType === "categories" ? "Category-Based" :
                   `${protection.specificProducts?.length || 0} Specific Products`}
                </span>
              </div>

              {/* Categories/Products Display */}
              {protection.applicationType === "categories" && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Applied to:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {protection.parentCategories?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-blue-700 mb-1">Parent Categories:</p>
                        <div className="flex flex-wrap gap-1">
                          {protection.parentCategories.map((cat) => {
                            const categoryName = typeof cat === 'object' ? cat.name : categories.find((c) => c._id === cat)?.name
                            const categoryId = typeof cat === 'object' ? cat._id : cat
                            return categoryName ? (
                              <span key={categoryId} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {categoryName}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                    {protection.categories?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-700 mb-1">Level 1:</p>
                        <div className="flex flex-wrap gap-1">
                          {protection.categories.map((cat) => {
                            const categoryName = typeof cat === 'object' ? cat.name : subCategories.find((s) => s._id === cat)?.name
                            const categoryId = typeof cat === 'object' ? cat._id : cat
                            return categoryName ? (
                              <span key={categoryId} className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                {categoryName}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                    {protection.subCategories2?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-yellow-700 mb-1">Level 2:</p>
                        <div className="flex flex-wrap gap-1">
                          {protection.subCategories2.map((cat) => {
                            const categoryName = typeof cat === 'object' ? cat.name : subCategories.find((s) => s._id === cat)?.name
                            const categoryId = typeof cat === 'object' ? cat._id : cat
                            return categoryName ? (
                              <span key={categoryId} className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                                {categoryName}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                    {protection.subCategories3?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-orange-700 mb-1">Level 3:</p>
                        <div className="flex flex-wrap gap-1">
                          {protection.subCategories3.map((cat) => {
                            const categoryName = typeof cat === 'object' ? cat.name : subCategories.find((s) => s._id === cat)?.name
                            const categoryId = typeof cat === 'object' ? cat._id : cat
                            return categoryName ? (
                              <span key={categoryId} className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                                {categoryName}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                    {protection.subCategories4?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-purple-700 mb-1">Level 4:</p>
                        <div className="flex flex-wrap gap-1">
                          {protection.subCategories4.map((cat) => {
                            const categoryName = typeof cat === 'object' ? cat.name : subCategories.find((s) => s._id === cat)?.name
                            const categoryId = typeof cat === 'object' ? cat._id : cat
                            return categoryName ? (
                              <span key={categoryId} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                {categoryName}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {protection.applicationType === "products" && protection.specificProducts?.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Applied to specific products:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {protection.specificProducts.map((prod) => {
                      const productName = typeof prod === 'object' ? prod.name : products.find((p) => p._id === prod)?.name
                      const productPrice = typeof prod === 'object' ? (prod.salePrice || prod.price) : products.find((p) => p._id === prod)?.price
                      const productId = typeof prod === 'object' ? prod._id : prod
                      return productName ? (
                        <div key={productId} className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded flex items-center justify-between">
                          <span className="truncate">{productName}</span>
                          {productPrice && <span className="text-xs font-medium ml-2">AED{productPrice}</span>}
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {protection.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {protection.description && (
                <p className="text-sm text-gray-600 border-t pt-3">{protection.description}</p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">Sort Order: {protection.sortOrder}</span>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    protection.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {protection.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {protections.length === 0 && (
          <div className="text-center py-12">
            <Shield size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Protection Plans Yet</h3>
            <p className="text-gray-500">Create your first buyer protection plan to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingProtection ? "Edit Protection Plan" : "Add Protection Plan"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Extended Warranty Plan"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {protectionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2 YEARS"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing Configuration</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pricingType"
                        value="fixed"
                        checked={formData.pricingType === "fixed"}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Fixed Price
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pricingType"
                        value="percentage"
                        checked={formData.pricingType === "percentage"}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Percentage of Product Price
                    </label>
                  </div>
                </div>

                {formData.pricingType === "fixed" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (AED) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="468.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Percentage (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="pricePercentage"
                        value={formData.pricePercentage}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5"
                        step="0.01"
                        min="0"
                        max="100"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter percentage (0-100)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Price (AED)
                        </label>
                        <input
                          type="number"
                          name="minPrice"
                          value={formData.minPrice}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Price (AED)
                        </label>
                        <input
                          type="number"
                          name="maxPrice"
                          value={formData.maxPrice}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Application Scope */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Application Scope</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apply To <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="applicationType"
                        value="all"
                        checked={formData.applicationType === "all"}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      All Products
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="applicationType"
                        value="categories"
                        checked={formData.applicationType === "categories"}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Specific Categories
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="applicationType"
                        value="products"
                        checked={formData.applicationType === "products"}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Specific Products
                    </label>
                  </div>
                </div>

                {/* Category Selection */}
                {formData.applicationType === "categories" && (
                  <div className="space-y-4">
                    {/* Parent Categories Section */}
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">P</span>
                        Categories
                      </h4>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {categories.map((category) => (
                          <label key={category._id} className="flex items-center hover:bg-white p-2 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.parentCategories.includes(category._id)}
                              onChange={() => handleCategoryToggle(category._id, "parentCategories")}
                              className="mr-3 w-4 h-4"
                            />
                            <span className="text-sm font-medium text-gray-800">{category.name}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-blue-700 mt-2">Selected: {formData.parentCategories.length}</p>
                    </div>

                    {/* Level 1 Subcategories Section */}
                    {formData.parentCategories.length > 0 && getSubCategoriesByLevel(1).length > 0 && (
                      <div className="border rounded-lg p-4 bg-green-50">
                        <h4 className="text-md font-semibold text-green-900 mb-3 flex items-center">
                          <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">1</span>
                          Level 1 Subcategories
                        </h4>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {getSubCategoriesByLevel(1).map((subCat) => (
                            <label key={subCat._id} className="flex items-center hover:bg-white p-2 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={formData.categories.includes(subCat._id)}
                                onChange={() => handleCategoryToggle(subCat._id, "categories")}
                                className="mr-3 w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">{subCat.name}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-green-700 mt-2">Selected: {formData.categories.length}</p>
                      </div>
                    )}

                    {/* Level 2 Subcategories Section */}
                    {formData.categories.length > 0 && (
                      <div className="border rounded-lg p-4 bg-yellow-50">
                        <h4 className="text-md font-semibold text-yellow-900 mb-3 flex items-center">
                          <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">2</span>
                          Level 2 Subcategories
                        </h4>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {formData.categories.map(parentId => 
                            getSubCategoriesByLevel(2, parentId).map((subCat) => (
                              <label key={subCat._id} className="flex items-center hover:bg-white p-2 rounded transition-colors">
                                <input
                                  type="checkbox"
                                  checked={formData.subCategories2.includes(subCat._id)}
                                  onChange={() => handleCategoryToggle(subCat._id, "subCategories2")}
                                  className="mr-3 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{subCat.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                        <p className="text-xs text-yellow-700 mt-2">Selected: {formData.subCategories2.length}</p>
                      </div>
                    )}

                    {/* Level 3 Subcategories Section */}
                    {formData.subCategories2.length > 0 && (
                      <div className="border rounded-lg p-4 bg-orange-50">
                        <h4 className="text-md font-semibold text-orange-900 mb-3 flex items-center">
                          <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">3</span>
                          Level 3 Subcategories
                        </h4>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {formData.subCategories2.map(parentId => 
                            getSubCategoriesByLevel(3, parentId).map((subCat) => (
                              <label key={subCat._id} className="flex items-center hover:bg-white p-2 rounded transition-colors">
                                <input
                                  type="checkbox"
                                  checked={formData.subCategories3.includes(subCat._id)}
                                  onChange={() => handleCategoryToggle(subCat._id, "subCategories3")}
                                  className="mr-3 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{subCat.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                        <p className="text-xs text-orange-700 mt-2">Selected: {formData.subCategories3.length}</p>
                      </div>
                    )}

                    {/* Level 4 Subcategories Section */}
                    {formData.subCategories3.length > 0 && (
                      <div className="border rounded-lg p-4 bg-purple-50">
                        <h4 className="text-md font-semibold text-purple-900 mb-3 flex items-center">
                          <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">4</span>
                          Level 4 Subcategories
                        </h4>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {formData.subCategories3.map(parentId => 
                            getSubCategoriesByLevel(4, parentId).map((subCat) => (
                              <label key={subCat._id} className="flex items-center hover:bg-white p-2 rounded transition-colors">
                                <input
                                  type="checkbox"
                                  checked={formData.subCategories4.includes(subCat._id)}
                                  onChange={() => handleCategoryToggle(subCat._id, "subCategories4")}
                                  className="mr-3 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{subCat.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                        <p className="text-xs text-purple-700 mt-2">Selected: {formData.subCategories4.length}</p>
                      </div>
                    )}

                    {/* Overall Selection Summary */}
                    <div className="border rounded-lg p-3 bg-gray-100">
                      <p className="text-sm font-semibold text-gray-800">
                        Total Selected: {formData.parentCategories.length + formData.categories.length + formData.subCategories2.length + formData.subCategories3.length + formData.subCategories4.length} categories
                      </p>
                    </div>
                  </div>
                )}

                {/* Product Selection */}
                {formData.applicationType === "products" && (
                  <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                    <div className="flex items-center gap-2">
                      <Search size={18} className="text-gray-400" />
                      <input
                        type="text"
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {getFilteredProducts().map((product) => {
                        const productPrice = product.salePrice || product.price || 0
                        const protectionPrice = calculateProtectionPrice(productPrice)
                        
                        return (
                          <label key={product._id} className="flex items-start hover:bg-white p-2 rounded border border-gray-200">
                            <input
                              type="checkbox"
                              checked={formData.specificProducts.includes(product._id)}
                              onChange={() => handleProductToggle(product._id)}
                              className="mr-2 mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-sm flex-1">
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-xs text-gray-500">{product.slug}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-600">Product: AED{productPrice.toFixed(2)}</p>
                                  {formData.pricingType && (
                                    <p className="text-xs font-semibold text-blue-600">
                                      Protection: AED{protectionPrice}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {formData.specificProducts.length} product(s) selected
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional information about the protection plan"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Features</label>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Active after brand warranty"
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Active</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingProtection ? "Update" : "Create"} Protection Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default BuyerProtectionAdmin
