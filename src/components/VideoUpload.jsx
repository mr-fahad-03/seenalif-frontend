"use client"

import { useState } from "react"
import { Upload, X, Video } from "lucide-react"
import axios from "axios"

import config from "../config/config"
import { getFullImageUrl } from "../utils/imageUtils"

const VideoUpload = ({ onVideoUpload, currentVideo, label = "Upload Video" }) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file (MP4 or WebM)")
      return
    }

    if (file.type !== "video/mp4" && file.type !== "video/webm") {
      alert("Only MP4 and WebM video formats are allowed")
      return
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      alert("Video file size must be less than 100MB")
      return
    }

    console.log("📤 Starting video upload...")
    console.log("📁 Video to upload:", file.name, file.type, file.size)

    setUploading(true)
    setUploadProgress(0)

    try {
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        alert("Please login as admin first")
        return
      }

      const formData = new FormData()
      formData.append("video", file)

      console.log("📤 Uploading video...")
      const { data } = await axios.post(`${config.API_URL}/api/upload/video`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
          console.log(`📊 Upload progress: ${percentCompleted}%`)
        },
      })

      console.log("✅ Video upload response:", data)
      onVideoUpload(data.url)
    } catch (error) {
      console.error("❌ Video upload error:", error)
      console.error("❌ Error response:", error.response?.data)

      const errorMessage = error.response?.data?.message || error.message || "Upload failed"
      alert(`Video upload failed: ${errorMessage}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Current Video Preview */}
      {currentVideo && (
        <div className="relative inline-block w-full max-w-md">
          <video
            src={getFullImageUrl(currentVideo)}
            controls
            className="w-full h-48 object-contain rounded-lg border bg-black"
          />
          <button
            type="button"
            onClick={() => onVideoUpload("")}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg z-10"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-purple-500 bg-purple-50"
            : uploading
              ? "border-gray-300 bg-gray-50"
              : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/mp4,video/webm"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="space-y-2">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Uploading video... {uploadProgress}%</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <Video className="h-12 w-12 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-purple-600 hover:text-purple-500">Click to upload</span> or drag and
                  drop
                </p>
                <p className="text-xs text-gray-500">MP4 or WebM up to 100MB</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoUpload
