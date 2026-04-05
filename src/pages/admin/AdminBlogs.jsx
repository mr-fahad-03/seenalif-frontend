"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, User, Tag } from "lucide-react"
import axios from "axios"
import { getFullImageUrl } from "../../utils/imageUtils"

import config from "../../config/config"

const AdminBlogs = () => {
  const { showToast } = useToast()
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [topics, setTopics] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        showToast("Please login as admin first", "error")
        return
      }

      const headers = { Authorization: `Bearer ${token}` }

      console.log("Fetching all data...") // Debug log

      // Fetch all data in parallel
      const [blogsRes, categoriesRes, subCategoriesRes, topicsRes, brandsRes] = await Promise.allSettled([
        axios.get(`${config.API_URL}/api/blogs`, { headers }),
        axios.get(`${config.API_URL}/api/categories`, { headers }),
        axios.get(`${config.API_URL}/api/subcategories`, { headers }),
        axios.get(`${config.API_URL}/api/blog-topics`, { headers }),
        axios.get(`${config.API_URL}/api/brands`, { headers }),
      ])

      // Process blogs - blogs should now come directly as an array with populated fields
      if (blogsRes.status === "fulfilled") {
        const blogData = blogsRes.value.data
        console.log("Raw blogs response:", blogData) // Debug log

        let processedBlogs = []
        if (Array.isArray(blogData)) {
          processedBlogs = blogData
        } else if (blogData && Array.isArray(blogData.blogs)) {
          processedBlogs = blogData.blogs
        } else if (blogData && blogData.data && Array.isArray(blogData.data)) {
          processedBlogs = blogData.data
        }

        console.log("Processed blogs:", processedBlogs) // Debug log
        setBlogs(processedBlogs)
      } else {
        console.error("Failed to fetch blogs:", blogsRes.reason)
        setBlogs([])
      }

      // Process categories
      if (categoriesRes.status === "fulfilled") {
        const categoryData = categoriesRes.value.data
        console.log("Raw categories response:", categoryData) // Debug log

        let processedCategories = []
        if (Array.isArray(categoryData)) {
          processedCategories = categoryData
        } else if (categoryData && Array.isArray(categoryData.categories)) {
          processedCategories = categoryData.categories
        } else if (categoryData && categoryData.data && Array.isArray(categoryData.data)) {
          processedCategories = categoryData.data
        }

        console.log("Processed categories:", processedCategories) // Debug log
        setCategories(processedCategories)
      } else {
        console.error("Failed to fetch categories:", categoriesRes.reason)
        setCategories([])
      }

      // Process subcategories
      if (subCategoriesRes.status === "fulfilled") {
        const subCategoryData = subCategoriesRes.value.data
        console.log("Raw subcategories response:", subCategoryData) // Debug log

        let processedSubCategories = []
        if (Array.isArray(subCategoryData)) {
          processedSubCategories = subCategoryData
        } else if (subCategoryData && Array.isArray(subCategoryData.subCategories)) {
          processedSubCategories = subCategoryData.subCategories
        } else if (subCategoryData && subCategoryData.data && Array.isArray(subCategoryData.data)) {
          processedSubCategories = subCategoryData.data
        }

        console.log("Processed subcategories:", processedSubCategories) // Debug log
        setSubCategories(processedSubCategories)
      } else {
        console.error("Failed to fetch subcategories:", subCategoriesRes.reason)
        setSubCategories([])
      }

      // Process topics
      if (topicsRes.status === "fulfilled") {
        const topicData = topicsRes.value.data
        console.log("Raw topics response:", topicData) // Debug log

        let processedTopics = []
        if (Array.isArray(topicData)) {
          processedTopics = topicData
        } else if (topicData && Array.isArray(topicData.topics)) {
          processedTopics = topicData.topics
        } else if (topicData && topicData.data && Array.isArray(topicData.data)) {
          processedTopics = topicData.data
        }

        console.log("Processed topics:", processedTopics) // Debug log
        setTopics(processedTopics)
      } else {
        console.error("Failed to fetch topics:", topicsRes.reason)
        setTopics([])
      }

      // Process brands
      if (brandsRes.status === "fulfilled") {
        const brandData = brandsRes.value.data
        console.log("Raw brands response:", brandData) // Debug log

        let processedBrands = []
        if (Array.isArray(brandData)) {
          processedBrands = brandData
        } else if (brandData && Array.isArray(brandData.brands)) {
          processedBrands = brandData.brands
        } else if (brandData && brandData.data && Array.isArray(brandData.data)) {
          processedBrands = brandData.data
        }

        console.log("Processed brands:", processedBrands) // Debug log
        setBrands(processedBrands)
      } else {
        console.error("Failed to fetch brands:", brandsRes.reason)
        setBrands([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      showToast("Failed to fetch data", "error")
    } finally {
      setLoading(false)
    }
  }

  // Updated helper functions to work with populated data
  const getCategoryName = (category) => {
    if (!category) return "Not Set"

    // If category is already populated (object with name)
    if (typeof category === "object" && category.name) {
      return category.name
    }

    // If category is just an ID, try to find it in categories array
    if (typeof category === "string") {
      const foundCategory = categories.find(
        (cat) => cat._id === category || cat.id === category || String(cat._id) === String(category),
      )
      return foundCategory ? foundCategory.name : "Not Found"
    }

    return "Not Set"
  }

  // Helper function to get the deepest selected category level
  const getDeepestCategory = (blog) => {
    // Check blog-specific category first
    if (blog.blogCategory) return blog.blogCategory
    // Fall back to old multi-level category system
    if (blog.subCategory4) return blog.subCategory4
    if (blog.subCategory3) return blog.subCategory3
    if (blog.subCategory2) return blog.subCategory2
    if (blog.subCategory1) return blog.subCategory1
    return blog.mainCategory
  }

  const getSubCategoryName = (subCategory) => {
    if (!subCategory) return "Not Set"

    // If subCategory is already populated (object with name)
    if (typeof subCategory === "object" && subCategory.name) {
      return subCategory.name
    }

    // If subCategory is just an ID, try to find it in subCategories array
    if (typeof subCategory === "string") {
      const foundSubCategory = subCategories.find(
        (subCat) =>
          subCat._id === subCategory || subCat.id === subCategory || String(subCat._id) === String(subCategory),
      )
      return foundSubCategory ? foundSubCategory.name : "Not Found"
    }

    return "Not Set"
  }

  const getTopicName = (topic) => {
    if (!topic) return "Not Set"

    // If topic is already populated (object with name)
    if (typeof topic === "object" && topic.name) {
      return topic.name
    }

    // If topic is just an ID, try to find it in topics array
    if (typeof topic === "string") {
      const foundTopic = topics.find((t) => t._id === topic || t.id === topic || String(t._id) === String(topic))
      return foundTopic ? foundTopic.name : "Not Found"
    }

    return "Not Set"
  }

  const getBrandName = (brand) => {
    if (!brand) return "Not Set"

    // If brand is already populated (object with name)
    if (typeof brand === "object" && brand.name) {
      return brand.name
    }

    // If brand is just an ID, try to find it in brands array
    if (typeof brand === "string") {
      const foundBrand = brands.find((b) => b._id === brand || b.id === brand || String(b._id) === String(brand))
      return foundBrand ? foundBrand.name : "Not Found"
    }

    return "Not Set"
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`${config.API_URL}/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("Blog deleted successfully!", "success")
        fetchAllData()
      } catch (error) {
        console.error("Error deleting blog:", error)
        showToast("Failed to delete blog", "error")
      }
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken")
      await axios.patch(
        `${config.API_URL}/api/blogs/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      showToast("Blog status updated successfully!", "success")
      fetchAllData()
    } catch (error) {
      console.error("Error updating blog status:", error)
      showToast("Failed to update blog status", "error")
    }
  }

  const filteredBlogs = Array.isArray(blogs)
    ? blogs.filter((blog) => {
        const matchesSearch =
          blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.blogName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          false
        const matchesStatus = statusFilter === "all" || blog.status === statusFilter

        // Updated category matching to handle both populated and non-populated data
        const blogCategoryId =
          blog.blogCategory && typeof blog.blogCategory === "object"
            ? blog.blogCategory._id
            : blog.blogCategory || (blog.mainCategory && typeof blog.mainCategory === "object"
            ? blog.mainCategory._id
            : blog.mainCategory)
        const matchesCategory = categoryFilter === "all" || blogCategoryId === categoryFilter

        return matchesSearch && matchesStatus && matchesCategory
      })
    : []

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blogs...</p>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blogs</h1>
              <p className="text-gray-600 mt-2">Manage your blog posts and content</p>
            </div>
            <Link
              to="/admin/blogs/add"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add New Blog
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                  <p className="text-3xl font-bold text-gray-900">{blogs.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Tag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-3xl font-bold text-green-600">
                    {blogs.filter((blog) => blog.status === "published").length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {blogs.filter((blog) => blog.status === "draft").length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Edit className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {blogs.reduce((total, blog) => total + (blog.views || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id || category.id} value={category._id || category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Blogs List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredBlogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Tag size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first blog post"}
                </p>
                <Link
                  to="/admin/add-blog"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Add First Blog
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blog
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visibility
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBlogs.map((blog) => {
                      console.log("Rendering blog:", blog) // Debug log
                      const blogId = blog._id || blog.id
                      console.log("Blog ID for edit:", blogId) // Debug log for edit button
                      
                      if (!blogId) {
                        console.error("Blog missing ID:", blog)
                        return null
                      }
                      
                      return (
                        <tr key={blogId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {blog.mainImage && (
                                <img
                                  src={getFullImageUrl(blog.mainImage) || "/placeholder.svg"}
                                  alt={blog.title}
                                  className="h-12 w-12 rounded-lg object-cover mr-4"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {blog.title || blog.blogName}
                                </div>
                                <div className="text-sm text-gray-500">/{blog.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {(() => {
                                const deepestCategory = getDeepestCategory(blog)
                                if (!deepestCategory) return "Not Set"
                                
                                // If it's blogCategory, show it directly
                                if (deepestCategory === blog.blogCategory) {
                                  return getCategoryName(blog.blogCategory)
                                }
                                
                                // If it's mainCategory (no subcategories selected)
                                if (deepestCategory === blog.mainCategory) {
                                  return getCategoryName(blog.mainCategory)
                                }
                                
                                // It's a subcategory
                                return getSubCategoryName(deepestCategory)
                              })()}
                            </div>
                            {blog.topic && (
                              <div className="text-xs text-gray-500">Topic: {getTopicName(blog.topic)}</div>
                            )}
                            {blog.brand && (
                              <div className="text-xs text-blue-500">Brand: {getBrandName(blog.brand)}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User size={16} className="text-gray-400 mr-1" />
                              <span className="text-sm text-gray-900">{blog.postedBy || blog.author || "Mr FZ"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <select
                              value={blog.status}
                              onChange={(e) => handleStatusChange(blogId, e.target.value)}
                              className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${
                                blog.status === "published"
                                  ? "bg-green-100 text-green-800"
                                  : blog.status === "draft"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="archived">Archived</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {blog.featured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 w-fit">
                                  ⭐ Featured
                                </span>
                              )}
                              {blog.trending && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 w-fit">
                                  🔥 Trending
                                </span>
                              )}
                              {!blog.featured && !blog.trending && (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center">
                                <Eye size={14} className="mr-1" />
                                {blog.views || 0}
                              </div>
                              <div>{blog.readMinutes || 5}min</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar size={14} className="mr-1" />
                              {formatDate(blog.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/admin/blogs/edit/${blogId}`}
                                className="text-blue-600 hover:text-blue-900 p-1 inline-flex items-center justify-center"
                                onClick={(e) => {
                                  console.log("Edit button clicked, blogId:", blogId)
                                  console.log("Navigating to:", `/admin/blogs/edit/${blogId}`)
                                }}
                                title="Edit Blog"
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                onClick={() => handleDelete(blogId)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete Blog"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminBlogs
