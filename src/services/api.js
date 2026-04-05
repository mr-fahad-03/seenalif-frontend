import config from "../config/config.js"

const API_URL = config.API_URL

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  }
  let body = options.body
  // Stringify body if it's an object (for JSON requests)
  if (body && typeof body !== "string" && headers["Content-Type"] === "application/json") {
    body = JSON.stringify(body)
  }
  const config = {
    ...options,
    headers,
    body,
  }
  try {
    const response = await fetch(url, config)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong")
    }
    return data
  } catch (error) {
    console.error("API Request Error:", error)
    throw error
  }
}

// Auth API calls
export const authAPI = {
  register: (userData) =>
    apiRequest("/api/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiRequest("/api/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  verifyEmail: (verificationData) =>
    apiRequest("/api/users/verify-email", {
      method: "POST",
      body: JSON.stringify(verificationData),
    }),

  resendVerification: (email) =>
    apiRequest("/api/users/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email) =>
    apiRequest("/api/users/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, password) =>
    apiRequest("/api/users/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  getProfile: () => apiRequest("/api/users/profile"),

  updateProfile: (profileData) =>
    apiRequest("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
}

// Products API calls
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/api/products${queryString ? `?${queryString}` : ""}`)
  },

  getById: (id) => apiRequest(`/api/products/${id}`),

  create: (productData) =>
    apiRequest("/api/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  update: (id, productData) =>
    apiRequest(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),

  delete: (id) =>
    apiRequest(`/api/products/${id}`, {
      method: "DELETE",
    }),

  getByCategory: (categoryId) => apiRequest(`/api/products/category/${categoryId}`),

  search: (query) => apiRequest(`/api/products/search?q=${encodeURIComponent(query)}`),

  getBySlug: (slug) => apiRequest(`/api/products/slug/${encodeURIComponent(slug)}`),
  getBySku: (sku) => apiRequest(`/api/products?search=${encodeURIComponent(sku)}`),
  getBySkus: (skus) =>
    apiRequest(`/api/products/by-skus`, {
      method: "POST",
      body: JSON.stringify({ skus }),
    }),
}

// Categories API calls
export const categoriesAPI = {
  getAll: () => apiRequest("/api/categories"),
  getById: (id) => apiRequest(`/api/categories/${id}`),
  create: (categoryData) =>
    apiRequest("/api/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    }),
  update: (id, categoryData) =>
    apiRequest(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    }),
  delete: (id) =>
    apiRequest(`/api/categories/${id}`, {
      method: "DELETE",
    }),
}

// Orders API calls
export const ordersAPI = {
  getAll: () => apiRequest("/orders"),
  getById: (id) => apiRequest(`/orders/${id}`),
  create: (orderData) =>
    apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),
  updateStatus: (id, status) =>
    apiRequest(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  getUserOrders: () => apiRequest("/orders/user"),
}

// Cart API calls
export const cartAPI = {
  get: () => apiRequest("/cart"),
  add: (productId, quantity = 1) =>
    apiRequest("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  update: (productId, quantity) =>
    apiRequest("/cart/update", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity }),
    }),
  remove: (productId) =>
    apiRequest("/cart/remove", {
      method: "DELETE",
      body: JSON.stringify({ productId }),
    }),
  clear: () =>
    apiRequest("/cart/clear", {
      method: "DELETE",
    }),
}

// Wishlist API calls
export const wishlistAPI = {
  get: () => apiRequest("/wishlist"),
  add: (productId) =>
    apiRequest("/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  remove: (productId) =>
    apiRequest("/wishlist/remove", {
      method: "DELETE",
      body: JSON.stringify({ productId }),
    }),
}

// Admin API calls
export const adminAPI = {
  login: (credentials) =>
    apiRequest("/api/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  getProfile: () =>
    apiRequest("/api/admin/profile", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),
  getDashboardStats: () =>
    apiRequest("/api/admin/stats", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),
  getUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiRequest(`/api/admin/users${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },
  updateUser: (id, userData) =>
    apiRequest(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      body: JSON.stringify(userData),
    }),
  deleteUser: (id) =>
    apiRequest(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),
  getRecentOrders: () =>
    apiRequest("/api/admin/orders/recent", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),
  createOrder: (orderData) =>
    apiRequest("/api/admin/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      body: JSON.stringify(orderData),
    }),
}

// Super Admin API calls
export const superAdminAPI = {
  // Admin management
  getAdmins: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiRequest(`/api/super-admin/admins${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },
  getAdminById: (id) =>
    apiRequest(`/api/super-admin/admins/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),
  createAdmin: (adminData) =>
    apiRequest("/api/super-admin/admins", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      body: JSON.stringify(adminData),
    }),
  checkUserByEmail: (email) =>
    apiRequest("/api/super-admin/check-user", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      body: JSON.stringify({ email }),
    }),
  promoteToAdmin: (userId, data) =>
    apiRequest(`/api/super-admin/promote-to-admin/${userId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      body: JSON.stringify(data),
    }),
  updateAdmin: (id, adminData) =>
    apiRequest(`/api/super-admin/admins/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      body: JSON.stringify(adminData),
    }),
  deleteAdmin: (id) =>
    apiRequest(`/api/super-admin/admins/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),
  updateAdminPermissions: (id, permissions) =>
    apiRequest(`/api/super-admin/admins/${id}/permissions`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      body: JSON.stringify({ permissions }),
    }),

  // Permissions
  getPermissionsList: () =>
    apiRequest("/api/super-admin/permissions", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),
  getMyPermissions: () =>
    apiRequest("/api/super-admin/my-permissions", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),

  // Activity logs
  getActivityLogs: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    )
    const qs = new URLSearchParams(cleanParams).toString()
    return apiRequest(`/api/super-admin/activity-logs${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },
  getActivityLogsByUser: (userId, params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    )
    const qs = new URLSearchParams(cleanParams).toString()
    return apiRequest(`/api/super-admin/activity-logs/user/${userId}${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },
  getActivityStats: () =>
    apiRequest("/api/super-admin/activity-logs/summary", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),
  getActivityLogStats: (days = 7) =>
    apiRequest(`/api/super-admin/activity-logs/stats?days=${days}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),
  cleanupActivityLogs: (days = 90) =>
    apiRequest(`/api/super-admin/activity-logs/cleanup?days=${days}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),

  // Reports
  getReportOverview: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    )
    const qs = new URLSearchParams(cleanParams).toString()
    return apiRequest(`/api/reports/overview${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },
  getAdminActivityReport: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    )
    const qs = new URLSearchParams(cleanParams).toString()
    return apiRequest(`/api/reports/admin-activity${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },
  getModuleActivityReport: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    )
    const qs = new URLSearchParams(cleanParams).toString()
    return apiRequest(`/api/reports/module-activity${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },
  getOrdersReport: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    )
    const qs = new URLSearchParams(cleanParams).toString()
    return apiRequest(`/api/reports/orders${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },
  getUsersReport: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    )
    const qs = new URLSearchParams(cleanParams).toString()
    return apiRequest(`/api/reports/users${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },
  exportActivityReport: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiRequest(`/api/reports/export/activity${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },
  exportSiteReport: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiRequest(`/api/reports/export/site${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },
  getReportTypes: () =>
    apiRequest("/api/reports/types", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),
}

// Upload API calls
export const uploadAPI = {
  single: (file) => {
    const formData = new FormData()
    formData.append("image", file)

    return apiRequest("/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })
  },

  multiple: (files) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("images", file)
    })

    return apiRequest("/upload/multiple", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })
  },
}

// Admin Products API calls
export const productsAdminAPI = {
  search: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiRequest(`/api/products/admin${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },
}

// Redirects API calls
export const redirectsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiRequest(`/api/redirects${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
  },

  getById: (id) =>
    apiRequest(`/api/redirects/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),

  create: (redirectData) =>
    apiRequest("/api/redirects", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      body: JSON.stringify(redirectData),
    }),

  update: (id, redirectData) =>
    apiRequest(`/api/redirects/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      body: JSON.stringify(redirectData),
    }),

  delete: (id) =>
    apiRequest(`/api/redirects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    }),
}

export { apiRequest }
export default {
  authAPI,
  productsAPI,
  categoriesAPI,
  ordersAPI,
  cartAPI,
  wishlistAPI,
  adminAPI,
  superAdminAPI,
  uploadAPI,
  productsAdminAPI,
  redirectsAPI,
}
