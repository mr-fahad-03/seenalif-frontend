// "use client"

// import { useState } from "react"
// import { Mail, Phone, Clock, MapPin } from "lucide-react"

// export default function PrivacyPolicy() {
//   const [language, setLanguage] = useState("english")

//   const content = {
//     english: {
//       title: "Privacy Policy",
      
//       company: "Company: Grabatoz powered by Crown Excel General Trading LLC",
//       sections: {
//         introduction: {
//           title: "Introduction",
//           content: `Grabatoz, powered by Crown Excel General Trading LLC ("we," "us," or "our"), respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information when you use our website grabatoz.ae and related services.`,
//         },
//         dataCollection: {
//           title: "Data Collection and Usage",
//           points: [
//             "We do not collect personal data from users located in the European Union (EU).",
//             "We use certain authorized third-party service providers, such as payment gateways, analytics tools, and shipping providers, to operate and improve our services. These third parties may collect and process data according to their own privacy policies.",
//             "We collect information you provide voluntarily, such as during registration, purchases, or contacting customer support, and use it solely to provide, personalize, and enhance our services.",
//           ],
//         },
//         cookies: {
//           title: "Cookies and Tracking Technologies",
//           points: [
//             "Our site uses cookies and similar tracking technologies to improve user experience, security, and site functionality.",
//             "Cookies may be used to remember your preferences, enable shopping features, analyze site traffic, and display personalized content or advertisements.",
//             "You may disable cookies via your browser settings; however, some features of our site may not function properly without cookies enabled.",
//           ],
//         },
//         rights: {
//           title: "Your Rights",
//           points: [
//             "You have the right to access, correct, or delete your personal data.",
//             "You may opt out of marketing communications at any time.",
//             "For any privacy-related inquiries or to exercise your rights, please contact us at: customercare@grabatoz.ae",
//           ],
//         },
//         security: {
//           title: "Data Security",
//           content:
//             "We implement appropriate technical and organizational measures to protect your data against unauthorized access, loss, or alteration. However, internet transmissions are not completely secure, and we cannot guarantee absolute security.",
//         },
//         changes: {
//           title: "Changes to This Policy",
//           content:
//             "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.",
//         },
//         contact: {
//           title: "Contact Information",
//           details: {
//             website: "Grabatoz.ae",
//             poweredBy: "Powered by Crown Excel General Trading LLC",
//             poBox: "P.O. Box No: 241975, Dubai, UAE",
//             customerService: "Customer Service:",
//             phone: "Tel: +971 0505033860",
//             email: "Email: customercare@grabatoz.ae",
//             hours: "Customer service hours: Daily from 9:00 AM to 7:00 PM",
//           },
//         },
//       },
//     },
//     arabic: {
//       title: "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©",
//       effectiveDate: "ØªØ§Ø±ÙŠØ® Ø§Ù„Ù†ÙØ§Ø°: [Ø£Ø¯Ø®Ù„ Ø§Ù„ØªØ§Ø±ÙŠØ®]",
//       company: "Ø´Ø±ÙƒØ©: Grabatoz powered by Crown Excel General Trading LLC",
//       sections: {
//         introduction: {
//           title: "Ù…Ù‚Ø¯Ù…Ø©",
//           content: `ØªØ­ØªØ±Ù… Ø´Ø±ÙƒØ© Grabatoz Ø§Ù„Ù…Ø¯Ø¹ÙˆÙ…Ø© Ù…Ù† Crown Excel General Trading LLC ("Ù†Ø­Ù†"ØŒ "Ù„Ù†Ø§" Ø£Ùˆ "Ø®Ø§ØµØªÙ†Ø§") Ø®ØµÙˆØµÙŠØªÙƒ ÙˆØªÙ„ØªØ²Ù… Ø¨Ø­Ù…Ø§ÙŠØ© Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ø§Ù„Ø´Ø®ØµÙŠØ©. ØªÙˆØ¶Ø­ Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ© Ù‡Ø°Ù‡ ÙƒÙŠÙÙŠØ© Ø¬Ù…Ø¹ Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙƒ ÙˆØ§Ø³ØªØ®Ø¯Ø§Ù…Ù‡Ø§ ÙˆØ­Ù…Ø§ÙŠØªÙ‡Ø§ Ø¹Ù†Ø¯ Ø§Ø³ØªØ®Ø¯Ø§Ù…Ùƒ Ù„Ù…ÙˆÙ‚Ø¹Ù†Ø§ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ grabatoz.ae ÙˆØ§Ù„Ø®Ø¯Ù…Ø§Øª Ø°Ø§Øª Ø§Ù„ØµÙ„Ø©.`,
//         },
//         dataCollection: {
//           title: "Ø¬Ù…Ø¹ ÙˆØ§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª",
//           points: [
//             "Ù†Ø­Ù† Ù„Ø§ Ù†Ø¬Ù…Ø¹ Ø¨ÙŠØ§Ù†Ø§Øª Ø´Ø®ØµÙŠØ© Ù…Ù† Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ù…Ù‚ÙŠÙ…ÙŠÙ† ÙÙŠ Ø§Ù„Ø§ØªØ­Ø§Ø¯ Ø§Ù„Ø£ÙˆØ±ÙˆØ¨ÙŠ.",
//             "Ù†Ø³ØªØ®Ø¯Ù… Ù…Ø²ÙˆØ¯ÙŠ Ø®Ø¯Ù…Ø§Øª Ù…Ù† Ø·Ø±Ù Ø«Ø§Ù„Ø« Ù…Ø®ÙˆÙ„ÙŠÙ†ØŒ Ù…Ø«Ù„ Ø¨ÙˆØ§Ø¨Ø§Øª Ø§Ù„Ø¯ÙØ¹ ÙˆØ£Ø¯ÙˆØ§Øª Ø§Ù„ØªØ­Ù„ÙŠÙ„ ÙˆÙ…Ø²ÙˆØ¯ÙŠ Ø§Ù„Ø´Ø­Ù†ØŒ Ù„ØªØ´ØºÙŠÙ„ ÙˆØªØ­Ø³ÙŠÙ† Ø®Ø¯Ù…Ø§ØªÙ†Ø§. Ù‚Ø¯ ÙŠÙ‚ÙˆÙ… Ù‡Ø¤Ù„Ø§Ø¡ Ø§Ù„Ø·Ø±Ù Ø§Ù„Ø«Ø§Ù„Ø« Ø¨Ø¬Ù…Ø¹ ÙˆÙ…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆÙÙ‚Ù‹Ø§ Ù„Ø³ÙŠØ§Ø³Ø§Øª Ø§Ù„Ø®ØµÙˆØµÙŠØ© Ø§Ù„Ø®Ø§ØµØ© Ø¨Ù‡Ù….",
//             "Ù†Ø¬Ù…Ø¹ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„ØªÙŠ ØªÙ‚Ø¯Ù…Ù‡Ø§ Ø·ÙˆØ§Ø¹ÙŠØ©Ù‹ØŒ Ù…Ø«Ù„ Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø£Ùˆ Ø§Ù„Ø´Ø±Ø§Ø¡ Ø£Ùˆ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø¯Ø¹Ù… Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ØŒ ÙˆÙ†Ø³ØªØ®Ø¯Ù…Ù‡Ø§ ÙÙ‚Ø· Ù„ØªÙ‚Ø¯ÙŠÙ… Ø®Ø¯Ù…Ø§ØªÙ†Ø§ ÙˆØªØ®ØµÙŠØµÙ‡Ø§ ÙˆØªØ­Ø³ÙŠÙ†Ù‡Ø§.",
//           ],
//         },
//         cookies: {
//           title: "Ù…Ù„ÙØ§Øª ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø· ÙˆØªÙ‚Ù†ÙŠØ§Øª Ø§Ù„ØªØªØ¨Ø¹",
//           points: [
//             "ÙŠØ³ØªØ®Ø¯Ù… Ù…ÙˆÙ‚Ø¹Ù†Ø§ Ù…Ù„ÙØ§Øª ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø· ÙˆØªÙ‚Ù†ÙŠØ§Øª Ø§Ù„ØªØªØ¨Ø¹ Ø§Ù„Ù…Ù…Ø§Ø«Ù„Ø© Ù„ØªØ­Ø³ÙŠÙ† ØªØ¬Ø±Ø¨Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙˆØ§Ù„Ø£Ù…Ø§Ù† ÙˆÙˆØ¸Ø§Ø¦Ù Ø§Ù„Ù…ÙˆÙ‚Ø¹.",
//             "Ù‚Ø¯ ØªÙØ³ØªØ®Ø¯Ù… Ù…Ù„ÙØ§Øª ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø· Ù„ØªØ°ÙƒØ± ØªÙØ¶ÙŠÙ„Ø§ØªÙƒØŒ ÙˆØªÙ…ÙƒÙŠÙ† Ù…ÙŠØ²Ø§Øª Ø§Ù„ØªØ³ÙˆÙ‚ØŒ ÙˆØªØ­Ù„ÙŠÙ„ Ø­Ø±ÙƒØ© Ø§Ù„Ù…ÙˆÙ‚Ø¹ØŒ ÙˆØ¹Ø±Ø¶ Ù…Ø­ØªÙˆÙ‰ Ø£Ùˆ Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ù…Ø®ØµØµØ©.",
//             "ÙŠÙ…ÙƒÙ†Ùƒ ØªØ¹Ø·ÙŠÙ„ Ù…Ù„ÙØ§Øª ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø· Ù…Ù† Ø®Ù„Ø§Ù„ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ØªØµÙØ­ØŒ Ù„ÙƒÙ† Ø¨Ø¹Ø¶ Ù…ÙŠØ²Ø§Øª Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ù‚Ø¯ Ù„Ø§ ØªØ¹Ù…Ù„ Ø¨Ø´ÙƒÙ„ ØµØ­ÙŠØ­ Ø¨Ø¯ÙˆÙ† ØªÙ…ÙƒÙŠÙ† Ù…Ù„ÙØ§Øª ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø·.",
//           ],
//         },
//         rights: {
//           title: "Ø­Ù‚ÙˆÙ‚Ùƒ",
//           points: [
//             "Ù„Ø¯ÙŠÙƒ Ø§Ù„Ø­Ù‚ ÙÙŠ Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ø§Ù„Ø´Ø®ØµÙŠØ© ÙˆØªØµØ­ÙŠØ­Ù‡Ø§ Ø£Ùˆ Ø­Ø°ÙÙ‡Ø§.",
//             "ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„Ø§Øª Ø§Ù„ØªØ³ÙˆÙŠÙ‚ÙŠØ© ÙÙŠ Ø£ÙŠ ÙˆÙ‚Øª.",
//             "Ù„Ø£ÙŠ Ø§Ø³ØªÙØ³Ø§Ø±Ø§Øª Ù…ØªØ¹Ù„Ù‚Ø© Ø¨Ø§Ù„Ø®ØµÙˆØµÙŠØ© Ø£Ùˆ Ù„Ù…Ù…Ø§Ø±Ø³Ø© Ø­Ù‚ÙˆÙ‚ÙƒØŒ ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ Ø¹Ù„Ù‰: customercare@grabatoz.ae",
//           ],
//         },
//         security: {
//           title: "Ø£Ù…Ø§Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª",
//           content:
//             "Ù†Ø·Ø¨Ù‚ Ø§Ù„ØªØ¯Ø§Ø¨ÙŠØ± Ø§Ù„ÙÙ†ÙŠØ© ÙˆØ§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠØ© Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ø­Ù…Ø§ÙŠØ© Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ù…Ù† Ø§Ù„ÙˆØµÙˆÙ„ ØºÙŠØ± Ø§Ù„Ù…ØµØ±Ø­ Ø¨Ù‡ Ø£Ùˆ Ø§Ù„ÙÙ‚Ø¯Ø§Ù† Ø£Ùˆ Ø§Ù„ØªØºÙŠÙŠØ±. ÙˆÙ…Ø¹ Ø°Ù„ÙƒØŒ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø¶Ù…Ø§Ù† Ø§Ù„Ø£Ù…Ø§Ù† Ø§Ù„ÙƒØ§Ù…Ù„ Ù„Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ù†Ù‚Ù„ Ø¹Ø¨Ø± Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª.",
//         },
//         changes: {
//           title: "ØªØºÙŠÙŠØ±Ø§Øª Ù‡Ø°Ù‡ Ø§Ù„Ø³ÙŠØ§Ø³Ø©",
//           content:
//             "Ù‚Ø¯ Ù†Ù‚ÙˆÙ… Ø¨ØªØ­Ø¯ÙŠØ« Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ© Ù‡Ø°Ù‡ Ù…Ù† ÙˆÙ‚Øª Ù„Ø¢Ø®Ø±. Ø³ÙŠØªÙ… Ù†Ø´Ø± Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª Ø¹Ù„Ù‰ Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø© Ù…Ø¹ ØªØ§Ø±ÙŠØ® Ø§Ù„Ù†ÙØ§Ø° Ø§Ù„Ù…Ø­Ø¯Ø«.",
//         },
//         contact: {
//           title: "Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø§ØªØµØ§Ù„",
//           details: {
//             website: "Grabatoz.ae",
//             poweredBy: "Ø´Ø±ÙƒØ© Crown Excel General Trading LLC",
//             poBox: "ØµÙ†Ø¯ÙˆÙ‚ Ø¨Ø±ÙŠØ¯: 241975ØŒ Ø¯Ø¨ÙŠ",
//             customerService: "Ø®Ø¯Ù…Ø© Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡:",
//             phone: "Ù‡Ø§ØªÙ: +971 0505033860",
//             email: "Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ: customercare@grabatoz.ae",
//             hours: "Ø³Ø§Ø¹Ø§Øª Ø®Ø¯Ù…Ø© Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡: ÙŠÙˆÙ…ÙŠÙ‹Ø§ Ù…Ù† 9:00 ØµØ¨Ø§Ø­Ù‹Ø§ Ø­ØªÙ‰ 7:00 Ù…Ø³Ø§Ø¡Ù‹",
//           },
//         },
//       },
//     },
//   }

//   const currentContent = content[language]
//   const isArabic = language === "arabic"

//   return (
//     <div className={`min-h-screen bg-white py-8 px-4 ${isArabic ? "rtl" : "ltr"}`}>
//       <div className="max-w-4xl mx-auto">
//         {/* Language Toggle Buttons */}
//         <div className="flex justify-center gap-4 mb-8">
//           <button
//             onClick={() => setLanguage("english")}
//             className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
//               language === "english"
//                 ? "bg-[#505e4d] text-white hover:bg-[#505e4d]"
//                 : "bg-white border-2 border-[#505e4d] text-[#505e4d] hover:bg-white"
//             }`}
//           >
//             English
//           </button>
//           <button
//             onClick={() => setLanguage("arabic")}
//             className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
//               language === "arabic"
//                 ? "bg-[#505e4d] text-white hover:bg-[#505e4d]"
//                 : "bg-white border-2 border-[#505e4d] text-[#505e4d] hover:bg-white"
//             }`}
//           >
//             Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©
//           </button>
//         </div>

//         {/* Main Content */}
//         <div className="bg-white">
//           <div className="p-8">
//             {/* Header */}
//             <div className="text-center mb-8">
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentContent.title}</h1>
//               <p className="text-gray-600 mb-2">{currentContent.effectiveDate}</p>
//               <p className="text-gray-700 font-medium">{currentContent.company}</p>
//             </div>

//             {/* Introduction */}
//             <section className="mb-8">
//               <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-[#505e4d] pb-2">
//                 {currentContent.sections.introduction.title}
//               </h2>
//               <p className="text-gray-700 leading-relaxed">{currentContent.sections.introduction.content}</p>
//             </section>

//             {/* Data Collection and Usage */}
//             <section className="mb-8">
//               <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-[#505e4d] pb-2">
//                 {currentContent.sections.dataCollection.title}
//               </h2>
//               <ul className="space-y-3">
//                 {currentContent.sections.dataCollection.points.map((point, index) => (
//                   <li key={index} className="text-gray-700 leading-relaxed flex items-start">
//                     <span className="inline-block w-2 h-2 bg-[#505e4d] rounded-full mt-2 mr-3 ml-1 flex-shrink-0"></span>
//                     <span>{point}</span>
//                   </li>
//                 ))}
//               </ul>
//             </section>

//             {/* Cookies and Tracking Technologies */}
//             <section className="mb-8">
//               <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-[#505e4d] pb-2">
//                 {currentContent.sections.cookies.title}
//               </h2>
//               <ul className="space-y-3">
//                 {currentContent.sections.cookies.points.map((point, index) => (
//                   <li key={index} className="text-gray-700 leading-relaxed flex items-start">
//                     <span className="inline-block w-2 h-2 bg-[#505e4d] rounded-full mt-2 mr-3 ml-1 flex-shrink-0"></span>
//                     <span>{point}</span>
//                   </li>
//                 ))}
//               </ul>
//             </section>

//             {/* Your Rights */}
//             <section className="mb-8">
//               <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-[#505e4d] pb-2">
//                 {currentContent.sections.rights.title}
//               </h2>
//               <ul className="space-y-3">
//                 {currentContent.sections.rights.points.map((point, index) => (
//                   <li key={index} className="text-gray-700 leading-relaxed flex items-start">
//                     <span className="inline-block w-2 h-2 bg-[#505e4d] rounded-full mt-2 mr-3 ml-1 flex-shrink-0"></span>
//                     <span>{point}</span>
//                   </li>
//                 ))}
//               </ul>
//             </section>

//             {/* Data Security */}
//             <section className="mb-8">
//               <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-[#505e4d] pb-2">
//                 {currentContent.sections.security.title}
//               </h2>
//               <p className="text-gray-700 leading-relaxed">{currentContent.sections.security.content}</p>
//             </section>

//             {/* Changes to This Policy */}
//             <section className="mb-8">
//               <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-[#505e4d] pb-2">
//                 {currentContent.sections.changes.title}
//               </h2>
//               <p className="text-gray-700 leading-relaxed">{currentContent.sections.changes.content}</p>
//             </section>


//           </div>
//         </div>
//       </div>

//       {/* Contact Information */}
//       <section className="bg-gray-50 text-black p-4">
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center mb-8">
//             <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
//             <p className="text-black">Get in touch with our team for any questions or concerns</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//             <div className="text-center">
//               <div className="flex justify-center mb-2">
//                 <Phone className="w-5 h-5 text-[#505e4d]" />
//               </div>
//               <h3 className="font-medium mb-1">Phone</h3>
//               <a href="tel:+9710505033860" className="text-black">
//                 +971 0505033860
//               </a>
//             </div>

//             <div className="text-center">
//               <div className="flex justify-center mb-2">
//                 <Mail className="w-5 h-5 text-[#505e4d]" />
//               </div>
//               <h3 className="font-medium mb-1">Email</h3>
//               <a href="mailto:customercare@grabatoz.ae" className="text-black">
//                 customercare@grabatoz.ae
//               </a>
//             </div>

//             <div className="text-center">
//               <div className="flex justify-center mb-2">
//                 <Clock className="w-5 h-5 text-[#505e4d]" />
//               </div>
//               <h3 className="font-medium mb-1">Hours</h3>
//               <p className="text-black">Daily 9:00 AM - 7:00 PM</p>
//             </div>

//             <div className="text-center">
//               <div className="flex justify-center mb-2">
//                 <MapPin className="w-5 h-5 text-[#505e4d]" />
//               </div>
//               <h3 className="font-medium mb-1">Address</h3>
//               <p className="text-black">P.O. Box 241975, Dubai, UAE</p>
//             </div>
//           </div>

//           <div className="text-center pt-4 border-t border-gray-700">
//             <p className="text-black">
//               <strong>Grabatoz.ae</strong><br />
//               <b>Powered by Crown Excel General Trading LLC</b>
//             </p>
//           </div>
//         </div>
//       </section>
//     </div>
//   )
// }









"use client";

import { useState } from "react";
import { Mail, Phone, Clock, MapPin, Shield, Lock, Eye, Database, FileText, Users, CheckCircle, Globe } from "lucide-react";

export default function PrivacyPolicy() {
  const [language, setLanguage] = useState("english");
  const [activeTab, setActiveTab] = useState("collection");

  const tabs = [
    { id: "collection", label: "Data Collection", icon: Database },
    { id: "cookies", label: "Cookies", icon: Eye },
    { id: "rights", label: "Your Rights", icon: Users },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#505e4d] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
            <p className="text-gray-600 max-w-2xl">
              Seenalif, powered by Super Boss Computers Trading LLC, respects your privacy and is committed to protecting your personal data.
            </p>
            
            {/* Language Toggle */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setLanguage("english")}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  language === "english"
                    ? "bg-[#505e4d] text-white shadow-lg shadow-[#505e4d]/25"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("arabic")}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  language === "arabic"
                    ? "bg-[#505e4d] text-white shadow-lg shadow-[#505e4d]/25"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-5xl mx-auto px-6 py-12 ${language === "arabic" ? "rtl" : "ltr"}`}>
        
        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#505e4d] text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-50 border"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          
          {activeTab === "collection" && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Database className="w-6 h-6 text-[#505e4d]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {language === "english" ? "Data Collection and Usage" : "جمع واستخدام البيانات"}
                  </h2>
                  <div className="space-y-4">
                    {[
                      language === "english" 
                        ? "We do not collect personal data from users located in the European Union (EU)."
                        : "نحن لا نجمع بيانات شخصية من المستخدمين المقيمين في الاتحاد الأوروبي.",
                      language === "english"
                        ? "We use certain authorized third-party service providers, such as payment gateways, analytics tools, and shipping providers, to operate and improve our services."
                        : "نستخدم مزودي خدمات من طرف ثالث مثل بوابات الدفع وأدوات التحليل ومزودي الشحن لتشغيل وتحسين خدماتنا.",
                      language === "english"
                        ? "We collect information you provide voluntarily, such as during registration, purchases, or contacting customer support."
                        : "نجمع المعلومات التي تقدمها طوعًا مثل التسجيل أو الشراء أو التواصل مع دعم العملاء."
                    ].map((point, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-[#505e4d] flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "cookies" && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-[#505e4d]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {language === "english" ? "Cookies and Tracking Technologies" : "ملفات تعريف الارتباط وتقنيات التتبع"}
                  </h2>
                  <div className="space-y-4">
                    {[
                      language === "english"
                        ? "Our site uses cookies and similar tracking technologies to improve user experience, security, and site functionality."
                        : "يستخدم موقعنا ملفات تعريف الارتباط وتقنيات تتبع مشابهة لتحسين تجربة المستخدم والأمان ووظائف الموقع.",
                      language === "english"
                        ? "Cookies may be used to remember your preferences, enable shopping features, analyze site traffic, and display personalized content."
                        : "قد تُستخدم ملفات تعريف الارتباط لتذكر تفضيلاتك وتمكين ميزات التسوق وتحليل حركة الموقع وعرض محتوى مخصص.",
                      language === "english"
                        ? "You may disable cookies via your browser settings; however, some features may not function properly without cookies enabled."
                        : "يمكنك تعطيل ملفات تعريف الارتباط من خلال إعدادات المتصفح، لكن بعض الميزات قد لا تعمل بشكل صحيح."
                    ].map((point, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl">
                        <CheckCircle className="w-5 h-5 text-[#505e4d] flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "rights" && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-[#505e4d]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {language === "english" ? "Your Rights" : "حقوقك"}
                  </h2>
                  <div className="space-y-4">
                    {[
                      language === "english"
                        ? "You have the right to access, correct, or delete your personal data."
                        : "لديك الحق في الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها.",
                      language === "english"
                        ? "You may opt out of marketing communications at any time."
                        : "يمكنك إلغاء الاشتراك في الاتصالات التسويقية في أي وقت.",
                      language === "english"
                        ? "For any privacy-related inquiries or to exercise your rights, please contact us at: Support@seenalif.com"
                        : "لأي استفسارات متعلقة بالخصوصية أو لممارسة حقوقك يرجى التواصل معنا على: Support@seenalif.com"
                    ].map((point, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl">
                        <CheckCircle className="w-5 h-5 text-[#505e4d] flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-[#505e4d]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {language === "english" ? "Data Security" : "أمن البيانات"}
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {language === "english"
                      ? "We implement appropriate technical and organizational measures to protect your data against unauthorized access, loss, or alteration. However, internet transmissions are not completely secure, and we cannot guarantee absolute security."
                      : "نطبق تدابير فنية وتنظيمية مناسبة لحماية بياناتك من الوصول غير المصرح به أو الفقدان أو التغيير. ومع ذلك لا يمكن ضمان الأمان الكامل أثناء النقل عبر الإنترنت."}
                  </p>
                  
                  <div className="bg-gradient-to-r from-[#505e4d] to-[#505e4d] rounded-xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-6 h-6" />
                      <h3 className="font-bold text-lg">
                        {language === "english" ? "Changes to This Policy" : "تغييرات هذه السياسة"}
                      </h3>
                    </div>
                    <p className="text-white">
                      {language === "english"
                        ? "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date."
                        : "قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر، وسيتم نشر أي تغييرات على هذه الصفحة مع تاريخ سريان محدث."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#505e4d]" />
              </div>
              <h3 className="font-bold text-gray-900">
                {language === "english" ? "Third-Party Services" : "خدمات الطرف الثالث"}
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              {language === "english"
                ? "Third parties may collect and process data according to their own privacy policies. Please review their policies when accessing external links."
                : "قد تقوم الأطراف الثالثة بجمع ومعالجة البيانات وفقًا لسياسات الخصوصية الخاصة بهم."}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#505e4d]" />
              </div>
              <h3 className="font-bold text-gray-900">
                {language === "english" ? "Your Consent" : "موافقتك"}
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              {language === "english"
                ? "By using the Site, you consent to the collection and use of the information you disclose on the website Seenalif."
                : "باستخدام الموقع فإنك توافق على جمع واستخدام المعلومات التي تكشف عنها."}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Footer */}
      <div className="bg-gray-900 text-white mt-12">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
            <p className="text-gray-400">Get in touch with our team for any questions or concerns</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-gray-800/50">
              <Phone className="w-6 h-6 text-[#505e4d] mx-auto mb-2" />
              <h3 className="font-medium mb-1">Phone</h3>
              <a href="tel:+97143258808" className="text-gray-400 hover:text-white">+971 4 3258808</a>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-800/50">
              <Mail className="w-6 h-6 text-[#505e4d] mx-auto mb-2" />
              <h3 className="font-medium mb-1">Email</h3>
              <a href="mailto:Support@seenalif.com" className="text-gray-400 hover:text-white">Support@seenalif.com</a>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-800/50">
              <Clock className="w-6 h-6 text-[#505e4d] mx-auto mb-2" />
              <h3 className="font-medium mb-1">Hours</h3>
              <p className="text-gray-400">Daily 9:00 AM - 7:00 PM</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-800/50">
              <MapPin className="w-6 h-6 text-[#505e4d] mx-auto mb-2" />
              <h3 className="font-medium mb-1">Address</h3>
              <p className="text-gray-400 text-sm">Shop 11# Sultan Building, AL Raffa St., Burdubai, Dubai, UAE</p>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-6 border-t border-gray-800">
            <p className="text-gray-400">
              <strong className="text-white">Seenalif</strong> - Powered by Super Boss Computers Trading LLC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



