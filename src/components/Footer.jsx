"use client"

import { Link } from "react-router-dom"
import { Facebook, Instagram, Plus, Minus, Linkedin, ArrowUpRight } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPinterest } from "@fortawesome/free-brands-svg-icons"
import { faTiktok } from "@fortawesome/free-brands-svg-icons"
import { faYoutube } from "@fortawesome/free-brands-svg-icons"
import { useState, useEffect } from "react"
import { getCategoryTreeCached } from "../services/categoryTreeCache"
import { useLanguage } from "../context/LanguageContext"

import NewsletterModal from "./NewsletterModal";
import TranslatedText from "./TranslatedText";

const Footer = ({ className = "" }) => {
  const { getLocalizedPath } = useLanguage()
  // State for mobile accordion sections
  const [openSections, setOpenSections] = useState({
    categories: false,
    legal: false,
    support: false,
    connect: false,
  })
  const [categories, setCategories] = useState([])
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await getCategoryTreeCached()
      const validCategories = data.filter((cat) => {
        const isValid =
          cat &&
          typeof cat === "object" &&
          cat.name &&
          typeof cat.name === "string" &&
          cat.name.trim() !== "" &&
          cat.isActive !== false &&
          !cat.isDeleted &&
          !cat.name.match(/^[0-9a-fA-F]{24}$/)
        return isValid
      })
      validCategories.sort((a, b) => a.name.localeCompare(b.name))
      setCategories(validCategories)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleNewsletterInput = (e) => setNewsletterEmail(e.target.value);
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) setShowNewsletterModal(true);
  };

  return (
    <>
      {/* Desktop Footer - Hidden on mobile */}
      <footer className={`hidden md:block text-white ${className}`}>
        <div className="w-full bg-[#505e4d]">
          <div className="max-w-[1440px] mx-auto py-10 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 border-b border-white/25">
            <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr_1fr] gap-5 lg:gap-6 items-start">
              <div className="rounded-2xl p-5 lg:p-6">
                <img src="/seenalif.png" alt="Seen Alif" width="205" height="64" className="h-14 lg:h-16 w-auto object-contain" />
                <div className="flex items-center flex-wrap gap-2 mt-5 text-white">
                  <span className="text-base font-semibold mr-1">Follow Us :</span>
                  <a href="#" onClick={(e) => e.preventDefault()} aria-label="Facebook" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/45 bg-white/5 hover:bg-white/15 transition-colors"><Facebook size={16} /></a>
                  <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/45 bg-white/5 hover:bg-white/15 transition-colors"><Instagram size={16} /></a>
                  <a href="#" onClick={(e) => e.preventDefault()} aria-label="Linkedin" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/45 bg-white/5 hover:bg-white/15 transition-colors"><Linkedin size={16} /></a>
                  <a href="#" onClick={(e) => e.preventDefault()} aria-label="Twitter" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/45 bg-white/5 hover:bg-white/15 transition-colors">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" role="img">
                      <path d="M18.25 2h3.5l-7.66 8.73L24 22h-6.87l-5.02-6.58L6.3 22H2.8l8.2-9.34L0 2h7.04l4.54 6.02L18.25 2z" />
                    </svg>
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()} aria-label="TikTok" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/45 bg-white/5 hover:bg-white/15 transition-colors">
                    <FontAwesomeIcon icon={faTiktok} style={{ width: "14px", height: "14px" }} />
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()} aria-label="YouTube" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/45 bg-white/5 hover:bg-white/15 transition-colors">
                    <FontAwesomeIcon icon={faYoutube} style={{ width: "14px", height: "14px" }} />
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()} aria-label="Pinterest" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/45 bg-white/5 hover:bg-white/15 transition-colors">
                    <FontAwesomeIcon icon={faPinterest} style={{ width: "14px", height: "14px" }} />
                  </a>
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white mt-6 mb-2">Newsletter</p>
                <form className="bg-white rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.15)]" onSubmit={handleNewsletterSubmit}>
                  <div className="flex items-center">
                    <input
                      type="email"
                      placeholder="Enter email id"
                      className="w-full px-4 py-2.5 text-sm bg-transparent text-gray-900 placeholder:text-gray-500 focus:outline-none"
                      value={newsletterEmail}
                      onChange={handleNewsletterInput}
                    />
                    <button
                      aria-label="Submit email"
                      type="submit"
                      className="w-11 h-10 rounded-[10px] bg-[#505e4d] text-white inline-flex items-center justify-center hover:bg-[#445241] transition-colors"
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </form>
                {showNewsletterModal && (
                  <NewsletterModal
                    email={newsletterEmail}
                    onClose={() => setShowNewsletterModal(false)}
                  />
                )}
                <p className="text-white text-sm mt-3">
                  Stay up to date with our latest products and news
                </p>
              </div>

              <div className="rounded-2xl p-5 lg:col-start-2">
                <h3 className="text-lg font-semibold mb-4 tracking-wide"><TranslatedText>Support</TranslatedText></h3>
                <ul className="space-y-2.5 text-sm leading-6 text-white">
                  <li><Link to={getLocalizedPath("/shop")} className="hover:text-lime-100 transition-colors"><TranslatedText>Shop</TranslatedText></Link></li>
                  <li><Link to={getLocalizedPath("/about")} className="hover:text-lime-100 transition-colors"><TranslatedText>About Us</TranslatedText></Link></li>
                  <li><Link to={getLocalizedPath("/blogs")} rel="noopener noreferrer" className="hover:text-lime-100 transition-colors"><TranslatedText>Blog</TranslatedText></Link></li>
                  <li><Link to="/login" className="hover:text-lime-100 transition-colors"><TranslatedText>Login</TranslatedText></Link></li>
                  <li><Link to="/register" className="hover:text-lime-100 transition-colors"><TranslatedText>Register</TranslatedText></Link></li>
                  <li><Link to="/wishlist" className="hover:text-lime-100 transition-colors"><TranslatedText>Wishlist</TranslatedText></Link></li>
                  <li><Link to="/cart" className="hover:text-lime-100 transition-colors font-semibold"><TranslatedText>Cart</TranslatedText></Link></li>
                </ul>
              </div>

              <div className="rounded-2xl p-5 lg:col-start-3">
                <h3 className="text-lg font-semibold mb-4 tracking-wide"><TranslatedText>Legal</TranslatedText></h3>
                <ul className="space-y-2.5 text-sm leading-6 text-white">
                  <li><Link to="/refund-return" className="hover:text-lime-100 transition-colors"><TranslatedText>Refund and Return</TranslatedText></Link></li>
                  <li><Link to="/cookies-policy" className="hover:text-lime-100 transition-colors"><TranslatedText>Cookies Policy</TranslatedText></Link></li>
                  <li><Link to="/terms-conditions" className="hover:text-lime-100 transition-colors"><TranslatedText>Terms & Conditions</TranslatedText></Link></li>
                  <li><Link to="/privacy-policy" className="hover:text-lime-100 transition-colors"><TranslatedText>Privacy Policy</TranslatedText></Link></li>
                  <li><Link to="/disclaimer-policy" className="hover:text-lime-100 transition-colors"><TranslatedText>Disclaimer Policy</TranslatedText></Link></li>
                  <li><Link to="/track-order" className="hover:text-lime-100 transition-colors"><TranslatedText>Track Order</TranslatedText></Link></li>
                  <li><Link to="/voucher-terms" className="hover:text-lime-100 transition-colors"><TranslatedText>Voucher Terms</TranslatedText></Link></li>
                  <li><Link to="/delivery-terms" className="hover:text-lime-100 transition-colors"><TranslatedText>Delivery Terms</TranslatedText></Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Desktop Bottom Footer */}
      <section className="hidden md:block bg-[#505e4d] border-t border-white/20">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-3 lg:gap-6 xl:gap-8 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-5">
          <div className="flex-1 min-w-0 text-center lg:text-left">
            <p className="text-sm font-semibold text-white whitespace-nowrap">2025 Powered By Super Boss Trading LLC</p>
          </div>

          <div className="flex-1 flex justify-center min-w-0">
            <img
              src="/1.svg"
              alt="Payment Methods"
              fetchPriority="high"
              loading="eager"
              className="rounded-lg h-7 lg:h-9 xl:h-10 w-auto object-contain"
            />
          </div>

          <div className="flex-1 flex justify-center lg:justify-end items-center min-w-0">
            <div className="flex items-center">
              <p className="text-sm font-semibold whitespace-nowrap text-white">
                Developed By{" "}
                <span className="text-lime-100">
                  <a href="https://techsolutionor.com" target="_blank" rel="noopener noreferrer">Tech Solutionor</a>
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Mobile Footer - Only visible on mobile */}
      <footer className="md:hidden bg-[#505e4d] text-white">
        {/* Categories Section */}
        <div className="border-b border-white/20">
          <button
            onClick={() => toggleSection("categories")}
            className="w-full flex justify-between items-center p-4 text-left"
          >
            <span className="text-base font-semibold text-white"><TranslatedText>Categories</TranslatedText></span>
            {openSections.categories ? <Minus size={20} /> : <Plus size={20} />}
          </button>
          {openSections.categories && (
            <div className="px-4 pb-4">
              <ul className="space-y-3 text-sm">
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <Link
                      to={getLocalizedPath(`/shop/${encodeURIComponent(cat.slug || cat.name)}`)}
                      className="text-white hover:text-lime-100"
                    >
                      <TranslatedText text={cat.name} sourceDoc={cat} fieldName="name" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Legal Section */}
        <div className="border-b border-white/20">
          <button
            onClick={() => toggleSection("legal")}
            className="w-full flex justify-between items-center p-4 text-left"
          >
            <span className="text-base font-semibold text-white"><TranslatedText>Legal</TranslatedText></span>
            {openSections.legal ? <Minus size={20} /> : <Plus size={20} />}
          </button>
          {openSections.legal && (
            <div className="px-4 pb-4">
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to={getLocalizedPath("/about")} className="text-white hover:text-lime-100">
                    <TranslatedText>About Us</TranslatedText>
                  </Link>
                </li>
                <li>
                  <Link to={getLocalizedPath("/contact")} className="text-white hover:text-lime-100">
                    <TranslatedText>Contact Us</TranslatedText>
                  </Link>
                </li>
                <li>
                  <Link to={getLocalizedPath("/blogs")} rel="noopener noreferrer" className="text-white hover:text-lime-100">
                    <TranslatedText>Blog</TranslatedText>
                  </Link>
                </li>
                <li>
                  <Link to={getLocalizedPath("/shop")} className="text-white hover:text-lime-100">
                    <TranslatedText>Shop</TranslatedText>
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-white hover:text-lime-100">
                    <TranslatedText>Login</TranslatedText>
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-white hover:text-lime-100">
                    <TranslatedText>Register</TranslatedText>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Support Section */}
        <div className="border-b border-white/20">
          <button
            onClick={() => toggleSection("support")}
            className="w-full flex justify-between items-center p-4 text-left"
          >
            <span className="text-base font-semibold text-white"><TranslatedText>Support</TranslatedText></span>
            {openSections.support ? <Minus size={20} /> : <Plus size={20} />}
          </button>
          {openSections.support && (
            <div className="px-4 pb-4">
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/refund-return" className="text-white hover:text-lime-100">
                    <TranslatedText>Refund and Return</TranslatedText>
                  </Link>
                </li>
                <li>
                  <Link to="/cookies-policy" className="text-white hover:text-lime-100">
                    <TranslatedText>Cookies Policy</TranslatedText>
                  </Link>
                </li>
                <li>
                  <Link to="/terms-conditions" className="text-white hover:text-lime-100">
                    <TranslatedText>Terms & Conditions</TranslatedText>
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-white hover:text-lime-100">
                    <TranslatedText>Privacy Policy</TranslatedText>
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer-policy" className="text-white hover:text-lime-100">
                    <TranslatedText>Disclaimer Policy</TranslatedText>
                  </Link>
                </li>
                <li>
                  <Link to="/track-order" className="text-white hover:text-lime-100">
                    <TranslatedText>Track Order</TranslatedText>
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="text-white hover:text-lime-100">
                    <TranslatedText>Wishlist</TranslatedText>
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="text-white hover:text-lime-100 font-semibold">
                    <TranslatedText>Cart</TranslatedText>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Connect Section */}
        <div className="border-b border-white/20">
          <button
            onClick={() => toggleSection("connect")}
            className="w-full flex justify-between items-center p-4 text-left"
          >
            <span className="text-base font-semibold text-white"><TranslatedText>Connect</TranslatedText></span>
            {openSections.connect ? <Minus size={20} /> : <Plus size={20} />}
          </button>
          {openSections.connect && (
            <div className="px-4 pb-4">
              <div className="mb-4">
                {/* <h4 className="text-sm font-semibold text-gray-900 mb-3">Connect With Us</h4> */}
                <div className="flex space-x-4">
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/25 bg-white/10 hover:bg-white/20"
                    aria-label="Facebook"
                  >
                    <Facebook size={20} className="text-[#1877F2]" />
                  </a>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/25 bg-white/10 hover:bg-white/20"
                    aria-label="X (Twitter)"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current" role="img">
                      <path d="M18.25 2h3.5l-7.66 8.73L24 22h-6.87l-5.02-6.58L6.3 22H2.8l8.2-9.34L0 2h7.04l4.54 6.02L18.25 2z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/25 bg-white/10 hover:bg-white/20"
                    aria-label="Instagram"
                  >
                    <Instagram size={20} className="text-[#E4405F]" />
                  </a>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/25 bg-white/10 hover:bg-white/20"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={20} className="text-[#0A66C2]" />
                  </a>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/25 bg-white/10 hover:bg-white/20"
                    aria-label="Pinterest"
                  >
                    <FontAwesomeIcon icon={faPinterest} style={{ width: '20px', height: '20px', color: '#E60023' }} />
                  </a>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/25 bg-white/10 hover:bg-white/20"
                    aria-label="TikTok"
                  >
                    <FontAwesomeIcon icon={faTiktok} style={{ width: '20px', height: '20px', color: '#000' }} />
                  </a>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/25 bg-white/10 hover:bg-white/20"
                    aria-label="YouTube"
                  >
                    <FontAwesomeIcon icon={faYoutube} style={{ width: '20px', height: '20px', color: '#FF0000' }} />
                  </a>
                </div>



              </div>
            </div>
          )}
        </div>

        {/* Shop On The Go Section - Always Visible */}
        <div className="bg-[#4b5948] text-white p-6">
          <h3 className="text-lg font-bold text-center mb-4"><TranslatedText>Shop On The Go</TranslatedText></h3>
          <div className="flex justify-center space-x-4 mb-6 ">
            <img src="/google_play.png" alt="Google Play" width="120" height="32" loading="lazy" decoding="async" className="h-8 w-auto" />
            <img src="/app_store.png" alt="App Store" width="120" height="32" loading="lazy" decoding="async" className="h-8 w-auto" />
          </div>

          {/* Payment Methods */}
          <div className="flex justify-center mb-4">
            <img src="/1.svg" alt="Payment Methods" fetchPriority="high" loading="eager" width="243" height="32" className="h-8 w-auto" />
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-white">
            <p> 2025 Grabatoz powered by Crown Excel.</p>
            <p className="mt-1">Develop By <a href="https://techsolutionor.com" target="_blank" rel="noopener noreferrer">Tech Solutionor</a></p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
