"use client"

import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { Trash2, Minus, Plus, ShoppingBag, Package, X, Percent, Gift, Shield } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { getFullImageUrl } from "../utils/imageUtils"
import TranslatedText from "../components/TranslatedText"

import config from "../config/config"

const Cart = () => {
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    removeBundleFromCart,
    updateQuantity,
    getGroupedCartItems,
    deliveryOptions,
    setDeliveryOptions,
    selectedDelivery,
    setSelectedDelivery,
    tax,
    setTax,
    coupon,
    setCoupon,
    couponDiscount,
    setCouponDiscount,
  } = useCart()
  const { getLocalizedPath } = useLanguage()

  const [couponInput, setCouponInput] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")
  
  // Coupon modal states
  const [showCouponsModal, setShowCouponsModal] = useState(false)
  const [publicCoupons, setPublicCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [couponModalError, setCouponModalError] = useState(null)
  const [couponCopied, setCouponCopied] = useState(null)

  // Add debugging
  useEffect(() => {
    console.log('Cart component - cartItems updated:', cartItems)
    console.log('Cart component - cartTotal:', cartTotal)
  }, [cartItems, cartTotal])

  const { grouped, standaloneItems } = getGroupedCartItems()

  // Filter out protection items from cart display
  const protectionItems = cartItems.filter(item => item.isProtection)
  const regularCartItems = cartItems.filter(item => !item.isProtection)
  
  // Filter protection items from standalone items
  const filteredStandaloneItems = standaloneItems.filter(item => !item.isProtection)

  // Add debugging for grouped items
  useEffect(() => {
    console.log('Cart component - grouped items:', grouped)
    console.log('Cart component - standalone items:', standaloneItems)
    console.log('Cart component - bundle groups keys:', Object.keys(grouped))
    console.log('Cart component - protection items:', protectionItems)
  }, [grouped, standaloneItems, protectionItems])

  useEffect(() => {
    // Fetch delivery options
    const fetchDeliveryOptions = async () => {
      try {
        const { data } = await axios.get(`${config.API_URL}/api/delivery-charges`)
        setDeliveryOptions(data)
        if (!selectedDelivery && data.length > 0) {
          setSelectedDelivery(data[0])
        }
      } catch (err) {
        console.error('Error fetching delivery options:', err)
      }
    }
    // Fetch tax
    const fetchTax = async () => {
      try {
        const { data } = await axios.get(`${config.API_URL}/api/tax`)
        // Use first active tax
        if (data && data.length > 0) setTax(data[0])
      } catch (err) {
        console.error('Error fetching tax:', err)
      }
    }
    fetchDeliveryOptions()
    fetchTax()
  }, [])

  useEffect(() => {
    if (cartItems.length > 0) {
      // Push view cart event to data layer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'view_cart',
        'ecommerce': {
          'currency': 'AED',
          'value': cartTotal,
          'items': cartItems.map(item => ({
            'item_id': item._id,
            'item_name': item.name,
            'item_category': item.parentCategory?.name || item.category?.name || 'Uncategorized',
            'item_brand': item.brand?.name || 'Unknown',
            'price': item.price,
            'quantity': item.quantity
          }))
        }
      });
      
      console.log('View cart tracked, items:', cartItems.length);
    }
  }, [cartItems, cartTotal]);

  const handleQuantityChange = (productId, newQuantity, bundleId = null) => {
    updateQuantity(productId, newQuantity, bundleId)
  }

  // UPDATED: Function to remove single item from bundle - Now removes entire bundle
  const removeItemFromBundle = (itemId, bundleId) => {
    // Remove the entire bundle when any item is removed
    removeBundleFromCart(bundleId)
  }

  // Delivery charge (free if cartTotal > 500)
  const deliveryCharge = selectedDelivery ? (cartTotal > 500 ? 0 : selectedDelivery.charge) : 0

  // Tax is included in prices, no separate calculation needed
  const taxAmount = 0

  // Coupon logic
  const handleApplyCoupon = async () => {
    setCouponLoading(true)
    setCouponError("")
    try {
      // Filter out protection items for coupon validation (only validate actual products)
      const cartApiItems = cartItems
        .filter(item => !item.isProtection)
        .map(item => ({ product: item._id, qty: item.quantity }))
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

  // Coupon modal functions
  const COUPON_COLORS = [
    {
      main: "bg-gradient-to-r from-[#eef3ec] to-[#dde6da]",
      stub: "bg-[#cfdacb]",
      border: "border-[#a9b7a3]",
      text: "text-[#3f4d3d]",
      barcode: "bg-[#f4f7f2]",
    },
    {
      main: "bg-gradient-to-r from-[#f4f6f1] to-[#e6ecde]",
      stub: "bg-[#d8e0cf]",
      border: "border-[#b5c2ad]",
      text: "text-[#4d5c46]",
      barcode: "bg-[#f7f9f5]",
    },
    {
      main: "bg-gradient-to-r from-[#edf1ea] to-[#dde5d8]",
      stub: "bg-[#cad5c5]",
      border: "border-[#a8b7a1]",
      text: "text-[#3b4a39]",
      barcode: "bg-[#f3f7f0]",
    },
    {
      main: "bg-gradient-to-r from-[#f5f4ef] to-[#e8e6db]",
      stub: "bg-[#dcd8c6]",
      border: "border-[#c2bca3]",
      text: "text-[#58533f]",
      barcode: "bg-[#faf9f4]",
    },
  ]

  const handleOpenCouponsModal = async () => {
    console.log('Opening coupons modal...')
    setShowCouponsModal(true)
    setLoadingCoupons(true)
    setCouponModalError(null)

    try {
      console.log('Fetching coupons from:', `${config.API_URL}/api/coupons`)
      const response = await axios.get(`${config.API_URL}/api/coupons`)
      console.log('Coupons response:', response.data)
      setPublicCoupons(response.data)
    } catch (error) {
      console.error("Error fetching coupons:", error)
      setCouponModalError("Failed to load coupons")
    } finally {
      setLoadingCoupons(false)
    }
  }

  const handleCloseCouponsModal = () => {
    setShowCouponsModal(false)
    setCouponCopied(null)
  }

  const handleCopyCoupon = (couponCode, couponId) => {
    navigator.clipboard.writeText(couponCode)
    setCouponCopied(couponId)
    setTimeout(() => setCouponCopied(null), 2000)
  }

  const formatPrice = (price) => {
    return `AED ${Number(price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  // FIXED: Proper pricing calculation for bundle items
  const getItemPrice = (item) => {
    // If it's a bundle item with bundle price, use that
    if (item.isBundleItem && item.bundlePrice) {
      return item.bundlePrice
    }
    // If it has bundle discount, apply 25% discount
    if (item.bundleDiscount && item.originalPrice) {
      return item.originalPrice * 0.75 // 25% discount
    }
    // Otherwise use offer price or regular price
    return item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price
  }

  // FIXED: Calculate actual item total with proper pricing
  const getItemTotal = (item) => {
    const itemPrice = getItemPrice(item)
    return itemPrice * item.quantity
  }

  // FIXED: Helper function to get pricing details for an item
  const getItemPricingDetails = (item) => {
    const originalPrice = Number(item.originalPrice || item.basePrice || item.price) || 0
    const currentPrice = getItemPrice(item)
    
    const savings = originalPrice > currentPrice ? originalPrice - currentPrice : 0
    const discountPercentage = savings > 0 ? Math.round((savings / originalPrice) * 100) : 0
    
    return {
      basePrice: originalPrice,
      currentPrice: currentPrice,
      savings,
      discountPercentage,
      hasDiscount: savings > 0,
      isBundleDiscount: item.bundleDiscount || false
    }
  }

  // FIXED: Calculate cart totals properly (excluding protection items)
  const calculateCartTotals = useMemo(() => {
    let totalBasePrice = 0
    let totalCurrentPrice = 0
    let totalSavings = 0
    
    regularCartItems.forEach(item => {
      const pricingDetails = getItemPricingDetails(item)
      totalBasePrice += pricingDetails.basePrice * item.quantity
      totalCurrentPrice += pricingDetails.currentPrice * item.quantity
      totalSavings += pricingDetails.savings * item.quantity
    })
    
    return {
      totalBasePrice,
      totalCurrentPrice,
      totalSavings
    }
  }, [regularCartItems])

  // FIXED: Calculate bundle totals properly
  const calculateBundleTotals = (bundleItems) => {
    let bundleBaseTotal = 0
    let bundleCurrentTotal = 0
    let bundleSavings = 0
    
    bundleItems.forEach(item => {
      const pricingDetails = getItemPricingDetails(item)
      bundleBaseTotal += pricingDetails.basePrice * item.quantity
      bundleCurrentTotal += pricingDetails.currentPrice * item.quantity
      bundleSavings += pricingDetails.savings * item.quantity
    })
    
    return {
      total: bundleCurrentTotal,
      savings: bundleSavings,
      baseTotal: bundleBaseTotal
    }
  }

  const cartTotals = calculateCartTotals
  
  // Calculate protection items total
  const protectionTotal = protectionItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const totalWithDeliveryTaxCoupon = cartTotals.totalCurrentPrice + protectionTotal + deliveryCharge + taxAmount - couponDiscount

  // Render individual item component
  const renderItem = (item, isInBundle = false, bundleId = null) => {
    const pricingDetails = getItemPricingDetails(item)
    const itemTotal = getItemTotal(item)
    
    return (
      <li key={`${item._id}-${bundleId || 'standalone'}`} className="p-3">
        {/* Mobile Card */}
        <div className="block sm:hidden">
          <div className="flex flex-row items-center mb-3">
            <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md bg-white">
              <img src={getFullImageUrl(item.image) || "/placeholder.svg"} alt={item.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 ml-4">
              <h3 className="text-base font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                <TranslatedText text={item.name.length > 30 ? item.name.slice(0, 25) + "..." : item.name} />
              </h3>
              <p className="mt-1 text-sm text-gray-500">{item.brand?.name || 'N/A'}</p>
              {item.selectedColorData && (
                <p className="mt-1 text-xs text-[#505e4d] font-medium flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full mr-1" style={{backgroundColor: item.selectedColorData.color?.toLowerCase() || '#9333ea'}}></span>
                  Color: {item.selectedColorData.color}
                </p>
              )}
              {item.selectedDosData && (
                <p className="mt-1 text-xs text-[#505e4d] font-medium flex items-center">
                  OS: {item.selectedDosData.dosType}
                </p>
              )}
              {isInBundle && (
                <p className="mt-1 text-xs text-[#505e4d] font-medium">
                  {item.bundleDiscount ? "Bundle Item (25% OFF)" : "Bundle Item"}
                </p>
              )}
            </div>
          </div>
          
          {/* Pricing Details */}
          <div className="mb-3 p-3 bg-[#f5f8f4] border border-[#d6ddd3] rounded-lg">
            {pricingDetails.hasDiscount ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600"><TranslatedText>Original Price</TranslatedText>:</span>
                  <span className="line-through text-gray-500">{formatPrice(pricingDetails.basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600"><TranslatedText>Our Price</TranslatedText>:</span>
                  <span className="text-[#1f2937] font-medium">{formatPrice(pricingDetails.currentPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#3f6945]"><TranslatedText>You Save</TranslatedText>:</span>
                  <span className="text-[#3f6945] font-medium">
                    {formatPrice(pricingDetails.savings)} ({pricingDetails.discountPercentage}%)
                    {pricingDetails.isBundleDiscount && <TranslatedText> (Bundle Discount)</TranslatedText>}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600"><TranslatedText>Price</TranslatedText>:</span>
                <span className="text-[#1f2937] font-medium">{formatPrice(pricingDetails.currentPrice)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center border border-[#c5d0c1] rounded-lg bg-white w-max">
              <button
                onClick={() => handleQuantityChange(item._id, item.quantity - 1, bundleId)}
                className="px-3 py-1 text-gray-600 hover:text-[#505e4d]"
                disabled={item.quantity === 1}
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-1 border-l border-r border-[#c5d0c1]">{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item._id, item.quantity + 1, bundleId)}
                className="px-3 py-1 text-gray-600 hover:text-[#505e4d]"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(itemTotal)}
              </p>
              {pricingDetails.hasDiscount && (
                <p className="text-xs text-[#3f6945]">
                  Save {formatPrice(pricingDetails.savings * item.quantity)}
                </p>
              )}
            </div>
            <button
              onClick={() => isInBundle ? removeItemFromBundle(item._id, bundleId) : removeFromCart(item._id)}
              className="text-red-500 hover:text-red-700 flex items-center justify-center"
              title={isInBundle ? "Remove entire bundle" : "Remove from cart"}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Desktop Card */}
        <div className="hidden sm:flex flex-col sm:flex-row">
          <div className="sm:w-40 sm:h-26 flex-shrink-0 overflow-hidden rounded-md mb-4 sm:mb-0">
            <img
              src={getFullImageUrl(item.image) || "/placeholder.svg"}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="sm:ml-8 flex-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  <TranslatedText text={item.name.length > 60 ? item.name.slice(0, 60) + "..." : item.name} />
                </h3>
                <p className="text-sm text-gray-500 mb-1">{item.brand?.name || 'N/A'}</p>
                {item.selectedColorData && (
                  <p className="text-sm text-[#505e4d] font-medium mb-1 flex items-center">
                    <span className="inline-block w-4 h-4 rounded-full mr-2 border border-gray-300" style={{backgroundColor: item.selectedColorData.color?.toLowerCase() || '#9333ea'}}></span>
                    Color: {item.selectedColorData.color}
                    {item.selectedColorData.sku && <span className="ml-2 text-xs text-gray-500">({item.selectedColorData.sku})</span>}
                  </p>
                )}
                {item.selectedDosData && (
                  <p className="text-sm text-[#505e4d] font-medium mb-1 flex items-center">
                    OS: {item.selectedDosData.dosType}
                    {item.selectedDosData.sku && <span className="ml-2 text-xs text-gray-500">({item.selectedDosData.sku})</span>}
                  </p>
                )}
                {isInBundle && (
                  <p className="text-xs text-[#505e4d] font-medium mb-2">
                    {item.bundleDiscount ? "Bundle Item (25% OFF)" : "Bundle Item"}
                  </p>
                )}
                
                {/* Pricing Details */}
                <div className="bg-[#f5f8f4] border border-[#d6ddd3] p-3 rounded-lg mb-3 max-w-xl">
                  {pricingDetails.hasDiscount ? (
                    <>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600"><TranslatedText>Original Price</TranslatedText>:</span>
                        <span className="line-through text-gray-500">{formatPrice(pricingDetails.basePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600"><TranslatedText>Our Price</TranslatedText>:</span>
                        <span className="text-[#1f2937] font-medium">{formatPrice(pricingDetails.currentPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#3f6945]"><TranslatedText>You Save</TranslatedText>:</span>
                        <span className="text-[#3f6945] font-medium">
                          {formatPrice(pricingDetails.savings)} ({pricingDetails.discountPercentage}%)
                          {pricingDetails.isBundleDiscount && " (Bundle Discount)"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600"><TranslatedText>Price</TranslatedText>:</span>
                      <span className="text-[#1f2937] font-medium">{formatPrice(pricingDetails.currentPrice)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center border border-[#c5d0c1] rounded-lg bg-white">
                <button
                  onClick={() => handleQuantityChange(item._id, item.quantity - 1, bundleId)}
                  className="px-3 py-1 text-gray-600 hover:text-[#505e4d]"
                  disabled={item.quantity === 1}
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-1 border-l border-r border-[#c5d0c1]">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item._id, item.quantity + 1, bundleId)}
                  className="px-3 py-1 text-gray-600 hover:text-[#505e4d]"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-right ml-4">
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(itemTotal)}
                </p>
                {pricingDetails.hasDiscount && (
                  <p className="text-sm text-[#3f6945] font-medium">
                    <TranslatedText>Total Save</TranslatedText>: {formatPrice(pricingDetails.savings * item.quantity)}
                  </p>
                )}
              </div>
              <button
                onClick={() => isInBundle ? removeItemFromBundle(item._id, bundleId) : removeFromCart(item._id)}
                className="text-red-500 hover:text-red-700 flex items-center"
                title={isInBundle ? "Remove entire bundle" : "Remove from cart"}
              >
                <Trash2 size={18} className="mr-2" />
              </button>
            </div>
          </div>
        </div>
      </li>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900"><TranslatedText>Shopping Cart</TranslatedText></h1>
        <div className="flex space-x-3">
          <button
            onClick={handleOpenCouponsModal}
            className="px-2 py-2 lg:px-5 lg:py-2 text-sm font-medium text-black bg-[#eef1ec] hover:bg-[#dfe6dc] rounded-md transition-colors flex items-center"
          >
            <Gift size={16} className="mr-2" />
            <TranslatedText>Available Coupons</TranslatedText>
          </button>
          <Link to={getLocalizedPath("/")} className="px-2 py-2 lg:px-5 lg:py-2 text-sm font-medium text-white bg-[#505e4d] hover:bg-[#445142] rounded-md">
            <TranslatedText>Continue Shopping</TranslatedText>
          </Link>
        </div>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2"><TranslatedText>Your cart is empty</TranslatedText></h2>
          <p className="text-gray-600 mb-6"><TranslatedText>Looks like you haven't added any items to your cart yet.</TranslatedText></p>
          <Link to={getLocalizedPath("/")} className="btn-primary">
            <TranslatedText>Continue Shopping</TranslatedText>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Render Bundles First */}
            {Object.values(grouped).map((bundle) => {
              const bundleTotals = calculateBundleTotals(bundle.items)
              
              return (
                <div key={bundle.bundleId} className="bg-white rounded-xl border border-[#d6ddd3] mb-6 overflow-hidden">
                  {/* Bundle Header */}
                  <div className="bg-[#f5f8f4] px-6 py-3 border-b border-[#d6ddd3]">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Package className="text-[#505e4d] mr-2" size={20} />
                        <h3 className="text-lg font-semibold text-[#2f3b2f]"><TranslatedText>Frequently Bought Together</TranslatedText></h3>
                      </div>
                      <button
                        onClick={() => removeBundleFromCart(bundle.bundleId)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center"
                        title="Remove entire bundle"
                      >
                        <Trash2 size={16} className="mr-1" />
                        <TranslatedText>Remove Bundle</TranslatedText>
                      </button>
                    </div>
                    <div className="text-sm text-[#505e4d] mt-1">
                      <TranslatedText>Bundle Total</TranslatedText>: {formatPrice(bundleTotals.total)} | <TranslatedText>You Save</TranslatedText>: {formatPrice(bundleTotals.savings)}
                    </div>
                    <div className="text-xs text-[#3f4b3d] mt-1">
                      Note: Removing any item will remove the entire bundle
                    </div>
                  </div>

                  {/* Bundle Items */}
                  <ul className="divide-y divide-gray-200">
                    {bundle.items.map((item) => renderItem(item, true, bundle.bundleId))}
                  </ul>
                </div>
              )
            })}

            {/* Render Standalone Items (excluding protections) */}
            {filteredStandaloneItems.length > 0 && (
              <div className="bg-white rounded-xl border border-[#d6ddd3] overflow-hidden">
                {Object.keys(grouped).length > 0 && (
                  <div className="bg-[#f5f8f4] px-6 py-3 border-b border-[#d6ddd3]">
                    <h3 className="text-lg font-semibold text-gray-800">Individual Items</h3>
                  </div>
                )}
                <ul className="divide-y divide-gray-200">
                  {filteredStandaloneItems.map((item) => renderItem(item, false, null))}
                </ul>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-[#d6ddd3] shadow-sm p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-medium text-gray-900 mb-4"><TranslatedText>Order Summary</TranslatedText></h2>

              <div className="space-y-4">
                {/* Detailed Price Breakdown */}
                {cartTotals.totalSavings > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600"><TranslatedText>Original Price</TranslatedText></span>
                      <span className="text-gray-500 line-through">{formatPrice(cartTotals.totalBasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600"><TranslatedText>Discounted Price</TranslatedText></span>
                      <span className="text-[#1f2937] font-medium">{formatPrice(cartTotals.totalCurrentPrice)}</span>
                    </div>
                    <div className="flex justify-between text-[#3f6945]">
                      <span className="font-medium"><TranslatedText>Total Savings</TranslatedText></span>
                      <span className="font-medium">- {formatPrice(cartTotals.totalSavings)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600"><TranslatedText>Subtotal</TranslatedText></span>
                        <span className="text-black font-medium">{formatPrice(cartTotals.totalCurrentPrice)}</span>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Simple subtotal when no discounts */}
                {cartTotals.totalSavings <= 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600"><TranslatedText>Subtotal</TranslatedText></span>
                    <span className="text-black">{formatPrice(cartTotals.totalCurrentPrice)}</span>
                  </div>
                )}

                {/* Delivery Options */}
                {cartTotals.totalCurrentPrice <= 500 && (
                  <div className="mb-2">
                    <span className="text-gray-600 block mb-1"><TranslatedText>Delivery Options</TranslatedText></span>
                    {deliveryOptions.length > 0 ? (
                      <select
                        className="w-full border border-[#c5d0c1] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20"
                        value={selectedDelivery?._id || ""}
                        onChange={e => {
                          const found = deliveryOptions.find(opt => opt._id === e.target.value)
                          setSelectedDelivery(found)
                        }}
                      >
                        {deliveryOptions.map(opt => (
                          <option key={opt._id} value={opt._id}>
                            {opt.name} ({formatPrice(opt.charge)}) - {opt.deliveryTime}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-500"><TranslatedText>No delivery options</TranslatedText></span>
                    )}
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600"><TranslatedText>Shipping</TranslatedText></span>
                  <span className="text-gray-900">{deliveryCharge === 0 ? <TranslatedText>Free</TranslatedText> : formatPrice(deliveryCharge)}</span>
                </div>

                {/* Protection Plans Section */}
                {protectionItems.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3"><TranslatedText>Protection Plans</TranslatedText></h3>
                    <div className="space-y-2">
                      {protectionItems.map((item) => (
                        <div key={item._id} className="flex items-start justify-between bg-[#f5f8f4] p-3 rounded-lg border border-[#d6ddd3]">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Shield size={16} className="text-[#505e4d]" />
                              <p className="text-sm font-medium text-gray-900">{item.protectionData?.name || item.name}</p>
                            </div>
                            <p className="text-xs text-gray-600 ml-6">
                              {item.protectionData?.duration} - For: {item.name.split(' for ')[1] || 'Product'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#1f2937]">{formatPrice(item.price)}</span>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove protection"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VAT included note */}
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm"><TranslatedText>VAT Included</TranslatedText></span>
                  <span className="text-gray-600 text-sm">Included</span>
                </div>

                {/* Coupon */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    className="border border-[#c5d0c1] rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20"
                    placeholder="Enter coupon code"
                    value={coupon ? coupon.code : couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    disabled={!!coupon}
                  />
                  {!coupon ? (
                    <button
                      className="bg-[#505e4d] text-white px-3 py-1 rounded disabled:opacity-50"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput}
                    >
                      {couponLoading ? <TranslatedText>Applying...</TranslatedText> : <TranslatedText>Apply</TranslatedText>}
                    </button>
                  ) : (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => {
                        setCoupon(null);
                        setCouponDiscount(0);
                        setCouponInput("");
                      }}
                    >
                      <TranslatedText>Remove</TranslatedText>
                    </button>
                  )}
                </div>
                {couponError && <div className="text-red-500 text-xs mt-1">{couponError}</div>}
                {coupon && (
                  <div className="flex justify-between text-[#3f6945] text-sm">
                    <span><TranslatedText>Coupon</TranslatedText>: {coupon.code}</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="border-t pt-4 flex justify-between font-medium">
                  <span className="text-gray-900"><TranslatedText>Total Amount</TranslatedText></span>
                  <span className="text-black hover:text-[#505e4d]">{formatPrice(totalWithDeliveryTaxCoupon)}</span>
                </div>
              </div>

              {/* Free shipping message */}
              {cartTotals.totalCurrentPrice < 500 && cartTotals.totalCurrentPrice > 0 && (
                <div className="mt-4 p-3 bg-[#f5f8f4] border border-[#d6ddd3] rounded-lg">
                  <p className="text-sm text-[#3f4b3d]">
                  <TranslatedText>You are just</TranslatedText> {formatPrice(500 - cartTotals.totalCurrentPrice)} <TranslatedText>away from free shipping. Shop more to get free and express delivery.</TranslatedText>
                  </p>
                </div>
              )}

              {cartTotals.totalCurrentPrice >= 500 && (
                <div className="mt-4 p-3 bg-[#edf5ee] border border-[#cfe1d2] rounded-lg">
                  <p className="text-sm text-[#2f5d38] font-medium">
                    <TranslatedText>You qualify for free shipping!</TranslatedText>
                  </p>
                </div>
              )}

              <div className="mt-6">
                {/* Terms and Privacy Policy */}
                <div className="mb-4">
                  <label className="flex items-start space-x-2 text-sm text-gray-600">
                    <input 
                      type="checkbox" 
                      className="mt-1 rounded border-gray-300 text-[#505e4d] focus:ring-[#505e4d]" 
                      defaultChecked 
                    />
                    <span>
                      <TranslatedText>I agree to our</TranslatedText>{' '}
                      <Link to={getLocalizedPath("/terms")} className="text-[#505e4d] hover:text-[#445142] underline">
                        <TranslatedText>Terms of use</TranslatedText>
                      </Link>
                      {' '}&{' '}
                      <Link to={getLocalizedPath("/privacy")} className="text-[#505e4d] hover:text-[#445142] underline">
                        <TranslatedText>Privacy Policy</TranslatedText>
                      </Link>
                    </span>
                  </label>
                </div>

                <Link
                  to={getLocalizedPath("/checkout")}
                  className="w-full bg-[#505e4d] hover:bg-[#445142] text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors"
                >
                  <TranslatedText>Checkout</TranslatedText>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Modal */}
      {showCouponsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleCloseCouponsModal}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Available Coupons</h2>
            {loadingCoupons ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#505e4d]"></div>
              </div>
            ) : couponModalError ? (
              <div className="text-red-500 text-center">{couponModalError}</div>
            ) : publicCoupons.length === 0 ? (
              <div className="text-gray-500 text-center">No coupons available at the moment.</div>
            ) : (
              <div className="space-y-4">
                {publicCoupons.map((coupon, idx) => {
                  console.log('Rendering coupon:', coupon); // Debug log
                  const color = COUPON_COLORS[idx % COUPON_COLORS.length]
                  const categories =
                    coupon.categories && coupon.categories.length > 0
                      ? coupon.categories.map((cat) => cat.name || cat).join(", ")
                      : "All Categories"
                  return (
                    <div key={coupon._id || idx} className="relative flex items-center w-full">
                      {/* Ticket Style - Horizontal Layout */}
                      <div
                        className={`w-full flex shadow-md relative overflow-visible transition-all duration-500 ease-out opacity-100 translate-y-0 ${color.border}`}
                        style={{ minHeight: 100 }}
                      >
                        {/* Left stub - Compact */}
                        <div
                          className={`flex flex-col items-center justify-center py-2 px-2 ${color.stub} border-l-2 border-t-2 border-b-2 ${color.border} rounded-l-lg relative`}
                          style={{ minWidth: 60 }}
                        >
                          <span
                            className="text-[8px] font-bold tracking-widest text-gray-700 rotate-180"
                            style={{ writingMode: "vertical-rl" }}
                          >
                            DISCOUNT
                          </span>
                          {/* Barcode effect - Smaller */}
                          <div
                            className={`w-4 h-6 mt-1 flex flex-col justify-between ${color.barcode}`}
                            style={{ borderRadius: 2 }}
                          >
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-0.5 ${i % 2 === 0 ? "bg-gray-700" : "bg-gray-400"} w-full rounded`}
                              ></div>
                            ))}
                          </div>
                        </div>
                        {/* Main ticket - Responsive Layout */}
                        <div
                          className={`flex-1 ${color.main} border-r-2 border-t-2 border-b-2 ${color.border} rounded-r-lg p-3 flex flex-col md:flex-row md:items-center relative overflow-hidden`}
                        >
                          {/* Cut edges */}
                          <div
                            className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 ${color.border}`}
                          ></div>
                          <div
                            className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 ${color.border}`}
                          ></div>

                          {/* Mobile: Vertical Layout, Desktop: Horizontal Layout */}
                          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 flex-1">
                            {/* Discount Info */}
                            <div className="flex items-center justify-between md:flex-col md:items-center md:justify-center">
                              <span className="text-xs font-semibold text-gray-500 tracking-widest">GIFT COUPON</span>
                              <span className={`text-xl font-bold flex items-center ${color.text}`}>
                                {coupon.discountType === "percentage" && <Percent className="w-4 h-4 mr-1" />}
                                {coupon.discountType === "percentage"
                                  ? `${coupon.discountValue}%`
                                  : `AED ${coupon.discountValue}`}
                              </span>
                            </div>

                            {/* Promo Code */}
                            <div className="flex flex-col items-center flex-1">
                              <span className="block text-sm font-bold text-gray-900 mb-2">PROMO CODE</span>
                              <div className="flex items-center w-full justify-center">
                                <span
                                  className={`inline-block bg-white border ${color.border} rounded px-3 py-1 font-mono text-sm font-bold ${color.text} tracking-widest`}
                                >
                                  {coupon.code}
                                </span>
                                <button
                                  className={`ml-2 px-2 py-1 text-xs ${color.stub} hover:brightness-110 text-black rounded transition-colors font-semibold border ${color.border} focus:outline-none focus:ring-2 focus:ring-[#505e4d]`}
                                  onClick={() => handleCopyCoupon(coupon.code, coupon._id)}
                                >
                                  {couponCopied === coupon._id ? "Copied!" : "Copy"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Details - Mobile: Full width, Desktop: Right aligned */}
                          <div className="flex flex-col md:items-end text-left md:text-right space-y-1 mt-3 md:mt-0">
                            <div className="text-xs text-gray-600 md:max-w-xs">{coupon.description}</div>
                            <div className="flex flex-col md:items-end space-y-1">
                              <div className="text-xs text-gray-500">Min: AED {coupon.minOrderAmount || 0}</div>
                              <div className="text-xs text-gray-500">
                                Valid: {new Date(coupon.validFrom).toLocaleDateString()} -{" "}
                                {new Date(coupon.validUntil).toLocaleDateString()}
                              </div>
                              <div className="text-xs font-semibold text-gray-700">{categories}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
