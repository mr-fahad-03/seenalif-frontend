import config from "../config/config"

// Image utility functions
export const checkImageUrl = async (url) => {
  if (!url) return false
  
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Check if a URL is a Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  if (!url) return false
  return url.includes("cloudinary.com") || url.includes("res.cloudinary")
}

/**
 * Get the full image URL with proper base URL
 * - If it's a Cloudinary URL, return as-is
 * - If it's a local path starting with /uploads, prepend API_URL
 * - If it's already a full URL with localhost, replace with current API_URL
 * - If it's already a full URL (http/https), check if it needs API_URL replacement
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl || !String(imageUrl).trim()) return ""
  const normalizedUrl = String(imageUrl).trim()
  
  // Handle Cloudinary URLs - return as-is
  if (isCloudinaryUrl(normalizedUrl)) {
    return normalizedUrl
  }
  
  // Handle full URLs (http:// or https://)
  if (normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://")) {
    // Check if it's a localhost URL that needs to be replaced
    if (normalizedUrl.includes("localhost") || normalizedUrl.includes("127.0.0.1")) {
      // Extract just the /uploads/... part
      const uploadsMatch = normalizedUrl.match(/(\/uploads\/.+)/)
      if (uploadsMatch) {
        return `${config.API_URL}${uploadsMatch[1]}`
      }
    }
    
    // Check if it contains /uploads/ and the hostname doesn't match current API
    if (normalizedUrl.includes("/uploads/")) {
      try {
        const urlObj = new URL(normalizedUrl)
        const currentApiHost = new URL(config.API_URL).hostname
        
        // If the hostname doesn't match, replace with current API_URL
        if (urlObj.hostname !== currentApiHost) {
          const uploadsPath = urlObj.pathname
          return `${config.API_URL}${uploadsPath}`
        }
      } catch (e) {
        // If URL parsing fails, continue to return as-is
      }
    }
    
    // Return other full URLs as-is
    return normalizedUrl
  }
  
  // Local file path - prepend API URL
  if (normalizedUrl.startsWith("/uploads")) {
    return `${config.API_URL}${normalizedUrl}`
  }
  
  // Handle case where it might be just "uploads/..." without leading slash
  if (normalizedUrl.startsWith("uploads/")) {
    return `${config.API_URL}/${normalizedUrl}`
  }
  
  // Default: return as-is (might be a placeholder or relative path)
  return normalizedUrl
}

/**
 * Return an optimized image URL for small render slots.
 * Currently supports Cloudinary transformations and falls back to full URL for other hosts.
 */
export const getOptimizedImageUrl = (imageUrl, { width, height, quality = "auto" } = {}) => {
  const fullUrl = getFullImageUrl(imageUrl)
  if (!fullUrl) return ""

  if (isCloudinaryUrl(fullUrl)) {
    const transforms = ["f_auto", `q_${quality}`]
    if (width) transforms.push(`w_${width}`)
    if (height) transforms.push(`h_${height}`)
    transforms.push("c_limit")

    // Inject transformations after /upload/ if not already injected by this helper.
    if (fullUrl.includes("/upload/") && !fullUrl.includes("/upload/f_auto,")) {
      return fullUrl.replace("/upload/", `/upload/${transforms.join(",")}/`)
    }
  }

  // Optimize local API uploads via server-side sharp endpoint query params.
  if (fullUrl.includes("/uploads/")) {
    try {
      const baseOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost"
      const url = new URL(fullUrl, baseOrigin)
      if (width) url.searchParams.set("w", String(width))
      if (height) url.searchParams.set("h", String(height))
      // Force reasonable compression for local uploads even when callers pass "auto".
      url.searchParams.set("q", quality === "auto" ? "70" : String(quality))
      url.searchParams.set("fmt", "webp")
      return url.toString()
    } catch {
      return fullUrl
    }
  }

  return fullUrl
}

/**
 * Get multiple image URLs
 */
export const getFullImageUrls = (imageUrls) => {
  if (!Array.isArray(imageUrls)) return []
  return imageUrls.map(url => getFullImageUrl(url))
}

/**
 * Extract filename from Cloudinary or local URL for deletion
 */
export const getImageIdentifier = (imageUrl) => {
  if (!imageUrl) return ""
  
  // For Cloudinary URLs
  if (isCloudinaryUrl(imageUrl)) {
    // Extract public ID from Cloudinary URL
    const parts = imageUrl.split("/")
    const filename = parts[parts.length - 1]
    return filename.split(".")[0] // Remove extension
  }
  
  // For local URLs, return the path
  if (imageUrl.startsWith("http")) {
    // Extract path from full URL
    try {
      const urlObj = new URL(imageUrl)
      return urlObj.pathname // Returns /uploads/...
    } catch {
      return imageUrl
    }
  }
  
  // Already a path
  return imageUrl
}

// Original function for backward compatibility
export const getImageUrl = (product) => {
  // Try different image fields in order of preference
  if (product.image) return getFullImageUrl(product.image)
  if (product.galleryImages && product.galleryImages.length > 0) return getFullImageUrl(product.galleryImages[0])
  if (product.images && product.images.length > 0) return getFullImageUrl(product.images[0])
  
  // Fallback to placeholder
  return "/placeholder.svg?height=150&width=150"
}
