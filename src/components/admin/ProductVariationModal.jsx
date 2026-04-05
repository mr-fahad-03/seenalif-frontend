import { useState, useEffect } from "react"
import axios from "axios"
import { X, Search, Plus, Check } from "lucide-react"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"

const ProductVariationModal = ({ isOpen, onClose, onSelectProducts, selectedVariations = [], currentProductId, currentProductName = "", currentSelfVariationText = "" }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProducts, setSelectedProducts] = useState([])
  const [parentCategories, setParentCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [selectedParentCategory, setSelectedParentCategory] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12
  const [variationTexts, setVariationTexts] = useState({})
  const [selfText, setSelfText] = useState("")
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
      fetchParentCategories()
      // Initialize with already selected variations
      setSelectedProducts([...selectedVariations])
      // Initialize variation texts
      const initialTexts = {}
      selectedVariations.forEach(variation => {
        if (variation.variationText) {
          initialTexts[variation._id] = variation.variationText
        }
      })
      setVariationTexts(initialTexts)
      // Initialize self text with current product's selfVariationText
      setSelfText(currentSelfVariationText || "")
    }
  }, [isOpen, selectedVariations, currentSelfVariationText])

  const fetchParentCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setParentCategories(data)
    } catch (error) {
      console.error("Failed to load parent categories:", error)
    }
  }

  const fetchSubCategories = async (parentId) => {
    if (!parentId) {
      setSubCategories([])
      return
    }
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/subcategories/parent/${parentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSubCategories(data)
    } catch (error) {
      console.error("Failed to load subcategories:", error)
      setSubCategories([])
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      let url = `${config.API_URL}/api/products/admin`
      const params = new URLSearchParams()
      
      // Add high limit to load all products for variation selection
      params.append("limit", "2000")
      
      if (searchTerm) {
        params.append("search", searchTerm)
      }
      if (selectedParentCategory) {
        params.append("parentCategory", selectedParentCategory)
      }
      if (selectedSubCategory) {
        params.append("category", selectedSubCategory)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      // The admin route returns { products, totalCount }, so extract products array
      const productsList = data.products || data
      const totalCount = data.totalCount || productsList.length
      
      // Filter out the current product being edited
      const filteredProducts = productsList.filter(p => p._id !== currentProductId)
      
      // Debug: Log products with hideFromShop status
      console.log('[Variation Modal] Loaded products:', filteredProducts.length, 'of', totalCount)
      
      setProducts(filteredProducts)
      setTotalProducts(totalCount)
    } catch (error) {
      console.error("Failed to load products:", error)
      setProducts([])
      setTotalProducts(0)
    } finally {
      setLoading(false)
    }
  }

  // Fetch subcategories when parent category changes
  useEffect(() => {
    if (selectedParentCategory) {
      fetchSubCategories(selectedParentCategory)
      setSelectedSubCategory("") // Reset subcategory when parent changes
    } else {
      setSubCategories([])
      setSelectedSubCategory("")
    }
  }, [selectedParentCategory])

  useEffect(() => {
    if (isOpen) {
      const delayDebounceFn = setTimeout(() => {
        fetchProducts()
        setCurrentPage(1) // Reset to first page on filter change
      }, 500)

      return () => clearTimeout(delayDebounceFn)
    }
  }, [searchTerm, selectedParentCategory, selectedSubCategory])

  const toggleProductSelection = (product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p._id === product._id)
      if (exists) {
        return prev.filter((p) => p._id !== product._id)
      } else {
        return [...prev, product]
      }
    })
  }

  const handleConfirm = () => {
    // Add variation text to each selected product
    const productsWithText = selectedProducts.map(product => ({
      ...product,
      variationText: variationTexts[product._id] || ""
    }))
    onSelectProducts(productsWithText, selfText)
    onClose()
  }

  const isProductSelected = (productId) => {
    return selectedProducts.some((p) => p._id === productId)
  }

  const handleTextChange = (productId, text) => {
    setVariationTexts(prev => ({
      ...prev,
      [productId]: text
    }))
  }

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(products.length / productsPerPage)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Select Product Variations</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Current Product Self Variation Text */}
          {currentProductName && (
            <div className="p-4 border-b bg-green-50">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Variation label for <span className="text-green-600 font-bold">{currentProductName}</span>:
              </label>
              <input
                type="text"
                placeholder="e.g., 16GB RAM, 512GB SSD, Black Color"
                value={selfText}
                onChange={(e) => setSelfText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
              />
              <p className="text-xs text-gray-600 mt-1">
                <strong>Important:</strong> This is how THIS product will appear in the variation selector when customers view any linked product.
              </p>
            </div>
          )}

          {/* Search and Filters */}
          <div className="p-4 border-b space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <select
              value={selectedParentCategory}
              onChange={(e) => setSelectedParentCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Categories</option>
              {parentCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {subCategories.length > 0 && (
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Subcategories</option>
                {subCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {/* Product count info */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
              {totalProducts > products.length && ` of ${totalProducts} total`}
            </span>
            {(selectedParentCategory || selectedSubCategory || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedParentCategory("")
                  setSelectedSubCategory("")
                  setSearchTerm("")
                }}
                className="text-blue-600 hover:text-blue-700 text-xs"
              >
                Clear filters
              </button>
            )}
          </div>
          </div>

          {/* Selected Products Section - Collapsible */}
          {selectedProducts.length > 0 && (
            <div className="p-4 border-b bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected as variations
                </span>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>
              
              {/* Text inputs for selected products - scrollable if many */}
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                {selectedProducts.map(product => (
                  <div key={product._id} className="flex items-center gap-2 bg-white p-2 rounded-md border border-blue-200">
                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={getFullImageUrl(product.image) || "/placeholder.svg"} 
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 truncate">{product.name}</p>
                      <input
                        type="text"
                        placeholder={`e.g., 24GB RAM, 1TB SSD`}
                        value={variationTexts[product._id] || ""}
                        onChange={(e) => handleTextChange(product._id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedProducts(prev => prev.filter(p => p._id !== product._id))
                      }}
                      className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <strong>Tip:</strong> Products are auto-linked bidirectionally.
              </p>
            </div>
          )}

          {/* Products Grid */}
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No products found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {currentProducts.map((product) => {
                    const selected = isProductSelected(product._id)
                    const isHidden = product.hideFromShop === true
                    return (
                      <div
                        key={product._id}
                        onClick={() => toggleProductSelection(product)}
                        className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                          selected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {selected && (
                          <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5 z-10">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                        {isHidden && (
                          <div className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] px-1 py-0.5 rounded font-medium z-10">
                            Hidden
                          </div>
                        )}
                        <div className="aspect-square mb-2 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={getFullImageUrl(product.image) || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <h3 className="font-medium text-xs text-gray-900 line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-[10px] text-gray-500">SKU: {product.sku || "N/A"}</p>
                        <p className="text-[10px] text-blue-600 truncate">
                          {product.parentCategory?.name || product.category?.name || "Uncategorized"}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-bold text-gray-900">
                            {product.offerPrice > 0 
                              ? `${product.offerPrice.toFixed(2)}`
                              : `${product.price.toFixed(2)}`
                            } AED
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            {selectedProducts.length > 0 ? `Save ${selectedProducts.length} Variation${selectedProducts.length !== 1 ? 's' : ''}` : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductVariationModal
