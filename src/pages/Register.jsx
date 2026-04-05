"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import TranslatedText from "../components/TranslatedText"

const Register = () => {
  const { getLocalizedPath } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const navigate = useNavigate()
  const { register } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const normalizedEmail = formData.email.trim().toLowerCase()
      await register({
        name: formData.name.trim(),
        email: normalizedEmail,
        password: formData.password,
      })

      // Keep email available even if route state is dropped (e.g. redirects/reloads)
      sessionStorage.setItem("pendingVerificationEmail", normalizedEmail)

      // Navigate to email verification page
      navigate(getLocalizedPath(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`), {
        state: { email: normalizedEmail },
        replace: true,
      })
    } catch (error) {
      setErrors({
        submit: error.message || "Registration failed. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e9ede7] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-[#cfd8ca] bg-white shadow-[0_20px_55px_rgba(80,94,77,0.18)]">
        <div className="grid md:grid-cols-5">
          <section className="md:col-span-2 bg-[#505e4d] p-8 text-white">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              <TranslatedText>Create your account</TranslatedText>
            </h2>
            <p className="mt-3 text-sm text-slate-200">
              <TranslatedText>Sign up to save your wishlist, track orders, and checkout faster.</TranslatedText>
            </p>
            <ul className="mt-8 space-y-2 text-sm text-slate-100">
              <li>- Personal order tracking</li>
              <li>- Faster repeat checkout</li>
              <li>- Better account control</li>
            </ul>
            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-slate-100">
              Account setup portal
            </div>
          </section>

          <section className="md:col-span-3 p-6 sm:p-8 lg:p-10">
            <p className="mb-5 text-sm text-[#505e4d]/80">
              <TranslatedText>Or</TranslatedText>{" "}
              <Link to={getLocalizedPath("/login")} className="font-medium text-[#505e4d] hover:text-[#3f4b3e]">
                <TranslatedText>sign in to your existing account</TranslatedText>
              </Link>
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {errors.submit && (
                <div className="rounded-md bg-red-50 p-4 border border-red-100">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{errors.submit}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#505e4d]">
                    <TranslatedText>Full Name</TranslatedText>
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-3 py-3 border ${
                        errors.name ? "border-red-300" : "border-[#d7ddd4]"
                      } bg-[#f7f9f6] placeholder-[#505e4d]/45 text-[#505e4d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] focus:z-10 sm:text-sm`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#505e4d]">
                    <TranslatedText>Email Address</TranslatedText>
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-3 py-3 border ${
                        errors.email ? "border-red-300" : "border-[#d7ddd4]"
                      } bg-[#f7f9f6] placeholder-[#505e4d]/45 text-[#505e4d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] focus:z-10 sm:text-sm`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#505e4d]">
                    <TranslatedText>Password</TranslatedText>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-3 py-3 pr-10 border ${
                        errors.password ? "border-red-300" : "border-[#d7ddd4]"
                      } bg-[#f7f9f6] placeholder-[#505e4d]/45 text-[#505e4d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] focus:z-10 sm:text-sm`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#505e4d]/50 hover:text-[#505e4d]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#505e4d]">
                    <TranslatedText>Confirm Password</TranslatedText>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-3 py-3 pr-10 border ${
                        errors.confirmPassword ? "border-red-300" : "border-[#d7ddd4]"
                      } bg-[#f7f9f6] placeholder-[#505e4d]/45 text-[#505e4d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] focus:z-10 sm:text-sm`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#505e4d]/50 hover:text-[#505e4d]"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#505e4d] hover:bg-[#3f4b3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#505e4d] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <TranslatedText>Creating Account...</TranslatedText>
                    </div>
                  ) : (
                    <TranslatedText>Create Account</TranslatedText>
                  )}
                </button>
              </div>

              <div className="mt-4">
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

              <div className="text-center">
                <p className="text-xs text-[#505e4d]/70">
                  <TranslatedText>By creating an account, you agree to our</TranslatedText>{" "}
                  <Link to={getLocalizedPath("/terms")} className="text-[#505e4d] hover:text-[#3f4b3e]">
                    <TranslatedText>Terms of Service</TranslatedText>
                  </Link>{" "}
                  <TranslatedText>and</TranslatedText>{" "}
                  <Link to={getLocalizedPath("/privacy")} className="text-[#505e4d] hover:text-[#3f4b3e]">
                    <TranslatedText>Privacy Policy</TranslatedText>
                  </Link>
                </p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Register
