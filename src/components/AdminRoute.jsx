"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

// Permission mapping for routes
const routePermissions = {
  "/admin/dashboard": "dashboard",
  "/admin/products": "products",
  "/admin/products/add": "products",
  "/admin/products/add": "products",
  "/admin/products/bulk-add": "products",
  "/admin/categories": "categories",
  "/admin/categories/add": "categories",
  "/admin/categories/edit": "categories",
  "/admin/categories/trash": "categories",
  "/admin/categories/slider": "categories",
  "/admin/subcategories": "subcategories",
  "/admin/subcategories/add": "subcategories",
  "/admin/subcategories/edit": "subcategories",
  "/admin/subcategories/trash": "subcategories",
  "/admin/subcategories-2": "subcategories",
  "/admin/subcategories-3": "subcategories",
  "/admin/subcategories-4": "subcategories",
  "/admin/brands": "brands",
  "/admin/brands/add": "brands",
  "/admin/edit-brand": "brands",
  "/admin/orders": "orders",
  "/admin/orders/new": "orders",
  "/admin/orders/confirmed": "orders",
  "/admin/orders/processing": "orders",
  "/admin/orders/ready-for-shipment": "orders",
  "/admin/orders/on-the-way": "orders",
  "/admin/orders/delivered": "orders",
  "/admin/orders/on-hold": "orders",
  "/admin/orders/cancelled": "orders",
  "/admin/orders/deleted": "orders",
  "/admin/orders/critical": "orders",
  "/admin/orders/create": "orders",
  "/admin/users": "users",
  "/admin/reviews": "reviews",
  "/admin/blogs": "blogs",
  "/admin/blog-dashboard": "blogs",
  "/admin/blog-categories": "blogs",
  "/admin/blog-topics": "blogs",
  "/admin/blog-brands": "blogs",
  "/admin/blog-comments": "blogs",
  "/admin/blog-rating": "blogs",
  "/admin/banners": "banners",
  "/admin/banner-cards": "banners",
  "/admin/home-sections": "homeSections",
  "/admin/offer-pages": "offerPages",
  "/admin/gaming-zone": "gamingZone",
  "/admin/coupons": "coupons",
  "/admin/delivery-charges": "deliveryCharges",
  "/admin/settings": "settings",
  "/admin/email-templates": "emailTemplates",
  "/admin/newsletter-subscribers": "newsletter",
  "/admin/request-callbacks": "requestCallbacks",
  "/admin/bulk-purchase": "bulkPurchase",
  "/admin/buyer-protection": "buyerProtection",
  "/admin/stock-adjustment": "stockAdjustment",
  "/admin/seo-settings": "seoSettings",
  "/admin/reset-cache": "cache",
  "/admin/volumes": "volumes",
  "/admin/warranty": "warranty",
  "/admin/colors": "colors",
  "/admin/units": "units",
  "/admin/tax": "tax",
  "/admin/sizes": "sizes",
  "/admin/admin-management": "adminManagement",
  "/admin/activity-logs": "activityLogs",
}

// Get permission required for a route
const getRequiredPermission = (pathname) => {
  // Exact match
  if (routePermissions[pathname]) {
    return routePermissions[pathname]
  }
  
  // Check for partial matches (for dynamic routes like /admin/products/edit/123)
  for (const route of Object.keys(routePermissions)) {
    if (pathname.startsWith(route)) {
      return routePermissions[route]
    }
  }
  
  // Default to dashboard permission for unknown admin routes
  return "dashboard"
}

// Permission to default route mapping (first page for each permission)
const permissionDefaultRoutes = {
  dashboard: "/admin/dashboard",
  products: "/admin/products",
  categories: "/admin/categories",
  subcategories: "/admin/subcategories",
  brands: "/admin/brands",
  orders: "/admin/orders",
  users: "/admin/users",
  reviews: "/admin/reviews",
  blogs: "/admin/blogs",
  banners: "/admin/banners",
  homeSections: "/admin/home-sections",
  offerPages: "/admin/offer-pages",
  gamingZone: "/admin/gaming-zone",
  coupons: "/admin/coupons",
  deliveryCharges: "/admin/delivery-charges",
  settings: "/admin/settings",
  emailTemplates: "/admin/email-templates",
  newsletter: "/admin/newsletter-subscribers",
  requestCallbacks: "/admin/request-callbacks",
  bulkPurchase: "/admin/bulk-purchase",
  buyerProtection: "/admin/buyer-protection",
  stockAdjustment: "/admin/stock-adjustment",
  seoSettings: "/admin/seo-settings",
  cache: "/admin/reset-cache",
  volumes: "/admin/volumes",
  warranty: "/admin/warranty",
  colors: "/admin/colors",
  units: "/admin/units",
  tax: "/admin/tax",
  sizes: "/admin/sizes",
  adminManagement: "/admin/admin-management",
  activityLogs: "/admin/activity-logs",
}

// Get the first permitted route for a user
const getFirstPermittedRoute = (hasPermission) => {
  // Check permissions in priority order
  const permissionOrder = [
    "dashboard", "products", "categories", "subcategories", "brands",
    "orders", "users", "reviews", "blogs", "banners", "homeSections",
    "offerPages", "gamingZone", "coupons", "deliveryCharges", "settings",
    "emailTemplates", "newsletter", "requestCallbacks", "bulkPurchase",
    "buyerProtection", "stockAdjustment", "seoSettings", "cache",
    "volumes", "warranty", "colors", "units", "tax", "sizes",
    "adminManagement", "activityLogs"
  ]
  
  for (const perm of permissionOrder) {
    if (hasPermission(perm)) {
      return permissionDefaultRoutes[perm]
    }
  }
  
  // No permitted route found
  return null
}

const AdminRoute = ({ children, requiredPermission }) => {
  const adminToken = localStorage.getItem("adminToken")
  const location = useLocation()
  const { hasPermission, isSuperAdmin } = useAuth()
  
  if (!adminToken) {
    return <Navigate to="/grabiansadmin/login" />
  }
  
  // Super admin has access to everything
  if (isSuperAdmin) {
    return children
  }
  
  // Check permission based on route or explicit requirement
  const permission = requiredPermission || getRequiredPermission(location.pathname)
  
  if (permission && !hasPermission(permission)) {
    // Redirect to first permitted page instead of dashboard
    const firstPermittedRoute = getFirstPermittedRoute(hasPermission)
    // Prevent redirect loops (e.g. no permissions or same-route redirect)
    if (!firstPermittedRoute || firstPermittedRoute === location.pathname) {
      return <Navigate to="/grabiansadmin/login" state={{ accessDenied: true, requiredPermission: permission }} replace />
    }
    return <Navigate to={firstPermittedRoute} state={{ accessDenied: true, requiredPermission: permission }} replace />
  }
  
  return children
}

export default AdminRoute
