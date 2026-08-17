import { forwardRef } from "react"
import { getInvoiceBreakdown } from "../../utils/invoiceBreakdown"
import { resolveOrderItemBasePrice, computeBaseSubtotal, deriveBaseDiscount } from "../../utils/orderPricing"
import { getPaymentMethodDisplay, getPaymentMethodBadgeColor } from "../../utils/paymentUtils"

const InvoiceComponent = forwardRef(({ order }, ref) => {
  if (!order) return null

  const formatPrice = (price) => {
    return `AED ${Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  const resolvedItems = Array.isArray(order?.orderItems) ? order.orderItems : []
  
  // Separate protection items from regular items
  const protectionItems = resolvedItems.filter(item => item.isProtection || (item.name && item.name.includes('for ')))
  const regularItems = resolvedItems.filter(item => !item.isProtection && !(item.name && item.name.includes('for ')))
  
  const baseSubtotal = computeBaseSubtotal(regularItems)

  const { subtotal, shipping, tax, total, couponCode, couponDiscount, displaySubtotal, displayTotal } = getInvoiceBreakdown(order)
  const derivedDiscount = deriveBaseDiscount(baseSubtotal, subtotal)

  const currentDate = new Date().toLocaleDateString()
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : currentDate

  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto font-sans text-black">
      {/* Header matching Super Boss format */}
      <div className="border-b-2 border-gray-300 pb-4 mb-4">
        {/* Top row: Logo on left, Company Info on right */}
        <div className="flex justify-between items-start w-full gap-4">
          {/* Left Logo */}
          <div className="flex-shrink-0 pt-1">
            <img
              src="/superboss-logo.svg"
              alt="SUPER BOSS"
              className="w-56 h-16 object-contain"
              onError={(e) => {
                e.target.style.display = "none"
                if (e.target.nextSibling) e.target.nextSibling.style.display = "block"
              }}
            />
            <div className="hidden text-[#0b663b] font-black text-2xl tracking-wider">
              SUPER BOSS
            </div>
          </div>

          {/* Right Company Details */}
          <div className="text-right text-black font-sans leading-tight">
            <h1 className="text-base font-bold text-black tracking-tight uppercase">
              SUPER BOSS COMPUTERS TRADING LLC
            </h1>
            <p className="text-xs font-bold text-black mt-0.5">
              Shop #11, Sultan Building, Nr Al Raffa St., BurDubai,
            </p>
            <p className="text-xs font-bold text-black">
              Dubai, 48051, UAE
            </p>
            <p className="text-[11px] text-black mt-1">
              Mobile: +971 4 3258808 Email: sales@superboss.ae https://www.superboss.ae
            </p>
            <p className="text-xs font-bold text-black mt-1">
              TRN: <span className="text-[#0b663b] font-extrabold">100581077300003</span>
            </p>
          </div>
        </div>

        {/* Sub Header: VAT INVOICE & Order Details */}
        <div className="flex justify-between items-end mt-4 pt-2 border-t border-gray-200">
          <div>
            <h2 className="text-xl font-extrabold text-black tracking-wide flex items-center gap-2">
              VAT INVOICE <span className="text-sm font-semibold text-gray-700">عرض أسعار / فاتورة ضريبية</span>
            </h2>
          </div>
          <div className="text-right text-xs text-black">
            <div className="text-base font-bold text-black">
              Order #: {order._id ? order._id.slice(-6) : (order.id || order.orderId || "N/A")}
            </div>
            <div className="text-xs text-gray-700 mt-0.5">📅 Date: {orderDate}</div>
          </div>
        </div>
      </div>

      {/* Order Summary Section */}
      <div className="bg-white border-l-4 pl-2 border-lime-500">
        <h3 className="text-2xl font-bold text-lime-800 mb-2 uppercase tracking-wide">📋 Order Summary</h3>

        {/* Addresses */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-2">
          {/* Shipping Address */}
          <div className="bg-white border-2 border-lime-200 rounded-lg px-3 py-1 relative">
            <div className="absolute -top-3 left-3 bg-white px-2">
              <h4 className="text-sm font-bold text-lime-700 uppercase">📦 Shipping Address</h4>
            </div>
            <div className="pt-2 space-y-1 text-sm">
              <p>
                <strong>Name:</strong> {order.shippingAddress?.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {order.shippingAddress?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {order.shippingAddress?.phone || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {order.shippingAddress?.address || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {order.shippingAddress?.city || "N/A"}
              </p>
              <p>
                <strong>State:</strong> {order.shippingAddress?.state || "N/A"}
              </p>
              <p>
                <strong>Zip Code:</strong> {order.shippingAddress?.zipCode || "N/A"}
              </p>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white border-2 border-lime-200 rounded-lg px-3 py-1 relative">
            <div className="absolute -top-3 left-3 bg-white px-2">
              <h4 className="text-sm font-bold text-lime-700 uppercase">💳 Billing Address</h4>
            </div>
            <div className="pt-2 space-y-1 text-sm">
              <p>
                <strong>Name:</strong> {order.billingAddress?.name || order.shippingAddress?.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {order.billingAddress?.email || order.shippingAddress?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {order.billingAddress?.phone || order.shippingAddress?.phone || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {order.billingAddress?.address || order.shippingAddress?.address || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {order.billingAddress?.city || order.shippingAddress?.city || "N/A"}
              </p>
              <p>
                <strong>State:</strong> {order.billingAddress?.state || order.shippingAddress?.state || "N/A"}
              </p>
              <p>
                <strong>Zip Code:</strong> {order.billingAddress?.zipCode || order.shippingAddress?.zipCode || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Seller Comments */}
        {order.sellerComments && (
          <div className="mb-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-bold text-blue-700 uppercase mb-2">💬 Seller Comments</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{order.sellerComments}</p>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-4">
          <h4 className="text-lg font-bold text-lime-800 mb-2 uppercase">🛍️ Order Items</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-lime-300">
              <thead>
                <tr className="bg-lime-100">
                  <th className="border border-lime-300 px-3 py-2 text-left text-sm font-bold">Product</th>
                  <th className="border border-lime-300 px-3 py-2 text-center text-sm font-bold">Qty</th>
                  <th className="border border-lime-300 px-3 py-2 text-right text-sm font-bold">Price</th>
                  <th className="border border-lime-300 px-3 py-2 text-right text-sm font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {regularItems.map((item, index) => {
                  const basePrice = resolveOrderItemBasePrice(item)
                  const itemPrice = Number(item.price) || basePrice
                  const showDiscount = basePrice > itemPrice
                  const lineTotal = itemPrice * (item.quantity || 0)
                  const baseTotal = basePrice * (item.quantity || 0)

                  return (
                    <tr key={index} className="hover:bg-lime-50">
                      <td className="border border-lime-300 px-3 py-2 text-sm">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.selectedColorData && (
                          <div className="text-xs text-purple-600 font-medium mt-1 flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full mr-1 border border-gray-300" style={{backgroundColor: item.selectedColorData.color?.toLowerCase() || '#9333ea'}}></span>
                            Color: {item.selectedColorData.color}
                          </div>
                        )}
                        {item.selectedDosData && (
                          <div className="text-xs text-blue-600 font-medium mt-1 flex items-center">
                            💻 OS: {item.selectedDosData.dosType}
                          </div>
                        )}
                        {showDiscount && (
                          <div className="text-xs text-gray-500">Base: {formatPrice(basePrice)}</div>
                        )}
                      </td>
                      <td className="border border-lime-300 px-3 py-2 text-center text-sm">{item.quantity}</td>
                      <td className="border border-lime-300 px-3 py-2 text-right text-sm">
                        {showDiscount && (
                          <span className="block text-xs text-gray-400 line-through">{formatPrice(basePrice)}</span>
                        )}
                        <span className="font-semibold text-gray-900">{formatPrice(itemPrice)}</span>
                      </td>
                      <td className="border border-lime-300 px-3 py-2 text-right text-sm font-semibold">
                        {showDiscount && (
                          <span className="block text-xs text-gray-400 font-normal line-through">
                            {formatPrice(baseTotal)}
                          </span>
                        )}
                        <span>{formatPrice(lineTotal)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Protection Plans Section */}
        {protectionItems.length > 0 && (
          <div className="mb-4">
            <h4 className="text-lg font-bold text-blue-800 mb-2 uppercase">🛡️ Protection Plans</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-blue-300">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-blue-300 px-3 py-2 text-left text-sm font-bold">Protection</th>
                    <th className="border border-blue-300 px-3 py-2 text-center text-sm font-bold">Qty</th>
                    <th className="border border-blue-300 px-3 py-2 text-right text-sm font-bold">Price</th>
                    <th className="border border-blue-300 px-3 py-2 text-right text-sm font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {protectionItems.map((item, index) => {
                    const itemPrice = Number(item.price) || 0
                    const lineTotal = itemPrice * (item.quantity || 0)

                    return (
                      <tr key={index} className="hover:bg-blue-50">
                        <td className="border border-blue-300 px-3 py-2 text-sm">
                          <div className="font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="border border-blue-300 px-3 py-2 text-center text-sm">{item.quantity}</td>
                        <td className="border border-blue-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                          {formatPrice(itemPrice)}
                        </td>
                        <td className="border border-blue-300 px-3 py-2 text-right text-sm font-semibold">
                          {formatPrice(lineTotal)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total Amount */}
        <div className="bg-lime-50 border-2 border-lime-200 rounded-lg p-4">
          <h4 className="text-lg font-bold text-lime-800 mb-2 uppercase">💰 Total Amount</h4>
          <div className="space-y-2">
            {baseSubtotal > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Base Price:</span>
                <span className="line-through">{formatPrice(baseSubtotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">{formatPrice(subtotal + (couponDiscount || 0))}</span>
            </div>

            {derivedDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Offer Discount:</span>
                <span className="text-green-600">-{formatPrice(derivedDiscount)}</span>
              </div>
            )}

            {(couponDiscount > 0 || (order.couponCode && order.discountAmount > 0)) && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {(couponCode || order.couponCode) ? `Coupon (${couponCode || order.couponCode})` : "Coupon Discount"}:
                </span>
                <span className="text-green-600">-{formatPrice(couponDiscount || order.discountAmount || 0)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">{formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VAT:</span>
              <span className="text-gray-900">{formatPrice(tax)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-lime-600">{formatPrice(displayTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 bg-yellow-50 p-2 rounded-lg border-2 border-yellow-200 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">💳 Payment Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                order.isPaid ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
              }`}
            >
              {order.isPaid ? "✅ Paid" : "❌ Unpaid"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">💰 Payment Method:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPaymentMethodBadgeColor(order)}`}>
              {getPaymentMethodDisplay(order)}
            </span>
          </div>
          {order.trackingId && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">📦 Tracking ID:</span>
              <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{order.trackingId}</code>
            </div>
          )}
          {order.paidAt && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">✅ Paid At:</span>
              <span className="text-gray-700 text-xs">{new Date(order.paidAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {(order.customerNotes || order.notes) && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📝 Special Notes:</h4>
            <p className="text-blue-700 italic">{order.customerNotes || order.notes}</p>
          </div>
        )}
      </div>

      <div className="text-xs text-end mt-2 opacity-80">🖨️ Printed: {currentDate}</div>
    </div>
  )
})

InvoiceComponent.displayName = "InvoiceComponent"

export default InvoiceComponent
