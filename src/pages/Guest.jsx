import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import '../styles/phoneInput.css'
import config from "../config/config"

const UAE_STATES = [
  "Abu Dhabi",
  "Ajman",
  "Al Ain",
  "Dubai",
  "Fujairah",
  "Ras Al Khaimah",
  "Sharjah",
  "Umm al-Qaywain",
]

const Guest = () => {
  const navigate = useNavigate()
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    zipCode: "",
    state: "",
    city: "",
    country: "UAE",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Email verification states
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationVerified, setVerificationVerified] = useState(false)
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [originalEmail, setOriginalEmail] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setGuestInfo({ ...guestInfo, [name]: value })
    
    // Reset verification if email changes
    if (name === "email" && value !== originalEmail) {
      setVerificationSent(false)
      setVerificationVerified(false)
      setVerificationCode("")
    }
  }

  const handlePhoneChange = (value) => {
    setGuestInfo({ ...guestInfo, phone: value || "" })
  }

  const handleSendVerificationCode = async () => {
    if (!guestInfo.email || !/^\S+@\S+\.\S+$/.test(guestInfo.email)) {
      setError("Please enter a valid email address first.")
      return
    }
    
    setVerificationLoading(true)
    setError("")
    try {
      const response = await axios.post(`${config.API_URL}/api/request-callback/send-verification`, {
        email: guestInfo.email
      })
      setVerificationSent(true)
      setOriginalEmail(guestInfo.email)
      setError("")
      console.log('Verification code sent successfully:', response.data)
    } catch (error) {
      console.error("Error sending verification code:", error)
      // Even if email sending fails, the code might be generated on server
      // Show a message to check server logs in development
      if (process.env.NODE_ENV === 'development') {
        setError("Email sending failed. Check server console for verification code.")
      } else {
        setError("Failed to send verification code. Please try again or contact support.")
      }
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code.")
      return
    }
    
    setVerificationLoading(true)
    setError("")
    try {
      await axios.post(`${config.API_URL}/api/request-callback/verify-code`, {
        email: guestInfo.email,
        code: verificationCode
      })
      setVerificationVerified(true)
      setError("")
    } catch (error) {
      console.error("Error verifying code:", error)
      setError(error.response?.data?.message || "Invalid verification code. Please try again.")
    } finally {
      setVerificationLoading(false)
    }
  }

  const validate = () => {
    if (!guestInfo.name || !guestInfo.email || !guestInfo.phone || !guestInfo.address || !guestInfo.zipCode || !guestInfo.state || !guestInfo.city) {
      setError("Please fill in all required fields.")
      return false
    }
    if (!/^\S+@\S+\.\S+$/.test(guestInfo.email)) {
      setError("Please enter a valid email address.")
      return false
    }
    if (!verificationVerified) {
      setError("Please verify your email address before continuing.")
      return false
    }
    if (!guestInfo.phone || guestInfo.phone.length < 8) {
      setError("Please enter a valid phone number.")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!validate()) return
    setLoading(true)
    
    // Save guest info and shipping address to localStorage
    localStorage.setItem("guestInfo", JSON.stringify({
      name: guestInfo.name,
      email: guestInfo.email,
      phone: guestInfo.phone,
    }))
    localStorage.setItem("savedShippingAddress", JSON.stringify({
      name: guestInfo.name,
      address: guestInfo.address,
      zipCode: guestInfo.zipCode,
      state: guestInfo.state,
      city: guestInfo.city,
      country: guestInfo.country,
      email: guestInfo.email,
      phone: guestInfo.phone,
    }))
    
    // Register guest as a user in the background (non-blocking)
    // This creates an account and sends them login credentials via email
    try {
      await axios.post(`${config.API_URL}/api/users/register-guest`, {
        name: guestInfo.name,
        email: guestInfo.email,
        phone: guestInfo.phone,
        address: {
          address: guestInfo.address,
          zipCode: guestInfo.zipCode,
          state: guestInfo.state,
          city: guestInfo.city,
          country: guestInfo.country,
        }
      })
      console.log('Guest account created successfully, credentials sent via email')
    } catch (error) {
      // Don't block the checkout flow if account creation fails
      console.error('Failed to create guest account:', error)
    }
    
    setLoading(false)
    navigate("/checkout?step=3")
  }

  return (
    <div className="min-h-screen bg-[#e9ede7] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-[#cfd8ca] bg-white shadow-[0_20px_55px_rgba(80,94,77,0.18)]">
        <div className="grid md:grid-cols-5">
          <section className="md:col-span-2 bg-[#505e4d] p-8 text-white">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">Continue as Guest</h2>
            <p className="mt-3 text-sm text-slate-200">
              Place your order quickly without creating a password right now.
            </p>
            <ul className="mt-8 space-y-2 text-sm text-slate-100">
              <li>- Fast checkout process</li>
              <li>- Email verification for security</li>
              <li>- Shipping details saved for this order</li>
            </ul>
            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-slate-100">
              Secure guest checkout
            </div>
          </section>

          <section className="md:col-span-3 p-6 sm:p-8 lg:p-10">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 animate-fade-in mb-5">
                {error}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
              <div>
                <label htmlFor="guest-name" className="block text-sm font-medium text-[#505e4d] mb-1">Name *</label>
                <input
                  id="guest-name"
                  name="name"
                  type="text"
                  required
                  value={guestInfo.name}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] text-[#505e4d]"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email with verification */}
              <div>
                <label htmlFor="guest-email" className="block text-sm font-medium text-[#505e4d] mb-1">E-mail *</label>
                <div className="flex gap-2">
                  <input
                    id="guest-email"
                    name="email"
                    type="email"
                    required
                    value={guestInfo.email}
                    onChange={handleChange}
                    disabled={verificationVerified}
                    className={`block flex-1 px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] text-[#505e4d] ${
                      verificationVerified ? "bg-[#eef1ec] border-[#505e4d]/40" : "bg-[#f7f9f6] border-[#d7ddd4]"
                    }`}
                    placeholder="Enter your email"
                  />
                  {!verificationVerified && (
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={verificationLoading || !guestInfo.email}
                      className="px-3 py-3 bg-[#505e4d] text-white text-sm font-medium rounded-lg hover:bg-[#3f4b3e] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {verificationLoading ? "Sending..." : verificationSent ? "Resend" : "Verify"}
                    </button>
                  )}
                </div>

                {/* Verification code input */}
                {verificationSent && !verificationVerified && (
                  <div className="mt-3 p-3 bg-[#eef1ec] rounded-lg border border-[#505e4d]/20">
                    <p className="text-xs text-[#505e4d] mb-2">A verification code has been sent to your email.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="block flex-1 px-3 py-3 bg-white border border-[#d7ddd4] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] text-center tracking-widest text-[#505e4d]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={verificationLoading || verificationCode.length !== 6}
                        className="px-4 py-3 bg-[#505e4d] text-white text-sm font-medium rounded-lg hover:bg-[#3f4b3e] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {verificationLoading ? "..." : "Confirm"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Verified badge */}
                {verificationVerified && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#c7cec2] bg-[#edf1eb] px-3 py-1 text-[#505e4d] text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Email verified
                  </div>
                )}
              </div>

              {/* Phone Number with International Input */}
              <div>
                <label htmlFor="guest-phone" className="block text-sm font-medium text-[#505e4d] mb-1">Phone Number *</label>
                <PhoneInput
                  international
                  defaultCountry="AE"
                  value={guestInfo.phone}
                  onChange={handlePhoneChange}
                  className="w-full guest-phone-input"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label htmlFor="guest-address" className="block text-sm font-medium text-[#505e4d] mb-1">Address *</label>
                <input
                  id="guest-address"
                  name="address"
                  type="text"
                  required
                  value={guestInfo.address}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] text-[#505e4d]"
                  placeholder="Enter your address"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label htmlFor="guest-state" className="block text-sm font-medium text-[#505e4d] mb-1">State/Region *</label>
                  <select
                    id="guest-state"
                    name="state"
                    required
                    value={guestInfo.state}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] text-[#505e4d]"
                  >
                    <option value="">Select State</option>
                    {UAE_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="w-1/2">
                  <label htmlFor="guest-city" className="block text-sm font-medium text-[#505e4d] mb-1">City *</label>
                  <input
                    id="guest-city"
                    name="city"
                    type="text"
                    required
                    value={guestInfo.city}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] text-[#505e4d]"
                    placeholder="City"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label htmlFor="guest-zip" className="block text-sm font-medium text-[#505e4d] mb-1">Zip Code *</label>
                  <input
                    id="guest-zip"
                    name="zipCode"
                    type="text"
                    required
                    value={guestInfo.zipCode}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] text-[#505e4d]"
                    placeholder="Zip Code"
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="guest-country" className="block text-sm font-medium text-[#505e4d] mb-1">Country</label>
                  <select
                    id="guest-country"
                    name="country"
                    value={guestInfo.country}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-[#d7ddd4] rounded-lg shadow-sm focus:outline-none text-[#505e4d] bg-[#eef1ec]"
                    disabled
                  >
                    <option value="UAE">UAE</option>
                  </select>
                </div>
              </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 mt-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#505e4d] hover:bg-[#3f4b3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#505e4d] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !verificationVerified}
              >
                {loading ? "Continuing..." : "Continue to Payment"}
              </button>
              {!verificationVerified && (
                <p className="text-xs text-center text-[#505e4d]/70 mt-2">
                  Please verify your email before continuing
                </p>
              )}
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Guest 
