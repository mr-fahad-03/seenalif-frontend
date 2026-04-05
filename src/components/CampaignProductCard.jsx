// "use client"

// import { Link } from "react-router-dom"
// import { useCart } from "../context/CartContext"
// import { ShoppingBag, Heart, Star } from "lucide-react"
// import { useWishlist } from "../context/WishlistContext"

// // Helper function to determine status color
// const getStatusColor = (status) => {
//     const statusLower = status.toLowerCase()
//     if (statusLower.includes('available')) return 'bg-green-600 hover:bg-green-700'
//     if (statusLower.includes('out of stock') || statusLower.includes('outofstock')) return 'bg-red-600 hover:bg-red-700'
//     if (statusLower.includes('pre-order') || statusLower.includes('preorder')) return 'bg-blue-600 hover:bg-blue-700'
//     if (statusLower.includes('limited') || statusLower.includes('low stock')) return 'bg-yellow-500 hover:bg-yellow-600'
//     return 'bg-gray-600 hover:bg-gray-700'
// }

// const CampaignProductCard = ({ product }) => {
//     const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
//     const { addToCart } = useCart()
//     const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
//     const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
//     const basePrice = Number(product.price) || 0
//     const offerPrice = Number(product.offerPrice) || 0

//     // Show offer price if it exists and is less than base price
//     const hasValidOffer = offerPrice > 0 && basePrice > 0 && offerPrice < basePrice
//     const showOldPrice = hasValidOffer

//     // Determine which price to display
//     let priceToShow = 0
//     if (hasValidOffer) {
//         priceToShow = offerPrice
//     } else if (basePrice > 0) {
//         priceToShow = basePrice
//     } else if (offerPrice > 0) {
//         priceToShow = offerPrice
//     }
//     const rating = product.rating || 0
//     const numReviews = product.numReviews || 0
//     const categoryName = product.category?.name || ""

//     return (
//         <div
//             className="border p-2 h-auto md:h-[400px] flex flex-col justify-between bg-white w-full md:w-[210px]"
//         >
//             <div className="relative mb-2 flex md:h-[180px] justify-center items-center">
//                 <Link to={`/product/${product.slug || product._id}`}>
//                     <img
//                         src={product.image || "/placeholder.svg?height=120&width=120"}
//                         alt={product.name}
//                         className="w-full h-full cover object-contain rounded mx-auto my-auto"
//                     />
//                 </Link>
//                 <button
//                     className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
//                     onClick={(e) => {
//                         e.preventDefault()
//                         e.stopPropagation()
//                         isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)
//                     }}
//                     aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
//                 >
//                     <Heart size={12} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
//                 </button>
//             </div>
//             <div className="mb-1 flex items-center gap-2 ">
//                 <div
//                     className={`${getStatusColor(stockStatus)} text-white px-1 py-0.5 rounded text-xs  inline-block mr-1`}
//                 >
//                     {stockStatus}
//                 </div>
//                 {discount && (
//                     <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-xs  inline-block">{discount}</div>
//                 )}
//             </div>
//             <Link to={`/product/${product.slug || product._id}`}>
//                 <h3 className="text-xs font-sm text-gray-900  line-clamp-4 hover:text-blue-600 h-[65px]">{product.name}</h3>
//             </Link>
//             {product.category && <div className="text-xs text-yellow-600 ">Category: {categoryName}</div>}
//             <div className="text-xs text-green-600">Inclusive VAT</div>
//             <div className="flex items-center gap-2">
//                 <div className="text-red-600 font-bold text-sm">
//                     {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
//                 </div>
//                 {showOldPrice && (
//                     <div className="text-gray-400 line-through text-xs font-medium">
//                         {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
//                     </div>
//                 )}
//             </div>
//             <div className="flex items-center">
//                 {[...Array(5)].map((_, i) => (
//                     <Star
//                         key={i}
//                         size={14}
//                         className={`${i < Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
//                     />
//                 ))}
//                 <span className="text-xs text-gray-500 ml-1">({numReviews})</span>
//             </div>
//             <button
//                 onClick={(e) => {
//                     e.preventDefault()
//                     e.stopPropagation()
//                     // Immediate visual feedback
//                     e.target.style.transform = 'scale(0.95)'
//                     setTimeout(() => {
//                         if (e.target) e.target.style.transform = 'scale(1)'
//                     }, 100)
//                     addToCart(product)
//                 }}
//                 className="mt-2 w-full bg-white hover:bg-lime-400 border border-black hover:border-transparent text-black hover:text-white text-xs font-medium py-2 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
//                 disabled={stockStatus === "Out of Stock"}
//             >
//                 <ShoppingBag size={12} />
//                 Add to Cart
//             </button>
//         </div>
//     )
// }

// export default CampaignProductCard


// =================
"use client"

import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { ShoppingBag, Heart, Star } from "lucide-react"
import { useWishlist } from "../context/WishlistContext"
import { useLanguage } from "../context/LanguageContext"
import { getOptimizedImageUrl } from "../utils/imageUtils"
import TranslatedText from "./TranslatedText"

// Helper function to determine status color
const getStatusColor = (status) => {
  const statusLower = status.toLowerCase()
  if (statusLower.includes("available")) return "bg-green-600 hover:bg-green-700"
  if (statusLower.includes("out of stock") || statusLower.includes("outofstock")) return "bg-red-600 hover:bg-red-700"
  if (statusLower.includes("pre-order") || statusLower.includes("preorder")) return "bg-blue-600 hover:bg-blue-700"
  if (statusLower.includes("limited") || statusLower.includes("low stock")) return "bg-yellow-500 hover:bg-yellow-600"
  return "bg-gray-600 hover:bg-gray-700"
}

const CampaignProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { getLocalizedPath } = useLanguage()
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
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

  // Fix rating and reviews display
  const rating = Number(product.rating) || 0
  const numReviews = Number(product.numReviews) || 0
  const categoryName = product.category?.name || ""

  return (
    <div className="border p-2 h-auto md:h-[400px] flex flex-col justify-between bg-white w-full md:w-[210px]">
      <div className="relative mb-2 flex md:h-[180px] justify-center items-center">
  <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)}>
          <img
            src={getOptimizedImageUrl(product.image, { width: 220, height: 220, quality: 68 }) || "/placeholder.svg?height=120&width=120"}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="165"
            height="165"
            className="w-full h-full cover object-contain rounded mx-auto my-auto"
          />
        </Link>
        <button
          className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)
          }}
          aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={12} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
        </button>
      </div>
      <div className="mb-1 flex items-center gap-2 ">
        <div className={`${getStatusColor(stockStatus)} text-white px-1 py-0.5 rounded text-xs  inline-block mr-1`}>
          <TranslatedText text={stockStatus} sourceDoc={product} fieldName="stockStatus" />
        </div>
        {discount && (
          <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-xs  inline-block">{discount}</div>
        )}
      </div>
  <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)}>
        <h3 className="text-xs font-sm text-gray-900  line-clamp-4 hover:text-blue-600 h-[65px]">
          <TranslatedText text={product.name} sourceDoc={product} fieldName="name">{product.name}</TranslatedText>
        </h3>
      </Link>
      {product.category && <div className="text-xs text-yellow-600 "><TranslatedText>Category</TranslatedText>: <TranslatedText text={categoryName} sourceDoc={product.category} fieldName="name" /></div>}
      <div className="text-xs text-green-600"><TranslatedText>Inclusive VAT</TranslatedText></div>
      <div className="flex items-center gap-2">
        <div className="text-red-600 font-bold text-sm">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-xs font-medium">
            {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>

      {/* Rating and Reviews Section - Fixed */}
      <div className="flex items-center mb-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={`${i < Math.round(Number(product.rating) || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">({numReviews})</span>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // Immediate visual feedback
          e.target.style.transform = "scale(0.95)"
          setTimeout(() => {
            if (e.target) e.target.style.transform = "scale(1)"
          }, 100)
          addToCart(product)
        }}
        className="mt-2 w-full bg-white hover:bg-lime-400 border border-black hover:border-transparent text-black hover:text-white text-xs font-medium py-2 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
        disabled={stockStatus === "Out of Stock"}
      >
        <ShoppingBag size={12} />
        <TranslatedText>Add to Cart</TranslatedText>
      </button>
    </div>
  )
}

export default CampaignProductCard
