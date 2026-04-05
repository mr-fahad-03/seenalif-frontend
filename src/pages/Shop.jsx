"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react"
import axios from "axios"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import HomeStyleProductCard from "../components/HomeStyleProductCard"
import ProductSchema from "../components/ProductSchema"
import SEO from "../components/SEO"
import productCache from "../services/productCache"
import { generateShopURL, parseShopURL, createSlug } from "../utils/urlUtils"
import { createMetaDescription, generateSEOTitle } from "../utils/seoHelpers"
import { getFullImageUrl } from "../utils/imageUtils"
import TranslatedText from "../components/TranslatedText"
import { preloadTranslations } from "../LanguageModel/translationService"

import config from "../config/config"
import "rc-slider/assets/index.css"
import Slider from "rc-slider"

const API_BASE_URL = `${config.API_URL}`
const PRODUCTS_BATCH_SIZE = 16

// Right-anchored custom dropdown to avoid right overflow
const SortDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const options = [
    { value: "newest", label: "Newest First", labelAr: "الأحدث أولاً" },
    { value: "price-low", label: "Price: Low to High", labelAr: "السعر: من الأقل للأعلى" },
    { value: "price-high", label: "Price: High to Low", labelAr: "السعر: من الأعلى للأقل" },
    { value: "name", label: "Name: A-Z", labelAr: "الاسم: أ-ي" },
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
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#505e4d] focus:outline-none focus:ring-2 focus:ring-[#505e4d]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate max-w-[46vw] sm:max-w-none"><TranslatedText text={current} /></span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          className="absolute right-0 z-50 mt-2 w-56 max-w-[80vw] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          role="listbox"
        >
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={opt.value === value}>
              <button
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 ${
                  opt.value === value ? "bg-[#f1f4f0] font-semibold text-[#505e4d]" : ""
                  }`}
              >
                <TranslatedText text={opt.label} />
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
        trackStyle={[{ backgroundColor: "#505e4d" }]}
        handleStyle={[
          { backgroundColor: "#505e4d", borderColor: "#505e4d" },
          { backgroundColor: "#505e4d", borderColor: "#505e4d" },
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
          className="w-1/2 border rounded px-2 py-1 text-center focus:border-[#505e4d] focus:ring-[#505e4d]"
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
          className="w-1/2 border rounded px-2 py-1 text-center focus:border-[#505e4d] focus:ring-[#505e4d]"
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
        className="w-full bg-white border border-[#505e4d] text-[#505e4d] rounded py-2 font-semibold hover:bg-[#f4f6f3] hover:text-[#505e4d] hover:border-[#505e4d] transition"
        onClick={handleApply}
      >
        <TranslatedText>Apply</TranslatedText>
      </button>
    </div>
  )
}

const Shop = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const { addToCart } = useCart()
  const { currentLanguage } = useLanguage()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [actualSearchQuery, setActualSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [maxPrice, setMaxPrice] = useState(10000)
  const [globalMaxPrice, setGlobalMaxPrice] = useState(null)
  const [sortBy, setSortBy] = useState("newest")
  const [brandSearch, setBrandSearch] = useState("")
  const [subCategories, setSubCategories] = useState([])
  const [selectedSubCategories, setSelectedSubCategories] = useState([])
  const [selectedSubCategory2, setSelectedSubCategory2] = useState(null)
  const [selectedSubCategory3, setSelectedSubCategory3] = useState(null)
  const [selectedSubCategory4, setSelectedSubCategory4] = useState(null)
  const [currentSubCategoryName, setCurrentSubCategoryName] = useState(null)
  const [currentSubCategory2Name, setCurrentSubCategory2Name] = useState(null)
  const [currentSubCategory3Name, setCurrentSubCategory3Name] = useState(null)
  const [currentSubCategory4Name, setCurrentSubCategory4Name] = useState(null)
  // Add state for full subcategory objects with SEO data
  const [subCategory2Data, setSubCategory2Data] = useState(null)
  const [subCategory3Data, setSubCategory3Data] = useState(null)
  const [subCategory4Data, setSubCategory4Data] = useState(null)
  const [stockFilters, setStockFilters] = useState({ inStock: true, outOfStock: false, onSale: false })
  const [minPrice, setMinPrice] = useState(0)

  const [showPriceFilter, setShowPriceFilter] = useState(true)
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const [showBrandFilter, setShowBrandFilter] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // State for expandable category tree
  const [expandedCategories, setExpandedCategories] = useState({})
  const [allSubcategories, setAllSubcategories] = useState([])

  // Subcategory slider state
  const subCategorySliderRef = useRef(null)
  const [subCategoryScrollState, setSubCategoryScrollState] = useState({
    canScrollPrev: false,
    canScrollNext: false
  })

  // Brand slider state
  const brandSliderRef = useRef(null)
  const [brandScrollState, setBrandScrollState] = useState({
    canScrollPrev: false,
    canScrollNext: false
  })

  const [productsToShow, setProductsToShow] = useState(PRODUCTS_BATCH_SIZE)
  const [delayedLoading, setDelayedLoading] = useState(false)
  const fetchTimeout = useRef()
  const loadingTimeout = useRef()
  const allProductsRef = useRef([])
  const hasRetriedFreshCacheRef = useRef(false)

  // Preload translations for categories, subcategories, and brands when language is Arabic
  useEffect(() => {
    if (currentLanguage.code === 'ar') {
      const textsToTranslate = []
      
      // Collect category names
      if (categories.length > 0) {
        categories.forEach(cat => {
          if (cat.name) textsToTranslate.push(cat.name)
        })
      }
      
      // Collect subcategory names
      if (subCategories.length > 0) {
        subCategories.forEach(sub => {
          if (sub.name) textsToTranslate.push(sub.name)
        })
      }
      
      // Collect brand names
      if (brands.length > 0) {
        brands.forEach(brand => {
          if (brand.name) textsToTranslate.push(brand.name)
        })
      }
      
      // Preload all translations in one batch
      if (textsToTranslate.length > 0) {
        console.log(`[Shop] Preloading ${textsToTranslate.length} translations`)
        preloadTranslations(textsToTranslate, 'ar')
      }
    }
  }, [categories, subCategories, brands, currentLanguage.code])

  // Progressive search function
  // Subcategory slider handlers
  const updateSubCategoryScrollState = () => {
    const container = subCategorySliderRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setSubCategoryScrollState({
      canScrollPrev: scrollLeft > 0,
      canScrollNext: scrollLeft < scrollWidth - clientWidth - 1
    })
  }

  const scrollSubCategoryPrev = () => {
    if (subCategorySliderRef.current) {
      subCategorySliderRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollSubCategoryNext = () => {
    if (subCategorySliderRef.current) {
      subCategorySliderRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
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

  const performProgressiveSearch = async (searchTerm, productsSource = null) => {
    if (!searchTerm || searchTerm.trim() === "") {
      setActualSearchQuery("")
      return []
    }

    let allProducts = Array.isArray(productsSource) ? productsSource : allProductsRef.current
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      try {
        allProducts = await productCache.getProducts()
        allProductsRef.current = allProducts || []
      } catch (err) {
        console.error("Error loading products for search:", err)
        return []
      }
    }

    if (allProducts.length === 0) {
      return []
    }

    const stockStatusFilters = []
    if (stockFilters.inStock) stockStatusFilters.push("inStock")
    if (stockFilters.outOfStock) stockStatusFilters.push("outOfStock")
    if (stockFilters.onSale) stockStatusFilters.push("onSale")

    // Build the non-search filtered list once, then only apply text matching progressively.
    // This avoids repeatedly sorting/filtering the full product array on every candidate term.
    const baseFilters = {
      parent_category: selectedCategory !== "all" ? selectedCategory : null,
      category: selectedSubCategories.length > 0 ? selectedSubCategories[0] : null,
      subcategory2: selectedSubCategory2,
      subcategory3: selectedSubCategory3,
      subcategory4: selectedSubCategory4,
      brand: selectedBrands.length > 0 ? selectedBrands : null,
      search: null,
      priceRange: priceRange,
      stockStatus: stockStatusFilters.length > 0 ? stockStatusFilters : null,
      sortBy: sortBy,
    }

    const baseFilteredProducts = productCache.filterProducts(allProducts, baseFilters)
    if (!baseFilteredProducts.length) {
      setActualSearchQuery(searchTerm)
      return []
    }

    const matchesSearchTerm = (product, term) => {
      const searchTermNormalized = String(term || "").toLowerCase().trim()
      if (!searchTermNormalized) return true
      const name = (product?.name || "").toLowerCase()
      const description = (product?.description || "").toLowerCase()
      const brandName = (product?.brand?.name || "").toLowerCase()
      const sku = (product?.sku || "").toLowerCase()
      return (
        name.includes(searchTermNormalized) ||
        description.includes(searchTermNormalized) ||
        brandName.includes(searchTermNormalized) ||
        sku.includes(searchTermNormalized)
      )
    }

    const words = searchTerm.trim().split(/\s+/)

    for (let i = words.length; i > 0; i--) {
      const currentSearchTerm = words.slice(0, i).join(" ")
      const filteredProducts = baseFilteredProducts.filter((product) => matchesSearchTerm(product, currentSearchTerm))
      if (filteredProducts.length > 0) {
        setActualSearchQuery(currentSearchTerm)
        return filteredProducts
      }
    }

    const trimmed = searchTerm.trim()
    for (let len = trimmed.length - 1; len >= 3; len--) {
      const currentSearchTerm = trimmed.slice(0, len)
      const filteredProducts = baseFilteredProducts.filter((product) => matchesSearchTerm(product, currentSearchTerm))
      if (filteredProducts.length > 0) {
        setActualSearchQuery(currentSearchTerm)
        return filteredProducts
      }
    }

    setActualSearchQuery(searchTerm)
    return []
  }

  const hasActiveCatalogFilters = () =>
    selectedCategory !== "all" ||
    selectedSubCategories.length > 0 ||
    !!selectedSubCategory2 ||
    !!selectedSubCategory3 ||
    !!selectedSubCategory4 ||
    selectedBrands.length > 0 ||
    !!searchQuery.trim()

  const getStockStatusFilters = () => {
    const stockStatusFilters = []
    if (stockFilters.inStock) stockStatusFilters.push("inStock")
    if (stockFilters.outOfStock) stockStatusFilters.push("outOfStock")
    if (stockFilters.onSale) stockStatusFilters.push("onSale")
    return stockStatusFilters
  }

  const applyCurrentFilters = async (allProducts) => {
    if (searchQuery && searchQuery.trim() !== "") {
      return await performProgressiveSearch(searchQuery, allProducts)
    }

    setActualSearchQuery("")
    const stockStatusFilters = getStockStatusFilters()
    const filters = {
      parent_category: selectedCategory !== "all" ? selectedCategory : null,
      category: selectedSubCategories.length > 0 ? selectedSubCategories[0] : null,
      subcategory2: selectedSubCategory2,
      subcategory3: selectedSubCategory3,
      subcategory4: selectedSubCategory4,
      brand: selectedBrands.length > 0 ? selectedBrands : null,
      search: null,
      priceRange: priceRange,
      stockStatus: stockStatusFilters.length > 0 ? stockStatusFilters : null,
      sortBy: sortBy,
    }

    return productCache.filterProducts(allProducts, filters)
  }

  const refreshCacheAndRetryIfNeeded = async (filteredProducts) => {
    if (filteredProducts.length > 0 || hasRetriedFreshCacheRef.current || !hasActiveCatalogFilters()) {
      return filteredProducts
    }

    try {
      hasRetriedFreshCacheRef.current = true
      const freshProducts = await productCache.forceRefreshCache()
      allProductsRef.current = freshProducts || []
      if (!Array.isArray(freshProducts) || freshProducts.length === 0) {
        return filteredProducts
      }
      return await applyCurrentFilters(freshProducts)
    } catch (err) {
      return filteredProducts
    }
  }

  const loadAndFilterProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const allProducts = await productCache.getProducts()
      allProductsRef.current = allProducts || []

      if (!allProducts || allProducts.length === 0) {
        setError("No products available")
        setLoading(false)
        return
      }

      let filteredProducts = await applyCurrentFilters(allProducts)
      filteredProducts = await refreshCacheAndRetryIfNeeded(filteredProducts)
      if (filteredProducts.length > 0) {
        hasRetriedFreshCacheRef.current = false
      }

      if (filteredProducts.length > 0) {
        const prices = filteredProducts.map((p) => p.offerPrice || 0)
        const minProductPrice = Math.min(...prices)
        const filteredMax = Math.max(...prices)
        if (priceRange[0] === 0 && priceRange[1] === 10000) {
          setPriceRange([minProductPrice, globalMaxPrice != null ? globalMaxPrice : filteredMax])
        }
        setMinPrice(minProductPrice)
      }

      setProducts(filteredProducts)
      setLoading(false)
    } catch (err) {
      setError("Error loading products")
      setLoading(false)
    }
  }

  const filterProductsFromCache = async () => {
    try {
      let allProducts = allProductsRef.current
      if (!Array.isArray(allProducts) || allProducts.length === 0) {
        allProducts = await productCache.getProducts()
        allProductsRef.current = allProducts || []
      }

      if (!allProducts || allProducts.length === 0) {
        await loadAndFilterProducts()
        return
      }

      let filteredProducts = await applyCurrentFilters(allProducts)
      filteredProducts = await refreshCacheAndRetryIfNeeded(filteredProducts)
      if (filteredProducts.length > 0) {
        hasRetriedFreshCacheRef.current = false
      }

      if (filteredProducts.length > 0) {
        const prices = filteredProducts.map((p) => p.offerPrice || 0)
        const minProductPrice = Math.min(...prices)
        const filteredMax = Math.max(...prices)
        if (priceRange[0] === 0 && priceRange[1] === 10000) {
          setPriceRange([minProductPrice, globalMaxPrice != null ? globalMaxPrice : filteredMax])
        }
        setMinPrice(minProductPrice)
      }

      setProducts(filteredProducts)
    } catch (err) {
      await loadAndFilterProducts()
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchBrands()
    fetchBanners()
    fetchAllSubcategories()
    loadAndFilterProducts()
  }, [])

  useEffect(() => {
    const computeGlobalMax = async () => {
      try {
        let allProducts = allProductsRef.current
        if (!Array.isArray(allProducts) || allProducts.length === 0) {
          allProducts = await productCache.getProducts()
          allProductsRef.current = allProducts || []
        }
        if (allProducts && allProducts.length > 0) {
          const prices = allProducts.map((p) => p.offerPrice || 0)
          const globalMax = Math.max(...prices)
          setGlobalMaxPrice(globalMax)
          setMaxPrice(globalMax)
          if (priceRange[0] === 0 && priceRange[1] === 10000) {
            setPriceRange([0, globalMax])
          }
        }
      } catch (e) {
        // ignore; keep fallback maxPrice
      }
    }
    computeGlobalMax()
  }, [])

  useEffect(() => {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current)

    fetchTimeout.current = setTimeout(() => {
      filterProductsFromCache()
    }, 100)
    return () => {
      clearTimeout(fetchTimeout.current)
    }
  }, [
    selectedCategory,
    selectedBrands,
    searchQuery,
    priceRange,
    selectedSubCategories,
    selectedSubCategory2,
    selectedSubCategory3,
    selectedSubCategory4,
    stockFilters,
    sortBy,
  ])

  useEffect(() => {
    // Parse URL when location changes or categories load
    if (categories.length === 0) return
    
    const urlParams = parseShopURL(location.pathname, location.search)
    const foundCategory = categories.find(
      (cat) =>
        cat._id === urlParams.parentCategory ||
        cat.slug === urlParams.parentCategory ||
        createSlug(cat.name) === urlParams.parentCategory,
    )
    const newCategory = foundCategory ? foundCategory._id : "all"
    
    // Only update if different to prevent loops
    if (newCategory !== selectedCategory) {
      setSelectedCategory(newCategory)
      setSelectedSubCategories([])
      setSelectedSubCategory2(null)
      setSelectedSubCategory3(null)
      setSelectedSubCategory4(null)
      setCurrentSubCategoryName(null)
      setCurrentSubCategory2Name(null)
      setCurrentSubCategory3Name(null)
      setCurrentSubCategory4Name(null)
    }
  }, [categories, location.pathname, location.search])

  useEffect(() => {
    if (selectedCategory && selectedCategory !== "all") {
      fetchSubCategories()
    } else {
      setSubCategories([])
      setSelectedSubCategories([])
    }
  }, [selectedCategory])

  useEffect(() => {
    // Parse URL and set subcategories after allSubcategories are loaded
    if (allSubcategories.length === 0) return
    if (categories.length === 0) return
    
    const urlParams = parseShopURL(location.pathname, location.search)
    console.log("🔗 URL Parsing - Subcategories:", { 
      pathname: location.pathname, 
      urlParams, 
      allSubcategoriesCount: allSubcategories.length 
    })

    const foundCategory = categories.find(
      (cat) =>
        cat._id === urlParams.parentCategory ||
        cat.slug === urlParams.parentCategory ||
        createSlug(cat.name) === urlParams.parentCategory,
    )
    const parentCategoryId = foundCategory ? foundCategory._id : null

    const level1 = urlParams.subcategory
      ? (parentCategoryId
          ? findLevel1SubcategoryForCategory(parentCategoryId, urlParams.subcategory)
          : null)
      : null
    if (urlParams.subcategory) {
      console.log("🔍 Looking for subcategory:", urlParams.subcategory, "Found:", level1?.name, "ID:", level1?._id)
    }

    // Fallback for cases where URL "subcategory" points to a deeper child level.
    if (!level1 && urlParams.subcategory) {
      const directSubMatch = findSubcategoryByUrlPart(urlParams.subcategory)
      if (directSubMatch) {
        const hierarchy = buildSubcategoryHierarchy(directSubMatch)
        const level1Obj = hierarchy.level1 ? allSubcategories.find((sub) => sub._id === hierarchy.level1) : null
        const level2Obj = hierarchy.level2 ? allSubcategories.find((sub) => sub._id === hierarchy.level2) : null
        const level3Obj = hierarchy.level3 ? allSubcategories.find((sub) => sub._id === hierarchy.level3) : null
        const level4Obj = hierarchy.level4 ? allSubcategories.find((sub) => sub._id === hierarchy.level4) : null

        setSelectedCategory(hierarchy.parentCategory || "all")
        setSelectedSubCategories(level1Obj ? [level1Obj._id] : [])
        setCurrentSubCategoryName(level1Obj?.name || null)

        setSelectedSubCategory2(level2Obj?._id || null)
        setSubCategory2Data(level2Obj || null)
        setCurrentSubCategory2Name(level2Obj?.name || null)

        setSelectedSubCategory3(level3Obj?._id || null)
        setSubCategory3Data(level3Obj || null)
        setCurrentSubCategory3Name(level3Obj?.name || null)

        setSelectedSubCategory4(level4Obj?._id || null)
        setSubCategory4Data(level4Obj || null)
        setCurrentSubCategory4Name(level4Obj?.name || null)
        return
      }
    }

    if (level1) {
      setCurrentSubCategoryName(level1.name)
      setSelectedSubCategories([level1._id])
    } else {
      setSelectedSubCategories([])
      setCurrentSubCategoryName(null)
    }

    const level2 = urlParams.subcategory2 && level1?._id
      ? findChildSubcategoryByUrlPart(level1._id, urlParams.subcategory2)
      : null
    if (level2) {
      setSelectedSubCategory2(level2._id)
      setSubCategory2Data(level2)
      setCurrentSubCategory2Name(level2.name)
    } else {
      setSelectedSubCategory2(null)
      setSubCategory2Data(null)
      setCurrentSubCategory2Name(null)
    }

    const level3 = urlParams.subcategory3 && level2?._id
      ? findChildSubcategoryByUrlPart(level2._id, urlParams.subcategory3)
      : null
    if (level3) {
      setSelectedSubCategory3(level3._id)
      setSubCategory3Data(level3)
      setCurrentSubCategory3Name(level3.name)
    } else {
      setSelectedSubCategory3(null)
      setSubCategory3Data(null)
      setCurrentSubCategory3Name(null)
    }

    const level4 = urlParams.subcategory4 && level3?._id
      ? findChildSubcategoryByUrlPart(level3._id, urlParams.subcategory4)
      : null
    if (level4) {
      setSelectedSubCategory4(level4._id)
      setSubCategory4Data(level4)
      setCurrentSubCategory4Name(level4.name)
    } else {
      setSelectedSubCategory4(null)
      setSubCategory4Data(null)
      setCurrentSubCategory4Name(null)
    }
  }, [allSubcategories, categories, location.pathname, location.search])

  useEffect(() => {
    // Parse URL when location changes or brands load
    if (brands.length === 0) return
    
    const urlParams = parseShopURL(location.pathname, location.search)
    if (urlParams.brand) {
      const foundBrand = brands.find(
        (brand) => brand.name === urlParams.brand || createSlug(brand.name) === createSlug(urlParams.brand),
      )
      const newBrands = foundBrand ? [foundBrand._id] : []
      // Only update if different to prevent loops
      const currentBrandsStr = JSON.stringify([...selectedBrands].sort())
      const newBrandsStr = JSON.stringify([...newBrands].sort())
      if (currentBrandsStr !== newBrandsStr) {
        setSelectedBrands(newBrands)
      }
    } else {
      // Only clear if there's actually something to clear
      if (selectedBrands.length > 0) {
        setSelectedBrands([])
      }
    }
  }, [brands, location.pathname, location.search, selectedBrands])

  useEffect(() => {
    // Parse search query from URL
    const urlParams = parseShopURL(location.pathname, location.search)
    const newSearch = urlParams.search || ""
    if (newSearch !== searchQuery) {
      setSearchQuery(newSearch)
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    if (categories.length > 0) {
      console.log(
        "All loaded categories:",
        categories.map((c) => ({ name: c.name, slug: c.slug, _id: c._id })),
      )
    }
  }, [categories])

  useEffect(() => {
    if (subCategories.length > 0) {
      console.log(
        "All loaded subcategories:",
        subCategories.map((s) => ({ name: s.name, slug: s.slug, _id: s._id })),
      )
    }
  }, [subCategories])

  useEffect(() => {
    setProductsToShow(PRODUCTS_BATCH_SIZE)
  }, [selectedCategory, selectedBrands, searchQuery, priceRange, selectedSubCategories, stockFilters, products.length])

  // Update subcategory slider scroll state on mount and when content changes
  useEffect(() => {
    const container = subCategorySliderRef.current
    if (!container) return

    // Initial update
    updateSubCategoryScrollState()

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      updateSubCategoryScrollState()
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [selectedCategory, selectedSubCategories, selectedSubCategory2, selectedSubCategory3, selectedSubCategory4])

  // Update brand slider scroll state when products change
  useEffect(() => {
    const container = brandSliderRef.current
    if (!container) return

    // Initial update
    updateBrandScrollState()

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      updateBrandScrollState()
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [products])

  const fetchCategories = async () => {
    try {
      // Use the same tree endpoint as Navbar to ensure consistency
      const { data } = await axios.get(`${API_BASE_URL}/api/categories/tree`)

      const validCategories = data.filter((cat) => {
        const isValid =
          cat &&
          typeof cat === "object" &&
          cat.name &&
          typeof cat.name === "string" &&
          cat.name.trim() !== "" &&
          cat.isActive !== false &&
          !cat.isDeleted &&
          !cat.name.match(/^[0-9a-fA-F]{24}$/)

        return isValid
      })

      setCategories(validCategories)
    } catch (err) {
      // Handle error silently
    }
  }

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/brands`)

      const validBrands = data.filter((brand) => {
        const isValid =
          brand &&
          typeof brand === "object" &&
          brand.name &&
          typeof brand.name === "string" &&
          brand.name.trim() !== "" &&
          brand.isActive !== false &&
          !brand.name.match(/^[0-9a-fA-F]{24}$/)

        return isValid
      })

      setBrands(validBrands)
    } catch (err) {
      // Handle error silently
    }
  }

  const fetchBanners = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/banners`)
      setBanners(data)
    } catch (err) {
      // Handle error silently
    }
  }

  const fetchAllSubcategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/subcategories`)
      const validSubCategories = data.filter((subCat) => {
        const isValid =
          subCat &&
          typeof subCat === "object" &&
          subCat.name &&
          typeof subCat.name === "string" &&
          subCat.name.trim() !== "" &&
          subCat.isActive !== false &&
          !subCat.isDeleted &&
          !subCat.name.match(/^[0-9a-fA-F]{24}$/)
        return isValid
      })
      console.log('📁 All Subcategories loaded:', validSubCategories.length)
      console.log('Sample subcategory:', validSubCategories[0])
      setAllSubcategories(validSubCategories)
    } catch (err) {
      console.error('Error fetching subcategories:', err)
    }
  }

  const fetchSubCategories = async () => {
    try {
      const catObj = categories.find((cat) => cat._id === selectedCategory)
      if (!catObj) return

      const { data } = await axios.get(`${API_BASE_URL}/api/subcategories?category=${catObj._id}`)

      const validSubCategories = data.filter((subCat) => {
        const isValid =
          subCat &&
          typeof subCat === "object" &&
          subCat.name &&
          typeof subCat.name === "string" &&
          subCat.name.trim() !== "" &&
          subCat.isActive !== false &&
          !subCat.isDeleted &&
          !subCat.name.match(/^[0-9a-fA-F]{24}$/)

        return isValid
      })

      setSubCategories(validSubCategories)
    } catch (err) {
    // Handle error silently
    }
  }

  // Get unique brand IDs from currently displayed products
  const brandsInProducts = [...new Set(products.map(product => {
    // Handle both object and string brand IDs
    return typeof product.brand === 'object' ? product.brand?._id : product.brand
  }).filter(Boolean))]

  // Filter brands to only show those with products currently displayed
  const availableBrands = brands.filter((brand) => brandsInProducts.includes(brand._id))

  // Apply search filter on available brands
  const filteredBrands = availableBrands.filter((brand) => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))

  const getSubcategoryCategoryId = (sub) => {
    if (!sub) return null
    return typeof sub.category === "object" ? sub.category?._id : sub.category
  }

  const getSubcategoryParentId = (sub) => {
    if (!sub) return null
    return typeof sub.parentSubCategory === "object" ? sub.parentSubCategory?._id : sub.parentSubCategory
  }

  const findLevel1SubcategoryForCategory = (categoryId, urlPart) => {
    if (!categoryId || !urlPart) return null
    const normalized = createSlug(String(urlPart))
    return allSubcategories.find((sub) => {
      const subCategoryId = getSubcategoryCategoryId(sub)
      const parentId = getSubcategoryParentId(sub)
      if (subCategoryId !== categoryId) return false
      if (parentId) return false
      return createSlug(sub.slug || "") === normalized || createSlug(sub.name || "") === normalized
    })
  }

  const findSubcategoryByUrlPart = (urlPart) => {
    if (!urlPart) return null
    const normalized = createSlug(String(urlPart))
    return (
      allSubcategories.find((sub) => sub._id === urlPart) ||
      allSubcategories.find((sub) => createSlug(sub.slug || "") === normalized) ||
      allSubcategories.find((sub) => createSlug(sub.name || "") === normalized)
    )
  }

  // Build full level hierarchy (level1..level4) from any subcategory node.
  const buildSubcategoryHierarchy = (subcatInput) => {
    const subcatObj =
      typeof subcatInput === "object" ? subcatInput : allSubcategories.find((sub) => sub._id === subcatInput)

    if (!subcatObj) {
      return { parentCategory: null, level1: null, level2: null, level3: null, level4: null }
    }

    const lineage = [subcatObj]
    let current = subcatObj

    while (getSubcategoryParentId(current)) {
      const parentId = getSubcategoryParentId(current)
      const parent = allSubcategories.find((sub) => sub._id === parentId)
      if (!parent) break
      lineage.unshift(parent)
      current = parent
      if (lineage.length >= 4) break
    }

    const topLevel = lineage[0]
    return {
      parentCategory: getSubcategoryCategoryId(topLevel) || null,
      level1: lineage[0]?._id || null,
      level2: lineage[1]?._id || null,
      level3: lineage[2]?._id || null,
      level4: lineage[3]?._id || null,
    }
  }

  const findChildSubcategoryByUrlPart = (parentSubCategoryId, urlPart) => {
    if (!parentSubCategoryId || !urlPart) return null
    const normalized = createSlug(String(urlPart))
    return allSubcategories.find((sub) => {
      const parentId = typeof sub.parentSubCategory === "object" ? sub.parentSubCategory?._id : sub.parentSubCategory
      if (!parentId || parentId !== parentSubCategoryId) return false
      return createSlug(sub.slug || "") === normalized || createSlug(sub.name || "") === normalized
    })
  }

  // Helper function to get children of a category/subcategory
  const getChildren = (parentId, parentType = 'category') => {
    if (!parentId || !allSubcategories || allSubcategories.length === 0) {
      return []
    }

    const children = allSubcategories.filter(sub => {
      if (!sub) return false
      
      const category = typeof sub.category === 'object' ? sub.category?._id : sub.category
      const parentSubCategory = typeof sub.parentSubCategory === 'object' ? sub.parentSubCategory?._id : sub.parentSubCategory
      
      if (parentType === 'category') {
        // For parent categories, get Level 1 subcategories (where category matches and parentSubCategory is null)
        const matches = category === parentId && !parentSubCategory
        return matches
      } else if (parentType === 'subcategory') {
        // For any subcategory level, get children where parentSubCategory matches
        const matches = parentSubCategory === parentId
        return matches
      }
      return false
    })
    
    if (children.length > 0) {
      console.log(`🌳 Found ${children.length} children for ${parentId} (type: ${parentType})`, children.map(c => c.name))
    }
    
    return children
  }

  // Toggle category expansion
  const toggleExpanded = (id) => {
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setSelectedSubCategories([])
    setSelectedSubCategory2(null)
    setSelectedSubCategory3(null)
    setSelectedSubCategory4(null)
    setCurrentSubCategoryName(null)
    setCurrentSubCategory2Name(null)
    setCurrentSubCategory3Name(null)
    setCurrentSubCategory4Name(null)

    const categoryObj = categories.find((cat) => cat._id === categoryId)
    const categoryName = categoryObj ? categoryObj.name : categoryId

    const url = generateShopURL({
      parentCategory: categoryId !== "all" ? categoryName : null,
      brand: selectedBrands.length > 0 ? brands.find((b) => b._id === selectedBrands[0])?.name : null,
      search: searchQuery || null,
    })

    navigate(url)
  }

  // Unified handler for selecting any level of subcategory
  const handleSubcategorySelect = (subcatId, level) => {
    const subcatObj = allSubcategories.find((sub) => sub._id === subcatId)
    if (!subcatObj) return

    // Helper function to trace back the full hierarchy
    const traceHierarchy = (subcat) => {
      const hierarchy = {
        parentCategory: null,
        level1: null,
        level2: null,
        level3: null,
        level4: null,
      }

      let current = subcat
      let currentLevel = level

      // Set the current level
      if (currentLevel === 1) {
        hierarchy.level1 = current._id
      } else if (currentLevel === 2) {
        hierarchy.level2 = current._id
      } else if (currentLevel === 3) {
        hierarchy.level3 = current._id
      } else if (currentLevel === 4) {
        hierarchy.level4 = current._id
      }

      // Trace back through parentSubCategory
      while (current && current.parentSubCategory) {
        const parentId = typeof current.parentSubCategory === 'object' 
          ? current.parentSubCategory._id 
          : current.parentSubCategory
        
        const parent = allSubcategories.find(s => s._id === parentId)
        if (!parent) break

        currentLevel--
        if (currentLevel === 1) {
          hierarchy.level1 = parent._id
        } else if (currentLevel === 2) {
          hierarchy.level2 = parent._id
        } else if (currentLevel === 3) {
          hierarchy.level3 = parent._id
        }

        current = parent
      }

      // Get parent category from the top-level subcategory
      if (current && current.category) {
        hierarchy.parentCategory = typeof current.category === 'object' 
          ? current.category._id 
          : current.category
      }

      return hierarchy
    }

    // Get the complete hierarchy
    const hierarchy = traceHierarchy(subcatObj)

    // Update all states with the correct hierarchy
    setSelectedCategory(hierarchy.parentCategory || 'all')
    
    if (hierarchy.level1) {
      const level1Obj = allSubcategories.find(s => s._id === hierarchy.level1)
      setSelectedSubCategories([hierarchy.level1])
      setCurrentSubCategoryName(level1Obj?.name || null)
    } else {
      setSelectedSubCategories([])
      setCurrentSubCategoryName(null)
    }

    if (hierarchy.level2) {
      const level2Obj = allSubcategories.find(s => s._id === hierarchy.level2)
      setSelectedSubCategory2(hierarchy.level2)
      setSubCategory2Data(level2Obj || null)
      setCurrentSubCategory2Name(level2Obj?.name || null)
    } else {
      setSelectedSubCategory2(null)
      setSubCategory2Data(null)
      setCurrentSubCategory2Name(null)
    }

    if (hierarchy.level3) {
      const level3Obj = allSubcategories.find(s => s._id === hierarchy.level3)
      setSelectedSubCategory3(hierarchy.level3)
      setSubCategory3Data(level3Obj || null)
      setCurrentSubCategory3Name(level3Obj?.name || null)
    } else {
      setSelectedSubCategory3(null)
      setSubCategory3Data(null)
      setCurrentSubCategory3Name(null)
    }

    if (hierarchy.level4) {
      const level4Obj = allSubcategories.find(s => s._id === hierarchy.level4)
      setSelectedSubCategory4(hierarchy.level4)
      setSubCategory4Data(level4Obj || null)
      setCurrentSubCategory4Name(level4Obj?.name || null)
    } else {
      setSelectedSubCategory4(null)
      setSubCategory4Data(null)
      setCurrentSubCategory4Name(null)
    }

    // Update URL with full hierarchy (up to level 4) so deep links work consistently
    const categoryObj = categories.find((cat) => cat._id === hierarchy.parentCategory)
    const level1Name = hierarchy.level1 ? allSubcategories.find((s) => s._id === hierarchy.level1)?.name : null
    const level2Name = hierarchy.level2 ? allSubcategories.find((s) => s._id === hierarchy.level2)?.name : null
    const level3Name = hierarchy.level3 ? allSubcategories.find((s) => s._id === hierarchy.level3)?.name : null
    const level4Name = hierarchy.level4 ? allSubcategories.find((s) => s._id === hierarchy.level4)?.name : null

    const url = generateShopURL({
      parentCategory:
        hierarchy.parentCategory && hierarchy.parentCategory !== "all" ? categoryObj?.name || hierarchy.parentCategory : null,
      subcategory: level1Name,
      subcategory2: level2Name,
      subcategory3: level3Name,
      subcategory4: level4Name,
      brand: selectedBrands.length > 0 ? brands.find((b) => b._id === selectedBrands[0])?.name : null,
      search: searchQuery || null,
    })
    navigate(url)
  }

  const handleSubCategoryChange = (subCatId) => {
    setSelectedSubCategories([subCatId])
    const subcatObj = subCategories.find((sub) => sub._id === subCatId)
    let parentId
    if (subcatObj) {
      parentId = typeof subcatObj.category === "object" ? subcatObj.category._id : subcatObj.category
    } else {
      parentId = selectedCategory
    }
    setSelectedCategory(parentId)

    const categoryObj = categories.find((cat) => cat._id === parentId)
    const subcategoryObj = subCategories.find((sub) => sub._id === subCatId)

    const categoryName = categoryObj ? categoryObj.name : parentId
    const subcategoryName = subcategoryObj ? subcategoryObj.name : subCatId

    const url = generateShopURL({
      parentCategory: parentId !== "all" ? categoryName : null,
      subcategory: subcategoryName,
      brand: selectedBrands.length > 0 ? brands.find((b) => b._id === selectedBrands[0])?.name : null,
      search: searchQuery || null,
    })

    console.log("handleSubCategoryChange called with:", { subCatId, parentId, subcatObj, url, subCategories })
    navigate(url)
  }

  const handleBrandChange = (brandId) => {
    // Calculate new brand selection FIRST before any state updates
    const newSelectedBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter((b) => b !== brandId)
      : [...selectedBrands, brandId]

    // Update state
    setSelectedBrands(newSelectedBrands)

    const categoryObj = categories.find((cat) => cat._id === selectedCategory)
    const subcategoryObj =
      selectedSubCategories.length > 0 ? subCategories.find((sub) => sub._id === selectedSubCategories[0]) : null
    
    // Preserve deeper subcategory levels
    const subcategory2Obj = selectedSubCategory2 ? allSubcategories.find((sub) => sub._id === selectedSubCategory2) : null
    const subcategory3Obj = selectedSubCategory3 ? allSubcategories.find((sub) => sub._id === selectedSubCategory3) : null
    const subcategory4Obj = selectedSubCategory4 ? allSubcategories.find((sub) => sub._id === selectedSubCategory4) : null

    const url = generateShopURL({
      parentCategory: selectedCategory !== "all" ? categoryObj?.name || selectedCategory : null,
      subcategory: subcategoryObj?.name || selectedSubCategories[0] || null,
      subcategory2: subcategory2Obj?.name || null,
      subcategory3: subcategory3Obj?.name || null,
      subcategory4: subcategory4Obj?.name || null,
      brand: newSelectedBrands.length > 0 ? brands.find((b) => b._id === newSelectedBrands[0])?.name : null,
      search: searchQuery || null,
    })

    navigate(url)
  }

  const handleStockFilterChange = (key) => {
    setStockFilters((prev) => {
      const newState = { inStock: false, outOfStock: false, onSale: false }
      newState[key] = true
      return newState
    })
  }

  const handleAllProductsFilter = () => {
    setStockFilters({ inStock: false, outOfStock: false, onSale: false })
  }

  const handleSearchChange = (e) => {
    const newSearchQuery = e.target.value
    setSearchQuery(newSearchQuery)

    const categoryObj = categories.find((cat) => cat._id === selectedCategory)
    const subcategoryObj =
      selectedSubCategories.length > 0 ? subCategories.find((sub) => sub._id === selectedSubCategories[0]) : null
    
    // Preserve deeper subcategory levels
    const subcategory2Obj = selectedSubCategory2 ? allSubcategories.find((sub) => sub._id === selectedSubCategory2) : null
    const subcategory3Obj = selectedSubCategory3 ? allSubcategories.find((sub) => sub._id === selectedSubCategory3) : null
    const subcategory4Obj = selectedSubCategory4 ? allSubcategories.find((sub) => sub._id === selectedSubCategory4) : null

    const url = generateShopURL({
      parentCategory: selectedCategory !== "all" ? categoryObj?.name || selectedCategory : null,
      subcategory: subcategoryObj?.name || selectedSubCategories[0] || null,
      subcategory2: subcategory2Obj?.name || null,
      subcategory3: subcategory3Obj?.name || null,
      subcategory4: subcategory4Obj?.name || null,
      brand: selectedBrands.length > 0 ? brands.find((b) => b._id === selectedBrands[0])?.name : null,
      search: newSearchQuery || null,
    })

    navigate(url)
  }

  const clearAllFilters = () => {
    setSelectedCategory("all")
    setSelectedBrands([])
    setSelectedSubCategories([])
    setPriceRange([0, maxPrice])
    setSearchQuery("")
    setActualSearchQuery("")
    setStockFilters({ inStock: false, outOfStock: false, onSale: false })
    navigate("/shop")
  }

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-[#d7ddd4] border-t-[#505e4d] animate-spin" />
          <p className="text-sm font-semibold text-[#505e4d]">
            <TranslatedText>Loading products...</TranslatedText>
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const selectedSubCategoryObj = subCategories.find((sub) => sub._id === selectedSubCategories[0])

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const buildCanonicalPath = () => {
    const path = location.pathname || "/shop"
    return path
  }

  const categoryObj = categories.find((cat) => cat._id === selectedCategory)
  const subcategoryObj =
    selectedSubCategories.length > 0 ? subCategories.find((s) => s._id === selectedSubCategories[0]) : null

  // Determine which subcategory level to use for SEO (deepest level takes priority)
  const activeSubcategoryForSEO = subCategory4Data || subCategory3Data || subCategory2Data || subcategoryObj

  const seoContent = activeSubcategoryForSEO?.seoContent || categoryObj?.seoContent || ""

  const customMetaTitle = activeSubcategoryForSEO?.metaTitle || categoryObj?.metaTitle || ""
  const customMetaDescription = activeSubcategoryForSEO?.metaDescription || categoryObj?.metaDescription || ""
  const customSchema = activeSubcategoryForSEO?.customSchema || categoryObj?.customSchema || ""

  const seoTitle =
    customMetaTitle ||
    (seoContent
      ? generateSEOTitle(activeSubcategoryForSEO?.name || categoryObj?.name || "", seoContent)
      : activeSubcategoryForSEO
        ? `${activeSubcategoryForSEO.name} — Shop`
        : categoryObj
          ? `${categoryObj.name} — Shop`
          : searchQuery?.trim()
            ? `Search: ${searchQuery.trim()} — Shop`
            : "Shop — Grabatoz")

  const seoDescription =
    customMetaDescription ||
    (seoContent
      ? createMetaDescription(seoContent, 160)
      : activeSubcategoryForSEO
        ? `Browse ${activeSubcategoryForSEO.name} products at great prices.`
        : categoryObj
          ? `Explore top ${categoryObj.name} products.`
          : "Explore our catalog and find your next purchase at Grabatoz.")

  const buildBreadcrumbPath = () => {
    const parts = [categoryObj?.name]
    if (currentSubCategoryName) parts.push(currentSubCategoryName)
    if (currentSubCategory2Name) parts.push(currentSubCategory2Name)
    if (currentSubCategory3Name) parts.push(currentSubCategory3Name)
    if (currentSubCategory4Name) parts.push(currentSubCategory4Name)
    return parts.filter(Boolean).join(" > ")
  }

  const breadcrumbPath = buildBreadcrumbPath()
  const showBreadcrumb = selectedSubCategory2 || selectedSubCategory3 || selectedSubCategory4

  return (
    <div className="min-h-screen bg-white">
      <SEO title={seoTitle} description={seoDescription} canonicalPath={buildCanonicalPath()} customSchema={customSchema} />
      <ProductSchema products={products} type="list" />
      
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
              {(selectedCategory !== "all" || 
                selectedSubCategories.length > 0 || 
                selectedSubCategory2 || 
                selectedSubCategory3 || 
                selectedSubCategory4 || 
                selectedBrands.length > 0 || 
                stockFilters.inStock || 
                stockFilters.outOfStock || 
                stockFilters.onSale ||
                priceRange[0] !== minPrice || 
                priceRange[1] !== maxPrice) && (
                <div className="border border-[#c7cec2] rounded-lg p-4 bg-[#f4f6f3]">
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
                    {selectedCategory !== "all" && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold"><TranslatedText>Category</TranslatedText>:</span>{" "}
                          <TranslatedText text={categories.find((cat) => cat._id === selectedCategory)?.name || selectedCategory} />
                        </span>
                        <button
                          onClick={() => handleCategoryChange("all")}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {selectedSubCategories.length > 0 && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold"><TranslatedText>Subcategory</TranslatedText>:</span> <TranslatedText text={currentSubCategoryName} />
                        </span>
                        <button
                          onClick={() => {
                            setSelectedSubCategories([])
                            setCurrentSubCategoryName(null)
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {selectedSubCategory2 && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold"><TranslatedText>Level 2</TranslatedText>:</span> <TranslatedText text={currentSubCategory2Name} />
                        </span>
                        <button
                          onClick={() => {
                            setSelectedSubCategory2(null)
                            setCurrentSubCategory2Name(null)
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {selectedSubCategory3 && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold"><TranslatedText>Level 3</TranslatedText>:</span> <TranslatedText text={currentSubCategory3Name} />
                        </span>
                        <button
                          onClick={() => {
                            setSelectedSubCategory3(null)
                            setCurrentSubCategory3Name(null)
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {selectedSubCategory4 && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold"><TranslatedText>Level 4</TranslatedText>:</span> <TranslatedText text={currentSubCategory4Name} />
                        </span>
                        <button
                          onClick={() => {
                            setSelectedSubCategory4(null)
                            setCurrentSubCategory4Name(null)
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {selectedBrands.map((brandId) => {
                      const brand = brands.find((b) => b._id === brandId)
                      return brand ? (
                        <div key={brandId} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Brand</TranslatedText>:</span> <TranslatedText text={brand.name} />
                          </span>
                          <button
                            onClick={() => handleBrandChange(brandId)}
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
                          <span className="font-semibold"><TranslatedText>Price</TranslatedText>:</span> <TranslatedText>AED</TranslatedText> {priceRange[0]} - <TranslatedText>AED</TranslatedText> {priceRange[1]}
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
                          <span className="font-semibold"><TranslatedText>Stock</TranslatedText>:</span> <TranslatedText>In Stock</TranslatedText>
                        </span>
                        <button
                          onClick={() => setStockFilters({ inStock: false, outOfStock: false, onSale: false })}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {stockFilters.outOfStock && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold"><TranslatedText>Stock</TranslatedText>:</span> <TranslatedText>Out of Stock</TranslatedText>
                        </span>
                        <button
                          onClick={() => setStockFilters({ inStock: false, outOfStock: false, onSale: false })}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {stockFilters.onSale && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold"><TranslatedText>Stock</TranslatedText>:</span> <TranslatedText>On Sale</TranslatedText>
                        </span>
                        <button
                          onClick={() => setStockFilters({ inStock: false, outOfStock: false, onSale: false })}
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
                      ? "text-[#505e4d]"
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

              {/* Categories Filter - Mobile */}
              <div className="border-b pb-4">
                <button
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  className={`flex items-center justify-between w-full text-left font-medium ${
                    selectedCategory !== "all" || selectedSubCategories.length > 0 || selectedSubCategory2 || selectedSubCategory3 || selectedSubCategory4
                      ? "text-[#505e4d]"
                      : "text-gray-900"
                  }`}
                >
                  <TranslatedText>Categories</TranslatedText>
                  {showCategoryFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                </button>
                {showCategoryFilter && (
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center cursor-pointer py-1" onClick={() => handleCategoryChange("all")}>
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="category-group-mobile"
                          checked={selectedCategory === "all"}
                          readOnly
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                            selectedCategory === "all" ? "border-[#505e4d] bg-[#505e4d]" : "border-gray-300"
                          }`}
                        >
                          {selectedCategory === "all" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700"><TranslatedText>All Categories</TranslatedText></span>
                    </div>

                    {categories.map((category) => {
                      const level1Children = getChildren(category._id, 'category')
                      const hasChildren = level1Children.length > 0
                      const isExpanded = expandedCategories[category._id]
                      const isSelected = selectedCategory === category._id

                      return (
                        <div key={category._id} className="space-y-1">
                          <div className="flex items-center justify-between py-1 group">
                            <div 
                              className="flex items-center cursor-pointer flex-1"
                              onClick={() => handleCategoryChange(category._id)}
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
                                    isSelected ? "border-[#505e4d] bg-[#505e4d]" : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                </div>
                              </div>
                              <span className={`text-sm ${isSelected ? "text-[#505e4d] font-semibold" : "text-gray-700"}`}>
                                <TranslatedText text={category.name} />
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

                          {isExpanded && level1Children.map((level1) => {
                            const level2Children = getChildren(level1._id, 'subcategory')
                            const hasLevel2 = level2Children.length > 0
                            const isLevel1Expanded = expandedCategories[level1._id]
                            const isLevel1Selected = selectedSubCategories.includes(level1._id)

                            return (
                              <div key={level1._id} className="ml-6 space-y-1">
                                <div className="flex items-center justify-between py-1 group">
                                  <div
                                    className="flex items-center cursor-pointer flex-1"
                                    onClick={() => handleSubcategorySelect(level1._id, 1)}
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
                                          isLevel1Selected ? "border-[#505e4d] bg-[#505e4d]" : "border-gray-300"
                                        }`}
                                      >
                                        {isLevel1Selected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                      </div>
                                    </div>
                                    <span className={`text-sm ${isLevel1Selected ? "text-[#505e4d] font-semibold" : "text-gray-600"}`}>
                                      <TranslatedText text={level1.name} />
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

                                {isLevel1Expanded && level2Children.map((level2) => {
                                  const level3Children = getChildren(level2._id, 'subcategory')
                                  const hasLevel3 = level3Children.length > 0
                                  const isLevel2Expanded = expandedCategories[level2._id]
                                  const isLevel2Selected = selectedSubCategory2 === level2._id

                                  return (
                                    <div key={level2._id} className="ml-6 space-y-1">
                                      <div className="flex items-center justify-between py-1 group">
                                        <div
                                          className="flex items-center cursor-pointer flex-1"
                                          onClick={() => handleSubcategorySelect(level2._id, 2)}
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
                                                isLevel2Selected ? "border-[#505e4d] bg-[#505e4d]" : "border-gray-300"
                                              }`}
                                            >
                                              {isLevel2Selected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                            </div>
                                          </div>
                                          <span className={`text-sm ${isLevel2Selected ? "text-[#505e4d] font-semibold" : "text-gray-600"}`}>
                                            <TranslatedText text={level2.name} />
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

                                      {isLevel2Expanded && level3Children.map((level3) => {
                                        const level4Children = getChildren(level3._id, 'subcategory')
                                        const hasLevel4 = level4Children.length > 0
                                        const isLevel3Expanded = expandedCategories[level3._id]
                                        const isLevel3Selected = selectedSubCategory3 === level3._id

                                        return (
                                          <div key={level3._id} className="ml-6 space-y-1">
                                            <div className="flex items-center justify-between py-1 group">
                                              <div
                                                className="flex items-center cursor-pointer flex-1"
                                                onClick={() => handleSubcategorySelect(level3._id, 3)}
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
                                                      isLevel3Selected ? "border-[#505e4d] bg-[#505e4d]" : "border-gray-300"
                                                    }`}
                                                  >
                                                    {isLevel3Selected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                  </div>
                                                </div>
                                                <span className={`text-sm ${isLevel3Selected ? "text-[#505e4d] font-semibold" : "text-gray-600"}`}>
                                                  <TranslatedText text={level3.name} />
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

                                            {isLevel3Expanded && level4Children.map((level4) => {
                                              const isLevel4Selected = selectedSubCategory4 === level4._id

                                              return (
                                                <div key={level4._id} className="ml-6 space-y-1">
                                                  <div className="flex items-center py-1">
                                                    <div
                                                      className="flex items-center cursor-pointer flex-1"
                                                      onClick={() => handleSubcategorySelect(level4._id, 4)}
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
                                                            isLevel4Selected ? "border-[#505e4d] bg-[#505e4d]" : "border-gray-300"
                                                          }`}
                                                        >
                                                          {isLevel4Selected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                        </div>
                                                      </div>
                                                      <span className={`text-sm ${isLevel4Selected ? "text-[#505e4d] font-semibold" : "text-gray-600"}`}>
                                                        <TranslatedText text={level4.name} />
                                                      </span>
                                                    </div>
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

              {/* Brand Filter - Mobile */}
              <div className="border-b pb-4">
                <button
                  onClick={() => setShowBrandFilter(!showBrandFilter)}
                  className={`flex items-center justify-between w-full text-left font-medium ${
                    selectedBrands.length > 0 ? "text-[#505e4d]" : "text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <TranslatedText>Brands</TranslatedText>
                    {selectedBrands.length > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#505e4d] rounded-full">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#505e4d] focus:border-[#505e4d]"
                    />
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredBrands.map((brand) => (
                        <div key={brand._id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`brand-mobile-${brand._id}`}
                            checked={selectedBrands.includes(brand._id)}
                            onChange={() => handleBrandChange(brand._id)}
                            className="w-4 h-4 text-[#505e4d] border-gray-300 rounded focus:ring-[#505e4d]"
                          />
                          <label htmlFor={`brand-mobile-${brand._id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                            <TranslatedText text={brand.name} />
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

              {/* Stock Status Filter - Mobile */}
              <div className="border-b pb-4">
                <div className={`font-medium mb-4 ${
                  stockFilters.inStock || stockFilters.outOfStock || stockFilters.onSale
                    ? "text-[#505e4d]"
                    : "text-gray-900"
                }`}><TranslatedText>Stock Status</TranslatedText></div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-all-mobile"
                      name="stock-filter-mobile"
                      checked={!stockFilters.inStock && !stockFilters.outOfStock && !stockFilters.onSale}
                      onChange={handleAllProductsFilter}
                      className="w-4 h-4 text-[#505e4d] border-gray-300 focus:ring-[#505e4d]"
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
                      className="w-4 h-4 text-[#505e4d] border-gray-300 focus:ring-[#505e4d]"
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
                      className="w-4 h-4 text-[#505e4d] border-gray-300 focus:ring-[#505e4d]"
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
                  className="w-full px-4 py-3 bg-[#505e4d] text-white rounded-lg hover:bg-[#465342] transition-colors font-semibold"
                >
                  <TranslatedText>Show</TranslatedText> {products.length} <TranslatedText>Products</TranslatedText>
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
      
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4 hidden md:block">
            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide"> */}
      <div className="bg-white rounded-lg p-6 space-y-6 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
              {showBreadcrumb && (
                <div className="bg-[#f4f6f3] border border-[#c7cec2] rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-[#2f382d]"><TranslatedText>Current Path</TranslatedText>:</p>
                  <p className="text-sm text-[#3f4a3b] mt-1 break-words">{breadcrumbPath}</p>
                </div>
              )}

              {/* Active Filters Section */}
              {(selectedCategory !== "all" || 
                selectedSubCategories.length > 0 || 
                selectedSubCategory2 || 
                selectedSubCategory3 || 
                selectedSubCategory4 || 
                selectedBrands.length > 0 || 
                stockFilters.inStock || 
                stockFilters.outOfStock || 
                stockFilters.onSale ||
                priceRange[0] !== minPrice || 
                priceRange[1] !== maxPrice) && (
                <div className="border border-[#c7cec2] rounded-lg p-4 bg-[#f4f6f3]">
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
                    {selectedCategory !== "all" && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold"><TranslatedText>Category</TranslatedText>:</span>{" "}
                          <TranslatedText text={categories.find((cat) => cat._id === selectedCategory)?.name || selectedCategory} />
                        </span>
                        <button
                          onClick={() => handleCategoryChange("all")}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {/* Level 1 Subcategory */}
                    {selectedSubCategories.length > 0 && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold"><TranslatedText>Subcategory</TranslatedText>:</span> <TranslatedText text={currentSubCategoryName} />
                        </span>
                        <button
                          onClick={() => {
                            setSelectedSubCategories([])
                            setCurrentSubCategoryName(null)
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
                          <span className="font-semibold"><TranslatedText>Level 2</TranslatedText>:</span> <TranslatedText text={currentSubCategory2Name} />
                        </span>
                        <button
                          onClick={() => {
                            setSelectedSubCategory2(null)
                            setCurrentSubCategory2Name(null)
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
                          <span className="font-semibold"><TranslatedText>Level 3</TranslatedText>:</span> <TranslatedText text={currentSubCategory3Name} />
                        </span>
                        <button
                          onClick={() => {
                            setSelectedSubCategory3(null)
                            setCurrentSubCategory3Name(null)
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
                          <span className="font-semibold"><TranslatedText>Level 4</TranslatedText>:</span> <TranslatedText text={currentSubCategory4Name} />
                        </span>
                        <button
                          onClick={() => {
                            setSelectedSubCategory4(null)
                            setCurrentSubCategory4Name(null)
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {/* Selected Brands */}
                    {selectedBrands.map((brandId) => {
                      const brand = brands.find((b) => b._id === brandId)
                      return brand ? (
                        <div key={brandId} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold"><TranslatedText>Brand</TranslatedText>:</span> <TranslatedText text={brand.name} />
                          </span>
                          <button
                            onClick={() => handleBrandChange(brandId)}
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
                          <span className="font-semibold"><TranslatedText>Price</TranslatedText>:</span> AED {priceRange[0]} - AED {priceRange[1]}
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
                          <span className="font-semibold"><TranslatedText>Stock</TranslatedText>:</span> <TranslatedText>In Stock</TranslatedText>
                        </span>
                        <button
                          onClick={() => setStockFilters({ inStock: false, outOfStock: false, onSale: false })}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {stockFilters.outOfStock && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold"><TranslatedText>Stock</TranslatedText>:</span> <TranslatedText>Out of Stock</TranslatedText>
                        </span>
                        <button
                          onClick={() => setStockFilters({ inStock: false, outOfStock: false, onSale: false })}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {stockFilters.onSale && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold"><TranslatedText>Stock</TranslatedText>:</span> <TranslatedText>On Sale</TranslatedText>
                        </span>
                        <button
                          onClick={() => setStockFilters({ inStock: false, outOfStock: false, onSale: false })}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-b pb-4">
                <button
                  onClick={() => setShowPriceFilter(!showPriceFilter)}
                  className={`flex items-center justify-between w-full text-left font-medium ${
                    priceRange[0] !== minPrice || priceRange[1] !== maxPrice
                      ? "text-[#505e4d]"
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

              <div className="border-b pb-4">
                <button
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  className={`flex items-center justify-between w-full text-left font-medium ${
                    selectedCategory !== "all" || selectedSubCategories.length > 0 || selectedSubCategory2 || selectedSubCategory3 || selectedSubCategory4
                      ? "text-[#505e4d]"
                      : "text-gray-900"
                  }`}
                >
                  <TranslatedText>Categories</TranslatedText>
                  {showCategoryFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                </button>
                {showCategoryFilter && (
                  <div className="mt-4 space-y-1">
                    {/* All Categories Option */}
                    <div className="flex items-center cursor-pointer py-1" onClick={() => handleCategoryChange("all")}>
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="category-group"
                          checked={selectedCategory === "all"}
                          readOnly
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                            selectedCategory === "all" ? "border-[#505e4d] bg-[#505e4d]" : "border-gray-300"
                          }`}
                        >
                          {selectedCategory === "all" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700"><TranslatedText>All Categories</TranslatedText></span>
                    </div>

                    {/* Hierarchical Category Tree */}
                    {categories.map((category) => {
                      const level1Children = getChildren(category._id, 'category')
                      const hasChildren = level1Children.length > 0
                      const isExpanded = expandedCategories[category._id]
                      const isSelected = selectedCategory === category._id

                      return (
                        <div key={category._id} className="space-y-1">
                          {/* Parent Category */}
                          <div className="flex items-center justify-between py-1 group">
                            <div 
                              className="flex items-center cursor-pointer flex-1"
                              onClick={() => handleCategoryChange(category._id)}
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
                                    isSelected ? "border-[#505e4d] bg-[#505e4d]" : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                </div>
                              </div>
                              <span className={`text-sm ${isSelected ? "text-[#505e4d] font-semibold" : "text-gray-700"}`}>
                                <TranslatedText text={category.name} />
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
                            const isLevel1Selected = selectedSubCategories.includes(level1._id)

                            return (
                              <div key={level1._id} className="ml-6 space-y-1">
                                {/* Level 1 Item */}
                                <div className="flex items-center justify-between py-1 group">
                                  <div
                                    className="flex items-center cursor-pointer flex-1"
                                    onClick={() => handleSubcategorySelect(level1._id, 1)}
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
                                          isLevel1Selected ? "border-[#505e4d] bg-[#505e4d]" : "border-gray-300"
                                        }`}
                                      >
                                        {isLevel1Selected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                      </div>
                                    </div>
                                    <span className={`text-sm ${isLevel1Selected ? "text-[#505e4d] font-semibold" : "text-gray-600"}`}>
                                      <TranslatedText text={level1.name} />
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
                                  const isLevel2Selected = selectedSubCategory2 === level2._id

                                  return (
                                    <div key={level2._id} className="ml-6 space-y-1">
                                      {/* Level 2 Item */}
                                      <div className="flex items-center justify-between py-1 group">
                                        <div
                                          className="flex items-center cursor-pointer flex-1"
                                          onClick={() => handleSubcategorySelect(level2._id, 2)}
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
                                                isLevel2Selected ? "border-[#505e4d] bg-[#505e4d]" : "border-gray-300"
                                              }`}
                                            >
                                              {isLevel2Selected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                            </div>
                                          </div>
                                          <span className={`text-sm ${isLevel2Selected ? "text-[#505e4d] font-semibold" : "text-gray-600"}`}>
                                            <TranslatedText text={level2.name} />
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
                                        const isLevel3Selected = selectedSubCategory3 === level3._id

                                        return (
                                          <div key={level3._id} className="ml-6 space-y-1">
                                            {/* Level 3 Item */}
                                            <div className="flex items-center justify-between py-1 group">
                                              <div
                                                className="flex items-center cursor-pointer flex-1"
                                                onClick={() => handleSubcategorySelect(level3._id, 3)}
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
                                                      isLevel3Selected ? "border-[#505e4d] bg-[#505e4d]" : "border-gray-300"
                                                    }`}
                                                  >
                                                    {isLevel3Selected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                  </div>
                                                </div>
                                                <span className={`text-sm ${isLevel3Selected ? "text-[#505e4d] font-semibold" : "text-gray-600"}`}>
                                                  <TranslatedText text={level3.name} />
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
                                              const isLevel4Selected = selectedSubCategory4 === level4._id

                                              return (
                                                <div key={level4._id} className="ml-6 flex items-center justify-between py-1 group">
                                                  <div
                                                    className="flex items-center cursor-pointer flex-1"
                                                    onClick={() => handleSubcategorySelect(level4._id, 4)}
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
                                                          isLevel4Selected ? "border-[#505e4d] bg-[#505e4d]" : "border-gray-300"
                                                        }`}
                                                      >
                                                        {isLevel4Selected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                      </div>
                                                    </div>
                                                    <span className={`text-sm ${isLevel4Selected ? "text-[#505e4d] font-semibold" : "text-gray-600"}`}>
                                                      <TranslatedText text={level4.name} />
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

              {/* Brand Filter */}
              <div className="border-b pb-4">
                <button
                  onClick={() => setShowBrandFilter(!showBrandFilter)}
                  className={`flex items-center justify-between w-full text-left font-medium ${
                    selectedBrands.length > 0 ? "text-[#505e4d]" : "text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <TranslatedText>Brands</TranslatedText>
                    {selectedBrands.length > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#505e4d] rounded-full">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#505e4d] focus:border-[#505e4d]"
                    />
                    <div className="space-y-2">
                      {filteredBrands.map((brand) => (
                        <div key={brand._id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`brand-${brand._id}`}
                            checked={selectedBrands.includes(brand._id)}
                            onChange={() => handleBrandChange(brand._id)}
                            className="w-4 h-4 text-[#505e4d] border-gray-300 rounded focus:ring-[#505e4d]"
                          />
                          <label htmlFor={`brand-${brand._id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                            <TranslatedText text={brand.name} />
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

              {/* Stock Status Filter */}
              <div className="border-b pb-4">
                <div className={`font-medium mb-4 ${
                  stockFilters.inStock || stockFilters.outOfStock || stockFilters.onSale
                    ? "text-[#505e4d]"
                    : "text-gray-900"
                }`}><TranslatedText>Stock Status</TranslatedText></div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-all"
                      name="stock-filter"
                      checked={!stockFilters.inStock && !stockFilters.outOfStock && !stockFilters.onSale}
                      onChange={handleAllProductsFilter}
                      className="w-4 h-4 text-[#505e4d] border-gray-300 focus:ring-[#505e4d]"
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
                      className="w-4 h-4 text-[#505e4d] border-gray-300 focus:ring-[#505e4d]"
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
                      className="w-4 h-4 text-[#505e4d] border-gray-300 focus:ring-[#505e4d]"
                    />
                    <label htmlFor="stock-out" className="ml-2 text-sm text-gray-700 cursor-pointer">
                      <TranslatedText>Out of Stock</TranslatedText>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <TranslatedText>Clear All Filters</TranslatedText>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Mobile Filter Button */}
            <div className="md:hidden mb-4 flex gap-2">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#505e4d] text-white rounded-lg hover:bg-[#465342] transition-colors font-semibold shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <TranslatedText>Filters</TranslatedText>
                {(selectedCategory !== "all" || 
                  selectedSubCategories.length > 0 || 
                  selectedBrands.length > 0 || 
                  stockFilters.inStock || 
                  stockFilters.outOfStock || 
                  stockFilters.onSale ||
                  priceRange[0] !== minPrice || 
                  priceRange[1] !== maxPrice) && (
                  <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-white text-[#505e4d] rounded-full">
                    {[selectedCategory !== "all", selectedSubCategories.length > 0, selectedBrands.length, 
                      stockFilters.inStock || stockFilters.outOfStock || stockFilters.onSale,
                      priceRange[0] !== minPrice || priceRange[1] !== maxPrice].filter(Boolean).length}
                  </span>
                )}
              </button>
              <div className="flex-shrink-0">
                <SortDropdown value={sortBy} onChange={handleSortChange} />
              </div>
            </div>
            
            {/* Child Categories Section - Shows children of the deepest selected level */}
            {!searchQuery.trim() && allSubcategories.length > 0 && (() => {
              // Determine the deepest selected level and its type
              let currentLevelId = null
              let currentLevelType = null
              let nextLevel = 1
              let parentLevelId = null
              let isLevel4 = false
              
              if (selectedSubCategory4) {
                // When at level 4, always show level 4 siblings (from level 3 parent)
                currentLevelId = selectedSubCategory3
                currentLevelType = 'subcategory'
                nextLevel = 4
                isLevel4 = true
              } else if (selectedSubCategory3) {
                currentLevelId = selectedSubCategory3
                currentLevelType = 'subcategory'
                nextLevel = 4
                parentLevelId = selectedSubCategory2 || selectedSubCategories[0]
              } else if (selectedSubCategory2) {
                currentLevelId = selectedSubCategory2
                currentLevelType = 'subcategory'
                nextLevel = 3
                parentLevelId = selectedSubCategories[0]
              } else if (selectedSubCategories.length > 0) {
                currentLevelId = selectedSubCategories[0]
                currentLevelType = 'subcategory'
                nextLevel = 2
                parentLevelId = selectedCategory
              } else if (selectedCategory && selectedCategory !== "all") {
                currentLevelId = selectedCategory
                currentLevelType = 'category'
                nextLevel = 1
              }
              
              // If no category is selected, don't show anything
              if (!currentLevelId) return null
              
              // Get children of the current deepest level
              let childCategories = getChildren(currentLevelId, currentLevelType)
              
              if (childCategories.length === 0) return null
              
              return (
                <section className="mb-8">
                  <div className="relative">
                    <button
                      onClick={scrollSubCategoryPrev}
                      className={`absolute left-0 md:-left-5 top-1/2 -translate-y-1/2 z-10 shadow-lg rounded-full p-2 transition-colors ${
                        subCategoryScrollState.canScrollPrev 
                          ? 'bg-[#505e4d] text-white hover:bg-[#465342] cursor-pointer' 
                          : 'bg-white cursor-default opacity-50'
                      }`}
                      disabled={!subCategoryScrollState.canScrollPrev}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div
                      ref={subCategorySliderRef}
                      onScroll={updateSubCategoryScrollState}
                      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-10 md:px-12"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {childCategories.map((child) => {
                        // Check if this category is currently selected
                        const isSelected = child._id === selectedSubCategory4
                        
                        return (
                          <button
                            key={child._id}
                            onClick={() => handleSubcategorySelect(child._id, nextLevel)}
                            className={`flex-shrink-0 w-32 rounded-lg transition-all flex flex-col items-center justify-center p-3 gap-2 ${
                              isSelected ? 'bg-[#e9ede7] border-2 border-[#505e4d]' : 'hover:bg-gray-50'
                            }`}
                          >
                            {child?.image ? (
                              <>
                                <div className="h-20 flex items-center justify-center">
                                  <img
                                    src={getFullImageUrl(child.image)}
                                    alt={child.name || "Subcategory"}
                                    className="max-h-full max-w-full bg-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none"
                                      const btn = e.currentTarget.closest("button")
                                      const fallback = btn?.querySelector("[data-fallback-name]")
                                      if (fallback) fallback.classList.remove("hidden")
                                    }}
                                  />
                                </div>
                                <span className={`text-xs font-semibold text-center line-clamp-2 ${
                                  isSelected ? 'text-[#505e4d]' : 'text-gray-700'
                                }`}>
                                  {child.name}
                                </span>
                              </>
                            ) : (
                              <span className={`text-sm font-semibold text-center ${
                                isSelected ? 'text-[#505e4d]' : 'text-gray-700'
                              }`}>
                                {child.name}
                              </span>
                            )}
                            <span data-fallback-name className="hidden text-sm font-semibold text-gray-700 text-center">
                              {child.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={scrollSubCategoryNext}
                      className={`absolute right-0 md:-right-5 top-1/2 -translate-y-1/2 z-10 shadow-lg rounded-full p-2 transition-colors ${
                        subCategoryScrollState.canScrollNext 
                          ? 'bg-[#505e4d] text-white hover:bg-[#465342] cursor-pointer' 
                          : 'bg-white cursor-default opacity-50'
                      }`}
                      disabled={!subCategoryScrollState.canScrollNext}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </section>
              )
            })()}

            {/* Brand Slider - Shows brands from currently displayed products */}
            {/* {!searchQuery.trim() && products.length > 0 && (() => {
              // Extract unique brand IDs from current products
              // Products may have brand as object or ID string
              const productBrandIds = [...new Set(
                products
                  .map(p => {
                    // Handle both populated brand object and brand ID string
                    if (typeof p.brand === 'object' && p.brand !== null) {
                      return p.brand._id
                    }
                    return p.brand
                  })
                  .filter(Boolean)
              )]
              
              const availableBrands = brands.filter(brand => productBrandIds.includes(brand._id))
              
              console.log('Products count:', products.length)
              console.log('Sample product brands:', products.slice(0, 3).map(p => p.brand))
              console.log('Product brand IDs:', productBrandIds)
              console.log('All brands:', brands.length)
              console.log('Available brands:', availableBrands)
              
              if (availableBrands.length === 0) return null

              return (
                <section className="mb-8">
                  <div className="relative">
                    <button
                      onClick={scrollBrandPrev}
                      className={`absolute left-0 md:-left-5 top-1/2 -translate-y-1/2 z-10 shadow-lg rounded-full p-2 transition-colors ${
                        brandScrollState.canScrollPrev 
                          ? 'bg-[#505e4d] text-white hover:bg-[#465342] cursor-pointer' 
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
                      {availableBrands.map((brand) => (
                        <button
                          key={brand._id}
                          onClick={() => handleBrandChange(brand._id)}
                          className={`flex-shrink-0 w-32 rounded-lg transition-all flex flex-col items-center justify-center p-3 gap-2 ${
                            selectedBrands.includes(brand._id)
                              ? 'bg-[#e9ede7] border-2 border-[#505e4d]'
                              : ''
                          }`}
                        >
                          {brand.logo ? (
                            <>
                              <div className="h-24 flex items-center justify-center">
                                <img
                                  src={getFullImageUrl(brand.logo)}
                                  alt={brand.name || "Brand"}
                                  className="max-h-full max-w-full bg-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                    const btn = e.currentTarget.closest("button")
                                    const fallback = btn?.querySelector("[data-brand-fallback]")
                                    if (fallback) fallback.classList.remove("hidden")
                                  }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700 text-center line-clamp-2">
                                {brand.name}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-gray-700 text-center">
                              {brand.name}
                            </span>
                          )}
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
                          ? 'bg-[#505e4d] text-white hover:bg-[#465342] cursor-pointer' 
                          : 'bg-white cursor-default opacity-50'
                      }`}
                      disabled={!brandScrollState.canScrollNext}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </section>
              )
            })()} */}

            {/* Products Found and Sort Section - Above Product Cards */}
            <div className="relative z-10 mb-6 flex flex-row items-center justify-between gap-4 border-b border-[#d7ddd4] pb-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {searchQuery.trim() ? (
                    <>
                      <TranslatedText>Results for</TranslatedText> "{searchQuery.trim()}"
                      {actualSearchQuery && actualSearchQuery !== searchQuery.trim() && (
                        <span className="text-sm text-gray-500 block mt-1">
                          <TranslatedText>Showing results for</TranslatedText> "{actualSearchQuery}" <TranslatedText>instead</TranslatedText>
                        </span>
                      )}
                    </>
                  ) : (
                    (() => {
                      // Show brand name if a single brand is selected
                      if (selectedBrands.length === 1) {
                        const brandName = brands.find((b) => b._id === selectedBrands[0])?.name
                        if (brandName) return <TranslatedText text={brandName} />
                      }
                      
                      // Show subcategory names (deepest first)
                      if (currentSubCategory4Name) return <TranslatedText text={currentSubCategory4Name} />
                      if (currentSubCategory3Name) return <TranslatedText text={currentSubCategory3Name} />
                      if (currentSubCategory2Name) return <TranslatedText text={currentSubCategory2Name} />
                      if (currentSubCategoryName) return <TranslatedText text={currentSubCategoryName} />
                      
                      // Show category name
                      const categoryName = categories.find((cat) => cat._id === selectedCategory)?.name
                      if (categoryName) return <TranslatedText text={categoryName} />
                      
                      return <TranslatedText>All Products</TranslatedText>
                    })()
                  )}
                </h1>
                <p className="mt-2 text-sm font-semibold text-[#505e4d]">
                  {products.length} <TranslatedText>products found</TranslatedText>
                </p>
              </div>

              <div className="hidden md:block mt-0 flex-shrink-0 relative z-20">
                <SortDropdown value={sortBy} onChange={handleSortChange} />
              </div>
            </div>

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                  {products.slice(0, productsToShow).map((product) => (
                    <HomeStyleProductCard key={product._id} product={product} />
                  ))}
                </div>
                {productsToShow < products.length && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setProductsToShow((prev) => prev + PRODUCTS_BATCH_SIZE)}
                      className="rounded-xl bg-[#505e4d] px-7 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#465342] hover:shadow-lg"
                    >
                      <TranslatedText>Load More</TranslatedText>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="border-t border-[#d7ddd4] py-14 text-center">
                <div className="text-lg font-semibold text-slate-700">
                  <TranslatedText>No products found</TranslatedText>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  <TranslatedText>Try adjusting your filters or search terms</TranslatedText>
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-5 rounded-lg bg-[#505e4d] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#465342]"
                >
                  <TranslatedText>Reset Filters</TranslatedText>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content Display - Full Width After Products */}
        {seoContent && !searchQuery.trim() && products.length > 0 && (
          <div className="mt-8 border-t border-[#d7ddd4] pt-8">
            <div
              className="prose prose-lg max-w-none text-gray-700 
                [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-gray-900
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-gray-800
                [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-gray-800
                [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-gray-700
                [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-gray-700
                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ul]:space-y-2
                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_ol]:space-y-2
                [&_li]:text-gray-700 [&_li]:leading-relaxed
                [&_strong]:font-bold [&_strong]:text-gray-900
                [&_em]:italic
                [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
                [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
                [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
                [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:mb-4
                [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
                [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-2 [&_th]:bg-gray-100 [&_th]:font-semibold
                [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-2"
              dangerouslySetInnerHTML={{ __html: seoContent }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop

