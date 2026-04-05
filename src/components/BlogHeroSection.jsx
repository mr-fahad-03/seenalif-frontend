import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ChevronLeft, ChevronRight, Eye, Clock } from 'lucide-react'
import { getOptimizedImageUrl } from '../utils/imageUtils'
import { useLanguage } from '../context/LanguageContext'

const BlogHeroSection = ({ featuredBlogs = [] }) => {
  const { getLocalizedPath } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [enableTransition, setEnableTransition] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideWidthPx, setSlideWidthPx] = useState(null)
  
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const animTimeoutRef = useRef(null)
  
  const itemsPerView = 3
  const gapPx = 24
  const slideDurationMs = 600
  const autoAdvanceMs = 5000

  // Initialize carousel with cloned items for infinite loop
  const useLoop = featuredBlogs.length >= itemsPerView
  const slides = useLoop
    ? [
        ...featuredBlogs.slice(-itemsPerView),
        ...featuredBlogs,
        ...featuredBlogs.slice(0, itemsPerView),
      ]
    : featuredBlogs

  // Set initial index to skip clones
  useEffect(() => {
    if (useLoop && currentIndex === 0) {
      setCurrentIndex(itemsPerView)
    }
  }, [useLoop])

  // Calculate slide width
  useEffect(() => {
    const updateWidth = () => {
      if (viewportRef.current) {
        const vw = viewportRef.current.offsetWidth
        setSlideWidthPx((vw - gapPx * (itemsPerView - 1)) / itemsPerView)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Auto-advance carousel
  useEffect(() => {
    if (!useLoop || featuredBlogs.length === 0) return
    const timer = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true)
        setCurrentIndex((idx) => idx + 1)
        if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
        animTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false)
        }, slideDurationMs + 200)
      }
    }, autoAdvanceMs)
    return () => {
      clearInterval(timer)
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
    }
  }, [useLoop, featuredBlogs.length, isAnimating])

  if (!featuredBlogs || featuredBlogs.length === 0) {
    return (
      <section className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="text-center py-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-lime-400 mr-2" />
              <span className="text-lime-400 text-lg font-medium">Tech Insights & Stories</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome to our Blog</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the latest in technology, expert reviews, buying guides, and industry insights
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-lime-400 mr-2" />
            <span className="text-lime-400 text-lg font-semibold">Featured Articles</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome to our Blogs</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">Discover our hand-picked featured articles</p>
        </div>

        <div className="relative group">
          {/* Track container with clipping */}
          <div className="overflow-hidden" ref={viewportRef}>
            <div
              ref={trackRef}
              className="flex"
              style={{
                width: "100%",
                transform: useLoop
                  ? (slideWidthPx
                      ? `translate3d(-${currentIndex * (slideWidthPx + gapPx)}px, 0, 0)`
                      : `translate3d(-${currentIndex * (100 / itemsPerView)}%, 0, 0)`)
                  : "translate3d(0, 0, 0)",
                transition: `${useLoop && enableTransition ? `transform ${slideDurationMs}ms cubic-bezier(0.2, 0.85, 0.2, 1)` : ""}`,
                willChange: "transform",
                gap: `${gapPx}px`,
              }}
              onTransitionEnd={() => {
                if (!useLoop) return
                // Clear safety timer if it exists
                if (animTimeoutRef.current) {
                  clearTimeout(animTimeoutRef.current)
                  animTimeoutRef.current = null
                }
                if (currentIndex >= featuredBlogs.length + itemsPerView) {
                  setEnableTransition(false)
                  setCurrentIndex(itemsPerView)
                  requestAnimationFrame(() => {
                    const el = trackRef.current
                    if (el) el.getBoundingClientRect()
                    requestAnimationFrame(() => setEnableTransition(true))
                  })
                }
                if (currentIndex <= itemsPerView - 1) {
                  setEnableTransition(false)
                  setCurrentIndex(featuredBlogs.length + itemsPerView - 1)
                  requestAnimationFrame(() => {
                    const el = trackRef.current
                    if (el) el.getBoundingClientRect()
                    requestAnimationFrame(() => setEnableTransition(true))
                  })
                }
                setIsAnimating(false)
              }}
            >
              {slides.map((blog, i) => (
                <div
                  key={`${blog._id}-${i}`}
                  style={{
                    flex: "0 0 auto",
                    width: slideWidthPx ? `${slideWidthPx}px` : `${100 / itemsPerView}%`,
                  }}
                >
                  <Link to={getLocalizedPath(`/blogs/${blog.slug}`)} className="block group/card">
                    <div className="relative cursor-pointer rounded-xl shadow-2xl bg-white p-2">
                      <div className="overflow-hidden rounded-lg">
                        <div className="aspect-[4/3] relative">
                        <img
                          src={getOptimizedImageUrl(blog.mainImage, { width: 900, height: 675, quality: 72 }) || "/placeholder.svg?height=300&width=400"}
                          alt={blog.title}
                          loading={i < itemsPerView ? "eager" : "lazy"}
                          decoding="async"
                          fetchPriority={i === itemsPerView ? "high" : "auto"}
                          className="block w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end">
                          <div className="p-6 w-full">
                            {/* Featured Badge */}
                            <div className="mb-3">
                              <span className="inline-flex items-center gap-1.5 bg-lime-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                                <Sparkles className="w-3 h-3" />
                                Featured
                              </span>
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-white text-xl font-bold mb-2 line-clamp-2 group-hover/card:text-lime-400 transition-colors">
                              {blog.title}
                            </h3>
                            
                            {/* Meta */}
                            <div className="flex items-center gap-4 text-xs text-gray-300">
                              <span className="flex items-center gap-1">
                                <Eye size={14} />
                                {blog.views || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {blog.readMinutes || 5} min
                              </span>
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Slider Arrows (hidden on mobile, visible on sm+ screens) */}
          {useLoop && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={() => {
                  if (isAnimating) return
                  setIsAnimating(true)
                  setCurrentIndex((idx) => idx - 1)
                  if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
                  animTimeoutRef.current = setTimeout(() => {
                    setIsAnimating(false)
                  }, slideDurationMs + 200)
                }}
                className="hidden sm:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/90 shadow-lg hover:bg-white text-gray-700 hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 pointer-events-none group-hover:pointer-events-auto focus:pointer-events-auto"
              >
                <ChevronLeft className="mx-auto" size={24} />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => {
                  if (isAnimating) return
                  setIsAnimating(true)
                  setCurrentIndex((idx) => idx + 1)
                  if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
                  animTimeoutRef.current = setTimeout(() => {
                    setIsAnimating(false)
                  }, slideDurationMs + 200)
                }}
                className="hidden sm:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/90 shadow-lg hover:bg-white text-gray-700 hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 pointer-events-none group-hover:pointer-events-auto focus:pointer-events-auto"
              >
                <ChevronRight className="mx-auto" size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default BlogHeroSection
