"use client"

import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { ShoppingCart, Heart, Star, ShoppingBag } from "lucide-react"
import { useWishlist } from "../context/WishlistContext"
import { useToast } from "../context/ToastContext"
import { getOptimizedImageUrl } from "../utils/imageUtils"
import TranslatedText from "./TranslatedText"
import { useLanguage } from "../context/LanguageContext"

const ProductCard = ({ product, offerPageName, cardIndex }) => {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { showToast } = useToast()
  const { getLocalizedPath } = useLanguage()

  // Offer badge color rotation
  const offerBadgeColors = ['#fee2e2', '#dcfce7', '#ecfccb', '#ffd900', '#f37021', '#dbb27c']
  const badgeColor = offerBadgeColors[(cardIndex || 0) % offerBadgeColors.length]

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    showToast && showToast("Added to cart", "success")
  }

  const formatPrice = (price) => {
    return (
      <>
        <TranslatedText>AED</TranslatedText> {Number(price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </>
    )
  }

  // Use slug if available, otherwise fall back to ID
  const productUrl = getLocalizedPath(`/product/${product.slug || product._id}`)

  // Determine which price to show
  const hasDiscount = product.discount && Number(product.discount) > 0
  const basePrice = Number(product.price) || 0
  const offerPrice = Number(product.offerPrice) || 0

  // Show offer price if it exists and is less than base price
  const hasValidOffer = offerPrice > 0 && basePrice > 0 && offerPrice < basePrice
  const showOldPrice = hasValidOffer

  // Determine which price to display
  let priceToShow = 0
  if (hasValidOffer) {
    priceToShow = offerPrice
  } else if (basePrice > 0) {
    priceToShow = basePrice
  } else if (offerPrice > 0) {
    priceToShow = offerPrice
  }
  
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "In Stock" : "Out of Stock")

  // Fix rating and reviews display
  const rating = Number(product.rating) || 0
  const numReviews = Number(product.numReviews) || 0

  // Compute final discount label
  let computedDiscount = null
  if (!hasDiscount && hasValidOffer && basePrice > 0 && offerPrice > 0) {
    const pct = Math.round(((basePrice - offerPrice) / basePrice) * 100)
    if (pct > 0) computedDiscount = <><TranslatedText text={`${pct}%`} /> <TranslatedText>Off</TranslatedText></>
  }
  const finalDiscountLabel = hasDiscount ? <><TranslatedText text={`${Number(product.discount)}%`} /> <TranslatedText>Off</TranslatedText></> : computedDiscount
  
  // Get category name from multiple possible sources - NEVER show IDs
  let categoryName = ""
  if (product.category) {
    // Only extract name if it's an object, ignore if it's just an ID string
    if (typeof product.category === "object") {
      if (product.category.displayName) {
        categoryName = product.category.displayName
      } else if (product.category.name) {
        categoryName = product.category.name
      }
    }
  }
  // Try subcategory if no category name found
  if (!categoryName && product.subcategory) {
    if (typeof product.subcategory === "object") {
      categoryName = product.subcategory.displayName || product.subcategory.name || ""
    }
  }
  // Try parent category if no category name found
  if (!categoryName && product.parentCategory) {
    if (typeof product.parentCategory === "object") {
      categoryName = product.parentCategory.displayName || product.parentCategory.name || ""
    }
  }
  // Fallback to brand if no category found
  if (!categoryName && product.brand) {
    // Only extract name if it's an object, ignore if it's just an ID string
    if (typeof product.brand === "object" && product.brand.name) {
      categoryName = product.brand.name
    }
  }

  return (
    <div className="border p-2 h-[410px] flex flex-col justify-between bg-white">
      <div className="relative mb-2 flex justify-center items-center" style={{height:190}}>
        <Link to={productUrl} className="w-full h-full flex items-center justify-center">
          <img
            src={getOptimizedImageUrl(product.image, { width: 220, height: 220, quality: 68 }) || "/placeholder.svg"}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="165"
            height="165"
            className="w-full h-full object-contain bg-white rounded mx-auto mb-4"
            style={{maxHeight:165}}
          />
        </Link>
        <button
          className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (isInWishlist(product._id)) {
              removeFromWishlist(product._id)
              showToast && showToast("Removed from wishlist", "info")
            } else {
              addToWishlist(product)
              showToast && showToast("Added to wishlist", "success")
            }
          }}
          aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={12} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
        </button>
        {/* Offer Page Name badge at top-left */}
        {offerPageName && (
          <div 
            className="absolute top-2 left-2 text-gray-800 px-2 py-1 rounded text-[10px] font-medium shadow-sm z-10"
            style={{ backgroundColor: badgeColor }}
          >
            {offerPageName}
          </div>
        )}
        {/* Status & Discount badges overlayed at bottom of image, always inside image area */}
        <div className="absolute inset-x-0 -bottom-2 px-2 flex flex-wrap items-center gap-2 z-10">
          <div className={`${stockStatus === "In Stock" ? "bg-green-600" : stockStatus === "PreOrder" ? "bg-yellow-500" : "bg-red-600"} text-white px-1 py-0.5 rounded text-[10px] font-medium shadow-sm`}>
            <TranslatedText text={stockStatus} sourceDoc={product} fieldName="stockStatus" />
          </div>
          {finalDiscountLabel && (
            <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-[10px] font-medium shadow-sm">
              <TranslatedText text={finalDiscountLabel} />
            </div>
          )}
        </div>
      </div>
      
      <Link to={productUrl}>
        <h3 className="text-xs font-sm text-gray-900 line-clamp-3 hover:text-blue-600 h-[50px]">
          <TranslatedText text={product.name} sourceDoc={product} fieldName="name" />
        </h3>
      </Link>
      {categoryName && (
        <div className="text-xs text-yellow-600">
          <TranslatedText>Category</TranslatedText>: <TranslatedText text={categoryName} sourceDoc={typeof product.category === 'object' ? product.category : product} fieldName={typeof product.category === 'object' ? 'name' : 'categoryName'} />
        </div>
      )}
      <div className="text-xs text-green-600"><TranslatedText>Inclusive VAT</TranslatedText></div>
      <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-x-2 gap-y-0">
        <div className="text-red-600 font-bold text-sm">
          {formatPrice(priceToShow)}
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-xs font-medium">
            {formatPrice(basePrice)}
          </div>
        )}
      </div>

      {/* Rating and Reviews Section */}
      <div className="flex items-center min-h-[24px]">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={`${i < Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">({numReviews})</span>
      </div>
      
      <button
        onClick={handleAddToCart}
        className="w-full bg-lime-500 hover:bg-lime-400 border border-lime-300 hover:border-transparent text-black text-xs font-medium py-2 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
        disabled={stockStatus === "Out of Stock"}
      >
        <ShoppingBag size={12} />
        <TranslatedText>Add to Cart</TranslatedText>
      </button>
    </div>
  )
}

export default ProductCard
