// "use client"

// import { createContext, useState, useEffect, useContext, useCallback } from "react"
// import { useToast } from "./ToastContext"

// const CartContext = createContext()

// export const useCart = () => useContext(CartContext)

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState(() => {
//     const storedCart = localStorage.getItem("cart")
//     return storedCart ? JSON.parse(storedCart) : []
//   })
//   const [cartCount, setCartCount] = useState(0)
//   const [cartTotal, setCartTotal] = useState(0)
//   const [bundleGroups, setBundleGroups] = useState(() => {
//     const storedBundles = localStorage.getItem("bundleGroups")
//     return storedBundles ? JSON.parse(storedBundles) : {}
//   })
//   const [deliveryOptions, setDeliveryOptions] = useState([])
//   const [selectedDelivery, setSelectedDelivery] = useState(null)
//   const [tax, setTax] = useState(null)
//   const [coupon, setCoupon] = useState(null)
//   const [couponDiscount, setCouponDiscount] = useState(0)
//   const { showToast } = useToast()

//   useEffect(() => {
//     // Update localStorage when cart changes
//     localStorage.setItem("cart", JSON.stringify(cartItems))
//     localStorage.setItem("bundleGroups", JSON.stringify(bundleGroups))

//     // Update cart count
//     const count = cartItems.reduce((total, item) => total + item.quantity, 0)
//     setCartCount(count)

//     // Update cart total - this is the single source of truth
//     const total = cartItems.reduce((total, item) => {
//       const itemPrice = typeof item.price === "number" ? item.price : Number.parseFloat(item.price) || 0
//       const itemQuantity = typeof item.quantity === "number" ? item.quantity : Number.parseInt(item.quantity) || 0
//       return total + itemPrice * itemQuantity
//     }, 0)
//     setCartTotal(total)
//   }, [cartItems, bundleGroups])

//   // Enhanced addToCart function with bundle price support
//   const addToCart = useCallback((product, quantity = 1, bundleId = null) => {
//     console.log(`🛒 Adding to cart:`, {
//       productName: product.name,
//       productId: product._id,
//       quantity,
//       bundleId,
//       bundlePrice: product.bundlePrice,
//       isBundleItem: product.isBundleItem,
//       currentCartSize: cartItems.length
//     })
    
//     if (!product || !product._id) {
//       console.error('❌ Invalid product data:', product)
//       showToast('Invalid product data', 'error')
//       return
//     }
    
//     setCartItems(prevItems => {
//       console.log('Previous cart items:', prevItems.length)
      
//       const existingItemIndex = prevItems.findIndex(item => {
//         // For bundle items, match both product ID and bundle ID
//         if (bundleId && item.bundleId) {
//           return item._id === product._id && item.bundleId === bundleId
//         }
//         // For regular items, just match product ID (no bundle)
//         return item._id === product._id && !item.bundleId
//       })

//       if (existingItemIndex > -1) {
//         // Update existing item
//         const updatedItems = [...prevItems]
//         updatedItems[existingItemIndex].quantity += quantity
//         return updatedItems
//       } else {
//         // Add new item
//         const cartItem = {
//           ...product,
//           quantity,
//           cartId: `${product._id}_${bundleId || 'regular'}_${Date.now()}`,
//           bundleId: bundleId || null,
//           isBundleItem: product.isBundleItem || false,
//           bundleDiscount: product.bundleDiscount || false,
//           originalPrice: product.originalPrice || product.price,
//           // Use bundle price if it's a bundle item, otherwise use regular price
//           price: product.bundlePrice || product.price
//         }
        
//         return [...prevItems, cartItem]
//       }
//     })

//     // Track bundle relationships
//     if (bundleId) {
//       setBundleGroups(prev => {
//         const updated = {
//           ...prev,
//           [bundleId]: [...(prev[bundleId] || []), product._id].filter((id, index, self) => self.indexOf(id) === index)
//         }
//         console.log('Updated bundle groups:', updated)
//         return updated
//       })
//     }

//     // Push add to cart event to data layer
//     try {
//       const finalPrice = product.isBundleItem && product.bundlePrice 
//         ? product.bundlePrice 
//         : (product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price)
      
//       window.dataLayer = window.dataLayer || [];
//       window.dataLayer.push({
//         'event': 'add_to_cart',
//         'ecommerce': {
//           'currency': 'AED',
//           'value': finalPrice * quantity,
//           'items': [{
//             'item_id': product._id,
//             'item_name': product.name,
//             'item_category': product.parentCategory?.name || product.category?.name || 'Uncategorized',
//             'item_brand': product.brand?.name || 'Unknown',
//             'price': finalPrice,
//             'quantity': quantity,
//             'bundle_discount': product.bundleDiscount || false
//           }]
//         }
//       });
//       console.log('✅ GTM tracking successful for:', product.name);
//     } catch (error) {
//       console.error('❌ GTM tracking error:', error);
//     }

//     // Show success toast
//     setTimeout(() => {
//       const message = product.bundleDiscount 
//         ? `Added ${product.name} to cart with bundle discount!`
//         : `Added ${product.name} to cart`
//       showToast(message, "success")
//     }, 100)

//   }, [cartItems, showToast])

//   // Function to get items grouped by bundle
//   const getGroupedCartItems = useCallback(() => {
//     const grouped = {}
//     const standaloneItems = []
    
//     cartItems.forEach(item => {
//       if (item.bundleId) {
//         if (!grouped[item.bundleId]) {
//           grouped[item.bundleId] = {
//             bundleId: item.bundleId,
//             items: [],
//             total: 0,
//             savings: 0
//           }
//         }
//         grouped[item.bundleId].items.push(item)
        
//         // Calculate bundle totals
//         const itemTotal = (item.offerPrice > 0 ? item.offerPrice : item.price) * item.quantity
//         const itemSavings = item.originalPrice ? (item.originalPrice - (item.offerPrice > 0 ? item.offerPrice : item.price)) * item.quantity : 0
        
//         grouped[item.bundleId].total += itemTotal
//         grouped[item.bundleId].savings += itemSavings
//       } else {
//         standaloneItems.push(item)
//       }
//     })
    
//     return { grouped, standaloneItems }
//   }, [cartItems])

//   const removeFromCart = useCallback((productId, bundleId = null) => {
//     const product = cartItems.find((item) => item._id === productId && item.bundleId === bundleId)
    
//     if (product) {
//       // Push remove from cart event to data layer
//       try {
//         window.dataLayer = window.dataLayer || [];
//         window.dataLayer.push({
//           'event': 'remove_from_cart',
//           'ecommerce': {
//             'currency': 'AED',
//             'value': product.price * product.quantity,
//             'items': [{
//               'item_id': product._id,
//               'item_name': product.name,
//               'item_category': product.parentCategory?.name || product.category?.name || 'Uncategorized',
//               'item_brand': product.brand?.name || 'Unknown',
//               'price': product.price,
//               'quantity': product.quantity
//             }]
//           }
//         });
//         console.log('Remove from cart tracked:', product.name);
//       } catch (error) {
//         console.error('GTM tracking error:', error);
//       }
//     }
    
//     setCartItems(prevItems => prevItems.filter((item) => !(item._id === productId && item.bundleId === bundleId)))
    
//     if (product) {
//       showToast(`Removed ${product.name} from cart`, "success")
//     }
//   }, [cartItems, showToast])

//   // Function to remove entire bundle
//   const removeBundleFromCart = useCallback((bundleId) => {
//     const bundleItems = cartItems.filter(item => item.bundleId === bundleId)
    
//     setCartItems(prevItems => prevItems.filter(item => item.bundleId !== bundleId))
    
//     setBundleGroups(prev => {
//       const newGroups = { ...prev }
//       delete newGroups[bundleId]
//       return newGroups
//     })
    
//     if (bundleItems.length > 0) {
//       showToast(`Removed bundle with ${bundleItems.length} items from cart`, "success")
//     }
//   }, [cartItems, showToast])

//   const updateQuantity = useCallback((productId, quantity, bundleId = null) => {
//     if (quantity <= 0) {
//       removeFromCart(productId, bundleId)
//       return
//     }

//     const product = cartItems.find((item) => item._id === productId && item.bundleId === bundleId)
//     setCartItems((prevItems) => 
//       prevItems.map((item) => 
//         (item._id === productId && item.bundleId === bundleId) 
//           ? { ...item, quantity } 
//           : item
//       )
//     )
    
//     if (product) {
//       showToast(`Updated ${product.name} quantity`, "success")
//     }
//   }, [cartItems, removeFromCart, showToast])

//   const clearCart = useCallback(() => {
//     setCartItems([])
//     setBundleGroups({})
//     localStorage.removeItem("cart")
//     localStorage.removeItem("bundleGroups")
//     showToast("Cart cleared", "success")
//   }, [showToast])

//   // Calculate final total with delivery charges
//   const calculateFinalTotal = useCallback((deliveryCharge = 0) => {
//     return cartTotal + deliveryCharge - couponDiscount
//   }, [cartTotal, couponDiscount])

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         cartCount,
//         cartTotal, // This is the authoritative cart total
//         bundleGroups,
//         addToCart,
//         removeFromCart,
//         removeBundleFromCart,
//         updateQuantity,
//         clearCart,
//         getGroupedCartItems,
//         deliveryOptions,
//         setDeliveryOptions,
//         selectedDelivery,
//         setSelectedDelivery,
//         tax,
//         setTax,
//         coupon,
//         setCoupon,
//         couponDiscount,
//         setCouponDiscount,
//         calculateFinalTotal,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   )
// }














































































































































































































"use client"

import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { useToast } from "./ToastContext"

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const mergeSimilarCartItems = (items = []) => {
    const merged = new Map()

    items.forEach((rawItem) => {
      const item = { ...rawItem }
      const bundleKey = item.bundleId || "regular"
      const colorKey = item.selectedColorIndex ?? null
      const dosKey = item.selectedDosIndex ?? null
      const key = `${item._id}__${bundleKey}__${colorKey}__${dosKey}`
      const qty = Number(item.quantity) || 0

      if (!merged.has(key)) {
        merged.set(key, {
          ...item,
          quantity: qty,
          selectedColorIndex: colorKey,
          selectedDosIndex: dosKey,
        })
      } else {
        const existing = merged.get(key)
        existing.quantity = (Number(existing.quantity) || 0) + qty
        merged.set(key, existing)
      }
    })

    return Array.from(merged.values())
  }

  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cart")
    if (!storedCart) return []
    try {
      const parsed = JSON.parse(storedCart)
      return mergeSimilarCartItems(Array.isArray(parsed) ? parsed : [])
    } catch {
      return []
    }
  })
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [bundleGroups, setBundleGroups] = useState(() => {
    const storedBundles = localStorage.getItem("bundleGroups")
    return storedBundles ? JSON.parse(storedBundles) : {}
  })
  const [deliveryOptions, setDeliveryOptions] = useState([])
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [tax, setTax] = useState(null)
  const [coupon, setCoupon] = useState(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const { showToast } = useToast()

  useEffect(() => {
    // Update localStorage when cart changes
    localStorage.setItem("cart", JSON.stringify(cartItems))
    localStorage.setItem("bundleGroups", JSON.stringify(bundleGroups))

    // Update cart count
    const count = cartItems.reduce((total, item) => total + item.quantity, 0)
    setCartCount(count)

    // Update cart total - this is the single source of truth
    const computeUnit = (item) => {
      const original = Number(item.originalPrice)
      const offer = Number(item.offerPrice)
      const price = Number(item.price)
      const bundlePrice = Number(item.bundlePrice)

      if (item.isBundleItem && !Number.isNaN(bundlePrice) && bundlePrice > 0) return bundlePrice
      if (item.bundleDiscount && !Number.isNaN(original) && original > 0) return original * 0.75 // 25% off
      if (!Number.isNaN(offer) && offer > 0) return offer
      return !Number.isNaN(price) ? price : 0
    }

    const total = cartItems.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0
      return sum + computeUnit(item) * qty
    }, 0)

    setCartTotal(total)
  }, [cartItems, bundleGroups])

  // Effect to handle coupon validation when cart changes
  useEffect(() => {
    // If cart is empty, clear any applied coupon
    if (cartItems.length === 0 && coupon) {
      setCoupon(null)
      setCouponDiscount(0)
    }
  }, [cartItems.length, coupon])

  // Enhanced addToCart function with bundle price support
  const addToCart = useCallback(
    (product, quantity = 1, bundleId = null) => {
      console.log(`🛒 Adding to cart:`, {
        productName: product.name,
        productId: product._id,
        quantity,
        bundleId,
        bundlePrice: product.bundlePrice,
        isBundleItem: product.isBundleItem,
        currentCartSize: cartItems.length,
      })

      if (!product || !product._id) {
        console.error("❌ Invalid product data:", product)
        showToast("Invalid product data", "error")
        return
      }

      setCartItems((prevItems) => {
        console.log("Previous cart items:", prevItems.length)

        const selectedColorKey = product.selectedColorIndex ?? null
        const selectedDosKey = product.selectedDosIndex ?? null

        const existingItemIndex = prevItems.findIndex((item) => {
          const itemColorKey = item.selectedColorIndex ?? null
          const itemDosKey = item.selectedDosIndex ?? null

          // For bundle items, match both product ID and bundle ID
          if (bundleId && item.bundleId) {
            return (
              item._id === product._id &&
              item.bundleId === bundleId &&
              itemColorKey === selectedColorKey &&
              itemDosKey === selectedDosKey
            )
          }
          // For regular items, match product ID, no bundle, and same color/DOS (if any)
          return (
            item._id === product._id &&
            !item.bundleId &&
            itemColorKey === selectedColorKey &&
            itemDosKey === selectedDosKey
          )
        })

        if (existingItemIndex > -1) {
          // Update existing item
          const updatedItems = [...prevItems]
          updatedItems[existingItemIndex].quantity += quantity
          return updatedItems
        } else {
          // Store the final unit price on the cart line:
          // bundlePrice if bundle item; else use the price passed from ProductDetails (already calculated)
          const finalUnitPrice =
            product.isBundleItem && product.bundlePrice
              ? product.bundlePrice
              : Number(product.price) || 0

          const cartItem = {
            ...product,
            quantity,
            cartId: `${product._id}_${bundleId || "regular"}_${product.selectedColorIndex ?? "nocolor"}_${product.selectedDosIndex ?? "nodos"}_${Date.now()}`,
            bundleId: bundleId || null,
            isBundleItem: product.isBundleItem || false,
            bundleDiscount: product.bundleDiscount || false,
            originalPrice: product.originalPrice || product.price,
            price: finalUnitPrice, // Ensure price reflects the final unit price used in totals
            selectedColorIndex: product.selectedColorIndex ?? null,
            selectedColorData: product.selectedColorData || null,
            selectedDosIndex: product.selectedDosIndex ?? null,
            selectedDosData: product.selectedDosData || null,
          }

          return [...prevItems, cartItem]
        }
      })

      // Track bundle relationships
      if (bundleId) {
        setBundleGroups((prev) => {
          const updated = {
            ...prev,
            [bundleId]: [...(prev[bundleId] || []), product._id].filter(
              (id, index, self) => self.indexOf(id) === index,
            ),
          }
          console.log("Updated bundle groups:", updated)
          return updated
        })
      }

      // Push add to cart event to data layer
      try {
        const finalPrice =
          product.isBundleItem && product.bundlePrice
            ? product.bundlePrice
            : product.offerPrice && product.offerPrice > 0
              ? product.offerPrice
              : product.price

        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
          event: "add_to_cart",
          ecommerce: {
            currency: "AED",
            value: finalPrice * quantity,
            items: [
              {
                item_id: product._id,
                item_name: product.name,
                item_category: product.parentCategory?.name || product.category?.name || "Uncategorized",
                item_brand: product.brand?.name || "Unknown",
                price: finalPrice,
                quantity: quantity,
                bundle_discount: product.bundleDiscount || false,
              },
            ],
          },
        })
        console.log("✅ GTM tracking successful for:", product.name)
      } catch (error) {
        console.error("❌ GTM tracking error:", error)
      }

      // Show success toast
      setTimeout(() => {
        const message = product.bundleDiscount
          ? `Added ${product.name} to cart with bundle discount!`
          : `Added ${product.name} to cart`
        showToast(message, "success")
      }, 100)
    },
    [cartItems, showToast],
  )

  // Function to get items grouped by bundle
  const getGroupedCartItems = useCallback(() => {
    const grouped = {}
    const standaloneItems = []

    cartItems.forEach((item) => {
      if (item.bundleId) {
        if (!grouped[item.bundleId]) {
          grouped[item.bundleId] = {
            bundleId: item.bundleId,
            items: [],
            total: 0,
            savings: 0,
          }
        }
        grouped[item.bundleId].items.push(item)

        // Calculate bundle totals
        const itemTotal = (item.offerPrice > 0 ? item.offerPrice : item.price) * item.quantity
        const itemSavings = item.originalPrice
          ? (item.originalPrice - (item.offerPrice > 0 ? item.offerPrice : item.price)) * item.quantity
          : 0

        grouped[item.bundleId].total += itemTotal
        grouped[item.bundleId].savings += itemSavings
      } else {
        standaloneItems.push(item)
      }
    })

    return { grouped, standaloneItems }
  }, [cartItems])

  // Helper function to clear coupon
  const clearCoupon = useCallback(() => {
    setCoupon(null)
    setCouponDiscount(0)
  }, [])

  const removeFromCart = useCallback(
    (productId, bundleId = null) => {
      const product = cartItems.find((item) => item._id === productId && item.bundleId === bundleId)

      if (product) {
        // Push remove from cart event to data layer
        try {
          window.dataLayer = window.dataLayer || []
          window.dataLayer.push({
            event: "remove_from_cart",
            ecommerce: {
              currency: "AED",
              value: product.price * product.quantity,
              items: [
                {
                  item_id: product._id,
                  item_name: product.name,
                  item_category: product.parentCategory?.name || product.category?.name || "Uncategorized",
                  item_brand: product.brand?.name || "Unknown",
                  price: product.price,
                  quantity: product.quantity,
                },
              ],
            },
          })
          console.log("Remove from cart tracked:", product.name)
        } catch (error) {
          console.error("GTM tracking error:", error)
        }
      }

      setCartItems((prevItems) => prevItems.filter((item) => !(item._id === productId && item.bundleId === bundleId)))

      if (product) {
        showToast(`Removed ${product.name} from cart`, "success")
      }
    },
    [cartItems, showToast],
  )

  // Function to remove entire bundle
  const removeBundleFromCart = useCallback(
    (bundleId) => {
      const bundleItems = cartItems.filter((item) => item.bundleId === bundleId)

      setCartItems((prevItems) => prevItems.filter((item) => item.bundleId !== bundleId))

      setBundleGroups((prev) => {
        const newGroups = { ...prev }
        delete newGroups[bundleId]
        return newGroups
      })

      if (bundleItems.length > 0) {
        showToast(`Removed bundle with ${bundleItems.length} items from cart`, "success")
      }
    },
    [cartItems, showToast],
  )

  const updateQuantity = useCallback(
    (productId, quantity, bundleId = null) => {
      if (quantity <= 0) {
        removeFromCart(productId, bundleId)
        return
      }

      const product = cartItems.find((item) => item._id === productId && item.bundleId === bundleId)
      setCartItems((prevItems) =>
        prevItems.map((item) => (item._id === productId && item.bundleId === bundleId ? { ...item, quantity } : item)),
      )

      if (product) {
        showToast(`Updated ${product.name} quantity`, "success")
      }
    },
    [cartItems, removeFromCart, showToast],
  )

  const clearCart = useCallback(() => {
    setCartItems([])
    setBundleGroups({})
    localStorage.removeItem("cart")
    localStorage.removeItem("bundleGroups")
    
    showToast("Cart cleared", "success")
  }, [showToast])

  // Calculate final total with delivery charges
  const calculateFinalTotal = useCallback(
    (deliveryCharge = 0) => {
      return cartTotal + deliveryCharge - couponDiscount
    },
    [cartTotal, couponDiscount],
  )

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal, // This is the authoritative cart total
        bundleGroups,
        addToCart,
        removeFromCart,
        removeBundleFromCart,
        updateQuantity,
        clearCart,
        getGroupedCartItems,
        deliveryOptions,
        setDeliveryOptions,
        selectedDelivery,
        setSelectedDelivery,
        tax,
        setTax,
        coupon,
        setCoupon,
        couponDiscount,
        setCouponDiscount,
        clearCoupon,
        calculateFinalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
