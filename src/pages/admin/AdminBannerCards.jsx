"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { FaEdit, FaTrash, FaPlus, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import config from "../../config/config"
import { getFullImageUrl } from "../../utils/imageUtils"

const AdminBannerCards = () => {
  const [bannerCards, setBannerCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [cardsPerPage] = useState(10)
  const [homeSections, setHomeSections] = useState([])
  const [sectionsLoading, setSectionsLoading] = useState(true)
  const [savingSections, setSavingSections] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const [sectionCards, setSectionCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(false)
  const scrollContainerRef = useRef(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchHomeSections()
  }, [])

  const fetchBannerCards = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")

      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        setLoading(false)
        return
      }

      const response = await fetch(`${config.API_URL}/api/banner-cards/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBannerCards(data)
      } else if (response.status === 401) {
        showToast("Authentication failed. Please login again.", "error")
      } else {
        showToast("Failed to load banner cards. Please try again later.", "error")
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching banner cards:", error)
      showToast("Failed to load banner cards. Please try again later.", "error")
      setLoading(false)
    }
  }

  const fetchHomeSections = async () => {
    try {
      setSectionsLoading(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${config.API_URL}/api/home-sections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHomeSections(data)
      } else {
        showToast("Failed to load home sections", "error")
      }
    } catch (error) {
      console.error("Error fetching home sections:", error)
      showToast("Failed to load home sections", "error")
    } finally {
      setSectionsLoading(false)
    }
  }

  const fetchSectionCards = async (sectionSlug) => {
    try {
      setCardsLoading(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${config.API_URL}/api/banner-cards/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Filter cards by section slug
        const filtered = data.filter(card => card.section === sectionSlug)
        setSectionCards(filtered)
      } else {
        showToast("Failed to load cards", "error")
      }
    } catch (error) {
      console.error("Error fetching section cards:", error)
      showToast("Failed to load cards", "error")
    } finally {
      setCardsLoading(false)
    }
  }

  const handleSectionClick = (section) => {
    setSelectedSection(section)
    fetchSectionCards(section.slug)
  }

  const handleSectionToggle = async (sectionId) => {
    try {
      setSavingSections(true)
      const token = localStorage.getItem("adminToken")

      const section = homeSections.find(s => s._id === sectionId)
      const newStatus = !section.isActive

      const response = await fetch(`${config.API_URL}/api/home-sections/${sectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: newStatus,
        }),
      })

      if (response.ok) {
        const updatedSection = await response.json()
        setHomeSections(homeSections.map(s => 
          s._id === sectionId ? updatedSection : s
        ))
        showToast(
          `Section ${newStatus ? "activated" : "deactivated"} successfully`,
          "success"
        )
      } else {
        showToast("Failed to update section status", "error")
      }
    } catch (error) {
      console.error("Error updating section status:", error)
      showToast("Failed to update section status", "error")
    } finally {
      setSavingSections(false)
    }
  }

  const scrollSections = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const newScrollPosition = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      })
    }
  }

  const deleteBannerCard = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner card?")) {
      try {
        const token = localStorage.getItem("adminToken")
        const response = await fetch(`${config.API_URL}/api/banner-cards/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setSectionCards(sectionCards.filter((card) => card._id !== id))
          showToast("Banner card deleted successfully", "success")
        } else {
          showToast("Failed to delete banner card", "error")
        }
      } catch (error) {
        console.error("Error deleting banner card:", error)
        showToast("Error deleting banner card", "error")
      }
    }
  }

  const handleToggleStatus = async (cardId) => {
    try {
      const token = localStorage.getItem("adminToken")

      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      const card = sectionCards.find((c) => c._id === cardId)
      if (!card) return

      const newStatus = !card.isActive

      const response = await fetch(`${config.API_URL}/api/banner-cards/${cardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        setSectionCards(
          sectionCards.map((c) =>
            c._id === cardId ? { ...c, isActive: newStatus } : c
          )
        )
        showToast(
          `Banner card ${newStatus ? "activated" : "deactivated"} successfully`,
          "success"
        )
      } else {
        showToast("Failed to update banner card status", "error")
      }
    } catch (error) {
      console.error("Failed to toggle banner card status:", error)
      showToast("Failed to update banner card status", "error")
    }
  }

  const filteredCards = sectionCards.filter((card) =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const indexOfLastCard = currentPage * cardsPerPage
  const indexOfFirstCard = indexOfLastCard - cardsPerPage
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard)
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const getSectionLabel = (section) => {
    const labels = {
      "home-category-cards": "CategoryCards",
      "home-brands-cards": "BrandsCards",
      "home-products-cards": "ProductsCards",
      "home-flash-sale-cards": "FlashSaleCards",
      "home-limited-sale-cards": "LimitedSaleCards",
    }
    return labels[section] || section
  }

  const getSectionTypeName = (type) => {
    const types = {
      "arrow-slider": "Arrow Slider",
      "background-image": "Background Image",
      "cards-left-image-right": "Cards Left + Image Right",
      "cards-right-image-left": "Cards Right + Image Left",
      "simple-cards": "Simple Cards",
      "vertical-grid": "Vertical Grid",
    }
    return types[type] || type
  }

  const renderLayoutPreview = () => {
    if (!selectedSection) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-sm text-gray-500">
          Select a section to preview its layout before activating it on the front page.
        </div>
      )
    }

    const commonCard = (label) => (
      <div className="flex-1 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 text-center">
        {label}
      </div>
    )

    switch (selectedSection.sectionType) {
      case "arrow-slider":
        const cardsCount = selectedSection.settings?.cardsCount || 5
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-700">Arrow Slider Preview ({cardsCount} cards)</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-full text-blue-600 font-semibold text-lg">⇦</div>
              <div className="flex-1 flex gap-3">
                {Array.from({ length: cardsCount }).map((_, idx) => commonCard(`Card ${idx + 1}`))}
              </div>
              <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-full text-blue-600 font-semibold text-lg">⇨</div>
            </div>
            <p className="text-xs text-gray-500">Horizontal slider with navigation arrows showing {cardsCount} cards.</p>
          </div>
        )
      case "background-image":
        const bgCardsCount = selectedSection.settings?.cardsCount || 5
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Background Image Preview ({bgCardsCount} cards)</div>
            <div className="relative h-40 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-teal-400">
              <div className="absolute inset-0 opacity-25 bg-black"></div>
              <div className="relative z-10 text-white text-sm font-medium px-4 py-3">
                <div className="min-h-[80px] flex flex-col justify-between">
                  <span>{bgCardsCount} cards stacked over a full-bleed background image with overlay.</span>
                  <div className="flex gap-2 pt-2">
                    {Array.from({ length: bgCardsCount }).map((_, idx) => (
                      <div key={idx} className="flex-1 bg-white/30 backdrop-blur-sm rounded-lg h-10 border border-white/40 flex items-center justify-center text-xs font-semibold">
                        Card {idx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "cards-left-image-right":
      case "cards-right-image-left":
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">{getSectionTypeName(selectedSection.sectionType)} Preview</div>
            <div className="grid grid-cols-12 gap-3 h-36">
              {selectedSection.sectionType === "cards-right-image-left" && (
                <div className="col-span-4 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">Image</div>
              )}
              <div className="col-span-8 grid grid-cols-3 gap-2">
                {commonCard("Card A")}
                {commonCard("Card B")}
                {commonCard("Card C")}
              </div>
              {selectedSection.sectionType === "cards-left-image-right" && (
                <div className="col-span-4 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">Image</div>
              )}
            </div>
          </div>
        )
      case "simple-cards":
        const simpleCardsCount = selectedSection.settings?.cardsCount || 5
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Simple Cards Preview ({simpleCardsCount} cards)</div>
            <div className="flex gap-3">
              {Array.from({ length: simpleCardsCount }).map((_, idx) => (
                <div key={idx} className="flex-1 bg-gray-100 rounded-lg h-16 flex items-center justify-center text-xs text-gray-600">
                  Card {idx + 1}
                </div>
              ))}
            </div>
          </div>
        )
      case "vertical-grid":
        const cardsPerRow = selectedSection.settings?.cardsPerRow || 4
        // Show 2 rows as example (8 cards if 4 per row, 6 cards if 3 per row, etc.)
        const exampleCardsCount = cardsPerRow * 2
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Vertical Grid Preview ({cardsPerRow} cards per row)</div>
            <div className="space-y-3">
              {/* First Row */}
              <div className="flex gap-3">
                {Array.from({ length: cardsPerRow }).map((_, idx) => (
                  <div key={idx} className="flex-1 bg-gray-100 rounded-lg h-16 flex items-center justify-center text-xs text-gray-600">
                    Card {idx + 1}
                  </div>
                ))}
              </div>
              {/* Second Row */}
              <div className="flex gap-3">
                {Array.from({ length: cardsPerRow }).map((_, idx) => (
                  <div key={idx + cardsPerRow} className="flex-1 bg-gray-100 rounded-lg h-16 flex items-center justify-center text-xs text-gray-600">
                    Card {idx + cardsPerRow + 1}
                  </div>
                ))}
              </div>
              {/* Indicator for more rows */}
              <div className="text-center">
                <span className="text-xs text-gray-400 italic">... more rows will appear as you add more cards ...</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Cards automatically wrap to new rows. Add as many cards as you need.</p>
          </div>
        )
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-sm text-gray-500">
            {getSectionTypeName(selectedSection.sectionType)} will render here once activated.
          </div>
        )
    }
  }

  const totalSections = homeSections.length
  const activeSections = homeSections.filter(section => section.isActive).length
  const inactiveSections = Math.max(0, totalSections - activeSections)

  if (sectionsLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <AdminSidebar />
      <div className="flex-1 ml-64 overflow-x-hidden">
        <div className="p-8 overflow-x-hidden">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Home Page Sections</h1>
            <Link
              to="/admin/home-sections/add"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Section
            </Link>
          </div>

          {/* Home Sections Status */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">All Sections</h2>
              <span className="text-sm text-gray-500">Click on a section to view its cards</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span>All sections: <strong className="text-gray-800">{totalSections}</strong></span>
              <span>Active: <strong className="text-emerald-600">{activeSections}</strong></span>
              <span>Inactive: <strong className="text-red-600">{inactiveSections}</strong></span>
            </div>

            {homeSections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sections found. Create your first section!
              </div>
            ) : (
              <div className="relative overflow-hidden">
                {/* Scroll Buttons */}
                <button
                  onClick={() => scrollSections('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-colors"
                  aria-label="Scroll left"
                >
                  <FaChevronLeft className="text-gray-600" />
                </button>
                <button
                  onClick={() => scrollSections('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-colors"
                  aria-label="Scroll right"
                >
                  <FaChevronRight className="text-gray-600" />
                </button>

                {/* Scrollable Container */}
                <div
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-1"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {homeSections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <div
                        key={section._id}
                        onClick={() => handleSectionClick(section)}
                        className={`flex-shrink-0 border-2 rounded-lg p-4 transition-all cursor-pointer flex flex-col justify-between ${
                          selectedSection?._id === section._id
                            ? "border-blue-500 bg-blue-50 shadow-lg"
                            : section.isActive
                            ? "border-green-500 bg-green-50 hover:shadow-md"
                            : "border-gray-300 bg-gray-50 hover:shadow-md"
                        }`}
                        style={{ minWidth: '280px', maxWidth: '280px', height: '180px' }}
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex-1 overflow-hidden">
                            <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                              {section.name}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                              {section.description || "No description"}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                {getSectionTypeName(section.sectionType)}
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                                Position: #{section.order}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSectionToggle(section._id)
                                }}
                                disabled={savingSections}
                                className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                                  section.isActive
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                } disabled:opacity-50`}
                              >
                                {section.isActive ? "Active" : "Inactive"}
                              </button>
                              <Link
                                to={`/admin/home-sections/edit/${section._id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition-colors"
                              >
                                <FaEdit className="inline" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Layout Preview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Layout Preview</h2>
              {selectedSection && (
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {getSectionTypeName(selectedSection.sectionType)} · {selectedSection.isActive ? "Active" : "Inactive"}
                </span>
              )}
            </div>
            {renderLayoutPreview()}
          </div>

          {/* Section Cards Table - Show only when a section is selected */}
          {selectedSection && (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedSection.name} - Cards
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage cards for this section
                  </p>
                </div>
                <Link
                  to={`/admin/banner-cards/add?section=${selectedSection.slug}`}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  Add Card to This Section
                </Link>
              </div>

              {/* Search Bar */}
              <div className="mb-6 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cards in this section..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Banner Cards Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {cardsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Image
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCards.length > 0 ? (
                          filteredCards.map((card) => (
                            <tr key={card._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <img
                                  src={getFullImageUrl(card.image || card.bgImage)}
                                  alt={card.name}
                                  className="h-12 w-12 rounded object-cover"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {card.name}
                                </div>
                                <div className="text-sm text-gray-500">{card.slug}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">{card.order}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleToggleStatus(card._id)}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    card.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {card.isActive ? "Active" : "Inactive"}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link
                                  to={`/admin/banner-cards/edit/${card._id}`}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  <FaEdit className="inline" /> Edit
                                </Link>
                                <button
                                  onClick={() => deleteBannerCard(card._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FaTrash className="inline" /> Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              No cards found in this section. Click "Add Card" to create one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Show message when no section is selected */}
          {!selectedSection && homeSections.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 text-lg">
                Click on a section above to view and manage its cards
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminBannerCards
