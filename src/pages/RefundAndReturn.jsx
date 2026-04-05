// "use client";

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Shield, RotateCcw, Clock, CheckCircle, XCircle, CreditCard, AlertTriangle, Phone, Mail, MapPin, FileText, Home, Truck, Settings, Info } from "lucide-react";
// import { useLanguage } from "../context/LanguageContext";
// import TranslatedText from "../components/TranslatedText";

// export default function RefundAndReturn() {
//   const navigate = useNavigate();
//   const { getLocalizedPath } = useLanguage();

//   // Future functionality for Arabic version
//   // const handleArabicClick = () => {
//   //   navigate('/refund-return-arabic');
//   // };

//   return (
//     <div className="bg-white min-h-screen">
//       {/* Header */}
//       <div className="bg-gray-50 border-b border-gray-200">
//         <div className="max-w-4xl mx-auto px-6 py-12 text-center">
//           <div className="flex justify-center mb-6">
//             <div className="bg-[#505e4d] rounded-full p-4">
//               <Shield className="w-12 h-12 text-white" />
//             </div>
//           </div>
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             <TranslatedText>Return & Refund & Exchange Policy</TranslatedText>
//           </h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             At Grabatoz, powered by Crown Excel General Trading LLC, we value your satisfaction and strive to provide a smooth and reliable shopping experience.
//           </p>

//           {/* Language Switch Button - Commented out until Arabic version is created */}
//           {/* <div className="flex justify-center mt-6">
//             <button
//               onClick={handleArabicClick}
//               className="bg-[#505e4d] hover:bg-[#505e4d] text-white font-medium py-2 px-6 rounded-lg transition-colors"
//             >
//               Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Arabic
//             </button>
//           </div> */}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto px-6 py-12">

//         {/* Return Eligibility */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <Shield className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Return Eligibility</h2>
//           </div>
//           <div className="space-y-4 text-gray-700">
//             <p>Grabatoz offers a <strong>7-day return window</strong> from the date of receipt of your order to initiate a return request.</p>
//             <p>If you are requesting a return, please ensure the following:</p>
//             <ul className="list-disc list-inside space-y-2 ml-4">
//               <li>The product is in its original condition, including all tags and labels.</li>
//               <li>It is unused, undamaged, and free from stains or Odors.</li>
//               <li>For electronics and tech items, all accessories, manuals, and packaging should be included.</li>
//               <li>All protective seals and labels remain intact.</li>
//               <li>The product has not been damaged due to misuse, mishandling, or unauthorized modification.</li>
//               <li>Customized products, items that are used and without any defects, items with cut cables/wires, or products missing original components are not eligible for return or exchange.</li>
//             </ul>
//           </div>
//         </section>

//         {/* Return & Exchange Options */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <CheckCircle className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Return & Exchange Options</h2>
//           </div>

//           <div className="space-y-4 text-gray-700">
//             <p>Grabatoz offers two convenient options for returning or exchanging products:</p>
            
//             <div className="space-y-3">
//               <div>
//                 <h3 className="font-semibold text-gray-900 mb-2">1. In-Store</h3>
//                 <p>Customers may visit any Crown Excel Experience Centre or branch, as listed on our website, to request a return, refund, or exchange. In-store returns, refunds, and exchanges are available at all our physical locations across the UAE.</p>
//               </div>
              
//               <div>
//                 <h3 className="font-semibold text-gray-900 mb-2">2. Home Pick-Up</h3>
//                 <p>At Grabatoz, we strive to provide a hassle-free return experience. For added convenience, we offer a Home Pick-Up service. Our dedicated Grabian delivery team or an authorized delivery partner will contact you to schedule a suitable pickup time. The returned item will be collected from your location and transported to our store for inspection and processing.</p>
//               </div>
//             </div>

//             <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//               <p className="font-semibold text-gray-900 mb-1">Please Note:</p>
//               <p>Home Pick-Up service charges will be borne by the customer and may vary based on the product and the pickup location (pin code).</p>
//             </div>
//           </div>
//         </section>

//         {/* Defective Items */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <MapPin className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>In-Store Return, Refund & Exchange</TranslatedText></h2>
//           </div>

//           <div className="space-y-4 text-gray-700">
//             <p>
//               <strong>  Grabatozs </strong>  offers the convenience of <strong>in-store returns, refunds, and exchanges </strong> at any of our <strong> three physical locations</strong>  across the UAE.
//             </p>

//             {/* Image Section */}
//             {/* <div className="rounded-lg overflow-hidden shadow mt-6">
//               <img
//                 src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
//                 alt="Defective Laptop Repair and Warranty"
//                 className="w-full h-48 object-cover"
//               />
//             </div> */}
//           </div>
//         </section>

//         {/* Refund Duration */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <Settings className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>How It Works:</TranslatedText></h2>
//           </div>

//           <div className="space-y-4 text-gray-700">
//             <p>
//               <TranslatedText>You may visit any of our Crown Excel experience center or branch and locations to request a return, refund, or product exchange. Please make sure sure the item is in the original packaging, unused, and sealed exactly as time of received.</TranslatedText>
//             </p>
//           </div>
//         </section>

//         {/* How to Initiate a Return */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <AlertTriangle className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Important note:</TranslatedText></h2>
//           </div>

//           <div className="space-y-4 text-gray-700">
//             <p>
//               Items that are <strong> not in their original packaging </strong> or have <strong>broken seals</strong>  may be subject to rejection or handled according to the <strong> specific brandâ€™s return policy.</strong> Grabatoz reserves the right to apply additional <strong> terms and conditions </strong> based on <strong> manufacturer or supplier guidelines. </strong>
//               Bring the item and the original tax invoice (received by email or phone). Our customer service team will assist you with the process.

//             </p>
//           </div>
//         </section>

//         {/* Non-Eligible Items */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <Home className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Pick-Up from Home â€“ Return Service</TranslatedText></h2>
//           </div>

//           <div className="space-y-4 text-gray-700">
//             <p>
//               At <strong>Grabatoz,</strong> our aim to provide a hassle-free return experience. For your convenience, we offer a <strong> Pick-Up from Home </strong>  return option.
//             </p>
//           </div>
//         </section>

//         {/* Refund Process */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <Truck className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>How It Works:</TranslatedText></h2>
//           </div>

//           <div className="space-y-4 text-gray-700">
//             <p>
//               Our  <strong>dedicated grabian delivery team</strong> or an <strong>authorized delivery partner</strong> will contact you to schedule a suitable <strong> pickup time </strong>at your convenience.
//               The returned item will be <strong>transported to our store</strong>  for inspection and processing.

//             </p>
//           </div>
//         </section>

//         {/* Restocking Fee */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <Info className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Important:</TranslatedText></h2>
//           </div>

//           <div className="space-y-4 text-gray-700">
//             <p>
//               Please ensure the product is in the <strong> original condition, unused,</strong> and securely packed in its <strong> original packaging,</strong>  along with the <strong> original invoice or proof of purchase.
//                 Return delivery charges</strong>  will be <strong> borne by the customer</strong> and may vary based on location or product type.
//               Once the item is received and inspected, a  <strong>refund or exchange </strong> will be processed in accordance with our return policy.

//             </p>
//           </div>
//         </section>



//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <CreditCard className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Refund Process</TranslatedText></h2>
//           </div>

//           <div className="space-y-4 text-gray-700">
//             <p>
//               Once the returned product is <strong>received and verified</strong> by our <strong>product inspection team,</strong> a <strong>refund or exchange</strong> will be initiated with in <strong>15 days.</strong>
//             </p>
//             <ul className="list-disc list-inside space-y-2 ml-4">
//               <li>Refunds will be issued to the <strong>original payment method</strong> used at the time of purchase.</li>
//               <li>Exchanges will be processed based on <strong>product availability</strong> and customer preference.</li>
//               <li>The process will begin <strong>immediately after successful inspection</strong> of the returned item.</li>
//               <li><strong>Important:</strong> the inspection ensures the product is in its <strong>original condition, unused,</strong> and in <strong>original packaging,</strong> as per our return policy.</li>
//               <li>Processing time may vary based on the payment service provider; it takes a minimum of 2 or in some cases up to 15 business days.</li>
//               <li>All refunds are processed in AED; international transactions are automatically converted to your local currency by your payment provider.</li>
//             </ul>
//           </div>
//         </section>



//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <FileText className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Important Policy Notes</TranslatedText></h2>

//           </div>
//           <p className="text-[#505e4d]"><strong>Grabatoz reserves the right to:</strong> </p>
//           <div className="space-y-4 text-gray-700">
//             <ol>
//               <li>	Refuse returns that do not meet the conditions stated above.</li>
//               <li>	Take appropriate action against policy abuse, which may include warnings, return restrictions, or account suspension.</li>
//             </ol>
//           </div>
//         </section>
//         {/* Important Note */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <AlertTriangle className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Defective (Damaged) & Non-Defective Items</TranslatedText></h2>
//           </div>

//           <div className="flex flex-col md:flex-row md:items-center gap-6 text-gray-700">
//             <div className="flex-1 space-y-4">
//               <ul className="list-none space-y-3">
//                 <li>
//                   <span className="font-semibold list-none">Defective Items:</span>
//                   <ul className="list-disc list-inside ml-5 space-y-1">
//                     <li>Report within 15 days of delivery with order details and photos.</li>
//                     <li>We will verify and arrange a replacement or refund.</li>
//                     <li>Return shipping for defective items will be covered by us.</li>
//                   </ul>
//                 </li>
//                 <li>
//                   <span className="font-semibold list-none">Non-Defective Items:</span>
//                   <ul className="list-disc list-inside ml-5 space-y-1">
//                     <li>Returns accepted only if the item is unused and in original packaging.</li>
//                     <li>Must be requested within 15 days of delivery.</li>
//                     <li>Return shipping costs are the customerâ€™s responsibility.</li>
//                   </ul>
//                 </li>
//               </ul>
//             </div>

//             {/* Image Section - right on desktop, below on mobile */}
//             <div className="md:w-1/3">
//               <div className="rounded-lg overflow-hidden shadow md:mt-0 mt-6">
//                 <img
//                   src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
//                   alt="Defective device inspection and repair"
//                   className="w-full h-auto md:h-48 object-cover"
//                 />
//               </div>
//             </div>
//           </div>
//         </section>

//       </div>

//       {/* Contact Information */}
//       <section className="bg-gray-50 text-black p-4">
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center mb-8">
//             <h2 className="text-2xl font-semibold mb-2"><TranslatedText>Contact Information</TranslatedText></h2>
//             <p className="text-black"><TranslatedText>For questions or concerns regarding Return and Refunds terms please contact:</TranslatedText></p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//             <div className="text-center">
//               <div className="flex justify-center mb-2">
//                 <Phone className="w-5 h-5 text-[#505e4d]" />
//               </div>
//               <h3 className="font-medium mb-1"><TranslatedText>Phone</TranslatedText></h3>
//               <a href="tel:+9710505033860" className="text-black">
//                 +971 0505033860
//               </a>
//             </div>

//             <div className="text-center">
//               <div className="flex justify-center mb-2">
//                 <Mail className="w-5 h-5 text-[#505e4d]" />
//               </div>
//               <h3 className="font-medium mb-1"><TranslatedText>Email</TranslatedText></h3>
//               <a href="mailto:support@grabatoz.com" className="text-black">
//                 customercare@grabatoz.ae
//               </a>
//             </div>

//             <div className="text-center">
//               <div className="flex justify-center mb-2">
//                 <Clock className="w-5 h-5 text-[#505e4d]" />
//               </div>
//               <h3 className="font-medium mb-1"><TranslatedText>Hours</TranslatedText></h3>
//               <p className="text-black"><TranslatedText>Daily 9:00 AM - 7:00 PM</TranslatedText></p>
//             </div>

//             <div className="text-center">
//               <div className="flex justify-center mb-2">
//                 <MapPin className="w-5 h-5 text-[#505e4d]" />
//               </div>
//               <h3 className="font-medium mb-1"><TranslatedText>Address</TranslatedText></h3>
//               <p className="text-black"><TranslatedText>P.O. Box 241975, Dubai, UAE</TranslatedText></p>
//             </div>
//           </div>

//           <div className="text-center pt-4 border-t border-gray-700">
//             <p className="text-black">
//               <strong>Grabatoz.ae</strong><br />
//               <b><TranslatedText>Powered by Crown Excel General Trading LLC</TranslatedText></b>
//             </p>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }












"use client";

import React from "react";
import { Shield, RotateCcw, CheckCircle, CreditCard, AlertTriangle, Mail, MapPin, Clock, Package, Truck, ArrowRight, XCircle } from "lucide-react";

export default function RefundAndReturn() {
  return (
    <div className="min-h-screen bg-[#f3f5f2]">
      {/* Hero Section */}
      <div className="bg-[#505e4d] text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-4">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Customer Protection</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Refund & Return Policy
              </h1>
              <p className="text-xl text-white max-w-xl">
                At Seenalif, your satisfaction is our priority. We offer a hassle-free return and refund process.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">15</div>
                <div className="text-white">Days Return Window</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#505e4d] border border-[#e4e8e1]">
            <CheckCircle className="w-8 h-8 text-[#505e4d] mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Easy Returns</h3>
            <p className="text-gray-600 text-sm">Simple and quick return process</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#505e4d] border border-[#e4e8e1]">
            <CreditCard className="w-8 h-8 text-[#505e4d] mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Fast Refunds</h3>
            <p className="text-gray-600 text-sm">Refunds processed within 5-15 days</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#505e4d] border border-[#e4e8e1]">
            <RotateCcw className="w-8 h-8 text-[#505e4d] mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Free Exchange</h3>
            <p className="text-gray-600 text-sm">Exchange for same or different product</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Return Eligibility */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#dfe5db] overflow-hidden mb-8">
          <div className="bg-[#505e4d] px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Shield className="w-6 h-6" />
              Return Eligibility
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Seenalif offers a <strong>15-day return window</strong> from the date of receipt to initiate a return request. To be eligible for a return:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Product must be in original condition with all tags attached",
                "Item must be unused, undamaged, and free from stains",
                "All accessories, manuals, and components must be included",
                "Protective seals and labels must be intact",
                "Product must not have been damaged due to misuse",
                "Customized products or items with cut cables are not eligible"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-[#f7f9f6] rounded-lg border border-[#e6ebe3]">
                  <CheckCircle className="w-5 h-5 text-[#505e4d] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Return Methods */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-[#dfe5db] p-6">
            <div className="w-12 h-12 bg-[#eef2eb] rounded-xl flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-[#505e4d]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">In-Store Return</h3>
            <p className="text-gray-600 mb-4">
              Visit our store location to return, refund, or exchange your product. Bring the item and original invoice.
            </p>
            <div className="bg-[#f7f9f6] rounded-lg p-4 border border-[#e6ebe3]">
              <p className="text-[#505e4d] text-sm font-medium">Our Location:</p>
              <p className="text-[#505e4d] text-sm">Shop 11# Sultan Building, AL Raffa St., Burdubai, Dubai, UAE</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#dfe5db] p-6">
            <div className="w-12 h-12 bg-[#eef2eb] rounded-xl flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-[#505e4d]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Home Pick-Up</h3>
            <p className="text-gray-600 mb-4">
              Our delivery team will contact you to schedule a convenient pickup time at your location.
            </p>
            <div className="bg-[#f7f9f6] rounded-lg p-4 border border-[#e6ebe3]">
              <p className="text-[#505e4d] text-sm font-medium">Note:</p>
              <p className="text-[#505e4d] text-sm">Return delivery charges may apply based on location</p>
            </div>
          </div>
        </div>

        {/* Refund Process */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#dfe5db] overflow-hidden mb-8">
          <div className="bg-[#505e4d] px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <CreditCard className="w-6 h-6" />
              Refund Process
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              {["Product Received", "Inspection", "Refund Initiated", "Amount Credited"].map((step, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#505e4d] text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 font-medium">{step}</span>
                  </div>
                  {index < 3 && <ArrowRight className="w-5 h-5 text-gray-300 hidden md:block" />}
                </React.Fragment>
              ))}
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#505e4d]"></span>
                Refunds are processed within <strong>15 business days</strong> after successful inspection
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#505e4d]"></span>
                Amount will be credited to the <strong>original payment method</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#505e4d]"></span>
                All refunds are processed in AED; international cards may have currency conversion
              </li>
            </ul>
          </div>
        </div>

        {/* Important Policy Notes */}
        <div className="bg-white rounded-2xl border border-[#dfe5db] p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#eef2eb] rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-[#505e4d]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1f2937] mb-3">Important Policy Notes</h3>
              <p className="text-[#505e4d] mb-3">Seenalif reserves the right to:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-[#505e4d] flex-shrink-0 mt-1" />
                  Refuse returns that do not meet the conditions stated above
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-[#505e4d] flex-shrink-0 mt-1" />
                  Take action against policy abuse including warnings or account suspension
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-[#505e4d] flex-shrink-0 mt-1" />
                  Apply additional terms based on manufacturer or supplier guidelines
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Defective vs Non-Defective */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-[#dfe5db] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#eef2eb] rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-[#505e4d]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Defective Items</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li> Report within 15 days with order details and photos</li>
              <li> We will verify and arrange replacement or refund</li>
              <li> Return shipping for defective items covered by us</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#dfe5db] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#eef2eb] rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-[#505e4d]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Non-Defective Items</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li> Returns accepted only if unused and in original packaging</li>
              <li> Must be requested within 15 days of delivery</li>
              <li> Return shipping costs are customer responsibility</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Footer */}
      <div className="bg-[#e8ece6] text-[#1f2937] border-t border-[#d7ddd3]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Need Help with Returns?</h2>
            <p className="text-[#505e4d]">Our support team is here to assist you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center border border-[#d7ddd3] shadow-sm">
              <Mail className="w-8 h-8 mx-auto mb-3 text-[#505e4d]" />
              <h3 className="font-semibold mb-1">Email Us</h3>
              <a href="mailto:Support@seenalif.com" className="text-[#505e4d] hover:text-[#404b3d]">
                Support@seenalif.com
              </a>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center border border-[#d7ddd3] shadow-sm">
              <Clock className="w-8 h-8 mx-auto mb-3 text-[#505e4d]" />
              <h3 className="font-semibold mb-1">Business Hours</h3>
              <p className="text-[#505e4d]">Daily 9:00 AM - 9:00 PM</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center border border-[#d7ddd3] shadow-sm">
              <MapPin className="w-8 h-8 mx-auto mb-3 text-[#505e4d]" />
              <h3 className="font-semibold mb-1">Visit Us</h3>
              <p className="text-[#505e4d] text-sm">Shop 11# Sultan Building, AL Raffa St., Burdubai, Dubai, UAE</p>
            </div>
          </div>

          <div className="text-center mt-8 pt-6 border-t border-[#cfd7cb]">
            <p className="text-[#505e4d]">
              <strong className="text-[#1f2937]">Seenalif</strong>  Powered by Super Boss Computers Trading LLC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



