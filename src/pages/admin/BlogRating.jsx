"use client"

import { useState, useEffect } from "react"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Star, Search, Filter, Eye, ThumbsUp, MessageSquare } from "lucide-react"
import axios from "axios"

import config from "../../config/config"
const BlogRating = () => {
  const { showToast } = useToast()
  const [blogs, setBlogs] = useState([])
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRating, setFilterRating] = useState("all")

  useEffect(() => {
    fetchBlogs()
    fetchRatings()
  }, [])

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await axios.get(`${config.API_URL}/api/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Ensure blogs is always an array
      const blogData = response.data
      if (Array.isArray(blogData)) {
        setBlogs(blogData)
      } else if (blogData && Array.isArray(blogData.blogs)) {
        setBlogs(blogData.blogs)
      } else {
        setBlogs([])
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
      setBlogs([])
      showToast("Failed to fetch blogs", "error")
    }
  }

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await axios.get(`${config.API_URL}/api/blog-ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Ensure ratings is always an array
      const ratingData = response.data
      if (Array.isArray(ratingData)) {
        setRatings(ratingData)
      } else if (ratingData && Array.isArray(ratingData.ratings)) {
        setRatings(ratingData.ratings)
      } else {
        setRatings([])
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
      setRatings([])
      showToast("Failed to fetch ratings", "error")
    } finally {
      setLoading(false)
    }
  }

  const getBlogTitle = (blogId) => {
    if (!Array.isArray(blogs) || blogs.length === 0) return "Unknown Blog"
    const blog = blogs.find((b) => b._id === blogId)
    return blog ? blog.title : "Unknown Blog"
  }

  const getBlogRatings = (blogId) => {
    if (!Array.isArray(ratings)) return []
    return ratings.filter((rating) => rating.blogId === blogId)
  }

  const getAverageRating = (blogId) => {
    const blogRatings = getBlogRatings(blogId)
    if (blogRatings.length === 0) return 0
    const sum = blogRatings.reduce((acc, rating) => acc + rating.rating, 0)
    return (sum / blogRatings.length).toFixed(1)
  }

  const filteredBlogs = Array.isArray(blogs)
    ? blogs.filter((blog) => {
        const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false
        const avgRating = Number.parseFloat(getAverageRating(blog._id))

        let matchesRating = true
        if (filterRating !== "all") {
          const ratingNum = Number.parseInt(filterRating)
          matchesRating = avgRating >= ratingNum && avgRating < ratingNum + 1
        }

        return matchesSearch && matchesRating
      })
    : []

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            size={16}
            className="fill-yellow-400 text-yellow-400"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />,
        )
      } else {
        stars.push(<Star key={i} size={16} className="text-gray-300" />)
      }
    }
    return stars
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog ratings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Blog Ratings</h1>
            <p className="text-gray-600 mt-2">Monitor and manage blog ratings and reviews</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
            </div>
          </div>

          {/* Blog Ratings List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredBlogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Star size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search terms" : "No blogs available for rating"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredBlogs.map((blog) => {
                  const blogRatings = getBlogRatings(blog._id)
                  const averageRating = getAverageRating(blog._id)

                  return (
                    <div key={blog._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{blog.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <Eye size={16} />
                              <span>{blog.views || 0} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp size={16} />
                              <span>{blog.likes || 0} likes</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare size={16} />
                              <span>{blogRatings.length} ratings</span>
                            </div>
                          </div>

                          {blogRatings.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">{renderStars(Number.parseFloat(averageRating))}</div>
                                <span className="text-lg font-semibold text-gray-900">{averageRating}</span>
                                <span className="text-gray-600">({blogRatings.length} ratings)</span>
                              </div>

                              {/* Rating Distribution */}
                              <div className="space-y-1">
                                {[5, 4, 3, 2, 1].map((star) => {
                                  const count = blogRatings.filter((r) => r.rating === star).length
                                  const percentage = blogRatings.length > 0 ? (count / blogRatings.length) * 100 : 0

                                  return (
                                    <div key={star} className="flex items-center gap-2 text-sm">
                                      <span className="w-8">{star}★</span>
                                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-yellow-400 h-2 rounded-full"
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                      </div>
                                      <span className="w-8 text-gray-600">{count}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="ml-6 text-right">
                          <div className="text-sm text-gray-500">Status</div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              blog.status === "published"
                                ? "bg-green-100 text-green-800"
                                : blog.status === "draft"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {blog.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{blogs.length}</div>
              <div className="text-sm text-gray-600">Total Blogs</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">{ratings.length}</div>
              <div className="text-sm text-gray-600">Total Ratings</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {blogs.filter((blog) => Number.parseFloat(getAverageRating(blog._id)) >= 4).length}
              </div>
              <div className="text-sm text-gray-600">4+ Star Blogs</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {ratings.length > 0
                  ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                  : "0.0"}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogRating
