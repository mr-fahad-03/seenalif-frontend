// IndexedDB Cache Service for large datasets
class IndexedDBCacheService {
  constructor() {
    this.DB_NAME = 'Graba2zCache'
    this.DB_VERSION = 1
    this.STORE_NAME = 'products'
    this.CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutes
  }

  // Open IndexedDB connection
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' })
        }
      }
    })
  }

  // Set products in IndexedDB
  async setCachedProducts(products) {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(this.STORE_NAME)
      
      const cacheData = {
        id: 'products',
        products: products,
        timestamp: Date.now()
      }
      
      await new Promise((resolve, reject) => {
        const request = store.put(cacheData)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      

    } catch (error) {
      throw error
    }
  }

  // Get products from IndexedDB
  async getCachedProducts() {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.STORE_NAME], 'readonly')
      const store = transaction.objectStore(this.STORE_NAME)
      
      const data = await new Promise((resolve, reject) => {
        const request = store.get('products')
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      
      if (!data) return null
      
      const now = Date.now()
      if (data.timestamp && (now - data.timestamp) < this.CACHE_EXPIRY) {
        return data.products || []
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  // Clear IndexedDB cache
  async clearCache() {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(this.STORE_NAME)
      
      await new Promise((resolve, reject) => {
        const request = store.delete('products')
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      

    } catch (error) {

    }
  }

  // Check if IndexedDB is available
  isAvailable() {
    return 'indexedDB' in window
  }
}

// Create singleton instance
const indexedDBCache = new IndexedDBCacheService()

export default indexedDBCache 