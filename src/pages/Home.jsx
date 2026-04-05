"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import axios from "axios"
import { generateShopURL } from "../utils/urlUtils"
import { getFullImageUrl, getOptimizedImageUrl } from "../utils/imageUtils"

import BigSaleSection from "../components/BigSaleSection"
import {
  Star,
  Heart,
  ChevronRight,
  CreditCard,
  Truck,
  Headphones,
  CheckCircle,
  Zap,
  Shield,
  Award,
  Bell,
  Tag,
  Calendar,
  ShoppingBag,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import BannerSlider from "../components/BannerSlider"
import CategorySliderUpdated from "../components/CategorySliderUpdated"
import { useWishlist } from "../context/WishlistContext"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import HomeStyleProductCard from "../components/HomeStyleProductCard"
import BrandSlider from "../components/BrandSlider"
import SEO from "../components/SEO"
import DynamicSection from "../components/DynamicSection"
import TranslatedText from "../components/TranslatedText"
import { getCategoryTreeCached } from "../services/categoryTreeCache"

import config from "../config/config"


const API_BASE_URL = `${config.API_URL}`
const FALLBACK_HERO_BANNER = {
  title: "top again 1",
  image: "https://api.grabatoz.ae/uploads//banners/banner-projector_final-1767447672755-684802807.webp",
  buttonLink: "/product-category/electronics-home/projectors",
  link: "/product-category/electronics-home/projectors",
  deviceType: "desktop",
}
const LIGHT_BANNER_FALLBACK = "lenovo-banner-768x290.jpg"
const LIGHT_ACCESSORIES_DESKTOP_FALLBACK = "lenovo-banner-768x290.jpg"
const LIGHT_NETWORKING_DESKTOP_FALLBACK =
  "https://res.cloudinary.com/dyfhsu5v6/image/upload/f_auto,q_68,w_1311,h_300,c_limit/v1753939592/networking_kr6uvk.png"

const NOTIF_POPUP_KEY = "notif_popup_shown"

const NEWSLETTER_OPTIONS = [
  { label: "Updates", value: "all", icon: <Bell className="inline mr-2 w-4 h-4" /> },
  { label: "Promotions", value: "promotions", icon: <Tag className="inline mr-2 w-4 h-4" /> },
  { label: "Events", value: "events", icon: <Calendar className="inline mr-2 w-4 h-4" /> },
]

const Home = () => {
  const { getLocalizedPath } = useLanguage()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [heroBanners, setHeroBanners] = useState([])
  const [mobileBanners, setMobileBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [categorySlide, setCategorySlide] = useState(0)
  const [mobileProductSlide, setMobileProductSlide] = useState(0)
  const navigate = useNavigate()
  const [brands, setBrands] = useState([])
  const [brandSlide, setBrandSlide] = useState(0)
  const [hpProducts, setHpProducts] = useState([])
  const [dellProducts, setDellProducts] = useState([])
  const [accessoriesProducts, setAccessoriesProducts] = useState([])
  const [acerProducts, setAcerProducts] = useState([])
  const [asusProducts, setAsusProducts] = useState([])
  const [networkingProducts, setNetworkingProducts] = useState([])
  const [msiProducts, setMsiProducts] = useState([])
  const [lenovoProducts, setLenovoProducts] = useState([])
  const [appleProducts, setAppleProducts] = useState([])
  const [samsungProducts, setSamsungProducts] = useState([])
  const [upgradeFeatures, setUpgradeFeatures] = useState([])
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [brandCurrentIndex, setBrandCurrentIndex] = useState(0)
  const [brandIndex, setBrandIndex] = useState(0) // <-- moved here
  const sliderRef = useRef(null)
  const [scrollX, setScrollX] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [settings, setSettings] = useState(null)
  const [homeSections, setHomeSections] = useState([])
  const [homeBanners, setHomeBanners] = useState([]) // Dynamic home page banners
  const [deviceType, setDeviceType] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "Mobile" : "Desktop"
    }
    return "Desktop"
  })
  const brandUrls = useMemo(
    () => ({
      HP: generateShopURL({ brand: "HP" }),
      Dell: generateShopURL({ brand: "Dell" }),
      ASUS: generateShopURL({ brand: "ASUS" }),
      Acer: generateShopURL({ brand: "Acer" }),
      MSI: generateShopURL({ brand: "MSI" }),
      Lenovo: generateShopURL({ brand: "Lenovo" }),
      Apple: generateShopURL({ brand: "Apple" }),
      Samsung: generateShopURL({ brand: "Samsung" }),
    }),
    [],
  )

  // Notification popup state
  const [showNotifPopup, setShowNotifPopup] = useState(false)
  const [notifStep, setNotifStep] = useState("ask") // 'ask' | 'email'
  const [notifEmail, setNotifEmail] = useState("")
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifError, setNotifError] = useState("")
  const [notifSuccess, setNotifSuccess] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState([])

  useEffect(() => {
    function handleResize() {
      setDeviceType(window.innerWidth < 768 ? "Mobile" : "Desktop")
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (localStorage.getItem(NOTIF_POPUP_KEY)) return

    let opened = false
    const openPopup = () => {
      if (opened) return
      opened = true
      setShowNotifPopup(true)
    }

    const interactionEvents = ["pointerdown", "keydown", "touchstart", "scroll"]
    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, openPopup, { once: true, passive: true })
    })

    return () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, openPopup)
      })
    }
  }, [])

  // Helper function to render dynamic section by position
  const renderDynamicSection = (position) => {
    const section = homeSections.find(s => s.isActive && s.order === position)
    if (section) {
      // Create a unique key that includes settings to force re-render when settings change
      const settingsKey = section.settings ? JSON.stringify(section.settings) : 'no-settings'
      const uniqueKey = `${section._id}-${section.sectionType}-${settingsKey}`
      return <DynamicSection key={uniqueKey} section={section} />
    }
    return null
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homepageResponse, categoryTreeData] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/homepage`).catch(() => null),
          getCategoryTreeCached().catch(() => []),
        ])

        const defaultSettings = {
          homeSections: {
            categoryCards: true,
            brandsCards: true,
            productsCards: true,
            flashSaleCards: true,
            limitedSaleCards: true,
          },
        }

        const homePayload = homepageResponse?.data?.success ? homepageResponse.data.data : null

        let categoriesData = []
        let brandsData = []
        let heroData = []
        let promotionalBanners = []
        let mobileData = []
        let homeBannersData = []
        let settingsData = defaultSettings
        let sectionsData = []
        let featured = []
        let hpData = []
        let dellData = []
        let acerData = []
        let asusData = []
        let msiData = []
        let lenovoData = []
        let appleData = []
        let samsungData = []

        if (homePayload) {
          categoriesData = Array.isArray(homePayload.categories) ? homePayload.categories : []
          brandsData = Array.isArray(homePayload.brands) ? homePayload.brands : []
          const bannerGroups = homePayload.banners || {}
          heroData = Array.isArray(bannerGroups.hero) ? bannerGroups.hero : []
          promotionalBanners = Array.isArray(bannerGroups.promotional) ? bannerGroups.promotional : []
          mobileData = Array.isArray(bannerGroups.mobile) ? bannerGroups.mobile : []
          homeBannersData = Array.isArray(bannerGroups.home) ? bannerGroups.home : []

          const needsBannerHydration =
            homeBannersData.length === 0 ||
            homeBannersData.some(
              (banner) =>
                !String(banner?.section || "").trim() || !String(banner?.deviceType || "").trim(),
            )

          if (needsBannerHydration) {
            try {
              const { data: activeBannersRaw } = await axios.get(`${API_BASE_URL}/api/banners?active=true`)
              const activeBanners = Array.isArray(activeBannersRaw) ? activeBannersRaw : []

              if (activeBanners.length > 0) {
                heroData = activeBanners.filter((banner) => banner.position === "hero")
                promotionalBanners = activeBanners.filter((banner) => banner.position === "promotional")
                mobileData = activeBanners.filter((banner) => banner.position === "mobile")
                homeBannersData = activeBanners.filter(
                  (banner) => banner.position && banner.position.startsWith("home-") && banner.isActive,
                )
              }
            } catch (bannerHydrationError) {
              console.warn("Banner hydration fallback failed:", bannerHydrationError)
            }
          }

          settingsData = homePayload.settings || defaultSettings
          sectionsData = Array.isArray(homePayload.homeSections) ? homePayload.homeSections : []
          featured = Array.isArray(homePayload.featuredProducts) ? homePayload.featuredProducts : []

          const byBrand = homePayload.brandProducts || {}
          hpData = Array.isArray(byBrand.hp) ? byBrand.hp : []
          dellData = Array.isArray(byBrand.dell) ? byBrand.dell : []
          acerData = Array.isArray(byBrand.acer) ? byBrand.acer : []
          asusData = Array.isArray(byBrand.asus) ? byBrand.asus : []
          msiData = Array.isArray(byBrand.msi) ? byBrand.msi : []
          lenovoData = Array.isArray(byBrand.lenovo) ? byBrand.lenovo : []
          appleData = Array.isArray(byBrand.apple) ? byBrand.apple : []
          samsungData = Array.isArray(byBrand.samsung) ? byBrand.samsung : []
        } else {
          const [categoriesResponse, brandsResponse, bannersResponse, settingsResponse, sectionsResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/categories`),
            axios.get(`${API_BASE_URL}/api/brands`),
            axios.get(`${API_BASE_URL}/api/banners?active=true`),
            axios.get(`${API_BASE_URL}/api/settings`).catch(() => ({ data: defaultSettings })),
            axios.get(`${API_BASE_URL}/api/home-sections/active`).catch(() => ({ data: [] })),
          ])

          categoriesData = categoriesResponse.data
          brandsData = brandsResponse.data
          const bannersData = bannersResponse.data
          settingsData = settingsResponse.data
          sectionsData = sectionsResponse.data
          heroData = bannersData.filter((banner) => banner.position === "hero")
          promotionalBanners = bannersData.filter((banner) => banner.position === "promotional")
          mobileData = bannersData.filter((banner) => banner.position === "mobile")
          homeBannersData = bannersData.filter(
            (banner) => banner.position && banner.position.startsWith("home-") && banner.isActive,
          )
        }

        const leanValidCategories = Array.isArray(categoriesData)
          ? categoriesData.filter((cat) => {
              const isValid =
                cat &&
                typeof cat === "object" &&
                cat.name &&
                typeof cat.name === "string" &&
                cat.name.trim() !== "" &&
                cat.isActive !== false &&
                !cat.isDeleted &&
                !cat.name.match(/^[0-9a-fA-F]{24}$/)
              return isValid
            })
          : []

        const leanValidBrands = Array.isArray(brandsData)
          ? brandsData.filter((brand) => {
              const isValid =
                brand &&
                typeof brand === "object" &&
                brand.name &&
                typeof brand.name === "string" &&
                brand.name.trim() !== "" &&
                brand.isActive !== false &&
                !brand.name.match(/^[0-9a-fA-F]{24}$/) &&
                brand.logo &&
                brand.logo.trim() !== ""
              return isValid
            })
          : []

        const brandIdMap = {}
        for (const brand of leanValidBrands) {
          if (brand?._id && brand?.name) {
            brandIdMap[brand.name.toLowerCase()] = brand._id
          }
        }

        const categoryIdMap = {}
        for (const category of leanValidCategories) {
          if (category?._id && category?.name) {
            categoryIdMap[category.name.trim().toLowerCase()] = category._id
          }
        }

        const findSubCategoryIdByName = (nodes, targetName) => {
          if (!Array.isArray(nodes)) return null
          const target = String(targetName || "").trim().toLowerCase()
          const stack = [...nodes]
          while (stack.length) {
            const node = stack.pop()
            if (!node) continue
            if (String(node.name || "").trim().toLowerCase() === target && node._id) return node._id
            if (Array.isArray(node.children) && node.children.length) stack.push(...node.children)
          }
          return null
        }

        const networkingSubCategoryId = findSubCategoryIdByName(categoryTreeData, "Networking")

        setCategories(leanValidCategories)
        setBanners(promotionalBanners)
        setHeroBanners(heroData)
        setMobileBanners(mobileData)
        setHomeBanners(homeBannersData)
        setBrands(leanValidBrands)
        setSettings(settingsData)
        setHomeSections(sectionsData)

        const fetchProducts = async (params) => {
          const { data } = await axios.get(`${API_BASE_URL}/api/products`, { params })
          return Array.isArray(data) ? data : []
        }

        const fetchByBrand = (brandId, limit) => (brandId ? fetchProducts({ brand: brandId, limit }) : Promise.resolve([]))
        const fetchByParentCategory = (categoryId, limit) =>
          categoryId ? fetchProducts({ parentCategory: categoryId, limit }) : Promise.resolve([])
        const fetchNetworking = (limit) =>
          networkingSubCategoryId
            ? fetchProducts({ subcategory: networkingSubCategoryId, limit })
            : categoryIdMap.networking
            ? fetchByParentCategory(categoryIdMap.networking, limit)
            : Promise.resolve([])

        const [
          featuredFallback,
          hpFallback,
          dellFallback,
          acerFallback,
          asusFallback,
          msiFallback,
          lenovoFallback,
          appleFallback,
          samsungFallback,
          accessoriesData,
          networkingData,
        ] = await Promise.all([
          featured.length > 0 ? Promise.resolve(featured) : fetchProducts({ featured: true, limit: 12 }),
          hpData.length > 0 ? Promise.resolve(hpData) : fetchByBrand(brandIdMap.hp, 3),
          dellData.length > 0 ? Promise.resolve(dellData) : fetchByBrand(brandIdMap.dell, 3),
          acerData.length > 0 ? Promise.resolve(acerData) : fetchByBrand(brandIdMap.acer, 3),
          asusData.length > 0 ? Promise.resolve(asusData) : fetchByBrand(brandIdMap.asus, 3),
          msiData.length > 0 ? Promise.resolve(msiData) : fetchByBrand(brandIdMap.msi, 3),
          lenovoData.length > 0 ? Promise.resolve(lenovoData) : fetchByBrand(brandIdMap.lenovo, 3),
          appleData.length > 0 ? Promise.resolve(appleData) : fetchByBrand(brandIdMap.apple, 3),
          samsungData.length > 0 ? Promise.resolve(samsungData) : fetchByBrand(brandIdMap.samsung, 3),
          fetchByParentCategory(categoryIdMap.accessories, 18),
          fetchNetworking(8),
        ])

        setFeaturedProducts(featuredFallback)
        setHpProducts(hpFallback)
        setDellProducts(dellFallback)
        setAccessoriesProducts(accessoriesData)
        setAcerProducts(acerFallback)
        setAsusProducts(asusFallback)
        setNetworkingProducts(networkingData)
        setMsiProducts(msiFallback)
        setLenovoProducts(lenovoFallback)
        setAppleProducts(appleFallback)
        setSamsungProducts(samsungFallback)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Infinite loop pixel-based auto-scroll for brands
  useEffect(() => {
    if (!brands.length) return
    let animationFrameId
    let lastTimestamp = null
    const speed = 0.5 // px per frame, adjust for faster/slower scroll

    function step(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp
      const elapsed = timestamp - lastTimestamp
      lastTimestamp = timestamp
      if (!sliderRef.current) return
      const track = sliderRef.current
      const totalWidth = track.scrollWidth / 2 // width of one set
      const nextScrollX = scrollX + speed
      if (nextScrollX >= totalWidth) {
        // Instantly reset to the start (no animation)
        track.style.transition = "none"
        setScrollX(0)
        // Force reflow, then restore transition
        setTimeout(() => {
          if (track) track.style.transition = "transform 0.3s linear"
        }, 20)
        animationFrameId = requestAnimationFrame(step)
        return
      }
      setScrollX(nextScrollX)
      animationFrameId = requestAnimationFrame(step)
    }

    if (isAutoScrolling) {
      animationFrameId = requestAnimationFrame(step)
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
    // eslint-disable-next-line
  }, [brands.length, isAutoScrolling, scrollX])

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${scrollX}px)`
    }
  }, [scrollX])

  // Handle infinite loop transitions
  useEffect(() => {
    if (brandCurrentIndex === brands.length) {
      setTimeout(() => {
        setIsTransitioning(false)
        setBrandCurrentIndex(0)
      }, 300)
    } else if (brandCurrentIndex === -1) {
      setTimeout(() => {
        setIsTransitioning(false)
        setBrandCurrentIndex(brands.length - 1)
      }, 300)
    } else {
      setIsTransitioning(true)
    }
  }, [brandCurrentIndex, brands.length])

  const handleCategoryClick = (categoryOrItem) => {
    // Handle if called with string (legacy compatibility) or object (new format)
    if (typeof categoryOrItem === 'string') {
      // Legacy: string name passed
      const category = categories.find((cat) => cat.name === categoryOrItem)
      if (category && category.name) {
        navigate(generateShopURL({ parentCategory: category.name }))
      } else {
        navigate(`/shop`)
      }
    } else if (categoryOrItem && typeof categoryOrItem === 'object') {
      // New format: full item object passed from CategorySliderUpdated
      const item = categoryOrItem

      // Check if this is a subcategory (has category or parentSubCategory fields)
      const isSubcategory = item.category || item.parentSubCategory

      if (isSubcategory) {
        // This is a subcategory - need to find its parent category and build proper URL
        const parentCategoryId = typeof item.category === 'object' ? item.category._id : item.category
        const parentCategory = categories.find((cat) => cat._id === parentCategoryId)

        if (parentCategory) {
          // Navigate with both parent category and subcategory
          navigate(generateShopURL({
            parentCategory: parentCategory.name,
            subcategory: item.name
          }))
        } else {
          // Fallback: just navigate to the subcategory name
          navigate(generateShopURL({ subcategory: item.name }))
        }
      } else {
        // This is a main category
        navigate(generateShopURL({ parentCategory: item.name }))
      }
    }
  }

  const handleBrandClick = (brandName) => {
    navigate(generateShopURL({ brand: brandName }))
  }

  const nextSlide = () => {
    if (currentSlide < featuredProducts.length - 4) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const nextCategorySlide = () => {
    const itemsPerSlide = window.innerWidth >= 1024 ? 8 : window.innerWidth >= 768 ? 6 : 4
    const maxSlides = Math.ceil(categories.length / itemsPerSlide) - 1
    if (categorySlide < maxSlides) {
      setCategorySlide(categorySlide + 1)
    }
  }

  const prevCategorySlide = () => {
    if (categorySlide > 0) {
      setCategorySlide(categorySlide - 1)
    }
  }

  const nextMobileProductSlide = () => {
    if (mobileProductSlide < featuredProducts.length - 3) {
      setMobileProductSlide(mobileProductSlide + 1)
    }
  }

  const prevMobileProductSlide = () => {
    if (mobileProductSlide > 0) {
      setMobileProductSlide(mobileProductSlide - 1)
    }
  }

  const nextBrandSlide = () => {
    setBrandCurrentIndex((prev) => (prev + 1) % brands.length)
  }

  const prevBrandSlide = () => {
    setBrandCurrentIndex((prev) => (prev - 1 + brands.length) % brands.length)
  }

  // Calculate how many brands are visible at once
  const getVisibleCount = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) return 4
      if (window.innerWidth < 1024) return 6
    }
    return 8
  }
  const visibleCount = getVisibleCount()
  // Remove duplicate totalBrands declaration; use the one for featured brands section only
  const totalBrands = brands.length
  const getVisibleBrands = () => {
    if (!brands.length) return []
    const visible = []
    for (let i = 0; i < visibleCount; i++) {
      visible.push(brands[(brandIndex + i) % totalBrands])
    }
    return visible
  }
  const handlePrevBrand = () => {
    setBrandIndex((prev) => (prev - 1 + totalBrands) % totalBrands)
  }
  const handleNextBrand = () => {
    setBrandIndex((prev) => (prev + 1) % totalBrands)
  }

  // Helper function to get banners for a specific section and device type
  const getBannersForSection = (section, position = null) => {
    const normalize = (value) => String(value || "").trim().toLowerCase()
    const targetSection = normalize(section)
    const targetPosition = normalize(position)
    const targetDevice = normalize(deviceType)

    return homeBanners.filter((banner) => {
      const bannerSection = normalize(banner.section)
      const bannerPosition = normalize(banner.position)
      const bannerDevice = normalize(banner.deviceType)

      const matchesSection = section ? bannerSection === targetSection : true
      const matchesPosition = position ? bannerPosition === targetPosition : true
      const matchesDevice = bannerDevice ? bannerDevice === targetDevice : true
      return matchesSection && matchesPosition && matchesDevice
    })
  }

  const handleNotifDeny = () => {
    setShowNotifPopup(false)
    localStorage.setItem(NOTIF_POPUP_KEY, "1")
  }
  const handleNotifAllow = () => {
    setNotifStep("email")
  }
  const handleNotifEmailChange = (e) => setNotifEmail(e.target.value)
  const handleNotifPrefChange = (value) => {
    setNotifPrefs((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }
  const handleNotifEmailSubmit = async (e) => {
    e.preventDefault()
    setNotifError("")
    if (!notifPrefs.length) {
      setNotifError("Please select at least one preference.")
      return
    }
    setNotifLoading(true)
    try {
      await axios.post(`${API_BASE_URL}/api/newsletter/subscribe`, { email: notifEmail, preferences: notifPrefs })
      setNotifSuccess(true)
      localStorage.setItem(NOTIF_POPUP_KEY, "1")
      setTimeout(() => setShowNotifPopup(false), 2000)
    } catch (err) {
      setNotifError("Failed to subscribe. Please try again.")
    }
    setNotifLoading(false)
  }

  // Helper function to get proper banner link with language prefix
  const getBannerLink = (banner, fallbackUrl = "#") => {
    if (!banner) return fallbackUrl
    const link = banner.link || banner.buttonLink || fallbackUrl
    // If it's an external link or already has language prefix, return as is
    if (link.startsWith("http://") || link.startsWith("https://") || 
        link.startsWith("/ae-en/") || link.startsWith("/ae-ar/")) {
      return link
    }
    // Otherwise, add language prefix
    return getLocalizedPath(link)
  }

  const handleBannerImageError = (e, bannerImage, finalFallback = LIGHT_BANNER_FALLBACK) => {
    const img = e.currentTarget
    if (!img.dataset.retryOriginal && bannerImage) {
      img.dataset.retryOriginal = "1"
      img.src = getFullImageUrl(bannerImage)
      return
    }
    if (!img.dataset.retryFallback) {
      img.dataset.retryFallback = "1"
      img.src = finalFallback
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white mt-1">
      {/* SEO Meta Tags for Home Page */}
      <SEO
        title="Buy Laptops, Mobiles & Electronics Online in UAE | Grabatoz"
        description="Discover the best deals on laptops, desktops, mobiles, and gaming products in UAE. Grabatoz is your trusted electronics shop in Dubai."
        canonicalPath="/"
      />

      {/* Notification/Newsletter Popup */}
      {showNotifPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2820]/60 backdrop-blur-[2px] px-4">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#cfd8ca] bg-white shadow-[0_24px_60px_rgba(28,39,30,0.32)] animate-fadeInUp">
            <div className="grid sm:grid-cols-[220px,1fr]">
              <aside className="hidden sm:flex flex-col justify-between bg-[#505e4d] p-6 text-white">
                <div>
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/10">
                    <img src="/g.png" alt="Logo" className="h-10 w-10 object-contain" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold leading-tight">Stay Updated</h3>
                  <p className="mt-2 text-xs text-slate-200">
                    Get product launches, offers, and important store updates.
                  </p>
                </div>
                <div className="mt-4 rounded-2xl border border-white/30 bg-white/10 px-3.5 py-3 backdrop-blur-sm">
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#c7f36c]"></span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        Preferences
                      </p>
                      <p className="text-sm font-semibold text-white leading-snug">Notification Center</p>
                      <p className="mt-1 text-[11px] text-slate-200">
                        Choose updates, offers, and events anytime.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="p-5 sm:p-6">
                {notifStep === "ask" && (
                  <>
                    <div className="mb-4 flex items-start gap-3 sm:hidden">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#d7ddd4] bg-[#f3f6f2]">
                        <img src="/g.png" alt="Logo" className="h-8 w-8 object-contain" />
                      </div>
                      <p className="text-xs text-[#505e4d]/80 mt-1">Manage notification preferences</p>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                      This website would like to send you awesome updates and offers!
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Notifications can be turned off anytime from browser settings.
                    </p>

                    <div className="mt-6 flex flex-wrap justify-end gap-2">
                      <button
                        className="px-4 py-2 rounded-xl border border-[#d5dbd2] bg-[#f4f6f3] text-[#42513f] font-semibold hover:bg-[#e9eee6] transition-colors"
                        onClick={handleNotifDeny}
                      >
                        Don't Allow
                      </button>
                      <button
                        className="px-5 py-2 rounded-xl bg-[#505e4d] text-white font-semibold hover:bg-[#465342] transition-colors"
                        onClick={handleNotifAllow}
                      >
                        Allow
                      </button>
                    </div>
                  </>
                )}

                {notifStep === "email" && !notifSuccess && (
                  <form onSubmit={handleNotifEmailSubmit}>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                      Subscribe to our newsletter
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">Enter your email to get the best offers and updates.</p>

                    <div className="mt-5 flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        className="flex-1 px-4 py-3 border border-[#c7cec2] bg-[#f8faf7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d]"
                        placeholder="Enter your email"
                        value={notifEmail}
                        onChange={handleNotifEmailChange}
                        required
                      />
                      <button
                        type="submit"
                        className="px-5 py-3 rounded-xl bg-[#505e4d] text-white font-semibold hover:bg-[#465342] transition-colors disabled:opacity-60"
                        disabled={notifLoading}
                      >
                        {notifLoading ? "Subscribing..." : "Subscribe"}
                      </button>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {NEWSLETTER_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center rounded-xl border border-[#d7ddd4] bg-[#f9fbf8] px-3 py-2 text-sm text-slate-700 cursor-pointer hover:border-[#b8c2b4] transition-colors"
                        >
                          <input
                            type="checkbox"
                            value={opt.value}
                            checked={notifPrefs.includes(opt.value)}
                            onChange={() => handleNotifPrefChange(opt.value)}
                            className="mr-2 accent-[#505e4d]"
                          />
                          {opt.icon}
                          {opt.label}
                        </label>
                      ))}
                    </div>

                    {notifError && <div className="text-red-500 text-sm mt-2">{notifError}</div>}

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        className="px-3 py-1 text-xs text-[#505e4d] hover:text-[#465342] underline"
                        onClick={handleNotifDeny}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {notifSuccess && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d7ddd4] bg-[#f3f6f2]">
                      <img src="/logo.png" alt="Logo" width="40" height="40" className="h-10 w-10 object-contain" />
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-slate-900">Thank you for subscribing!</h2>
                    <p className="mt-1 text-sm text-slate-600">A confirmation email has been sent to {notifEmail}.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <BannerSlider
        banners={(() => {
          const filtered = heroBanners.filter(
            (banner) => banner.deviceType && banner.deviceType.toLowerCase() === deviceType.toLowerCase(),
          )
          return filtered.length ? filtered : [FALLBACK_HERO_BANNER]
        })()}
      />
      {/* Categories Section - Admin Controlled Slider */}
      <CategorySliderUpdated onCategoryClick={handleCategoryClick} />


      {/* Three Cards Section - Dynamic Banners */}
    
      {/* <div className=" flex items-center justify-center mt-2 mx-2">
        <img src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757761484/tamara_tabby_kooxbn.webp" alt="" className="w-full  sm:mx-4 h-auto rounded-lg" />
      </div> */}

      {/* Dynamic Section Position 1 */}
      {renderDynamicSection(1)}

      {/* Big Sale Section - Handles both mobile and desktop views */}
      <BigSaleSection products={featuredProducts} />

      {/* Best Sellers Section - Mobile Grid */}
      <section className="py-6 mx-3 md:hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            <TranslatedText>Best Sellers</TranslatedText>
          </h2>
          <button className="text-[#505e4d] hover:text-[#465342] font-medium text-sm"><TranslatedText>View All</TranslatedText></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {featuredProducts.slice(0, 4).map((product) => (
            <HomeStyleProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>



      {/* Dynamic Section Position 2 */}
      {renderDynamicSection(2)}



      {/* Mobile Banner - HP Section (Dynamic) */}
      <div className="md:hidden rounded-lg shadow-lg mx-5 md:mx-9 h-[160px]">
        {getBannersForSection("hp-mobile", "home-brand-single").length > 0 ? (
          <Link to={getBannerLink(getBannersForSection("hp-mobile", "home-brand-single")[0], brandUrls.HP)} aria-label="Browse HP products">
            <img
              src={getOptimizedImageUrl(getBannersForSection("hp-mobile", "home-brand-single")[0].image, { width: 768, height: 320, quality: 72 })}
              alt={getBannersForSection("hp-mobile", "home-brand-single")[0].title || "HP Products Banner Mobile"}
              className="w-full h-full bg-cover rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "11.png";
              }}
            />
          </Link>
        ) : (
          <Link to={brandUrls.HP} aria-label="Browse HP products">
            <img
              src="11.png"
              alt="HP Products Banner Mobile"
              className="w-full h-full bg-cover rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
            />
          </Link>
        )}
      </div>


      {/* Desktop Banner - HP and Dell (Dynamic) */}
      <div className="hidden md:flex gap-2 mx-5 md:mx-9 h-[270px]">
        {(() => {
          const banners = getBannersForSection("hp-dell-desktop", "home-brand-dual")
          const hpBanner = banners[0]
          const dellBanner = banners[1]

          return (
            <>
              <div className="w-1/2">
                {hpBanner ? (
                  <Link to={getBannerLink(hpBanner, brandUrls.HP)}>
                    <img
                      src={getOptimizedImageUrl(hpBanner.image, { width: 652, height: 270, quality: 70 })}
                      alt={hpBanner.title || "HP Products Banner"}
                      className="w-full h-full bg-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onError={(e) => handleBannerImageError(e, hpBanner.image)}
                    />
                  </Link>
                ) : (
                  <Link to={brandUrls.HP}>
                    <img
                      src={LIGHT_BANNER_FALLBACK}
                      alt="HP Products Banner"
                      className="w-full h-full bg-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    />
                  </Link>
                )}
              </div>
              <div className="w-1/2">
                {dellBanner ? (
                  <Link to={getBannerLink(dellBanner, brandUrls.Dell)}>
                    <img
                      src={getOptimizedImageUrl(dellBanner.image, { width: 652, height: 270, quality: 70 })}
                      alt={dellBanner.title || "Dell Products Banner"}
                      className="w-full h-full bg-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onError={(e) => handleBannerImageError(e, dellBanner.image)}
                    />
                  </Link>
                ) : (
                  <Link to={brandUrls.Dell}>
                    <img
                      src={LIGHT_BANNER_FALLBACK}
                      alt="Dell Products Banner"
                      className="w-full h-full bg-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    />
                  </Link>
                )}
              </div>
            </>
          )
        })()}
      </div>

      {/* HP and Dell Section - Mobile shows only HP */}
      <section className="py-8 mx-5 md:mx-9">
        <div className="flex flex-col md:flex-row gap-6">
          {/* HP Products */}
          <div className="w-full md:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">HP Products</h2>
              </div>
              <button
                onClick={() => handleBrandClick("HP")}
                className="text-[#505e4d] hover:text-[#465342] font-medium flex items-center text-sm"
              >
                View All HP
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {hpProducts.length > 0 ? (
                <>
                  {hpProducts.slice(0, 2).map((product) => (
                    <HomeStyleProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {hpProducts[2] && <HomeStyleProductCard product={hpProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">No HP products available</div>
              )}
            </div>
          </div>

          {/* Dell Products - Hidden on Mobile */}
          <div className="w-full md:w-1/2 hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Dell Products</h2>
              </div>
              <button
                onClick={() => handleBrandClick("Dell")}
                className="text-[#505e4d] hover:text-[#465342] font-medium flex items-center text-sm"
              >
                View All Dell
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dellProducts.length > 0 ? (
                <>
                  {dellProducts.slice(0, 2).map((product) => (
                    <HomeStyleProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {dellProducts[2] && <HomeStyleProductCard product={dellProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">No Dell products available</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Section Position 3 */}
      {renderDynamicSection(3)}

      {/* Accessories Banner - Dynamic */}
      <div className="mx-5 md:mx-9 my-4 h-[160px] lg:h-[300px]">
        {getBannersForSection("accessories", "home-category-banner").length > 0 ? (
          <Link to={getLocalizedPath(getBannersForSection("accessories", "home-category-banner")[0].link || "/product-category/accessories")}>
            <img
              src={getOptimizedImageUrl(getBannersForSection("accessories", "home-category-banner")[0].image, { width: 1311, height: 300, quality: 68 })}
              alt={getBannersForSection("accessories", "home-category-banner")[0].title || "Accessories Promotion Banner"}
              className="w-full h-full cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                if (window.innerWidth < 1024) {
                  e.target.src = "12.png";
                } else {
                  e.target.src = LIGHT_ACCESSORIES_DESKTOP_FALLBACK;
                }
              }}
            />
          </Link>
        ) : (
          <Link to={getLocalizedPath("/product-category/accessories")}>
            <img
              src="12.png"
              alt="Accessories Promotion Banner Mobile"
              className="w-full h-full cover rounded-lg lg:hidden"
            />
            <img
              src={LIGHT_ACCESSORIES_DESKTOP_FALLBACK}
              alt="Accessories Promotion Banner Desktop"
              className="w-full h-full cover rounded-lg hidden lg:block"
            />
          </Link>
        )}
      </div>

      {/* Accessories Section - Mobile shows 2 products */}
      <section className="py-8 mx-5 md:mx-9">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900"><TranslatedText>Accessories</TranslatedText></h2>
          <button
            onClick={() => handleCategoryClick("Accessories")}
            className="text-[#505e4d] hover:text-[#465342] font-medium flex items-center"
          >
            <TranslatedText>See All Products</TranslatedText>
            <ChevronRight className="ml-1" size={16} />
          </button>
        </div>

        {accessoriesProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {accessoriesProducts.slice(0, 2).map((product) => (
              <HomeStyleProductCard key={product._id} product={product} />
            ))}
            {accessoriesProducts.slice(2, 18).map((product) => (
              <div key={product._id} className="hidden md:block">
                <HomeStyleProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p><TranslatedText>No accessories products available</TranslatedText></p>
          </div>
        )}
      </section>
      {/* <CategoryBanners /> */}
      {/* Dynamic Section Position 4 */}
      {renderDynamicSection(4)}

      {false && (
        <>
      {/* Mobile Banner Asus (Dynamic) */}
      <div className="md:hidden rounded-lg shadow-lg mx-3 h-[160px]">
        {getBannersForSection("asus-mobile", "home-brand-single").length > 0 ? (
          <Link to={getBannerLink(getBannersForSection("asus-mobile", "home-brand-single")[0], brandUrls.ASUS)} aria-label="Browse ASUS products">
            <img
              src={getOptimizedImageUrl(getBannersForSection("asus-mobile", "home-brand-single")[0].image, { width: 768, height: 320, quality: 72 })}
              alt={getBannersForSection("asus-mobile", "home-brand-single")[0].title || "ASUS Products Banner Mobile"}
              className="w-full h-full cover rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "laptop (2).png";
              }}
            />
          </Link>
        ) : (
          <Link to={brandUrls.ASUS} aria-label="Browse ASUS products">
            <img
              src="laptop (2).png"
              alt="ASUS Products Banner Mobile"
              className="w-full h-full cover rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
            />
          </Link>
        )}
      </div>

      {/* Desktop Banner - Acer and ASUS (Dynamic) */}
      <div className="hidden md:flex gap-2 mx-3 h-[270px]">
        {(() => {
          const banners = getBannersForSection("acer-asus-desktop", "home-brand-dual")
          const acerBanner = banners[0]
          const asusBanner = banners[1]

          return (
            <>
              <div className="w-1/2">
                {acerBanner ? (
                  <Link to={getBannerLink(acerBanner, brandUrls.Acer)}>
                    <img
                      src={getOptimizedImageUrl(acerBanner.image, { width: 652, height: 270, quality: 70 })}
                      alt={acerBanner.title || "Acer Products Banner"}
                      className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onError={(e) => handleBannerImageError(e, acerBanner.image)}
                    />
                  </Link>
                ) : (
                  <Link to={brandUrls.Acer}>
                    <img
                      src={LIGHT_BANNER_FALLBACK}
                      alt="Acer Products Banner"
                      className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    />
                  </Link>
                )}
              </div>
              <div className="w-1/2">
                {asusBanner ? (
                  <Link to={getBannerLink(asusBanner, brandUrls.ASUS)}>
                    <img
                      src={getOptimizedImageUrl(asusBanner.image, { width: 652, height: 270, quality: 70 })}
                      alt={asusBanner.title || "ASUS Products Banner"}
                      className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onError={(e) => handleBannerImageError(e, asusBanner.image)}
                    />
                  </Link>
                ) : (
                  <Link to={brandUrls.ASUS}>
                    <img
                      src={LIGHT_BANNER_FALLBACK}
                      alt="ASUS Products Banner"
                      className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    />
                  </Link>
                )}
              </div>
            </>
          )
        })()}
      </div>

      {/* Acer and ASUS Section - Mobile shows only ASUS */}
      <section className="py-8 mx-3">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Acer Products - Hidden on Mobile */}
          <div className="w-full md:w-1/2 hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900"><TranslatedText>Shop Acer</TranslatedText></h2>
              </div>
              <button
                onClick={() => handleBrandClick("Acer")}
                className="text-[#505e4d] hover:text-[#465342] font-medium flex items-center text-sm"
              >
                <TranslatedText>See All</TranslatedText>
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {acerProducts.length > 0 ? (
                <>
                  {acerProducts.slice(0, 2).map((product) => (
                    <HomeStyleProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {acerProducts[2] && <HomeStyleProductCard product={acerProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500"><TranslatedText>No Acer products available</TranslatedText></div>
              )}
            </div>
          </div>

          {/* ASUS Products */}
          <div className="w-full md:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-900"><TranslatedText>Shop Asus</TranslatedText></h2>
              </div>
              <button
                onClick={() => handleBrandClick("ASUS")}
                className="text-[#505e4d] hover:text-[#465342] font-medium flex items-center text-sm"
              >
                <TranslatedText>See All</TranslatedText>
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {asusProducts.length > 0 ? (
                <>
                  {asusProducts.slice(0, 2).map((product) => (
                    <HomeStyleProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {asusProducts[2] && <HomeStyleProductCard product={asusProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">
                  <TranslatedText>No ASUS products available</TranslatedText>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
        </>
      )}

      {/* Dynamic Section Position 5 */}
      {renderDynamicSection(5)}

      {false && (
        <>
      {/* Networking Banner - Dynamic */}
      <div className="mx-3 my-4 h-[160px] lg:h-[300px]">
        {getBannersForSection("networking", "home-category-banner").length > 0 ? (
          <Link to={getLocalizedPath(getBannersForSection("networking", "home-category-banner")[0].link || "/product-category/computers/networking")}>
            <img
              src={getOptimizedImageUrl(getBannersForSection("networking", "home-category-banner")[0].image, { width: 1311, height: 300, quality: 68 })}
              alt={getBannersForSection("networking", "home-category-banner")[0].title || "Networking Banner"}
              className="w-full h-full cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                if (window.innerWidth < 1024) {
                  e.target.src = "13.png";
                } else {
                  e.target.src = LIGHT_NETWORKING_DESKTOP_FALLBACK;
                }
              }}
            />
          </Link>
        ) : (
          <Link to={getLocalizedPath("/product-category/computers/networking")}>
            <img
              src="13.png"
              alt="Networking Banner Mobile"
              className="w-full h-full cover rounded-lg lg:hidden"
            />
            <img
              src={LIGHT_NETWORKING_DESKTOP_FALLBACK}
              alt="Networking Banner Desktop"
              className="w-full h-full cover rounded-lg hidden lg:block"
            />
          </Link>
        )}
      </div>

      {/* Networking Products Section - Mobile shows 2 products */}
      <section className="py-8 mx-3">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900"><TranslatedText>Networking</TranslatedText></h2>
          <button
            onClick={() => handleCategoryClick("Networking")}
            className="text-[#505e4d] hover:text-[#465342] font-medium flex items-center"
          >
            See All Products
            <ChevronRight className="ml-1" size={16} />
          </button>
        </div>

        {networkingProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {networkingProducts.slice(0, 2).map((product) => (
              <HomeStyleProductCard key={product._id} product={product} />
            ))}
            {networkingProducts.slice(2, 6).map((product) => (
              <div key={product._id} className="hidden md:block">
                <HomeStyleProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p><TranslatedText>No networking products available</TranslatedText></p>
          </div>
        )}
      </section>
        </>
      )}

      {/* Dynamic Section Position 6 */}
      {renderDynamicSection(6)}

      {false && (
        <>
      {/* Mobile Banner MSI (Dynamic) */}
      <div className="md:hidden rounded-lg shadow-lg mx-3 h-[160px]">
        {getBannersForSection("msi-mobile", "home-brand-single").length > 0 ? (
          <Link to={getBannerLink(getBannersForSection("msi-mobile", "home-brand-single")[0], brandUrls.MSI)} aria-label="Browse MSI products">
            <img
              src={getOptimizedImageUrl(getBannersForSection("msi-mobile", "home-brand-single")[0].image, { width: 768, height: 320, quality: 72 })}
              alt={getBannersForSection("msi-mobile", "home-brand-single")[0].title || "MSI Products Banner Mobile"}
              className="w-full h-full cover rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "14.png";
              }}
            />
          </Link>
        ) : (
          <Link to={brandUrls.MSI} aria-label="Browse MSI products">
            <img
              src="14.png"
              alt="MSI Products Banner Mobile"
              className="w-full h-full cover rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
            />
          </Link>
        )}
      </div>

      {/* Desktop Banner - MSI and Lenovo (Dynamic) */}
      <div className="hidden md:flex gap-2 mx-3 h-[270px]">
        {(() => {
          const banners = getBannersForSection("msi-lenovo-desktop", "home-brand-dual")
          const msiBanner = banners[0]
          const lenovoBanner = banners[1]

          return (
            <>
              <div className="w-1/2">
                {msiBanner ? (
                  <Link to={getBannerLink(msiBanner, brandUrls.MSI)}>
                    <img
                      src={getOptimizedImageUrl(msiBanner.image, { width: 652, height: 270, quality: 70 })}
                      alt={msiBanner.title || "MSI Products Banner"}
                      className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onError={(e) => handleBannerImageError(e, msiBanner.image)}
                    />
                  </Link>
                ) : (
                  <Link to={brandUrls.MSI}>
                    <img
                      src={LIGHT_BANNER_FALLBACK}
                      alt="MSI Products Banner"
                      className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    />
                  </Link>
                )}
              </div>
              <div className="w-1/2">
                {lenovoBanner ? (
                  <Link to={getBannerLink(lenovoBanner, brandUrls.Lenovo)}>
                    <img
                      src={getOptimizedImageUrl(lenovoBanner.image, { width: 652, height: 270, quality: 70 })}
                      alt={lenovoBanner.title || "Lenovo Products Banner"}
                      className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onError={(e) => handleBannerImageError(e, lenovoBanner.image)}
                    />
                  </Link>
                ) : (
                  <Link to={brandUrls.Lenovo}>
                    <img
                      src={LIGHT_BANNER_FALLBACK}
                      alt="Lenovo Products Banner"
                      className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    />
                  </Link>
                )}
              </div>
            </>
          )
        })()}
      </div>

      {/* MSI and Lenovo Products Section - Mobile shows only MSI */}
      <section className="py-8 mx-3">
        <div className="flex flex-col md:flex-row gap-6">
          {/* MSI Products */}
          <div className="w-full md:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-900"><TranslatedText>Shop MSI</TranslatedText></h2>
              </div>
              <button
                onClick={() => handleBrandClick("MSI")}
                className="text-[#505e4d] hover:text-[#465342] font-medium flex items-center text-sm"
              >
                <TranslatedText>See All</TranslatedText>
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {msiProducts.length > 0 ? (
                <>
                  {msiProducts.slice(0, 2).map((product) => (
                    <HomeStyleProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {msiProducts[2] && <HomeStyleProductCard product={msiProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500"><TranslatedText>No MSI products available</TranslatedText></div>
              )}
            </div>
          </div>

          {/* Lenovo Products - Hidden on Mobile */}
          <div className="w-full md:w-1/2 hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900"><TranslatedText>Shop Lenovo</TranslatedText></h2>
              </div>
              <button
                onClick={() => handleBrandClick("Lenovo")}
                className="text-[#505e4d] hover:text-[#465342] font-medium flex items-center text-sm"
              >
                <TranslatedText>See All</TranslatedText>
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {lenovoProducts.length > 0 ? (
                <>
                  {lenovoProducts.slice(0, 2).map((product) => (
                    <HomeStyleProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {lenovoProducts[2] && <HomeStyleProductCard product={lenovoProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500"><TranslatedText>No Lenovo products available</TranslatedText></div>
              )}
            </div>
          </div>
        </div>
      </section>
        </>
      )}

      {/* Dynamic Section Position 7 */}
      {renderDynamicSection(7)}

      {false && (
        <>
      {/* Mobile Banner Apple (Dynamic) */}
      <div className="md:hidden rounded-lg shadow-lg mx-3 h-[160px]">
        {getBannersForSection("apple-mobile", "home-brand-single").length > 0 ? (
          <Link to={getBannerLink(getBannersForSection("apple-mobile", "home-brand-single")[0], brandUrls.Apple)} aria-label="Browse Apple products">
            <img
              src={getOptimizedImageUrl(getBannersForSection("apple-mobile", "home-brand-single")[0].image, { width: 768, height: 320, quality: 72 })}
              alt={getBannersForSection("apple-mobile", "home-brand-single")[0].title || "Apple Products Banner Mobile"}
              className="w-full h-full cover rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "15.png";
              }}
            />
          </Link>
        ) : (
          <Link to={brandUrls.Apple} aria-label="Browse Apple products">
            <img
              src="15.png"
              alt="Apple Products Banner Mobile"
              className="w-full h-full cover rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
            />
          </Link>
        )}
      </div>

      {/* Desktop Banner - Apple and Samsung (Dynamic) */}
      <div className="hidden md:flex gap-2 mx-3 h-[270px]">
        {(() => {
          const banners = getBannersForSection("apple-samsung-desktop", "home-brand-dual")
          const appleBanner = banners[0]
          const samsungBanner = banners[1]

          return (
            <>
              <div className="w-1/2">
                {appleBanner ? (
                  <Link to={getBannerLink(appleBanner, brandUrls.Apple)}>
                    <img
                      src={getOptimizedImageUrl(appleBanner.image, { width: 652, height: 270, quality: 70 })}
                      alt={appleBanner.title || "Apple Products Banner"}
                      className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onError={(e) => handleBannerImageError(e, appleBanner.image)}
                    />
                  </Link>
                ) : (
                  <Link to={brandUrls.Apple}>
                    <img
                      src={LIGHT_BANNER_FALLBACK}
                      alt="Apple Products Banner"
                      className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    />
                  </Link>
                )}
              </div>
              <div className="w-1/2">
                {samsungBanner ? (
                  <Link to={getBannerLink(samsungBanner, brandUrls.Samsung)}>
                    <img
                      src={getOptimizedImageUrl(samsungBanner.image, { width: 652, height: 270, quality: 70 })}
                      alt={samsungBanner.title || "Samsung Products Banner"}
                      className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onError={(e) => handleBannerImageError(e, samsungBanner.image)}
                    />
                  </Link>
                ) : (
                  <Link to={brandUrls.Samsung}>
                    <img
                      src={LIGHT_BANNER_FALLBACK}
                      alt="Samsung Products Banner"
                      className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    />
                  </Link>
                )}
              </div>
            </>
          )
        })()}
      </div>



      {/* Apple and Samsung Products Section - Mobile shows only Apple */}
      <section className="py-8 mx-3">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Apple Products */}
          <div className="w-full md:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-900"><TranslatedText>Shop Apple</TranslatedText></h2>
              </div>
              <button
                onClick={() => handleBrandClick("Apple")}
                className="text-[#505e4d] hover:text-[#465342] font-medium flex items-center text-sm"
              >
                See All
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {appleProducts.length > 0 ? (
                <>
                  {appleProducts.slice(0, 2).map((product) => (
                    <HomeStyleProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {appleProducts[2] && <HomeStyleProductCard product={appleProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">
                  <TranslatedText>No Apple products available</TranslatedText>
                </div>
              )}
            </div>
          </div>

          {/* Samsung Products - Hidden on Mobile */}
          <div className="w-full md:w-1/2 hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900"><TranslatedText>Shop Samsung</TranslatedText></h2>
              </div>
              <button
                onClick={() => handleBrandClick("Samsung")}
                className="text-[#505e4d] hover:text-[#465342] font-medium flex items-center text-sm"
              >
                See All
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {samsungProducts.length > 0 ? (
                <>
                  {samsungProducts.slice(0, 2).map((product) => (
                    <HomeStyleProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {samsungProducts[2] && <HomeStyleProductCard product={samsungProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500"><TranslatedText>No Samsung products available</TranslatedText></div>
              )}
            </div>
          </div>
        </div>
      </section>
        </>
      )}

      {/* Dynamic Section Position 8 */}
      {renderDynamicSection(8)}
      {/* Upgrade Features Section - Responsive */}
      {upgradeFeatures.length > 0 && (
        <section className="py-8 md:py-12 bg-gradient-to-br from-blue-50 to-indigo-100 mx-3 rounded-lg my-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"><TranslatedText>Upgrade Features</TranslatedText></h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                <TranslatedText>Discover the latest technology upgrades and premium features available for your devices</TranslatedText>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {upgradeFeatures.map((feature) => (
                <UpgradeFeatureCard key={feature._id} feature={feature} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Section Position 9 */}
      {renderDynamicSection(9)}

      {/* Featured Brands Section - Use BrandSlider component */}
      {brands.length > 0 && <BrandSlider brands={brands} onBrandClick={handleBrandClick} />}

      {/* Dynamic Section Position 10 */}
      {renderDynamicSection(10)}

      {/* Core Service Section - Updated UI */}
      <section className="py-8 md:py-12 mt-2">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="relative overflow-hidden rounded-2xl bg-white px-4 py-6 sm:px-6 md:px-8 md:py-9">
            <h2 className="relative text-lg sm:text-xl lg:text-2xl font-bold text-center text-slate-900 mb-5 md:mb-8">
              <TranslatedText>Core Service Aspects</TranslatedText>
            </h2>

            <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              <Link
                to={getLocalizedPath("/terms-conditions")}
                className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block"
              >
                <div className="mx-auto w-12 h-12 md:w-14 md:h-14 rounded-xl bg-lime-50 flex items-center justify-center mb-3">
                  <CreditCard className="w-6 h-6 md:w-7 md:h-7 text-[#505e4d]" />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
                  <TranslatedText>Secure Payment Method</TranslatedText>
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  <TranslatedText>Available Different secure Payment Methods</TranslatedText>
                </p>
              </Link>

              <Link
                to={getLocalizedPath("/delivery-terms")}
                className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block"
              >
                <div className="mx-auto w-12 h-12 md:w-14 md:h-14 rounded-xl bg-lime-50 flex items-center justify-center mb-3">
                  <Truck className="w-6 h-6 md:w-7 md:h-7 text-[#505e4d]" />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
                  <TranslatedText>Extreme Fast Delivery</TranslatedText>
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  <TranslatedText>Fast and convenient From door to door delivery</TranslatedText>
                </p>
              </Link>

              <Link
                to={getLocalizedPath("/refund-return")}
                className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block"
              >
                <div className="mx-auto w-12 h-12 md:w-14 md:h-14 rounded-xl bg-lime-50 flex items-center justify-center mb-3">
                  <Heart className="w-6 h-6 md:w-7 md:h-7 text-[#505e4d]" />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
                  <TranslatedText>Quality & Savings</TranslatedText>
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  <TranslatedText>Comprehensive quality control and affordable price</TranslatedText>
                </p>
              </Link>

              <Link
                to={getLocalizedPath("/contact")}
                className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block"
              >
                <div className="mx-auto w-12 h-12 md:w-14 md:h-14 rounded-xl bg-lime-50 flex items-center justify-center mb-3">
                  <Headphones className="w-6 h-6 md:w-7 md:h-7 text-[#505e4d]" />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
                  <TranslatedText>Professional Support</TranslatedText>
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  <TranslatedText>Efficient customer support from passionate team</TranslatedText>
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(32px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
      `}</style>
    </div>
  )
}

const MobileProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { getLocalizedPath } = useLanguage()
  // Use dynamic discount
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  // Use dynamic stock status
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
  // Use dynamic price
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

  // Get category and brand names safely
  const categoryName = product.category?.name || "Unknown"

  return (
    <div className="border p-2 h-[410px] flex flex-col justify-between bg-white">
      <div className="relative mb-2 flex h-[170px] justify-center items-center">
        <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)}>
          <img
            src={getOptimizedImageUrl(product.image, { width: 220, height: 220, quality: 68 }) || "/placeholder.svg?height=120&width=120"}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="165"
            height="165"
            className="w-full h-full object-contain rounded mx-auto"
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

      <div className="flex items-center gap-1.5 mt-auto">
        <span className={`px-1.5 py-0.5 rounded text-[8px] xl:text-[10px] font-medium text-white ${getStatusColor(stockStatus)}`}>
          <TranslatedText text={stockStatus} sourceDoc={product} fieldName="stockStatus" />
        </span>
        {discount && (
          <span className="px-1.5 py-0.5 rounded text-[8px] xl:text-[10px] font-medium text-white bg-red-500">
            <TranslatedText text={discount} />
          </span>
        )}
      </div>

      <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)}>
        <h3 className="text-xs font-sm text-gray-900 line-clamp-3 hover:text-blue-600 h-[50px] mb-1"><TranslatedText text={product.name} sourceDoc={product} fieldName="name" /></h3>
      </Link>

      {product.category && <div className="text-xs text-yellow-600 mb-1"><TranslatedText>Category</TranslatedText>: <TranslatedText text={categoryName} sourceDoc={product.category} fieldName="name" /></div>}
      <div className="text-xs text-green-600 mb-1"><TranslatedText>Inclusive VAT</TranslatedText></div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-0 mb-1">
        <div className="text-red-600 font-bold text-sm">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-xs font-medium">
            {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>

      {/* Rating and Reviews Section - Fixed with 20px stars */}
      <div className="flex items-center mb-2 min-h-[24px]">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={17}
              className={`${i < Math.round(Number(product.rating) || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">({Number(product.numReviews) || 0})</span>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          e.target.style.transform = "scale(0.95)"
          setTimeout(() => {
            if (e.target) e.target.style.transform = "scale(1)"
          }, 100)
          addToCart(product)
        }}
        className="mt-auto w-full bg-lime-500 hover:bg-lime-400 border border-lime-300 hover:border-transparent text-black text-xs font-medium py-2 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
        disabled={stockStatus === "Out of Stock"}
      >
        <ShoppingBag size={12} />
        <TranslatedText>Add to Cart</TranslatedText>
      </button>
    </div>
  )
}

const DynamicBrandProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { getLocalizedPath } = useLanguage()
  // Use dynamic discount
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  // Use dynamic stock status
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
  // Use dynamic price
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

  // Fallback: compute discount % if not provided from admin and we have a valid offer
  let computedDiscount = null
  if (!discount && hasValidOffer && basePrice > 0 && offerPrice > 0) {
    const pct = Math.round(((basePrice - offerPrice) / basePrice) * 100)
    if (pct > 0) computedDiscount = `${pct}% Off`
  }
  const finalDiscountLabel = discount || computedDiscount

  // Fix rating and reviews display
  const rating = Number(product.rating) || 0
  const numReviews = Number(product.numReviews) || 0

  // Get category and brand names safely
  const categoryName = product.category?.name || "Unknown"

  return (
    <div className="border p-2 h-[410px] flex flex-col justify-between bg-white">
      <div className="relative mb-2 flex justify-center items-center" style={{ height: 190 }}>
        <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)} className="w-full h-full flex items-center justify-center">
          <img
            src={getOptimizedImageUrl(product.image, { width: 220, height: 220, quality: 68 }) || "/placeholder.svg?height=120&width=120"}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="165"
            height="165"
            className="w-full h-full object-contain bg-white rounded mx-auto mb-4"
            style={{ maxHeight: 165 }}
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
        {/* Status & Discount badges overlayed at bottom of image, always inside image area */}
        <div className="absolute inset-x-0 -bottom-2 px-2 flex flex-wrap items-center gap-2 z-10">
          <div className={`${getStatusColor(stockStatus)} text-white px-1 py-0.5 rounded text-[10px] font-medium shadow-sm`}><TranslatedText text={stockStatus} sourceDoc={product} fieldName="stockStatus" /></div>
          {finalDiscountLabel && (
            <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-[10px] font-medium shadow-sm">
              <TranslatedText text={finalDiscountLabel} />
            </div>
          )}
        </div>
      </div>

      <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)}>
        <h3 className="text-xs font-sm text-gray-900 line-clamp-3 hover:text-blue-600 h-[50px]"><TranslatedText text={product.name} sourceDoc={product} fieldName="name" /></h3>
      </Link>
      {product.category && <div className="text-xs text-yellow-600"><TranslatedText>Category</TranslatedText>: <TranslatedText text={categoryName} sourceDoc={product.category} fieldName="name" /></div>}
      <div className="text-xs text-green-600"><TranslatedText>Inclusive VAT</TranslatedText></div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0">
        <div className="text-red-600 font-bold text-sm">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-xs font-medium">
            {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>

      {/* Rating and Reviews Section - Fixed with 20px stars */}
      <div className="flex items-center min-h-[24px]">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={`${i < Math.round(Number(product.rating) || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">({Number(product.numReviews) || 0})</span>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          e.target.style.transform = "scale(0.95)"
          setTimeout(() => {
            if (e.target) e.target.style.transform = "scale(1)"
          }, 100)
          addToCart(product)
        }}
        className=" w-full bg-lime-500 hover:bg-lime-400 border border-lime-300 hover:border-transparent text-black text-xs font-medium py-2 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
        disabled={stockStatus === "Out of Stock"}
      >
        <ShoppingBag size={12} />
        <TranslatedText>Add to Cart</TranslatedText>
      </button>
    </div>
  )
}

const AccessoriesProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { getLocalizedPath } = useLanguage()
  // Use dynamic discount
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  // Use dynamic stock status
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
  // Use dynamic price
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

  // Fallback: compute discount % if not provided from admin
  let computedDiscount = null
  if (!discount && hasValidOffer && basePrice > 0 && offerPrice > 0) {
    const pct = Math.round(((basePrice - offerPrice) / basePrice) * 100)
    if (pct > 0) computedDiscount = `${pct}% Off`
  }
  const finalDiscountLabel = discount || computedDiscount

  // Fix rating and reviews display
  const rating = Number(product.rating) || 0
  const numReviews = Number(product.numReviews) || 0

  // Get category and brand names safely
  const categoryName = product.category?.name || "Unknown"

  return (
    <div className="border p-2 h-[410px] flex flex-col justify-between bg-white">
      <div className="relative mb-2 flex justify-center items-center" style={{ height: 190 }}>
        <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)} className="w-full h-full flex items-center justify-center">
          <img
            src={getOptimizedImageUrl(product.image, { width: 220, height: 220, quality: 68 }) || "/placeholder.svg?height=120&width=120"}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="165"
            height="165"
            className="w-full h-full object-contain bg-white rounded mx-auto mb-4"
            style={{ maxHeight: 165 }}
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
        {/* Status & Discount badges overlayed at bottom of image, always inside image area */}
        <div className="absolute inset-x-0 -bottom-2 px-2 flex flex-wrap items-center gap-2 z-10">
          <div className={`${getStatusColor(stockStatus)} text-white px-1 py-0.5 rounded text-[10px] font-medium shadow-sm`}><TranslatedText text={stockStatus} sourceDoc={product} fieldName="stockStatus" /></div>
          {finalDiscountLabel && (
            <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-[10px] font-medium shadow-sm">
              <TranslatedText text={finalDiscountLabel} />
            </div>
          )}
        </div>
      </div>
      <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)}>
        <h3 className="text-xs font-sm text-gray-900 line-clamp-3 hover:text-blue-600 h-[50px]"><TranslatedText text={product.name} sourceDoc={product} fieldName="name" /></h3>
      </Link>
      {product.category && <div className="text-xs text-yellow-600"><TranslatedText>Category</TranslatedText>: <TranslatedText text={categoryName} sourceDoc={product.category} fieldName="name" /></div>}
      <div className="text-xs text-green-600"><TranslatedText>Inclusive VAT</TranslatedText></div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0">
        <div className="text-red-600 font-bold text-sm">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-xs font-medium">
            {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>

      {/* Rating and Reviews Section - Fixed with 20px stars */}
      <div className="flex items-center min-h-[24px]">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={`${i < Math.round(Number(product.rating) || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">({Number(product.numReviews) || 0})</span>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          e.target.style.transform = "scale(0.95)"
          setTimeout(() => { if (e.target) e.target.style.transform = "scale(1)" }, 100)
          addToCart(product)
        }}
        className=" w-full bg-lime-500 hover:bg-lime-400 border border-lime-300 hover:border-transparent text-black text-xs font-medium py-2 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
        disabled={stockStatus === "Out of Stock"}
      >
        <ShoppingBag size={12} />
        <TranslatedText>Add to Cart</TranslatedText>
      </button>
    </div>
  )
}

const UpgradeFeatureCard = ({ feature }) => {
  const getIconComponent = (iconName) => {
    const iconMap = {
      zap: Zap,
      shield: Shield,
      award: Award,
      "check-circle": CheckCircle,
      star: Star,
      heart: Heart,
      truck: Truck,
      "credit-card": CreditCard,
      headphones: Headphones,
    }

    const IconComponent = iconMap[iconName?.toLowerCase()] || Zap
    return <IconComponent className="w-6 h-6 md:w-8 md:h-8" />
  }

  return (
    <div className="rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="flex items-start space-x-4">
        <div
          className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${feature.iconColor || "bg-blue-100"
            } group-hover:scale-110 transition-transform duration-300`}
        >
          <div className={`${feature.iconTextColor || "text-blue-600"}`}>{getIconComponent(feature.icon)}</div>
        </div>

        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            <TranslatedText text={feature.title} sourceDoc={feature} fieldName="title" />
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            <TranslatedText text={feature.description} sourceDoc={feature} fieldName="description" />
          </p>

          {feature.features && feature.features.length > 0 && (
            <ul className="space-y-1 mb-4">
              {feature.features.map((item, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {feature.price && (
            <div className="flex items-center justify-between">
              <div className="text-base md:text-lg font-bold text-gray-900">
                {feature.price}
                {feature.originalPrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">{feature.originalPrice}</span>
                )}
              </div>

              {feature.ctaText && (
                <button className="px-3 py-1 md:px-4 md:py-2 bg-blue-600 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  {feature.ctaText}
                </button>
              )}
            </div>
          )}

          {feature.badge && (
            <div className="mt-3">
              <span
                className={`inline-block px-2 py-1 md:px-3 md:py-1 text-xs font-medium rounded-full ${feature.badgeColor || "bg-green-100 text-green-800"
                  }`}
              >
                <TranslatedText text={feature.badge} sourceDoc={feature} fieldName="badge" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const getStatusColor = (status) => {
  if (status === "In Stock") return "bg-green-600"
  if (status === "Out of Stock") return "bg-red-600"
  if (status === "PreOrder") return "bg-yellow-500"
  return "bg-gray-400"
}

export default Home




