"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage, LANGUAGES } from "../context/LanguageContext"
import { ChevronDown, Globe } from "lucide-react"

const LanguageSelector = ({ variant = "default", className = "" }) => {
  const { currentLanguage, switchLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode) => {
    switchLanguage(langCode)
    setIsOpen(false)
  }

  const languages = [LANGUAGES.EN, LANGUAGES.AR]

  // Compact variant for navbar
  if (variant === "compact") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors text-sm"
          aria-label="Select language"
        >
          <Globe className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">
            {currentLanguage.code.toUpperCase()}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                  currentLanguage.code === lang.code ? 'bg-lime-50 text-lime-700' : 'text-gray-700'
                }`}
              >
                <span className={`text-sm font-medium ${lang.dir === 'rtl' ? 'font-arabic' : ''}`}>
                  {lang.nativeName}
                </span>
                {currentLanguage.code === lang.code && (
                  <span className="ml-auto text-lime-500">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Default full variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-700">
          {currentLanguage.nativeName}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[180px] overflow-hidden">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  currentLanguage.code === lang.code ? 'bg-lime-50' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${
                    currentLanguage.code === lang.code ? 'text-lime-700' : 'text-gray-800'
                  } ${lang.dir === 'rtl' ? 'font-arabic' : ''}`}>
                    {lang.nativeName}
                  </span>
                  <span className="text-xs text-gray-500">{lang.name}</span>
                </div>
                {currentLanguage.code === lang.code && (
                  <span className="text-lime-500 text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
