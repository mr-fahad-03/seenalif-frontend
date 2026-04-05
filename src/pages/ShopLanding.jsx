import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import config from "../config/config"
import { useLanguage } from "../context/LanguageContext"
import TranslatedText from "../components/TranslatedText"
import { ShoppingBag, ArrowRight, Star, Shield, Truck, Zap } from "lucide-react"
import { getOptimizedImageUrl } from "../utils/imageUtils"
import HomeStyleProductCard from "../components/HomeStyleProductCard"

const API_BASE_URL = config.API_URL

const ShopLanding = () => {
  const { getLocalizedPath } = useLanguage()
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const [catsRes, productsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/categories`),
          axios.get(`${API_BASE_URL}/api/products?featured=true&limit=8`)
        ])
        setCategories(catsRes.data.filter(c => c.isActive))
        setFeaturedProducts(productsRes.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching shop landing data:", error)
        setLoading(false)
      }
    }
    fetchShopData()
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 md:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            <TranslatedText>Browse Our Collection</TranslatedText>
          </h1>
          <p className="text-gray-600 max-w-2xl">
            <TranslatedText>Discover our full range of premium laptops, smartphones, and electronics. High-quality tech delivered to your door.</TranslatedText>
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 md:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            <TranslatedText>Top Categories</TranslatedText>
          </h2>
          <Link to={getLocalizedPath("/shop")} className="text-lime-600 font-semibold flex items-center gap-1 hover:underline">
            <TranslatedText>View All</TranslatedText> <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.slice(0, 8).map((category) => (
            <Link 
              key={category._id}
              to={getLocalizedPath(`/shop/${encodeURIComponent(category.slug || category.name)}`)}
              className="group relative h-40 md:h-52 rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all"
            >
              <img 
                src={getOptimizedImageUrl(category.image) || "/placeholder.svg"} 
                alt={category.name}
                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-sm md:text-lg font-bold text-gray-900 group-hover:text-white transition-colors">
                  <TranslatedText text={category.name} sourceDoc={category} fieldName="name" />
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-lime-500 py-12 mb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Truck className="text-black" />
              </div>
              <h4 className="font-bold text-black mb-1"><TranslatedText>Fast Delivery</TranslatedText></h4>
              <p className="text-sm text-black/70"><TranslatedText>Across UAE</TranslatedText></p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-black" />
              </div>
              <h4 className="font-bold text-black mb-1"><TranslatedText>Secure Payment</TranslatedText></h4>
              <p className="text-sm text-black/70"><TranslatedText>100% Safe Transaction</TranslatedText></p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Zap className="text-black" />
              </div>
              <h4 className="font-bold text-black mb-1"><TranslatedText>Best Prices</TranslatedText></h4>
              <p className="text-sm text-black/70"><TranslatedText>Top Deals Every Day</TranslatedText></p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Star className="text-black" />
              </div>
              <h4 className="font-bold text-black mb-1"><TranslatedText>Genuine Products</TranslatedText></h4>
              <p className="text-sm text-black/70"><TranslatedText>Authorized Distributor</TranslatedText></p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            <TranslatedText>Trending Tech</TranslatedText>
          </h2>
          <Link to={getLocalizedPath("/shop")} className="text-lime-600 font-semibold flex items-center gap-1 hover:underline">
            <TranslatedText>View All Deals</TranslatedText> <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <HomeStyleProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Promotional Callout */}
      <section className="container mx-auto px-4 md:px-8 mt-20">
        <div className="bg-gray-900 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
            <img 
              src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1741541334/banners/electronics_banner.png" 
              alt="Promo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-10 md:p-16 lg:w-1/2">
            <span className="text-lime-400 font-mono text-sm tracking-widest uppercase mb-4 block">Limited Offer</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              <TranslatedText>Summer Sale 2026</TranslatedText>
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              <TranslatedText>Get up to 40% off on all premium laptops and accessories. This week only!</TranslatedText>
            </p>
            <Link 
              to={getLocalizedPath("/shop")} 
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black font-bold py-3 px-8 rounded-full transition-all"
            >
              <TranslatedText>Shop the Sale</TranslatedText>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ShopLanding
