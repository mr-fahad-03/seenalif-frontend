"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, XCircle, Package, FolderTree, MoveRight } from "lucide-react"
import axios from "axios"
import config from "../../config/config"

/**
 * SafeDeleteModal - A comprehensive deletion modal for categories and subcategories
 * 
 * Features:
 * - Multi-step warning system
 * - Product count checks
 * - Child subcategories warning
 * - Option to move products before deletion
 * - Cascading deletion support
 */
const SafeDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  item,
  type = "category" // "category", "subcategory", or "subcategory2"
}) => {
  const [step, setStep] = useState(1) // 1: Initial warning, 2: Product warning
  const [loading, setLoading] = useState(false)
  const [productCount, setProductCount] = useState(0)
  const [childCount, setChildCount] = useState(0)
  const [deletionMode, setDeletionMode] = useState(null) // "move" or "delete"

  useEffect(() => {
    if (isOpen && item) {
      fetchDeletionInfo()
    } else {
      resetModal()
    }
  }, [isOpen, item])

  const resetModal = () => {
    setStep(1)
    setProductCount(0)
    setChildCount(0)
    setDeletionMode(null)
    setLoading(false)
  }

  const fetchDeletionInfo = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      
      // Get product count and child subcategory count
      const endpoint = type === "category" 
        ? `${config.API_URL}/api/categories/${item._id}/deletion-info`
        : `${config.API_URL}/api/subcategories/${item._id}/deletion-info`
      
      const { data } = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setProductCount(data.productCount || 0)
      setChildCount(data.childCount || 0)
    } catch (error) {
      console.error("Failed to fetch deletion info:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFirstStepConfirm = () => {
    if (productCount > 0) {
      // Move to product warning step
      setStep(2)
    } else {
      // No products, proceed with deletion
      handleFinalConfirm("delete")
    }
  }

  const handleFinalConfirm = (mode) => {
    setDeletionMode(mode)
    onConfirm(item._id, mode === "move")
  }

  if (!isOpen || !item) return null

  const getTypeLabel = () => {
    if (type === "category") return "Category"
    if (type === "subcategory") return "Subcategory (Level 1)"
    if (type === "subcategory2") return "Subcategory (Level 2)"
    if (type === "subcategory3") return "Subcategory (Level 3)"
    if (type === "subcategory4") return "Subcategory (Level 4)"
    return "Subcategory"
  }

  const getChildLabel = () => {
    if (type === "category") return "subcategories"
    if (type === "subcategory3" || type === "subcategory4") return "child subcategories" // Level 3 & 4 typically have fewer/no children
    return "child subcategories"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Delete {getTypeLabel()}
              </h3>
              <p className="text-sm text-gray-500">This action requires confirmation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <>
              {/* Step 1: Initial Warning */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <FolderTree className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 mb-2">
                          You are about to delete: "{item.name}"
                        </h4>
                        
                        {childCount > 0 && (
                          <div className="mb-3 p-3 bg-yellow-100 rounded border border-yellow-300">
                            <p className="text-yellow-900 font-medium">
                              ⚠️ This {type} has {childCount} {getChildLabel()}
                            </p>
                            <p className="text-sm text-yellow-800 mt-1">
                              All {getChildLabel()} under this {type} will also be removed.
                            </p>
                          </div>
                        )}

                        {productCount > 0 && (
                          <div className="mb-3 p-3 bg-red-50 rounded border border-red-200">
                            <div className="flex items-center gap-2 text-red-900 font-medium mb-1">
                              <Package size={16} />
                              <span>{productCount} product{productCount > 1 ? 's' : ''} found</span>
                            </div>
                            <p className="text-sm text-red-800">
                              This {type} and {childCount > 0 ? 'its subcategories' : 'it'} contain{childCount > 0 ? '' : 's'} products that need to be handled.
                            </p>
                          </div>
                        )}

                        <p className="text-gray-700">
                          Are you sure you want to delete this {type}
                          {childCount > 0 ? ` and all ${childCount} ${getChildLabel()}` : ''}?
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFirstStepConfirm}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Yes, Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Product Warning */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Package className="text-red-600 flex-shrink-0 mt-1" size={20} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-2">
                          Products Found!
                        </h4>
                        
                        <div className="mb-4 p-4 bg-white rounded border border-red-200">
                          <p className="text-red-900 font-medium mb-2">
                            {productCount} product{productCount > 1 ? 's are' : ' is'} currently assigned to:
                          </p>
                          <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                            <li>"{item.name}"</li>
                            {childCount > 0 && (
                              <li>Its {childCount} {getChildLabel()}</li>
                            )}
                          </ul>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-4">
                          <p className="text-sm text-yellow-900 font-medium mb-2">
                            ⚠️ What would you like to do with these products?
                          </p>
                          <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                            <li><strong>Move Products:</strong> Reassign products to another category (recommended)</li>
                            <li><strong>Proceed with Deletion:</strong> Permanently delete all products along with this {type}</li>
                          </ul>
                        </div>

                        <p className="text-gray-700 text-sm">
                          <strong>Note:</strong> If you proceed with deletion, all {productCount} product{productCount > 1 ? 's' : ''} will be permanently deleted and cannot be recovered.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleFinalConfirm("move")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MoveRight size={16} />
                      Move Products
                    </button>
                    <button
                      onClick={() => handleFinalConfirm("delete")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      Proceed with Deletion
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SafeDeleteModal
