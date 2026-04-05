"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ProductForm from "../../components/admin/ProductForm"
import MoveProductsModal from "../../components/admin/MoveProductsModal"
import ConfirmDialog from "../../components/admin/ConfirmDialog"
import { useToast } from "../../context/ToastContext"
import { Plus, Edit, Trash2, Search, Tag, Eye, EyeOff, Download, CheckSquare, Square, MoveRight, Copy, Upload, ChevronDown, Pause, Play, Columns, Check, X, ChevronLeft, ChevronRight } from "lucide-react"
import { getFullImageUrl } from "../../utils/imageUtils"

import config from "../../config/config"
import { exportProductsToExcel } from "../../utils/exportToExcel"

// Define all available columns
const ALL_COLUMNS = [
  { id: 'select', label: 'Select', default: true, alwaysVisible: true },
  { id: 'product', label: 'Product', default: true },
  { id: 'brand', label: 'Brand', default: true },
  { id: 'parentCategory', label: 'Parent Category', default: true },
  { id: 'level1', label: 'Level 1', default: true },
  { id: 'level2', label: 'Level 2', default: true },
  { id: 'level3', label: 'Level 3', default: true },
  { id: 'level4', label: 'Level 4', default: true },
  { id: 'price', label: 'Price', default: true },
  { id: 'sku', label: 'SKU', default: true },
  { id: 'action', label: 'Action', default: true, alwaysVisible: true },
]

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterSubcategory, setFilterSubcategory] = useState("all")
  const [filterSubcategory2, setFilterSubcategory2] = useState("all")
  const [filterSubcategory3, setFilterSubcategory3] = useState("all")
  const [filterSubcategory4, setFilterSubcategory4] = useState("all")
  const [filterBrand, setFilterBrand] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all") // New filter for active/inactive
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const PRODUCTS_PER_PAGE = 20
  const { showToast } = useToast()
  const [justEditedId, setJustEditedId] = useState(null)
  const [highlightTimer, setHighlightTimer] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectAllMode, setSelectAllMode] = useState(false) // Track if "select all" is active
  const [allProductIds, setAllProductIds] = useState([]) // Store all product IDs for select all
  const [loadingSelectAll, setLoadingSelectAll] = useState(false) // Track select all loading
  const [brands, setBrands] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [filteredSubcategories, setFilteredSubcategories] = useState([])
  const [filteredSubcategories2, setFilteredSubcategories2] = useState([])
  const [filteredSubcategories3, setFilteredSubcategories3] = useState([])
  const [filteredSubcategories4, setFilteredSubcategories4] = useState([])
  const [categoryProductCount, setCategoryProductCount] = useState(0)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [productToDuplicate, setProductToDuplicate] = useState(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState(null)
  
  // Action dropdown states
  const [openActionDropdown, setOpenActionDropdown] = useState(null)
  const [openStatusSubmenu, setOpenStatusSubmenu] = useState(false)
  const actionDropdownRef = useRef(null)
  
  // Bulk status dropdown
  const [showBulkStatusDropdown, setShowBulkStatusDropdown] = useState(false)
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const bulkStatusDropdownRef = useRef(null)
  
  // Column visibility states
  const [showColumnDropdown, setShowColumnDropdown] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState(() => {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem('adminProductsColumns')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return ALL_COLUMNS.filter(c => c.default).map(c => c.id)
      }
    }
    return ALL_COLUMNS.filter(c => c.default).map(c => c.id)
  })
  const columnDropdownRef = useRef(null)

  // Table scroll states for horizontal navigation
  const tableContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Save column visibility to localStorage
  useEffect(() => {
    localStorage.setItem('adminProductsColumns', JSON.stringify(visibleColumns))
  }, [visibleColumns])

  // Check scroll position for horizontal navigation buttons
  const checkScroll = () => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  // Update scroll buttons when table loads or products change
  useEffect(() => {
    checkScroll()
    const container = tableContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [products])

  // Scroll table horizontally
  const scrollTable = (direction) => {
    if (tableContainerRef.current) {
      const { scrollWidth, clientWidth } = tableContainerRef.current
      tableContainerRef.current.scrollTo({
        left: direction === 'left' ? 0 : scrollWidth - clientWidth,
        behavior: 'smooth'
      })
    }
  }

  // Close column dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(event.target)) {
        setShowColumnDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Toggle column visibility
  const toggleColumn = (columnId) => {
    const column = ALL_COLUMNS.find(c => c.id === columnId)
    if (column?.alwaysVisible) return // Can't hide always visible columns
    
    setVisibleColumns(prev => {
      if (prev.includes(columnId)) {
        return prev.filter(id => id !== columnId)
      } else {
        return [...prev, columnId]
      }
    })
  }

  // Check if column is visible
  const isColumnVisible = (columnId) => visibleColumns.includes(columnId)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) {
        setOpenActionDropdown(null)
        setOpenStatusSubmenu(false)
      }
      if (bulkStatusDropdownRef.current && !bulkStatusDropdownRef.current.contains(event.target)) {
        setShowBulkStatusDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Derived counters
  const totalSelected = useMemo(() => {
    return selectAllMode ? allProductIds.length : selectedIds.size
  }, [selectedIds, selectAllMode, allProductIds])

  // Get count of products for current category/subcategory filter
  const fetchFilteredCount = async () => {
    try {
      const token = getAdminToken()
      if (!token) return

      const params = {}
      if (filterCategory && filterCategory !== "all") {
        params.parentCategory = filterCategory
      }
      if (filterSubcategory && filterSubcategory !== "all") {
        params.category = filterSubcategory
      }
      if (filterSubcategory2 && filterSubcategory2 !== "all") {
        params.subCategory2 = filterSubcategory2
      }
      if (filterSubcategory3 && filterSubcategory3 !== "all") {
        params.subCategory3 = filterSubcategory3
      }
      if (filterSubcategory4 && filterSubcategory4 !== "all") {
        params.subCategory4 = filterSubcategory4
      }
      
      const { data } = await axios.get(`${config.API_URL}/api/products/admin/count`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      
      setCategoryProductCount(data.totalCount || 0)
    } catch (error) {
      console.error("Failed to fetch product count:", error)
      setCategoryProductCount(0)
    }
  }

  const formatPrice = (price) => {
    return `AED ${price.toLocaleString()}`
  }

  const clearStorefrontProductCache = () => {
    localStorage.removeItem("graba2z_products_cache")
    sessionStorage.removeItem("graba2z_products_cache")
    for (let i = 0; i < 20; i += 1) {
      localStorage.removeItem(`graba2z_products_chunk_${i}`)
      sessionStorage.removeItem(`graba2z_products_chunk_${i}`)
    }
  }

  // Get admin token with proper validation
  const getAdminToken = () => {
    const adminToken = localStorage.getItem("adminToken")
    const regularToken = localStorage.getItem("token")

    console.log("🔍 Checking tokens:")
    console.log("Admin Token:", adminToken ? "Present" : "Missing")
    console.log("Regular Token:", regularToken ? "Present" : "Missing")

    // Use adminToken first, fallback to regular token
    const token = adminToken || regularToken

    if (token) {
      console.log("✅ Using token:", token.substring(0, 20) + "...")
      return token
    }

    console.log("❌ No valid token found")
    return null
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [page, searchTerm, filterCategory, filterSubcategory, filterSubcategory2, filterSubcategory3, filterSubcategory4, filterBrand, filterStatus])

  useEffect(() => {
    fetchBrands()
    fetchSubcategories()
  }, [])

  // On mount, check if a product was edited on previous navigation
  useEffect(() => {
    const lastEdited = sessionStorage.getItem("lastEditedProductId")
    if (lastEdited) {
      setJustEditedId(lastEdited)
      sessionStorage.removeItem("lastEditedProductId")
    }
    return () => {
      if (highlightTimer) clearTimeout(highlightTimer)
    }
  }, [])

  // Cascading filter for all subcategory levels
  useEffect(() => {
    // Level 1: Filter based on parent category
    if (filterCategory === "all") {
      setFilteredSubcategories(subcategories.filter(sub => sub.level === 1))
    } else {
      setFilteredSubcategories(subcategories.filter(sub => 
        sub.level === 1 && sub.category && sub.category._id === filterCategory
      ))
    }
    // Reset all lower levels when parent category changes
    setFilterSubcategory("all")
    setFilterSubcategory2("all")
    setFilterSubcategory3("all")
    setFilterSubcategory4("all")
    setFilteredSubcategories2([])
    setFilteredSubcategories3([])
    setFilteredSubcategories4([])
    fetchFilteredCount()
  }, [filterCategory, subcategories])

  // Level 2: Filter based on level 1 selection
  useEffect(() => {
    if (filterSubcategory === "all" || !filterSubcategory) {
      setFilteredSubcategories2([])
    } else {
      setFilteredSubcategories2(subcategories.filter(sub => {
        if (sub.level !== 2 || !sub.parentSubCategory) return false
        const parentId = typeof sub.parentSubCategory === 'object' ? sub.parentSubCategory._id : sub.parentSubCategory
        return parentId === filterSubcategory
      }))
    }
    // Reset lower levels when level 1 changes
    setFilterSubcategory2("all")
    setFilterSubcategory3("all")
    setFilterSubcategory4("all")
    setFilteredSubcategories3([])
    setFilteredSubcategories4([])
    fetchFilteredCount()
  }, [filterSubcategory, subcategories])

  // Level 3: Filter based on level 1 OR level 2 selection
  useEffect(() => {
    if (filterSubcategory === "all" || !filterSubcategory) {
      setFilteredSubcategories3([])
    } else {
      // If Level 2 is selected, filter by Level 2 parent; otherwise filter by Level 1 parent
      const parentId = (filterSubcategory2 !== "all" && filterSubcategory2) ? filterSubcategory2 : filterSubcategory
      setFilteredSubcategories3(subcategories.filter(sub => {
        if (sub.level !== 3 || !sub.parentSubCategory) return false
        const subParentId = typeof sub.parentSubCategory === 'object' ? sub.parentSubCategory._id : sub.parentSubCategory
        return subParentId === parentId
      }))
    }
    // Reset lower level when level 2 changes
    setFilterSubcategory3("all")
    setFilterSubcategory4("all")
    setFilteredSubcategories4([])
    fetchFilteredCount()
  }, [filterSubcategory, filterSubcategory2, subcategories])

  // Level 4: Filter based on level 2 OR level 3 selection
  useEffect(() => {
    if (filterSubcategory === "all" || !filterSubcategory) {
      setFilteredSubcategories4([])
    } else {
      // If Level 3 is selected, filter by Level 3 parent; else if Level 2, filter by Level 2 parent; else filter by Level 1
      let parentId = filterSubcategory
      if (filterSubcategory3 !== "all" && filterSubcategory3) {
        parentId = filterSubcategory3
      } else if (filterSubcategory2 !== "all" && filterSubcategory2) {
        parentId = filterSubcategory2
      }
      setFilteredSubcategories4(subcategories.filter(sub => {
        if (sub.level !== 4 || !sub.parentSubCategory) return false
        const subParentId = typeof sub.parentSubCategory === 'object' ? sub.parentSubCategory._id : sub.parentSubCategory
        return subParentId === parentId
      }))
    }
    setFilterSubcategory4("all")
    fetchFilteredCount()
  }, [filterSubcategory, filterSubcategory2, filterSubcategory3, subcategories])

  // Update count when any subcategory level changes
  useEffect(() => {
    fetchFilteredCount()
  }, [filterSubcategory4])

  // Selection helpers
  const toggleSelectOne = (id) => {
    if (selectAllMode) {
      // If in select all mode, switch to individual selection mode
      setSelectAllMode(false)
      setAllProductIds([])
      // Start with just this product deselected (or selected if it wasn't selected)
      const currentPageIds = new Set(products.map(p => p._id))
      currentPageIds.delete(id) // Remove the clicked item
      setSelectedIds(currentPageIds)
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id); else next.add(id)
        return next
      })
    }
  }

  const isAllOnPageSelected = useMemo(() => {
    if (!products || products.length === 0) return false
    if (selectAllMode) return true
    return products.every(p => selectedIds.has(p._id))
  }, [products, selectedIds, selectAllMode])

  const isAllProductsSelected = useMemo(() => {
    return selectAllMode
  }, [selectAllMode])

  const toggleSelectPage = () => {
    if (selectAllMode) {
      // If all are selected, deselect all
      setSelectAllMode(false)
      setSelectedIds(new Set())
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        if (isAllOnPageSelected) {
          products.forEach(p => next.delete(p._id))
        } else {
          products.forEach(p => next.add(p._id))
        }
        return next
      })
    }
  }

  const toggleSelectAll = async () => {
    if (selectAllMode) {
      // Deselect all
      setSelectAllMode(false)
      setSelectedIds(new Set())
      setAllProductIds([])
    } else {
      // Select all products across all pages - just get the count, not the actual IDs
      setLoadingSelectAll(true)
      try {
        const totalCount = await getProductCount()
        console.log('Total product count:', totalCount)
        setAllProductIds(new Array(totalCount).fill(null).map((_, i) => `temp_${i}`)) // Create temp IDs for count
        setSelectAllMode(true)
        setSelectedIds(new Set()) // Clear individual selections
        showToast(`Selected all ${totalCount} products`, 'success')
      } catch (error) {
        console.error('Error selecting all products:', error)
        showToast('Failed to select all products', 'error')
      }
      setLoadingSelectAll(false)
    }
  }

  const clearSelection = () => {
    setSelectAllMode(false)
    setSelectedIds(new Set())
  }

  // Export helpers
  const handleExport = async (scope = "selected") => {
    if (exporting) return

    const filenameBase = [
      "products",
      scope,
      filterCategory && filterCategory !== 'all' ? `cat-${filterCategory}` : null,
      searchTerm ? `q-${searchTerm.replace(/\s+/g, '-')}` : null,
      `p${page}`
    ].filter(Boolean).join('_')

    setExporting(true)
    try {
      if (scope === "selected") {
        if (selectAllMode) {
          // Export all products with current filters (same as filtered results)
          await handleExportByCurrentFilters()
        } else {
          // Export selected products by fetching them by IDs
          if (selectedIds.size === 0) {
            showToast('No products selected to export', 'warning')
            return
          }
          
          showToast(`Fetching ${selectedIds.size} selected products...`, 'info')
          const selectedProducts = await fetchProductsByIds(Array.from(selectedIds))
          if (!selectedProducts.length) {
            showToast('No products found for selected IDs', 'warning')
            return
          }
          exportProductsToExcel(selectedProducts, `${filenameBase}.xlsx`)
          showToast(`Exported ${selectedProducts.length} products successfully`, 'success')
        }
      } else if (scope === "page") {
        if (!products.length) {
          showToast('No products on current page to export', 'warning')
          return
        }
        exportProductsToExcel(products, `${filenameBase}.xlsx`)
        showToast(`Exported ${products.length} products from current page`, 'success')
      } else if (scope === "all") {
        // Fetch all with current filters ignoring pagination
        showToast('Preparing full export...', 'info')
        const all = await fetchAllForExport()
        if (!all.length) {
          showToast('No products found for current filters', 'warning')
          return
        }
        exportProductsToExcel(all, `${filenameBase}.xlsx`)
        showToast(`Exported ${all.length} products successfully`, 'success')
      }
    } catch (error) {
      console.error('Export error:', error)
      showToast('Export failed. Please try again.', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleExportByCurrentFilters = async () => {
    const overrides = {}
    if (filterCategory && filterCategory !== 'all') overrides.parentCategory = filterCategory
    if (filterSubcategory && filterSubcategory !== 'all') overrides.category = filterSubcategory
    if (filterSubcategory2 && filterSubcategory2 !== 'all') overrides.subCategory2 = filterSubcategory2
    if (filterSubcategory3 && filterSubcategory3 !== 'all') overrides.subCategory3 = filterSubcategory3
    if (filterSubcategory4 && filterSubcategory4 !== 'all') overrides.subCategory4 = filterSubcategory4
    if (filterBrand && filterBrand !== 'all') overrides.brand = filterBrand
    if (filterStatus && filterStatus !== 'all') {
      if (filterStatus === 'onhold') {
        overrides.onHold = true
      } else {
        overrides.isActive = filterStatus === 'active'
        overrides.onHold = false
      }
    }
    if (searchTerm.trim()) overrides.search = searchTerm.trim()
    
    showToast('Preparing export for current filters...', 'info')
    const all = await fetchAllForExport(overrides)
    if (!all.length) {
      showToast('No products found for current filters', 'warning')
      return
    }
    const fname = [
      'products_filtered',
      filterCategory && filterCategory !== 'all' ? `cat-${filterCategory}` : null,
      filterSubcategory && filterSubcategory !== 'all' ? `sub1-${filterSubcategory}` : null,
      filterSubcategory2 && filterSubcategory2 !== 'all' ? `sub2-${filterSubcategory2}` : null,
      filterSubcategory3 && filterSubcategory3 !== 'all' ? `sub3-${filterSubcategory3}` : null,
      filterSubcategory4 && filterSubcategory4 !== 'all' ? `sub4-${filterSubcategory4}` : null,
      filterBrand && filterBrand !== 'all' ? `brand-${filterBrand}` : null,
      filterStatus && filterStatus !== 'all' ? `status-${filterStatus}` : null,
      searchTerm ? `search-${searchTerm.replace(/\s+/g, '-')}` : null,
    ].filter(Boolean).join('_') || 'products_current_filters'
    exportProductsToExcel(all, `${fname}.xlsx`)
    showToast(`Exported ${all.length} products successfully`, 'success')
  }

  const getProductCount = async () => {
    const token = getAdminToken()
    if (!token) return 0
    try {
      const params = {}
      if (searchTerm.trim() !== "") params.search = searchTerm.trim()
      if (filterCategory && filterCategory !== "all") params.parentCategory = filterCategory
      if (filterSubcategory && filterSubcategory !== "all") params.category = filterSubcategory
      if (filterSubcategory2 && filterSubcategory2 !== "all") params.subCategory2 = filterSubcategory2
      if (filterSubcategory3 && filterSubcategory3 !== "all") params.subCategory3 = filterSubcategory3
      if (filterSubcategory4 && filterSubcategory4 !== "all") params.subCategory4 = filterSubcategory4
      if (filterBrand && filterBrand !== "all") params.brand = filterBrand
      if (filterStatus && filterStatus !== "all") {
        if (filterStatus === 'onhold') {
          params.onHold = true
        } else {
          params.isActive = filterStatus === "active"
          params.onHold = false
        }
      }
      
      const { data } = await axios.get(`${config.API_URL}/api/products/admin/count`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      
      return data.totalCount || 0
    } catch (e) {
      console.error('Get product count error', e)
      showToast('Failed to get product count', 'error')
      return 0
    }
  }

  const fetchAllForExport = async (overrides = {}) => {
    const token = getAdminToken()
    if (!token) return []
    try {
      const params = { limit: 1000, page: 1 }
      if (searchTerm.trim() !== "") params.search = searchTerm.trim()
      if (filterCategory && filterCategory !== "all") params.parentCategory = filterCategory
      if (filterSubcategory && filterSubcategory !== "all") params.category = filterSubcategory
      if (filterSubcategory2 && filterSubcategory2 !== "all") params.subCategory2 = filterSubcategory2
      if (filterSubcategory3 && filterSubcategory3 !== "all") params.subCategory3 = filterSubcategory3
      if (filterSubcategory4 && filterSubcategory4 !== "all") params.subCategory4 = filterSubcategory4
      if (filterBrand && filterBrand !== "all") params.brand = filterBrand
      if (filterStatus && filterStatus !== "all") {
        if (filterStatus === 'onhold') {
          params.onHold = true
        } else {
          params.isActive = filterStatus === "active"
          params.onHold = false
        }
      }
      Object.assign(params, overrides)
      // We may need to loop if more than 1000
      let all = []
      let currentPage = 1
      while (true) {
        const { data } = await axios.get(`${config.API_URL}/api/products/admin`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ...params, page: currentPage }
        })
        const batch = data.products || []
        all = all.concat(batch)
        if (!data.totalCount || all.length >= data.totalCount || batch.length === 0) break
        currentPage += 1
      }
      return all
    } catch (e) {
      console.error('Export fetchAll error', e)
      showToast('Failed to fetch all products for export', 'error')
      return []
    }
  }

  // Fetch specific products by their IDs for export
  const fetchProductsByIds = async (ids) => {
    const token = getAdminToken()
    if (!token || !ids || ids.length === 0) return []
    
    try {
      // Fetch products in batches to avoid URL length limits
      const batchSize = 50
      let allProducts = []
      
      for (let i = 0; i < ids.length; i += batchSize) {
        const batchIds = ids.slice(i, i + batchSize)
        const { data } = await axios.post(
          `${config.API_URL}/api/products/by-ids`,
          { ids: batchIds },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        allProducts = allProducts.concat(data.products || [])
      }
      
      return allProducts
    } catch (e) {
      console.error('Fetch products by IDs error', e)
      showToast('Failed to fetch selected products', 'error')
      return []
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = getAdminToken()

      if (!token) {
        setError("Authentication required. Please login again.")
        return
      }

      // Build query params for search, category, subcategory, brand, pagination
      const params = { limit: PRODUCTS_PER_PAGE, page }
      if (searchTerm.trim() !== "") params.search = searchTerm.trim()
      if (filterCategory && filterCategory !== "all") params.parentCategory = filterCategory
      if (filterSubcategory && filterSubcategory !== "all") params.category = filterSubcategory
      if (filterSubcategory2 && filterSubcategory2 !== "all") params.subCategory2 = filterSubcategory2
      if (filterSubcategory3 && filterSubcategory3 !== "all") params.subCategory3 = filterSubcategory3
      if (filterSubcategory4 && filterSubcategory4 !== "all") params.subCategory4 = filterSubcategory4
      if (filterBrand && filterBrand !== "all") params.brand = filterBrand
      if (filterStatus && filterStatus !== "all") {
        if (filterStatus === 'onhold') {
          params.onHold = true
        } else {
          params.isActive = filterStatus === "active"
          params.onHold = false
        }
      }

      const { data, headers } = await axios.get(`${config.API_URL}/api/products/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      })
      setProducts(data.products || [])
      const totalCount = data.totalCount || 0
      setTotalPages(Math.ceil(totalCount / PRODUCTS_PER_PAGE) || 1)
      setLoading(false)
    } catch (error) {
      console.error("Failed to load products:", error)
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.")
        // Redirect to admin login
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

      if (!token) {
        console.log("No token for categories fetch")
        return
      }

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

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/brands`)
      setBrands(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load brands:", error)
    }
  }

  const fetchSubcategories = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/subcategories`)
      // Filter out subcategories without valid category reference
      const validSubcategories = Array.isArray(data) ? data.filter(sub => sub && sub.category && sub.category._id) : []
      setSubcategories(validSubcategories)
    } catch (error) {
      console.error("Failed to load subcategories:", error)
      setSubcategories([])
    }
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = getAdminToken()

        if (!token) {
          setError("Authentication required. Please login again.")
          return
        }

        await axios.delete(`${config.API_URL}/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        clearStorefrontProductCache()
        setProducts(products.filter((product) => product._id !== productId))
        showToast("Product deleted successfully", "success")
      } catch (error) {
        console.error("Failed to delete product:", error)
        if (error.response?.status === 401) {
          setError("Authentication failed. Please login again.")
          window.location.href = "/grabiansadmin/login"
        } else {
          setError("Failed to delete product. Please try again.")
          showToast("Failed to delete product", "error")
        }
      }
    }
  }

  const handleDuplicate = (productId) => {
    setProductToDuplicate(productId)
    setShowDuplicateDialog(true)
  }

  const confirmDuplicate = async () => {
    if (!productToDuplicate) return

    try {
      const token = getAdminToken()

      if (!token) {
        setError("Authentication required. Please login again.")
        return
      }

      const { data } = await axios.post(
        `${config.API_URL}/api/products/${productToDuplicate}/duplicate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // Refresh the product list to show the duplicated product
      await fetchProducts()
      clearStorefrontProductCache()
      
      showToast("Product duplicated successfully", "success")
      
      // Highlight the new product
      if (data._id) {
        setJustEditedId(data._id)
        setTimeout(() => {
          const el = document.getElementById(`product-row-${data._id}`)
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 250)
        const t = setTimeout(() => setJustEditedId(null), 3500)
        setHighlightTimer(t)
      }
    } catch (error) {
      console.error("Failed to duplicate product:", error)
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.")
        window.location.href = "/grabiansadmin/login"
      } else {
        setError(`Failed to duplicate product: ${error.response?.data?.message || error.message}`)
        showToast(error.response?.data?.message || "Failed to duplicate product", "error")
      }
    }
  }

  const handleToggleStatus = async (productId) => {
    try {
      const token = getAdminToken()

      if (!token) {
        setError("Authentication required. Please login again.")
        return
      }

      const product = products.find(p => p._id === productId)
      if (!product) return

      const newStatus = !product.isActive

      await axios.put(`${config.API_URL}/api/products/${productId}`, 
        { isActive: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // Update the product in the local state
      setProducts(products.map(p => 
        p._id === productId ? { ...p, isActive: newStatus } : p
      ))
      clearStorefrontProductCache()

      showToast(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
    } catch (error) {
      console.error("Failed to toggle product status:", error)
      showToast("Failed to update product status", "error")
    }
  }

  // Update product status (Active, Inactive, On Hold)
  const handleUpdateProductStatus = async (productId, statusType) => {
    try {
      const token = getAdminToken()
      if (!token) {
        setError("Authentication required. Please login again.")
        return
      }

      let updateData = {}
      let statusMessage = ""

      switch (statusType) {
        case 'active':
          updateData = { isActive: true, onHold: false }
          statusMessage = "activated"
          break
        case 'inactive':
          updateData = { isActive: false, onHold: false }
          statusMessage = "deactivated"
          break
        case 'onhold':
          updateData = { isActive: false, onHold: true }
          statusMessage = "put on hold"
          break
        default:
          return
      }

      await axios.put(`${config.API_URL}/api/products/${productId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update local state
      setProducts(products.map(p => 
        p._id === productId ? { ...p, ...updateData } : p
      ))
      clearStorefrontProductCache()

      setOpenActionDropdown(null)
      setOpenStatusSubmenu(false)
      showToast(`Product ${statusMessage} successfully`, "success")
    } catch (error) {
      console.error("Failed to update product status:", error)
      showToast("Failed to update product status", "error")
    }
  }

  // Bulk status update function
  const handleBulkStatusUpdate = async (statusType) => {
    try {
      const token = getAdminToken()
      if (!token) {
        showToast("Authentication required. Please login again.", "error")
        return
      }

      setBulkUpdating(true)
      setShowBulkStatusDropdown(false)

      // Get product IDs to update
      let productIds
      if (selectAllMode) {
        // If all products are selected, fetch all IDs with current filters
        const params = {}
        if (searchTerm.trim() !== "") params.search = searchTerm.trim()
        if (filterCategory && filterCategory !== "all") params.parentCategory = filterCategory
        if (filterSubcategory && filterSubcategory !== "all") params.category = filterSubcategory
        if (filterSubcategory2 && filterSubcategory2 !== "all") params.subCategory2 = filterSubcategory2
        if (filterSubcategory3 && filterSubcategory3 !== "all") params.subCategory3 = filterSubcategory3
        if (filterSubcategory4 && filterSubcategory4 !== "all") params.subCategory4 = filterSubcategory4
        if (filterBrand && filterBrand !== "all") params.brand = filterBrand
        if (filterStatus && filterStatus !== "all") {
          if (filterStatus === 'onhold') {
            params.onHold = true
          } else {
            params.isActive = filterStatus === "active"
            params.onHold = false
          }
        }

        const { data } = await axios.get(`${config.API_URL}/api/products/admin`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ...params, limit: 10000, page: 1 }
        })
        
        productIds = data.products.map(p => p._id)
      } else {
        productIds = Array.from(selectedIds)
      }

      if (productIds.length === 0) {
        showToast("No products selected", "error")
        setBulkUpdating(false)
        return
      }

      // Determine update data based on status type
      let updateData = {}
      let statusMessage = ""

      switch (statusType) {
        case 'active':
          updateData = { isActive: true, onHold: false }
          statusMessage = "activated"
          break
        case 'inactive':
          updateData = { isActive: false, onHold: false }
          statusMessage = "deactivated"
          break
        case 'onhold':
          updateData = { isActive: false, onHold: true }
          statusMessage = "put on hold (hidden from shop)"
          break
        default:
          setBulkUpdating(false)
          return
      }

      // Make bulk update request
      await axios.put(
        `${config.API_URL}/api/products/bulk-status`,
        {
          productIds,
          ...updateData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      showToast(`Successfully ${statusMessage} ${productIds.length} product(s)`, "success")
      
      // Clear selection and refresh products
      setSelectAllMode(false)
      setSelectedIds(new Set())
      setAllProductIds([])
      await fetchProducts()
      clearStorefrontProductCache()
    } catch (error) {
      console.error("Failed to update product status:", error)
      showToast(error.response?.data?.message || "Failed to update product status", "error")
    } finally {
      setBulkUpdating(false)
    }
  }

  const handleBulkMove = async (categoryData) => {
    try {
      const token = getAdminToken()

      if (!token) {
        showToast("Authentication required. Please login again.", "error")
        return
      }

      // Get product IDs to move
      let productIds
      if (selectAllMode) {
        // If all products are selected, fetch all IDs with current filters
        const params = {}
        if (searchTerm.trim() !== "") params.search = searchTerm.trim()
        if (filterCategory && filterCategory !== "all") params.parentCategory = filterCategory
        if (filterSubcategory && filterSubcategory !== "all") params.category = filterSubcategory
        if (filterBrand && filterBrand !== "all") params.brand = filterBrand
        if (filterStatus && filterStatus !== "all") {
          if (filterStatus === 'onhold') {
            params.onHold = true
          } else {
            params.isActive = filterStatus === "active"
            params.onHold = false
          }
        }

        const { data } = await axios.get(`${config.API_URL}/api/products/admin`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ...params, limit: 10000, page: 1 }
        })
        
        productIds = data.products.map(p => p._id)
      } else {
        productIds = Array.from(selectedIds)
      }

      if (productIds.length === 0) {
        showToast("No products selected", "error")
        return
      }

      // Make bulk move request
      await axios.put(
        `${config.API_URL}/api/products/bulk-move`,
        {
          productIds,
          ...categoryData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      showToast(`Successfully moved ${productIds.length} product(s)`, "success")
      
      // Clear selection and refresh products
      setSelectAllMode(false)
      setSelectedIds(new Set())
      setAllProductIds([])
      await fetchProducts()
      clearStorefrontProductCache()
    } catch (error) {
      console.error("Failed to move products:", error)
      showToast(error.response?.data?.message || "Failed to move products", "error")
    }
  }

  const handleImportFile = async () => {
    if (!importFile) {
      showToast("Please select a file to import", "error")
      return
    }

    setImporting(true)
    setImportResults(null)

    try {
      const token = getAdminToken()
      if (!token) {
        showToast("Authentication required. Please login again.", "error")
        setImporting(false)
        return
      }

      const formData = new FormData()
      formData.append("file", importFile)

      const { data } = await axios.post(
        `${config.API_URL}/api/products/bulk-import-with-id`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )

      setImportResults(data)
      showToast(data.message, "success")
      
      // Refresh products
      await fetchProducts()
      clearStorefrontProductCache()
    } catch (error) {
      console.error("Import failed:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to import products"
      showToast(errorMessage, "error")
      
      // If there are detailed errors, show them in results
      if (error.response?.data) {
        setImportResults(error.response.data)
      }
    } finally {
      setImporting(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ]
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        showToast("Please upload a valid Excel file (.xlsx or .xls)", "error")
        return
      }
      
      setImportFile(file)
      setImportResults(null)
    }
  }

  const closeImportDialog = () => {
    setShowImportDialog(false)
    setImportFile(null)
    setImportResults(null)
  }

  const handleFormSubmit = async (productData) => {
    try {
      console.log("🚀 Starting product submission...")
      console.log("📦 Product data:", productData)

      const token = getAdminToken()

      if (!token) {
        setError("Authentication required. Please login again.")
        window.location.href = "/grabiansadmin/login"
        return
      }

      const axiosConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }

      console.log("🔧 Request config:", axiosConfig)

      let response
      if (editingProduct) {
        console.log("✏️ Updating existing product...")
        response = await axios.put(`${config.API_URL}/api/products/${editingProduct._id}`, productData, axiosConfig)
      } else {
        console.log("➕ Creating new product...")
        response = await axios.post(`${config.API_URL}/api/products`, productData, axiosConfig)
      }

      console.log("✅ Product saved successfully:", response.data)

      // Refresh product list
      await fetchProducts()
      clearStorefrontProductCache()
      setShowForm(false)
      // Determine the affected product id
      const affectedId = editingProduct ? editingProduct._id : response?.data?._id
      setEditingProduct(null)
      setError(null)
      showToast("Product saved successfully", "success")

      // Highlight the affected product row
      if (affectedId) {
        setJustEditedId(affectedId)
        sessionStorage.setItem("lastEditedProductId", affectedId)
        // Scroll into view once products are rendered
        setTimeout(() => {
          const el = document.getElementById(`product-row-${affectedId}`)
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 250)
        // Clear highlight after a few seconds
        const t = setTimeout(() => setJustEditedId(null), 3500)
        setHighlightTimer(t)
      }
    } catch (error) {
      console.error("❌ Failed to save product:", error)
      console.error("❌ Error response:", error.response?.data)
      console.error("❌ Error status:", error.response?.status)

      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.")
        // Clear invalid tokens
        localStorage.removeItem("adminToken")
        localStorage.removeItem("token")
        window.location.href = "/grabiansadmin/login"
      } else {
        setError(`Failed to save product: ${error.response?.data?.message || error.message}`)
        showToast("Failed to save product", "error")
      }
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized"

    // Handle both string ID and object
    const id = typeof categoryId === "object" ? categoryId._id : categoryId
    const category = categories.find((cat) => cat._id === id)
    return category ? category.name : "Unknown"
  }

  // Helper to get parent category name from product
  const getParentCategoryName = (product) => {
    // Check if parentCategory is directly on the product
    if (product.parentCategory) {
      if (typeof product.parentCategory === 'object' && product.parentCategory.name) {
        return product.parentCategory.name;
      }
      const parent = categories.find(cat => cat._id === product.parentCategory);
      if (parent) return parent.name;
    }
    
    // Check if parent category is nested in the category object
    if (product.category && product.category.category) {
      if (typeof product.category.category === 'object' && product.category.category.name) {
        return product.category.category.name;
      }
      const parent = categories.find(cat => cat._id === product.category.category);
      if (parent) return parent.name;
    }
    
    return 'N/A';
  };

  // Update: Only filter on frontend for search by name, brand, or exact SKU (case-insensitive)
  // Remove filteredProducts and use products directly in rendering

  // Add useEffect to refetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, filterCategory, filterSubcategory, filterBrand, filterStatus]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      {/* Duplicate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDuplicateDialog}
        onClose={() => {
          setShowDuplicateDialog(false)
          setProductToDuplicate(null)
        }}
        onConfirm={confirmDuplicate}
        title="Duplicate Product"
        message={"Are you sure you want to duplicate this product?\n\nThe duplicate will be created with:\n• Incremented SKU and Barcode\n• Modified slug with -duplicate suffix\n• Inactive status (for safety)\n• Name with (Copy) suffix"}
        confirmText="Yes, Duplicate"
        cancelText="Cancel"
        type="success"
      />

      {/* Import Dialog */}
      {/* {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Import Products from Excel</h2>
            
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li><strong>Export products</strong> to get Excel file with ObjectIds (_id column)</li>
                  <li><strong>Edit in Excel:</strong> Modify product details, categories, etc.</li>
                  <li><strong>Import back:</strong> Products with matching ObjectIds will be <strong>updated</strong></li>
                  <li><strong>New products:</strong> Rows without ObjectId will be <strong>created as new</strong></li>
                  <li><strong>Duplicate detection:</strong> Same ObjectId twice in file = error</li>
                  <li><strong>Category matching:</strong> By ObjectId first, then by name, or creates new</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="import-file-input"
                />
                <label
                  htmlFor="import-file-input"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <Upload size={48} className="text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Click to select Excel file
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Supports .xlsx and .xls files
                  </span>
                </label>
                
                {importFile && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                      Selected: <strong>{importFile.name}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {importResults && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Import Results:</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-green-700">{importResults.created || 0}</div>
                    <div className="text-xs text-green-600">Created</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-blue-700">{importResults.updated || 0}</div>
                    <div className="text-xs text-blue-600">Updated</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-red-700">{importResults.failed || 0}</div>
                    <div className="text-xs text-red-600">Failed</div>
                  </div>
                </div>

                {importResults.errors && importResults.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-4 max-h-60 overflow-y-auto">
                    <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
                    <ul className="text-sm text-red-800 space-y-2">
                      {importResults.errors.map((err, idx) => (
                        <li key={idx} className="border-b border-red-200 pb-2">
                          <strong>Row {err.row}:</strong> {err.productName && `"${err.productName}" - `}{err.error}
                          {err.objectId && <span className="text-xs ml-2">(ID: {err.objectId})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {importResults.results && importResults.results.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 max-h-60 overflow-y-auto mt-3">
                    <h4 className="font-semibold text-gray-900 mb-2">Success Details:</h4>
                    <ul className="text-sm text-gray-800 space-y-1">
                      {importResults.results.slice(0, 20).map((result, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            result.action === 'created' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {result.action}
                          </span>
                          <span>{result.productName}</span>
                          {result.sku && <span className="text-gray-500">({result.sku})</span>}
                        </li>
                      ))}
                      {importResults.results.length > 20 && (
                        <li className="text-gray-500 italic">
                          ... and {importResults.results.length - 20} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeImportDialog}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={importing}
              >
                Close
              </button>
              <button
                onClick={handleImportFile}
                disabled={!importFile || importing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Import
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )} */}

      <div className="flex-1 ml-64 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <div className="flex gap-3">
             
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={16} />
                Add Product
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

          {showForm ? (
            <ProductForm product={editingProduct} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
          ) : (
            <>
              {/* Search and Filters Section */}
              <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6 max-w-full overflow-visible">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filter & Search Products</h3>
                
                {/* First Row: Parent Category, Level 1, Level 2, Level 3, Level 4 */}
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {/* Parent Category Filter */}
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
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

                  {/* Level 1 Subcategory Filter */}
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level 1</label>
                    <select
                      value={filterSubcategory}
                      onChange={(e) => setFilterSubcategory(e.target.value)}
                      disabled={filterCategory === "all"}
                      className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                    >
                      <option value="all">{filterCategory === "all" ? "Select Parent First" : "All Level 1"}</option>
                      {filteredSubcategories.map((subcategory) => (
                        <option key={subcategory._id} value={subcategory._id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Level 2 Subcategory Filter */}
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level 2</label>
                    <select
                      value={filterSubcategory2}
                      onChange={(e) => setFilterSubcategory2(e.target.value)}
                      disabled={filterSubcategory === "all" || filteredSubcategories2.length === 0}
                      className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                    >
                      <option value="all">{filterSubcategory === "all" ? "Select Level 1 First" : filteredSubcategories2.length === 0 ? "No Level 2" : "All Level 2"}</option>
                      {filteredSubcategories2.map((subcategory) => (
                        <option key={subcategory._id} value={subcategory._id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Level 3 Subcategory Filter */}
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level 3</label>
                    <select
                      value={filterSubcategory3}
                      onChange={(e) => setFilterSubcategory3(e.target.value)}
                      disabled={filterSubcategory === "all" || filteredSubcategories3.length === 0}
                      className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                    >
                      <option value="all">{filterSubcategory === "all" ? "Select Level 1 First" : filteredSubcategories3.length === 0 ? "No Level 3" : "All Level 3"}</option>
                      {filteredSubcategories3.map((subcategory) => (
                        <option key={subcategory._id} value={subcategory._id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Level 4 Subcategory Filter */}
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level 4</label>
                    <select
                      value={filterSubcategory4}
                      onChange={(e) => setFilterSubcategory4(e.target.value)}
                      disabled={filterSubcategory === "all" || filteredSubcategories4.length === 0}
                      className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                    >
                      <option value="all">{filterSubcategory === "all" ? "Select Level 1 First" : filteredSubcategories4.length === 0 ? "No Level 4" : "All Level 4"}</option>
                      {filteredSubcategories4.map((subcategory) => (
                        <option key={subcategory._id} value={subcategory._id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Second Row: Brand, Status, Search */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {/* Brand Filter */}
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

                  {/* Status Filter */}
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

                  {/* Search Filter */}
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

                {/* Clear Filters Button */}
                {(searchTerm || filterCategory !== "all" || filterSubcategory !== "all" || filterSubcategory2 !== "all" || filterSubcategory3 !== "all" || filterSubcategory4 !== "all" || filterBrand !== "all" || filterStatus !== "all") && (
                  <div className="flex justify-start mt-4">
                    <button
                      onClick={() => {
                        setSearchTerm("")
                        setFilterCategory("all")
                        setFilterSubcategory("all")
                        setFilterSubcategory2("all")
                        setFilterSubcategory3("all")
                        setFilterSubcategory4("all")
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

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {(searchTerm || filterCategory !== "all" || filterSubcategory !== "all" || filterSubcategory2 !== "all" || filterSubcategory3 !== "all" || filterSubcategory4 !== "all" || filterBrand !== "all" || filterStatus !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("")
                          setFilterCategory("all")
                          setFilterSubcategory("all")
                          setFilterSubcategory2("all")
                          setFilterSubcategory3("all")
                          setFilterSubcategory4("all")
                          setFilterBrand("all")
                          setFilterStatus("all")
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleSelectAll}
                          disabled={loadingSelectAll}
                          className={`px-3 py-1 text-sm rounded border ${
                            selectAllMode 
                              ? 'bg-blue-50 border-blue-300 text-blue-700' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          } ${loadingSelectAll ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {loadingSelectAll ? 'Loading...' : 'Select All Pages'}
                        </button>
                        
                        {totalSelected > 0 && (
                          <button
                            onClick={clearSelection}
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                          >
                            Clear Selection
                          </button>
                        )}
                      </div>

                      {/* Show category/subcategory product count */}
                      {(filterCategory !== "all" || filterSubcategory !== "all") && (
                        <div className="text-sm text-gray-600">
                          {categoryProductCount} product{categoryProductCount !== 1 ? 's' : ''} in{' '}
                          {filterSubcategory !== "all" 
                            ? subcategories.find(s => s._id === filterSubcategory)?.name
                            : categories.find(c => c._id === filterCategory)?.name}
                        </div>
                      )}
                    </div>

                    {/* Bulk Action Options - Only show when there are products selected */}
                    {totalSelected > 0 && (
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-blue-700">
                          {selectAllMode ? `${totalSelected} products selected` : `${totalSelected} product${totalSelected > 1 ? 's' : ''} selected`}
                        </div>
                        
                        {/* Change Status Dropdown */}
                        <div className="relative" ref={bulkStatusDropdownRef}>
                          <button
                            onClick={() => setShowBulkStatusDropdown(!showBulkStatusDropdown)}
                            disabled={bulkUpdating}
                            className="inline-flex items-center gap-1 px-4 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:bg-purple-400"
                          >
                            {bulkUpdating ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                Updating...
                              </>
                            ) : (
                              <>
                                <Tag size={14} /> Change Status <ChevronDown size={14} />
                              </>
                            )}
                          </button>
                          
                          {showBulkStatusDropdown && (
                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                              <div className="py-1">
                                <button
                                  onClick={() => handleBulkStatusUpdate('active')}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                                >
                                  <Play size={14} className="text-green-600" />
                                  Set Active
                                </button>
                                <button
                                  onClick={() => handleBulkStatusUpdate('inactive')}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                                >
                                  <Pause size={14} className="text-red-600" />
                                  Set Inactive
                                </button>
                                <button
                                  onClick={() => handleBulkStatusUpdate('onhold')}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-2"
                                >
                                  <EyeOff size={14} className="text-yellow-600" />
                                  Hide from Shop
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => setShowMoveModal(true)}
                          className="inline-flex items-center gap-1 px-4 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                        >
                          <MoveRight size={14} /> Move
                        </button>
                        <button
                          onClick={() => handleExport('selected')}
                          disabled={exporting}
                          className={`inline-flex items-center gap-1 px-4 py-1 text-white rounded-md text-sm ${
                            exporting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <Download size={14} /> {exporting ? 'Exporting...' : 'Export'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Move Products Modal */}
              <MoveProductsModal
                isOpen={showMoveModal}
                onClose={() => setShowMoveModal(false)}
                selectedCount={totalSelected}
                onMove={handleBulkMove}
              />

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Column Visibility and Export Buttons */}
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-3">
                      {/* Column Visibility Dropdown */}
                      <div className="relative" ref={columnDropdownRef}>
                        <button
                          onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors text-sm font-medium"
                        >
                          <Columns size={16} />
                          Column visibility
                        </button>
                        
                        {showColumnDropdown && (
                          <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-96 overflow-y-auto">
                            <div className="py-1">
                              {ALL_COLUMNS.map((column) => (
                                <button
                                  key={column.id}
                                  onClick={() => toggleColumn(column.id)}
                                  disabled={column.alwaysVisible}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                                    column.alwaysVisible 
                                      ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                                      : isColumnVisible(column.id)
                                        ? 'text-white bg-cyan-500 hover:bg-cyan-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  <span>{column.label}</span>
                                  {isColumnVisible(column.id) && (
                                    <Check size={16} className={column.alwaysVisible ? 'text-gray-400' : 'text-white'} />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Export Button */}
                      {/* <button
                        onClick={() => handleExport('page')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        <Download size={16} />
                        Export
                      </button> */}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-600">
                        Showing {products.length} of {categoryProductCount || products.length} products
                      </div>
                      
                      {/* Horizontal Scroll Navigation Arrows */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => scrollTable('left')}
                          disabled={!canScrollLeft}
                          className={`p-2 rounded-md transition-colors ${
                            canScrollLeft 
                              ? 'bg-blue-500 text-white hover:bg-blue-600' 
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          title="Scroll left"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={() => scrollTable('right')}
                          disabled={!canScrollRight}
                          className={`p-2 rounded-md transition-colors ${
                            canScrollRight 
                              ? 'bg-blue-500 text-white hover:bg-blue-600' 
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          title="Scroll right"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div ref={tableContainerRef} className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {isColumnVisible('select') && (
                          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={toggleSelectPage}
                                className={`inline-flex items-center rounded focus:outline-none ${
                                  isAllOnPageSelected ? 'text-lime-500 hover:text-lime-600' : 'text-gray-600 hover:text-gray-800'
                                }`}
                                title="Select/deselect current page"
                              >
                                {isAllOnPageSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                              </button>
                              {selectAllMode && (
                                <span className="text-xs text-blue-600 font-medium">ALL</span>
                              )}
                            </div>
                          </th>
                          )}
                          {isColumnVisible('product') && (
                          <th
                            scope="col"
                            className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Product
                          </th>
                          )}
                          {isColumnVisible('brand') && (
                          <th
                            scope="col"
                            className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Brand
                          </th>
                          )}
                          {isColumnVisible('parentCategory') && (
                          <th
                            scope="col"
                            className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                          >
                            Parent Category
                          </th>
                          )}
                          {isColumnVisible('level1') && (
                          <th
                            scope="col"
                            className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                          >
                            Level 1
                          </th>
                          )}
                          {isColumnVisible('level2') && (
                          <th
                            scope="col"
                            className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                          >
                            Level 2
                          </th>
                          )}
                          {isColumnVisible('level3') && (
                          <th
                            scope="col"
                            className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                          >
                            Level 3
                          </th>
                          )}
                          {isColumnVisible('level4') && (
                          <th
                            scope="col"
                            className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                          >
                            Level 4
                          </th>
                          )}
                          {isColumnVisible('price') && (
                          <th
                            scope="col"
                            className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                           Base Price
                          </th>
                          )}
                          {isColumnVisible('sku') && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            SKU
                          </th>
                          )}
                          {isColumnVisible('action') && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Action
                          </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.length > 0 ? (
                          products.map((product) => {
                            return (
                              <tr
                                key={product._id}
                                id={`product-row-${product._id}`}
                className={`hover:bg-gray-50 transition-colors ${
                                  justEditedId === product._id
                  ? "bg-lime-100 ring-2 ring-lime-500 animate-pulse"
                                    : ""
                                }`}
                              >
                                {isColumnVisible('select') && (
                                <td className="px-2 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => toggleSelectOne(product._id)}
                                    className={`${(selectAllMode || selectedIds.has(product._id)) ? 'text-lime-500 hover:text-lime-600' : 'text-gray-600 hover:text-gray-800'} rounded focus:outline-none`}
                                  >
                                    {(selectAllMode || selectedIds.has(product._id)) ? <CheckSquare size={16} /> : <Square size={16} />}
                                  </button>
                                </td>
                                )}
                                {isColumnVisible('product') && (
                                <td className="px-2 py-4 whitespace-nowrap">
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
                                )}
                                {isColumnVisible('brand') && (
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{product.brand?.name || 'N/A'}</div>
                                </td>
                                )}
                                {isColumnVisible('parentCategory') && (
                                <td className="px-1 py-4 whitespace-nowrap w-24">
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-800 truncate max-w-full" title={getParentCategoryName(product)}>
                                    {getParentCategoryName(product).substring(0, 6)}{getParentCategoryName(product).length > 6 ? '...' : ''}
                                  </span>
                                </td>
                                )}
                                {isColumnVisible('level1') && (
                                <td className="px-1 py-4 whitespace-nowrap w-24">
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 truncate max-w-full" title={product.category?.name || 'N/A'}>
                                    {(product.category?.name || 'N/A').substring(0, 6)}{(product.category?.name || 'N/A').length > 6 ? '...' : ''}
                                  </span>
                                </td>
                                )}
                                {isColumnVisible('level2') && (
                                <td className="px-1 py-4 whitespace-nowrap w-24">
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-50 text-purple-800 truncate max-w-full" title={product.subCategory2?.name || '-'}>
                                    {(product.subCategory2?.name || '-').substring(0, 6)}{(product.subCategory2?.name || '-').length > 6 ? '...' : ''}
                                  </span>
                                </td>
                                )}
                                {isColumnVisible('level3') && (
                                <td className="px-1 py-4 whitespace-nowrap w-24">
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-50 text-indigo-800 truncate max-w-full" title={product.subCategory3?.name || '-'}>
                                    {(product.subCategory3?.name || '-').substring(0, 6)}{(product.subCategory3?.name || '-').length > 6 ? '...' : ''}
                                  </span>
                                </td>
                                )}
                                {isColumnVisible('level4') && (
                                <td className="px-1 py-4 whitespace-nowrap w-24">
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-pink-50 text-pink-800 truncate max-w-full" title={product.subCategory4?.name || '-'}>
                                    {(product.subCategory4?.name || '-').substring(0, 6)}{(product.subCategory4?.name || '-').length > 6 ? '...' : ''}
                                  </span>
                                </td>
                                )}
                                {isColumnVisible('price') && (
                                <td className="px-1 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                                  {product.oldPrice && (
                                    <div className="text-xs text-gray-500 line-through">
                                      {formatPrice(product.oldPrice)}
                                    </div>
                                  )}
                                </td>
                                )}
                                {isColumnVisible('sku') && (
                                <td className="px-1 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 truncate" title={product.sku || 'N/A'}>
                                    {(product.sku || 'N/A').substring(0, 10)}{(product.sku || 'N/A').length > 10 ? '...' : ''}
                                  </div>
                                </td>
                                )}
                                {isColumnVisible('action') && (
                                <td className="px-1 py-3 whitespace-nowrap text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    {/* Quick Action Icons - 2 rows */}
                                    <div className="flex flex-col gap-1 mr-2">
                                      {/* Row 1: Status Icons */}
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleUpdateProductStatus(product._id, 'active')}
                                          className={`p-1 rounded hover:bg-green-100 transition-colors ${product.isActive && !product.onHold ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                                          title="Set Active"
                                        >
                                          <Eye size={15} />
                                        </button>
                                        <button
                                          onClick={() => handleUpdateProductStatus(product._id, 'inactive')}
                                          className={`p-1 rounded hover:bg-red-100 transition-colors ${!product.isActive && !product.onHold ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                                          title="Set Inactive"
                                        >
                                          <EyeOff size={15} />
                                        </button>
                                        <button
                                          onClick={() => handleUpdateProductStatus(product._id, 'onhold')}
                                          className={`p-1 rounded hover:bg-yellow-100 transition-colors ${product.onHold ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}`}
                                          title="Hide from Shop"
                                        >
                                          <Pause size={15} />
                                        </button>
                                        <button
                                          onClick={() => handleDelete(product._id)}
                                          className="p-1 rounded text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                      {/* Row 2: Other Actions */}
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleDuplicate(product._id)}
                                          className="p-1 rounded text-gray-400 hover:bg-green-100 hover:text-green-600 transition-colors"
                                          title="Duplicate"
                                        >
                                          <Copy size={15} />
                                        </button>
                                        <button
                                          onClick={() => exportProductsToExcel([product], `product_${product.sku || product._id}.xlsx`)}
                                          className="p-1 rounded text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                          title="Download"
                                        >
                                          <Download size={15} />
                                        </button>
                                        <button
                                          onClick={() => handleEdit(product)}
                                          className="p-1 rounded text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                          title="Edit"
                                        >
                                          <Edit size={15} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                )}
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={visibleColumns.length} className="px-6 py-4 text-center text-gray-500">
                              No products found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Bottom Horizontal Scroll Navigation Arrows */}
                  <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 mr-2">Scroll table:</span>
                      <button
                        onClick={() => scrollTable('left')}
                        disabled={!canScrollLeft}
                        className={`p-2 rounded-md transition-colors ${
                          canScrollLeft 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        title="Scroll left"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() => scrollTable('right')}
                        disabled={!canScrollRight}
                        className={`p-2 rounded-md transition-colors ${
                          canScrollRight 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        title="Scroll right"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 my-4">
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  {/* Windowed Pagination Logic */}
                  {(() => {
                    const pages = [];
                    // Always show first page
                    pages.push(
                      <button
                        key={1}
                        className={`px-3 py-1 border rounded ${page === 1 ? 'bg-blue-500 text-white' : ''}`}
                        onClick={() => setPage(1)}
                      >
                        1
                      </button>
                    );

                    // Determine window
                    let start = Math.max(2, page);
                    let end = Math.min(totalPages - 1, page + 2);

                    // If on first or second page, show 2 and 3
                    if (page === 1) {
                      start = 2;
                      end = Math.min(totalPages - 1, 3);
                    } else if (page === 2) {
                      start = 2;
                      end = Math.min(totalPages - 1, 4);
                    }
                    // If on last or near-last page, show last-2, last-1
                    if (page >= totalPages - 2) {
                      start = Math.max(2, totalPages - 2);
                      end = totalPages - 1;
                    }

                    // Add ellipsis if needed
                    if (start > 2) {
                      pages.push(
                        <span key="start-ellipsis" className="px-2">...</span>
                      );
                    }

                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <button
                          key={i}
                          className={`px-3 py-1 border rounded ${page === i ? 'bg-blue-500 text-white' : ''}`}
                          onClick={() => setPage(i)}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Add ellipsis if needed
                    if (end < totalPages - 1) {
                      pages.push(
                        <span key="end-ellipsis" className="px-2">...</span>
                      );
                    }

                    // Always show last page if more than 1
                    if (totalPages > 1) {
                      pages.push(
                        <button
                          key={totalPages}
                          className={`px-3 py-1 border rounded ${page === totalPages ? 'bg-blue-500 text-white' : ''}`}
                          onClick={() => setPage(totalPages)}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProducts
