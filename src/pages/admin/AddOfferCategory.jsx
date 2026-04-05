import { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { ArrowLeft, Search } from "lucide-react"
import axios from "axios"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"

const AddOfferCategory = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [offerPages, setOfferPages] = useState([])
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    offerPageSlug: searchParams.get("page") || "",
    categories: [],
    isActive: true,
    order: 1,
  })
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    fetchOfferPages()
    fetchCategories()
    if (id) {
      setIsEdit(true)
      fetchOfferCategory(id)
    }
  }, [id])

  const fetchOfferPages = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/offer-pages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOfferPages(data)
    } catch (error) {
      showToast("Failed to load offer pages", "error")
    }
  }

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/categories/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCategories(data)
    } catch (error) {
      showToast("Failed to load categories", "error")
    } finally {
      setCategoriesLoading(false)
    }
  }

  const fetchOfferCategory = async (categoryId) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/offer-categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFormData({
        offerPageSlug: data.offerPageSlug || "",
        categories: [data.category?._id] || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order || 1,
      })
    } catch (error) {
      showToast("Failed to load offer category for editing", "error")
      navigate("/admin/offer-pages")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleCategoryToggle = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      if (isEdit && id) {
        const selectedCat = categories.find(c => c._id === formData.categories[0])
        await axios.put(`${config.API_URL}/api/offer-categories/${id}`, {
          offerPageSlug: formData.offerPageSlug,
          category: formData.categories[0],
          categoryType: selectedCat?.type === 'category' ? 'Category' : 'SubCategory',
          isActive: formData.isActive,
          order: formData.order,
        }, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Category updated successfully!", "success")
      } else {
        let successCount = 0
        let failCount = 0
        
        for (let i = 0; i < formData.categories.length; i++) {
          try {
            const selectedCat = categories.find(c => c._id === formData.categories[i])
            await axios.post(`${config.API_URL}/api/offer-categories`, {
              offerPageSlug: formData.offerPageSlug,
              category: formData.categories[i],
              categoryType: selectedCat?.type === 'category' ? 'Category' : 'SubCategory',
              isActive: formData.isActive,
              order: formData.order + i,
            }, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            })
            successCount++
          } catch (err) {
            failCount++
          }
        }
        
        if (successCount > 0) {
          showToast(`${successCount} category(ies) added successfully!`, "success")
        }
        if (failCount > 0) {
          showToast(`${failCount} category(ies) failed (may already exist)`, "warning")
        }
      }
      navigate("/admin/offer-pages")
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to save category",
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to remove this category from the offer page?")) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`${config.API_URL}/api/offer-categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("Category removed successfully!", "success")
        navigate("/admin/offer-pages")
      } catch (error) {
        showToast("Failed to remove category", "error")
      }
    }
  }

  const filteredCategories = categories.filter((category) => {
    if (!searchTerm.trim()) return true // Show all if no search term
    return category.name?.toLowerCase() === searchTerm.toLowerCase()
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate("/admin/offer-pages")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Offer Pages
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? "Edit Category" : "Add Categories to Offer Page"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEdit ? "Update category assignment" : "Select multiple categories to add at once"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Page
                </label>
                <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-lg font-semibold text-blue-900">
                    {offerPages.find(p => p.slug === formData.offerPageSlug)?.name || formData.offerPageSlug || "Loading..."}
                  </p>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Categories *
                </label>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search categories by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category List */}
                <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto custom-scrollbar">
                  {categoriesLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                      <p className="text-gray-600">Loading categories...</p>
                    </div>
                  ) : filteredCategories.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No categories found
                    </div>
                  ) : (
                    filteredCategories.map((category) => (
                      <label
                        key={category._id}
                        className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0 ${
                          category.level > 0 ? `pl-${3 + category.level * 4}` : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category._id)}
                          onChange={() => handleCategoryToggle(category._id)}
                          disabled={isEdit}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <div className="ml-3 flex items-center gap-3 flex-1">
                          {category.image && (
                            <img
                              src={getFullImageUrl(category.image)}
                              alt={category.name}
                              className="h-10 w-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className={`text-sm ${category.level === 0 ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                              {category.displayName || category.name}
                            </p>
                            {category.level > 0 && (
                              <span className="text-xs text-gray-500">Level {category.level}</span>
                            )}
                          </div>
                        </div>
                        {!category.isActive && (
                          <span className="ml-2 px-2 py-1 text-xs rounded bg-gray-200 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>
                
                <p className="mt-2 text-sm text-gray-500">
                  {formData.categories.length} category(ies) selected
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Active
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || formData.categories.length === 0}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-started"
                >
                  {loading ? "Saving..." : isEdit ? "Update Category" : "Add Categories"}
                </button>
                
                {isEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-6 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => navigate("/admin/offer-pages")}
                  className="px-6 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddOfferCategory
