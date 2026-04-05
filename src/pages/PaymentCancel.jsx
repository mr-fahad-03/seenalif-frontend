import React from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"

const PaymentCancel = () => {
  const navigate = useNavigate()
  const { getLocalizedPath } = useLanguage()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mb-6">
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-600">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-red-700 mb-2">Payment Cancelled</h1>
      <p className="text-lg text-gray-700 mb-6">Your payment was cancelled or declined. Your order is still pending payment.</p>
      <div className="flex gap-4">
        <button onClick={() => navigate(getLocalizedPath("/"))} className="bg-lime-500 hover:bg-lime-600 text-white rounded-lg px-6 py-3">Go to Home</button>
        <button onClick={() => navigate(getLocalizedPath("/orders"))} className="bg-gray-200 hover:bg-gray-300 text-red-700 rounded-lg px-6 py-3">View My Orders</button>
      </div>
    </div>
  )
}

export default PaymentCancel 