"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { ArrowLeft, Plus, X } from "lucide-react"
import axios from "axios"

import config from "../../config/config"

const AddDeliveryCharge = () => {
  const navigate = useNavigate()
  const { id } = useParams();
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    charge: "",
    minOrderAmount: "",
    maxOrderAmount: "",
    deliveryTime: "1-2 business days",
    applicableAreas: [""],
    isActive: true,
  })
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      // Fetch delivery charge by id
      const fetchDeliveryCharge = async () => {
        try {
          const token =
            localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
          const { data } = await axios.get(`${config.API_URL}/api/delivery-charges/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          setFormData({
            name: data.name || "",
            description: data.description || "",
            charge: data.charge || "",
            minOrderAmount: data.minOrderAmount || "",
            maxOrderAmount: data.maxOrderAmount || "",
            deliveryTime: data.deliveryTime || "1-2 business days",
            applicableAreas: data.applicableAreas && data.applicableAreas.length > 0 ? data.applicableAreas : [""],
            isActive: typeof data.isActive === "boolean" ? data.isActive : true,
          })
        } catch (error) {
          showToast(error.response?.data?.message || "Failed to fetch delivery charge", "error")
        }
      }
      fetchDeliveryCharge()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleAreaChange = (index, value) => {
    const newAreas = [...formData.applicableAreas]
    newAreas[index] = value
    setFormData((prev) => ({
      ...prev,
      applicableAreas: newAreas,
    }))
  }

  const addArea = () => {
    setFormData((prev) => ({
      ...prev,
      applicableAreas: [...prev.applicableAreas, ""],
    }))
  }

  const removeArea = (index) => {
    if (formData.applicableAreas.length > 1) {
      const newAreas = formData.applicableAreas.filter((_, i) => i !== index)
      setFormData((prev) => ({
        ...prev,
        applicableAreas: newAreas,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) {
        showToast("Please login as admin first", "error")
        navigate("/grabiansadmin/login")
        return
      }
      const deliveryChargeData = {
        name: formData.name,
        description: formData.description,
        charge: Number.parseFloat(formData.charge),
        minOrderAmount: formData.minOrderAmount ? Number.parseFloat(formData.minOrderAmount) : 0,
        maxOrderAmount: formData.maxOrderAmount ? Number.parseFloat(formData.maxOrderAmount) : null,
        deliveryTime: formData.deliveryTime,
        applicableAreas: formData.applicableAreas.filter((area) => area.trim() !== ""),
        isActive: formData.isActive,
      }
      if (isEdit) {
        await axios.put(`${config.API_URL}/api/delivery-charges/${id}`, deliveryChargeData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Delivery charge updated successfully!", "success")
      } else {
        await axios.post(`${config.API_URL}/api/delivery-charges`, deliveryChargeData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        showToast("Delivery charge added successfully!", "success")
      }
      navigate("/admin/delivery-charges")
    } catch (error) {
      showToast(error.response?.data?.message || (isEdit ? "Failed to update delivery charge" : "Failed to add delivery charge"), "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <button
                onClick={() => navigate("/admin/delivery-charges")}
                className="hover:text-blue-600 flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Delivery Charges
              </button>
              <span>/</span>
              <span className="text-gray-900">Add Delivery Charge</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Delivery Charge</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Standard Delivery, Express Delivery"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Charge (AED) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="charge"
                    value={formData.charge}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the delivery service..."
                  />
                </div>
              </div>
            </div>

            {/* Order Amount Criteria */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Amount Criteria</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Amount (AED)</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no minimum</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Order Amount (AED)</label>
                  <input
                    type="number"
                    name="maxOrderAmount"
                    value={formData.maxOrderAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no maximum</p>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Delivery Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
                  <select
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Same day">Same day</option>
                    <option value="1-2 business days">1-2 business days</option>
                    <option value="2-3 business days">2-3 business days</option>
                    <option value="3-5 business days">3-5 business days</option>
                    <option value="5-7 business days">5-7 business days</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="isActive"
                        value="true"
                        checked={formData.isActive === true}
                        onChange={() => setFormData((prev) => ({ ...prev, isActive: true }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700">Active</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="isActive"
                        value="false"
                        checked={formData.isActive === false}
                        onChange={() => setFormData((prev) => ({ ...prev, isActive: false }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700">Inactive</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicable Areas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Applicable Areas</h2>
                <button
                  type="button"
                  onClick={addArea}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  <Plus size={18} className="mr-2" />
                  Add Area
                </button>
              </div>

              <div className="space-y-4">
                {formData.applicableAreas.map((area, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => handleAreaChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Dubai, Abu Dhabi, Sharjah"
                      />
                    </div>
                    {formData.applicableAreas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArea(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {formData.applicableAreas.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-4">No areas added yet</p>
                  <button
                    type="button"
                    onClick={addArea}
                    className="flex items-center mx-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <Plus size={16} className="mr-2" />
                    Add First Area
                  </button>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pb-8">
              <button
                type="button"
                onClick={() => navigate("/admin/delivery-charges")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (isEdit ? "Updating..." : "Adding...") : (isEdit ? "Update Delivery Charge" : "Add Delivery Charge")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddDeliveryCharge
