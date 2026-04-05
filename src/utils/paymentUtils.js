/**
 * Payment utility functions for displaying payment method information
 */

/**
 * Get the display name for a payment method
 * @param {Object} order - The order object
 * @returns {string} - Display name for the payment method
 */
export const getPaymentMethodDisplay = (order) => {
  const method = order?.actualPaymentMethod || order?.paymentMethod
  switch (method?.toLowerCase()) {
    case 'tabby':
      return 'Tabby'
    case 'tamara':
      return 'Tamara'
    case 'card':
      return 'Pay by Card'
    case 'cod':
    case 'cash on delivery':
      return 'Cash on Delivery'
    case 'credit card':
    case 'debit card':
      return 'Pay by Card'
    default:
      return method || 'Cash on Delivery'
  }
}

/**
 * Get the badge color classes for a payment method
 * @param {Object} order - The order object
 * @returns {string} - Tailwind CSS classes for the badge
 */
export const getPaymentMethodBadgeColor = (order) => {
  const method = order?.actualPaymentMethod || order?.paymentMethod
  switch (method?.toLowerCase()) {
    case 'tabby':
      return 'bg-purple-100 text-purple-800'
    case 'tamara':
      return 'bg-blue-100 text-blue-800'
    case 'card':
    case 'credit card':
    case 'debit card':
      return 'bg-indigo-100 text-indigo-800'
    case 'cod':
    case 'cash on delivery':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get the icon emoji for a payment method
 * @param {Object} order - The order object
 * @returns {string} - Emoji icon for the payment method
 */
export const getPaymentMethodIcon = (order) => {
  const method = order?.actualPaymentMethod || order?.paymentMethod
  switch (method?.toLowerCase()) {
    case 'tabby':
      return '🟣'
    case 'tamara':
      return '🔵'
    case 'card':
    case 'credit card':
    case 'debit card':
      return '💳'
    case 'cod':
    case 'cash on delivery':
      return '💵'
    default:
      return '💰'
  }
}

/**
 * Check if an order is a critical order (attempted card payment but unpaid)
 * @param {Object} order - The order object
 * @returns {boolean} - True if order is critical
 */
export const isCriticalOrder = (order) => {
  if (!order) return false
  
  const method = order.actualPaymentMethod || order.paymentMethod
  const isCardPayment = ['tabby', 'tamara', 'card', 'credit card', 'debit card'].includes(method?.toLowerCase())
  const isUnpaid = !order.isPaid
  
  return isCardPayment && isUnpaid
}

/**
 * Get payment status display with method
 * @param {Object} order - The order object
 * @returns {Object} - Object with status, method, and display info
 */
export const getPaymentInfo = (order) => {
  const method = getPaymentMethodDisplay(order)
  const isPaid = order?.isPaid
  const isCritical = isCriticalOrder(order)
  
  return {
    method,
    isPaid,
    isCritical,
    statusText: isPaid ? 'Paid' : 'Unpaid',
    statusColor: isPaid ? 'bg-green-100 text-green-800' : (isCritical ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'),
    methodColor: getPaymentMethodBadgeColor(order),
    methodIcon: getPaymentMethodIcon(order),
  }
}

export default {
  getPaymentMethodDisplay,
  getPaymentMethodBadgeColor,
  getPaymentMethodIcon,
  isCriticalOrder,
  getPaymentInfo,
}
