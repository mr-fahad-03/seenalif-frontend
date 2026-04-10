"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
import axios from "axios"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import { Truck, Shield, MapPin, ChevronDown, ChevronUp, Banknote, Clock, X } from "lucide-react"
import { Dialog } from "@headlessui/react"
import { Fragment } from "react"
import { getFullImageUrl } from "../utils/imageUtils"
import TranslatedText from "../components/TranslatedText"
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import '../styles/phoneInput.css'

import config from "../config/config"
const UAE_STATES = ["Abu Dhabi", "Ajman", "Al Ain", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm al-Qaywain"]

const STORES = [
  {
    storeId: "1",
    name: "CROWN EXCEL (Experience Center)",
    address:
      "Admiral Plaza Hotel Building - 37C Street - Shop 5 - Khalid Bin Al Waleed Rd - Bur Dubai - Dubai - United Arab Emirates",
    phone: "+97143540566",
    img: "/placeholder.svg?height=200&width=300",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.7234567890123!2d55.28877!3d25.2603139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43ba6913e913%3A0x904de2fef7d413ec!2sCROWN%20EXCEL%20(Experience%20Center)!5e0!3m2!1sen!2sae!4v1640995200000!5m2!1sen!2sae",
    coordinates: { lat: 25.2603093, lng: 55.2912192 },
    visible: true,
  },
  {
    storeId: "2",
    name: "Crown Excel Head Office",
    address:
      "Al Jahra Building, 2nd floor, office 204, 18th st- Al Raffa - Khalid Bin Al Waleed Rd - Bur Dubai - Dubai - United Arab Emirates",
    phone: "+97143540566",
    img: "/placeholder.svg?height=200&width=300",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.7234567890123!2d55.28877!3d25.2603139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43ba6913e913%3A0x904de2fef7d413ec!2sCrown%20Excel%20Head%20Office!5e0!3m2!1sen!2sae!4v1640995200001!5m2!1sen!2sae",
    coordinates: { lat: 25.2603093, lng: 55.2912192 },
    visible: false,
  },
  {
    storeId: "3",
    name: "CROWN EXCEL (branch 2)",
    address:
      "Shop No. 2 - Building 716 Khalid Bin Al Waleed Rd - opposite Main Entrance of Admiral Plaza Hotel - Bur Dubai - Al Souq Al Kabeer - Dubai - United Arab Emirates",
    phone: "+97143281653",
    img: "/placeholder.svg?height=200&width=300",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.7456789012345!2d55.2889495!3d25.2601883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43326d8e4cc9%3A0x4d452917e7a19b6!2sCROWN%20EXCEL%20(branch%202)!5e0!3m2!1sen!2sae!4v1640995200002!5m2!1sen!2sae",
    coordinates: { lat: 25.2601835, lng: 55.2915244 },
    visible: true,
  },
  {
    storeId: "4",
    name: "Seen Alif",
    address:
      "Al Jahra Building, 2nd floor, 18th st - Khalid Bin Al Waleed Rd - Al Raffa - Dubai - United Arab Emirates",
    phone: "+97143395794",
    img: "/placeholder.svg?height=200&width=300",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.8901234567890!2d55.2880084!3d25.2589614!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43591325fc3b%3A0x62b01661f2a6cdb7!2sGrabAtoZ!5e0!3m2!1sen!2sae!4v1640995200003!5m2!1sen!2sae",
    coordinates: { lat: 25.2589566, lng: 55.2905833 },
    visible: false,
  },
]

const PAYMENT_METHODS = [
  // {
  //   id: "tamara",
  //   name: "",
  //   description: "",
  //   iconUrls: [
  //     { src: "https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757764221/tamara_card_lh6vev.webp", size: "big" },
  //   ],
  //   color: "",
  // },


  
  // {
  //   id: "tabby",
  //   name: "",
  //   description: "",
  //   iconUrls: [
  //     { src: "https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757764220/tabby_card_lpsmhh.webp", size: "big" },
  //   ],
  //   color: "",
  // },
  {
    id: "card",
    name: "",
    description: "",
    iconUrls: [
      {
        src: "https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757764222/master_visa_card_q9zo4b.webp",
        size: "big",
      },
    ],
    color: "", // Remove background color
  },
  {
    id: "cod",
    name: "",
    description: "",
    iconUrls: [{ src: "/card (1).webp", size: "big" }],
    color: "", // Remove background color
  },
]

const bounceKeyframes = `
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}`
if (typeof document !== "undefined" && !document.getElementById("bounce-keyframes")) {
  const style = document.createElement("style")
  style.id = "bounce-keyframes"
  style.innerHTML = bounceKeyframes
  document.head.appendChild(style)
}

const Checkout = () => {
  const navigate = useNavigate()
  const {
    cartItems,
    cartTotal,
    clearCart,
    calculateFinalTotal,
    deliveryOptions,
    setDeliveryOptions,
    selectedDelivery,
    setSelectedDelivery,
    coupon,
    setCoupon,
    couponDiscount,
    setCouponDiscount,
    removeFromCart,
  } = useCart()
  const { user } = useAuth()
  const { getLocalizedPath } = useLanguage()
  const location = useLocation()

  const [tax, setTax] = useState(null)

  // Fetch delivery options on mount (if not already fetched)
  useEffect(() => {
    if (!deliveryOptions || deliveryOptions.length === 0) {
      const fetchDeliveryOptions = async () => {
        try {
          const { data } = await axios.get(`${config.API_URL}/api/delivery-charges`)
          setDeliveryOptions(data)
          if (!selectedDelivery && data.length > 0) {
            setSelectedDelivery(data[0])
          }
        } catch (err) {
          // handle error
        }
      }
      fetchDeliveryOptions()
    }
    // Fetch tax
    const fetchTax = async () => {
      try {
        const { data } = await axios.get(`${config.API_URL}/api/tax`)
        if (data && data.length > 0) setTax(data[0])
      } catch (err) {
        // handle error
      }
    }
    fetchTax()
  }, [])

  useEffect(() => {
    if (!user) {
      const guestInfo = localStorage.getItem("guestInfo")
      if (!guestInfo) {
        navigate("/login")
      }
    }
  }, [user, navigate])

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deliveryType, setDeliveryType] = useState("home")
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressType, setAddressType] = useState("home")
  const [addressDetails, setAddressDetails] = useState({
    address: "",
    zip: "",
    country: "UAE",
    state: "",
    city: "",
    isDefault: false,
  })
  const [pickupDetails, setPickupDetails] = useState({
    phone: "",
    location: "",
    storeId: "",
  })
  const [selectedStore, setSelectedStore] = useState(null)
  const [step, setStep] = useState(1)
  const [showAllItems, setShowAllItems] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })
  const [customerNotes, setCustomerNotes] = useState("")
  const [couponInput, setCouponInput] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")

  // Delivery charge logic (dynamic)
  let deliveryCharge = 0
  // Only charge delivery fee if: 1) Home delivery is selected, 2) Order is below 500 AED
  if (deliveryType === "home" && selectedDelivery && cartTotal < 500) {
    deliveryCharge = selectedDelivery.charge
  }
  // Store pickup is always free (deliveryCharge remains 0)

  // Tax is included in prices, no separate calculation needed
  const taxAmount = "included"

  const finalTotal = cartTotal + deliveryCharge - couponDiscount

  const formatPrice = (price) => {
    return `AED ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  const getPaymentMethodMeta = (methodId) => {
    switch (methodId) {
      case "card":
        return {
          title: "Pay by Card",
          description: "Visa, Mastercard and secure online payments",
          badge: "Recommended",
          badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        }
      case "cod":
        return {
          title: "Cash on Delivery",
          description: "Pay in cash when your order reaches your location",
          badge: "Cash",
          badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
        }
      case "tamara":
        return {
          title: "Tamara",
          description: "Split your purchase into 3 interest-free installments",
          badge: "Installments",
          badgeClass: "bg-sky-50 text-sky-700 border border-sky-200",
        }
      case "tabby":
        return {
          title: "Tabby",
          description: "Split your purchase into 4 interest-free installments",
          badge: "Installments",
          badgeClass: "bg-violet-50 text-violet-700 border border-violet-200",
        }
      default:
        return {
          title: "Payment Method",
          description: "Choose your preferred method",
          badge: "Option",
          badgeClass: "bg-gray-50 text-gray-700 border border-gray-200",
        }
    }
  }

  // Respect bundlePrice, bundleDiscount (25%), then offerPrice, then base price
  const getItemPrice = (item) => {
    const original = Number(item.originalPrice)
    const bundlePrice = Number(item.bundlePrice)
    const hasBundlePrice = item.isBundleItem && !Number.isNaN(bundlePrice) && bundlePrice > 0

    if (hasBundlePrice) {
      return bundlePrice
    }
    if (item.bundleDiscount && !Number.isNaN(original) && original > 0) {
      return original * 0.75
    }
    const offer = Number(item.offerPrice)
    if (!Number.isNaN(offer) && offer > 0) {
      return offer
    }
    return Number(item.price) || 0
  }

  const getItemPricingDetails = (item) => {
    const basePrice = Number(item.originalPrice || item.basePrice || item.price) || 0
    const currentPrice = getItemPrice(item)

    const savings = basePrice > currentPrice ? basePrice - currentPrice : 0
    const discountPercentage = savings > 0 ? Math.round((savings / (basePrice || 1)) * 100) : 0

    return {
      basePrice,
      currentPrice,
      savings,
      discountPercentage,
      hasDiscount: savings > 0,
    }
  }

  const calculateCartTotals = () => {
    let totalBasePrice = 0
    let totalOfferPrice = 0
    let totalSavings = 0

    cartItems.forEach((item) => {
      const pricingDetails = getItemPricingDetails(item)
      totalBasePrice += pricingDetails.basePrice * item.quantity
      totalOfferPrice += pricingDetails.currentPrice * item.quantity
      totalSavings += pricingDetails.savings * item.quantity
    })

    return {
      totalBasePrice,
      totalOfferPrice,
      totalSavings,
    }
  }

  const cartTotals = calculateCartTotals()

  // Filter out protection items from cart display
  const protectionItems = cartItems.filter(item => item.isProtection)
  const regularCartItems = cartItems.filter(item => !item.isProtection)

  // Calculate protection items total
  const protectionTotal = protectionItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Coupon logic
  const handleApplyCoupon = async () => {
    setCouponLoading(true)
    setCouponError("")
    try {
      // Filter out protection items for coupon validation (only validate actual products)
      const cartApiItems = cartItems
        .filter((item) => !item.isProtection)
        .map((item) => ({ product: item._id, qty: item.quantity }))
      const { data } = await axios.post(`${config.API_URL}/api/coupons/validate`, {
        code: couponInput,
        cartItems: cartApiItems,
      })
      setCoupon(data.coupon)
      setCouponDiscount(data.discountAmount)
      setCouponError("")
    } catch (err) {
      setCoupon(null)
      setCouponDiscount(0)
      setCouponError(err.response?.data?.message || "Invalid coupon")
    } finally {
      setCouponLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target
    setCardDetails({
      ...cardDetails,
      [name]: value,
    })
  }

  const validateHomeDelivery = () => {
    if (
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      setError("Please fill in all required fields")
      return false
    }
    return true
  }

  const validatePickup = () => {
    if (!pickupDetails.phone || !pickupDetails.storeId) {
      setError("Please fill in phone number and select a store")
      return false
    }
    return true
  }

  const validatePayment = () => {
    if (!selectedPaymentMethod) {
      setError("Please select a payment method")
      return false
    }
    // Card details validation removed for N-Genius redirect flow
    return true
  }

  const processPayment = async (orderData) => {
    try {
      switch (selectedPaymentMethod) {
        case "tamara":
          return await processTamaraPayment(orderData)
        case "tabby":
          return await processTabbyPayment(orderData)
        case "card":
          return await processCardPayment(orderData)
        case "cod":
          return await processCODPayment(orderData)
        default:
          throw new Error("Invalid payment method")
      }
    } catch (error) {
      console.error("Payment processing error:", error)
      throw error
    }
  }

  const processTamaraPayment = async (orderData) => {
    const tamaraPayload = {
      total_amount: {
        amount: finalTotal,
        currency: "AED",
      },
      shipping_amount: {
        amount: deliveryCharge,
        currency: "AED",
      },
      tax_amount: {
        amount: 0, // VAT is included in prices
        currency: "AED",
      },
      order_reference_id: `ORDER_${Date.now()}`,
      order_number: `ORD_${Date.now()}`,
      description: `Order for ${cartItems.length} items from Seen Alif`,
      country_code: "AE",
      payment_type: "PAY_BY_INSTALMENTS",
      instalments: 3,
      locale: "en_US",
      platform: "Seen Alif Online Store",
      is_mobile: window.innerWidth <= 768,
      consumer: {
        first_name: formData.name.split(" ")[0] || "Customer",
        last_name: formData.name.split(" ").slice(1).join(" ") || "User",
        phone_number: formData.phone.startsWith("+971") ? formData.phone : `+971${formData.phone}`,
        email: formData.email,
      },
      billing_address: {
        city: formData.city || "Dubai",
        country_code: "AE",
        first_name: formData.name.split(" ")[0] || "Customer",
        last_name: formData.name.split(" ").slice(1).join(" ") || "User",
        line1: formData.address || "Dubai, UAE",
        line2: "",
        phone_number: formData.phone.startsWith("+971") ? formData.phone : `+971${formData.phone}`,
        region: formData.state || "Dubai",
      },
      shipping_address: {
        city: formData.city || "Dubai",
        country_code: "AE",
        first_name: formData.name.split(" ")[0] || "Customer",
        last_name: formData.name.split(" ").slice(1).join(" ") || "User",
        line1: formData.address || "Dubai, UAE",
        line2: "",
        phone_number: formData.phone.startsWith("+971") ? formData.phone : `+971${formData.phone}`,
        region: formData.state || "Dubai",
      },
      items: cartItems.map((item) => ({
        name: item.name,
        type: "Physical",
        reference_id: item._id,
        sku: item._id,
        quantity: item.quantity,
        unit_price: {
          amount: item.price,
          currency: "AED",
        },
        total_amount: {
          amount: item.price * item.quantity,
          currency: "AED",
        },
      })),
      merchant_url: {
        success: `${window.location.origin}${getLocalizedPath("/payment/success")}`,
        failure: `${window.location.origin}${getLocalizedPath("/payment/cancel")}`,
        cancel: `${window.location.origin}${getLocalizedPath("/payment/cancel")}`,
        notification: `${config.API_URL}/api/payment/tamara/webhook`,
      },
    }

    const token = localStorage.getItem("token")
    const axiosConfig = {}
    if (token) {
      axiosConfig.headers = { Authorization: `Bearer ${token}` }
    }

    const response = await axios.post(`${config.API_URL}/api/payment/tamara/checkout`, tamaraPayload, axiosConfig)
    return response.data
  }

  const processTabbyPayment = async (orderData) => {
    const tabbyPayload = {
      payment: {
        amount: finalTotal.toString(),
        currency: "AED",
        description: `Order payment for ${cartItems.length} items`,
        buyer: {
          phone: `+971${formData.phone}`,
          email: formData.email,
          name: formData.name,
        },
        shipping_address: {
          city: formData.city,
          address: formData.address,
          zip: formData.zipCode,
        },
        order: {
          tax_amount: taxAmount.toString(),
          shipping_amount: deliveryCharge.toString(),
          discount_amount: "0.00",
          updated_at: new Date().toISOString(),
          reference_id: `ORDER_${Date.now()}`,
          items: cartItems.map((item) => ({
            title: item.name,
            description: item.description || item.name,
            quantity: item.quantity,
            unit_price: item.price.toString(),
            discount_amount: "0.00",
            reference_id: item._id,
            image_url: item.image,
            product_url: `${window.location.origin}${getLocalizedPath("/product/" + (item.slug || item._id))}`,
            category: item.category || "Electronics",
          })),
        },
        order_history: [],
        meta: {
          order_id: `ORDER_${Date.now()}`,
          customer: formData.email,
        },
      },
      lang: "en",
      merchant_code: process.env.REACT_APP_TABBY_MERCHANT_CODE,
      merchant_urls: {
        success: `${window.location.origin}${getLocalizedPath("/orders")}?success=true`,
        cancel: `${window.location.origin}${getLocalizedPath("/checkout")}`,
        failure: `${window.location.origin}${getLocalizedPath("/checkout")}?error=payment_failed`,
      },
    }

    const response = await axios.post(`${config.API_URL}/api/payment/tabby/checkout`, tabbyPayload)
    return response.data
  }

  const processCardPayment = async (orderData) => {
    // Call backend to create N-Genius order using the correct API URL
    const response = await axios.post(`${config.API_URL}/api/payment/ngenius/card`, {
      amount: finalTotal,
      currencyCode: "AED",
    })

    // Redirect user to N-Genius payment page
    const paymentUrl = response.data?.paymentUrl
    if (paymentUrl) {
      window.location.href = paymentUrl
    } else {
      throw new Error("Payment URL not received from N-Genius")
    }
  }

  const processCODPayment = async (orderData) => {
    const token = localStorage.getItem("token")
    try {
      const axiosConfig = {}
      if (token) {
        axiosConfig.headers = { Authorization: `Bearer ${token}` }
      }
      const response = await axios.post(
        `${config.API_URL}/api/orders`,
        {
          ...orderData,
          paymentMethod: "cod",
          actualPaymentMethod: "cod",
          paymentStatus: "pending",
          isPaid: false,
        },
        axiosConfig,
      )
      return { success: true, order: response.data }
    } catch (error) {
      console.error("[Checkout] Order error:", error, error.response?.data)
      throw error
    }
  }

  // New function to create order first, then initiate payment
  const createOrderThenPay = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const guestInfo = localStorage.getItem("guestInfo")
      if (!token && !guestInfo) {
        setError("Please log in or continue as guest to place an order")
        setLoading(false)
        return
      }

      // Map tabby to card for payment processing
      const actualPaymentMethod = selectedPaymentMethod === "tabby" ? "card" : selectedPaymentMethod

      // Prepare order data
      const orderData = {
        orderItems: cartItems.map((item) => {
          const orderItem = {
            name: item.name,
            image: item.image,
            // Persist the same effective unit price used for checkout totals.
            price: getItemPrice(item),
            quantity: item.quantity,
          }
          
          // Add color variation data if present
          if (item.selectedColorData) {
            orderItem.selectedColorIndex = item.selectedColorIndex
            orderItem.selectedColorData = {
              color: item.selectedColorData.color,
              image: item.selectedColorData.image,
              price: item.selectedColorData.price,
              offerPrice: item.selectedColorData.offerPrice,
              sku: item.selectedColorData.sku,
            }
          }
          
          // Add DOS/Windows variation data if present
          if (item.selectedDosData) {
            orderItem.selectedDosIndex = item.selectedDosIndex
            orderItem.selectedDosData = {
              dosType: item.selectedDosData.dosType,
              image: item.selectedDosData.image,
              price: item.selectedDosData.price,
              offerPrice: item.selectedDosData.offerPrice,
              sku: item.selectedDosData.sku,
            }
          }
          
          // Handle buyer protection items separately
          if (item.isProtection) {
            orderItem.isProtection = true
            orderItem.protectionFor = item.protectionFor
            orderItem.protectionData = item.protectionData?._id
          } else {
            orderItem.product = item._id
          }
          
          return orderItem
        }),
        itemsPrice: cartTotal,
        shippingPrice: deliveryCharge,
        totalPrice: finalTotal,
        deliveryType: deliveryType,
        paymentMethod: actualPaymentMethod, // Use actual payment method (card for tabby)
        actualPaymentMethod: selectedPaymentMethod, // Store the original selected payment method (tabby, tamara, card, cod)
        paymentStatus: "pending",
        isPaid: false,
        customerNotes: customerNotes.trim() || undefined,
      }

      if (deliveryType === "home") {
        orderData.shippingAddress = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        }
        if (actualPaymentMethod === "cod") {
          orderData.billingAddress = { ...orderData.shippingAddress }
        }
      } else if (deliveryType === "pickup") {
        const store = STORES.find((s) => s.storeId === pickupDetails.storeId)
        orderData.pickupDetails = {
          phone: pickupDetails.phone,
          location: store?.name || pickupDetails.location,
          storeId: pickupDetails.storeId,
          storeAddress: store?.address,
          storePhone: store?.phone,
        }
      }

      // Create order first
      const axiosConfig = {}
      if (token) {
        axiosConfig.headers = { Authorization: `Bearer ${token}` }
      }
      const orderRes = await axios.post(`${config.API_URL}/api/orders`, orderData, axiosConfig)
      const createdOrder = orderRes.data
      const orderId = createdOrder._id

      if (selectedPaymentMethod === "cod") {
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
          event: "purchase",
          ecommerce: {
            transaction_id: orderId,
            affiliation: "Seen Alif Online Store",
            currency: "AED",
            value: finalTotal,
            tax: 0, // VAT included in prices
            shipping: deliveryCharge,
            coupon: coupon?.code || undefined,
            payment_type: "cash_on_delivery",
            items: cartItems.map((item) => ({
              item_id: item._id,
              item_name: item.name,
              item_category: item.parentCategory?.name || item.category?.name || "Uncategorized",
              item_brand: item.brand?.name || "Unknown",
              price: item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price,
              quantity: item.quantity,
            })),
          },
        })

        console.log("Purchase tracked (COD):", orderId) // For debugging
      }

      // Now initiate payment based on selected method
      if (selectedPaymentMethod === "card" || selectedPaymentMethod === "tabby") {
        // Both card and tabby use N-Genius card payment
        const response = await axios.post(`${config.API_URL}/api/payment/ngenius/card`, {
          amount: finalTotal,
          currencyCode: "AED",
          orderId: orderId,
          paymentMethod: selectedPaymentMethod,
          redirectUrl: `${window.location.origin}${getLocalizedPath("/payment/success")}`,
          cancelUrl: `${window.location.origin}${getLocalizedPath("/payment/cancel")}`,
        })
        const paymentUrl = response.data?.paymentUrl
        if (paymentUrl) {
          window.location.href = paymentUrl
        } else {
          throw new Error("Payment URL not received from N-Genius")
        }
      } else if (selectedPaymentMethod === "tamara") {
        // Tamara payment logic
        const tamaraPayload = {
          total_amount: {
            amount: finalTotal,
            currency: "AED",
          },
          shipping_amount: {
            amount: deliveryCharge,
            currency: "AED",
          },
          tax_amount: {
            amount: 0, // VAT is included in prices
            currency: "AED",
          },
          order_reference_id: orderId,
          order_number: `ORD_${orderId}`,
          description: `Order for ${cartItems.length} items from Seen Alif`,
          country_code: "AE",
          payment_type: "PAY_BY_INSTALMENTS",
          instalments: 3,
          locale: "en_US",
          platform: "Seen Alif Online Store",
          is_mobile: window.innerWidth <= 768,
          consumer: {
            first_name: formData.name.split(" ")[0] || "Customer",
            last_name: formData.name.split(" ").slice(1).join(" ") || "User",
            phone_number: formData.phone.startsWith("+971") ? formData.phone : `+971${formData.phone}`,
            email: formData.email,
          },
          billing_address: {
            city: formData.city || "Dubai",
            country_code: "AE",
            first_name: formData.name.split(" ")[0] || "Customer",
            last_name: formData.name.split(" ").slice(1).join(" ") || "User",
            line1: formData.address || "Dubai, UAE",
            line2: "",
            phone_number: formData.phone.startsWith("+971") ? formData.phone : `+971${formData.phone}`,
            region: formData.state || "Dubai",
          },
          shipping_address: {
            city: formData.city || "Dubai",
            country_code: "AE",
            first_name: formData.name.split(" ")[0] || "Customer",
            last_name: formData.name.split(" ").slice(1).join(" ") || "User",
            line1: formData.address || "Dubai, UAE",
            line2: "",
            phone_number: formData.phone.startsWith("+971") ? formData.phone : `+971${formData.phone}`,
            region: formData.state || "Dubai",
          },
          items: cartItems.map((item) => ({
            name: item.name,
            type: "Physical",
            reference_id: item._id,
            sku: item._id,
            quantity: item.quantity,
            unit_price: {
              amount: item.price,
              currency: "AED",
            },
            total_amount: {
              amount: item.price * item.quantity,
              currency: "AED",
            },
          })),
          merchant_url: {
            success: `${window.location.origin}${getLocalizedPath("/payment/success")}?orderId=${orderId}&payment_method=tamara&amount=${finalTotal}`,
            failure: `${window.location.origin}${getLocalizedPath("/payment/cancel")}?orderId=${orderId}&payment_method=tamara`,
            cancel: `${window.location.origin}${getLocalizedPath("/payment/cancel")}?orderId=${orderId}&payment_method=tamara`,
            notification: `${config.API_URL}/api/payment/tamara/webhook`,
          },
        }

        const axiosConfig = {}
        if (token) {
          axiosConfig.headers = { Authorization: `Bearer ${token}` }
        }

        const response = await axios.post(`${config.API_URL}/api/payment/tamara/checkout`, tamaraPayload, axiosConfig)
        const paymentUrl = response.data?.checkout_url || response.data?.payment_url
        if (paymentUrl) {
          window.location.href = paymentUrl
        } else {
          throw new Error("Payment URL not received from Tamara")
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to process order/payment. Please try again.")
      setLoading(false)
    }
  }

  const handlePaymentMethodSelect = (paymentMethod) => {
    // Keep the visual selection as-is, but map tabby to card internally for processing
    setSelectedPaymentMethod(paymentMethod)

    // For tracking purposes, use actual payment method (map tabby to card)
    const actualPaymentMethod = paymentMethod === "tabby" ? "card" : paymentMethod

    // Track add payment info event
    if (cartItems.length > 0) {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: "add_payment_info",
        ecommerce: {
          currency: "AED",
          value: finalTotal,
          payment_type: actualPaymentMethod, // Use the actual payment method for tracking
          items: cartItems.map((item) => ({
            item_id: item._id,
            item_name: item.name,
            item_category: item.parentCategory?.name || item.category?.name || "Uncategorized",
            item_brand: item.brand?.name || "Unknown",
            price: item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price,
            quantity: item.quantity,
          })),
        },
      })

      console.log("Add payment info tracked:", actualPaymentMethod) // For debugging
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      setError("Your cart is empty")
      return
    }

    // Validate based on delivery type
    if (deliveryType === "home" && !validateHomeDelivery()) {
      return
    }

    if (deliveryType === "pickup" && !validatePickup()) {
      return
    }

    // Validate payment method
    if (!validatePayment()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const guestInfo = localStorage.getItem("guestInfo")
      if (!token && !guestInfo) {
        // Neither logged in nor guest
        setError("Please log in or continue as guest to place an order")
        return
      }

      const orderData = {
        orderItems: cartItems.map((item) => {
          const orderItem = {
            name: item.name,
            image: item.image,
            // Persist the same effective unit price used for checkout totals.
            price: getItemPrice(item),
            quantity: item.quantity,
          }
          
          // Add color variation data if present
          if (item.selectedColorData) {
            orderItem.selectedColorIndex = item.selectedColorIndex
            orderItem.selectedColorData = {
              color: item.selectedColorData.color,
              image: item.selectedColorData.image,
              price: item.selectedColorData.price,
              offerPrice: item.selectedColorData.offerPrice,
              sku: item.selectedColorData.sku,
            }
          }
          
          // Add DOS/Windows variation data if present
          if (item.selectedDosData) {
            orderItem.selectedDosIndex = item.selectedDosIndex
            orderItem.selectedDosData = {
              dosType: item.selectedDosData.dosType,
              image: item.selectedDosData.image,
              price: item.selectedDosData.price,
              offerPrice: item.selectedDosData.offerPrice,
              sku: item.selectedDosData.sku,
            }
          }
          
          // Handle buyer protection items separately
          if (item.isProtection) {
            orderItem.isProtection = true
            orderItem.protectionFor = item.protectionFor
            orderItem.protectionData = item.protectionData?._id
          } else {
            orderItem.product = item._id
          }
          
          return orderItem
        }),
        itemsPrice: cartTotal,
        shippingPrice: deliveryCharge, // Include delivery charge
        totalPrice: finalTotal, // Include delivery charge
        deliveryType: deliveryType,
        paymentMethod: selectedPaymentMethod,
        customerNotes: customerNotes.trim() || undefined, // Only include if not empty
      }

      if (deliveryType === "home") {
        orderData.shippingAddress = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        }
        // For COD, billing address is same as shipping
        if (selectedPaymentMethod === "cod") {
          orderData.billingAddress = { ...orderData.shippingAddress }
        }
      } else if (deliveryType === "pickup") {
        const store = STORES.find((s) => s.storeId === pickupDetails.storeId)
        orderData.pickupDetails = {
          phone: pickupDetails.phone,
          location: store?.name || pickupDetails.location,
          storeId: pickupDetails.storeId,
          storeAddress: store?.address,
          storePhone: store?.phone,
        }
      }

      // Process payment
      let paymentResult
      if (!token && guestInfo) {
        // Guest order: do not send Authorization header
        paymentResult = await processPayment(orderData)
      } else {
        // Logged-in user: send Authorization header
        paymentResult = await processPayment(orderData)
      }

      if (selectedPaymentMethod === "cod") {
        // For COD, order is created directly
        clearCart()
        if (!token && guestInfo) {
          // Guest: redirect to GuestOrder page
          if (paymentResult && paymentResult.order && paymentResult.order._id) {
            navigate(
              getLocalizedPath(`/guest-order?success=true&orderId=${paymentResult.order._id}&email=${encodeURIComponent(formData.email)}`),
            )
          } else {
            navigate(getLocalizedPath(`/guest-order?success=true&email=${encodeURIComponent(formData.email)}`))
          }
        } else {
          // Logged-in user
          if (paymentResult && paymentResult.order && paymentResult.order._id) {
            navigate(getLocalizedPath(`/orders?success=true&orderId=${paymentResult.order._id}`))
          } else {
            navigate(getLocalizedPath(`/orders?success=true`))
          }
        }
      } else {
        // For other payment methods, redirect to payment gateway
        if (
          paymentResult &&
          (paymentResult.checkout_url ||
            paymentResult.payment_url ||
            paymentResult._links?.payment?.href ||
            paymentResult.paymentUrl)
        ) {
          const paymentUrl =
            paymentResult.checkout_url ||
            paymentResult.payment_url ||
            paymentResult._links?.payment?.href ||
            paymentResult.paymentUrl
          window.location.href = paymentUrl
        } else {
          throw new Error("Payment URL not received")
        }
      }
    } catch (error) {
      console.error("Error processing order:", error)
      setError(error.response?.data?.message || error.message || "Failed to process order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Update handleAddressModalSubmit to only save to localStorage for guests, and always update formData
  const handleAddressModalSubmit = (e) => {
    e.preventDefault()
    const newAddress = {
      address: addressDetails.address,
      city: addressDetails.city,
      state: addressDetails.state,
      zipCode: addressDetails.zip,
    }
    setFormData({
      ...formData,
      ...newAddress,
    })
    // Only save to localStorage if not logged in
    if (!user) {
      localStorage.setItem(
        "savedShippingAddress",
        JSON.stringify({
          ...formData,
          ...newAddress,
        }),
      )
    }
    setShowAddressModal(false)
    // Do NOT advance step here; let main form handle it
  }

  // In handleContinueToSummary, always save address/phone to backend for logged-in users when deliveryType is 'home'
  const handleContinueToSummary = async (e) => {
    e.preventDefault()
    if (deliveryType === "home") {
      if (!formData.email || !formData.phone) {
        setError("Please fill in email and phone number")
        return
      }
      if (!formData.address) {
        setShowAddressModal(true)
        return
      }
      // Save to backend if logged in
      if (user) {
        try {
          const token = localStorage.getItem("token")
          const payload = {
            phone: formData.phone,
            address: {
              street: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: "UAE",
            },
          }
          await axios.put(`${config.API_URL}/api/users/profile`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        } catch (err) {
          // Optionally show error
        }
      }
    } else if (deliveryType === "pickup") {
      if (!pickupDetails.phone || !pickupDetails.storeId) {
        setError("Please fill in phone number and select a store")
        return
      }
      // Optionally, save phone to backend if logged in
      if (user && pickupDetails.phone) {
        try {
          const token = localStorage.getItem("token")
          const payload = { phone: pickupDetails.phone }
          await axios.put(`${config.API_URL}/api/users/profile`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        } catch (err) {
          // Optionally show error
        }
      }
    }
    setError(null)
    setStep(2)
  }

  const handleContinueToPayment = () => {
    setStep(3)
  }

  const handleStoreSelection = (store) => {
    setPickupDetails({
      ...pickupDetails,
      storeId: store.storeId,
      location: store.name,
    })
    setSelectedStore(store)
  }

  const toggleShowAllItems = () => {
    setShowAllItems(!showAllItems)
  }

  useEffect(() => {
    // Load address from localStorage if available
    const savedAddress = localStorage.getItem("savedShippingAddress")
    if (savedAddress) {
      const parsed = JSON.parse(savedAddress)
      setFormData((prev) => ({ ...prev, ...parsed }))
    }
  }, [])

  useEffect(() => {
    if (!user) {
      const guestInfo = localStorage.getItem("guestInfo")
      if (guestInfo) {
        try {
          const parsed = JSON.parse(guestInfo)
          setFormData((prev) => ({
            ...prev,
            email: parsed.email || prev.email,
            phone: parsed.phone || prev.phone,
          }))
          setPickupDetails((prev) => ({
            ...prev,
            phone: prev.phone || parsed.phone || "",
          }))
        } catch { }
      }
    }
  }, [user])

  // On mount, check for step query param
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const stepParam = Number.parseInt(params.get("step"), 10)
    if ([1, 2, 3].includes(stepParam)) {
      setStep(stepParam)
    }
  }, [location.search])

  // Fetch user profile and pre-fill address/phone if logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const token = localStorage.getItem("token")
          const { data } = await axios.get(`${config.API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          // Fill formData and pickupDetails.phone
          setFormData((prev) => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone || "",
            address: data.address?.street || prev.address || "",
            city: data.address?.city || prev.city || "",
            state: data.address?.state || prev.state || "",
            zipCode: data.address?.zipCode || prev.zipCode || "",
          }))
          setPickupDetails((prev) => ({
            ...prev,
            phone: data.phone || prev.phone || "",
          }))
        } catch (err) {
          // ignore error
        }
      }
    }
    fetchUserProfile()
  }, [user])

  // Sync phone number between forms when switching delivery type
  useEffect(() => {
    if (deliveryType === "pickup" && !pickupDetails.phone && formData.phone) {
      setPickupDetails((prev) => ({ ...prev, phone: formData.phone }))
    } else if (deliveryType === "home" && !formData.phone && pickupDetails.phone) {
      setFormData((prev) => ({ ...prev, phone: pickupDetails.phone }))
    }
  }, [deliveryType])

  const bounceStyle = {
    animation: "bounce 1s infinite",
  }

  // Track begin_checkout event
  useEffect(() => {
    if (cartItems.length > 0) {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
          currency: "AED",
          value: finalTotal,
          coupon: coupon?.code || undefined,
          items: cartItems.map((item) => ({
            item_id: item._id,
            item_name: item.name,
            item_category: item.parentCategory?.name || item.category?.name || "Uncategorized",
            item_brand: item.brand?.name || "Unknown",
            price: item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price,
            quantity: item.quantity,
          })),
        },
      })

      console.log("Begin checkout tracked, total:", finalTotal) // For debugging
    }
  }, []) // Run only once when component mounts

  if (cartItems.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4"><TranslatedText>Your cart is empty</TranslatedText></h2>
        <p className="text-gray-600 mb-6"><TranslatedText>Add some items to your cart before checkout.</TranslatedText></p>
        <button onClick={() => navigate(getLocalizedPath("/"))} className="bg-[#505e4d] hover:bg-[#465342] text-white rounded-lg px-8 py-3">
          <TranslatedText>Continue Shopping</TranslatedText>
        </button>
      </div>
    )
  }

  // Determine which items to show (exclude protections)
  const itemsToShow = showAllItems ? regularCartItems : regularCartItems.slice(0, 2)
  const remainingItemsCount = regularCartItems.length - 2

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 px-1 sm:px-6">
        <nav className="text-sm text-gray-500 mb-4">
          <TranslatedText>Home</TranslatedText> <span className="mx-2">›</span> <span className="font-semibold text-[#505e4d]"><TranslatedText>Checkout</TranslatedText></span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="lg:col-span-3 p-2 ">
            {/* Always horizontal stepper, even on mobile */}
            <div className="flex flex-row items-center gap-2 sm:gap-4 md:gap-8 w-full overflow-x-auto mb-8">
              <div className="flex items-center gap-1 sm:gap-2">
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${step >= 1 ? "bg-[#505e4d]" : "bg-gray-300"}`}
                >
                  01
                </span>
                <span className="font-semibold text-xs sm:text-sm md:text-base"><TranslatedText>Shipping Details</TranslatedText></span>
              </div>
              <div className="h-0.5 w-4 sm:w-8 bg-gray-300" />
              <div className="flex items-center gap-1 sm:gap-2">
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${step >= 2 ? "bg-[#505e4d]" : "bg-gray-300"}`}
                >
                  02
                </span>
                <span
                  className={
                    step >= 2
                      ? "font-semibold text-xs sm:text-sm md:text-base"
                      : "text-gray-400 text-xs sm:text-sm md:text-base"
                  }
                >
                  <TranslatedText>Summary</TranslatedText>
                </span>
              </div>
              <div className="h-0.5 w-4 sm:w-8 bg-gray-300" />
              <div className="flex items-center gap-1 sm:gap-2">
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${step >= 3 ? "bg-[#505e4d]" : "bg-gray-300"}`}
                >
                  03
                </span>
                <span
                  className={
                    step >= 3
                      ? "font-semibold text-xs sm:text-sm md:text-base"
                      : "text-gray-400 text-xs sm:text-sm md:text-base"
                  }
                >
                  <TranslatedText>Payment Method</TranslatedText>
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}

            {/* Delivery type selection: Only show on step 1 */}
            {step === 1 && (
              <div className="flex gap-8 mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="home"
                    checked={deliveryType === "home"}
                    onChange={() => setDeliveryType("home")}
                    className="accent-[#505e4d] mr-2"
                  />
                  <span className="font-semibold text-lg"><TranslatedText>Home Delivery</TranslatedText></span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="pickup"
                    checked={deliveryType === "pickup"}
                    onChange={() => setDeliveryType("pickup")}
                    className="accent-[#505e4d] mr-2"
                  />
                  <span className="font-semibold text-lg"><TranslatedText>Pickup From Store</TranslatedText></span>
                </label>
              </div>
            )}
            <div className="rounded-2xl">
              {step === 1 && (
                <>
                  {deliveryType === "home" && (
                    <form onSubmit={handleContinueToSummary}>
                      <h3 className="font-bold text-lg mb-4"><TranslatedText>Contact Details</TranslatedText></h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium mb-1"><TranslatedText>E-mail</TranslatedText> *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-4 py-3"
                            required
                          />
                        </div>
                        <div>
                          <label className="block -mt-2 text-sm font-medium mb-2 "><TranslatedText>Phone number</TranslatedText> *</label>
                          <PhoneInput
                            international
                            defaultCountry="AE"
                            value={formData.phone}
                            onChange={(value) => setFormData({ ...formData, phone: value || '' })}
                            className="w-full -mt-2 rounded-lg px-4 py-3"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>

                      {formData.address && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-1"><TranslatedText>Shipping Address</TranslatedText></h4>
                          <div className="text-gray-700">{formData.address}</div>
                          <div className="text-gray-700">
                            {formData.city}, {formData.state} {formData.zipCode}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAddressModal(true)}
                            className="text-[#505e4d] text-sm mt-2 mr-4"
                          >
                            <TranslatedText>Edit Address</TranslatedText>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                address: "",
                                city: "",
                                state: "",
                                zipCode: "",
                              }))
                              localStorage.removeItem("savedShippingAddress")
                            }}
                            className="text-red-500 text-sm mt-2"
                          >
                            <TranslatedText>Remove Address</TranslatedText>
                          </button>
                        </div>
                      )}

                      <div className="mt-8 flex gap-4 ">
                        <button
                          type="button"
                          onClick={() => navigate("/cart")}
                          className="flex-1 border border-[#cfd7cb] bg-white text-[#505e4d] hover:bg-[#f1f4f0] font-semibold lg:py-3 lg:px-6 py-2 px-3 rounded-lg transition duration-300"
                        >
                          <TranslatedText>Back to Cart</TranslatedText>
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-[#505e4d] hover:bg-[#465342] text-white font-semibold lg:py-3 lg:px-6 py-2 px-3 rounded-lg transition duration-300"
                        >
                          <span className="block lg:hidden"><TranslatedText>Continue Summary</TranslatedText></span> {/* Mobile */}
                          <span className="hidden lg:block"><TranslatedText>Continue to Summary</TranslatedText></span> {/* Desktop */}
                        </button>
                      </div>
                    </form>
                  )}

                  {deliveryType === "pickup" && (
                    <form onSubmit={handleContinueToSummary}>
                      <h3 className="font-bold text-lg mb-4"><TranslatedText>Where do you want to pick up?</TranslatedText></h3>

                      <div className="mb-6">
                        <label className="block text-sm font-medium mb-1"><TranslatedText>Phone number</TranslatedText> *</label>
                        <div className="max-w-md">
                          <PhoneInput
                            international
                            defaultCountry="AE"
                            value={pickupDetails.phone}
                            onChange={(value) => setPickupDetails({ ...pickupDetails, phone: value || '' })}
                            className="w-full border rounded-lg px-4 py-3"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-[#505e4d]" />
                          <TranslatedText>Select Store</TranslatedText> *
                        </h4>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Store Selection */}
                          <div className="space-y-4">
                            {STORES.filter(store => store.visible !== false).map((store) => (
                              <div
                                key={store.storeId}
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${pickupDetails.storeId === store.storeId
                                    ? "border-[#505e4d] bg-[#f1f4f0]"
                                    : "border-gray-200 hover:border-gray-300"
                                  }`}
                              >
                                <label className="flex items-start gap-3 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="store"
                                    checked={pickupDetails.storeId === store.storeId}
                                    onChange={() => handleStoreSelection(store)}
                                    className="mt-1 accent-[#505e4d]"
                                  />
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{store.name}</div>
                                    <div className="text-sm text-gray-600 mt-1 leading-relaxed">{store.address}</div>
                                    <div className="text-sm text-[#505e4d] mt-2 font-medium">{store.phone}</div>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>

                          {/* Map Display */}
                          <div className="lg:sticky lg:top-4">
                            {selectedStore ? (
                              <div className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 p-3 border-b">
                                  <h5 className="font-semibold text-gray-900">{selectedStore.name}</h5>
                                  <p className="text-sm text-gray-600 mt-1">{selectedStore.phone}</p>
                                </div>
                                <div className="h-64">
                                  <iframe
                                    className="w-full h-full border-0"
                                    src={selectedStore.mapEmbedUrl}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`Map of ${selectedStore.name}`}
                                  ></iframe>
                                </div>
                              </div>
                            ) : (
                              <div className="border rounded-lg h-80 flex items-center justify-center bg-gray-50">
                                <div className="text-center text-gray-500">
                                  <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                  <p className="font-medium"><TranslatedText>Select a store to view location</TranslatedText></p>
                                  <p className="text-sm"><TranslatedText>Choose from the stores on the left</TranslatedText></p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="bg-[#505e4d] hover:bg-[#465342] text-white rounded-lg px-8 py-3 disabled:opacity-50"
                        disabled={!pickupDetails.phone || !pickupDetails.storeId}
                      >
                        <TranslatedText>Continue</TranslatedText>
                      </button>
                    </form>
                  )}
                </>
              )}

              {step === 2 && (
                <div>
                  <h3 className="font-bold text-lg mb-4"><TranslatedText>Order Summary</TranslatedText></h3>
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2"><TranslatedText>Delivery Details</TranslatedText></h4>
                    {deliveryType === "home" ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-medium"><TranslatedText>Home Delivery</TranslatedText></div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formData.name && <div>{formData.name}</div>}
                          <div>{formData.email}</div>
                          <div>+971{formData.phone}</div>
                          <div>{formData.address}</div>
                          <div>
                            {formData.city}, {formData.state} {formData.zipCode}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-medium"><TranslatedText>Store Pickup</TranslatedText></div>
                        <div className="text-sm text-gray-600 mt-1">
                          <div><TranslatedText>Phone:</TranslatedText> +971{pickupDetails.phone}</div>
                          {selectedStore && (
                            <>
                              <div className="font-medium mt-2">{selectedStore.name}</div>
                              <div>{selectedStore.address}</div>
                              <div>{selectedStore.phone}</div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-2"><TranslatedText>Order Notes (Optional)</TranslatedText></h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium mb-2"><TranslatedText>Add a note to your order:</TranslatedText></label>
                      <textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#505e4d] focus:border-transparent"
                        rows="3"
                        placeholder="Special delivery instructions, gift message, or any other notes..."
                        maxLength="500"
                      />
                      <div className="text-xs text-gray-500 mt-1">{customerNotes.length}/500 characters</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="border border-gray-300 text-gray-700 rounded-lg px-8 py-3"
                    >
                      <TranslatedText>Back</TranslatedText>
                    </button>
                    <button
                      onClick={handleContinueToPayment}
                      className="bg-[#505e4d] hover:bg-[#465342] text-white rounded-lg px-8 py-3"
                    >
                      <TranslatedText>Continue to Payment</TranslatedText>
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className="font-bold text-lg mb-6"><TranslatedText>Payment Method</TranslatedText></h3>

                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {PAYMENT_METHODS.map((method) => {
                      const meta = getPaymentMethodMeta(method.id)
                      return (
                      <label
                        key={method.id}
                        className={`group relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-2xl border-2 p-2.5 sm:p-3 transition-all ${
                          selectedPaymentMethod === method.id
                            ? "border-[#505e4d] bg-[#f5f8f4]"
                            : "border-gray-200 bg-white hover:border-[#b6c1b2]"
                        }`}
                        onClick={() => handlePaymentMethodSelect(method.id)}
                      >
                        {selectedPaymentMethod === method.id && (
                          <div className="absolute inset-x-0 top-0 h-1 bg-[#505e4d]" />
                        )}

                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={() => setSelectedPaymentMethod(method.id)}
                          className="mt-1.5 h-4 w-4 shrink-0 accent-[#505e4d]"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <div className="min-w-0 pr-1">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                  <TranslatedText>{meta.title}</TranslatedText>
                                </p>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}>
                                  <TranslatedText>{meta.badge}</TranslatedText>
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-gray-600">
                                <TranslatedText>{meta.description}</TranslatedText>
                              </p>
                            </div>

                            <div className="flex w-full shrink-0 justify-start sm:w-[240px] sm:justify-end">
                              {method.iconUrls.map((icon, idx) => (
                                <img
                                  key={idx}
                                  src={icon.src || "/placeholder.svg"}
                                  alt={meta.title}
                                  className="h-[86px] w-auto object-contain sm:h-[96px]"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </label>
                      )
                    })}
                  </div>

                  <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-[#d9e0d6] bg-[#f7faf6] px-3 py-2">
                    <Shield className="h-4 w-4 text-[#505e4d]" />
                    <p className="text-xs font-medium text-[#455341]">
                      <TranslatedText>Secure checkout, encrypted payment processing, trusted gateways</TranslatedText>
                    </p>
                  </div>

                  {selectedPaymentMethod === "cod" && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Banknote className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-800"><TranslatedText>Cash on Delivery</TranslatedText></span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        <TranslatedText>An  10.00 AED additional cash handling fee will be charged on every (COD) Cash on Delivery  order.</TranslatedText>{" "} <br />
                        <TranslatedText>COD Fee (Non-Refundable):</TranslatedText> {formatPrice(10)}
                      </p>
                    </div>
                  )}

                  {selectedPaymentMethod === "tamara" && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-800"><TranslatedText>Buy Now, Pay Later</TranslatedText></span>
                      </div>
                      <p className="text-sm text-blue-700">
                        <TranslatedText>Split your purchase into 3 interest-free installments with Tamara.</TranslatedText>
                      </p>
                    </div>
                  )}

                  {selectedPaymentMethod === "tabby" && (
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold text-purple-800"><TranslatedText>Split into 4 Payments</TranslatedText></span>
                      </div>
                      <p className="text-sm text-purple-700">
                        <TranslatedText>Split your purchase into 4 interest-free installments with Tabby.</TranslatedText>
                      </p>
                    </div>
                  )}

                  {selectedPaymentMethod === "card" && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-800"><TranslatedText>Card Payment</TranslatedText></span>
                      </div>
                      <p className="text-sm text-blue-700"><TranslatedText>Pay securely with your credit or debit card.</TranslatedText></p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="border border-gray-300 text-gray-700 rounded-lg px-8 py-3"
                    >
                      <TranslatedText>Back</TranslatedText>
                    </button>
                    <button
                      onClick={
                        selectedPaymentMethod === "card" ||
                          selectedPaymentMethod === "tamara" ||
                          selectedPaymentMethod === "tabby"
                          ? createOrderThenPay
                          : handleSubmit
                      }
                      disabled={loading || !selectedPaymentMethod}
                      className="bg-[#505e4d] hover:bg-[#465342] text-white rounded-lg px-6 py-3 disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <TranslatedText>Processing...</TranslatedText>
                        </>
                      ) : (
                        `Place Order - ${formatPrice(finalTotal)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2 mt-4">
            <div className="rounded-lg shadow-md shadow-[#505e4d]/30 p-4 lg:mx-9 sticky top-4">
              <div className="flex items-center mb-6">
                <div className="bg-[#e6ece3] p-2 rounded-full">
                  <Truck className="h-8 w-8 text-[#505e4d]" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-bold text-[#505e4d]"><TranslatedText>Order Summary</TranslatedText></h2>
                  <p className="text-sm text-slate-700"><TranslatedText>Review your order</TranslatedText></p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {itemsToShow.map((item) => (
                  <div key={item._id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={getFullImageUrl(item.image) || "/placeholder.svg?height=48&width=48"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-black truncate max-w-32"><TranslatedText text={item.name} /></h3>
                        {item.selectedColorData && (
                          <p className="text-xs text-purple-600 font-medium">
                            <TranslatedText>Color:</TranslatedText> {item.selectedColorData.color}
                          </p>
                        )}
                        {item.selectedDosData && (
                          <p className="text-xs text-blue-600 font-medium">
                            <TranslatedText>OS:</TranslatedText> {item.selectedDosData.dosType}
                          </p>
                        )}
                        <p className="text-xs text-black"><TranslatedText>Qty:</TranslatedText> {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-black">
                      {formatPrice(getItemPrice(item) * item.quantity)}
                    </span>
                  </div>
                ))}

                {/* Show/Hide More Items Button */}
                {cartItems.length > 2 && (
                  <button
                    onClick={toggleShowAllItems}
                    className="w-full text-center text-sm text-black  py-2 flex items-center justify-center gap-1 transition-colors"
                  >
                    {showAllItems ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <TranslatedText>Show less</TranslatedText>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />+{remainingItemsCount} <TranslatedText>more items</TranslatedText>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Detailed Price Breakdown */}
                {cartTotals.totalBasePrice > cartTotals.totalOfferPrice && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600"><TranslatedText>Sale Price Total</TranslatedText></span>
                      <span className="text-gray-500 line-through">{formatPrice(cartTotals.totalBasePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600"><TranslatedText>Our Offer Price</TranslatedText></span>
                      <span className="text-red-600 font-medium">{formatPrice(cartTotals.totalOfferPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="font-medium"><TranslatedText>You Save</TranslatedText></span>
                      <span className="font-medium">- {formatPrice(cartTotals.totalSavings)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600"><TranslatedText>Subtotal</TranslatedText></span>
                        <span className="text-black font-medium">{formatPrice(cartTotal)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Simple subtotal when no discounts */}
                {cartTotals.totalBasePrice <= cartTotals.totalOfferPrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600"><TranslatedText>Subtotal</TranslatedText></span>
                    <span className="text-black">{formatPrice(cartTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600"><TranslatedText>Shipping</TranslatedText></span>
                  <span className="text-black">{deliveryCharge === 0 ? <TranslatedText>Free</TranslatedText> : formatPrice(deliveryCharge)}</span>
                </div>

                {selectedPaymentMethod === "cod" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600"><TranslatedText>COD Fee (Non-Refundable)</TranslatedText></span>
                    <span className="text-black">{formatPrice(10)}</span>
                  </div>
                )}

                {/* Protection Plans Section */}
                {protectionItems.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3"><TranslatedText>Protection Plans</TranslatedText></h3>
                    <div className="space-y-2">
                      {protectionItems.map((item) => (
                        <div key={item._id} className="flex items-start justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Shield size={16} className="text-blue-600" />
                              <p className="text-sm font-medium text-gray-900">{item.protectionData?.name || item.name}</p>
                            </div>
                            <p className="text-xs text-gray-600 ml-6">
                              {item.protectionData?.duration} - For: {item.name.split(' for ')[1] || 'Product'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-red-600">{formatPrice(item.price)}</span>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove protection"
                              type="button"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600"><TranslatedText>VAT Included</TranslatedText></span>
                  <span className="text-gray-600"><TranslatedText>Included</TranslatedText></span>
                </div>

                {/* Coupon Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                      placeholder="Enter coupon code"
                      value={coupon ? coupon.code : couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      disabled={!!coupon}
                    />
                    {!coupon ? (
                      <button
                        className="bg-[#505e4d] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput}
                      >
                        {couponLoading ? <TranslatedText>Applying...</TranslatedText> : <TranslatedText>Apply</TranslatedText>}
                      </button>
                    ) : (
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
                        onClick={() => {
                          setCoupon(null)
                          setCouponDiscount(0)
                          setCouponInput("")
                          setCouponError("")
                        }}
                      >
                        <TranslatedText>Remove</TranslatedText>
                      </button>
                    )}
                  </div>
                  {couponError && <div className="text-red-500 text-xs">{couponError}</div>}
                  {coupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span><TranslatedText>Coupon:</TranslatedText> {coupon.code}</span>
                      <span>- {formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span className="text-black"><TranslatedText>Total Amount</TranslatedText></span>
                  <span className="text-black">{formatPrice(finalTotal)}</span>
                </div>

                {/* Free shipping message */}
                {cartTotal < 500 && cartTotal > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <TranslatedText>Purchase for</TranslatedText> {formatPrice(500 - cartTotal)} <TranslatedText>or more to enable free shipping</TranslatedText>
                    </p>
                  </div>
                )}

                {cartTotal >= 500 && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <span className="text-lg">🎉</span>
                    <p className="text-sm text-green-700 font-medium"><TranslatedText>You qualify for free shipping!</TranslatedText></p>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Shield className="h-7 w-7 text-[#505e4d]" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-gray-700">
                      <TranslatedText>Your order is secure and encrypted. We never store your payment information.</TranslatedText>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Modal for Home Delivery */}
        <Dialog as={Fragment} open={showAddressModal} onClose={() => setShowAddressModal(false)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl mx-4 relative">
              {/* Close (X) icon */}
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowAddressModal(false)}
                aria-label="Close"
              >
                <X />
              </button>
              <h3 className="font-bold text-2xl mb-6"><TranslatedText>Address Details</TranslatedText></h3>
              <form onSubmit={handleAddressModalSubmit}>
                <div className="flex gap-6 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="addressType"
                      value="home"
                      checked={addressType === "home"}
                      onChange={() => setAddressType("home")}
                      className="accent-[#505e4d]"
                    />
                    <TranslatedText>Home</TranslatedText>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="addressType"
                      value="office"
                      checked={addressType === "office"}
                      onChange={() => setAddressType("office")}
                      className="accent-[#505e4d]"
                    />
                    <TranslatedText>Office</TranslatedText>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1"><TranslatedText>Address</TranslatedText> *</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-3"
                    value={addressDetails.address}
                    onChange={(e) => setAddressDetails({ ...addressDetails, address: e.target.value })}
                    placeholder="Enter address"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1"><TranslatedText>Zip Code</TranslatedText> *</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-3"
                    value={addressDetails.zip}
                    onChange={(e) => setAddressDetails({ ...addressDetails, zip: e.target.value })}
                    placeholder="Enter zip code"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1"><TranslatedText>Country</TranslatedText></label>
                  <select
                    className="w-full border rounded-lg px-4 py-3"
                    value={addressDetails.country}
                    onChange={(e) => setAddressDetails({ ...addressDetails, country: e.target.value })}
                  >
                    <option value="UAE">UAE</option>
                  </select>
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="w-1/2">
                    <label className="block text-gray-700 font-medium mb-1"><TranslatedText>State/Region</TranslatedText> *</label>
                    <select
                      className="w-full border rounded-lg px-4 py-3"
                      value={addressDetails.state}
                      onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
                      required
                    >
                      <option value="">Select State</option>
                      {UAE_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-gray-700 font-medium mb-1"><TranslatedText>City</TranslatedText> *</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-4 py-3"
                      value={addressDetails.city}
                      onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                      placeholder="City"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <input
                    type="checkbox"
                    checked={addressDetails.isDefault}
                    onChange={(e) => setAddressDetails({ ...addressDetails, isDefault: e.target.checked })}
                    className="accent-[#505e4d]"
                  />
                  <span><TranslatedText>Default Address</TranslatedText></span>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="border border-gray-300 text-gray-700 rounded-lg px-8 py-3"
                  >
                    <TranslatedText>Cancel</TranslatedText>
                  </button>
                  <button type="submit" className="bg-[#505e4d] hover:bg-[#465342] text-white rounded-lg px-8 py-3">
                    <TranslatedText>Save Address</TranslatedText>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  )
}

export default Checkout


