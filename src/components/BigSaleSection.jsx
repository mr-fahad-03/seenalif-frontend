"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Heart, Star, ShoppingBag } from "lucide-react"
import { Link } from "react-router-dom"
import { useWishlist } from "../context/WishlistContext"
import { useCart } from "../context/CartContext"
import { getOptimizedImageUrl } from "../utils/imageUtils"
import TranslatedText from "./TranslatedText"
import { useLanguage } from "../context/LanguageContext"

const getStockPillClass = (status) => {
  const normalized = String(status || "").trim().toLowerCase()
  const isAvailable = normalized.includes("in stock") || normalized.includes("available") || normalized.includes("pre")
  if (isAvailable) return "border border-[#cbd6c4] bg-[#edf1eb] text-[#505e4d]"
  return "border border-slate-200 bg-slate-100 text-slate-600"
}

const ProductCard = ({ product }) => {
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
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)))
  const categoryName = product.category?.name || "Unknown"
  const categorySourceDoc = typeof product.category === "object" ? product.category : product

  return (
    <article className="group flex h-[360px] flex-col overflow-hidden rounded-xl border border-[#d7ddd4] bg-white p-3 transition-colors duration-200 hover:border-[#b8c2b3]">
      <div className="flex-1 min-h-0">
        <div className="relative mb-2">
          <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)} className="block">
            <div className="flex h-[138px] items-center justify-center rounded-lg bg-[#f4f6f3] p-2">
              <img
                src={getOptimizedImageUrl(product.image, { width: 220, height: 220, quality: 68 }) || "/placeholder.svg?height=120&width=120"}
                alt={product.name}
                loading="lazy"
                decoding="async"
                width="165"
                height="165"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>

          <button
            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#505e4d] hover:text-[#505e4d]"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)
            }}
            aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={13} className={isInWishlist(product._id) ? "fill-[#505e4d] text-[#505e4d]" : ""} />
          </button>
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStockPillClass(stockStatus)}`}>
            <TranslatedText text={stockStatus} sourceDoc={product} fieldName="stockStatus" />
          </span>
          {discountValue > 0 && (
            <div className="rounded-full bg-[#505e4d] px-2.5 py-1 text-[10px] font-semibold text-white">
              {discountValue}% Off
            </div>
          )}
        </div>

        <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)} className="mb-0.5 block">
          <h3
            className="h-[40px] text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-[#505e4d]"
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

        {product.category && (
          <div className="mb-0.5 line-clamp-1 text-[11px] text-slate-500">
            <TranslatedText>Category</TranslatedText>:{" "}
            <span className="font-medium text-slate-700">
              <TranslatedText text={categoryName} sourceDoc={categorySourceDoc} fieldName="name" />
            </span>
          </div>
        )}

        <div className="mb-0 text-[11px] text-[#505e4d]"><TranslatedText>Inclusive VAT</TranslatedText></div>

        <div className="-mt-0.5 mb-0.5 flex items-end gap-2">
          <div className="text-base font-bold text-[#1f2a1d]">
            {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })} <TranslatedText>AED</TranslatedText>
          </div>
          {hasValidOffer && (
            <div className="pb-0.5 text-xs font-medium text-slate-400 line-through">
              {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })} <TranslatedText>AED</TranslatedText>
            </div>
          )}
        </div>
      </div>

      <div className="pt-1">
        <div className="mb-2 flex min-h-[18px] items-center">
          <div className="flex items-center gap-0.5 leading-none">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                strokeWidth={1.9}
                className={`block ${i < roundedRating ? "fill-yellow-400 text-yellow-400" : "fill-white text-slate-400"}`}
              />
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
      </div>
    </article>
  )
}

const BigSaleSection = ({ products = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [cardsToDisplay, setCardsToDisplay] = useState(6)
  const containerRef = useRef(null)
  const lastComputedRef = useRef("")
  const [itemWidth, setItemWidth] = useState(0)

  // Compute item pixel width from container - responsive to zoom levels
  useEffect(() => {
    const computeWidth = () => {
      if (!containerRef.current) return
      const container = containerRef.current
      const containerWidth = container.clientWidth
      const cardsToShow = 6
      setCardsToDisplay(6)
      
      // Account for mx-3 (12px left + 12px right = 24px total)
      const availableWidth = containerWidth - 24
      
      // Calculate gaps between cards
      const gapTotal = (cardsToShow - 1) * 4 // gap-1 = 4px
      const computed = Math.floor((availableWidth - gapTotal) / cardsToShow)
      setItemWidth(computed > 0 ? computed : 0)
    }

    const computeWidthIfChanged = () => {
      if (!containerRef.current) return
      const key = `${containerRef.current.clientWidth}|${window.devicePixelRatio || 1}`
      if (lastComputedRef.current === key) return
      lastComputedRef.current = key
      computeWidth()
    }

    computeWidthIfChanged()
    window.addEventListener('resize', computeWidthIfChanged)

    let resizeObserver
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(() => computeWidthIfChanged())
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener('resize', computeWidthIfChanged)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [])

  const nextSlide = () => {
    if (currentSlide < products.length - cardsToDisplay) {
      setCurrentSlide((prev) => prev + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1)
    }
  }

  // If no products, don't render anything
  if (!products || products.length === 0) return null

  // Only show on desktop (md and above)
  return (
    <section className="my-6 hidden md:block overflow-hidden bg-white" style={{ minHeight: "400px" }}>
      <div className="w-full px-5">
        <h2 className="mx-3 mb-2 text-2xl font-bold text-gray-900">Best Sellers</h2>
        <div className="relative" ref={containerRef}>
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 translate-x-2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-gray-200"
              style={{ marginLeft: "-20px" }}
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>

            <button
              onClick={nextSlide}
              disabled={currentSlide >= products.length - cardsToDisplay}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-gray-200"
              style={{ marginRight: "-20px" }}
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>

            <div className="overflow-hidden my-5 mx-3">
              <div
                className="flex transition-transform duration-300 ease-in-out gap-1"
                style={{ transform: `translateX(-${currentSlide * (itemWidth + 4)}px)` }}
              >
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="flex-shrink-0 box-border"
                    style={
                      itemWidth
                        ? { flex: `0 0 ${itemWidth}px`, maxWidth: `${itemWidth}px` }
                        : { flex: "0 0 16.6667%", maxWidth: "16.6667%" }
                    }
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
    </section>
  )
}

export default BigSaleSection
