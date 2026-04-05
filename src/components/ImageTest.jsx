import { useState, useEffect } from 'react'
import { getImageUrl } from '../utils/imageUtils'

const ImageTest = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=5')
        const data = await response.json()
        setProducts(data)

      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return <div className="p-4">Loading products for image test...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Image Test Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <div key={product._id} className="border p-4 rounded">
            <h3 className="font-semibold mb-2">{product.name}</h3>
            <div className="mb-2">
              <img 
                src={getImageUrl(product)} 
                alt={product.name}
                className="w-full h-32 object-cover rounded"
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=150&width=150"
                }}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Image URL:</strong> {product.image || 'None'}</p>
              <p><strong>Images Array:</strong> {product.images?.length || 0} items</p>
              <p><strong>Gallery Images:</strong> {product.galleryImages?.length || 0} items</p>
              <p><strong>Final URL:</strong> {getImageUrl(product)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageTest 