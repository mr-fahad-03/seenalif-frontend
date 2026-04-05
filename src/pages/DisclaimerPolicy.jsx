// "use client";

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Shield, AlertTriangle, FileText, Lock, Globe, Phone, Mail, MapPin, Clock } from "lucide-react";
// import { useLanguage } from "../context/LanguageContext";
// import TranslatedText from "../components/TranslatedText";

// export default function DisclaimerPolicy() {
//   const navigate = useNavigate();
//   const { getLocalizedPath } = useLanguage();

//   // Future functionality for Arabic version
//   // const handleArabicClick = () => {
//   //   navigate('/disclaimer-policy-arabic');
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
//             <TranslatedText>Disclaimer Policy</TranslatedText>
//           </h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Understanding our terms, limitations, and your rights when using Grabatoz.ae
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
//         {/* <div className="bg-white rounded-lg p-1">
//           <div className="flex flex-col md:flex-row md:items-start gap-4">
//             <div className="flex justify-center md:justify-start">
//               <FileText className="w-8 h-8 text-[#505e4d] mt-1 flex-shrink-0" />
//             </div>
//             <div className="text-center md:text-left">
//               <h2 className="text-xl font-semibold text-gray-900 mb-3">Important Notice</h2>
//               <p className="text-gray-700 leading-relaxed">
//                 This disclaimer policy outlines the terms and limitations of liability for Grabatoz.ae, 
//                 operated by Crown Excel General Trading LLC. By using our website and services, you 
//                 acknowledge and agree to these terms.
//               </p>
//             </div>
//           </div>
//         </div> */}

//         {/* Limitation of Liability */}
//         <section className="bg-white rounded-lg  mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <AlertTriangle className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Limitation of Liability and Disclaimers</TranslatedText></h2>
//           </div>

//           <div className="space-y-4 text-gray-700">

//             <p>
//               <strong>Grabatoz.ae,</strong>    operated by Crown Excel General Trading LLC, provides the website and its services on an â€œas isâ€ and â€œas availableâ€ basis without any warranties, either express or implied. By accessing or using this website, you agree to bear the risks associated with its use.
//               Although we strive to ensure the accuracy, reliability, and quality of the content and third-party materials available on the website, we do not guarantee that all information will be free from errors or inaccuracies. We disclaim all liability for any loss or damage that may result from the use or reliance on such information.

//             </p>
//             <div className="bg-white border-l-4 border-[#505e4d] p-4 rounded">
//               <p className="font-medium text-gray-800">
//                 This disclaimer does not affect any warranties provided directly by product manufacturers, as stated in the respective product documentation.
//               </p>
//             </div>
//             <p>
//               To the maximum extent permitted under applicable law, Grabatoz.ae and Crown Excel General Trading LLC will not be liable for any indirect, incidental, consequential, or special damages â€” including but not limited to loss of profits, data, goodwill, or other intangible losses â€” resulting from your use of the website, services, or any agreement related thereto.
//             </p>
//           </div>
//         </section>

//         {/* User Agreement */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <FileText className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>User Agreement and Limitation of Liability</TranslatedText></h2>
//           </div>

//           <div className="space-y-4 text-gray-700">
//             <p>
//               Our liability to you, whether in contract, tort, or otherwise, shall be limited to the total value of the transaction or order in question. We do not warrant that the operation of the website will be uninterrupted or error-free, nor do we guarantee that defects will be corrected or that the site or servers are free of viruses or other harmful components.
//               Grabatoz.ae shall not be held responsible for any delays, interruptions, or data transmission errors resulting from your use of the site.

//             </p>
//             <p>
//               Grabatoz.ae shall not be held responsible for any delays,
//               interruptions, or data transmission errors resulting from your use
//               of the site.
//             </p>
//           </div>
//         </section>

//         {/* Site Security */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <Lock className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Site Security and Acceptable Use</TranslatedText></h2>
//           </div>

//           <div className="space-y-4 text-gray-700">
//             <p><strong>Users are strictly prohibited from:</strong></p>
//             <ul className="list-disc list-inside space-y-2 ml-4">
//               <li>Accessing unauthorized data or systems</li>
//               <li>Attempting to breach security or authentication measures</li>
//               <li>Introducing malware, viruses, or malicious code</li>
//               <li>Engaging in denial-of-service attacks, overloading, spamming, or crashing the site</li>
//               <li>Sending unsolicited communications or advertisements</li>
//               <li>Misrepresenting headers or falsifying IP packet information</li>
//             </ul>
//             <p>
//               Violations of site security may lead to legal action. Grabatoz.ae reserves the right to cooperate with law enforcement authorities in investigating and prosecuting any users involved in such activities.
//               You must not attempt to interfere with the websiteâ€™s normal operation or use any automated system (e.g., bots, crawlers, or scrapers) to access or interact with our services without prior written consent.

//             </p>
//             <p>
//               You must not attempt to interfere with the website's normal
//               operation or use any automated system (e.g., bots, crawlers, or
//               scrapers) to access or interact with our services without prior
//               written consent.
//             </p>
//           </div>
//         </section>

//         {/* Content Accuracy */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <Globe className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Content Accuracy and Updates</TranslatedText></h2>
//           </div>

//           <div className="space-y-4 text-gray-700">
//             <p>
//               While we endeavor to keep all information current and accurate, we cannot guarantee that all product descriptions, prices, images, or specifications are always error-free. Product colors, sizes, and packaging may vary slightly from what is displayed online.
//               Grabatoz.ae reserves the right to update, modify, or remove any content on the website at any time without notice.
//               We also provide links to third-party websites for your convenience. These are not under our control, and we do not assume any responsibility for their content, accuracy, or policies. Inclusion of such links does not imply endorsement.

//             </p>
//             <p>
//               Grabatoz.ae reserves the right to update, modify, or remove any
//               content on the website at any time without notice.
//             </p>
//             <p>
//               We also provide links to third-party websites for your convenience.
//               These are not under our control, and we do not assume any
//               responsibility for their content, accuracy, or policies. Inclusion
//               of such links does not imply endorsement.
//             </p>
//           </div>
//         </section>

//         {/* No Warranty */}
//         <section className="bg-white rounded-lg mt-5 p-1">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
//             <div className="flex justify-center md:justify-start">
//               <Shield className="w-8 h-8 text-[#505e4d]" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>No Warranty for Travel, Shipping, or Advisory Content</TranslatedText></h2>
//           </div>

//           <div className="text-gray-700">
//             <p>
//               Any travel or logistical information, including third-party shipping advice, is provided for convenience only and is subject to change. Users are responsible for verifying such information with relevant service providers or authorities.
//             </p>
//           </div>
//         </section>

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








import React, { useState } from "react";
import { 
  AlertTriangle, Shield, FileText, Lock, Globe, ExternalLink,
  Phone, Mail, MapPin, Clock, ChevronDown, ChevronUp, Info, Scale
} from "lucide-react";

export default function DisclaimerPolicy() {
  const [expandedSections, setExpandedSections] = useState({
    liability: true,
    userAgreement: false,
    security: false,
    content: false,
    warranty: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    {
      id: "liability",
      icon: AlertTriangle,
      title: "Limitation of Liability and Disclaimers",
      color: "bg-[#505e4d]",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            <strong>Seenalif.com,</strong> operated by Super Boss Computers Trading LLC, provides the website and its services on an "as is" and "as available" basis without any warranties, either express or implied. By accessing or using this website, you agree to bear the risks associated with its use.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Although we strive to ensure the accuracy, reliability, and quality of the content and third-party materials available on the website, we do not guarantee that all information will be free from errors or inaccuracies. We disclaim all liability for any loss or damage that may result from the use or reliance on such information.
          </p>
          <div className="bg-white border-l-4 border-[#505e4d] p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
              <p className="text-gray-800 font-medium">
                This disclaimer does not affect any warranties provided directly by product manufacturers, as stated in the respective product documentation.
              </p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">
            To the maximum extent permitted under applicable law, Seenalif.com and Super Boss Computers Trading LLC will not be liable for any indirect, incidental, consequential, or special damages  including but not limited to loss of profits, data, goodwill, or other intangible losses  resulting from your use of the website, services, or any agreement related thereto.
          </p>
        </div>
      )
    },
    {
      id: "userAgreement",
      icon: FileText,
      title: "User Agreement and Limitation of Liability",
      color: "bg-[#505e4d]",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Our liability to you, whether in contract, tort, or otherwise, shall be limited to the total value of the transaction or order in question. We do not warrant that the operation of the website will be uninterrupted or error-free, nor do we guarantee that defects will be corrected or that the site or servers are free of viruses or other harmful components.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Seenalif.com shall not be held responsible for any delays, interruptions, or data transmission errors resulting from your use of the site.
          </p>
        </div>
      )
    },
    {
      id: "security",
      icon: Lock,
      title: "Site Security and Acceptable Use",
      color: "bg-[#505e4d]",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 font-semibold">Users are strictly prohibited from:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Accessing unauthorized data or systems",
              "Attempting to breach security or authentication measures",
              "Introducing malware, viruses, or malicious code",
              "Engaging in denial-of-service attacks or spamming",
              "Sending unsolicited communications",
              "Misrepresenting headers or falsifying IP information"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-[#505e4d] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-700 leading-relaxed">
            Violations of site security may lead to legal action. Seenalif.com reserves the right to cooperate with law enforcement authorities in investigating and prosecuting any users involved in such activities.
          </p>
          <p className="text-gray-700 leading-relaxed">
            You must not attempt to interfere with the website''s normal operation or use any automated system (e.g., bots, crawlers, or scrapers) to access or interact with our services without prior written consent.
          </p>
        </div>
      )
    },
    {
      id: "content",
      icon: Globe,
      title: "Content Accuracy and Updates",
      color: "bg-[#505e4d]",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            While we endeavor to keep all information current and accurate, we cannot guarantee that all product descriptions, prices, images, or specifications are always error-free. Product colors, sizes, and packaging may vary slightly from what is displayed online.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Seenalif.com reserves the right to update, modify, or remove any content on the website at any time without notice.
          </p>
          <div className="bg-white border border-[#505e4d] p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-[#505e4d] mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">
                We also provide links to third-party websites for your convenience. These are not under our control, and we do not assume any responsibility for their content, accuracy, or policies. Inclusion of such links does not imply endorsement.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "warranty",
      icon: Shield,
      title: "No Warranty for Travel, Shipping, or Advisory Content",
      color: "bg-[#505e4d]",
      content: (
        <div className="text-gray-700 leading-relaxed">
          <p>
            Any travel or logistical information, including third-party shipping advice, is provided for convenience only and is subject to change. Users are responsible for verifying such information with relevant service providers or authorities.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#f3f5f2]">
      {/* Header */}
      <div className="bg-white border-b border-[#505e4d]/20">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#505e4d] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Scale className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Disclaimer Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Understanding our terms, limitations, and your rights when using Seenalif.com
            </p>
            <div className="mt-6 flex items-center gap-2 bg-[#f3f5f2] px-4 py-2 rounded-full border border-[#505e4d]/20">
              <Clock className="w-4 h-4 text-[#505e4d]" />
              <span className="text-[#505e4d] text-sm">Last updated: December 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.id];
            
            return (
              <div 
                key={section.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="pl-16">
                      {section.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Footer */}
      <div className="bg-white border-t border-[#505e4d]/20 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Need Clarification?</h2>
            <p className="text-gray-600">Our team is here to help explain any part of this policy</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-[#f3f5f2] rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-5 h-5 text-[#505e4d]" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <a href="tel:+97143258808" className="text-gray-700 hover:text-[#505e4d] transition-colors">+971 4 3258808</a>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-[#f3f5f2] rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-5 h-5 text-[#505e4d]" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <a href="mailto:Support@seenalif.com" className="text-gray-700 hover:text-[#505e4d] transition-colors">Support@seenalif.com</a>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-[#f3f5f2] rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-[#505e4d]" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Hours</p>
              <p className="text-gray-700">9:00 AM - 7:00 PM</p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-[#f3f5f2] rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-5 h-5 text-[#505e4d]" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="text-gray-700 text-sm">Burdubai, Dubai, UAE</p>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              <strong className="text-[#505e4d]">Seenalif.com</strong>  Powered by Super Boss Computers Trading LLC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



