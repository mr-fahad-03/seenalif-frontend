import { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "./AuthContext"
import { useToast } from "./ToastContext"
import config from '../config/config'

const WishlistContext = createContext()

export const useWishlist = () => useContext(WishlistContext)

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(false)

  // Load wishlist from backend or localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch from backend
      setLoading(true)
      console.log('[Wishlist] Fetching wishlist from backend...')
      axios.get(`${config.API_URL}/api/wishlist`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
        .then(res => {
          console.log('[Wishlist] Backend response:', res.data)
          setWishlist(res.data)
        })
        .catch((err) => {
          console.error('[Wishlist] Error fetching from backend:', err)
          setWishlist([])
        })
        .finally(() => setLoading(false))
    } else {
      // Load from localStorage
      const stored = localStorage.getItem("wishlist")
      console.log('[Wishlist] Loaded from localStorage:', stored)
      setWishlist(stored ? JSON.parse(stored) : [])
    }
  }, [isAuthenticated, user])

  // Sync guest wishlist to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('[Wishlist] Syncing to localStorage:', wishlist)
      localStorage.setItem("wishlist", JSON.stringify(wishlist))
    }
  }, [wishlist, isAuthenticated])

  // On mount, always load from localStorage for guests
  useEffect(() => {
    if (!isAuthenticated) {
      const stored = localStorage.getItem("wishlist")
      console.log('[Wishlist] On mount loaded from localStorage:', stored)
      setWishlist(stored ? JSON.parse(stored) : [])
    }
  }, [])

  // Add product to wishlist
  const addToWishlist = async (product) => {
    console.log('[Wishlist] Adding to wishlist:', product)
    if (isAuthenticated && user) {
      const token = localStorage.getItem("token")
      const { data } = await axios.post(`${config.API_URL}/api/wishlist`, { productId: product._id }, { headers: { Authorization: `Bearer ${token}` } })
      console.log('[Wishlist] Backend add response:', data)
      setWishlist(data)
      showToast && showToast("Added to wishlist", "success")
    } else {
      setWishlist(prev => {
        if (prev.find(item => item._id === product._id)) return prev
        showToast && showToast("Added to wishlist", "success")
        return [...prev, product]
      })
    }
  }

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    console.log('[Wishlist] Removing from wishlist:', productId)
    if (isAuthenticated && user) {
      const token = localStorage.getItem("token")
      const { data } = await axios.delete(`${config.API_URL}/api/wishlist/${productId}`, { headers: { Authorization: `Bearer ${token}` } })
      console.log('[Wishlist] Backend remove response:', data)
      setWishlist(data)
      showToast && showToast("Removed from wishlist", "info")
    } else {
      setWishlist(prev => {
        showToast && showToast("Removed from wishlist", "info")
        return prev.filter(item => item._id !== productId)
      })
    }
  }

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return Array.isArray(wishlist) && wishlist.some(item => (item._id || item) === productId)
  }

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  )
}
