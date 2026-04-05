

"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import ImageUpload from "../ImageUpload"
import VideoUpload from "../VideoUpload"
import TipTapEditor from "../TipTapEditor"
import { Plus, X } from "lucide-react"
import ProductVariationModal from "./ProductVariationModal"
import ColorVariationForm from "./ColorVariationForm"
import DosVariationForm from "./DosVariationForm"
import { getFullImageUrl } from "../../utils/imageUtils"

import config from "../../config/config"

const SEO_TITLE_MAX_WORDS = 80

const countWords = (text = "") => {
  const normalized = String(text).trim()
  if (!normalized) return 0
  return normalized.split(/\s+/).length
}

const limitWords = (text = "", maxWords = SEO_TITLE_MAX_WORDS) => {
  const normalized = String(text).trim()
  if (!normalized) return ""
  const words = normalized.split(/\s+/)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(" ")
}

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [subCategories2, setSubCategories2] = useState([])
  const [subCategories3, setSubCategories3] = useState([])
  const [subCategories4, setSubCategories4] = useState([])
  const [parentCategories, setParentCategories] = useState([])
  const [taxes, setTaxes] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    slug: "",
    barcode: "",
    gtin: "",
    brand: "",
    parentCategory: "",
    category: "",
    subCategory: "",
    subCategory2: "",
    subCategory3: "",
    subCategory4: "",
    description: "",
    shortDescription: "",
    buyingPrice: "",
    price: "", // This will be the final calculated price (base + tax)
    offerPrice: "",
    discount: "",
    image: "",
    galleryImages: [],
    video: "",
    videoGallery: [],
    countInStock: "",
    lowStockWarning: "5",
    maxPurchaseQty: "10",
    weight: "",
    unit: "piece",
    tax: "0",
    tags: "",
    specifications: [],
    isActive: true,
    canPurchase: true,
    showStockOut: true,
    refundable: true,
    featured: false,
    hideFromShop: false,
    stockStatus: "In Stock",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    seoCanonicalUrl: "",
    seoRobots: "index, follow",
    customSchema: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  })

  // New states for price calculation
  const [basePrice, setBasePrice] = useState("") // This will be the input for the base price
  const [taxAmount, setTaxAmount] = useState(0)
  const [taxRate, setTaxRate] = useState(0)
  const [originalOfferPrice, setOriginalOfferPrice] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [editingField, setEditingField] = useState(null) // 'offer' | 'discount' | null
  
  // Product Variations
  const [showVariationModal, setShowVariationModal] = useState(false)
  const [selectedVariations, setSelectedVariations] = useState([])
  const [reverseVariationText, setReverseVariationText] = useState("") // Deprecated, kept for backward compatibility
  const [selfVariationText, setSelfVariationText] = useState("") // This product's own variation label
  
  // Color Variations
  const [colorVariations, setColorVariations] = useState([])
  
  // DOS/Windows Variations
  const [dosVariations, setDosVariations] = useState([])
  
  // Video Source Type (upload or youtube)
  const [videoSourceType, setVideoSourceType] = useState("youtube") // 'upload' | 'youtube'
  const [youtubeUrl, setYoutubeUrl] = useState("")

  // Helper function to check if a URL is a YouTube URL
  const isYouTubeUrl = (url) => {
    if (!url) return false
    return url.includes('youtube.com') || url.includes('youtu.be')
  }

  const units = [
    { value: "piece", label: "Piece" },
    { value: "kg", label: "Kilogram" },
    { value: "gram", label: "Gram" },
    { value: "liter", label: "Liter" },
    { value: "meter", label: "Meter" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" },
  ]

  // Fetch taxes from backend
  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        const token = localStorage.getItem("adminToken")
        const { data } = await axios.get(`${config.API_URL}/api/tax`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setTaxes(data)
      } catch (error) {
        setTaxes([])
        console.error("Failed to load taxes:", error)
      }
    }
    fetchTaxes()
  }, [])

  // Set tax rate when formData.tax or taxes change
  useEffect(() => {
    if (formData.tax && taxes.length > 0) {
      const selectedTax = taxes.find((t) => t._id === formData.tax)
      setTaxRate(selectedTax ? Number(selectedTax.rate) : 0)
    } else {
      setTaxRate(0)
    }
  }, [formData.tax, taxes])

  useEffect(() => {
    // Only recompute VAT breakdown and keep formData values in sync with inputs.
    const base = Number(basePrice) || 0
    const offer = Number(originalOfferPrice) || 0

    const tax = taxRate
    const includedTax = (amount, rate) => {
      if (!amount || amount <= 0 || !rate || rate <= 0) return 0
      return amount - amount / (1 + rate / 100)
    }

    const displayBase = offer > 0 ? offer : base
    const taxAmt = includedTax(displayBase, tax)
    setTaxAmount(taxAmt)

    // Do not round while typing; just mirror to formData
    setFormData((prev) => ({
      ...prev,
      offerPrice: originalOfferPrice,
      price: basePrice === "" ? prev.price : base.toFixed(2),
    }))
  }, [basePrice, taxRate, originalOfferPrice])

  useEffect(() => {
    fetchParentCategories()
    fetchBrands()
    if (product) {
      const parentId =
        (typeof product.parentCategory === "object" && product.parentCategory
          ? product.parentCategory._id
          : product.parentCategory) || ""
      const resolvedCategoryId =
        (typeof product.category === "object" && product.category ? product.category._id : product.category) ||
        (typeof product.subCategory === "object" && product.subCategory ? product.subCategory._id : product.subCategory) ||
        ""

      setBasePrice(product.price ? String(product.price) : "")
      setOriginalOfferPrice(product.offerPrice ? String(product.offerPrice) : "")
      
      // Initialize variations if they exist - handle both old and new structure
      if (product.variations && product.variations.length > 0) {
        const formattedVariations = product.variations.map(v => {
          // New structure: { product: {...}, variationText: "..." }
          if (v.product) {
            return {
              ...v.product,
              variationText: v.variationText || ""
            }
          }
          // Old structure: direct product reference
          return v
        })
        setSelectedVariations(formattedVariations)
        setReverseVariationText(product.reverseVariationText || "")
      }
      
      // Set self variation text (this product's own label in variation selectors)
      setSelfVariationText(product.selfVariationText || product.reverseVariationText || "")
      
      // Set color variations if they exist
      if (product.colorVariations && product.colorVariations.length > 0) {
        setColorVariations(product.colorVariations)
      }

      // Set DOS/Windows variations if they exist
      if (product.dosVariations && product.dosVariations.length > 0) {
        setDosVariations(product.dosVariations)
      }

      const preload = async () => {
        if (parentId) {
          await fetchSubCategories(String(parentId))
        }
        
        // Preload subcategories for levels 2, 3, 4 if they exist
        if (product.category) {
          const categoryId = typeof product.category === "object" ? product.category._id : product.category
          await fetchSubCategories2(String(categoryId))
        }
        if (product.subCategory2) {
          const sub2Id = typeof product.subCategory2 === "object" ? product.subCategory2._id : product.subCategory2
          await fetchSubCategories3(String(sub2Id))
        }
        if (product.subCategory3) {
          const sub3Id = typeof product.subCategory3 === "object" ? product.subCategory3._id : product.subCategory3
          await fetchSubCategories4(String(sub3Id))
        }

        setFormData({
          name: product.name || "",
          sku: product.sku || "",
          slug: product.slug || "",
          barcode: product.barcode || "",
          gtin: product.gtin || "",
          brand:
            (typeof product.brand === "object" && product.brand ? product.brand._id : product.brand)
              ? String(typeof product.brand === "object" && product.brand ? product.brand._id : product.brand)
              : "",
          parentCategory: parentId ? String(parentId) : "",
          category: resolvedCategoryId ? String(resolvedCategoryId) : "",
          subCategory:
            (typeof product.subCategory === "object" && product.subCategory ? product.subCategory._id : product.subCategory)
              ? String(
                  typeof product.subCategory === "object" && product.subCategory
                    ? product.subCategory._id
                    : product.subCategory,
                )
              : "",
          subCategory2:
            (typeof product.subCategory2 === "object" && product.subCategory2 ? product.subCategory2._id : product.subCategory2)
              ? String(
                  typeof product.subCategory2 === "object" && product.subCategory2
                    ? product.subCategory2._id
                    : product.subCategory2,
                )
              : "",
          subCategory3:
            (typeof product.subCategory3 === "object" && product.subCategory3 ? product.subCategory3._id : product.subCategory3)
              ? String(
                  typeof product.subCategory3 === "object" && product.subCategory3
                    ? product.subCategory3._id
                    : product.subCategory3,
                )
              : "",
          subCategory4:
            (typeof product.subCategory4 === "object" && product.subCategory4 ? product.subCategory4._id : product.subCategory4)
              ? String(
                  typeof product.subCategory4 === "object" && product.subCategory4
                    ? product.subCategory4._id
                    : product.subCategory4,
                )
              : "",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          buyingPrice: product.buyingPrice || "",
          price: product.price || "",
          offerPrice: product.offerPrice || "",
          discount: product.discount || "",
          image: product.image || "",
          galleryImages: product.galleryImages || [],
          video: product.video || "",
          videoGallery: product.videoGallery || [],
          countInStock: product.countInStock || "",
          lowStockWarning: product.lowStockWarning || "5",
          maxPurchaseQty: product.maxPurchaseQty || "10",
          weight: product.weight || "",
          unit: product.unit || "piece",
          tax:
            (typeof product.tax === "object" && product.tax ? product.tax._id : product.tax)
              ? String(typeof product.tax === "object" && product.tax ? product.tax._id : product.tax)
              : "0",
          tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
          specifications: product.specifications || [],
          isActive: product.isActive !== undefined ? product.isActive : true,
          canPurchase: product.canPurchase !== undefined ? product.canPurchase : true,
          showStockOut: product.showStockOut !== undefined ? product.showStockOut : true,
          refundable: product.refundable !== undefined ? product.refundable : true,
          featured: product.featured || false,
          hideFromShop: product.hideFromShop || false,
          stockStatus: product.stockStatus || "In Stock",
          seoTitle: product.seoTitle || "",
          seoDescription: product.seoDescription || "",
          seoKeywords: product.seoKeywords || "",
          seoCanonicalUrl: product.seoCanonicalUrl || "",
          seoRobots: product.seoRobots || "index, follow",
          customSchema: product.customSchema || "",
          ogTitle: product.ogTitle || "",
          ogDescription: product.ogDescription || "",
          ogImage: product.ogImage || "",
        })
        
        // Set video source type based on existing video URL
        if (product.video) {
          if (isYouTubeUrl(product.video)) {
            setVideoSourceType("youtube")
            setYoutubeUrl(product.video)
          } else {
            setVideoSourceType("upload")
          }
        }
      }

      preload()
    }
  }, [product]) // Removed taxes from dependencies to prevent recalculation loops

  // Fetch parent categories (main categories)
  const fetchParentCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setParentCategories(data)
    } catch (error) {
      console.error("Failed to load parent categories:", error)
    }
  }

  // Fetch subcategories when parentCategory changes (Level 1)
  useEffect(() => {
    if (formData.parentCategory) {
      fetchSubCategories(formData.parentCategory)
    } else {
      setSubCategories([])
      setSubCategories2([])
      setSubCategories3([])
      setSubCategories4([])
      setFormData((prev) => ({ ...prev, category: "", subCategory: "", subCategory2: "", subCategory3: "", subCategory4: "" }))
    }
  }, [formData.parentCategory])

  // Fetch level 2 subcategories when category (level 1) changes
  useEffect(() => {
    if (formData.category) {
      fetchSubCategories2(formData.category)
    } else {
      setSubCategories2([])
      setSubCategories3([])
      setSubCategories4([])
      setFormData((prev) => ({ ...prev, subCategory2: "", subCategory3: "", subCategory4: "" }))
    }
  }, [formData.category])

  // Fetch level 3 subcategories when subCategory2 changes
  useEffect(() => {
    if (formData.subCategory2) {
      fetchSubCategories3(formData.subCategory2)
    } else {
      setSubCategories3([])
      setSubCategories4([])
      setFormData((prev) => ({ ...prev, subCategory3: "", subCategory4: "" }))
    }
  }, [formData.subCategory2])

  // Fetch level 4 subcategories when subCategory3 changes
  useEffect(() => {
    if (formData.subCategory3) {
      fetchSubCategories4(formData.subCategory3)
    } else {
      setSubCategories4([])
      setFormData((prev) => ({ ...prev, subCategory4: "" }))
    }
  }, [formData.subCategory3])

  const fetchSubCategories = async (parentCategoryId) => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/subcategories/category/${parentCategoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      // Filter to only show Level 1 subcategories
      const level1Subs = data.filter(sub => !sub.level || sub.level === 1)
      setSubCategories(level1Subs)
    } catch (error) {
      setSubCategories([])
      console.error("Failed to load subcategories:", error)
    }
  }

  const fetchSubCategories2 = async (parentSubCategoryId) => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/subcategories/children/${parentSubCategoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSubCategories2(data)
    } catch (error) {
      setSubCategories2([])
      console.error("Failed to load subcategories level 2:", error)
    }
  }

  const fetchSubCategories3 = async (parentSubCategoryId) => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/subcategories/children/${parentSubCategoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSubCategories3(data)
    } catch (error) {
      setSubCategories3([])
      console.error("Failed to load subcategories level 3:", error)
    }
  }

  const fetchSubCategories4 = async (parentSubCategoryId) => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/subcategories/children/${parentSubCategoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSubCategories4(data)
    } catch (error) {
      setSubCategories4([])
      console.error("Failed to load subcategories level 4:", error)
    }
  }

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/brands`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setBrands(data)
    } catch (error) {
      console.error("Failed to load brands:", error)
    }
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-")
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const normalizedValue = name === "seoTitle" ? limitWords(value, SEO_TITLE_MAX_WORDS) : value

    if (name === "basePrice") {
      // Handle the new basePrice input
      setBasePrice(value)
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : normalizedValue,
      }))
    }

    // Auto-generate slug from name
    if (name === "name" && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }))
    }
  }

  const handleOfferPriceChange = (e) => {
    const value = e.target.value
    setEditingField("offer")
    setOriginalOfferPrice(value)

    const base = Number(basePrice)
    const offer = Number(value)
    if (!isNaN(base) && base > 0 && value !== "") {
      const calcDiscount = Math.max(0, ((base - offer) / base) * 100).toFixed(2)
      setFormData((prev) => ({ ...prev, discount: String(calcDiscount) }))
    } else {
      // When offer is cleared, clear discount (but don't touch if user is editing discount)
      if (editingField !== "discount") {
        setFormData((prev) => ({ ...prev, discount: "" }))
      }
    }
  }

  const handleOfferPriceBlur = () => {
    setEditingField(null)
    if (originalOfferPrice === "") return
    const n = Number(originalOfferPrice)
    if (!isNaN(n)) {
      const fixed = n.toFixed(2)
      setOriginalOfferPrice(fixed)
      setFormData((prev) => ({ ...prev, offerPrice: fixed }))
    }
  }

  const handleDiscountChange = (e) => {
    const value = e.target.value
    setEditingField("discount")
    // Update discount immediately
    setFormData((prev) => ({ ...prev, discount: value }))

    const offer = Number(originalOfferPrice)
    const disc = Number(value)
    if (!isNaN(offer) && offer > 0 && value !== "") {
      // Calculate base price from offer price and discount
      // Formula: basePrice = offerPrice / (1 - discount/100)
      const discountPercent = Math.min(Math.max(disc, 0), 99.99) // Max 99.99% to avoid division by zero
      const base = offer / (1 - discountPercent / 100)
      const baseStr = base.toFixed(2)
      setBasePrice(baseStr)
    } else if (value === "" || disc === 0) {
      // If discount cleared or 0, base price equals offer price
      setBasePrice(originalOfferPrice)
    }
  }

  const handleDiscountBlur = () => {
    setEditingField(null)
    const d = Number(formData.discount)
    if (!isNaN(d)) {
      const clamped = Math.min(Math.max(d, 0), 100).toFixed(2)
      setFormData((prev) => ({ ...prev, discount: String(clamped) }))
    }
  }

  const handleDescriptionChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      description: content,
    }))
  }

  const handleShortDescriptionChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      shortDescription: content,
    }))
  }

  const handleImageUpload = (url) => {
    setFormData((prev) => ({
      ...prev,
      image: url,
    }))
  }

  const handleGalleryImageUpload = (url, index) => {
    setFormData((prev) => {
      const newGalleryImages = [...prev.galleryImages]
      newGalleryImages[index] = url
      return {
        ...prev,
        galleryImages: newGalleryImages,
      }
    })
  }

  const removeGalleryImage = (index) => {
    setFormData((prev) => {
      const newGalleryImages = [...prev.galleryImages]
      newGalleryImages.splice(index, 1)
      return {
        ...prev,
        galleryImages: newGalleryImages,
      }
    })
  }

  const handleVideoUpload = (url) => {
    setFormData((prev) => ({
      ...prev,
      video: url,
    }))
  }

  const handleYoutubeUrlChange = (e) => {
    const url = e.target.value
    setYoutubeUrl(url)
    setFormData((prev) => ({
      ...prev,
      video: url,
    }))
  }

  const handleVideoSourceTypeChange = (type) => {
    setVideoSourceType(type)
    // Clear video when switching source types
    if (type === "upload") {
      setYoutubeUrl("")
      setFormData((prev) => ({
        ...prev,
        video: "",
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        video: youtubeUrl,
      }))
    }
  }

  const handleVideoGalleryUpload = (url, index) => {
    setFormData((prev) => {
      const newVideoGallery = [...prev.videoGallery]
      newVideoGallery[index] = url
      return {
        ...prev,
        videoGallery: newVideoGallery,
      }
    })
  }

  const removeVideoFromGallery = (index) => {
    setFormData((prev) => {
      const newVideoGallery = [...prev.videoGallery]
      newVideoGallery.splice(index, 1)
      return {
        ...prev,
        videoGallery: newVideoGallery,
      }
    })
  }

  // Specification handlers
  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }))
  }

  const removeSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }))
  }

  const updateSpecification = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (Number(formData.buyingPrice) < 0 || Number(basePrice) < 0 || Number(originalOfferPrice) < 0) {
      alert("Buying price, base price, and offer price cannot be less than 0.")
      setLoading(false)
      return
    }
    try {
      let taxValue = formData.tax
      if (!taxValue || taxValue === "0" || taxValue === 0) {
        taxValue = undefined
      }
      // IMPORTANT: Do not add tax again on submit.
      // We treat basePrice and formData.offerPrice as already tax-inclusive (informational VAT only).
  const finalBasePrice = Number.parseFloat(basePrice) || 0
  // Use the visible Offer Price input; if blank, treat as 0
  const finalOfferPrice = originalOfferPrice !== "" ? Number.parseFloat(originalOfferPrice) || 0 : 0

      const productData = {
        ...formData,
        sku: String(formData.sku ?? "").trim() || undefined,
        barcode: String(formData.barcode ?? "").trim() || undefined,
        gtin: String(formData.gtin ?? "").trim() || undefined,
        parentCategory: formData.parentCategory,
        category: formData.category,
        subCategory: formData.category || null,
        subCategory2: formData.subCategory2 || null,
        subCategory3: formData.subCategory3 || null,
        subCategory4: formData.subCategory4 || null,
        buyingPrice: Number.parseFloat(formData.buyingPrice) || 0,
        price: finalBasePrice, // Save as-is (tax-inclusive; no re-add)
        offerPrice: finalOfferPrice, // Save as-is (tax-inclusive; no re-add)
        discount: Number.parseFloat(formData.discount) || 0,
        countInStock: Number.parseInt(formData.countInStock) || 0,
        lowStockWarning: Number.parseInt(formData.lowStockWarning) || 5,
        maxPurchaseQty: Number.parseInt(formData.maxPurchaseQty) || 10,
        weight: Number.parseFloat(formData.weight) || 0,
        tax: taxValue,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        galleryImages: formData.galleryImages.filter((img) => img !== ""),
        video: formData.video || "",
        videoGallery: formData.videoGallery.filter((vid) => vid !== ""),
        specifications: formData.specifications.filter((spec) => spec.key && spec.value),
        stockStatus: formData.stockStatus,
        isActive: formData.isActive,
        canPurchase: formData.canPurchase,
        showStockOut: formData.showStockOut,
        refundable: formData.refundable,
        featured: formData.featured,
        hideFromShop: formData.hideFromShop,
        variations: selectedVariations.map(v => ({ 
          product: v._id, 
          variationText: v.variationText || "" 
        })), // Add variation IDs with text
        reverseVariationText: selfVariationText || "", // Backward compatibility
        selfVariationText: selfVariationText || "", // This product's own variation label
        colorVariations: colorVariations, // Add color variations array
        dosVariations: dosVariations, // Add DOS/Windows variations array
        // SEO fields
        seoTitle: formData.seoTitle || "",
        seoDescription: formData.seoDescription || "",
        seoKeywords: formData.seoKeywords || "",
        seoCanonicalUrl: formData.seoCanonicalUrl || "",
        seoRobots: formData.seoRobots || "index, follow",
        customSchema: formData.customSchema || "",
        ogTitle: formData.ogTitle || "",
        ogDescription: formData.ogDescription || "",
        ogImage: formData.ogImage || "",
      }
      await onSubmit(productData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setLoading(false)
    }
  }

  // Debug logs for subcategory selection
  console.log("Selected subcategory value:", formData.category)
  console.log(
    "Fetched subcategories:",
    subCategories.map((s) => ({ id: s._id, name: s.name })),
  )
  // Debug log for taxes
  console.log("Fetched taxes:", taxes)


  return (
    
    <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 border bg-red-500 border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          </div>
      <h2 className="text-xl font-bold mb-6">{product ? "Edit Product" : "Add New Product"}</h2>
  
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter SKU"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="product-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter barcode"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GTIN Number</label>
            <input
              type="text"
              name="gtin"
              value={formData.gtin}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Global Trade Item Number for Google Merchant"
            />
            <p className="text-xs text-gray-500 mt-1">Used for Google Merchant feed. Leave empty if not available.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Status <span className="text-red-500">*</span>
            </label>
            <select
              name="stockStatus"
              value={formData.stockStatus}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="PreOrder">PreOrder</option>
            </select>
          </div>

          {/* Parent Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Category <span className="text-red-500">*</span>
            </label>
            <select
              name="parentCategory"
              value={formData.parentCategory}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a Main Category</option>
              {parentCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown (Level 1) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory (Level 1) <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.parentCategory || subCategories.length === 0}
              required
            >
              <option value="">
                {formData.parentCategory ? "Select a Subcategory" : "Select a main category first"}
              </option>
              {subCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Level 2 Dropdown (Optional) - Always show but disabled until Level 1 selected */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory Level 2 <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <select
              name="subCategory2"
              value={formData.subCategory2}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.category || subCategories2.length === 0}
            >
              <option value="">
                {!formData.category ? "Select Level 1 first" : subCategories2.length === 0 ? "No subcategories available" : "Select Subcategory Level 2"}
              </option>
              {subCategories2.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Level 3 Dropdown (Optional) - Always show but disabled until Level 2 selected */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory Level 3 <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <select
              name="subCategory3"
              value={formData.subCategory3}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.subCategory2 || subCategories3.length === 0}
            >
              <option value="">
                {!formData.subCategory2 ? "Select Level 2 first" : subCategories3.length === 0 ? "No subcategories available" : "Select Subcategory Level 3"}
              </option>
              {subCategories3.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Level 4 Dropdown (Optional) - Always show but disabled until Level 3 selected */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory Level 4 <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <select
              name="subCategory4"
              value={formData.subCategory4}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.subCategory3 || subCategories4.length === 0}
            >
              <option value="">
                {!formData.subCategory3 ? "Select Level 3 first" : subCategories4.length === 0 ? "No subcategories available" : "Select Subcategory Level 4"}
              </option>
              {subCategories4.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand <span className="text-red-500">*</span>
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a Brand</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buying Price{!product && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              name="buyingPrice"
              value={formData.buyingPrice}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
              {...(!product ? { required: true } : {})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price (AED) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="basePrice"
              value={basePrice}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter base price"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price (AED)</label>
            <input
              type="number"
              name="offerPrice"
              value={originalOfferPrice}
              onChange={handleOfferPriceChange}
              onBlur={handleOfferPriceBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter offer price (before tax)"
              min="0"
              step="0.01"
            />
            {/* {Number(originalOfferPrice) > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                {taxRate > 0 ? (
                  <span className="text-blue-600 font-medium">
                    Includes approx VAT {taxRate}%: AED {(
                      Number(originalOfferPrice) - Number(originalOfferPrice) / (1 + taxRate / 100)
                    ).toFixed(2)}
                  </span>
                ) : (
                  <span className="text-gray-500">No VAT selected</span>
                )}
              </p>
            )} */}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleDiscountChange}
              onBlur={handleDiscountBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Tax-inclusive price summary */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded p-4">
          <div className="flex flex-wrap gap-4 items-center text-sm">
            <div>
              Base Price: <b>{Number(basePrice).toFixed(2) || "0.00"} AED</b>
            </div>
            <div>
              Offer Price: <b>{Number(formData.offerPrice).toFixed(2) || "0.00"} AED</b>
            </div>
            <div>
              Discount: <b>{Number(formData.discount).toFixed(2) || "0.00"}%</b>
            </div>
            <div>
              Tax: <b>{taxRate}%</b>
            </div>
            <div>
              Tax Amount: <b className="text-blue-600">{taxAmount.toFixed(2)} AED</b>
            </div>
            <div className="text-green-700 font-bold">
              Final Price (Saved): {Number(formData.price).toFixed(2)} AED{" "}
              <span className="text-xs text-red-500 ml-2">Inclusive tax</span>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <div>
            <ImageUpload 
              onImageUpload={handleImageUpload} 
              currentImage={formData.image} 
              label="Main Product Image (WebP only) *" 
              isProduct={true}
            />
          </div>

          {/* Gallery Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (WebP only)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {formData.galleryImages.map((img, index) => (
                <div key={index} className="relative">
                  <ImageUpload
                    onImageUpload={(url) => handleGalleryImageUpload(url, index)}
                    currentImage={img}
                    label={`Gallery Image ${index + 1}`}
                    isProduct={true}
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                    title="Remove Image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, ""] }))}
                  className="w-full h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-400 transition-colors"
                >
                  <Plus size={24} />
                  <span className="ml-2">Add Image</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Videos Section */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Videos</h3>
            
            {/* Main Video */}
            <div className="mb-6">
              {/* Video Source Type Toggle */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Video Source</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="videoSourceType"
                      value="upload"
                      checked={videoSourceType === "upload"}
                      onChange={() => handleVideoSourceTypeChange("upload")}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Upload Video</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="videoSourceType"
                      value="youtube"
                      checked={videoSourceType === "youtube"}
                      onChange={() => handleVideoSourceTypeChange("youtube")}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">YouTube URL</span>
                  </label>
                </div>
              </div>

              {/* Upload Video Section */}
              {videoSourceType === "upload" && (
                <VideoUpload 
                  onVideoUpload={handleVideoUpload} 
                  currentVideo={formData.video} 
                  label="Main Product Video (MP4/WebM)" 
                />
              )}

              {/* YouTube URL Section */}
              {videoSourceType === "youtube" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video URL</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={handleYoutubeUrlChange}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the YouTube video URL. Supports youtube.com/watch?v=... and youtu.be/... formats.
                  </p>
                  {youtubeUrl && isYouTubeUrl(youtubeUrl) && (
                    <div className="mt-3 aspect-video w-full max-w-md">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${youtubeUrl.includes('youtu.be/') 
                          ? youtubeUrl.split('youtu.be/')[1]?.split('?')[0] 
                          : youtubeUrl.split('v=')[1]?.split('&')[0]}`}
                        title="YouTube video preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                      ></iframe>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video Gallery - Only show when Upload Video is selected */}
            {videoSourceType === "upload" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video Gallery</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.videoGallery.map((vid, index) => (
                  <div key={index} className="relative">
                    <VideoUpload
                      onVideoUpload={(url) => handleVideoGalleryUpload(url, index)}
                      currentVideo={vid}
                      label={`Gallery Video ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeVideoFromGallery(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                      title="Remove Video"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, videoGallery: [...prev.videoGallery, ""] }))}
                    className="w-full h-20 flex items-center justify-center border-2 border-dashed border-purple-300 rounded-lg text-purple-400 hover:text-purple-600 hover:border-purple-400 transition-colors"
                  >
                    <Plus size={24} />
                    <span className="ml-2">Add Video</span>
                  </button>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Stock & Settings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity{!product && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              name="countInStock"
              value={formData.countInStock}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              {...(!product ? { required: true } : {})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Warning</label>
            <input
              type="number"
              name="lowStockWarning"
              value={formData.lowStockWarning}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Purchase Quantity</label>
            <input
              type="number"
              name="maxPurchaseQty"
              value={formData.maxPurchaseQty}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {units.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax
              {formData.tax && taxRate > 0 && (
                <span className="ml-2 text-xs text-blue-600 font-medium">{taxRate}% - Inclusive tax</span>
              )}
            </label>
            <select
              name="tax"
              value={formData.tax}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a Tax</option>
              {taxes.map((tax) => (
                <option key={tax._id} value={tax._id}>
                  {tax.name}
                  {tax.rate ? ` (${tax.rate}${tax.type ? (tax.type === "percentage" ? "%" : "") : ""})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        {/* Product Specifications Section */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Product Specifications</h3>
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <Plus size={18} className="mr-2" />
              Add Specification
            </button>
          </div>

          {formData.specifications.length > 0 ? (
            <div className="space-y-4">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Specification #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                      title="Remove Specification"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specification Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Processor, RAM, Storage"
                        value={spec.key}
                        onChange={(e) => updateSpecification(index, "key", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specification Value <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Intel i5-1235U, 8GB DDR4, 512GB SSD"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, "value", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No specifications added yet</h3>
              <p className="text-gray-500 mb-6">Add product specifications like processor, RAM, storage, etc.</p>
              <button
                type="button"
                onClick={addSpecification}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              >
                <Plus size={18} className="mr-2" />
                Add First Specification
              </button>
            </div>
          )}

          {formData.specifications.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>{formData.specifications.length}</strong> specification
                {formData.specifications.length !== 1 ? "s" : ""} added
              </p>
            </div>
          )}
        </div>

        {/* Descriptions */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <TipTapEditor
              content={formData.shortDescription}
              onChange={handleShortDescriptionChange}
              placeholder="Brief product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description{!product && <span className="text-red-500">*</span>}
            </label>
            <TipTapEditor
              content={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Enter detailed product description with images..."
              {...(!product ? { required: true } : {})}
            />
          </div>
        </div>

        {/* Status Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="canPurchase"
              checked={formData.canPurchase}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Can Purchase</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="showStockOut"
              checked={formData.showStockOut}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Show Stock Out</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="refundable"
              checked={formData.refundable}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Refundable</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Featured</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="hideFromShop"
              checked={formData.hideFromShop}
              onChange={handleInputChange}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700 flex items-center gap-1">
              Hide from Shop
              <span className="text-xs text-gray-500">(accessible via variations & direct link only)</span>
            </label>
          </div>
        </div>

        {/* Product Variations Section */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Product Variations</h3>
              <p className="text-sm text-gray-600 mt-1">
                Link this product with other variations (e.g., different RAM sizes, storage options)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowVariationModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <Plus size={18} className="mr-2" />
              {selectedVariations.length > 0 ? 'Manage Variations' : 'Add Variation'}
            </button>
          </div>

          {/* Self Variation Text Input */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              This Product's Variation Label
            </label>
            <input
              type="text"
              placeholder="e.g., 16GB RAM, 512GB SSD, Black Color"
              value={selfVariationText}
              onChange={(e) => setSelfVariationText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
            />
            <p className="text-xs text-gray-600 mt-2">
              <strong>Important:</strong> This label will appear as a selectable option when customers view any linked product. 
              For example, if you set this to "16GB RAM", customers viewing the 24GB or 32GB variants will see "16GB RAM" as a clickable option.
            </p>
          </div>

          {selectedVariations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedVariations.map((variation) => (
                <div
                  key={variation._id}
                  className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedVariations(prev => prev.filter(v => v._id !== variation._id))}
                    className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                    title="Remove Variation"
                  >
                    <X size={16} />
                  </button>

                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={getFullImageUrl(variation.image) || "/placeholder.svg"}
                        alt={variation.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                        {variation.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        SKU: {variation.sku || "N/A"}
                      </p>
                      <div className="mt-2">
                        <span className="text-sm font-bold text-gray-900">
                          {variation.offerPrice > 0 
                            ? `${Number(variation.offerPrice || 0).toFixed(2)} AED`
                            : `${Number(variation.price || 0).toFixed(2)} AED`
                          }
                        </span>
                      </div>
                      {variation.variationText && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-700 font-medium">
                            {variation.variationText}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No variations added yet</h3>
              <p className="text-gray-500 mb-6">
                Add product variations to help customers find the exact product they need
              </p>
              <button
                type="button"
                onClick={() => setShowVariationModal(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              >
                <Plus size={18} className="mr-2" />
                Add First Variation
              </button>
            </div>
          )}

          {selectedVariations.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>{selectedVariations.length}</strong> variation
                {selectedVariations.length !== 1 ? "s" : ""} added
              </p>
            </div>
          )}
        </div>

        {/* Color Variations Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <ColorVariationForm
            colorVariations={colorVariations}
            onChange={setColorVariations}
          />
        </div>

        {/* DOS/Windows Variations Section */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
          <DosVariationForm
            dosVariations={dosVariations}
            onChange={setDosVariations}
          />
        </div>

        {/* SEO Settings Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">SEO Settings</h3>
          <p className="text-sm text-gray-500 mb-6">These fields are only used for search engine meta tags. They will NOT be displayed on the product page.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Custom page title for Google (leave blank to use product name)"
              />
              <p className="text-xs text-gray-400 mt-1">
                {countWords(formData.seoTitle)}/{SEO_TITLE_MAX_WORDS} words
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Robots Meta</label>
              <select
                name="seoRobots"
                value={formData.seoRobots}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="index, follow">Index, Follow (default)</option>
                <option value="noindex, follow">No Index, Follow</option>
                <option value="index, nofollow">Index, No Follow</option>
                <option value="noindex, nofollow">No Index, No Follow</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Custom meta description for Google (leave blank to auto-generate from product description)"
                maxLength={160}
              />
              <p className="text-xs text-gray-400 mt-1">{formData.seoDescription.length}/160 characters</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
              <input
                type="text"
                name="seoKeywords"
                value={formData.seoKeywords}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="text-xs text-gray-400 mt-1">Comma-separated keywords for search engines</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
              <input
                type="text"
                name="seoCanonicalUrl"
                value={formData.seoCanonicalUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/product/my-product (leave blank for default)"
              />
              <p className="text-xs text-gray-400 mt-1">Override the canonical URL if needed (leave blank to use default product URL)</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Schema Markup (HTML/JS)
              </label>
              <textarea
                name="customSchema"
                value={formData.customSchema}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                placeholder={'<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "Your Product Name"\n}\n</script>'}
              />
              <p className="text-xs text-gray-400 mt-1">
                Paste JSON-LD script tags (recommended) or custom head HTML/JS. It is injected into page head and not visible to users.
              </p>
            </div>
          </div>

          {/* Open Graph Settings */}
          <div className="mt-6 pt-6 border-t border-green-200">
            <h4 className="text-md font-semibold text-gray-800 mb-4">Open Graph (Social Media Sharing)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                <input
                  type="text"
                  name="ogTitle"
                  value={formData.ogTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Title for Facebook/Twitter sharing (leave blank to use Meta Title)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                <input
                  type="text"
                  name="ogImage"
                  value={formData.ogImage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Image URL for social sharing (leave blank to use product image)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                <textarea
                  name="ogDescription"
                  value={formData.ogDescription}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Description for social sharing (leave blank to use Meta Description)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>

      {/* Product Variation Modal */}
      <ProductVariationModal
        isOpen={showVariationModal}
        onClose={() => setShowVariationModal(false)}
        onSelectProducts={(products, selfText) => {
          setSelectedVariations(products)
          setSelfVariationText(selfText || "")
        }}
        selectedVariations={selectedVariations}
        currentProductId={product?._id}
        currentProductName={formData.name}
        currentSelfVariationText={selfVariationText}
      />
    </div>
  )
}

export default ProductForm

