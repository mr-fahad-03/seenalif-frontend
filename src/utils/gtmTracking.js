/**
 * Google Tag Manager / Google Analytics 4 Enhanced Ecommerce Tracking Utilities
 * This file contains all the tracking functions for ecommerce events
 */

// Initialize data layer if it doesn't exist
const initializeDataLayer = () => {
  window.dataLayer = window.dataLayer || []
}

// Generic event tracking function
export const trackEvent = (eventName, eventData = {}) => {
  try {
    initializeDataLayer()

    window.dataLayer.push({
      event: eventName,
      ...eventData,
    })

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("GTM Event tracked:", eventName, eventData)
    }
  } catch (error) {
    console.error("Error tracking event:", eventName, error)
  }
}

// Format product data for consistent tracking
const formatProductForTracking = (product, quantity = 1) => {
  if (!product || !product._id) {
    console.warn("formatProductForTracking: Invalid product data", product)
    return null
  }

  try {
    const finalPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price || 0

    return {
      item_id: product._id,
      item_name: product.name || "Unknown Product",
      item_category: product.parentCategory?.name || product.category?.name || "Uncategorized",
      item_category2: product.subCategory?.name || undefined,
      item_brand: product.brand?.name || "Unknown",
      price: finalPrice,
      quantity: quantity,
      discount: product.price && product.offerPrice ? product.price - product.offerPrice : 0,
    }
  } catch (error) {
    console.error("Error in formatProductForTracking:", error)
    return null
  }
}

// Format multiple products (cart items)
const formatCartItemsForTracking = (cartItems) => {
  return cartItems.map((item) => formatProductForTracking(item, item.quantity)).filter((item) => item !== null)
}

// Calculate total value from cart items
const calculateCartValue = (cartItems) => {
  return cartItems.reduce((total, item) => {
    const price = item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price
    return total + price * item.quantity
  }, 0)
}

/**
 * Track product page view
 * @param {Object} product - Product object
 */
export const trackProductView = (product) => {
  // Add validation to prevent errors
  if (!product || !product._id) {
    console.warn("trackProductView: Invalid product data", product)
    return
  }

  try {
    const productData = formatProductForTracking(product)

    if (productData) {
      trackEvent("view_item", {
        ecommerce: {
          currency: "AED",
          value: productData.price,
          items: [productData],
        },
      })
    }
  } catch (error) {
    console.error("Error in trackProductView:", error)
  }
}

/**
 * Track add to cart event
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity added
 */
export const trackAddToCart = (product, quantity = 1) => {
  const productData = formatProductForTracking(product, quantity)

  if (productData) {
    trackEvent("add_to_cart", {
      ecommerce: {
        currency: "AED",
        value: productData.price * quantity,
        items: [productData],
      },
    })
  }
}

/**
 * Track remove from cart event
 * @param {Object} product - Product object being removed
 */
export const trackRemoveFromCart = (product) => {
  const productData = formatProductForTracking(product, product.quantity || 1)

  if (productData) {
    trackEvent("remove_from_cart", {
      ecommerce: {
        currency: "AED",
        value: productData.price * productData.quantity,
        items: [productData],
      },
    })
  }
}

/**
 * Track view cart event
 * @param {Array} cartItems - Array of cart items
 */
export const trackViewCart = (cartItems) => {
  if (!cartItems || cartItems.length === 0) return

  const items = formatCartItemsForTracking(cartItems)
  const totalValue = calculateCartValue(cartItems)

  if (items.length > 0) {
    trackEvent("view_cart", {
      ecommerce: {
        currency: "AED",
        value: totalValue,
        items: items,
      },
    })
  }
}

/**
 * Track begin checkout event
 * @param {Array} cartItems - Array of cart items
 * @param {number} totalValue - Total checkout value
 */
export const trackBeginCheckout = (cartItems, totalValue = null) => {
  if (!cartItems || cartItems.length === 0) return

  const items = formatCartItemsForTracking(cartItems)
  const value = totalValue || calculateCartValue(cartItems)

  if (items.length > 0) {
    trackEvent("begin_checkout", {
      ecommerce: {
        currency: "AED",
        value: value,
        items: items,
      },
    })
  }
}

/**
 * Track add payment info event (when user selects payment method)
 * @param {Array} cartItems - Array of cart items
 * @param {string} paymentMethod - Selected payment method
 * @param {number} totalValue - Total value
 * @param {number} checkoutStep - Checkout step number
 */
export const trackAddPaymentInfo = (cartItems, paymentMethod, totalValue, checkoutStep = 1) => {
  if (!cartItems || cartItems.length === 0) return

  const items = formatCartItemsForTracking(cartItems)

  if (items.length > 0) {
    trackEvent("add_payment_info", {
      ecommerce: {
        currency: "AED",
        value: totalValue,
        payment_type: paymentMethod,
        checkout_step: checkoutStep,
        items: items,
      },
    })
  }
}

/**
 * Track purchase event
 * @param {string} orderId - Order ID
 * @param {number} orderTotal - Total order value
 * @param {Array} items - Array of purchased items
 * @param {string} paymentMethod - Payment method used
 * @param {number} taxAmount - Tax amount
 * @param {number} shippingCost - Shipping cost
 * @param {string} couponCode - Coupon code used
 * @param {string} affiliation - Store affiliation
 */
export const trackPurchase = (
  orderId,
  orderTotal,
  items,
  paymentMethod = "unknown",
  taxAmount = 0,
  shippingCost = 0,
  couponCode = null,
  affiliation = "Graba2z Online Store",
) => {
  const trackingItems = Array.isArray(items) ? formatCartItemsForTracking(items) : []

  if (trackingItems.length > 0) {
    trackEvent("purchase", {
      ecommerce: {
        transaction_id: orderId,
        affiliation: affiliation,
        currency: "AED",
        value: orderTotal,
        tax: taxAmount,
        shipping: shippingCost,
        coupon: couponCode,
        payment_type: paymentMethod,
        items: trackingItems,
      },
    })
  }
}

/**
 * Track search event
 * @param {string} searchTerm - Search term entered
 * @param {number} numberOfResults - Number of search results
 */
export const trackSearch = (searchTerm, numberOfResults = 0) => {
  trackEvent("search", {
    search_term: searchTerm,
    number_of_results: numberOfResults,
  })
}

/**
 * Track view item list event (category/collection pages)
 * @param {Array} products - Array of products in the list
 * @param {string} listName - Name of the list/category
 */
export const trackViewItemList = (products, listName) => {
  if (!products || products.length === 0) return

  const items = products
    .map((product, index) => ({
      ...formatProductForTracking(product),
      index: index,
      item_list_name: listName,
    }))
    .filter((item) => item !== null)

  if (items.length > 0) {
    trackEvent("view_item_list", {
      ecommerce: {
        currency: "AED",
        item_list_name: listName,
        items: items,
      },
    })
  }
}

/**
 * Track select item event (when user clicks on product in list)
 * @param {Object} product - Product that was selected
 * @param {string} listName - Name of the list where item was selected
 * @param {number} index - Position of item in the list
 */
export const trackSelectItem = (product, listName, index = 0) => {
  const productData = formatProductForTracking(product)

  if (productData) {
    const enhancedProductData = {
      ...productData,
      index: index,
      item_list_name: listName,
    }

    trackEvent("select_item", {
      ecommerce: {
        currency: "AED",
        item_list_name: listName,
        items: [enhancedProductData],
      },
    })
  }
}

/**
 * Track add to wishlist event
 * @param {Object} product - Product added to wishlist
 */
export const trackAddToWishlist = (product) => {
  const productData = formatProductForTracking(product)

  if (productData) {
    trackEvent("add_to_wishlist", {
      ecommerce: {
        currency: "AED",
        value: productData.price,
        items: [productData],
      },
    })
  }
}

/**
 * Track share event
 * @param {string} method - Share method (facebook, twitter, whatsapp, etc.)
 * @param {string} contentType - Type of content shared
 * @param {string} itemId - ID of shared item
 */
export const trackShare = (method, contentType = "product", itemId = null) => {
  trackEvent("share", {
    method: method,
    content_type: contentType,
    item_id: itemId,
  })
}

/**
 * Track login event
 * @param {string} method - Login method (email, google, facebook, etc.)
 */
export const trackLogin = (method = "email") => {
  trackEvent("login", {
    method: method,
  })
}

/**
 * Track sign up event
 * @param {string} method - Sign up method (email, google, facebook, etc.)
 */
export const trackSignUp = (method = "email") => {
  trackEvent("sign_up", {
    method: method,
  })
}

/**
 * Track newsletter subscription
 * @param {string} email - Email address (optional, for privacy consider not tracking)
 */
export const trackNewsletterSignup = (email = null) => {
  trackEvent("newsletter_signup", {
    method: "email",
    // Don't track email for privacy, just the event
  })
}

/**
 * Track contact form submission
 * @param {string} formType - Type of contact form
 */
export const trackContactForm = (formType = "general") => {
  trackEvent("contact_form_submit", {
    form_type: formType,
  })
}

/**
 * Track page view event (for custom page tracking)
 * @param {string} pageTitle - Page title
 * @param {string} pagePath - Page path
 */
export const trackPageView = (pageTitle, pagePath = window.location.pathname) => {
  trackEvent("page_view", {
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: pagePath,
  })
}

// Export all functions as default for easy importing
export default {
  trackEvent,
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  trackBeginCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackSearch,
  trackViewItemList,
  trackSelectItem,
  trackAddToWishlist,
  trackShare,
  trackLogin,
  trackSignUp,
  trackNewsletterSignup,
  trackContactForm,
  trackPageView,
}
