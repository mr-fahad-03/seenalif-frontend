"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { getOptimizedImageUrl } from "../utils/imageUtils"
import { useLanguage } from "../context/LanguageContext"

const FALLBACK_BANNER_IMAGE =
  "https://api.grabatoz.ae/uploads//banners/banner-projector_final-1767447672755-684802807.webp"

const debugHeroBanners = (...args) => {
  if (import.meta?.env?.VITE_DEBUG_BANNERS === "true") {
    console.log("[DEBUG_BANNERS_HERO]", ...args)
  }
}

const BannerSlider = ({ banners = [] }) => {
  const { getLocalizedPath } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length, isAutoPlaying])

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const currentBanner = banners[currentSlide]

  useEffect(() => {
    if (!currentBanner) return
    debugHeroBanners("slide:single", {
      index: currentSlide,
      id: currentBanner._id,
      title: currentBanner.title,
    })
  }, [currentSlide, currentBanner])

  if (!banners || banners.length === 0) {
    return (
      <section className="relative w-[96%] sm:w-[95%] lg:w-[94%] mx-auto h-[170px] sm:h-[250px] md:h-[300px] lg:h-[310px] overflow-hidden">
        <div className="w-full h-full bg-gray-200 animate-pulse rounded-2xl" />
      </section>
    )
  }

  const renderBannerContent = (banner, imageWidth, fetchPriority = "auto") => {
    if (!banner) return null

    const bannerImage =
      getOptimizedImageUrl(banner.image, { width: imageWidth, height: 400, quality: 68 }) || FALLBACK_BANNER_IMAGE

    const content = (
      <>
        <img
          src={bannerImage}
          alt={banner.title || "Banner"}
          fetchPriority={fetchPriority}
          loading={fetchPriority === "high" ? "eager" : "lazy"}
          width="1600"
          height="620"
          className="block w-full h-full bg-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-10" />
      </>
    )

    const hasValidLink = typeof banner.buttonLink === "string" && banner.buttonLink.trim() !== ""

    if (hasValidLink) {
      const link = banner.buttonLink.trim()
      const isExternal = link.startsWith("http://") || link.startsWith("https://")

      debugHeroBanners("slide:computedLink", {
        id: banner._id,
        rawButtonLink: banner.buttonLink,
        computedLink: link,
        isExternal,
        localized: isExternal ? link : getLocalizedPath(link),
      })

      if (isExternal) {
        return (
          <a href={link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 cover cursor-pointer">
            {content}
          </a>
        )
      }

      return (
        <Link to={getLocalizedPath(link)} className="absolute inset-0 cover cursor-pointer">
          {content}
        </Link>
      )
    }

    return <div className="absolute inset-0 cover">{content}</div>
  }

  return (
    <section
      className="relative w-[96%] sm:w-[95%] lg:w-[94%] mx-auto py-2 sm:py-3"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="relative h-[170px] sm:h-[250px] md:h-[300px] lg:h-[310px] w-full overflow-hidden">
        <div className="h-full w-full relative overflow-hidden rounded-2xl">
          {renderBannerContent(currentBanner, 1600, "high")}
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 p-3 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full transition-all z-10 hidden sm:block"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 p-3 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full transition-all z-10 hidden sm:block"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </section>
  )
}

export default BannerSlider
