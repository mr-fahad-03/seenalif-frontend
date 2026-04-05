"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { superAdminAPI } from "../../services/api"
import {
  Users,
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  Settings,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Link } from "react-router-dom"

const SuperAdminDashboard = () => {
  const { admin } = useAuth()
  const [stats, setStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    todayActivities: 0,
    totalActivities: 0,
  })
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch admins
      const adminsResponse = await superAdminAPI.getAdmins()
      const admins = adminsResponse?.admins || adminsResponse?.data?.admins || []
      
      // Fetch activity summary (total, today, week, month)
      const summaryResponse = await superAdminAPI.getActivityStats()
      const summary = summaryResponse || {}
      
      // Fetch recent logs
      const logsResponse = await superAdminAPI.getActivityLogs({ limit: 5 })
      const logs = logsResponse?.logs || logsResponse?.data?.logs || []
      
      setStats({
        totalAdmins: admins.length,
        activeAdmins: admins.filter(a => a.isAdmin || a.isSuperAdmin).length,
        todayActivities: summary.todayLogs || 0,
        totalActivities: summary.totalLogs || 0,
      })
      
      setRecentLogs(logs)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Admins",
      value: stats.totalAdmins,
      icon: Users,
      color: "green",
      trend: `${stats.totalAdmins > 0 ? '+' : ''}${stats.totalAdmins}`,
      trendUp: true,
    },
    {
      title: "Active Admins",
      value: stats.activeAdmins,
      icon: ShieldCheck,
      color: "emerald",
      trend: "Active",
      trendUp: true,
    },
    {
      title: "Today's Activities",
      value: stats.todayActivities,
      icon: Activity,
      color: "teal",
      trend: "Today",
      trendUp: stats.todayActivities > 0,
    },
    {
      title: "Total Activities",
      value: stats.totalActivities,
      icon: FileText,
      color: "cyan",
      trend: "All time",
      trendUp: true,
    },
  ]

  const quickActions = [
    {
      title: "Add New Admin",
      description: "Create a new admin account",
      icon: UserPlus,
      path: "/superadmin/admins/add",
      color: "green",
    },
    {
      title: "View Activity Logs",
      description: "Monitor all admin activities",
      icon: Activity,
      path: "/superadmin/activity-logs",
      color: "emerald",
    },
    {
      title: "Manage Permissions",
      description: "Configure admin permissions",
      icon: Settings,
      path: "/superadmin/permissions",
      color: "teal",
    },
    {
      title: "All Admins",
      description: "View and manage admin users",
      icon: Users,
      path: "/superadmin/admins",
      color: "cyan",
    },
  ]

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || ""
    switch (actionLower) {
      case "login":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "create":
        return <UserPlus className="w-4 h-4 text-blue-500" />
      case "update":
      case "status_change":
      case "approve":
        return <Settings className="w-4 h-4 text-yellow-500" />
      case "delete":
      case "reject":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "bulk_action":
        return <FileText className="w-4 h-4 text-purple-500" />
      default:
        return <Activity className="w-4 h-4 text-slate-400" />
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {admin?.name || "Super Admin"}!</h1>
            <p className="text-green-100">Here's what's happening in your Super Admin portal.</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 border border-green-100 shadow-sm hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.trendUp ? "text-green-600" : "text-red-600"}`}>
                  {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.title}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm">
          <div className="p-5 border-b border-green-100">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  to={action.path}
                  className={`p-4 rounded-xl border border-${action.color}-100 hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-all duration-200 group`}
                >
                  <div className={`w-10 h-10 bg-${action.color}-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-${action.color}-200 transition-all`}>
                    <Icon className={`w-5 h-5 text-${action.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{action.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{action.description}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm">
          <div className="p-5 border-b border-green-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <Link
              to="/superadmin/activity-logs"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="p-5">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Activity className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p>No recent activities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-green-50 transition-all"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-medium truncate">
                        {log.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{log.userName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
