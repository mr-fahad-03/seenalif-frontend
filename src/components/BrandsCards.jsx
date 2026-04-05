// import React, { useState, useEffect, useRef } from 'react'
// import { Link } from 'react-router-dom'
// import axios from 'axios'
// import config from '../config/config'

// function BrandsCards({ sectionSlug }) {
//   const [cards, setCards] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [currentIndex, setCurrentIndex] = useState(0)
//   const [itemsToShow, setItemsToShow] = useState(5)
//   const sliderRef = useRef(null)

//   useEffect(() => {
//     if (sectionSlug) {
//       fetchBannerCards()
//     }
//   }, [sectionSlug])

//   useEffect(() => {
//     const handleResize = () => {
//       const width = window.innerWidth
      
//       // Always show 5 items regardless of zoom level
//       setItemsToShow(5)
//       setCurrentIndex(0)
//     }

//     handleResize()
//     window.addEventListener('resize', handleResize)
//     return () => window.removeEventListener('resize', handleResize)
//   }, [])

//   const fetchBannerCards = async () => {
//     try {
//       const { data } = await axios.get(`${config.API_URL}/api/banner-cards/section/${sectionSlug}`)
//       setCards(data)
//       setLoading(false)
//     } catch (error) {
//       console.error('Error fetching banner cards:', error)
//       setLoading(false)
//     }
//   }

//   const handlePrevious = () => {
//     setCurrentIndex((prev) => Math.max(0, prev - 1))
//   }

//   const handleNext = () => {
//     setCurrentIndex((prev) => Math.min(cards.length - itemsToShow, prev + 1))
//   }

//   const canGoPrev = currentIndex > 0
//   const canGoNext = currentIndex < cards.length - itemsToShow
//   const showArrows = cards.length > itemsToShow

//   const itemWidth = `calc(${100 / itemsToShow}% - ${(24 * (itemsToShow - 1)) / itemsToShow}px)`
//   const translateAmount = currentIndex * (100 / itemsToShow + (24 / itemsToShow))

//   if (loading) {
//     return (
//       <section className="py-12 bg-gray-50">
//         <div className="max-w-[1920px] mx-auto px-4">
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
//           </div>
//         </div>
//       </section>
//     )
//   }

//   if (cards.length === 0) {
//     return null
//   }

//   return (
//     <section className="py-12 bg-white">
//       <div className="max-w-[1920px] mx-auto px-4">
//         <div className="flex gap-6 flex-nowrap">
//           {cards.slice(0, 5).map((card) => {
//             const hasBgImage = card.bgImage && card.bgImage.trim() !== ''
            
//             return (
//               <Link
//                 key={card._id}
//                 to={card.linkUrl || '#'}
//                 className="rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden relative flex flex-col justify-between flex-shrink-0"
//                 style={{ 
//                   width: 'calc(20% - 19.2px)', 
//                   minWidth: 'calc(20% - 19.2px)',
//                   minHeight: '380px',
//                   backgroundColor: hasBgImage ? 'transparent' : (card.bgColor || '#f3f4f6'),
//                   backgroundImage: hasBgImage ? `url(${card.bgImage})` : 'none',
//                   backgroundSize: 'cover',
//                   backgroundPosition: 'center',
//                   backgroundRepeat: 'no-repeat'
//                 }}
//               >
//                 {/* Overlay for better text readability when using background image */}
//                 {hasBgImage && (
//                   <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
//                 )}
                
//                 <div className="relative z-10">
//                   <h3 className={`text-xl font-bold mb-3 group-hover:text-gray-900 line-clamp-2 ${
//                     hasBgImage ? 'text-white drop-shadow-lg' : 'text-gray-800'
//                   }`}>
//                     {card.name}
//                   </h3>
//                   {card.details && (
//                     <p className={`text-sm mb-4 line-clamp-8 ${
//                       hasBgImage ? 'text-white drop-shadow-md' : 'text-gray-600'
//                     }`}>
//                       {card.details}
//                     </p>
//                   )}
//                 </div>
                
//                 {/* Shop Now button moved to bottom */}
//                 <div className="relative z-10 mt-auto">
//                   <span className={`inline-flex items-center text-sm font-semibold ${
//                     hasBgImage ? 'text-white drop-shadow-md' : 'text-blue-600 group-hover:text-blue-700'
//                   }`}>
//                     Shop Now
//                     <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                     </svg>
//                   </span>
//                 </div>
//               </Link>
//             )
//           })}
//         </div>
//       </div>
//     </section>
//   )
// }

// export default BrandsCards