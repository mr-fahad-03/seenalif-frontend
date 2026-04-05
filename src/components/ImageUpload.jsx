"use client"

import { useState } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import axios from "axios"

import config from "../config/config"
import { getFullImageUrl } from "../utils/imageUtils"

const ImageUpload = ({ onImageUpload, currentImage, label = "Upload Image", multiple = false, isBanner = false, isProduct = false }) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return

    // Validate file type for product/banner images (WebP only)
    if (isProduct || isBanner) {
      const invalidFiles = Array.from(files).filter(file => file.type !== "image/webp")
      if (invalidFiles.length > 0) {
        alert("Only WebP images are allowed. Please convert your images to WebP format.")
        return
      }
    }

    console.log("📤 Starting file upload...")
    console.log("📁 Files to upload:", files.length)

    setUploading(true)
    try {
      const token = localStorage.getItem("adminToken")
      console.log("🔐 Admin token:", token ? "Present" : "Missing")

      if (!token) {
        alert("Please login as admin first")
        return
      }

      const formData = new FormData()

      if (multiple) {
        Array.from(files).forEach((file, index) => {
          console.log(`📁 Adding file ${index + 1}:`, file.name, file.type, file.size)
          formData.append("images", file)
        })

        console.log("📤 Uploading multiple images...")
        const uploadUrl = isProduct 
          ? `${config.API_URL}/api/upload/product-images` 
          : `${config.API_URL}/api/upload/multiple`
        const { data } = await axios.post(uploadUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("✅ Multiple upload response:", data)
        onImageUpload(data.files)
      } else {
        console.log("📁 Adding single file:", files[0].name, files[0].type, files[0].size)
        formData.append("image", files[0])

        console.log("📤 Uploading single image...")
        let uploadUrl
        if (isProduct) {
          uploadUrl = `${config.API_URL}/api/upload/product-image`
        } else if (isBanner) {
          uploadUrl = `${config.API_URL}/api/upload/banner`
        } else {
          uploadUrl = `${config.API_URL}/api/upload/single`
        }
        
        const { data } = await axios.post(uploadUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("✅ Single upload response:", data)
        onImageUpload(data.url)
      }
    } catch (error) {
      console.error("❌ Upload error:", error)
      console.error("❌ Error response:", error.response?.data)
      console.error("❌ Error status:", error.response?.status)

      const errorMessage = error.response?.data?.message || error.message || "Upload failed"
      alert(`Upload failed: ${errorMessage}`)
    } finally {
      setUploading(false)
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

      {/* Current Image Preview */}
      {currentImage && !multiple && (
        <div className="relative inline-block">
          <img
            src={getFullImageUrl(currentImage) || "/placeholder.svg"}
            alt="Current"
            className="h-20 w-20 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={() => onImageUpload("")}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
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
          multiple={multiple}
          accept={(isProduct || isBanner) ? "image/webp" : "image/*"}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="space-y-2">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                {currentImage && !multiple ? (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and
                  drop
                </p>
                <p className="text-xs text-gray-500">
                  {(isProduct || isBanner) ? "WebP only, up to 10MB" : "PNG, JPG, GIF, WebP up to 10MB"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageUpload
