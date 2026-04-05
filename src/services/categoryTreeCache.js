import axios from "axios"
import config from "../config/config"

const CACHE_KEY = "graba2z_category_tree_cache_v1"
const CACHE_TTL = 10 * 60 * 1000

let inflightPromise = null
let memoryCache = null

function isValidCacheShape(parsed) {
  return !!(parsed?.timestamp && Array.isArray(parsed?.data))
}

function readFromStorage(storage) {
  if (!storage) return null
  try {
    const raw = storage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!isValidCacheShape(parsed)) return null
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null
    return parsed.data
  } catch {
    return null
  }
}

function readAnyCache() {
  if (Array.isArray(memoryCache) && memoryCache.length > 0) {
    return memoryCache
  }
  const fromSession = readFromStorage(typeof sessionStorage !== "undefined" ? sessionStorage : null)
  if (fromSession) {
    memoryCache = fromSession
    return fromSession
  }
  const fromLocal = readFromStorage(typeof localStorage !== "undefined" ? localStorage : null)
  if (fromLocal) {
    memoryCache = fromLocal
    return fromLocal
  }
  return null
}

function writeCache(data) {
  memoryCache = Array.isArray(data) ? data : []
  const payload = JSON.stringify({
    timestamp: Date.now(),
    data,
  })

  try {
    sessionStorage.setItem(CACHE_KEY, payload)
  } catch {
    // Ignore cache write failures.
  }
  try {
    localStorage.setItem(CACHE_KEY, payload)
  } catch {
    // Ignore cache write failures.
  }
}

export async function getCategoryTreeCached() {
  const cached = readAnyCache()
  if (cached) return cached

  if (inflightPromise) return inflightPromise

  inflightPromise = axios
    .get(`${config.API_URL}/api/categories/tree`)
    .then((resp) => (Array.isArray(resp.data) ? resp.data : []))
    .then((data) => {
      writeCache(data)
      return data
    })
    .finally(() => {
      inflightPromise = null
    })

  return inflightPromise
}

