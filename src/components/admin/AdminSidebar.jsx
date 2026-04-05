"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  Tag,
  ImageIcon,
  Percent,
  ChevronDown,
  ChevronRight,
  Palette,
  Shield,
  Calculator,
  Ruler,
  Box,
  Layers,
  BookOpen,
  Truck,
  Phone,
  Star,
  TrendingUp,
  Cog,
  ShoppingBag,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Activity,
  UserCog,
} from "lucide-react"

const AdminSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminLogout, isSuperAdmin, hasPermission } = useAuth()
  const [openDropdowns, setOpenDropdowns] = useState({
    productSystem: false,
    products: false,
    categories: false,
    brands: false,
    volumes: false,
    warranty: false,
    colors: false,
    units: false,
    tax: false,
    sizes: false,
    orders: false,
    blogs: false,
    subcategories: false,
    subcategories2: false,
    subcategories3: false,
    subcategories4: false,
    coupons: false,
    reviews: false,
    stockAdjustment: false,
    seoSettings: false,
    superAdmin: false, // Super Admin dropdown state
    seoSettings: false, // Added seoSettings dropdown state
  })

  // Auto-open dropdowns based on current route
  useEffect(() => {
    const path = location.pathname
    const newOpenDropdowns = { ...openDropdowns }

    // Product System dropdown - open if any product-related route is active
    if (
      path.includes("/admin/products") ||
      path.includes("/admin/add-product") ||
      path.includes("/admin/categories") ||
      path.includes("/admin/add-category") ||
      path.includes("/admin/trash-categories") ||
      path.includes("/admin/brands") ||
      path.includes("/admin/add-brand") ||
      path.includes("/admin/volumes") ||
      path.includes("/admin/add-volume") ||
      path.includes("/admin/warranty") ||
      path.includes("/admin/add-warranty") ||
      path.includes("/admin/colors") ||
      path.includes("/admin/add-color") ||
      path.includes("/admin/units") ||
      path.includes("/admin/add-unit") ||
      path.includes("/admin/tax") ||
      path.includes("/admin/add-tax") ||
      path.includes("/admin/sizes") ||
      path.includes("/admin/add-size") ||
      path.includes("/admin/subcategories") ||
      path.includes("/admin/add-subcategory") ||
      path.includes("/admin/subcategories/trash") ||
      path.includes("/admin/subcategories-2") ||
      path.includes("/admin/add-subcategory-2") ||
      path.includes("/admin/subcategories-3") ||
      path.includes("/admin/add-subcategory-3") ||
      path.includes("/admin/subcategories-4") ||
      path.includes("/admin/add-subcategory-4")
    ) {
      newOpenDropdowns.productSystem = true
    }

    // Orders dropdown - open if any order-related route is active
    if (
      path.includes("/admin/orders") ||
      path.includes("/admin/orders/new") ||
      path.includes("/admin/orders/online") ||
      path.includes("/admin/orders/received") ||
      path.includes("/admin/orders/confirmed") ||
      path.includes("/admin/orders/processing") ||
      path.includes("/admin/orders/ready-for-shipment") ||
      path.includes("/admin/orders/on-the-way") ||
      path.includes("/admin/orders/delivered") ||
      path.includes("/admin/orders/on-hold") ||
      path.includes("/admin/orders/cancelled") ||
      path.includes("/admin/orders/deleted") ||
      path.includes("/admin/orders/create") // Added Create Order route
    ) {
      newOpenDropdowns.orders = true
    }

    // Blogs dropdown - open if any blog-related route is active
    if (
      path.includes("/admin/blog-dashboard") ||
      path.includes("/admin/blogs") ||
      path.includes("/admin/add-blog") ||
      path.includes("/admin/blog-topics") ||
      path.includes("/admin/blog-categories") ||
      path.includes("/admin/blog-brands") ||
      path.includes("/admin/blog-comments") ||
      path.includes("/admin/blog-rating")
    ) {
      newOpenDropdowns.blogs = true
    }

    // Coupons dropdown - open if any coupon-related route is active
    if (path.includes("/admin/coupons")) {
      newOpenDropdowns.coupons = true
    }

    // Reviews dropdown - open if any review-related route is active
    if (path.includes("/admin/reviews")) {
      newOpenDropdowns.reviews = true
    }

    if (path.includes("/admin/stock-adjustment")) {
      newOpenDropdowns.stockAdjustment = true
    }

    // SEO Settings dropdown auto-open
    if (path.includes("/admin/seo-settings")) {
      newOpenDropdowns.seoSettings = true
    }

    // Individual dropdowns
    if (path.includes("/admin/products") || path.includes("/admin/add-product")) {
      newOpenDropdowns.products = true
    }
    if (
      path.includes("/admin/categories") ||
      path.includes("/admin/add-category") ||
      path.includes("/admin/trash-categories") ||
      path.includes("/admin/categories/slider")
    ) {
      newOpenDropdowns.categories = true
    }
    if (path.includes("/admin/brands") || path.includes("/admin/add-brand")) {
      newOpenDropdowns.brands = true
    }
    if (path.includes("/admin/volumes") || path.includes("/admin/add-volume")) {
      newOpenDropdowns.volumes = true
    }
    if (path.includes("/admin/warranty") || path.includes("/admin/add-warranty")) {
      newOpenDropdowns.warranty = true
    }
    if (path.includes("/admin/colors") || path.includes("/admin/add-color")) {
      newOpenDropdowns.colors = true
    }
    if (path.includes("/admin/units") || path.includes("/admin/add-unit")) {
      newOpenDropdowns.units = true
    }
    if (path.includes("/admin/tax") || path.includes("/admin/add-tax")) {
      newOpenDropdowns.tax = true
    }
    if (path.includes("/admin/sizes") || path.includes("/admin/add-size")) {
      newOpenDropdowns.sizes = true
    }
    if (path.includes("/admin/subcategories") || path.includes("/admin/add-subcategory") || path.includes("/admin/subcategories/trash")) {
      newOpenDropdowns.subcategories = true
    }
    if (path.includes("/admin/subcategories-2") || path.includes("/admin/add-subcategory-2")) {
      newOpenDropdowns.subcategories2 = true
    }
    if (path.includes("/admin/subcategories-3") || path.includes("/admin/add-subcategory-3")) {
      newOpenDropdowns.subcategories3 = true
    }
    if (path.includes("/admin/subcategories-4") || path.includes("/admin/add-subcategory-4")) {
      newOpenDropdowns.subcategories4 = true
    }

    setOpenDropdowns(newOpenDropdowns)
  }, [location.pathname])

  const handleLogout = () => {
    adminLogout()
    navigate("/grabiansadmin/login")
  }

  const toggleDropdown = (dropdown, e) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }))
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
      permission: "dashboard",
    },
    {
      title: "Product System",
      icon: Layers,
      dropdown: "productSystem",
      permission: "products",
      items: [
        {
          title: "Products",
          icon: Package,
          dropdown: "products",
          section: "products",
          permission: "products",
          items: [
            { title: "List Products", path: "/admin/products" },
            //{ title: "Add Product", path: "/admin/products/add" },
            { title: "Add Bulk Products", path: "/admin/products/bulk-add" },
          ],
        },
        {
          title: "Categories",
          icon: Tag,
          dropdown: "categories",
          section: "categories",
          permission: "categories",
          items: [
            { title: "List Categories", path: "/admin/categories" },
            { title: "Add Category", path: "/admin/categories/add" },
            { title: "Trash Categories", path: "/admin/categories/trash" },
            { title: "Category Slider", path: "/admin/categories/slider" },
          ],
        },
        {
          title: "Sub Categories",
          icon: Tag,
          dropdown: "subcategories",
          section: "subcategories",
          permission: "subcategories",
          items: [
            { title: "List Sub Categories", path: "/admin/subcategories" },
            { title: "Add Sub Category", path: "/admin/subcategories/add" },
            { title: "Trash Sub Categories", path: "/admin/subcategories/trash" },
          ],
        },
        {
          title: "Sub Categories 2",
          icon: Tag,
          dropdown: "subcategories2",
          section: "subcategories2",
          permission: "subcategories",
          items: [
            { title: "List Sub Categories 2", path: "/admin/subcategories-2" },
            { title: "Add Sub Category 2", path: "/admin/subcategories-2/add" },
          ],
        },
        {
          title: "Sub Categories 3",
          icon: Tag,
          dropdown: "subcategories3",
          section: "subcategories3",
          permission: "subcategories",
          items: [
            { title: "List Sub Categories 3", path: "/admin/subcategories-3" },
            { title: "Add Sub Category 3", path: "/admin/subcategories-3/add" },
          ],
        },
        {
          title: "Sub Categories 4",
          icon: Tag,
          dropdown: "subcategories4",
          section: "subcategories4",
          permission: "subcategories",
          items: [
            { title: "List Sub Categories 4", path: "/admin/subcategories-4" },
            { title: "Add Sub Category 4", path: "/admin/subcategories-4/add" },
          ],
        },
        {
          title: "Brands",
          icon: Tag,
          dropdown: "brands",
          section: "brands",
          permission: "brands",
          items: [
            { title: "List Brands", path: "/admin/brands" },
            { title: "Add Brand", path: "/admin/brands/add" },
          ],
        },
        {
          title: "Volumes",
          icon: Box,
          dropdown: "volumes",
          section: "volumes",
          permission: "volumes",
          items: [
            { title: "List Volumes", path: "/admin/volumes" },
            { title: "Add Volume", path: "/admin/volumes/add" },
          ],
        },
        {
          title: "Warranty",
          icon: Shield,
          dropdown: "warranty",
          section: "warranty",
          permission: "warranty",
          items: [
            { title: "List Warranty", path: "/admin/warranty" },
            { title: "Add Warranty", path: "/admin/warranty/add" },
          ],
        },
        {
          title: "Colors",
          icon: Palette,
          dropdown: "colors",
          section: "colors",
          permission: "colors",
          items: [
            { title: "List Colors", path: "/admin/colors" },
            { title: "Add Color", path: "/admin/colors/add" },
          ],
        },
        {
          title: "Units",
          icon: Ruler,
          dropdown: "units",
          section: "units",
          permission: "units",
          items: [
            { title: "List Units", path: "/admin/units" },
            { title: "Add Unit", path: "/admin/units/add" },
          ],
        },
        {
          title: "Tax",
          icon: Calculator,
          dropdown: "tax",
          section: "tax",
          permission: "tax",
          items: [
            { title: "List Tax", path: "/admin/tax" },
            { title: "Add Tax", path: "/admin/tax/add" },
          ],
        },
        {
          title: "Sizes",
          icon: Ruler,
          dropdown: "sizes",
          section: "sizes",
          permission: "sizes",
          items: [
            { title: "List Sizes", path: "/admin/sizes" },
            { title: "Add Size", path: "/admin/sizes/add" },
          ],
        },
      ],
    },
    {
      title: "Stock Adjustment",
      icon: TrendingUp,
      dropdown: "stockAdjustment",
      permission: "stockAdjustment",
      items: [
        { title: "Price Adjustment", path: "/admin/stock-adjustment/price-adjustment" },
        { title: "Reports", path: "/admin/stock-adjustment/reports" },
      ],
    },
    {
      title: "Delivery Charges",
      icon: Truck,
      dropdown: "deliveryCharges",
      permission: "deliveryCharges",
      items: [
        { title: "List Delivery Charges", path: "/admin/delivery-charges" },
        { title: "Add Delivery Charge", path: "/admin/delivery-charges/add" },
      ],
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      dropdown: "orders",
      permission: "orders",
      items: [
        { title: "All Orders", path: "/admin/orders" },
        { title: "Create Order", path: "/admin/orders/create" },
        { title: "New Orders", path: "/admin/orders/new" },
        { title: "Confirmed", path: "/admin/orders/confirmed" },
        { title: "Processing", path: "/admin/orders/processing" },
        { title: "Ready for Shipment", path: "/admin/orders/ready-for-shipment" },
        { title: "On the Way", path: "/admin/orders/on-the-way" },
        { title: "Delivered", path: "/admin/orders/delivered" },
        { title: "On Hold", path: "/admin/orders/on-hold" },
        { title: "Cancelled", path: "/admin/orders/cancelled" },
        { title: "Deleted", path: "/admin/orders/deleted" },
        { title: "Critical Orders", path: "/admin/orders/critical", icon: AlertTriangle, highlight: true },
      ],
    },
    {
      title: "Reviews",
      icon: Star,
      dropdown: "reviews",
      permission: "reviews",
      items: [
        { title: "All Reviews", path: "/admin/reviews" },
        { title: "Pending Reviews", path: "/admin/reviews/pending" },
        { title: "Approved Reviews", path: "/admin/reviews/approved" },
        { title: "Rejected Reviews", path: "/admin/reviews/rejected" },
      ],
    },
    {
      title: "Request Callbacks",
      icon: Phone,
      path: "/admin/request-callbacks",
      permission: "requestCallbacks",
    },
    {
      title: "Bulk Purchase",
      icon: ShoppingBag,
      path: "/admin/bulk-purchase",
      permission: "bulkPurchase",
    },
    {
      title: "Buyer Protection",
      icon: Shield,
      path: "/admin/buyer-protection",
      permission: "buyerProtection",
    },
    {
      title: "Blogs",
      icon: BookOpen,
      dropdown: "blogs",
      permission: "blogs",
      items: [
        { title: "Dashboard", path: "/admin/blog-dashboard" },
        { title: "Blogs", path: "/admin/blogs" },
        { title: "Comments", path: "/admin/blog-comments" },
        { title: "Categories", path: "/admin/blog-categories" },
        { title: "Topics", path: "/admin/blog-topics" },
        { title: "Brands", path: "/admin/blog-brands" },
      ],
    },
    {
      title: "Users",
      icon: Users,
      path: "/admin/users",
      permission: "users",
    },
    {
      title: "Banners",
      icon: ImageIcon,
      path: "/admin/banners",
      permission: "banners",
    },
    {
      title: "Home Sections",
      icon: ImageIcon,
      path: "/admin/home-sections",
      permission: "homeSections",
    },
    {
      title: "Offer Pages",
      icon: Tag,
      path: "/admin/offer-pages",
      permission: "offerPages",
    },
    {
      title: "Gaming Zone",
      icon: Tag,
      path: "/admin/gaming-zone",
      permission: "gamingZone",
    },
    {
      title: "Coupons",
      icon: Percent,
      dropdown: "coupons",
      permission: "coupons",
      items: [{ title: "All Coupons", path: "/admin/coupons/all" }],
    },
    {
      title: "SEO Settings",
      icon: Cog,
      dropdown: "seoSettings",
      permission: "seoSettings",
      items: [{ title: "Redirects", path: "/admin/seo-settings/redirects" }],
    },
    {
      title: "Email Templates",
      icon: Settings,
      path: "/admin/email-templates",
      permission: "emailTemplates",
    },
    {
      title: "Newsletter Subscribers",
      icon: Users,
      path: "/admin/newsletter-subscribers",
      permission: "newsletter",
    },
    {
      title: "Reset Cache",
      icon: RefreshCw,
      path: "/admin/reset-cache",
      permission: "cache",
    },
    // {
    //   title: "Settings",
    //   icon: Settings,
    //   path: "/admin/settings",
    // },
  ]

  // Super Admin only menu items
  const superAdminMenuItems = [
    {
      title: "Super Admin",
      icon: ShieldCheck,
      dropdown: "superAdmin",
      superAdminOnly: true,
      items: [
        { title: "Admin Management", path: "/admin/admin-management", icon: UserCog },
        { title: "Activity Logs", path: "/admin/activity-logs", icon: Activity },
      ],
    },
  ]

  // Filter menu items based on permissions
  const filterMenuItems = (items) => {
    return items.filter(item => {
      // Super admin only items
      if (item.superAdminOnly && !isSuperAdmin) {
        return false
      }
      
      // If user is super admin, show everything
      if (isSuperAdmin) {
        return true
      }
      
      // Check permission for item
      if (item.permission && !hasPermission(item.permission)) {
        return false
      }
      
      return true
    }).map(item => {
      // Filter nested items
      if (item.items) {
        return {
          ...item,
          items: filterMenuItems(item.items)
        }
      }
      return item
    }).filter(item => {
      // Remove dropdowns with no items
      if (item.dropdown && item.items && item.items.length === 0) {
        return false
      }
      return true
    })
  }

  // Combine and filter menu items
  const allMenuItems = [...menuItems, ...superAdminMenuItems]
  const filteredMenuItems = filterMenuItems(allMenuItems)

  const renderMenuItem = (item, level = 0) => {
    const paddingLeft = level === 0 ? "px-6" : level === 1 ? "px-8" : "px-12"
    const textSize = level === 0 ? "font-medium" : level === 1 ? "text-sm font-medium" : "text-sm"

    // Special case: Dropdown with only one item (e.g., Coupons)
    if (item.dropdown && item.items && item.items.length === 1) {
      const subItem = item.items[0]
      return (
        <Link
          key={item.title}
          to={subItem.path}
          className={`block ${paddingLeft} py-3 ${textSize} transition-colors duration-200 flex items-center space-x-3 ${
            isActive(subItem.path)
              ? "bg-[#505e4d] text-white border-r-2 border-[#505e4d]"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          {item.icon && <item.icon size={20} />}
          <span>{item.title}</span>
        </Link>
      )
    }

    if (item.dropdown) {
      return (
        <div key={item.title}>
          <button
            onClick={(e) => toggleDropdown(item.dropdown, e)}
            className={`w-full flex items-center justify-between ${paddingLeft} py-3 transition-colors duration-200 text-gray-700 hover:bg-gray-100`}
          >
            <div className="flex items-center space-x-3">
              {item.icon && <item.icon size={20} />}
              <span className={textSize}>{item.title}</span>
            </div>
            {openDropdowns[item.dropdown] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {openDropdowns[item.dropdown] && (
            <div className={level === 0 ? "bg-gray-50" : "bg-gray-100"}>
              {item.items.map((subItem) => renderMenuItem(subItem, level + 1))}
            </div>
          )}
        </div>
      )
    } else {
      return (
        <Link
          key={item.title}
          to={item.path}
          className={`flex items-center space-x-3 ${paddingLeft} py-2 ${textSize} transition-colors duration-200 ${
            isActive(item.path)
              ? "bg-[#505e4d] text-white border-r-4 border-[#505e4d]"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {item.icon && <item.icon size={20} />}
          <span>{item.title}</span>
        </Link>
      )
    }
  }

  return (
    <div className="w-64 bg-white shadow-lg h-screen overflow-y-auto fixed left-0 top-0 z-50 flex flex-col">
      <div className="p-6 border-b flex-shrink-0">
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
          <img src="/seenalif (1).png" alt="Seen Alif" className="h-11 w-auto object-contain" />
        </Link>
      </div>

      <nav className="mt-6 pb-20 flex-1 overflow-y-auto">
        {filteredMenuItems.map((item, index) => (
          <div key={index}>
            {item.dropdown ? (
              renderMenuItem(item)
            ) : (
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
                  isActive(item.path)
                    ? "bg-[#505e4d] text-white border-r-4 border-[#505e4d]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

export default AdminSidebar
