"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ImageUpload from "../../components/ImageUpload"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { getFullImageUrl } from "../../utils/imageUtils"

import config from "../../config/config"

const debugBanners = (...args) => {
  if (import.meta?.env?.VITE_DEBUG_BANNERS === "true") {
    console.log("[DEBUG_BANNERS_ADMIN]", ...args)
  }
}

const AdminBanners = () => {
  const [banners, setBanners] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    buttonText: "Shop Now",
    buttonLink: "/shop",
    position: "hero",
    section: "", // Add section field
    link: "", // Add direct link field
    category: "",
    discount: "",
    isActive: true,
    sortOrder: 0,
    validFrom: "",
    validUntil: "",
    deviceType: "desktop",
  })

  const positions = [
    { value: "hero", label: "Hero Section (Main Slider)" },
    // { value: "category", label: "Category Section" },
    // { value: "promotional", label: "Promotional Section" },
    // { value: "footer", label: "Footer Section" },
    // Home Page Sections - Desktop
    { value: "top-triple", label: "🏠 Top 3 Banners Section (Desktop)" },
    { value: "hp-dell-desktop", label: "🏠 HP & Dell Section (Desktop)" },
    { value: "acer-asus-desktop", label: "🏠 Acer & ASUS Section (Desktop)" },
    { value: "msi-lenovo-desktop", label: "🏠 MSI & Lenovo Section (Desktop)" },
    { value: "apple-samsung-desktop", label: "🏠 Apple & Samsung Section (Desktop)" },
    // Home Page Sections - Mobile
    { value: "top-mobile", label: "📱 Top 2 Banners Section (Mobile)" },
    { value: "hp-mobile", label: "📱 HP Banner Section (Mobile)" },
    { value: "asus-mobile", label: "📱 ASUS Banner Section (Mobile)" },
    { value: "msi-mobile", label: "📱 MSI Banner Section (Mobile)" },
    { value: "apple-mobile", label: "📱 Apple Banner Section (Mobile)" },
    // Home Page Sections - Category Banners (Both)
    { value: "accessories", label: "🏠 Accessories Section (Full Width)" },
    { value: "networking", label: "🏠 Networking Section (Full Width)" },
  ]

  useEffect(() => {
    fetchBanners()
    fetchCategories()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/banners/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setBanners(data)
      setLoading(false)
    } catch (error) {
      console.error("Banner fetch error:", error)
      setError("Failed to load banners. Please try again later.")
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setCategories(data)
    } catch (error) {
      console.error("Categories fetch error:", error)
    }
  }

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, image: imageUrl })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("adminToken")

      debugBanners("submit:start", {
        editingId: editingBanner?._id,
        position: formData.position,
        deviceType: formData.deviceType,
        buttonLink: formData.buttonLink,
        link: formData.link,
        title: formData.title,
      })
      
      // Auto-map position to section and position for home banners
      let finalPosition = formData.position
      let finalSection = formData.section
      
      // If position is one of the home sections, use it as section name
      const homeSections = ['top-triple', 'top-mobile', 'hp-mobile', 'hp-dell-desktop', 'asus-mobile', 
                           'acer-asus-desktop', 'accessories', 'msi-mobile', 'msi-lenovo-desktop', 
                           'apple-mobile', 'apple-samsung-desktop', 'networking']
      
      if (homeSections.includes(formData.position)) {
        finalSection = formData.position // Section name is the same as position
        // Determine the position type based on the section
        if (['top-triple', 'top-mobile'].includes(formData.position)) {
          finalPosition = 'home-top-triple'
        } else if (['hp-mobile', 'asus-mobile', 'msi-mobile', 'apple-mobile'].includes(formData.position)) {
          finalPosition = 'home-brand-single'
        } else if (['hp-dell-desktop', 'acer-asus-desktop', 'msi-lenovo-desktop', 'apple-samsung-desktop'].includes(formData.position)) {
          finalPosition = 'home-brand-dual'
        } else if (['accessories', 'networking'].includes(formData.position)) {
          finalPosition = 'home-category-banner'
        }
      }

      debugBanners("submit:mappedPosition", {
        selectedPosition: formData.position,
        finalPosition,
        finalSection,
      })
      
      const bannerData = {
        ...formData,
        position: finalPosition,
        section: finalSection,
        sortOrder: Number.parseInt(formData.sortOrder) || 0,
        discount: formData.discount ? Number.parseFloat(formData.discount) : null,
        validFrom: formData.validFrom ? new Date(formData.validFrom) : new Date(),
        validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
        category: formData.position === "category" ? formData.category : null,
      }

      debugBanners("submit:payload", {
        url: editingBanner
          ? `${config.API_URL}/api/banners/${editingBanner._id}`
          : `${config.API_URL}/api/banners`,
        method: editingBanner ? "PUT" : "POST",
        payload: {
          position: bannerData.position,
          section: bannerData.section,
          deviceType: bannerData.deviceType,
          buttonLink: bannerData.buttonLink,
          link: bannerData.link,
          title: bannerData.title,
        },
      })

      if (editingBanner) {
        const res = await axios.put(`${config.API_URL}/api/banners/${editingBanner._id}`, bannerData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        debugBanners("submit:response", {
          id: res.data?._id,
          position: res.data?.position,
          section: res.data?.section,
          deviceType: res.data?.deviceType,
          buttonLink: res.data?.buttonLink,
          link: res.data?.link,
        })
      } else {
        const res = await axios.post(`${config.API_URL}/api/banners`, bannerData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        debugBanners("submit:response", {
          id: res.data?._id,
          position: res.data?.position,
          section: res.data?.section,
          deviceType: res.data?.deviceType,
          buttonLink: res.data?.buttonLink,
          link: res.data?.link,
        })
      }

      fetchBanners()
      setShowForm(false)
      setEditingBanner(null)
      resetForm()
    } catch (error) {
      console.error("Banner save error:", error)
      setError("Failed to save banner. Please try again.")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      image: "",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      position: "hero",
      section: "",
      link: "",
      category: "",
      discount: "",
      isActive: true,
      sortOrder: 0,
      validFrom: "",
      validUntil: "",
      deviceType: "desktop",
    })
  }

  const handleEdit = (banner) => {
    setEditingBanner(banner)

    debugBanners("edit:open", {
      id: banner?._id,
      position: banner?.position,
      section: banner?.section,
      deviceType: banner?.deviceType,
      buttonLink: banner?.buttonLink,
      link: banner?.link,
      title: banner?.title,
    })
    
    // If banner has a section that matches one of our home sections, show that in position dropdown
    let displayPosition = banner.position
    const homeSections = ['top-triple', 'top-mobile', 'hp-mobile', 'hp-dell-desktop', 'asus-mobile', 
                         'acer-asus-desktop', 'accessories', 'msi-mobile', 'msi-lenovo-desktop', 
                         'apple-mobile', 'apple-samsung-desktop', 'networking']
    
    if (banner.section && homeSections.includes(banner.section)) {
      displayPosition = banner.section // Show section name in position dropdown
    }
    
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      image: banner.image,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      position: displayPosition,
      section: banner.section || "",
      link: banner.link || "",
      category: banner.category?._id || "",
      discount: banner.discount || "",
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
      validFrom: banner.validFrom ? new Date(banner.validFrom).toISOString().split("T")[0] : "",
      validUntil: banner.validUntil ? new Date(banner.validUntil).toISOString().split("T")[0] : "",
      deviceType: banner.deviceType || "desktop",
    })
    setShowForm(true)
  }

  const handleDelete = async (bannerId) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`${config.API_URL}/api/banners/${bannerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        fetchBanners()
      } catch (error) {
        console.error("Banner delete error:", error)
        setError("Failed to delete banner. Please try again.")
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBanner(null)
    resetForm()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-lime-400 text-black font-medium py-2 px-4 rounded-md flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Add New Banner
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{editingBanner ? "Edit Banner" : "Add New Banner"}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Banner title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Banner subtitle"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Banner description"
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <ImageUpload onImageUpload={handleImageUpload} currentImage={formData.image} label="Banner Image (WebP only)" isBanner={true} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Shop Now"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="shop (without language prefix)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {positions.map((position) => (
                      <option key={position.value} value={position.value}>
                        {position.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner Device</label>
                  <select
                    value={formData.deviceType}
                    onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
              </div>

              {/* Direct Link field for home page banners */}
              {(formData.position === 'top-triple' || formData.position === 'top-mobile' || 
                formData.position === 'hp-mobile' || formData.position === 'hp-dell-desktop' ||
                formData.position === 'asus-mobile' || formData.position === 'acer-asus-desktop' ||
                formData.position === 'accessories' || formData.position === 'msi-mobile' ||
                formData.position === 'msi-lenovo-desktop' || formData.position === 'apple-mobile' ||
                formData.position === 'apple-samsung-desktop' || formData.position === 'networking') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Direct Link <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="product-category/accessories (without language prefix)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the path WITHOUT language prefix (ae-en/ae-ar). Examples: brand/hp, product-category/laptops, shop
                  </p>
                </div>
              )}

              {formData.position === "category" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={formData.position === "category"}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until (Optional)</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingBanner ? "Update" : "Create"} Banner
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Banner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {banners.length > 0 ? (
                    banners.map((banner) => (
                      <tr key={banner._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-20 flex-shrink-0">
                              <img
                                src={getFullImageUrl(banner.image) || "/placeholder.svg"}
                                alt={banner.title}
                                className="h-12 w-20 rounded-md object-cover"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg"
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                              <div className="text-sm text-gray-500">{banner.subtitle}</div>
                              {banner.discount && <div className="text-xs text-green-600">{banner.discount}% OFF</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (banner.deviceType || 'desktop').toLowerCase() === 'desktop' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {positions.find((p) => p.value === banner.position)?.label || banner.position}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {banner.section ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              {banner.section}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (banner.deviceType || 'desktop').toLowerCase() === 'desktop' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {banner.deviceType || 'desktop'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              banner.isActive && (!banner.validUntil || new Date(banner.validUntil) >= new Date())
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {banner.isActive && (!banner.validUntil || new Date(banner.validUntil) >= new Date()) ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEdit(banner)} className="text-blue-600 hover:text-blue-900 mr-4">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(banner._id)} className="text-red-600 hover:text-red-900">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No banners found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBanners
