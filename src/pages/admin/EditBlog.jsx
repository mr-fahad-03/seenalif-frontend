"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ImageUpload from "../../components/ImageUpload"
import TipTapEditor from "../../components/TipTapEditor"
import { ArrowLeft, X, User, Clock, Tag, Save } from "lucide-react"
import axios from "axios"
import { getFullImageUrl } from "../../utils/imageUtils"

import config from "../../config/config"
const EditBlog = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [topics, setTopics] = useState([])
  const [brands, setBrands] = useState([])

  const [formData, setFormData] = useState({
    blogName: "",
    title: "",
    slug: "",
    status: "draft",
    featured: false,
    trending: false,
    blogCategory: "",
    topic: "",
    brand: "",
    mainImage: "",
    additionalImage: "",
    readMinutes: 5,
    postedBy: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    schema: "",
    tags: [],
  })

  useEffect(() => {
    fetchBlogData()
    fetchAllData()
  }, [id])

  const fetchBlogData = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      
      if (!id) {
        console.error("No blog ID provided")
        showToast("No blog ID provided", "error")
        navigate("/admin/blogs")
        return
      }
      
      console.log("Fetching blog with ID:", id) // Debug log
      
      const response = await axios.get(`${config.API_URL}/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const blog = response.data
      console.log("Fetched blog data:", blog) // Debug log

      setFormData({
        blogName: blog.blogName || blog.title || "",
        title: blog.title || "",
        slug: blog.slug || "",
        status: blog.status || "draft",
        featured: blog.featured || false,
        trending: blog.trending || false,
        blogCategory: blog.blogCategory?._id || "",
        topic: blog.topic?._id || "",
        brand: blog.brand?._id || "",
        mainImage: blog.mainImage || blog.featuredImage || "",
        additionalImage: blog.additionalImage || "",
        readMinutes: blog.readMinutes || 5,
        postedBy: blog.postedBy || blog.author || "Mr FZ",
        description: blog.description || blog.content || "",
        metaTitle: blog.metaTitle || "",
        metaDescription: blog.metaDescription || "",
        schema: blog.schema || "",
        tags: Array.isArray(blog.tags) ? blog.tags : blog.tags ? blog.tags.split(",").map((tag) => tag.trim()) : [],
      })
    } catch (error) {
      console.error("Error fetching blog:", error)
      showToast("Failed to fetch blog data", "error")
      navigate("/admin/blogs")
    }
  }

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const headers = { Authorization: `Bearer ${token}` }

      const [categoriesRes, topicsRes, brandsRes] = await Promise.allSettled([
        axios.get(`${config.API_URL}/api/blog-categories`, { headers }),
        axios.get(`${config.API_URL}/api/blog-topics`, { headers }),
        axios.get(`${config.API_URL}/api/blog-brands`, { headers }),
      ])

      if (categoriesRes.status === "fulfilled") {
        const categoryData = categoriesRes.value.data
        setCategories(Array.isArray(categoryData) ? categoryData : categoryData.blogCategories || categoryData.data || [])
      }

      if (topicsRes.status === "fulfilled") {
        const topicData = topicsRes.value.data
        setTopics(Array.isArray(topicData) ? topicData : topicData.data || [])
      }

      if (brandsRes.status === "fulfilled") {
        const brandData = brandsRes.value.data
        setBrands(Array.isArray(brandData) ? brandData : brandData.blogBrands || brandData.data || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-generate slug from title
    if (name === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleMainImageUpload = (imageUrl) => {
    setFormData((prev) => ({ ...prev, mainImage: imageUrl }))
  }

  const handleAdditionalImageUpload = (imageUrl) => {
    setFormData((prev) => ({ ...prev, additionalImage: imageUrl }))
  }

  const handleDescriptionChange = (content) => {
    setFormData((prev) => ({ ...prev, description: content }))
  }

  const handleTagsChange = (e) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)
    setFormData((prev) => ({ ...prev, tags }))
  }

  const validateForm = () => {
    const errors = []

    if (!formData.title.trim()) {
      errors.push("Title is required")
    }
    if (!formData.blogCategory) {
      errors.push("Blog Category is required")
    }
    if (!formData.postedBy.trim()) {
      errors.push("Posted By is required")
    }
    if (!formData.description.trim()) {
      errors.push("Description is required")
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validate form
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        showToast(validationErrors.join(", "), "error")
        setSaving(false)
        return
      }

      const token = localStorage.getItem("adminToken")
      if (!token) {
        showToast("Please login as admin first", "error")
        navigate("/grabiansadmin/login")
        return
      }

      const blogData = {
        blogName: formData.blogName.trim(),
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        status: formData.status,
        featured: formData.featured,
        trending: formData.trending,
        blogCategory: formData.blogCategory,
        topic: formData.topic || null,
        brand: formData.brand || null,
        mainImage: formData.mainImage,
        additionalImage: formData.additionalImage,
        readMinutes: Number(formData.readMinutes) || 5,
        postedBy: formData.postedBy.trim(),
        description: formData.description.trim(),
        metaTitle: formData.metaTitle.trim(),
        metaDescription: formData.metaDescription.trim(),
        schema: formData.schema,
        tags: formData.tags,
      }

      console.log("Updating blog data:", blogData) // Debug log

      await axios.put(`${config.API_URL}/api/blogs/${id}`, blogData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      showToast("Blog updated successfully!", "success")
      navigate("/admin/blogs")
    } catch (error) {
      console.error("Error updating blog:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to update blog"
      showToast(errorMessage, "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog...</p>
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
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <button onClick={() => navigate("/admin/blogs")} className="hover:text-blue-600 flex items-center gap-1">
                <ArrowLeft size={16} />
                Blogs
              </button>
              <span>/</span>
              <span className="text-gray-900">Edit Blog</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blog Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="blogName"
                    value={formData.blogName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter blog name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blog Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter blog title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      /
                    </span>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="blog-url-slug"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        ⭐ Featured Blog (Show in Hero Slider)
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Featured blogs will appear in the hero slider on the blogs home page
                    </p>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="trending"
                        checked={formData.trending}
                        onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        🔥 Trending Blog (Show in Trending Section)
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Trending blogs will appear in the "Trending This Week" section
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blog Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="blogCategory"
                    value={formData.blogCategory}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Blog Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Topic</option>
                    {topics.map((topic) => (
                      <option key={topic._id} value={topic._id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Read Minutes <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      name="readMinutes"
                      value={formData.readMinutes}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posted By <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      name="postedBy"
                      value={formData.postedBy}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Author name"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Blog Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Main Image</label>
                  <div className="space-y-4">
                    <ImageUpload onImageUpload={handleMainImageUpload} />
                    {formData.mainImage && (
                      <div className="relative">
                        <img
                          src={getFullImageUrl(formData.mainImage) || "/placeholder.svg"}
                          alt="Main blog image"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, mainImage: "" }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Additional Image</label>
                  <div className="space-y-4">
                    <ImageUpload onImageUpload={handleAdditionalImageUpload} />
                    {formData.additionalImage && (
                      <div className="relative">
                        <img
                          src={getFullImageUrl(formData.additionalImage) || "/placeholder.svg"}
                          alt="Additional blog image"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, additionalImage: "" }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Blog Content</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Description <span className="text-red-500">*</span>
                </label>
                <TipTapEditor
                  content={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Write your blog content here..."
                />
              </div>
            </div>

            {/* SEO & Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO & Tags</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SEO title for search engines"
                    maxLength="60"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description for search engines"
                    maxLength="160"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                    <span className="text-gray-500 text-xs ml-2">(comma separated)</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3 text-gray-400" size={16} />
                    <textarea
                      onChange={handleTagsChange}
                      value={formData.tags.join(", ")}
                      rows={2}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="technology, web development, programming"
                    />
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schema Markup (JSON-LD)
                    <span className="text-gray-500 text-xs ml-2">(for Google structured data)</span>
                  </label>
                  <textarea
                    name="schema"
                    value={formData.schema}
                    onChange={handleChange}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder='<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title"
}
</script>'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add custom HTML/JS schema markup for enhanced SEO. Paste your script tags directly - they will be injected into the page head for Google to detect.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/admin/blogs")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? "Updating..." : "Update Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditBlog
