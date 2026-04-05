"use client"

import { Link } from "react-router-dom"
import { Heart, Star, ShoppingBag } from "lucide-react"
import { useWishlist } from "../context/WishlistContext"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { getImageUrl } from "../utils/imageUtils"
import TranslatedText from "./TranslatedText"

const getStockPillClass = (status) => {
  const normalized = String(status || "").trim().toLowerCase()
  const isAvailable = normalized.includes("in stock") || normalized.includes("available") || normalized.includes("pre")
  if (isAvailable) return "border border-[#cbd6c4] bg-[#edf1eb] text-[#505e4d]"
  return "border border-slate-200 bg-slate-100 text-slate-600"
}

const HomeStyleProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { getLocalizedPath } = useLanguage()

  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "In Stock" : "Out of Stock")
  const normalizedStock = String(stockStatus || "").trim().toLowerCase()
  const hasPositiveStock = Number(product.countInStock) > 0
  const isExplicitOut =
    normalizedStock.includes("out of stock") ||
    normalizedStock.includes("stock out") ||
    normalizedStock.includes("sold out") ||
    normalizedStock.includes("unavailable")
  const isExplicitAvailable =
    normalizedStock.includes("in stock") ||
    normalizedStock.includes("available") ||
    normalizedStock.includes("preorder") ||
    normalizedStock.includes("pre-order") ||
    normalizedStock.includes("pre order")
  const isAvailable = isExplicitAvailable || (!isExplicitOut && hasPositiveStock)

  const basePrice = Number(product.price) || 0
  const offerPrice = Number(product.offerPrice) || 0
  const hasValidOffer = offerPrice > 0 && basePrice > 0 && offerPrice < basePrice
  const priceToShow = hasValidOffer ? offerPrice : basePrice > 0 ? basePrice : offerPrice

  const explicitDiscount = Number(product.discount) || 0
  const computedDiscount = hasValidOffer ? Math.round(((basePrice - offerPrice) / basePrice) * 100) : 0
  const discountValue = explicitDiscount > 0 ? explicitDiscount : computedDiscount

  const rating = Number(product.rating) || 0
  const numReviews = Number(product.numReviews) || 0
  const categoryName =
    (typeof product.category === "string" ? product.category : product.category?.name) ||
    (typeof product.parentCategory === "string" ? product.parentCategory : product.parentCategory?.name) ||
    (typeof product.subcategory === "string" ? product.subcategory : product.subcategory?.name) ||
    (typeof product.subCategory === "string" ? product.subCategory : product.subCategory?.name) ||
    product.categoryName ||
    "Unknown"
  const categorySourceDoc =
    (product.category && typeof product.category === "object" && product.category) ||
    (product.parentCategory && typeof product.parentCategory === "object" && product.parentCategory) ||
    (product.subcategory && typeof product.subcategory === "object" && product.subcategory) ||
    (product.subCategory && typeof product.subCategory === "object" && product.subCategory) ||
    null

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#d7ddd4] bg-white p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8c2b3]">
      <div className="relative mb-2">
        <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)} className="block">
          <div className="flex h-[180px] items-center justify-center rounded-lg bg-[#f4f6f3] p-3">
            <img
              src={
                getImageUrl(product) ||
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E"
              }
              alt={product.name}
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E"
              }}
            />
          </div>
        </Link>

        <button
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#505e4d] hover:text-[#505e4d]"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)
          }}
          aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={14} className={isInWishlist(product._id) ? "fill-[#505e4d] text-[#505e4d]" : ""} />
        </button>
      </div>

      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStockPillClass(stockStatus)}`}>
          <TranslatedText text={stockStatus} sourceDoc={product} fieldName="stockStatus" />
        </span>
        {discountValue > 0 && (
          <span className="rounded-full bg-[#505e4d] px-2.5 py-1 text-[10px] font-semibold text-white">
            {discountValue}% Off
          </span>
        )}
      </div>

      <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)} className="mb-0.5">
        <h3
          className="min-h-[40px] text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-[#505e4d]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          <TranslatedText text={product.name} sourceDoc={product} fieldName="name" />
        </h3>
      </Link>

      <div className="mb-0.5 min-h-[16px] text-[11px] text-slate-500">
        <TranslatedText>Category</TranslatedText>:{" "}
        <span className="font-medium text-slate-700">
          {categorySourceDoc ? (
            <TranslatedText text={categoryName} sourceDoc={categorySourceDoc} fieldName="name" />
          ) : (
            <TranslatedText text={categoryName} />
          )}
        </span>
      </div>

      <div className="mb-0 text-[11px] text-[#505e4d]">
        <TranslatedText>Inclusive VAT</TranslatedText>
      </div>

      <div className="mb-0.5 flex items-end gap-2">
        <div className="text-base font-bold text-[#1f2a1d]">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })} <TranslatedText>AED</TranslatedText>
        </div>
        {hasValidOffer && (
          <div className="pb-0.5 text-xs font-medium text-slate-400 line-through">
            {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })} <TranslatedText>AED</TranslatedText>
          </div>
        )}
      </div>

      <div className="mb-2 mt-1 flex items-center">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={13} className={i < Math.round(rating) ? "fill-current text-yellow-400" : "text-gray-300"} />
          ))}
        </div>
        <span className="ml-1 text-xs text-slate-500">({numReviews})</span>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          e.currentTarget.style.transform = "scale(0.98)"
          setTimeout(() => {
            if (e.currentTarget) e.currentTarget.style.transform = "scale(1)"
          }, 100)
          addToCart(product)
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#505e4d] bg-[#505e4d] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#465342] disabled:cursor-not-allowed disabled:bg-slate-400"
        style={{ backgroundColor: "#505e4d", borderColor: "#505e4d" }}
        disabled={!isAvailable}
      >
        <ShoppingBag size={13} />
        <TranslatedText>Add to Cart</TranslatedText>
      </button>
    </article>
  )
}

export default HomeStyleProductCard
