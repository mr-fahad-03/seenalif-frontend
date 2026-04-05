import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getOptimizedImageUrl } from "../utils/imageUtils";
import axios from "axios";
import config from "../config/config";
import TranslatedText from "./TranslatedText";
import { useLanguage } from "../context/LanguageContext";
import { preloadTranslations } from "../LanguageModel/translationService";

const CategorySliderUpdated = ({ onCategoryClick }) => {
  const containerRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [allSliderItems, setAllSliderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderShape, setSliderShape] = useState("circle");
  const [layoutType, setLayoutType] = useState("default");
  const { currentLanguage } = useLanguage();

  // Touch/mouse state
  const startX = useRef(null);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Preload translations when items change and language is Arabic
  useEffect(() => {
    if (currentLanguage.code === 'ar' && allSliderItems.length > 0) {
      // Extract all names for translation
      const names = allSliderItems
        .map(item => item.name)
        .filter(name => name && typeof name === 'string');
      
      if (names.length > 0) {
        console.log(`[CategorySlider] Preloading ${names.length} category translations`);
        preloadTranslations(names, 'ar');
      }
    }
  }, [allSliderItems, currentLanguage.code]);

  // Fetch categories and settings from slider API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch slider categories
        const sliderRes = await axios.get(`${config.API_URL}/api/categories/slider`);
        const sliderData = sliderRes.data || [];
        
        // Fetch custom slider items (admin-created promotional items)
        let customSliderItems = [];
        try {
          const customRes = await axios.get(`${config.API_URL}/api/custom-slider-items/active`);
          customSliderItems = customRes.data || [];
        } catch (customErr) {
          console.log("No custom slider items or error fetching them:", customErr);
        }
        
        // Fetch settings for shape
        const settingsRes = await axios.get(`${config.API_URL}/api/settings`);
        const settingsData = settingsRes.data || {};
        setSliderShape(settingsData.categorySliderShape || "circle");
        setLayoutType(settingsData.categorySliderLayoutType || "default");
        
        // If admin selected categories exist, use them
        let regularCategories = [];
        if (Array.isArray(sliderData) && sliderData.length > 0) {
          regularCategories = sliderData.filter((c) => c && c.isActive !== false && !c.isDeleted);
        } else {
          // Fallback: fetch all categories
          const allRes = await axios.get(`${config.API_URL}/api/categories`);
          const allData = allRes.data || [];
          regularCategories = allData.filter((c) => c && c.isActive !== false && !c.isDeleted);
        }
        
        setCategories(regularCategories);
        setCustomItems(customSliderItems);
        
        // Merge custom items and regular categories
        // Custom items come first, then regular categories
        const mergedItems = [
          ...customSliderItems.map(item => ({
            ...item,
            isCustomItem: true,
            type: 'custom'
          })),
          ...regularCategories.map(cat => ({
            ...cat,
            isCustomItem: false,
            type: 'category'
          }))
        ];
        
        setAllSliderItems(mergedItems);
        
      } catch (err) {
        console.error("Error fetching slider data:", err);
        // Fallback on error
        try {
          const allRes = await axios.get(`${config.API_URL}/api/categories`);
          const allData = allRes.data || [];
          const regularCategories = allData.filter((c) => c && c.isActive !== false && !c.isDeleted);
          setCategories(regularCategories);
          setAllSliderItems(regularCategories.map(cat => ({
            ...cat,
            isCustomItem: false,
            type: 'category'
          })));
        } catch (fallbackErr) {
          console.error("Error fetching fallback categories:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update visible count based on screen size and zoom level
  useEffect(() => {
    const updateVisible = () => {
      const width = window.innerWidth;
      
      if (width >= 1536) {
        if (width >= 2300) {
          setVisibleCount(10);
        } else if (width >= 2050) {
          setVisibleCount(9);
        } else if (width >= 1920) {
          setVisibleCount(9);
        } else if (width >= 1700) {
          setVisibleCount(8);
        } else {
          setVisibleCount(7);
        }
      } else if (width >= 1280) {
        setVisibleCount(7);
      } else if (width >= 1024) {
        setVisibleCount(6);
      } else if (width >= 768) {
        setVisibleCount(5);
      } else if (width >= 640) {
        setVisibleCount(4);
      } else if (width >= 480) {
        setVisibleCount(4);
      } else {
        setVisibleCount(3);
      }
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeTouchMove = (e) => {
      if (isDragging.current && startX.current !== null) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchmove', handleNativeTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchmove', handleNativeTouchMove, { passive: false });
    };
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allSliderItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? allSliderItems.length - 1 : prev - 1
    );
  };

  const getItemWidth = () => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    return containerWidth / visibleCount;
  };

  const animateAndSetIndex = (direction) => {
    setIsAnimating(true);
    const offset = direction === 'next' ? -getItemWidth() : getItemWidth();
    setDragOffset(offset);
    setTimeout(() => {
      setIsAnimating(false);
      setDragOffset(0);
      if (direction === 'next') handleNext();
      else handlePrev();
    }, 200);
  };

  const handleTouchStart = (e) => {
    if (isAnimating) return;
    const touch = e.touches[0];
    startX.current = touch.clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current || startX.current === null) return;
    const touch = e.touches[0];
    const diff = touch.clientX - startX.current;
    const maxDrag = getItemWidth();
    const limitedDiff = Math.max(Math.min(diff, maxDrag), -maxDrag);
    setDragOffset(limitedDiff);
  };

  const handleTouchEnd = (e) => {
    if (!isDragging.current || startX.current === null) return;
    const touch = e.changedTouches[0];
    const diff = touch.clientX - startX.current;
    const threshold = getItemWidth() / 3;
    if (diff < -threshold) {
      animateAndSetIndex('next');
    } else if (diff > threshold) {
      animateAndSetIndex('prev');
    } else {
      setIsAnimating(true);
      setDragOffset(0);
      setTimeout(() => setIsAnimating(false), 200);
    }
    isDragging.current = false;
    startX.current = null;
  };

  const handleMouseDown = (e) => {
    if (isAnimating) return;
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || startX.current === null) return;
    const diff = e.clientX - startX.current;
    setDragOffset(diff);
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current || startX.current === null) return;
    const diff = e.clientX - startX.current;
    const threshold = getItemWidth() / 3;
    if (diff < -threshold) {
      animateAndSetIndex('next');
    } else if (diff > threshold) {
      animateAndSetIndex('prev');
    } else {
      setIsAnimating(true);
      setDragOffset(0);
      setTimeout(() => setIsAnimating(false), 200);
    }
    isDragging.current = false;
    startX.current = null;
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      setIsAnimating(true);
      setDragOffset(0);
      setTimeout(() => setIsAnimating(false), 200);
    }
    isDragging.current = false;
    startX.current = null;
  };

  const getVisibleCategories = () => {
    // Use merged items instead of just categories
    const items = allSliderItems;
    
    // If we have fewer items than visible slots, just show all without repeating
    if (items.length <= visibleCount) {
      return items;
    }
    
    // Otherwise, use the carousel logic with wrapping
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      visible.push(items[(currentIndex + i) % items.length]);
    }
    return visible;
  };

  if (loading) {
    return (
      <section className="relative w-[96%] sm:w-[95%] lg:w-[94%] mx-auto mb-5 bg-white pt-4 min-h-[128px] md:min-h-[176px]">
        <div className="w-full">
          <div className="w-full h-20 md:h-28 rounded-xl bg-gray-100 animate-pulse" />
        </div>
      </section>
    );
  }

  if (allSliderItems.length === 0) {
    return <section className="relative w-[96%] sm:w-[95%] lg:w-[94%] mx-auto mb-5 bg-white pt-4 min-h-[128px] md:min-h-[176px]" />;
  }

  const visibleCategories = getVisibleCategories();
  const shouldShowArrows = allSliderItems.length > visibleCount;

  const sliderStyle = {
    transform: `translateX(${dragOffset}px)`,
    transition: isDragging.current || isAnimating ? 'transform 0.2s cubic-bezier(0.4,0,0.2,1)' : 'none',
  };

  return (
    <section className="relative w-[96%] sm:w-[95%] lg:w-[94%] mx-auto mb-5 bg-white pt-4">
      <div className="w-full">
        <div className="flex items-center justify-between">
          {shouldShowArrows && (
            <button
              onClick={handlePrev}
              className="text-black hover:text-gray-600"
            >
              <ChevronLeft size={35} />
            </button>
          )}

          <div
            className={`flex-1 overflow-hidden ${!shouldShowArrows ? 'mx-0' : ''}`}
            ref={containerRef}
            onTouchStart={shouldShowArrows ? handleTouchStart : undefined}
            onTouchMove={shouldShowArrows ? handleTouchMove : undefined}
            onTouchEnd={shouldShowArrows ? handleTouchEnd : undefined}
            onMouseDown={shouldShowArrows ? handleMouseDown : undefined}
            onMouseMove={shouldShowArrows ? handleMouseMove : undefined}
            onMouseUp={shouldShowArrows ? handleMouseUp : undefined}
            onMouseLeave={shouldShowArrows ? handleMouseLeave : undefined}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <div
              className={`flex items-center transition-transform duration-300 ease-in-out ${
                allSliderItems.length <= visibleCount ? 'justify-center' : 'justify-evenly'
              }`}
              style={shouldShowArrows ? sliderStyle : {}}
            >
              {visibleCategories.map((item, index) => {
                // Handle click based on item type
                const handleItemClick = () => {
                  if (item.isCustomItem) {
                    // Custom item - redirect to specified URL
                    if (item.redirectUrl) {
                      // Check if it's an external URL or internal path
                      if (item.redirectUrl.startsWith('http://') || item.redirectUrl.startsWith('https://')) {
                        window.location.href = item.redirectUrl;
                      } else {
                        window.location.href = item.redirectUrl;
                      }
                    }
                  } else {
                    // Regular category or subcategory - pass the full item object
                    if (onCategoryClick) {
                      onCategoryClick(item);
                    }
                  }
                };

                // Get shape-specific styles
                const getShapeStyle = () => {
                  switch (sliderShape) {
                    case "circle":
                      return { 
                        borderRadius: "50%", 
                        overflow: "hidden", 
                        aspectRatio: "1/1",
                        clipPath: "none"
                      };
                    case "square":
                      return { 
                        borderRadius: "0", 
                        overflow: "hidden", 
                        aspectRatio: "1/1",
                        clipPath: "none"
                      };
                    case "triangle":
                      return { 
                        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", 
                        overflow: "hidden", 
                        aspectRatio: "1/1",
                        borderRadius: "0"
                      };
                    case "octagon":
                      return { 
                        clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)", 
                        overflow: "hidden", 
                        aspectRatio: "1/1",
                        borderRadius: "0"
                      };
                    default:
                      return { 
                        borderRadius: "50%", 
                        overflow: "hidden", 
                        aspectRatio: "1/1",
                        clipPath: "none"
                      };
                  }
                };

                // Get layout-specific classes
                const getLayoutClasses = () => {
                  switch (layoutType) {
                    case "compact":
                      return {
                        container: "flex flex-col items-center group flex-shrink-0",
                        imageSize: "w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 2xl:w-28 2xl:h-28",
                        textClass: "text-xs font-medium text-gray-700 text-center mt-1 truncate w-full px-0.5"
                      };
                    case "modern":
                      return {
                        container: "flex flex-col items-center group flex-shrink-0 transition-transform hover:scale-105",
                        imageWrapper: "p-2 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow",
                        imageSize: "w-14 h-14 md:w-18 md:h-18 lg:w-24 lg:h-24 xl:w-28 xl:h-28 2xl:w-32 2xl:h-32",
                        textClass: "text-xs md:text-sm font-bold text-gray-800 text-center mt-2 truncate w-full px-1"
                      };
                    case "minimal":
                      return {
                        container: "flex flex-col items-center group flex-shrink-0",
                        imageWrapper: "p-1 border border-gray-200 rounded-lg",
                        imageSize: "w-14 h-14 md:w-18 md:h-18 lg:w-24 lg:h-24 xl:w-28 xl:h-28 2xl:w-32 2xl:h-32",
                        textClass: "text-xs md:text-sm font-medium text-gray-600 text-center mt-1.5 truncate w-full"
                      };
                    case "card":
                      return {
                        container: "flex flex-col items-center group flex-shrink-0",
                        imageWrapper: "p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm",
                        imageSize: "w-14 h-14 md:w-18 md:h-18 lg:w-24 lg:h-24 xl:w-28 xl:h-28 2xl:w-32 2xl:h-32",
                        textClass: "text-xs md:text-sm font-semibold text-gray-700 text-center mt-2 truncate w-full px-1"
                      };
                    case "banner":
                      return {
                        container: "flex flex-col items-center group flex-shrink-0",
                        imageWrapper: "p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow",
                        imageSize: "w-14 h-14 md:w-18 md:h-18 lg:w-24 lg:h-24 xl:w-28 xl:h-28 2xl:w-32 2xl:h-32",
                        textClass: "text-xs md:text-sm font-bold text-gray-900 text-center mt-2 truncate w-full px-1"
                      };
                    case "circularCard":
                      return {
                        container: "flex flex-col items-center group flex-shrink-0",
                        cardWrapper: "rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow",
                        cardWrapperStyle: { 
                          background: "linear-gradient(135deg, #e3f313 0%, #00b65d 50%, #009c50 100%)"
                        },
                        cardSize: "w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 2xl:w-40 2xl:h-40",
                        imageSize: "w-full h-full object-cover",
                        textClass: "text-xs md:text-sm font-bold text-gray-700 text-center mt-2 truncate w-full px-1",
                        isCircularCard: true
                      };
                    default: // "default"
                      return {
                        container: "flex flex-col items-center group flex-shrink-0",
                        imageSize: "w-16 h-16 md:w-20 md:h-20 lg:w-38 lg:h-38 xl:w-32 xl:h-32 2xl:w-36 2xl:h-36",
                        textClass: "text-xs md:text-sm font-bold text-gray-700 text-center mt-0.5 md:mt-0.5 lg:mt-0.5 truncate w-full px-1"
                      };
                  }
                };

                const layoutClasses = getLayoutClasses();

                return (
                  <button
                    key={(item._id || item.id) + '-' + index}
                    onClick={handleItemClick}
                    className={layoutClasses.container}
                    style={{
                      width: allSliderItems.length <= visibleCount ? 'auto' : `${100 / visibleCount}%`,
                      maxWidth: "160px",
                      minWidth: "80px",
                    }}
                  >
                    {layoutClasses.isCircularCard ? (
                      <>
                        <div
                          className={`${layoutClasses.cardWrapper} ${layoutClasses.cardSize}`}
                          style={{ 
                            willChange: 'transform', 
                            transform: 'translateZ(0)',
                            ...layoutClasses.cardWrapperStyle 
                          }}
                        >
                          {item.image ? (
                            <img
                              src={getOptimizedImageUrl(item.image, { width: 128, height: 128, quality: 68 })}
                              alt={item.name}
                              width="176"
                              height="176"
                              loading="lazy"
                              decoding="async"
                              className={layoutClasses.imageSize}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <span className="text-2xl md:text-3xl">📦</span>
                            </div>
                          )}
                        </div>
                        <span className={layoutClasses.textClass}>
                          {(() => {
                            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                            const name = item.name;
                            if (isMobile && name.length > 14) {
                              return <TranslatedText text={name.slice(0, 14) + '...'} sourceDoc={item} fieldName="name" />;
                            }
                            return <TranslatedText text={name} sourceDoc={item} fieldName="name" />;
                          })()}
                        </span>
                      </>
                    ) : (
                      <>
                        <div
                          className={`flex items-center justify-center w-full ${layoutClasses.imageWrapper || ''}`}
                          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                        >
                          {item.image ? (
                            <img
                              src={getOptimizedImageUrl(item.image, { width: 128, height: 128, quality: 68 })}
                              alt={item.name}
                              width="176"
                              height="176"
                              loading="lazy"
                              decoding="async"
                              className={`${layoutClasses.imageSize} ${sliderShape === 'circle' ? 'object-cover' : 'bg-cover'}`}
                              style={{...getShapeStyle(), display: 'block'}}
                            />
                          ) : (
                            <div 
                              className={`${layoutClasses.imageSize} border-2 border-gray-200 flex items-center justify-center bg-gray-100`}
                              style={{...getShapeStyle(), display: 'flex'}}
                            >
                              <span className="text-lg md:text-2xl">📦</span>
                            </div>
                          )}
                        </div>

                        <span className={layoutClasses.textClass}>
                          {(() => {
                            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                            const name = item.name;
                            if (isMobile && name.length > 14) {
                              return <TranslatedText text={name.slice(0, 14) + '...'} sourceDoc={item} fieldName="name" />;
                            }
                            return <TranslatedText text={name} sourceDoc={item} fieldName="name" />;
                          })()}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {shouldShowArrows && (
            <button
              onClick={handleNext}
              className="text-black hover:text-gray-600"
            >
              <ChevronRight size={35} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategorySliderUpdated;
