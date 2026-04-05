"use client"

import { useState, useEffect } from "react"
import { superAdminAPI } from "../../services/api"
import { useToast } from "../../context/ToastContext"
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Shield,
  ShieldCheck,
  ShieldOff,
  Eye,
  EyeOff,
  X,
  Check,
  Mail,
  Lock,
  User,
  ChevronDown,
  ChevronUp,
  Save,
  RefreshCw,
} from "lucide-react"

const SuperAdminManagement = () => {
  const { showToast } = useToast()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [permissionsList, setPermissionsList] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    isAdmin: true,
    isSuperAdmin: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [existingUser, setExistingUser] = useState(null)
  const [checkingEmail, setCheckingEmail] = useState(false)

  useEffect(() => {
    fetchAdmins()
    fetchPermissionsList()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await superAdminAPI.getAdmins()
      // API returns { admins: [...] } directly, not wrapped in data
      setAdmins(response?.admins || response?.data?.admins || [])
    } catch (error) {
      showToast("Failed to fetch admins", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissionsList = async () => {
    try {
      const response = await superAdminAPI.getPermissionsList()
      setPermissionsList(response?.permissions || response?.data?.permissions || [])
    } catch (error) {
      console.error("Failed to fetch permissions list:", error)
    }
  }

  const checkEmailExists = async (email) => {
    if (!email || email.length < 3) {
      setExistingUser(null)
      return
    }

    try {
      setCheckingEmail(true)
      const response = await superAdminAPI.checkUserByEmail(email)
      
      if (response.exists) {
        const user = response.user
        // If user is already an admin, show error
        if (user.isAdmin) {
          showToast("This user is already an admin", "error")
          setExistingUser(null)
        } else {
          // User exists but is not an admin - show promotion option
          setExistingUser(user)
        }
      } else {
        setExistingUser(null)
      }
    } catch (error) {
      console.error("Error checking email:", error)
      setExistingUser(null)
    } finally {
      setCheckingEmail(false)
    }
  }

  const handlePromoteToAdmin = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await superAdminAPI.promoteToAdmin(existingUser._id, {
        isSuperAdmin: formData.isSuperAdmin,
        permissions: { fullAccess: false },
      })
      showToast("User promoted to admin successfully", "success")
      setShowCreateModal(false)
      resetForm()
      setExistingUser(null)
      fetchAdmins()
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to promote user", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    
    // If existing user found, promote them instead
    if (existingUser) {
      handlePromoteToAdmin(e)
      return
    }

    try {
      setSaving(true)
      await superAdminAPI.createAdmin(formData)
      showToast("Admin created successfully", "success")
      setShowCreateModal(false)
      resetForm()
      fetchAdmins()
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to create admin", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateAdmin = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const updateData = { ...formData }
      if (!updateData.password) delete updateData.password
      await superAdminAPI.updateAdmin(selectedAdmin._id, updateData)
      showToast("Admin updated successfully", "success")
      setShowEditModal(false)
      resetForm()
      fetchAdmins()
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update admin", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAdmin = async () => {
    try {
      setSaving(true)
      await superAdminAPI.deleteAdmin(selectedAdmin._id)
      showToast("Admin deleted successfully", "success")
      setShowDeleteModal(false)
      setSelectedAdmin(null)
      fetchAdmins()
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete admin", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePermissions = async (permissions) => {
    try {
      setSaving(true)
      await superAdminAPI.updateAdminPermissions(selectedAdmin._id, permissions)
      showToast("Permissions updated successfully", "success")
      setShowPermissionsModal(false)
      fetchAdmins()
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update permissions", "error")
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      isAdmin: true,
      isSuperAdmin: false,
    })
    setSelectedAdmin(null)
    setExistingUser(null)
  }

  const openEditModal = (admin) => {
    setSelectedAdmin(admin)
    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
      phone: admin.phone || "",
      isAdmin: admin.isAdmin,
      isSuperAdmin: admin.isSuperAdmin || false,
    })
    setShowEditModal(true)
  }

  const openPermissionsModal = (admin) => {
    setSelectedAdmin(admin)
    setShowPermissionsModal(true)
  }

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin)
    setShowDeleteModal(true)
  }

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Management</h1>
          <p className="text-slate-600">Manage admin users and their permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowCreateModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all shadow-lg shadow-green-200"
        >
          <UserPlus className="w-5 h-5" />
          Add New Admin
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
          />
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading admins...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No admins found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50 border-b border-green-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Admin</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-green-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${admin.isSuperAdmin ? "bg-green-500" : "bg-slate-200"}`}>
                          {admin.isSuperAdmin ? (
                            <ShieldCheck className="w-5 h-5 text-white" />
                          ) : (
                            <User className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{admin.name}</p>
                          <p className="text-sm text-slate-500">{admin.phone || "No phone"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        admin.isSuperAdmin
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {admin.isSuperAdmin ? (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            Super Admin
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            Admin
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        admin.isAdmin
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {admin.isAdmin ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openPermissionsModal(admin)}
                          className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-all"
                          title="Manage Permissions"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-all"
                          title="Edit Admin"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(admin)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-all"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-green-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {showEditModal ? "Edit Admin" : "Create New Admin"}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={showEditModal ? handleUpdateAdmin : handleCreateAdmin} className="p-6 space-y-4">
              {/* Email Field - Always visible for create, show check functionality */}
              {!showEditModal && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        setExistingUser(null)
                      }}
                      onBlur={(e) => checkEmailExists(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter email"
                      required
                    />
                    {checkingEmail && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <RefreshCw className="w-5 h-5 text-green-500 animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  {/* Existing User Alert */}
                  {existingUser && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900">User Already Exists</p>
                          <p className="text-sm text-blue-700 mt-1">
                            <strong>{existingUser.name}</strong> is already registered with this email.
                          </p>
                          <p className="text-sm text-blue-600 mt-2">
                            Click "Promote to Admin" to make this user an admin without entering additional details.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Name Field - Hide if existing user found */}
              {!existingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter name"
                      required={!existingUser}
                      disabled={showEditModal}
                    />
                  </div>
                </div>
              )}

              {/* Email Field - For edit mode */}
              {showEditModal && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Password Field - Hide if existing user found */}
              {!existingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password {showEditModal && "(leave blank to keep current)"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter password"
                      required={!showEditModal && !existingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSuperAdmin}
                    onChange={(e) => setFormData({ ...formData, isSuperAdmin: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-slate-700">Super Admin</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all disabled:opacity-50"
                >
                  {saving 
                    ? "Saving..." 
                    : showEditModal 
                      ? "Update Admin" 
                      : existingUser 
                        ? "Promote to Admin" 
                        : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedAdmin && (
        <PermissionsModal
          admin={selectedAdmin}
          permissionsList={permissionsList}
          onClose={() => {
            setShowPermissionsModal(false)
            setSelectedAdmin(null)
          }}
          onSave={handleUpdatePermissions}
          saving={saving}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Admin?</h2>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete <strong>{selectedAdmin.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedAdmin(null)
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAdmin}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {saving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Permissions Modal Component
const PermissionsModal = ({ admin, permissionsList, onClose, onSave, saving }) => {
  const [permissions, setPermissions] = useState(admin.adminPermissions || {})
  const [expandedCategories, setExpandedCategories] = useState({})

  // Comprehensive permission categories matching AdminSidebar
  const permissionCategories = {
    "General Access": [
      { key: "fullAccess", label: "Full Access (All Permissions)" },
      { key: "dashboard", label: "Dashboard" },
    ],
    "Product Management": [
      { key: "products", label: "Products (List, Add, Edit, Delete)" },
      { key: "categories", label: "Categories" },
      { key: "subcategories", label: "Sub Categories (All Levels)" },
      { key: "brands", label: "Brands" },
      { key: "volumes", label: "Volumes" },
      { key: "warranty", label: "Warranty" },
      { key: "colors", label: "Colors" },
      { key: "units", label: "Units" },
      { key: "tax", label: "Tax" },
      { key: "sizes", label: "Sizes" },
    ],
    "Orders & Shipping": [
      { key: "orders", label: "Orders (All Status)" },
      { key: "deliveryCharges", label: "Delivery Charges" },
      { key: "stockAdjustment", label: "Stock & Price Adjustment" },
    ],
    "Content Management": [
      { key: "blogs", label: "Blogs (Posts, Comments, Dashboard)" },
      { key: "banners", label: "Banners" },
      { key: "homeSections", label: "Home Sections" },
      { key: "offerPages", label: "Offer Pages" },
      { key: "gamingZone", label: "Gaming Zone" },
    ],
    "Users & Reviews": [
      { key: "users", label: "Users" },
      { key: "reviews", label: "Reviews (All Status)" },
      { key: "requestCallbacks", label: "Request Callbacks" },
      { key: "bulkPurchase", label: "Bulk Purchase Requests" },
      { key: "buyerProtection", label: "Buyer Protection" },
    ],
    "Marketing & SEO": [
      { key: "coupons", label: "Coupons" },
      { key: "seoSettings", label: "SEO Settings & Redirects" },
      { key: "emailTemplates", label: "Email Templates" },
      { key: "newsletter", label: "Newsletter Subscribers" },
    ],
    "System Settings": [
      { key: "cache", label: "Reset Cache" },
    ],
    "Super Admin": [
      { key: "adminManagement", label: "Admin Management" },
      { key: "activityLogs", label: "Activity Logs" },
    ],
  }

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const togglePermission = (permission) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }))
  }

  const toggleCategoryAll = (category, value) => {
    const categoryPermissions = permissionCategories[category]
    const newPermissions = { ...permissions }
    categoryPermissions.forEach((p) => {
      newPermissions[p.key] = value
    })
    setPermissions(newPermissions)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Manage Permissions</h2>
              <p className="text-slate-600">{admin.name} ({admin.email})</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {Object.entries(permissionCategories).map(([category, perms]) => (
              <div key={category} className="border border-green-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-200 text-green-700">
                      {perms.filter(p => permissions[p.key]).length}/{perms.length}
                    </span>
                  </div>
                  {expandedCategories[category] ? (
                    <ChevronUp className="w-5 h-5 text-slate-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  )}
                </button>
                {expandedCategories[category] && (
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => toggleCategoryAll(category, true)}
                        className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => toggleCategoryAll(category, false)}
                        className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        Deselect All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((permission) => (
                        <label
                          key={permission.key}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            permissions[permission.key] 
                              ? "border-green-400 bg-green-50" 
                              : "border-slate-200 hover:border-green-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={permissions[permission.key] || false}
                            onChange={() => togglePermission(permission.key)}
                            className="w-5 h-5 rounded border-slate-300 text-green-500 focus:ring-green-500"
                          />
                          <span className={`text-sm ${permissions[permission.key] ? "text-green-700 font-medium" : "text-slate-700"}`}>
                            {permission.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-green-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(permissions)}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Permissions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminManagement
