"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Calendar } from "lucide-react"
import axios from "axios"
import config from "../config/config"
import { getFullImageUrl } from "../utils/imageUtils"

const RelatedPosts = ({ blogId, categoryId, topicId, limit = 3 }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`${config.API_URL}/api/blogs?status=published&limit=12`)
        const list = Array.isArray(data) ? data : data.blogs || []

        const filtered = list
          .filter((b) => b?._id && b._id !== blogId)
          .filter((b) => {
            if (!categoryId && !topicId) return true
            const sameCategory = categoryId && (b.subCategory4?._id === categoryId || b.subCategory3?._id === categoryId || b.subCategory2?._id === categoryId || b.subCategory1?._id === categoryId || b.mainCategory?._id === categoryId)
            const sameTopic = topicId && b.topic?._id === topicId
            return Boolean(sameCategory || sameTopic)
          })
          .slice(0, limit)

        setItems(filtered)
      } catch (error) {
        console.error("Error fetching related posts:", error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    if (blogId) fetchRelated()
  }, [blogId, categoryId, topicId, limit])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const truncateContent = (html, maxLength = 120) => {
    const text = html?.replace(/<[^>]+>/g, "") || ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  if (loading) {
    return (
      <section className="mt-12" aria-label="Related posts">
        <h3 className="text-2xl font-bold text-gray-900">Related Posts</h3>
        <p className="mt-6 text-sm text-gray-600">Loading related posts...</p>
      </section>
    )
  }

  if (!items.length) return null

  return (
    <section className="mt-12" aria-label="Related posts">
      <h3 className="text-2xl font-bold text-gray-900">Related Posts</h3>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((post) => (
          <Link
            key={post._id}
            to={`/blog/${post.slug}`}
            className="group block"
          >
            {post.mainImage && (
              <div className="aspect-video overflow-hidden bg-gray-100">
                <img
                  src={getFullImageUrl(post.mainImage)}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
              </div>
            )}
            <div className="mt-3">
              <h4 className="font-semibold text-gray-900 text-lg leading-snug line-clamp-2 group-hover:text-lime-600 transition-colors">
                {post.title}
              </h4>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {truncateContent(post.description)}
              </p>
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <Calendar size={12} className="mr-1.5" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default RelatedPosts
