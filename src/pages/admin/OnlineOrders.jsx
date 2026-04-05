// "use client"

// import { useState, useEffect, useRef, forwardRef } from "react"
// import axios from "axios"
// import { useReactToPrint } from "react-to-print"
// import {
//   Search,
//   Eye,
//   Mail,
//   ChevronDown,
//   RefreshCw,
//   X,
//   Package,
//   CreditCard,
//   MapPin,
//   User,
//   Printer,
//   Save,
// } from "lucide-react"

// import config from "../../config/config"

// // Invoice Component for Printing - Using forwardRef
// const InvoiceComponent = forwardRef(({ order }, ref) => {
//   const formatPrice = (price) => {
//     return `AED ${price?.toLocaleString() || 0}`
//   }

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString()
//   }

//   const currentDate = new Date().toLocaleDateString()
//   const orderDate = new Date(order.createdAt).toLocaleDateString()

//   return (
//     <div ref={ref} className="bg-white pl-8 pr-8 pb-8 max-w-4xl mx-auto font-sans">
//       {/* Header */}
//       <div className=" text-black rounded-t-lg relative overflow-hidden">
//         <div className="absolute inset-0" />
//         {/* Top row: two columns with logos */}
//         <div className="relative z-10 flex justify-between items-start w-full">
//           {/* Left Logo */}
//           <div className="flex-shrink-0">
//             <img
//               src="/BLACK.png"
//               alt="Right Logo"
//               className="w-50 h-20 object-contain"
//               onError={(e) => {
//                 e.target.style.display = "none"
//                 e.target.nextSibling && (e.target.nextSibling.style.display = "flex")
//               }}
//             />
//             <p className="ml-7"> TRN: 100349772200003</p>
//           </div>

//           {/* Right Logo */}
//           <div className="flex-shrink-0">
//             <img
//               src="/admin-logo.svg"
//               alt="Left Logo"
//               className="w-40 h-20 object-contain"
//               onError={(e) => {
//                 e.target.style.display = "none"
//                 e.target.nextSibling && (e.target.nextSibling.style.display = "flex")
//               }}
//             />
//             A Brand By Crown Excel
//           </div>
//         </div>

//         <div className="flex justify-between items-start gap-6 ml-2">
//           <div className="w-1/2 p-5 ">
//             <h2 className="text-2xl font-bold mb-1">CONTACT DETAILS</h2>
//             <p className="text-black text-sm italic mb-2">
//               <strong>We Are Here For You</strong>
//             </p>
//             <div className="text-sm text-black space-y-1">
//               <p>✉️ Email: orders@grabatoz.com</p>
//               <p>🌐 Website: www.grabatoz.com</p>
//               <p>📞 Phone: +971 50 860 4360</p>
//             </div>
//           </div>

//           <div className="w-1/2 text-end p-5   rounded-xl backdrop-blur-sm max-w-xs ml-auto">
//             <h2 className="text-2xl font-bold mb-1">TAX INVOICE</h2>
//             <div className="text-lg font-semibold mb-1">Order: #{order._id.slice(-6)}</div>
//             <div className="text-sm">📅 Date: {orderDate}</div>
//           </div>
//         </div>
//       </div>

//       {/* Order Summary Section */}
//       <div className="bg-white  border-l-4 pl-2 border-lime-500">
//         <h3 className="text-2xl font-bold text-lime-800 mb-2 uppercase tracking-wide">📋 Order Summary</h3>

//         {/* Addresses */}
//         <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-2">
//           {/* Shipping Address */}
//           <div className="bg-white border-2 border-lime-200 rounded-lg px-3 py-1 relative">
//             <div className="absolute top-0 left-0 right-0  bg-gradient-to-r from-lime-400 to-lime-600"></div>
//             <h4 className="text-lg font-bold text-lime-800 flex items-center">🚚 Shipping Address</h4>
//             <div className=" text-sm">
//               <p className="font-semibold text-gray-900 text-base">{order.shippingAddress?.name || "N/A"}</p>
//               <p className="text-gray-700">{order.shippingAddress?.address || "N/A"}</p>
//               <p className="text-gray-700">
//                 {order.shippingAddress?.city || "N/A"}, {order.shippingAddress?.state || "N/A"}{" "}
//                 {order.shippingAddress?.zipCode || "N/A"}
//               </p>
//               <p className="text-gray-700">📞 {order.shippingAddress?.phone || "N/A"}</p>
//               <p className="text-gray-700">✉️ {order.shippingAddress?.email || "N/A"}</p>
//             </div>
//           </div>

//           {/* Billing Address */}
//           <div className="bg-white border-2 border-lime-200 rounded-lg px-3 py-1 relative">
//             <div className="absolute top-0 left-0 right-0  bg-gradient-to-r from-lime-400 to-lime-600"></div>
//             <h4 className="text-lg font-bold text-lime-800 flex items-center">💳 Billing Address</h4>
//             <div className="text-sm">
//               <p className="font-semibold text-gray-900 text-base">
//                 {order.billingAddress?.name || order.shippingAddress?.name || "N/A"}
//               </p>
//               <p className="text-gray-700">
//                 {order.billingAddress?.address || order.shippingAddress?.address || "N/A"}
//               </p>
//               <p className="text-gray-700">
//                 {order.billingAddress?.city || order.shippingAddress?.city || "N/A"},{" "}
//                 {order.billingAddress?.state || order.shippingAddress?.state || "N/A"}{" "}
//                 {order.billingAddress?.zipCode || order.shippingAddress?.zipCode || "N/A"}
//               </p>
//               <p className="text-gray-700">📞 {order.billingAddress?.phone || order.shippingAddress?.phone || "N/A"}</p>
//               <p className="text-gray-700">✉️ {order.billingAddress?.email || order.shippingAddress?.email || "N/A"}</p>
//             </div>
//           </div>
//         </div>

//         {/* Products Table */}
//         <div className="mb-2">
//           <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
//             <thead>
//               <tr className="bg-gradient-to-r from-lime-500 to-lime-600 text-white">
//                 <th className="text-left p-4 font-bold"> Product</th>
//                 <th className="text-left p-4 font-bold"> SKU</th>
//                 <th className="text-center p-4 font-bold"> Quantity</th>
//                 <th className="text-right p-4 font-bold">Price</th>
//                 <th className="text-right p-4 font-bold"> Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {order.orderItems?.map((item, index) => (
//                 <tr key={item._id || index} className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
//                   <td className="p-4 font-medium text-gray-900">{item.name}</td>
//                   <td className="p-4 text-gray-600 whitespace-nowrap">{item.product?.sku || item.sku || "-"}</td>
//                   <td className="p-4 text-center font-semibold text-lime-600">{item.quantity}</td>
//                   <td className="p-4 text-right font-medium">{formatPrice(item.price)}</td>
//                   <td className="p-4 text-right font-bold text-lime-600">{formatPrice(item.price * item.quantity)}</td>
//                 </tr>
//               )) || (
//                 <tr>
//                   <td colSpan="5" className="p-8 text-center text-gray-500">
//                     No items found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Totals */}
//         <div className="bg-white border-2 border-lime-200 rounded-lg p-3">
//           <div className="space-y-1">
//             <div className="flex justify-between text-gray-700">
//               <span>💰 Sub-Total:</span>
//               <span className="font-medium">{formatPrice(order.itemsPrice || 0)}</span>
//             </div>
//             {/* Discount amount (AED) - now placed right below Sub-Total */}
//             {(() => {
//               const subtotal = Number(order.itemsPrice || 0)
//               const shipping = Number(order.shippingPrice || 0)
//               const tax = Number(order.taxPrice || 0)
//               const total = Number(order.totalPrice || 0)
//               // Prefer explicit discountAmount if present; otherwise derive it from totals
//               const explicit = Number(order.discountAmount || 0)
//               const expected = subtotal + shipping + (tax > 0 ? tax : 0)
//               const derived = total > 0 ? Math.max(0, expected - total) : 0
//               const discountAmt = explicit > 0 ? explicit : derived
//               return discountAmt > 0 ? (
//                 <div className="flex justify-between text-gray-700">
//                   <span>🎉 Discount:</span>
//                   <span className="font-medium text-gray-700">-{formatPrice(discountAmt)}</span>
//                 </div>
//               ) : null
//             })()}

//             {(() => {
//               const total = Number(order.totalPrice || 0)
//               const vat = total > 0 ? total * 0.05 : 0
//               return (
//                 <div className="flex justify-between text-gray-700">
//                   <span>✔️ Tax (VAT):</span>
//                   <span className="font-medium">{formatPrice(vat)}</span>
//                 </div>
//               )
//             })()}

//             <div className="flex justify-between text-gray-700">
//               <span>🚚 Shipping Charge:</span>
//               <span className="font-medium">{formatPrice(order.shippingPrice || 0)}</span>
//             </div>

//             <div className="border-t-2 border-lime-500">
//               <div className="flex justify-between text-xl font-bold text-lime-800 bg-lime-100 p-2 rounded-lg">
//                 <span> TOTAL AMOUNT:</span>
//                 <span>{formatPrice(order.totalPrice || 0)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-between gap-6 mt-2 bg-yellow-50 p-3 rounded-lg border-2 border-yellow-200">
//           {/* Section 1 */}
//           <div className="space-y-4 w-1/3">
//             <div>
//               <p className="font-semibold text-gray-800 mb-2">💳 Payment Status:</p>
//               <span
//                 className={`px-4 py-2 rounded-full text-sm font-bold ${
//                   order.isPaid ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
//                 }`}
//               >
//                 {order.isPaid ? "✅ Paid" : "❌ Unpaid"}
//               </span>
//             </div>
//           </div>

//           {/* Section 2 */}
//           <div className="space-y-4 w-1/3">
//             <div>
//               <p className="font-semibold text-gray-800">💰 Payment Method:</p>
//               <p className="text-gray-700">{order.paymentMethod || "Card"}</p>
//             </div>
//           </div>

//           {/* Section 3 */}
//           <div className="space-y-4 w-1/3">
//             {order.trackingId && (
//               <div>
//                 <p className="font-semibold text-gray-800">📦 Tracking ID:</p>
//                 <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">{order.trackingId}</code>
//               </div>
//             )}

//             {order.paidAt && (
//               <div>
//                 <p className="font-semibold text-gray-800">✅ Paid At:</p>
//                 <p className="text-gray-700">{new Date(order.paidAt).toLocaleString()}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Notes */}
//         {(order.customerNotes || order.notes) && (
//           <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
//             <h4 className="font-semibold text-blue-800 mb-2">📝 Special Notes:</h4>
//             <p className="text-blue-700 italic">{order.customerNotes || order.notes}</p>
//           </div>
//         )}
//       </div>

//       <div className="text-xs text-end mt-2 opacity-80">🖨️ Printed: {currentDate}</div>
//     </div>
//   )
// })

// // Set display name for debugging
// InvoiceComponent.displayName = "InvoiceComponent"

// const OnlineOrders = () => {
//   const [orders, setOrders] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedOrder, setSelectedOrder] = useState(null)
//   const [processingAction, setProcessingAction] = useState(false)
//   const [showStatusDropdown, setShowStatusDropdown] = useState({})
//   const [showPaymentDropdown, setShowPaymentDropdown] = useState({})

//   // Bulk selection states
//   const [selectedOrders, setSelectedOrders] = useState([])
//   const [selectAll, setSelectAll] = useState(false)
//   const [bulkStatus, setBulkStatus] = useState("")
//   const [showBulkActions, setShowBulkActions] = useState(false)

//   // Notes and tracking states
//   const [orderNotes, setOrderNotes] = useState("")
//   const [trackingId, setTrackingId] = useState("")
//   const [estimatedDelivery, setEstimatedDelivery] = useState("")

//   // Print ref
//   const printComponentRef = useRef(null)

//   const orderStatusOptions = ["Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"]
//   const paymentStatusOptions = ["Paid", "Unpaid"]

//   const formatPrice = (price) => {
//     return `AED ${price?.toLocaleString() || 0}`
//   }

//   const formatDate = (date) => {
//     return new Date(date).toLocaleString()
//   }

//   // Print handler
//   const handlePrint = useReactToPrint({
//     contentRef: printComponentRef,
//     documentTitle: `Invoice-${selectedOrder?._id.slice(-6)}`,
//     pageStyle: `
//       @page {
//         size: A4;
//         margin: 0.5in;
//       }
//       @media print {
//         body {
//           -webkit-print-color-adjust: exact !important;
//           color-adjust: exact !important;
//           print-color-adjust: exact !important;
//         }
//         * {
//           -webkit-print-color-adjust: exact !important;
//           color-adjust: exact !important;
//           print-color-adjust: exact !important;
//         }
//       }
//     `,
//   })

//   useEffect(() => {
//     fetchOrders()
//   }, [])

//   const fetchOrders = async () => {
//     try {
//       setLoading(true)
//       const token =
//         localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

//       if (!token) {
//         setError("Authentication token not found. Please login again.")
//         return
//       }

//       const { data } = await axios.get(`${config.API_URL}/api/admin/orders`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })

//       const onlineOrders = data.filter(
//         (order) => order.paymentMethod !== "Cash on Delivery" || order.source === "online" || !order.source,
//       )

//       setOrders(onlineOrders)
//       setError(null)
//       setLoading(false)
//     } catch (error) {
//       console.error("Error fetching orders:", error)
//       setError("Failed to load orders. Please try again later.")
//       setLoading(false)
//     }
//   }

//   const handleViewOrder = (order) => {
//     setSelectedOrder(order)
//     setOrderNotes(order.notes || "")
//     setTrackingId(order.trackingId || "")
//     setEstimatedDelivery(order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split("T")[0] : "")
//   }

//   const handleCloseModal = () => {
//     setSelectedOrder(null)
//     setOrderNotes("")
//     setTrackingId("")
//     setEstimatedDelivery("")
//   }

//   const handleUpdateStatus = async (orderId, status) => {
//     try {
//       setProcessingAction(true)
//       const token =
//         localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

//       const updateData = { status }

//       // If status is "Delivered", automatically set payment as paid
//       if (status === "Delivered") {
//         updateData.isPaid = true
//         updateData.paidAt = new Date().toISOString()
//       }

//       await axios.put(`${config.API_URL}/api/admin/orders/${orderId}/status`, updateData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })

//       const updatedOrder = { ...orders.find((order) => order._id === orderId), ...updateData }
//       setOrders(orders.map((order) => (order._id === orderId ? updatedOrder : order)))

//       if (selectedOrder && selectedOrder._id === orderId) {
//         setSelectedOrder({ ...selectedOrder, ...updateData })
//       }

//       setShowStatusDropdown({})
//       setError(null)
//       setProcessingAction(false)
//     } catch (error) {
//       console.error("Error updating status:", error)
//       setError("Failed to update order status: " + (error.response?.data?.message || error.message))
//       setProcessingAction(false)
//     }
//   }

//   const handleUpdatePaymentStatus = async (orderId, isPaid) => {
//     try {
//       setProcessingAction(true)
//       const token =
//         localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

//       // Simplified payload structure
//       const updateData = {
//         isPaid: isPaid,
//         ...(isPaid && { paidAt: new Date().toISOString() }),
//         ...(!isPaid && { paidAt: null })
//       }

//       console.log('Updating payment status with data:', updateData) // Debug log

//       const response = await axios.put(`${config.API_URL}/api/admin/orders/${orderId}`, updateData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })

//       console.log('Payment update response:', response.data) // Debug log

//       // Update local state with the response data
//       const updatedOrderData = {
//         ...updateData,
//         paidAt: isPaid ? new Date() : null,
//       }

//       setOrders(orders.map((order) => (order._id === orderId ? { ...order, ...updatedOrderData } : order)))

//       if (selectedOrder && selectedOrder._id === orderId) {
//         setSelectedOrder({ ...selectedOrder, ...updatedOrderData })
//       }

//       setShowPaymentDropdown({})
//       setError(null)
//       setProcessingAction(false)
//     } catch (error) {
//       console.error("Error updating payment status:", error)
//       console.error("Error details:", error.response?.data) // More detailed error logging
//       setError("Failed to update payment status: " + (error.response?.data?.message || error.message))
//       setProcessingAction(false)
//     }
//   }

//   const handleSaveOrderDetails = async () => {
//     try {
//       setProcessingAction(true)
//       const token =
//         localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

//       const updateData = {
//         notes: orderNotes,
//         trackingId: trackingId,
//         ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery).toISOString() })
//       }

//       await axios.put(`${config.API_URL}/api/admin/orders/${selectedOrder._id}`, updateData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })

//       // Update local state
//       const updatedOrder = {
//         ...selectedOrder,
//         notes: orderNotes,
//         trackingId: trackingId,
//         estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
//       }

//       setSelectedOrder(updatedOrder)
//       setOrders(orders.map((order) => (order._id === selectedOrder._id ? updatedOrder : order)))

//       setError(null)
//       setProcessingAction(false)
//       alert("Order details updated successfully!")
//     } catch (error) {
//       console.error("Error updating order details:", error)
//       setError("Failed to update order details: " + (error.response?.data?.message || error.message))
//       setProcessingAction(false)
//     }
//   }

//   const handleSendNotification = async (orderId) => {
//     try {
//       setProcessingAction(true)
//       const token =
//         localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

//       await axios.post(
//         `${config.API_URL}/api/admin/orders/${orderId}/notify`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       )

//       alert("Notification email sent successfully!")
//       setProcessingAction(false)
//     } catch (error) {
//       console.error("Error sending notification:", error)
//       setError("Failed to send notification: " + (error.response?.data?.message || error.message))
//       setProcessingAction(false)
//     }
//   }

//   // Bulk selection functions
//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedOrders([])
//       setSelectAll(false)
//     } else {
//       setSelectedOrders(filteredOrders.map((order) => order._id))
//       setSelectAll(true)
//     }
//   }

//   const handleSelectOrder = (orderId) => {
//     if (selectedOrders.includes(orderId)) {
//       setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
//       setSelectAll(false)
//     } else {
//       const newSelected = [...selectedOrders, orderId]
//       setSelectedOrders(newSelected)
//       if (newSelected.length === filteredOrders.length) {
//         setSelectAll(true)
//       }
//     }
//   }

//   const handleBulkStatusUpdate = async () => {
//     if (selectedOrders.length === 0 || !bulkStatus) {
//       alert("Please select orders and choose a status")
//       return
//     }

//     try {
//       setProcessingAction(true)
//       const token =
//         localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

//       await Promise.all(
//         selectedOrders.map((orderId) =>
//           axios.put(
//             `${config.API_URL}/api/admin/orders/${orderId}/status`,
//             { status: bulkStatus },
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             },
//           ),
//         ),
//       )

//       setOrders(orders.map((order) => (selectedOrders.includes(order._id) ? { ...order, status: bulkStatus } : order)))

//       setSelectedOrders([])
//       setSelectAll(false)
//       setBulkStatus("")
//       setShowBulkActions(false)
//       setProcessingAction(false)

//       alert(`Successfully updated ${selectedOrders.length} orders to ${bulkStatus}`)
//     } catch (error) {
//       console.error("Error updating bulk status:", error)
//       setError("Failed to update orders: " + (error.response?.data?.message || error.message))
//       setProcessingAction(false)
//     }
//   }

//   const filteredOrders = orders.filter(
//     (order) =>
//       order._id.includes(searchTerm) ||
//       order.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.shippingAddress?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   const toggleStatusDropdown = (orderId) => {
//     setShowStatusDropdown((prev) => ({
//       ...prev,
//       [orderId]: !prev[orderId],
//     }))
//     setShowPaymentDropdown({})
//   }

//   const togglePaymentDropdown = (orderId) => {
//     setShowPaymentDropdown((prev) => ({
//       ...prev,
//       [orderId]: !prev[orderId],
//     }))
//     setShowStatusDropdown({})
//   }

//   useEffect(() => {
//     const handleClickOutside = () => {
//       setShowStatusDropdown({})
//       setShowPaymentDropdown({})
//     }

//     document.addEventListener("click", handleClickOutside)
//     return () => document.removeEventListener("click", handleClickOutside)
//   }, [])

//   useEffect(() => {
//     setShowBulkActions(selectedOrders.length > 0)
//   }, [selectedOrders])

//   return (
//  <div className="min-h-screen bg-gray-100">
//       <AdminSidebar />


//     <div className="ml-64 p-8">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Online Orders</h1>
//           <p className="text-gray-600 mt-1">Orders placed through the website</p>
//         </div>
//         <button
//           onClick={fetchOrders}
//           className="flex items-center space-x-2 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-md transition-colors"
//           disabled={loading}
//         >
//           <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
//           <span>Refresh</span>
//         </button>
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md flex items-center justify-between">
//           <span>{error}</span>
//           <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
//             <X size={18} />
//           </button>
//         </div>
//       )}

//       {showBulkActions && (
//         <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border-l-4 border-lime-500">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <span className="text-sm font-medium text-gray-700">
//                 {selectedOrders.length} order{selectedOrders.length !== 1 ? "s" : ""} selected
//               </span>
//               <div className="flex items-center space-x-2">
//                 <label className="text-sm font-medium text-gray-700">Change status to:</label>
//                 <select
//                   value={bulkStatus}
//                   onChange={(e) => setBulkStatus(e.target.value)}
//                   className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
//                 >
//                   <option value="">Select Status</option>
//                   {orderStatusOptions.map((status) => (
//                     <option key={status} value={status}>
//                       {status}
//                     </option>
//                   ))}
//                 </select>
//                 <button
//                   onClick={handleBulkStatusUpdate}
//                   disabled={!bulkStatus || processingAction}
//                   className="bg-lime-500 hover:bg-lime-600 disabled:bg-gray-400 text-white px-4 py-1 rounded-md text-sm font-medium transition-colors"
//                 >
//                   {processingAction ? "Updating..." : "Update"}
//                 </button>
//               </div>
//             </div>
//             <button
//               onClick={() => {
//                 setSelectedOrders([])
//                 setSelectAll(false)
//                 setBulkStatus("")
//               }}
//               className="text-gray-500 hover:text-gray-700 text-sm"
//             >
//               Clear Selection
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mb-6 flex justify-between items-center">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//           <input
//             type="text"
//             placeholder="Search orders by ID, customer name, or email..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10 pr-4 py-2 w-full md:w-96 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
//           />
//         </div>
//         <div className="text-sm text-gray-600">
//           Total Online Orders: <span className="font-semibold text-lime-600">{filteredOrders.length}</span>
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left">
//                     <input
//                       type="checkbox"
//                       checked={selectAll}
//                       onChange={handleSelectAll}
//                       className="h-4 w-4 text-lime-500 focus:ring-lime-500 border-gray-300 rounded"
//                     />
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Order ID
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Customer
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Date
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Payment
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Total
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredOrders.map((order) => (
//                   <tr
//                     key={order._id}
//                     className={`hover:bg-gray-50 ${selectedOrders.includes(order._id) ? "bg-lime-50" : ""}`}
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <input
//                         type="checkbox"
//                         checked={selectedOrders.includes(order._id)}
//                         onChange={() => handleSelectOrder(order._id)}
//                         className="h-4 w-4 text-lime-500 focus:ring-lime-500 border-gray-300 rounded"
//                       />
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-lime-600">#{order._id.slice(-6)}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {order.deliveryType === "pickup" ? (
//                         <>
//                           <div className="text-sm text-gray-900">{order.pickupDetails?.location || "N/A"}</div>
//                           <div className="text-sm text-gray-500">{order.pickupDetails?.phone || "N/A"}</div>
//                         </>
//                       ) : (
//                         <>
//                           <div className="text-sm text-gray-900">{order.shippingAddress?.name || "N/A"}</div>
//                           <div className="text-sm text-gray-500">{order.shippingAddress?.email || "N/A"}</div>
//                         </>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
//                       <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap relative">
//                       <div className="relative">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             toggleStatusDropdown(order._id)
//                           }}
//                           className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity
//                           ${
//                             order.status === "Processing"
//                               ? "bg-yellow-100 text-yellow-800"
//                               : order.status === "Confirmed"
//                                 ? "bg-lime-100 text-lime-800"
//                                 : order.status === "Shipped"
//                                   ? "bg-purple-100 text-purple-800"
//                                   : order.status === "Out for Delivery"
//                                     ? "bg-indigo-100 text-indigo-800"
//                                     : order.status === "Delivered"
//                                       ? "bg-green-100 text-green-800"
//                                       : order.status === "Cancelled"
//                                         ? "bg-red-100 text-red-800"
//                                         : "bg-gray-100 text-gray-800"
//                           }`}
//                         >
//                           {order.status || "Processing"}
//                           <ChevronDown size={12} className="ml-1" />
//                         </button>

//                         {showStatusDropdown[order._id] && (
//                           <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
//                             {orderStatusOptions.map((status) => (
//                               <button
//                                 key={status}
//                                 onClick={(e) => {
//                                   e.stopPropagation()
//                                   handleUpdateStatus(order._id, status)
//                                 }}
//                                 className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//                                 disabled={processingAction}
//                               >
//                                 {status}
//                               </button>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap relative">
//                       <div className="relative">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             togglePaymentDropdown(order._id)
//                           }}
//                           className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition-colors
//                           ${order.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
//                         >
//                           {order.isPaid ? "Paid" : "Unpaid"}
//                           <ChevronDown size={12} className="ml-1" />
//                         </button>

//                         {showPaymentDropdown[order._id] && (
//                           <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20">
//                             {paymentStatusOptions.map((status) => (
//                               <button
//                                 key={status}
//                                 onClick={(e) => {
//                                   e.stopPropagation()
//                                   handleUpdatePaymentStatus(order._id, status === "Paid")
//                                 }}
//                                 className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//                                 disabled={processingAction}
//                               >
//                                 {status}
//                               </button>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {formatPrice(order.totalPrice)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <button
//                         onClick={() => handleViewOrder(order)}
//                         className="text-lime-600 hover:text-lime-900 mr-4"
//                         title="View Order Details"
//                       >
//                         <Eye size={18} />
//                       </button>
//                       <button
//                         onClick={() => handleSendNotification(order._id)}
//                         className="text-green-600 hover:text-green-900"
//                         disabled={processingAction}
//                         title="Send Email Notification"
//                       >
//                         <Mail size={18} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {filteredOrders.length === 0 && !loading && (
//             <div className="text-center py-12">
//               <div className="text-gray-500 text-lg">No online orders found</div>
//               <p className="text-gray-400 mt-2">
//                 Online orders will appear here when customers place orders through the website
//               </p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Comprehensive Order Details Modal */}
//       {selectedOrder && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-auto">
//             {/* Header */}
//             <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//               <div>
//                 <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
//                   <span>Dashboard</span>
//                   <span>/</span>
//                   <span>Online Orders</span>
//                   <span>/</span>
//                   <span className="text-lime-600">View</span>
//                 </div>
//                 <h2 className="text-2xl font-bold text-gray-900">Order ID: {selectedOrder._id.slice(-6)}</h2>
//               </div>
//               <button
//                 onClick={handleCloseModal}
//                 className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="p-6">
//               {/* Order Summary Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                 <div className="bg-lime-50 p-4 rounded-lg">
//                   <div className="flex items-center space-x-2">
//                     <Package className="text-lime-600" size={20} />
//                     <div>
//                       <p className="text-sm text-gray-600">Status</p>
//                       <p className="font-semibold text-lime-900">{selectedOrder.status || "Processing"}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-green-50 p-4 rounded-lg">
//                   <div className="flex items-center space-x-2">
//                     <CreditCard className="text-green-600" size={20} />
//                     <div>
//                       <p className="text-sm text-gray-600">Payment Type</p>
//                       <p className="font-semibold text-green-900">
//                         {selectedOrder.isPaid ? "Paid" : selectedOrder.paymentMethod || "Cash on Delivery"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-purple-50 p-4 rounded-lg">
//                   <div className="flex items-center space-x-2">
//                     <MapPin className="text-purple-600" size={20} />
//                     <div>
//                       <p className="text-sm text-gray-600">Order Type</p>
//                       <p className="font-semibold text-purple-900">Delivery</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <div className="flex items-center space-x-2">
//                     <User className="text-gray-600" size={20} />
//                     <div>
//                       <p className="text-sm text-gray-600">Created At</p>
//                       <p className="font-semibold text-gray-900 text-sm">{formatDate(selectedOrder.createdAt)}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Status Update Section */}
//               <div className="bg-white border rounded-lg p-4 mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
//                 <div className="flex items-center space-x-4">
//                   <select
//                     value={selectedOrder.status || "Processing"}
//                     onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
//                     className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
//                     disabled={processingAction}
//                   >
//                     {orderStatusOptions.map((status) => (
//                       <option key={status} value={status}>
//                         {status}
//                       </option>
//                     ))}
//                   </select>
//                   <span
//                     className={`px-3 py-1 text-sm font-medium rounded-full ${
//                       selectedOrder.status === "Processing"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : selectedOrder.status === "Confirmed"
//                           ? "bg-lime-100 text-lime-800"
//                           : selectedOrder.status === "Shipped"
//                             ? "bg-purple-100 text-purple-800"
//                             : selectedOrder.status === "Out for Delivery"
//                               ? "bg-indigo-100 text-indigo-800"
//                               : selectedOrder.status === "Delivered"
//                                 ? "bg-green-100 text-green-800"
//                                 : selectedOrder.status === "Cancelled"
//                                   ? "bg-red-100 text-red-800"
//                                   : "bg-gray-100 text-gray-800"
//                     }`}
//                   >
//                     {selectedOrder.status || "Processing"}
//                   </span>
//                 </div>

//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <h4 className="text-md font-medium text-gray-900 mb-3">Update Payment Status</h4>
//                   <div className="flex items-center space-x-4">
//                     <select
//                       value={selectedOrder.isPaid ? "Paid" : "Unpaid"}
//                       onChange={(e) => handleUpdatePaymentStatus(selectedOrder._id, e.target.value === "Paid")}
//                       className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       disabled={processingAction}
//                     >
//                       <option value="Unpaid">Unpaid</option>
//                       <option value="Paid">Paid</option>
//                     </select>
//                     <span
//                       className={`px-3 py-1 text-sm font-medium rounded-full ${
//                         selectedOrder.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//                       }`}
//                     >
//                       {selectedOrder.isPaid ? "Paid" : "Unpaid"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Order Items */}
//               <div className="bg-white border rounded-lg p-6 mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
//                 <div className="space-y-4">
//                   {selectedOrder.orderItems?.map((item, index) => (
//                     <div
//                       key={item._id || index}
//                       className="flex items-center justify-between py-3 border-b last:border-b-0"
//                     >
//                       <div className="flex items-center space-x-4">
//                         <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center">
//                           <Package size={24} className="text-gray-400" />
//                         </div>
//                         <div>
//                           <h4 className="font-medium text-gray-900">{item.name}</h4>
//                           <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
//                         <p className="text-sm text-gray-500">Total: {formatPrice(item.price * item.quantity)}</p>
//                       </div>
//                     </div>
//                   )) || <p className="text-gray-500 text-center py-4">No items found</p>}
//                 </div>
//               </div>

//               {/* Total Amount */}
//               <div className="bg-gray-50 border rounded-lg p-6 mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Amount</h3>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Subtotal:</span>
//                     <span className="text-gray-900">{formatPrice(selectedOrder.itemsPrice || 0)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Shipping:</span>
//                     <span className="text-gray-900">{formatPrice(selectedOrder.shippingPrice || 0)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Tax:</span>
//                     <span className="text-gray-900">{formatPrice(selectedOrder.taxPrice || 0)}</span>
//                   </div>
//                   {selectedOrder.discountAmount > 0 && (
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Discount:</span>
//                       <span className="text-green-600">-{formatPrice(selectedOrder.discountAmount)}</span>
//                     </div>
//                   )}
//                   <div className="border-t pt-2 flex justify-between">
//                     <span className="text-lg font-semibold text-gray-900">Total:</span>
//                     <span className="text-lg font-bold text-lime-600">
//                       {formatPrice(selectedOrder.totalPrice || 0)}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Addresses */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//                 {/* Shipping Address */}
//                 <div className="bg-white border rounded-lg p-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping / Pickup Address</h3>
//                   <div className="space-y-2">
//                     {selectedOrder.shippingAddress ? (
//                       <>
//                         <p>
//                           <span className="font-medium">Name:</span> {selectedOrder.shippingAddress.name || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-medium">Email:</span> {selectedOrder.shippingAddress.email || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-medium">Phone:</span> {selectedOrder.shippingAddress.phone || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-medium">Address:</span> {selectedOrder.shippingAddress.address || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-medium">City:</span> {selectedOrder.shippingAddress.city || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-medium">State:</span> {selectedOrder.shippingAddress.state || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-medium">Zip Code:</span>{" "}
//                           {selectedOrder.shippingAddress.zipCode || "N/A"}
//                         </p>
//                       </>
//                     ) : selectedOrder.pickupDetails ? (
//                       <>
//                         <p>
//                           <span className="font-medium">Store Name:</span>{" "}
//                           {selectedOrder.pickupDetails.location || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-medium">Store Address:</span>{" "}
//                           {selectedOrder.pickupDetails.storeAddress || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-medium">Store Phone:</span>{" "}
//                           {selectedOrder.pickupDetails.storePhone || "N/A"}
//                         </p>
//                       </>
//                     ) : (
//                       <p>N/A</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Billing Address */}
//                 <div className="bg-white border rounded-lg p-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
//                   <div className="space-y-2">
//                     <p>
//                       <span className="font-medium">Name:</span>{" "}
//                       {selectedOrder.billingAddress?.name || selectedOrder.shippingAddress?.name || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-medium">Email:</span>{" "}
//                       {selectedOrder.billingAddress?.email || selectedOrder.shippingAddress?.email || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-medium">Phone:</span>{" "}
//                       {selectedOrder.billingAddress?.phone || selectedOrder.shippingAddress?.phone || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-medium">Address:</span>{" "}
//                       {selectedOrder.billingAddress?.address || selectedOrder.shippingAddress?.address || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-medium">City:</span>{" "}
//                       {selectedOrder.billingAddress?.city || selectedOrder.shippingAddress?.city || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-medium">State:</span>{" "}
//                       {selectedOrder.billingAddress?.state || selectedOrder.shippingAddress?.state || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-medium">Zip Code:</span>{" "}
//                       {selectedOrder.billingAddress?.zipCode || selectedOrder.shippingAddress?.zipCode || "N/A"}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Additional Information with Editable Fields */}
//               <div className="bg-white border rounded-lg p-6 mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div>
//                       <p className="mb-2">
//                         <span className="font-medium">Payment Status:</span>
//                         <span
//                           className={`ml-2 px-2 py-1 text-xs rounded-full ${selectedOrder.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
//                         >
//                           {selectedOrder.isPaid ? "Paid" : "Unpaid"}
//                         </span>
//                       </p>
//                       {selectedOrder.paidAt && (
//                         <p>
//                           <span className="font-medium">Paid At:</span> {formatDate(selectedOrder.paidAt)}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
//                       <input
//                         type="text"
//                         value={trackingId}
//                         onChange={(e) => setTrackingId(e.target.value)}
//                         placeholder="Enter tracking ID"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery</label>
//                       <input
//                         type="date"
//                         value={estimatedDelivery}
//                         onChange={(e) => setEstimatedDelivery(e.target.value)}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
//                   <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md min-h-[48px]">
//                     <p className="text-gray-700 whitespace-pre-wrap">
//                       {selectedOrder.customerNotes || selectedOrder.notes || "N/A"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <button
//                     onClick={handleSaveOrderDetails}
//                     disabled={processingAction}
//                     className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
//                   >
//                     <Save size={16} />
//                     <span>{processingAction ? "Saving..." : "Save Details"}</span>
//                   </button>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end space-x-4">
//                 <button
//                   onClick={handleCloseModal}
//                   className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
//                 >
//                   Close
//                 </button>
//                 <button
//                   onClick={handlePrint}
//                   className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors"
//                 >
//                   <Printer size={18} className="mr-2" />
//                   Print Receipt
//                 </button>
//                 <button
//                   onClick={() => handleSendNotification(selectedOrder._id)}
//                   className="bg-lime-600 hover:bg-lime-700 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors"
//                   disabled={processingAction}
//                 >
//                   <Mail size={18} className="mr-2" />
//                   Send Notification
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Hidden Invoice Component for Printing */}
//       {selectedOrder && (
//         <div style={{ display: "none" }}>
//           <InvoiceComponent order={selectedOrder} ref={printComponentRef} />
//         </div>
//       )}
//     </div>
//     </div>
//   )
// }

// export default OnlineOrders


































































































































































































"use client"

import { useState, useEffect, useRef, forwardRef } from "react"
import axios from "axios"
import { useReactToPrint } from "react-to-print"
import {
  Search,
  Eye,
  Mail,
  ChevronDown,
  RefreshCw,
  X,
  Package,
  CreditCard,
  MapPin,
  User,
  Printer,
  Save,
} from "lucide-react"

import config from "../../config/config"
import { getInvoiceBreakdown } from "../../utils/invoiceBreakdown"
import { resolveOrderItemBasePrice, computeBaseSubtotal, deriveBaseDiscount } from "../../utils/orderPricing"

// Invoice Component for Printing - Using forwardRef
const InvoiceComponent = forwardRef(({ order }, ref) => {
  const formatPrice = (price) => {
    return `AED ${Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
  }

  const resolvedItems = Array.isArray(order?.orderItems) ? order.orderItems : []
  const baseSubtotal = computeBaseSubtotal(resolvedItems)

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
                  {resolvedItems.map((item, index) => {
                    const basePrice = resolveOrderItemBasePrice(item)
                    const salePrice = Number(item.price) || basePrice
                    const quantity = Number(item.quantity) || 0
                    const showDiscount = basePrice > salePrice
                    const lineTotal = salePrice * quantity
                    const baseTotal = basePrice * quantity

                    return (
                      <tr key={index} className="hover:bg-lime-50">
                        <td className="border border-lime-300 px-3 py-2 text-sm">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {showDiscount && (
                            <div className="text-xs text-gray-500">Base: {formatPrice(basePrice)}</div>
                          )}
                        </td>
                        <td className="border border-lime-300 px-3 py-2 text-center text-sm">{quantity}</td>
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
          </div>
          <div className="bg-white border-2 border-lime-200 rounded-lg px-3 py-1 relative">
            <div className="absolute top-0 left-0 right-0  bg-gradient-to-r from-lime-400 to-lime-600"></div>
            <h4 className="text-lg font-bold text-lime-800 flex items-center">🚚 Shipping Address</h4>
            <div className=" text-sm">
              <p className="font-semibold text-gray-900 text-base">{order.shippingAddress?.name || "N/A"}</p>
              <p className="text-gray-700">{order.shippingAddress?.address || "N/A"}</p>
              <p className="text-gray-700">
                {order.shippingAddress?.city || "N/A"}, {order.shippingAddress?.state || "N/A"}{" "}
                {order.shippingAddress?.zipCode || "N/A"}
              </p>
              <p className="text-gray-700">📞 {order.shippingAddress?.phone || "N/A"}</p>
              <p className="text-gray-700">✉️ {order.shippingAddress?.email || "N/A"}</p>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white border-2 border-lime-200 rounded-lg px-3 py-1 relative">
            <div className="absolute top-0 left-0 right-0  bg-gradient-to-r from-lime-400 to-lime-600"></div>
            <h4 className="text-lg font-bold text-lime-800 flex items-center">💳 Billing Address</h4>
            <div className="text-sm">
              <p className="font-semibold text-gray-900 text-base">
                {order.billingAddress?.name || order.shippingAddress?.name || "N/A"}
              </p>
              <p className="text-gray-700">
                {order.billingAddress?.address || order.shippingAddress?.address || "N/A"}
              </p>
              <p className="text-gray-700">
                {order.billingAddress?.city || order.shippingAddress?.city || "N/A"},{" "}
                {order.billingAddress?.state || order.shippingAddress?.state || "N/A"}{" "}
                {order.billingAddress?.zipCode || order.shippingAddress?.zipCode || "N/A"}
              </p>
              <p className="text-gray-700">📞 {order.billingAddress?.phone || order.shippingAddress?.phone || "N/A"}</p>
              <p className="text-gray-700">✉️ {order.billingAddress?.email || order.shippingAddress?.email || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="mb-2">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gradient-to-r from-lime-500 to-lime-600 text-white">
                <th className="text-left p-4 font-bold"> Product</th>
                <th className="text-left p-4 font-bold"> SKU</th>
                <th className="text-center p-4 font-bold"> Quantity</th>
                <th className="text-right p-4 font-bold">Price</th>
                <th className="text-right p-4 font-bold"> Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems?.map((item, index) => (
                <tr key={item._id || index} className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                  <td className="p-4 font-medium text-gray-900">{item.name}</td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">{item.product?.sku || item.sku || "-"}</td>
                  <td className="p-4 text-center font-semibold text-lime-600">{item.quantity}</td>
                  <td className="p-4 text-right font-medium">{formatPrice(item.price)}</td>
                  <td className="p-4 text-right font-bold text-lime-600">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
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

            {couponDiscount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>
                  Coupon{couponCode ? ` (${couponCode})` : ""}:
                </span>
                <span className="font-medium text-green-700">-{formatPrice(couponDiscount)}</span>
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
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-6 mt-2 bg-yellow-50 p-3 rounded-lg border-2 border-yellow-200">
          {/* Section 1 */}
          <div className="space-y-4 w-1/3">
            <div>
              <p className="font-semibold text-gray-800 mb-2">💳 Payment Status:</p>
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  order.isPaid ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                }`}
              >
                {order.isPaid ? "✅ Paid" : "❌ Unpaid"}
              </span>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-4 w-1/3">
            <div>
              <p className="font-semibold text-gray-800">💰 Payment Method:</p>
              <p className="text-gray-700">{order.paymentMethod || "Card"}</p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-4 w-1/3">
            {order.trackingId && (
              <div>
                <p className="font-semibold text-gray-800">📦 Tracking ID:</p>
                <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">{order.trackingId}</code>
              </div>
            )}

            {order.paidAt && (
              <div>
                <p className="font-semibold text-gray-800">✅ Paid At:</p>
                <p className="text-gray-700">{new Date(order.paidAt).toLocaleString()}</p>
              </div>
            )}
          </div>
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

// Set display name for debugging
InvoiceComponent.displayName = "InvoiceComponent"

const OnlineOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState({})
  const [showPaymentDropdown, setShowPaymentDropdown] = useState({})

  // Bulk selection states
  const [selectedOrders, setSelectedOrders] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [bulkStatus, setBulkStatus] = useState("")
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Notes and tracking states
  const [orderNotes, setOrderNotes] = useState("")
  const [trackingId, setTrackingId] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")

  // Print ref
  const printComponentRef = useRef(null)

  const orderStatusOptions = ["Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"]
  const paymentStatusOptions = ["Paid", "Unpaid"]

  const formatPrice = (price) => {
    return `AED ${price?.toLocaleString() || 0}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString()
  }

  const selectedTotals = getInvoiceBreakdown(selectedOrder || {})
  const selectedOrderItems = Array.isArray(selectedOrder?.orderItems) ? selectedOrder.orderItems : []
  const selectedBaseSubtotal = computeBaseSubtotal(selectedOrderItems)
  const selectedBaseDiscount = deriveBaseDiscount(selectedBaseSubtotal, selectedTotals.subtotal)

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

      const onlineOrders = data.filter(
        (order) => order.paymentMethod !== "Cash on Delivery" || order.source === "online" || !order.source,
      )

      setOrders(onlineOrders)
      setError(null)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to load orders. Please try again later.")
      setLoading(false)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setOrderNotes(order.notes || "")
    setTrackingId(order.trackingId || "")
    setEstimatedDelivery(order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split("T")[0] : "")
  }

  const handleCloseModal = () => {
    setSelectedOrder(null)
    setOrderNotes("")
    setTrackingId("")
    setEstimatedDelivery("")
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
    } catch (error) {
      console.error("Error updating status:", error)
      setError("Failed to update order status: " + (error.response?.data?.message || error.message))
      setProcessingAction(false)
    }
  }

  const handleUpdatePaymentStatus = async (orderId, isPaid) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      // Simplified payload structure
      const updateData = {
        isPaid: isPaid,
        ...(isPaid && { paidAt: new Date().toISOString() }),
        ...(!isPaid && { paidAt: null })
      }

      console.log('Updating payment status with data:', updateData) // Debug log

      const response = await axios.put(`${config.API_URL}/api/admin/orders/${orderId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log('Payment update response:', response.data) // Debug log

      // Update local state with the response data
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
    } catch (error) {
      console.error("Error updating payment status:", error)
      console.error("Error details:", error.response?.data) // More detailed error logging
      setError("Failed to update payment status: " + (error.response?.data?.message || error.message))
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
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery).toISOString() })
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
      }

      setSelectedOrder(updatedOrder)
      setOrders(orders.map((order) => (order._id === selectedOrder._id ? updatedOrder : order)))

      setError(null)
      setProcessingAction(false)
      alert("Order details updated successfully!")
    } catch (error) {
      console.error("Error updating order details:", error)
      setError("Failed to update order details: " + (error.response?.data?.message || error.message))
      setProcessingAction(false)
    }
  }

  const handleSendNotification = async (orderId) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      await axios.post(
        `${config.API_URL}/api/admin/orders/${orderId}/notify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      alert("Notification email sent successfully!")
      setProcessingAction(false)
    } catch (error) {
      console.error("Error sending notification:", error)
      setError("Failed to send notification: " + (error.response?.data?.message || error.message))
      setProcessingAction(false)
    }
  }

  // Bulk selection functions
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([])
      setSelectAll(false)
    } else {
      setSelectedOrders(filteredOrders.map((order) => order._id))
      setSelectAll(true)
    }
  }

  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
      setSelectAll(false)
    } else {
      const newSelected = [...selectedOrders, orderId]
      setSelectedOrders(newSelected)
      if (newSelected.length === filteredOrders.length) {
        setSelectAll(true)
      }
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (selectedOrders.length === 0 || !bulkStatus) {
      alert("Please select orders and choose a status")
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

      alert(`Successfully updated ${selectedOrders.length} orders to ${bulkStatus}`)
    } catch (error) {
      console.error("Error updating bulk status:", error)
      setError("Failed to update orders: " + (error.response?.data?.message || error.message))
      setProcessingAction(false)
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order._id.includes(searchTerm) ||
      order.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  useEffect(() => {
    setShowBulkActions(selectedOrders.length > 0)
  }, [selectedOrders])

  return (
    <div className="p-8 ml-64 ">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Online Orders</h1>
          <p className="text-gray-600 mt-1">Orders placed through the website</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-md transition-colors"
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
            className="pl-10 pr-4 py-2 w-full md:w-96 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
          />
        </div>
        <div className="text-sm text-gray-600">
          Total Online Orders: <span className="font-semibold text-lime-600">{filteredOrders.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
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
                    <td className="px-6 py-4 whitespace-nowrap" style={{ overflow: 'visible' }}>
                      <div style={{ position: 'relative' }}>
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
                                : order.status === "Shipped"
                                  ? "bg-purple-100 text-purple-800"
                                  : order.status === "Out for Delivery"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : order.status === "Delivered"
                                      ? "bg-green-100 text-green-800"
                                      : order.status === "Cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status || "Processing"}
                          <ChevronDown size={12} className="ml-1" />
                        </button>

                        {showStatusDropdown[order._id] && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', width: '192px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 9999 }}>
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
                    <td className="px-6 py-4 whitespace-nowrap" style={{ overflow: 'visible' }}>
                      <div style={{ position: 'relative' }}>
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
                          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', width: '128px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 9999 }}>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-lime-600 hover:text-lime-900 mr-4"
                        title="View Order Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleSendNotification(order._id)}
                        className="text-green-600 hover:text-green-900"
                        disabled={processingAction}
                        title="Send Email Notification"
                      >
                        <Mail size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No online orders found</div>
              <p className="text-gray-400 mt-2">
                Online orders will appear here when customers place orders through the website
              </p>
            </div>
          )}
        </div>
      )}

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
                  <span>Online Orders</span>
                  <span>/</span>
                  <span className="text-lime-600">View</span>
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
                <div className="bg-lime-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="text-lime-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-lime-900">{selectedOrder.status || "Processing"}</p>
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
                    <User className="text-gray-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="font-semibold text-gray-900 text-sm">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Section */}
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedOrder.status || "Processing"}
                    onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
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
                    {selectedOrder.status || "Processing"}
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
                  {selectedOrder.orderItems?.map((item, index) => (
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
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                        <p className="text-sm text-gray-500">Total: {formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  )) || <p className="text-gray-500 text-center py-4">No items found</p>}
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
                    {selectedBaseDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Offer Discount:</span>
                        <span className="text-green-600">-{formatPrice(selectedBaseDiscount)}</span>
                      </div>
                    )}
                    {selectedTotals.couponDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {selectedTotals.couponCode ? `Coupon (${selectedTotals.couponCode})` : "Coupon Discount"}:
                        </span>
                        <span className="text-green-600">-{formatPrice(selectedTotals.couponDiscount)}</span>
                      </div>
                    )}
                  {selectedTotals.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">{formatPrice(selectedTotals.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-gray-900">{formatPrice(selectedTotals.shipping)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-lime-600">{formatPrice(selectedTotals.total)}</span>
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
                          <span className="font-medium">Address:</span> {selectedOrder.shippingAddress.address || "N/A"}
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

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md min-h-[48px]">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedOrder.customerNotes || selectedOrder.notes || "N/A"}
                    </p>
                  </div>
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
    </div>
  )
}

export default OnlineOrders