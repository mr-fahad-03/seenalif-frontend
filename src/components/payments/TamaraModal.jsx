
"use client"

import { useEffect } from "react"
import { X, Shield, CheckCircle, CreditCard } from "lucide-react"

const currency = (n) =>
  `Ð ${Number(n || 0)
    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function TamaraModal({ amount = 0, onClose }) {
  const plans = [
    { months: 2, badge: "2 Payments" },
    { months: 3, badge: "3 Payments" },
    { months: 4, badge: "4 Payments" },
  ]

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
      className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-95 p-6"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-md rounded-lg shadow-md bg-white p-6 relative font-sans max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="mb-6 text-center">
          <span className="inline-block rounded-md px-3 py-1 text-black font-extrabold text-lg" style={{background: "linear-gradient(to right, #fbc7b8, #d299f3)"}}>
            tamara
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Your payment,<br />
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            your pace
          </span>
        </h2>

        {/* Plans List */}
        <div className="mb-8 space-y-3">
          {plans.map((plan) => {
            const perMonth = amount / plan.months
            return (
              <div
                key={plan.months}
                className="flex justify-between items-center rounded-full border border-gray-300 px-5 py-3 cursor-pointer hover:bg-purple-50 transition"
              >
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {currency(perMonth)}
                    <span className="text-sm font-normal text-gray-500 ml-1">/mo</span>
                  </div>
                  <div className="text-xs text-green-600 flex items-center mt-0.5">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    No fees
                  </div>
                </div>
                <span className="bg-purple-100 text-purple-600 text-sm font-semibold rounded-full px-4 py-1">
                  {plan.badge}
                </span>
              </div>
            )
          })}

          {/* Pay in Full option */}
          <div className="flex justify-between items-center rounded-full border border-gray-300 px-5 py-3 cursor-pointer hover:bg-purple-50 transition">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {currency(amount)}
              </div>
              <div className="text-xs text-green-600 flex items-center mt-0.5">
                <CheckCircle className="w-4 h-4 mr-1" />
                No fees
              </div>
            </div>
            <span className="bg-purple-100 text-purple-600 text-sm font-semibold rounded-full px-4 py-1">
              Pay in Full
            </span>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-8">
          <h3 className="text-center text-xl font-semibold mb-4">How it works?</h3>
          <div className="border border-gray-300 rounded-lg p-5 space-y-6 text-gray-800 text-sm leading-relaxed">
            {[
              {
                title: "Pick a plan that works for you",
                desc: "Choose Tamara at checkout and select the payment plan that fits your needs.",
              },
              {
                title: "Pay your first payment securely",
                desc: "Enter your card details to make your first payment safely and instantly.",
              },
              {
                title: "Stay in control",
                desc: "Track and manage all your upcoming payments easily in the Tamara app.",
              },
              {
                title: "We’ve got your back",
                desc: "Get helpful reminders before each payment, no surprises.",
              },
            ].map((step, idx) => (
              <div key={idx} className="flex space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{step.title}</p>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Tamara Section */}
        <div className="mb-6">
          <h4 className="text-center font-semibold mb-6 text-gray-900">Why Tamara?</h4>
          <div className="flex justify-around text-center text-xs text-gray-600 space-x-3">
            <div className="flex flex-col items-center space-y-1">
              <Shield className="w-6 h-6 text-green-600" />
              <span>100%<br />buyer protection</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <CheckCircle className="w-6 h-6 text-blue-500" />
              <span>Sharia<br />compliant</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <X className="w-6 h-6 text-purple-600" />
              <span>No late<br />fees</span>
            </div>
          </div>
        </div>

        {/* Disclaimer and Payment logos */}
        <div className="text-xs text-gray-500 text-center leading-relaxed">
          <p className="mb-3">
            Payment plans shown are estimates. Actual offers may vary based on your eligibility and order details. Not all merchants or products qualify for every plan, including Tamara’s long-term financing options. Approval is subject to eligibility checks and may require a down payment. Final terms, including monthly payment amounts, may change after checkout review and may exclude taxes, shipping, or other charges. For more information, see our{" "}
            <button onClick={() => alert("Show Terms & Conditions")} className="underline cursor-pointer text-purple-600 font-semibold">
              Terms & Conditions
            </button>.
          </p>

          <div className="flex justify-center space-x-4 mt-4">
            <div className="w-8 h-6 border rounded flex items-center justify-center text-xs font-bold">Pay</div>
            <div className="w-8 h-6 border rounded flex items-center justify-center text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white">MC</div>
            <div className="w-8 h-6 border rounded flex items-center justify-center text-xs font-bold bg-blue-600 text-white">VISA</div>
          </div>
        </div>
      </div>
    </div>
  )
}
