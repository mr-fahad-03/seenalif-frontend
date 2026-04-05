"use client"

import { useState, useEffect, useRef, forwardRef } from "react"
import axios from "axios"
import { useReactToPrint } from "react-to-print"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Search, Eye, RefreshCw, Pause, Play, ChevronDown, X, Package, CreditCard, MapPin, Clock, User, Printer, Mail, Save, Shield } from "lucide-react"
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

  const {
    subtotal,
    shipping,
    tax,
    total,
    couponCode,
    couponDiscount,
    displaySubtotal,
    displayTotal,
  } = getInvoiceBreakdown(order)
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
                  const itemPrice = Number(item.price) || basePrice
                  const showDiscount = basePrice > itemPrice
                  const lineTotal = itemPrice * (item.quantity || 0)
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
                        {showDiscount && (
                          <div className="text-xs text-gray-500">Base: {formatPrice(basePrice)}</div>
                        )}
                      </td>
                      <td className="border border-lime-300 px-3 py-2 text-center text-sm">{item.quantity}</td>
                      <td className="border border-lime-300 px-3 py-2 text-right text-sm">
                        {showDiscount && (
                          <span className="block text-xs text-gray-400 line-through">{formatPrice(basePrice)}</span>
                        )}
                        <span className="font-semibold text-gray-900">{formatPrice(itemPrice)}</span>
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
        <div className="bg-white border-2 border-lime-200 rounded-lg p-3">
          <div className="space-y-1">
            {baseSubtotal > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Base Price:</span>
                <span className="line-through">{formatPrice(baseSubtotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-700">
              <span>💰 Sub-Total:</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>

            {derivedDiscount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Offer Discount:</span>
                <span className="font-medium text-green-700">-{formatPrice(derivedDiscount)}</span>
              </div>
            )}

            {(couponDiscount > 0 || (order.couponCode && order.discountAmount > 0)) && (
              <div className="flex justify-between text-gray-700">
                <span>
                  Coupon Applied:{(couponCode || order.couponCode) ? ` (${couponCode || order.couponCode})` : ""}
                </span>
                <span className="font-medium text-green-700">-{formatPrice(couponDiscount || order.discountAmount || 0)}</span>
              </div>
            )}

            {tax > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>✔️ VAT:</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-700">
              <span>🚚 Shipping Charge:</span>
              <span className="font-medium">{formatPrice(shipping)}</span>
            </div>

            <div className="border-t-2 border-lime-500">
              <div className="flex justify-between text-xl font-bold text-lime-800 bg-lime-100 p-2 rounded-lg">
                <span> TOTAL AMOUNT:</span>
                <span>{formatPrice(displayTotal)}</span>
              </div>
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

InvoiceComponent.displayName = "InvoiceComponent"
const OnHold = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState({})
  const [showPaymentDropdown, setShowPaymentDropdown] = useState({})
  const [orderNotes, setOrderNotes] = useState("")
  const [trackingId, setTrackingId] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")
  const [sellerComments, setSellerComments] = useState("")
  const [sellerMessage, setSellerMessage] = useState("")
  
  // Notification modal states
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationOrderId, setNotificationOrderId] = useState(null)
  const { showToast } = useToast()

  // Print ref
  const printComponentRef = useRef(null)

  const orderStatusOptions = [
    "New",
    "Processing",
    "Confirmed",
    "Ready For Shipment",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Returned",
    "On Hold"
  ]

  const paymentStatusOptions = ["Unpaid", "Paid"]

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setProcessingAction(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      
      await axios.put(
        `${config.API_URL}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      
      fetchOrders()
      showToast("Order status updated successfully", "success")
    } catch (error) {
      console.error("Error updating order status:", error)
      showToast("Failed to update order status", "error")
    } finally {
      setProcessingAction(false)
      setShowStatusDropdown({})
    }
  }

  const handleUpdatePayment = async (orderId, isPaid) => {
    try {
      setProcessingAction(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      
      await axios.put(
        `${config.API_URL}/api/admin/orders/${orderId}`,
        { isPaid, ...(isPaid && { paidAt: new Date().toISOString() }), ...(!isPaid && { paidAt: null }) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      
      fetchOrders()
      showToast("Payment status updated successfully", "success")
    } catch (error) {
      console.error("Error updating payment status:", error)
      showToast("Failed to update payment status", "error")
    } finally {
      setProcessingAction(false)
      setShowPaymentDropdown({})
    }
  }

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

      const { data } = await axios.get(`${config.API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const onHoldOrders = data.filter((order) => order.status === "On Hold" || order.status === "Paused")
      setOrders(onHoldOrders)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to load orders. Please try again later.")
      setLoading(false)
    }
  }

  const handleResumeOrder = async (orderId) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      await axios.put(
        `${config.API_URL}/api/admin/orders/${orderId}/status`,
        { status: "Processing" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setOrders(orders.filter((order) => order._id !== orderId))
      showToast("Order processed successfully!", "success")
      setProcessingAction(false)
    } catch (error) {
      console.error("Error resuming order:", error)
      showToast("Failed to resume order", "error")
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

      // Update local state
      const updatedOrder = {
        ...selectedOrder,
        notes: orderNotes,
        trackingId: trackingId,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        sellerComments: sellerComments,
        sellerMessage: sellerMessage,
      }

      setSelectedOrder(updatedOrder)
      setOrders(orders.map((order) => (order._id === selectedOrder._id ? updatedOrder : order)))

      setProcessingAction(false)
      showToast("Order details updated successfully!", "success")
    } catch (error) {
      console.error("Error updating order details:", error)
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
      showToast("Failed to send notification", "error")
      setProcessingAction(false)
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order._id.includes(searchTerm) ||
      order.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">On Hold Orders</h1>
            <p className="text-gray-600 mt-1">Orders temporarily paused or on hold</p>
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
            On Hold: <span className="font-semibold text-yellow-600">{filteredOrders.length}</span>
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hold Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    {/* Removed Items column */}
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
                        <div className="text-sm font-medium text-blue-600">#{order._id.slice(-6)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.shippingAddress.name}</div>
                        <div className="text-sm text-gray-500">{order.shippingAddress.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <button
                            onClick={() => setShowStatusDropdown({ ...showStatusDropdown, [order._id]: !showStatusDropdown[order._id] })}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <span className={`
                              inline-block w-2 h-2 rounded-full mr-2
                              ${order.status === 'Delivered' ? 'bg-green-500' : 
                                order.status === 'Cancelled' ? 'bg-red-500' : 
                                order.status === 'On Hold' ? 'bg-yellow-500' : 'bg-blue-500'}
                            `}></span>
                            {order.status}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </button>
                          
                          {showStatusDropdown[order._id] && (
                            <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg">
                              <div className="py-1">
                                {orderStatusOptions.map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleUpdateStatus(order._id, status)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleUpdatePayment(order._id, !order.isPaid)}
                          className={`inline-flex items-center px-2.5 py-1.5 border shadow-sm text-xs font-medium rounded
                            ${order.isPaid ? 
                              'border-green-300 text-green-700 bg-green-50' : 
                              'border-red-300 text-red-700 bg-red-50'}`}
                        >
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(order.updatedAt).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{new Date(order.updatedAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.holdReason || "Payment Issue"}</div>
                      </td>
                      {/* Removed Items column */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleResumeOrder(order._id)}
                          className="text-green-600 hover:text-green-900"
                          disabled={processingAction}
                          title="Process Order"
                        >
                          <Play size={18} />
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
            <Pause className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-gray-500 text-lg mt-4">No orders on hold</div>
            <p className="text-gray-400 mt-2">Orders on hold will appear here</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Header with navigation breadcrumb */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                  <span>Dashboard</span>
                  <span>/</span>
                  <span>On Hold Orders</span>
                  <span>/</span>
                  <span className="text-blue-600">View</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Order ID: {selectedOrder._id.slice(-6)}</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-green-900">{selectedOrder.status}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Payment Type</p>
                      <p className="font-semibold text-blue-900">
                        {selectedOrder.paymentMethod || "Cash on Delivery"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MapPin className="text-purple-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Order Type</p>
                      <p className="font-semibold text-purple-900">Delivery</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-gray-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Order Status Section */}
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={processingAction}
                  >
                    {orderStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                    Current: {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Update Payment Status Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-3">Update Payment Status</h4>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedOrder.isPaid ? "Paid" : "Unpaid"}
                    onChange={(e) => handleUpdatePayment(selectedOrder._id, e.target.value === "Paid")}
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

              {/* Order Items Section */}
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrderItems.length > 0 ? (
                    selectedOrderItems.map((item, index) => {
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
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                              {item.image ? (
                                <img src={getFullImageUrl(item.image)} alt={item.name} className="w-14 h-14 object-contain" />
                              ) : (
                                <Package size={24} className="text-gray-400" />
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
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
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
              </div>

              {/* Total Amount */}
              <div className="bg-gray-50 border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Amount</h3>
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
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-gray-900">{formatPrice(selectedTotals.shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT:</span>
                    <span className="text-gray-900">{formatPrice(selectedTotals.tax)}</span>
                  </div>
                  {selectedBaseDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Offer Discount:</span>
                      <span className="text-green-600">-{formatPrice(selectedBaseDiscount)}</span>
                    </div>
                  )}
                  {showCouponDetail && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 -mx-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-green-800">Coupon Applied</span>
                          {couponCodeLabel && (
                            <div className="text-xs text-green-600 mt-0.5">Code: <span className="font-semibold">{couponCodeLabel}</span></div>
                          )}
                        </div>
                        <span className="text-lg font-bold text-green-700">-{formatPrice(totalDiscountAmount)}</span>
                      </div>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-lime-600">
                      {formatPrice(selectedTotals.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Shipping Address */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping / Pickup Address</h3>
                  <div className="space-y-2">
                    {selectedOrder.shippingAddress ? (
                      <>
                        <p>
                          <span className="font-medium">Name:</span> {selectedOrder.shippingAddress.name || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {selectedOrder.shippingAddress.email || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span> {selectedOrder.shippingAddress.phone || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {selectedOrder.shippingAddress.address || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">City:</span> {selectedOrder.shippingAddress.city || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">State:</span> {selectedOrder.shippingAddress.state || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Zip Code:</span>{" "}
                          {selectedOrder.shippingAddress.zipCode || "N/A"}
                        </p>
                      </>
                    ) : selectedOrder.pickupDetails ? (
                      <>
                        <p>
                          <span className="font-medium">Store Name:</span>{" "}
                          {selectedOrder.pickupDetails.location || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Store Address:</span>{" "}
                          {selectedOrder.pickupDetails.storeAddress || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Store Phone:</span>{" "}
                          {selectedOrder.pickupDetails.storePhone || "N/A"}
                        </p>
                      </>
                    ) : (
                      <p>N/A</p>
                    )}
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedOrder.billingAddress?.name || selectedOrder.shippingAddress?.name || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedOrder.billingAddress?.email || selectedOrder.shippingAddress?.email || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedOrder.billingAddress?.phone || selectedOrder.shippingAddress?.phone || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {selectedOrder.billingAddress?.address || selectedOrder.shippingAddress?.address || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">City:</span>{" "}
                      {selectedOrder.billingAddress?.city || selectedOrder.shippingAddress?.city || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">State:</span>{" "}
                      {selectedOrder.billingAddress?.state || selectedOrder.shippingAddress?.state || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Zip Code:</span>{" "}
                      {selectedOrder.billingAddress?.zipCode || selectedOrder.shippingAddress?.zipCode || "N/A"}
                    </p>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
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
                  className="bg-lime-600 hover:bg-lime-700 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors"
                  disabled={processingAction}
                >
                  <Mail size={18} className="mr-2" />
                  Send Notification
                </button>
                <button
                  onClick={() => handleResumeOrder(selectedOrder._id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors"
                  disabled={processingAction}
                >
                  <Play size={18} className="mr-2" />
                  Process Order
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

export default OnHold