"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  PackagePlus,
  ClipboardList,
  UserPlus,
  Sparkles,
  Clock3,
} from "lucide-react"
import { adminAPI } from "../../services/api"

const getStatusClasses = (status = "") => {
  const normalizedStatus = status.toLowerCase()

  if (normalizedStatus.includes("process")) return "bg-amber-100 text-amber-800 border border-amber-200"
  if (normalizedStatus.includes("ship")) return "bg-sky-100 text-sky-800 border border-sky-200"
  if (normalizedStatus.includes("deliver")) return "bg-emerald-100 text-emerald-800 border border-emerald-200"
  if (normalizedStatus.includes("cancel")) return "bg-rose-100 text-rose-800 border border-rose-200"
  return "bg-slate-100 text-slate-700 border border-slate-200"
}

const AdminDashboard = () => {
  const { admin } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const formatPrice = (price) => `AED ${Number(price || 0).toLocaleString()}`

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await adminAPI.getDashboardStats()
        setStats(statsData)
        const ordersData = await adminAPI.getRecentOrders()
        setRecentOrders(ordersData)
        setLoading(false)
      } catch {
        setError("Failed to load dashboard data. Please try again later.")
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const metricCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      chip: "Live",
      accent: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      chip: "Finance",
      accent: "from-sky-500 to-indigo-600",
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: TrendingUp,
      chip: "Catalog",
      accent: "from-amber-500 to-orange-600",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      chip: "Audience",
      accent: "from-slate-700 to-slate-900",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9]">
        <AdminSidebar />

        <div className="ml-72 flex h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-[#feee00]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f1f5f9]">
        <AdminSidebar />

        <div className="ml-72 p-8">
          <div className="rounded-2xl border border-red-200 bg-white p-5 text-red-700 shadow-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <AdminSidebar />

      <div className="relative ml-72 min-h-screen overflow-hidden p-6 lg:p-8" style={{ fontFamily: '"Sora", "Noto Sans Arabic", sans-serif' }}>
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />

        <div className="relative z-10 space-y-6">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-100 via-white to-emerald-50 p-6 text-slate-900 shadow-xl lg:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.16),transparent_40%)]" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Admin Control Hub
                </p>
                <h1 className="mt-3 text-2xl font-semibold md:text-3xl">
                  Welcome back{admin?.name ? `, ${admin.name}` : ""}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  {new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/admin/orders"
                  className="inline-flex items-center gap-2 rounded-full bg-[#feee00] px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <ClipboardList className="h-4 w-4" />
                  Review Orders
                </Link>
                <Link
                  to="/admin/products/add"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  <PackagePlus className="h-4 w-4" />
                  Add Product
                </Link>
              </div>
            </div>

            <div className="relative mt-6 grid grid-cols-2 gap-3 lg:max-w-3xl lg:grid-cols-4">
              <div className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700">
                Orders: <span className="font-semibold text-slate-900">{stats.totalOrders}</span>
              </div>
              <div className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700">
                Revenue: <span className="font-semibold text-slate-900">{formatPrice(stats.totalRevenue)}</span>
              </div>
              <div className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700">
                Products: <span className="font-semibold text-slate-900">{stats.totalProducts}</span>
              </div>
              <div className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700">
                Users: <span className="font-semibold text-slate-900">{stats.totalUsers}</span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card, index) => (
              <div
                key={card.label}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animation: `fadeUp 420ms ease ${index * 70}ms both` }}
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-r p-2.5 text-white shadow-sm ${card.accent}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{card.chip}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                    <ArrowUpRight className="h-4 w-4" />
                    Updated now
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
                <Link to="/admin/orders" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                  View all
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/70">
                    <tr>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Order ID</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Customer</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Date</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Status</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td className="px-6 py-8 text-sm text-slate-500" colSpan={5}>
                          No recent orders yet.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order._id} className="transition hover:bg-slate-50/80">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm font-semibold text-emerald-700">
                              <Link to="/admin/orders" state={{ orderId: order._id }}>
                                #{order._id.slice(-6)}
                              </Link>
                            </div>
                            <div className="text-xs text-slate-500">{order.deliveryType || "standard"}</div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {order.deliveryType === "pickup" ? (
                              <>
                                <div className="text-sm text-slate-900">{order.pickupDetails?.location || "N/A"}</div>
                                <div className="text-xs text-slate-500">{order.pickupDetails?.phone || "N/A"}</div>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-slate-900">{order.shippingAddress?.name || "N/A"}</div>
                                <div className="text-xs text-slate-500">{order.shippingAddress?.email || "N/A"}</div>
                              </>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                            {formatPrice(order.totalPrice)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Essentials</span>
                </div>
                <div className="mt-5 grid gap-3">
                  <Link
                    to="/admin/orders"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <span className="flex items-center gap-3">
                      <ClipboardList className="h-5 w-5 text-emerald-700" />
                      Review Orders
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-emerald-700" />
                  </Link>
                  <Link
                    to="/admin/products"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 text-amber-600" />
                      Manage Products
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-amber-600" />
                  </Link>
                  <Link
                    to="/admin/products/add"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <span className="flex items-center gap-3">
                      <PackagePlus className="h-5 w-5 text-teal-700" />
                      Add New Product
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-teal-700" />
                  </Link>
                  <Link
                    to="/admin/users"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <span className="flex items-center gap-3">
                      <UserPlus className="h-5 w-5 text-slate-800" />
                      View Users
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-800" />
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-md">
                <div className="flex items-center gap-2 text-slate-800">
                  <Clock3 className="h-5 w-5 text-emerald-700" />
                  <h3 className="text-base font-semibold">Today Snapshot</h3>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                    <span className="text-slate-600">Orders in system</span>
                    <span className="font-semibold text-slate-900">{stats.totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                    <span className="text-slate-600">Active products</span>
                    <span className="font-semibold text-slate-900">{stats.totalProducts}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                    <span className="text-slate-600">Registered users</span>
                    <span className="font-semibold text-slate-900">{stats.totalUsers}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                    <span className="text-slate-600">Revenue total</span>
                    <span className="font-semibold text-slate-900">{formatPrice(stats.totalRevenue)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard

