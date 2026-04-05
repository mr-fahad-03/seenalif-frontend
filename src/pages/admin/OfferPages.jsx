"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { FaEdit, FaTrash, FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import config from "../../config/config"
import { getFullImageUrl } from "../../utils/imageUtils"

const OfferPages = () => {
  const [offerPages, setOfferPages] = useState([])
  const [pagesLoading, setPagesLoading] = useState(true)
  const [savingPages, setSavingPages] = useState(false)
  const [selectedPage, setSelectedPage] = useState(null)
  const [activeTab, setActiveTab] = useState('products')
  const [offerProducts, setOfferProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [offerBrands, setOfferBrands] = useState([])
  const [brandsLoading, setBrandsLoading] = useState(false)
  const [offerCategories, setOfferCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const scrollContainerRef = useRef(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchOfferPages()
  }, [])

  const fetchOfferPages = async () => {
    try {
      setPagesLoading(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${config.API_URL}/api/offer-pages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOfferPages(data)
      } else {
        showToast("Failed to load offer pages", "error")
      }
    } catch (error) {
      console.error("Error fetching offer pages:", error)
      showToast("Failed to load offer pages", "error")
    } finally {
      setPagesLoading(false)
    }
  }

  const fetchPageProducts = async (pageSlug) => {
    try {
      setProductsLoading(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${config.API_URL}/api/offer-products/page/${pageSlug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOfferProducts(data)
      } else {
        showToast("Failed to load products", "error")
      }
    } catch (error) {
      console.error("Error fetching page products:", error)
      showToast("Failed to load products", "error")
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchPageBrands = async (pageSlug) => {
    try {
      setBrandsLoading(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${config.API_URL}/api/offer-brands/page/${pageSlug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOfferBrands(data)
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
      const response = await fetch(`${config.API_URL}/api/offer-categories/page/${pageSlug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOfferCategories(data)
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
    setActiveTab('products')
    fetchPageProducts(page.slug)
    fetchPageBrands(page.slug)
    fetchPageCategories(page.slug)
  }

  const handlePageToggle = async (pageId) => {
    try {
      setSavingPages(true)
      const token = localStorage.getItem("adminToken")

      const page = offerPages.find(p => p._id === pageId)
      const newStatus = !page.isActive

      const response = await fetch(`${config.API_URL}/api/offer-pages/${pageId}`, {
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
        setOfferPages(offerPages.map(p => 
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
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.75 // Scroll 75% of visible width
      const newScrollPosition = container.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount)
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      })
    }
  }

  const deleteOfferProduct = async (id) => {
    if (window.confirm("Are you sure you want to remove this product from the offer page?")) {
      try {
        const token = localStorage.getItem("adminToken")
        const response = await fetch(`${config.API_URL}/api/offer-products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setOfferProducts(offerProducts.filter((product) => product._id !== id))
          showToast("Product removed successfully", "success")
        } else {
          showToast("Failed to remove product", "error")
        }
      } catch (error) {
        console.error("Error removing product:", error)
        showToast("Error removing product", "error")
      }
    }
  }

  const handleToggleProductStatus = async (productId) => {
    try {
      const token = localStorage.getItem("adminToken")
      const product = offerProducts.find(p => p._id === productId)
      const newStatus = !product.isActive

      const response = await fetch(`${config.API_URL}/api/offer-products/${productId}`, {
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
        const updatedProduct = await response.json()
        setOfferProducts(offerProducts.map(p => 
          p._id === productId ? updatedProduct : p
        ))
        showToast(
          `Product ${newStatus ? "activated" : "deactivated"} successfully`,
          "success"
        )
      } else {
        showToast("Failed to update product status", "error")
      }
    } catch (error) {
      console.error("Error updating product status:", error)
      showToast("Failed to update product status", "error")
    }
  }

  const deleteOfferBrand = async (id) => {
    if (window.confirm("Are you sure you want to remove this brand from the offer page?")) {
      try {
        const token = localStorage.getItem("adminToken")
        const response = await fetch(`${config.API_URL}/api/offer-brands/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setOfferBrands(offerBrands.filter((brand) => brand._id !== id))
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
      const brand = offerBrands.find(b => b._id === brandId)
      const newStatus = !brand.isActive

      const response = await fetch(`${config.API_URL}/api/offer-brands/${brandId}`, {
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
        setOfferBrands(offerBrands.map(b => 
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

  const deleteOfferCategory = async (id) => {
    if (window.confirm("Are you sure you want to remove this category from the offer page?")) {
      try {
        const token = localStorage.getItem("adminToken")
        const response = await fetch(`${config.API_URL}/api/offer-categories/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setOfferCategories(offerCategories.filter((category) => category._id !== id))
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
      const category = offerCategories.find(c => c._id === categoryId)
      const newStatus = !category.isActive

      const response = await fetch(`${config.API_URL}/api/offer-categories/${categoryId}`, {
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
        setOfferCategories(offerCategories.map(c => 
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
            <h1 className="text-3xl font-bold text-gray-900">All Offer Pages</h1>
            <Link
              to="/admin/offer-pages/add"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FaPlus /> Add Offer Page
            </Link>
          </div>

          {/* Offer Pages Slider */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">All Offer Pages</h2>
                <p className="text-sm text-gray-600 mt-1">
                  All pages: {offerPages.length} | Active: {offerPages.filter(p => p.isActive).length} | 
                  Inactive: {offerPages.filter(p => !p.isActive).length}
                </p>
              </div>
              <p className="text-sm text-gray-600">Click on a page to view its products</p>
            </div>

            {pagesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading offer pages...</p>
              </div>
            ) : offerPages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No offer pages found. Create your first offer page!</p>
                <Link
                  to="/admin/offer-pages/add"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FaPlus /> Add Offer Page
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
                  className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8"
                  style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none'
                  }}
                >
                  {offerPages.map((page) => (
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
                          to={`/admin/offer-pages/edit/${page._id}`}
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
                    {activeTab === 'products' && `Products in "${selectedPage.name}"`}
                    {activeTab === 'brands' && `Brands in "${selectedPage.name}"`}
                    {activeTab === 'categories' && `Categories in "${selectedPage.name}"`}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {activeTab === 'products' && `${offerProducts.length} product(s) in this offer page`}
                    {activeTab === 'brands' && 'Manage brands for this offer page'}
                    {activeTab === 'categories' && 'Manage categories for this offer page'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'products'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Products
                  </button>
                  {/*
                  <button
                    onClick={() => setActiveTab('brands')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'brands'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Brands
                  </button>
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
                  */}
                </div>
              </div>

              {/* Add Button based on active tab */}
              <div className="mb-6">
                {activeTab === 'products' && (
                  <Link
                    to={`/admin/offer-products/add?page=${selectedPage.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FaPlus /> Add Products
                  </Link>
                )}
                {/*
                {activeTab === 'brands' && (
                  <Link
                    to={`/admin/offer-brands/add?page=${selectedPage.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FaPlus /> Add Brands
                  </Link>
                )}
                {activeTab === 'categories' && (
                  <Link
                    to={`/admin/offer-categories/add?page=${selectedPage.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FaPlus /> Add Categories
                  </Link>
                )}
                */}
              </div>

              {/* Products Tab Content */}
              {activeTab === 'products' && productsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              ) : activeTab === 'products' && offerProducts.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-600">No products added to this offer page yet.</p>
                  <Link
                    to={`/admin/offer-products/add?page=${selectedPage.slug}`}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaPlus /> Add Products
                  </Link>
                </div>
              ) : activeTab === 'products' ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Price
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
                      {offerProducts.map((item) => (
                        <tr key={item._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.product?.mainImage && (
                                <img
                                  src={getFullImageUrl(item.product.mainImage || item.product.image)}
                                  alt={item.product?.name}
                                  className="h-10 w-10 rounded object-cover mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.product?.name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  SKU: {item.product?.sku || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${item.product?.price || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleProductStatus(item._id)}
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
                              onClick={() => deleteOfferProduct(item._id)}
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

              {/* Brands Tab Content */}
              {activeTab === 'brands' && brandsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading brands...</p>
                </div>
              ) : activeTab === 'brands' && offerBrands.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-600">No brands added to this offer page yet.</p>
                  <Link
                    to={`/admin/offer-brands/add?page=${selectedPage.slug}`}
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
                      {offerBrands.map((item) => (
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
                              onClick={() => deleteOfferBrand(item._id)}
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
              ) : activeTab === 'categories' && offerCategories.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-600">No categories added to this offer page yet.</p>
                  <Link
                    to={`/admin/offer-categories/add?page=${selectedPage.slug}`}
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
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {offerCategories.map((item) => (
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
                              onClick={() => deleteOfferCategory(item._id)}
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

          {!selectedPage && !pagesLoading && offerPages.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-800">
                Click on an offer page above to view and manage its products
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OfferPages
