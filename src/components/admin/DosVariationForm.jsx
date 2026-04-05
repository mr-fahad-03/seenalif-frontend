import { useState } from "react"
import { Plus, X, Trash2 } from "lucide-react"
import ImageUpload from "../ImageUpload"
import { getFullImageUrl } from "../../utils/imageUtils"

const DosVariationForm = ({ dosVariations = [], onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState(null)

  const dosOptions = [
    "Windows 11 Pro",
    "Windows 11 Home",
    "Windows 10 Pro",
    "Windows 10 Home",
    "DOS",
    "FreeDOS",
    "Linux",
    "Ubuntu",
    "Chrome OS",
    "macOS",
    "No OS"
  ]

  const addDosVariation = () => {
    const newVariation = {
      dosType: "",
      image: "",
      galleryImages: [],
      buyingPrice: "",
      price: "",
      offerPrice: "",
      sku: "",
      countInStock: "",
    }
    onChange([...dosVariations, newVariation])
    setExpandedIndex(dosVariations.length)
  }

  const removeDosVariation = (index) => {
    const updated = dosVariations.filter((_, i) => i !== index)
    onChange(updated)
    if (expandedIndex === index) {
      setExpandedIndex(null)
    }
  }

  const updateDosVariation = (index, field, value) => {
    const updated = [...dosVariations]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const handleGalleryImageUpload = (index, imageUrl, imgIndex) => {
    const updated = [...dosVariations]
    const galleryImages = [...(updated[index].galleryImages || [])]
    
    if (imgIndex !== undefined) {
      galleryImages[imgIndex] = imageUrl
    } else {
      galleryImages.push(imageUrl)
    }
    
    updated[index].galleryImages = galleryImages
    onChange(updated)
  }

  const removeGalleryImage = (dosIndex, imgIndex) => {
    const updated = [...dosVariations]
    updated[dosIndex].galleryImages = updated[dosIndex].galleryImages.filter((_, i) => i !== imgIndex)
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Windows or DOS Variations</h3>
        <button
          type="button"
          onClick={addDosVariation}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add OS Option
        </button>
      </div>

      {dosVariations.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Plus size={24} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Windows/DOS variations added</h3>
          <p className="text-gray-500 mb-6">
            Add different OS options with their own images, prices, and stock levels
          </p>
          <button
            type="button"
            onClick={addDosVariation}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Add First OS Option
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {dosVariations.map((variation, index) => (
            <div
              key={index}
              className="bg-white border-2 border-blue-200 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-center gap-3">
                  {variation.image && (
                    <div className="w-12 h-12 bg-white rounded border border-blue-200 overflow-hidden">
                      <img
                        src={getFullImageUrl(variation.image)}
                        alt={variation.dosType}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {variation.dosType || "Unnamed OS Option"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {variation.price ? `${parseFloat(variation.price).toFixed(2)} AED` : "No price set"}
                      {variation.sku && ` • SKU: ${variation.sku}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeDosVariation(index)
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Form */}
              {expandedIndex === index && (
                <div className="p-6 space-y-4 bg-white">
                  {/* DOS/Windows Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OS Type <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        list={`dos-options-${index}`}
                        value={variation.dosType}
                        onChange={(e) => updateDosVariation(index, "dosType", e.target.value)}
                        placeholder="e.g., Windows 11 Pro, DOS"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <datalist id={`dos-options-${index}`}>
                        {dosOptions.map(dos => (
                          <option key={dos} value={dos} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={variation.sku}
                        onChange={(e) => updateDosVariation(index, "sku", e.target.value)}
                        placeholder="e.g., LAPTOP-WIN11-256"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Buying Price (AED) <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={variation.buyingPrice || ""}
                          onChange={(e) => updateDosVariation(index, "buyingPrice", e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Your purchase cost</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Base Price (AED) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={variation.price}
                          onChange={(e) => updateDosVariation(index, "price", e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {variation.offerPrice > 0 ? "Will be shown as strikethrough" : "Regular selling price"}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Offer Price (AED) <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={variation.offerPrice || ""}
                          onChange={(e) => updateDosVariation(index, "offerPrice", e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Discounted price if on sale</p>
                      </div>
                    </div>

                    {/* Discount Preview */}
                    {variation.price > 0 && variation.offerPrice > 0 && variation.offerPrice < variation.price && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-800 font-medium">
                            💰 Discount: {Math.round(((variation.price - variation.offerPrice) / variation.price) * 100)}% OFF
                          </span>
                          <span className="text-green-700">
                            Save AED {(variation.price - variation.offerPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={variation.countInStock}
                          onChange={(e) => updateDosVariation(index, "countInStock", e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Main Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Product Image <span className="text-red-500">*</span>
                    </label>
                    <ImageUpload
                      onImageUpload={(url) => updateDosVariation(index, "image", url)}
                      existingImage={variation.image}
                    />
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gallery Images (Optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(variation.galleryImages || []).map((img, imgIndex) => (
                        <div key={imgIndex} className="relative">
                          <ImageUpload
                            onImageUpload={(url) => handleGalleryImageUpload(index, url, imgIndex)}
                            existingImage={img}
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index, imgIndex)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {(!variation.galleryImages || variation.galleryImages.length < 6) && (
                        <ImageUpload
                          onImageUpload={(url) => handleGalleryImageUpload(index, url)}
                          existingImage=""
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DosVariationForm
