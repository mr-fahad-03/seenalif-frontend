// import config from "../config/config.js"

// // Product Caching Service with compression and size management
// class ProductCacheService {
//   constructor() {
//     this.CACHE_KEY = 'graba2z_products_cache'
//     this.CACHE_CHUNK_PREFIX = 'graba2z_products_chunk_'
//     this.CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutes
//     this.MAX_CACHE_SIZE = 1 * 1024 * 1024 // 1MB per chunk (reduced)
//     this.MAX_CHUNKS = 20 // More chunks, smaller size
//   }

//   // Compress data using JSON.stringify and btoa
//   compressData(data) {
//     try {
//       const jsonString = JSON.stringify(data)
//       return btoa(encodeURIComponent(jsonString))
//     } catch (error) {
//       return null
//     }
//   }

//   // Decompress data
//   decompressData(compressedData) {
//     try {
//       const jsonString = decodeURIComponent(atob(compressedData))
//       return JSON.parse(jsonString)
//     } catch (error) {
//       return null
//     }
//   }

//   // Check if cache is valid
//   isCacheValid() {
//     const cached = localStorage.getItem(this.CACHE_KEY)
//     if (!cached) return false

//     try {
//       const data = this.decompressData(cached)
//       if (!data) return false
      
//       const now = Date.now()
//       return data.timestamp && (now - data.timestamp) < this.CACHE_EXPIRY
//     } catch (error) {
//       return false
//     }
//   }

//   // Get cached products
//   getCachedProducts() {
//     if (!this.isCacheValid()) return null

//     try {
//       const cached = localStorage.getItem(this.CACHE_KEY)
//       const data = this.decompressData(cached)
      
//       if (!data) return null

//       // Check if data is chunked
//       if (data.isChunked) {
//         return this.getCachedProductsChunked(data)
//       }

//       return data?.products || []
//     } catch (error) {
//       return null
//     }
//   }

//   // Get cached products from chunked storage
//   getCachedProductsChunked(metadata) {
//     try {
//       const allProducts = []
      
//       for (let i = 0; i < metadata.chunkCount; i++) {
//         const chunkKey = `${this.CACHE_CHUNK_PREFIX}${i}`
        
//         // Try localStorage first, then sessionStorage
//         let chunkData = localStorage.getItem(chunkKey)
//         let storageType = 'localStorage'
        
//         if (!chunkData) {
//           chunkData = sessionStorage.getItem(chunkKey)
//           storageType = 'sessionStorage'
//         }
        
//         if (!chunkData) {
//           return null
//         }

//         const chunk = this.decompressData(chunkData)
//         if (!chunk || !chunk.products) {
//           return null
//         }

//         allProducts.push(...chunk.products)
//       }

//       return allProducts

//     } catch (error) {
//       return null
//     }
//   }

//     // Set products in cache with chunked storage
//   async setCachedProducts(products) {
//     try {

      
//       // Create ultra-minimal product data (only core fields)
//       const minimalProducts = products.map(product => ({
//         _id: product._id,
//         name: product.name,
//         price: product.price,
//         basePrice: product.basePrice,
//         offerPrice: product.offerPrice,
//         brand: product.brand,
//         category: product.category,
//         parentCategory: product.parentCategory,
//         countInStock: product.countInStock,
//         stockStatus: product.stockStatus,
//         discount: product.discount,
//         featured: product.featured,
//         slug: product.slug,
//         image: product.image,
//         galleryImages: product.galleryImages
//       }))

//       // Try single cache first
//       const cacheData = {
//         products: minimalProducts,
//         timestamp: Date.now(),
//         isMinimal: true
//       }

//       const compressedData = this.compressData(cacheData)
//       if (!compressedData) {
//         throw new Error('Failed to compress data')
//       }

//       const dataSize = new Blob([compressedData]).size
      
//       if (dataSize <= this.MAX_CACHE_SIZE) {
//         localStorage.setItem(this.CACHE_KEY, compressedData)
//         return
//       }

//       // If too large, try chunked storage
//       return await this.setCachedProductsChunked(minimalProducts)

//     } catch (error) {
//       throw error
//     }
//   }

//   // Set products in cache using chunked storage
//   async setCachedProductsChunked(products) {
//     try {
//       const chunkSize = Math.ceil(products.length / this.MAX_CHUNKS)
//       const chunks = []
      
//       // Split products into chunks
//       for (let i = 0; i < products.length; i += chunkSize) {
//         chunks.push(products.slice(i, i + chunkSize))
//       }



//       // Store chunk metadata
//       const metadata = {
//         totalProducts: products.length,
//         chunkCount: chunks.length,
//         timestamp: Date.now(),
//         isChunked: true
//       }

//       localStorage.setItem(this.CACHE_KEY, this.compressData(metadata))

//       // Store each chunk
//       for (let i = 0; i < chunks.length; i++) {
//         const chunkData = {
//           products: chunks[i],
//           chunkIndex: i,
//           timestamp: Date.now()
//         }

//         const compressedChunk = this.compressData(chunkData)
//         const chunkSize = new Blob([compressedChunk]).size

//         if (chunkSize > this.MAX_CACHE_SIZE) {
//           // Try sessionStorage as fallback
//           try {
//             sessionStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
//           } catch (sessionError) {
//             throw new Error(`Chunk ${i} is too large for both localStorage and sessionStorage: ${chunkSize} bytes`)
//           }
//         } else {
//           localStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
//         }
//       }

//       return true

//     } catch (error) {
//       // Clean up any partial chunks
//       this.clearCache()
//       throw error
//     }
//   }

//   // Clear cache
//   clearCache() {
//     // Clear main cache
//     localStorage.removeItem(this.CACHE_KEY)
//     sessionStorage.removeItem(this.CACHE_KEY)
    
//     // Clear chunked cache from both storages
//     for (let i = 0; i < this.MAX_CHUNKS; i++) {
//       localStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
//       sessionStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
//     }
    

//   }

//   // Force refresh cache (clear and fetch new data)
//   async forceRefreshCache() {
//     this.clearCache()
//     const products = await this.fetchAndCacheProducts()
//     return products
//   }

//   // Test cache functionality
//   async testCache() {
//     // Check current cache
//     const stats = this.getCacheStats()
    
//     // Try to get products
//     const products = await this.getProducts()
    
//     // Check if cache was used
//     const newStats = this.getCacheStats()
    
//     // Test storage availability
//     const storageTest = {
//       localStorage: this.testStorage('localStorage'),
//       sessionStorage: this.testStorage('sessionStorage')
//     }
    
//     return { products, cacheUsed: newStats.hasCache, storageTest }
//   }

//   // Test storage availability
//   testStorage(storageType) {
//     try {
//       const testKey = 'test_storage'
//       const testValue = 'test'
      
//       if (storageType === 'localStorage') {
//         localStorage.setItem(testKey, testValue)
//         const result = localStorage.getItem(testKey) === testValue
//         localStorage.removeItem(testKey)
//         return result
//       } else if (storageType === 'sessionStorage') {
//         sessionStorage.setItem(testKey, testValue)
//         const result = sessionStorage.getItem(testKey) === testValue
//         sessionStorage.removeItem(testKey)
//         return result
//       }
//       return false
//     } catch (error) {
//       return false
//     }
//   }

//     // Fetch products from API and cache them
//   async fetchAndCacheProducts() {
//     try {
//       const response = await fetch(`${config.API_URL}/api/products`)
//       if (!response.ok) {
//         throw new Error('Failed to fetch products')
//       }
//       const products = await response.json()
      
//       // Always try to cache products
//       try {
//         await this.setCachedProducts(products)
//       } catch (cacheError) {
//         // Continue without cache - the app will still work
//       }
      
//       return products
//     } catch (error) {
//       throw error
//     }
//   }

//       // Get products (from cache or API)
//   async getProducts() {
//     // Check if we have valid cached data
//     if (this.isCacheValid()) {
//       const cachedProducts = this.getCachedProducts()
//       if (cachedProducts && cachedProducts.length > 0) {
//         return cachedProducts
//       }
//     }

//     // Fetch from API if no valid cache
//     return await this.fetchAndCacheProducts()
//   }

//   // Filter products by category and parent_category
//   filterProducts(products, filters = {}) {
//     if (!products || !Array.isArray(products)) {
//       return []
//     }

//     let filteredProducts = [...products]

//     // Filter by category
//     if (filters.category && filters.category !== 'all') {
//       filteredProducts = filteredProducts.filter(product => {
//         if (!product.category) return false
        
//         const categoryId = typeof product.category === 'string' 
//           ? product.category 
//           : product.category._id
        
//         return categoryId === filters.category
//       })
//     }

//     // Filter by parent_category
//     if (filters.parent_category && filters.parent_category !== 'all') {
//       filteredProducts = filteredProducts.filter(product => {
//         if (!product.parentCategory) return false
        
//         const parentCategoryId = typeof product.parentCategory === 'string' 
//           ? product.parentCategory 
//           : product.parentCategory._id
        
//         return parentCategoryId === filters.parent_category
//       })
//     }

//     // Filter by brand
//     if (filters.brand && filters.brand.length > 0) {
//       filteredProducts = filteredProducts.filter(product => {
//         if (!product.brand) return false
        
//         const brandId = typeof product.brand === 'string' 
//           ? product.brand 
//           : product.brand._id
        
//         return filters.brand.includes(brandId)
//       })
//     }

//     // Filter by search query
//     if (filters.search && filters.search.trim()) {
//       const searchTerm = filters.search.toLowerCase().trim()
//       filteredProducts = filteredProducts.filter(product => {
//         const name = (product.name || '').toLowerCase()
//         const description = (product.description || '').toLowerCase()
//         const brandName = product.brand?.name?.toLowerCase() || ''
        
//         return name.includes(searchTerm) || 
//                description.includes(searchTerm) || 
//                brandName.includes(searchTerm)
//       })
//     }

//     // Filter by price range
//     if (filters.priceRange && Array.isArray(filters.priceRange)) {
//       const [minPrice, maxPrice] = filters.priceRange
//       filteredProducts = filteredProducts.filter(product => {
//         const price = product.price || 0
//         return price >= minPrice && price <= maxPrice
//       })
//     }

//     // Filter by stock status (supports multiple filters)
//     if (filters.stockStatus) {
//       const stockFilters = Array.isArray(filters.stockStatus) ? filters.stockStatus : [filters.stockStatus]
      
//       if (stockFilters.length > 0) {
//         filteredProducts = filteredProducts.filter(product => {
//           // If any stock filter matches, include the product
//           const matches = stockFilters.some(filter => {
//             switch (filter) {
//               case 'inStock':
//                 // Product is in stock if stockStatus is "Available Product" OR countInStock > 0
//                 return product.stockStatus === "Available Product" || (product.countInStock || 0) > 0
//               case 'outOfStock':
//                 // Product is out of stock if stockStatus is "Out of Stock" AND countInStock === 0
//                 return product.stockStatus === "Out of Stock" && (product.countInStock || 0) === 0
//               case 'onSale':
//                 // Product is on sale if has discount > 0 OR offerPrice < price
//                 return (product.discount && product.discount > 0) || 
//                        (product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price)
//               default:
//                 return false
//             }
//           })
//           return matches
//         })
//       }
//     }

//     // Sort products - Always prioritize in-stock products first
//     filteredProducts.sort((a, b) => {
//       // Check if products are in stock
//       const aInStock = a.stockStatus === "Available" || a.stockStatus === "Available Product" || (!a.stockStatus && a.countInStock > 0)
//       const bInStock = b.stockStatus === "Available" || b.stockStatus === "Available Product" || (!b.stockStatus && b.countInStock > 0)
      
//       // In-stock products come first
//       if (aInStock && !bInStock) return -1
//       if (!aInStock && bInStock) return 1
      
//       // If both have same stock status, apply secondary sorting
//       if (filters.sortBy) {
//         switch (filters.sortBy) {
//           case 'price-low':
//             return (a.price || 0) - (b.price || 0)
//           case 'price-high':
//             return (b.price || 0) - (a.price || 0)
//           case 'name':
//             return (a.name || '').localeCompare(b.name || '')
//           case 'newest':
//           default:
//             return new Date(b.createdAt) - new Date(a.createdAt)
//         }
//       }
      
//       // Default sorting by newest if no sortBy specified
//       return new Date(b.createdAt) - new Date(a.createdAt)
//     })

//     return filteredProducts
//   }

//   // Get cache statistics
//   getCacheStats() {
//     const cached = localStorage.getItem(this.CACHE_KEY)
//     if (!cached) {
//       return { hasCache: false, itemCount: 0, age: null, cacheType: 'none' }
//     }

//     try {
//       const data = this.decompressData(cached)
//       if (!data) {
//         return { hasCache: false, itemCount: 0, age: null, cacheType: 'none' }
//       }
      
//       const age = Date.now() - data.timestamp
//       let cacheType = 'full'
//       if (data.isEssential) cacheType = 'essential'
//       if (data.isMinimal) cacheType = 'minimal'
//       if (data.isUltraMinimal) cacheType = 'ultra-minimal'
//       if (data.isChunked) cacheType = 'chunked'
      
//       const itemCount = data.isChunked ? data.totalProducts : (data.products?.length || 0)
      
//       return {
//         hasCache: true,
//         itemCount: itemCount,
//         age: age,
//         isValid: age < this.CACHE_EXPIRY,
//         cacheType: cacheType,
//         chunks: data.isChunked ? data.chunkCount : null
//       }
//     } catch (error) {
//       return { hasCache: false, itemCount: 0, age: null, cacheType: 'none' }
//     }
//   }
// }

// // Create singleton instance
// const productCache = new ProductCacheService()

// export default productCache 






import config from "../config/config.js"

// Product Caching Service with compression and size management
class ProductCacheService {
  constructor() {
    this.CACHE_KEY = "graba2z_products_cache"
    this.CACHE_CHUNK_PREFIX = "graba2z_products_chunk_"
    this.CACHE_EXPIRY = 8 * 60 * 60 * 1000 // 8hrs
    this.MAX_CACHE_SIZE = 1 * 1024 * 1024 // 1MB per chunk (reduced)
    this.MAX_CHUNKS = 20 // More chunks, smaller size
    this.CACHE_SCHEMA_VERSION = 2
  }

  // Compress data using JSON.stringify and btoa
  compressData(data) {
    try {
      const jsonString = JSON.stringify(data)
      return btoa(encodeURIComponent(jsonString))
    } catch (error) {
      return null
    }
  }

  // Decompress data
  decompressData(compressedData) {
    try {
      const jsonString = decodeURIComponent(atob(compressedData))
      return JSON.parse(jsonString)
    } catch (error) {
      return null
    }
  }

  // Check if cache is valid
  isCacheValid() {
    const cached = localStorage.getItem(this.CACHE_KEY)
    if (!cached) return false

    try {
      const data = this.decompressData(cached)
      if (!data) return false

      const now = Date.now()
      const isSchemaValid = data.schemaVersion === this.CACHE_SCHEMA_VERSION
      return isSchemaValid && data.timestamp && now - data.timestamp < this.CACHE_EXPIRY
    } catch (error) {
      return false
    }
  }

  // Get cached products
  getCachedProducts() {
    if (!this.isCacheValid()) return null

    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      const data = this.decompressData(cached)

      if (!data) return null

      // Check if data is chunked
      if (data.isChunked) {
        return this.getCachedProductsChunked(data)
      }

      return data?.products || []
    } catch (error) {
      return null
    }
  }

  // Get cached products from chunked storage
  getCachedProductsChunked(metadata) {
    try {
      const allProducts = []

      for (let i = 0; i < metadata.chunkCount; i++) {
        const chunkKey = `${this.CACHE_CHUNK_PREFIX}${i}`

        // Try localStorage first, then sessionStorage
        let chunkData = localStorage.getItem(chunkKey)
        let storageType = "localStorage"

        if (!chunkData) {
          chunkData = sessionStorage.getItem(chunkKey)
          storageType = "sessionStorage"
        }

        if (!chunkData) {
          return null
        }

        const chunk = this.decompressData(chunkData)
        if (!chunk || !chunk.products) {
          return null
        }

        allProducts.push(...chunk.products)
      }

      return allProducts
    } catch (error) {
      return null
    }
  }

  // Set products in cache with chunked storage
  async setCachedProducts(products) {
    try {
      // Create ultra-minimal product data (only core fields)
      const minimalProducts = products.map((product) => ({
        _id: product._id,
        name: product.name,
        sku: product.sku, // include SKU for client-side search
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        basePrice: product.basePrice,
        offerPrice: product.offerPrice,
        brand: product.brand,
        category: product.category,
        subCategory: product.subCategory, // Legacy field for backward compatibility
        parentCategory: product.parentCategory,
        subCategory2: product.subCategory2,
        subCategory3: product.subCategory3,
        subCategory4: product.subCategory4,
        countInStock: product.countInStock,
        stockStatus: product.stockStatus,
        discount: product.discount,
        featured: product.featured,
        slug: product.slug,
        image: product.image,
        galleryImages: product.galleryImages,
        rating: product.rating,
        numReviews: product.numReviews,
      }))

      // Try single cache first
      const cacheData = {
        products: minimalProducts,
        timestamp: Date.now(),
        isMinimal: true,
        schemaVersion: this.CACHE_SCHEMA_VERSION,
      }

      const compressedData = this.compressData(cacheData)
      if (!compressedData) {
        throw new Error("Failed to compress data")
      }

      const dataSize = new Blob([compressedData]).size

      if (dataSize <= this.MAX_CACHE_SIZE) {
        localStorage.setItem(this.CACHE_KEY, compressedData)
        return
      }

      // If too large, try chunked storage
      return await this.setCachedProductsChunked(minimalProducts)
    } catch (error) {
      throw error
    }
  }

  // Set products in cache using chunked storage
  async setCachedProductsChunked(products) {
    try {
      const chunkSize = Math.ceil(products.length / this.MAX_CHUNKS)
      const chunks = []

      // Split products into chunks
      for (let i = 0; i < products.length; i += chunkSize) {
        chunks.push(products.slice(i, i + chunkSize))
      }

      // Store chunk metadata
      const metadata = {
        totalProducts: products.length,
        chunkCount: chunks.length,
        timestamp: Date.now(),
        isChunked: true,
        schemaVersion: this.CACHE_SCHEMA_VERSION,
      }

      localStorage.setItem(this.CACHE_KEY, this.compressData(metadata))

      // Store each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunkData = {
          products: chunks[i],
          chunkIndex: i,
          timestamp: Date.now(),
        }

        const compressedChunk = this.compressData(chunkData)
        const chunkSize = new Blob([compressedChunk]).size

        if (chunkSize > this.MAX_CACHE_SIZE) {
          // Try sessionStorage as fallback
          try {
            sessionStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
          } catch (sessionError) {
            throw new Error(`Chunk ${i} is too large for both localStorage and sessionStorage: ${chunkSize} bytes`)
          }
        } else {
          localStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
        }
      }

      return true
    } catch (error) {
      // Clean up any partial chunks
      this.clearCache()
      throw error
    }
  }

  // Clear cache
  clearCache() {
    // Clear main cache
    localStorage.removeItem(this.CACHE_KEY)
    sessionStorage.removeItem(this.CACHE_KEY)

    // Clear chunked cache from both storages
    for (let i = 0; i < this.MAX_CHUNKS; i++) {
      localStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
      sessionStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
    }
  }

  // Force refresh cache (clear and fetch new data)
  async forceRefreshCache() {
    this.clearCache()
    const products = await this.fetchAndCacheProducts()
    return products
  }

  // Test cache functionality
  async testCache() {
    // Check current cache
    const stats = this.getCacheStats()

    // Try to get products
    const products = await this.getProducts()

    // Check if cache was used
    const newStats = this.getCacheStats()

    // Test storage availability
    const storageTest = {
      localStorage: this.testStorage("localStorage"),
      sessionStorage: this.testStorage("sessionStorage"),
    }

    return { products, cacheUsed: newStats.hasCache, storageTest }
  }

  // Test storage availability
  testStorage(storageType) {
    try {
      const testKey = "test_storage"
      const testValue = "test"

      if (storageType === "localStorage") {
        localStorage.setItem(testKey, testValue)
        const result = localStorage.getItem(testKey) === testValue
        localStorage.removeItem(testKey)
        return result
      } else if (storageType === "sessionStorage") {
        sessionStorage.setItem(testKey, testValue)
        const result = sessionStorage.getItem(testKey) === testValue
        sessionStorage.removeItem(testKey)
        return result
      }
      return false
    } catch (error) {
      return false
    }
  }

  // Fetch products from API and cache them
  async fetchAndCacheProducts() {
    try {
      const response = await fetch(`${config.API_URL}/api/products?cacheSchema=${this.CACHE_SCHEMA_VERSION}`)
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const products = await response.json()

      // Always try to cache products
      try {
        await this.setCachedProducts(products)
      } catch (cacheError) {
        // Continue without cache - the app will still work
      }

      return products
    } catch (error) {
      throw error
    }
  }

  // Get products (from cache or API)
  async getProducts() {
    // Check if we have valid cached data
    if (this.isCacheValid()) {
      const cachedProducts = this.getCachedProducts()
      if (cachedProducts && cachedProducts.length > 0) {
        // Migration guard: refresh stale cache shapes once (older cache may miss stock fields).
        const sample = cachedProducts[0] || {}
        const hasSku = typeof sample.sku !== "undefined"
        const hasStockFields = cachedProducts.some((product) => {
          if (!product || typeof product !== "object") return false
          return (
            Object.prototype.hasOwnProperty.call(product, "countInStock") ||
            Object.prototype.hasOwnProperty.call(product, "stockStatus")
          )
        })
        const hasDescriptionFields = cachedProducts.some((product) => {
          if (!product || typeof product !== "object") return false
          return (
            Object.prototype.hasOwnProperty.call(product, "description") ||
            Object.prototype.hasOwnProperty.call(product, "shortDescription")
          )
        })

        if (!hasSku || !hasStockFields || !hasDescriptionFields) {
          return await this.fetchAndCacheProducts()
        }
        return cachedProducts
      }
    }

    // Fetch from API if no valid cache
    return await this.fetchAndCacheProducts()
  }

  // Filter products by category and parent_category
  filterProducts(products, filters = {}) {
    if (!products || !Array.isArray(products)) {
      return []
    }

    let filteredProducts = [...products]

    const normalizeSlug = (value) => {
      if (value == null) return ""
      return String(value)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
    }

    const fieldToValues = (field) => {
      if (!field) return []
      if (typeof field === "string") return [field, normalizeSlug(field)]

      const values = []
      if (field._id) values.push(String(field._id), normalizeSlug(field._id))
      if (field.slug) values.push(String(field.slug), normalizeSlug(field.slug))
      if (field.name) values.push(String(field.name), normalizeSlug(field.name))
      return values
    }

    const matchesField = (field, expected) => {
      if (!expected || expected === "all") return true
      const rawExpected = String(expected)
      const normExpected = normalizeSlug(expected)
      const values = fieldToValues(field)
      return values.includes(rawExpected) || (normExpected && values.includes(normExpected))
    }

    const matchesLevel1 = (product, expected) => {
      if (!expected || expected === "all") return true
      // Level 1 can be stored in category or legacy subCategory.
      return matchesField(product.category, expected) || matchesField(product.subCategory, expected)
    }

    // Strict hierarchy matching by level
    if (filters.parent_category && filters.parent_category !== "all") {
      filteredProducts = filteredProducts.filter((product) => matchesField(product.parentCategory, filters.parent_category))
    }
    if (filters.category && filters.category !== "all") {
      filteredProducts = filteredProducts.filter((product) => matchesLevel1(product, filters.category))
    }
    if (filters.subcategory2) {
      filteredProducts = filteredProducts.filter((product) => matchesField(product.subCategory2, filters.subcategory2))
    }
    if (filters.subcategory3) {
      filteredProducts = filteredProducts.filter((product) => matchesField(product.subCategory3, filters.subcategory3))
    }
    if (filters.subcategory4) {
      filteredProducts = filteredProducts.filter((product) => matchesField(product.subCategory4, filters.subcategory4))
    }

    // Filter by brand
    if (filters.brand && filters.brand.length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        if (!product.brand) return false

        const brandId = typeof product.brand === "string" ? product.brand : product.brand._id

        return filters.brand.includes(brandId)
      })
    }

    // Filter by search query
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim()
      filteredProducts = filteredProducts.filter((product) => {
        const name = (product.name || "").toLowerCase()
        const description = (product.description || "").toLowerCase()
        const brandName = product.brand?.name?.toLowerCase() || ""
        const sku = (product.sku || "").toLowerCase()

        return (
          name.includes(searchTerm) ||
          description.includes(searchTerm) ||
          brandName.includes(searchTerm) ||
          sku.includes(searchTerm)
        )
      })
    }

    // Filter by price range
    if (filters.priceRange && Array.isArray(filters.priceRange)) {
      const [minPrice, maxPrice] = filters.priceRange
      filteredProducts = filteredProducts.filter((product) => {
        // Use offerPrice if available, otherwise use price
        const price = product.offerPrice > 0 ? product.offerPrice : (product.price > 0 ? product.price : 0)
        return price >= minPrice && price <= maxPrice
      })
    }

    const normalizeStatus = (status) => String(status || "").trim().toLowerCase().replace(/\s+/g, " ")
    const hasPositiveStock = (product) => Number(product?.countInStock || 0) > 0
    const isExplicitOutOfStock = (product) => {
      const status = normalizeStatus(product?.stockStatus)
      return status === "out of stock" || status === "stock out" || status === "outofstock"
    }
    const isExplicitInStock = (product) => {
      const status = normalizeStatus(product?.stockStatus)
      return (
        status === "in stock" ||
        status === "instock" ||
        status === "available" ||
        status === "available product" ||
        status === "availableproduct" ||
        status === "pre-order" ||
        status === "preorder"
      )
    }
    const getStockBucket = (product) => {
      if (isExplicitOutOfStock(product)) return "out"
      if (isExplicitInStock(product)) return "in"
      return hasPositiveStock(product) ? "in" : "out"
    }

    // Filter by stock status (supports multiple filters)
    if (filters.stockStatus) {
      const stockFilters = Array.isArray(filters.stockStatus) ? filters.stockStatus : [filters.stockStatus]

      if (stockFilters.length > 0) {
        filteredProducts = filteredProducts.filter((product) => {
          // If any stock filter matches, include the product
          const matches = stockFilters.some((filter) => {
            switch (filter) {
              case "inStock":
                return getStockBucket(product) === "in"
              case "outOfStock":
                return getStockBucket(product) === "out"
              case "onSale":
                // Product is on sale if has discount > 0 OR offerPrice < price
                return (
                  (product.discount && product.discount > 0) ||
                  (product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price)
                )
              default:
                return false
            }
          })
          return matches
        })
      }
    }

    // Sort products - Always prioritize in-stock products first
    filteredProducts.sort((a, b) => {
      const aInStock = getStockBucket(a) === "in"
      const bInStock = getStockBucket(b) === "in"

      // Check if products are in stock
      // In-stock products come first (align with backend filter logic)
      if (aInStock && !bInStock) return -1
      if (!aInStock && bInStock) return 1

      // If both have same stock status, apply secondary sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "price-low":
            // Get prices, fallback to Infinity for products without price to push them to the end
            const priceA = a.offerPrice > 0 ? a.offerPrice : (a.price > 0 ? a.price : Infinity)
            const priceB = b.offerPrice > 0 ? b.offerPrice : (b.price > 0 ? b.price : Infinity)
            return priceA - priceB
          case "price-high":
            // Get prices, fallback to 0 for products without price to push them to the end
            const priceHighA = a.offerPrice > 0 ? a.offerPrice : (a.price > 0 ? a.price : 0)
            const priceHighB = b.offerPrice > 0 ? b.offerPrice : (b.price > 0 ? b.price : 0)
            return priceHighB - priceHighA
          case "name":
            return (a.name || "").localeCompare(b.name || "")
          case "newest":
          default:
            return new Date(b.createdAt) - new Date(a.createdAt)
        }
      }

      // Default sorting by newest if no sortBy specified
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return filteredProducts
  }

  // Get cache statistics
  getCacheStats() {
    const cached = localStorage.getItem(this.CACHE_KEY)
    if (!cached) {
      return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
    }

    try {
      const data = this.decompressData(cached)
      if (!data) {
        return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
      }

      const age = Date.now() - data.timestamp
      let cacheType = "full"
      if (data.isEssential) cacheType = "essential"
      if (data.isMinimal) cacheType = "minimal"
      if (data.isUltraMinimal) cacheType = "ultra-minimal"
      if (data.isChunked) cacheType = "chunked"

      const itemCount = data.isChunked ? data.totalProducts : data.products?.length || 0

      return {
        hasCache: true,
        itemCount: itemCount,
        age: age,
        isValid: age < this.CACHE_EXPIRY,
        cacheType: cacheType,
        chunks: data.isChunked ? data.chunkCount : null,
      }
    } catch (error) {
      return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
    }
  }
}

// Create singleton instance
const productCache = new ProductCacheService()

export default productCache
