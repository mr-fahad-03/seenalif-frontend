import { useState, useEffect } from 'react'
import { RefreshCw, Trash2, Database } from 'lucide-react'
import productCache from '../services/productCache'

const CacheStatus = () => {
  const [cacheStats, setCacheStats] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    updateCacheStats()
    // Update stats every 5 seconds
    const interval = setInterval(updateCacheStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const updateCacheStats = () => {
    const stats = productCache.getCacheStats()
    setCacheStats(stats)
  }

  const clearCache = () => {
    productCache.clearCache()
    updateCacheStats()
  }

  const refreshCache = async () => {
    try {
      await productCache.fetchAndCacheProducts()
      updateCacheStats()
    } catch (error) {
      // Handle error silently
    }
  }

  const forceRefreshCache = async () => {
    try {
      await productCache.forceRefreshCache()
      updateCacheStats()
      // Reload the page to see the changes
      window.location.reload()
    } catch (error) {
      // Handle error silently
    }
  }

  if (!cacheStats) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-all duration-200"
        title="Cache Status"
      >
        <Database size={20} />
      </button>

      {/* Cache status panel */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[250px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Cache Status</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${cacheStats.hasCache ? 'text-green-600' : 'text-red-600'}`}>
                {cacheStats.hasCache ? 'Active' : 'No Cache'}
              </span>
            </div>

            {cacheStats.hasCache && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Products:</span>
                  <span className="font-medium">{cacheStats.itemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className={`font-medium ${cacheStats.isValid ? 'text-green-600' : 'text-orange-600'}`}>
                    {Math.round(cacheStats.age / 1000 / 60)}m
                  </span>
                </div>
                {cacheStats.cacheType !== 'full' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className={`font-medium ${
                      cacheStats.cacheType === 'essential' ? 'text-orange-600' : 
                      cacheStats.cacheType === 'minimal' ? 'text-yellow-600' : 
                      cacheStats.cacheType === 'ultra-minimal' ? 'text-red-600' : 
                      cacheStats.cacheType === 'chunked' ? 'text-purple-600' : 
                      'text-gray-600'
                    }`}>
                      {cacheStats.cacheType.charAt(0).toUpperCase() + cacheStats.cacheType.slice(1)}
                    </span>
                  </div>
                )}
                {cacheStats.chunks && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chunks:</span>
                    <span className="font-medium text-purple-600">{cacheStats.chunks}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={refreshCache}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
              title="Refresh Cache"
            >
              <RefreshCw size={12} className="inline mr-1" />
              Refresh
            </button>
            <button
              onClick={forceRefreshCache}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded transition-colors"
              title="Force Refresh"
            >
              <RefreshCw size={12} className="inline mr-1" />
              Force
            </button>
            <button
              onClick={clearCache}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded transition-colors"
              title="Clear Cache"
            >
              <Trash2 size={12} className="inline mr-1" />
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CacheStatus 