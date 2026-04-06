"use client"
import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { useWishlist } from "../context/WishlistContext"
import { getFullImageUrl } from "../utils/imageUtils"
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import '../styles/phoneInput.css'
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  MessageCircle,
  Phone,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  User,
  Heart,
  Truck,
  RotateCcw,
  Award,
  Mail,
  Percent,
  CheckCircle,
} from "lucide-react"
import { productsAPI } from "../services/api.js"
import { trackProductView } from "../utils/gtmTracking"

import config from "../config/config"
import ProductSchema from "../components/ProductSchema"
import ReviewSection from "../components/ReviewSection"
import { useLanguage } from "../context/LanguageContext"

import TabbyModal from "../components/payments/TabbyModal"
import TamaraModal from "../components/payments/TamaraModal"
import SEO from "../components/SEO"
import TranslatedTipTapRenderer, { preloadTipTapHtmlTranslation } from "../components/TranslatedTipTapRenderer"
import BuyerProtectionSection from "../components/BuyerProtectionSection"
import TranslatedText from "../components/TranslatedText"
import { preloadTranslations } from "../LanguageModel/translationService"

const WHATSAPP_NUMBER = "971508604360" // Replace with your WhatsApp number
const TRANSLATION_SKIP_TAGS = new Set(["CODE", "PRE", "KBD", "SAMP", "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "OPTION"])

const isWorthTranslating = (text) => {
  if (!text || typeof text !== "string") return false
  const normalized = text.trim()
  if (!normalized) return false
  if (/[\u0600-\u06FF]/.test(normalized)) return false
  if (!/[A-Za-z]/.test(normalized)) return false
  if (/(https?:\/\/|www\.|@)/i.test(normalized)) return false
  if (!normalized.includes(" ") && /\d/.test(normalized)) return false
  return true
}

const extractTranslatableTextsFromHtml = (html) => {
  if (!html || typeof html !== "string") return []
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false)
    const texts = []
    let node
    while ((node = walker.nextNode())) {
      const parentTag = node.parentElement?.tagName
      if (parentTag && TRANSLATION_SKIP_TAGS.has(parentTag)) continue
      const text = (node.textContent || "").trim()
      if (isWorthTranslating(text)) {
        texts.push(text)
      }
    }
    return texts
  } catch {
    return []
  }
}

const ProductDetails = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { getLocalizedPath, isArabic } = useLanguage()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColorIndex, setSelectedColorIndex] = useState(null)
  const [selectedDosIndex, setSelectedDosIndex] = useState(null)
  const [activeTab, setActiveTab] = useState("description")
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const thumbnailRowRef = useRef(null)
  const [thumbScroll, setThumbScroll] = useState(0)
  const [showRatingDropdown, setShowRatingDropdown] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const ratingDropdownRef = useRef(null)

  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })

  // New state variables
  const [frequentlyBought, setFrequentlyBought] = useState([])
  const [frequentlyBoughtLoading, setFrequentlyBoughtLoading] = useState(true)
  const [selectedBundleItems, setSelectedBundleItems] = useState({})

  const [showTabbyModal, setShowTabbyModal] = useState(false)
  const [showTamaraModal, setShowTamaraModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  
  // Buyer Protection state
  const [selectedProtections, setSelectedProtections] = useState([])
  const [hasProtectionPlans, setHasProtectionPlans] = useState(false)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showImageModal || !product) return

      const productImages =
        product.galleryImages && product.galleryImages.length > 0
          ? [product.image, ...product.galleryImages.filter((img) => img)]
          : [product.image]

      if (e.key === "ArrowLeft") {
        setModalImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1))
      } else if (e.key === "ArrowRight") {
        setModalImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0))
      } else if (e.key === "Escape") {
        setShowImageModal(false)
        setIsImageZoomed(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showImageModal, product])

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Handle click outside to close dropdown on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        showRatingDropdown &&
        ratingDropdownRef.current &&
        !ratingDropdownRef.current.contains(event.target)
      ) {
        setShowRatingDropdown(false)
      }
    }

    if (isMobile && showRatingDropdown) {
      document.addEventListener("touchstart", handleClickOutside)
      document.addEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("touchstart", handleClickOutside)
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isMobile, showRatingDropdown])

  const [showCallbackModal, setShowCallbackModal] = useState(false)
  const [callbackForm, setCallbackForm] = useState({ 
    name: user?.name || "", 
    email: user?.email || "", 
    phone: "",
    customerNote: ""
  })
  const [callbackLoading, setCallbackLoading] = useState(false)
  const [callbackSuccess, setCallbackSuccess] = useState(false)
  const [emailChanged, setEmailChanged] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationVerified, setVerificationVerified] = useState(false)
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [phoneValue, setPhoneValue] = useState("")

  const [relatedLoading, setRelatedLoading] = useState(true)
  const [showCouponsModal, setShowCouponsModal] = useState(false)
  const [publicCoupons, setPublicCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [couponError, setCouponError] = useState(null)
  const [couponCopied, setCouponCopied] = useState(null)

  const formatPrice = (price) => {
    const num = Number(price)
    if (isNaN(num)) return <><TranslatedText>AED</TranslatedText> 0.00</>
    // Check if number is an integer (no decimal part)
    if (Number.isInteger(num)) {
      return (
        <>
          <TranslatedText>AED</TranslatedText> {num.toLocaleString()}.00
        </>
      )
    }
    // Preserve up to 2 decimal places if backend already has them (e.g., 2078.96)
    const fixed = num.toFixed(2)
    // Remove trailing zeros but keep two if both are needed for .10 style? requirement says keep backend decimals; we keep exactly given decimals if provided.
    // Since backend provided decimals, show them (2 places) without extra .00
    return (
      <>
        <TranslatedText>AED</TranslatedText> {Number(fixed).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </>
    )
  }

  const calculateDiscountedPrice = (price, discountPercent = 25) => {
    const numericPrice = typeof price === "number" ? price : Number(price) || 0
    return numericPrice * (1 - discountPercent / 100)
  }

  const formatDiscountedPrice = (price, discountPercent = 25) => {
    const discountedPrice = calculateDiscountedPrice(price, discountPercent)
    return formatPrice(discountedPrice)
  }

  // Get current color variation
  const getCurrentColor = () => {
    if (selectedColorIndex !== null && product?.colorVariations && product.colorVariations.length > 0) {
      return product.colorVariations[selectedColorIndex]
    }
    return null
  }

  // Get current DOS/Windows variation
  const getCurrentDos = () => {
    if (selectedDosIndex !== null && product?.dosVariations && product.dosVariations.length > 0) {
      return product.dosVariations[selectedDosIndex]
    }
    return null
  }

  // Helper function to check if a URL is a YouTube URL
  const isYouTubeUrl = (url) => {
    if (!url) return false
    return url.includes('youtube.com') || url.includes('youtu.be')
  }

  // Helper function to get YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return ''
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  // Get current images based on selected color or DOS variation (includes videos)
  const getCurrentImages = () => {
    const currentColor = getCurrentColor()
    const currentDos = getCurrentDos()
    const media = []
    
    // Check DOS variation first (if selected)
    if (currentDos && currentDos.image) {
      media.push({ type: 'image', url: currentDos.image })
      if (currentDos.galleryImages && currentDos.galleryImages.length > 0) {
        currentDos.galleryImages.filter(img => img).forEach(img => {
          media.push({ type: 'image', url: img })
        })
      }
      return media
    }
    
    // Check color variation
    if (currentColor && currentColor.image) {
      media.push({ type: 'image', url: currentColor.image })
      if (currentColor.galleryImages && currentColor.galleryImages.length > 0) {
        currentColor.galleryImages.filter(img => img).forEach(img => {
          media.push({ type: 'image', url: img })
        })
      }
      return media
    }
    
    // Fallback to product images and videos
    if (product?.image) {
      media.push({ type: 'image', url: product.image })
    }
    
    if (product?.galleryImages && product.galleryImages.length > 0) {
      product.galleryImages.filter(img => img).forEach(img => {
        media.push({ type: 'image', url: img })
      })
    }
    
    // Add main product video if exists
    if (product?.video) {
      media.push({ type: 'video', url: product.video })
    }
    
    // Add video gallery if exists
    if (product?.videoGallery && product.videoGallery.length > 0) {
      product.videoGallery.filter(vid => vid).forEach(vid => {
        media.push({ type: 'video', url: vid })
      })
    }
    
    return media
  }

  const getEffectivePrice = () => {
    const currentColor = getCurrentColor()
    const currentDos = getCurrentDos()
    
    // Get base price (from color if selected, otherwise from product)
    let basePrice = 0
    if (currentColor) {
      const colorBasePrice = Number(currentColor.price) || 0
      const colorOfferPrice = Number(currentColor.offerPrice) || 0
      basePrice = (colorOfferPrice > 0 && colorOfferPrice < colorBasePrice) ? colorOfferPrice : colorBasePrice
    } else {
      const productBasePrice = Number(product?.price) || 0
      const productOfferPrice = Number(product?.offerPrice) || 0
      basePrice = (productOfferPrice > 0 && productOfferPrice < productBasePrice) ? productOfferPrice : productBasePrice
    }
    
    // Add DOS price if selected (additive)
    if (currentDos) {
      const dosBasePrice = Number(currentDos.price) || 0
      const dosOfferPrice = Number(currentDos.offerPrice) || 0
      const dosPrice = (dosOfferPrice > 0 && dosOfferPrice < dosBasePrice) ? dosOfferPrice : dosBasePrice
      basePrice += dosPrice
    }
    
    return basePrice
  }
  const formatPerMonth = (n) =>
    `AED ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo`

  const getRatingDistribution = () => {
    return reviewStats.ratingDistribution
  }

  // Handle rating interaction (hover for desktop, click for mobile)
  const handleRatingInteraction = () => {
    if (isMobile) {
      setShowRatingDropdown(!showRatingDropdown)
    }
  }

  const fetchReviewStats = async () => {
    if (!product?._id) return

    try {
      const response = await axios.get(`${config.API_URL}/api/reviews/product/${product._id}?page=1&limit=1`)
      if (response.data.stats) {
        setReviewStats({
          averageRating: response.data.stats.averageRating || 0,
          totalReviews: response.data.stats.totalReviews || 0,
          ratingDistribution: response.data.stats.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        })
      }
    } catch (error) {
      console.error("Error fetching review stats:", error)
    }
  }

  const scrollToReviewSection = () => {
    setActiveTab("reviews")
    // Small delay to ensure tab content is rendered
    setTimeout(() => {
      const reviewSection = document.querySelector("[data-review-section]")
      if (reviewSection) {
        reviewSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        })
      }
    }, 100)
    // Close the dropdown after clicking
    setShowRatingDropdown(false)
  }

  const handleStarRatingClick = (rating) => {
    scrollToReviewSection()
    // You could also filter reviews by rating here if needed
  }

  useEffect(() => {
    if (!slug) return
    let normalizedSlug = slug
    try {
      normalizedSlug = decodeURIComponent(slug)
    } catch (decodeError) {
      console.warn("Slug already decoded or invalid encoding", slug, decodeError.message)
    }
    console.log("ProductDetails param slug:", slug, "using:", normalizedSlug)
    fetchProduct(normalizedSlug)
  }, [slug])

  useEffect(() => {
    if (product) {
      fetchRelatedProducts()
      fetchReviewStats()
      fetchFrequentlyBought() // Add this line
    }
  }, [product])

  const preloadProductTexts = async (productData, targetLang = "ar", options = {}) => {
    const { primeHtmlCache = false } = options
    if (!productData || targetLang !== "ar") return

    const texts = []
    const pushText = (value) => {
      if (isWorthTranslating(value)) {
        texts.push(value.trim())
      }
    }

    pushText(productData.name)
    pushText(productData.brand?.name || productData.brand)
    pushText(productData.category?.name || productData.category)
    pushText(productData.warranty)

    if (Array.isArray(productData.specifications)) {
      productData.specifications.forEach((spec) => {
        pushText(spec?.key)
        pushText(spec?.value)
      })
    }

    extractTranslatableTextsFromHtml(productData.shortDescription).forEach(pushText)
    extractTranslatableTextsFromHtml(productData.description).forEach(pushText)

    const uniqueTexts = Array.from(new Set(texts))

    try {
      if (uniqueTexts.length > 0) {
        await preloadTranslations(uniqueTexts, targetLang)
      }

      // Prime full HTML cache for TipTap-rendered blocks (short + long description).
      // This avoids waiting for HTML parsing + translation after language switch.
      if (primeHtmlCache) {
        await Promise.allSettled([
          preloadTipTapHtmlTranslation(productData.shortDescription, targetLang),
          preloadTipTapHtmlTranslation(productData.description, targetLang),
        ])
      }
    } catch (error) {
      console.error("Preload product translations error:", error)
    }
  }

  const fetchProduct = async (rawSlug) => {
    try {
      const attemptSlug = (rawSlug || slug || '').trim()
      console.log("Fetching product for slug:", attemptSlug)
      let data
      try {
        data = await productsAPI.getBySlug(attemptSlug)
      } catch (e) {
        // If slug contains unsafe chars or lookup failed, try a sanitized variant
        console.warn("Primary slug fetch failed, trying fallback sanitization", e.message)
        const fallback = attemptSlug
          .toLowerCase()
          .replace(/[^a-z0-9\-]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        if (fallback && fallback !== attemptSlug) {
          try {
            data = await productsAPI.getBySlug(fallback)
          } catch (e2) {
            console.warn("Fallback slug also failed", e2.message)
          }
        }
      }
      // If still no data and looks like an ObjectId, attempt by ID
      if (!data && attemptSlug.match(/^[0-9a-fA-F]{24}$/)) {
        try {
          data = await productsAPI.getById(attemptSlug)
        } catch (e3) {
          console.warn("ID fetch attempt failed", e3.message)
        }
      }
      if (!data) throw new Error("Product not found via slug or ID attempts")
      console.log("API response for product:", data)

      // Warm translation cache before first Arabic render to reduce visible delay.
      if (isArabic) {
        await Promise.race([
          preloadProductTexts(data, "ar", { primeHtmlCache: true }),
          new Promise((resolve) => setTimeout(resolve, 1800)),
        ])
      }

      setProduct(data)
      setError(null)

      // Add GTM tracking here - after product is successfully loaded
      if (data && data._id) {
        try {
          trackProductView(data)
        } catch (trackingError) {
          console.error("GTM tracking error:", trackingError)
        }
      }
    } catch (error) {
      console.error("Error fetching product after fallbacks:", error)
      setError("Failed to load product details. Please check the URL or try again later.")
    } finally {
      setLoading(false)
    }
  }

  // While viewing English product page, pre-warm Arabic description translations in idle time.
  // This makes EN -> AR switch feel instant for short/long description without blocking initial render.
  useEffect(() => {
    if (!product || isArabic) return

    let cancelled = false
    let idleId = null
    let timeoutId = null

    const runPrewarm = async () => {
      if (cancelled) return
      await preloadProductTexts(product, "ar", { primeHtmlCache: true })
    }

    if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => {
        runPrewarm()
      }, { timeout: 1200 })
    } else {
      timeoutId = window.setTimeout(() => {
        runPrewarm()
      }, 700)
    }

    return () => {
      cancelled = true
      if (idleId !== null && typeof window !== "undefined" && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [product, isArabic])

  const fetchRelatedProducts = async () => {
    setRelatedLoading(true)
    try {
      // Try to get related products from the same category
      const { data } = await axios.get(`${config.API_URL}/api/products?category=${product.category._id}&limit=12`)
      let filtered = data.filter((p) => p._id !== product._id)
      if (filtered.length === 0) { 
        // If no related products, fetch all products and pick random ones (excluding current)
        const allRes = await axios.get(`${config.API_URL}/api/products`)
        filtered = allRes.data.filter((p) => p._id !== product._id)
      }

      if (isArabic && filtered.length > 0) {
        const relatedTexts = Array.from(
          new Set(
            filtered
              .flatMap((item) => [item?.name, item?.brand?.name, item?.category?.name])
              .filter((value) => isWorthTranslating(value))
              .map((value) => value.trim())
          )
        )
        if (relatedTexts.length > 0) {
          await preloadTranslations(relatedTexts, "ar")
        }
      }

      setRelatedProducts(filtered)
    } catch (error) {
      console.error("Error fetching related products:", error)
    } finally {
      setRelatedLoading(false)
    }
  }

  // Function to handle bundle item selection
  const handleBundleItemToggle = (itemId) => {
    console.log("Toggling bundle item:", itemId)
    setSelectedBundleItems((prev) => {
      const newState = {
        ...prev,
        [itemId]: !prev[itemId],
      }
      console.log("Updated selectedBundleItems:", newState)
      return newState
    })
  }

  // Function to calculate total bundle price
  const calculateBundleTotal = () => {
    let total = 0

    // Add current product if selected (no discount on main product)
    if (selectedBundleItems[product._id]) {
      total += product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price
    }

    // Add selected bundle items with 25% discount
    frequentlyBought.forEach((item) => {
      if (selectedBundleItems[item._id]) {
        const originalPrice = item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price
        const discountedPrice = calculateDiscountedPrice(originalPrice, 25)
        total += discountedPrice
      }
    })

    return total
  }

  // New function to calculate savings
  const calculateBundleSavings = () => {
    let originalTotal = 0
    let discountedTotal = 0

    // Add current product if selected
    if (selectedBundleItems[product._id]) {
      const productPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price
      originalTotal += productPrice
      discountedTotal += productPrice
    }

    // Add selected bundle items
    frequentlyBought.forEach((item) => {
      if (selectedBundleItems[item._id]) {
        const originalPrice = item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price
        const discountedPrice = calculateDiscountedPrice(originalPrice, 25)
        originalTotal += originalPrice
        discountedTotal += discountedPrice
      }
    })

    return {
      originalTotal,
      discountedTotal,
      savings: originalTotal - discountedTotal,
    }
  }

  // Replace your existing FrequentlyBoughtTogether component (around line 658)
  const FrequentlyBoughtTogether = () => {
    if (frequentlyBoughtLoading) {
      return (
        <div className="mb-8 border-t border-[#d7ddd4] pt-6">
          <div className="animate-pulse">
            <div className="mb-4 h-6 w-52 rounded bg-[#dfe5db]"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded bg-[#dfe5db]"></div>
                  <div className="flex-1">
                    <div className="mb-2 h-4 rounded bg-[#dfe5db]"></div>
                    <div className="h-3 w-1/2 rounded bg-[#e7ece4]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (!frequentlyBought || frequentlyBought.length === 0) {
      return null
    }

    const selectedCount = Object.values(selectedBundleItems).filter(Boolean).length
    const bundleTotals = calculateBundleSavings()

    return (
      <div className="mb-8 border-t border-[#d7ddd4] pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900"><TranslatedText>Frequently Bought Together</TranslatedText></h3>
          <div className="rounded-full bg-[#edf1eb] px-3 py-1 text-sm font-bold text-[#505e4d]">25% <TranslatedText>OFF BUNDLE</TranslatedText></div>
        </div>

        <div className="space-y-4">
          {/* Current Product - Always Selected */}
          <div className="flex items-center space-x-4 border-b border-[#e2e7df] pb-4">
            <input
              type="checkbox"
              checked={true}
              disabled={true}
              className="h-5 w-5 rounded border-[#c7d0c1] text-[#505e4d] focus:ring-[#505e4d]"
            />
            <img
              src={getFullImageUrl(product.image) || "/placeholder.svg"}
              alt={product.name}
              className="h-16 w-16 rounded-md bg-[#f2f4f1] object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900"><TranslatedText text={product.name} sourceDoc={product} fieldName="name">{product.name}</TranslatedText></h4>
              <p className="font-semibold text-[#505e4d]">
                {formatPrice(product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price)}
              </p>
              <span className="rounded-full bg-[#edf1eb] px-2 py-1 text-xs text-[#505e4d]"><TranslatedText>Current Item</TranslatedText></span>
            </div>
          </div>

          {/* Bundle Items with 25% Discount */}
          {frequentlyBought.map((item) => {
            const originalPrice = item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price
            const discountedPrice = calculateDiscountedPrice(originalPrice, 25)
            const savings = originalPrice - discountedPrice

            return (
              <div
                key={item._id}
                className="flex items-center space-x-4 border-b border-[#e2e7df] pb-4"
              >
                <input
                  type="checkbox"
                  checked={selectedBundleItems[item._id] || false}
                  onChange={() => handleBundleItemToggle(item._id)}
                  className="h-5 w-5 rounded border-[#c7d0c1] text-[#505e4d] focus:ring-[#505e4d]"
                />
                <img
                  src={getFullImageUrl(item.image) || "/placeholder.svg"}
                  alt={item.name}
                  className="h-16 w-16 rounded-md bg-[#f2f4f1] object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900"><TranslatedText text={item.name} sourceDoc={item} fieldName="name">{item.name}</TranslatedText></h4>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#505e4d]">{formatDiscountedPrice(originalPrice, 25)}</p>
                    <p className="text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</p>
                    <span className="rounded-full bg-[#edf1eb] px-2 py-1 text-xs font-medium text-[#505e4d]"><TranslatedText>Save</TranslatedText> 25%</span>
                  </div>
                  <p className="text-sm font-medium text-[#505e4d]"><TranslatedText>You save</TranslatedText> {formatPrice(savings)}</p>

                  {/* Show original offer details if any */}
                  {item.offerPrice && item.offerPrice > 0 && item.offerPrice < item.price && (
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="line-through">{formatPrice(item.price)}</span>
                      <span className="ml-2 text-[#505e4d]"><TranslatedText>Already discounted</TranslatedText></span>
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Total and Add to Cart */}
        <div className="mt-6 border-t border-[#d7ddd4] pt-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-lg mb-2">
                <span className="text-gray-700"><TranslatedText>Bundle price</TranslatedText>: </span>
                <span className="text-xl font-bold text-[#505e4d]">{formatPrice(bundleTotals.discountedTotal)}</span>
                {bundleTotals.savings > 0 && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    {formatPrice(bundleTotals.originalTotal)}
                  </span>
                )}
              </div>
              {bundleTotals.savings > 0 && (
                <div className="text-sm font-medium text-[#505e4d]">
                  <TranslatedText>You save</TranslatedText> {formatPrice(bundleTotals.savings)} <TranslatedText>with bundle discount!</TranslatedText>
                </div>
              )}
              <div className="text-sm text-gray-600 mt-1">
                <TranslatedText>For</TranslatedText> {selectedCount} <TranslatedText>{selectedCount !== 1 ? "items" : "item"}</TranslatedText>
              </div>
            </div>

            <button
              data-add-bundle-btn
              onClick={handleAddBundleToCart}
              disabled={selectedCount === 0}
              className="flex items-center gap-2 rounded-lg bg-[#505e4d] px-6 py-3 font-medium text-white transition-colors hover:bg-[#465342] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <ShoppingCart size={20} />
              <TranslatedText>Add all</TranslatedText> {selectedCount} <TranslatedText>to Cart</TranslatedText>
              {bundleTotals.savings > 0 && (
                <span className="rounded-full bg-white px-2 py-1 text-xs text-[#505e4d]">
                  <TranslatedText>Save</TranslatedText> {formatPrice(bundleTotals.savings)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    // Check stock status based on selected color, DOS variation, or main product
    const currentColor = getCurrentColor()
    const currentDos = getCurrentDos()
    
    if (currentDos && currentDos.countInStock <= 0) {
      showToast("Selected OS option is out of stock", "error")
      return
    }
    if (currentColor && currentColor.countInStock <= 0) {
      showToast("Selected color is out of stock", "error")
      return
    }
    if (!currentColor && !currentDos && product.stockStatus === "Out of Stock") {
      showToast("Product is out of stock", "error")
      return
    }
    
    // Calculate the final price based on variations:
    // If color is selected: use color price as base
    // If DOS is selected: add DOS price to base price (additive)
    let finalPrice = 0
    let baseImageUrl = product.image
    
    // Get base price from color or product
    if (currentColor) {
      const colorPrice = currentColor.offerPrice > 0 ? currentColor.offerPrice : currentColor.price
      finalPrice = Number(colorPrice) || 0
      baseImageUrl = currentColor.image || product.image
    } else {
      finalPrice = product.offerPrice > 0 ? Number(product.offerPrice) : Number(product.price) || 0
    }
    
    // Add DOS price if selected (additive)
    if (currentDos) {
      const dosPrice = currentDos.offerPrice > 0 ? currentDos.offerPrice : currentDos.price
      finalPrice += Number(dosPrice) || 0
    }
    
    // Prepare product with variation data
    const productToAdd = {
      ...product,
      selectedColorIndex,
      selectedColorData: currentColor ? {
        color: currentColor.color,
        image: currentColor.image,
        price: currentColor.price,
        offerPrice: currentColor.offerPrice,
        sku: currentColor.sku,
      } : null,
      selectedDosIndex,
      selectedDosData: currentDos ? {
        dosType: currentDos.dosType,
        image: currentDos.image,
        price: currentDos.price,
        offerPrice: currentDos.offerPrice,
        sku: currentDos.sku,
      } : null,
      // Final calculated price (color/product base + DOS if selected)
      // Clear offerPrice so CartContext uses 'price' as the effective price
      price: finalPrice,
      offerPrice: 0, // Reset so computeUnit uses price field
      // Override image with color-specific image if available
      image: baseImageUrl,
    }
    
    // Add main product to cart
    addToCart(productToAdd, quantity)
    
    // Add selected protections to cart as separate items linked to the product
    if (selectedProtections.length > 0) {
      selectedProtections.forEach((protection) => {
        const protectionItem = {
          _id: `protection_${protection._id}_${product._id}_${Date.now()}`,
          name: `${protection.name} for ${product.name}`,
          price: protection.calculatedPrice || protection.price,
          image: product.image, // Use product image as reference
          isProtection: true,
          protectionFor: product._id,
          protectionData: protection,
          countInStock: 999, // Protection plans don't have stock limits
          quantity: 1, // Always 1 per product
        }
        addToCart(protectionItem, 1)
      })
      showToast(`Product and ${selectedProtections.length} protection plan(s) added to cart!`, "success")
    } else {
      showToast("Product added to cart!", "success")
    }
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate("/cart")
  }

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const newQuantity = prev + delta
      if (newQuantity < 1) return 1
      if (newQuantity > (product.maxPurchaseQty || 10)) return product.maxPurchaseQty || 10
      return newQuantity
    })
  }

  const handleImageClick = (index) => {
    setModalImageIndex(index)
    setShowImageModal(true)
  }

  // const fetchFrequentlyBought = async () => {
  //   setFrequentlyBoughtLoading(true)
  //   try {
  //     const complementaryProducts = []

  //     // Get product category and name to determine what accessories to show
  //     const productName = product.name?.toLowerCase() || ""
  //     const categoryName = product.category?.name?.toLowerCase() || ""
  //     const brandName = product.brand?.name?.toLowerCase() || ""

  //     console.log("Product details:", { productName, categoryName, brandName })

  //     // Define complementary product logic based on main product type
  //     if (categoryName.includes("laptop") || productName.includes("laptop")) {
  //       // For laptops, get exactly 2 diverse accessories - one from each category
  //       const accessoryCategories = [
  //         {
  //           name: "mouse",
  //           searches: ["wireless mouse", "bluetooth mouse", "gaming mouse"],
  //           keywords: ["mouse"],
  //         },
  //         {
  //           name: "headphones",
  //           searches: ["bluetooth headphones", "wireless headset", "gaming headset", "earbuds"],
  //           keywords: ["headphone", "headset", "earbuds", "earphone"],
  //         },
  //         {
  //           name: "keyboard",
  //           searches: ["wireless keyboard", "bluetooth keyboard", "mechanical keyboard"],
  //           keywords: ["keyboard"],
  //         },
  //         {
  //           name: "accessories",
  //           searches: ["laptop bag", "laptop stand", "cooling pad", "webcam", "usb hub", "portable speaker"],
  //           keywords: ["bag", "stand", "cooling", "webcam", "hub", "speaker", "charger"],
  //         },
  //       ]

  //       // Get one product from each category to ensure diversity - LIMIT TO 2
  //       for (const category of accessoryCategories) {
  //         let foundInCategory = false

  //         for (const searchTerm of category.searches) {
  //           if (foundInCategory) break

  //           try {
  //             const response = await axios.get(
  //               `${config.API_URL}/api/products?search=${encodeURIComponent(searchTerm)}&limit=10`,
  //             )
  //             const accessories = response.data.filter(
  //               (p) =>
  //                 p._id !== product._id &&
  //                 // Exclude main product categories
  //                 !p.name?.toLowerCase().includes("laptop") &&
  //                 !p.name?.toLowerCase().includes("desktop") &&
  //                 !p.name?.toLowerCase().includes("computer") &&
  //                 !p.name?.toLowerCase().includes("pc") &&
  //                 !p.name?.toLowerCase().includes("monitor") &&
  //                 !p.name?.toLowerCase().includes("aio") &&
  //                 // Include only relevant accessories
  //                 category.keywords.some(
  //                   (keyword) =>
  //                     p.name?.toLowerCase().includes(keyword) || p.category?.name?.toLowerCase().includes(keyword),
  //                 ),
  //             )

  //             if (accessories.length > 0) {
  //               // Add first matching product from this category
  //               complementaryProducts.push(accessories[0])
  //               foundInCategory = true
  //               console.log(`Found ${category.name}:`, accessories[0].name)
  //             }
  //           } catch (error) {
  //             console.log(`Search failed for: ${searchTerm}`)
  //           }
  //         }

  //         // Stop when we have exactly 2 diverse products
  //         if (complementaryProducts.length >= 2) break
  //       }
  //     } else if (categoryName.includes("desktop") || productName.includes("desktop")) {
  //       // For desktops, get exactly 2 accessories
  //       const desktopCategories = [
  //         {
  //           name: "monitor",
  //           searches: ["monitor", "display"],
  //           keywords: ["monitor", "display"],
  //         },
  //         {
  //           name: "keyboard",
  //           searches: ["wireless keyboard", "mechanical keyboard"],
  //           keywords: ["keyboard"],
  //         },
  //         {
  //           name: "mouse",
  //           searches: ["wireless mouse", "gaming mouse"],
  //           keywords: ["mouse"],
  //         },
  //       ]

  //       for (const category of desktopCategories) {
  //         let foundInCategory = false

  //         for (const searchTerm of category.searches) {
  //           if (foundInCategory) break

  //           try {
  //             const response = await axios.get(
  //               `${config.API_URL}/api/products?search=${encodeURIComponent(searchTerm)}&limit=10`,
  //             )
  //             const accessories = response.data.filter(
  //               (p) =>
  //                 p._id !== product._id &&
  //                 !p.name?.toLowerCase().includes("desktop") &&
  //                 !p.name?.toLowerCase().includes("laptop") &&
  //                 category.keywords.some((keyword) => p.name?.toLowerCase().includes(keyword)),
  //             )

  //             if (accessories.length > 0) {
  //               complementaryProducts.push(accessories[0])
  //               foundInCategory = true
  //             }
  //           } catch (error) {
  //             console.log(`Search failed for: ${searchTerm}`)
  //           }
  //         }

  //         // Stop when we have exactly 2 products
  //         if (complementaryProducts.length >= 2) break
  //       }
  //     } else if (categoryName.includes("mobile") || categoryName.includes("phone") || productName.includes("phone")) {
  //       // For phones, get exactly 2 phone accessories
  //       const phoneCategories = [
  //         {
  //           name: "case",
  //           searches: ["phone case", "mobile case"],
  //           keywords: ["case", "cover"],
  //         },
  //         {
  //           name: "charger",
  //           searches: ["wireless charger", "phone charger", "power bank"],
  //           keywords: ["charger", "power bank", "charging"],
  //         },
  //         {
  //           name: "audio",
  //           searches: ["wireless earbuds", "bluetooth headphones"],
  //           keywords: ["earbuds", "headphone", "earphone"],
  //         },
  //       ]

  //       for (const category of phoneCategories) {
  //         let foundInCategory = false

  //         for (const searchTerm of category.searches) {
  //           if (foundInCategory) break

  //           try {
  //             const response = await axios.get(
  //               `${config.API_URL}/api/products?search=${encodeURIComponent(searchTerm)}&limit=10`,
  //             )
  //             const accessories = response.data.filter(
  //               (p) =>
  //                 p._id !== product._id &&
  //                 !p.name?.toLowerCase().includes("phone") &&
  //                 !p.name?.toLowerCase().includes("mobile") &&
  //                 category.keywords.some((keyword) => p.name?.toLowerCase().includes(keyword)),
  //             )

  //             if (accessories.length > 0) {
  //               complementaryProducts.push(accessories[0])
  //               foundInCategory = true
  //             }
  //           } catch (error) {
  //             console.log(`Search failed for: ${searchTerm}`)
  //           }
  //         }

  //         // Stop when we have exactly 2 products
  //         if (complementaryProducts.length >= 2) break
  //       }
  //     }

  //     // Remove duplicates and ensure exactly 2 items
  //     const uniqueProducts = complementaryProducts
  //       .filter((product, index, self) => index === self.findIndex((p) => p._id === product._id))
  //       .slice(0, 2) // LIMIT TO EXACTLY 2 ACCESSORIES

  //     console.log("Found complementary products:", uniqueProducts.length)
  //     console.log(
  //       "Products:",
  //       uniqueProducts.map((p) => ({
  //         name: p.name,
  //         category: p.category?.name,
  //         type: p.name?.toLowerCase().includes("mouse")
  //           ? "mouse"
  //           : p.name?.toLowerCase().includes("keyboard")
  //             ? "keyboard"
  //             : p.name?.toLowerCase().includes("headphone") || p.name?.toLowerCase().includes("headset")
  //               ? "audio"
  //               : "other",
  //       })),
  //     )

  //     // If we don't have exactly 2, try fallback
  //     if (uniqueProducts.length < 2) {
  //       console.log(`Only found ${uniqueProducts.length} accessories, trying fallback...`)

  //       try {
  //         const fallbackResponse = await axios.get(`${config.API_URL}/api/products?limit=50`)
  //         const fallbackAccessories = fallbackResponse.data.filter(
  //           (p) =>
  //             p._id !== product._id &&
  //             (p.category?.name?.toLowerCase().includes("accessories") ||
  //               p.name?.toLowerCase().includes("mouse") ||
  //               p.name?.toLowerCase().includes("keyboard") ||
  //               p.name?.toLowerCase().includes("headphone") ||
  //               p.name?.toLowerCase().includes("speaker")) &&
  //             // Exclude main product categories
  //             !p.name?.toLowerCase().includes("laptop") &&
  //             !p.name?.toLowerCase().includes("desktop") &&
  //             !p.name?.toLowerCase().includes("computer") &&
  //             !p.name?.toLowerCase().includes("phone") &&
  //             !p.name?.toLowerCase().includes("tablet") &&
  //             !p.name?.toLowerCase().includes("monitor") &&
  //             !uniqueProducts.some((existing) => existing._id === p._id), // Don't duplicate
  //         )

  //         // Add fallback products to reach exactly 2 total
  //         const needed = 2 - uniqueProducts.length
  //         uniqueProducts.push(...fallbackAccessories.slice(0, needed))

  //         console.log(
  //           "Added fallback accessories:",
  //           fallbackAccessories.slice(0, needed).map((p) => p.name),
  //         )
  //       } catch (error) {
  //         console.error("Fallback accessories search failed:", error)
  //       }
  //     }

  //     // Final check - ensure we have exactly 2 or hide the section
  //     if (uniqueProducts.length === 0) {
  //       console.log("No accessories found at all, hiding section")
  //       setFrequentlyBought([])
  //       setSelectedBundleItems({})
  //       return
  //     }

  //     // Set the found products (limit to exactly 2)
  //     const finalProducts = uniqueProducts.slice(0, 2)
  //     setFrequentlyBought(finalProducts)

  //     console.log(
  //       "Final selected products:",
  //       finalProducts.map((p) => ({ name: p.name, category: p.category?.name })),
  //     )

  //     // Auto-select ALL bundle items (current product + exactly 2 accessories = 3 total)
  //     const autoSelectedItems = {
  //       [product._id]: true, // Current product always selected
  //     }

  //     // Auto-select all found accessories (exactly 2)
  //     finalProducts.forEach((item) => {
  //       autoSelectedItems[item._id] = true
  //     })

  //     console.log("Auto-selected bundle items (total 3):", autoSelectedItems)
  //     console.log("Bundle will have:", Object.keys(autoSelectedItems).length, "items total")
  //     setSelectedBundleItems(autoSelectedItems)
  //   } catch (error) {
  //     console.error("Error fetching frequently bought products:", error)
  //     setFrequentlyBought([])
  //   } finally {
  //     setFrequentlyBoughtLoading(false)
  //   }
  // }




































// CHANGE: replace frequently-bought logic with category-specific accessory mapping
  // const fetchFrequentlyBought = async () => {
  //   setFrequentlyBoughtLoading(true)
  //   try {
  //     if (!product) {
  //       setFrequentlyBought([])
  //       setSelectedBundleItems({})
  //       return
  //     }

  //     const name = (product.name || "").toLowerCase()
  //     const catName = (product.category?.name || "").toLowerCase()

  //     // Helper: check if a text includes any of the words
  //     const includesAny = (txt, words) => words.some((w) => txt.includes(w))

  //     // Map primary product types to targeted accessory groups
  //     const GROUPS = [
  //       {
  //         match: ["laptop", "notebook", "macbook"],
  //         suggestions: [
  //           {
  //             label: "keyboard",
  //             keywords: ["keyboard"],
  //             searches: ["keyboard", "wireless keyboard", "bluetooth keyboard", "mechanical keyboard"],
  //           },
  //           {
  //             label: "mouse",
  //             keywords: ["mouse"],
  //             searches: ["mouse", "wireless mouse", "gaming mouse", "bluetooth mouse"],
  //           },
  //           {
  //             label: "laptop bag",
  //             keywords: ["bag", "sleeve", "backpack"],
  //             searches: ["laptop bag", "laptop sleeve", "laptop backpack"],
  //           },
  //           { label: "mouse pad", keywords: ["pad", "mat"], searches: ["mouse pad", "gaming mouse pad", "mouse mat"] },
  //           {
  //             label: "headphones",
  //             keywords: ["headphone", "headset", "earbuds", "earphone"],
  //             searches: ["headphones", "headset", "earbuds"],
  //           },
  //           { label: "hdmi cable", keywords: ["hdmi"], searches: ["hdmi cable"] },
  //         ],
  //         excludeMain: ["laptop", "desktop", "monitor", "aio", "computer", "pc"],
  //       },
  //       {
  //         match: ["printer"],
  //         suggestions: [
  //           { label: "usb cable", keywords: ["usb", "cable"], searches: ["usb cable", "printer cable"] },
  //           { label: "router", keywords: ["router"], searches: ["router"] },
  //           { label: "switch", keywords: ["switch"], searches: ["network switch", "gigabit switch"] },
  //           {
  //             label: "ethernet cable",
  //             keywords: ["ethernet", "lan", "network"],
  //             searches: ["ethernet cable", "lan cable", "network cable"],
  //           },
  //         ],
  //         excludeMain: ["printer"],
  //       },
  //       {
  //         match: ["monitor", "lcd", "led"],
  //         suggestions: [
  //           { label: "hdmi cable", keywords: ["hdmi"], searches: ["hdmi cable"] },
  //           {
  //             label: "displayport cable",
  //             keywords: ["displayport", "dp"],
  //             searches: ["displayport cable", "dp cable"],
  //           },
  //           {
  //             label: "network cable",
  //             keywords: ["ethernet", "lan", "network"],
  //             searches: ["ethernet cable", "lan cable", "network cable"],
  //           },
  //           { label: "keyboard", keywords: ["keyboard"], searches: ["keyboard", "wireless keyboard"] },
  //           { label: "mouse", keywords: ["mouse"], searches: ["mouse", "wireless mouse"] },
  //         ],
  //         excludeMain: ["monitor", "laptop", "desktop", "aio", "computer", "pc"],
  //       },
  //       {
  //         match: ["desktop", "pc", "computer"],
  //         suggestions: [
  //           { label: "monitor", keywords: ["monitor", "display"], searches: ["monitor", "display"] },
  //           { label: "keyboard", keywords: ["keyboard"], searches: ["keyboard", "mechanical keyboard"] },
  //           { label: "mouse", keywords: ["mouse"], searches: ["mouse", "gaming mouse"] },
  //           { label: "ram", keywords: ["ram", "memory", "ddr"], searches: ["ram", "ddr4", "ddr5 memory"] },
  //           { label: "ssd", keywords: ["ssd", "nvme", "solid state"], searches: ["ssd", "nvme ssd"] },
  //           { label: "hdmi cable", keywords: ["hdmi"], searches: ["hdmi cable"] },
  //           { label: "network cable", keywords: ["ethernet", "lan", "network"], searches: ["ethernet cable"] },
  //         ],
  //         excludeMain: ["desktop", "laptop", "monitor", "computer", "pc"],
  //       },
  //     ]

  //     // Determine which group applies
  //     const activeGroup = GROUPS.find((g) => includesAny(name, g.match) || includesAny(catName, g.match)) || null

  //     // If nothing matched, show a safe set of generic accessories
  //     const fallbackSuggestions = [
  //       { label: "mouse", keywords: ["mouse"], searches: ["mouse", "wireless mouse"] },
  //       { label: "keyboard", keywords: ["keyboard"], searches: ["keyboard"] },
  //       { label: "hdmi cable", keywords: ["hdmi"], searches: ["hdmi cable"] },
  //       { label: "network cable", keywords: ["ethernet", "lan", "network"], searches: ["ethernet cable"] },
  //     ]

  //     const suggestions = activeGroup?.suggestions || fallbackSuggestions
  //     const excludeWords = activeGroup?.excludeMain || []

  //     const results = []
  //     const seen = new Set()
  //     const MAX_ITEMS = 8

  //     // Helper: add product if unique and relevant
  //     const tryAddProduct = (p) => {
  //       if (!p || seen.has(p._id) || p._id === product._id) return
  //       const pname = (p.name || "").toLowerCase()
  //       const pcat = (p.category?.name || "").toLowerCase()
  //       // Exclude main-category items
  //       if (includesAny(pname, excludeWords) || includesAny(pcat, excludeWords)) return
  //       seen.add(p._id)
  //       results.push(p)
  //     }

  //     // For each suggestion, query with its search terms and filter by keywords to stay relevant
  //     for (const s of suggestions) {
  //       for (const term of s.searches) {
  //         if (results.length >= MAX_ITEMS) break
  //         try {
  //           const { data } = await axios.get(
  //             `${config.API_URL}/api/products?search=${encodeURIComponent(term)}&limit=20`,
  //           )
  //           data
  //             .filter((p) => {
  //               const pname = (p.name || "").toLowerCase()
  //               const pcat = (p.category?.name || "").toLowerCase()
  //               return s.keywords.some((kw) => pname.includes(kw) || pcat.includes(kw))
  //             })
  //             .forEach(tryAddProduct)
  //         } catch {
  //           // ignore individual search errors and continue
  //         }
  //         if (results.length >= MAX_ITEMS) break
  //       }
  //       if (results.length >= MAX_ITEMS) break
  //     }

  //     // If still empty, do a broad fallback scan
  //     if (results.length === 0) {
  //       try {
  //         const { data } = await axios.get(`${config.API_URL}/api/products?limit=100`)
  //         data
  //           .filter((p) => {
  //             const pname = (p.name || "").toLowerCase()
  //             const pcat = (p.category?.name || "").toLowerCase()
  //             return (
  //               [
  //                 "mouse",
  //                 "keyboard",
  //                 "headphone",
  //                 "earbuds",
  //                 "bag",
  //                 "hdmi",
  //                 "ethernet",
  //                 "router",
  //                 "switch",
  //                 "ssd",
  //                 "ram",
  //               ].some((kw) => pname.includes(kw) || pcat.includes(kw)) &&
  //               !includesAny(pname, excludeWords) &&
  //               !includesAny(pcat, excludeWords)
  //             )
  //           })
  //           .slice(0, MAX_ITEMS)
  //           .forEach(tryAddProduct)
  //       } catch {
  //         // ignore
  //       }
  //     }

  //     setFrequentlyBought(results)
  //     // Pre-select up to 3 accessories plus the current product
  //     const autoSelected = { [product._id]: true }
  //     results.slice(0, 3).forEach((p) => (autoSelected[p._id] = true))
  //     setSelectedBundleItems(autoSelected)
  //   } catch (err) {
  //     setFrequentlyBought([])
  //     setSelectedBundleItems({})
  //   } finally {
  //     setFrequentlyBoughtLoading(false)
  //   }
  // }





  const fetchFrequentlyBought = async () => {
  setFrequentlyBoughtLoading(true);
  try {
    if (!product) {
      setFrequentlyBought([]);
      setSelectedBundleItems({});
      return;
    }

    const productName = (product.name || "").toLowerCase();
    const categoryName = (product.category?.name || "").toLowerCase();
    const brandName = (product.brand?.name || "").toLowerCase();

    console.log("Finding accessories for:", { productName, categoryName, brandName });

    // Enhanced accessory mapping with multiple options for each category
    const ACCESSORY_MAPPING = {
      laptop: [
        // First combination set
        [
          {
            category: "mouse",
            searches: ["wireless mouse", "bluetooth mouse", "gaming mouse"],
            keywords: ["mouse", "wireless", "bluetooth"],
            exclude: ["laptop", "desktop", "computer", "monitor"],
          },
          {
            category: "laptop bag",
            searches: ["laptop bag", "laptop backpack", "laptop case"],
            keywords: ["bag", "backpack", "case", "sleeve"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Second combination set
        [
          {
            category: "keyboard",
            searches: ["wireless keyboard", "bluetooth keyboard"],
            keywords: ["keyboard", "wireless", "bluetooth"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "headphones",
            searches: ["wireless headphones", "bluetooth headset"],
            keywords: ["headphone", "headset", "wireless"],
            exclude: ["laptop", "desktop", "monitor", "phone"],
          }
        ],
        // Third combination set
        [
          {
            category: "laptop stand",
            searches: ["laptop stand", "laptop cooler"],
            keywords: ["stand", "cooler", "cooling", "pad"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "usb hub",
            searches: ["usb hub", "type c hub", "docking station"],
            keywords: ["hub", "adapter", "docking", "usb"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Fourth combination set
        [
          {
            category: "mouse",
            searches: ["wireless mouse", "gaming mouse"],
            keywords: ["mouse", "wireless", "gaming"],
            exclude: ["laptop", "desktop", "computer", "monitor"],
          },
          {
            category: "usb hub",
            searches: ["usb hub", "type c hub"],
            keywords: ["hub", "adapter", "usb"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ]
      ],

      printer: [
        // First combination set
        [
          {
            category: "cables",
            searches: ["usb cable", "printer cable", "usb type b cable"],
            keywords: ["cable", "usb", "printer"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "ink",
            searches: ["printer ink", "ink cartridge"],
            keywords: ["ink", "cartridge", "toner"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Second combination set
        [
          {
            category: "router",
            searches: ["wifi router", "wireless router"],
            keywords: ["router", "wifi", "wireless"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "paper",
            searches: ["a4 paper", "photo paper"],
            keywords: ["paper", "a4", "photo"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Third combination set
        [
          {
            category: "switch",
            searches: ["network switch", "ethernet switch"],
            keywords: ["switch", "network", "ethernet"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "cables",
            searches: ["power cable", "extension cord"],
            keywords: ["cable", "power", "extension"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ]
      ],

      lcd: [
        // First combination set
        [
          {
            category: "hdmi cable",
            searches: ["hdmi cable", "hdmi to hdmi"],
            keywords: ["hdmi", "cable"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "keyboard",
            searches: ["wired keyboard", "usb keyboard"],
            keywords: ["keyboard", "wired", "usb"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Second combination set
        [
          {
            category: "vga cable",
            searches: ["vga cable", "vga to vga"],
            keywords: ["vga", "cable"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "mouse",
            searches: ["wired mouse", "usb mouse"],
            keywords: ["mouse", "wired", "usb"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Third combination set
        [
          {
            category: "network cable",
            searches: ["ethernet cable", "lan cable"],
            keywords: ["ethernet", "lan", "cable"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "monitor stand",
            searches: ["monitor stand", "vesa mount"],
            keywords: ["stand", "mount", "vesa"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ]
      ],

      desktop: [
        // First combination set
        [
          {
            category: "keyboard",
            searches: ["gaming keyboard", "mechanical keyboard"],
            keywords: ["keyboard", "gaming", "mechanical"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "mouse",
            searches: ["gaming mouse", "optical mouse"],
            keywords: ["mouse", "gaming", "optical"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Second combination set
        [
          {
            category: "ram",
            searches: ["ddr4 ram", "desktop ram"],
            keywords: ["ram", "ddr4", "memory"],
            exclude: ["laptop", "monitor"],
          },
          {
            category: "ssd",
            searches: ["ssd", "solid state drive"],
            keywords: ["ssd", "solid state", "nvme"],
            exclude: ["laptop", "monitor"],
          }
        ],
        // Third combination set
        [
          {
            category: "monitor",
            searches: ["led monitor", "computer monitor"],
            keywords: ["monitor", "led", "display"],
            exclude: ["laptop", "desktop", "computer"],
          },
          {
            category: "hdmi cable",
            searches: ["hdmi cable", "hdmi 2.0"],
            keywords: ["hdmi", "cable"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Fourth combination set
        [
          {
            category: "hard disk",
            searches: ["hard disk", "internal hdd"],
            keywords: ["hard disk", "hdd", "internal"],
            exclude: ["laptop", "monitor", "external"],
          },
          {
            category: "network cable",
            searches: ["ethernet cable", "lan cable"],
            keywords: ["ethernet", "lan", "cable"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ]
      ]
    };

    // Determine product type
    const getProductType = () => {
      if (productName.includes('laptop') || categoryName.includes('laptop')) {
        return 'laptop';
      } else if (productName.includes('printer') || categoryName.includes('printer')) {
        return 'printer';
      } else if (productName.includes('lcd') || productName.includes('led') || 
                 productName.includes('monitor') || categoryName.includes('monitor')) {
        return 'lcd';
      } else if (productName.includes('desktop') || categoryName.includes('desktop') ||
                 productName.includes('computer') && !productName.includes('laptop')) {
        return 'desktop';
      }
      return 'laptop';
    };

    const productType = getProductType();
    console.log(`Detected product type: ${productType}`);

    const complementaryProducts = [];
    const seenProductIds = new Set([product._id]);

    // Get all combination sets for this product type
    const combinationSets = ACCESSORY_MAPPING[productType] || ACCESSORY_MAPPING.laptop;
    
    // Rotate through different combinations (you can use timestamp, random, or store in state)
    const rotationIndex = Math.floor(Date.now() / 60000) % combinationSets.length; // Changes every minute
    // Alternative: const rotationIndex = Math.floor(Math.random() * combinationSets.length);
    
    const selectedCombination = combinationSets[rotationIndex];
    console.log(`Using combination set ${rotationIndex + 1} of ${combinationSets.length}`);

    // Find products for the selected combination
    for (const accessory of selectedCombination) {
      if (complementaryProducts.length >= 2) break;

      for (const searchTerm of accessory.searches) {
        if (complementaryProducts.length >= 2) break;

        try {
          const response = await axios.get(
            `${config.API_URL}/api/products?search=${encodeURIComponent(searchTerm)}&limit=8`
          );

          // Find the most relevant product from this search
          const relevantProduct = response.data.find(p => {
            if (!p || seenProductIds.has(p._id)) return false;
            
            const pName = (p.name || "").toLowerCase();
            const pCategory = (p.category?.name || "").toLowerCase();
            
            // Must match at least one keyword
            const matchesKeywords = accessory.keywords.some(keyword => 
              pName.includes(keyword) || pCategory.includes(keyword)
            );
            
            // Must NOT contain any excluded words
            const isExcluded = accessory.exclude.some(excludeWord =>
              pName.includes(excludeWord) || pCategory.includes(excludeWord)
            );

            const isRelevantPrice = p.price > 0 && p.price < 2000;

            return matchesKeywords && !isExcluded && isRelevantPrice;
          });

          if (relevantProduct) {
            complementaryProducts.push({
              ...relevantProduct,
              accessoryType: accessory.category
            });
            seenProductIds.add(relevantProduct._id);
            console.log(`Found ${accessory.category}: ${relevantProduct.name}`);
            break;
          }
        } catch (error) {
          console.log(`Search failed for: ${searchTerm}`, error);
        }
      }
    }

    // If we couldn't find both items from the selected combination, try other combinations
    if (complementaryProducts.length < 2) {
      console.log("Trying alternative combinations...");
      
      for (let i = 0; i < combinationSets.length && complementaryProducts.length < 2; i++) {
        if (i === rotationIndex) continue; // Skip the already tried combination
        
        const altCombination = combinationSets[i];
        
        for (const accessory of altCombination) {
          if (complementaryProducts.length >= 2) break;

          for (const searchTerm of accessory.searches) {
            if (complementaryProducts.length >= 2) break;

            try {
              const response = await axios.get(
                `${config.API_URL}/api/products?search=${encodeURIComponent(searchTerm)}&limit=8`
              );

              const relevantProduct = response.data.find(p => {
                if (!p || seenProductIds.has(p._id)) return false;
                
                const pName = (p.name || "").toLowerCase();
                const pCategory = (p.category?.name || "").toLowerCase();
                
                const matchesKeywords = accessory.keywords.some(keyword => 
                  pName.includes(keyword) || pCategory.includes(keyword)
                );
                
                const isExcluded = accessory.exclude.some(excludeWord =>
                  pName.includes(excludeWord) || pCategory.includes(excludeWord)
                );

                const isRelevantPrice = p.price > 0 && p.price < 2000;

                return matchesKeywords && !isExcluded && isRelevantPrice;
              });

              if (relevantProduct) {
                complementaryProducts.push({
                  ...relevantProduct,
                  accessoryType: accessory.category
                });
                seenProductIds.add(relevantProduct._id);
                console.log(`Found alternative ${accessory.category}: ${relevantProduct.name}`);
                break;
              }
            } catch (error) {
              console.log(`Alternative search failed for: ${searchTerm}`, error);
            }
          }
        }
      }
    }

    console.log("Final frequently bought together (1+2):", [
      { name: product.name, type: 'main' },
      ...complementaryProducts.map(p => ({
        name: p.name,
        accessoryType: p.accessoryType,
        price: p.price
      }))
    ]);

    if (isArabic && complementaryProducts.length > 0) {
      const bundleTexts = Array.from(
        new Set(
          complementaryProducts
            .flatMap((item) => [item?.name, item?.brand?.name, item?.category?.name])
            .filter((value) => isWorthTranslating(value))
            .map((value) => value.trim())
        )
      )
      if (bundleTexts.length > 0) {
        await preloadTranslations(bundleTexts, "ar")
      }
    }

    setFrequentlyBought(complementaryProducts);

    // Auto-select current product + found accessories
    const autoSelectedItems = {
      [product._id]: true,
    };

    complementaryProducts.forEach(item => {
      autoSelectedItems[item._id] = true;
    });

    setSelectedBundleItems(autoSelectedItems);

  } catch (error) {
    console.error("Error fetching frequently bought products:", error);
    setFrequentlyBought([]);
  } finally {
    setFrequentlyBoughtLoading(false);
  }
};






































































































  const handleAddBundleToCart = async () => {
    console.log("=== Add Bundle to Cart Started ===")
    console.log("Selected bundle items:", selectedBundleItems)

    const selectedItems = []
    const bundleId = `bundle_${product._id}_${Date.now()}`

    // Add current product if selected (no discount)
    if (selectedBundleItems[product._id]) {
      selectedItems.push({
        ...product,
        bundleId,
        isBundleItem: false,
        bundleDiscount: false,
      })
    }

    // Add selected bundle items with 25% discount
    frequentlyBought.forEach((item) => {
      if (selectedBundleItems[item._id]) {
        const originalPrice = item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price
        const discountedPrice = calculateDiscountedPrice(originalPrice, 25)

        selectedItems.push({
          ...item,
          price: discountedPrice,
          originalPrice: originalPrice,
          bundleId,
          isBundleItem: true,
          bundleDiscount: true,
          bundlePrice: discountedPrice,
        })
      }
    })

    if (selectedItems.length === 0) {
      showToast("No items selected", "error")
      return
    }

    try {
      for (const item of selectedItems) {
        addToCart(item, 1, bundleId)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      showToast(`${selectedItems.length} items added to cart with bundle discount!`, "success")
    } catch (error) {
      console.error("Error adding bundle to cart:", error)
      showToast("Failed to add items to cart", "error")
    }
  }

  const handleCallbackSubmit = async (e) => {
    e.preventDefault()
    
    // Check if email verification is needed and completed
    if (emailChanged && !verificationVerified) {
      showToast("Please verify your email address", "error")
      return
    }
    
    setCallbackLoading(true)

    try {
      // Get product link
      const productLink = `${window.location.origin}/product/${product.slug || product._id}`
      
      // Extract country code from phone number (e.g., "+971501234567" -> "+971")
      const countryCode = phoneValue ? phoneValue.split(/\d/)[0] : ""
      
      await axios.post(`${config.API_URL}/api/request-callback`, {
        name: callbackForm.name,
        email: callbackForm.email,
        phone: phoneValue,
        countryCode: countryCode,
        customerNote: callbackForm.customerNote,
        productId: product._id,
        productName: product.name,
        productLink: productLink,
      })
      setCallbackSuccess(true)
      setTimeout(() => {
        setShowCallbackModal(false)
        setCallbackSuccess(false)
        setCallbackForm({ 
          name: user?.name || "", 
          email: user?.email || "", 
          phone: "",
          customerNote: ""
        })
        setPhoneValue("")
        setEmailChanged(false)
        setVerificationCode("")
        setVerificationSent(false)
        setVerificationVerified(false)
      }, 2000)
    } catch (error) {
      console.error("Error submitting callback request:", error)
      showToast("Failed to submit callback request", "error")
    } finally {
      setCallbackLoading(false)
    }
  }

  const handleCallbackChange = (e) => {
    const { name, value } = e.target
    
    // Check if email is being changed
    if (name === 'email') {
      // Get the logged-in user's email (if logged in)
      const loggedInEmail = user?.email || ""
      
      // If user is logged in
      if (loggedInEmail !== "") {
        // Compare entered email with logged-in user's email ONLY
        if (value.trim().toLowerCase() === loggedInEmail.trim().toLowerCase()) {
          // Email matches logged-in email - no verification needed
          setEmailChanged(false)
          setVerificationVerified(true)
          setVerificationSent(false)
          setVerificationCode("")
        } else {
          // Email is different from logged-in email - verification required
          setEmailChanged(true)
          setVerificationVerified(false)
          setVerificationSent(false)
          setVerificationCode("")
        }
      } else {
        // User is NOT logged in - verification required for any email
        if (value.trim() !== "") {
          setEmailChanged(true)
          setVerificationVerified(false)
          setVerificationSent(false)
          setVerificationCode("")
        } else {
          setEmailChanged(false)
          setVerificationVerified(false)
        }
      }
    }
    
    setCallbackForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  
  const handleSendVerificationCode = async () => {
    setVerificationLoading(true)
    try {
      await axios.post(`${config.API_URL}/api/request-callback/send-verification`, {
        email: callbackForm.email
      })
      setVerificationSent(true)
      showToast("Verification code sent to your email", "success")
    } catch (error) {
      console.error("Error sending verification code:", error)
      showToast("Failed to send verification code", "error")
    } finally {
      setVerificationLoading(false)
    }
  }
  
  const handleVerifyCode = async () => {
    setVerificationLoading(true)
    try {
      await axios.post(`${config.API_URL}/api/request-callback/verify-code`, {
        email: callbackForm.email,
        code: verificationCode
      })
      setVerificationVerified(true)
      showToast("Email verified successfully", "success")
    } catch (error) {
      console.error("Error verifying code:", error)
      showToast(error.response?.data?.message || "Invalid verification code", "error")
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleOpenCouponsModal = async () => {
    setShowCouponsModal(true)
    setLoadingCoupons(true)
    setCouponError(null)

    try {
      const response = await axios.get(`${config.API_URL}/api/coupons`)
      setPublicCoupons(response.data)
    } catch (error) {
      console.error("Error fetching coupons:", error)
      setCouponError("Failed to load coupons")
    } finally {
      setLoadingCoupons(false)
    }
  }

  const handleCloseCouponsModal = () => {
    setShowCouponsModal(false)
    setPublicCoupons([])
    setCouponCopied(null)
  }

  const handleCopyCoupon = async (code, couponId) => {
    try {
      await navigator.clipboard.writeText(code)
      setCouponCopied(couponId)
      showToast("Coupon code copied!", "success")
      setTimeout(() => setCouponCopied(null), 2000)
    } catch (error) {
      console.error("Failed to copy coupon:", error)
      showToast("Failed to copy coupon code", "error")
    }
  }

  // Helper function for shuffling array
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Add coupon colors constant
  const COUPON_COLORS = [
    {
      main: "bg-gradient-to-r from-yellow-100 to-yellow-200",
      stub: "bg-yellow-300",
      border: "border-yellow-400",
      text: "text-yellow-800",
      barcode: "bg-yellow-200",
    },
    {
      main: "bg-gradient-to-r from-blue-100 to-blue-200",
      stub: "bg-blue-300",
      border: "border-blue-400",
      text: "text-blue-800",
      barcode: "bg-blue-200",
    },
    {
      main: "bg-gradient-to-r from-green-100 to-green-200",
      stub: "bg-green-300",
      border: "border-green-400",
      text: "text-green-800",
      barcode: "bg-green-200",
    },
    {
      main: "bg-gradient-to-r from-purple-100 to-purple-200",
      stub: "bg-purple-300",
      border: "border-purple-400",
      text: "text-purple-800",
      barcode: "bg-purple-200",
    },
  ]

  console.log("Render: loading =", loading, ", product =", product, ", error =", error)

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#505e4d]/25 border-t-[#505e4d]" aria-label="Loading product details" />
        <p className="text-sm text-[#505e4d]/80">Loading product details...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || "Product not found"}</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    )
  }

  // SEO: Use custom SEO fields if provided, otherwise fall back to auto-generated values
  const pdTitle = product.seoTitle || `${product.name} — Grabatoz`
  const pdDescription =
    product.seoDescription ||
    (product.shortDescription &&
      String(product.shortDescription)
        .replace(/<[^>]+>/g, "")
        .slice(0, 160)) ||
    (product.description &&
      String(product.description)
        .replace(/<[^>]+>/g, "")
        .slice(0, 160)) ||
    `${product.name} available at Grabatoz.`

  const pdCanonicalPath = product.seoCanonicalUrl || getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)
  const pdKeywords = product.seoKeywords || (product.tags && product.tags.length > 0 ? product.tags.join(", ") : undefined)
  const pdRobots = product.seoRobots || "index, follow"
  const pdOgTitle = product.ogTitle || pdTitle
  const pdOgDescription = product.ogDescription || pdDescription
  const pdOgImage = product.ogImage || product.image
  const hasShortDescription = typeof product.shortDescription === "string" && product.shortDescription.trim().length > 0
  const hasDescription = typeof product.description === "string" && product.description.trim().length > 0
  const keyFeaturesContent = hasShortDescription ? product.shortDescription : hasDescription ? product.description : ""
  const keyFeaturesFieldName = hasShortDescription ? "shortDescription" : "description"

  const productImages = getCurrentImages()

  // Helper function to get stock badge
  const getStockBadge = () => {
    const baseClass = "inline-flex items-center text-xs font-semibold uppercase tracking-wide text-[#505e4d]";
    
    // Use the stockStatusAr if available, otherwise fallback to TranslatedText dictionary
    const StockLabel = (
      <TranslatedText 
        text={product.stockStatus} 
        sourceDoc={product} 
        fieldName="stockStatus"
      >
        {product.stockStatus === "PreOrder" ? "Pre-order" : product.stockStatus}
      </TranslatedText>
    );

    switch (product.stockStatus) {
      case "In Stock":
        return (
          <span className={baseClass}>{StockLabel}</span>
        );
      case "Out of Stock":
        return (
          <span className={baseClass + " opacity-80"}>{StockLabel}</span>
        );
      case "PreOrder":
        return (
          <span className={baseClass + " opacity-90"}>{StockLabel}</span>
        );
      default:
        return null;
    }
  } // end getStockBadge

  // Helper function to get discount badge
  const getDiscountBadge = () => {
    const basePrice = Number(product.price) || 0;
    const offerPrice = Number(product.offerPrice) || 0;
    const hasValidOffer = offerPrice > 0 && basePrice > 0 && offerPrice < basePrice;
    // Unified badge style for discount
    const badgeClass = "inline-flex items-center text-xs font-semibold uppercase tracking-wide text-[#505e4d]";
    if (hasValidOffer) {
      const discountPercentage = Math.round(((basePrice - offerPrice) / basePrice) * 100);
      return (
        <span className={badgeClass}>
          -{discountPercentage}%
        </span>
      );
    } else if (product.discount > 0) {
      // Fallback if only discount percentage is provided
      return (
        <span className={badgeClass}>
          -{product.discount}%
        </span>
      );
    }
    return null;
  } // end getDiscountBadge

  return (
    <div className="min-h-screen bg-[#f4f6f3]">
      <SEO 
        title={pdTitle} 
        description={pdDescription} 
        canonicalPath={pdCanonicalPath} 
        image={pdOgImage} 
        keywords={pdKeywords}
        noindex={pdRobots.includes("noindex")}
        ogTitle={pdOgTitle}
        ogDescription={pdOgDescription}
        customSchema={product.customSchema}
      />
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center space-x-2 overflow-x-auto rounded-xl border border-[#d7ddd4] bg-white px-3 py-3 text-sm text-slate-600 shadow-[0_6px_20px_rgba(80,94,77,0.08)]">
          <Link to={getLocalizedPath("/")} className="whitespace-nowrap transition-colors hover:text-[#505e4d]">
            <TranslatedText>Home</TranslatedText>
          </Link>
          <span>/</span>
          <Link to={getLocalizedPath("/shop")} className="whitespace-nowrap transition-colors hover:text-[#505e4d]">
            <TranslatedText>Shop</TranslatedText>
          </Link>
          
          {/* Parent Category */}
          {product.parentCategory && (
            <>
              <span>/</span>
              <Link
                to={`/shop?parentCategory=${product.parentCategory._id}`}
                className="whitespace-nowrap transition-colors hover:text-[#505e4d]"
              >
                <TranslatedText text={product.parentCategory.name} sourceDoc={product.parentCategory} fieldName="name" />
              </Link>
            </>
          )}
          
          {/* Subcategory Level 1 */}
          {product.category && (
            <>
              <span>/</span>
              <Link
                to={`/shop?category=${product.category._id}`}
                className="whitespace-nowrap transition-colors hover:text-[#505e4d]"
              >
                <TranslatedText text={product.category.name} sourceDoc={product.category} fieldName="name" />
              </Link>
            </>
          )}
          
          {/* Subcategory Level 2 */}
          {product.subCategory2 && (
            <>
              <span>/</span>
              <Link
                to={`/shop?subcategory=${product.subCategory2._id}`}
                className="whitespace-nowrap transition-colors hover:text-[#505e4d]"
              >
                <TranslatedText text={product.subCategory2.name} sourceDoc={product.subCategory2} fieldName="name" />
              </Link>
            </>
          )}
          
          {/* Subcategory Level 3 */}
          {product.subCategory3 && (
            <>
              <span>/</span>
              <Link
                to={`/shop?subcategory=${product.subCategory3._id}`}
                className="whitespace-nowrap transition-colors hover:text-[#505e4d]"
              >
                <TranslatedText text={product.subCategory3.name} sourceDoc={product.subCategory3} fieldName="name" />
              </Link>
            </>
          )}
          
          {/* Subcategory Level 4 */}
          {product.subCategory4 && (
            <>
              <span>/</span>
              <Link
                to={`/shop?subcategory=${product.subCategory4._id}`}
                className="whitespace-nowrap transition-colors hover:text-[#505e4d]"
              >
                <TranslatedText text={product.subCategory4.name} sourceDoc={product.subCategory4} fieldName="name" />
              </Link>
            </>
          )}
          
          <span>/</span>
          <span className="block max-w-[120px] truncate whitespace-nowrap font-semibold text-slate-900 sm:max-w-none">
            <TranslatedText text={product.name} sourceDoc={product} fieldName="name" />
          </span>
        </nav>

        {/* Product Images and Info Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 xl:gap-7">
          {/* Product Images - Left Side */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-[#d7ddd4] bg-white p-4 shadow-[0_8px_26px_rgba(80,94,77,0.08)] md:p-5">
              {/* Main Image/Video */}
              <div className="group relative mb-4 overflow-hidden rounded-2xl border border-[#d7ddd4] bg-[#f2f4f1] p-4">
                {productImages[selectedImage]?.type === 'video' ? (
                  isYouTubeUrl(productImages[selectedImage]?.url) ? (
                    <iframe
                      key={selectedImage}
                      src={getYouTubeEmbedUrl(productImages[selectedImage]?.url)}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-[420px] w-full"
                    ></iframe>
                  ) : (
                    <video
                      key={selectedImage}
                      src={getFullImageUrl(productImages[selectedImage]?.url) || ""}
                      controls
                      autoPlay
                      className="h-[420px] w-full object-contain"
                      poster={getFullImageUrl(product.image)}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )
                ) : (
                  <img
                    src={getFullImageUrl(productImages[selectedImage]?.url) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='480'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='18' font-family='Arial' fill='%2364748b'%3ENo Image Available%3C/text%3E%3C/svg%3E"}
                    alt={product.name}
                    className="h-[420px] w-full cursor-pointer object-contain transition-transform duration-500 hover:scale-105"
                    onClick={() => handleImageClick(selectedImage)}
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='480'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='18' font-family='Arial' fill='%2364748b'%3ENo Image Available%3C/text%3E%3C/svg%3E"
                    }}
                  />
                )}

                <div className="absolute right-4 top-4 rounded-full bg-black/55 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <ZoomIn size={16} />
                </div>

                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : productImages.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[#505e4d]/90 p-2 text-white opacity-0 transition-all hover:bg-[#465342] group-hover:opacity-100"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setSelectedImage((selectedImage + 1) % productImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#505e4d]/90 p-2 text-white opacity-0 transition-all hover:bg-[#465342] group-hover:opacity-100"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>


          












          
          

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="relative w-full rounded-xl border border-[#d7ddd4] bg-[#f8faf7] p-2">
                  {/* Left Arrow */}
                  {thumbScroll > 0 && (
                    <button
                      className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#505e4d] p-1 text-white transition hover:bg-[#465342]"
                      onClick={() => {
                        if (thumbnailRowRef.current) {
                          thumbnailRowRef.current.scrollBy({ left: -100, behavior: "smooth" })
                        }
                      }}
                    >
                      <ChevronLeft size={20} className="text-white" />
                    </button>
                  )}
                  {/* Thumbnails Row */}
                  <div
                    ref={thumbnailRowRef}
                    className="hide-scrollbar flex w-full space-x-2 overflow-x-auto"
                    onScroll={(e) => setThumbScroll(e.target.scrollLeft)}
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {productImages.map((media, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border transition-all ${
                          selectedImage === index
                            ? "border-[#505e4d]"
                            : "border-[#c9d1c4] hover:border-[#95a08f]"
                        }`}
                      >
                        {media?.type === 'video' ? (
                          <>
                            {isYouTubeUrl(media.url) ? (
                              <img
                                src={`https://img.youtube.com/vi/${media.url.includes('youtu.be/') 
                                  ? media.url.split('youtu.be/')[1]?.split('?')[0] 
                                  : media.url.split('v=')[1]?.split('&')[0]}/mqdefault.jpg`}
                                alt="YouTube video thumbnail"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={getFullImageUrl(media.url)}
                                className="w-full h-full object-contain"
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </>
                        ) : (
                          <img
                            src={getFullImageUrl(media?.url) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12' font-family='Arial' fill='%2364748b'%3ENo Image%3C/text%3E%3C/svg%3E"}
                            alt={`${product.name} - view ${index + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12' font-family='Arial' fill='%2364748b'%3ENo Image%3C/text%3E%3C/svg%3E"
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Right Arrow */}
                  {thumbnailRowRef.current &&
                    thumbnailRowRef.current.scrollLeft + thumbnailRowRef.current.offsetWidth <
                      thumbnailRowRef.current.scrollWidth && (
                      <button
                        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#505e4d] p-1 text-white transition hover:bg-[#465342]"
                        onClick={() => {
                          if (thumbnailRowRef.current) {
                            thumbnailRowRef.current.scrollBy({ left: 100, behavior: "smooth" })
                          }
                        }}
                      >
                        <ChevronRight size={20} className="text-white" />
                      </button>
                    )}
                  <style>{`
                    .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                  `}</style>
                </div>
              )}
            </div>



            {/* Product Video Section - Only show if product has video */}
              {product?.video && (
                <div 
                  className="mt-8 cursor-pointer group rounded-2xl border border-[#d7ddd4] bg-white p-3"
                  onClick={() => setShowVideoModal(true)}
                >
                  <div className="flex items-center justify-between border-b border-[#d7ddd4] px-0 pb-2">
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#505e4d]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      Product Video
                    </h4>
                    <span className="text-xs text-gray-500 group-hover:text-[#505e4d]">Click to expand</span>
                  </div>
                  <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black">
                    {isYouTubeUrl(product.video) ? (
                      <iframe
                        src={`${getYouTubeEmbedUrl(product.video)}?autoplay=1&mute=1`}
                        title="Product Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full pointer-events-none"
                      ></iframe>
                    ) : (
                      <video
                        src={getFullImageUrl(product.video)}
                        autoPlay
                        muted
                        loop
                        className="w-full h-full object-contain pointer-events-none"
                        poster={getFullImageUrl(product.image)}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {/* Overlay for click */}
                    <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                      <div className="rounded-full bg-white/90 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}





          </div>
          

          {/* Product Info - Middle */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#d7ddd4] bg-white p-4 shadow-[0_8px_26px_rgba(80,94,77,0.08)] md:p-6">
              {/* Status Badges */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2">
                  {getStockBadge()}
                  {getDiscountBadge()}
                </div>
              </div>
              <h1 className="mb-2 text-xl font-bold leading-tight text-slate-900 md:text-2xl">
                <TranslatedText text={product.name} sourceDoc={product} fieldName="name" />
              </h1>

              {/* Brand and Category */}
              <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-600">
                <span>
                  <TranslatedText>Brand</TranslatedText>:{" "}
                  <span className="font-semibold text-[#505e4d]">
                    <TranslatedText 
                      text={product.brand?.name || product.brand || "N/A"} 
                      sourceDoc={product.brand} 
                      fieldName="name" 
                    />
                  </span>
                </span>
                <span>
                  <TranslatedText>Category</TranslatedText>:{" "}
                  <span className="font-semibold text-[#505e4d]">
                    <TranslatedText 
                      text={product.category?.name || product.category || "N/A"} 
                      sourceDoc={product.category} 
                      fieldName="name" 
                    />
                  </span>
                </span>
                <span>
                  <TranslatedText>SKU</TranslatedText>: <span className="font-semibold text-[#505e4d]">{product.sku || "N/A"}</span>
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div
                  ref={ratingDropdownRef}
                  className={`flex items-center relative ${isMobile ? "cursor-pointer" : ""}`}
                  onMouseEnter={() => !isMobile && setShowRatingDropdown(true)}
                  onMouseLeave={() => !isMobile && setShowRatingDropdown(false)}
                  onClick={handleRatingInteraction}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className={`${
                        i < Math.floor(reviewStats.averageRating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      } cursor-pointer  hover:scale-110 transition-transform duration-200`}
                      onClick={(e) => {
                        e.stopPropagation() // Prevent triggering the parent div's onClick
                        scrollToReviewSection()
                      }}
                    />
                  ))}

                  {/* Rating Breakdown Dropdown */}
                  {showRatingDropdown && (
                    <div className="absolute top-full left-0 z-50 mt-2 min-w-[200px] rounded-lg border border-[#d7ddd4] bg-white p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Rating Breakdown</div>
                      {(() => {
                        const distribution = getRatingDistribution()
                        return [5, 4, 3, 2, 1].map((rating) => (
                          <div
                            key={rating}
                            className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 rounded px-2 transition-colors"
                            onClick={() => handleStarRatingClick(rating)}
                          >
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-700">({distribution[rating] || 0})</span>
                          </div>
                        ))
                      })()}
                      {isMobile && <div className="text-xs text-gray-500 mt-2 border-t pt-2">Tap outside to close</div>}
                    </div>
                  )}
                </div>
                <span
                  className="cursor-pointer text-sm text-slate-600 transition-colors hover:text-[#505e4d]"
                  onClick={scrollToReviewSection}
                >
                  ({reviewStats.totalReviews || 0} {reviewStats.totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                {(() => {
                  const currentColor = getCurrentColor()
                  let basePrice = 0
                  let offerPrice = 0
                  
                  if (currentColor) {
                    basePrice = Number(currentColor.price) || 0
                    offerPrice = Number(currentColor.offerPrice) || 0
                  } else {
                    basePrice = Number(product.price) || 0
                    offerPrice = Number(product.offerPrice) || 0
                  }
                  
                  const hasValidOffer = offerPrice > 0 && basePrice > 0 && offerPrice < basePrice
                  const priceToShow = getEffectivePrice()
                  const discount = hasValidOffer ? Math.round(((basePrice - offerPrice) / basePrice) * 100) : 0

                  return (
                    <>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-3xl font-bold text-slate-900">{formatPrice(priceToShow)}</div>
                        {hasValidOffer && (
                          <div className="text-lg font-medium text-slate-400 line-through">{formatPrice(basePrice)}</div>
                        )}
                      </div>
                      <div className="text-sm text-slate-600"><TranslatedText>Including VAT</TranslatedText></div>
                      {hasValidOffer && (
                        <div className="text-base font-semibold text-[#505e4d]">
                          <TranslatedText>You Save</TranslatedText> {formatPrice(basePrice - priceToShow)}
                          {discount > 0 && ` (${discount}%)`}
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {(() => {
                  const stockText =
                    product.stockStatus === "In Stock"
                      ? <TranslatedText sourceDoc={product} fieldName="stockStatus">Available in stock</TranslatedText>
                      : product.stockStatus === "Out of Stock"
                        ? <TranslatedText sourceDoc={product} fieldName="stockStatus">Currently out of stock</TranslatedText>
                        : product.stockStatus === "PreOrder"
                          ? <TranslatedText sourceDoc={product} fieldName="stockStatus">Available for pre-order</TranslatedText>
                          : <TranslatedText sourceDoc={product} fieldName="stockStatus">Stock status updates at checkout</TranslatedText>

                  return (
                    <div
                      className="text-sm font-medium text-[#505e4d]"
                    >
                      {stockText}
                    </div>
                  )
                })()}
              </div>

          

              {/* Color Variations */}
              {product.colorVariations && product.colorVariations.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 flex items-center font-bold text-slate-900">
                    <span className="mr-2 text-[#505e4d]"></span>
                    <TranslatedText>Color</TranslatedText>: {selectedColorIndex !== null && product.colorVariations[selectedColorIndex]?.color ? <TranslatedText text={product.colorVariations[selectedColorIndex].color}>{product.colorVariations[selectedColorIndex].color}</TranslatedText> : <TranslatedText>Select Color</TranslatedText>}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {product.colorVariations
                      .filter(colorVar => colorVar.color)
                      .map((colorVar, index) => {
                        const isSelected = index === selectedColorIndex
                        const colorPrice = colorVar.offerPrice > 0 ? colorVar.offerPrice : colorVar.price
                        
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              // Toggle: if already selected, deselect to show original product
                              setSelectedColorIndex(isSelected ? null : index)
                              setSelectedImage(0)
                            }}
                            className={`relative rounded-lg border px-3 py-3 transition-colors ${
                              isSelected 
                                ? 'border-[#505e4d] bg-[#edf1eb]' 
                                : 'border-[#d4dbd0] hover:border-[#95a08f]'
                            }`}
                          >
                            {/* Product Image */}
                            <div className="aspect-square mb-2 bg-white rounded-md overflow-hidden">
                              <img
                                src={getFullImageUrl(colorVar.image) || "/placeholder.svg"}
                                alt={colorVar.color}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            
                            {/* Color Name */}
                            <p className={`mb-1 text-center text-xs font-semibold ${
                              isSelected ? 'text-[#505e4d]' : 'text-slate-700'
                            }`}>
                              {colorVar.color}
                            </p>
                            
                            {/* Price */}
                            <p className="text-sm font-bold text-center text-gray-900">
                              {formatPrice(colorPrice)}
                            </p>
                            
                            {/* Current Selection Indicator */}
                            {isSelected && (
                              <div className="absolute right-1 top-1 rounded-full bg-[#505e4d] p-1 text-white">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            
                            {/* Stock Badge */}
                            {colorVar.countInStock <= 0 && (
                              <div className="absolute bottom-2 left-2 right-2 rounded bg-[#edf1eb] px-2 py-1 text-center text-xs text-[#505e4d]">
                                Out of Stock
                              </div>
                            )}
                          </button>
                        )
                      })}
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Select a color to view its image and price
                  </p>
                </div>
              )}

              {/* DOS/Windows Variations */}
              {product.dosVariations && product.dosVariations.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <span className="text-[#505e4d] mr-2">OS</span>
                    Windows: {selectedDosIndex !== null && product.dosVariations[selectedDosIndex]?.dosType ? product.dosVariations[selectedDosIndex].dosType : "Select Option"}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {product.dosVariations
                      .filter(dosVar => dosVar.dosType)
                      .map((dosVar, index) => {
                        const isSelected = index === selectedDosIndex
                        const dosPrice = dosVar.offerPrice > 0 ? dosVar.offerPrice : dosVar.price
                        
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              // Toggle: if already selected, deselect to show original product
                              setSelectedDosIndex(isSelected ? null : index)
                              setSelectedImage(0)
                            }}
                            className={`relative rounded-lg border px-3 py-3 transition-colors ${
                              isSelected 
                                ? 'border-[#505e4d] bg-[#edf1eb]' 
                                : 'border-[#d4dbd0] hover:border-[#95a08f]'
                            }`}
                          >
                            {/* Product Image */}
                           
                            
                            {/* OS Type Name */}
                            <p className={`mb-1 text-center text-xs font-semibold ${
                              isSelected ? 'text-[#505e4d]' : 'text-slate-700'
                            }`}>
                              {dosVar.dosType}
                            </p>
                            
                            {/* Price */}
                            <p className="text-sm font-bold text-center text-gray-900">
                              {formatPrice(dosPrice)}
                            </p>
                            
                            {/* Current Selection Indicator */}
                            {isSelected && (
                              <div className="absolute right-1 top-1 rounded-full bg-[#505e4d] p-1 text-white">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            
                            {/* Stock Badge */}
                            {dosVar.countInStock <= 0 && (
                              <div className="absolute bottom-2 left-2 right-2 rounded bg-[#edf1eb] px-2 py-1 text-center text-xs text-[#505e4d]">
                                Out of Stock
                              </div>
                            )}
                          </button>
                        )
                      })}
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Select an OS option to view its image and price
                  </p>
                </div>
              )}

              {/* Product Variations */}
              {product.variations && product.variations.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <span className="text-[#505e4d] mr-2"></span>
                   <TranslatedText>Available Options</TranslatedText>:
                  </h3>
                  <div className="flex flex-wrap gap-3 ">
                    {/* Combine current product and all variations, then sort alphabetically */}
                    {(() => {
                      // Build array of all variations including current product
                      const allVariations = []
                      
                      // Add current product if it has selfVariationText (or fallback to reverseVariationText)
                      const currentProductText = product.selfVariationText || product.reverseVariationText
                      if (currentProductText) {
                        allVariations.push({
                          id: product._id,
                          text: currentProductText,
                          slug: product.slug,
                          isCurrent: true
                        })
                      }
                      
                      // Add other variations - use their selfVariationText, fallback to variationText
                      product.variations
                        .filter(variation => {
                          const varProduct = variation.product
                          if (!varProduct) return false
                          // Get the text: prefer selfVariationText from the product, fallback to variationText
                          const varText = (typeof varProduct === 'object' && (varProduct.selfVariationText || varProduct.reverseVariationText)) 
                            || variation.variationText 
                            || ""
                          return varText.trim() !== ""
                        })
                        .forEach(variation => {
                          const varProduct = variation.product
                          const varId = typeof varProduct === 'object' ? varProduct._id : varProduct
                          const varSlug = typeof varProduct === 'object' ? varProduct.slug : null
                          // Get the text: prefer selfVariationText from the product, fallback to variationText
                          const varText = (typeof varProduct === 'object' && (varProduct.selfVariationText || varProduct.reverseVariationText)) 
                            || variation.variationText 
                            || ""
                          
                          allVariations.push({
                            id: varId,
                            text: varText,
                            slug: varSlug || varId,
                            isCurrent: false
                          })
                        })
                      
                      // Sort alphabetically by text to maintain consistent order
                      allVariations.sort((a, b) => a.text.localeCompare(b.text))
                      
                      return allVariations.map((variation) => {
                        // Find the original variation object in product.variations to get pre-translated fields
                        const matchingVar = product.variations?.find(v => 
                          (v.product?._id || v.product || "").toString() === (variation.id || "").toString()
                        );

                        return (
                          <div key={variation.id} className="relative">
                            {variation.isCurrent ? (
                              <div className="cursor-default rounded-md border border-[#8d9987] bg-[#edf1eb] px-4 py-2 text-sm font-medium text-[#505e4d]">
                                <TranslatedText 
                                  text={variation.text} 
                                  sourceDoc={product} 
                                  fieldName="selfVariationText" 
                                />
                              </div>
                            ) : (
                              <Link
                                to={getLocalizedPath(`/product/${encodeURIComponent(variation.slug)}`)}
                                className="block rounded-md border border-[#d4dbd0] px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#505e4d] hover:text-[#505e4d]"
                              >
                                <TranslatedText 
                                  text={variation.text} 
                                  sourceDoc={matchingVar} 
                                  fieldName="variationText" 
                                />
                              </Link>
                            )}
                          </div>
                        )
                      })
                    })()}
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    <TranslatedText>Click on any variation to view its details</TranslatedText>
                  </p>
                </div>
              )}


                  {/* Key Features */}
              {keyFeaturesContent && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3"><TranslatedText>Key Features</TranslatedText>:</h3>
                  <div className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed">
                  <TranslatedTipTapRenderer 
                    content={keyFeaturesContent}
                    sourceDoc={product} 
                    fieldName={keyFeaturesFieldName}
                  />
                </div>
                </div>
              )}

              {/* Tabby/Tamara info rows (triggers) */}
            {/* <div className="space-y-3 mb-4"> */}
                {/* Tamara row */}
                {/* <button
                  type="button"
                  onClick={() => setShowTamaraModal(true)}
                  className="w-full text-left hover:opacity-90 transition-opacity"
                >
                  <div className="border rounded-xl p-4 bg-gradient-to-r from-pink-50 to-purple-50 flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10  rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-4xl">💳</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-800 leading-relaxed">
                        <TranslatedText>Pay in 4 simple, interest free payments of</TranslatedText>{" "}
                        <span className="font-bold text-gray-900">{formatPerMonth(getEffectivePrice() / 4)}</span>
                        <br />
                        <span className="text-blue-600 underline font-medium"><TranslatedText>Learn more</TranslatedText></span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 shadow-sm">
                      tamara
                    </span>
                  </div>
                </button> */}

                {/* Tabby row */}
                {/* <button
                  type="button"
                  onClick={() => setShowTabbyModal(true)}
                  className="w-full text-left hover:opacity-90 transition-opacity"
                >
                  <div className="border rounded-xl p-4 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-4xl">💰</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-800 leading-relaxed">
                        <TranslatedText>As low as</TranslatedText>{" "}
                        <span className="font-bold text-gray-900">{formatPerMonth(getEffectivePrice() / 12)}</span> <TranslatedText>or</TranslatedText>{" "}
                        <TranslatedText>4 interest-free payments.</TranslatedText>
                        <br />
                        <span className="text-blue-600 underline font-medium"><TranslatedText>Learn more</TranslatedText></span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-extrabold text-white bg-emerald-600 shadow-sm">
                      tabby
                    </span>
                  </div>
                </button> */}
              {/* </div> */}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr_auto_1fr] sm:items-stretch">
                  <div className="flex items-center rounded-md border border-[#c9d1c4]">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-3 py-2 text-slate-600 transition-colors hover:text-[#505e4d]"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="min-w-[60px] border-x border-[#c9d1c4] px-4 py-2 text-center font-semibold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-2 text-slate-600 transition-colors hover:text-[#505e4d]"
                      disabled={quantity >= (product.maxPurchaseQty || 10)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stockStatus === "Out of Stock"}
                    className="inline-flex h-full items-center justify-center rounded-lg bg-[#505e4d] px-5 py-3 font-semibold text-white whitespace-nowrap transition-colors hover:bg-[#465342] disabled:bg-slate-400"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    <TranslatedText>Add to Cart</TranslatedText>
                  </button>

                  {/* Heart btn */}
                  <button
                    onClick={() =>
                      isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)
                    }
                    className={`inline-flex h-full items-center justify-center rounded-lg border px-4 py-3 transition-colors ${
                      isInWishlist(product._id)
                        ? "border-[#505e4d] bg-[#505e4d] hover:bg-[#465342]"
                        : "border-[#c9d1c4] hover:border-[#505e4d] hover:bg-[#f1f4f0]"
                    }`}
                    aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart
                      size={20}
                        className={isInWishlist(product._id) ? "fill-white text-white" : "fill-transparent text-[#505e4d]"}
                    />
                  </button>

                  <button
                    disabled={product.stockStatus === "Out of Stock"}
                    className="hidden h-full w-full rounded-lg bg-[#3f4a3b] px-4 py-3 font-medium text-white transition-colors hover:bg-[#313b2d] disabled:bg-gray-400 sm:block whitespace-nowrap"
                    onClick={handleBuyNow}
                  >
                    <TranslatedText>Buy Now</TranslatedText>
                  </button>
                </div>

                <button
                  disabled={product.stockStatus === "Out of Stock"}
                  className="ml-1 w-full rounded-lg bg-[#3f4a3b] px-3 py-3 font-medium text-white transition-colors hover:bg-[#313b2d] disabled:bg-gray-400 md:hidden lg:hidden"
                  onClick={handleBuyNow}
                >
                  <TranslatedText>Buy Now</TranslatedText>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 text-center">
                {/* WhatsApp Chat */}
                <div className="group rounded-md p-2 transition-colors hover:bg-[#f1f4f0]">
                  <button
                    className="flex w-full flex-col items-center text-slate-600 hover:text-[#505e4d]"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20need%20help%20with%20this%20product%3A%20${encodeURIComponent(product.name)}`,
                        "_blank",
                      )
                    }
                  >
                    <MessageCircle size={24} className="mb-2 text-[#505e4d]" />
                    <span className="text-xs font-medium text-slate-900 group-hover:text-[#505e4d]">
                      <TranslatedText>Chat With Specialist</TranslatedText>
                    </span>
                  </button>
                </div>

                {/* Callback Request */}
                <div className="group rounded-md p-2 transition-colors hover:bg-[#f1f4f0]">
                  <button
                    className="flex w-full flex-col items-center text-slate-600 hover:text-[#505e4d]"
                    onClick={() => setShowCallbackModal(true)}
                  >
                    <Phone size={24} className="mb-2 text-[#505e4d]" />
                    <span className="text-xs font-medium text-slate-900 group-hover:text-[#505e4d]"><TranslatedText>Request a Callback</TranslatedText></span>
                  </button>
                </div>

                {/* Bulk Purchase */}
                <div className="group rounded-md p-2 transition-colors hover:bg-[#f1f4f0]">
                  <button
                    type="button"
                    className="flex flex-col items-center w-full focus:outline-none group"
                    onClick={() => navigate(getLocalizedPath("/bulk-purchase"))}
                  >
                    <Shield className="mx-auto mb-2 text-[#505e4d]" size={24} />
                    <span className="text-xs font-medium transition-colors group-hover:text-[#505e4d]">
                      <TranslatedText>Request Bulk Purchase</TranslatedText>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Service Features - Right Side */}
          <div className="lg:col-span-3">
            <div className="space-y-5 rounded-2xl border border-[#d7ddd4] bg-white p-4 shadow-[0_8px_26px_rgba(80,94,77,0.08)] md:p-5">
              {/* Get My Coupon */}
              <div className="border-l-2 border-[#505e4d] pl-4">
                <h4 className="mb-2 flex items-center gap-2 text-md font-bold text-gray-900">
                  <Percent size={16} className="text-[#505e4d]" />
                  <TranslatedText>Get My Coupon</TranslatedText>
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  <TranslatedText>Free shipping when you spend AED500 & above. Unlimited destinations in Dubai and Abu Dhabi</TranslatedText>
                </p>
                <button
                  className="w-full rounded-md bg-[#505e4d] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#465342]"
                  onClick={handleOpenCouponsModal}
                >
                  <TranslatedText>Get Coupons</TranslatedText>
                </button>
              </div>

              {/* Delivery Info */}
              <div className="space-y-4">
                <div 
                  className="flex cursor-pointer items-start space-x-3 border-b border-[#e2e7df] pb-3 transition-colors hover:text-[#505e4d]"
                  onClick={() => navigate(getLocalizedPath('/delivery-terms'))}
                >
                  <Truck className="mt-1 text-[#505e4d]" size={42} />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm"><TranslatedText>Express Delivery</TranslatedText></h4>
                    <p className="text-xs text-gray-700">
                      <TranslatedText>Free shipping when you spend AED500 & above. Unlimited destinations in Dubai and Abu Dhabi</TranslatedText>
                    </p>
                  </div>
                </div>

                <div 
                  className="flex cursor-pointer items-start space-x-3 border-b border-[#e2e7df] pb-3 transition-colors hover:text-[#505e4d]"
                  onClick={() => navigate(getLocalizedPath('/refund-return'))}
                >
                  <RotateCcw className="mt-1 text-[#505e4d]" size={42} />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm"><TranslatedText>Delivery & Returns Policy</TranslatedText></h4>
                    <p className="text-xs text-gray-700">
                      <TranslatedText>Delivery in remote areas will be considered as normal delivery which takes place with 1 working day delivery.</TranslatedText>
                    </p>
                  </div>
                </div>

                <div 
                  className="flex cursor-pointer items-start space-x-3 pb-1 transition-colors hover:text-[#505e4d]"
                  onClick={() => navigate(getLocalizedPath('/terms-conditions'))}
                >
                  <Award className="mt-1 text-[#505e4d]" size={30} />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm"><TranslatedText>Warranty Information</TranslatedText></h4>
                    <p className="text-xs text-gray-700">
                      <TranslatedText text={product.warranty || "Standard warranty applies as per manufacturer terms"}>{product.warranty || "Standard warranty applies as per manufacturer terms"}</TranslatedText>
                    </p>
                  </div>
                </div>
              </div>

  



{/* Protect Your Purchase - Only show if protection plans are available */}
{hasProtectionPlans && (
<div className="mt-8 border-t border-[#d7ddd4] pt-5">
            <div className="p-1">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <Shield className="text-[#505e4d]" size={24} />
                <TranslatedText>Protect Your Purchase</TranslatedText>
              </h3>
              <BuyerProtectionSection
                productId={product._id}
                productPrice={product.salePrice || product.price}
                onSelectProtection={setSelectedProtections}
                selectedProtections={selectedProtections}
              />
            </div>
          </div>
)}

{/* Hidden loader to check for protection plans availability */}
{!hasProtectionPlans && (
  <BuyerProtectionSection
    productId={product._id}
    productPrice={product.salePrice || product.price}
    onSelectProtection={setSelectedProtections}
    selectedProtections={selectedProtections}
    onProtectionsLoaded={setHasProtectionPlans}
  />
)}








































              {/* Payment Methods */}
              <div className="border-t border-[#d7ddd4] pt-4">
                <h4 className="mb-3 text-md font-semibold text-[#505e4d]">
                  <TranslatedText>Payment Methods</TranslatedText> :{" "}
                </h4>
                <div className="ml-2 flex flex-wrap items-center gap-3 sm:ml-6">
                  <div className="px-2 py-1 rounded flex items-center ">
                    <img
                      src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757919726/1st_logo_v8x2hc.webp"
                      alt="master"
                      className="w-auto"
                    />
                  </div>
                  <div className="px-2 py-1 rounded flex items-center ">
                    <img
                      src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757937381/2nd_logo_x6jzhz.webp"
                      alt="visa"
                      className="w-auto"
                    />
                  </div>
                  <div className="px-2 py-1 rounded flex items-center ">
                    <img
                      src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757937401/3rd_logo_fmwdkp.webp"
                      alt="tamara"
                      className="w-auto"
                    />
                  </div>
                </div>

                
              </div>
            </div>
            
          </div>
        </div>

        {/* Add Frequently Bought Together Section Here */}
        <FrequentlyBoughtTogether />

        {/* Tabs Section */}
        {/* <div className="bg-white rounded-lg shadow-sm mt-8">
          <div className="border-b bg-[#505e4d]">
            <div className="flex  space-x-8 px-6">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-4 px-2 border-b-2 font-bold text-md transition-colors ${
                  activeTab === "description"
                    ? "border-white text-white"
                    : "border-transparent text-black hover:text-gray-700"
                }`}
              >
                Product Description
              </button>
              <button
                onClick={() => setActiveTab("information")}
                className={`py-4 px-2 border-b-2 font-bold text-md transition-colors ${
                  activeTab === "information"
                    ? "border-white text-white"
                    : "border-transparent text-black hover:text-gray-700"
                }`}
              >
                More Information
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-2 border-b-2 font-bold text-md transition-colors ${
                  activeTab === "reviews"
                    ? "border-white text-white"
                    : "border-transparent text-black hover:text-gray-700"
                }`}
              >
                Reviews ({reviewStats.totalReviews || 0})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div>
                <h3 className="text-lg font-bold mb-4"><TranslatedText>Product Description</TranslatedText></h3>
                <TranslatedTipTapRenderer content={product.description} />
              </div>
            )}

            {activeTab === "information" && (
              <div>
                <h3 className="text-lg font-bold mb-4"><TranslatedText>More Information</TranslatedText></h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4"><TranslatedText>Brand</TranslatedText></td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">
                          <TranslatedText text={product.brand?.name || product.brand || "N/A"}>{product.brand?.name || product.brand || "N/A"}</TranslatedText>
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">
                          <TranslatedText>Model Number</TranslatedText>
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">{product.sku || "N/A"}</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4"><TranslatedText>Category</TranslatedText></td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">
                          <TranslatedText text={product.category?.name || product.category || "N/A"}>{product.category?.name || product.category || "N/A"}</TranslatedText>
                        </td>
                      </tr>
                      {product.warranty && (
                        <tr className="bg-white">
                          <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4"><TranslatedText>Warranty</TranslatedText></td>
                          <td className="border border-gray-200 px-4 py-3 text-gray-700"><TranslatedText text={product.warranty}>{product.warranty}</TranslatedText></td>
                        </tr>
                      )}

                      {product.specifications &&
                        product.specifications.length > 0 &&
                        product.specifications.map((spec, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">
                              <TranslatedText text={spec.key}>{spec.key}</TranslatedText>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-gray-700"><TranslatedText text={spec.value}>{spec.value}</TranslatedText></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div data-review-section>
                <ReviewSection productId={product._id} onStatsUpdate={setReviewStats} />
              </div>
            )}
          </div>
        </div> */}









<div className="mt-8 rounded-2xl border border-[#d7ddd4] bg-white p-4 shadow-[0_8px_26px_rgba(80,94,77,0.08)] sm:p-6">
  <div className="mb-6 flex flex-wrap gap-2 border-b border-[#d7ddd4] pb-3">
      <button
        onClick={() => setActiveTab("description")}
        className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap ${
          activeTab === "description"
            ? "border-[#505e4d] bg-[#edf1eb] text-[#505e4d]"
            : "border-[#d7ddd4] text-slate-600 hover:border-[#505e4d] hover:text-[#505e4d]"
        }`}
      >
        <span className="hidden sm:inline"><TranslatedText>Product</TranslatedText> </span><TranslatedText>Description</TranslatedText>
      </button>
      <button
        onClick={() => setActiveTab("information")}
        className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap ${
          activeTab === "information"
            ? "border-[#505e4d] bg-[#edf1eb] text-[#505e4d]"
            : "border-[#d7ddd4] text-slate-600 hover:border-[#505e4d] hover:text-[#505e4d]"
        }`}
      >
        <span className="hidden sm:inline"><TranslatedText>More</TranslatedText> </span><TranslatedText>Information</TranslatedText>
      </button>
      <button
        onClick={() => setActiveTab("reviews")}
        className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap ${
          activeTab === "reviews"
            ? "border-[#505e4d] bg-[#edf1eb] text-[#505e4d]"
            : "border-[#d7ddd4] text-slate-600 hover:border-[#505e4d] hover:text-[#505e4d]"
        }`}
      >
        <TranslatedText>Reviews</TranslatedText> ({reviewStats.totalReviews || 0})
      </button>
  </div>
  <div className="pb-1">
    {activeTab === "description" && (
      <div>
        <h3 className="text-lg font-bold mb-4"><TranslatedText>Product Description</TranslatedText></h3>
        <TranslatedTipTapRenderer 
          content={product.description} 
          sourceDoc={product}
          fieldName="description"
        />
      </div>
    )}

    {activeTab === "information" && (
      <div>
        <h3 className="text-lg font-bold mb-4"><TranslatedText>More Information</TranslatedText></h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-[#e2e7df]">
                <td className="w-1/4 px-0 py-3 font-medium text-gray-900"><TranslatedText>Brand</TranslatedText></td>
                <td className="px-2 py-3 text-gray-700">
                  <TranslatedText text={product.brand?.name || product.brand || "N/A"}>{product.brand?.name || product.brand || "N/A"}</TranslatedText>
                </td>
              </tr>
              <tr className="border-b border-[#e2e7df]">
                <td className="w-1/4 px-0 py-3 font-medium text-gray-900">
                  <TranslatedText>Model Number</TranslatedText>
                </td>
                <td className="px-2 py-3 text-gray-700">{product.sku || "N/A"}</td>
              </tr>
              <tr className="border-b border-[#e2e7df]">
                <td className="w-1/4 px-0 py-3 font-medium text-gray-900"><TranslatedText>Category</TranslatedText></td>
                <td className="px-2 py-3 text-gray-700">
                  <TranslatedText text={product.category?.name || product.category || "N/A"}>{product.category?.name || product.category || "N/A"}</TranslatedText>
                </td>
              </tr>
              {product.warranty && (
                <tr className="border-b border-[#e2e7df]">
                  <td className="w-1/4 px-0 py-3 font-medium text-gray-900"><TranslatedText>Warranty</TranslatedText></td>
                  <td className="px-2 py-3 text-gray-700"><TranslatedText text={product.warranty}>{product.warranty}</TranslatedText></td>
                </tr>
              )}

              {product.specifications &&
                product.specifications.length > 0 &&
                product.specifications.map((spec, index) => (
                  <tr key={index} className="border-b border-[#e2e7df]">
                    <td className="w-1/4 px-0 py-3 font-medium text-gray-900">
                      <TranslatedText text={spec.key}>{spec.key}</TranslatedText>
                    </td>
                    <td className="px-2 py-3 text-gray-700"><TranslatedText text={spec.value}>{spec.value}</TranslatedText></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {activeTab === "reviews" && (
      <div data-review-section>
        <ReviewSection productId={product._id} onStatsUpdate={setReviewStats} />
      </div>
    )}
  </div>
</div>












































































        {/* Related Products */}
        <div className="mt-12 rounded-2xl border border-[#d7ddd4] bg-white p-4 shadow-[0_8px_26px_rgba(80,94,77,0.08)] sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Related Products</h2>
            <span className="rounded-full bg-[#edf1eb] px-3 py-1 text-xs font-semibold text-[#505e4d]">
              {relatedProducts.length || 0} items
            </span>
          </div>
          {relatedLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-y-2 border-[#505e4d]"></div>
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {shuffleArray(relatedProducts)
                .slice(0, 6)
                .map((relatedProduct) => (
                  <div
                    key={relatedProduct._id}
                    className="rounded-xl border border-[#d7ddd4] bg-[#fcfdfb] p-3 transition-all hover:-translate-y-0.5 hover:border-[#b9c3b4] hover:text-[#505e4d]"
                  >
                    <Link to={getLocalizedPath(`/product/${encodeURIComponent(relatedProduct.slug || relatedProduct._id)}`)}>
                      <img
                        src={getFullImageUrl(relatedProduct.image) || "/placeholder.svg?height=128&width=128"}
                        alt={relatedProduct.name}
                        className="mb-2 h-32 w-full rounded-lg bg-[#f2f4f1] object-contain"
                      />
                      <h3 className="mb-1 line-clamp-2 text-sm font-medium text-slate-900"><TranslatedText text={relatedProduct.name}>{relatedProduct.name}</TranslatedText></h3>
                      <div className="text-sm font-bold text-slate-900">
                        {relatedProduct.offerPrice > 0
                          ? formatPrice(relatedProduct.offerPrice)
                          : formatPrice(relatedProduct.price)}
                      </div>
                      {relatedProduct.offerPrice > 0 && (
                        <div className="text-gray-400 line-through text-xs">{formatPrice(relatedProduct.price)}</div>
                      )}
                    </Link>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No related products found. Check back later for more recommendations!
            </div>
          )}
        </div>
      </div>

      {/* ADD ONLY THIS LINE */}
      <ProductSchema product={product} />

      {/* Video Modal */}
      {showVideoModal && product?.video && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowVideoModal(false)
            }
          }}
        >
          <div className="relative w-[85vw] max-w-3xl">
            {/* Close Button */}
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X size={28} />
            </button>
            
            {/* Video Container */}
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl">
              {isYouTubeUrl(product.video) ? (
                <iframe
                  src={`${getYouTubeEmbedUrl(product.video)}?autoplay=1`}
                  title="Product Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <video
                  src={getFullImageUrl(product.video)}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  poster={getFullImageUrl(product.image)}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            
            {/* Product Name */}
            <div className="mt-3 text-center">
              <h3 className="text-white text-base font-medium">{product.name}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowImageModal(false)
              setIsImageZoomed(false)
            }
          }}
        >
          <div className="relative flex h-[90vh] w-[90vw] max-w-7xl bg-white rounded-lg overflow-hidden">
            {/* Sidebar with all images/videos (vertical on desktop, horizontal on mobile) */}
            <div className="hidden md:block w-64 bg-gray-100 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">All Media</h3>
              <div className="space-y-2">
                {productImages.map((media, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
                      index === modalImageIndex ? "border-[#505e4d]" : "border-gray-300"
                    }`}
                    onClick={() => {
                      setModalImageIndex(index)
                      setIsImageZoomed(false)
                    }}
                  >
                    {media?.type === 'video' ? (
                      <>
                        {isYouTubeUrl(media.url) ? (
                          <img
                            src={`https://img.youtube.com/vi/${media.url.includes('youtu.be/') 
                              ? media.url.split('youtu.be/')[1]?.split('?')[0] 
                              : media.url.split('v=')[1]?.split('&')[0]}/mqdefault.jpg`}
                            alt="YouTube video thumbnail"
                            className="w-full h-24 object-cover"
                          />
                        ) : (
                          <video
                            src={getFullImageUrl(media.url)}
                            className="w-full h-24 object-cover"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <img
                        src={getFullImageUrl(media?.url) || "/placeholder.svg?height=150&width=150"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Horizontal thumbnails for mobile */}
            <div className="md:hidden absolute bottom-0 left-0 w-full bg-gray-100 p-2 flex space-x-2 overflow-x-auto z-10">
              {productImages.map((media, index) => (
                <div
                  key={index}
                  className={`relative flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden ${
                    index === modalImageIndex ? "border-[#505e4d]" : "border-gray-300"
                  }`}
                  onClick={() => {
                    setModalImageIndex(index)
                    setIsImageZoomed(false)
                  }}
                >
                  {media?.type === 'video' ? (
                    <>
                      {isYouTubeUrl(media.url) ? (
                        <img
                          src={`https://img.youtube.com/vi/${media.url.includes('youtu.be/') 
                            ? media.url.split('youtu.be/')[1]?.split('?')[0] 
                            : media.url.split('v=')[1]?.split('&')[0]}/mqdefault.jpg`}
                          alt="YouTube video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={getFullImageUrl(media.url)}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <img
                      src={getFullImageUrl(media?.url) || "/placeholder.svg?height=64&width=64"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Main media area */}
            <div className="flex-1 flex items-center justify-center relative">
              {productImages[modalImageIndex]?.type === 'video' ? (
                isYouTubeUrl(productImages[modalImageIndex]?.url) ? (
                  <iframe
                    key={modalImageIndex}
                    src={getYouTubeEmbedUrl(productImages[modalImageIndex]?.url)}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full max-w-4xl max-h-[80vh]"
                  ></iframe>
                ) : (
                  <video
                    key={modalImageIndex}
                    src={getFullImageUrl(productImages[modalImageIndex]?.url) || ""}
                    controls
                    autoPlay
                    className="max-h-full max-w-full object-contain bg-white"
                    poster={getFullImageUrl(product.image)}
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <img
                  src={getFullImageUrl(productImages[modalImageIndex]?.url) || "/placeholder.svg?height=600&width=600"}
                  alt={product.name}
                  className={`object-contain bg-white cursor-pointer transition-transform duration-300 ${
                    isImageZoomed ? "max-h-none max-w-none scale-150" : "max-h-full max-w-full"
                  }`}
                  style={{
                    transformOrigin: isImageZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : "center",
                  }}
                  onClick={(e) => {
                    if (!isImageZoomed) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = ((e.clientX - rect.left) / rect.width) * 100
                      const y = ((e.clientY - rect.top) / rect.height) * 100
                      setMousePosition({ x, y })
                    }
                    setIsImageZoomed(!isImageZoomed)
                  }}
                  onMouseMove={(e) => {
                    if (isImageZoomed) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = ((e.clientX - rect.left) / rect.width) * 100
                      const y = ((e.clientY - rect.top) / rect.height) * 100
                      setMousePosition({ x, y })
                    }
                  }}
                />
              )}

              {/* Navigation arrows */}
              <button
                onClick={() => setModalImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1))}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setModalImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setShowImageModal(false)
                setIsImageZoomed(false)
              }}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Float Button */}
      {/* <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors">
          <MessageCircle size={4} />
        </button>
      </div> */}

      {showCallbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowCallbackModal(false)
                setEmailChanged(false)
                setVerificationCode("")
                setVerificationSent(false)
                setVerificationVerified(false)
              }}
            >
              <X size={24} />
            </button>
            <div className="flex flex-col gap-4">
              <h2 className="text-xl text-center font-bold mb-2">Request a Callback</h2>
              {callbackSuccess ? (
                <div className="text-green-600 font-medium text-center py-8 flex flex-col items-center gap-2">
                  <CheckCircle size={48} className="text-green-500" />
                  <p>Request submitted successfully!</p>
                  <p className="text-sm text-gray-600">We will contact you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-4">
                  {/* Full Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="flex items-center gap-3">
                      <div className="text-[#505e4d]">
                        <User size={24} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={callbackForm.name}
                        onChange={handleCallbackChange}
                        className="flex-1 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#505e4d]"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field with Verification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="flex items-center gap-3">
                      <div className="text-[#505e4d]">
                        <Mail size={24} />
                      </div>
                      <div className="flex-1">
                        <input
                          type="email"
                          name="email"
                          value={callbackForm.email}
                          onChange={handleCallbackChange}
                          className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#505e4d]"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      {verificationVerified && (
                        <CheckCircle size={24} className="text-green-500" />
                      )}
                    </div>
                    
                    {/* Email Verification Section */}
                    {emailChanged && !verificationVerified && (
                      <div className="mt-3 ml-9 space-y-3">
                        {!verificationSent ? (
                          <button
                            type="button"
                            onClick={handleSendVerificationCode}
                            disabled={verificationLoading}
                            className="text-sm bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                          >
                            {verificationLoading ? "Sending..." : "Send Verification Code"}
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Enter the verification code sent to your email:</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="flex-1 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#505e4d]"
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                              />
                              <button
                                type="button"
                                onClick={handleVerifyCode}
                                disabled={verificationLoading || verificationCode.length !== 6}
                                className="bg-[#505e4d] text-white px-4 py-2 rounded-md hover:bg-[#465342] disabled:opacity-50"
                              >
                                {verificationLoading ? "..." : "Verify"}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={handleSendVerificationCode}
                              disabled={verificationLoading}
                              className="text-sm text-blue-500 hover:underline"
                            >
                              Resend Code
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Phone Number with Country Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="flex items-center gap-3">
                      <div className="text-[#505e4d]">
                        <Phone size={24} />
                      </div>
                      <PhoneInput
                        international
                        defaultCountry="AE"
                        value={phoneValue}
                        onChange={setPhoneValue}
                        className="flex-1"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>

                  {/* Customer Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Note (Optional)</label>
                    <textarea
                      name="customerNote"
                      value={callbackForm.customerNote}
                      onChange={handleCallbackChange}
                      rows={4}
                      className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#505e4d]"
                      placeholder="Any specific requirements or questions..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#505e4d] text-white py-3 rounded-md font-medium hover:bg-[#465342] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={callbackLoading || (emailChanged && !verificationVerified)}
                  >
                    {callbackLoading ? "Submitting..." : "Submit Request"}
                  </button>
                  
                  {emailChanged && !verificationVerified && (
                    <p className="text-sm text-red-500 text-center">
                      Please verify your email before submitting
                    </p>
                  )}
                </form>
              )}
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
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500"></div>
              </div>
            ) : couponError ? (
              <div className="text-red-500 text-center">{couponError}</div>
            ) : publicCoupons.length === 0 ? (
              <div className="text-gray-500 text-center">No coupons available at the moment.</div>
            ) : (
              <div className="space-y-4">
                {publicCoupons.map((coupon, idx) => {
                  const color = COUPON_COLORS[idx % COUPON_COLORS.length]
                  const categories =
                    coupon.categories && coupon.categories.length > 0
                      ? coupon.categories.map((cat) => cat.name || cat).join(", ")
                      : "All Categories"
                  return (
                    <div key={coupon._id} className="relative flex items-center w-full">
                      {/* Ticket Style - Horizontal Layout */}
                      <div
                        className={`w-full flex shadow-md relative overflow-visible transition-all duration-500 ease-out opacity-0 translate-y-8 animate-fadeInUp ${color.border}`}
                        style={{ minHeight: 100, animationDelay: `${idx * 80}ms`, animationFillMode: "forwards" }}
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
                                  ? `${coupon.discountValue}`
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
                                  className={`ml-2 px-2 py-1 text-xs ${color.stub} hover:brightness-110 text-black rounded transition-colors font-semibold border ${color.border} focus:outline-none focus:ring-2 focus:ring-yellow-300`}
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
            <style>{`
              @keyframes fadeInUp {
                0% { opacity: 0; transform: translateY(32px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeInUp {
                animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;
              }
            `}</style>
          </div>
        </div>
      )}

      {showTamaraModal && <TamaraModal amount={getEffectivePrice()} onClose={() => setShowTamaraModal(false)} />}
      {showTabbyModal && <TabbyModal amount={getEffectivePrice()} onClose={() => setShowTabbyModal(false)} />}
    </div>
  )
}

export default ProductDetails



