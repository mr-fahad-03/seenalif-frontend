"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, Menu, X, ShoppingBag, LayoutGrid, ChevronRight } from "lucide-react"
import config from "../config/config"
import { useLanguage } from "../context/LanguageContext"

const API_BASE_URL = `${config.API_URL}`

const Header = () => {
  const { getLocalizedPath } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [visibleCount, setVisibleCount] = useState(null) // number of categories (excluding "All in one") visible in the centered row
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [showLogo, setShowLogo] = useState(true)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  const navListRef = useRef(null)
  const allInOneRef = useRef(null)
  const moreBtnRef = useRef(null)
  const itemRefs = useRef([]) // per-category refs for measuring widths
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  // Ensure refs array length matches categories
  useEffect(() => {
    itemRefs.current = categories.map((_, i) => itemRefs.current[i] || null)
  }, [categories])

  const fetchCategories = async () => {
    try {
      // Fetch all published blogs to determine which categories are used
      const blogsResponse = await fetch(`${API_BASE_URL}/api/blogs?status=published`)
      const blogsData = await blogsResponse.json()
      const blogs = blogsData.blogs || blogsData || []
      
      // Group blogs by category ID and get a random blog slug for each
      const categoryBlogs = {}
      blogs.forEach(blog => {
        // Get the deepest category (priority: blogCategory > subCategory4 > 3 > 2 > 1 > mainCategory)
        const categoryId = blog.blogCategory?._id || blog.subCategory4?._id || blog.subCategory3?._id || 
                          blog.subCategory2?._id || blog.subCategory1?._id || 
                          blog.mainCategory?._id
        if (categoryId && blog.slug) {
          if (!categoryBlogs[categoryId]) {
            categoryBlogs[categoryId] = []
          }
          categoryBlogs[categoryId].push(blog.slug)
        }
      })
      
      // Fetch blog-specific categories
      const categoriesRes = await fetch(`${API_BASE_URL}/api/blog-categories`)
      const allCategories = await categoriesRes.json()
      
      // Use only blog categories
      const combined = allCategories
      const usedCategories = combined
        .filter(cat => categoryBlogs[cat._id])
        .map(cat => {
          const slugs = categoryBlogs[cat._id]
          const randomSlug = slugs[Math.floor(Math.random() * slugs.length)]
          return { ...cat, randomBlogSlug: randomSlug }
        })
      
      setCategories(usedCategories)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  // Calculate how many categories fit; show More only when needed
  const recalcLayout = () => {
    const container = navListRef.current
    const allInOne = allInOneRef.current
    const moreBtn = moreBtnRef.current
    if (!container) return

    const containerWidth = container.clientWidth
    if (containerWidth === 0) return

    const styles = getComputedStyle(container)
    // Tailwind gap-x-8 => 2rem (32px) on default; read actual just in case
    const gap = parseFloat(styles.columnGap || styles.gap || 0) || 0

    const allInOneWidth = allInOne ? allInOne.offsetWidth : 0
    const catWidths = itemRefs.current.map((el) => (el ? el.offsetWidth : 0))

    // Reserve space for More button if needed; measure if present, else fallback
    const moreWidth = moreBtn ? moreBtn.offsetWidth : 56 // approx width fallback

    // First try to fit everything without More: All + (gap+eachCat)
    let total = allInOneWidth
    for (let i = 0; i < catWidths.length; i++) {
      total += gap + catWidths[i]
    }
    if (total <= containerWidth) {
      setVisibleCount(catWidths.length)
      return
    }

    // Need More button; place More on the left, then All in one, then categories
    let width = moreWidth + gap + allInOneWidth
    let count = 0
    for (let i = 0; i < catWidths.length; i++) {
      const nextWidth = width + gap + catWidths[i]
      if (nextWidth <= containerWidth) {
        width += gap + catWidths[i]
        count++
      } else {
        break
      }
    }
    setVisibleCount(count)
  }
  // Recalculate on load, resize, and when categories or query changes
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      recalcLayout()
    })
    if (navListRef.current) observer.observe(navListRef.current)
    // Also listen to window resize for safety
    const onResize = () => recalcLayout()
    window.addEventListener("resize", onResize)
    // Initial calc after paint
    requestAnimationFrame(recalcLayout)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", onResize)
    }
  }, [categories])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const overflowExists = useMemo(() => {
    if (visibleCount === null) return false
    return visibleCount < categories.length
  }, [visibleCount, categories.length])

  // Close More when clicking outside
  useEffect(() => {
    if (!isMoreOpen) return
    const onDocClick = (e) => {
      const btn = moreBtnRef.current
      const list = navListRef.current
      if (!btn || !list) return
      if (!btn.contains(e.target) && !list.contains(e.target)) {
        setIsMoreOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [isMoreOpen])

  return (
    <header className="bg-white shadow-sm border-b border-gray-200  -mt-3  sm:pt-2 sticky -top-1 mb-2 z-50">
      <div className="w-full">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          {/* Mobile top bar: left categories toggle, centered logo, right search icon */}
  <div className="md:hidden grid grid-cols-3 items-center py-3">
          <div className="pl-1">
            <button
              className="p-2 text-gray-700 hover:text-gray-900"
              aria-label="Toggle categories"
              onClick={() => {
                setIsMenuOpen((v) => !v)
                setIsMobileSearchOpen(false)
              }}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
          <div className="flex items-center justify-center">
            <Link to="/" className="inline-flex items-center">
              {showLogo ? (
                <img
                  src="/admin-logo.svg"
                  alt="Seen Alif logo"
                  className="h-8 w-auto object-contain"
                  onError={() => setShowLogo(false)}
                />
              ) : (
                <span className="text-lg font-bold text-gray-900">Seen Alif</span>
              )}
            </Link>
          </div>
          <div className="flex items-center justify-end pr-1 gap-1">
           
            {!isMobileSearchOpen && (
              <button
                className="p-2 text-gray-700 hover:text-gray-900"
                aria-label="Search"
                onClick={() => {
                  setIsMobileSearchOpen(true)
                  setIsMenuOpen(false)
                }}
              >
                <Search size={22} />
              </button>
            )}
             <Link
              to="https://www.seenalif.com/"
              target="_blank"
              aria-label="Shop Now"
              className="p-2 text-gray-700 hover:text-gray-900"
            >
              <ShoppingBag size={20} />
            </Link>
          </div>
        </div>

        {/* Mobile search dropdown */}
        {isMobileSearchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="w-full">
              <div className="flex items-center bg-white rounded-md overflow-hidden">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-10 px-3 outline-none border border-lime-300"
                  autoFocus
                />
                <div className="flex items-center h-10 mr-1  text-white">
                  <button
                    type="submit"
                    aria-label="Search"
                    className="h-10 w-10 flex items-center justify-center bg-lime-500 hover:bg-lime-600/90"
                  >
                    <Search size={22} />
                  </button>
                  <span aria-hidden className="h-6 w-px" />
                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="h-10 w-10 flex items-center justify-center text-gray-500 hover:text-gray-700 ml-1"
                  >
                    <X size={28} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Desktop/Laptop header row (unchanged) */}
        <div className="hidden md:flex items-center justify-between my-3">
          <Link to="/" className="flex items-center space-x-2">
            {showLogo ? (
              <img
                src="/admin-logo.svg"
                alt="Seen Alif logo"
                className="h-14 w-auto object-contain"
                onError={() => setShowLogo(false)}
              />
            ) : (
              <h1 className="text-xl font-bold text-gray-900">Seen Alif</h1>
            )}
          </Link>
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-8">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300  focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-lime-500"
              />
              <button
                type="submit"
                aria-label="Search"
                className="h-12 w-14 bg-lime-500 text-white  flex items-center justify-center hover:bg-lime-600 transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </form>
          <Link
            to="https://www.seenalif.com/"
            target="_blank"
            className="hidden md:flex items-center space-x-2 px-6 py-2 border hover:border-2 border-gray-300 hover:border-lime-300 text-black hover:bg-lime-500 hover:text-white transition-colors font-medium"
          >
            <ShoppingBag size={18} />
            <span>Shop Now</span>
          </Link>
        </div>

        </div>

        {/* Desktop categories bar */}
        <div className="hidden md:block bg-lime-500">
          <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2">
            <nav className="py-1">
              <ul ref={navListRef} className="flex w-full items-center justify-center gap-12 whitespace-nowrap overflow-visible relative">
                {/* More dropdown (only render when overflow) - on the left */}
                {overflowExists && (
                  <li className="relative">
                    <button
                      ref={moreBtnRef}
                      type="button"
                      onClick={() => setIsMoreOpen((v) => !v)}
                      className="inline-flex items-center font-medium text-white hover:text-lime-100 transition-colors px-0 py-0"
                      aria-haspopup="menu"
                      aria-expanded={isMoreOpen}
                    >
                      <span>More</span>
                    </button>
                    {isMoreOpen && (
                      <div className="absolute left-0 top-full mt-2 min-w-44 rounded-md bg-white py-2 shadow-lg ring-1 ring-black/10 z-20">
                        {categories.slice(visibleCount ?? 0).map((category) => (
                          <Link
                            key={category._id}
                            to={getLocalizedPath(`/blogs/${category.randomBlogSlug}`)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                )}

                {/* All in one always visible */}
                {/* <li ref={allInOneRef}>
                  <Link to="/" className="text-white hover:text-lime-100 font-medium">
                    All in one
                  </Link>
                </li> */}

                {/* Visible categories */}
                {categories.slice(0, visibleCount ?? categories.length).map((category) => (
                  <li key={category._id}>
                    <Link
                      to={getLocalizedPath(`/blogs/${category.randomBlogSlug}`)}
                      className="text-white hover:text-lime-100 font-medium"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}

                {/* Offscreen measuring container */}
                <li className="absolute -left-[9999px] top-auto" aria-hidden="true">
                  {categories.map((category, idx) => (
                    <span
                      key={`measure-${category._id}`}
                      ref={(el) => (itemRefs.current[idx] = el)}
                      className="inline-block font-medium"
                    >
                      {category.name}
                    </span>
                  ))}
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Mobile Categories Drawer */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            {/* Drawer */}
            <nav className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl flex flex-col">
              {/* Drawer Header: first bar styled exactly like the screenshot */}
              <div className="">
                <div className="flex items-center justify-between bg-lime-500 text-white h-12 w-full px-3">
                  <button
                    onClick={() => {
                      navigate("/")
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center gap-2">
                    <LayoutGrid size={18} />
                    <span className="font-xl text-lg">All Categories</span>
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close categories"
                    className="text-white">
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto">
                {/* All in one row intentionally omitted here; styled as header above */}

                {/* Categories list */}
                <div className="py-1">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      to={getLocalizedPath(`/blogs/${category.randomBlogSlug}`)}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-800 text-medium font-medium"
                    >
                      <span>{category.name}</span>
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-lime-500 text-white">
                        <ChevronRight size={18} />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Footer CTA removed as requested */}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
