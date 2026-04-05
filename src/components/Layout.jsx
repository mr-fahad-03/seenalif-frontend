import { Outlet, useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import BlogFooter from "./BlogFooter"
import BlogNavbar from "./BlogNavbar"

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/971505033860"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-20 right-4 z-50"
      aria-label="Chat on WhatsApp"
      style={{ transition: 'transform 0.2s' }}
    >
      <img
        src="/whatsapp.webp"
        alt="WhatsApp"
        width="56"
        height="56"
        className="w-14 h-14 rounded-full border-2 hover:scale-110"
        style={{ background: '#25D366' }}
      />
    </a>
  )
}

function Layout() {
  const location = useLocation()
  // Check if current path is a blog page (with or without language prefix)
  // Matches: /blogs, /blogs/slug, /ae-en/blogs, /ae-en/blogs/slug, /ar/blogs, etc.
  const isBlogPage = location.pathname.match(/^\/([a-z]{2}(-[a-z]{2})?\/)?blogs(\/|$)/i)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar - Conditional based on page */}
      {isBlogPage ? <BlogNavbar /> : <Navbar />}

      {/* Main Content Area - Grows to fill space */}
      <main className="flex-1 w-full">
        <div className="w-full max-w-[1700px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Footer - Conditional based on page */}
      {isBlogPage ? <BlogFooter /> : <Footer />}

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  )
}

export default Layout
