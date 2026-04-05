// Utility functions for SEO-friendly URL handling

/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - The text to convert
 * @returns {string} - The slug
 */
export const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

/**
 * Get the current language prefix from the URL
 * @returns {string} - Language prefix (e.g., 'ae-en', 'ae-ar') or empty string
 */
export const getCurrentLanguagePrefix = () => {
  if (typeof window === 'undefined') return ''
  
  const pathParts = window.location.pathname.split('/').filter(part => part)
  
  // Check if first part is a language code (e.g., 'ae-en', 'ae-ar', 'en', 'ar')
  if (pathParts.length > 0 && /^[a-z]{2}(-[a-z]{2})?$/i.test(pathParts[0])) {
    return pathParts[0]
  }
  
  return ''
}

/**
 * Generate SEO-friendly URL for shop page
 * @param {Object} params - URL parameters
 * @param {string} params.parentCategory - Parent category slug or ID
 * @param {string} params.subcategory - Subcategory level 1 slug or ID
 * @param {string} params.subcategory2 - Subcategory level 2 slug or ID
 * @param {string} params.subcategory3 - Subcategory level 3 slug or ID
 * @param {string} params.subcategory4 - Subcategory level 4 slug or ID
 * @param {string} params.brand - Brand name
 * @param {string} params.search - Search query
 * @returns {string} - SEO-friendly URL
 */
export const generateShopURL = (params = {}) => {
  const { parentCategory, subcategory, subcategory2, subcategory3, subcategory4, brand, search } = params

  // Get the current language prefix
  const langPrefix = getCurrentLanguagePrefix()
  const baseUrl = langPrefix ? `/${langPrefix}` : ''
  
  let url = `${baseUrl}/product-category`

  // Build URL path based on category structure
  if (parentCategory && parentCategory !== "all") {
    const parentSlug = createSlug(parentCategory)
    url += `/${parentSlug}`

    if (subcategory) {
      const subSlug = createSlug(subcategory)
      url += `/${subSlug}`

      if (subcategory2) {
        const sub2Slug = createSlug(subcategory2)
        url += `/${sub2Slug}`

        if (subcategory3) {
          const sub3Slug = createSlug(subcategory3)
          url += `/${sub3Slug}`

          if (subcategory4) {
            const sub4Slug = createSlug(subcategory4)
            url += `/${sub4Slug}`
          }
        }
      }
    }
  }

  // Add query parameters for other filters
  const queryParams = new URLSearchParams()

  if (brand) {
    queryParams.set("brand", brand)
  }

  if (search) {
    queryParams.set("search", search)
  }

  const queryString = queryParams.toString()
  const finalUrl = queryString ? `${url}?${queryString}` : url
  console.log("Generated URL:", finalUrl, "from params:", params)
  return finalUrl
}

/**
 * Parse SEO-friendly URL to extract parameters
 * @param {string} pathname - Current pathname
 * @param {string} search - Current search string
 * @returns {Object} - Parsed parameters
 */
export const parseShopURL = (pathname, search) => {
  const params = {
    parentCategory: "all",
    subcategory: null,
    subcategory2: null,
    subcategory3: null,
    subcategory4: null,
    brand: null,
    search: null,
  }

  // Parse pathname for category structure
  let pathParts = pathname.split("/").filter((part) => part)

  // Skip language prefix if present (e.g., 'ae-en', 'ar', etc.)
  // Language codes typically follow pattern: 2-letter code or country-language (ae-en, ae-ar)
  if (pathParts.length > 0 && /^[a-z]{2}(-[a-z]{2})?$/i.test(pathParts[0])) {
    pathParts = pathParts.slice(1) // Remove the first element (language code)
  }

  if (pathParts.length > 0) {
    // Handle product-category path
    if (pathParts[0] === "product-category") {
      // Extract parent category from URL
      if (pathParts.length >= 2) {
        params.parentCategory = pathParts[1]
      }

      // Extract subcategory level 1 from URL
      if (pathParts.length >= 3) {
        params.subcategory = pathParts[2]
      }

      // Extract subcategory level 2 from URL
      if (pathParts.length >= 4) {
        params.subcategory2 = pathParts[3]
      }

      // Extract subcategory level 3 from URL
      if (pathParts.length >= 5) {
        params.subcategory3 = pathParts[4]
      }

      // Extract subcategory level 4 from URL
      if (pathParts.length >= 6) {
        params.subcategory4 = pathParts[5]
      }
    }

    // Handle shop path (alternative route structure)
    if (pathParts[0] === "shop") {
      // Extract parent category from URL
      if (pathParts.length >= 2) {
        params.parentCategory = pathParts[1]
      }

      // Extract subcategory level 1 from URL
      if (pathParts.length >= 3) {
        params.subcategory = pathParts[2]
      }

      // Extract subcategory level 2 from URL
      if (pathParts.length >= 4) {
        params.subcategory2 = pathParts[3]
      }

      // Extract subcategory level 3 from URL
      if (pathParts.length >= 5) {
        params.subcategory3 = pathParts[4]
      }

      // Extract subcategory level 4 from URL
      if (pathParts.length >= 6) {
        params.subcategory4 = pathParts[5]
      }
    }

    // Handle product-brand path
    if (pathParts[0] === "product-brand" && pathParts.length >= 2) {
      params.brand = pathParts[1]
    }
  }

  // Parse query parameters (for backward compatibility)
  const searchParams = new URLSearchParams(search)

  if (searchParams.has("brand") && !params.brand) {
    params.brand = searchParams.get("brand")
  }

  if (searchParams.has("search")) {
    params.search = searchParams.get("search")
  }

  return params
}

/**
 * Find category by slug or ID
 * @param {Array} categories - Array of category objects
 * @param {string} identifier - Slug or ID to search for
 * @returns {Object|null} - Found category or null
 */
export const findCategoryByIdentifier = (categories, identifier) => {
  if (!identifier) return null

  return categories.find(
    (cat) => cat._id === identifier || cat.slug === identifier || createSlug(cat.name) === identifier,
  )
}

/**
 * Find subcategory by slug or ID
 * @param {Array} subcategories - Array of subcategory objects
 * @param {string} identifier - Slug or ID to search for
 * @returns {Object|null} - Found subcategory or null
 */
export const findSubcategoryByIdentifier = (subcategories, identifier) => {
  if (!identifier) return null

  return subcategories.find(
    (sub) => sub._id === identifier || sub.slug === identifier || createSlug(sub.name) === identifier,
  )
}
