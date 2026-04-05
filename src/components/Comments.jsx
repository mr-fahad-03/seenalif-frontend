"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import config from "../config/config"
import CommentForm from "./CommentForm"

const Comments = ({ blogId, blogTitle }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!blogId) return

    const fetchComments = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`${config.API_URL}/api/blog-comments/blog/${blogId}`)
        setComments(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching comments:", error)
        setComments([])
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [blogId])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <section aria-label={`Comments for ${blogTitle || "this post"}`} className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900">Comments</h3>
      <div className="mt-6 border-t border-gray-200" />

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">Loading comments...</p>
      ) : comments.length > 0 ? (
        <div className="mt-6 space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="pb-6 border-b border-gray-200 last:border-b-0">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {(comment.name || "A").charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{comment.name}</h4>
                    <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>

                  <p className="text-gray-700 leading-relaxed">{comment.comment}</p>

                  {comment.adminReply && (
                    <div className="mt-4 pl-4 border-l-4 border-lime-500 bg-lime-50 p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Admin Reply:</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{comment.adminReply}</p>
                    </div>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-6 space-y-4 border-l-2 border-gray-200">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {(reply.name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h5 className="font-semibold text-gray-900 text-sm">{reply.name}</h5>
                              <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{reply.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-600">No comments yet. Be the first to comment.</p>
      )}

      <div className="mt-10">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Leave a Comment</h3>
        <p className="text-sm text-gray-600 mb-6">
          Your email address will not be published. Required fields are marked *
        </p>
        <CommentForm blogId={blogId} />
      </div>
    </section>
  )
}

export default Comments
