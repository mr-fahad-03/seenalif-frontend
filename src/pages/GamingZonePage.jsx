import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import config from "../config/config"
import ProductCard from "../components/ProductCard"
import TranslatedText from "../components/TranslatedText"
import { Helmet } from "react-helmet-async"
import { ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, X, Filter } from "lucide-react"
import { getFullImageUrl } from "../utils/imageUtils"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"

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
      >
        <span className="truncate max-w-[46vw] sm:max-w-none">{current}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute right-0 mt-1 w-56 max-w-[80vw] bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
          {options.map((opt) => (
            <li key={opt.value}>
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

const PriceFilter = ({ min, max, onApply, initialRange }) => {
  const [range, setRange] = useState(initialRange || [min, max])
  const [inputMin, setInputMin] = useState(range[0])
  const [inputMax, setInputMax] = useState(range[1])

  const handleSliderChange = (values) => {
    setRange(values)
    setInputMin(values[0])
    setInputMax(values[1])
  }

  const handleInputMin = (e) => {
    const value = e.target.value
    if (value === "") {
      setInputMin("")
    } else if (!isNaN(value)) {
      const numericValue = Number(value)
      setInputMin(numericValue)
      setRange([numericValue, range[1]])
    }
  }

  const handleInputMax = (e) => {
    const value = e.target.value
    if (value === "") {
      setInputMax("")
    } else if (!isNaN(value)) {
      const numericValue = Number(value)
      setInputMax(numericValue)
      setRange([range[0], numericValue])
    }
  }

  const handleMinFocus = (e) => {
    setInputMin("")
  }

  const handleMaxFocus = (e) => {
    setInputMax("")
  }

  const handleApply = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const minValue = inputMin === "" ? 0 : Number(inputMin)
    const maxValue = inputMax === "" ? max : Number(inputMax)
    onApply([minValue, maxValue])
  }

  return (
    <div className="">
      <Slider
        range
        min={min}
        max={max}
        value={range}
        onChange={handleSliderChange}
        trackStyle={[{ backgroundColor: "#84cc16" }]}
        handleStyle={[
          { backgroundColor: "#84cc16", borderColor: "#84cc16" },
          { backgroundColor: "#84cc16", borderColor: "#84cc16" },
        ]}
        railStyle={{ backgroundColor: "#e5e7eb" }}
      />
      <div className="flex justify-between mt-4 mb-2 text-xs font-semibold">
        <span><TranslatedText>MIN</TranslatedText></span>
        <span><TranslatedText>MAX</TranslatedText></span>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          className="w-1/2 border rounded px-2 py-1 text-center focus:border-lime-500 focus:ring-lime-500"
          value={inputMin}
          min={min}
          max={inputMax}
          onChange={handleInputMin}
          onFocus={handleMinFocus}
          onBlur={() => {
            if (inputMin === "") {
              setInputMin(0)
            }
          }}
        />
        <input
          type="number"
          className="w-1/2 border rounded px-2 py-1 text-center focus:border-lime-500 focus:ring-lime-500"
          value={inputMax}
          min={inputMin}
          max={max}
          onChange={handleInputMax}
          onFocus={handleMaxFocus}
          onBlur={() => {
            if (inputMax === "") {
              setInputMax(max)
            }
          }}
        />
      </div>
      <button
        type="button"
        className="w-full bg-white border border-lime-500 text-lime-600 rounded py-2 font-semibold hover:bg-lime-50 hover:text-lime-700 hover:border-lime-600 transition"
        onClick={handleApply}
      >
        <TranslatedText>Apply</TranslatedText>
      </button>
    </div>
  )
}

const GamingZonePage = () => {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [gamingZonePage, setGamingZonePage] = useState(null)
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [gamingZoneCategories, setGamingZoneCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [brands, setBrands] = useState([])
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [maxPrice, setMaxPrice] = useState(100000)
  const [minPrice, setMinPrice] = useState(0)
  const [stockFilters, setStockFilters] = useState({ inStock: false, outOfStock: false })
  const [brandSearch, setBrandSearch] = useState("")
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [showPriceFilter, setShowPriceFilter] = useState(true)
  const [showCategoryFilter, setShowCategoryFilter] = useState(true)
  const [showBrandFilter, setShowBrandFilter] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Brand slider state
  const brandSliderRef = useRef(null)
  const [brandScrollState, setBrandScrollState] = useState({
    canScrollPrev: false,
    canScrollNext: false
  })

  const [productsToShow, setProductsToShow] = useState(20)

  useEffect(() => {
    fetchGamingZoneData()
  }, [slug])

  useEffect(() => {
    applyFiltersAndSort()
  }, [sortBy, allProducts, selectedCategories, selectedBrands, priceRange, stockFilters])

  useEffect(() => {
    setProductsToShow(20)
  }, [selectedCategories, selectedBrands, priceRange, stockFilters, sortBy, filteredProducts.length])

  const fetchGamingZoneData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch gaming zone page details
      const pageResponse = await axios.get(`${config.API_URL}/api/gaming-zone-pages/slug/${slug}`)
      const pageData = pageResponse.data

      if (!pageData.isActive) {
        setError("This gaming zone is currently not available.")
        setLoading(false)
        return
      }

      setGamingZonePage(pageData)

      // Fetch admin-selected categories for this gaming zone
      const categoriesResponse = await axios.get(
        `${config.API_URL}/api/gaming-zone-categories/page/${slug}`
      )
      const activeCategories = categoriesResponse.data.filter(cat => cat.isActive)
      setGamingZoneCategories(activeCategories)

      // Fetch all products for this gaming zone (no pagination)
      const productsResponse = await axios.get(
        `${config.API_URL}/api/gaming-zone-pages/slug/${slug}/products?page=1&limit=10000`
      )

      const fetchedProducts = productsResponse.data.products || []

      setAllProducts(fetchedProducts)
      setProducts(fetchedProducts)
      setFilteredProducts(fetchedProducts)
      setTotalProducts(fetchedProducts.length)

      // Calculate price range
      if (fetchedProducts.length > 0) {
        const prices = fetchedProducts.map(p => p.price || 0)
        const min = Math.floor(Math.min(...prices))
        const max = Math.ceil(Math.max(...prices))
        setMinPrice(min)
        setMaxPrice(max)
        setPriceRange([min, max])
      }

      // Extract unique brands from products and keep logo so brand slider can render images.
      const brandMap = new Map()
      fetchedProducts.forEach((product) => {
        const brand = product?.brand
        if (!brand || !brand._id || !brand.name) return

        const existing = brandMap.get(brand._id)
        const logo = brand.logo || brand.image || brand.brandImage || existing?.logo || ""

        brandMap.set(brand._id, {
          _id: brand._id,
          name: brand.name,
          logo,
        })
      })

      setBrands(Array.from(brandMap.values()))

    } catch (err) {
      console.error("Error fetching gaming zone data:", err)
      setError("Failed to load gaming zone. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...allProducts]

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => {
        // Helper function to get ID from field (handles both object and string)
        const getId = (field) => {
          if (!field) return null
          return typeof field === 'object' ? field._id : field
        }

        // Build array of all category IDs in this product's hierarchy
        const productCategoryIds = [
          getId(product.parentCategory),
          getId(product.parent_category),
          getId(product.category),
          getId(product.subCategory2),
          getId(product.subcategory2),
          getId(product.subCategory3),
          getId(product.subcategory3),
          getId(product.subCategory4),
          getId(product.subcategory4)
        ].filter(Boolean) // Remove null/undefined values

        // Check if ANY selected category matches ANY of the product's category IDs
        const match = selectedCategories.some(selectedCatId => 
          productCategoryIds.includes(selectedCatId)
        )
        return match
      })
    }

    // Filter by selected brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.includes(product.brand?._id)
      )
    }

    // Filter by price range
    filtered = filtered.filter(product => {
      const price = product.price || 0
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Filter by stock status
    if (stockFilters.inStock && !stockFilters.outOfStock) {
      filtered = filtered.filter(p => p.stockStatus !== "Out of Stock")
    } else if (!stockFilters.inStock && stockFilters.outOfStock) {
      filtered = filtered.filter(p => p.stockStatus === "Out of Stock")
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "name":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        break
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    setFilteredProducts(filtered)
    setTotalProducts(filtered.length)
  }

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleBrandToggle = (brandId) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    )
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange([minPrice, maxPrice])
    setStockFilters({ inStock: false, outOfStock: false })
    setBrandSearch("")
  }

  // Brand slider handlers
  const updateBrandScrollState = () => {
    const container = brandSliderRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setBrandScrollState({
      canScrollPrev: scrollLeft > 0,
      canScrollNext: scrollLeft < scrollWidth - clientWidth - 1
    })
  }

  const scrollBrandPrev = () => {
    if (brandSliderRef.current) {
      brandSliderRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollBrandNext = () => {
    if (brandSliderRef.current) {
      brandSliderRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  // Update brand slider scroll state when brands change
  useEffect(() => {
    if (brandSliderRef.current) {
      updateBrandScrollState()
    }
  }, [brands])

  const applySort = () => {
    // Sorting is now handled in applyFiltersAndSort()
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  )

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{gamingZonePage?.name || "Gaming Zone"} - Graba2z</title>
        <meta name="description" content={`Browse ${gamingZonePage?.name} products`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Image */}
        {gamingZonePage?.heroImage && (
          <div className="w-full h-[170px] sm:h-[250px] md:h-[300px] lg:h-[310px] overflow-hidden">
            <img
              src={getFullImageUrl(gamingZonePage.heroImage)}
              alt={gamingZonePage.name}
              className="w-full h-full bg-cover"
            />
          </div>
        )}

        {/* Card Images */}
        {gamingZonePage?.cardImages && gamingZonePage.cardImages.length > 0 && (
          <div className="container mx-auto px-4 py-8">
            <div className={`grid gap-4 ${
              gamingZonePage.cardImages.length === 1 ? 'grid-cols-1' :
              gamingZonePage.cardImages.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-3'
            }`}>
              {gamingZonePage.cardImages.map((card, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src={getFullImageUrl(card.image)}
                    alt={`${gamingZonePage.name} card ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Section with Sidebar */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                {/* Active Filters Section */}
                {(selectedCategories.length > 0 || 
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
                      {/* Category Filters */}
                      {selectedCategories.map((catId) => {
                        const category = gamingZoneCategories.find(c => c.category._id === catId)
                        return category ? (
                          <div key={catId} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                            <span className="text-gray-700">
                              <span className="font-semibold"><TranslatedText>Category:</TranslatedText></span>{" "}
                              <TranslatedText text={category.category.name} sourceDoc={category.category} fieldName="name" />
                            </span>
                            <button
                              onClick={() => handleCategoryToggle(catId)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })}

                      {/* Selected Brands */}
                      {selectedBrands.map((brandId) => {
                        const brand = brands.find(b => b._id === brandId)
                        return brand ? (
                          <div key={brandId} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                            <span className="text-gray-700">
                              <span className="font-semibold"><TranslatedText>Brand:</TranslatedText></span>{" "}
                              <TranslatedText text={brand.name} sourceDoc={brand} fieldName="name" />
                            </span>
                            <button
                              onClick={() => handleBrandToggle(brandId)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })}

                      {/* Price Range Filter */}
                      {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Price:</TranslatedText></span>{" "}
                            AED {priceRange[0].toLocaleString()} - AED {priceRange[1].toLocaleString()}
                          </span>
                          <button
                            onClick={() => setPriceRange([minPrice, maxPrice])}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Stock Status Filters */}
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
                    <div className="mt-4 space-y-4">
                      <PriceFilter
                        min={minPrice}
                        max={maxPrice}
                        initialRange={priceRange}
                        onApply={(range) => setPriceRange(range)}
                      />
                    </div>
                  )}
                </div>

                {/* Categories Filter */}
                {gamingZoneCategories.length > 0 && (
                  <div className="border-b pb-4">
                    <button
                      onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                      className={`flex items-center justify-between w-full text-left font-medium ${
                        selectedCategories.length > 0
                          ? "text-lime-500"
                          : "text-gray-900"
                      }`}
                    >
                      <TranslatedText>Categories</TranslatedText>
                      {showCategoryFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showCategoryFilter && (
                      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {gamingZoneCategories.map((cat) => (
                          <label key={cat._id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat.category._id)}
                              onChange={() => handleCategoryToggle(cat.category._id)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700">
                              <TranslatedText text={cat.category.name} sourceDoc={cat.category} fieldName="name" />
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Brands Filter */}
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
                        <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {filteredBrands.map((brand) => (
                            <label key={brand._id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand._id)}
                                onChange={() => handleBrandToggle(brand._id)}
                                className="w-4 h-4 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
                              />
                              <span className="text-sm text-gray-700">
                                <TranslatedText text={brand.name} sourceDoc={brand} fieldName="name" />
                              </span>
                            </label>
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
                        onChange={(e) =>
                          setStockFilters({ inStock: e.target.checked, outOfStock: false })
                        }
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
                        onChange={(e) =>
                          setStockFilters({ inStock: false, outOfStock: e.target.checked })
                        }
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-out" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        <TranslatedText>Out of Stock</TranslatedText>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Overlay */}
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
                    {(selectedCategories.length > 0 || 
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
                          {selectedCategories.map((catId) => {
                            const category = gamingZoneCategories.find(c => c.category._id === catId)
                            return category ? (
                              <div key={catId} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                                <span className="text-gray-700">
                                  <span className="font-semibold"><TranslatedText>Category:</TranslatedText></span>{" "}
                                  <TranslatedText text={category.category.name} sourceDoc={category.category} fieldName="name" />
                                </span>
                                <button
                                  onClick={() => handleCategoryToggle(catId)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  ×
                                </button>
                              </div>
                            ) : null
                          })}
                          {selectedBrands.map((brandId) => {
                            const brand = brands.find((b) => b._id === brandId)
                            return brand ? (
                              <div key={brandId} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                                <span className="text-gray-700">
                                  <span className="font-semibold"><TranslatedText>Brand:</TranslatedText></span>{" "}
                                  <TranslatedText text={brand.name} sourceDoc={brand} fieldName="name" />
                                </span>
                                <button
                                  onClick={() => handleBrandToggle(brandId)}
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

                    {/* Same filters as desktop */}
                    <div className="space-y-6">
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
                          <div className="mt-4 space-y-4">
                            <PriceFilter
                              min={minPrice}
                              max={maxPrice}
                              initialRange={priceRange}
                              onApply={(range) => setPriceRange(range)}
                            />
                          </div>
                        )}
                      </div>

                      {/* Categories - Mobile */}
                      {gamingZoneCategories.length > 0 && (
                        <div className="border-b pb-4">
                          <button
                            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                            className={`flex items-center justify-between w-full text-left font-medium ${
                              selectedCategories.length > 0
                                ? "text-lime-500"
                                : "text-gray-900"
                            }`}
                          >
                            <TranslatedText>Categories</TranslatedText>
                            {showCategoryFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {showCategoryFilter && (
                            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                              {gamingZoneCategories.map((cat) => (
                                <label key={cat._id} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat.category._id)}
                                    onChange={() => handleCategoryToggle(cat.category._id)}
                                    className="w-4 h-4 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    <TranslatedText text={cat.category.name} sourceDoc={cat.category} fieldName="name" />
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Brands - Mobile */}
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
                                {filteredBrands.map((brand) => (
                                  <div key={brand._id} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`brand-mobile-${brand._id}`}
                                      checked={selectedBrands.includes(brand._id)}
                                      onChange={() => handleBrandToggle(brand._id)}
                                      className="w-4 h-4 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
                                    />
                                    <label htmlFor={`brand-mobile-${brand._id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                      <TranslatedText text={brand.name} sourceDoc={brand} fieldName="name" />
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

                      {/* Stock Status - Mobile */}
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
                              onChange={(e) =>
                                setStockFilters({ inStock: e.target.checked, outOfStock: false })
                              }
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
                              onChange={(e) =>
                                setStockFilters({ inStock: false, outOfStock: e.target.checked })
                              }
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
              </div>
            )}
  


  
            {/* Main Content */}
            <div className="flex-1 min-w-0">
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
                  {(selectedCategories.length > 0 || 
                    selectedBrands.length > 0 || 
                    stockFilters.inStock || 
                    stockFilters.outOfStock || 
                    priceRange[0] !== minPrice || 
                    priceRange[1] !== maxPrice) && (
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-white text-lime-600 rounded-full">
                      {[selectedCategories.length > 0, selectedBrands.length > 0, 
                        stockFilters.inStock || stockFilters.outOfStock,
                        priceRange[0] !== minPrice || priceRange[1] !== maxPrice].filter(Boolean).length}
                    </span>
                  )}
                </button>
                <div className="flex-shrink-0">
                  <SortDropdown value={sortBy} onChange={(e) => setSortBy(e.target.value)} />
                </div>
              </div>

              {/* Brand Slider - Shows brands from currently displayed products */}
              {brands.length > 0 && (
                <section className="mb-8 ">
                  <div className="relative">
                    <button
                      onClick={scrollBrandPrev}
                      className={`absolute left-0 md:-left-5 top-1/2 -translate-y-1/2 z-10 shadow-lg rounded-full p-2 transition-colors ${
                        brandScrollState.canScrollPrev 
                          ? 'bg-lime-500 text-white hover:bg-lime-600 cursor-pointer' 
                          : 'bg-white cursor-default opacity-50'
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
                      {brands.map((brand) => (
                        <button
                          key={brand._id}
                          onClick={() => handleBrandToggle(brand._id)}
                          className={`flex-shrink-0 w-32 rounded-lg transition-all flex flex-col items-center p-2 ${
                            selectedBrands.includes(brand._id)
                              ? 'bg-lime-100 border-2 border-lime-600'
                              : ''
                          }`}
                        >
                          <div className="flex-1 flex items-center justify-center w-full mb-2">
                            {brand.logo ? (
                              <img
                                src={getFullImageUrl(brand.logo)}
                                alt={`${brand.name || "Brand"} Logo`}
                                className="max-h-16 max-w-full object-contain"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                  const btn = e.currentTarget.closest("button")
                                  const fallback = btn?.querySelector("[data-brand-fallback]")
                                  if (fallback) fallback.classList.remove("hidden")
                                }}
                              />
                            ) : (
                              <span className="text-sm font-semibold text-gray-700 text-center">
                                {brand.name}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-gray-700 text-center line-clamp-2 w-full">
                            {brand.name}
                          </span>
                          {/*
                            Keep fallback for broken images while preserving compact OfferPage-like sizing.
                          */}
                          <span data-brand-fallback className="hidden text-sm font-semibold text-gray-700 text-center">
                            {brand.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={scrollBrandNext}
                      className={`absolute right-0 md:-right-5 top-1/2 -translate-y-1/2 z-10 shadow-lg rounded-full p-2 transition-colors ${
                        brandScrollState.canScrollNext 
                          ? 'bg-lime-500 text-white hover:bg-lime-600 cursor-pointer' 
                          : 'bg-white cursor-default opacity-50'
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
                  <h1 className="text-2xl font-bold text-gray-900">{gamingZonePage?.name}</h1>
                  <p className="text-gray-600 mt-1">{totalProducts} products found</p>
                </div>
                <div className="hidden md:block mt-0 flex-shrink-0 relative z-20">
                  <SortDropdown value={sortBy} onChange={(e) => setSortBy(e.target.value)} />
                </div>
              </div>


              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No products match your filters.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.slice(0, productsToShow).map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                  {productsToShow < filteredProducts.length && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setProductsToShow((prev) => prev + 20)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors font-semibold"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GamingZonePage

