"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Save, Eye, EyeOff, Palette, Lock, Globe } from "lucide-react"

import config from "../../config/config"
const AdminSettings = () => {
  const [settings, setSettings] = useState({})
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  const themes = [
    { id: "blue", name: "Blue", primary: "#3B82F6", secondary: "#1F2937", accent: "#10B981" },
    { id: "green", name: "Green", primary: "#10B981", secondary: "#1F2937", accent: "#3B82F6" },
    { id: "purple", name: "Purple", primary: "#8B5CF6", secondary: "#1F2937", accent: "#F59E0B" },
    { id: "red", name: "Red", primary: "#EF4444", secondary: "#1F2937", accent: "#10B981" },
    { id: "orange", name: "Orange", primary: "#F97316", secondary: "#1F2937", accent: "#3B82F6" },
    { id: "custom", name: "Custom", primary: "#000000", secondary: "#666666", accent: "#FF0000" },
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${config.API_URL}/api/settings`)
      setSettings(data)
      setLoading(false)
    } catch (error) {
      setError("Failed to load settings. Please try again later.")
      setLoading(false)
    }
  }

  const handleSettingsSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await axios.put(`${config.API_URL}/api/settings`, settings)
      setSuccess("Settings updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      setError("Failed to update settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    try {
      setSaving(true)
      await axios.put(`${config.API_URL}/api/settings/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setSuccess("Password updated successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update password. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = (themeId) => {
    const theme = themes.find((t) => t.id === themeId)
    setSettings({
      ...settings,
      theme: themeId,
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
      accentColor: theme.accent,
    })
  }

  const tabs = [
    { id: "general", name: "General", icon: Globe },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "security", name: "Security", icon: Lock },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

        {success && <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-md">{success}</div>}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">General Settings</h2>

                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                      <input
                        type="text"
                        value={settings.siteName || ""}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Watch-Hub"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <input
                        type="text"
                        value={settings.currency || ""}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Rs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                    <textarea
                      value={settings.siteDescription || ""}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Premium watches for every occasion"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                      <input
                        type="number"
                        value={settings.taxRate || ""}
                        onChange={(e) => setSettings({ ...settings, taxRate: Number.parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Rate</label>
                      <input
                        type="number"
                        value={settings.shippingRate || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, shippingRate: Number.parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="200"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold</label>
                      <input
                        type="number"
                        value={settings.freeShippingThreshold || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, freeShippingThreshold: Number.parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5000"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={settings.contactEmail || ""}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="info@watchhub.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                      <input
                        type="tel"
                        value={settings.contactPhone || ""}
                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+971 0505033860"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">Appearance Settings</h2>

                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">Theme</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {themes.map((theme) => (
                        <div
                          key={theme.id}
                          onClick={() => handleThemeChange(theme.id)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            settings.theme === theme.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{theme.name}</span>
                            {settings.theme === theme.id && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                          <div className="flex space-x-2">
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.primary }}></div>
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.secondary }}></div>
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.accent }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {settings.theme === "custom" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                        <div className="flex">
                          <input
                            type="color"
                            value={settings.primaryColor || "#3B82F6"}
                            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                            className="w-12 h-10 border border-gray-300 rounded-l-md"
                          />
                          <input
                            type="text"
                            value={settings.primaryColor || "#3B82F6"}
                            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="#3B82F6"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                        <div className="flex">
                          <input
                            type="color"
                            value={settings.secondaryColor || "#1F2937"}
                            onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                            className="w-12 h-10 border border-gray-300 rounded-l-md"
                          />
                          <input
                            type="text"
                            value={settings.secondaryColor || "#1F2937"}
                            onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="#1F2937"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                        <div className="flex">
                          <input
                            type="color"
                            value={settings.accentColor || "#10B981"}
                            onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                            className="w-12 h-10 border border-gray-300 rounded-l-md"
                          />
                          <input
                            type="text"
                            value={settings.accentColor || "#10B981"}
                            onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="#10B981"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category Slider Shape Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Category Slider Image Shape
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div
                        onClick={() => setSettings({ ...settings, categorySliderShape: "circle" })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.categorySliderShape === "circle"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-2"></div>
                          <span className="font-medium text-sm">Circle</span>
                        </div>
                      </div>

                      <div
                        onClick={() => setSettings({ ...settings, categorySliderShape: "square" })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.categorySliderShape === "square"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 mb-2"></div>
                          <span className="font-medium text-sm">Square</span>
                        </div>
                      </div>

                      <div
                        onClick={() => setSettings({ ...settings, categorySliderShape: "triangle" })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.categorySliderShape === "triangle"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 mb-2"
                            style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
                          ></div>
                          <span className="font-medium text-sm">Triangle</span>
                        </div>
                      </div>

                      <div
                        onClick={() => setSettings({ ...settings, categorySliderShape: "octagon" })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.categorySliderShape === "octagon"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 mb-2"
                            style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
                          ></div>
                          <span className="font-medium text-sm">Octagon</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Slider Layout Type Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Category Slider Card Layout Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        onClick={() => setSettings({ ...settings, categorySliderLayoutType: "default" })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.categorySliderLayoutType === "default"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm mb-2">Default</span>
                          <p className="text-xs text-gray-600">Standard layout with image on top and text below</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setSettings({ ...settings, categorySliderLayoutType: "compact" })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.categorySliderLayoutType === "compact"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm mb-2">Compact</span>
                          <p className="text-xs text-gray-600">Smaller images with tighter spacing</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setSettings({ ...settings, categorySliderLayoutType: "modern" })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.categorySliderLayoutType === "modern"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm mb-2">Modern</span>
                          <p className="text-xs text-gray-600">Rounded borders with shadow and hover effects</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setSettings({ ...settings, categorySliderLayoutType: "minimal" })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.categorySliderLayoutType === "minimal"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm mb-2">Minimal</span>
                          <p className="text-xs text-gray-600">Clean design with subtle borders</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setSettings({ ...settings, categorySliderLayoutType: "card" })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.categorySliderLayoutType === "card"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm mb-2">Card</span>
                          <p className="text-xs text-gray-600">Elevated card design with background</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setSettings({ ...settings, categorySliderLayoutType: "banner" })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.categorySliderLayoutType === "banner"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm mb-2">Banner</span>
                          <p className="text-xs text-gray-600">Wide banner style with gradient background</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setSettings({ ...settings, categorySliderLayoutType: "circularCard" })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.categorySliderLayoutType === "circularCard"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm mb-2">Circular Card</span>
                          <p className="text-xs text-gray-600">Entire card in circular shape with centered text</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">Security Settings</h2>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {saving ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminSettings
