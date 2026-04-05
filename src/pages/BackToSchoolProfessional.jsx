import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { productsAPI } from "../services/api"
import CampaignProductCard from "../components/CampaignProductCard"

const BackToSchoolGaming = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false) // Start with false for instant display
  const [error, setError] = useState(null)

  // Gaming laptop SKUs
  const gamingSkus = [
    "NX.KQ8EM.001",
    "NX.KXAEM.003",
    "NX.J5QEM.001",
    "NX.KXTEM.004",
    "NX.J5REM.001",
    "NX.J23EM.003"

  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch ONLY the specific products by SKU
        const gamingProducts = await productsAPI.getBySkus(gamingSkus)
        
        console.log('Gaming products found:', gamingProducts.length)
        console.log('Found products:', gamingProducts.map(p => ({ sku: p.sku, name: p.name })))
        
        setProducts(gamingProducts)
      } catch (err) {
        console.error("Error fetching gaming products:", err)
        setError("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
            {/* Banner Section */}
      <div className="">
        {/* Background Image */}
        <div className=" inset-0">
          <img
            src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1754034599/acer_3_aoqkw2.png"
            alt="Acer Gaming Laptops"
            className="w-full h-[200px] md:h-full bg-cover mt-2"
          />
        </div>
        
      <h1 className="text-2xl md:text-6xl font-bold mt-12 text-center  text-lime-500">Embrace Every Moment with Grace</h1>
      <p className="text-gray-600 mt-4 text-lg mb-6 text-center" >Empowering Presence, Elevating Purpose.</p>
      </div>


      {/* Banner Image Section */}
      <div className="w-full mt-16">
        <img
          src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1754125044/offer_professional_banner_nt51ug.png"
          alt="Acer Gaming Banner"
          className="w-full h-[200px] md:h-auto bg-cover"
        />
      </div>

      {/* Products Section Title */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-5xl -mb-10 font-bold text-gray-900 text-center">
            Laptops Collection
          </h2>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-gray-100 py-16">
          <div className="text-center">
            <div className="text-gray-800 text-xl mb-4">No gaming laptops found</div>
            <p className="text-gray-600">Please check back later or contact us for availability.</p>
          </div>
        </div>
      ) : (
        <>
          {/* First Section - First 3 Cards */}
          <div className="py-4 lg:py-16">
            {/* Content Container */}
            <div className="container mx-auto px-4">
              {/* Mobile Layout - Centered */}
              <div className="block md:hidden">
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    {products.slice(0, 4).map((product) => (
                      <CampaignProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Desktop Layout - Centered */}
              <div className="hidden md:flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                  {products.slice(0, 3).map((product) => (
                    <CampaignProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Second Section - Next 3 Cards */}
          <div className="mb-18">
            {/* Content Container */}
            <div className="container mx-auto px-4">
              {/* Mobile Layout - Centered */}
              <div className="block md:hidden">
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    {products.slice(4, 6).map((product) => (
                      <CampaignProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Desktop Layout - Centered */}
              <div className="hidden md:flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                  {products.slice(3, 6).map((product) => (
                    <CampaignProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose Acer Gaming Laptops?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">High Performance</h3>
              <p className="text-gray-600">
                Powered by Intel Core i7 processors and NVIDIA RTX graphics for ultimate gaming performance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">165Hz Display</h3>
              <p className="text-gray-600">
                Ultra-smooth 165Hz refresh rate for fluid gameplay and reduced motion blur.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Backlit Keyboard</h3>
              <p className="text-gray-600">
                RGB backlit keyboard for gaming in any lighting condition with customizable colors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Gaming Laptops Banner */}
      <Link to="/backtoschool-acer-gaming" className="block md:hidden">
        <div className="relative h-48 overflow-hidden group cursor-pointer">
          {/* Background Image for Mobile */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundImage: 'url("https://res.cloudinary.com/dyfhsu5v6/image/upload/v1754296194/gaming_lf5dfr.png")'
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white transform transition-all duration-300 group-hover:scale-110">
              <h2 className="text-2xl font-bold mb-4">
                Shop Gaming Laptops
              </h2>
              <div className="w-16 h-1 bg-white mx-auto"></div>
            </div>
          </div>
        </div>
      </Link>

      {/* Desktop Gaming Laptops Banner */}
      <Link to="/backtoschool-acer-gaming" className="hidden md:block">
        <div className="relative h-80 overflow-hidden group cursor-pointer">
          {/* Background Image for Desktop */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundImage: 'url("https://res.cloudinary.com/dyfhsu5v6/image/upload/v1754030807/acer_2_d5wwif.png")'
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white transform transition-all duration-300 group-hover:scale-110">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                Shop Gaming Laptops
              </h2>
              <div className="w-24 h-1 bg-white mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300"></div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default BackToSchoolGaming