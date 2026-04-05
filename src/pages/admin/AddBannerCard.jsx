"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ImageUpload from "../../components/ImageUpload"
import { ArrowLeft } from "lucide-react"
import axios from "axios"
import config from "../../config/config"

const AddBannerCard = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [cardType, setCardType] = useState("custom") // "custom" or "existing"
  const [selectedItemType, setSelectedItemType] = useState("") // "category", "brand", or "product"
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [categorySearchTerm, setCategorySearchTerm] = useState("")
  const [brandSearchTerm, setBrandSearchTerm] = useState("")
  
  // All categories (flat)
  const [allCategories, setAllCategories] = useState([])
  
  // Selected category/brand IDs
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedBrandId, setSelectedBrandId] = useState("")
  
  // Products and Brands
  const [allProducts, setAllProducts] = useState([])
  const [allBrands, setAllBrands] = useState([])
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    details: "",
    image: "",
    bgImage: "",
    section: "",
    linkUrl: "",
    isActive: true,
    order: 1,
    bgColor: "#f3f4f6",
  })
  const [isEdit, setIsEdit] = useState(false)

  const sectionOptions = [
    { value: "home-category-cards", label: "Home – CategoryCards Section" },
    { value: "home-brands-cards", label: "Home – BrandsCards Section" },
    { value: "home-products-cards", label: "Home – ProductsCards Section" },
    { value: "home-flash-sale-cards", label: "Home – FlashSaleCards Section" },
    { value: "home-limited-sale-cards", label: "Home – LimitedSaleCards Section" },
  ]

  useEffect(() => {
    // Always fetch data for dropdowns
    fetchCategoriesBrandsProducts()
    
    if (id) {
      setIsEdit(true)
      fetchBannerCard(id)
    } else {
      setIsEdit(false)
      // Auto-populate section from URL parameter
      const sectionParam = searchParams.get('section')
      if (sectionParam) {
        setFormData((prev) => ({
          ...prev,
          section: sectionParam,
        }))
      }
    }
  }, [id, searchParams])

  const fetchCategoriesBrandsProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const [categoriesRes, subCategoriesRes, brandsRes, productsRes] = await Promise.all([
        axios.get(`${config.API_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.API_URL}/api/subcategories`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })), // Fallback if endpoint doesn't exist
        axios.get(`${config.API_URL}/api/brands`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.API_URL}/api/products`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ])
      
      // Combine categories and subcategories
      const categories = categoriesRes.data.filter(cat => !cat.isDeleted)
      const subcategories = subCategoriesRes.data.filter(sub => !sub.isDeleted)
      const allCats = [...categories, ...subcategories]
      
      console.log("📦 All Categories Loaded:", allCats.length)
      console.log("📦 Categories with parents:", allCats.filter(c => c.parentCategory).length)
      setAllCategories(allCats)
      
      setAllBrands(brandsRes.data.filter(b => !b.isDeleted))
      setAllProducts(productsRes.data.filter(p => !p.isDeleted))
    } catch (error) {
      console.error("Error fetching data:", error)
      showToast("Failed to load data", "error")
    }
  }

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm) return allCategories
    const term = categorySearchTerm.toLowerCase()
    return allCategories.filter(cat => {
      const name = cat.name || ""
      return name.toLowerCase().includes(term)
    })
  }, [allCategories, categorySearchTerm])

  // Filtered brands based on search
  const filteredBrands = useMemo(() => {
    if (!brandSearchTerm) return allBrands
    const term = brandSearchTerm.toLowerCase()
    return allBrands.filter(brand => {
      const name = brand.name || ""
      return name.toLowerCase().includes(term)
    })
  }, [allBrands, brandSearchTerm])

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId)
    const selectedCategory = allCategories.find(cat => cat._id === categoryId)
    if (selectedCategory) {
      setFormData(prev => ({
        ...prev,
        name: selectedCategory.name,
        slug: generateSlug(selectedCategory.name),
        image: selectedCategory.image || "",
        linkUrl: `/shop?category=${selectedCategory.slug}`,
        details: selectedCategory.description || "",
      }))
      setCategorySearchTerm("") // Clear search after selection
    }
  }

  const filteredProducts = useMemo(() => {
    if (!productSearchTerm) return allProducts
    const term = productSearchTerm.toLowerCase()
    return allProducts.filter(product => {
      const name = product.name || ""
      const sku = product.sku || ""
      return name.toLowerCase().includes(term) || sku.toLowerCase().includes(term)
    })
  }, [allProducts, productSearchTerm])

  // Handle product selection
  const handleProductSelect = (productId) => {
    const product = allProducts.find(p => p._id === productId)
    if (product) {
      setFormData(prev => ({
        ...prev,
        name: product.name,
        slug: generateSlug(product.name),
        image: product.images?.[0] || product.image || "",
        linkUrl: `/product/${product.slug}`,
        details: product.description || "",
      }))
      setProductSearchTerm("") // Clear search after selection
    }
  }

  // Handle brand selection
  const handleBrandSelect = (brandId) => {
    setSelectedBrandId(brandId)
    const brand = allBrands.find(b => b._id === brandId)
    if (brand) {
      setFormData(prev => ({
        ...prev,
        name: brand.name,
        slug: generateSlug(brand.name),
        image: brand.logo || brand.image || "",
        linkUrl: `/shop?brand=${brand.name}`,
        details: brand.description || "",
      }))
      setBrandSearchTerm("") // Clear search after selection
    }
  }

  const fetchBannerCard = async (cardId) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/banner-cards/${cardId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFormData({
        name: data.name || "",
        slug: data.slug || "",
        details: data.details || "",
        image: data.image || "",
        bgImage: data.bgImage || "",
        section: data.section || "",
        linkUrl: data.linkUrl || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order || 1,
        bgColor: data.bgColor || "#f3f4f6",
      })
    } catch (error) {
      showToast("Failed to load banner card for editing", "error")
      navigate("/admin/banner-cards")
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

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }))
  }

  const handleBgImageUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      bgImage: imageUrl,
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
    setFormData((prev) => ({
      ...prev,
      name: name,
      // Auto-generate slug from name when creating new card
      slug: isEdit ? prev.slug : generateSlug(name),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      if (isEdit && id) {
        await axios.put(`${config.API_URL}/api/banner-cards/${id}`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Banner card updated successfully!", "success")
      } else {
        await axios.post(`${config.API_URL}/api/banner-cards`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Banner card added successfully!", "success")
      }
      navigate("/admin/banner-cards")
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to save banner card",
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate("/admin/banner-cards")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Banner Cards
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? "Edit Banner Card" : "Add Banner Card"}
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Type Selection - Only show when creating new card */}
              {!isEdit && (
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Card Type *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="cardType"
                        value="custom"
                        checked={cardType === "custom"}
                        onChange={(e) => {
                          setCardType(e.target.value)
                          setSelectedItemType("")
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">Add Custom Card</span>
                        <p className="text-xs text-gray-500 mt-1">Create a card by entering data manually</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="cardType"
                        value="existing"
                        checked={cardType === "existing"}
                        onChange={(e) => setCardType(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">Use Existing Item</span>
                        <p className="text-xs text-gray-500 mt-1">Select from products, categories, or brands</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Existing Item Selection */}
              {!isEdit && cardType === "existing" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Item Type *
                    </label>
                    <select
                      value={selectedItemType}
                      onChange={(e) => {
                        setSelectedItemType(e.target.value)
                        setProductSearchTerm("")
                      }}
                      required={cardType === "existing"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Select Type --</option>
                      <option value="category">Category</option>
                      <option value="brand">Brand</option>
                      <option value="product">Product</option>
                    </select>
                  </div>

                  {/* Category Search & Selection */}
                  {selectedItemType === "category" && (
                    <div className="space-y-3">
                      {/* Search Bar */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search Categories
                        </label>
                        <input
                          type="text"
                          placeholder="Type to filter categories..."
                          value={categorySearchTerm}
                          onChange={(e) => setCategorySearchTerm(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Dropdown with All Categories */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          All Categories *
                        </label>
                        <select
                          value={selectedCategoryId}
                          onChange={(e) => handleCategorySelect(e.target.value)}
                          required={cardType === "existing" && selectedItemType === "category"}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-60"
                          size="10"
                        >
                          <option value="">-- Select a Category --</option>
                          {filteredCategories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name} {!cat.isActive && "(Inactive)"}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Showing {filteredCategories.length} of {allCategories.length} categories
                        </p>
                      </div>

                      {formData.name && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">
                            ✓ Selected: <strong>{formData.name}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Brand Search & Selection */}
                  {selectedItemType === "brand" && (
                    <div className="space-y-3">
                      {/* Search Bar */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search Brands
                        </label>
                        <input
                          type="text"
                          placeholder="Type to filter brands..."
                          value={brandSearchTerm}
                          onChange={(e) => setBrandSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Dropdown with All Brands */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          All Brands *
                        </label>
                        <select
                          value={selectedBrandId}
                          onChange={(e) => handleBrandSelect(e.target.value)}
                          required={cardType === "existing" && selectedItemType === "brand"}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-60"
                          size="10"
                        >
                          <option value="">-- Select a Brand --</option>
                          {filteredBrands.map((brand) => (
                            <option key={brand._id} value={brand._id}>
                              {brand.name} {!brand.isActive && "(Inactive)"}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Showing {filteredBrands.length} of {allBrands.length} brands
                        </p>
                      </div>

                      {formData.name && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">
                            ✓ Selected: <strong>{formData.name}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product Selection */}
                  {selectedItemType === "product" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search Products
                        </label>
                        <input
                          type="search"
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          placeholder="Filter by name or SKU"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Product *
                        </label>
                        <select
                          onChange={(e) => handleProductSelect(e.target.value)}
                          required={cardType === "existing" && selectedItemType === "product"}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          size={10}
                        >
                          <option value="">-- Select Product --</option>
                          {filteredProducts.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name} {product.sku && `(${product.sku})`} {!product.isActive && "(Inactive)"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  disabled={cardType === "existing" && !formData.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder={cardType === "existing" ? "Will be auto-filled from selected item" : "Enter banner card name"}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {cardType === "existing" ? "Auto-filled from selected item" : "Slug will be auto-generated from the name"}
                </p>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter banner card details"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Image *
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  This image will appear inside the card (below the text)
                </p>
                <ImageUpload
                  key="card-image"
                  currentImage={formData.image}
                  onImageUpload={handleImageUpload}
                  folder="banner-cards"
                />
              </div>

              {/* Background Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  If provided, this image will be used as the card's background. The text and content will appear on top of it.
                </p>
                <ImageUpload
                  key="background-image"
                  currentImage={formData.bgImage}
                  onImageUpload={handleBgImageUpload}
                  folder="banner-cards"
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link URL
                </label>
                <input
                  type="text"
                  name="linkUrl"
                  value={formData.linkUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="/product-category/electronics"
                />
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    name="bgColor"
                    value={formData.bgColor}
                    onChange={handleChange}
                    className="w-20 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.bgColor}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      // Check if it's a valid hex color or rgb/rgba
                      if (value.match(/^#[0-9A-Fa-f]{6}$/) || value.match(/^#[0-9A-Fa-f]{3}$/) || value.match(/^rgb\(/) || value.match(/^rgba\(/)) {
                        setFormData((prev) => ({ ...prev, bgColor: value }))
                      } else {
                        setFormData((prev) => ({ ...prev, bgColor: value }))
                      }
                    }}
                    placeholder="#ffedd5 or rgb(255,237,213)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Paste hex (#ffedd5) or RGB (rgb(255,237,213)) color code
                </p>
              </div>

              {/* Display Order on Home Page */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order on Home Page *
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter display order (e.g., 1, 2, 3...)"
                />
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
                    Active
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/admin/banner-cards")}
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
                  {loading ? "Saving..." : isEdit ? "Update" : "Add"} Banner Card
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddBannerCard
