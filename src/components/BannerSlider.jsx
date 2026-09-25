"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { getFullImageUrl } from "../utils/imageUtils"
import { useLanguage } from "../context/LanguageContext"


const debugHeroBanners = (...args) => {
  if (import.meta?.env?.VITE_DEBUG_BANNERS === "true") {
    console.log("[DEBUG_BANNERS_HERO]", ...args)
  }
}

const BannerSlider = ({ banners = [], loading = false }) => {
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
    // While the homepage request is in flight show a neutral skeleton; once
    // loaded with nothing to show, render nothing rather than a placeholder image.
    if (!loading) return null
    return (
      <section className="relative w-[96%] sm:w-[95%] lg:w-[94%] mx-auto overflow-hidden py-2 sm:py-3">
        <div className="w-full bg-gray-200 animate-pulse rounded-2xl aspect-[2475/849]" />
      </section>
    )
  }

  const renderBannerContent = (banner, fetchPriority = "auto") => {
    if (!banner) return null

    const bannerImage = getFullImageUrl(banner.image)
    if (!bannerImage) return null

    const content = (
      <div className="relative block w-full">
        <img
          src={bannerImage}
          alt={banner.title || "Banner"}
          fetchPriority={fetchPriority}
          loading={fetchPriority === "high" ? "eager" : "lazy"}
          width="2475"
          height="849"
          className="block w-full h-auto"
        />
        <div className="absolute inset-0 bg-black bg-opacity-10" />
      </div>
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
          <a href={link} target="_blank" rel="noopener noreferrer" className="block w-full cursor-pointer">
            {content}
          </a>
        )
      }

      return (
        <Link to={getLocalizedPath(link)} className="block w-full cursor-pointer">
          {content}
        </Link>
      )
    }

    return <div className="block w-full">{content}</div>
  }

  return (
    <section
      className="relative w-[96%] sm:w-[95%] lg:w-[94%] mx-auto py-2 sm:py-3"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="relative w-full overflow-hidden rounded-2xl">
        <div className="relative w-full">
          {renderBannerContent(currentBanner, "high")}
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
