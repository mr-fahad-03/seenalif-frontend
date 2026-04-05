"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "../context/LanguageContext"
import { batchTranslate } from "../LanguageModel/translationService"

const HTML_TRANSLATION_CACHE = new Map()
const HTML_TRANSLATION_IN_FLIGHT = new Map()
const HTML_CACHE_LIMIT = 200
const MAX_TRANSLATION_RETRIES = 2
const RETRY_DELAY_MS = 300
const SKIP_PARENT_TAGS = new Set(["CODE", "PRE", "KBD", "SAMP", "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "OPTION"])

const buildCacheKey = (content, languageCode) => {
  const head = content.slice(0, 120)
  const tail = content.slice(-120)
  return `html_${languageCode}_${content.length}_${head}_${tail}`
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

/**
 * TranslatedHtml Component
 * Translates HTML content (like TipTap descriptions) to Arabic while preserving HTML structure
 */
const TranslatedHtml = ({ content, className = "" }) => {
  const { currentLanguage, isArabic } = useLanguage()
  const [translatedContent, setTranslatedContent] = useState(content)
  const [isTranslating, setIsTranslating] = useState(false)
  const translationCache = useRef({})
  
  useEffect(() => {
    let isCancelled = false
    const targetLanguage = resolveArabicLanguageCode(currentLanguage.code)

    // If English or no content, use original
    if (!isArabic || !content || targetLanguage !== "ar") {
      setTranslatedContent(content)
      setIsTranslating(false)
      return
    }

    const globalCacheKey = buildCacheKey(content, targetLanguage)
    if (HTML_TRANSLATION_CACHE.has(globalCacheKey)) {
      setTranslatedContent(HTML_TRANSLATION_CACHE.get(globalCacheKey))
      setIsTranslating(false)
      return
    }

    if (HTML_TRANSLATION_IN_FLIGHT.has(globalCacheKey)) {
      setIsTranslating(true)
      HTML_TRANSLATION_IN_FLIGHT.get(globalCacheKey)
        .then((translated) => {
          if (!isCancelled && translated) {
            setTranslatedContent(translated)
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsTranslating(false)
          }
        })
      return
    }
    
    // Check cache first
    const cacheKey = `${content.substring(0, 100)}_${targetLanguage}`
    if (translationCache.current[cacheKey]) {
      setTranslatedContent(translationCache.current[cacheKey])
      setIsTranslating(false)
      return
    }
    
    const translateHtml = async () => {
      setIsTranslating(true)
      for (let attempt = 0; attempt <= MAX_TRANSLATION_RETRIES; attempt += 1) {
        try {
          const { doc, textNodes } = parseTranslatableNodes(content)
          if (textNodes.length === 0) {
            setHtmlCache(globalCacheKey, content)
            translationCache.current[cacheKey] = content
            return content
          }

          const uniqueTexts = Array.from(new Set(textNodes.map(({ text }) => text)))
          const translatedUniqueTexts = await batchTranslate(uniqueTexts, targetLanguage)
          const translatedMap = new Map(
            uniqueTexts.map((text, index) => [text, translatedUniqueTexts[index] || text])
          )
          
          textNodes.forEach((item) => {
            const translatedText = translatedMap.get(item.text)
            item.node.textContent = `${item.leadingSpace}${translatedText || item.text}${item.trailingSpace}`
          })
          
          const translated = doc.body.innerHTML
          const shouldCache = hasMaterialTranslation(uniqueTexts, translatedUniqueTexts, translated, content)
          if (shouldCache) {
            translationCache.current[cacheKey] = translated
            setHtmlCache(globalCacheKey, translated)
            return translated
          }

          if (attempt < MAX_TRANSLATION_RETRIES) {
            await delay(RETRY_DELAY_MS)
            continue
          }

          return content
        } catch (error) {
          console.error("HTML translation error:", error)
          if (attempt < MAX_TRANSLATION_RETRIES) {
            await delay(RETRY_DELAY_MS)
            continue
          }
          return content
        }
      }

      return content
    }

    const translationPromise = translateHtml()
    HTML_TRANSLATION_IN_FLIGHT.set(globalCacheKey, translationPromise)

    translationPromise
      .then((translated) => {
        if (!isCancelled && translated) {
          setTranslatedContent(translated)
        }
      })
      .finally(() => {
        HTML_TRANSLATION_IN_FLIGHT.delete(globalCacheKey)
      })

    return () => {
      isCancelled = true
    }
  }, [content, isArabic, currentLanguage.code])
  
  if (!content) return null
  
  return (
    <div 
      className={className}
      dir={isArabic ? "rtl" : "ltr"}
      dangerouslySetInnerHTML={{ __html: translatedContent }}
      style={{ opacity: isTranslating ? 0.7 : 1, transition: "opacity 0.2s" }}
    />
  )
}

export default TranslatedHtml
