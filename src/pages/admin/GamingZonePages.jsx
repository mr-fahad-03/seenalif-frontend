"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { FaEdit, FaTrash, FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import config from "../../config/config"
import { getFullImageUrl } from "../../utils/imageUtils"

// Helper function to get category level label
const getCategoryLevelLabel = (category) => {
  if (!category) return 'N/A'
  if (category.type === 'category' || !category.level) {
    return 'Parent Category'
  }
  // SubCategory with level field
  if (category.level === 1) return 'SubCategory Level 1'
  if (category.level === 2) return 'SubCategory Level 2'
  if (category.level === 3) return 'SubCategory Level 3'
  if (category.level === 4) return 'SubCategory Level 4'
  return 'SubCategory'
}

const GamingZonePages = () => {
  const [gamingZonePages, setGamingZonePages] = useState([])
  const [pagesLoading, setPagesLoading] = useState(true)
  const [savingPages, setSavingPages] = useState(false)
  const [selectedPage, setSelectedPage] = useState(null)
  const [activeTab, setActiveTab] = useState('categories')
  const [gamingZoneBrands, setGamingZoneBrands] = useState([])
  const [brandsLoading, setBrandsLoading] = useState(false)
  const [gamingZoneCategories, setGamingZoneCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const scrollContainerRef = useRef(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchGamingZonePages()
  }, [])

  const fetchGamingZonePages = async () => {
    try {
      setPagesLoading(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${config.API_URL}/api/gaming-zone-pages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGamingZonePages(data)
      } else {
        showToast("Failed to load gaming zone pages", "error")
      }
    } catch (error) {
      console.error("Error fetching gaming zone pages:", error)
      showToast("Failed to load gaming zone pages", "error")
    } finally {
      setPagesLoading(false)
    }
  }

  const fetchPageBrands = async (pageSlug) => {
    try {
      setBrandsLoading(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${config.API_URL}/api/gaming-zone-brands/page/${pageSlug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGamingZoneBrands(data)
      } else {
        showToast("Failed to load brands", "error")
      }
    } catch (error) {
      console.error("Error fetching page brands:", error)
      showToast("Failed to load brands", "error")
    } finally {
      setBrandsLoading(false)
    }
  }

  const fetchPageCategories = async (pageSlug) => {
    try {
      setCategoriesLoading(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${config.API_URL}/api/gaming-zone-categories/page/${pageSlug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGamingZoneCategories(data)
      } else {
        showToast("Failed to load categories", "error")
      }
    } catch (error) {
      console.error("Error fetching page categories:", error)
      showToast("Failed to load categories", "error")
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handlePageClick = (page) => {
    setSelectedPage(page)
    setActiveTab('categories')
    fetchPageBrands(page.slug)
    fetchPageCategories(page.slug)
  }

  const handlePageToggle = async (pageId) => {
    try {
      setSavingPages(true)
      const token = localStorage.getItem("adminToken")

      const page = gamingZonePages.find(p => p._id === pageId)
      const newStatus = !page.isActive

      const response = await fetch(`${config.API_URL}/api/gaming-zone-pages/${pageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: newStatus,
        }),
      })

      if (response.ok) {
        const updatedPage = await response.json()
        setGamingZonePages(gamingZonePages.map(p => 
          p._id === pageId ? updatedPage : p
        ))
        showToast(
          `Page ${newStatus ? "activated" : "deactivated"} successfully`,
          "success"
        )
      } else {
        showToast("Failed to update page status", "error")
      }
    } catch (error) {
      console.error("Error updating page status:", error)
      showToast("Failed to update page status", "error")
    } finally {
      setSavingPages(false)
    }
  }

  const scrollPages = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const newScrollPosition = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      })
    }
  }

  const deleteGamingZoneBrand = async (id) => {
    if (window.confirm("Are you sure you want to remove this brand from the gaming zone page?")) {
      try {
        const token = localStorage.getItem("adminToken")
        const response = await fetch(`${config.API_URL}/api/gaming-zone-brands/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setGamingZoneBrands(gamingZoneBrands.filter((brand) => brand._id !== id))
          showToast("Brand removed successfully", "success")
        } else {
          showToast("Failed to remove brand", "error")
        }
      } catch (error) {
        console.error("Error removing brand:", error)
        showToast("Error removing brand", "error")
      }
    }
  }

  const handleToggleBrandStatus = async (brandId) => {
    try {
      const token = localStorage.getItem("adminToken")
      const brand = gamingZoneBrands.find(b => b._id === brandId)
      const newStatus = !brand.isActive

      const response = await fetch(`${config.API_URL}/api/gaming-zone-brands/${brandId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: newStatus,
        }),
      })

      if (response.ok) {
        const updatedBrand = await response.json()
        setGamingZoneBrands(gamingZoneBrands.map(b => 
          b._id === brandId ? updatedBrand : b
        ))
        showToast(
          `Brand ${newStatus ? "activated" : "deactivated"} successfully`,
          "success"
        )
      } else {
        showToast("Failed to update brand status", "error")
      }
    } catch (error) {
      console.error("Error updating brand status:", error)
      showToast("Failed to update brand status", "error")
    }
  }

  const deleteGamingZoneCategory = async (id) => {
    if (window.confirm("Are you sure you want to remove this category from the gaming zone page?")) {
      try {
        const token = localStorage.getItem("adminToken")
        const response = await fetch(`${config.API_URL}/api/gaming-zone-categories/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setGamingZoneCategories(gamingZoneCategories.filter((category) => category._id !== id))
          showToast("Category removed successfully", "success")
        } else {
          showToast("Failed to remove category", "error")
        }
      } catch (error) {
        console.error("Error removing category:", error)
        showToast("Error removing category", "error")
      }
    }
  }

  const handleToggleCategoryStatus = async (categoryId) => {
    try {
      const token = localStorage.getItem("adminToken")
      const category = gamingZoneCategories.find(c => c._id === categoryId)
      const newStatus = !category.isActive

      const response = await fetch(`${config.API_URL}/api/gaming-zone-categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: newStatus,
        }),
      })

      if (response.ok) {
        const updatedCategory = await response.json()
        setGamingZoneCategories(gamingZoneCategories.map(c => 
          c._id === categoryId ? updatedCategory : c
        ))
        showToast(
          `Category ${newStatus ? "activated" : "deactivated"} successfully`,
          "success"
        )
      } else {
        showToast("Failed to update category status", "error")
      }
    } catch (error) {
      console.error("Error updating category status:", error)
      showToast("Failed to update category status", "error")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gaming Zone Pages</h1>
            <Link
              to="/admin/gaming-zone/add"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FaPlus /> Add Gaming Zone Page
            </Link>
          </div>

          {/* Gaming Zone Pages Slider */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">All Gaming Zone Pages</h2>
                <p className="text-sm text-gray-600 mt-1">
                  All pages: {gamingZonePages.length} | Active: {gamingZonePages.filter(p => p.isActive).length} | 
                  Inactive: {gamingZonePages.filter(p => !p.isActive).length}
                </p>
              </div>
              <p className="text-sm text-gray-600">Click on a page to view its categories and brands</p>
            </div>

            {pagesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading gaming zone pages...</p>
              </div>
            ) : gamingZonePages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No gaming zone pages found. Create your first gaming zone page!</p>
                <Link
                  to="/admin/gaming-zone/add"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FaPlus /> Add Gaming Zone Page
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => scrollPages('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100"
                  disabled={savingPages}
                >
                  <FaChevronLeft className="text-gray-600" />
                </button>

                <div
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-hidden scrollbar-hide scroll-smooth px-8"
                  style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    maxWidth: 'calc(320px * 2.7 + 16px * 2 + 64px)'
                  }}
                >
                  {gamingZonePages.map((page) => (
                    <div
                      key={page._id}
                      onClick={() => handlePageClick(page)}
                      className={`flex-shrink-0 w-80 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPage?._id === page._id
                          ? 'border-blue-600 bg-blue-50'
                          : page.isActive
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{page.name}</h3>
                        </div>
                      </div>

                      {page.heroImage && (
                        <div className="mb-3">
                          <img
                            src={getFullImageUrl(page.heroImage)}
                            alt={page.name}
                            className="w-full h-32 object-cover rounded"
                          />
                        </div>
                      )}

                      {page.cardImages && page.cardImages.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-2">{page.cardImages.length} card(s)</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePageToggle(page._id)
                          }}
                          disabled={savingPages}
                          className={`flex-1 px-3 py-2 text-sm rounded ${
                            page.isActive
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-400 text-white hover:bg-gray-500'
                          } disabled:opacity-50`}
                        >
                          {page.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <Link
                          to={`/admin/gaming-zone/edit/${page._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          <FaEdit />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollPages('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100"
                  disabled={savingPages}
                >
                  <FaChevronRight className="text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* Content Tabs */}
          {selectedPage && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'categories' && `Categories in "${selectedPage.name}"`}
                    {activeTab === 'brands' && `Brands in "${selectedPage.name}"`}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {activeTab === 'categories' && 'Products will be auto-fetched from selected categories'}
                    {activeTab === 'brands' && 'Manage brands for this gaming zone page'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'categories'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Categories
                  </button>
                  {/* <button
                    onClick={() => setActiveTab('brands')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'brands'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Brands
                  </button> */}
                </div>
              </div>

              {/* Add Button based on active tab */}
              <div className="mb-6">
                {activeTab === 'brands' && (
                  <Link
                    to={`/admin/gaming-zone-brands/add?page=${selectedPage.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FaPlus /> Add Brands
                  </Link>
                )}
                {activeTab === 'categories' && (
                  <Link
                    to={`/admin/gaming-zone-categories/add?page=${selectedPage.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FaPlus /> Add Categories
                  </Link>
                )}
              </div>

              {/* Brands Tab Content */}
              {activeTab === 'brands' && brandsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading brands...</p>
                </div>
              ) : activeTab === 'brands' && gamingZoneBrands.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-600">No brands added to this gaming zone page yet.</p>
                  <Link
                    to={`/admin/gaming-zone-brands/add?page=${selectedPage.slug}`}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaPlus /> Add Brands
                  </Link>
                </div>
              ) : activeTab === 'brands' ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Brand
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {gamingZoneBrands.map((item) => (
                        <tr key={item._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.brand?.logo && (
                                <img
                                  src={getFullImageUrl(item.brand.logo)}
                                  alt={item.brand?.name}
                                  className="h-10 w-10 rounded object-contain mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.brand?.name || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleBrandStatus(item._id)}
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                item.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => deleteGamingZoneBrand(item._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {/* Categories Tab Content */}
              {activeTab === 'categories' && categoriesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading categories...</p>
                </div>
              ) : activeTab === 'categories' && gamingZoneCategories.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-600">No categories added to this gaming zone page yet.</p>
                  <Link
                    to={`/admin/gaming-zone-categories/add?page=${selectedPage.slug}`}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaPlus /> Add Categories
                  </Link>
                </div>
              ) : activeTab === 'categories' ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {gamingZoneCategories.map((item) => (
                        <tr key={item._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.category?.image && (
                                <img
                                  src={getFullImageUrl(item.category.image)}
                                  alt={item.category?.name}
                                  className="h-10 w-10 rounded object-cover mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.category?.name || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              item.category?.type === 'category' || !item.category?.level
                                ? 'bg-purple-100 text-purple-800'
                                : item.category?.level === 1
                                ? 'bg-blue-100 text-blue-800'
                                : item.category?.level === 2
                                ? 'bg-green-100 text-green-800'
                                : item.category?.level === 3
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {getCategoryLevelLabel(item.category)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleCategoryStatus(item._id)}
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                item.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => deleteGamingZoneCategory(item._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}

          {!selectedPage && !pagesLoading && gamingZonePages.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-800">
                Click on a gaming zone page above to view and manage its categories and brands. Products will be automatically fetched from the selected categories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GamingZonePages
