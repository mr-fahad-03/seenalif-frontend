import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { productsAPI } from "../services/api"
import productCache from "../services/productCache"
import { getFullImageUrl } from "../utils/imageUtils"
import { FaShoppingCart, FaStar, FaShippingFast, FaUndo, FaShieldAlt, FaArrowRight, FaFire, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useLanguage } from "../context/LanguageContext"

const PromotionalPage = () => {
  const { getLocalizedPath } = useLanguage()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const scrollContainerRef = useRef(null)

  const scroll = (direction) => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = direction === "left" ? -320 : 320
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  // Countdown timer effect - counts down to December 1st, 2025
  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date('2025-12-01T00:00:00').getTime()
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch featured products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        // Get products from cache or API
        const allProducts = await productCache.getProducts()

        // Filter featured products and sort by stock status (in-stock first)
        const featured = allProducts
          .filter((product) => product.featured)
          .sort((a, b) => {
            // Check if products are in stock or pre-order
            const aInStock =
              a.stockStatus === "Available" ||
              a.stockStatus === "In Stock" ||
              (!a.stockStatus && a.countInStock > 0)
            const bInStock =
              b.stockStatus === "Available" ||
              b.stockStatus === "In Stock" ||
              (!b.stockStatus && b.countInStock > 0)

            const aPreOrder = a.stockStatus === "PreOrder"
            const bPreOrder = b.stockStatus === "PreOrder"

            // Priority: In-stock first, then pre-order, then others
            if (aInStock && !bInStock && !bPreOrder) return -1
            if (!aInStock && !aPreOrder && (bInStock || bPreOrder)) return 1
            if (aPreOrder && !bInStock && !bPreOrder) return -1
            if (!aInStock && !aPreOrder && bPreOrder) return 1

            // If both have same priority level, sort by updatedAt (newest first)
            const aUpdated = new Date(a.updatedAt || a.createdAt || 0)
            const bUpdated = new Date(b.updatedAt || b.createdAt || 0)
            return bUpdated - aUpdated
          })
          .slice(0, 12)

        setProducts(featured)
      } catch (err) {
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* 1️⃣ HERO BANNER - Green Friday Image */}
      <section className="w-full">
        <div className="w-full">
          <img
            src="/greenFriday.png"
            alt="Green Friday Sale"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* 2️⃣ FLASH COUNTDOWN TIMER SECTION - Now with floating animations! */}
      <section className="py-20 relative overflow-hidden">
        {/* Animated Floating Particles Background */}
        <div className="absolute inset-0 opacity-40">
          {/* Floating Circles */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-green-600 rounded-full animate-float"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-emerald-500 rounded-full animate-float-slow animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-lime-600 rounded-full animate-float animation-delay-4000"></div>
          <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-green-700 rounded-full animate-float-slow animation-delay-1000"></div>
          <div className="absolute bottom-1/4 right-10 w-28 h-28 bg-emerald-600 rounded-full animate-float animation-delay-3000"></div>
          <div className="absolute top-1/2 left-10 w-14 h-14 bg-lime-700 rounded-full animate-float-slow animation-delay-5000"></div>

          {/* Floating Stars/Shapes */}
          <div className="absolute top-40 right-1/4 w-16 h-16 animate-float animation-delay-2000">
            <div className="w-full h-full bg-yellow-400 transform rotate-45"></div>
          </div>
          <div className="absolute bottom-40 left-1/3 w-12 h-12 animate-float-slow animation-delay-4000">
            <div className="w-full h-full bg-yellow-500 transform rotate-12"></div>
          </div>
          <div className="absolute top-1/4 left-1/2 w-20 h-20 animate-float animation-delay-1000">
            <div className="w-full h-full bg-orange-400 transform -rotate-45"></div>
          </div>

          {/* Dollar Signs & Percentage Symbols */}
          <div className="absolute top-16 right-1/3 text-6xl font-black text-green-700 animate-float animation-delay-3000">💰</div>
          <div className="absolute bottom-32 left-1/4 text-5xl font-black text-emerald-700 animate-float-slow animation-delay-1000">%</div>
          <div className="absolute top-1/3 left-1/4 text-4xl font-black text-lime-700 animate-float animation-delay-5000">🎁</div>
          <div className="absolute bottom-1/3 right-1/4 text-7xl font-black text-green-600 animate-float-slow animation-delay-7000">⚡</div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 uppercase tracking-tight">
            UP TO 50% OFF Running!
          </h2>

          <div className="flex justify-center items-center gap-4 md:gap-8 my-12">
            {[
              { val: timeLeft.days, label: "Days" },
              { val: timeLeft.hours, label: "Hours" },
              { val: timeLeft.minutes, label: "Minutes" },
              { val: timeLeft.seconds, label: "Seconds" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="bg-white border border-lime-200 rounded-2xl p-4 md:p-8 min-w-[80px] md:min-w-[120px] shadow-2xl relative overflow-hidden transform hover:scale-110 transition-transform duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-emerald-600"></div>
                  <span className="text-4xl md:text-6xl font-mono font-bold text-gray-900">
                    {String(item.val).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-gray-800 mt-4 font-bold uppercase tracking-widest text-xs md:text-sm">{item.label}</span>
              </div>
            ))}
          </div>

          <Link to="/" className="inline-block bg-lime-500 text-white px-12 py-4 rounded-full font-bold text-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-gray-900/30 hover:scale-105 transform">
            Grab The Deals
          </Link>
        </div>
      </section>

      {/* 3️⃣ POPULAR CATEGORIES SECTION */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Popular Categories</h2>
              <p className="text-gray-500">Top picks from our best collections</p>
            </div>
            <Link to="/shop" className="hidden md:flex items-center text-green-600 font-semibold hover:text-green-700">
              View All Categories <FaArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Laptops", link: "/product-category/laptops", color: "bg-blue-50", img: "https://static4.hurtel.com/eng_pl_Baseus-foldable-high-stand-laptop-stand-up-to-16-39-39-with-adjustable-height-black-SUZB-A01-66711_16.jpg " },
              { name: "Gaming", link: "/product-category/gaming", color: "bg-purple-50", img: "https://www.gstoreq8.com/images/detailed/272/Video_Games.webp" },
              { name: "Accessories", link: "/product-category/accessories-components", color: "bg-orange-50", img: "https://jabeens.shop/cdn/shop/collections/overhead-view-various-gadgets-accessories-white-surface-centered-around-smartphone-wit_36722-4274.jpg?v=1717205752" },
              { name: "Desktop", link: "/product-category/desktop", color: "bg-green-50", img: "https://sm.pcmag.com/pcmag_au/photo/l/lenovo-leg/lenovo-legion-tower-7i-gen-8-2024_gawx.jpg" }
            ].map((cat, idx) => (
              <Link key={idx} to={cat.link} className="group block">
                <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/5]">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>

                    {/* Featured Product Preview */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 border border-white/20">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xs text-white">
                        Top
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">Featured Item</p>
                        <p className="text-green-300 text-xs font-bold">Shop Now</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                        <FaArrowRight />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/shop" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700">
              View All Categories <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4️⃣ MEGA SALES BANNER */}
      <section className="w-full">
        <div className="w-full">
          <img
            src="/megaSales.png"
            alt="Mega Sales Banner"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* 5️⃣ TRENDING / BEST DEALS CAROUSEL */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              🔥 Hot Selling Right Now
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="relative group">
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-green-600 hover:scale-110 transition-all"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-green-600 hover:scale-110 transition-all"
              >
                <FaChevronRight />
              </button>

              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-8 gap-6 snap-x hide-scrollbar scroll-smooth"
              >
                {products.slice(0, 8).map((product) => (
                  <div key={product._id} className="min-w-[280px] md:min-w-[300px] bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 snap-start group">
                    <div className="relative h-64 overflow-hidden rounded-t-2xl ">
                      <img
                        src={getFullImageUrl(product.image) || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        HOT
                      </div>
                      {product.discount > 0 && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          -{product.discount}%
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-3">
                        <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                          <FaShoppingCart className="text-[10px]" /> Deal ends in {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
                        </p>
                      </div>

                      <Link to={getLocalizedPath(`/product/${product.slug || product._id}`)}>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 hover:text-green-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-end justify-between mt-4">
                        <div>
                          <span className="block text-2xl font-bold text-gray-900">
                            {(product.offerPrice || product.price).toLocaleString()} <span className="text-sm font-normal text-gray-500">AED</span>
                          </span>
                          {product.offerPrice && product.offerPrice < product.price && (
                            <span className="text-sm text-gray-400 line-through">
                              {product.price.toLocaleString()} AED
                            </span>
                          )}
                        </div>
                        <button className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors">
                          <FaArrowRight />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>


      {/* 7️⃣ TESTIMONIALS / SOCIAL PROOF */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Customers Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Ahmed K.", text: "Loved the quality! Got amazing deals during Green Friday. Highly recommend!", color: "bg-green-100" },
              { name: "Sarah M.", text: "Delivery was super fast during Green Friday! Products arrived in perfect condition.", color: "bg-blue-100" },
              { name: "Mohammed A.", text: "Best prices I've found anywhere! Saved so much money on my purchase.", color: "bg-purple-100" }
            ].map((review, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                </div>
                <p className="text-gray-600 mb-6 italic">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${review.color} flex items-center justify-center font-bold text-gray-700`}>
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                    <span className="text-xs text-green-600 font-semibold">Verified Buyer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8️⃣ PAYMENT / GUARANTEE / FREE DELIVERY BADGES */}
      <section className="py-12 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-2xl mb-4">
                <FaShieldAlt />
              </div>
              <h3 className="font-bold text-gray-900">Secure Payment</h3>
              <p className="text-sm text-gray-500 mt-1">100% Safe & Secure</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-2xl mb-4">
                <FaShippingFast />
              </div>
              <h3 className="font-bold text-gray-900">Free Delivery</h3>
              <p className="text-sm text-gray-500 mt-1">On Orders Over 500 AED</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-2xl mb-4">
                <FaUndo />
              </div>
              <h3 className="font-bold text-gray-900">14 Days Return</h3>
              <p className="text-sm text-gray-500 mt-1">Easy Returns Policy</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-2xl mb-4">
                <FaStar />
              </div>
              <h3 className="font-bold text-gray-900">Authentic Products</h3>
              <p className="text-sm text-gray-500 mt-1">100% Genuine</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9️⃣ FOOTER CALL-TO-ACTION */}
      <section className="py-24 bg-lime-500 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Don't Miss Out!
          </h2>
          <p className="text-xl text-green-100 mb-10">
            The clock is ticking on the biggest sale of the year. Grab your favorites before they are gone.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-white text-green-900 px-12 py-5 rounded-full text-xl font-bold hover:bg-green-50 transition-all transform hover:-translate-y-1 shadow-2xl"
          >
            Shop All Deals
          </Link>
        </div>
      </section>

    </div>
  )
}

export default PromotionalPage
