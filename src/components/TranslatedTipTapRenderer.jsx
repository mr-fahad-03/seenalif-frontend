"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "../context/LanguageContext"
import { batchTranslate } from "../LanguageModel/translationService"
import './TipTapRenderer.css'
import './TipTapEditor.css'

const HTML_TRANSLATION_CACHE = new Map()
const HTML_TRANSLATION_IN_FLIGHT = new Map()
const HTML_CACHE_LIMIT = 200
const MAX_TRANSLATION_RETRIES = 2
const RETRY_DELAY_MS = 300
const SKIP_PARENT_TAGS = new Set(["CODE", "PRE", "KBD", "SAMP", "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "OPTION"])

const buildCacheKey = (content, languageCode) => {
  const head = content.slice(0, 120)
  const tail = content.slice(-120)
  return `tiptap_${languageCode}_${content.length}_${head}_${tail}`
}

const resolveArabicLanguageCode = (languageCode) => {
  if (!languageCode) return "ar"
  const normalized = String(languageCode).trim().toLowerCase()
  if (normalized === "ar" || normalized === "ae-ar" || normalized.endsWith("-ar") || normalized.includes("arab")) {
    return "ar"
  }
  return normalized
}

const setHtmlCache = (key, value) => {
  if (HTML_TRANSLATION_CACHE.size >= HTML_CACHE_LIMIT) {
    const firstKey = HTML_TRANSLATION_CACHE.keys().next().value
    HTML_TRANSLATION_CACHE.delete(firstKey)
  }
  HTML_TRANSLATION_CACHE.set(key, value)
}

const shouldTranslateText = (text) => {
  if (!text) return false
  const normalized = text.trim()
  if (!normalized) return false
  if (/[\u0600-\u06FF]/.test(normalized)) return false
  if (/(https?:\/\/|www\.|@)/i.test(normalized)) return false
  if (!/[A-Za-z]/.test(normalized)) return false

  // Skip model-like tokens such as i3-N305, 8GB, 15.6", etc.
  if (!normalized.includes(" ") && /\d/.test(normalized)) return false

  return true
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const parseTranslatableNodes = (content) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, "text/html")

  const textNodes = []
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false)
  let node

  while ((node = walker.nextNode())) {
    const parentTag = node.parentElement?.tagName
    if (parentTag && SKIP_PARENT_TAGS.has(parentTag)) {
      continue
    }

    const originalText = node.textContent || ""
    const text = originalText.trim()
    if (shouldTranslateText(text)) {
      const leadingSpace = (originalText.match(/^\s*/) || [""])[0]
      const trailingSpace = (originalText.match(/\s*$/) || [""])[0]
      textNodes.push({ node, text, leadingSpace, trailingSpace })
    }
  }

  return { doc, textNodes }
}

const hasMaterialTranslation = (uniqueTexts, translatedUniqueTexts, translatedHtml, sourceHtml) => {
  if (translatedHtml !== sourceHtml) return true
  return uniqueTexts.some((text, index) => {
    const translated = translatedUniqueTexts[index] || text
    return translated !== text
  })
}

const translateTipTapHtml = async (content, languageCode = "ar") => {
  const targetLanguage = resolveArabicLanguageCode(languageCode)
  if (!content || targetLanguage !== "ar") return content

  const cacheKey = buildCacheKey(content, targetLanguage)
  if (HTML_TRANSLATION_CACHE.has(cacheKey)) {
    return HTML_TRANSLATION_CACHE.get(cacheKey)
  }
  if (HTML_TRANSLATION_IN_FLIGHT.has(cacheKey)) {
    return HTML_TRANSLATION_IN_FLIGHT.get(cacheKey)
  }

  const translationPromise = (async () => {
    for (let attempt = 0; attempt <= MAX_TRANSLATION_RETRIES; attempt += 1) {
      try {
        const { doc, textNodes } = parseTranslatableNodes(content)
        if (textNodes.length === 0) {
          setHtmlCache(cacheKey, content)
          return content
        }

        const uniqueTexts = Array.from(new Set(textNodes.map(({ text }) => text)))
        const translatedUniqueTexts = await batchTranslate(uniqueTexts, targetLanguage)
        const translatedMap = new Map(
          uniqueTexts.map((text, index) => [text, translatedUniqueTexts[index] || text])
        )

        textNodes.forEach((item) => {
          const translatedText = translatedMap.get(item.text)
          if (translatedText && item.node) {
            item.node.textContent = `${item.leadingSpace}${translatedText}${item.trailingSpace}`
          }
        })

        const translated = doc.body.innerHTML
        const shouldCache = hasMaterialTranslation(uniqueTexts, translatedUniqueTexts, translated, content)
        if (shouldCache) {
          setHtmlCache(cacheKey, translated)
          return translated
        }

        if (attempt < MAX_TRANSLATION_RETRIES) {
          await delay(RETRY_DELAY_MS)
          continue
        }

        return content
      } catch (error) {
        console.error("TipTap translation error:", error)
        if (attempt < MAX_TRANSLATION_RETRIES) {
          await delay(RETRY_DELAY_MS)
          continue
        }
        return content
      }
    }

    return content
  })().catch((error) => {
    console.error("TipTap translation error:", error)
    return content
  }).finally(() => {
    HTML_TRANSLATION_IN_FLIGHT.delete(cacheKey)
  })

  HTML_TRANSLATION_IN_FLIGHT.set(cacheKey, translationPromise)
  return translationPromise
}

export const preloadTipTapHtmlTranslation = async (content, languageCode = "ar") => {
  try {
    await translateTipTapHtml(content, languageCode)
  } catch {
    // Ignore preloading failures and keep UI responsive.
  }
}

/**
 * TranslatedTipTapRenderer Component
 * Renders TipTap content with translation support for Arabic
 */
const TranslatedTipTapRenderer = ({ 
  content, 
  sourceDoc = null, 
  fieldName = null, 
  className = "" 
}) => {
  const { currentLanguage, isArabic } = useLanguage()
  const [translatedContent, setTranslatedContent] = useState(content)
  const [isTranslating, setIsTranslating] = useState(false)

  // Priority 1: Check if we have a pre-translated field in the document
  const getPreTranslatedField = () => {
    if (!isArabic || !sourceDoc || !fieldName) return null;
    
    const arField = `${fieldName}Ar`;
    if (sourceDoc[arField]) return sourceDoc[arField];
    
    if (fieldName.endsWith('Ar') && sourceDoc[fieldName]) {
      return sourceDoc[fieldName];
    }
    return null;
  };

  const dbTranslation = getPreTranslatedField();
  
  useEffect(() => {
    let isCancelled = false
    const targetLanguage = resolveArabicLanguageCode(currentLanguage.code)

    // If English or no content, use original
    if (!isArabic || !content || targetLanguage !== "ar") {
      setTranslatedContent(content)
      setIsTranslating(false)
      return
    }

    // Use DB translation if available
    if (dbTranslation) {
      setTranslatedContent(dbTranslation)
      setIsTranslating(false)
      return
    }
    
    const cacheKey = buildCacheKey(content, targetLanguage)
    if (HTML_TRANSLATION_CACHE.has(cacheKey)) {
      setTranslatedContent(HTML_TRANSLATION_CACHE.get(cacheKey))
      setIsTranslating(false)
      return
    }

    setIsTranslating(true)
    translateTipTapHtml(content, targetLanguage).then((translated) => {
      if (!isCancelled && translated) {
        setTranslatedContent(translated)
      }
    }).finally(() => {
      if (!isCancelled) {
        setIsTranslating(false)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [content, isArabic, currentLanguage.code, dbTranslation])
  
  if (!content) return null
  
  const baseClasses = `tiptap-content prose prose-base md:prose-lg lg:prose-xl max-w-none
    prose-headings:font-bold prose-headings:text-gray-900 
    prose-h1:text-2xl md:prose-h1:text-4xl lg:prose-h1:text-5xl prose-h1:mb-6 prose-h1:leading-tight
    prose-h2:text-xl md:prose-h2:text-3xl lg:prose-h2:text-4xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:leading-snug
    prose-h3:text-lg md:prose-h3:text-2xl lg:prose-h3:text-3xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:leading-snug
    prose-h4:text-base md:prose-h4:text-xl lg:prose-h4:text-2xl prose-h4:mt-6 prose-h4:mb-3
    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5 prose-p:text-base md:prose-p:text-lg lg:prose-p:text-xl
    prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-blue-700
    prose-strong:text-gray-900 prose-strong:font-bold
    prose-em:text-gray-800 prose-em:italic
    prose-ul:my-6 prose-ul:space-y-2 prose-ul:list-disc prose-ul:pl-6
    prose-ol:my-6 prose-ol:space-y-2 prose-ol:list-decimal prose-ol:pl-6
    prose-li:text-gray-700 prose-li:leading-relaxed prose-li:marker:text-blue-600
    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:my-6
    prose-code:text-sm prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
    prose-table:w-full prose-table:border-collapse prose-table:my-8
    prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left prose-th:font-semibold
    prose-td:border prose-td:border-gray-300 prose-td:p-3
    prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
    prose-video:rounded-lg prose-video:shadow-md prose-video:my-6 prose-video:max-w-full prose-video:h-auto
    first:prose-h1:mt-0 first:prose-h2:mt-0 first:prose-h3:mt-0
    [&_video]:rounded-lg [&_video]:shadow-md [&_video]:my-6 [&_video]:max-w-full [&_video]:h-auto`
  
  return (
    <div 
      className={`${baseClasses} ${className}`}
      dir={isArabic ? "rtl" : "ltr"}
      dangerouslySetInnerHTML={{ __html: translatedContent }}
      style={{ opacity: isTranslating ? 0.7 : 1, transition: "opacity 0.2s" }}
    />
  )
}

export default TranslatedTipTapRenderer
