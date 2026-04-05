import config from "../config/config.js"
import api, { endpoints } from "./api.js"

// Tamara Payment Service
export const tamaraPaymentService = {
  createSession: async (orderData) => {
    try {
      const response = await api.post(endpoints.payment.tamara, {
        ...orderData,
        merchant_url: {
          success: `${window.location.origin}/payment/success`,
          failure: `${window.location.origin}/payment/failure`,
          cancel: `${window.location.origin}/payment/cancel`,
          notification: `${config.API_URL}/api/payment/tamara/webhook`,
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Tamara payment error:", error)
      throw error
    }
  },

  redirectToCheckout: (checkoutUrl) => {
    window.location.href = checkoutUrl
  },
}

// Tabby Payment Service
export const tabbyPaymentService = {
  createSession: async (orderData) => {
    try {
      const response = await api.post(endpoints.payment.tabby, {
        ...orderData,
        merchant_code: config.TABBY_MERCHANT_CODE,
        merchant_urls: {
          success: `${window.location.origin}/payment/success`,
          cancel: `${window.location.origin}/payment/cancel`,
          failure: `${window.location.origin}/payment/failure`,
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Tabby payment error:", error)
      throw error
    }
  },

  redirectToCheckout: (checkoutUrl) => {
    window.location.href = checkoutUrl
  },
}

// N-Genius Payment Service
export const ngeniusPaymentService = {
  createOrder: async (orderData) => {
    try {
      const response = await api.post(endpoints.payment.ngenius, orderData)
      const data = await response.json()
      return data
    } catch (error) {
      console.error("N-Genius payment error:", error)
      throw error
    }
  },

  processPayment: (paymentUrl) => {
    window.location.href = paymentUrl
  },
}

// Generic Payment Service
export const paymentService = {
  processPayment: async (paymentMethod, orderData) => {
    switch (paymentMethod) {
      case "tamara":
        return await tamaraPaymentService.createSession(orderData)
      case "tabby":
        return await tabbyPaymentService.createSession(orderData)
      case "ngenius":
        return await ngeniusPaymentService.createOrder(orderData)
      default:
        throw new Error("Unsupported payment method")
    }
  },
}

export default paymentService
