
// import React, { useState, useEffect, useRef } from "react";

// const BrandSlider = ({ brands = [], onBrandClick, initialIndex = 0 }) => {
//   const [brandIndex, setBrandIndex] = useState(initialIndex);
//   const [visibleCount, setVisibleCount] = useState(8);
//   const sliderRef = useRef(null);
//   const isDragging = useRef(false);
//   const startX = useRef(0);
//   const scrollLeft = useRef(0);

//   // Responsive count update
//   useEffect(() => {
//     const updateVisible = () => {
//       if (window.innerWidth < 768) setVisibleCount(3);
//       else if (window.innerWidth < 1024) setVisibleCount(6);
//       else if (window.innerWidth < 1536) setVisibleCount(8);
//       else setVisibleCount(10); // 10 logos on 2XL screens (1536px and above)
//     };
//     updateVisible();
//     window.addEventListener("resize", updateVisible);
//     return () => window.removeEventListener("resize", updateVisible);
//   }, []);

//   // Auto-scroll
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setBrandIndex((prev) => (prev + 1) % brands.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, [brands.length]);

//   // Get visible brands in infinite loop
//   const getVisibleBrands = () => {
//     let visible = [];
//     for (let i = 0; i < visibleCount; i++) {
//       visible.push(brands[(brandIndex + i) % brands.length]);
//     }
//     return visible;
//   };

//   // Dragging handlers
//   const handleMouseDown = (e) => {
//     isDragging.current = true;
//     startX.current = e.pageX - sliderRef.current.offsetLeft;
//     scrollLeft.current = sliderRef.current.scrollLeft;
//   };

//   const handleMouseLeave = () => {
//     isDragging.current = false;
//   };

//   const handleMouseUp = () => {
//     isDragging.current = false;
//   };

//   const handleMouseMove = (e) => {
//     if (!isDragging.current) return;
//     e.preventDefault();
//     const x = e.pageX - sliderRef.current.offsetLeft;
//     const walk = (x - startX.current) * 1.2;
//     sliderRef.current.scrollLeft = scrollLeft.current - walk;
//   };

//   const handleTouchStart = (e) => {
//     isDragging.current = true;
//     startX.current = e.touches[0].clientX - sliderRef.current.offsetLeft;
//     scrollLeft.current = sliderRef.current.scrollLeft;
//   };

//   const handleTouchMove = (e) => {
//     if (!isDragging.current) return;
//     const x = e.touches[0].clientX - sliderRef.current.offsetLeft;
//     const walk = (x - startX.current) * 1.2;
//     sliderRef.current.scrollLeft = scrollLeft.current - walk;
//   };

//   const handleTouchEnd = () => {
//     isDragging.current = false;
//   };

//   return (
//     <section className="bg-white py-8">
//       <div className="max-w-8xl mx-auto">
//         <div className="relative mb-6">
//           <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">Featured Brands</h2>
//         </div>
//         <div className="relative mx-3 md:mx-5">
//           <div
//             className="flex overflow-x-hidden no-scrollbar space-x-2"
//             ref={sliderRef}
//             onMouseDown={handleMouseDown}
//             onMouseLeave={handleMouseLeave}
//             onMouseUp={handleMouseUp}
//             onMouseMove={handleMouseMove}
//             onTouchStart={handleTouchStart}
//             onTouchMove={handleTouchMove}
//             onTouchEnd={handleTouchEnd}
//           >
//             {getVisibleBrands().map((brand, index) => (
//               <div
//                 key={`${brand._id}-${index}`}
//                 className="flex-shrink-0"
//                 style={{ width: "180px" }}
//               >
//                 <div className="px-2 md:px-3">
//                   <button
//                     onClick={() => onBrandClick && onBrandClick(brand.name)}
//                     className="flex flex-col items-center group transition-all duration-300 w-full"
//                   >
//                     <div className="w-22 h-22 md:w-26 md:h-26 lg:w-40 lg:h-40 overflow-hidden flex items-center justify-center ">
//                       <img
//                         src={brand.logo || "/placeholder.svg"}
//                         alt={brand.name}
//                         className="w-full h-full object-contain"
//                       />
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default BrandSlider;


// =============

// import React, { useState, useEffect, useRef } from "react";

// const BrandSlider = ({ brands = [], onBrandClick, initialIndex = 0 }) => {
//   const [brandIndex, setBrandIndex] = useState(initialIndex);
//   const [visibleCount, setVisibleCount] = useState(8);
//   const [isMobile, setIsMobile] = useState(false);
//   const sliderRef = useRef(null);
//   const isDragging = useRef(false);
//   const startX = useRef(0);
//   const scrollLeft = useRef(0);

//   // Update visible count + isMobile on resize
//   useEffect(() => {
//     const updateVisible = () => {
//       const width = window.innerWidth;
//       if (width < 768) {
//         setVisibleCount(brands.length); // Show all on mobile
//         setIsMobile(true);
//       } else {
//         setIsMobile(false);
//         if (width < 1024) setVisibleCount(6);
//         else if (width < 1536) setVisibleCount(8);
//         else setVisibleCount(10);
//       }
//     };
//     updateVisible();
//     window.addEventListener("resize", updateVisible);
//     return () => window.removeEventListener("resize", updateVisible);
//   }, [brands.length]);

//   // Auto-scroll effect (mobile scrollLeft / desktop brandIndex)
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (isMobile && sliderRef.current) {
//         const container = sliderRef.current;
//         const scrollAmount = 180 + 8; // card width + spacing

//         // If end reached, scroll back to start
//         if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 1) {
//           container.scrollTo({ left: 0, behavior: "smooth" });
//         } else {
//           container.scrollBy({ left: scrollAmount, behavior: "smooth" });
//         }
//       } else {
//         // Desktop: use brandIndex logic
//         setBrandIndex((prev) => (prev + 1) % brands.length);
//       }
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [brands.length, isMobile]);

//   // Get visible brands for desktop only
//   const getVisibleBrands = () => {
//     const visible = [];
//     for (let i = 0; i < visibleCount; i++) {
//       visible.push(brands[(brandIndex + i) % brands.length]);
//     }
//     return visible;
//   };

//   // Mouse drag (desktop)
//   const handleMouseDown = (e) => {
//     isDragging.current = true;
//     startX.current = e.pageX - sliderRef.current.offsetLeft;
//     scrollLeft.current = sliderRef.current.scrollLeft;
//   };
//   const handleMouseLeave = () => (isDragging.current = false);
//   const handleMouseUp = () => (isDragging.current = false);
//   const handleMouseMove = (e) => {
//     if (!isDragging.current) return;
//     e.preventDefault();
//     const x = e.pageX - sliderRef.current.offsetLeft;
//     const walk = (x - startX.current) * 1.2;
//     sliderRef.current.scrollLeft = scrollLeft.current - walk;
//   };

//   // Touch drag (mobile)
//   const handleTouchStart = (e) => {
//     if (!isMobile) return;
//     isDragging.current = true;
//     startX.current = e.touches[0].clientX - sliderRef.current.offsetLeft;
//     scrollLeft.current = sliderRef.current.scrollLeft;
//   };

//   const handleTouchMove = (e) => {
//     if (!isMobile || !isDragging.current) return;
//     const x = e.touches[0].clientX - sliderRef.current.offsetLeft;
//     const walk = (x - startX.current) * 1.2;
//     sliderRef.current.scrollLeft = scrollLeft.current - walk;
//   };

//   const handleTouchEnd = () => {
//     isDragging.current = false;
//   };

//   return (
//     <section className="bg-white py-8">
//       <div className="max-w-8xl mx-auto">
//         <div className="relative mb-6">
//           <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
//             Featured Brands
//           </h2>
//         </div>
//         <div className="relative mx-3 md:mx-5">
//           <div
//             className="flex overflow-x-hidden no-scrollbar space-x-2"
//             ref={sliderRef}
//             onMouseDown={handleMouseDown}
//             onMouseLeave={handleMouseLeave}
//             onMouseUp={handleMouseUp}
//             onMouseMove={handleMouseMove}
//             onTouchStart={handleTouchStart}
//             onTouchMove={handleTouchMove}
//             onTouchEnd={handleTouchEnd}
//           >
//             {(isMobile ? brands : getVisibleBrands()).map((brand, index) => (
//               <div
//                 key={`${brand._id}-${index}`}
//                 className="flex-shrink-0"
//                 style={{ width: "180px" }}
//               >
//                 <div className="px-2 md:px-3">
//                   <button
//                     onClick={() => onBrandClick && onBrandClick(brand.name)}
//                     className="flex flex-col items-center group transition-all duration-300 w-full"
//                   >
//                     <div className="w-22 h-22 md:w-26 md:h-26 lg:w-40 lg:h-40 overflow-hidden flex items-center justify-center">
//                       <img
//                         src={brand.logo || "/placeholder.svg"}
//                         alt={brand.name}
//                         className="w-full h-full object-contain"
//                       />
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default BrandSlider;


// =================


import React, { useState, useEffect, useRef } from "react";
import { getOptimizedImageUrl } from "../utils/imageUtils";
import TranslatedText from "./TranslatedText";

const BrandSlider = ({ brands = [], onBrandClick, initialIndex = 0 }) => {
  const [brandIndex, setBrandIndex] = useState(initialIndex);
  const [visibleCount, setVisibleCount] = useState(8);
  const [isMobile, setIsMobile] = useState(false);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const duplicatedBrands = [...brands, ...brands, ...brands]; // triple for seamless infinite scroll

  // Update visible count + isMobile
  useEffect(() => {
    const updateVisible = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setVisibleCount(brands.length);
        setIsMobile(true);
      } else {
        setIsMobile(false);
        if (width < 1024) setVisibleCount(6);
        else if (width < 1536) setVisibleCount(8);
        else setVisibleCount(10);
      }
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, [brands.length]);

  // Auto-scroll with smooth loop (mobile) or index (desktop)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMobile && sliderRef.current) {
        const container = sliderRef.current;
        const scrollAmount = 180 + 8; // width + margin
        const midpoint = (container.scrollWidth / 2) - container.offsetWidth;

        if (container.scrollLeft >= midpoint) {
          // Reset instantly to start of original brands (no animation)
          container.scrollLeft = 0;
        } else {
          // Scroll to next brand smoothly
          container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      } else if (sliderRef.current) {
        // Desktop: also use scroll for seamless loop
        const container = sliderRef.current;
        const scrollAmount = 180 + 8;
        const singleSetWidth = brands.length * scrollAmount;

        // If we've scrolled past the first set, reset to beginning of second set
        if (container.scrollLeft >= singleSetWidth * 1.5) {
          container.scrollLeft = singleSetWidth / 2;
        } else {
          container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [brands.length, isMobile]);

  // Handle infinite scroll wrap on mouse drag end
  const handleScrollWrap = () => {
    if (!sliderRef.current || isMobile) return;
    
    const container = sliderRef.current;
    const scrollAmount = 180 + 8;
    const singleSetWidth = brands.length * scrollAmount;
    
    // If scrolled too far right, wrap to middle set
    if (container.scrollLeft >= singleSetWidth * 2) {
      container.scrollLeft = singleSetWidth;
    }
    // If scrolled too far left, wrap to middle set
    else if (container.scrollLeft <= 0) {
      container.scrollLeft = singleSetWidth;
    }
  };

  // Initialize desktop scroll position to middle set
  useEffect(() => {
    if (!isMobile && sliderRef.current && brands.length > 0) {
      const scrollAmount = 180 + 8;
      const singleSetWidth = brands.length * scrollAmount;
      sliderRef.current.scrollLeft = singleSetWidth; // Start at middle set
    }
  }, [isMobile, brands.length]);

  // Get visible brands for desktop
  const getVisibleBrands = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      visible.push(brands[(brandIndex + i) % brands.length]);
    }
    return visible;
  };

  // Mouse (desktop) scroll
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };
  const handleMouseLeave = () => {
    isDragging.current = false;
    handleScrollWrap();
  };
  const handleMouseUp = () => {
    isDragging.current = false;
    handleScrollWrap();
  };
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // Touch (mobile) scroll
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    isDragging.current = true;
    startX.current = e.touches[0].clientX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !isDragging.current) return;
    const x = e.touches[0].clientX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (isMobile) handleScrollWrap();
  };

  // Arrow navigation
  const handlePrevClick = () => {
    if (sliderRef.current) {
      const scrollAmount = 180 + 8; // width + margin
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      setTimeout(handleScrollWrap, 300);
    }
  };

  const handleNextClick = () => {
    if (sliderRef.current) {
      const scrollAmount = 180 + 8;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(handleScrollWrap, 300);
    }
  };

  return (
    <section className="bg-white py-8">
      <div className="max-w-8xl mx-auto">
        <div className="relative mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
            <TranslatedText>Featured Brands</TranslatedText>
          </h2>
        </div>
        <div className="relative mx-3 md:mx-5">
          {/* Left Arrow */}
          <button
            onClick={handlePrevClick}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all duration-200 hover:scale-110"
            aria-label="Previous brands"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNextClick}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all duration-200 hover:scale-110"
            aria-label="Next brands"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            className="flex overflow-x-scroll space-x-2 hide-scrollbar"
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {duplicatedBrands.map((brand, index) => (
              <div
                key={`${brand._id}-${index}`}
                className="flex-shrink-0"
                style={{ width: "180px" }}
              >
                <div className="px-2 md:px-3">
                  <button
                    onClick={() => onBrandClick && onBrandClick(brand.name)}
                    className="flex flex-col items-center group transition-all duration-300 w-full"
                  >
                    <div className="w-22 h-22 md:w-26 md:h-26 lg:w-40 lg:h-40 overflow-hidden flex items-center justify-center">
                      <img
                        src={getOptimizedImageUrl(brand.logo, { width: 200, height: 190, quality: 70 }) || "/placeholder.svg"}
                        alt={brand.name}
                        width="160"
                        height="154"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSlider;
