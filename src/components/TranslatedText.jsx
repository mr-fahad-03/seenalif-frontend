"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "../context/LanguageContext"
import { getCachedTranslation } from "../LanguageModel/translationService"
import { uiDictionary } from "../LanguageModel/uiDictionary"

/**
 * TranslatedText - Component that translates text
 * Uses database fields, shared dictionary, and Model API fallback
 * OPTIMIZED: Synchronous lookup for DB/Dictionary, background for API
 */
const TranslatedText = ({ 
  text, 
  children,
  sourceDoc = null, // Pass the original object (e.g., product, category)
  fieldName = null, // The field name to look for (e.g., 'name', 'description')
  fallback = null, 
  className = "", 
  as: Component = "span",
  skipTranslation = false,
  useModelOnly = false // Force use of translation model (skip dictionary)
}) => {
  const { currentLanguage, translate } = useLanguage()
  const sourceText = text ?? (typeof children === "string" ? children : null)
  const sourceTextString = typeof sourceText === "string" ? sourceText : null
  const [apiTranslation, setApiTranslation] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const mountedRef = useRef(true)
  const translationRequestedRef = useRef(false)
  
  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // 1. Priority 0: Check if we have a pre-translated field in the document (INSTANT)
  const getPreTranslatedField = () => {
    if (currentLanguage.code !== "ar" || !sourceDoc || !fieldName) return null;
    
    // Check for common patterns: fieldNameAr (e.g., nameAr)
    const arField = `${fieldName}Ar`;
    if (sourceDoc[arField]) {
      return sourceDoc[arField];
    }
    
    // Check if the fieldName itself is already Arabic (if fieldName was passed as 'nameAr')
    if (fieldName.endsWith('Ar') && sourceDoc[fieldName]) {
      return sourceDoc[fieldName];
    }

    return null;
  };

  const dbTranslation = getPreTranslatedField();
  
  // 2. Priority 1: Check shared dictionary synchronously (INSTANT)
  const getDictionaryTranslation = () => {
    if (dbTranslation) return null; // Already have DB translation
    if (!sourceTextString || currentLanguage.code === "en" || skipTranslation || useModelOnly) {
      return null
    }
    const translation = uiDictionary[sourceTextString] || uiDictionary[sourceTextString.trim()] || null
    return translation
  }

  const dictTranslation = getDictionaryTranslation()
  
  // 3. Priority 2: Check if already cached in translation service (INSTANT)
  const getCachedApiTranslation = () => {
    if (dbTranslation || dictTranslation) return null; // Already handled
    if (!sourceTextString || currentLanguage.code === "en" || skipTranslation) {
      return null
    }
    return getCachedTranslation(sourceTextString, 'en-ar')
  }

  // 4. Priority 3: Dynamic content (BACKGROUND FALLBACK)
  useEffect(() => {
    const fetchTranslation = async () => {
      // Skip if we already have a translation or don't need one
      if (currentLanguage.code === "en" || !sourceTextString || skipTranslation || dbTranslation || dictTranslation) {
        setApiTranslation(null)
        translationRequestedRef.current = false
        return
      }
      
      // Check if already cached
      const cached = getCachedTranslation(sourceTextString, 'en-ar')
      if (cached) {
        if (mountedRef.current) {
          setApiTranslation(cached)
        }
        return
      }

      // Prevent duplicate requests for same text
      if (translationRequestedRef.current) {
        return
      }
      
      translationRequestedRef.current = true
      setIsTranslating(true)
      
      try {
        // This will be batched automatically by translationService
        const translated = await translate(sourceTextString, currentLanguage.code)
        if (mountedRef.current && translated && translated !== sourceTextString) {
          setApiTranslation(translated)
        }
      } catch (error) {
        console.error("Translation API error:", error)
      } finally {
        if (mountedRef.current) {
          setIsTranslating(false)
          translationRequestedRef.current = false
        }
      }
    }

    fetchTranslation()
  }, [sourceTextString, currentLanguage.code, dbTranslation, dictTranslation, skipTranslation, translate])

  // Determine what to display
  let displayText = sourceText
  if (currentLanguage.code === "ar" && !skipTranslation) {
    if (dbTranslation) {
      displayText = dbTranslation
    } else if (dictTranslation) {
      displayText = dictTranslation
    } else {
      // Check cache first for immediate display
      const cached = getCachedApiTranslation()
      if (cached) {
        displayText = cached
      } else if (apiTranslation) {
        displayText = apiTranslation
      }
    }
  }

  const safeDisplayText =
    typeof displayText === "string" || typeof displayText === "number"
      ? displayText
      : (fallback ?? "")

  // If children is not a string and no text provided, render children directly
  if (typeof children !== 'string' && !text) {
    return <Component className={className}>{children}</Component>
  }

  return (
    <Component className={className} dir={currentLanguage.code === 'ar' ? 'rtl' : 'ltr'}>
      {safeDisplayText}
    </Component>
  )
}

TranslatedText.displayName = 'TranslatedText'

export default TranslatedText
