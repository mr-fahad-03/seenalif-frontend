"use client"

import { useState, useCallback } from "react"
import { useLanguage } from "../context/LanguageContext"

/**
 * Custom hook for handling translations using Helsinki-NLP model
 * All translations are done at runtime using the AI model
 */
export const useTranslation = () => {
  const { currentLanguage, translate: modelTranslate, isLoading, isRTL } = useLanguage()
  const [cache, setCache] = useState({})

  /**
   * Translate text using Helsinki-NLP model
   * @param {string} text - Text to translate
   * @returns {Promise<string>} - Translated text
   */
  const t = useCallback(async (text) => {
    if (!text) return text
    
    // For English, return as is (English is the source language)
    if (currentLanguage.code === "en") {
      return text
    }

    // Check cache
    const cacheKey = `${currentLanguage.code}:${text}`
    if (cache[cacheKey]) {
      return cache[cacheKey]
    }

    // Use the model to translate
    const translated = await modelTranslate(text, currentLanguage.code)
    
    // Cache the result
    setCache(prev => ({
      ...prev,
      [cacheKey]: translated
    }))

    return translated
  }, [currentLanguage.code, cache, modelTranslate])

  /**
   * Batch translate multiple texts
   * @param {string[]} texts - Array of texts to translate
   * @returns {Promise<string[]>} - Array of translated texts
   */
  const translateBatch = useCallback(async (texts) => {
    if (!texts || texts.length === 0) return []
    
    if (currentLanguage.code === "en") {
      return texts
    }

    const translations = await Promise.all(
      texts.map(text => t(text))
    )

    return translations
  }, [currentLanguage.code, t])

  /**
   * Get localized number format
   * @param {number} number - Number to format
   * @returns {string} - Formatted number string
   */
  const formatNumber = useCallback((number) => {
    const locale = currentLanguage.code === "ar" ? "ar-AE" : "en-AE"
    return new Intl.NumberFormat(locale).format(number)
  }, [currentLanguage.code])

  /**
   * Get localized currency format
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: AED)
   * @returns {string} - Formatted currency string
   */
  const formatCurrency = useCallback((amount, currency = "AED") => {
    const locale = currentLanguage.code === "ar" ? "ar-AE" : "en-AE"
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount)
  }, [currentLanguage.code])

  /**
   * Get localized date format
   * @param {Date|string} date - Date to format
   * @param {object} options - Intl.DateTimeFormat options
   * @returns {string} - Formatted date string
   */
  const formatDate = useCallback((date, options = {}) => {
    const locale = currentLanguage.code === "ar" ? "ar-AE" : "en-AE"
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    }).format(dateObj)
  }, [currentLanguage.code])

  return {
    t,
    translateBatch,
    formatNumber,
    formatCurrency,
    formatDate,
    currentLanguage,
    isLoading,
    isRTL,
    isArabic: currentLanguage.code === "ar",
    isEnglish: currentLanguage.code === "en",
  }
}

export default useTranslation
