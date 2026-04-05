import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { WishlistProvider } from "./context/WishlistContext"
import { ToastProvider } from "./context/ToastContext"
import { LanguageProvider } from "./context/LanguageContext"

// Import components
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import ScrollToTop from "./components/ScrollToTop"
import RedirectHandler from "./components/RedirectHandler"

import { Helmet } from "react-helmet-async"
import { useLocation } from "react-router-dom"

// Import pages
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"

const Shop = lazy(() => import("./pages/Shop"))
const ProductDetails = lazy(() => import("./pages/ProductDetails"))
const Cart = lazy(() => import("./pages/Cart"))
const Checkout = lazy(() => import("./pages/Checkout"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const EmailVerification = lazy(() => import("./pages/EmailVerification"))
const Profile = lazy(() => import("./pages/Profile"))
const UserOrders = lazy(() => import("./pages/UserOrders"))
const Wishlist = lazy(() => import("./pages/Wishlist"))
const TrackOrder = lazy(() => import("./pages/TrackOrder"))
const About = lazy(() => import("./pages/About"))
const BlogList = lazy(() => import("./pages/BlogList"))
const BlogPost = lazy(() => import("./pages/BlogPost"))
const PrivacyAndPolicy = lazy(() => import("./pages/PrivacyAndPolicy"))
const ArabicContent = lazy(() => import("./pages/ArabicContent"))
const DisclaimerPolicy = lazy(() => import("./pages/DisclaimerPolicy"))
const TermAndCondition = lazy(() => import("./pages/TermAndCondition"))
const RefundAndReturn = lazy(() => import("./pages/RefundAndReturn"))
const CookiesAndPolicy = lazy(() => import("./pages/CookiesAndPolicy"))
const ReqBulkPurchase = lazy(() => import("./pages/ReqBulkPurchase"))
const ContactUs = lazy(() => import("./pages/ContactUs"))
const GuestOrder = lazy(() => import("./pages/GuestOrder"))
const Guest = lazy(() => import("./pages/Guest"))
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"))
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"))
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"))
const ResetPassword = lazy(() => import("./pages/ResetPassword"))
const PromotionalPage = lazy(() => import("./pages/PromotionalPage"))
const BackToSchoolProfessional = lazy(() => import("./pages/BackToSchoolProfessional"))
const VoucherTerms = lazy(() => import("./pages/VoucherTerms"))
const DeliveryTerms = lazy(() => import("./pages/DeliveryTerms"))
const OfferPage = lazy(() => import("./pages/OfferPage"))
const GamingZonePage = lazy(() => import("./pages/GamingZonePage"))

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"))
const SuperAdminLogin = lazy(() => import("./pages/superadmin/SuperAdminLogin"))
const AdminPortal = lazy(() => import("./routes/AdminPortal"))
const SuperAdminPortal = lazy(() => import("./routes/SuperAdminPortal"))

function DefaultCanonical() {
  const location = useLocation()
  if (location.pathname !== "/") {
    return null
  }
  const href = typeof window !== "undefined" ? `${window.location.origin.replace(/\/+$/, "")}/` : "/"
  return (
    <Helmet prioritizeSeoTags>
      {/* Default Site Title can be adjusted by SEO team */}
      <title>Grabatoz</title>
      <link rel="canonical" href={href} />
    </Helmet>
  )
}

function RouteCanonical() {
  const location = useLocation()
  if (location.pathname === "/") return null
  const href =
    typeof window !== "undefined"
      ? `${window.location.origin.replace(/\/+$/, "")}${location.pathname}`
      : location.pathname || "/"
  return (
    <Helmet prioritizeSeoTags>
      <link rel="canonical" href={href} />
    </Helmet>
  )
}

function App() {
  const lazyFallback = (
    <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>
  )

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <LanguageProvider>
              <DefaultCanonical />
              <ScrollToTop />
              <RedirectHandler />
              <div className="App">
                <Suspense fallback={lazyFallback}>
                <Routes>
                  {/* Root redirect to default language */}
                  <Route path="/" element={<Navigate to="/ae-en" replace />} />
                  
                  {/* Super Admin Portal - MUST be before language routes to prevent matching */}
                  {/* Redirect all language-prefixed super admin URLs to non-prefixed versions */}
                  <Route path="/ae-en/grabiansuperadmin/*" element={<Navigate to="/grabiansuperadmin/login" replace />} />
                  <Route path="/ae-ar/grabiansuperadmin/*" element={<Navigate to="/grabiansuperadmin/login" replace />} />
                  <Route path="/ae-en/superadmin/*" element={<Navigate to="/superadmin/dashboard" replace />} />
                  <Route path="/ae-ar/superadmin/*" element={<Navigate to="/superadmin/dashboard" replace />} />
                  
                  {/* Super Admin Portal Routes (separate green-themed portal) */}
                  <Route
                    path="/grabiansuperadmin/login"
                    element={
                      <Suspense fallback={lazyFallback}>
                        <SuperAdminLogin />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/superadmin/*"
                    element={
                      <Suspense fallback={lazyFallback}>
                        <SuperAdminPortal />
                      </Suspense>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/grabiansadmin/login"
                    element={
                      <Suspense fallback={lazyFallback}>
                        <AdminLogin />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/admin/*"
                    element={
                      <Suspense fallback={lazyFallback}>
                        <AdminPortal />
                      </Suspense>
                    }
                  />

                  {/* Public Routes with Language Prefix (English) */}
                  <Route
                    path="/ae-en/*"
                    element={
                      <>
                        <RouteCanonical />
                        <Layout />
                      </>
                    }
                  >
                    <Route index element={<Home />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="shop/:parentCategory" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory/:subcategory2/:subcategory3" element={<Shop />} />
                    <Route
                      path="shop/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                      element={<Shop />}
                    />
                    <Route path="product-category" element={<Shop />} />
                    <Route path="product-category/:parentCategory" element={<Shop />} />
                    <Route path="product-category/:parentCategory/:subcategory" element={<Shop />} />
                    <Route path="product-category/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                    <Route
                      path="product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3"
                      element={<Shop />}
                    />
                    <Route
                      path="product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                      element={<Shop />}
                    />
                    <Route path="product/:slug" element={<ProductDetails />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="verify-email" element={<EmailVerification />} />
                    <Route path="track-order" element={<TrackOrder />} />
                    <Route path="about" element={<About />} />
                    <Route path="blogs" element={<BlogList />} />
                    <Route path="blogs/:slug" element={<BlogPost />} />
                    <Route path="privacy-policy" element={<PrivacyAndPolicy />} />
                    <Route path="privacy-policy-arabic" element={<ArabicContent />} />
                    <Route path="disclaimer-policy" element={<DisclaimerPolicy />} />
                    <Route path="terms-conditions" element={<TermAndCondition />} />
                    <Route path="refund-return" element={<RefundAndReturn />} />
                    <Route path="cookies-policy" element={<CookiesAndPolicy />} />
                    <Route path="bulk-purchase" element={<ReqBulkPurchase />} />
                    <Route path="contact" element={<ContactUs />} />
                    <Route path="guest" element={<Guest />} />
                    <Route path="guest-order" element={<GuestOrder />} />
                    <Route path="payment/success" element={<PaymentSuccess />} />
                    <Route path="payment/cancel" element={<PaymentCancel />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="green-friday-promotional" element={<PromotionalPage />} />
                    <Route path="backtoschool-acer-professional" element={<BackToSchoolProfessional />} />
                    <Route path="voucher-terms" element={<VoucherTerms />} />
                    <Route path="delivery-terms" element={<DeliveryTerms />} />
                    <Route path="offers/:slug" element={<OfferPage />} />
                    <Route path="gaming-zone/:slug" element={<GamingZonePage />} />

                    {/* Protected Routes */}
                    <Route
                      path="checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="orders"
                      element={
                        <ProtectedRoute>
                          <UserOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Public Routes with Language Prefix (Arabic) */}
                  <Route
                    path="/ae-ar/*"
                    element={
                      <>
                        <RouteCanonical />
                        <Layout />
                      </>
                    }
                  >
                    <Route index element={<Home />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="shop/:parentCategory" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory/:subcategory2/:subcategory3" element={<Shop />} />
                    <Route
                      path="shop/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                      element={<Shop />}
                    />
                    <Route path="product-category" element={<Shop />} />
                    <Route path="product-category/:parentCategory" element={<Shop />} />
                    <Route path="product-category/:parentCategory/:subcategory" element={<Shop />} />
                    <Route path="product-category/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                    <Route
                      path="product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3"
                      element={<Shop />}
                    />
                    <Route
                      path="product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                      element={<Shop />}
                    />
                    <Route path="product/:slug" element={<ProductDetails />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="verify-email" element={<EmailVerification />} />
                    <Route path="track-order" element={<TrackOrder />} />
                    <Route path="about" element={<About />} />
                    <Route path="blogs" element={<BlogList />} />
                    <Route path="blogs/:slug" element={<BlogPost />} />
                    <Route path="privacy-policy" element={<PrivacyAndPolicy />} />
                    <Route path="privacy-policy-arabic" element={<ArabicContent />} />
                    <Route path="disclaimer-policy" element={<DisclaimerPolicy />} />
                    <Route path="terms-conditions" element={<TermAndCondition />} />
                    <Route path="refund-return" element={<RefundAndReturn />} />
                    <Route path="cookies-policy" element={<CookiesAndPolicy />} />
                    <Route path="bulk-purchase" element={<ReqBulkPurchase />} />
                    <Route path="contact" element={<ContactUs />} />
                    <Route path="guest" element={<Guest />} />
                    <Route path="guest-order" element={<GuestOrder />} />
                    <Route path="payment/success" element={<PaymentSuccess />} />
                    <Route path="payment/cancel" element={<PaymentCancel />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="green-friday-promotional" element={<PromotionalPage />} />
                    <Route path="backtoschool-acer-professional" element={<BackToSchoolProfessional />} />
                    <Route path="voucher-terms" element={<VoucherTerms />} />
                    <Route path="delivery-terms" element={<DeliveryTerms />} />
                    <Route path="offers/:slug" element={<OfferPage />} />
                    <Route path="gaming-zone/:slug" element={<GamingZonePage />} />

                    {/* Protected Routes */}
                    <Route
                      path="checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="orders"
                      element={
                        <ProtectedRoute>
                          <UserOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Fallback for old routes without language prefix - redirect to English */}
                  <Route
                    path="*"
                    element={
                      <>
                        <RouteCanonical />
                        <Layout />
                      </>
                    }
                  >
                    <Route index element={<Home />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="shop/:parentCategory" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory/:subcategory2/:subcategory3" element={<Shop />} />
                    <Route
                      path="shop/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                      element={<Shop />}
                    />
                    <Route path="product-category" element={<Shop />} />
                    <Route path="product-category/:parentCategory" element={<Shop />} />
                    <Route path="product-category/:parentCategory/:subcategory" element={<Shop />} />
                    <Route path="product-category/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                    <Route
                      path="product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3"
                      element={<Shop />}
                    />
                    <Route
                      path="product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                      element={<Shop />}
                    />
                    <Route path="product/:slug" element={<ProductDetails />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="verify-email" element={<EmailVerification />} />
                    <Route path="track-order" element={<TrackOrder />} />
                    <Route path="about" element={<About />} />
                    <Route path="blogs" element={<BlogList />} />
                    <Route path="blogs/:slug" element={<BlogPost />} />
                    <Route path="privacy-policy" element={<PrivacyAndPolicy />} />
                    <Route path="privacy-policy-arabic" element={<ArabicContent />} />
                    <Route path="disclaimer-policy" element={<DisclaimerPolicy />} />
                    <Route path="terms-conditions" element={<TermAndCondition />} />
                    <Route path="refund-return" element={<RefundAndReturn />} />
                    <Route path="cookies-policy" element={<CookiesAndPolicy />} />
                    <Route path="bulk-purchase" element={<ReqBulkPurchase />} />
                    <Route path="contact" element={<ContactUs />} />
                    <Route path="guest" element={<Guest />} />
                    <Route path="guest-order" element={<GuestOrder />} />
                    <Route path="payment/success" element={<PaymentSuccess />} />
                    <Route path="payment/cancel" element={<PaymentCancel />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="green-friday-promotional" element={<PromotionalPage />} />
                    <Route path="backtoschool-acer-professional" element={<BackToSchoolProfessional />} />
                    <Route path="voucher-terms" element={<VoucherTerms />} />
                    <Route path="delivery-terms" element={<DeliveryTerms />} />
                    <Route path="offers/:slug" element={<OfferPage />} />
                    <Route path="gaming-zone/:slug" element={<GamingZonePage />} />

                    {/* Protected Routes */}
                    <Route
                      path="checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="orders"
                      element={
                        <ProtectedRoute>
                          <UserOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Routes>
                </Suspense>
              </div>
            </LanguageProvider>
          </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
