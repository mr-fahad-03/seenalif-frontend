// // Card Component Definitions (instead of import)
// import * as React from "react"
// import { useLanguage } from "../context/LanguageContext"
// import TranslatedText from "../components/TranslatedText"

// function Card({ className, ...props }) {
//   return <div className={`bg-white rounded-lg ${className}`} {...props} />
// }
// function CardHeader({ className, ...props }) {
//   return <div className={`border-b px-6 py-4 ${className}`} {...props} />
// }
// function CardTitle({ className, ...props }) {
//   return <h3 className={`text-xl font-semibold ${className}`} {...props} />
// }
// function CardContent({ className, ...props }) {
//   return <div className={`px-6 py-4 ${className}`} {...props} />
// }

// // Separator Component Definition (instead of import)
// function Separator({ className = "" }) {
//   return <hr className={`my-6 border-t border-gray-300 ${className}`} />
// }

// import {
//   FileText,
//   ShoppingCart,
//   CreditCard,
//   CheckCircle,
//   AlertTriangle,
//   Smartphone,
//   Gift,
//   Clock,
//   Shield,
//   DollarSign,
//   Users,
//   Ban,
// } from "lucide-react"

// export default function VoucherTermsConditions() {
//   const { getLocalizedPath } = useLanguage();
  
//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         <Card className="shadow-lg">
//           <CardHeader className="text-center bg-gradient-to-r from-[#505e4d] to-[#505e4d] text-white rounded-t-lg">
//             <div className="flex items-center justify-center gap-3 mb-2">
//               <FileText className="h-8 w-8" />
//               <CardTitle className="text-3xl font-bold"><TranslatedText>Voucher Terms & Conditions</TranslatedText></CardTitle>
//             </div>
//           </CardHeader>

//           <CardContent className="p-8 space-y-8">
//             {/* General Conditions */}
//             <section>
//               <div className="flex items-center gap-3 mb-6">
//                 <Shield className="h-6 w-6 text-[#505e4d]" />
//                 <h2 className="text-2xl font-semibold text-gray-800"><TranslatedText>General Conditions</TranslatedText></h2>
//               </div>

//               <div className="space-y-4 text-gray-700 leading-relaxed">
//                 <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
//                   <Clock className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                   <p>
//                     <span className="font-medium">1.</span> Each voucher or promo code issued by Grabatoz.ae is valid
//                     for a limited time, date or event only. The expiry date and applicable terms will be communicated
//                     via email, SMS, or any official channel used by Grabatoz.
//                   </p>
//                 </div>

//                 <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
//                   <Users className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                   <p>
//                     <span className="font-medium">2.</span> Only one voucher can apply on each purchase made by customer
//                     on grabatoz.ae store.
//                   </p>
//                 </div>

//                 <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
//                   <Ban className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                   <p>
//                     <span className="font-medium">3.</span> Voucher codes cannot be used during sale periods or combined
//                     with other promotions, campaigns, or discount offers unless explicitly stated.
//                   </p>
//                 </div>

//                 <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
//                   <Users className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                   <p>
//                     <span className="font-medium">4.</span> Each voucher code is limited to one use per customer and per
//                     account only.
//                   </p>
//                 </div>

//                 <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
//                   <Ban className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                   <p>
//                     <span className="font-medium">5.</span> Voucher codes cannot be applied to previously placed orders.
//                   </p>
//                 </div>

//                 <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
//                   <Gift className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                   <p>
//                     <span className="font-medium">6.</span> Only specific products may be eligible for voucher
//                     discounts; restrictions may apply based on product category or vendor.
//                   </p>
//                 </div>

//                 <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
//                   <DollarSign className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                   <p>
//                     <span className="font-medium">7.</span> Vouchers are non-transferable and cannot be exchanged for
//                     cash, store credit, or other alternatives.
//                   </p>
//                 </div>

//                 <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
//                   <Clock className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                   <p>
//                     <span className="font-medium">8.</span> The voucher code must be entered before completing the
//                     checkout process. Late entries will not be honored.
//                   </p>
//                 </div>

//                 <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
//                   <DollarSign className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                   <p>
//                     <span className="font-medium">9.</span> In the case of a return or cancellation, the refund will
//                     reflect the amount paid after the voucher discount. The discounted amount is non-refundable.
//                   </p>
//                 </div>

//                 <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
//                   <Ban className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                   <p>
//                     <span className="font-medium">10.</span> Each voucher code can only be used once. If the order is
//                     canceled or items are returned, the voucher cannot be reissued or reused.
//                   </p>
//                 </div>

//                 <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
//                   <Shield className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                   <p>
//                     <span className="font-medium">11.</span> Grabatoz reserves the right to modify or terminate any
//                     voucher or promotional offer at its discretion, without prior notice.
//                   </p>
//                 </div>

//                 <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
//                   <AlertTriangle className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                   <p>
//                     <span className="font-medium">12.</span> Any violation of the above terms may result in the voucher
//                     becoming void.
//                   </p>
//                 </div>
//               </div>
//             </section>

//             <Separator />

//             {/* How to Apply */}
//             <section>
//               <div className="flex items-center gap-3 mb-6">
//                 <Gift className="h-6 w-6 text-[#505e4d]" />
//                 <h2 className="text-2xl font-semibold text-gray-800"><TranslatedText>How to Apply a Voucher or Discount Code</TranslatedText></h2>
//               </div>

//               <p className="text-gray-700 mb-4">
//                 To redeem a voucher or promotional discount on your order, please follow these simple steps:
//               </p>

//               <div className="space-y-4 text-gray-700 leading-relaxed">
//                 <div className="bg-white p-4 rounded-lg border-l-4 border-[#505e4d]">
//                   <div className="flex items-center gap-3 mb-2">
//                     <ShoppingCart className="h-5 w-5 text-[#505e4d]" />
//                     <h3 className="font-semibold text-[#505e4d]">1. Add Products to Your Cart</h3>
//                   </div>
//                   <p>Browse and add the desired items to your Shopping Cart.</p>
//                 </div>

//                 <div className="bg-white p-4 rounded-lg border-l-4 border-[#505e4d]">
//                   <div className="flex items-center gap-3 mb-2">
//                     <ShoppingCart className="h-5 w-5 text-[#505e4d]" />
//                     <h3 className="font-semibold text-[#505e4d]">2. Proceed to Shopping Cart</h3>
//                   </div>
//                   <p>
//                     Click the "Shopping Cart" button once you're ready to place your order insert your voucher or coupon
//                     code and hit checkout process.
//                   </p>
//                 </div>

//                 <div className="bg-white p-4 rounded-lg border-l-4 border-[#505e4d]">
//                   <div className="flex items-center gap-3 mb-2">
//                     <Gift className="h-5 w-5 text-[#505e4d]" />
//                     <h3 className="font-semibold text-[#505e4d]">
//                       3. Enter your voucher or promo code, then click "Apply" to activate the discount.
//                     </h3>
//                   </div>
//                 </div>

//                 <div className="bg-white p-4 rounded-lg border-l-4 border-[#505e4d]">
//                   <div className="flex items-center gap-3 mb-2">
//                     <AlertTriangle className="h-5 w-5 text-[#505e4d]" />
//                     <h3 className="font-semibold text-[#505e4d]">
//                       4. This is the only place you can add or apply your valid voucher / coupon or discount code.
//                     </h3>
//                   </div>
//                 </div>

//                 <div className="bg-white p-4 rounded-lg border-l-4 border-[#505e4d]">
//                   <div className="flex items-center gap-3 mb-2">
//                     <CreditCard className="h-5 w-5 text-[#505e4d]" />
//                     <h3 className="font-semibold text-[#505e4d]">5. Next enter Delivery & Payment Details</h3>
//                   </div>
//                   <p>moving forward to fill in your shipping information and select your preferred payment method.</p>
//                 </div>

//                 <div className="bg-white p-4 rounded-lg border-l-4 border-[#505e4d]">
//                   <div className="flex items-center gap-3 mb-2">
//                     <CheckCircle className="h-5 w-5 text-[#505e4d]" />
//                     <h3 className="font-semibold text-[#505e4d]">6. Confirm your all details</h3>
//                   </div>
//                   <p>
//                     once insert all your delivery information next you will find review your order summary page to
//                     verify all entered information is correct now you are ready for final step.
//                   </p>
//                 </div>

//                 <div className="bg-white p-4 rounded-lg border-l-4 border-[#505e4d]">
//                   <div className="flex items-center gap-3 mb-2">
//                     <CheckCircle className="h-5 w-5 text-[#505e4d]" />
//                     <h3 className="font-semibold text-[#505e4d]">7. Place Your Order</h3>
//                   </div>
//                   <p>
//                     done reeview your order summary, and if everything looks correct, click "Place Order" to complete
//                     your purchase.
//                   </p>
//                 </div>
//               </div>

//               <div className="mt-6 p-4 bg-white border-l-4 border-[#505e4d] rounded">
//                 <div className="flex items-center gap-3">
//                   <AlertTriangle className="h-5 w-5 text-[#505e4d]" />
//                   <p className="text-[#505e4d] font-medium">
//                     <strong>Note:</strong> Voucher codes must be entered before completing the order. Discounts cannot
//                     be applied retroactively to confirmed purchases.
//                   </p>
//                 </div>
//               </div>
//             </section>

//             <Separator />

//             {/* In-Store Voucher Codes */}
//             <section>
//               <div className="flex items-center gap-3 mb-6">
//                 <Smartphone className="h-6 w-6 text-[#505e4d]" />
//                 <h2 className="text-2xl font-semibold text-gray-800">
//                   <TranslatedText>In-Store Voucher Codes (for Mobile App Use Only)</TranslatedText>
//                 </h2>
//               </div>

//               <div className="bg-gradient-to-r from-[#505e4d] to-[#505e4d] p-6 rounded-lg border border-[#505e4d]">
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <div className="flex items-start gap-3">
//                     <DollarSign className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                     <p>
//                       Customers making an in-store purchase of AED 500 or more may receive an exclusive voucher code and
//                       QR code, printed on a separate receipt or token card along with their purchase invoice.
//                     </p>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <Smartphone className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                     <p>
//                       This voucher is redeemable only through the Grabatoz mobile app. App installation is required to
//                       use the code.
//                     </p>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <Gift className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                     <p>The in-store voucher provides a 5% discount, with a maximum cap of AED 100.</p>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <Clock className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                     <p>
//                       The voucher is valid for one order only per user/account and will expire in one month or 30 days
//                       after the invoice date.
//                     </p>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <AlertTriangle className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                     <p>Lost, damaged, or stolen vouchers will not be replaced or extended under any circumstances.</p>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <Ban className="h-5 w-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
//                     <p>This voucher cannot be combined with other vouchers or promotional codes.</p>
//                   </div>
//                 </div>
//               </div>
//             </section>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }









import React, { useState } from "react";
import { 
  Ticket, Clock, Users, Ban, Gift, DollarSign, Shield, AlertTriangle,
  ShoppingCart, CreditCard, CheckCircle, Smartphone, Phone, Mail, MapPin,
  ChevronRight, Sparkles, Tag
} from "lucide-react";

export default function VoucherTermsConditions() {
  const [activeStep, setActiveStep] = useState(1);

  const generalConditions = [
    { icon: Clock, text: "Each voucher or promo code issued by Seenalif.com is valid for a limited time, date or event only. The expiry date and applicable terms will be communicated via email, SMS, or any official channel." },
    { icon: Users, text: "Only one voucher can apply on each purchase made by customer on Seenalif.com store." },
    { icon: Ban, text: "Voucher codes cannot be used during sale periods or combined with other promotions, campaigns, or discount offers unless explicitly stated." },
    { icon: Users, text: "Each voucher code is limited to one use per customer and per account only." },
    { icon: Ban, text: "Voucher codes cannot be applied to previously placed orders." },
    { icon: Gift, text: "Only specific products may be eligible for voucher discounts; restrictions may apply based on product category or vendor." },
    { icon: DollarSign, text: "Vouchers are non-transferable and cannot be exchanged for cash, store credit, or other alternatives." },
    { icon: Clock, text: "The voucher code must be entered before completing the checkout process. Late entries will not be honored." },
    { icon: DollarSign, text: "In the case of a return or cancellation, the refund will reflect the amount paid after the voucher discount. The discounted amount is non-refundable." },
    { icon: Ban, text: "Each voucher code can only be used once. If the order is canceled or items are returned, the voucher cannot be reissued or reused." },
    { icon: Shield, text: "Seenalif reserves the right to modify or terminate any voucher or promotional offer at its discretion, without prior notice." },
    { icon: AlertTriangle, text: "Any violation of the above terms may result in the voucher becoming void." }
  ];

  const howToApplySteps = [
    { step: 1, icon: ShoppingCart, title: "Add Products to Your Cart", desc: "Browse and add the desired items to your Shopping Cart." },
    { step: 2, icon: ShoppingCart, title: "Proceed to Shopping Cart", desc: "Click the Shopping Cart button once you are ready to place your order, insert your voucher or coupon code and hit checkout process." },
    { step: 3, icon: Gift, title: "Enter Voucher Code", desc: "Enter your voucher or promo code, then click Apply to activate the discount." },
    { step: 4, icon: AlertTriangle, title: "Important Location", desc: "This is the only place you can add or apply your valid voucher / coupon or discount code." },
    { step: 5, icon: CreditCard, title: "Enter Delivery & Payment Details", desc: "Moving forward to fill in your shipping information and select your preferred payment method." },
    { step: 6, icon: CheckCircle, title: "Confirm Your Details", desc: "Review your order summary page to verify all entered information is correct." },
    { step: 7, icon: CheckCircle, title: "Place Your Order", desc: "Done reviewing your order summary, and if everything looks correct, click Place Order to complete your purchase." }
  ];

  return (
    <div className="min-h-screen bg-[#f3f5f2]">
      {/* Hero Section */}
      <div className="bg-[#505e4d]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Save more with vouchers</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Voucher Terms & Conditions
              </h1>
              <p className="text-xl text-white">
                Everything you need to know about using vouchers and promo codes on Seenalif.com
              </p>
            </div>
            <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20">
              <Ticket className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* General Conditions - Timeline Style */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#505e4d] rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">General Conditions</h2>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#505e4d]/30"></div>
          
          <div className="space-y-4">
            {generalConditions.map((condition, idx) => {
              const Icon = condition.icon;
              return (
                <div key={idx} className="relative flex items-start gap-4 pl-16">
                  <div className="absolute left-3 w-6 h-6 bg-white border-2 border-[#505e4d] rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-[#505e4d]">{idx + 1}</span>
                  </div>
                  <div className="flex-1 bg-gray-50 hover:bg-white p-4 rounded-xl transition-colors border border-gray-100">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{condition.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How to Apply Section - Interactive Steps */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#505e4d] rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">How to Apply a Voucher</h2>
          </div>

          {/* Step Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            {howToApplySteps.map((step) => (
              <button
                key={step.step}
                onClick={() => setActiveStep(step.step)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  activeStep === step.step
                    ? "bg-[#505e4d] text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                Step {step.step}
              </button>
            ))}
          </div>

          {/* Active Step Display */}
          {howToApplySteps.map((step) => {
            const Icon = step.icon;
            return activeStep === step.step ? (
              <div key={step.step} className="bg-white rounded-2xl p-8 shadow-xl border border-[#505e4d]">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-[#505e4d] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-[#505e4d] font-medium mb-1">Step {step.step} of 7</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                    disabled={activeStep === 1}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setActiveStep(Math.min(7, activeStep + 1))}
                    disabled={activeStep === 7}
                    className="flex items-center gap-2 px-6 py-2 bg-[#505e4d] text-white rounded-lg hover:bg-[#445340] disabled:opacity-50"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null;
          })}

          {/* Warning Note */}
          <div className="mt-8 bg-white border border-[#505e4d] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
              <p className="text-[#505e4d]">
                <strong>Note:</strong> Voucher codes must be entered before completing the order. Discounts cannot be applied retroactively to confirmed purchases.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* In-Store Voucher Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-[#505e4d] rounded-3xl p-8 text-white">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">In-Store Voucher Codes</h2>
            </div>
            <p className="text-white mb-6">For Mobile App Use Only</p>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: DollarSign, text: "Available on purchases of AED 500 or more in-store" },
                { icon: Smartphone, text: "Redeemable only through the Seenalif mobile app" },
                { icon: Tag, text: "5% discount with maximum cap of AED 100" },
                { icon: Clock, text: "Valid for 30 days from invoice date" },
                { icon: AlertTriangle, text: "Lost or stolen vouchers will not be replaced" },
                { icon: Ban, text: "Cannot be combined with other promotions" }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl">
                    <Icon className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <p className="text-white">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Footer */}
      <div className="bg-[#505e4d] text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Questions About Vouchers?</h2>
            <p className="text-white/80">Our support team can help with any voucher-related inquiries</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-white/80 mb-1">Phone</p>
              <a href="tel:+97143258808" className="text-white hover:text-white">+971 4 3258808</a>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-white/80 mb-1">Email</p>
              <a href="mailto:Support@seenalif.com" className="text-white hover:text-white">Support@seenalif.com</a>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-white/80 mb-1">Hours</p>
              <p className="text-white">9:00 AM - 7:00 PM</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-white/80 mb-1">Location</p>
              <p className="text-white text-sm">Burdubai, Dubai, UAE</p>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-6 border-t border-white/20">
            <p className="text-white/80">
              <strong className="text-white">Seenalif.com</strong> - Powered by Super Boss Computers Trading LLC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



