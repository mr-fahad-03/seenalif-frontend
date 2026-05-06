import { useState, useEffect } from "react"
import axios from "axios"
import { Shield, Check, ChevronRight } from "lucide-react"
import config from "../config/config"

const BuyerProtectionSection = ({
  productId,
  productPrice,
  onSelectProtection,
  selectedProtections = [],
  onProtectionsLoaded,
  compact = false,
}) => {
  const [protections, setProtections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (productId && productPrice !== undefined && productPrice !== null) {
      fetchProtections()
    }
  }, [productId, productPrice])

  const fetchProtections = async () => {
    try {
      console.log('Fetching protections for:', { productId, productPrice })
      const { data } = await axios.post(`${config.API_URL}/api/buyer-protection/for-product`, {
        productId,
        productPrice: Number(productPrice),
      })
      console.log('Received protections:', data)
      setProtections(data)
      // Notify parent about whether protections are available
      if (onProtectionsLoaded) {
        onProtectionsLoaded(data.length > 0)
      }
    } catch (error) {
      console.error("Failed to load protection plans:", error)
      if (onProtectionsLoaded) {
        onProtectionsLoaded(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleProtectionToggle = (protection) => {
    const isSelected = selectedProtections.some((p) => p._id === protection._id)
    if (isSelected) {
      // Remove protection
      onSelectProtection(selectedProtections.filter((p) => p._id !== protection._id))
    } else {
      // Add protection
      onSelectProtection([...selectedProtections, protection])
    }
  }

  const isProtectionSelected = (protectionId) => {
    return selectedProtections.some((p) => p._id === protectionId)
  }

  const getIconColor = (type) => {
    switch (type) {
      case "warranty":
        return "bg-green-100"
      case "damage_protection":
        return "bg-yellow-100"
      case "accidental_extended":
        return "bg-blue-100"
      default:
        return "bg-gray-100"
    }
  }

  const getIconTextColor = (type) => {
    switch (type) {
      case "warranty":
        return "text-green-600"
      case "damage_protection":
        return "text-yellow-600"
      case "accidental_extended":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  // Don't show loading skeleton when just checking for availability
  if (loading) {
    // If onProtectionsLoaded is provided, this is just checking availability - don't show skeleton
    if (onProtectionsLoaded) {
      return null
    }
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
        ))}
      </div>
    )
  }

  if (protections.length === 0) {
    return null
  }

  const protectionOrder = {
    accidental_extended: 0,
    warranty: 1,
    damage_protection: 2,
  }

  const protectionTypeColumns = [
    { type: "accidental_extended", title: "Accidental & Extended Warranty" },
    { type: "warranty", title: "Extended Warranty" },
    { type: "damage_protection", title: "Damage Protection" },
  ]

  const orderedProtections = [...protections].sort((a, b) => {
    const aOrder = protectionOrder[a.type] ?? 99
    const bOrder = protectionOrder[b.type] ?? 99
    return aOrder - bOrder
  })

  if (compact) {
    const groupedProtections = protectionTypeColumns
      .map((column) => ({
        ...column,
        items: orderedProtections.filter((protection) => protection.type === column.type),
      }))
      .filter((column) => column.items.length > 0)

    const compactColumnsClass =
      groupedProtections.length === 1
        ? "md:grid-cols-1"
        : groupedProtections.length === 2
          ? "md:grid-cols-2"
          : "md:grid-cols-3"

    return (
      <div className={`grid grid-cols-1 gap-2 md:items-stretch ${compactColumnsClass}`}>
        {groupedProtections.map((column) => (
          <div key={column.type} className="h-full rounded-lg border border-[#d7ddd4] bg-white p-2">
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wide text-[#505e4d]">
              {column.title}
            </p>
            <div className="space-y-2">
              {column.items.map((protection) => {
                const isSelected = isProtectionSelected(protection._id)
                return (
                  <div
                    key={protection._id}
                    onClick={() => handleProtectionToggle(protection)}
                    className={`
                      relative h-full border rounded-lg p-2 cursor-pointer transition-all duration-200
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-[#e1e6de] hover:border-blue-300 bg-white"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-md ${getIconColor(protection.type)} flex-shrink-0`}>
                        <Shield size={16} className={getIconTextColor(protection.type)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{protection.duration}</p>
                        <h4 className="truncate text-xs font-semibold text-gray-900">{protection.name}</h4>
                        <p className="text-sm font-bold text-gray-900">
                          AED {((protection.calculatedPrice !== undefined ? protection.calculatedPrice : protection.price) || 0).toFixed(2)}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="rounded-full bg-blue-500 p-1">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orderedProtections.map((protection) => {
        const isSelected = isProtectionSelected(protection._id)
        return (
          <div
            key={protection._id}
            onClick={() => handleProtectionToggle(protection)}
            className={`
              relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200
              ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white"
              }
            `}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left: Icon and Duration */}
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg ${getIconColor(protection.type)} flex-shrink-0`}>
                  <Shield size={24} className={getIconTextColor(protection.type)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-gray-900">{protection.duration}</span>
                    {isSelected && (
                      <div className="bg-blue-500 rounded-full p-1">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">{protection.name}</h4>

                  {/* Features List */}
                  <div className="space-y-1">
                    {protection.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {protection.description && (
                    <p className="text-xs text-gray-500 mt-2 italic">{protection.description}</p>
                  )}
                </div>
              </div>

              {/* Right: Price and Button */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    AED {((protection.calculatedPrice !== undefined ? protection.calculatedPrice : protection.price) || 0).toFixed(2)}
                  </div>
                  {protection.pricingType === "percentage" && protection.pricePercentage && (
                    <div className="text-xs text-gray-500">{protection.pricePercentage}% of price</div>
                  )}
                </div>
                <button
                  type="button"
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      isSelected
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                    }
                  `}
                >
                  {isSelected ? "SELECTED" : "SELECT"}
                </button>
              </div>
            </div>

            {/* Chevron indicator for more details */}
            {protection.features.length > 3 && (
              <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  View all {protection.features.length} benefits
                  <ChevronRight size={12} />
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default BuyerProtectionSection
