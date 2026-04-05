import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import config from '../config/config'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getFullImageUrl } from '../utils/imageUtils'
import TranslatedText from './TranslatedText'

function DynamicSection({ section }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (section?.slug) {
      fetchSectionCards()
    }
  }, [section?.slug])

  const fetchSectionCards = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/banner-cards/section/${section.slug}`)
      setCards(data.filter(card => card.isActive))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching section cards:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    )
  }

  if (cards.length === 0) {
    return null
  }

  const settings = section.settings || {}

  // Render based on section type
  switch (section.sectionType) {
    case 'background-image':
      return <BackgroundImageSection section={section} cards={cards} settings={settings} />
    
    case 'arrow-slider':
      return <ArrowSliderSection section={section} cards={cards} settings={settings} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
    
    case 'cards-left-image-right':
      return <CardsLeftImageRightSection section={section} cards={cards} settings={settings} />
    
    case 'cards-right-image-left':
      return <CardsRightImageLeftSection section={section} cards={cards} settings={settings} />
    
    case 'simple-cards':
      return <SimpleCardsSection section={section} cards={cards} settings={settings} />
    
    case 'vertical-grid':
      return <VerticalGridSection section={section} cards={cards} settings={settings} />
    
    default:
      return <SimpleCardsSection section={section} cards={cards} settings={settings} />
  }
}

// Background Image Section - 5 cards on background
function BackgroundImageSection({ section, cards, settings }) {
  const bgImage = settings.backgroundImage ? getFullImageUrl(settings.backgroundImage) : ''
  const overlayOpacity = settings.overlayOpacity || 0.2
  const cardsCount = settings.cardsCount || 5 // Get card count from settings

  return (
    <>
 
    <section 
      className="relative flex items-center"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '450px',
        paddingTop: '3rem',
        paddingBottom: '3rem',
      }}
    >
      {/* Overlay */}
      {bgImage && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      <div className="max-w-[1920px] mx-auto px-4 relative z-10 w-full">
       
        {/* Mobile: Show 2 cards in grid */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {cards.slice(0, 2).map((card) => {
            const cardBgColor = card.bgColor || '#ffffff'
            
            return (
              <Link
                key={card._id}
                to={card.linkUrl || '#'}
                className="p-4 hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden relative flex flex-col rounded-lg"
                style={{ 
                  minHeight: '280px',
                  maxHeight: '280px',
                  backgroundColor: cardBgColor,
                }}
              >
              <div className="relative z-10 flex-grow flex flex-col">
                <h3 className="text-sm font-bold mb-2 group-hover:text-gray-900 line-clamp-1 text-gray-800">
                  <TranslatedText text={card.name} sourceDoc={card} fieldName="name" />
                </h3>
                {card.details && (
                  <p className="text-xs mb-2 line-clamp-2 text-gray-600">
                    <TranslatedText text={card.details} sourceDoc={card} fieldName="details" />
                  </p>
                )}
                <span className="inline-flex items-center text-xs font-semibold text-blue-600 group-hover:text-blue-700 mt-auto">
                  <TranslatedText>Shop Now</TranslatedText>
                  <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
              
              {card.image && (
                <div className="mt-2 relative h-32 flex-shrink-0 overflow-hidden rounded-lg">
                  <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full object-cover" />
                </div>
              )}
            </Link>
            )
          })}
        </div>

        {/* Desktop: Show all cards based on cardsCount */}
        <div className="hidden md:flex gap-6 flex-nowrap justify-center">
          {cards.slice(0, cardsCount).map((card) => {
            const cardBgColor = card.bgColor || '#ffffff'
            const cardWidth = `calc(${100 / cardsCount}% - ${24 * (cardsCount - 1) / cardsCount}px)`
            
            return (
              <Link
                key={card._id}
                to={card.linkUrl || '#'}
                className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden relative flex flex-col flex-shrink-0 rounded-lg"
                style={{ 
                  width: cardWidth, 
                  minWidth: cardWidth,
                  minHeight: '320px',
                  maxHeight: '320px',
                  backgroundColor: cardBgColor,
                }}
              >
              <div className="relative z-10 flex-grow flex flex-col">
                <h3 className="text-lg font-bold mb-2 group-hover:text-gray-900 line-clamp-1 text-gray-800">
                  <TranslatedText text={card.name} sourceDoc={card} fieldName="name" />
                </h3>
                {card.details && (
                  <p className="text-sm mb-3 line-clamp-2 text-gray-600">
                    <TranslatedText text={card.details} sourceDoc={card} fieldName="details" />
                  </p>
                )}
                <span className="inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700 mt-auto">
                  <TranslatedText>Shop Now</TranslatedText>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
              
              {card.image && (
                <div className="mt-3 relative h-40 flex-shrink-0 overflow-hidden rounded-lg">
                  <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full object-cover" />
                </div>
              )}
            </Link>
            )
          })}
        </div>
      </div>
    </section>
    </>
  )
}

// Arrow Slider Section - 3-6 cards with arrows
function ArrowSliderSection({ section, cards, settings, currentIndex, setCurrentIndex }) {
  const desktopCardsCount = settings.cardsCount || 5
  const mobileCardsCount = 2 // Fixed 2 cards on mobile
  const showArrows = settings.showArrows !== false
  const backgroundColor = settings.backgroundColor || '#f3f4f6'
  
  // Use mobile count on small screens, desktop count otherwise
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const cardsCount = isMobile ? mobileCardsCount : desktopCardsCount

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(cards.length - cardsCount, prev + 1))
  }

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < cards.length - cardsCount
  const visibleCards = cards.slice(currentIndex, currentIndex + cardsCount)
  return (
    <>
    <div className="flex items-center justify-between mx-5 md:mx-9 mb-2 mt-4">
      <h2 className="text-2xl font-bold text-start text-gray-800"><TranslatedText text={section.name} sourceDoc={section} fieldName="name" /></h2>
      {/* Navigation Arrows - Inline with heading */}
      {showArrows && cards.length > cardsCount && (
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`border-2 rounded-lg p-2 md:p-3 transition-all group cursor-pointer 
              ${canGoPrev ? 'bg-white border-lime-500 hover:bg-lime-500 hover:border-lime-500' : 'bg-gray-100 border-gray-300 cursor-not-allowed'}`}
          >
            <ChevronLeft 
              className={`w-4 h-4 md:w-6 md:h-6 transition-colors 
                ${canGoPrev ? 'text-lime-500 group-hover:text-white' : 'text-gray-400'}`}
            />
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`border-2 rounded-lg p-2 md:p-3 transition-all group cursor-pointer 
              ${canGoNext ? 'bg-white border-lime-500 hover:bg-lime-500 hover:border-lime-500' : 'bg-gray-100 border-gray-300 cursor-not-allowed'}`}
          >
            <ChevronRight 
              className={`w-4 h-4 md:w-6 md:h-6 transition-colors 
                ${canGoNext ? 'text-lime-500 group-hover:text-white' : 'text-gray-400'}`}
            />
          </button>
        </div>
      )}
    </div>
    {section.description && (
      <p className="text-sm text-gray-600 mx-5 md:mx-9 mb-4"><TranslatedText text={section.description} sourceDoc={section} fieldName="description" /></p>
    )}
    <section className="py-6 md:py-12" style={{ backgroundColor }}>
      <div className="max-w-[1920px] mx-auto px-2 md:px-4">
        <div className="relative">

          {/* Cards */}
          <div className="flex gap-3 md:gap-6 px-2 md:px-12">
            {visibleCards.map((card) => (
              <Link
                key={card._id}
                to={card.linkUrl || '#'}
                className="bg-white rounded-lg border-2 border-gray-300 hover:border-gray-300 transition-all duration-300 hover:scale-105 group overflow-hidden relative flex flex-col flex-shrink-0"
                style={{ 
                  width: `calc(${100/cardsCount}% - ${(isMobile ? 12 : 24) * (cardsCount - 1) / cardsCount}px)`,
                  minHeight: isMobile ? '240px' : '320px',
                }}
              >
                {/* Full-size image background */}
                {card.image && (
                  <img src={getFullImageUrl(card.image)} alt={card.name} className="absolute inset-0 w-full h-full bg-cover" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

// Cards Left + Image Right Section - 3 cards on left (8-grid), image on right (4-grid) with one-by-one auto-sliding
function CardsLeftImageRightSection({ section, cards, settings }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0)
  const mobileSliderRef = useRef(null)
  const sideImage = settings.sideImage || ''
  const backgroundColor = settings.backgroundColor || '#f3f4f6'
  const autoSlideInterval = settings.autoSlideInterval || 3000 // Default 3 seconds

  // Auto-slide effect - moves one card at a time (desktop only)
  useEffect(() => {
    if (cards.length <= 3) return // No need to slide if 3 or fewer cards

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length) // Loop through all cards
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [cards.length, autoSlideInterval])

  // Handle mobile scroll to update active indicator
  const handleMobileScroll = (e) => {
    const container = e.target
    const scrollLeft = container.scrollLeft
    const containerWidth = container.offsetWidth
    const slideWidth = containerWidth
    const newIndex = Math.round(scrollLeft / slideWidth)
    
    if (newIndex !== mobileSlideIndex && newIndex >= 0 && newIndex < Math.ceil(cards.length / 2)) {
      setMobileSlideIndex(newIndex)
    }
  }

  // Get 3 cards with wrapping
  const getVisibleCards = () => {
    const result = []
    for (let i = 0; i < 3; i++) {
      result.push(cards[(currentIndex + i) % cards.length])
    }
    return result
  }

  const cardsToShow = cards.length >= 3 ? getVisibleCards() : cards

  
  return (
    <>
     <h2 className="text-2xl mx-5 font-bold mb-2 mt-4 text-start text-gray-800">{section.name}</h2>
     {section.description && (
       <p className="text-sm text-gray-600 mx-5 mb-4">{section.description}</p>
     )}
    
    {/* Mobile Layout */}
    <section className="md:hidden py-6" style={{ backgroundColor }}>
      <div className="max-w-[1920px] mx-auto px-4">
        {/* Side Image on Top */}
        {sideImage && (
          <div className="mb-6">
            <div className="rounded-lg overflow-hidden" style={{ height: '200px' }}>
              <img src={getFullImageUrl(sideImage)} alt={section.name} className="w-full h-full bg-cover" />
            </div>
          </div>
        )}

        {/* Cards Slider - Show 2 cards at a time */}
        <div 
          ref={mobileSliderRef}
          onScroll={handleMobileScroll}
          className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4"
        >
          <div className="flex gap-3 px-4" style={{ width: 'max-content' }}>
            {cards.map((card, index) => {
              // Group cards in pairs for mobile slider
              if (index % 2 === 0) {
                const nextCard = cards[index + 1]
                return (
                  <div key={`group-${index}`} className="flex gap-3 snap-center flex-shrink-0" style={{ width: 'calc(100vw - 2rem)' }}>
                    {/* First card in pair */}
                    <Link
                      to={card.linkUrl || '#'}
                      className="p-3 hover:shadow-xl transition-all duration-300 group overflow-hidden relative flex-shrink-0 flex-1"
                      style={{ 
                        minHeight: '280px',
                        maxHeight: '280px',
                        display: 'flex', 
                        flexDirection: 'column',
                        backgroundColor: card.bgColor || '#ffffff'
                      }}
                    >
                      {/* Text Content - Top Section */}
                      <div className="relative z-10 flex-grow pb-2" style={{ color: card.textColor || '#1f2937' }}>
                        <h3 className="text-sm font-bold mb-2 line-clamp-2">
                          <TranslatedText text={card.name} sourceDoc={card} fieldName="name" />
                        </h3>
                        {card.details && (
                          <p className="text-xs mb-2 line-clamp-2" style={{ opacity: 0.85 }}>
                            <TranslatedText text={card.details} sourceDoc={card} fieldName="details" />
                          </p>
                        )}
                        <span className="inline-flex items-center text-xs font-semibold">
                          <TranslatedText>Shop Now</TranslatedText>
                          <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                      
                      {/* Image - Fixed at Bottom */}
                      {card.image && (
                        <div className="relative w-full overflow-hidden rounded-lg mt-auto" style={{ height: '100px', flexShrink: 0 }}>
                          <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full bg-cover" />
                        </div>
                      )}
                    </Link>
                    
                    {/* Second card in pair (if exists) */}
                    {nextCard && (
                      <Link
                        to={nextCard.linkUrl || '#'}
                        className="p-3 hover:shadow-xl transition-all duration-300 group overflow-hidden relative flex-shrink-0 flex-1"
                        style={{ 
                          minHeight: '280px',
                          maxHeight: '280px',
                          display: 'flex', 
                          flexDirection: 'column',
                          backgroundColor: nextCard.bgColor || '#ffffff'
                        }}
                      >
                        {/* Text Content - Top Section */}
                        <div className="relative z-10 flex-grow pb-2" style={{ color: nextCard.textColor || '#1f2937' }}>
                          <h3 className="text-sm font-bold mb-2 line-clamp-2">
                            {nextCard.name}
                          </h3>
                          {nextCard.details && (
                            <p className="text-xs mb-2 line-clamp-2" style={{ opacity: 0.85 }}>
                              {nextCard.details}
                            </p>
                          )}
                          <span className="inline-flex items-center text-xs font-semibold">
                            <TranslatedText>Shop Now</TranslatedText>
                            <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                        
                        {/* Image - Fixed at Bottom */}
                        {nextCard.image && (
                          <div className="relative w-full overflow-hidden rounded-lg mt-auto" style={{ height: '100px', flexShrink: 0 }}>
                            <img src={getFullImageUrl(nextCard.image)} alt={nextCard.name} className="w-full h-full bg-cover" />
                          </div>
                        )}
                      </Link>
                    )}
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
        
        {/* Scroll indicator dots */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(cards.length / 2) }).map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === mobileSlideIndex 
                  ? 'bg-lime-500 w-6' 
                  : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </section>

    {/* Desktop Layout */}
    <section className="hidden md:block py-6" style={{ backgroundColor, minHeight: '380px', maxHeight: '380px' }}>
      <div className="max-w-[1920px] mx-auto px-4 h-full flex items-center">
        <div className="grid grid-cols-12 gap-6 w-full">
          {/* 3 Cards - 8 columns with one-by-one auto-sliding */}
          <div className="col-span-8 grid grid-cols-3 gap-6">
            {cardsToShow.map((card, index) => {
              const isCenterCard = index === 1 // Middle card
              const cardBgColor = card.bgColor || '#ffffff'
              const cardTextColor = card.textColor || '#1f2937'
              
              return (
                <Link
                  key={`${card._id}-${currentIndex}-${index}`}
                  to={card.linkUrl || '#'}
                  className={`p-4 hover:shadow-xl transition-all duration-500 group overflow-hidden relative ${
                    isCenterCard ? 'scale-105 shadow-xl z-10' : 'hover:scale-105'
                  }`}
                  style={{ 
                    minHeight: '320px', 
                    maxHeight: '320px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: cardBgColor
                  }}
                >
                  {/* Text Content - Top Section */}
                  <div className="relative z-10 flex-grow pb-2" style={{ color: cardTextColor }}>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      <TranslatedText text={card.name} sourceDoc={card} fieldName="name" />
                    </h3>
                    {card.details && (
                      <p className="text-xs mb-3 line-clamp-3" style={{ opacity: 0.85 }}>
                        <TranslatedText text={card.details} sourceDoc={card} fieldName="details" />
                      </p>
                    )}
                    <span className="inline-flex items-center text-sm font-semibold">
                      <TranslatedText>Shop Now</TranslatedText>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                  
                  {/* Image - Fixed at Bottom */}
                  {card.image && (
                    <div className="relative w-full overflow-hidden rounded-lg mt-auto" style={{ height: '120px', flexShrink: 0 }}>
                      <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full bg-cover" />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Side Image - 4 columns */}
          {sideImage && (
            <div className="col-span-4">
              <div className="rounded-lg overflow-hidden" style={{ height: '320px' }}>
                <img src={getFullImageUrl(sideImage)} alt={section.name} className="w-full h-full bg-cover" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
    </>
  )
}

// Cards Right + Image Left Section - image on left (4-grid), 3 cards on right (8-grid) with one-by-one auto-sliding
function CardsRightImageLeftSection({ section, cards, settings }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0)
  const mobileSliderRef = useRef(null)
  const sideImage = settings.sideImage || ''
  const backgroundColor = settings.backgroundColor || '#f3f4f6'
  const autoSlideInterval = settings.autoSlideInterval || 3000 // Default 3 seconds

  // Auto-slide effect - moves one card at a time (desktop only)
  useEffect(() => {
    if (cards.length <= 3) return // No need to slide if 3 or fewer cards

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length) // Loop through all cards
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [cards.length, autoSlideInterval])

  // Handle mobile scroll to update active indicator
  const handleMobileScroll = (e) => {
    const container = e.target
    const scrollLeft = container.scrollLeft
    const containerWidth = container.offsetWidth
    const slideWidth = containerWidth * 0.85 // Each card takes 85vw
    const newIndex = Math.round(scrollLeft / slideWidth)
    
    if (newIndex !== mobileSlideIndex && newIndex >= 0 && newIndex < cards.length) {
      setMobileSlideIndex(newIndex)
    }
  }

  // Get 3 cards with wrapping
  const getVisibleCards = () => {
    const result = []
    for (let i = 0; i < 3; i++) {
      result.push(cards[(currentIndex + i) % cards.length])
    }
    return result
  }

  const cardsToShow = cards.length >= 3 ? getVisibleCards() : cards

  return (
    <>
     <h2 className="text-2xl mx-5 font-bold mb-2 mt-4 text-start text-gray-800">{section.name}</h2>
     {section.description && (
       <p className="text-sm text-gray-600 mx-5 mb-4">{section.description}</p>
     )}
    
    {/* Mobile Layout */}
    <section className="md:hidden py-6" style={{ backgroundColor }}>
      <div className="max-w-[1920px] mx-auto px-4">
        {/* Side Image on Top */}
        {sideImage && (
          <div className="mb-6">
            <div className="rounded-lg overflow-hidden" style={{ height: '200px' }}>
              <img src={getFullImageUrl(sideImage)} alt={section.name} className="w-full h-full bg-cover" />
            </div>
          </div>
        )}

        {/* Cards Slider - Show 2 cards at a time */}
        <div 
          ref={mobileSliderRef}
          onScroll={handleMobileScroll}
          className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4"
        >
          <div className="flex gap-3 px-4" style={{ width: 'max-content' }}>
            {cards.map((card, index) => {
              // Group cards in pairs for mobile slider
              if (index % 2 === 0) {
                const nextCard = cards[index + 1]
                return (
                  <div key={`group-${index}`} className="flex gap-3 snap-center flex-shrink-0" style={{ width: 'calc(100vw - 2rem)' }}>
                    {/* First card in pair */}
                    <Link
                      to={card.linkUrl || '#'}
                      className="p-3 hover:shadow-xl transition-all duration-300 group overflow-hidden relative flex-shrink-0 flex-1"
                      style={{ 
                        minHeight: '280px',
                        maxHeight: '280px',
                        display: 'flex', 
                        flexDirection: 'column',
                        backgroundColor: card.bgColor || '#ffffff'
                      }}
                    >
                      {/* Text Content - Top Section */}
                      <div className="relative z-10 flex-grow pb-2">
                        <h3 className="text-sm font-bold mb-2 group-hover:text-gray-900 line-clamp-2 text-gray-800">
                          <TranslatedText text={card.name} sourceDoc={card} fieldName="name" />
                        </h3>
                        {card.details && (
                          <p className="text-xs mb-2 line-clamp-2 text-gray-600">
                            <TranslatedText text={card.details} sourceDoc={card} fieldName="details" />
                          </p>
                        )}
                        <span className="inline-flex items-center text-xs font-semibold text-blue-600">
                          <TranslatedText>Shop Now</TranslatedText>
                          <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                      
                      {/* Image - Fixed at Bottom */}
                      {card.image && (
                        <div className="relative w-full overflow-hidden rounded-lg mt-auto" style={{ height: '100px', flexShrink: 0 }}>
                          <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full bg-cover" />
                        </div>
                      )}
                    </Link>
                    
                    {/* Second card in pair (if exists) */}
                    {nextCard && (
                      <Link
                        to={nextCard.linkUrl || '#'}
                        className="p-3 hover:shadow-xl transition-all duration-300 group overflow-hidden relative flex-shrink-0 flex-1"
                        style={{ 
                          minHeight: '280px',
                          maxHeight: '280px',
                          display: 'flex', 
                          flexDirection: 'column',
                          backgroundColor: nextCard.bgColor || '#ffffff'
                        }}
                      >
                        {/* Text Content - Top Section */}
                        <div className="relative z-10 flex-grow pb-2">
                          <h3 className="text-sm font-bold mb-2 group-hover:text-gray-900 line-clamp-2 text-gray-800">
                            <TranslatedText text={nextCard.name} sourceDoc={nextCard} fieldName="name" />
                          </h3>
                          {nextCard.details && (
                            <p className="text-xs mb-2 line-clamp-2 text-gray-600">
                              <TranslatedText text={nextCard.details} sourceDoc={nextCard} fieldName="details" />
                            </p>
                          )}
                          <span className="inline-flex items-center text-xs font-semibold text-blue-600">
                            <TranslatedText>Shop Now</TranslatedText>
                            <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                        
                        {/* Image - Fixed at Bottom */}
                        {nextCard.image && (
                          <div className="relative w-full overflow-hidden rounded-lg mt-auto" style={{ height: '100px', flexShrink: 0 }}>
                            <img src={getFullImageUrl(nextCard.image)} alt={nextCard.name} className="w-full h-full bg-cover" />
                          </div>
                        )}
                      </Link>
                    )}
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
        
        {/* Scroll indicator dots */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(cards.length / 2) }).map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === mobileSlideIndex 
                  ? 'bg-lime-500 w-6' 
                  : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </section>

    {/* Desktop Layout */}
    <section className="hidden md:block py-6" style={{ backgroundColor, minHeight: '380px', maxHeight: '380px' }}>
      <div className="max-w-[1920px] mx-auto px-4 h-full flex items-center">
        <div className="grid grid-cols-12 gap-6 w-full">
          {/* Side Image - 4 columns */}
          {sideImage && (
            <div className="col-span-4">
              <div className="rounded-lg overflow-hidden" style={{ height: '320px' }}>
                <img src={getFullImageUrl(sideImage)} alt={section.name} className="w-full h-full bg-cover" />
              </div>
            </div>
          )}

          {/* 3 Cards - 8 columns with one-by-one auto-sliding */}
          <div className="col-span-8 grid grid-cols-3 gap-6">
            {cardsToShow.map((card, index) => {
              const isCenterCard = index === 1 // Middle card
              const cardBgColor = card.bgColor || '#ffffff' // Use bgColor from card model
              return (
                <Link
                  key={`${card._id}-${currentIndex}-${index}`}
                  to={card.linkUrl || '#'}
                  className={`p-4 hover:shadow-xl transition-all duration-500 group overflow-hidden relative ${
                    isCenterCard ? 'scale-105 shadow-xl z-10' : 'hover:scale-105'
                  }`}
                  style={{ 
                    minHeight: '320px', 
                    maxHeight: '320px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: cardBgColor
                  }}
                >
                  {/* Text Content - Top Section */}
                  <div className="relative z-10 flex-grow pb-2">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-gray-900 line-clamp-2 text-gray-800">
                      <TranslatedText text={card.name} sourceDoc={card} fieldName="name" />
                    </h3>
                    {card.details && (
                      <p className="text-xs mb-3 line-clamp-3 text-gray-600">
                        <TranslatedText text={card.details} sourceDoc={card} fieldName="details" />
                      </p>
                    )}
                    <span className="inline-flex items-center text-sm font-semibold text-blue-600">
                      <TranslatedText>Shop Now</TranslatedText>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                  
                  {/* Image - Fixed at Bottom */}
                  {card.image && (
                    <div className="relative w-full overflow-hidden rounded-lg mt-auto" style={{ height: '120px', flexShrink: 0 }}>
                      <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full bg-cover" />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

// Simple Cards Section - Image-only display with dynamic card count
function SimpleCardsSection({ section, cards, settings }) {
  const backgroundColor = settings.backgroundColor || '#f3f4f6'
  const cardsCount = settings.cardsCount || 5 // Get card count from settings, default to 5
  
  // Calculate card width based on cards count for desktop
  const cardWidth = `calc(${100 / cardsCount}% - ${24 * (cardsCount - 1) / cardsCount}px)`
  // Mobile slider settings
  const mobileCardsPerView = settings.mobileCardsPerView || 1; // default 1, can be set to 2

  return (
    <>
    
    <section className="pt-3  pb-1" style={{ backgroundColor, }}>
      <div className="max-w-[1920px] mx-auto px-5 md:px-9">
        {/* Mobile: Slider */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto gap-4 scrollbar-hide snap-x snap-mandatory px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {cards.slice(0, cardsCount).map((card, idx) => (
              <Link
                key={card._id}
                to={card.linkUrl || '#'}
                className="group overflow-hidden relative flex-shrink-0 transition-all duration-300 hover:scale-11 snap-center"
                style={{
                  width: mobileCardsPerView === 2 ? 'calc(80vw - 16px)' : 'calc(90vw - 16px)',
                  maxWidth: mobileCardsPerView === 2 ? '320px' : '90vw',
                  minWidth: mobileCardsPerView === 2 ? '260px' : '70vw',
                }}
              >
                {card.image && (
                  <div className="relative w-full overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300 h-[170px] sm:h-[240px] md:h-[290px] lg:h-[300px]">
                    <img 
                      src={getFullImageUrl(card.image)} 
                      alt={card.name} 
                      className="w-full h-full bg-cover"
                    />
                  </div>
                )}
              </Link>
            ))}
          </div>
          {/* Slider dots */}
          <div className="flex justify-center gap-2 mt-2 mb-0 pb-0">
            {Array.from({ length: Math.ceil(cards.slice(0, cardsCount).length / mobileCardsPerView) }).map((_, idx) => (
              <div 
                key={idx} 
                className="w-2 h-2 rounded-full bg-gray-300"
              ></div>
            ))}
          </div>
        </div>
        {/* Desktop: as before */}
        <div className="hidden md:flex gap-6 flex-nowrap w-full justify-center items-center">
          {cards.slice(0, cardsCount).map((card) => (
            <Link
              key={card._id}
              to={card.linkUrl || '#'}
              className="group overflow-hidden relative flex-shrink-0 transition-all duration-300 hover:scale-11"
              style={{ width: cardWidth, minWidth: cardWidth }}
            >
              {card.image && (
                <div className="relative w-full overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300 h-[170px] sm:h-[240px] md:h-[290px] lg:h-[300px]">
                  <img 
                    src={getFullImageUrl(card.image)} 
                    alt={card.name} 
                    className="w-full h-full bg-cover"
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
    </>
  )
}



// Vertical Grid Section - Cards wrap to new rows based on cardsPerRow setting
function VerticalGridSection({ section, cards, settings }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const sliderRef = useRef(null)
  const desktopCardsPerRow = settings.cardsPerRow || 7
  const backgroundColor = settings.backgroundColor || '#ffffff'
  
  // Handle scroll to update active indicator
  const handleScroll = (e) => {
    const container = e.target
    const scrollLeft = container.scrollLeft
    const containerWidth = container.offsetWidth
    
    // Calculate which slide is currently in view
    // Each slide takes full width (100vw - 2rem)
    const slideWidth = containerWidth
    const newIndex = Math.round(scrollLeft / slideWidth)
    
    if (newIndex !== currentSlideIndex && newIndex >= 0 && newIndex < totalSlides) {
      setCurrentSlideIndex(newIndex)
    }
  }
  
  // Generate responsive Tailwind grid classes based on desktop cards count
  const getResponsiveGridClass = (desktopCount) => {
    // Tablet (md): 3 cards
    // Desktop (lg): Use admin setting
    
    const gridMap = {
      2: 'grid-cols-3 lg:grid-cols-2',
      3: 'grid-cols-3 lg:grid-cols-3',
      4: 'grid-cols-3 lg:grid-cols-4',
      5: 'grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-4 lg:grid-cols-6',
      7: 'grid-cols-4 lg:grid-cols-7',
    }
    
    return gridMap[desktopCount] || 'grid-cols-4 lg:grid-cols-7'
  }
  
  const gridClass = getResponsiveGridClass(desktopCardsPerRow)
  const totalSlides = Math.ceil(cards.length / 2)

  return (
    <>
     <h2 className="text-2xl mx-5 font-bold mb-2 mt-4 text-start text-gray-800">{section.name}</h2>
     {section.description && (
       <p className="text-sm text-gray-600 mx-5 mb-4">{section.description}</p>
     )}
     <section className="py-4 md:py-8" style={{ backgroundColor }}>
      <div className="max-w-[1920px] mx-auto px-4">
        {/* Mobile: Horizontal Slider with 2 cards visible */}
        <div className="md:hidden">
          <div 
            ref={sliderRef}
            onScroll={handleScroll}
            className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          >
            <div className="flex gap-4 px-2" style={{ width: 'max-content' }}>
              {cards.map((card, index) => {
                // Group cards in pairs for mobile slider
                if (index % 2 === 0) {
                  const nextCard = cards[index + 1]
                  return (
                    <div key={`group-${index}`} className="flex gap-4 snap-center flex-shrink-0" style={{ width: 'calc(100vw - 2rem)' }}>
                      {/* First card in pair */}
                      <Link
                        to={card.linkUrl || '#'}
                        className="group flex flex-col transition-all duration-300 hover:scale-105 flex-1"
                      >
                        <div className="overflow-hidden rounded-3xl shadow-md group-hover:shadow-xl transition-shadow duration-300 h-[200px]">
                          {card.image && (
                            <img 
                              src={getFullImageUrl(card.image)} 
                              alt={card.name} 
                              className="w-full h-full bg-cover"
                            />
                          )}
                        </div>
                        <div className="mt-3">
                          <h3 className="text-sm font-semibold text-gray-800 text-center line-clamp-2">
                            <TranslatedText text={card.name} sourceDoc={card} fieldName="name" />
                          </h3>
                        </div>
                      </Link>
                      
                      {/* Second card in pair (if exists) */}
                      {nextCard && (
                        <Link
                          to={nextCard.linkUrl || '#'}
                          className="group flex flex-col transition-all duration-300 hover:scale-105 flex-1"
                        >
                          <div className="overflow-hidden rounded-3xl shadow-md group-hover:shadow-xl transition-shadow duration-300 h-[200px]">
                            {nextCard.image && (
                              <img 
                                src={getFullImageUrl(nextCard.image)} 
                                alt={nextCard.name} 
                                className="w-full h-full bg-cover"
                              />
                            )}
                          </div>
                          <div className="mt-3">
                            <h3 className="text-sm font-semibold text-gray-800 text-center line-clamp-2">
                              <TranslatedText text={nextCard.name} sourceDoc={nextCard} fieldName="name" />
                            </h3>
                          </div>
                        </Link>
                      )}
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
          
          {/* Scroll indicator dots - Fixed outside scrolling container */}
          <div className="flex justify-center gap-2 mt-3 pb-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlideIndex 
                    ? 'bg-lime-500 w-6' 
                    : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Tablet & Desktop: Grid layout */}
        <div className={`hidden md:grid ${gridClass} gap-6`}>
          {cards.map((card) => {
            return (
              <Link
                key={card._id}
                to={card.linkUrl || '#'}
                className="group flex flex-col transition-all duration-300 hover:scale-105"
              >
                {/* Image with rounded corners */}
                <div 
                  className="overflow-hidden rounded-3xl shadow-md group-hover:shadow-xl transition-shadow duration-300 h-[200px]"
                >
                  {/* Full Image */}
                  {card.image && (
                    <img 
                      src={getFullImageUrl(card.image)} 
                      alt={card.name} 
                      className="w-full h-full bg-cover"
                    />
                  )}
                </div>
                
                {/* Text Below Image */}
                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-gray-800 text-center line-clamp-2">
                    <TranslatedText text={card.name} sourceDoc={card} fieldName="name" />
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
    </>
  )
}

export default DynamicSection
