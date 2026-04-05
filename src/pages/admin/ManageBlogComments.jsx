"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Search, Filter, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare, X, Save } from "lucide-react"
import axios from "axios"
import config from "../../config/config"

const ManageBlogComments = () => {
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [comments, setComments] = useState([])
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const [blogFilter, setBlogFilter] = useState("all")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingComment, setEditingComment] = useState(null)
  const [selectedComments, setSelectedComments] = useState([])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
    status: "pending",
    adminReply: "",
    rating: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        showToast("Please login as admin first", "error")
        return
      }

      const headers = { Authorization: `Bearer ${token}` }

      const [commentsRes, blogsRes] = await Promise.all([
        axios.get(`${config.API_URL}/api/blog-comments`, { headers }),
        axios.get(`${config.API_URL}/api/blogs`, { headers }),
      ])

      setComments(commentsRes.data.comments || [])
      setBlogs(blogsRes.data.blogs || blogsRes.data || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      showToast(error.response?.data?.message || "Failed to fetch data", "error")
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleEdit = (comment) => {
    setEditingComment(comment)
    setFormData({
      name: comment.name,
      email: comment.email,
      comment: comment.comment,
      status: comment.status,
      adminReply: comment.adminReply || "",
      rating: comment.rating || 0,
    })
    setShowEditModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("adminToken")
      const headers = { Authorization: `Bearer ${token}` }

      await axios.put(`${config.API_URL}/api/blog-comments/${editingComment._id}`, formData, { headers })
      showToast("Comment updated successfully", "success")

      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error updating comment:", error)
      showToast(error.response?.data?.message || "Failed to update comment", "error")
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken")
      await axios.put(
        `${config.API_URL}/api/blog-comments/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      showToast(`Comment ${newStatus} successfully`, "success")
      fetchData()
    } catch (error) {
      console.error("Error updating status:", error)
      showToast(error.response?.data?.message || "Failed to update status", "error")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment? This will also delete all replies.")) return

    try {
      const token = localStorage.getItem("adminToken")
      await axios.delete(`${config.API_URL}/api/blog-comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      showToast("Comment deleted successfully", "success")
      fetchData()
    } catch (error) {
      console.error("Error deleting comment:", error)
      showToast(error.response?.data?.message || "Failed to delete comment", "error")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedComments.length === 0) {
      showToast("Please select comments to delete", "warning")
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedComments.length} comment(s)?`)) return

    try {
      const token = localStorage.getItem("adminToken")
      await axios.post(
        `${config.API_URL}/api/blog-comments/bulk-delete`,
        { ids: selectedComments },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      showToast("Comments deleted successfully", "success")
      setSelectedComments([])
      fetchData()
    } catch (error) {
      console.error("Error deleting comments:", error)
      showToast(error.response?.data?.message || "Failed to delete comments", "error")
    }
  }

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedComments.length === 0) {
      showToast("Please select comments", "warning")
      return
    }

    try {
      const token = localStorage.getItem("adminToken")
      await axios.post(
        `${config.API_URL}/api/blog-comments/bulk-status`,
        { ids: selectedComments, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      showToast(`Comments ${newStatus} successfully`, "success")
      setSelectedComments([])
      fetchData()
    } catch (error) {
      console.error("Error updating comments:", error)
      showToast(error.response?.data?.message || "Failed to update comments", "error")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      comment: "",
      status: "pending",
      adminReply: "",
      rating: 0,
    })
    setEditingComment(null)
    setShowEditModal(false)
  }

  const toggleCommentSelection = (id) => {
    setSelectedComments((prev) => (prev.includes(id) ? prev.filter((commentId) => commentId !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([])
    } else {
      setSelectedComments(filteredComments.map((comment) => comment._id))
    }
  }

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.comment?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || comment.status === statusFilter
    const matchesBlog = blogFilter === "all" || comment.blog?._id === blogFilter

    return matchesSearch && matchesStatus && matchesBlog
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "spam":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "spam":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading...</div>
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Blog Comments</h1>
            <p className="text-gray-600 mt-1">Manage and moderate blog comments</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="spam">Spam</option>
                </select>
              </div>

              <div>
                <select
                  value={blogFilter}
                  onChange={(e) => setBlogFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Blogs</option>
                  {blogs.map((blog) => (
                    <option key={blog._id} value={blog._id}>
                      {blog.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedComments.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusChange("approved")}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve ({selectedComments.length})
                </button>
                <button
                  onClick={() => handleBulkStatusChange("rejected")}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject ({selectedComments.length})
                </button>
                <button
                  onClick={() => handleBulkStatusChange("spam")}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Mark as Spam ({selectedComments.length})
                </button>
                <button onClick={handleBulkDelete} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedComments.length})
                </button>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blog</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComments.length > 0 ? (
                  filteredComments.map((comment) => (
                    <tr key={comment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input type="checkbox" checked={selectedComments.includes(comment._id)} onChange={() => toggleCommentSelection(comment._id)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{comment.name}</div>
                        <div className="text-sm text-gray-500">{comment.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2 max-w-md">{comment.comment}</div>
                        {comment.adminReply && (
                          <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            <strong>Admin Reply:</strong> {comment.adminReply}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <Link 
                          to={`/blogs/${comment.blog?.slug || comment.blog?._id}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          title={comment.blog?.title || "N/A"}
                          className="text-blue-600 hover:text-blue-800 line-clamp-2 block max-w-xs"
                        >
                          {comment.blog?.title?.split(' ').slice(0, 10).join(' ') + (comment.blog?.title?.split(' ').length > 10 ? '...' : '') || "N/A"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 w-fit ${getStatusColor(comment.status)}`}>
                          {getStatusIcon(comment.status)}
                          {comment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {comment.status === "pending" && (
                            <>
                              <button onClick={() => handleStatusChange(comment._id, "approved")} className="text-green-600 hover:text-green-900" title="Approve">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleStatusChange(comment._id, "rejected")} className="text-red-600 hover:text-red-900" title="Reject">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => handleEdit(comment)} className="text-blue-600 hover:text-blue-900" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(comment._id)} className="text-gray-600 hover:text-gray-900" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No comments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Comment</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Reply</label>
                <textarea
                  name="adminReply"
                  value={formData.adminReply}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating (Optional)</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Update Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageBlogComments
