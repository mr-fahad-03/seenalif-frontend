export function getInvoiceBreakdown(order = {}) {
  // Calculate subtotal from order items if available (more accurate than stored itemsPrice)
  let subtotal = Number(order.itemsPrice || 0)
  
  // Recalculate subtotal from order items to ensure accuracy (handles variations correctly)
  if (Array.isArray(order.orderItems) && order.orderItems.length > 0) {
    const calculatedSubtotal = order.orderItems.reduce((sum, item) => {
      const itemPrice = Number(item.price) || 0
      const quantity = Number(item.quantity) || 1
      return sum + (itemPrice * quantity)
    }, 0)
    
    // Use calculated subtotal if it's higher (indicates stored value might be wrong)
    if (calculatedSubtotal > subtotal) {
      subtotal = calculatedSubtotal
    }
  }
  
  const shipping = Number(order.shippingPrice || 0)
  const tax = Number(order.taxPrice || 0)
  const storedTotal = Number(order.totalPrice || 0)
  
  // Only use discount if there's an actual coupon code or explicit discount amount
  const couponCode = (order.couponCode || "").trim()
  const rawDiscount = Number(order.discountAmount || 0)
  
  // Only apply discount if there's an actual coupon code OR explicit discount amount > 0
  const hasActualCoupon = couponCode.length > 0 || rawDiscount > 0
  const couponDiscount = hasActualCoupon ? rawDiscount : 0
  const manualDiscount = 0

  const vatRate = 0.05
  const derivedVat = subtotal > 0 ? Number((subtotal * vatRate).toFixed(2)) : 0
  const vat = tax > 0 ? tax : derivedVat

  // Calculate the correct total from items
  const calculatedTotal = subtotal + shipping - couponDiscount
  
  // Use the higher of stored total or calculated total (handles incorrect stored values)
  const displayTotal = calculatedTotal > storedTotal ? calculatedTotal : storedTotal

  return {
    subtotal,
    shipping,
    tax: vat,
    total: displayTotal,
    manualDiscount,
    couponDiscount,
    couponCode,
    hasCoupon: hasActualCoupon && couponDiscount > 0,
    displaySubtotal: subtotal,
    displayTotal,
  }
}
