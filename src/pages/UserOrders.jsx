"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { CheckCircle, Clock, Package, Truck, AlertTriangle } from "lucide-react"
import { getFullImageUrl } from "../utils/imageUtils"

import config from "../config/config"
const UserOrders = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")

  // Check for success message from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const success = params.get("success")
    const orderId = params.get("orderId")

    if (success === "true" && orderId) {
      setSuccessMessage(`Order #${orderId.slice(-6)} has been placed successfully!`)

      // Initialize Google Customer Reviews opt-in module
      initializeGCROptIn(orderId)

      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage("")
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [location])

  // Initialize Google Customer Reviews opt-in module
  const initializeGCROptIn = async (orderId) => {
    try {
      // Fetch order details
      const token = localStorage.getItem("token")
      const { data: order } = await axios.get(`${config.API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Load Google API platform script if not already loaded
      if (!window.gapi) {
        const script = document.createElement("script")
        script.src = "https://apis.google.com/js/platform.js?onload=renderOptIn"
        script.async = true
        script.defer = true
        document.body.appendChild(script)
      }

      // Calculate estimated delivery date
      const estimatedDeliveryDate = order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toISOString().split('T')[0]
        : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Extract GTINs from order items if available
      const products = order.orderItems
        .filter(item => item.product?.gtin || item.product?.barcode)
        .map(item => ({ gtin: item.product?.gtin || item.product?.barcode }))

      // Define the render function for GCR opt-in
      window.renderOptIn = function () {
        if (window.gapi && window.gapi.load) {
          window.gapi.load('surveyoptin', function () {
            window.gapi.surveyoptin.render({
              "merchant_id": 5615926184,
              "order_id": order._id,
              "email": order.shippingAddress?.email || user?.email || "",
              "delivery_country": "AE",
              "estimated_delivery_date": estimatedDeliveryDate,
              "products": products.length > 0 ? products : undefined,
              "opt_in_style": "BOTTOM_RIGHT_DIALOG"
            })
          })
        }
      }

      // Call renderOptIn if gapi is already loaded
      if (window.gapi && window.gapi.load) {
        window.renderOptIn()
      }
    } catch (error) {
      console.error("Error initializing GCR opt-in:", error)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in to view your orders")
          setLoading(false)
          return
        }

        console.log("Fetching orders with token:", token ? "Token exists" : "No token")
        
        const { data } = await axios.get(`${config.API_URL}/api/orders/myorders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        console.log("Orders fetched:", data.length, "orders")
        console.log("Orders data:", data)
        
        setOrders(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching orders:", error)
        console.error("Error response:", error.response?.data)
        setError(error.response?.data?.message || "Failed to load your orders. Please try again later.")
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, navigate])

  const getStatusIcon = (status) => {
    switch (status) {
      case "Processing":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "Shipped":
        return <Package className="h-5 w-5 text-blue-500" />
      case "Out for Delivery":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "Delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <Link to="/" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Order #{order._id.slice(-6)}</h2>
                    <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 text-sm font-medium">{order.status}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Items</h3>
                <ul className="divide-y divide-gray-200">
                  {order.orderItems.filter(item => !item.isProtection).map((item) => (
                    <li key={item._id} className="py-4 flex">
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                        <img
                          src={getFullImageUrl(item.image) || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm font-medium text-gray-900">AED {item.price.toLocaleString()}</p>
                        </div>
                        {item.selectedColorData && (
                          <p className="text-xs text-purple-600 font-medium mt-1 flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full mr-1 border border-gray-300" style={{backgroundColor: item.selectedColorData.color?.toLowerCase() || '#9333ea'}}></span>
                            Color: {item.selectedColorData.color}
                          </p>
                        )}
                        {item.selectedDosData && (
                          <p className="text-xs text-blue-600 font-medium mt-1 flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full mr-1 border border-gray-300 bg-blue-500"></span>
                            OS: {item.selectedDosData.dosType}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                {order.orderItems.some(item => item.isProtection) && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Buyer Protection Plans
                    </h4>
                    <ul className="divide-y divide-gray-200 bg-blue-50 rounded-lg">
                      {order.orderItems.filter(item => item.isProtection).map((item) => (
                        <li key={item._id} className="py-3 px-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                          </div>
                          <p className="text-sm font-medium text-gray-900 ml-2">AED {item.price.toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-medium text-gray-900">AED {order.totalPrice.toLocaleString()}</span>
                </div>
                {order.trackingId && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-gray-900">Tracking ID: </span>
                    <span className="text-gray-600">{order.trackingId}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserOrders
