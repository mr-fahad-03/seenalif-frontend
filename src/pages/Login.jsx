"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useLanguage } from "../context/LanguageContext"
import TranslatedText from "../components/TranslatedText"

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { showToast } = useToast()
  const { getLocalizedPath } = useLanguage()
  
  // Check if user is coming from checkout page
  const isFromCheckout = location.state?.from?.pathname === "/checkout"

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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

      // Convert email to lowercase before sending to API
      const loginData = {
        email: formData.email.trim().toLowerCase(), // Add this conversion
        password: formData.password
      }

      const result = await login(loginData)

      if (result.success) {
        showToast && showToast("Logged in successfully!", "success")
        const redirectTo = location.state?.from?.pathname || "/"
        navigate(redirectTo, { replace: true })
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e9ede7] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-[#cfd8ca] bg-white shadow-[0_20px_55px_rgba(80,94,77,0.18)]">
        <div className="grid md:grid-cols-5">
          <section className="md:col-span-2 bg-[#505e4d] p-8 text-white">
            <h2 className="text-3xl font-extrabold tracking-tight"><TranslatedText>Welcome back</TranslatedText></h2>
            <p className="mt-3 text-sm text-slate-200">
              <TranslatedText>Sign in to manage your orders, wishlist, and account details.</TranslatedText>
            </p>
            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-slate-100">
              <TranslatedText>Secure customer access</TranslatedText>
            </div>
          </section>

          <section className="md:col-span-3 p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 animate-fade-in">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#505e4d] mb-1">
                    <TranslatedText>Email address</TranslatedText>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[#505e4d]/50" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-lg shadow-sm placeholder-[#505e4d]/45 focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#505e4d] mb-1">
                    <TranslatedText>Password</TranslatedText>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#505e4d]/50" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-10 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-lg shadow-sm placeholder-[#505e4d]/45 focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#505e4d]/50 hover:text-[#505e4d] transition-colors"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#505e4d] focus:ring-[#505e4d] border-[#505e4d]/30 rounded transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[#505e4d]">
                    <TranslatedText>Remember me</TranslatedText>
                  </label>
                </div>

                <div className="text-sm">
                  <Link to={getLocalizedPath("/forgot-password")} className="font-medium text-[#505e4d] hover:text-[#3f4b3e] transition-colors">
                    <TranslatedText>Forgot password?</TranslatedText>
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#505e4d] hover:bg-[#3f4b3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#505e4d] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <TranslatedText>Signing in...</TranslatedText>
                    </div>
                  ) : (
                    <TranslatedText>Sign in</TranslatedText>
                  )}
                </button>

                <p className="mt-4 text-md text-[#505e4d]/80">
                  <TranslatedText>Don't have an account?</TranslatedText>{" "}
                  <Link
                    to={getLocalizedPath("/register")}
                    state={isFromCheckout ? { from: { pathname: "/checkout" } } : undefined}
                    className="font-semibold text-[#505e4d] hover:text-[#3f4b3e] transition-colors"
                  >
                    <TranslatedText>Sign up</TranslatedText>
                  </Link>
                </p>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#505e4d]/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-[#505e4d]/70">
                        <TranslatedText>Or</TranslatedText>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-4 w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-[#505e4d] rounded-lg shadow-sm text-sm font-semibold text-[#505e4d] bg-white hover:bg-[#505e4d]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#505e4d] transition-all duration-200"
                    onClick={() => navigate(getLocalizedPath("/guest"))}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <TranslatedText>Continue as Guest</TranslatedText>
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Login
