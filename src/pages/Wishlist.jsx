import { useWishlist } from "../context/WishlistContext"
import { Link } from "react-router-dom"
import { Trash2, Heart } from "lucide-react"
import { getFullImageUrl } from "../utils/imageUtils"
import { useLanguage } from "../context/LanguageContext"
import TranslatedText from "../components/TranslatedText"

const Wishlist = () => {
  const { wishlist, removeFromWishlist, loading } = useWishlist()
  const { getLocalizedPath } = useLanguage()

  if (loading) return <div className="max-w-3xl mx-auto py-12 text-center"><TranslatedText>Loading...</TranslatedText></div>

  return (
    <div className="min-h-screen bg-[#f4f6f3]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="text-red-500" size={28} />
          <h1 className="text-3xl font-bold text-gray-900"><TranslatedText>My Wishlist</TranslatedText></h1>
          {Array.isArray(wishlist) && wishlist.length > 0 && (
            <span className="bg-[#505e4d] text-white text-sm font-medium px-3 py-1 rounded-full">
              {wishlist.length} {wishlist.length === 1 ? <TranslatedText>item</TranslatedText> : <TranslatedText>items</TranslatedText>}
            </span>
          )}
        </div>

        {Array.isArray(wishlist) && wishlist.length === 0 ? (
          <div className="text-center py-18">
            <Heart className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-medium text-gray-900 mb-2"><TranslatedText>Your wishlist is empty</TranslatedText></h3>
            <p className="text-gray-500 mb-6"><TranslatedText>Start adding items you love to your wishlist</TranslatedText></p>
            <Link
              to={getLocalizedPath("/")}
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <TranslatedText>Browse Products</TranslatedText>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {(Array.isArray(wishlist) ? wishlist : []).map(product => {
              const categoryName = product.category?.name || product.category || ""
              const subCategoryName = product.subCategory?.name || product.subCategory || ""
              const isDuplicateCategoryTag =
                categoryName &&
                subCategoryName &&
                categoryName.trim().toLowerCase() === subCategoryName.trim().toLowerCase()

              return (
                <article
                  key={product._id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-[#d7ddd4] bg-white p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8c2b3]"
                >
                  <div className="relative mb-2">
                    <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)} className="block">
                      <div className="flex h-[180px] items-center justify-center rounded-lg bg-[#f4f6f3] p-3">
                        <img
                          src={getFullImageUrl(product.image) || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#505e4d] hover:text-[#505e4d]"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <Link to={getLocalizedPath(`/product/${encodeURIComponent(product.slug || product._id)}`)} className="block">
                    {(product.brand?.name || product.brand) && (
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {product.brand?.name || product.brand}
                      </div>
                    )}

                    <h3 className="mb-2 min-h-[40px] text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-[#505e4d] line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {categoryName && (
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                          {categoryName}
                        </span>
                      )}
                      {subCategoryName && !isDuplicateCategoryTag && (
                        <span className="rounded-full border border-[#cbd6c4] bg-[#edf1eb] px-2.5 py-1 text-[10px] font-semibold text-[#505e4d]">
                          {subCategoryName}
                        </span>
                      )}
                    </div>

                    <div className="text-base font-bold text-[#1f2a1d]">
                      {product.price ? `AED ${product.price.toLocaleString()}` : "Price not available"}
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
