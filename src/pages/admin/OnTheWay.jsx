"use client"

import { useState, useEffect, useRef, forwardRef } from "react"
import axios from "axios"
import { useReactToPrint } from "react-to-print"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Search, Eye, RefreshCw, MapPin, CheckCircle, Package, X, Truck, CreditCard, ChevronDown, Mail, Printer, Save, Shield } from "lucide-react"
import { useToast } from "../../context/ToastContext"
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
                        {item.selectedDosData && (
                          <div className="text-xs text-blue-600 font-medium mt-1 flex items-center">
                            💻 OS: {item.selectedDosData.dosType}
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
        </div>

        {/* Protection Plans Section */}
        {protectionItems.length > 0 && (
          <div className="mb-4">
            <h4 className="text-lg font-bold text-blue-800 mb-2 uppercase">🛡️ Protection Plans</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-blue-300">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-blue-300 px-3 py-2 text-left text-sm font-bold">Protection</th>
                    <th className="border border-blue-300 px-3 py-2 text-center text-sm font-bold">Qty</th>
                    <th className="border border-blue-300 px-3 py-2 text-right text-sm font-bold">Price</th>
                    <th className="border border-blue-300 px-3 py-2 text-right text-sm font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {protectionItems.map((item, index) => {
                    const itemPrice = Number(item.price) || 0
                    const lineTotal = itemPrice * (item.quantity || 0)

                    return (
                      <tr key={index} className="hover:bg-blue-50">
                        <td className="border border-blue-300 px-3 py-2 text-sm">
                          <div className="font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="border border-blue-300 px-3 py-2 text-center text-sm">{item.quantity}</td>
                        <td className="border border-blue-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                          {formatPrice(itemPrice)}
                        </td>
                        <td className="border border-blue-300 px-3 py-2 text-right text-sm font-semibold">
                          {formatPrice(lineTotal)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total Amount */}
        <div className="bg-gray-50 border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Amount</h3>
          <div className="space-y-2">
            {baseSubtotal > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span className="text-gray-400 line-through">{formatPrice(baseSubtotal)}</span>
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
              <div className="bg-green-50 border border-green-200 rounded-md p-3 -mx-1">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-green-800">Coupon Applied</span>
                    {(couponCode || order.couponCode) && (
                      <div className="text-xs text-green-600 mt-0.5">Code: <span className="font-semibold">{couponCode || order.couponCode}</span></div>
                    )}
                  </div>
                  <span className="text-lg font-bold text-green-700">-{formatPrice(couponDiscount || order.discountAmount || 0)}</span>
                </div>
              </div>
            )}

            <div className="border-t pt-2 flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
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

InvoiceComponent.displayName = "InvoiceComponent"

const OnTheWay = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState({})
  const [showPaymentDropdown, setShowPaymentDropdown] = useState({})
  const [selectedOrders, setSelectedOrders] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [bulkStatus, setBulkStatus] = useState("")
  const [showBulkActions, setShowBulkActions] = useState(false)
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

  const orderStatusOptions = [
    "New",
    "Processing",
    "Confirmed",
    "Ready For Shipment",
    "Shipped",
    "On the Way",
    "Out for Delivery",
    "Delivered",
    "On Hold",
    "Cancelled",
    "Deleted",
  ]

  // Print ref
  const printComponentRef = useRef(null)

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

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = () => {
      setShowStatusDropdown({})
      setShowPaymentDropdown({})
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  useEffect(() => {
    setShowBulkActions(selectedOrders.length > 0)
  }, [selectedOrders])

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

      const onTheWayOrders = data.filter(
        (order) => order.status === "Shipped" || order.status === "Out for Delivery" || order.status === "On the Way",
      )
      setOrders(onTheWayOrders)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to load orders. Please try again later.")
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      const updateData = { status }

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
      setProcessingAction(false)
      showToast("Failed to update order status", "error")
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
      setProcessingAction(false)
      showToast("Failed to update payment status", "error")
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
      setProcessingAction(false)
      showToast("Failed to update order details", "error")
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
      setProcessingAction(false)
      showToast("Failed to send notification", "error")
    }
  }

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map((order) => order._id))
    }
    setSelectAll(!selectAll)
  }

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrders.length === 0) {
      showToast("Please select orders and a status", "error")
      return
    }

    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      await Promise.all(
        selectedOrders.map((orderId) =>
          axios.put(
            `${config.API_URL}/api/admin/orders/${orderId}/status`,
            { status: bulkStatus },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          ),
        ),
      )

      setOrders(orders.map((order) => (selectedOrders.includes(order._id) ? { ...order, status: bulkStatus } : order)))

      setSelectedOrders([])
      setSelectAll(false)
      setBulkStatus("")
      setShowBulkActions(false)
      setProcessingAction(false)

      showToast(`Successfully updated ${selectedOrders.length} orders to ${bulkStatus}`, "success")
    } catch (error) {
      console.error("Error updating bulk status:", error)
      setError("Failed to update orders: " + (error.response?.data?.message || error.message))
      setProcessingAction(false)
      showToast("Failed to update orders", "error")
    }
  }

  const handleMarkAsDelivered = async (orderId) => {
    await handleUpdateStatus(orderId, "Delivered")
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setOrderNotes(order.notes || "")
    setTrackingId(order.trackingId || "")
    setEstimatedDelivery(order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split("T")[0] : "")
    setSellerComments(order.sellerComments || "")
    setSellerMessage(order.sellerMessage || "")
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

  const handleCloseModal = () => {
    setSelectedOrder(null)
    setOrderNotes("")
    setTrackingId("")
    setEstimatedDelivery("")
    setSellerComments("")
    setSellerMessage("")
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
            <h1 className="text-2xl font-bold text-gray-900">On the Way</h1>
            <p className="text-gray-600 mt-1">Orders currently in transit to customers</p>
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X size={18} />
            </button>
          </div>
        )}

        {showBulkActions && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border-l-4 border-lime-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  {selectedOrders.length} order{selectedOrders.length !== 1 ? "s" : ""} selected
                </span>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Change status to:</label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                  >
                    <option value="">Select Status</option>
                    {orderStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleBulkStatusUpdate}
                    disabled={!bulkStatus || processingAction}
                    className="bg-lime-500 hover:bg-lime-600 disabled:bg-gray-400 text-white px-4 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    {processingAction ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedOrders([])
                  setSelectAll(false)
                  setBulkStatus("")
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

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
            In Transit: <span className="font-semibold text-lime-600">{filteredOrders.length}</span>
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
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-lime-500 focus:ring-lime-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
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
                    <tr
                      key={order._id}
                      className={`hover:bg-gray-50 ${selectedOrders.includes(order._id) ? "bg-lime-50" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => handleSelectOrder(order._id)}
                          className="h-4 w-4 text-lime-500 focus:ring-lime-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-lime-600">#{order._id.slice(-6)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.deliveryType === "pickup" ? (
                          <>
                            <div className="text-sm text-gray-900">{order.pickupDetails?.location || "N/A"}</div>
                            <div className="text-sm text-gray-500">{order.pickupDetails?.phone || "N/A"}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm text-gray-900">{order.shippingAddress?.name || "N/A"}</div>
                            <div className="text-sm text-gray-500">{order.shippingAddress?.email || "N/A"}</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleStatusDropdown(order._id)
                            }}
                            className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity
                            ${
                              order.status === "Processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "Confirmed"
                                  ? "bg-lime-100 text-lime-800"
                                  : order.status === "Shipped" || order.status === "On the Way"
                                    ? "bg-lime-100 text-lime-800"
                                    : order.status === "Out for Delivery"
                                      ? "bg-indigo-100 text-indigo-800"
                                      : order.status === "Delivered"
                                        ? "bg-green-100 text-green-800"
                                        : order.status === "Cancelled"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status || "New"}
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUpdatePaymentStatus(order._id, true)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                disabled={processingAction}
                              >
                                Paid
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUpdatePaymentStatus(order._id, false)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                disabled={processingAction}
                              >
                                Unpaid
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
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
                          onClick={() => handleSendNotification(order._id)}
                          className="text-lime-600 hover:text-lime-900 mr-3"
                          disabled={processingAction}
                          title="Send Notification"
                        >
                          <Mail size={18} />
                        </button>
                        <button
                          onClick={() => handleMarkAsDelivered(order._id)}
                          className="text-green-600 hover:text-green-900"
                          disabled={processingAction}
                          title="Mark as Delivered"
                        >
                          <CheckCircle size={18} />
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
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-gray-500 text-lg mt-4">No orders on the way</div>
            <p className="text-gray-400 mt-2">Orders in transit will appear here</p>
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
                  <span>On the Way Orders</span>
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
              {/* Order Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Truck className="text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-blue-900">{selectedOrder.status || "On the Way"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Payment Type</p>
                      <p className="font-semibold text-green-900">
                        {selectedOrder.isPaid ? "Paid" : selectedOrder.paymentMethod || "Cash on Delivery"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-lime-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MapPin className="text-lime-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Order Type</p>
                      <p className="font-semibold text-lime-900">Delivery</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="text-gray-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="font-semibold text-gray-900 text-sm">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Section */}
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <button
                  onClick={() => handleMarkAsDelivered(selectedOrder._id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md flex items-center"
                  disabled={processingAction}
                >
                  <CheckCircle size={18} className="mr-2" />
                  Mark as Delivered
                </button>
              </div>

              {/* Order Items */}
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrderItems.length > 0 ? (
                    selectedOrderItems.filter(item => !item.isProtection && !(item.name && item.name.includes('for '))).map((item, index) => {
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
                            <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center">
                              <Package size={24} className="text-gray-400" />
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
                                  💻 OS: {item.selectedDosData.dosType}
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

              {/* Protection Plans Section */}
              {selectedOrderItems.some(item => item.isProtection || (item.name && item.name.includes('for '))) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-blue-600" />
                    Protection Plans
                  </h3>
                  <div className="space-y-4">
                    {selectedOrderItems.filter(item => item.isProtection || (item.name && item.name.includes('for '))).map((item, index) => {
                      const itemPrice = Number(item.price) || 0
                      const lineTotal = itemPrice * (item.quantity || 0)

                      return (
                        <div
                          key={item._id || index}
                          className="flex items-center justify-between py-3 border-b last:border-b-0 border-blue-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-15 h-15 bg-blue-200 rounded-md flex items-center justify-center">
                              <Shield size={24} className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatPrice(itemPrice)}</p>
                            <p className="text-sm text-gray-500">Total: {formatPrice(lineTotal)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Total Amount */}
              <div className="bg-gray-50 border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Amount</h3>
                <div className="space-y-2">
                  {selectedBaseSubtotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base Price:</span>
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
                    <span className="text-lg font-bold text-blue-600">{formatPrice(selectedTotals.total)}</span>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Shipping Address */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span> {selectedOrder.shippingAddress?.name || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedOrder.shippingAddress?.email || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span> {selectedOrder.shippingAddress?.phone || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span> {selectedOrder.shippingAddress?.address || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">City:</span> {selectedOrder.shippingAddress?.city || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">State:</span> {selectedOrder.shippingAddress?.state || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Zip Code:</span> {selectedOrder.shippingAddress?.zipCode || "N/A"}
                    </p>
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

              {/* Additional Information */}
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
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

                  {selectedOrder.trackingId && (
                    <div>
                      <span className="font-medium">Tracking ID:</span> {selectedOrder.trackingId}
                    </div>
                  )}

                  {selectedOrder.estimatedDelivery && (
                    <div>
                      <span className="font-medium">Estimated Delivery:</span>{" "}
                      {formatDate(selectedOrder.estimatedDelivery)}
                    </div>
                  )}

                  {showCouponDetail && (
                    <div className="mt-4 bg-lime-50 border border-lime-200 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium text-lime-700">
                        {couponCodeLabel ? "Coupon Details" : "Discount Details"}
                      </p>
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

                  {selectedOrder.customerNotes || selectedOrder.notes ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md min-h-[48px]">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedOrder.customerNotes || selectedOrder.notes}
                        </p>
                      </div>
                    </div>
                  ) : null}

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
                  className="bg-lime-600 hover:bg-lime-700 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors"
                >
                  <Printer size={18} className="mr-2" />
                  Print Receipt
                </button>
                <button
                  onClick={() => handleSendNotification(selectedOrder._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors"
                  disabled={processingAction}
                >
                  <Mail size={18} className="mr-2" />
                  Send Notification
                </button>
                <button
                  onClick={() => handleMarkAsDelivered(selectedOrder._id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors"
                  disabled={processingAction}
                >
                  <CheckCircle size={18} className="mr-2" />
                  Mark as Delivered
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

export default OnTheWay
