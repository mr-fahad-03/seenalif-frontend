import { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { ArrowLeft, Search } from "lucide-react"
import axios from "axios"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"

const AddOfferProduct = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [offerPages, setOfferPages] = useState([])
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    offerPageSlug: searchParams.get("page") || "",
    products: [],
    isActive: true,
    order: 1,
  })
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    fetchOfferPages()
    fetchProducts()
    if (id) {
      setIsEdit(true)
      fetchOfferProduct(id)
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

  const fetchProducts = async () => {
    try {
      setProductsLoading(true)
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProducts(data)
    } catch (error) {
      showToast("Failed to load products", "error")
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchOfferProduct = async (productId) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/offer-products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFormData({
        offerPageSlug: data.offerPageSlug || "",
        products: [data.product?._id] || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order || 1,
      })
    } catch (error) {
      showToast("Failed to load offer product for editing", "error")
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

  const handleProductToggle = (productId) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter((id) => id !== productId)
        : [...prev.products, productId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      if (isEdit && id) {
        await axios.put(`${config.API_URL}/api/offer-products/${id}`, {
          offerPageSlug: formData.offerPageSlug,
          product: formData.products[0],
          isActive: formData.isActive,
          order: formData.order,
        }, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Product updated successfully!", "success")
      } else {
        let successCount = 0
        let failCount = 0
        
        for (let i = 0; i < formData.products.length; i++) {
          try {
            await axios.post(`${config.API_URL}/api/offer-products`, {
              offerPageSlug: formData.offerPageSlug,
              product: formData.products[i],
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
          showToast(`${successCount} product(s) added successfully!`, "success")
        }
        if (failCount > 0) {
          showToast(`${failCount} product(s) failed (may already exist)`, "warning")
        }
      }
      navigate("/admin/offer-pages")
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to save product",
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to remove this product from the offer page?")) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`${config.API_URL}/api/offer-products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("Product removed successfully!", "success")
        navigate("/admin/offer-pages")
      } catch (error) {
        showToast("Failed to remove product", "error")
      }
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              {isEdit ? "Edit Product" : "Add Products to Offer Page"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEdit ? "Update product assignment" : "Select multiple products to add at once"}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Products * {!isEdit && `(${formData.products.length} selected)`}
                </label>
                
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                {!isEdit && formData.products.length > 0 && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{formData.products.length}</strong> product(s) selected. Click "Add Products" to add them all at once.
                    </p>
                  </div>
                )}

                <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
                  {productsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                      <p className="text-gray-600">Loading products...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No products found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <label
                          key={product._id}
                          className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
                            formData.products.includes(product._id) ? 'bg-blue-50' : ''
                          }`}
                        >
                          <input
                            type={isEdit ? "radio" : "checkbox"}
                            checked={formData.products.includes(product._id)}
                            onChange={() => isEdit ? setFormData(prev => ({ ...prev, products: [product._id] })) : handleProductToggle(product._id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3 flex items-center gap-3 flex-1">
                            {product.mainImage && (
                              <img
                                src={getFullImageUrl(product.mainImage || product.image)}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">
                                SKU: {product.sku} | Price: ${product.price}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Active (show in offer page)
                  </span>
                </label>
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
                      Remove Product
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/offer-pages")}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || formData.products.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {loading ? "Saving..." : isEdit ? "Update Product" : `Add ${formData.products.length} Product(s)`}
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

export default AddOfferProduct
