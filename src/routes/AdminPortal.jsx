import { Route, Routes } from "react-router-dom"

import AdminRoute from "../components/AdminRoute"
import AdminHeader from "../components/admin/AdminHeader"
import AdminSidebar from "../components/admin/AdminSidebar"

import NotFound from "../pages/NotFound"
import CreateOrder from "../pages/admin/CreateOrder"
import ActivityLogs from "../pages/admin/ActivityLogs"
import AddBannerCard from "../pages/admin/AddBannerCard"
import AddBlog from "../pages/admin/AddBlog"
import AddBlogBrand from "../pages/admin/AddBlogBrand"
import AddBlogCategory from "../pages/admin/AddBlogCategory"
import AddBlogTopic from "../pages/admin/AddBlogTopic"
import AddBrand from "../pages/admin/AddBrand"
import AddBulkProducts from "../pages/admin/AddBulkProducts"
import AddCategory from "../pages/admin/AddCategory"
import AddColor from "../pages/admin/AddColor"
import AddDeliveryCharge from "../pages/admin/AddDeliveryCharge"
import AddGamingZoneBrand from "../pages/admin/AddGamingZoneBrand"
import AddGamingZoneCategory from "../pages/admin/AddGamingZoneCategory"
import AddGamingZonePage from "../pages/admin/AddGamingZonePage"
import AddHomeSection from "../pages/admin/AddHomeSection"
import AddOfferBrand from "../pages/admin/AddOfferBrand"
import AddOfferCategory from "../pages/admin/AddOfferCategory"
import AddOfferPage from "../pages/admin/AddOfferPage"
import AddOfferProduct from "../pages/admin/AddOfferProduct"
import AddProduct from "../pages/admin/AddProduct"
import AddSize from "../pages/admin/AddSize"
import AddSubCategory from "../pages/admin/AddSubCategory"
import AddTax from "../pages/admin/AddTax"
import AddUnit from "../pages/admin/AddUnit"
import AddVolume from "../pages/admin/AddVolume"
import AddWarranty from "../pages/admin/AddWarranty"
import AdminBannerCards from "../pages/admin/AdminBannerCards"
import AdminBanners from "../pages/admin/AdminBanners"
import AdminBlogs from "../pages/admin/AdminBlogs"
import AdminBrands from "../pages/admin/AdminBrands"
import AdminBulkPurchase from "../pages/admin/AdminBulkPurchase"
import AdminCategories from "../pages/admin/AdminCategories"
import AdminCategorySlider from "../pages/admin/AdminCategorySlider"
import AdminColors from "../pages/admin/AdminColors"
import AdminDashboard from "../pages/admin/AdminDashboard"
import AdminDeliveryCharges from "../pages/admin/AdminDeliveryCharges"
import AdminEmailTemplates from "../pages/admin/AdminEmailTemplates"
import AdminManagement from "../pages/admin/AdminManagement"
import AdminNewsletter from "../pages/admin/AdminNewsletter"
import AdminOrders from "../pages/admin/AdminOrders"
import AdminProducts from "../pages/admin/AdminProducts"
import AdminRequestCallbacks from "../pages/admin/AdminRequestCallbacks"
import AdminReviews from "../pages/admin/AdminReviews"
import AdminReviewsApproved from "../pages/admin/AdminReviewsApproved"
import AdminReviewsPending from "../pages/admin/AdminReviewsPending"
import AdminReviewsRejected from "../pages/admin/AdminReviewsRejected"
import AdminSEOSettings from "../pages/admin/AdminSEOSettings"
import AdminSettings from "../pages/admin/AdminSettings"
import AdminSizes from "../pages/admin/AdminSizes"
import AdminSubCategories from "../pages/admin/AdminSubCategories"
import AdminSubCategories2 from "../pages/admin/AdminSubCategories2"
import AdminSubCategories3 from "../pages/admin/AdminSubCategories3"
import AdminSubCategories4 from "../pages/admin/AdminSubCategories4"
import AdminTax from "../pages/admin/AdminTax"
import AdminUnits from "../pages/admin/AdminUnits"
import AdminUsers from "../pages/admin/AdminUsers"
import AdminVolumes from "../pages/admin/AdminVolumes"
import AdminWarranty from "../pages/admin/AdminWarranty"
import AllCoupons from "../pages/admin/AllCoupons"
import BlogBrands from "../pages/admin/BlogBrands"
import BlogCategories from "../pages/admin/BlogCategories"
import BlogDashboard from "../pages/admin/BlogDashboard"
import BlogRating from "../pages/admin/BlogRating"
import BlogTopics from "../pages/admin/BlogTopics"
import BuyerProtectionAdmin from "../pages/admin/BuyerProtectionAdmin"
import CancelledOrders from "../pages/admin/CancelledOrders"
import ConfirmedOrders from "../pages/admin/ConfirmedOrders"
import CriticalOrders from "../pages/admin/CriticalOrders"
import DeletedOrders from "../pages/admin/DeletedOrders"
import Delivered from "../pages/admin/Delivered"
import EditBlog from "../pages/admin/EditBlog"
import EditBlogBrand from "../pages/admin/EditBlogBrand"
import EditBlogCategory from "../pages/admin/EditBlogCategory"
import EditBlogTopic from "../pages/admin/EditBlogTopic"
import EditCategory from "../pages/admin/EditCategory"
import EditSubCategory from "../pages/admin/EditSubCategory"
import GamingZonePages from "../pages/admin/GamingZonePages"
import InprogressOrders from "../pages/admin/InprogressOrders"
import ManageBlogComments from "../pages/admin/ManageBlogComments"
import NewOrders from "../pages/admin/NewOrders"
import OfferPages from "../pages/admin/OfferPages"
import OnHold from "../pages/admin/OnHold"
import OnHoldOrders from "../pages/admin/OnHoldOrders"
import OnTheWay from "../pages/admin/OnTheWay"
import OnlineOrders from "../pages/admin/OnlineOrders"
import PriceAdjustment from "../pages/admin/PriceAdjustment"
import PriceAdjustmentReports from "../pages/admin/PriceAdjustmentReports"
import ProcessingOrders from "../pages/admin/ProcessingOrders"
import ReadyForShipment from "../pages/admin/ReadyForShipment"
import ReceivedOrders from "../pages/admin/ReceivedOrders"
import Rejected from "../pages/admin/Rejected"
import ResetCache from "../pages/admin/ResetCache"
import TrashCategories from "../pages/admin/TrashCategories"
import TrashSubCategories from "../pages/admin/TrashSubCategories"

const AdminPortal = () => {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-white">
        <AdminSidebar />
        <AdminHeader />
        <div className=" ">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/bulk-add" element={<AddBulkProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/received" element={<ReceivedOrders />} />
            <Route path="orders/in-progress" element={<InprogressOrders />} />
            <Route path="orders/ready-for-shipment" element={<ReadyForShipment />} />
            <Route path="orders/on-the-way" element={<OnTheWay />} />
            <Route path="orders/delivered" element={<Delivered />} />
            <Route path="orders/on-hold" element={<OnHold />} />
            <Route path="orders/rejected" element={<Rejected />} />
            <Route path="orders/online" element={<OnlineOrders />} />

            <Route path="reviews" element={<AdminReviews />} />
            <Route path="reviews/pending" element={<AdminReviewsPending />} />
            <Route path="reviews/approved" element={<AdminReviewsApproved />} />
            <Route path="reviews/rejected" element={<AdminReviewsRejected />} />

            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="categories/add" element={<AddCategory />} />
            <Route path="categories/edit/:id" element={<EditCategory />} />
            <Route path="categories/trash" element={<TrashCategories />} />
            <Route path="categories/slider" element={<AdminCategorySlider />} />
            <Route path="subcategories" element={<AdminSubCategories />} />
            <Route path="subcategories/add" element={<AddSubCategory />} />
            <Route path="subcategories/edit/:id" element={<EditSubCategory />} />
            <Route path="subcategories/trash" element={<TrashSubCategories />} />
            <Route path="subcategories-2" element={<AdminSubCategories2 />} />
            <Route path="subcategories-2/add" element={<AddSubCategory />} />
            <Route path="subcategories-2/edit/:id" element={<EditSubCategory />} />
            <Route path="subcategories-3" element={<AdminSubCategories3 />} />
            <Route path="subcategories-3/add" element={<AddSubCategory />} />
            <Route path="subcategories-3/edit/:id" element={<EditSubCategory />} />
            <Route path="subcategories-4" element={<AdminSubCategories4 />} />
            <Route path="subcategories-4/add" element={<AddSubCategory />} />
            <Route path="subcategories-4/edit/:id" element={<EditSubCategory />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="brands/add" element={<AddBrand />} />
            <Route path="edit-brand/:id" element={<AddBrand />} />
            <Route path="colors" element={<AdminColors />} />
            <Route path="colors/add" element={<AddColor />} />
            <Route path="sizes" element={<AdminSizes />} />
            <Route path="sizes/add" element={<AddSize />} />
            <Route path="units" element={<AdminUnits />} />
            <Route path="units/add" element={<AddUnit />} />
            <Route path="volumes" element={<AdminVolumes />} />
            <Route path="volumes/add" element={<AddVolume />} />
            <Route path="warranty" element={<AdminWarranty />} />
            <Route path="warranty/add" element={<AddWarranty />} />
            <Route path="tax" element={<AdminTax />} />
            <Route path="tax/add" element={<AddTax />} />
            <Route path="coupons" element={<AllCoupons />} />
            <Route path="coupons/all" element={<AllCoupons />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="banner-cards" element={<AdminBannerCards />} />
            <Route path="banner-cards/add" element={<AddBannerCard />} />
            <Route path="banner-cards/edit/:id" element={<AddBannerCard />} />
            <Route path="home-sections" element={<AdminBannerCards />} />
            <Route path="home-sections/add" element={<AddHomeSection />} />
            <Route path="home-sections/edit/:id" element={<AddHomeSection />} />
            <Route path="offer-pages" element={<OfferPages />} />
            <Route path="offer-pages/add" element={<AddOfferPage />} />
            <Route path="offer-pages/edit/:id" element={<AddOfferPage />} />
            <Route path="offer-products/add" element={<AddOfferProduct />} />
            <Route path="offer-products/edit/:id" element={<AddOfferProduct />} />
            <Route path="offer-brands/add" element={<AddOfferBrand />} />
            <Route path="offer-brands/edit/:id" element={<AddOfferBrand />} />
            <Route path="offer-categories/add" element={<AddOfferCategory />} />
            <Route path="offer-categories/edit/:id" element={<AddOfferCategory />} />
            <Route path="gaming-zone" element={<GamingZonePages />} />
            <Route path="gaming-zone/add" element={<AddGamingZonePage />} />
            <Route path="gaming-zone/edit/:id" element={<AddGamingZonePage />} />
            <Route path="gaming-zone-brands/add" element={<AddGamingZoneBrand />} />
            <Route path="gaming-zone-brands/edit/:id" element={<AddGamingZoneBrand />} />
            <Route path="gaming-zone-categories/add" element={<AddGamingZoneCategory />} />
            <Route path="gaming-zone-categories/edit/:id" element={<AddGamingZoneCategory />} />
            <Route path="delivery-charges" element={<AdminDeliveryCharges />} />
            <Route path="delivery-charges/add" element={<AddDeliveryCharge />} />
            <Route path="settings" element={<AdminSettings />} />

            <Route path="blog-dashboard" element={<BlogDashboard />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="blogs/add" element={<AddBlog />} />
            <Route path="blogs/edit/:id" element={<EditBlog />} />
            <Route path="blog-categories" element={<BlogCategories />} />
            <Route path="blog-categories/add" element={<AddBlogCategory />} />
            <Route path="blog-categories/edit/:id" element={<EditBlogCategory />} />
            <Route path="blog-topics" element={<BlogTopics />} />
            <Route path="blog-topics/add" element={<AddBlogTopic />} />
            <Route path="blog-topics/edit/:id" element={<EditBlogTopic />} />
            <Route path="blog-brands" element={<BlogBrands />} />
            <Route path="blog-brands/add" element={<AddBlogBrand />} />
            <Route path="blog-brands/edit/:id" element={<EditBlogBrand />} />
            <Route path="blog-comments" element={<ManageBlogComments />} />
            <Route path="blog-rating" element={<BlogRating />} />

            <Route path="request-callbacks" element={<AdminRequestCallbacks />} />
            <Route path="bulk-purchase" element={<AdminBulkPurchase />} />
            <Route path="buyer-protection" element={<BuyerProtectionAdmin />} />
            <Route path="email-templates" element={<AdminEmailTemplates />} />
            <Route path="newsletter-subscribers" element={<AdminNewsletter />} />
            <Route path="reset-cache" element={<ResetCache />} />
            <Route path="*" element={<NotFound />} />

            <Route path="seo-settings/redirects" element={<AdminSEOSettings />} />

            <Route path="stock-adjustment/price-adjustment" element={<PriceAdjustment />} />
            <Route path="stock-adjustment/reports" element={<PriceAdjustmentReports />} />

            <Route path="orders/new" element={<NewOrders />} />
            <Route path="orders/confirmed" element={<ConfirmedOrders />} />
            <Route path="orders/processing" element={<ProcessingOrders />} />
            <Route path="orders/on-hold" element={<OnHoldOrders />} />
            <Route path="orders/cancelled" element={<CancelledOrders />} />
            <Route path="orders/deleted" element={<DeletedOrders />} />
            <Route path="orders/critical" element={<CriticalOrders />} />

            <Route path="orders/create" element={<CreateOrder />} />

            <Route path="admin-management" element={<AdminManagement />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
          </Routes>
        </div>
      </div>
    </AdminRoute>
  )
}

export default AdminPortal
