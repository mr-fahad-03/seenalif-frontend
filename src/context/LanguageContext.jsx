"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { 
  translateToArabic, 
  translateToEnglish, 
  getCachedTranslation,
  preloadTranslations,
  warmup,
  populateTranslationCache
} from "../LanguageModel/translationService"
import { uiDictionary } from "../LanguageModel/uiDictionary"

// Supported languages
export const LANGUAGES = {
  EN: {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    urlPrefix: "ae-en",
  },
  AR: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
    urlPrefix: "ae-ar",
  },
}

// Default language
const DEFAULT_LANGUAGE = LANGUAGES.EN

// Create context
const LanguageContext = createContext(null)

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Check localStorage first for persisted language preference
    const savedLang = localStorage.getItem("preferred-language")
    if (savedLang === "ar") {
      return LANGUAGES.AR
    }
    return DEFAULT_LANGUAGE
  })
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Detect language from URL on initial load and route changes
  useEffect(() => {
    const path = location.pathname
    const search = location.search || ""
    const hash = location.hash || ""

    // Skip language prefix logic for admin and super admin routes
    if (path.startsWith("/admin") || 
        path.startsWith("/grabiansadmin") ||
        path.startsWith("/superadmin") ||
        path.startsWith("/grabiansuperadmin")) {
      return
    }

    if (path.startsWith("/ae-ar/") || path === "/ae-ar") {
      setCurrentLanguage(LANGUAGES.AR)
      localStorage.setItem("preferred-language", "ar")
      document.documentElement.setAttribute("dir", "rtl")
      document.documentElement.setAttribute("lang", "ar")
      document.body.setAttribute("dir", "rtl")
    } else if (path.startsWith("/ae-en/") || path === "/ae-en") {
      setCurrentLanguage(LANGUAGES.EN)
      localStorage.setItem("preferred-language", "en")
      document.documentElement.setAttribute("dir", "ltr")
      document.documentElement.setAttribute("lang", "en")
      document.body.setAttribute("dir", "ltr")
    } else {
      // For paths without language prefix, redirect based on saved preference or default to English
      const savedLang = localStorage.getItem("preferred-language")
      if (savedLang === "ar") {
        // User prefers Arabic, redirect to Arabic version
        const arabicPath = `/ae-ar${path === "/" ? "" : path}`
        navigate(`${arabicPath}${search}${hash}`, { replace: true })
      } else {
        // Default to English - always redirect to /ae-en prefix
        const englishPath = `/ae-en${path === "/" ? "" : path}`
        navigate(`${englishPath}${search}${hash}`, { replace: true })
      }
    }
  }, [location.pathname, location.search, location.hash, navigate])

  // Apply direction and lang attributes whenever language changes
  useEffect(() => {
    localStorage.setItem("preferred-language", currentLanguage.code)
    document.documentElement.setAttribute("dir", currentLanguage.dir)
    document.documentElement.setAttribute("lang", currentLanguage.code)
    document.body.setAttribute("dir", currentLanguage.dir)

    // Also apply direction to main content containers
    const mainContent = document.getElementById("root")
    if (mainContent) {
      mainContent.setAttribute("dir", currentLanguage.dir)
    }
  }, [currentLanguage])

  // Optimize performance: Pre-fill translation cache with UI dictionary
  // and warmup the translation model in the background
  useEffect(() => {
    const initializeLanguageLogic = async () => {
      // 1. Immediately populate cache with UI Dictionary (Priority 1)
      // This happens instantly and ensures common UI elements switch instantly
      Object.entries(uiDictionary).forEach(([text, translation]) => {
        populateTranslationCache(text, translation, 'en-ar');
      });
      
      // 2. Background warmup for the local translation model (Priority 2)
      // We don't wait for this to finish, but it makes first dynamic translation faster
      // and warms up the server-side model if needed
      if (currentLanguage.code === 'ar') {
        // Only warmup if we are currently in Arabic or might switch to it
        // We defer this slightly to not block initial page interactivity
        setTimeout(() => {
          warmup().catch(err => console.debug("Model warmup ignored (likely already running or unavailable)"));
        }, 2000);
      }
    };

    initializeLanguageLogic();
  }, [currentLanguage.code])

  // Get the path without language prefix
  const getPathWithoutLangPrefix = useCallback((path) => {
    if (path.startsWith("/ae-en/")) {
      return path.replace("/ae-en", "") || "/"
    }
    if (path.startsWith("/ae-ar/")) {
      return path.replace("/ae-ar", "") || "/"
    }
    if (path === "/ae-en" || path === "/ae-ar") {
      return "/"
    }
    return path
  }, [])

  // Get the full path with language prefix
  const getLocalizedPath = useCallback((path, lang = currentLanguage) => {
    const cleanPath = getPathWithoutLangPrefix(path)
    const prefix = `/${lang.urlPrefix}`

    if (cleanPath === "/" || cleanPath === "") {
      return prefix
    }

    // Ensure cleanPath starts with / but avoid double slashes
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
    return `${prefix}${normalizedPath}`
  }, [currentLanguage, getPathWithoutLangPrefix])

  // Switch language function
  const switchLanguage = useCallback((langCode) => {
    const newLang = langCode === "ar" ? LANGUAGES.AR : LANGUAGES.EN
    setCurrentLanguage(newLang)

    // Get the current path and switch to the new language
    const currentPath = location.pathname
    const cleanPath = getPathWithoutLangPrefix(currentPath)
    const newPath = getLocalizedPath(cleanPath, newLang)
    const search = location.search || ""
    const hash = location.hash || ""
    const destination = `${newPath}${search}${hash}`

    console.log(`[Language Switch] ${currentPath} -> ${destination} (lang: ${langCode})`)

    // Navigate to the new language path
    navigate(destination, { replace: true })
  }, [getPathWithoutLangPrefix, getLocalizedPath, location.pathname, location.search, location.hash, navigate])

  // Translate text function using Helsinki-NLP model (uses batched queue internally)
  const translate = useCallback(async (text, targetLang = currentLanguage.code) => {
    if (!text) return text

    // Check local cache first (from translationService)
    const direction = targetLang === 'ar' ? 'en-ar' : 'ar-en';
    const cached = getCachedTranslation(text, direction);
    if (cached) {
      return cached;
    }

    try {
      if (targetLang === "ar") {
        return await translateToArabic(text)
      }
      return await translateToEnglish(text)
    } catch (error) {
      console.error("Translation error:", error)
      return text
    }
  }, [currentLanguage.code])

  // Batch translate function - optimized to use preloadTranslations
  const translateBatch = useCallback(async (texts, targetLang = currentLanguage.code) => {
    if (!texts || texts.length === 0) return [];
    
    // Use preloadTranslations which batches efficiently
    await preloadTranslations(texts, targetLang);
    
    // All texts should now be cached, retrieve them
    const direction = targetLang === 'ar' ? 'en-ar' : 'ar-en';
    return texts.map(text => getCachedTranslation(text, direction) || text);
  }, [currentLanguage.code])

  const value = {
    currentLanguage,
    setCurrentLanguage,
    switchLanguage,
    translate,
    translateBatch,
    isLoading,
    isRTL: currentLanguage.dir === "rtl",
    isArabic: currentLanguage.code === "ar",
    isEnglish: currentLanguage.code === "en",
    getLocalizedPath,
    getPathWithoutLangPrefix,
    languages: LANGUAGES,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export default LanguageContext
