"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { adminLogin } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError("")
      const result = await adminLogin(formData)
      if (result.success) {
        navigate("/admin/dashboard")
      } else {
        setError(result.message || "Invalid credentials. Please try again.")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e9ede7] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-[#cfd8ca] bg-white shadow-2xl">
        <div className="grid md:grid-cols-5">
          <section className="md:col-span-2 bg-[#505e4d] p-8 text-white">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 border border-white/20 mb-6">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold leading-tight">Admin Portal</h1>
            <p className="mt-3 text-sm text-slate-200">
              Access dashboard controls, orders, and product management securely.
            </p>
            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-slate-100">
              Protected Area
            </div>
          </section>

          <section className="md:col-span-3 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
            <p className="mt-1 text-sm text-slate-600 mb-6">Use your admin credentials to continue.</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] transition-all duration-200 text-slate-900"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] transition-all duration-200 text-slate-900"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#505e4d] hover:bg-[#465342] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                <a href="grabatoz.ae">Grab A2Z </a> &copy; All Copyrights Reserved
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
