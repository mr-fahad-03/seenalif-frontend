"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { Calendar, User, Eye, ArrowLeft, Tag, Share2, ChevronRight, MessageCircle } from "lucide-react"
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaPinterestP, FaYoutube } from "react-icons/fa"
import { FaXTwitter, FaTiktok } from "react-icons/fa6"
import { getFullImageUrl } from "../utils/imageUtils"
import axios from "axios"
import config from "../config/config"
import Comments from "../components/Comments"
import RelatedPosts from "../components/RelatedPosts"
import SEO from "../components/SEO"
import TipTapRenderer from "../components/TipTapRenderer"
import { useLanguage } from "../context/LanguageContext"

const API_BASE_URL = `${config.API_URL}`

const BlogPost = () => {
  const { slug } = useParams()
  const { getLocalizedPath } = useLanguage()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [recent, setRecent] = useState([])
  const [toc, setToc] = useState([])
  const [contentHtml, setContentHtml] = useState("")

  // Helper function to get the deepest selected category level
  const getDeepestCategory = (blog) => {
    if (!blog) return null
    if (blog.blogCategory) return blog.blogCategory
    if (blog.subCategory4) return blog.subCategory4
    if (blog.subCategory3) return blog.subCategory3
    if (blog.subCategory2) return blog.subCategory2
    if (blog.subCategory1) return blog.subCategory1
    return blog.mainCategory
  }

  const readingMinutes = useMemo(() => {
    const html = blog?.description || ""
    const text = html.replace(/<[^>]+>/g, " ")
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 200))
  }, [blog])


  useEffect(() => {
    fetchBlog()
  }, [slug])

  // Once blog is fetched, prepare: recent posts and table of contents
  useEffect(() => {
    if (!blog) return
    
    // Recent posts (exclude current)
    ;(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/blogs?limit=5&status=published`)
        const data = res.data
        if (res.status === 200) {
          const items = (Array.isArray(data) ? data : data.blogs || []).filter((b) => b.slug !== blog.slug)
          setRecent(items.slice(0, 5))
        }
      } catch (_) {}
    })()

    // Build TOC from blog.description (h2/h3) and inject ids
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(blog.description || "", "text/html")
      const headings = Array.from(doc.querySelectorAll("h2, h3"))
      const makeId = (text) =>
        text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
      const tocItems = []
      headings.forEach((h) => {
        const text = h.textContent || ""
        const id = h.id || makeId(text)
        h.id = id
        tocItems.push({ id, text, level: h.tagName.toLowerCase() })
      })
      setToc(tocItems)
      setContentHtml(doc.body.innerHTML)
    } catch (_) {
      setContentHtml(blog.description || "")
    }
  }, [blog])

  // Reading progress (page scroll)
  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const total = scrollHeight - clientHeight
      const pct = total > 0 ? Math.min(100, Math.max(0, (scrollTop / total) * 100)) : 0
      setProgress(pct)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])


  // You can remove the incrementViews function entirely
  const fetchBlog = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await axios.get(`${API_BASE_URL}/api/blogs/slug/${slug}`)
      setBlog(response.data)
    } catch (error) {
      console.error("Error fetching blog:", error)
      setError(error.response?.data?.message || "Blog not found")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const truncateContent = (html, maxLength = 150) => {
    const text = html?.replace(/<[^>]+>/g, "") || ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to={getLocalizedPath("/blogs")}
            className="inline-flex items-center px-4 py-2 bg-lime-500 text-white font-medium rounded-lg hover:bg-lime-600 transition-colors space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Back to Blogs</span>
          </Link>
        </div>
      </div>
    )
  }

  const deepestCategory = getDeepestCategory(blog)

  // Prepare SEO data
  const seoTitle = blog.metaTitle || blog.title || "Blog Post"
  const seoDescription = blog.metaDescription || truncateContent(blog.description, 160)
  const seoImage = getFullImageUrl(blog.mainImage)
  const seoCanonicalPath = getLocalizedPath(`/blogs/${blog.slug}`)
  const seoKeywords = blog.tags && blog.tags.length > 0 ? blog.tags.join(", ") : ""
  
  // Article structured data for Google
  const articleData = {
    author: blog.postedBy || "Seen Alif Team",
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    tags: blog.tags || []
  }

  return (
    <>
      <SEO 
        title={seoTitle}
        description={seoDescription}
        canonicalPath={seoCanonicalPath}
        image={seoImage}
        keywords={seoKeywords}
        article={articleData}
        customSchema={blog.schema}
      />
      
      <div className="min-h-screen bg-white">
        {/* Reading progress bar */}
        <div
          className="fixed top-0 left-0 h-1 bg-lime-500 z-50 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />

      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-600 mb-8">
          <ol className="flex items-center flex-wrap gap-2">
            <li>
              <Link to="/" className="hover:text-lime-600 transition-colors">Home</Link>
            </li>
            <li className="text-gray-400">›</li>
            <li>
              <Link to={getLocalizedPath("/blogs")} className="hover:text-lime-600 transition-colors">Blogs</Link>
            </li>
            {deepestCategory && (
              <>
                <li className="text-gray-400">›</li>
                <li className="text-gray-700">{deepestCategory.name}</li>
              </>
            )}
          </ol>
        </nav>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8">
          {/* Main Article */}
          <article className="bg-white">
            {/* Header */}
            <header className="sm:px-8 sm:py-8 px-2 py-2 border-b border-gray-200">
              {/* Main image first */}
              {blog.mainImage && (
                <div className="mb-6 overflow-hidden bg-gray-100">
                  <img
                    src={getFullImageUrl(blog.mainImage)}
                    alt={blog.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* Category Badge */}
              {deepestCategory && (
                <div className="mb-4">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${API_BASE_URL}/api/blogs?status=published&limit=1000`);
                        const data = await response.json();
                        const allBlogs = data.blogs || data || [];
                        
                        // Filter blogs with the same deepest category
                        const categoryBlogs = allBlogs.filter(b => {
                          const blogCatId = b.subCategory4?._id || b.subCategory3?._id || 
                                          b.subCategory2?._id || b.subCategory1?._id || 
                                          b.mainCategory?._id;
                          return blogCatId === deepestCategory._id && b.slug !== blog.slug;
                        });
                        
                        if (categoryBlogs.length > 0) {
                          const randomBlog = categoryBlogs[Math.floor(Math.random() * categoryBlogs.length)];
                          window.location.href = getLocalizedPath(`/blogs/${randomBlog.slug}`);
                        }
                      } catch (error) {
                        console.error('Error fetching random blog:', error);
                      }
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ backgroundColor: deepestCategory.color || blog.blogCategory?.color || blog.mainCategory?.color || "#16a34a" }}
                  >
                    {deepestCategory.name}
                  </button>
                </div>
              )}

              {/* Title */}
              <h1 className="text-lg sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {blog.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar size={18} />
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User size={18} />
                  <span>By {blog.postedBy || "Admin"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye size={18} />
                  <span>{blog.views || 0} views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-lime-500" />
                  <span>{blog.readMinutes || readingMinutes} min read</span>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="sm:px-8 sm:py-6 px-2 py-2">
              <TipTapRenderer content={contentHtml || blog.description} />
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="px-8 py-6 border-t border-gray-200">
                <div className="flex items-center mb-4">
                  <Tag size={18} className="text-lime-600 mr-2" />
                  <span className="text-gray-700 font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-lime-50 text-lime-800 border border-lime-200 hover:bg-lime-100 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Info */}
            <div className="sm:px-8 sm:py-6 px-2 pt-4 border-t border-gray-200 bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-lime-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {blog.postedBy?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Written by {blog.postedBy || "Admin"}
                  </h4>
                  <p className="text-gray-600">
                    Published on {formatDate(blog.createdAt)}
                  </p>
                </div>
              </div>

              {/* Social Share */}
              <div className="sm:px-6 pt-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Share2 size={18} className="text-lime-600" />
                  <span className="sr-only">Follow us</span>
                  {[
                    { name: 'Facebook', href: 'https://www.facebook.com/grabatozae/', Icon: FaFacebookF, color: '#1877F2' },
                    { name: 'X', href: 'https://x.com/GrabAtoz', Icon: FaXTwitter, color: '#000000' },
                    { name: 'Instagram', href: 'https://www.instagram.com/grabatoz/', Icon: FaInstagram, color: '#E4405F' },
                    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/grabatozae', Icon: FaLinkedinIn, color: '#0A66C2' },
                    { name: 'Pinterest', href: 'https://www.pinterest.com/grabatoz/', Icon: FaPinterestP, color: '#E60023' },
                    { name: 'TikTok', href: 'https://www.tiktok.com/@grabatoz', Icon: FaTiktok, color: '#000000' },
                    { name: 'YouTube', href: 'https://www.youtube.com/@grabAtoZ', Icon: FaYoutube, color: '#FF0000' },
                  ].map(({ name, href, Icon, color }) => (
                    <a
                      key={name}
                      className="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-gray-200 text-current hover:bg-gray-50 transition-colors"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      title={name}
                      style={{ color }}
                    >
                      <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-max space-y-6">
            {/* Table of Contents */}
            {toc.length > 0 && (
              <div className="bg-white rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Table of Contents</h3>
                <nav className="text-sm text-gray-700">
                  <ul className="space-y-2">
                    {toc.map((item) => (
                      <li key={item.id} className={item.level === "h3" ? "ml-4" : ""}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => {
                            e.preventDefault()
                            const el = document.getElementById(item.id)
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                          }}
                          className="inline-flex items-start gap-2 hover:text-lime-600"
                        >
                          <ChevronRight size={16} className="mt-0.5 text-gray-400" />
                          <span>{item.text}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}

            {/* Author Card Small */}
            <div className="bg-white rounded-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-lime-500 text-white flex items-center justify-center font-semibold">
                  {blog.postedBy?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{blog.postedBy || "Admin"}</div>
                  <div className="text-xs text-gray-500">{formatDate(blog.createdAt)}</div>
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            {recent.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Posts</h3>
                <ul className="space-y-3">
                  {recent.map((p) => (
                    <li key={p._id}>
                      <Link to={getLocalizedPath(`/blogs/${p.slug}`)} className="flex gap-3 group">
                        <div className="w-16 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          {p.mainImage ? (
                            <img 
                              src={getFullImageUrl(p.mainImage)} 
                              alt={p.title} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-lime-600 line-clamp-2 break-words">
                            {p.title}
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(p.createdAt)}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ad Placeholder */}
            <div className="rounded-lg bg-gray-100 text-gray-600 p-6 text-center">
              <div className="text-sm">Advertisement</div>
              <div className="mt-2 h-28 rounded bg-white border border-dashed border-gray-300" />
            </div>
          </aside>
        </div>

        {/* Comments Section */}
        <div className="mt-12 bg-white rounded-lg p-2 sm:p-8">
          <Comments blogId={blog._id} blogTitle={blog.title} />
        </div>

        {/* Related Posts */}
        <RelatedPosts
          blogId={blog._id}
          categoryId={deepestCategory?._id}
          topicId={blog.topic?._id}
        />
      </div>
      </div>
    </>
  )
}

export default BlogPost
