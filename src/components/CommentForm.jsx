import { useState } from "react"
import { useToast } from "../context/ToastContext"
import axios from "axios"
import config from "../config/config"

const CommentForm = ({ blogId, onCommentSubmitted }) => {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    comment: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name.trim()) {
      showToast("Please enter your name", "error")
      return
    }
    if (!formData.email.trim()) {
      showToast("Please enter your email", "error")
      return
    }
    if (!formData.comment.trim()) {
      showToast("Please enter your comment", "error")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showToast("Please enter a valid email address", "error")
      return
    }

    try {
      setIsSubmitting(true)

      const commentData = {
        blog: blogId,
        name: formData.name,
        email: formData.email,
        comment: formData.comment,
      }

      // Add website only if provided
      if (formData.website.trim()) {
        commentData.website = formData.website
      }

      await axios.post(`${config.API_URL}/api/blog-comments`, commentData)

      showToast(
        "Your comment has been submitted and is awaiting moderation. Thank you!",
        "success"
      )

      // Reset form
      setFormData({
        name: "",
        email: "",
        website: "",
        comment: "",
      })

      // Notify parent component
      if (onCommentSubmitted) {
        onCommentSubmitted()
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      showToast(
        error.response?.data?.message || "Failed to submit comment. Please try again.",
        "error"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all outline-none"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all outline-none"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-semibold text-gray-900 mb-2">
            Website <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all outline-none"
            placeholder="https://yourwebsite.com"
          />
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-semibold text-gray-900 mb-2">
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows="6"
            className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all outline-none resize-y"
            placeholder="Write your comment here..."
            required
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              px-8 py-3 bg-lime-500 text-white font-bold
              transition-all duration-200
              ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-lime-600"
              }
            `}
          >
            {isSubmitting ? "Submitting..." : "Post Comment"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CommentForm
