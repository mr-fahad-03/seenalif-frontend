import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import config from "../config/config"
import ProductCard from "../components/ProductCard"
import TranslatedText from "../components/TranslatedText"
import { getFullImageUrl } from "../utils/imageUtils"
import { Helmet } from "react-helmet-async"
import { ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, X } from "lucide-react"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"
import PriceFilter from "../components/PriceFilter"

const SortDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const options = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name: A-Z" },
  ]

  const current = options.find((o) => o.value === value)?.label || "Sort"

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const handleSelect = (val) => {
    onChange?.({ target: { value: val } })
    setOpen(false)
  }

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate max-w-[46vw] sm:max-w-none">{current}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          className="absolute right-0 mt-1 w-56 max-w-[80vw] bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden"
          role="listbox"
        >
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={opt.value === value}>
              <button
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 ${
                  opt.value === value ? "font-semibold" : ""
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const OfferPage = () => {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [offerPage, setOfferPage] = useState(null)
  const [products, setProducts] = useState([])
  
  // Separate state for sliders (offer-specific) and filters (all items)
  const [sliderBrands, setSliderBrands] = useState([])
  const [sliderCategories, setSliderCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  
  const [error, setError] = useState(null)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const brandSliderRef = useRef(null)
  const categoriesScrollRef = useRef(null)
  
  // Filter states from Shop page
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [maxPrice, setMaxPrice] = useState(100000)
  const [minPrice, setMinPrice] = useState(0)
  const [selectedBrands, setSelectedBrands] = useState([])
  const [stockFilters, setStockFilters] = useState({ inStock: false, outOfStock: false })
  const [brandSearch, setBrandSearch] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [showPriceFilter, setShowPriceFilter] = useState(true)
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const [showBrandFilter, setShowBrandFilter] = useState(false)
  const [allSubcategories, setAllSubcategories] = useState([])
  const [expandedCategories, setExpandedCategories] = useState({})
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [brandScrollState, setBrandScrollState] = useState({
    canScrollPrev: false,
    canScrollNext: false,
  })
  
  // State for tracking full hierarchy path
  const [selectedParentCategory, setSelectedParentCategory] = useState(null)
  const [selectedSubCategory1, setSelectedSubCategory1] = useState(null)
  const [selectedSubCategory2, setSelectedSubCategory2] = useState(null)
  const [selectedSubCategory3, setSelectedSubCategory3] = useState(null)
  const [selectedSubCategory4, setSelectedSubCategory4] = useState(null)
  const [parentCategoryName, setParentCategoryName] = useState(null)
  const [subCategory1Name, setSubCategory1Name] = useState(null)
  const [subCategory2Name, setSubCategory2Name] = useState(null)
  const [subCategory3Name, setSubCategory3Name] = useState(null)
  const [subCategory4Name, setSubCategory4Name] = useState(null)

  // Helper to compute the displayed price (same logic as ProductCard)
  const getDisplayPrice = (product = {}) => {
    const basePrice = Number(product.price) || 0
    const offerPrice = Number(product.offerPrice) || 0
    const hasValidOffer = offerPrice > 0 && basePrice > 0 && offerPrice < basePrice
    if (hasValidOffer) return offerPrice
    if (basePrice > 0) return basePrice
    if (offerPrice > 0) return offerPrice
    return 0
  }

  const isValidBrand = (brand) => {
    return (
      brand &&
      typeof brand === "object" &&
      brand._id &&
      typeof brand.name === "string" &&
      brand.name.trim() !== "" &&
      brand.isActive !== false &&
      !brand.name.match(/^[0-9a-fA-F]{24}$/)
    )
  }

  const normalizeOfferProduct = (item) => {
    const product = { ...(item?.product || {}) }

    // Keep legacy and current subcategory field names in sync for existing filters/UI.
    product.subcategory = product.subcategory ?? product.subCategory ?? null
    product.subcategory2 = product.subcategory2 ?? product.subCategory2 ?? null
    product.subcategory3 = product.subcategory3 ?? product.subCategory3 ?? null
    product.subcategory4 = product.subcategory4 ?? product.subCategory4 ?? null

    // Normalize price fields so ProductCard displays the same offer/base prices.
    if (product.offerPrice == null && product.salePrice != null) {
      product.offerPrice = product.salePrice
    }
    if (product.price == null && product.regularPrice != null) {
      product.price = product.regularPrice
    }
    if (product.offerPrice == null && product.sale_price != null) {
      product.offerPrice = product.sale_price
    }
    if (product.price == null && product.regular_price != null) {
      product.price = product.regular_price
    }

    return { ...item, product }
  }

  // PriceFilter component is used for temp UI state and Apply handling

  useEffect(() => {
    fetchOfferPageData()
  }, [slug])

  const fetchOfferPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [pageResponse, productsRes] = await Promise.all([
        axios.get(`${config.API_URL}/api/offer-pages/slug/${slug}`),
        axios.get(`${config.API_URL}/api/offer-products/page/${slug}`),
      ])
      const pageData = pageResponse.data

      if (!pageData.isActive) {
        setError("This offer is currently not available.")
        setLoading(false)
        return
      }

      setOfferPage(pageData)

      // Filter only active items and ensure product data exists
      const activeProducts = productsRes.data.filter(item => {
        return item.isActive && item.product && item.product._id
      })
      const enrichedProducts = activeProducts.map(normalizeOfferProduct)

      setProducts(enrichedProducts)
      setFilteredProducts(enrichedProducts)

      // Extract unique categories from products for slider (instead of using offer-categories API)
      const uniqueCategoriesMap = new Map()
      enrichedProducts.forEach(({ product }) => {
        const category = product.category
        if (category && typeof category === 'object' && category._id && category.name) {
          if (!uniqueCategoriesMap.has(category._id)) {
            uniqueCategoriesMap.set(category._id, { 
              category: category, 
              isActive: true, 
              _id: category._id 
            })
          }
        }
      })
      const categoriesFromProducts = Array.from(uniqueCategoriesMap.values())
      setSliderCategories(categoriesFromProducts)

      // Build the filter and slider brands directly from the offer products payload.
      const uniqueBrandsMap = new Map()
      enrichedProducts.forEach(({ product }) => {
        const brand = product.brand
        if (isValidBrand(brand) && !uniqueBrandsMap.has(brand._id)) {
          uniqueBrandsMap.set(brand._id, brand)
        }
      })

      // Use same normalized list for sidebar and top slider
      const normalizedBrands = Array.from(uniqueBrandsMap.values()).map(brand => ({
        brand,
        isActive: true,
        _id: brand._id,
      }))
      setBrands(normalizedBrands)
      setSliderBrands(normalizedBrands)

      // Use the same categories from products for sidebar
      setCategories(categoriesFromProducts)

      // Keep subcategory tree empty here so the current category UI remains unchanged.
      setAllSubcategories([])

      setLoading(false)
    } catch (error) {
      console.error("Error fetching offer page:", error)
      console.error("Error details:", error.response?.data)
      setError("Offer page not found.")
      setLoading(false)
    }
  }

  const scrollSlider = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 300
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleBrandClick = (brandId) => {
    // Toggle the brand in the selectedBrands array (for sidebar filters)
    setSelectedBrands(prev => {
      if (prev.includes(brandId)) {
        return prev.filter(id => id !== brandId)
      } else {
        return [...prev, brandId]
      }
    })
  }

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null)
      setSelectedParentCategory(null)
      setSelectedSubCategory1(null)
      setSelectedSubCategory2(null)
      setSelectedSubCategory3(null)
      setSelectedSubCategory4(null)
      setParentCategoryName(null)
      setSubCategory1Name(null)
      setSubCategory2Name(null)
      setSubCategory3Name(null)
      setSubCategory4Name(null)
    } else {
      setSelectedCategory(categoryId)
      
      // Check if it's a parent category or subcategory
      const parentCategory = categories.find(c => c.category._id === categoryId)
      
      if (parentCategory) {
        // It's a parent category
        setSelectedParentCategory(categoryId)
        setParentCategoryName(parentCategory.category.displayName || parentCategory.category.name)
        setSelectedSubCategory1(null)
        setSelectedSubCategory2(null)
        setSelectedSubCategory3(null)
        setSelectedSubCategory4(null)
        setSubCategory1Name(null)
        setSubCategory2Name(null)
        setSubCategory3Name(null)
        setSubCategory4Name(null)
      } else {
        // It's a subcategory - trace back the full hierarchy
        const subcategory = allSubcategories.find(s => s._id === categoryId)
        if (subcategory) {
          const hierarchy = traceHierarchy(subcategory)
          
          // Set parent category
          if (hierarchy.parentCategoryId) {
            setSelectedParentCategory(hierarchy.parentCategoryId)
            const parentCat = categories.find(c => c.category._id === hierarchy.parentCategoryId)
            setParentCategoryName(parentCat ? (parentCat.category.displayName || parentCat.category.name) : null)
          }
          
          // Set Level 1
          if (hierarchy.level1Id) {
            setSelectedSubCategory1(hierarchy.level1Id)
            setSubCategory1Name(hierarchy.level1Name)
          } else {
            setSelectedSubCategory1(null)
            setSubCategory1Name(null)
          }
          
          // Set Level 2
          if (hierarchy.level2Id) {
            setSelectedSubCategory2(hierarchy.level2Id)
            setSubCategory2Name(hierarchy.level2Name)
          } else {
            setSelectedSubCategory2(null)
            setSubCategory2Name(null)
          }
          
          // Set Level 3
          if (hierarchy.level3Id) {
            setSelectedSubCategory3(hierarchy.level3Id)
            setSubCategory3Name(hierarchy.level3Name)
          } else {
            setSelectedSubCategory3(null)
            setSubCategory3Name(null)
          }
          
          // Set Level 4
          if (hierarchy.level4Id) {
            setSelectedSubCategory4(hierarchy.level4Id)
            setSubCategory4Name(hierarchy.level4Name)
          } else {
            setSelectedSubCategory4(null)
            setSubCategory4Name(null)
          }
        }
      }
      
      // Auto-expand parent hierarchy when subcategory is selected
      const expandParents = (subCatId) => {
        const subcat = allSubcategories.find(s => s._id === subCatId)
        if (!subcat) return
        
        const newExpanded = { ...expandedCategories }
        
        // Get parent category
        const parentCategoryId = typeof subcat.category === 'object' ? subcat.category._id : subcat.category
        if (parentCategoryId) {
          newExpanded[parentCategoryId] = true
        }
        
        // Trace back through parent subcategories
        let current = subcat
        while (current && current.parentSubCategory) {
          const parentId = typeof current.parentSubCategory === 'object' 
            ? current.parentSubCategory._id 
            : current.parentSubCategory
          
          if (parentId) {
            newExpanded[parentId] = true
            current = allSubcategories.find(s => s._id === parentId)
          } else {
            break
          }
        }
        
        setExpandedCategories(newExpanded)
      }
      
      // Check if selected category is a subcategory and expand its parents
      const isSubcategory = allSubcategories.find(s => s._id === categoryId)
      if (isSubcategory) {
        expandParents(categoryId)
      }
    }
  }
  
  // Helper function to trace the full hierarchy of a subcategory
  const traceHierarchy = (subcategory) => {
    const hierarchy = {
      parentCategoryId: null,
      level1Id: null,
      level2Id: null,
      level3Id: null,
      level4Id: null,
      level1Name: null,
      level2Name: null,
      level3Name: null,
      level4Name: null,
    }
    
    // Build array of subcategories from current to root
    const path = []
    let current = subcategory
    
    while (current) {
      path.unshift(current)
      
      const parentSubCategoryId = typeof current.parentSubCategory === 'object'
        ? current.parentSubCategory?._id
        : current.parentSubCategory
      
      if (parentSubCategoryId) {
        current = allSubcategories.find(s => s._id === parentSubCategoryId)
      } else {
        break
      }
    }
    
    // Get parent category from the root subcategory
    if (path.length > 0) {
      const rootSubcat = path[0]
      hierarchy.parentCategoryId = typeof rootSubcat.category === 'object'
        ? rootSubcat.category._id
        : rootSubcat.category
      
      // Assign levels
      if (path.length >= 1) {
        hierarchy.level1Id = path[0]._id
        hierarchy.level1Name = path[0].name
      }
      if (path.length >= 2) {
        hierarchy.level2Id = path[1]._id
        hierarchy.level2Name = path[1].name
      }
      if (path.length >= 3) {
        hierarchy.level3Id = path[2]._id
        hierarchy.level3Name = path[2].name
      }
      if (path.length >= 4) {
        hierarchy.level4Id = path[3]._id
        hierarchy.level4Name = path[3].name
      }
    }
    
    return hierarchy
  }

  const handleStockFilterChange = (key) => {
    setStockFilters(prev => {
      const newState = { inStock: false, outOfStock: false }
      newState[key] = true
      return newState
    })
  }

  const clearAllFilters = () => {
    setSelectedBrands([])
    setSelectedCategory(null)
    setSelectedParentCategory(null)
    setSelectedSubCategory1(null)
    setSelectedSubCategory2(null)
    setSelectedSubCategory3(null)
    setSelectedSubCategory4(null)
    setParentCategoryName(null)
    setSubCategory1Name(null)
    setSubCategory2Name(null)
    setSubCategory3Name(null)
    setSubCategory4Name(null)
    setPriceRange([minPrice, maxPrice])
    setStockFilters({ inStock: false, outOfStock: false })
    setBrandSearch("")
  }

  const updateBrandScrollState = () => {
    const container = brandSliderRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setBrandScrollState({
      canScrollPrev: scrollLeft > 0,
      canScrollNext: scrollLeft < scrollWidth - clientWidth - 1,
    })
  }

  const scrollBrandPrev = () => {
    if (brandSliderRef.current) {
      brandSliderRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollBrandNext = () => {
    if (brandSliderRef.current) {
      brandSliderRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  const filteredBrands = brands.filter(item =>
    item.brand?.name?.toLowerCase().includes(brandSearch.toLowerCase())
  )

  // Helper function to check if a category is in the selected hierarchy path
  const isInSelectedPath = (categoryId) => {
    if (!selectedCategory) return false
    if (categoryId === selectedCategory) return true
    
    // Check if the selected category is a descendant of this category
    const selectedSubcat = allSubcategories.find(s => s._id === selectedCategory)
    if (!selectedSubcat) {
      // Selected is a parent category
      return false
    }
    
    // Trace back from selected to see if categoryId is in the path
    let current = selectedSubcat
    while (current) {
      const parentCategoryId = typeof current.category === 'object' ? current.category._id : current.category
      if (parentCategoryId === categoryId) return true
      
      const parentSubCategoryId = typeof current.parentSubCategory === 'object' 
        ? current.parentSubCategory?._id 
        : current.parentSubCategory
      
      if (parentSubCategoryId === categoryId) return true
      if (!parentSubCategoryId) break
      
      current = allSubcategories.find(s => s._id === parentSubCategoryId)
    }
    
    return false
  }

  // Helper function to get children of a category/subcategory
  const getChildren = (parentId, parentType = 'category') => {
    const children = allSubcategories.filter(sub => {
      const category = typeof sub.category === 'object' ? sub.category?._id : sub.category
      const parentSubCategory = typeof sub.parentSubCategory === 'object' ? sub.parentSubCategory?._id : sub.parentSubCategory
      
      if (parentType === 'category') {
        // For parent categories, get Level 1 subcategories (where category matches and parentSubCategory is null)
        return category === parentId && !parentSubCategory
      } else if (parentType === 'subcategory') {
        // For subcategories, get children where parentSubCategory matches
        return parentSubCategory === parentId
      }
      return false
    })
    
    return children
  }

  // Toggle category expansion
  const toggleExpanded = (id) => {
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Brand filter (multiple brands)
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(item => {
        const productBrandId = item.product?.brand?._id || item.product?.brand
        return selectedBrands.includes(productBrandId)
      })
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => {
        const product = item.product
        
        // Helper to extract ID from object or string
        const getId = (field) => {
          if (!field) return null
          return typeof field === 'object' ? field._id : field
        }
        
        // Get all category/subcategory IDs from the product
        const categoryId = getId(product.category)
        const subcategoryId = getId(product.subcategory)
        const subcategory2Id = getId(product.subcategory2)
        const subcategory3Id = getId(product.subcategory3)
        const subcategory4Id = getId(product.subcategory4)
        
        // Check if selected category matches any level
        if (categoryId === selectedCategory) return true
        if (subcategoryId === selectedCategory) return true
        if (subcategory2Id === selectedCategory) return true
        if (subcategory3Id === selectedCategory) return true
        if (subcategory4Id === selectedCategory) return true
        
        // Also check if the selected category is a parent of any of these
        // This handles the case where product.category is actually a subcategory object
        if (product.category && typeof product.category === 'object') {
          // Check if the category object has parentCategory or parentSubCategory
          const catObj = product.category
          if (catObj.category) {
            const parentCatId = getId(catObj.category)
            if (parentCatId === selectedCategory) return true
          }
          if (catObj.parentSubCategory) {
            const parentSubId = getId(catObj.parentSubCategory)
            if (parentSubId === selectedCategory) return true
          }
        }
        
        // Check subcategory hierarchy
        const checkSubcategoryHierarchy = (subcat) => {
          if (!subcat || typeof subcat !== 'object') return false
          
          // Check parent category
          if (subcat.category) {
            const parentCatId = getId(subcat.category)
            if (parentCatId === selectedCategory) return true
          }
          
          // Check parent subcategory and recurse
          if (subcat.parentSubCategory) {
            const parentSubId = getId(subcat.parentSubCategory)
            if (parentSubId === selectedCategory) return true
            
            // Find the parent subcategory object and recurse
            const parentSubcat = allSubcategories.find(s => s._id === parentSubId)
            if (parentSubcat && checkSubcategoryHierarchy(parentSubcat)) return true
          }
          
          return false
        }
        
        // Check each subcategory level for hierarchy match
        if (product.subcategory && typeof product.subcategory === 'object') {
          if (checkSubcategoryHierarchy(product.subcategory)) return true
        }
        if (product.subcategory2 && typeof product.subcategory2 === 'object') {
          if (checkSubcategoryHierarchy(product.subcategory2)) return true
        }
        if (product.subcategory3 && typeof product.subcategory3 === 'object') {
          if (checkSubcategoryHierarchy(product.subcategory3)) return true
        }
        if (product.subcategory4 && typeof product.subcategory4 === 'object') {
          if (checkSubcategoryHierarchy(product.subcategory4)) return true
        }
        
        return false
      })
    }

    // Price filter (use display price matching ProductCard)
    filtered = filtered.filter(item => {
      const price = getDisplayPrice(item.product)
      // If price is 0 (no valid price), only exclude when user changed range
      if (price === 0) {
        if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) return false
        return true
      }
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Stock filter - keep logic consistent with ProductCard so badge matches filter
    const getStockBucket = (product) => {
      const rawStatus = product?.stockStatus
      const status = rawStatus != null && String(rawStatus).trim() !== ""
        ? String(rawStatus).trim()
        : (Number(product?.countInStock) > 0 ? "In Stock" : "Out of Stock")

      const normalized = status.toLowerCase().replace(/\s+/g, "")
      if (normalized === "outofstock" || normalized === "stockout") return "out"
      if (normalized === "instock" || normalized === "available" || normalized === "preorder") return "in"

      // Fallback: if status is unknown, rely on countInStock
      return Number(product?.countInStock) > 0 ? "in" : "out"
    }

    if (stockFilters.inStock && !stockFilters.outOfStock) {
      filtered = filtered.filter(item => getStockBucket(item.product) === "in")
    } else if (stockFilters.outOfStock && !stockFilters.inStock) {
      filtered = filtered.filter(item => getStockBucket(item.product) === "out")
    }
    // All Products: no stock filter applied

    // Apply sorting
    if (sortBy === "price-low") {
      filtered.sort((a, b) => {
        const priceA = getDisplayPrice(a.product)
        const priceB = getDisplayPrice(b.product)
        if (priceA === priceB) return 0
        // put items with 0 price (no valid price) at the end
        if (priceA === 0) return 1
        if (priceB === 0) return -1
        return priceA - priceB
      })
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => {
        const priceA = getDisplayPrice(a.product)
        const priceB = getDisplayPrice(b.product)
        if (priceA === priceB) return 0
        if (priceA === 0) return 1
        if (priceB === 0) return -1
        return priceB - priceA
      })
    } else if (sortBy === "name") {
      filtered.sort((a, b) => {
        const nameA = typeof a.product?.name === "string" ? a.product.name.toLowerCase() : ""
        const nameB = typeof b.product?.name === "string" ? b.product.name.toLowerCase() : ""
        return nameA.localeCompare(nameB)
      })
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.product?.createdAt || 0)
        const dateB = new Date(b.product?.createdAt || 0)
        return dateB - dateA
      })
    }

    setFilteredProducts(filtered)
  }

  // Update filters whenever filter criteria change
  useEffect(() => {
    if (products.length > 0) {
      applyFilters()
    }
  }, [selectedBrands, selectedCategory, priceRange, stockFilters, sortBy, products])

  useEffect(() => {
    if (brandSliderRef.current) {
      updateBrandScrollState()
    }
  }, [sliderBrands.length])

  // Calculate price range when products load
  useEffect(() => {
    if (products.length > 0) {
      const prices = products
        .map(item => getDisplayPrice(item.product))
        .filter(price => typeof price === "number" && !isNaN(price) && price > 0)
      const max = prices.length ? Math.max(...prices) : 10000
      const min = prices.length ? Math.min(...prices) : 0
      setMaxPrice(max);
      setMinPrice(min);
      setPriceRange([min, max]);
    }
  }, [products])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offer...</p>
        </div>
      </div>
    )
  }

  if (error || !offerPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Offer Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The offer you're looking for doesn't exist."}</p>
          <Link
            to="/shop"
            className="px-6 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{offerPage.metaTitle || offerPage.name}</title>
        <meta name="description" content={offerPage.metaDescription || offerPage.description} />
        <link rel="canonical" href={`${window.location.origin}/offers/${slug}`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Mobile Filter Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b z-10 px-4 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold"><TranslatedText>Filters</TranslatedText></h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-4 space-y-6">
                {/* Active Filters Section - Mobile */}
                {(selectedParentCategory || 
                  selectedSubCategory1 || 
                  selectedSubCategory2 || 
                  selectedSubCategory3 || 
                  selectedSubCategory4 || 
                  selectedBrands.length > 0 || 
                  stockFilters.inStock || 
                  stockFilters.outOfStock ||
                  priceRange[0] !== minPrice || 
                  priceRange[1] !== maxPrice) && (
                  <div className="border border-lime-200 rounded-lg p-4 bg-lime-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900"><TranslatedText>Active Filters</TranslatedText></h3>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                      >
                        <TranslatedText>Clear All</TranslatedText>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {/* Parent Category Filter */}
                      {selectedParentCategory && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Category:</TranslatedText></span>{" "}
                            <TranslatedText text={parentCategoryName || "Selected"} />
                          </span>
                          <button
                            onClick={() => {
                              setSelectedCategory(null)
                              setSelectedParentCategory(null)
                              setSelectedSubCategory1(null)
                              setSelectedSubCategory2(null)
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setParentCategoryName(null)
                              setSubCategory1Name(null)
                              setSubCategory2Name(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 1 Subcategory */}
                      {selectedSubCategory1 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Subcategory:</TranslatedText></span>{" "}
                            <TranslatedText text={subCategory1Name} />
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory1(null)
                              setSelectedSubCategory2(null)
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setSubCategory1Name(null)
                              setSubCategory2Name(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                              if (selectedParentCategory) {
                                setSelectedCategory(selectedParentCategory)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 2 Subcategory */}
                      {selectedSubCategory2 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Level 2:</TranslatedText></span>{" "}
                            <TranslatedText text={subCategory2Name} />
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory2(null)
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setSubCategory2Name(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                              if (selectedSubCategory1) {
                                setSelectedCategory(selectedSubCategory1)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 3 Subcategory */}
                      {selectedSubCategory3 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Level 3:</TranslatedText></span>{" "}
                            <TranslatedText text={subCategory3Name} />
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                              if (selectedSubCategory2) {
                                setSelectedCategory(selectedSubCategory2)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 4 Subcategory */}
                      {selectedSubCategory4 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Level 4:</TranslatedText></span>{" "}
                            <TranslatedText text={subCategory4Name} />
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory4(null)
                              setSubCategory4Name(null)
                              if (selectedSubCategory3) {
                                setSelectedCategory(selectedSubCategory3)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {selectedBrands.map(brandId => {
                        const brandItem = brands.find(b => b.brand._id === brandId)
                        return brandItem ? (
                          <div key={brandId} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                            <span className="text-gray-700">
                              <span className="font-semibold"><TranslatedText>Brand:</TranslatedText></span>{" "}
                              <TranslatedText text={brandItem.brand.name} sourceDoc={brandItem.brand} fieldName="name" />
                            </span>
                            <button
                              onClick={() => handleBrandClick(brandId)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })}

                      {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Price:</TranslatedText></span> AED{priceRange[0]} - AED{priceRange[1]}
                          </span>
                          <button
                            onClick={() => setPriceRange([minPrice, maxPrice])}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {stockFilters.inStock && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Stock:</TranslatedText></span>{" "}
                            <TranslatedText>In Stock</TranslatedText>
                          </span>
                          <button
                            onClick={() => setStockFilters({ inStock: false, outOfStock: false })}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {stockFilters.outOfStock && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Stock:</TranslatedText></span>{" "}
                            <TranslatedText>Out of Stock</TranslatedText>
                          </span>
                          <button
                            onClick={() => setStockFilters({ inStock: false, outOfStock: false })}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Price Filter - Mobile */}
                <div className="border-b pb-4">
                  <button
                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                    className={`flex items-center justify-between w-full text-left font-medium ${
                      priceRange[0] !== minPrice || priceRange[1] !== maxPrice
                        ? "text-lime-500"
                        : "text-gray-900"
                    }`}
                  >
                    <TranslatedText>Price Range</TranslatedText>
                    {showPriceFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showPriceFilter && (
                    <div className="mt-4">
                      <PriceFilter
                        min={minPrice}
                        max={maxPrice}
                        initialRange={priceRange}
                        onApply={(range) => setPriceRange(range)}
                      />
                    </div>
                  )}
                </div>

                {/* Category Filter - Mobile */}
                {categories.length > 0 && (
                  <div className="border-b pb-4">
                    <button
                      onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                      className={`flex items-center justify-between w-full text-left font-medium ${
                        selectedCategory ? "text-lime-500" : "text-gray-900"
                      }`}
                    >
                      <TranslatedText>Categories</TranslatedText>
                      {showCategoryFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showCategoryFilter && (
                      <div className="mt-4 space-y-1 max-h-64 overflow-y-auto">
                        {/* All Categories Option */}
                        <div className="flex items-center cursor-pointer py-1" onClick={() => setSelectedCategory(null)}>
                          <div className="relative flex items-center">
                            <input
                              type="radio"
                              name="category-group-mobile"
                              checked={!selectedCategory}
                              readOnly
                              className="absolute opacity-0 w-0 h-0"
                            />
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                !selectedCategory ? "border-lime-600 bg-lime-600" : "border-gray-300"
                              }`}
                            >
                              {!selectedCategory && <div className="w-2 h-2 rounded-full bg-white"></div>}
                            </div>
                          </div>
                          <span className="text-sm text-gray-700"><TranslatedText>All Categories</TranslatedText></span>
                        </div>

                        {/* Hierarchical Category Tree */}
                        {categories.map((item) => {
                          const category = item.category
                          const level1Children = getChildren(category._id, 'category')
                          const hasChildren = level1Children.length > 0
                          const isExpanded = expandedCategories[category._id]
                          const isSelected = selectedCategory === category._id
                          const isInPath = isInSelectedPath(category._id)

                          return (
                            <div key={item._id} className="space-y-1">
                              {/* Parent Category */}
                              <div className="flex items-center justify-between py-1 group">
                                <div 
                                  className="flex items-center cursor-pointer flex-1"
                                  onClick={() => handleCategoryClick(category._id)}
                                >
                                  <div className="relative flex items-center">
                                    <input
                                      type="radio"
                                      name="category-group-mobile"
                                      checked={isSelected}
                                      readOnly
                                      className="absolute opacity-0 w-0 h-0"
                                    />
                                    <div
                                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                        isInPath ? "border-lime-600 bg-lime-600" : "border-gray-300"
                                      }`}
                                    >
                                      {isInPath && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                    </div>
                                  </div>
                                  <span className={`text-sm ${isInPath ? "text-lime-600 font-semibold" : "text-gray-700"}`}>
                                    <TranslatedText text={category.name} sourceDoc={category} fieldName="name" />
                                  </span>
                                </div>
                                {hasChildren && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleExpanded(category._id)
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded ml-2"
                                  >
                                    {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
                                  </button>
                                )}
                              </div>

                              {/* Nested subcategories would go here - simplified for mobile */}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Brand Filter - Mobile */}
                {brands.length > 0 && (
                  <div className="border-b pb-4">
                    <button
                      onClick={() => setShowBrandFilter(!showBrandFilter)}
                      className={`flex items-center justify-between w-full text-left font-medium ${
                        selectedBrands.length > 0 ? "text-lime-500" : "text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <TranslatedText>Brands</TranslatedText>
                        {selectedBrands.length > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-lime-500 rounded-full">
                            {selectedBrands.length}
                          </span>
                        )}
                      </span>
                      {showBrandFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showBrandFilter && (
                      <div className="mt-4 space-y-2">
                        <input
                          type="text"
                          placeholder="Search brands..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {filteredBrands.map((item) => (
                            <div key={item._id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`brand-mobile-${item.brand._id}`}
                                checked={selectedBrands.includes(item.brand._id)}
                                onChange={() => handleBrandClick(item.brand._id)}
                                className="w-4 h-4 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
                              />
                              <label htmlFor={`brand-mobile-${item.brand._id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                <TranslatedText text={item.brand.name} sourceDoc={item.brand} fieldName="name" />
                              </label>
                            </div>
                          ))}
                          {filteredBrands.length === 0 && (
                            <p className="text-sm text-gray-500 italic"><TranslatedText>No brands found</TranslatedText></p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Status Filter - Mobile */}
                <div className="border-b pb-4">
                  <div className={`font-medium mb-4 ${
                    stockFilters.inStock || stockFilters.outOfStock
                      ? "text-lime-500"
                      : "text-gray-900"
                  }`}><TranslatedText>Stock Status</TranslatedText></div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stock-all-mobile"
                        name="stock-filter-mobile"
                        checked={!stockFilters.inStock && !stockFilters.outOfStock}
                        onChange={() => setStockFilters({ inStock: false, outOfStock: false })}
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-all-mobile" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        <TranslatedText>All Products</TranslatedText>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stock-in-mobile"
                        name="stock-filter-mobile"
                        checked={stockFilters.inStock}
                        onChange={() => handleStockFilterChange('inStock')}
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-in-mobile" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        <TranslatedText>In Stock</TranslatedText>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stock-out-mobile"
                        name="stock-filter-mobile"
                        checked={stockFilters.outOfStock}
                        onChange={() => handleStockFilterChange('outOfStock')}
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-out-mobile" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        <TranslatedText>Out of Stock</TranslatedText>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Apply & Clear Buttons - Mobile */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full px-4 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors font-semibold"
                  >
                    <TranslatedText text={`Show ${filteredProducts.length} Products`} />
                  </button>
                  <button
                    onClick={() => {
                      clearAllFilters()
                      setIsMobileFilterOpen(false)
                    }}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    <TranslatedText>Clear All Filters</TranslatedText>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Hero Section */}
        {offerPage.heroImage && (
          <div className="relative">
            <div className="relative h-[170px] sm:h-[250px] md:h-[300px] lg:h-[310px] bg-gradient-to-r from-lime-600 to-green-600">
              <img
                src={getFullImageUrl(offerPage.heroImage)}
                alt={offerPage.name}
                className="w-full h-full bg-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {/* <div className="text-center text-white px-4">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">{offerPage.name}</h1>
                  {offerPage.description && (
                    <p className="text-lg md:text-xl max-w-3xl mx-auto">{offerPage.description}</p>
                  )}
                </div> */}
              </div>
            </div>
            
            {/* Optional Bottom Images */}
            {offerPage.cardImages && offerPage.cardImages.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 pb-4">
                <div className="w-full hidden md:grid md:grid-cols-3 justify-items-center items-center px-2 sm:px-4 md:px-8 lg:px-12 gap-2 md:gap-4">
                  {offerPage.cardImages
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .filter(cardImage => cardImage.image)
                    .map((cardImage, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-lg overflow-hidden w-full h-16 sm:h-20 md:h-30 lg:h-35 max-w-full"
                      >
                        <img
                          src={getFullImageUrl(cardImage.image)}
                          alt={`Offer ${index + 1}`}
                          className="w-full h-full bg-cover"
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Title Section (if no hero image) */}
        {!offerPage.heroImage && (
          <div className="bg-gradient-to-r from-lime-600 to-green-600 py-12">
            <div className="container mx-auto px-4 text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{offerPage.name}</h1>
              {offerPage.description && (
                <p className="text-lg md:text-xl max-w-3xl mx-auto">{offerPage.description}</p>
              )}
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-12">
          {/* Main Layout: Sidebar + Products */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Filters (Desktop Only) */}
            <aside className="w-full lg:w-1/4 hidden md:block">
              <div className="bg-white rounded-lg p-6 space-y-6 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
                {/* Active Filters Section */}
                {(selectedParentCategory || 
                  selectedSubCategory1 || 
                  selectedSubCategory2 || 
                  selectedSubCategory3 || 
                  selectedSubCategory4 || 
                  selectedBrands.length > 0 || 
                  stockFilters.inStock || 
                  stockFilters.outOfStock ||
                  priceRange[0] !== minPrice || 
                  priceRange[1] !== maxPrice) && (
                  <div className="border border-lime-200 rounded-lg p-4 bg-lime-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900"><TranslatedText>Active Filters</TranslatedText></h3>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                      >
                        <TranslatedText>Clear All</TranslatedText>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {/* Parent Category Filter */}
                      {selectedParentCategory && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Category:</TranslatedText></span>{" "}
                            <TranslatedText text={parentCategoryName || "Selected"} />
                          </span>
                          <button
                            onClick={() => {
                              setSelectedCategory(null)
                              setSelectedParentCategory(null)
                              setSelectedSubCategory1(null)
                              setSelectedSubCategory2(null)
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setParentCategoryName(null)
                              setSubCategory1Name(null)
                              setSubCategory2Name(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 1 Subcategory */}
                      {selectedSubCategory1 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Subcategory:</TranslatedText></span>{" "}
                            <TranslatedText text={subCategory1Name} />
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory1(null)
                              setSelectedSubCategory2(null)
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setSubCategory1Name(null)
                              setSubCategory2Name(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                              if (selectedParentCategory) {
                                setSelectedCategory(selectedParentCategory)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 2 Subcategory */}
                      {selectedSubCategory2 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Level 2:</TranslatedText></span>{" "}
                            <TranslatedText text={subCategory2Name} />
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory2(null)
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setSubCategory2Name(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                              if (selectedSubCategory1) {
                                setSelectedCategory(selectedSubCategory1)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 3 Subcategory */}
                      {selectedSubCategory3 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Level 3:</TranslatedText></span>{" "}
                            <TranslatedText text={subCategory3Name} />
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                              if (selectedSubCategory2) {
                                setSelectedCategory(selectedSubCategory2)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 4 Subcategory */}
                      {selectedSubCategory4 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Level 4:</TranslatedText></span>{" "}
                            <TranslatedText text={subCategory4Name} />
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory4(null)
                              setSubCategory4Name(null)
                              if (selectedSubCategory3) {
                                setSelectedCategory(selectedSubCategory3)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {selectedBrands.map(brandId => {
                        const brandItem = brands.find(b => b.brand._id === brandId)
                        return brandItem ? (
                          <div key={brandId} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                            <span className="text-gray-700">
                              <span className="font-semibold"><TranslatedText>Brand:</TranslatedText></span>{" "}
                              <TranslatedText text={brandItem.brand.name} sourceDoc={brandItem.brand} fieldName="name" />
                            </span>
                            <button
                              onClick={() => handleBrandClick(brandId)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })}

                      {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Price:</TranslatedText></span> AED {priceRange[0]} - AED {priceRange[1]}
                          </span>
                          <button
                            onClick={() => setPriceRange([minPrice, maxPrice])}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {stockFilters.inStock && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Stock:</TranslatedText></span>{" "}
                            <TranslatedText>In Stock</TranslatedText>
                          </span>
                          <button
                            onClick={() => setStockFilters({ inStock: false, outOfStock: false })}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {stockFilters.outOfStock && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Stock:</TranslatedText></span>{" "}
                            <TranslatedText>Out of Stock</TranslatedText>
                          </span>
                          <button
                            onClick={() => setStockFilters({ inStock: false, outOfStock: false })}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Price Filter */}
                <div className="border-b pb-4">
                  <button
                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                    className={`flex items-center justify-between w-full text-left font-medium ${
                      priceRange[0] !== minPrice || priceRange[1] !== maxPrice
                        ? "text-lime-500"
                        : "text-gray-900"
                    }`}
                  >
                    <TranslatedText>Price Range</TranslatedText>
                    {showPriceFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showPriceFilter && (
                    <div className="mt-4">
                      <PriceFilter
                        min={minPrice}
                        max={maxPrice}
                        initialRange={priceRange}
                        onApply={(range) => setPriceRange(range)}
                      />
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="border-b pb-4">
                    <button
                      onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                      className={`flex items-center justify-between w-full text-left font-medium ${
                        selectedCategory ? "text-lime-500" : "text-gray-900"
                      }`}
                    >
                      <TranslatedText>Categories</TranslatedText>
                      {showCategoryFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showCategoryFilter && (
                      <div className="mt-4 space-y-1">
                        {/* All Categories Option */}
                        <div className="flex items-center cursor-pointer py-1" onClick={() => setSelectedCategory(null)}>
                          <div className="relative flex items-center">
                            <input
                              type="radio"
                              name="category-group"
                              checked={!selectedCategory}
                              readOnly
                              className="absolute opacity-0 w-0 h-0"
                            />
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                !selectedCategory ? "border-lime-600 bg-lime-600" : "border-gray-300"
                              }`}
                            >
                              {!selectedCategory && <div className="w-2 h-2 rounded-full bg-white"></div>}
                            </div>
                          </div>
                          <span className="text-sm text-gray-700"><TranslatedText>All Categories</TranslatedText></span>
                        </div>

                        {/* Hierarchical Category Tree */}
                        {categories.map((item) => {
                          const category = item.category
                          const level1Children = getChildren(category._id, 'category')
                          const hasChildren = level1Children.length > 0
                          const isExpanded = expandedCategories[category._id]
                          const isSelected = selectedCategory === category._id
                          const isInPath = isInSelectedPath(category._id)

                          return (
                            <div key={item._id} className="space-y-1">
                              {/* Parent Category */}
                              <div className="flex items-center justify-between py-1 group">
                                <div 
                                  className="flex items-center cursor-pointer flex-1"
                                  onClick={() => handleCategoryClick(category._id)}
                                >
                                  <div className="relative flex items-center">
                                    <input
                                      type="radio"
                                      name="category-group"
                                      checked={isSelected}
                                      readOnly
                                      className="absolute opacity-0 w-0 h-0"
                                    />
                                    <div
                                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                        isInPath ? "border-lime-600 bg-lime-600" : "border-gray-300"
                                      }`}
                                    >
                                      {isInPath && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                    </div>
                                  </div>
                                  <span className={`text-sm ${isInPath ? "text-lime-600 font-semibold" : "text-gray-700"}`}>
                                    <TranslatedText text={category.name} sourceDoc={category} fieldName="name" />
                                  </span>
                                </div>
                                {hasChildren && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleExpanded(category._id)
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded ml-2"
                                  >
                                    {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
                                  </button>
                                )}
                              </div>

                              {/* Level 1 Subcategories */}
                              {isExpanded && level1Children.map((level1) => {
                                const level2Children = getChildren(level1._id, 'subcategory')
                                const hasLevel2 = level2Children.length > 0
                                const isLevel1Expanded = expandedCategories[level1._id]
                                const isLevel1Selected = selectedCategory === level1._id
                                const isLevel1InPath = isInSelectedPath(level1._id)

                                return (
                                  <div key={level1._id} className="ml-6 space-y-1">
                                    {/* Level 1 Item */}
                                    <div className="flex items-center justify-between py-1 group">
                                      <div
                                        className="flex items-center cursor-pointer flex-1"
                                        onClick={() => handleCategoryClick(level1._id)}
                                      >
                                        <div className="relative flex items-center">
                                          <input
                                            type="radio"
                                            checked={isLevel1Selected}
                                            readOnly
                                            className="absolute opacity-0 w-0 h-0"
                                          />
                                          <div
                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                              isLevel1InPath ? "border-lime-600 bg-lime-600" : "border-gray-300"
                                            }`}
                                          >
                                            {isLevel1InPath && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                          </div>
                                        </div>
                                        <span className={`text-sm ${isLevel1InPath ? "text-lime-600 font-semibold" : "text-gray-600"}`}>
                                          <TranslatedText text={level1.name} sourceDoc={level1} fieldName="name" />
                                        </span>
                                      </div>
                                      {hasLevel2 && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            toggleExpanded(level1._id)
                                          }}
                                          className="p-1 hover:bg-gray-100 rounded ml-2"
                                        >
                                          {isLevel1Expanded ? <Minus size={14} /> : <Plus size={14} />}
                                        </button>
                                      )}
                                    </div>

                                    {/* Level 2 Subcategories */}
                                    {isLevel1Expanded && level2Children.map((level2) => {
                                      const level3Children = getChildren(level2._id, 'subcategory')
                                      const hasLevel3 = level3Children.length > 0
                                      const isLevel2Expanded = expandedCategories[level2._id]
                                      const isLevel2Selected = selectedCategory === level2._id
                                      const isLevel2InPath = isInSelectedPath(level2._id)

                                      return (
                                        <div key={level2._id} className="ml-6 space-y-1">
                                          {/* Level 2 Item */}
                                          <div className="flex items-center justify-between py-1 group">
                                            <div
                                              className="flex items-center cursor-pointer flex-1"
                                              onClick={() => handleCategoryClick(level2._id)}
                                            >
                                              <div className="relative flex items-center">
                                                <input
                                                  type="radio"
                                                  checked={isLevel2Selected}
                                                  readOnly
                                                  className="absolute opacity-0 w-0 h-0"
                                                />
                                                <div
                                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                                    isLevel2InPath ? "border-lime-600 bg-lime-600" : "border-gray-300"
                                                  }`}
                                                >
                                                  {isLevel2InPath && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                </div>
                                              </div>
                                              <span className={`text-sm ${isLevel2InPath ? "text-lime-600 font-semibold" : "text-gray-600"}`}>
                                              <TranslatedText text={level2.name} sourceDoc={level2} fieldName="name" />
                                              </span>
                                            </div>
                                            {hasLevel3 && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  toggleExpanded(level2._id)
                                                }}
                                                className="p-1 hover:bg-gray-100 rounded ml-2"
                                              >
                                                {isLevel2Expanded ? <Minus size={14} /> : <Plus size={14} />}
                                              </button>
                                            )}
                                          </div>

                                          {/* Level 3 Subcategories */}
                                          {isLevel2Expanded && level3Children.map((level3) => {
                                            const level4Children = getChildren(level3._id, 'subcategory')
                                            const hasLevel4 = level4Children.length > 0
                                            const isLevel3Expanded = expandedCategories[level3._id]
                                            const isLevel3Selected = selectedCategory === level3._id
                                            const isLevel3InPath = isInSelectedPath(level3._id)

                                            return (
                                              <div key={level3._id} className="ml-6 space-y-1">
                                                {/* Level 3 Item */}
                                                <div className="flex items-center justify-between py-1 group">
                                                  <div
                                                    className="flex items-center cursor-pointer flex-1"
                                                    onClick={() => handleCategoryClick(level3._id)}
                                                  >
                                                    <div className="relative flex items-center">
                                                      <input
                                                        type="radio"
                                                        checked={isLevel3Selected}
                                                        readOnly
                                                        className="absolute opacity-0 w-0 h-0"
                                                      />
                                                      <div
                                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                                          isLevel3InPath ? "border-lime-600 bg-lime-600" : "border-gray-300"
                                                        }`}
                                                      >
                                                        {isLevel3InPath && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                      </div>
                                                    </div>
                                                    <span className={`text-sm ${isLevel3InPath ? "text-lime-600 font-semibold" : "text-gray-600"}`}>
                                                      <TranslatedText text={level3.name} sourceDoc={level3} fieldName="name" />
                                                    </span>
                                                  </div>
                                                  {hasLevel4 && (
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleExpanded(level3._id)
                                                      }}
                                                      className="p-1 hover:bg-gray-100 rounded ml-2"
                                                    >
                                                      {isLevel3Expanded ? <Minus size={14} /> : <Plus size={14} />}
                                                    </button>
                                                  )}
                                                </div>

                                                {/* Level 4 Subcategories */}
                                                {isLevel3Expanded && level4Children.map((level4) => {
                                                  const isLevel4Selected = selectedCategory === level4._id
                                                  const isLevel4InPath = isInSelectedPath(level4._id)

                                                  return (
                                                    <div key={level4._id} className="ml-6 flex items-center justify-between py-1 group">
                                                      <div
                                                        className="flex items-center cursor-pointer flex-1"
                                                        onClick={() => handleCategoryClick(level4._id)}
                                                      >
                                                        <div className="relative flex items-center">
                                                          <input
                                                            type="radio"
                                                            checked={isLevel4Selected}
                                                            readOnly
                                                            className="absolute opacity-0 w-0 h-0"
                                                          />
                                                          <div
                                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                                              isLevel4InPath ? "border-lime-600 bg-lime-600" : "border-gray-300"
                                                            }`}
                                                          >
                                                            {isLevel4InPath && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                          </div>
                                                        </div>
                                                        <span className={`text-sm ${isLevel4InPath ? "text-lime-600 font-semibold" : "text-gray-600"}`}>
                                                          <TranslatedText text={level4.name} sourceDoc={level4} fieldName="name" />
                                                        </span>
                                                      </div>
                                                    </div>
                                                  )
                                                })}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Brand Filter */}
                {brands.length > 0 && (
                  <div className="border-b pb-4">
                    <button
                      onClick={() => setShowBrandFilter(!showBrandFilter)}
                      className={`flex items-center justify-between w-full text-left font-medium ${
                        selectedBrands.length > 0 ? "text-lime-500" : "text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <TranslatedText>Brands</TranslatedText>
                        {selectedBrands.length > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-lime-500 rounded-full">
                            {selectedBrands.length}
                          </span>
                        )}
                      </span>
                      {showBrandFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showBrandFilter && (
                      <div className="mt-4 space-y-2">
                        <input
                          type="text"
                          placeholder="Search brands..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                        <div className="space-y-2">
                          {filteredBrands.map((item) => (
                            <div key={item._id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`brand-${item.brand._id}`}
                                checked={selectedBrands.includes(item.brand._id)}
                                onChange={() => handleBrandClick(item.brand._id)}
                                className="w-4 h-4 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
                              />
                              <label htmlFor={`brand-${item.brand._id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                <TranslatedText text={item.brand.name} sourceDoc={item.brand} fieldName="name" />
                              </label>
                            </div>
                          ))}
                          {filteredBrands.length === 0 && (
                            <p className="text-sm text-gray-500 italic"><TranslatedText>No brands found</TranslatedText></p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Status Filter */}
                <div className="border-b pb-4">
                  <div className={`font-medium mb-4 ${
                    stockFilters.inStock || stockFilters.outOfStock
                      ? "text-lime-500"
                      : "text-gray-900"
                  }`}><TranslatedText>Stock Status</TranslatedText></div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stock-all"
                        name="stock-filter"
                        checked={!stockFilters.inStock && !stockFilters.outOfStock}
                        onChange={() => setStockFilters({ inStock: false, outOfStock: false })}
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-all" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        <TranslatedText>All Products</TranslatedText>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stock-in"
                        name="stock-filter"
                        checked={stockFilters.inStock}
                        onChange={() => handleStockFilterChange('inStock')}
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-in" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        <TranslatedText>In Stock</TranslatedText>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stock-out"
                        name="stock-filter"
                        checked={stockFilters.outOfStock}
                        onChange={() => handleStockFilterChange('outOfStock')}
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-out" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        <TranslatedText>Out of Stock</TranslatedText>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Clear All Button */}
                <div className="pt-4">
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <TranslatedText>Clear All Filters</TranslatedText>
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content Area - Categories, Brands, and Products */}
            <div className="flex-1 lg:w-3/4">
              {/* Mobile Filter Button */}
              <div className="md:hidden mb-4 flex gap-2">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors font-semibold shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <TranslatedText>Filters</TranslatedText>
                  {(selectedParentCategory || 
                    selectedSubCategory1 || 
                    selectedSubCategory2 || 
                    selectedSubCategory3 || 
                    selectedSubCategory4 || 
                    selectedBrands.length > 0 || 
                    stockFilters.inStock || 
                    stockFilters.outOfStock ||
                    priceRange[0] !== minPrice || 
                    priceRange[1] !== maxPrice) && (
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-white text-lime-600 rounded-full">
                      {[
                        selectedParentCategory || selectedSubCategory1 || selectedSubCategory2 || selectedSubCategory3 || selectedSubCategory4,
                        selectedBrands.length,
                        stockFilters.inStock || stockFilters.outOfStock,
                        priceRange[0] !== minPrice || priceRange[1] !== maxPrice
                      ].filter(Boolean).length}
                    </span>
                  )}
                </button>
                <div className="flex-shrink-0">
                  <SortDropdown value={sortBy} onChange={(e) => setSortBy(e.target.value)} />
                </div>
              </div>

              {/* Categories Slider - First Line */}
              {false && sliderCategories.length > 0 && (
                <section className="mb-8">
                  {/* <h2 className="text-2xl font-bold text-gray-800 mb-4">Categories...</h2> */}
                  <div className="relative">
                    <button
                      onClick={() => scrollSlider(categoriesScrollRef, 'left')}
                      className="absolute left-0 md:-left-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-lime-500 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div
                      ref={categoriesScrollRef}
                      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-10 md:px-12"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {sliderCategories.map((item) => {
                        const catData = item.category
                        const displayName = catData?.displayName || catData?.name || 'N/A'
                        const displayImage = catData?.image
                        return (
                          <button
                            key={item._id}
                            onClick={() => handleCategoryClick(catData._id)}
                            className={`flex-shrink-0 w-32 rounded-lg transition-all flex flex-col items-center p-2 ${
                              selectedCategory === catData._id
                                ? 'bg-lime-100 border-2 border-lime-600'
                                : ''
                            }`}
                          >
                            <div className="flex-1 flex items-center justify-center w-full mb-2">
                              {displayImage ? (
                                <img
                                  src={displayImage}
                                  alt={displayName}
                                  className="max-h-16 max-w-full object-contain"
                                />
                              ) : (
                                <span className="text-2xl">📦</span>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-gray-700 text-center line-clamp-2 w-full">
                              {displayName}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => scrollSlider(categoriesScrollRef, 'right')}
                      className="absolute right-0 md:-right-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-lime-500 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </section>
              )}

              {/* Brands Slider */}
              {sliderBrands.length > 0 && (
                <section className="mb-8">
                  <div className="relative">
                    <button
                      onClick={scrollBrandPrev}
                      className={`absolute left-0 md:-left-5 top-1/2 -translate-y-1/2 z-10 shadow-lg rounded-full p-2 transition-colors ${
                        brandScrollState.canScrollPrev
                          ? "bg-lime-500 text-white hover:bg-lime-600 cursor-pointer"
                          : "bg-white cursor-default opacity-50"
                      }`}
                      disabled={!brandScrollState.canScrollPrev}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div
                      ref={brandSliderRef}
                      onScroll={updateBrandScrollState}
                      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-10 md:px-12"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {sliderBrands.map((item) => (
                        <button
                          key={item._id}
                          onClick={() => handleBrandClick(item.brand._id)}
                          className={`flex-shrink-0 w-32 rounded-lg transition-all flex flex-col items-center p-2 ${
                            selectedBrands.includes(item.brand._id)
                              ? 'bg-lime-100 border-2 border-lime-600'
                              : ''
                          }`}
                        >
                          <div className="flex-1 flex items-center justify-center w-full mb-2">
                            {item.brand.logo ? (
                              <img
                                src={getFullImageUrl(item.brand.logo)}
                                alt={item.brand.name}
                                className="max-h-16 max-w-full object-contain"
                              />
                            ) : (
                              <span className="text-2xl">🏷️</span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-gray-700 text-center line-clamp-2 w-full">
                            {item.brand.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={scrollBrandNext}
                      className={`absolute right-0 md:-right-5 top-1/2 -translate-y-1/2 z-10 shadow-lg rounded-full p-2 transition-colors ${
                        brandScrollState.canScrollNext
                          ? "bg-lime-500 text-white hover:bg-lime-600 cursor-pointer"
                          : "bg-white cursor-default opacity-50"
                      }`}
                      disabled={!brandScrollState.canScrollNext}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </section>
              )}

              <div className="flex flex-row justify-between items-center mb-6 relative z-10">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900">{offerPage?.name}</h1>
                  <p className="text-gray-600 mt-1">{filteredProducts.length} products found</p>
                </div>
                <div className="hidden md:block mt-0 flex-shrink-0 relative z-20">
                  <SortDropdown value={sortBy} onChange={(e) => setSortBy(e.target.value)} />
                </div>
              </div>



              {/* Products Section */}
              {filteredProducts.length > 0 && (
                <section>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((item, index) => (
                      <ProductCard key={item._id} product={item.product} offerPageName={offerPage?.name} cardIndex={index} />
                    ))}
                  </div>
                </section>
              )}

              {/* No Results State */}
              {filteredProducts.length === 0 && products.length > 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg mb-4">No products match your selected filters.</p>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OfferPage
