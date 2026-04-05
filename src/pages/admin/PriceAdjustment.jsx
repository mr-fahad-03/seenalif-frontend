"use client"

import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { useToast } from "../../context/ToastContext"
import { Search, CheckSquare, Square, TrendingUp, Percent, DollarSign, X } from "lucide-react"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"

const PriceAdjustment = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [filteredSubcategories, setFilteredSubcategories] = useState([])
  const [filteredSubcategories2, setFilteredSubcategories2] = useState([])
  const [filteredSubcategories3, setFilteredSubcategories3] = useState([])
  const [filteredSubcategories4, setFilteredSubcategories4] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterParentCategory, setFilterParentCategory] = useState("all")
  const [filterSubCategory, setFilterSubCategory] = useState("all") // Level 1
  const [filterSubCategory2, setFilterSubCategory2] = useState("all")
  const [filterSubCategory3, setFilterSubCategory3] = useState("all")
  const [filterSubCategory4, setFilterSubCategory4] = useState("all")
  const [filterBrand, setFilterBrand] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState("both") // both, base_only, offer_only
  const [adjustmentMethod, setAdjustmentMethod] = useState("percentage") // percentage, fixed_amount
  const [adjustmentValue, setAdjustmentValue] = useState("")
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const { showToast } = useToast()

  // Derived counters
  const totalSelected = useMemo(() => selectedIds.size, [selectedIds])

  const formatPrice = (price) => {
    return `AED ${price.toLocaleString()}`
  }

  // Get admin token with proper validation
  const getAdminToken = () => {
    const adminToken = localStorage.getItem("adminToken")
    const regularToken = localStorage.getItem("token")
    const token = adminToken || regularToken
    return token
  }

  useEffect(() => {
    fetchProducts()
  }, [
    searchTerm,
    filterParentCategory,
    filterSubCategory,
    filterSubCategory2,
    filterSubCategory3,
    filterSubCategory4,
    filterBrand,
    filterStatus,
  ])

  useEffect(() => {
    fetchCategories()
    fetchBrands()
    fetchSubcategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = getAdminToken()

      if (!token) {
        setError("Authentication required. Please login again.")
        return
      }

      const params = {}
      if (searchTerm.trim() !== "") params.search = searchTerm.trim()
      if (filterParentCategory && filterParentCategory !== "all") params.parentCategory = filterParentCategory
      if (filterSubCategory && filterSubCategory !== "all") params.category = filterSubCategory
      if (filterSubCategory2 && filterSubCategory2 !== "all") params.subCategory2 = filterSubCategory2
      if (filterSubCategory3 && filterSubCategory3 !== "all") params.subCategory3 = filterSubCategory3
      if (filterSubCategory4 && filterSubCategory4 !== "all") params.subCategory4 = filterSubCategory4
      if (filterBrand && filterBrand !== "all") params.brand = filterBrand
      if (filterStatus && filterStatus !== "all") {
        if (filterStatus === "onhold") {
          params.onHold = true
        } else {
          params.isActive = filterStatus === "active"
          params.onHold = false
        }
      }

      const { data } = await axios.get(`${config.API_URL}/api/price-adjustment/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      })

      setProducts(data.products || [])
      setLoading(false)
    } catch (error) {
      console.error("Failed to load products:", error)
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.")
        window.location.href = "/grabiansadmin/login"
      } else {
        setError("Failed to load products. Please try again later.")
      }
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = getAdminToken()
      if (!token) return

      const { data } = await axios.get(`${config.API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const fetchSubcategories = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/subcategories`)
      const validSubcategories = Array.isArray(data) ? data.filter((sub) => sub && sub.category && sub.category._id) : []
      setSubcategories(validSubcategories)
    } catch (error) {
      console.error("Failed to load subcategories:", error)
      setSubcategories([])
    }
  }

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/brands`)
      setBrands(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load brands:", error)
    }
  }

  // Cascading level filters
  useEffect(() => {
    if (filterParentCategory === "all") {
      setFilteredSubcategories(subcategories.filter((sub) => sub.level === 1))
    } else {
      setFilteredSubcategories(
        subcategories.filter((sub) => sub.level === 1 && sub.category && sub.category._id === filterParentCategory),
      )
    }
    setFilterSubCategory("all")
    setFilterSubCategory2("all")
    setFilterSubCategory3("all")
    setFilterSubCategory4("all")
    setFilteredSubcategories2([])
    setFilteredSubcategories3([])
    setFilteredSubcategories4([])
  }, [filterParentCategory, subcategories])

  useEffect(() => {
    if (filterSubCategory === "all" || !filterSubCategory) {
      setFilteredSubcategories2([])
    } else {
      setFilteredSubcategories2(
        subcategories.filter((sub) => {
          if (sub.level !== 2 || !sub.parentSubCategory) return false
          const parentId = typeof sub.parentSubCategory === "object" ? sub.parentSubCategory._id : sub.parentSubCategory
          return parentId === filterSubCategory
        }),
      )
    }
    setFilterSubCategory2("all")
    setFilterSubCategory3("all")
    setFilterSubCategory4("all")
    setFilteredSubcategories3([])
    setFilteredSubcategories4([])
  }, [filterSubCategory, subcategories])

  useEffect(() => {
    if (filterSubCategory === "all" || !filterSubCategory) {
      setFilteredSubcategories3([])
    } else {
      const parentId = filterSubCategory2 !== "all" && filterSubCategory2 ? filterSubCategory2 : filterSubCategory
      setFilteredSubcategories3(
        subcategories.filter((sub) => {
          if (sub.level !== 3 || !sub.parentSubCategory) return false
          const subParentId = typeof sub.parentSubCategory === "object" ? sub.parentSubCategory._id : sub.parentSubCategory
          return subParentId === parentId
        }),
      )
    }
    setFilterSubCategory3("all")
    setFilterSubCategory4("all")
    setFilteredSubcategories4([])
  }, [filterSubCategory, filterSubCategory2, subcategories])

  useEffect(() => {
    if (filterSubCategory === "all" || !filterSubCategory) {
      setFilteredSubcategories4([])
    } else {
      let parentId = filterSubCategory
      if (filterSubCategory3 !== "all" && filterSubCategory3) {
        parentId = filterSubCategory3
      } else if (filterSubCategory2 !== "all" && filterSubCategory2) {
        parentId = filterSubCategory2
      }
      setFilteredSubcategories4(
        subcategories.filter((sub) => {
          if (sub.level !== 4 || !sub.parentSubCategory) return false
          const subParentId = typeof sub.parentSubCategory === "object" ? sub.parentSubCategory._id : sub.parentSubCategory
          return subParentId === parentId
        }),
      )
    }
    setFilterSubCategory4("all")
  }, [filterSubCategory, filterSubCategory2, filterSubCategory3, subcategories])

  // Selection helpers
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isAllOnPageSelected = useMemo(() => {
    if (!products || products.length === 0) return false
    return products.every((p) => selectedIds.has(p._id))
  }, [products, selectedIds])

  const toggleSelectPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (isAllOnPageSelected) {
        products.forEach((p) => next.delete(p._id))
      } else {
        products.forEach((p) => next.add(p._id))
      }
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const handleBulkPriceUpdate = async () => {
    if (totalSelected === 0) {
      showToast("Please select at least one product", "error")
      return
    }

    if (!adjustmentValue || isNaN(adjustmentValue)) {
      showToast("Please enter a valid adjustment value", "error")
      return
    }

    try {
      setIsUpdating(true)
      const token = getAdminToken()

      if (!token) {
        setError("Authentication required. Please login again.")
        return
      }

      const requestData = {
        productIds: Array.from(selectedIds),
        adjustmentType,
        adjustmentMethod,
        adjustmentValue: Number.parseFloat(adjustmentValue),
        notes,
        filterCriteria: {
          parentCategory: filterParentCategory !== "all" ? filterParentCategory : null,
          subCategory: filterSubCategory !== "all" ? filterSubCategory : null,
          brand: filterBrand !== "all" ? filterBrand : null,
          searchTerm: searchTerm.trim() || null,
        },
      }

      const { data } = await axios.post(`${config.API_URL}/api/price-adjustment/bulk-update`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      showToast(`Successfully updated ${data.productsUpdated} products`, "success")
      setShowAdjustmentModal(false)
      setAdjustmentValue("")
      setNotes("")
      clearSelection()
      fetchProducts() // Refresh the product list
    } catch (error) {
      console.error("Failed to update prices:", error)
      showToast(error.response?.data?.message || "Failed to update prices", "error")
    } finally {
      setIsUpdating(false)
    }
  }

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized"
    const id = typeof categoryId === "object" ? categoryId._id : categoryId
    const category = categories.find((cat) => cat._id === id)
    return category ? category.name : "Unknown"
  }

  const getParentCategoryName = (product) => {
    if (product.parentCategory) {
      if (typeof product.parentCategory === "object" && product.parentCategory.name) {
        return product.parentCategory.name
      }
      const parent = categories.find((cat) => cat._id === product.parentCategory)
      if (parent) return parent.name
    }

    if (product.category && product.category.category) {
      if (typeof product.category.category === "object" && product.category.category.name) {
        return product.category.category.name
      }
      const parent = categories.find((cat) => cat._id === product.category.category)
      if (parent) return parent.name
    }

    return "N/A"
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 min-h-screen">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Price Adjustment</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Total Products: <span className="font-semibold text-gray-900">{products.length}</span>
              </div>
              {totalSelected > 0 && (
                <>
                  <span className="text-sm text-lime-600 font-medium">{totalSelected} selected</span>
                  <button
                    onClick={clearSelection}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Clear Selection
                  </button>
                </>
              )}
              <button
                onClick={() => setShowAdjustmentModal(true)}
                disabled={totalSelected === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                  totalSelected === 0
                    ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                title="Update prices for selected products"
              >
                <TrendingUp size={16} /> Update Prices
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
              {error.includes("Authentication") && (
                <button
                  onClick={() => (window.location.href = "/grabiansadmin/login")}
                  className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Login Again
                </button>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6 max-w-full overflow-visible">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter & Search Products</h3>

            <div className="grid grid-cols-5 gap-3 mb-4">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
                <select
                  value={filterParentCategory}
                  onChange={(e) => setFilterParentCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Level 1</label>
                <select
                  value={filterSubCategory}
                  onChange={(e) => setFilterSubCategory(e.target.value)}
                  disabled={filterParentCategory === "all"}
                  className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                >
                  <option value="all">{filterParentCategory === "all" ? "Select Parent First" : "All Level 1"}</option>
                  {filteredSubcategories.map((subcategory) => (
                    <option key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Level 2</label>
                <select
                  value={filterSubCategory2}
                  onChange={(e) => setFilterSubCategory2(e.target.value)}
                  disabled={filterSubCategory === "all" || filteredSubcategories2.length === 0}
                  className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                >
                  <option value="all">{filterSubCategory === "all" ? "Select Level 1 First" : filteredSubcategories2.length === 0 ? "No Level 2" : "All Level 2"}</option>
                  {filteredSubcategories2.map((subcategory) => (
                    <option key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Level 3</label>
                <select
                  value={filterSubCategory3}
                  onChange={(e) => setFilterSubCategory3(e.target.value)}
                  disabled={filterSubCategory === "all" || filteredSubcategories3.length === 0}
                  className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                >
                  <option value="all">{filterSubCategory === "all" ? "Select Level 1 First" : filteredSubcategories3.length === 0 ? "No Level 3" : "All Level 3"}</option>
                  {filteredSubcategories3.map((subcategory) => (
                    <option key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Level 4</label>
                <select
                  value={filterSubCategory4}
                  onChange={(e) => setFilterSubCategory4(e.target.value)}
                  disabled={filterSubCategory === "all" || filteredSubcategories4.length === 0}
                  className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                >
                  <option value="all">{filterSubCategory === "all" ? "Select Level 1 First" : filteredSubcategories4.length === 0 ? "No Level 4" : "All Level 4"}</option>
                  {filteredSubcategories4.map((subcategory) => (
                    <option key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Products</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="onhold">On Hold</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Name, SKU, Brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-2 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {(searchTerm ||
              filterParentCategory !== "all" ||
              filterSubCategory !== "all" ||
              filterSubCategory2 !== "all" ||
              filterSubCategory3 !== "all" ||
              filterSubCategory4 !== "all" ||
              filterBrand !== "all" ||
              filterStatus !== "all") && (
              <div className="flex justify-start mt-4">
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setFilterParentCategory("all")
                    setFilterSubCategory("all")
                    setFilterSubCategory2("all")
                    setFilterSubCategory3("all")
                    setFilterSubCategory4("all")
                    setFilterBrand("all")
                    setFilterStatus("all")
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={toggleSelectPage}
                          className={`inline-flex items-center gap-1 rounded focus:outline-none ${
                            isAllOnPageSelected
                              ? "text-lime-500 hover:text-lime-600"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          {isAllOnPageSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                          <span className="sr-only">Select page</span>
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Brand
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Parent Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Base Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Offer Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        SKU
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleSelectOne(product._id)}
                              className={`${
                                selectedIds.has(product._id)
                                  ? "text-lime-500 hover:text-lime-600"
                                  : "text-gray-600 hover:text-gray-800"
                              } rounded focus:outline-none`}
                            >
                              {selectedIds.has(product._id) ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  src={getFullImageUrl(product.image) || "/placeholder.svg"}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              </div>
                              <div className="ml-4 max-w-[110px] overflow-hidden">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                {product.slug && <div className="text-sm text-gray-500">/{product.slug}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.brand?.name || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {product.category?.name || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-800">
                              {getParentCategoryName(product)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.offerPrice > 0 ? formatPrice(product.offerPrice) : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.sku || "N/A"}</div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Prices</h3>

            <div className="space-y-4">
              {/* Adjustment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Type</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="both"
                      checked={adjustmentType === "both"}
                      onChange={(e) => setAdjustmentType(e.target.value)}
                      className="mr-2"
                    />
                    Update Both Base and Offer Price
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="base_only"
                      checked={adjustmentType === "base_only"}
                      onChange={(e) => setAdjustmentType(e.target.value)}
                      className="mr-2"
                    />
                    Update Base Price Only
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="offer_only"
                      checked={adjustmentType === "offer_only"}
                      onChange={(e) => setAdjustmentType(e.target.value)}
                      className="mr-2"
                    />
                    Update Offer Price Only
                  </label>
                </div>
              </div>

              {/* Adjustment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Method</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adjustmentMethod"
                      value="percentage"
                      checked={adjustmentMethod === "percentage"}
                      onChange={(e) => setAdjustmentMethod(e.target.value)}
                      className="mr-2"
                    />
                    <Percent size={16} className="mr-1" />
                    Percentage
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adjustmentMethod"
                      value="fixed_amount"
                      checked={adjustmentMethod === "fixed_amount"}
                      onChange={(e) => setAdjustmentMethod(e.target.value)}
                      className="mr-2"
                    />
                    <DollarSign size={16} className="mr-1" />
                    Fixed Amount
                  </label>
                </div>
              </div>

              {/* Adjustment Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {adjustmentMethod === "percentage" ? "Percentage Change" : "Amount Change"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(e.target.value)}
                  placeholder={
                    adjustmentMethod === "percentage"
                      ? "e.g., 10 for +10% or -5 for -5%"
                      : "e.g., 50 for +50 AED or -20 for -20 AED"
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {adjustmentMethod === "percentage"
                    ? "Use positive numbers to increase, negative to decrease"
                    : "Use positive numbers to add, negative to subtract"}
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this price adjustment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Summary:</strong> {totalSelected} products will be updated
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAdjustmentModal(false)}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPriceUpdate}
                disabled={isUpdating || !adjustmentValue}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update Prices"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PriceAdjustment
