import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Building2, FileText, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import config from '../config/config';
import { User, Mail, Phone } from "lucide-react";
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import '../styles/phoneInput.css'

export default function ReqBulkPurchase() {
  const { user } = useAuth ? useAuth() : { user: null };
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [callbackForm, setCallbackForm] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    phone: '',
    countryCode: '+971',
    company: '',
    note: ''
  });
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempId, setTempId] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [countries] = useState([
    { code: '+93', cc: 'AF' },
    { code: '+355', cc: 'AL' },
    { code: '+213', cc: 'DZ' },
    { code: '+1', cc: 'AS' },
    { code: '+376', cc: 'AD' },
    { code: '+244', cc: 'AO' },
    { code: '+1', cc: 'AG' },
    { code: '+54', cc: 'AR' },
    { code: '+374', cc: 'AM' },
    { code: '+61', cc: 'AU' },
    { code: '+43', cc: 'AT' },
    { code: '+994', cc: 'AZ' },
    { code: '+1', cc: 'BS' },
    { code: '+973', cc: 'BH' },
    { code: '+880', cc: 'BD' },
    { code: '+1', cc: 'BB' },
    { code: '+375', cc: 'BY' },
    { code: '+32', cc: 'BE' },
    { code: '+501', cc: 'BZ' },
    { code: '+229', cc: 'BJ' },
    { code: '+1', cc: 'BM' },
    { code: '+975', cc: 'BT' },
    { code: '+591', cc: 'BO' },
    { code: '+387', cc: 'BA' },
    { code: '+267', cc: 'BW' },
    { code: '+55', cc: 'BR' },
    { code: '+673', cc: 'BN' },
    { code: '+359', cc: 'BG' },
    { code: '+226', cc: 'BF' },
    { code: '+257', cc: 'BI' },
    { code: '+855', cc: 'KH' },
    { code: '+237', cc: 'CM' },
    { code: '+1', cc: 'CA' },
    { code: '+238', cc: 'CV' },
    { code: '+1', cc: 'KY' },
    { code: '+236', cc: 'CF' },
    { code: '+235', cc: 'TD' },
    { code: '+56', cc: 'CL' },
    { code: '+86', cc: 'CN' },
    { code: '+57', cc: 'CO' },
    { code: '+269', cc: 'KM' },
    { code: '+242', cc: 'CG' },
    { code: '+682', cc: 'CK' },
    { code: '+506', cc: 'CR' },
    { code: '+385', cc: 'HR' },
    { code: '+53', cc: 'CU' },
    { code: '+357', cc: 'CY' },
    { code: '+420', cc: 'CZ' },
    { code: '+45', cc: 'DK' },
    { code: '+253', cc: 'DJ' },
    { code: '+1', cc: 'DM' },
    { code: '+1', cc: 'DO' },
    { code: '+670', cc: 'TL' },
    { code: '+593', cc: 'EC' },
    { code: '+20', cc: 'EG' },
    { code: '+503', cc: 'SV' },
    { code: '+240', cc: 'GQ' },
    { code: '+291', cc: 'ER' },
    { code: '+372', cc: 'EE' },
    { code: '+251', cc: 'ET' },
    { code: '+679', cc: 'FJ' },
    { code: '+358', cc: 'FI' },
    { code: '+33', cc: 'FR' },
    { code: '+241', cc: 'GA' },
    { code: '+220', cc: 'GM' },
    { code: '+995', cc: 'GE' },
    { code: '+49', cc: 'DE' },
    { code: '+233', cc: 'GH' },
    { code: '+350', cc: 'GI' },
    { code: '+30', cc: 'GR' },
    { code: '+299', cc: 'GL' },
    { code: '+1', cc: 'GD' },
    { code: '+590', cc: 'GP' },
    { code: '+1', cc: 'GU' },
    { code: '+502', cc: 'GT' },
    { code: '+224', cc: 'GN' },
    { code: '+245', cc: 'GW' },
    { code: '+592', cc: 'GY' },
    { code: '+509', cc: 'HT' },
    { code: '+504', cc: 'HN' },
    { code: '+36', cc: 'HU' },
    { code: '+354', cc: 'IS' },
    { code: '+91', cc: 'IN' },
    { code: '+62', cc: 'ID' },
    { code: '+98', cc: 'IR' },
    { code: '+964', cc: 'IQ' },
    { code: '+353', cc: 'IE' },
    { code: '+972', cc: 'IL' },
    { code: '+39', cc: 'IT' },
    { code: '+225', cc: 'CI' },
    { code: '+1', cc: 'JM' },
    { code: '+81', cc: 'JP' },
    { code: '+962', cc: 'JO' },
    { code: '+7', cc: 'KZ' },
    { code: '+254', cc: 'KE' },
    { code: '+686', cc: 'KI' },
    { code: '+850', cc: 'KP' },
    { code: '+82', cc: 'KR' },
    { code: '+965', cc: 'KW' },
    { code: '+996', cc: 'KG' },
    { code: '+856', cc: 'LA' },
    { code: '+371', cc: 'LV' },
    { code: '+961', cc: 'LB' },
    { code: '+266', cc: 'LS' },
    { code: '+231', cc: 'LR' },
    { code: '+218', cc: 'LY' },
    { code: '+423', cc: 'LI' },
    { code: '+370', cc: 'LT' },
    { code: '+352', cc: 'LU' },
    { code: '+261', cc: 'MG' },
    { code: '+265', cc: 'MW' },
    { code: '+60', cc: 'MY' },
    { code: '+960', cc: 'MV' },
    { code: '+223', cc: 'ML' },
    { code: '+356', cc: 'MT' },
    { code: '+692', cc: 'MH' },
    { code: '+596', cc: 'MQ' },
    { code: '+222', cc: 'MR' },
    { code: '+230', cc: 'MU' },
    { code: '+52', cc: 'MX' },
    { code: '+691', cc: 'FM' },
    { code: '+373', cc: 'MD' },
    { code: '+377', cc: 'MC' },
    { code: '+976', cc: 'MN' },
    { code: '+382', cc: 'ME' },
    { code: '+212', cc: 'MA' },
    { code: '+258', cc: 'MZ' },
    { code: '+95', cc: 'MM' },
    { code: '+264', cc: 'NA' },
    { code: '+674', cc: 'NR' },
    { code: '+977', cc: 'NP' },
    { code: '+31', cc: 'NL' },
    { code: '+599', cc: 'AN' },
    { code: '+687', cc: 'NC' },
    { code: '+64', cc: 'NZ' },
    { code: '+505', cc: 'NI' },
    { code: '+227', cc: 'NE' },
    { code: '+234', cc: 'NG' },
    { code: '+683', cc: 'NU' },
    { code: '+47', cc: 'NO' },
    { code: '+968', cc: 'OM' },
    { code: '+92', cc: 'PK' },
    { code: '+680', cc: 'PW' },
    { code: '+507', cc: 'PA' },
    { code: '+675', cc: 'PG' },
    { code: '+595', cc: 'PY' },
    { code: '+51', cc: 'PE' },
    { code: '+63', cc: 'PH' },
    { code: '+48', cc: 'PL' },
    { code: '+351', cc: 'PT' },
    { code: '+1', cc: 'PR' },
    { code: '+974', cc: 'QA' },
    { code: '+40', cc: 'RO' },
    { code: '+7', cc: 'RU' },
    { code: '+250', cc: 'RW' },
    { code: '+685', cc: 'WS' },
    { code: '+378', cc: 'SM' },
    { code: '+239', cc: 'ST' },
    { code: '+966', cc: 'SA' },
    { code: '+221', cc: 'SN' },
    { code: '+381', cc: 'RS' },
    { code: '+248', cc: 'SC' },
    { code: '+232', cc: 'SL' },
    { code: '+65', cc: 'SG' },
    { code: '+421', cc: 'SK' },
    { code: '+386', cc: 'SI' },
    { code: '+677', cc: 'SB' },
    { code: '+252', cc: 'SO' },
    { code: '+27', cc: 'ZA' },
    { code: '+34', cc: 'ES' },
    { code: '+94', cc: 'LK' },
    { code: '+249', cc: 'SD' },
    { code: '+597', cc: 'SR' },
    { code: '+268', cc: 'SZ' },
    { code: '+46', cc: 'SE' },
    { code: '+41', cc: 'CH' },
    { code: '+963', cc: 'SY' },
    { code: '+886', cc: 'TW' },
    { code: '+992', cc: 'TJ' },
    { code: '+255', cc: 'TZ' },
    { code: '+66', cc: 'TH' },
    { code: '+228', cc: 'TG' },
    { code: '+690', cc: 'TK' },
    { code: '+676', cc: 'TO' },
    { code: '+1', cc: 'TT' },
    { code: '+216', cc: 'TN' },
    { code: '+90', cc: 'TR' },
    { code: '+993', cc: 'TM' },
    { code: '+688', cc: 'TV' },
    { code: '+256', cc: 'UG' },
    { code: '+380', cc: 'UA' },
    { code: '+971', cc: 'AE' },
    { code: '+44', cc: 'UK' },
    { code: '+1', cc: 'US' },
    { code: '+598', cc: 'UY' },
    { code: '+998', cc: 'UZ' },
    { code: '+678', cc: 'VU' },
    { code: '+379', cc: 'VA' },
    { code: '+58', cc: 'VE' },
    { code: '+84', cc: 'VN' },
    { code: '+1', cc: 'VG' },
    { code: '+1', cc: 'VI' },
    { code: '+967', cc: 'YE' },
    { code: '+260', cc: 'ZM' },
    { code: '+263', cc: 'ZW' }
  ]);

  const handleCallbackChange = (e) => {
    const { name, value } = e.target;
    setCallbackForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async () => {
    if (!callbackForm.email) {
      alert('Please enter your email address');
      return;
    }
    
    setOtpLoading(true);
    try {
      const response = await axios.post(`${config.API_URL}/api/bulk-purchase/send-otp`, {
        email: callbackForm.email
      });
      setTempId(response.data.tempId);
      setOtpSent(true);
      alert('OTP sent to your email!');
    } catch (error) {
      alert('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    setCallbackLoading(true);
    try {
      const payload = {
        ...callbackForm,
        phone: phoneValue,
        userId: user?._id || null,
      };

      // Remove countryCode from payload as it's no longer used
      delete payload.countryCode;

      // If user is not logged in, include OTP verification
      if (!user) {
        if (!otpSent) {
          alert('Please verify your email first');
          setCallbackLoading(false);
          return;
        }
        payload.otp = otp;
        payload.tempId = tempId;
      }

      await axios.post(`${config.API_URL}/api/bulk-purchase`, payload);
      setCallbackSuccess(true);
      setTimeout(() => {
        setShowCallbackModal(false);
        setCallbackSuccess(false);
        setCallbackForm({ 
          name: user?.name || '', 
          email: user?.email || '', 
          phone: '',
          countryCode: '+971',
          company: '',
          note: ''
        });
        setOtpSent(false);
        setOtp('');
        setTempId('');
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setCallbackLoading(false);
    }
  };

  return (
    <div className="font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 text-center">
        <p className="text-sm text-green-700 font-semibold">Your One-Stop Solution for B2B Business Needs in UAE</p>
      </header>

      {/* Hero Section */}
      <section className="bg-green-100 py-6 px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800">Grabatoz - B2B Dedicated Wholesale Place</h1>
        <p className="mt-2 text-sm md:text-base max-w-3xl mx-auto text-gray-700">
          Our trusted B2B wholesale palace will cater to all your business needs
        </p>
      </section>

      {/* Intro Section */}
      <section className="py-8 px-4 md:px-16 text-center">
        <p className="max-w-3xl mx-auto text-gray-700">
          Welcome to Grabatoz.com your one-stop sourcing platform for all your business needs.
          Grabatoz.com, the omnichannel retailer that was established in Dubai, UAE. We are a business
          focused marketplace where small and medium businesses (SMBs) discover, interact, and buy
          products and services by engaging with brands and authorized sellers.
        </p>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-100 py-10 px-4 md:px-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <img
            src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
            alt="Business Meeting"
            className="w-full md:w-1/2 rounded-md"
          />
          <div className="md:w-1/2">
            <h2 className="text-xl font-bold mb-2">Benefits of being on Grabatoz.com</h2>
            <p className="text-gray-700 mb-4">
              As a customer and as a business buyer, the platform offers great benefits and opportunities
              for small and medium businesses.
            </p>
            <button className="bg-lime-500 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => setShowCallbackModal(true)}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Buying Journey */}
      <section className="py-10 px-4 md:px-16 text-center">
        <h2 className="text-xl font-bold mb-6">Online BUYING journey</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            'Bulk Requirement',
            'Request For Quote',
            'Best Price Quoted',
            'Proposals Evaluated',
            'Invoice',
            'Delivery & Payment',
          ].map((step, i) => (
            <div key={i} className="bg-white border-lime-500 border-2 shadow-md p-4 rounded-md text-sm font-medium">
              <p className="mb-2 font-bold">Step {i + 1}</p>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Bulk Purchase */}
      <section className="bg-gray-50 py-12 px-4 md:px-16">
        <h2 className="text-xl font-bold text-center mb-10">
          Why Bulk Purchase from Grabatoz.com?
        </h2>
        <div className="grid gap-6  md:grid-cols-3">
          {[
            {
              title: 'Trusted Platform',
              desc: 'Dedicated to serving SMBs in the UAE. Trust and reliability are our priority.',
            },
            {
              title: 'Authorized Sellers',
              desc: 'Over 100 authorized sellers ready to serve with better prices and availability.',
            },
            {
              title: 'Learn About Trends',
              desc: 'Join webinars by global brands to stay ahead and grow your business.',
            },
            {
              title: 'Better Range and Information',
              desc: 'Access a wide range of products with accurate info from over 200 global brands.',
            },
            {
              title: 'Quantity Discounts & RFQ',
              desc: 'Get better prices for larger quantities or request quotes from multiple sellers.',
            },
            {
              title: 'Create Users & Manage Purchases',
              desc: 'Add team members and set buyer/approver roles for a seamless experience.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 border-lime-500 border-2 shadow-md rounded-md">
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-700 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="bg-lime-500 text-white px-6 py-3 rounded hover:bg-green-700" onClick={() => setShowCallbackModal(true)}>
            Contact Sales
          </button>
        </div>
      </section>

      {showCallbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setShowCallbackModal(false)}>
              <X size={24} />
            </button>
            <div className="flex flex-col gap-6">
              <div className="flex-1 w-full">
                <h2 className="text-2xl font-bold mb-2">Contact Sales</h2>
                <p className="text-gray-600 text-sm mb-6">Submit your bulk purchase inquiry and we'll get back to you soon.</p>

                {callbackSuccess ? (
                  <div className="text-green-600 font-medium text-center py-8">
                    ✓ Request submitted successfully! We'll contact you soon.
                  </div>
                ) : (
                  <form onSubmit={handleCallbackSubmit} className="space-y-4">

                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <div className="flex items-center gap-3">
                        <div className="text-lime-600">
                          <User size={20} />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={callbackForm.name}
                          onChange={handleCallbackChange}
                          className="flex-1 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                          required
                          disabled={!!user}
                        />
                      </div>
                    </div>

                    {/* Email Field with OTP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <div className="flex items-center gap-3">
                        <div className="text-lime-600">
                          <Mail size={20} />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={callbackForm.email}
                          onChange={handleCallbackChange}
                          className="flex-1 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                          required
                          disabled={!!user || otpSent}
                        />
                        {!user && !otpSent && (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={otpLoading || !callbackForm.email}
                            className="px-4 py-2 bg-lime-500 text-white rounded-md hover:bg-lime-600 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                          >
                            {otpLoading ? 'Sending...' : 'Send OTP'}
                          </button>
                        )}
                      </div>
                      {!user && (
                        <p className="text-xs text-gray-500 mt-1 ml-8">
                          {otpSent ? '✓ OTP sent to your email' : 'Click "Send OTP" to verify your email'}
                        </p>
                      )}
                      {user && (
                        <p className="text-xs text-green-600 mt-1 ml-8">
                          ✓ Verified (logged in user)
                        </p>
                      )}
                    </div>

                    {/* OTP Field - Only for non-logged-in users */}
                    {!user && otpSent && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP *</label>
                        <div className="flex items-center gap-3">
                          <div className="text-lime-600">
                            <Mail size={20} />
                          </div>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="flex-1 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-8">
                          Enter the 6-digit code sent to your email
                        </p>
                      </div>
                    )}

                    {/* Phone Number with Country Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="flex items-center gap-3">
                        <div className="text-lime-600">
                          <Phone size={24} />
                        </div>
                        <PhoneInput
                          international
                          defaultCountry="AE"
                          value={phoneValue}
                          onChange={setPhoneValue}
                          className="flex-1"
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                    </div>

                    {/* Company Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                      <div className="flex items-center gap-3">
                        <div className="text-lime-600">
                          <Building2 size={20} />
                        </div>
                        <input
                          type="text"
                          name="company"
                          value={callbackForm.company}
                          onChange={handleCallbackChange}
                          className="flex-1 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* Note Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <div className="flex items-start gap-3">
                        <div className="text-lime-600 mt-2">
                          <FileText size={20} />
                        </div>
                        <textarea
                          name="note"
                          value={callbackForm.note}
                          onChange={handleCallbackChange}
                          rows={3}
                          placeholder="Tell us about your bulk purchase requirements, quantity needed, or any special requests..."
                          className="flex-1 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-8">
                        Share any additional details about your bulk purchase needs
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-lime-500 text-white py-3 rounded-md font-medium hover:bg-lime-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      disabled={callbackLoading || (!user && !otpSent)}
                    >
                      {callbackLoading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
