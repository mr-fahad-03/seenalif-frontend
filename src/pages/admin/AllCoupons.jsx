"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Plus, Edit, Trash2, Percent, Calendar, Eye, EyeOff } from "lucide-react"
import Select from 'react-select'

import config from "../../config/config"
const AllCoupons = () => {
  const [coupons, setCoupons] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [filter, setFilter] = useState("all")

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    categories: [],
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
    visibility: "public", // <-- add this line
  })

  useEffect(() => {
    fetchCoupons()
    fetchCategories()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/coupons/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCoupons(data)
      setLoading(false)
    } catch (error) {
      setError("Failed to load coupons. Please try again later.")
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/categories`)
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("adminToken")
      const couponData = {
        ...formData,
        discountValue: Number.parseFloat(formData.discountValue),
        minOrderAmount: Number.parseFloat(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number.parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number.parseInt(formData.usageLimit) : null,
        categories: formData.categories.includes("ALL") ? [] : formData.categories,
        visibility: formData.visibility || "public", // <-- ensure this is sent
      }

      if (editingCoupon) {
        await axios.put(`${config.API_URL}/api/coupons/${editingCoupon._id}`, couponData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await axios.post(`${config.API_URL}/api/coupons`, couponData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      fetchCoupons()
      setShowForm(false)
      setEditingCoupon(null)
      resetForm()
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save coupon. Please try again.")
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      categories: [],
      minOrderAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      validFrom: "",
      validUntil: "",
      isActive: true,
      visibility: "public", // <-- add this line
    })
  }

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      categories: coupon.categories ? coupon.categories.map(cat => cat._id || cat) : [],
      minOrderAmount: coupon.minOrderAmount.toString(),
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      validFrom: new Date(coupon.validFrom).toISOString().split("T")[0],
      validUntil: new Date(coupon.validUntil).toISOString().split("T")[0],
      isActive: coupon.isActive,
      visibility: coupon.visibility || "public", // <-- add this line
    })
    setShowForm(true)
  }

  const handleDelete = async (couponId) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`${config.API_URL}/api/coupons/${couponId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        fetchCoupons()
      } catch (error) {
        setError("Failed to delete coupon. Please try again.")
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCoupon(null)
    resetForm()
  }

  const getStatusBadge = (coupon) => {
    const isExpired = new Date(coupon.validUntil) < new Date()
    const isActive = coupon.isActive && !isExpired

    if (isExpired) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          <EyeOff className="h-3 w-3 mr-1" />
          Expired
        </span>
      )
    } else if (!coupon.isActive) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          <EyeOff className="h-3 w-3 mr-1" />
          Inactive
        </span>
      )
    } else {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          <Eye className="h-3 w-3 mr-1" />
          Active
        </span>
      )
    }
  }

  // Filtering logic
  const filteredCoupons = coupons.filter(coupon => {
    const isExpired = new Date(coupon.validUntil) < new Date();
    const isActive = coupon.isActive && !isExpired;
    if (filter === "all") return true;
    if (filter === "active") return isActive;
    if (filter === "expired") return isExpired || !coupon.isActive;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">All Coupons</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-lime-400 text-black font-medium py-2 px-4 rounded-md flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Add New Coupon
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            className={`px-4 py-2 rounded-md font-medium border ${filter === "all" ? "bg-lime-500 text-white border-lime-500" : "bg-white text-gray-700 border-gray-300"}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium border ${filter === "active" ? "bg-lime-500 text-white border-lime-500" : "bg-white text-gray-700 border-gray-300"}`}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium border ${filter === "expired" ? "bg-lime-500 text-white border-lime-500" : "bg-white text-gray-700 border-gray-300"}`}
            onClick={() => setFilter("expired")}
          >
            Expired/Disabled
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SAVE20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                  <Select
                    isMulti
                    options={[
                      { value: "ALL", label: "All Categories" },
                      ...categories.map(cat => ({ value: cat._id, label: cat.name }))
                    ]}
                    value={
                      formData.categories.includes("ALL")
                        ? [{ value: "ALL", label: "All Categories" }]
                        : categories.filter(cat => formData.categories.includes(cat._id)).map(cat => ({ value: cat._id, label: cat.name }))
                    }
                    onChange={selected => {
                      if (!selected || selected.length === 0) {
                        setFormData({ ...formData, categories: [] })
                      } else if (Array.isArray(selected) && selected.some(option => option.value === "ALL")) {
                        setFormData({ ...formData, categories: ["ALL"] })
                      } else {
                        setFormData({ ...formData, categories: selected.map(option => option.value) })
                      }
                    }}
                    classNamePrefix="react-select"
                    placeholder="Select categories..."
                  />
                </div>
              </div>

              {/* Visibility Radio Buttons */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <div className="flex gap-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === "public"}
                      onChange={() => setFormData({ ...formData, visibility: "public" })}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Public</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === "private"}
                      onChange={() => setFormData({ ...formData, visibility: "private" })}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Private</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the coupon offer"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={formData.discountType === "percentage" ? "20" : "500"}
                    min="0"
                    step={formData.discountType === "percentage" ? "1" : "0.01"}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.discountType === "percentage" ? "%" : "AED"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.discountType === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Discount Amount (Optional)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1000"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (Optional)</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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
                  {editingCoupon ? "Update" : "Create"} Coupon
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
                      Coupon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validity
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
                  {filteredCoupons.length > 0 ? (
                    filteredCoupons.map((coupon) => (
                      <tr key={coupon._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Percent className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                                {coupon.code}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">{coupon.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {coupon.categories.length === 0
                              ? "All Categories"
                              : coupon.categories.map(cat => cat.name).join(", ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {coupon.discountType === "percentage"
                              ? `${coupon.discountValue}%`
                              : `AED ${coupon.discountValue}`}
                          </div>
                          {coupon.minOrderAmount > 0 && (
                            <div className="text-xs text-gray-500">Min: AED {coupon.minOrderAmount}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {coupon.usedCount}/{coupon.usageLimit || "∞"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                              {new Date(coupon.validFrom).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              to {new Date(coupon.validUntil).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(coupon)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEdit(coupon)} className="text-blue-600 hover:text-blue-900 mr-4">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(coupon._id)} className="text-red-600 hover:text-red-900">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No coupons found
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

export default AllCoupons
