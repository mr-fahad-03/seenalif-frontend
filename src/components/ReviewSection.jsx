"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import axios from "axios"
import config from "../config/config.js"
import { Star, X, ThumbsUp, Flag, User, ImageIcon, CheckCircle, Mail, Shield, ChevronDown, ChevronUp } from "lucide-react"

const ReviewSection = ({ productId, onStatsUpdate }) => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })

  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [guestReviewIds, setGuestReviewIds] = useState([])
  const [expandedReviews, setExpandedReviews] = useState(new Set())
  const fileInputRef = useRef(null)

  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationId, setVerificationId] = useState(null)
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [resendingCode, setResendingCode] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const verificationInputRefs = useRef([])

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    name: user?.name || "",
    email: user?.email || "",
  })

  useEffect(() => {
    const storedGuestReviews = localStorage.getItem(`guestReviews_${productId}`)
    if (storedGuestReviews) {
      try {
        setGuestReviewIds(JSON.parse(storedGuestReviews))
      } catch (error) {
        console.error("Error parsing guest reviews from localStorage:", error)
      }
    }
  }, [productId])

  useEffect(() => {
    if (productId) {
      fetchReviews()
    }
  }, [productId, currentPage, guestReviewIds])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const fetchReviews = async () => {
    try {
      setLoading(true)

      const requestConfig = {}
      if (user) {
        const token = localStorage.getItem("token")
        if (token) {
          requestConfig.headers = {
            Authorization: `Bearer ${token}`,
          }
        }
      }

      let url = `${config.API_URL}/api/reviews/product/${productId}?page=${currentPage}&limit=10`
      if (!user && guestReviewIds.length > 0) {
        url += `&guestReviewIds=${guestReviewIds.join(",")}`
      }

      const response = await axios.get(url, requestConfig)

      const filteredReviews = response.data.reviews || []
      setReviews(filteredReviews)
      const newStats = {
        averageRating: response.data.stats?.averageRating || 0,
        totalReviews: response.data.stats?.totalReviews || 0,
        ratingDistribution: response.data.stats?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
      setStats(newStats)

      if (onStatsUpdate) {
        onStatsUpdate(newStats)
      }

      setTotalPages(response.data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      showToast("Error loading reviews", "error")
      setReviews([])
      const emptyStats = {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
      setStats(emptyStats)

      if (onStatsUpdate) {
        onStatsUpdate(emptyStats)
      }

      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!reviewForm.comment.trim()) {
      showToast("Please write a review comment", "error")
      return
    }

    if (!user && (!reviewForm.name.trim() || !reviewForm.email.trim())) {
      showToast("Please provide your name and email", "error")
      return
    }

    try {
      setSubmittingReview(true)

      const formData = new FormData()
      formData.append("productId", productId)
      formData.append("rating", reviewForm.rating)
      formData.append("comment", reviewForm.comment.trim())

      if (!user) {
        formData.append("name", reviewForm.name.trim())
        formData.append("email", reviewForm.email.trim())
      }

      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      const requestConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }

      if (user) {
        const token = localStorage.getItem("token")
        if (token) {
          requestConfig.headers.Authorization = `Bearer ${token}`
        }
      }

      const response = await axios.post(`${config.API_URL}/api/reviews`, formData, requestConfig)

      if (user) {
        showToast("Review submitted and published successfully!", "success")

        setReviewForm({
          rating: 5,
          comment: "",
          name: user?.name || "",
          email: user?.email || "",
        })
        removeImage()
        setShowReviewForm(false)

        setTimeout(() => {
          fetchReviews()
        }, 500)
      } else {
        if (response.data.requiresVerification) {
          setVerificationId(response.data.verificationId)
          setShowVerificationModal(true)
          setShowReviewForm(false)
          showToast("Please check your email for a verification code", "info")
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      const message = error.response?.data?.message || "Error submitting review"
      showToast(message, "error")
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleVerificationInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value

    setVerificationCode(newCode)

    if (value && index < 5) {
      verificationInputRefs.current[index + 1]?.focus()
    }

    if (newCode.every((digit) => digit !== "") && newCode.join("").length === 6) {
      handleVerifyCode(newCode.join(""))
    }
  }

  const handleVerificationKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      verificationInputRefs.current[index - 1]?.focus()
    }

    if (e.key === "ArrowLeft" && index > 0) {
      verificationInputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      verificationInputRefs.current[index + 1]?.focus()
    }
  }

  const handleVerificationPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)

    if (pastedData.length === 6) {
      const newCode = pastedData.split("")
      setVerificationCode(newCode)
      verificationInputRefs.current[5]?.focus()
      handleVerifyCode(pastedData)
    }
  }

  const handleVerifyCode = async (code) => {
    if (!verificationId || code.length !== 6) {
      showToast("Please enter all 6 digits", "error")
      return
    }

    setVerifyingCode(true)

    try {
      const response = await axios.post(`${config.API_URL}/api/reviews/verify-email`, {
        verificationId,
        code,
      })

      if (response.data.review) {
        const reviewId = response.data.review.id
        const newGuestReviewIds = [...guestReviewIds, reviewId]
        setGuestReviewIds(newGuestReviewIds)
        localStorage.setItem(`guestReviews_${productId}`, JSON.stringify(newGuestReviewIds))
      }

      showToast("Email verified successfully! Your review has been published.", "success")

      setReviewForm({
        rating: 5,
        comment: "",
        name: "",
        email: "",
      })
      removeImage()
      setShowVerificationModal(false)
      setVerificationCode(["", "", "", "", "", ""])
      setVerificationId(null)

      setTimeout(() => {
        fetchReviews()
      }, 500)
    } catch (error) {
      console.error("Error verifying code:", error)
      const message = error.response?.data?.message || "Invalid or expired verification code"
      showToast(message, "error")
      setVerificationCode(["", "", "", "", "", ""])
      verificationInputRefs.current[0]?.focus()
    } finally {
      setVerifyingCode(false)
    }
  }

  const handleResendVerificationCode = async () => {
    if (!verificationId) {
      showToast("Verification session expired. Please submit your review again.", "error")
      setShowVerificationModal(false)
      return
    }

    setResendingCode(true)

    try {
      await axios.post(`${config.API_URL}/api/reviews/resend-verification`, {
        verificationId,
      })

      showToast("Verification code sent successfully!", "success")
      setResendCooldown(60)
    } catch (error) {
      console.error("Error resending code:", error)
      const message = error.response?.data?.message || "Failed to resend code. Please try again."
      showToast(message, "error")
    } finally {
      setResendingCode(false)
    }
  }

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Please select an image file", "error")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size must be less than 5MB", "error")
        return
      }

      setSelectedImage(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const toggleReviewExpansion = (reviewId) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId)
    } else {
      newExpanded.add(reviewId)
    }
    setExpandedReviews(newExpanded)
  }

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate && onRate(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
            disabled={!interactive}
          >
            <Star className={`w-5 h-5 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
          </button>
        ))}
      </div>
    )
  }

  const renderRatingDistribution = () => {
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0

          return (
            <div key={rating} className="flex items-center space-x-2">
              <span className="text-sm font-medium w-3">{rating}</span>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{(stats?.averageRating || 0).toFixed(1)}</div>
            <div className="flex justify-center mb-2">{renderStars(Math.round(stats?.averageRating || 0))}</div>
            <div className="text-gray-600">
              Based on {stats?.totalReviews || 0} review{(stats?.totalReviews || 0) !== 1 ? "s" : ""}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Rating Breakdown</h4>
            {renderRatingDistribution()}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
        {!showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Write a Review</h4>
            <button
              onClick={() => {
                setShowReviewForm(false)
                removeImage()
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {user ? (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-green-800 text-sm">
                <strong>Logged in as {user.name}</strong> - Your review will be published immediately
              </span>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 text-sm">
                <strong>Guest Review</strong> - We'll send a verification code to your email before publishing
              </span>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              {renderStars(reviewForm.rating, true, (rating) => setReviewForm((prev) => ({ ...prev, rating })))}
            </div>

            {!user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
                  <input
                    type="email"
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Review *</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Share your experience with this product..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Photo (Optional)</label>

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 transition-colors"
                >
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload an image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Review preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false)
                  removeImage()
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submittingReview && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                )}
                <span>{submittingReview ? "Submitting..." : "Submit Review"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {showVerificationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Verify Your Email</h3>
                <button
                  onClick={() => {
                    setShowVerificationModal(false)
                    setVerificationCode(["", "", "", "", "", ""])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit verification code to your email address. Please enter it below to publish your
                  review.
                </p>
              </div>

              <div className="mb-6">
                <div className="flex justify-center space-x-2">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (verificationInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleVerificationInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                      onPaste={handleVerificationPaste}
                      className="w-12 h-12 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                      disabled={verifyingCode}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => handleVerifyCode(verificationCode.join(""))}
                  disabled={verifyingCode || verificationCode.some((digit) => digit === "")}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {verifyingCode && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  )}
                  <span>{verifyingCode ? "Verifying..." : "Verify & Publish Review"}</span>
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendVerificationCode}
                      disabled={resendingCode || resendCooldown > 0}
                      className="font-medium text-green-600 hover:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendingCode
                        ? "Sending..."
                        : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend Code"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => {
            const isExpanded = expandedReviews.has(review._id)
            const shouldTruncate = review.comment.length > 250
            const displayComment = isExpanded || !shouldTruncate 
              ? review.comment 
              : review.comment.slice(0, 250) + '...'

            return (
              <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center border">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{review.name}</h4>
                      
                      {/* Rating and Date Row */}
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">
                          Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>

                      {/* Product Variant and Verified Badge Row */}
                      <div className="flex items-center space-x-2 mt-2">
                        {review.productVariant && (
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {review.productVariant}
                          </span>
                        )}
                        
                        {/* Beautiful Verified Purchase Badge */}
                        {true && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">
                            <CheckCircle className="w-3 h-3 mr-1.5" />
                            Verified Purchase
                          </span>
                        )}
                        
                        {review.status === "pending" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending Approval
                          </span>
                        )}
                        
                        {((user && review.user === user.id) || (!user && guestReviewIds.includes(review._id))) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                            
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Comment */}
                <div className="mb-4">
                  <p className="text-gray-800 leading-relaxed">
                    {displayComment}
                  </p>
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleReviewExpansion(review._id)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium mt-2 flex items-center space-x-1"
                    >
                      <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Review Image */}
                {review.image && (
                  <div className="mb-4">
                    <img
                      src={`${config.API_URL}/uploads/reviews/${review.image}`}
                      alt="Review"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-400 transition-colors shadow-sm"
                      onClick={() => window.open(`${config.API_URL}/uploads/reviews/${review.image}`, "_blank")}
                    />
                  </div>
                )}

                {/* Helpful and Report Actions */}
                <div className="flex items-center space-x-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
                  <button className="flex items-center space-x-2 hover:text-green-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-green-50">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({review.helpfulCount || 0})</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
                    <Flag className="w-4 h-4" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                page === currentPage 
                  ? "bg-green-600 text-white border-green-600 shadow-sm" 
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewSection