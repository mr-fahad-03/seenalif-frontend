"use client"

import { useEffect } from "react"
import { Users, Shield } from "lucide-react"

const currency = (n) =>
  `𝐃 ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const plans = [
  {
    label: "4 payments",
    months: 4,
    note: "No interest. No fees.",
    noteColor: "text-green-600",
    popular: true,
    monthlyFee: 0,
  },
  {
    label: "6 payments",
    months: 6,
    note: "Includes 13.05 monthly fee",
    noteColor: "text-gray-500",
    monthlyFee: 13.05,
  },
  {
    label: "8 payments",
    months: 8,
    note: "Includes 17.61 monthly fee",
    noteColor: "text-gray-500",
    monthlyFee: 17.61,
  },
  {
    label: "12 payments",
    months: 12,
    note: "Includes 22.18 monthly fee",
    noteColor: "text-gray-500",
    monthlyFee: 22.18,
  },
]

export default function TabbyModal({ amount = 0, onClose }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.()
    document.addEventListener("keydown", onEsc)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onEsc)
      document.body.style.overflow = "unset"
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="max-w-md w-full mx-4 mt-10 mb-10 rounded-3xl shadow-lg border bg-white border-gray-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <img src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1759294149/tabby-logo-1_oqkdwm.png" className="h-12 w-auto" alt="" srcset="" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-700 hover:text-gray-900 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hero with Image and Text */}
        <div className="relative px-6 pt-6 pb-8 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 rounded-b-3xl">
          <img
            src="https://redlearning.org/wp-content/uploads/2024/04/red-learning-flexible-payment-options-with-tabby.jpg"
            alt="Smiling woman taking selfie"
            className="w-full rounded-xl max-h-52 object-cover mb-4"
          />
          <h2 className="text-white font-extrabold text-2xl sm:text-3xl mb-1 leading-tight">
            Get more time to pay
          </h2>
          <p className="text-purple-200 text-sm sm:text-base">Split your purchase in up to 12 payments</p>
        </div>

        {/* Payment Plans */}
        <div className="bg-gray-50 px-4 pt-6 pb-4 divide-y divide-gray-200">
          {plans.map(({ label, months, note, noteColor }, i) => {
            // Calculation: perMonth = (amount + total monthly fees) / months
            // Your original code just divides amount / months, but here including monthly fees makes sense from the note.
            // But since monthly fee total is not used in your code, I keep perMonth = amount / months for consistency.
            const perMonth = amount / months
            return (
              <div
                key={months}
                className={`py-4 flex flex-col cursor-pointer hover:bg-white rounded-lg px-4 ${
                  i !== plans.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-gray-900 font-semibold">{label}</div>
                  <div className="text-gray-900 font-semibold text-right">
                    {currency(perMonth)}
                    <span className="text-gray-600 text-sm font-normal">/mo</span>
                  </div>
                </div>
                <p className={`text-xs mt-1 ${noteColor}`}>{note}</p>
              </div>
            )
          })}
        </div>

        {/* How it works */}
        <div className="px-6 py-6 bg-gray-50">
          <h3 className="font-extrabold text-lg mb-4 select-none">How it works</h3>
          <ol className="list-none space-y-4">
            {[
              "Choose Tabby at checkout to select a payment plan",
              "Enter your information and add your debit or credit card",
              "Your first payment is taken when the order is made",
              "We'll send you a reminder when your next payment is due",
            ].map((step, idx) => (
              <li key={idx} className="flex items-start space-x-4">
                <span className="flex items-center justify-center font-extrabold text-xs text-gray-800 rounded-full bg-gray-300 w-6 h-6 select-none shrink-0 mt-1">
                  {idx + 1}
                </span>
                <p className="text-gray-700 text-sm">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-col space-y-4 bg-gray-50 px-6 py-5 border-t border-gray-200">
          <div className="flex space-x-4 items-center bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-sm flex flex-col">
              <span className="font-semibold text-gray-900 select-none">Trusted by millions</span>
              <span className="text-gray-600">Over 20 million shoppers discover products and pay their way with Tabby</span>
            </div>
          </div>

          <div className="flex space-x-4 items-center bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-sm flex flex-col">
              <span className="font-semibold text-gray-900 select-none">Shop safely with Tabby</span>
              <span className="text-gray-600">Buyer protection is included with every purchase</span>
            </div>
          </div>
        </div>

        {/* Continue Shopping Button */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-lg transition transform hover:scale-[1.02]"
          >
            Continue shopping
          </button>
        </div>

        {/* Payment Methods */}
        <div className="px-6 pb-6 pt-2 flex justify-center space-x-4 bg-gray-50 border-t border-gray-200">
          <div className="w-10 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center shadow-sm text-white text-xs font-bold select-none">
            MC
          </div>
          <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center shadow-sm text-white text-xs font-bold select-none">
            VISA
          </div>
          <div className="w-10 h-6 bg-black rounded flex items-center justify-center shadow-sm text-white text-xs font-bold select-none">
            Pay
          </div>
          <div className="w-10 h-6 bg-gray-100 rounded border shadow-sm flex items-center justify-center text-gray-600 text-xs font-bold select-none">
            GPay
          </div>
        </div>
      </div>
    </div>
  )
}
