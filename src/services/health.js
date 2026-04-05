// import config from "../config/config.js"

// const API_URL = config.API_URL?.replace(/\/+$/, "") || ""

// /**
//  * Fetch with timeout helper
//  */
// async function fetchWithTimeout(url, options = {}, timeoutMs = 3000) {
//   const controller = new AbortController()
//   const id = setTimeout(() => controller.abort(), timeoutMs)
//   try {
//     const res = await fetch(url, { ...options, signal: controller.signal })
//     return res
//   } finally {
//     clearTimeout(id)
//   }
// }

// /**
//  * Check if API is reachable. Treat 2xx and 404 as "server up" (404 means server responded).
//  * Network errors, timeouts, or 5xx are treated as "down".
//  */
// export async function checkServerHealth() {
//   if (!API_URL) return false

//   const candidates = [
//     "/", // API root
//     "/health", // common health endpoint
//     "/api/health", // common health endpoint
//     "/status",
//     "/api/status",
//   ]

//   for (const path of candidates) {
//     try {
//       const res = await fetchWithTimeout(
//         `${API_URL}${path}`,
//         {
//           method: "GET",
//           headers: { Accept: "application/json" },
//         },
//         3000,
//       )

//       if (res.ok) return true
//       // 404 still proves server responded; treat as reachable
//       if (res.status === 404) return true
//       // For 5xx try next candidate
//     } catch (_e) {
//       // Network/timeout -> try next candidate
//     }
//   }
//   return false
// }
