"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  Search,
  X,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { superAdminAPI } from "../../services/api"

const AdminManagement = () => {
  const navigate = useNavigate()
  const { isSuperAdmin } = useAuth()
  
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [search, setSearch] = useState("")
  const [permissions, setPermissions] = useState([])
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    isSuperAdmin: false,
    permissions: {}
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate("/admin/dashboard")
      return
    }
    fetchAdmins()
    fetchPermissions()
  }, [isSuperAdmin, navigate])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const data = await superAdminAPI.getAdmins({ search })
      setAdmins(data.admins || [])
    } catch (err) {
      setError(err.message || "Failed to fetch admins")
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const data = await superAdminAPI.getPermissionsList()
      setPermissions(data || [])
    } catch (err) {
      console.error("Failed to fetch permissions:", err)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdmins()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    try {
      setFormLoading(true)
      setError(null)
      
      await superAdminAPI.createAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        isSuperAdmin: formData.isSuperAdmin,
        permissions: formData.permissions
      })
      
      setSuccess("Admin created successfully!")
      setShowCreateModal(false)
      resetForm()
      fetchAdmins()
    } catch (err) {
      setError(err.message || "Failed to create admin")
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateAdmin = async (e) => {
    e.preventDefault()
    try {
      setFormLoading(true)
      setError(null)
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        isSuperAdmin: formData.isSuperAdmin,
        permissions: formData.permissions
      }
      
      if (formData.password) {
        updateData.password = formData.password
      }
      
      await superAdminAPI.updateAdmin(selectedAdmin._id, updateData)
      
      setSuccess("Admin updated successfully!")
      setShowEditModal(false)
      resetForm()
      fetchAdmins()
    } catch (err) {
      setError(err.message || "Failed to update admin")
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdatePermissions = async (e) => {
    e.preventDefault()
    try {
      setFormLoading(true)
      setError(null)
      
      await superAdminAPI.updateAdminPermissions(selectedAdmin._id, formData.permissions)
      
      setSuccess("Permissions updated successfully!")
      setShowPermissionsModal(false)
      resetForm()
      fetchAdmins()
    } catch (err) {
      setError(err.message || "Failed to update permissions")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteAdmin = async () => {
    try {
      setFormLoading(true)
      setError(null)
      
      await superAdminAPI.deleteAdmin(selectedAdmin._id)
      
      setSuccess("Admin deleted successfully!")
      setShowDeleteModal(false)
      setSelectedAdmin(null)
      fetchAdmins()
    } catch (err) {
      setError(err.message || "Failed to delete admin")
    } finally {
      setFormLoading(false)
    }
  }

  const openEditModal = (admin) => {
    setSelectedAdmin(admin)
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      isSuperAdmin: admin.isSuperAdmin || false,
      permissions: admin.adminPermissions || {}
    })
    setShowEditModal(true)
  }

  const openPermissionsModal = (admin) => {
    setSelectedAdmin(admin)
    setFormData({
      ...formData,
      permissions: admin.adminPermissions || {}
    })
    setShowPermissionsModal(true)
  }

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      isSuperAdmin: false,
      permissions: {}
    })
    setSelectedAdmin(null)
    setShowPassword(false)
  }

  const togglePermission = (key) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }))
  }

  const toggleAllPermissions = (value) => {
    const newPermissions = {}
    permissions.forEach(perm => {
      newPermissions[perm.key] = value
    })
    setFormData(prev => ({
      ...prev,
      permissions: newPermissions
    }))
  }

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  if (!isSuperAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-lime-600" />
              Admin Management
            </h1>
            <p className="text-gray-600 mt-1">Manage admin users and their permissions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Admin
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search admins by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
            />
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-600"></div>
            </div>
          ) : admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Users className="h-12 w-12 mb-2" />
              <p>No admin users found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-lime-100 rounded-full flex items-center justify-center">
                          {admin.isSuperAdmin ? (
                            <ShieldCheck className="h-5 w-5 text-lime-600" />
                          ) : (
                            <Shield className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.isSuperAdmin ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Super Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.isSuperAdmin ? (
                        <span className="text-sm text-gray-500">Full Access</span>
                      ) : admin.adminPermissions?.fullAccess ? (
                        <span className="text-sm text-gray-500">Full Access</span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {Object.values(admin.adminPermissions || {}).filter(Boolean).length} permissions
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openPermissionsModal(admin)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Manage Permissions"
                        >
                          <Shield className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(admin)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit Admin"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(admin)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Admin"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create New Admin</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateAdmin} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isSuperAdmin"
                    checked={formData.isSuperAdmin}
                    onChange={(e) => setFormData({ ...formData, isSuperAdmin: e.target.checked })}
                    className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isSuperAdmin" className="ml-2 block text-sm text-gray-900">
                    Make Super Admin (full access to everything)
                  </label>
                </div>
                
                {!formData.isSuperAdmin && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Permissions</label>
                      <div className="space-x-2">
                        <button type="button" onClick={() => toggleAllPermissions(true)} className="text-xs text-lime-600 hover:underline">
                          Select All
                        </button>
                        <button type="button" onClick={() => toggleAllPermissions(false)} className="text-xs text-red-600 hover:underline">
                          Clear All
                        </button>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {permissions.map((perm) => (
                          <label key={perm.key} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={formData.permissions[perm.key] || false}
                              onChange={() => togglePermission(perm.key)}
                              className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Create Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Edit Admin</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateAdmin} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsSuperAdmin"
                    checked={formData.isSuperAdmin}
                    onChange={(e) => setFormData({ ...formData, isSuperAdmin: e.target.checked })}
                    className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editIsSuperAdmin" className="ml-2 block text-sm text-gray-900">
                    Super Admin (full access to everything)
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Manage Permissions</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedAdmin.name} ({selectedAdmin.email})</p>
              </div>
              <button onClick={() => { setShowPermissionsModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdatePermissions} className="p-6">
              {selectedAdmin.isSuperAdmin ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-purple-800">
                    <ShieldCheck className="h-5 w-5 inline mr-2" />
                    This user is a Super Admin and has full access to all features.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="fullAccess"
                        checked={formData.permissions.fullAccess || false}
                        onChange={() => togglePermission('fullAccess')}
                        className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded"
                      />
                      <label htmlFor="fullAccess" className="ml-2 block text-sm font-medium text-gray-900">
                        Full Access (all permissions)
                      </label>
                    </div>
                    <div className="space-x-2">
                      <button type="button" onClick={() => toggleAllPermissions(true)} className="text-xs text-lime-600 hover:underline">
                        Select All
                      </button>
                      <button type="button" onClick={() => toggleAllPermissions(false)} className="text-xs text-red-600 hover:underline">
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                      {permissions.filter(p => p.key !== 'fullAccess').map((perm) => (
                        <label 
                          key={perm.key} 
                          className={`flex items-start cursor-pointer p-2 rounded ${formData.permissions[perm.key] ? 'bg-lime-50 border border-lime-200' : 'hover:bg-gray-50 border border-transparent'}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions[perm.key] || false}
                            onChange={() => togglePermission(perm.key)}
                            className="h-4 w-4 mt-0.5 text-lime-600 focus:ring-lime-500 border-gray-300 rounded"
                          />
                          <div className="ml-2">
                            <span className="text-sm font-medium text-gray-900">{perm.label}</span>
                            <p className="text-xs text-gray-500">{perm.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowPermissionsModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                {!selectedAdmin.isSuperAdmin && (
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 disabled:opacity-50"
                  >
                    {formLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Permissions
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Delete Admin</h2>
              <p className="text-gray-500 text-center mb-6">
                Are you sure you want to delete <strong>{selectedAdmin.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setSelectedAdmin(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAdmin}
                  disabled={formLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminManagement
