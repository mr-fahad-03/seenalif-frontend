 
"use client"

import { useState, useEffect, useRef } from "react"
import { getOptimizedImageUrl } from "../utils/imageUtils"

import config from "../config/config"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { generateShopURL } from "../utils/urlUtils"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { useWishlist } from "../context/WishlistContext"
import { useLanguage } from "../context/LanguageContext"
import TranslatedText from "./TranslatedText"
import { preloadTranslations } from "../LanguageModel/translationService"
import {
  Search,
  Heart,
  User,
  ShoppingCart,
  Menu,
  X,
  Home,
  Grid3X3,
  UserCircle,
  HelpCircle,
  Package,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import axios from "axios"
import { getCategoryTreeCached } from "../services/categoryTreeCache"

const TOP_BAR_MESSAGES = [
  "Click and Collect",
  "Buy now Pay later",
  "Cash on delivery",
  "Free Delivery Above 200 AED",
]

// Recursive component for mobile subcategory rendering
const MobileSubCategoryItem = ({ 
  subCategory, 
  parentCategory, 
  level, 
  expandedId, 
  onToggle, 
  closeMobileMenu,
  parentChain = []
}) => {
  // Helper to get children of current subcategory
  const getChildSubCategories = (parentNodeId) => {
    const stack = []
    // Get all categories from window context (we'll pass this data)
    const categories = window.__navbarCategories || []
    for (const c of categories) {
      if (Array.isArray(c.children)) stack.push(...c.children)
    }
    const visited = new Set()
    while (stack.length) {
      const node = stack.pop()
      if (!node || visited.has(node._id)) continue
      visited.add(node._id)
      if (node._id === parentNodeId) {
        return Array.isArray(node.children) ? node.children : []
      }
      if (Array.isArray(node.children) && node.children.length) {
        stack.push(...node.children)
      }
    }
    return []
  }

  const nestedChildren = getChildSubCategories(subCategory._id)
  const hasNested = nestedChildren && nestedChildren.length > 0
  const isExpanded = Array.isArray(expandedId) ? expandedId.includes(subCategory._id) : expandedId === subCategory._id
  
  // Build the URL params based on level
  const buildUrlParams = () => {
    const params = { parentCategory: parentCategory.name }
    const chain = [...parentChain, subCategory.name]
    
    if (level === 1) params.subcategory = subCategory.name
    else if (level === 2) {
      params.subcategory = chain[0]
      params.subcategory2 = subCategory.name
    } else if (level === 3) {
      params.subcategory = chain[0]
      params.subcategory2 = chain[1]
      params.subcategory3 = subCategory.name
    } else if (level === 4) {
      params.subcategory = chain[0]
      params.subcategory2 = chain[1]
      params.subcategory3 = chain[2]
      params.subcategory4 = subCategory.name
    }
    
    return params
  }

  const textSizeClass = level === 1 ? 'text-sm' : level === 2 ? 'text-xs' : 'text-xs'
  const textColorClass = level === 1 ? 'text-red-600' : 'text-gray-700'
  
  // Visual hierarchy for arrow buttons based on level
  const getArrowButtonStyles = () => {
    switch(level) {
      case 1:
        return 'w-7 h-7 bg-[#505e4d] hover:bg-[#445241] shadow-sm text-white'
      case 2:
        return 'w-6 h-6 bg-[#505e4d] hover:bg-[#445241] shadow-sm text-white'
      case 3:
        return 'w-5 h-5 bg-[#505e4d] hover:bg-[#445241] text-white'
      default:
        return 'w-5 h-5 bg-[#505e4d] hover:bg-[#445241] text-white'
    }
  }
  
  const getArrowIconSize = () => {
    switch(level) {
      case 1:
        return 16
      case 2:
        return 14
      default:
        return 12
    }
  }

  return (
    <div className="space-y-1">
      <div className={`flex items-center justify-between py-2 px-2 ${textColorClass} bg-gray-50 hover:bg-gray-50 rounded-lg ${textSizeClass}`}>
        <Link
          to={generateShopURL(buildUrlParams())}
          className="flex-1"
          onClick={closeMobileMenu}
        >
          <strong><TranslatedText text={subCategory.name} sourceDoc={subCategory} fieldName="name" /></strong>
        </Link>
        {hasNested && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggle(subCategory._id)
            }}
            className={`ml-2 inline-flex items-center justify-center rounded-full text-white focus:outline-none focus:ring-2 focus:ring-[#505e4d] active:scale-95 transition ${getArrowButtonStyles()}`}
            aria-expanded={isExpanded}
            aria-controls={`mobile-subcat-${subCategory._id}`}
          >
            {isExpanded ? (
              <ChevronDown size={getArrowIconSize()} />
            ) : (
              <ChevronRight size={getArrowIconSize()} />
            )}
          </button>
        )}
      </div>

      {hasNested && isExpanded && (
        <div id={`mobile-subcat-${subCategory._id}`} className="ml-4 space-y-1 pb-2">
          {nestedChildren.map((nested) => (
            <MobileSubCategoryItem
              key={nested._id}
              subCategory={nested}
              parentCategory={parentCategory}
              level={level + 1}
              expandedId={expandedId}
              onToggle={onToggle}
              closeMobileMenu={closeMobileMenu}
              parentChain={[...parentChain, subCategory.name]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { cartCount } = useCart()
  const { wishlist } = useWishlist()
  const { currentLanguage, getLocalizedPath } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [topBarMessageIndex, setTopBarMessageIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchInputRef = useRef(null)
  const searchDropdownRef = useRef(null)
  const mobileSearchInputRef = useRef(null)
  const mobileSearchDropdownRef = useRef(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState([]) // now contains nested tree nodes: { _id, name, slug, children: [] }
  const [flatSubCategories, setFlatSubCategories] = useState([]) // keep for backward compatibility / other components
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [hoveredSubCategory1, setHoveredSubCategory1] = useState(null) // For Level 2
  const [hoveredSubCategory2, setHoveredSubCategory2] = useState(null) // For Level 3
  const [hoveredSubCategory3, setHoveredSubCategory3] = useState(null) // For Level 4
  const [isStaticCategoryHovered, setIsStaticCategoryHovered] = useState(false)
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null)
  const [expandedMobileSubCategories, setExpandedMobileSubCategories] = useState([])
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isDesktopCategoryDropdownOpen, setIsDesktopCategoryDropdownOpen] = useState(false)
  const [desktopCascadeIds, setDesktopCascadeIds] = useState([]) // [parentId, level1Id, level2Id, ...]
  const profileRef = useRef(null)
  const profileButtonRef = useRef(null)
  const desktopCategoryDropdownRef = useRef(null)
  const categoryScrollRef = useRef(null)
  const [categoryScrollState, setCategoryScrollState] = useState({
    canScrollPrev: false,
    canScrollNext: false,
  })
  // Timeout refs for delayed hover states
  const categoryTimeoutRef = useRef(null)
  const categoryOpenTimeoutRef = useRef(null)
  const subCategory1TimeoutRef = useRef(null)
  const subCategory2TimeoutRef = useRef(null)
  const subCategory3TimeoutRef = useRef(null)
  // Tiny in-memory cache to speed up repeated candidate lookups during typing
  const liveSearchCacheRef = useRef(new Map())
  // Direction states (simple midpoint rule: items left of screen center open right, else open left)
  const [level2Dir, setLevel2Dir] = useState('right')
  const [level3Dir, setLevel3Dir] = useState('right')
  const [level4Dir, setLevel4Dir] = useState('right')
  const [activeCategoryRect, setActiveCategoryRect] = useState(null)
  const megaContentRef = useRef(null)
  const [megaScrollState, setMegaScrollState] = useState({ canScrollLeft: false, canScrollRight: false })
  const MEGA_LABEL_LIMIT_CLASS = "whitespace-normal break-words //max-w-[23ch]"
  const CATEGORY_OPEN_DELAY = 220
  const CATEGORY_DROPDOWN_MARGIN = 16
  const CATEGORY_DROPDOWN_GAP = 6
  const MAX_CATEGORY_DROPDOWN_WIDTH = 1320

  const normalizePath = (path) => String(path || "").replace(/\/+$/, "")
  const isMobileNavActive = (targetPath) => {
    const currentPath = normalizePath(location.pathname)
    const localizedTarget = normalizePath(getLocalizedPath(targetPath))
    if (!localizedTarget) return false
    if (localizedTarget === normalizePath(getLocalizedPath("/"))) {
      return currentPath === localizedTarget
    }
    return currentPath === localizedTarget || currentPath.startsWith(`${localizedTarget}/`)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTopBarMessageIndex((prev) => (prev + 1) % TOP_BAR_MESSAGES.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // Decide direction based on available space rather than midpoint
  const MIN_PANEL_WIDTH = 260 // px (matches min-w[240] + padding/margins)
  const computeRightDir = (rect) => {
    if (!rect) return 'right'
    const rightSpace = window.innerWidth - rect.right
    const leftSpace = rect.left
    if (rightSpace >= MIN_PANEL_WIDTH) return 'right'
    if (leftSpace >= MIN_PANEL_WIDTH) return 'left'
    return rightSpace >= leftSpace ? 'right' : 'left'
  }
  const computeLeftDir = (rect) => {
    if (!rect) return 'left'
    const leftSpace = rect.left
    const rightSpace = window.innerWidth - rect.right
    if (leftSpace >= MIN_PANEL_WIDTH) return 'left'
    if (rightSpace >= MIN_PANEL_WIDTH) return 'right'
    return leftSpace >= rightSpace ? 'left' : 'right'
  }

  const getPanelStyle = (rect, direction, width = 280, estimatedHeight = 300) => {
    if (!rect) return {}
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1920
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 1080
    
    // Vertical positioning - align to the top of the parent item
    const style = {
      top: rect.top
    }
    
    // Horizontal positioning - position inline, right next to the arrow
    const spaceRight = viewportWidth - rect.right
    if (direction === 'right' || spaceRight >= width) {
      // Open to the right, inline with the arrow
      style.left = rect.right + 4 // Small 4px gap for visual separation
    } else {
      // Open to the left if no space on right
      style.right = viewportWidth - rect.left + 4
    }
    
    return style
  }

  const getCategoryDropdownStyle = (rect) => {
    if (!rect) return {}
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1920
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 1080
    
    // Calculate padding based on screen size (matching the slider container)
    let horizontalPadding = 16 // Default: px-4 (4 * 4 = 16px on each side)
    if (viewportWidth >= 1536) {
      horizontalPadding = 48 // 2xl:px-12 (12 * 4 = 48px)
    } else if (viewportWidth >= 1280) {
      horizontalPadding = 32 // xl:px-8 (8 * 4 = 32px)
    }
    
    // The navbar container has max-w-[1920px] and is centered
    const maxContainerWidth = 1920
    const containerWidth = Math.min(viewportWidth, maxContainerWidth)
    
    // Calculate centering offset when viewport is wider than max container
    const containerOffset = viewportWidth > maxContainerWidth 
      ? (viewportWidth - maxContainerWidth) / 2 
      : 0
    
    // Match the slider container width exactly (container width minus padding)
    const dropdownWidth = containerWidth - (horizontalPadding * 2)
    const dropdownLeft = containerOffset + horizontalPadding
    
    // Use rect.bottom to position below the category bar, ensuring no overlap
    const dropdownTop = rect.bottom + 2
    
    return {
      left: `${dropdownLeft}px`,
      top: `${dropdownTop}px`,
      width: `${dropdownWidth}px`,
      height: "400px",
    }
  }

  const resetMegaMenu = () => {
    setHoveredCategory(null)
    setHoveredSubCategory1(null)
    setHoveredSubCategory2(null)
    setHoveredSubCategory3(null)
    setActiveCategoryRect(null)
  }

  const updateMegaScrollState = () => {
    const el = megaContentRef.current
    if (!el) {
      setMegaScrollState({ canScrollLeft: false, canScrollRight: false })
      return
    }
    const { scrollLeft, clientWidth, scrollWidth } = el
    setMegaScrollState({
      canScrollLeft: scrollLeft > 8,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - 8,
    })
  }

  const handleMegaScroll = (direction) => {
    const el = megaContentRef.current
    if (!el) return
    const offset = direction === "left" ? -320 : 320
    el.scrollBy({ left: offset, behavior: "smooth" })
  }


  // Fetch categories and subcategories from API
  const fetchCategoryTree = async () => {
    try {
      const treeData = await getCategoryTreeCached()
      setCategories(treeData)
      // Store categories globally for mobile subcategory component
      if (typeof window !== 'undefined') {
        window.__navbarCategories = treeData
      }
      // Derive flat subcategories from tree to avoid an extra heavy /api/subcategories request.
      const derivedSubs = []
      const collectSubcategories = (nodes) => {
        if (!Array.isArray(nodes)) return
        for (const node of nodes) {
          if (node && node._id && node.name) derivedSubs.push(node)
          if (Array.isArray(node.children)) collectSubcategories(node.children)
        }
      }
      for (const category of treeData) {
        if (Array.isArray(category.children)) collectSubcategories(category.children)
      }
      setFlatSubCategories(derivedSubs)
      
      // Preload translations for all category and subcategory names when in Arabic mode
      if (currentLanguage.code === 'ar') {
        const allNames = []
        
        // Recursively collect all names from the tree
        const collectNames = (nodes) => {
          if (!Array.isArray(nodes)) return
          for (const node of nodes) {
            if (node.name) allNames.push(node.name)
            if (Array.isArray(node.children)) {
              collectNames(node.children)
            }
          }
        }
        
        collectNames(treeData)
        
        // Also add derived flat subcategories
        for (const sub of derivedSubs) {
          if (sub.name && !allNames.includes(sub.name)) {
            allNames.push(sub.name)
          }
        }
        
        if (allNames.length > 0) {
          console.log(`[Navbar] Preloading ${allNames.length} category/subcategory translations`)
          preloadTranslations(allNames, 'ar')
        }
      }
    } catch (error) {
      console.error("Error fetching category tree:", error)
    }
  }

  // Helpers now use tree structure
  const getSubCategoriesForCategory = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId)
    if (!cat || !Array.isArray(cat.children)) return []
    // Level 1 nodes: nodes with level === 1 OR no level property (import fallback)
    return cat.children.filter((n) => !n.level || n.level === 1)
  }

  const getChildSubCategories = (parentNodeId) => {
    // We need a lookup: flatten categories children recursively once (memoized by ref) OR derive by search each time for simplicity.
    // Simplicity approach: depth-first search for node id and return its children.
    const stack = []
    for (const c of categories) {
      if (Array.isArray(c.children)) stack.push(...c.children)
    }
    const visited = new Set()
    while (stack.length) {
      const node = stack.pop()
      if (!node || visited.has(node._id)) continue
      visited.add(node._id)
      if (node._id === parentNodeId) {
        return Array.isArray(node.children) ? node.children : []
      }
      if (Array.isArray(node.children) && node.children.length) {
        stack.push(...node.children)
      }
    }
    return []
  }

  const toggleMobileCategory = (categoryId) => {
    setExpandedMobileCategory((prev) => (prev === categoryId ? null : categoryId))
    setExpandedMobileSubCategories([])
  }

  const handleMobileSubCategoryToggle = (subCategoryId) => {
    setExpandedMobileSubCategories((prev) => {
      if (prev.includes(subCategoryId)) {
        // Remove this ID and all its children
        return prev.filter(id => id !== subCategoryId)
      } else {
        // Add this ID to the array
        return [...prev, subCategoryId]
      }
    })
  }

  // Function to check if search query matches a product's SKU (or name) exactly
  const findExactProductMatch = async (query) => {
    if (!query || query.trim().length === 0) return null

    const normalized = query.trim().toLowerCase()
    try {
      // 1) Try exact SKU lookup via dedicated endpoint (more reliable than fuzzy search)
      const skuCandidates = Array.from(
        new Set([query.trim(), query.trim().toUpperCase(), query.trim().toLowerCase()]),
      )
      try {
        const skuResp = await axios.post(`${config.API_URL}/api/products/by-skus`, { skus: skuCandidates })
        if (Array.isArray(skuResp.data) && skuResp.data.length > 0) {
          // Prefer exact case-insensitive match if multiple
          const exactSku = skuResp.data.find(
            (p) => p.sku && String(p.sku).trim().toLowerCase() === normalized,
          )
          return exactSku || skuResp.data[0]
        }
      } catch (e) {
        // ignore and fall back to search
      }

      // 2) Fallback to existing search endpoint and scan results
      const { data } = await axios.get(
        `${config.API_URL}/api/products?search=${encodeURIComponent(query.trim())}&limit=50`,
      )

      // First, try exact SKU match (case-insensitive)
      const exactSkuMatch = data.find(
        (product) => product.sku && String(product.sku).trim().toLowerCase() === normalized,
      )
      if (exactSkuMatch) return exactSkuMatch

      // Fallback: exact name match (to preserve prior behavior)
      const exactNameMatch = data.find(
        (product) => product.name && String(product.name).trim().toLowerCase() === normalized,
      )
      return exactNameMatch || null
    } catch (error) {
      console.error("Error finding exact product match:", error)
      return null
    }
  }

  // Instant search effect with progressive fallback (words → characters)
  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length === 0) {
      setSearchResults([])
      setShowSearchDropdown(false)
      setSearchLoading(false)
      return
    }

    let cancelled = false
    setSearchLoading(true)

    // Build candidate queries: full, then drop trailing words, then drop trailing characters
    const buildCandidates = (input) => {
      const unique = new Set()
      const out = []
      const push = (s) => {
        const v = s.trim()
        if (v && !unique.has(v)) {
          unique.add(v)
          out.push(v)
        }
      }

      push(input)
      const words = input.split(/\s+/)
      // Word-prefix candidates (drop last word progressively)
      for (let i = words.length - 1; i >= 1; i--) {
        push(words.slice(0, i).join(" "))
        if (out.length >= 4) break
      }
      // Character-prefix candidates (strategic trims instead of letter-by-letter for speed)
      const base = words[0]
      if (base && base.length > 3) {
        const p70 = base.slice(0, Math.max(3, Math.floor(base.length * 0.7)))
        const p50 = base.slice(0, Math.max(3, Math.floor(base.length * 0.5)))
        push(p70)
        push(p50)
      }
      return out
    }

    const fetchResults = async () => {
      try {
        const candidates = buildCandidates(q)
        for (const cand of candidates) {
          try {
            // 1) Check tiny in-memory cache first
            const cached = liveSearchCacheRef.current.get(cand)
            if (cached) {
              if (!cancelled) {
                if (Array.isArray(cached) && cached.length > 0) {
                  setSearchResults(cached)
                  setShowSearchDropdown(true)
                  return
                }
              }
            }

            // 2) Fallback to API
            const { data } = await axios.get(`${config.API_URL}/api/products?search=${encodeURIComponent(cand)}&limit=5`)
            if (cancelled) return
            // Cache result (including empty) to speed up subsequent key strokes
            liveSearchCacheRef.current.set(cand, Array.isArray(data) ? data : [])
            // Simple cache pruning
            if (liveSearchCacheRef.current.size > 100) {
              liveSearchCacheRef.current.clear()
            }

            if (Array.isArray(data) && data.length > 0) {
              setSearchResults(data)
              setShowSearchDropdown(true)
              return
            }
          } catch (_) {
            // ignore and try next candidate
          }
        }
        // No candidates found
        setSearchResults([])
        setShowSearchDropdown(false)
      } finally {
        if (!cancelled) setSearchLoading(false)
      }
    }

    const timeout = setTimeout(fetchResults, 180)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [searchQuery])

  // Hide dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      const clickedInside =
        (searchDropdownRef.current && searchDropdownRef.current.contains(e.target)) ||
        (searchInputRef.current && searchInputRef.current.contains(e.target)) ||
        (mobileSearchDropdownRef.current && mobileSearchDropdownRef.current.contains(e.target)) ||
        (mobileSearchInputRef.current && mobileSearchInputRef.current.contains(e.target))

      if (!clickedInside) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    fetchCategoryTree()
  }, [])

  // Preload translations when language changes to Arabic (if categories already loaded)
  useEffect(() => {
    if (currentLanguage.code === 'ar' && categories.length > 0) {
      const allNames = []
      
      // Recursively collect all names from the tree
      const collectNames = (nodes) => {
        if (!Array.isArray(nodes)) return
        for (const node of nodes) {
          if (node.name) allNames.push(node.name)
          if (Array.isArray(node.children)) {
            collectNames(node.children)
          }
        }
      }
      
      collectNames(categories)
      
      // Also add flat subcategories
      for (const sub of flatSubCategories) {
        if (sub.name && !allNames.includes(sub.name)) {
          allNames.push(sub.name)
        }
      }
      
      if (allNames.length > 0) {
        console.log(`[Navbar] Language changed to Arabic - preloading ${allNames.length} translations`)
        preloadTranslations(allNames, 'ar')
      }
    }
  }, [currentLanguage.code, categories, flatSubCategories])

  useEffect(() => {
    if (!hoveredCategory) {
      setMegaScrollState({ canScrollLeft: false, canScrollRight: false })
      return
    }

    const handleResize = () => updateMegaScrollState()
    const rafId = requestAnimationFrame(updateMegaScrollState)

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", handleResize)
    }
  }, [hoveredCategory])

  const updateCategoryScrollState = () => {
    const el = categoryScrollRef.current
    if (!el) return

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth)
    const epsilon = 2
    const canScrollPrev = el.scrollLeft > epsilon
    const canScrollNext = el.scrollLeft < maxScrollLeft - epsilon

    setCategoryScrollState((prev) => {
      if (prev.canScrollPrev === canScrollPrev && prev.canScrollNext === canScrollNext) return prev
      return { canScrollPrev, canScrollNext }
    })
  }

  useEffect(() => {
    updateCategoryScrollState()

    const el = categoryScrollRef.current
    if (!el) return

    let ro
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateCategoryScrollState())
      ro.observe(el)
    }

    window.addEventListener("resize", updateCategoryScrollState)
    const rafId = requestAnimationFrame(updateCategoryScrollState)

    return () => {
      if (ro) ro.disconnect()
      window.removeEventListener("resize", updateCategoryScrollState)
      cancelAnimationFrame(rafId)
    }
  }, [categories])

  // Close profile dropdown on outside click (desktop only)
  useEffect(() => {
    if (!isProfileOpen) return
    function handleProfileClick(e) {
      // Only run on md+ screens
      if (window.innerWidth < 768) return
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target)
      ) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleProfileClick)
    return () => document.removeEventListener("mousedown", handleProfileClick)
  }, [isProfileOpen])

  // Close desktop category dropdown on outside click
  useEffect(() => {
    if (!isDesktopCategoryDropdownOpen) return
    function handleCategoryClick(e) {
      if (window.innerWidth < 768) return
      if (desktopCategoryDropdownRef.current && !desktopCategoryDropdownRef.current.contains(e.target)) {
        setIsDesktopCategoryDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleCategoryClick)
    return () => document.removeEventListener("mousedown", handleCategoryClick)
  }, [isDesktopCategoryDropdownOpen])

  // Cleanup hover timeouts on unmount
  useEffect(() => {
    return () => {
      if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current)
      if (categoryOpenTimeoutRef.current) clearTimeout(categoryOpenTimeoutRef.current)
      if (subCategory1TimeoutRef.current) clearTimeout(subCategory1TimeoutRef.current)
      if (subCategory2TimeoutRef.current) clearTimeout(subCategory2TimeoutRef.current)
      if (subCategory3TimeoutRef.current) clearTimeout(subCategory3TimeoutRef.current)
    }
  }, [])

  // Check if current path is an admin route
  const isAdminRoute = location.pathname.startsWith("/admin")

  // Don't render navbar for admin routes
  if (isAdminRoute) {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsProfileOpen(false)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // First, check if the search query matches a product exactly
      const exactMatch = await findExactProductMatch(searchQuery.trim())

      if (exactMatch) {
        // Navigate to product details page
        navigate(getLocalizedPath(`/product/${encodeURIComponent(exactMatch.slug || exactMatch._id)}`))
        setShowSearchDropdown(false)
        setSearchQuery("")
      } else {
        // Navigate to shop page with search results
        navigate(getLocalizedPath(`/shop?search=${encodeURIComponent(searchQuery.trim())}`))
        setShowSearchDropdown(false)
      }
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setExpandedMobileCategory(null) // Reset expanded category when menu closes
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setExpandedMobileCategory(null)
  }

  const toggleDesktopCategoryDropdown = () => {
    setIsDesktopCategoryDropdownOpen((prev) => {
      const next = !prev
      if (next) setDesktopCascadeIds(categories.length ? [categories[0]._id] : [])
      return next
    })
  }

  const closeDesktopCategoryDropdown = () => {
    setIsDesktopCategoryDropdownOpen(false)
    setDesktopCascadeIds([])
  }

  const findCategoryNodeById = (nodeId) => {
    if (!nodeId) return null

    const stack = [...categories]
    const visited = new Set()

    while (stack.length) {
      const node = stack.pop()
      if (!node || visited.has(node._id)) continue
      visited.add(node._id)

      if (node._id === nodeId) return node
      if (Array.isArray(node.children) && node.children.length) {
        stack.push(...node.children)
      }
    }

    return null
  }

  const buildDesktopCategoryParams = (parentName, chain = []) => {
    const params = { parentCategory: parentName }
    if (chain[0]) params.subcategory = chain[0]
    if (chain[1]) params.subcategory2 = chain[1]
    if (chain[2]) params.subcategory3 = chain[2]
    if (chain[3]) params.subcategory4 = chain[3]
    return params
  }

  const handleMobileSearchOpen = () => {
    setIsMobileSearchOpen(true)
  }
  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false)
  }

  const scrollPrev = () => {
    if (!categoryScrollState.canScrollPrev) return
    const el = categoryScrollRef.current
    if (!el) return
    const amount = Math.max(180, Math.round(el.clientWidth * 0.7))
    el.scrollBy({ left: -amount, behavior: "smooth" })
    resetMegaMenu()
    requestAnimationFrame(updateCategoryScrollState)
  }

  const scrollNext = () => {
    if (!categoryScrollState.canScrollNext) return
    const el = categoryScrollRef.current
    if (!el) return
    const amount = Math.max(180, Math.round(el.clientWidth * 0.7))
    el.scrollBy({ left: amount, behavior: "smooth" })
    resetMegaMenu()
    requestAnimationFrame(updateCategoryScrollState)
  }

  return (
    <>
      {/* Desktop Navbar - Hidden on Mobile */}
      <header className="hidden md:block bg-white shadow-sm sticky top-0 z-50 w-full">
        <div className="bg-[#505e4d] text-white">
          <div className="mx-auto flex h-8 max-w-[1920px] items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <span className="whitespace-nowrap text-[14px] font-medium">
              {TOP_BAR_MESSAGES[topBarMessageIndex]}
            </span>
          </div>
        </div>
        <div className="w-full max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3">
            {/* Logo */}
            <Link to={getLocalizedPath("/")} className="flex shrink-0 items-center space-x-2">
              <div className="w-36 xl:w-40 2xl:w-44 h-auto flex items-center justify-center">
                <img src="/seenalif.webp" alt="Logo" width="180" height="30" className="w-full h-full object-contain" />
              </div>
            </Link>

            {/* Category Toggle + Desktop Multi-Level Dropdown */}
            <div className="hidden lg:flex w-32 xl:w-40 shrink-0 items-center justify-center" ref={desktopCategoryDropdownRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleDesktopCategoryDropdown}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  aria-haspopup="menu"
                  aria-expanded={isDesktopCategoryDropdownOpen}
                >
                  <TranslatedText>Category</TranslatedText>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDesktopCategoryDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDesktopCategoryDropdownOpen && (
                  <div className="absolute left-0 top-full z-40 mt-2 rounded-lg border border-gray-200 bg-white shadow-2xl">
                    <div className="flex max-h-[420px] min-w-[980px] overflow-x-auto overflow-y-hidden">
                      <div className="w-52 shrink-0 border-r border-gray-200 bg-gray-50">
                        <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <TranslatedText>All Category</TranslatedText>
                        </div>
                        <div className="max-h-[380px] space-y-1 overflow-y-auto p-2">
                          {categories.map((parentCategory) => {
                            const isActive = desktopCascadeIds[0] === parentCategory._id
                            return (
                              <Link
                                key={parentCategory._id}
                                to={generateShopURL({ parentCategory: parentCategory.name })}
                                onMouseEnter={() => setDesktopCascadeIds([parentCategory._id])}
                                onClick={closeDesktopCategoryDropdown}
                                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                                  isActive ? "bg-[#505e4d] text-white" : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                <span className="whitespace-normal break-words pr-2">
                                  <TranslatedText text={parentCategory.name} sourceDoc={parentCategory} fieldName="name" />
                                </span>
                                <ChevronRight className="h-4 w-4 shrink-0" />
                              </Link>
                            )
                          })}
                        </div>
                      </div>

                      {[1, 2, 3, 4].map((levelIndex) => {
                        const activeParentId = desktopCascadeIds[0] || categories[0]?._id
                        const activeParent = categories.find((c) => c._id === activeParentId)
                        if (!activeParent) return null

                        const items =
                          levelIndex === 1
                            ? getSubCategoriesForCategory(activeParent._id)
                            : getChildSubCategories(desktopCascadeIds[levelIndex - 1])

                        if (!Array.isArray(items) || items.length === 0) return null

                        return (
                          <div key={`desktop-level-${levelIndex}`} className="w-52 shrink-0 border-r border-gray-100 last:border-r-0">
                            <div className="max-h-[420px] space-y-1 overflow-y-auto p-2">
                              {items.map((item) => {
                                const hasChildren = getChildSubCategories(item._id).length > 0
                                const isActive = desktopCascadeIds[levelIndex] === item._id
                                const chainPrefix = desktopCascadeIds
                                  .slice(1, levelIndex)
                                  .map((id) => findCategoryNodeById(id)?.name)
                                  .filter(Boolean)
                                const params = buildDesktopCategoryParams(activeParent.name, [...chainPrefix, item.name])

                                return (
                                  <Link
                                    key={item._id}
                                    to={generateShopURL(params)}
                                    onMouseEnter={() => {
                                      setDesktopCascadeIds((prev) => {
                                        const next = prev.slice(0, levelIndex)
                                        next[0] = activeParent._id
                                        next[levelIndex] = item._id
                                        return next
                                      })
                                    }}
                                    onClick={closeDesktopCategoryDropdown}
                                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                                      isActive ? "bg-[#505e4d] text-white" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                  >
                                    <span className="whitespace-normal break-words pr-2">
                                      <TranslatedText text={item.name} sourceDoc={item} fieldName="name" />
                                    </span>
                                    {hasChildren && <ChevronRight className="h-4 w-4 shrink-0" />}
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 min-w-0 px-1 xl:px-2">
              <form onSubmit={handleSearch} className="relative mx-auto w-full max-w-[360px] lg:max-w-[430px] xl:max-w-[520px] 2xl:max-w-[620px]">
                <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2.5">
                  <Search className="h-5 w-5 text-gray-600" />
                  <input
                    type="text"
                    placeholder={currentLanguage.code === "ar" ? "Search" : "Search Products"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent pl-2 text-sm text-gray-700 placeholder-gray-500 outline-none"
                    ref={searchInputRef}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchDropdown(true)
                    }}
                  />
                  <button type="submit" className="sr-only" aria-label="Search products" />
                </div>

                {searchLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="h-4 w-4 animate-spin text-[#505e4d]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  </span>
                )}

                {/* Autocomplete Dropdown */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div
                    ref={searchDropdownRef}
                    className="absolute left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto rounded border border-gray-200 bg-white shadow-lg"
                  >
                    {searchResults.map((product) => (
                      <Link
                        key={product._id}
                        to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)}
                        className="flex items-start gap-4 border-b px-4 py-3 hover:bg-gray-50 last:border-b-0"
                        onClick={() => setShowSearchDropdown(false)}
                      >
                        <img
                          src={getOptimizedImageUrl(product.image, { width: 128, height: 128 }) || "/placeholder.svg"}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          width="64"
                          height="64"
                          className="h-16 w-16 rounded object-contain"
                        />
                        <div className="flex-1">
                          <div className="line-clamp-2 text-sm font-semibold text-gray-900">
                            <TranslatedText text={product.name} sourceDoc={product} fieldName="name" />
                          </div>
                          <div className="line-clamp-2 text-xs text-gray-500">
                            <TranslatedText text={product.description} sourceDoc={product} fieldName="description" />
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      to={getLocalizedPath(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)}
                      className="block py-2 text-center text-sm font-medium text-[#505e4d] hover:underline"
                      onClick={() => setShowSearchDropdown(false)}
                    >
                      View all results
                    </Link>
                  </div>
                )}
              </form>
            </div>

            {/* Icons + Labels */}
            <div className="hidden md:flex shrink-0 items-end">
              <Link to={getLocalizedPath("/wishlist")} className="relative flex flex-col items-center text-xs text-gray-600 hover:text-[#505e4d] px-3 xl:px-4 border-l border-gray-200" aria-label="Wishlist">
                <span className="relative inline-flex">
                  <Heart className="h-4 w-4 text-gray-700" />
                  {wishlist.length > 0 && (
                    <span className="pointer-events-none absolute -right-2 -top-2 rounded-full bg-red-500 px-1 text-[10px] font-bold text-white h-4 min-w-4 flex items-center justify-center leading-none">
                      {wishlist.length}
                    </span>
                  )}
                </span>
                <span className="mt-1">Wishlist</span>
              </Link>

              <Link to={getLocalizedPath("/cart")} className="relative flex flex-col items-center text-xs text-gray-600 hover:text-[#505e4d] px-3 xl:px-4 border-l border-gray-200" aria-label="My cart">
                <span className="relative inline-flex">
                  <ShoppingCart className="h-4 w-4 text-gray-700" />
                  {cartCount > 0 && (
                    <span className="pointer-events-none absolute -right-2 -top-2 rounded-full bg-red-500 px-1 text-[10px] font-bold text-white h-4 min-w-4 flex items-center justify-center leading-none">
                      {cartCount}
                    </span>
                  )}
                </span>
                <span className="mt-1">My Cart</span>
              </Link>

              <div className="relative px-4 border-l border-gray-200">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex flex-col items-center text-xs text-gray-600 hover:text-[#505e4d]"
                    ref={profileButtonRef}
                    aria-label="My account"
                  >
                    <User className="h-4 w-4 text-gray-700" />
                    <span className="mt-1 whitespace-nowrap">My Account</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center text-xs text-gray-600" aria-label="Register or login">
                    <User className="h-4 w-4 text-gray-700" />
                    <div className="mt-1 whitespace-nowrap">
                      <Link to={getLocalizedPath("/register")} className="hover:text-[#505e4d]">
                        Register
                      </Link>
                      <span className="px-1 text-gray-400">/</span>
                      <Link to={getLocalizedPath("/login")} className="hover:text-[#505e4d]">
                        Login
                      </Link>
                    </div>
                  </div>
                )}

                {isAuthenticated && isProfileOpen && (
                  <div
                    ref={profileRef}
                    className="absolute right-0 z-20 mt-2 w-48 rounded-md border bg-white py-2 shadow-xl"
                  >
                    <Link
                      to={getLocalizedPath("/profile")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to={getLocalizedPath("/orders")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      to={getLocalizedPath("/track-order")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Track Order
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navbar - Shown only on Mobile */}
      <header className="md:hidden bg-white shadow-sm sticky top-0 z-50">
        {/* Mobile Top Bar */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Hamburger Menu */}
          <button onClick={toggleMobileMenu} className="p-2">
            <Menu size={24} className="text-gray-700" />
          </button>

          {/* Logo */}
          <Link to={getLocalizedPath("/")} className="flex items-center">
            <img src="/seenalif.webp" alt="Logo" width="180" height="30" className="h-7 w-auto object-contain" />
          </Link>

          {/* Search Icon */}
          <button className="p-2" onClick={handleMobileSearchOpen} aria-label="Open search">
            <Search size={24} className="text-gray-700" />
          </button>
        </div>
      </header>




      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50">
          <div className="w-full bg-white p-4 shadow-md relative">
            <div className="flex items-center gap-2">
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (searchQuery.trim()) {
                    // Check for exact match on mobile too
                    const exactMatch = await findExactProductMatch(searchQuery.trim())

                    if (exactMatch) {
                      navigate(getLocalizedPath(`/product/${encodeURIComponent(exactMatch.slug || exactMatch._id)}`))
                      setSearchQuery("")
                    } else {
                      navigate(getLocalizedPath(`/shop?search=${encodeURIComponent(searchQuery.trim())}`))
                    }

                    setShowSearchDropdown(false)
                    handleMobileSearchClose()
                  }
                }}
                className="flex-1 relative"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={currentLanguage.code === "ar" ? "Search products..." : "Search products..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-300"
                    autoFocus
                    ref={mobileSearchInputRef}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchDropdown(true)
                    }}
                  />
                  {/* Loading spinner */}
                  {searchLoading && (
                    <span className="absolute right-16 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="animate-spin h-5 w-5 text-lime-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    </span>
                  )}
                  <button type="submit" className="px-4 py-2 bg-[#505e4d] text-white rounded hover:bg-[#445241] transition-colors">
                    <Search size={18} className="text-white" />
                  </button>
                </div>
                {/* Mobile Autocomplete Dropdown */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div
                    ref={mobileSearchDropdownRef}
                    className="absolute left-0 right-0 bg-white border border-gray-200 shadow-lg rounded z-50 mt-2 max-h-96 overflow-y-auto overflow-x-hidden"
                  >
                    {searchResults.map((product) => (
                      <Link
                        key={product._id}
                        to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                        onClick={() => {
                          setShowSearchDropdown(false)
                          handleMobileSearchClose()
                        }}
                      >
                        <img
                          src={getOptimizedImageUrl(product.image, { width: 96, height: 96 }) || "/placeholder.svg"}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          width="48"
                          height="48"
                          className="w-12 h-12 object-contain rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm break-words"><TranslatedText text={product.name} /></div>
                          <div className="text-xs text-gray-500 break-words line-clamp-2"><TranslatedText text={product.description} /></div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      to={getLocalizedPath(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)}
                      className="block text-center text-lime-600 hover:underline py-2 text-sm font-medium"
                      onClick={() => {
                        setShowSearchDropdown(false)
                        handleMobileSearchClose()
                      }}
                    >
                      <TranslatedText>View all results</TranslatedText>
                    </Link>
                  </div>
                )}
              </form>
              <button onClick={handleMobileSearchClose} className="ml-2 p-2" aria-label="Close search">
                <X size={24} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Side Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu}></div>

          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 bg-[#505e4d] text-white">
              <div className="flex items-center">
                <UserCircle size={24} className="text-white mr-2" />
                {isAuthenticated ? (
                  <span className="text-white">{`Hello, ${user?.name || "User"}`}</span>
                ) : (
                  <button
                    onClick={() => {
                      closeMobileMenu()
                      navigate(getLocalizedPath('/login'))
                    }}
                    className="text-white font-medium hover:text-white/80 transition-colors"
                  >
                    Hello, <span className="underline"><TranslatedText>Sign in</TranslatedText></span>
                  </button>
                )}
              </div>
              <button onClick={closeMobileMenu} className="p-1">
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4">
              {/* Quick Actions */}
              <div className="mb-6">
                <Link
                  to={getLocalizedPath("/orders")}
                  className="flex items-center py-3 text-gray-700 bg-gray-50 hover:bg-gray-50 rounded-lg px-2"
                  onClick={closeMobileMenu}
                >
                  <Package size={20} className="mr-3" />
                  <strong><TranslatedText>My Orders</TranslatedText></strong>
                </Link>
                <Link
                  to={getLocalizedPath("/help")}
                  className="flex items-center py-3 text-gray-700 bg-gray-50 hover:bg-gray-50 rounded-lg px-2"
                  onClick={closeMobileMenu}
                >
                  <HelpCircle size={20} className="mr-3" />
                  <strong><TranslatedText>Help Center</TranslatedText></strong>
                </Link>
                <Link
                  to={getLocalizedPath("/track-order")}
                  className="flex items-center py-3 text-gray-700 bg-gray-50 hover:bg-gray-50 rounded-lg px-2"
                  onClick={closeMobileMenu}
                >
                  <Search size={20} className="mr-3" />
                  <strong><TranslatedText>Track Order</TranslatedText></strong>
                </Link>
                {/* <a
                  href="https://crownexcel.ae"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center py-3 text-gray-700 bg-gray-50 hover:bg-gray-50 rounded-lg px-2"
                  onClick={closeMobileMenu}
                >
                  <Grid3X3 size={20} className="mr-3" />
                  <strong>CROWNYX</strong>
                </a> */}
              </div>

              {/* Shop by Category */}
              <div>
                <div className="flex items-center justify-between mb-4 bg-[#505e4d] text-white rounded px-3 py-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                    <Grid3X3 size={18} className="text-white" />
                    <TranslatedText>All Category</TranslatedText>
                  </h3>
                  <Link to={getLocalizedPath("/shop")} className="text-sm text-white hover:text-white/80" onClick={closeMobileMenu}>
                    <TranslatedText>See All</TranslatedText>
                  </Link>
                </div>

                {/* Dynamic Categories List for Mobile */}
                <div className="space-y-2">
                  {/* All In One */}
                  {/* <Link
                    to="/shop"
                    className="flex items-center justify-between py-3 px-2 text-gray-700 bg-gray-50 hover:bg-gray-50 rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    <div className="flex items-center">
                      <Grid3X3 size={16} className="mr-3" />
                      <span>All Categories</span>
                    </div>
                    <span className="text-gray-400 text-2xl font-bold">›</span>
                  </Link> */}

                  {/* Dynamic Categories with Click-to-Expand */}
                  {categories.map((parentCategory) => {
                    const categorySubCategories = getSubCategoriesForCategory(parentCategory._id)
                    const isExpanded = expandedMobileCategory === parentCategory._id

                    return (
                      <div key={parentCategory._id}>
                        {/* Parent Category Item */}
                        <div className="flex items-center justify-between py-3 px-2 text-gray-700 bg-gray-50 hover:bg-gray-50 rounded-lg">
                          <Link
                            to={generateShopURL({ parentCategory: parentCategory.name })}
                            className="flex items-center flex-1"
                            onClick={closeMobileMenu}
                          >
                            <strong><TranslatedText text={parentCategory.name} /></strong>
                          </Link>

                          {/* Toggle button for subcategories */}
                          {categorySubCategories.length > 0 ? (
                            <button
                              onClick={() => toggleMobileCategory(parentCategory._id)}
                              aria-label={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                              aria-expanded={isExpanded}
                              className="ml-2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#505e4d] text-white shadow-sm hover:bg-[#445241] active:scale-95 transition"
                            >
                              {isExpanded ? (
                                <ChevronDown size={20} className="text-white" />
                              ) : (
                                <ChevronRight size={20} className="text-white" />
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-2xl font-bold">›</span>
                          )}
                        </div>

                        {/* Subcategories - Only show when expanded */}
                        {isExpanded && categorySubCategories.length > 0 && (
                          <div className="ml-4 space-y-1 pb-2">
                            {categorySubCategories.map((subCategory) => {
                              return (
                                <MobileSubCategoryItem
                                  key={subCategory._id}
                                  subCategory={subCategory}
                                  parentCategory={parentCategory}
                                  level={1}
                                  expandedId={expandedMobileSubCategories}
                                  onToggle={handleMobileSubCategoryToggle}
                                  closeMobileMenu={closeMobileMenu}
                                />
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Static Category - Gaming Zone */}
                  <div className="flex items-center justify-between py-3 px-2 text-gray-700 bg-gray-50 hover:bg-gray-50 rounded-lg">
                    <a
                      href={getLocalizedPath("/gaming-zone")}
                      className="flex items-center flex-1"
                      onClick={closeMobileMenu}
                    >
                      <strong><TranslatedText>Gaming Zone</TranslatedText></strong>
                    </a>
                    {/* <span className="text-gray-400 text-2xl font-bold">›</span> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around py-2">
          {/* Home */}
          <Link
            to={getLocalizedPath("/")}
            className={`flex flex-col items-center py-2 px-4 ${isMobileNavActive("/") ? "text-[#505e4d]" : "text-gray-600"} hover:text-[#505e4d]`}
          >
            <Home size={20} />
            <span className="text-xs mt-1"><TranslatedText>Home</TranslatedText></span>
          </Link>

          {/* Cart */}
          <Link
            to={getLocalizedPath("/cart")}
            className={`flex flex-col items-center py-2 px-4 relative ${isMobileNavActive("/cart") ? "text-[#505e4d]" : "text-gray-600"} hover:text-[#505e4d]`}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
            <span className="text-xs mt-1"><TranslatedText>Cart</TranslatedText></span>
          </Link>

          {/* Wishlist */}
          <Link
            to={getLocalizedPath("/wishlist")}
            className={`flex flex-col items-center py-2 px-4 relative ${isMobileNavActive("/wishlist") ? "text-[#505e4d]" : "text-gray-600"} hover:text-[#505e4d]`}
            aria-label="Wishlist"
          >
            <Heart size={20} className="" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
            <span className="text-xs mt-1"><TranslatedText>WishList</TranslatedText></span>
          </Link>

          {/* Account */}
          {isAuthenticated ? (
            <Link
              to={getLocalizedPath("/profile")}
              className={`flex flex-col items-center py-2 px-4 ${isMobileNavActive("/profile") ? "text-[#505e4d]" : "text-gray-600"} hover:text-[#505e4d]`}
            >
              <UserCircle size={20} />
              <span className="text-xs mt-1"><TranslatedText>Account</TranslatedText></span>
            </Link>
          ) : (
            <div className="flex flex-col items-center py-2 px-2 text-gray-600">
              <UserCircle size={20} />
              <div className="mt-1 flex items-center text-[11px] leading-none">
                <Link to={getLocalizedPath("/register")} className="hover:text-[#505e4d]">
                  Register
                </Link>
                <span className="mx-1 text-gray-400">/</span>
                <Link to={getLocalizedPath("/login")} className="hover:text-[#505e4d]">
                  Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}

export default Navbar


