// "use client";

// import React from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { Shield, FileText, Users, CreditCard, Globe, Phone, Mail, MapPin, Clock } from "lucide-react";
// import { useLanguage } from "../context/LanguageContext";
// import TranslatedText from "../components/TranslatedText";

// export default function TermsAndConditions() {
//   const navigate = useNavigate();
//   const { getLocalizedPath } = useLanguage();

//   // Future functionality for Arabic version
//   // const handleArabicClick = () => {
//   //   navigate('/terms-conditions-arabic');
//   // };

//   return (
//     <div className="bg-white min-h-screen">
//       {/* Header */}
//       <div className="bg-white">
//         <div className="max-w-4xl mx-auto px-6 py-12 text-center">
//           <div className="flex justify-center mb-6">
//             <div className="bg-[#505e4d] rounded-full p-4">
//               <Shield className="w-12 h-12 text-white" />
//             </div>
//           </div>
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             <TranslatedText>Terms & Conditions</TranslatedText>
//           </h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Welcome to Grabatoz.ae, a service by Crown Excel General Trading LLC. Understanding our terms and your rights when using our services.
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
        
//         {/* Introduction */}
//         <div className="bg-white rounded-xl p-8 mb-8">
//           <div className="flex flex-col md:flex-row md:items-start gap-6">
//             <div className="flex justify-center md:justify-start">
//               <div className="bg-[#505e4d] rounded-full p-3">
//                 <FileText className="w-8 h-8 text-white flex-shrink-0" />
//               </div>
//             </div>
//             <div className="text-center md:text-left">
//               <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>Introduction</TranslatedText></h2>
//               <div className="text-gray-700 leading-relaxed space-y-4">
//                 <p>
//                   Welcome to Grabatoz.ae, a service provided by Crown Excel General Trading LLC, United Arab Emirates. By accessing or using Grabatoz.ae or any associated services, you acknowledge and agree to the terms and conditions outlined below. These terms apply to all users of the site, including without limitation vendors, customers, merchants, and/or contributors of content.
//                 </p>
//                 <p>
//                   All products and services displayed on Grabatoz.ae constitute an "invitation to offer." Your order represents an "offer," which is subject to acceptance by Grabatoz. Upon placing an order, you will receive an email confirming receipt of your order. This confirmation does not signify our acceptance. Our acceptance takes place only upon dispatch of the product(s) ordered.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Terms Sections */}
//         <div className="space-y-6">
          
//           {/* Membership Eligibility */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Users className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>1. Membership Eligibility</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>The services of Grabatoz.ae are only available to individuals who are legally eligible to enter into contracts as per UAE laws.</p>
//                   <ul className="list-disc list-inside space-y-2 ml-4">
//                     <li>Users below 18 years of age must use the site under supervision of a parent or legal guardian who agrees to be bound by these terms.</li>
//                     <li>Grabatoz.ae reserves the right to terminate access to users found to be in violation of these terms or providing false information.</li>
//                     <li>Users accessing the website from outside the UAE are responsible for compliance with their local laws.</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Account & Registration */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <FileText className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>2. Account & Registration</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>When using Grabatoz.ae, you are responsible for maintaining the confidentiality of your account and password and for restricting access to your device. You agree to accept responsibility for all activities under your account.</p>
//                   <div>
//                     <p className="font-medium mb-2">You agree to:</p>
//                     <ul className="list-disc list-inside space-y-2 ml-4">
//                       <li>Provide accurate and complete registration data.</li>
//                       <li>Keep your information updated.</li>
//                       <li>Inform us immediately in case of any unauthorized access or breach.</li>
//                     </ul>
//                   </div>
//                   <p>Grabatoz reserves the right to suspend or terminate accounts for providing false, outdated, or misleading information.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Pricing & Orders */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <CreditCard className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>3. Pricing & Orders</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>Grabatoz.ae strives to provide accurate product descriptions and pricing. However, errors may occur.</p>
//                   <ul className="list-disc list-inside space-y-2 ml-4">
//                     <li>In case of incorrect price or information, we reserve the right to cancel the order.</li>
//                     <li>We will notify you via email before dispatch if there's a discrepancy in price or availability.</li>
//                     <li>Prices and availability are subject to change without prior notice.</li>
//                     <li>No cash refunds are provided; all refunds are processed via original payment methods.</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Order Cancellation */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Globe className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>4. Order Cancellation</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>
//                     <strong>By Grabatoz:</strong> We reserve the right to cancel orders due to stock issues, pricing errors, or fraud concerns.
//                   </p>
//                   <p>
//                     <strong>By Customer:</strong> You may cancel an order before it is processed. Once shipped, cancellations are not permitted.
//                   </p>
//                   <p>Refunds for canceled orders (by either party) will be credited to your original payment method. Or grabatoz will make a credit voucher.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Third-Party & Branded Product Disclaimer */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Globe className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>5. Third-Party & Branded Product Disclaimer</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>
//                     Grabatoz.ae offers a variety of products, including items listed by third-party vendors, marketplace partners, and branded products supplied via external platforms. While some of these branded products may have originally been sourced through Grabatoz or Crown Excel General Trading LLC, we are not responsible for products sold directly by third-party sellers, vendors, or external platforms.
//                   </p>
//                   <p>Grabatoz assumes responsibility only for products sold directly by the official Grabatoz store or Crown Excel store. Any product listed by a third-party, even if originally supplied by Grabatoz, falls under the responsibility of the respective vendor or seller.</p>
//                   <p>In the case of branded items, Grabatoz does not guarantee the performance, durability, or quality of such products. These aspects are solely determined by the original manufacturer. However, Grabatoz can assist in processing returns, warranty claims, or maintenance requests on behalf of the customer, strictly in accordance with the brand's or manufacturer's warranty, return, and exchange policy.</p>
//                   <p>Customers are advised to read all seller and manufacturer policies carefully before making a purchase. Grabatoz is not liable for discrepancies in performance or service standards for third-party or branded items not directly sold by us.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Payment & Credit Card Information */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <CreditCard className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>6. Payment & Credit Card Information</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <ul className="list-disc list-inside space-y-2">
//                     <li>Payments must be made using valid credit/debit cards owned by the customer.</li>
//                     <li>Grabatoz will not share payment information with third parties except in case of fraud investigation or as required by law.</li>
//                     <li>Fraudulent transactions will be reported, and Grabatoz reserves the right to take legal action.</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Declined or Fraudulent Transactions */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Shield className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>7. Declined or Fraudulent Transactions</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>Grabatoz reserves the right to recover the cost of goods, collection charges, and legal fees from users involved in fraudulent transactions.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Electronic Communications */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Mail className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>8. Electronic Communications</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>By visiting Grabatoz.ae or communicating with us electronically, you consent to receive communications from us electronically, including emails, notices, and updates.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Currency & Foreign Transactions */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <CreditCard className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>9. Currency & Foreign Transactions</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <ul className="list-disc list-inside space-y-2">
//                     <li>All transactions are processed in UAE Dirham (AED).</li>
//                     <li>If your card is issued by a non-UAE bank, exchange rates and charges may apply.</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Product Availability & "On Demand" Items */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Globe className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>10. Product Availability & "On Demand" Items</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <ul className="list-disc list-inside space-y-2">
//                     <li>Items marked "check availability" are sourced upon order confirmation and may take additional time.</li>
//                     <li>We do not guarantee availability for such items but will keep you informed throughout the process.</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Use of the Site */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Shield className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>11. Use of the Site</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>You agree not to use the website for:</p>
//                   <ul className="list-disc list-inside space-y-2 ml-4">
//                     <li>Posting unlawful or harmful content.</li>
//                     <li>Conducting fraudulent transactions.</li>
//                     <li>Gaining unauthorized access to systems.</li>
//                     <li>Violating UAE laws or infringing intellectual property rights.</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Colors & Product Display */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Globe className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>12. Colors & Product Display</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>We strive to display the colors and images of all products available on Grabatoz.ae as accurately as possible. However, the actual colors you see may vary depending on your screen resolution, device settings, or lighting conditions. Therefore, we cannot guarantee that your device's display will reflect the true color or appearance of the product.</p>
//                   <p>To avoid misunderstandings, we strongly encourage customers to carefully review the complete product descriptions, specifications, and additional details provided on each product page. If you require further clarification or specific information about any product, our dedicated support team is always available to assist you.</p>
//                   <p>For quick assistance, you may use the following available channels:</p>
//                   <ul className="list-disc list-inside space-y-2 ml-4">
//                     <li>Chat with a Specialist</li>
//                     <li>Request a Callback</li>
//                   </ul>
//                   <p>These features are designed to ensure you receive accurate guidance before making a purchase.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Intellectual Property Rights */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Shield className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>13. Intellectual Property Rights</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>All content, design, layout, graphics, and logos on Grabatoz.ae are the property of Crown Excel General Trading LLC or its licensors. You may not reproduce, distribute, or create derivative works without express written permission.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Reviews & Submissions */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <FileText className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>14. Reviews & Submissions</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>All content submitted to Grabatoz.ae (reviews, comments, suggestions) becomes the property of Grabatoz. We reserve the right to use, publish, or remove content at our discretion.</p>
//                   <p>You agree not to post:</p>
//                   <ul className="list-disc list-inside space-y-2 ml-4">
//                     <li>Obscene, illegal, or defamatory content.</li>
//                     <li>Copyright-infringing material.</li>
//                     <li>Spam or unauthorized advertising.</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Indemnification */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Shield className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>15. Indemnification</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>You agree to indemnify and hold Grabatoz, its affiliates, employees, directors, and agents harmless from any claims, liabilities, or losses arising out of your violation of these terms, use of the site, or breach of laws.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Termination */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Shield className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>16. Termination</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>Grabatoz reserves the right to suspend or terminate your access to the site at any time without notice, including for breach of terms or unlawful activity.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Governing Law & Jurisdiction */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Globe className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>17. Governing Law & Jurisdiction</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* OFAC Compliance */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Shield className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>18. OFAC Compliance</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>Grabatoz will not process or ship any orders to OFAC-sanctioned countries, as per UAE regulations.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Privacy Policy */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <Shield className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>19. Privacy Policy</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>Your use of Grabatoz.ae is subject to our Privacy Policy, which outlines how we collect, use, and protect your personal data. We do not sell or rent your data without your consent. See our full <Link to="/privacy-policy" className="text-[#505e4d] hover:underline font-medium">Privacy Policy</Link> for more details.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Changes to Terms */}
//           <section className="bg-white rounded-xl p-8">
//             <div className="flex flex-col md:flex-row md:items-start gap-6">
//               <div className="flex justify-center md:justify-start">
//                 <div className="bg-[#505e4d] rounded-full p-3">
//                   <FileText className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4"><TranslatedText>20. Changes to Terms</TranslatedText></h2>
//                 <div className="space-y-4 text-gray-700 leading-relaxed">
//                   <p>Grabatoz may update these Terms & Conditions at any time without prior notice. Continued use of the site after updates constitutes your acceptance of the revised terms.</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//         </div>
//       </div>

//       {/* Contact Information */}
//       <section className="bg-gray-50 text-black p-4">
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center mb-8">
//             <h2 className="text-2xl font-semibold mb-2"><TranslatedText>Contact Information</TranslatedText></h2>
//             <p className="text-black"><TranslatedText>Get in touch with our team for any questions or concerns</TranslatedText></p>
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
//               <a href="mailto:customercare@grabatoz.ae" className="text-black">
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

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, FileText, Users, CreditCard, Globe, Phone, Mail, MapPin, Clock, ChevronDown, ChevronUp, Scale, Gavel, AlertTriangle, Package } from "lucide-react";

export default function TermsAndConditions() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const sections = [
    {
      icon: Users,
      title: "1. Membership Eligibility",
      content: `The services of Seenalif are only available to individuals who are legally eligible to enter into contracts as per UAE laws.
      
       Users below 18 years of age must use the site under supervision of a parent or legal guardian
       Seenalif reserves the right to terminate access to users found in violation of these terms
       Users accessing from outside the UAE are responsible for compliance with their local laws`
    },
    {
      icon: FileText,
      title: "2. Account & Registration",
      content: `When using Seenalif, you are responsible for maintaining the confidentiality of your account and password.
      
      You agree to:
       Provide accurate and complete registration data
       Keep your information updated
       Inform us immediately in case of any unauthorized access or breach
      
      Seenalif reserves the right to suspend or terminate accounts for providing false, outdated, or misleading information.`
    },
    {
      icon: CreditCard,
      title: "3. Pricing & Orders",
      content: `Seenalif strives to provide accurate product descriptions and pricing. However, errors may occur.
      
       In case of incorrect price or information, we reserve the right to cancel the order
       We will notify you via email before dispatch if there is a discrepancy in price or availability
       Prices and availability are subject to change without prior notice
       No cash refunds are provided; all refunds are processed via original payment methods`
    },
    {
      icon: Globe,
      title: "4. Order Cancellation",
      content: `By Seenalif: We reserve the right to cancel orders due to stock issues, pricing errors, or fraud concerns.
      
      By Customer: You may cancel an order before it is processed. Once shipped, cancellations are not permitted.
      
      Refunds for canceled orders (by either party) will be credited to your original payment method or as a Seenalif credit voucher.`
    },
    {
      icon: Package,
      title: "5. Third-Party & Branded Product Disclaimer",
      content: `Seenalif offers a variety of products, including items listed by third-party vendors and branded products.
      
       Seenalif assumes responsibility only for products sold directly by the official Seenalif store
       We can assist in processing returns, warranty claims, or maintenance requests on behalf of the customer
       Customers are advised to read all seller and manufacturer policies carefully before making a purchase`
    },
    {
      icon: CreditCard,
      title: "6. Payment & Credit Card Information",
      content: ` Payments must be made using valid credit/debit cards owned by the customer
       Seenalif will not share payment information with third parties except in case of fraud investigation
       Fraudulent transactions will be reported, and Seenalif reserves the right to take legal action`
    },
    {
      icon: Shield,
      title: "7. Declined or Fraudulent Transactions",
      content: `Seenalif reserves the right to recover the cost of goods, collection charges, and legal fees from users involved in fraudulent transactions.`
    },
    {
      icon: Mail,
      title: "8. Electronic Communications",
      content: `By visiting Seenalif or communicating with us electronically, you consent to receive communications from us electronically, including emails, notices, and updates.`
    },
    {
      icon: CreditCard,
      title: "9. Currency & Foreign Transactions",
      content: ` All transactions are processed in UAE Dirham (AED)
       If your card is issued by a non-UAE bank, exchange rates and charges may apply`
    },
    {
      icon: Package,
      title: "10. Product Availability",
      content: ` Items marked "check availability" are sourced upon order confirmation and may take additional time
       We do not guarantee availability for such items but will keep you informed throughout the process`
    },
    {
      icon: AlertTriangle,
      title: "11. Use of the Site",
      content: `You agree not to use the website for:
       Posting unlawful or harmful content
       Conducting fraudulent transactions
       Gaining unauthorized access to systems
       Violating UAE laws or infringing intellectual property rights`
    },
    {
      icon: Globe,
      title: "12. Colors & Product Display",
      content: `We strive to display product colors as accurately as possible. However, actual colors may vary depending on your screen resolution or device settings.
      
      For quick assistance:
       Chat with a Specialist
       Request a Callback`
    },
    {
      icon: Shield,
      title: "13. Intellectual Property Rights",
      content: `All content, design, layout, graphics, and logos on Seenalif are the property of Super Boss Computers Trading LLC or its licensors. You may not reproduce, distribute, or create derivative works without express written permission.`
    },
    {
      icon: FileText,
      title: "14. Reviews & Submissions",
      content: `All content submitted to Seenalif becomes the property of Seenalif. We reserve the right to use, publish, or remove content at our discretion.
      
      You agree not to post:
       Obscene, illegal, or defamatory content
       Copyright-infringing material
       Spam or unauthorized advertising`
    },
    {
      icon: Scale,
      title: "15. Indemnification",
      content: `You agree to indemnify and hold Seenalif, its affiliates, employees, directors, and agents harmless from any claims, liabilities, or losses arising out of your violation of these terms.`
    },
    {
      icon: AlertTriangle,
      title: "16. Termination",
      content: `Seenalif reserves the right to suspend or terminate your access to the site at any time without notice, including for breach of terms or unlawful activity.`
    },
    {
      icon: Gavel,
      title: "17. Governing Law & Jurisdiction",
      content: `These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai.`
    },
    {
      icon: Shield,
      title: "18. OFAC Compliance",
      content: `Seenalif will not process or ship any orders to OFAC-sanctioned countries, as per UAE regulations.`
    },
    {
      icon: Shield,
      title: "19. Privacy Policy",
      content: `Your use of Seenalif is subject to our Privacy Policy, which outlines how we collect, use, and protect your personal data. We do not sell or rent your data without your consent.`
    },
    {
      icon: FileText,
      title: "20. Changes to Terms",
      content: `Seenalif may update these Terms & Conditions at any time without prior notice. Continued use of the site after updates constitutes your acceptance of the revised terms.`
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[#505e4d] via-[#505e4d] to-[#505e4d] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#505e4d]/10 to-[#505e4d]/10"></div>
        <div className="max-w-5xl mx-auto px-6 py-16 relative">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 border border-[#505e4d]/30">
              <Scale className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms & Conditions
            </h1>
            <p className="text-xl text-white max-w-2xl">
              Welcome to Seenalif, a service by Super Boss Computers Trading LLC. Please read these terms carefully.
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-[#505e4d] to-[#505e4d] rounded-2xl p-8 border border-[#505e4d]">
          <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
          <p className="text-white leading-relaxed mb-4">
            By accessing or using Seenalif or any associated services, you acknowledge and agree to the terms and conditions outlined below. These terms apply to all users of the site, including vendors, customers, merchants, and contributors of content.
          </p>
          <p className="text-white leading-relaxed">
            All products and services displayed on Seenalif constitute an "invitation to offer." Your order represents an "offer," which is subject to acceptance by Seenalif upon dispatch of the product(s) ordered.
          </p>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-[#505e4d]"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    openSection === index ? 'bg-[#505e4d] text-white' : 'bg-white text-[#505e4d]'
                  }`}>
                    <section.icon className="w-5 h-5" />
                  </div>
                  <span className={`font-semibold text-left ${openSection === index ? 'text-white' : 'text-gray-900'}`}>
                    {section.title}
                  </span>
                </div>
                {openSection === index ? (
                  <ChevronUp className="w-5 h-5 text-white" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {openSection === index && (
                <div className="px-5 pb-5 bg-gray-50 border-t">
                  <div className="pt-4 pl-14 text-gray-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Privacy Policy Link */}
        <div className="mt-8 p-6 bg-[#505e4d] rounded-2xl text-white">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8" />
            <div>
              <h3 className="font-bold text-lg">Privacy Policy</h3>
              <p className="text-white">
                For details on how we handle your data, see our{" "}
                <Link to="/privacy-policy" className="underline hover:text-white font-medium">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Footer */}
      <div className="bg-[#505e4d] text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
            <p className="text-white">Get in touch with our team for any questions or concerns</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-white/10">
              <Phone className="w-6 h-6 text-white mx-auto mb-2" />
              <h3 className="font-medium mb-1">Phone</h3>
              <a href="tel:+97143258808" className="text-white hover:text-white">+971 4 3258808</a>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/10">
              <Mail className="w-6 h-6 text-white mx-auto mb-2" />
              <h3 className="font-medium mb-1">Email</h3>
              <a href="mailto:Support@seenalif.com" className="text-white hover:text-white">Support@seenalif.com</a>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/10">
              <Clock className="w-6 h-6 text-white mx-auto mb-2" />
              <h3 className="font-medium mb-1">Hours</h3>
              <p className="text-white">Daily 9:00 AM - 7:00 PM</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/10">
              <MapPin className="w-6 h-6 text-white mx-auto mb-2" />
              <h3 className="font-medium mb-1">Address</h3>
              <p className="text-white text-sm">Shop 11# Sultan Building, AL Raffa St., Burdubai, Dubai, UAE</p>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-6 border-t border-white/20">
            <p className="text-white">
              <strong className="text-white">Seenalif</strong> - Powered by Super Boss Computers Trading LLC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



