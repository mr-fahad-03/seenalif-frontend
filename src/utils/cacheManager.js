import axios from "axios"
import config from "../config/config"

const CACHE_VERSION_KEY = "graba2z_cache_version"

// Keys that should be preserved during cache reset (exact match)
const PRESERVED_KEYS = [
  // Authentication
  "token",
  "adminToken",
  "authToken",
  "user",
  "userInfo",
  "guestInfo",
  
  // Cart
  "cart",
  "cartItems",
  "bundleGroups",
  
  // Wishlist
  "wishlist",
  "wishlistItems",
  
  // Coupon
  "coupon",
  "couponDiscount",
  
  // Delivery options
  "selectedDelivery",
  
  // Cache version itself
  CACHE_VERSION_KEY,
]

/**
 * Check if a key should be preserved during cache reset
 */
function shouldPreserveKey(key) {
  // Exact match check
  if (PRESERVED_KEYS.includes(key)) {
    return true
  }
  // Partial match for variations (case insensitive)
  const keyLower = key.toLowerCase()
  return PRESERVED_KEYS.some(preserved => 
    keyLower === preserved.toLowerCase() ||
    keyLower.includes('token') ||
    keyLower.includes('auth') ||
    keyLower.includes('cart') ||
    keyLower.includes('wishlist') ||
    keyLower.includes('user') ||
    keyLower.includes('guest')
  )
}

/**
 * Check if cache needs to be cleared based on server version
 * Call this on app initialization
 */
export async function checkCacheVersion() {
  try {
    const { data } = await axios.get(`${config.API_URL}/api/cache/version`)
    const serverVersion = data.version

    const localVersion = localStorage.getItem(CACHE_VERSION_KEY)

    if (!localVersion) {
      // First time visit, just store the version
      localStorage.setItem(CACHE_VERSION_KEY, serverVersion.toString())
      return false
    }

    if (parseInt(localVersion) < serverVersion) {
      // Server version is newer, need to clear cache
      console.log(`🔄 Cache version mismatch: local=${localVersion}, server=${serverVersion}. Clearing cache...`)
      
      // Step 1: Backup all preserved data FIRST
      const preservedData = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && shouldPreserveKey(key)) {
          preservedData[key] = localStorage.getItem(key)
          console.log(`📦 Preserving: ${key}`)
        }
      }

      // Step 2: Identify keys to remove
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && !shouldPreserveKey(key)) {
          keysToRemove.push(key)
        }
      }
      
      // Step 3: Remove non-preserved keys
      keysToRemove.forEach((key) => {
        console.log(`🗑️ Removing: ${key}`)
        localStorage.removeItem(key)
      })

      // Step 4: Ensure preserved data is still there (restore if needed)
      Object.keys(preservedData).forEach(key => {
        if (!localStorage.getItem(key)) {
          console.log(`🔄 Restoring: ${key}`)
          localStorage.setItem(key, preservedData[key])
        }
      })

      // Step 5: Store the new version
      localStorage.setItem(CACHE_VERSION_KEY, serverVersion.toString())

      // Step 6: Verify token is preserved before reload
      const tokenCheck = localStorage.getItem("token")
      const adminTokenCheck = localStorage.getItem("adminToken")
      console.log(`✅ Token preserved: ${tokenCheck ? 'Yes' : 'No'}`)
      console.log(`✅ Admin Token preserved: ${adminTokenCheck ? 'Yes' : 'No'}`)

      // Step 7: Reload the page to get fresh content
      window.location.reload()
      return true
    }

    return false
  } catch (error) {
    console.error("Error checking cache version:", error)
    return false
  }
}

/**
 * Force clear all cache and reload (preserves auth, cart, wishlist)
 */
export function forceClearCache() {
  // Backup preserved data
  const preservedData = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && shouldPreserveKey(key)) {
      preservedData[key] = localStorage.getItem(key)
    }
  }

  // Clear sessionStorage only (not localStorage for critical data)
  sessionStorage.clear()

  // Remove only non-preserved keys from localStorage
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && !shouldPreserveKey(key)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key))

  // Restore preserved data (in case any got removed)
  Object.keys(preservedData).forEach(key => {
    localStorage.setItem(key, preservedData[key])
  })
  
  // Clear browser cache for this origin (if supported)
  if ("caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name)
      })
    })
  }

  window.location.reload()
}

export default { checkCacheVersion, forceClearCache }
