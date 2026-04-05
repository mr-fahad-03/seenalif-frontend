import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getOptimizedImageUrl } from "../utils/imageUtils";

const CategorySlider = ({ categories = [], onCategoryClick }) => {
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(8); // default for desktop
  const [currentIndex, setCurrentIndex] = useState(0);

  // Touch/mouse state
  const startX = useRef(null);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Update visible count based on screen size and zoom level
  useEffect(() => {
    const updateVisible = () => {
      const width = window.innerWidth;
      
      if (width >= 1536) {
        // 2xl screens - adjust based on viewport width (increases when zooming out)
        if (width >= 2300) {
          // 67% zoom or less
          setVisibleCount(10);
        } else if (width >= 2050) {
          // 75% zoom
          setVisibleCount(9);
        } else if (width >= 1920) {
          // 80% zoom
          setVisibleCount(9);
        } else if (width >= 1700) {
          // 90% zoom
          setVisibleCount(8);
        } else {
          // 100% zoom
          setVisibleCount(7);
        }
      } else if (width >= 1280) {
        setVisibleCount(7); // xl screens
      } else if (width >= 1024) {
        setVisibleCount(6); // large screens
      } else if (width >= 768) {
        setVisibleCount(5); // tablet
      } else if (width >= 640) {
        setVisibleCount(4); // tablet landscape
      } else if (width >= 480) {
        setVisibleCount(4); // small tablets/large phones
      } else {
        setVisibleCount(3); // mobile
      }
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  // Fix for passive event listener error
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
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? categories.length - 1 : prev - 1
    );
  };

  // --- Smooth Drag Logic ---
  const getItemWidth = () => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    return containerWidth / visibleCount;
  };

  // Helper to animate and then update index
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

  // Touch event handlers
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
    // Limit drag so you can't drag beyond the width of one item
    const maxDrag = getItemWidth();
    const limitedDiff = Math.max(Math.min(diff, maxDrag), -maxDrag);
    setDragOffset(limitedDiff);
    // e.preventDefault(); // Removed, handled natively
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

  // Mouse event handlers
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

  // Compute visible items in order, as a loop
  const getVisibleCategories = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      visible.push(categories[(currentIndex + i) % categories.length]);
    }
    return visible;
  };

  const visibleCategories = getVisibleCategories();

  // --- Style for smooth transform ---
  const sliderStyle = {
    transform: `translateX(${dragOffset}px)`,
    transition: isDragging.current || isAnimating ? 'transform 0.2s cubic-bezier(0.4,0,0.2,1)' : 'none',
  };

  return (
    <section className=" mb-5  bg-white pt-4">
      <div className="max-w-8xl lg:px-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="text-black hover:text-gray-600"
          >
            <ChevronLeft size={35} />
          </button>

          <div
            className="flex-1 overflow-hidden"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <div
              className="flex items-center justify-evenly transition-transform duration-300 ease-in-out"
              style={sliderStyle}
            >
              {visibleCategories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => onCategoryClick(category.name)}
                  className="flex flex-col items-center group flex-shrink-0"
                  style={{
                    width: `${100 / visibleCount}%`,
                    maxWidth: "160px",
                    minWidth: "80px",
                  }}
                >
                  {/* <div className="flex items-center justify-center  lg:w-[160px] ">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-18 h-18 md:w-25 md:h-25 lg:w-32 lg:h-32 xl:w-44 xl:h-44  object-contain "
                      
                      />
                    ) : (
                      <div className="w-22 h-22 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                        <span className="text-lg md:text-2xl">📦</span>
                      </div>
                    )}
                  </div> */}

                  <div
                    className="flex items-center justify-center w-full"
                    style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                  >
                    {category.image ? (
                      <img
                        src={getOptimizedImageUrl(category.image, { width: 128, height: 128, quality: 68 })}
                        alt={category.name}
                        width="176"
                        height="176"
                        loading="lazy"
                        decoding="async"
                        className="w-16 h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 xl:w-32 xl:h-32 2xl:w-36 2xl:h-36 object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 xl:w-32 xl:h-32 2xl:w-36 2xl:h-36 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                        <span className="text-lg md:text-2xl">📦</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs md:text-sm font-bold text-gray-700 text-center mt-0.5 md:mt-0.5 lg:mt-0.5 truncate w-full px-1">
                    <TranslatedText text={category.name} sourceDoc={category} fieldName="name" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="text-black hover:text-gray-600"
          >
            <ChevronRight size={35} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
