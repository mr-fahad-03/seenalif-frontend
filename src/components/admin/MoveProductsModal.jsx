"use client"

import { useState, useEffect } from "react"
import { X, MoveRight, Loader } from "lucide-react"
import axios from "axios"
import config from "../../config/config"

const MoveProductsModal = ({ isOpen, onClose, selectedCount, onMove }) => {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [selectedParentCategory, setSelectedParentCategory] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubCategory2, setSelectedSubCategory2] = useState("")
  const [selectedSubCategory3, setSelectedSubCategory3] = useState("")
  const [selectedSubCategory4, setSelectedSubCategory4] = useState("")

  const [level1Options, setLevel1Options] = useState([])
  const [level2Options, setLevel2Options] = useState([])
  const [level3Options, setLevel3Options] = useState([])
  const [level4Options, setLevel4Options] = useState([])

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      fetchSubcategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      const { data } = await axios.get(`${config.API_URL}/api/categories/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchSubcategories = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      const { data } = await axios.get(`${config.API_URL}/api/subcategories/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSubcategories(data)
    } catch (error) {
      console.error("Error fetching subcategories:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter subcategories by parent category and level
  useEffect(() => {
    if (selectedParentCategory) {
      const filtered = subcategories.filter(
        (sub) => {
          if (!sub.category) return false
          const categoryId = typeof sub.category === 'object' ? sub.category._id : sub.category
          return categoryId === selectedParentCategory && 
            sub.level === 1 && 
            !sub.parentSubCategory
        }
      )
      setLevel1Options(filtered)
    } else {
      setLevel1Options([])
    }
    setSelectedCategory("")
    setSelectedSubCategory2("")
    setSelectedSubCategory3("")
    setSelectedSubCategory4("")
  }, [selectedParentCategory, subcategories])

  useEffect(() => {
    if (selectedCategory) {
      const filtered = subcategories.filter(
        (sub) => {
          if (!sub.parentSubCategory) return false
          const parentId = typeof sub.parentSubCategory === 'object' ? sub.parentSubCategory?._id : sub.parentSubCategory
          return parentId === selectedCategory && sub.level === 2
        }
      )
      setLevel2Options(filtered)
    } else {
      setLevel2Options([])
    }
    setSelectedSubCategory2("")
    setSelectedSubCategory3("")
    setSelectedSubCategory4("")
  }, [selectedCategory, subcategories])

  useEffect(() => {
    if (selectedSubCategory2) {
      const filtered = subcategories.filter(
        (sub) => {
          if (!sub.parentSubCategory) return false
          const parentId = typeof sub.parentSubCategory === 'object' ? sub.parentSubCategory?._id : sub.parentSubCategory
          return parentId === selectedSubCategory2 && sub.level === 3
        }
      )
      setLevel3Options(filtered)
    } else {
      setLevel3Options([])
    }
    setSelectedSubCategory3("")
    setSelectedSubCategory4("")
  }, [selectedSubCategory2, subcategories])

  useEffect(() => {
    if (selectedSubCategory3) {
      const filtered = subcategories.filter(
        (sub) => {
          if (!sub.parentSubCategory) return false
          const parentId = typeof sub.parentSubCategory === 'object' ? sub.parentSubCategory?._id : sub.parentSubCategory
          return parentId === selectedSubCategory3 && sub.level === 4
        }
      )
      setLevel4Options(filtered)
    } else {
      setLevel4Options([])
    }
    setSelectedSubCategory4("")
  }, [selectedSubCategory3, subcategories])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedParentCategory) {
      alert("Please select a parent category")
      return
    }

    setSubmitting(true)

    try {
      await onMove({
        parentCategory: selectedParentCategory,
        category: selectedCategory || null,
        subCategory2: selectedSubCategory2 || null,
        subCategory3: selectedSubCategory3 || null,
        subCategory4: selectedSubCategory4 || null,
      })

      // Reset form
      setSelectedParentCategory("")
      setSelectedCategory("")
      setSelectedSubCategory2("")
      setSelectedSubCategory3("")
      setSelectedSubCategory4("")
      onClose()
    } catch (error) {
      console.error("Error moving products:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Move Products</h2>
            <p className="text-sm text-gray-600 mt-1">
              Moving {selectedCount} product{selectedCount !== 1 ? "s" : ""} to new categories
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Parent Category (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Category <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedParentCategory}
              onChange={(e) => setSelectedParentCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Parent Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Level 1 */}
          {selectedParentCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory Level 1 (Optional)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || level1Options.length === 0}
              >
                <option value="">None</option>
                {level1Options.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              {level1Options.length === 0 && !loading && (
                <p className="text-xs text-gray-500 mt-1">No level 1 subcategories available</p>
              )}
            </div>
          )}

          {/* Subcategory Level 2 */}
          {selectedCategory && level2Options.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory Level 2 (Optional)
              </label>
              <select
                value={selectedSubCategory2}
                onChange={(e) => setSelectedSubCategory2(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None</option>
                {level2Options.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subcategory Level 3 */}
          {selectedSubCategory2 && level3Options.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory Level 3 (Optional)
              </label>
              <select
                value={selectedSubCategory3}
                onChange={(e) => setSelectedSubCategory3(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None</option>
                {level3Options.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subcategory Level 4 */}
          {selectedSubCategory3 && level4Options.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory Level 4 (Optional)
              </label>
              <select
                value={selectedSubCategory4}
                onChange={(e) => setSelectedSubCategory4(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None</option>
                {level4Options.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Summary */}
          {selectedParentCategory && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Move Summary:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Parent Category:{" "}
                  <span className="font-medium">
                    {categories.find((c) => c._id === selectedParentCategory)?.name}
                  </span>
                </li>
                {selectedCategory && (
                  <li>
                    • Level 1:{" "}
                    <span className="font-medium">
                      {level1Options.find((s) => s._id === selectedCategory)?.name}
                    </span>
                  </li>
                )}
                {selectedSubCategory2 && (
                  <li>
                    • Level 2:{" "}
                    <span className="font-medium">
                      {level2Options.find((s) => s._id === selectedSubCategory2)?.name}
                    </span>
                  </li>
                )}
                {selectedSubCategory3 && (
                  <li>
                    • Level 3:{" "}
                    <span className="font-medium">
                      {level3Options.find((s) => s._id === selectedSubCategory3)?.name}
                    </span>
                  </li>
                )}
                {selectedSubCategory4 && (
                  <li>
                    • Level 4:{" "}
                    <span className="font-medium">
                      {level4Options.find((s) => s._id === selectedSubCategory4)?.name}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedParentCategory || submitting}
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>Moving...</span>
                </>
              ) : (
                <>
                  <MoveRight size={18} />
                  <span>Move Products</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MoveProductsModal
