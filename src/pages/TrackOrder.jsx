// "use client"

// import { useState } from "react"
// import { useToast } from "../context/ToastContext"
// import { Package, Truck, CheckCircle, Clock, AlertCircle, Search } from "lucide-react"
// import axios from "axios"
// import { getFullImageUrl } from "../utils/imageUtils"
// import { useLanguage } from "../context/LanguageContext"
// import TranslatedText from "../components/TranslatedText"

// import config from "../config/config"

// const TrackOrder = () => {
//   const { showToast } = useToast()
//   const { getLocalizedPath } = useLanguage()
//   const [formData, setFormData] = useState({
//     email: "",
//     orderId: "",
//   })
//   const [loading, setLoading] = useState(false)
//   const [orderData, setOrderData] = useState(null)
//   const [error, setError] = useState("")

//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError("")
//     setOrderData(null)

//     try {
//       const { data } = await axios.post(`${config.API_URL}/api/orders/track`, {
//         email: formData.email,
//         orderId: formData.orderId,
//       })

//       setOrderData(data)
//       showToast("Order found successfully!", "success")
//     } catch (error) {
//       console.error("Error tracking order:", error)
//       const errorMessage = error.response?.data?.message || "Order not found. Please check your details."
//       setError(errorMessage)
//       showToast(errorMessage, "error")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getStatusIcon = (status) => {
//     switch (status.toLowerCase()) {
//       case "pending":
//       case "received":
//         return <Clock className="text-[#505e4d]" size={24} />
//       case "processing":
//       case "in progress":
//         return <Package className="text-[#505e4d]" size={24} />
//       case "shipped":
//       case "ready for shipment":
//       case "on the way":
//         return <Truck className="text-[#505e4d]" size={24} />
//       case "delivered":
//         return <CheckCircle className="text-[#505e4d]" size={24} />
//       case "cancelled":
//       case "rejected":
//         return <AlertCircle className="text-[#505e4d]" size={24} />
//       default:
//         return <Package className="text-gray-500" size={24} />
//     }
//   }

//   const getStatusColor = (status) => {
//     switch (status.toLowerCase()) {
//       case "pending":
//       case "received":
//         return "text-[#505e4d] bg-white"
//       case "processing":
//       case "in progress":
//         return "text-[#505e4d] bg-white"
//       case "shipped":
//       case "ready for shipment":
//       case "on the way":
//         return "text-[#505e4d] bg-white"
//       case "delivered":
//         return "text-[#505e4d] bg-white"
//       case "cancelled":
//       case "rejected":
//         return "text-[#505e4d] bg-white"
//       default:
//         return "text-gray-600 bg-gray-100"
//     }
//   }

//   const formatPrice = (price) => {
//     return `${Number(price).toLocaleString()}.00 AED`
//   }

//   const getTrackingSteps = (status) => {
//     const steps = [
//       { name: "Order Placed", status: "completed" },
//       { name: "Order Confirmed", status: "completed" },
//       { name: "Processing", status: "pending" },
//       { name: "Shipped", status: "pending" },
//       { name: "Delivered", status: "pending" },
//     ]

//     const currentStatus = status.toLowerCase()

//     if (currentStatus.includes("processing") || currentStatus.includes("progress")) {
//       steps[2].status = "current"
//     } else if (
//       currentStatus.includes("shipped") ||
//       currentStatus.includes("way") ||
//       currentStatus.includes("shipment")
//     ) {
//       steps[2].status = "completed"
//       steps[3].status = "current"
//     } else if (currentStatus.includes("delivered")) {
//       steps[2].status = "completed"
//       steps[3].status = "completed"
//       steps[4].status = "completed"
//     }

//     return steps
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 overflow-x-hidden">
//       <div className="max-w-4xl w-full mx-auto px-4">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2"><TranslatedText>Track Your Order</TranslatedText></h1>
//           <p className="text-gray-600"><TranslatedText>Enter your email and order ID to track your order status</TranslatedText></p>
//         </div>

//         {/* Track Order Form */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2"><TranslatedText>Email Address</TranslatedText></label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#505e4d]"
//                   placeholder="Enter your email address"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2"><TranslatedText>Order ID</TranslatedText></label>
//                 <input
//                   type="text"
//                   name="orderId"
//                   value={formData.orderId}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#505e4d]"
//                   placeholder="Enter your order ID"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="flex justify-center">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="bg-[#505e4d] text-white px-8 py-3 rounded-md hover:bg-[#505e4d] disabled:opacity-50 flex items-center space-x-2"
//               >
//                 <Search size={20} />
//                 <span>{loading ? <TranslatedText>Tracking...</TranslatedText> : <TranslatedText>Track Order</TranslatedText>}</span>
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="bg-white border border-[#505e4d] rounded-lg p-4 mb-8">
//             <div className="flex items-center">
//               <AlertCircle className="text-[#505e4d] mr-2" size={20} />
//               <p className="text-[#505e4d]">{error}</p>
//             </div>
//           </div>
//         )}

//         {/* Order Details */}
//         {orderData && (
//           <div className="space-y-6 overflow-x-auto">
//             {/* Order Summary */}
//             <div className="bg-white rounded-lg shadow-md p-6 min-w-0 w-full">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
//                 <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderData.status)}`}>
//                   {orderData.status}
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0 w-full">
//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
//                   <div className="space-y-1 text-sm">
//                     <p>
//                       <span className="font-medium">Order ID:</span> {orderData._id}
//                     </p>
//                     <p>
//                       <span className="font-medium">Order Date:</span>{" "}
//                       {new Date(orderData.createdAt).toLocaleDateString()}
//                     </p>
//                     <p>
//                       <span className="font-medium">Total Amount:</span> {formatPrice(orderData.totalPrice)}
//                     </p>
//                     {orderData.trackingId && (
//                       <p>
//                         <span className="font-medium">Tracking ID:</span> {orderData.trackingId}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
//                   <div className="text-sm text-gray-600">
//                     {orderData.shippingAddress ? (
//                       <>
//                         <p>{orderData.shippingAddress.name}</p>
//                         <p>{orderData.shippingAddress.address}</p>
//                         <p>
//                           {orderData.shippingAddress.city}, {orderData.shippingAddress.postalCode}
//                         </p>
//                         <p>{orderData.shippingAddress.country}</p>
//                         <p>Phone: {orderData.shippingAddress.phone}</p>
//                       </>
//                     ) : (
//                       <p>No shipping address available.</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Tracking Progress */}
//             <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto relative">
//               <h2 className="text-xl font-bold text-gray-900 mb-6">Order Progress</h2>

//               <div className="flex items-center justify-between mb-8 min-w-0 w-full">
//                 {getTrackingSteps(orderData.status).map((step, index) => (
//                   <div key={index} className="flex flex-col items-center flex-1 min-w-0">
//                     <div
//                       className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
//                         step.status === "completed"
//                           ? "bg-[#505e4d] text-white"
//                           : step.status === "current"
//                             ? "bg-[#505e4d] text-white"
//                             : "bg-gray-200 text-gray-500"
//                       }`}
//                     >
//                       {step.status === "completed" ? (
//                         <CheckCircle size={20} />
//                       ) : step.status === "current" ? (
//                         <Clock size={20} />
//                       ) : (
//                         <div className="w-3 h-3 rounded-full bg-current"></div>
//                       )}
//                     </div>
//                     <span
//                       className={`text-xs text-center ${
//                         step.status === "completed" || step.status === "current"
//                           ? "text-gray-900 font-medium"
//                           : "text-gray-500"
//                       }`}
//                     >
//                       {step.name}
//                     </span>
//                     {index < getTrackingSteps(orderData.status).length - 1 && (
//                       <div
//                         className={`hidden md:block absolute h-0.5 w-full top-5 left-1/2 transform -translate-y-1/2 ${
//                           step.status === "completed" ? "bg-[#505e4d]" : "bg-gray-200"
//                         }`}
//                         style={{ zIndex: -1 }}
//                       ></div>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="text-center">
//                 <div className="flex items-center justify-center mb-2">
//                   {getStatusIcon(orderData.status)}
//                   <span className="ml-2 text-lg font-semibold text-gray-900">Current Status: {orderData.status}</span>
//                 </div>
//                 <p className="text-gray-600 text-sm">
//                   {orderData.status.toLowerCase().includes("delivered")
//                     ? "Your order has been delivered successfully!"
//                     : orderData.status.toLowerCase().includes("shipped") ||
//                         orderData.status.toLowerCase().includes("way")
//                       ? "Your order is on the way to your address."
//                       : orderData.status.toLowerCase().includes("processing")
//                         ? "Your order is being processed and will be shipped soon."
//                         : "Your order has been received and is being prepared."}
//                 </p>
//               </div>
//             </div>

//             {/* Order Items */}
//             <div className="bg-white rounded-lg shadow-md p-6 min-w-0 w-full">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
//               <div className="space-y-4">
//                 {orderData.orderItems.filter(item => !item.isProtection).map((item, index) => {
//                   console.log('Order item:', item);
//                   const price = Number(item.price) || 0;
//                   const qty = Number(item.quantity) || 0;
//                   const total = price * qty;
//                   return (
//                     <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg min-w-0 w-full">
//                       <div className="relative">
//                         <img
//                           src={getFullImageUrl(item.image) || "/placeholder.svg?height=80&width=80"}
//                           alt={item.name}
//                           className="w-20 h-20 object-contain rounded"
//                         />
//                         <span className="absolute bottom-1 right-1 bg-[#505e4d] text-white text-xs px-2 py-0.5 rounded-full">
//                           Qty: {item.quantity}
//                         </span>
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h3 className="font-medium text-gray-900">{item.name}</h3>
//                         <p className="text-sm font-medium text-gray-900">{formatPrice(item.price)} each</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-bold text-gray-900">{total > 0 ? formatPrice(total) : "N/A"}</p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {orderData.orderItems.some(item => item.isProtection) && (
//                 <div className="mt-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
//                     <svg className="w-5 h-5 mr-2 text-[#505e4d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                     </svg>
//                     Buyer Protection Plans
//                   </h3>
//                   <div className="space-y-3">
//                     {orderData.orderItems.filter(item => item.isProtection).map((item, index) => {
//                       const price = Number(item.price) || 0;
//                       return (
//                         <div key={index} className="flex items-center p-4 bg-white border border-[#505e4d] rounded-lg">
//                           <svg className="w-8 h-8 mr-3 text-[#505e4d] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                           </svg>
//                           <div className="flex-1 min-w-0">
//                             <h4 className="font-medium text-gray-900">{item.name}</h4>
//                           </div>
//                           <div className="text-right">
//                             <p className="font-bold text-gray-900">{formatPrice(price)}</p>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               <div className="mt-6 pt-4 border-t border-gray-200">
//                 <div className="flex justify-between items-center">
//                   <span className="text-lg font-bold text-gray-900">Total Amount:</span>
//                   <span className="text-lg font-bold text-[#505e4d]">{formatPrice(orderData.totalPrice)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default TrackOrder










"use client"

import { useState } from "react"
import { useToast } from "../context/ToastContext"
import { 
  Package, Truck, CheckCircle, Clock, AlertCircle, Search, 
  Mail, Hash, MapPin, Calendar, CreditCard, Phone, User,
  ShieldCheck, ArrowRight, Sparkles, Box, Home
} from "lucide-react"
import axios from "axios"
import { getFullImageUrl } from "../utils/imageUtils"

import config from "../config/config"

const TrackOrder = () => {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    orderId: "",
  })
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [error, setError] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setOrderData(null)

    try {
      const { data } = await axios.post(`${config.API_URL}/api/orders/track`, {
        email: formData.email,
        orderId: formData.orderId,
      })

      setOrderData(data)
      showToast("Order found successfully!", "success")
    } catch (error) {
      console.error("Error tracking order:", error)
      const errorMessage = error.response?.data?.message || "Order not found. Please check your details."
      setError(errorMessage)
      showToast(errorMessage, "error")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "received":
        return <Clock className="text-[#505e4d]" size={28} />
      case "processing":
      case "in progress":
        return <Package className="text-[#505e4d]" size={28} />
      case "shipped":
      case "ready for shipment":
      case "on the way":
        return <Truck className="text-[#505e4d]" size={28} />
      case "delivered":
        return <CheckCircle className="text-[#505e4d]" size={28} />
      case "cancelled":
      case "rejected":
        return <AlertCircle className="text-[#505e4d]" size={28} />
      default:
        return <Package className="text-gray-500" size={28} />
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "received":
        return "text-[#505e4d] bg-white border-[#505e4d]"
      case "processing":
      case "in progress":
        return "text-[#505e4d] bg-white border-[#505e4d]"
      case "shipped":
      case "ready for shipment":
      case "on the way":
        return "text-[#505e4d] bg-white border-[#505e4d]"
      case "delivered":
        return "text-[#505e4d] bg-white border-[#505e4d]"
      case "cancelled":
      case "rejected":
        return "text-[#505e4d] bg-white border-[#505e4d]"
      default:
        return "text-gray-700 bg-gray-100 border-gray-200"
    }
  }

  const formatPrice = (price) => {
    return `${Number(price).toLocaleString()}.00 AED`
  }

  const getTrackingSteps = (status) => {
    const steps = [
      { name: "Order Placed", icon: Box, status: "completed" },
      { name: "Confirmed", icon: CheckCircle, status: "completed" },
      { name: "Processing", icon: Package, status: "pending" },
      { name: "Shipped", icon: Truck, status: "pending" },
      { name: "Delivered", icon: Home, status: "pending" },
    ]

    const currentStatus = status.toLowerCase()

    if (currentStatus.includes("processing") || currentStatus.includes("progress")) {
      steps[2].status = "current"
    } else if (
      currentStatus.includes("shipped") ||
      currentStatus.includes("way") ||
      currentStatus.includes("shipment")
    ) {
      steps[2].status = "completed"
      steps[3].status = "current"
    } else if (currentStatus.includes("delivered")) {
      steps[2].status = "completed"
      steps[3].status = "completed"
      steps[4].status = "completed"
    }

    return steps
  }

  const features = [
    { icon: Search, title: "Real-time Updates", desc: "Track your order status instantly" },
    { icon: Truck, title: "Live Tracking", desc: "Know where your package is" },
    { icon: ShieldCheck, title: "Secure Delivery", desc: "Safe and protected shipping" }
  ]

  return (
    <div className="min-h-screen bg-[#f3f5f2]">
      {/* Hero Section */}
      <div className="bg-[#505e4d]">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center">
            {/* Icon Badge */}
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-xl rounded-3xl mb-6 border border-white/20 shadow-2xl">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Track Your Order
            </h1>
            <p className="text-lg sm:text-xl text-white max-w-2xl mx-auto leading-relaxed">
              Enter your order details below to get real-time updates on your shipment
            </p>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm">Instant Updates</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/40"></div>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-5 h-5" />
                <span className="text-sm">24/7 Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 relative z-10">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex items-center gap-4 p-2">
                <div className="w-12 h-12 bg-[#505e4d] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Track Order Form */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 mb-10">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Enter Your Details</h2>
            <p className="text-gray-500">We'll find your order and show you the current status</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Field */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#505e4d] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              {/* Order ID Field */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#505e4d] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Enter your order ID"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative bg-[#505e4d] text-white px-10 py-4 rounded-xl hover:bg-[#445340] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-semibold shadow-lg transition-colors duration-300"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Tracking...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Track My Order</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-white border-2 border-[#505e4d] rounded-2xl p-5 mb-10 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-[#505e4d]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#505e4d]">Order Not Found</h3>
                <p className="text-[#505e4d]">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        {orderData && (
          <div className="space-y-8 animate-fadeIn">
            {/* Status Banner */}
            <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 ${getStatusColor(orderData.status)}`}>
              <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/80 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                  {getStatusIcon(orderData.status)}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <p className="text-sm font-medium opacity-80 mb-1">Current Status</p>
                  <h2 className="text-2xl sm:text-3xl font-bold">{orderData.status}</h2>
                  <p className="mt-2 opacity-80">
                    {orderData.status.toLowerCase().includes("delivered")
                      ? "ðŸŽ‰ Your order has been delivered successfully!"
                      : orderData.status.toLowerCase().includes("shipped") ||
                          orderData.status.toLowerCase().includes("way")
                        ? "ðŸ“¦ Your order is on the way to your address."
                        : orderData.status.toLowerCase().includes("processing")
                          ? "âš™ï¸ Your order is being processed and will be shipped soon."
                          : "âœ… Your order has been received and is being prepared."}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Progress */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#505e4d]" />
                </div>
                Order Progress
              </h2>

              {/* Desktop Progress Bar */}
              <div className="hidden md:block relative mb-8">
                {/* Progress Line Background */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                
                {/* Progress Line Active */}
                <div 
                  className="absolute top-6 left-0 h-1 bg-[#505e4d] rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(getTrackingSteps(orderData.status).filter(s => s.status === 'completed').length / 5) * 100}%` 
                  }}
                ></div>

                <div className="relative flex items-start justify-between">
                  {getTrackingSteps(orderData.status).map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={index} className="flex flex-col items-center" style={{ width: '20%' }}>
                        <div
                          className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                            step.status === "completed"
                              ? "bg-[#505e4d] text-white shadow-lg shadow-[#505e4d]/30"
                              : step.status === "current"
                                ? "bg-[#505e4d] text-white shadow-lg shadow-[#505e4d]/30 animate-pulse"
                                : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                          }`}
                        >
                          {step.status === "completed" ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <span
                          className={`text-sm text-center font-medium ${
                            step.status === "completed" || step.status === "current"
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        >
                          {step.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Progress */}
              <div className="md:hidden space-y-4">
                {getTrackingSteps(orderData.status).map((step, index) => {
                  const Icon = step.icon;
                  const isLast = index === getTrackingSteps(orderData.status).length - 1;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            step.status === "completed"
                              ? "bg-[#505e4d] text-white"
                              : step.status === "current"
                                ? "bg-[#505e4d] text-white animate-pulse"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {step.status === "completed" ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 h-8 mt-2 ${
                            step.status === "completed" ? "bg-[#505e4d]" : "bg-gray-200"
                          }`}></div>
                        )}
                      </div>
                      <div className="pt-2">
                        <span className={`font-medium ${
                          step.status === "completed" || step.status === "current"
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}>
                          {step.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Information */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#505e4d]" />
                  </div>
                  Order Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Hash className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Order ID</p>
                      <p className="text-gray-900 font-semibold truncate">{orderData._id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Order Date</p>
                      <p className="text-gray-900 font-semibold">
                        {new Date(orderData.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[#505e4d] rounded-xl border border-[#505e4d]">
                    <CreditCard className="w-5 h-5 text-white" />
                    <div>
                      <p className="text-xs text-white font-medium uppercase tracking-wide">Total Amount</p>
                      <p className="text-white font-bold text-lg">{formatPrice(orderData.totalPrice)}</p>
                    </div>
                  </div>
                  {orderData.trackingId && (
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#505e4d]">
                      <Package className="w-5 h-5 text-[#505e4d]" />
                      <div>
                        <p className="text-xs text-[#505e4d] font-medium uppercase tracking-wide">Tracking ID</p>
                        <p className="text-[#505e4d] font-bold">{orderData.trackingId}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#505e4d]" />
                  </div>
                  Shipping Address
                </h3>
                {orderData.shippingAddress ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Recipient</p>
                        <p className="text-gray-900 font-semibold">{orderData.shippingAddress.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Address</p>
                        <p className="text-gray-900 font-medium">{orderData.shippingAddress.address}</p>
                        <p className="text-gray-600">
                          {orderData.shippingAddress.city}, {orderData.shippingAddress.postalCode}
                        </p>
                        <p className="text-gray-600">{orderData.shippingAddress.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phone</p>
                        <p className="text-gray-900 font-semibold">{orderData.shippingAddress.phone}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl">
                    <p className="text-gray-400">No shipping address available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Box className="w-5 h-5 text-[#505e4d]" />
                </div>
                Order Items
                <span className="ml-auto text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {orderData.orderItems.filter(item => !item.isProtection).length} items
                </span>
              </h2>
              
              <div className="space-y-4">
                {orderData.orderItems.filter(item => !item.isProtection).map((item, index) => {
                  console.log('Order item:', item);
                  const price = Number(item.price) || 0;
                  const qty = Number(item.quantity) || 0;
                  const total = price * qty;
                  return (
                    <div key={index} className="group flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all border border-transparent hover:border-gray-200">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                          <img
                            src={getFullImageUrl(item.image) || "/placeholder.svg?height=80&width=80"}
                            alt={item.name}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="absolute -bottom-2 -right-2 bg-[#505e4d] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                          x{item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                        <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">{total > 0 ? formatPrice(total) : "N/A"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Buyer Protection Plans */}
              {orderData.orderItems.some(item => item.isProtection) && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-[#505e4d]" />
                    </div>
                    Buyer Protection Plans
                  </h3>
                  <div className="space-y-3">
                    {orderData.orderItems.filter(item => item.isProtection).map((item, index) => {
                      const price = Number(item.price) || 0;
                      return (
                        <div key={index} className="flex items-center gap-4 p-4 bg-[#505e4d] rounded-xl border border-[#505e4d]">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-6 h-6 text-[#505e4d]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white">{item.name}</h4>
                            <p className="text-sm text-white">Protection Plan</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">{formatPrice(price)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Total */}
              <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                <div className="flex justify-between items-center p-4 bg-[#505e4d] rounded-2xl text-white">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6" />
                    <span className="text-lg font-semibold">Total Amount</span>
                  </div>
                  <span className="text-2xl font-bold">{formatPrice(orderData.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!orderData && !error && (
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500 bg-white px-6 py-3 rounded-full shadow-md border border-gray-100">
              <AlertCircle className="w-5 h-5 text-[#505e4d]" />
              <span>Need help? Contact our support team at <a href="mailto:Support@seenalif.com" className="text-[#505e4d] font-semibold hover:underline">Support@seenalif.com</a></span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackOrder



