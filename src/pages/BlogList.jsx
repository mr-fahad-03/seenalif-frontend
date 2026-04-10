"use client"

import React, { lazy, Suspense, useEffect, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import axios from "axios"
import { Clock, Eye, User, ChevronLeft, ChevronRight } from "lucide-react"
import { getOptimizedImageUrl } from "../utils/imageUtils"
import SEO from "../components/SEO"
import config from "../config/config"
import { useLanguage } from "../context/LanguageContext"

const BlogHeroSection = lazy(() => import("../components/BlogHeroSection"))

const API_BASE_URL = `${config.API_URL}`
const BLOG_LIST_CACHE_KEY = "graba2z_blog_list_cache_v1"
const BLOG_LIST_CACHE_TTL_MS = 5 * 60 * 1000

const bounceKeyframes = `
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}`

if (typeof document !== "undefined" && !document.getElementById("bounce-keyframes")) {
  const style = document.createElement("style")
  style.id = "bounce-keyframes"
  style.innerHTML = bounceKeyframes
  document.head.appendChild(style)
}

const parseBlogsResponse = (data) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  return Array.isArray(data.blogs) ? data.blogs : []
}

const parseArrayResponse = (data, key) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  return Array.isArray(data[key]) ? data[key] : []
}

const readBlogListCache = () => {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(BLOG_LIST_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.savedAt || !parsed?.data) return null
    if (Date.now() - parsed.savedAt > BLOG_LIST_CACHE_TTL_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

const writeBlogListCache = (data) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      BLOG_LIST_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        data,
      }),
    )
  } catch {
    // best effort cache
  }
}

const BlogList = () => {
  const { getLocalizedPath } = useLanguage()
  const [searchParams] = useSearchParams()
  const [blogs, setBlogs] = useState([])
  const [featuredBlogs, setFeaturedBlogs] = useState([])
  const [trendingBlogs, setTrendingBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [latestPage, setLatestPage] = useState(1)
  const [latestHasMore, setLatestHasMore] = useState(false)

  const trendingRef = useRef(null)
  const [trendCanLeft, setTrendCanLeft] = useState(false)
  const [trendCanRight, setTrendCanRight] = useState(false)
  const [activeTrendingIndex, setActiveTrendingIndex] = useState(0)

  const getDeepestCategory = (blog) => {
    if (blog.blogCategory) return blog.blogCategory
    if (blog.subCategory4) return blog.subCategory4
    if (blog.subCategory3) return blog.subCategory3
    if (blog.subCategory2) return blog.subCategory2
    if (blog.subCategory1) return blog.subCategory1
    return blog.mainCategory
  }

  const hydrateFromCache = (cached) => {
    setBlogs(Array.isArray(cached.blogs) ? cached.blogs : [])
    setFeaturedBlogs(Array.isArray(cached.featuredBlogs) ? cached.featuredBlogs : [])
    setTrendingBlogs(Array.isArray(cached.trendingBlogs) ? cached.trendingBlogs : [])
    setCategories(Array.isArray(cached.categories) ? cached.categories : [])
    setTopics(Array.isArray(cached.topics) ? cached.topics : [])
    setLatestPage(Number.isFinite(cached.latestPage) ? cached.latestPage : 1)
    setLatestHasMore(Boolean(cached.latestHasMore))
  }

  useEffect(() => {
    const cached = readBlogListCache()
    if (cached) {
      hydrateFromCache(cached)
      setLoading(false)
    }
    fetchAllData({ silent: Boolean(cached) })
  }, [])

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category")
    setSelectedCategory(categoryFromUrl || "")
  }, [searchParams])

  const fetchAllData = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true)

      const [featuredResponse, trendingResponse, categoriesResponse, topicsResponse, latestResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/blogs?limit=9&featured=true&sort=-createdAt&status=published&summary=true`),
        axios.get(`${API_BASE_URL}/api/blogs/trending?limit=20&summary=true`),
        axios.get(`${API_BASE_URL}/api/blog-categories`),
        axios.get(`${API_BASE_URL}/api/blog-topics`),
        axios.get(`${API_BASE_URL}/api/blogs?page=1&limit=6&sort=-createdAt&status=published&summary=true`),
      ])

      const nextFeatured = parseBlogsResponse(featuredResponse.data)
      const nextTrending = parseBlogsResponse(trendingResponse.data)
      const nextCategories = parseArrayResponse(categoriesResponse.data, "blogCategories")
      const nextTopics = parseArrayResponse(topicsResponse.data, "blogTopics")
      const latestData = latestResponse.data || {}
      const nextBlogs = parseBlogsResponse(latestData)
      const pagination = latestData.pagination || {}

      setFeaturedBlogs(nextFeatured)
      setTrendingBlogs(nextTrending)
      setCategories(nextCategories)
      setTopics(nextTopics)
      setBlogs(nextBlogs)
      setLatestPage(pagination.current || 1)
      setLatestHasMore(Boolean(pagination.hasNext))

      writeBlogListCache({
        blogs: nextBlogs,
        featuredBlogs: nextFeatured,
        trendingBlogs: nextTrending,
        categories: nextCategories,
        topics: nextTopics,
        latestPage: pagination.current || 1,
        latestHasMore: Boolean(pagination.hasNext),
      })
    } catch (error) {
      console.error("Error fetching blog list data:", error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const fetchLatestBlogs = async (page = 1, replace = false) => {
    if (page > 1) setLoadingMore(true)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "6",
        sort: "-createdAt",
        status: "published",
        summary: "true",
      })

      const response = await axios.get(`${API_BASE_URL}/api/blogs?${params}`)
      const data = response.data || {}
      const nextBlogs = parseBlogsResponse(data)
      const pagination = data.pagination || {}

      setBlogs((prev) => (replace ? nextBlogs : [...prev, ...nextBlogs]))
      setLatestPage(pagination.current || page)
      setLatestHasMore(Boolean(pagination.hasNext))
    } catch (error) {
      console.error("Error fetching latest blogs:", error)
    } finally {
      if (page > 1) setLoadingMore(false)
    }
  }

  useEffect(() => {
    const el = trendingRef.current
    if (!el) return

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth
      setTrendCanLeft(el.scrollLeft > 2)
      setTrendCanRight(el.scrollLeft < maxScroll - 2)

      if (el.firstElementChild) {
        const cardWidth = el.firstElementChild.offsetWidth
        const gap = 24
        const index = Math.round((el.scrollLeft + gap / 2) / (cardWidth + gap))
        setActiveTrendingIndex(Math.max(0, Math.min(index, trendingBlogs.length - 1)))
      }
    }

    update()
    el.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null
    if (resizeObserver) resizeObserver.observe(el)

    return () => {
      el.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [trendingBlogs])

  const scrollTrending = (dir) => {
    const el = trendingRef.current
    if (!el) return
    let step = 0
    const first = el.firstElementChild
    if (first) {
      const second = first.nextElementSibling
      if (second) {
        const r1 = first.getBoundingClientRect()
        const r2 = second.getBoundingClientRect()
        step = Math.round(r2.left - r1.left)
      } else {
        step = Math.round(first.getBoundingClientRect().width)
      }
    }
    if (!step) step = Math.max(Math.round(el.clientWidth / 4), 200)
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" })
  }

  const scrollTrendingToIndex = (index) => {
    const el = trendingRef.current
    if (!el || !el.firstElementChild) return
    const cardWidth = el.firstElementChild.offsetWidth
    const gap = 24
    const scrollPos = index * (cardWidth + gap)
    el.scrollTo({ left: scrollPos, behavior: "smooth" })
  }

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return ""
    const textContent = String(content).replace(/<[^>]*>/g, "")
    return textContent.length > maxLength ? `${textContent.substring(0, maxLength)}...` : textContent
  }

  const visibleBlogs = selectedCategory
    ? blogs.filter((blog) => blog.blogCategory?._id === selectedCategory || blog.mainCategory?._id === selectedCategory)
    : blogs

  const bounceStyle = {
    animation: "bounce 1s infinite",
  }

  if (loading && blogs.length === 0 && featuredBlogs.length === 0 && trendingBlogs.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <img src="/g.png" alt="Loading..." style={{ width: 80, height: 80, ...bounceStyle }} />
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Blogs - Seen Alif | Tech Insights, Reviews & Guides"
        description="Explore our blog for the latest tech news, product reviews, buying guides, and expert insights on laptops, computers, and technology."
        keywords="tech blog, laptop reviews, computer guides, technology news, product reviews, tech insights"
        canonicalUrl="https://www.seenalif.com/blogs"
      />

      <div className="min-h-screen bg-white overflow-x-hidden">
        <Suspense
          fallback={
            <section className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
              <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                <div className="text-center py-10 text-gray-300">Loading featured posts...</div>
              </div>
            </section>
          }
        >
          <BlogHeroSection featuredBlogs={featuredBlogs} />
        </Suspense>

        <section className="bg-white py-6 sm:py-16">
          <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="text-center mb-4 sm:mb-12">
              <h2 className="text-lg sm:text-3xl font-bold text-gray-900 mb-2">TRENDING THIS WEEK</h2>
            </div>

            {(() => {
              const trendingList = Array.isArray(trendingBlogs) ? trendingBlogs : []
              const scrollable = trendingList.length > 4

              return (
                <div className="relative">
                  <div
                    ref={trendingRef}
                    className={
                      scrollable
                        ? "flex gap-6 overflow-x-auto pb-4 scroll-smooth"
                        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    }
                    style={scrollable ? { scrollbarWidth: "none", msOverflowStyle: "none" } : {}}
                  >
                    {trendingList.map((blog) => (
                      <div
                        key={blog._id}
                        className={`${scrollable ? "flex-none w-full md:w-[calc((100%-24px)/2)] lg:w-[calc((100%-72px)/4)]" : ""}`}
                      >
                        <Link
                          to={getLocalizedPath(`/blogs/${blog.slug}`)}
                          className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full flex flex-col"
                        >
                          <div className="p-2 flex-shrink-0">
                            <div className="relative w-full h-36 sm:h-40 overflow-hidden rounded-md bg-gray-100">
                              <img
                                src={
                                  blog.mainImage
                                    ? getOptimizedImageUrl(blog.mainImage, { width: 480, height: 300, quality: 70 })
                                    : "/placeholder.svg?height=250&width=250"
                                }
                                alt={blog.title}
                                loading="lazy"
                                decoding="async"
                                className="block w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="p-4 flex flex-col overflow-hidden" style={{ height: "160px" }}>
                            {(() => {
                              const deepestCategory = getDeepestCategory(blog)
                              return deepestCategory ? (
                                <div
                                  className="inline-block px-2 py-1 rounded text-xs font-medium text-white mb-2 w-fit flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      deepestCategory.color || blog.blogCategory?.color || blog.mainCategory?.color || "#2563eb",
                                  }}
                                >
                                  {deepestCategory.name}
                                </div>
                              ) : null
                            })()}
                            <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 flex-shrink-0 leading-tight">
                              {blog.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 flex-shrink-0 leading-snug">
                              {truncateContent(blog.description)}
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {scrollable && trendCanLeft && (
                    <button
                      type="button"
                      aria-label="Scroll left"
                      onClick={() => scrollTrending("left")}
                      className="flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow hover:bg-white text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}

                  {scrollable && trendCanRight && (
                    <button
                      type="button"
                      aria-label="Scroll right"
                      onClick={() => scrollTrending("right")}
                      className="flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow hover:bg-white text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}

                  {scrollable && trendingList.length > 0 && (
                    <div className="flex justify-center gap-2 mt-6">
                      {Array.from({ length: trendingList.length }).map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          aria-label={`Go to slide ${index + 1}`}
                          onClick={() => scrollTrendingToIndex(index)}
                          className={`transition-all duration-300 ${
                            activeTrendingIndex === index ? "w-8 h-2 bg-lime-500" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                          } rounded-full`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </section>

        <section className="mb-9">
          <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="text-center mb-12">
              <h2 className="text-lg sm:text-3xl font-bold text-gray-900 mb-2">LATEST POSTS</h2>
            </div>

            {visibleBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {visibleBlogs.map((blog, index) => (
                  <Link key={blog._id} to={getLocalizedPath(`/blogs/${blog.slug}`)} className="group">
                    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
                      <div className="p-2">
                        <div className="relative h-60 w-full bg-gray-100 overflow-hidden rounded-lg">
                          <img
                            src={getOptimizedImageUrl(blog.mainImage, { width: 900, height: 560, quality: 72 }) || "/placeholder.svg"}
                            alt={blog.title}
                            loading="lazy"
                            decoding="async"
                            fetchPriority={index === 0 ? "high" : "auto"}
                            className="block w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        {(() => {
                          const deepestCategory = getDeepestCategory(blog)
                          return deepestCategory ? (
                            <span className="inline-block bg-lime-100 text-lime-700 text-xs px-3 py-1 rounded-full mb-1 w-fit">
                              {deepestCategory.name}
                            </span>
                          ) : null
                        })()}

                        <h3 className="text-xl font-bold mb-1 line-clamp-1 group-hover:text-lime-600 transition-colors">{blog.title}</h3>

                        <p className="text-gray-600 mb-2 text-sm line-clamp-3 flex-1">{truncateContent(blog.description, 120)}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <User size={14} /> {blog.postedBy || "Admin"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={14} /> {blog.views || 0}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Clock size={14} /> {blog.readMinutes || 5} min
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
                <p className="text-gray-600">No blogs available at the moment</p>
              </div>
            )}

            {latestHasMore && (
              <div className="flex items-center justify-center">
                <button
                  onClick={() => fetchLatestBlogs(latestPage + 1, false)}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-lg bg-lime-500 text-white hover:bg-lime-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export default BlogList
