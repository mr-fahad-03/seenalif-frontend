"use client"

import { useState, useEffect } from "react"
import { X, Download, Smartphone, Star } from "lucide-react"





const AppDownloadPopup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hasClosedPopup, setHasClosedPopup] = useState(false)

  useEffect(() => {
    // Check if user has already closed the popup in this session
    const hasClosedBefore = localStorage.getItem("appPopupClosed")

    if (!hasClosedBefore) {
      // Show popup after 10 seconds for better user experience
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setHasClosedPopup(true)
    // Remember that user has closed the popup
    localStorage.setItem("appPopupClosed", "true")
  }

  // If user has explicitly closed the popup, don't show it again
  if (hasClosedPopup) {
    return null
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
          <div className="relative max-w-md w-full bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl animate-scaleIn">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-300 hover:text-white bg-gray-800 bg-opacity-50 rounded-full p-1 z-10"
              aria-label="Close popup"
            >
              <X size={20} />
            </button>

            {/* Top decorative pattern */}
            <div className="absolute top-0 left-0 right-0 h-24 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='1' fillRule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
                  backgroundSize: "12px 12px",
                }}
              ></div>
            </div>

            {/* Content */}
            <div className="pt-12 pb-8 px-6 text-center">
              {/* App icon */}
              <div className="mx-auto w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Smartphone className="text-white" size={40} />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Download Our App</h2>
              <p className="text-gray-300 mb-4">
                Experience Watch Hub on your mobile device for a seamless shopping experience!
              </p>

              {/* Rating stars */}
              <div className="flex items-center justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
                <span className="ml-2 text-gray-300 text-sm">4.9 (2.5k+ reviews)</span>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3">
                  <p className="text-white text-sm font-medium">Exclusive Offers</p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3">
                  <p className="text-white text-sm font-medium">Faster Checkout</p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3">
                  <p className="text-white text-sm font-medium">Order Tracking</p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3">
                  <p className="text-white text-sm font-medium">Early Access</p>
                </div>
              </div>

              {/* Download button */}
              <a
                href="https://drive.google.com/file/d/1SYbjdk7IXqvIzOK2ENxT5KtfvdXDKBDe/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center"
              >
                <Download size={20} className="mr-2" />
                Download Now
              </a>

              {/* Maybe later link */}
              <button onClick={handleClose} className="mt-4 text-gray-400 hover:text-gray-300 text-sm">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AppDownloadPopup
