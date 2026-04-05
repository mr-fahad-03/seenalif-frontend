/**
 * LanguageModel - Entry point
 * Helsinki-NLP/opus-mt-tc-big-en-ar based translation service
 * OPTIMIZED: Uses batching and debouncing for efficient API calls
 */

export {
  translateToArabic,
  translateToEnglish,
  batchTranslate,
  clearTranslationCache,
  getCacheStats,
  preloadTranslations,
  getCachedTranslation,
} from './translationService';

export { default as translationService } from './translationService';
