"use client"

import { useState, useEffect, useRef, forwardRef } from "react"
import axios from "axios"
import { useReactToPrint } from "react-to-print"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Search, Eye, RefreshCw, CheckCircle2, Star, ChevronDown, X, Printer, Save, Mail, Package, Shield } from "lucide-react"
import { useToast } from "../../context/ToastContext"
import { getFullImageUrl } from "../../utils/imageUtils"

import config from "../../config/config"
import { getInvoiceBreakdown } from "../../utils/invoiceBreakdown"
import { resolveOrderItemBasePrice, computeBaseSubtotal, deriveBaseDiscount } from "../../utils/orderPricing"
import { getPaymentMethodDisplay, getPaymentMethodBadgeColor, getPaymentInfo } from "../../utils/paymentUtils"

// Invoice Component for Printing - Using forwardRef
const InvoiceComponent = forwardRef(({ order }, ref) => {
  const formatPrice = (price) => {
    return `AED ${Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
  }

  const resolvedItems = Array.isArray(order?.orderItems) ? order.orderItems : []
  
  // Separate protection items from regular items
  const protectionItems = resolvedItems.filter(item => item.isProtection || (item.name && item.name.includes('for ')))
  const regularItems = resolvedItems.filter(item => !item.isProtection && !(item.name && item.name.includes('for ')))
  
  const baseSubtotal = computeBaseSubtotal(regularItems)

  const { subtotal, shipping, tax, total, couponCode, couponDiscount } = getInvoiceBreakdown(order)
  const derivedDiscount = deriveBaseDiscount(baseSubtotal, subtotal)

  const currentDate = new Date().toLocaleDateString()
  const orderDate = new Date(order.createdAt).toLocaleDateString()

  return (
    <div ref={ref} className="bg-white pl-8 pr-8 pb-8 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className=" text-black rounded-t-lg relative overflow-hidden">
        <div className="absolute inset-0" />
        {/* Top row: two columns with logos */}
        <div className="relative z-10 flex justify-between items-start w-full">
          {/* Left Logo */}
          <div className="flex-shrink-0">
            <img
              src="/BLACK.png"
              alt="Right Logo"
              className="w-50 h-20 object-contain"
              onError={(e) => {
                e.target.style.display = "none"
                e.target.nextSibling && (e.target.nextSibling.style.display = "flex")
              }}
            />
            <p className="ml-7"> TRN: 100349772200003</p>
          </div>

          {/* Right Logo */}
          <div className="flex-shrink-0">
            <img
              src="/admin-logo.svg"
              alt="Left Logo"
              className="w-40 h-20 object-contain"
              onError={(e) => {
                e.target.style.display = "none"
                e.target.nextSibling && (e.target.nextSibling.style.display = "flex")
              }}
            />
            A Brand By Crown Excel
          </div>
        </div>

        <div className="flex justify-between items-start gap-6 ml-2">
          <div className="w-1/2 p-5 ">
            <h2 className="text-2xl font-bold mb-1">CONTACT DETAILS</h2>
            <p className="text-black text-sm italic mb-2">
              <strong>We Are Here For You</strong>
            </p>
            <div className="text-sm text-black space-y-1">
              <p>✉️ Email: orders@grabatoz.com</p>
              <p>🌐 Website: www.grabatoz.com</p>
              <p>📞 Phone: +971 50 860 4360</p>
            </div>
          </div>

          <div className="w-1/2 text-end p-5   rounded-xl backdrop-blur-sm max-w-xs ml-auto">
            <h2 className="text-2xl font-bold mb-1">VAT INVOICE</h2>
            <div className="text-lg font-semibold mb-1">Order: #{order._id.slice(-6)}</div>
            <div className="text-sm">📅 Date: {orderDate}</div>
          </div>
        </div>
      </div>

      {/* Order Summary Section */}
      <div className="bg-white  border-l-4 pl-2 border-lime-500">
        <h3 className="text-2xl font-bold text-lime-800 mb-2 uppercase tracking-wide">📋 Order Summary</h3>

        {/* Addresses */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-2">
          {/* Shipping Address */}
          <div className="bg-white border-2 border-lime-200 rounded-lg px-3 py-1 relative">
            <div className="absolute -top-3 left-3 bg-white px-2">
              <h4 className="text-sm font-bold text-lime-700 uppercase">📦 Shipping Address</h4>
            </div>
            <div className="pt-2 space-y-1 text-sm">
              <p>
                <strong>Name:</strong> {order.shippingAddress?.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {order.shippingAddress?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {order.shippingAddress?.phone || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {order.shippingAddress?.address || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {order.shippingAddress?.city || "N/A"}
              </p>
              <p>
                <strong>State:</strong> {order.shippingAddress?.state || "N/A"}
              </p>
              <p>
                <strong>Zip Code:</strong> {order.shippingAddress?.zipCode || "N/A"}
              </p>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white border-2 border-lime-200 rounded-lg px-3 py-1 relative">
            <div className="absolute -top-3 left-3 bg-white px-2">
              <h4 className="text-sm font-bold text-lime-700 uppercase">💳 Billing Address</h4>
            </div>
            <div className="pt-2 space-y-1 text-sm">
              <p>
                <strong>Name:</strong> {order.billingAddress?.name || order.shippingAddress?.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {order.billingAddress?.email || order.shippingAddress?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {order.billingAddress?.phone || order.shippingAddress?.phone || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {order.billingAddress?.address || order.shippingAddress?.address || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {order.billingAddress?.city || order.shippingAddress?.city || "N/A"}
              </p>
              <p>
                <strong>State:</strong> {order.billingAddress?.state || order.shippingAddress?.state || "N/A"}
              </p>
              <p>
                <strong>Zip Code:</strong> {order.billingAddress?.zipCode || order.shippingAddress?.zipCode || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Seller Comments */}
        {order.sellerComments && (
          <div className="mb-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-bold text-blue-700 uppercase mb-2">💬 Seller Comments</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{order.sellerComments}</p>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-4">
          <h4 className="text-lg font-bold text-lime-800 mb-2 uppercase">🛍️ Order Items</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-lime-300">
              <thead>
                <tr className="bg-lime-100">
                  <th className="border border-lime-300 px-3 py-2 text-left text-sm font-bold">Product</th>
                  <th className="border border-lime-300 px-3 py-2 text-center text-sm font-bold">Qty</th>
                  <th className="border border-lime-300 px-3 py-2 text-right text-sm font-bold">Price</th>
                  <th className="border border-lime-300 px-3 py-2 text-right text-sm font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {regularItems.map((item, index) => {
                  const basePrice = resolveOrderItemBasePrice(item)
                  const salePrice = Number(item.price) || basePrice
                  const showDiscount = basePrice > salePrice
                  const lineTotal = salePrice * (item.quantity || 0)
                  const baseTotal = basePrice * (item.quantity || 0)

                  return (
                    <tr key={index} className="hover:bg-lime-50">
                      <td className="border border-lime-300 px-3 py-2 text-sm">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.selectedColorData && (
                          <div className="text-xs text-purple-600 font-medium mt-1 flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full mr-1 border border-gray-300" style={{backgroundColor: item.selectedColorData.color?.toLowerCase() || '#9333ea'}}></span>
                            Color: {item.selectedColorData.color}
                          </div>
                        )}
                        {item.selectedDosData && (
                          <p className="text-xs text-blue-600 font-medium mt-1 flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full mr-1 border border-gray-300 bg-blue-500"></span>
                            OS: {item.selectedDosData.dosType}
                          </p>
                        )}
                        {showDiscount && (
                          <div className="text-xs text-gray-500">Base: {formatPrice(basePrice)}</div>
                        )}
                      </td>
                      <td className="border border-lime-300 px-3 py-2 text-center text-sm">{item.quantity}</td>
                      <td className="border border-lime-300 px-3 py-2 text-right text-sm">
                        {showDiscount && (
                          <span className="block text-xs text-gray-400 line-through">{formatPrice(basePrice)}</span>
                        )}
                        <span className="font-semibold text-gray-900">{formatPrice(salePrice)}</span>
                      </td>
                      <td className="border border-lime-300 px-3 py-2 text-right text-sm font-semibold">
                        {showDiscount && (
                          <span className="block text-xs text-gray-400 font-normal line-through">
                            {formatPrice(baseTotal)}
                          </span>
                        )}
                        <span>{formatPrice(lineTotal)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {protectionItems.length > 0 && (
            <div className="mt-3">
              <h5 className="text-md font-bold text-blue-700 mb-2 flex items-center">
                <span className="mr-1">🛡️</span> Buyer Protection Plans
              </h5>
              <div className="bg-blue-50 border border-blue-300 rounded p-2">
                {protectionItems.map((item, index) => {
                  const itemPrice = Number(item.price) || 0
                  return (
                    <div key={index} className="flex justify-between py-1 text-sm">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <span className="font-semibold text-gray-900">{formatPrice(itemPrice)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Total Amount */}
        <div className="bg-lime-50 border-2 border-lime-200 rounded-lg p-4">
          <h4 className="text-lg font-bold text-lime-800 mb-2 uppercase">💰 Total Amount</h4>
          <div className="space-y-2">
            {baseSubtotal > 0 && baseSubtotal !== subtotal && (
              <div className="flex justify-between text-gray-500">
                <span>Base Price:</span>
                <span className="line-through">{formatPrice(baseSubtotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">{formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VAT:</span>
              <span className="text-gray-900">{formatPrice(tax)}</span>
            </div>
            {derivedDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Offer Discount:</span>
                <span className="text-green-600">-{formatPrice(derivedDiscount)}</span>
              </div>
            )}
            {(couponDiscount > 0 || (order.couponCode && order.discountAmount > 0)) && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Coupon Applied:{(couponCode || order.couponCode) ? ` (${couponCode || order.couponCode})` : ""}
                </span>
                <span className="text-green-600">-{formatPrice(couponDiscount || order.discountAmount || 0)}</span>
              </div>
            )}
            <div className="border-t-2 border-lime-300 pt-2 flex justify-between">
              <span className="text-lg font-bold text-lime-800">Total:</span>
              <span className="text-lg font-bold text-lime-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 bg-yellow-50 p-2 rounded-lg border-2 border-yellow-200 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">💳 Payment Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                order.isPaid ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
              }`}
            >
              {order.isPaid ? "✅ Paid" : "❌ Unpaid"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">💰 Payment Method:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPaymentMethodBadgeColor(order)}`}>
              {getPaymentMethodDisplay(order)}
            </span>
          </div>
          {order.trackingId && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">📦 Tracking ID:</span>
              <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{order.trackingId}</code>
            </div>
          )}
          {order.paidAt && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">✅ Paid At:</span>
              <span className="text-gray-700 text-xs">{new Date(order.paidAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {(order.customerNotes || order.notes) && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📝 Special Notes:</h4>
            <p className="text-blue-700 italic">{order.customerNotes || order.notes}</p>
          </div>
        )}
      </div>

      <div className="text-xs text-end mt-2 opacity-80">🖨️ Printed: {currentDate}</div>
    </div>
  )
})
const Delivered = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState({})
  const [showPaymentDropdown, setShowPaymentDropdown] = useState({})
  
  // Notes and tracking states
  const [orderNotes, setOrderNotes] = useState("")
  const [trackingId, setTrackingId] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")
  const [sellerComments, setSellerComments] = useState("")
  const [sellerMessage, setSellerMessage] = useState("")
  
  // Notification modal states
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationOrderId, setNotificationOrderId] = useState(null)
  
  // Print ref
  const printComponentRef = useRef(null)
  
  const { showToast } = useToast()

  const orderStatusOptions = [
    "New",
    "Processing",
    "Confirmed",
    "Ready for Shipment",
    "Shipped",
    "On the Way",
    "Out for Delivery",
    "Delivered",
    "On Hold",
    "Cancelled",
    "Returned",
    "Deleted",
  ]
  
  const paymentStatusOptions = ["Paid", "Unpaid"]

  const formatPrice = (price) => {
    return `AED ${Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString()
  }

  const selectedOrderItems = Array.isArray(selectedOrder?.orderItems) ? selectedOrder.orderItems : []
  const selectedBaseSubtotal = computeBaseSubtotal(selectedOrderItems)
  const selectedTotals = getInvoiceBreakdown(selectedOrder || {})
  const selectedBaseDiscount = deriveBaseDiscount(selectedBaseSubtotal, selectedTotals.subtotal)
  
  // Calculate total discount (manual or coupon)
  const totalDiscountAmount = selectedTotals.couponDiscount + selectedTotals.manualDiscount
  const couponCodeLabel = selectedTotals.couponCode || selectedOrder?.couponCode || ""
  const showCouponDetail = totalDiscountAmount > 0

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `Invoice-${selectedOrder?._id.slice(-6)}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
  })

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        setError("Authentication token not found. Please login again.")
        return
      }

      console.log("[DEBUG] Fetching all orders...")
      const { data } = await axios.get(`${config.API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[DEBUG] Total orders received:", data.length)
      console.log("[DEBUG] All order statuses:", data.map((order) => ({ id: order._id.slice(-6), status: order.status })))

      // Filter for delivered orders with case-insensitive comparison
      const deliveredOrders = data.filter((order) => {
        const status = order.status?.toLowerCase().trim()
        return status === "delivered"
      })

      console.log("[DEBUG] Filtered delivered orders:", deliveredOrders.length)
      console.log("[DEBUG] Delivered orders IDs:", deliveredOrders.map((order) => order._id.slice(-6)))

      setOrders(deliveredOrders)
      setError(null) // Clear any previous errors
      setLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to load orders. Please try again later.")
      setLoading(false)
    }
  }

  const handleSendFollowUp = async (orderId) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      await axios.post(
        `${config.API_URL}/api/admin/orders/${orderId}/followup`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      showToast("Follow-up email sent successfully!", "success")
      setProcessingAction(false)
    } catch (error) {
      console.error("Error sending follow-up:", error)
      showToast("Failed to send follow-up email", "error")
      setProcessingAction(false)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setOrderNotes(order.notes || "")
    setTrackingId(order.trackingId || "")
    setEstimatedDelivery(order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split("T")[0] : "")
    setSellerComments(order.sellerComments || "")
    setSellerMessage(order.sellerMessage || "")
  }

  const handleCloseModal = () => {
    setSelectedOrder(null)
    setOrderNotes("")
    setTrackingId("")
    setEstimatedDelivery("")
    setSellerComments("")
    setSellerMessage("")
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      const updateData = { status }

      // If status is "Delivered", automatically set payment as paid
      if (status === "Delivered") {
        updateData.isPaid = true
        updateData.paidAt = new Date().toISOString()
      }

      await axios.put(`${config.API_URL}/api/admin/orders/${orderId}/status`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const updatedOrder = { ...orders.find((order) => order._id === orderId), ...updateData }
      setOrders(orders.map((order) => (order._id === orderId ? updatedOrder : order)))

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updateData })
      }

      setShowStatusDropdown({})
      setError(null)
      setProcessingAction(false)
      showToast("Order status updated successfully!", "success")
    } catch (error) {
      console.error("Error updating status:", error)
      setError("Failed to update order status: " + (error.response?.data?.message || error.message))
      showToast("Failed to update order status", "error")
      setProcessingAction(false)
    }
  }

  const handleUpdatePaymentStatus = async (orderId, isPaid) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      const updateData = {
        isPaid: isPaid,
        ...(isPaid && { paidAt: new Date().toISOString() }),
        ...(!isPaid && { paidAt: null }),
      }

      await axios.put(`${config.API_URL}/api/admin/orders/${orderId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const updatedOrderData = {
        ...updateData,
        paidAt: isPaid ? new Date() : null,
      }

      setOrders(orders.map((order) => (order._id === orderId ? { ...order, ...updatedOrderData } : order)))

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updatedOrderData })
      }

      setShowPaymentDropdown({})
      setError(null)
      setProcessingAction(false)
      showToast("Payment status updated successfully!", "success")
    } catch (error) {
      console.error("Error updating payment status:", error)
      setError("Failed to update payment status: " + (error.response?.data?.message || error.message))
      showToast("Failed to update payment status", "error")
      setProcessingAction(false)
    }
  }

  const handleSaveOrderDetails = async () => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      const updateData = {
        notes: orderNotes,
        trackingId: trackingId,
        sellerComments: sellerComments,
        sellerMessage: sellerMessage,
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery).toISOString() }),
      }

      await axios.put(`${config.API_URL}/api/admin/orders/${selectedOrder._id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const updatedOrder = {
        ...selectedOrder,
        notes: orderNotes,
        trackingId: trackingId,
        sellerComments: sellerComments,
        sellerMessage: sellerMessage,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      }

      setSelectedOrder(updatedOrder)
      setOrders(orders.map((order) => (order._id === selectedOrder._id ? updatedOrder : order)))

      setError(null)
      setProcessingAction(false)
      showToast("Order details updated successfully!", "success")
    } catch (error) {
      console.error("Error updating order details:", error)
      setError("Failed to update order details: " + (error.response?.data?.message || error.message))
      showToast("Failed to update order details", "error")
      setProcessingAction(false)
    }
  }

  const handleSendNotification = async (orderId) => {
    // Open notification modal instead of sending directly
    // Pre-populate with existing seller message from order
    const order = orders.find(o => o._id === orderId) || selectedOrder
    setNotificationOrderId(orderId)
    setNotificationMessage(order?.sellerMessage || "")
    setShowNotificationModal(true)
  }

  const handleConfirmSendNotification = async () => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      await axios.post(
        `${config.API_URL}/api/admin/orders/${notificationOrderId}/notify`,
        { sellerMessage: notificationMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      // Update local state with the new seller message
      if (notificationMessage) {
        setSellerMessage(notificationMessage)
        if (selectedOrder && selectedOrder._id === notificationOrderId) {
          setSelectedOrder({ ...selectedOrder, sellerMessage: notificationMessage })
        }
        setOrders(orders.map((order) => 
          order._id === notificationOrderId 
            ? { ...order, sellerMessage: notificationMessage } 
            : order
        ))
      }

      setShowNotificationModal(false)
      setNotificationMessage("")
      setNotificationOrderId(null)
      showToast("Notification email sent successfully!", "success")
      setProcessingAction(false)
    } catch (error) {
      console.error("Error sending notification:", error)
      setError("Failed to send notification: " + (error.response?.data?.message || error.message))
      showToast("Failed to send notification", "error")
      setProcessingAction(false)
    }
  }

  const toggleStatusDropdown = (orderId) => {
    setShowStatusDropdown((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
    setShowPaymentDropdown({})
  }

  const togglePaymentDropdown = (orderId) => {
    setShowPaymentDropdown((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
    setShowStatusDropdown({})
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setShowStatusDropdown({})
      setShowPaymentDropdown({})
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  // Also update the filteredOrders logic to handle potential null values:
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase()
    const orderId = order._id || ""
    const customerName = order.shippingAddress?.name || ""
    const customerEmail = order.shippingAddress?.email || ""

    return (
      orderId.includes(searchTerm) ||
      customerName.toLowerCase().includes(searchLower) ||
      customerEmail.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delivered Orders</h1>
            <p className="text-gray-600 mt-1">Successfully delivered orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

        <div className="mb-6 flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders by ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-96 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            Delivered: <span className="font-semibold text-green-600">{filteredOrders.length}</span>
          </div>
        </div>

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
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivered Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">#{order._id.slice(-6)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.shippingAddress?.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{order.shippingAddress?.email || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(order.updatedAt).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{new Date(order.updatedAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleStatusDropdown(order._id)
                            }}
                            className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity bg-green-100 text-green-800"
                          >
                            {order.status || "Delivered"}
                            <ChevronDown size={12} className="ml-1" />
                          </button>

                          {showStatusDropdown[order._id] && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                              {orderStatusOptions.map((status) => (
                                <button
                                  key={status}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUpdateStatus(order._id, status)
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  disabled={processingAction}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              togglePaymentDropdown(order._id)
                            }}
                            className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition-colors
                            ${order.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {order.isPaid ? "Paid" : "Unpaid"}
                            <ChevronDown size={12} className="ml-1" />
                          </button>

                          {showPaymentDropdown[order._id] && (
                            <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                              {paymentStatusOptions.map((status) => (
                                <button
                                  key={status}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUpdatePaymentStatus(order._id, status === "Paid")
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  disabled={processingAction}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.orderItems.length} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleSendFollowUp(order._id)}
                          className="text-purple-600 hover:text-purple-900"
                          disabled={processingAction}
                          title="Send Follow-up"
                        >
                          <Star size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-12">
            <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-gray-500 text-lg mt-4">No delivered orders</div>
            <p className="text-gray-400 mt-2">Delivered orders will appear here</p>
          </div>
        )}
      </div>

      {/* Comprehensive Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                  <span>Dashboard</span>
                  <span>/</span>
                  <span>Delivered Orders</span>
                  <span>/</span>
                  <span className="text-green-600">View</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Order ID: {selectedOrder._id.slice(-6)}</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              {/* Order Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-green-900">{selectedOrder.status || "Delivered"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Payment Type</p>
                      <p className="font-semibold text-blue-900">
                        {selectedOrder.isPaid ? "Paid" : selectedOrder.paymentMethod || "Cash on Delivery"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-purple-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-semibold text-purple-900">
                        {selectedOrder.paymentMethod || "Cash on Delivery"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-gray-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Delivered On</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {new Date(selectedOrder.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Section */}
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedOrder.status || "Delivered"}
                    onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={processingAction}
                  >
                    {orderStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      selectedOrder.status === "Processing"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedOrder.status === "Confirmed"
                          ? "bg-lime-100 text-lime-800"
                          : selectedOrder.status === "Shipped"
                            ? "bg-purple-100 text-purple-800"
                            : selectedOrder.status === "Out for Delivery"
                              ? "bg-indigo-100 text-indigo-800"
                              : selectedOrder.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : selectedOrder.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedOrder.status || "Delivered"}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Update Payment Status</h4>
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedOrder.isPaid ? "Paid" : "Unpaid"}
                      onChange={(e) => handleUpdatePaymentStatus(selectedOrder._id, e.target.value === "Paid")}
                      className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={processingAction}
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedOrder.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedOrder.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrderItems.filter(item => !item.isProtection).length > 0 ? (
                    selectedOrderItems.filter(item => !item.isProtection).map((item, index) => {
                      const basePrice = resolveOrderItemBasePrice(item)
                      const salePrice = Number(item.price) || basePrice
                      const showDiscount = basePrice > salePrice
                      const lineTotal = salePrice * (item.quantity || 0)
                      const baseTotal = basePrice * (item.quantity || 0)

                      return (
                        <div
                          key={item._id || index}
                          className="flex items-center justify-between py-3 border-b last:border-b-0"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                              {item.image ? (
                                <img src={getFullImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <CheckCircle2 size={24} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
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
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                              {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                            </div>
                          </div>
                          <div className="text-right">
                            {showDiscount && (
                              <p className="text-xs text-gray-400 line-through">{formatPrice(basePrice)}</p>
                            )}
                            <p className="font-semibold text-gray-900">{formatPrice(salePrice)}</p>
                            {showDiscount && (
                              <p className="text-xs text-gray-400 line-through">{formatPrice(baseTotal)}</p>
                            )}
                            <p className="text-sm text-gray-500">Total: {formatPrice(lineTotal)}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-gray-500 text-center py-4">No items found</p>
                  )}
                </div>
                
                {selectedOrderItems.some(item => item.isProtection) && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Buyer Protection Plans
                    </h4>
                    <div className="space-y-3">
                      {selectedOrderItems.filter(item => item.isProtection).map((item, index) => {
                        const price = Number(item.price) || 0
                        return (
                          <div key={item._id || index} className="flex items-center justify-between py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <div>
                                <h5 className="font-medium text-gray-900">{item.name}</h5>
                              </div>
                            </div>
                            <p className="font-semibold text-gray-900">{formatPrice(price)}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                <div className="space-y-2">
                  {selectedBaseSubtotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="text-gray-400 line-through">{formatPrice(selectedBaseSubtotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatPrice(selectedTotals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Charges:</span>
                    <span className="text-gray-900">{formatPrice(selectedTotals.shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (VAT):</span>
                    <span className="text-gray-900">{formatPrice(selectedTotals.tax)}</span>
                  </div>
                  {selectedBaseDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Offer Discount:</span>
                      <span className="text-green-600">-{formatPrice(selectedBaseDiscount)}</span>
                    </div>
                  )}
                  {selectedTotals.couponDiscount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 -mx-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-green-800">Coupon Applied</span>
                          {selectedTotals.couponCode && (
                            <div className="text-xs text-green-600 mt-0.5">Code: <span className="font-semibold">{selectedTotals.couponCode}</span></div>
                          )}
                        </div>
                        <span className="text-lg font-bold text-green-700">-{formatPrice(selectedTotals.couponDiscount)}</span>
                      </div>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(selectedTotals.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Customer Information */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium text-gray-700">Name:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.name || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Email:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.email || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Phone:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.phone || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">User ID:</span>{" "}
                      <span className="text-gray-900">
                        {typeof selectedOrder.user === 'object' && selectedOrder.user?._id 
                          ? selectedOrder.user._id 
                          : typeof selectedOrder.user === 'string' 
                            ? selectedOrder.user 
                            : "Guest"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium text-gray-700">Address:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.address || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">City:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.city || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">State:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.state || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Zip Code:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.zipCode || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Country:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.country || "UAE"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Created</p>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.paidAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Payment Confirmed</p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedOrder.paidAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedOrder.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information with Editable Fields */}
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2">
                        <span className="font-medium">Payment Status:</span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded-full ${selectedOrder.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {selectedOrder.isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </p>
                      {selectedOrder.paidAt && (
                        <p>
                          <span className="font-medium">Paid At:</span> {formatDate(selectedOrder.paidAt)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
                      <input
                        type="text"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        placeholder="Enter tracking ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery</label>
                      <input
                        type="date"
                        value={estimatedDelivery}
                        onChange={(e) => setEstimatedDelivery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {showCouponDetail && (
                  <div className="mt-4 bg-lime-50 border border-lime-200 p-4 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-lime-700">{couponCodeLabel ? "Coupon Details" : "Discount Details"}</p>
                    {couponCodeLabel && (
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Code:</span>
                        <span className="font-semibold text-gray-900">{couponCodeLabel}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Discount Amount:</span>
                      <span className="font-semibold text-green-600">-{formatPrice(totalDiscountAmount)}</span>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md min-h-[48px]">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedOrder.customerNotes || selectedOrder.notes || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seller Comments</label>
                  <textarea
                    value={sellerComments}
                    onChange={(e) => setSellerComments(e.target.value)}
                    placeholder="Add seller comments here..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  />
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleSaveOrderDetails}
                    disabled={processingAction}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    <Save size={16} />
                    <span>{processingAction ? "Saving..." : "Save Details"}</span>
                  </button>
                </div>
              </div>

              {/* Post-Delivery Actions */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Post-Delivery Actions</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleSendFollowUp(selectedOrder._id)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                    disabled={processingAction}
                  >
                    <Star size={18} className="mr-2" />
                    Send Follow-up Email
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Send a follow-up email to request customer feedback and reviews.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors"
                >
                  <Printer size={18} className="mr-2" />
                  Print Receipt
                </button>
                <button
                  onClick={() => handleSendNotification(selectedOrder._id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors"
                  disabled={processingAction}
                >
                  <Mail size={18} className="mr-2" />
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Invoice Component for Printing */}
      {selectedOrder && (
        <div style={{ display: "none" }}>
          <InvoiceComponent order={selectedOrder} ref={printComponentRef} />
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Mail size={20} className="mr-2 text-green-600" />
                Send Notification Email
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seller Message <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Enter a message to include in the notification email..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be displayed in the customer's notification email. Leave empty to send without a message.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNotificationModal(false)
                  setNotificationMessage("")
                  setNotificationOrderId(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                disabled={processingAction}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSendNotification}
                disabled={processingAction}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center transition-colors disabled:bg-gray-400"
              >
                {processingAction ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={16} className="mr-2" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Delivered
