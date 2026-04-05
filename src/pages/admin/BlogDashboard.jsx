"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  Hash,
  MessageSquare,
  Eye,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import axios from "axios"
import config from "../../config/config"

const BlogDashboard = () => {
  const { showToast } = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRecentBlogs, setShowRecentBlogs] = useState(false)
  const [showPopularBlogs, setShowPopularBlogs] = useState(false)
  const [showRecentComments, setShowRecentComments] = useState(false)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        showToast("Please login as admin first", "error")
        return
      }

      const { data } = await axios.get(`${config.API_URL}/api/blog-dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setStats(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      showToast(error.response?.data?.message || "Failed to fetch dashboard stats", "error")
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <Link
      to={link || "#"}
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${!link && "pointer-events-none"}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading dashboard...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Dashboard</h1>
            <p className="text-gray-600">Overview of your blog system</p>
          </div>

          {/* Overview Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Blogs" value={stats?.overview?.totalBlogs || 0} icon={BookOpen} color="bg-blue-500" link="/admin/blogs" />
              <StatCard title="Published" value={stats?.overview?.publishedBlogs || 0} icon={CheckCircle} color="bg-green-500" />
              <StatCard title="Drafts" value={stats?.overview?.draftBlogs || 0} icon={Clock} color="bg-yellow-500" />
              <StatCard title="Archived" value={stats?.overview?.archivedBlogs || 0} icon={XCircle} color="bg-gray-500" />
            </div>
          </div>

          {/* Comments Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Comments"
                value={stats?.overview?.totalComments || 0}
                icon={MessageSquare}
                color="bg-blue-500"
                link="/admin/blog-comments"
              />
              <StatCard
                title="Pending"
                value={stats?.overview?.pendingComments || 0}
                icon={AlertCircle}
                color="bg-yellow-500"
                link="/admin/blog-comments?status=pending"
              />
              <StatCard title="Approved" value={stats?.overview?.approvedComments || 0} icon={CheckCircle} color="bg-green-500" />
              <StatCard title="Rejected" value={stats?.overview?.rejectedComments || 0} icon={XCircle} color="bg-red-500" />
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Total Views" value={stats?.overview?.totalViews?.toLocaleString() || 0} icon={Eye} color="bg-cyan-500" />
              <StatCard title="Total Likes" value={stats?.overview?.totalLikes?.toLocaleString() || 0} icon={Heart} color="bg-rose-500" />
            </div>
          </div>

          {/* Toggle Buttons */}
          <div className="mb-6 flex flex-wrap gap-4">
            <button
              onClick={() => setShowRecentBlogs(!showRecentBlogs)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showRecentBlogs
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Clock size={18} />
              {showRecentBlogs ? "Hide" : "Show"} Recent Blogs
            </button>
            <button
              onClick={() => setShowPopularBlogs(!showPopularBlogs)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showPopularBlogs
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <TrendingUp size={18} />
              {showPopularBlogs ? "Hide" : "Show"} Popular Blogs
            </button>
            <button
              onClick={() => setShowRecentComments(!showRecentComments)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showRecentComments
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <MessageSquare size={18} />
              {showRecentComments ? "Hide" : "Show"} Recent Comments
            </button>
          </div>

          {/* Recent Blogs Table */}
          {showRecentBlogs && (
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Clock className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Recent Blogs</h2>
                      <p className="text-sm text-gray-600">Latest published content</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/blogs"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              {stats?.recentBlogs?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Topic
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentBlogs.map((blog) => (
                        <tr key={blog._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <BookOpen className="text-blue-600" size={16} />
                              </div>
                              <div>
                                <Link
                                  to={`/admin/blogs/${blog._id}/edit`}
                                  className="text-sm font-medium text-blue-600 hover:text-blue-900"
                                >
                                  {blog.title}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {blog.blogCategory?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {blog.topic?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Eye size={16} className="text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{blog.views || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                blog.status === "published"
                                  ? "bg-green-100 text-green-800"
                                  : blog.status === "draft"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {blog.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Clock size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent blogs</h3>
                  <p className="text-gray-600 mb-4">Start creating blogs to see them here</p>
                  <Link
                    to="/admin/blogs/add"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BookOpen size={16} />
                    Create Blog
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Popular Blogs Table */}
          {showPopularBlogs && (
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <TrendingUp className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Popular Blogs</h2>
                      <p className="text-sm text-gray-600">Most viewed and liked content</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/blogs"
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              {stats?.popularBlogs?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Topic
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Likes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.popularBlogs.map((blog) => (
                        <tr key={blog._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                <TrendingUp className="text-purple-600" size={16} />
                              </div>
                              <div>
                                <Link
                                  to={`/admin/blogs/${blog._id}/edit`}
                                  className="text-sm font-medium text-purple-600 hover:text-purple-900"
                                >
                                  {blog.title}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {blog.blogCategory?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {blog.topic?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Eye size={16} className="text-cyan-500 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{blog.views || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Heart size={16} className="text-rose-500 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{blog.likes || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                blog.status === "published"
                                  ? "bg-green-100 text-green-800"
                                  : blog.status === "draft"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {blog.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <TrendingUp size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No popular blogs yet</h3>
                  <p className="text-gray-600">Blogs with high engagement will appear here</p>
                </div>
              )}
            </div>
          )}

          {/* Recent Comments */}
          {showRecentComments && (
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      <MessageSquare className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Recent Comments</h2>
                      <p className="text-sm text-gray-600">Latest feedback from readers</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/blog-comments"
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              {stats?.recentComments?.length > 0 ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {stats.recentComments.map((comment) => (
                      <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-gray-900">{comment.name}</span>
                            <span className="text-gray-500 text-sm ml-2">on</span>
                            <Link to={`/admin/blogs/${comment.blog?._id}/edit`} className="text-indigo-600 hover:text-indigo-800 text-sm ml-1 font-medium">
                              {comment.blog?.title}
                            </Link>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              comment.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : comment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {comment.status}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm line-clamp-2">{comment.comment}</p>
                        <p className="text-gray-400 text-xs mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <MessageSquare size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                  <p className="text-gray-600">Comments from readers will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  export default BlogDashboard
