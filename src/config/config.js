// Central app configuration
// - Picks API base from env in production
// - Forces localhost API when running the frontend on localhost for easier dev
const resolveApiUrl = () => {
  const envUrl = (import.meta.env?.VITE_API_URL || "").trim()
  const isLocalHost =
    typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)

  // Respect explicit env override first (works on localhost too).
  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, "")

  // Default local API during localhost development.
  if (isLocalHost) return "http://localhost:5000"

  // Production fallback.
  return "https://api.grabatoz.ae"
}

// Resolve Translation API URL
const resolveTranslationApiUrl = () => {
  const envUrl = (import.meta.env?.VITE_TRANSLATION_API_URL || "").trim()
  const isLocalHost =
    typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)

  // Respect explicit env override first (works on localhost too).
  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, "")

  // Default local translation API during localhost development.
  if (isLocalHost) return "http://localhost:5001"

  // Production fallback.
  return "https://langaimodel.grabatoz.ae" // Production translation API on VPS
}

const config = {
  // API Configuration - Handle both development and production
  API_URL: resolveApiUrl(),

  // Translation Model API
  TRANSLATION_API_URL: resolveTranslationApiUrl(),

  // Payment Gateway Configuration
  TAMARA_API_KEY: import.meta.env.VITE_TAMARA_API_KEY,
  TABBY_MERCHANT_CODE: import.meta.env.VITE_TABBY_MERCHANT_CODE,
  TABBY_SECRET_KEY: import.meta.env.VITE_TABBY_SECRET_KEY,
  NGENIUS_API_KEY: import.meta.env.VITE_NGENIUS_API_KEY,

  // App Configuration
  APP_NAME: "GrabAtoZ",
  APP_VERSION: "1.0.0",
}

export default config




// const config = {
//     // API Configuration - Handle both development and production
//   API_URL:  'ht tp://localhost:5000', // Make sure to include http:// or https://
// //  API_URL: import.meta.env.VITE_API_URL || 'https://api.grabatoz.ae',
   
     
 


//     // Payment Gateway Configuration
//     TAMARA_API_KEY: import.meta.env.VITE_TAMARA_API_KEY,
//     TABBY_MERCHANT_CODE: import.meta.env.VITE_TABBY_MERCHANT_CODE,
//     TABBY_SECRET_KEY: import.meta.env.VITE_TABBY_SECRET_KEY,
//     NGENIUS_API_KEY: import.meta.env.VITE_NGENIUS_API_KEY,
  
//     // App Configuration
//     APP_NAME: "GrabAtoZ",
//     APP_VERSION: "1.0.0",
//   }
  
//   export default config
  
