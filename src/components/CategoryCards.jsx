// import React, { useState, useEffect, useRef } from 'react'
// import { Link } from 'react-router-dom'
// import axios from 'axios'
// import config from '../config/config'

// function CategoryCards({ sectionSlug }) {
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
//             const hasImage = card.image && card.image.trim() !== ''
            
//             return (
//               <Link
//                 key={card._id}
//                 to={card.linkUrl || '#'}
//                 className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden relative flex flex-col flex-shrink-0"
//                 style={{ 
//                   width: 'calc(20% - 19.2px)', 
//                   minWidth: 'calc(20% - 19.2px)',
//                   minHeight: '450px',
//                   backgroundColor: card.bgColor || '#f3f4f6'
//                 }}
//               >
//                 <div className="relative z-10" style={{ minHeight: '180px' }}>
//                   <h3 className="text-xl font-bold mb-3 group-hover:text-gray-900 line-clamp-2 text-gray-800">
//                     {card.name}
//                   </h3>
//                   {card.details && (
//                     <p className="text-sm mb-4 line-clamp-3 text-gray-600">
//                       {card.details}
//                     </p>
//                   )}
//                   <span className="inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
//                     Shop Now
//                     <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                     </svg>
//                   </span>
//                 </div>
                
//                 {/* Show image if it exists */}
//                 {hasImage && (
//                   <div className="mt-4 relative h-48 flex-shrink-0 overflow-hidden rounded-lg z-10">
//                     <img
//                       src={card.image}
//                       alt={card.name}
//                       className="w-full h-full bg-cover transition-transform duration-300"
//                     />
//                   </div>
//                 )}
//               </Link>
//             )
//           })}
//         </div>
//       </div>
//     </section>
//   )
// }

// export default CategoryCards