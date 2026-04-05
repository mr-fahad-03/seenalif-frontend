import { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { ArrowLeft, Search } from "lucide-react"
import axios from "axios"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"

// Helper function to get category level label
const getCategoryLevelLabel = (category) => {
  if (category.type === 'category') {
    return 'Parent Category'
  }
  // SubCategory with level field
  if (category.level === 1) return 'SubCategory Level 1'
  if (category.level === 2) return 'SubCategory Level 2'
  if (category.level === 3) return 'SubCategory Level 3'
  if (category.level === 4) return 'SubCategory Level 4'
  return 'SubCategory'
}

const AddGamingZoneCategory = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [gamingZonePages, setGamingZonePages] = useState([])
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    gamingZonePageSlug: searchParams.get("page") || "",
    categories: [],
    isActive: true,
    order: 1,
  })
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    fetchGamingZonePages()
    fetchCategories()
    if (id) {
      setIsEdit(true)
      fetchGamingZoneCategory(id)
    }
  }, [id])

  const fetchGamingZonePages = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/gaming-zone-pages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setGamingZonePages(data)
    } catch (error) {
      showToast("Failed to load gaming zone pages", "error")
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

  const fetchGamingZoneCategory = async (categoryId) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/gaming-zone-categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFormData({
        gamingZonePageSlug: data.gamingZonePageSlug || "",
        categories: [data.category?._id] || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order || 1,
      })
    } catch (error) {
      showToast("Failed to load gaming zone category for editing", "error")
      navigate("/admin/gaming-zone")
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
        await axios.put(`${config.API_URL}/api/gaming-zone-categories/${id}`, {
          gamingZonePageSlug: formData.gamingZonePageSlug,
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
            await axios.post(`${config.API_URL}/api/gaming-zone-categories`, {
              gamingZonePageSlug: formData.gamingZonePageSlug,
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
      navigate("/admin/gaming-zone")
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
    if (window.confirm("Are you sure you want to remove this category from the gaming zone page?")) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`${config.API_URL}/api/gaming-zone-categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("Category removed successfully!", "success")
        navigate("/admin/gaming-zone")
      } catch (error) {
        showToast("Failed to remove category", "error")
      }
    }
  }

  const filteredCategories = categories.filter((category) => {
    if (!searchTerm.trim()) return true
    return category.name?.toLowerCase() === searchTerm.toLowerCase()
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate("/admin/gaming-zone")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Gaming Zone Pages
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? "Edit Category" : "Add Categories to Gaming Zone"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEdit ? "Update category assignment" : "Select categories - products will be auto-fetched"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gaming Zone Page
                </label>
                <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-lg font-semibold text-green-900">
                    {gamingZonePages.find(p => p.slug === formData.gamingZonePageSlug)?.name || formData.gamingZonePageSlug || "Loading..."}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Auto-Fetch Feature:</strong> Products from selected categories (including all subcategories) 
                  will be automatically displayed on the gaming zone page.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Categories *
                </label>
                
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
                        className="flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category._id)}
                          onChange={() => handleCategoryToggle(category._id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={isEdit}
                        />
                        <div className="ml-3 flex items-center flex-1">
                          {category.image && (
                            <img
                              src={getFullImageUrl(category.image)}
                              alt={category.name}
                              className="h-10 w-10 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {category.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                category.type === 'category' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : category.level === 1
                                  ? 'bg-blue-100 text-blue-800'
                                  : category.level === 2
                                  ? 'bg-green-100 text-green-800'
                                  : category.level === 3
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {getCategoryLevelLabel(category)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>

                {formData.categories.length > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    {formData.categories.length} category(ies) selected
                  </p>
                )}
              </div>

              <div className="flex justify-between gap-4 pt-4 border-t">
                <div>
                  {isEdit && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                      disabled={loading}
                    >
                      Remove Category
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/gaming-zone")}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || formData.categories.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {loading ? "Saving..." : isEdit ? "Update Category" : "Add Categories"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddGamingZoneCategory
