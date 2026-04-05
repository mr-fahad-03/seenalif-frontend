export const generateProductSchema = (product) => {
  const baseUrl = window.location.origin;
  
  // Clean and validate data
  const cleanPrice = parseFloat(product.price || product.discountPrice || 0);
  const cleanStock = parseInt(product.stock || 0);
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name || product.title || "Product",
    "description": product.description || product.shortDescription || `${product.name || 'Product'} available at GrabAtoZ`,
    "sku": product.sku || product._id,
    "mpn": product.mpn || product.model || product.sku || product._id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "GrabAtoZ"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/product/${product.slug || product._id}`,
      "priceCurrency": "AED",
      "price": cleanPrice.toFixed(2),
      "priceValidUntil": "2025-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": cleanStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Grabatoz powered by Crown Excel General Trading LLC",
        "url": baseUrl
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "20.00",
          "currency": "AED"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "AE"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "DAY"
          }
        }
      }
    }
  };

  // Add images if available
  if (product.images && product.images.length > 0) {
    schema.image = product.images.map(img => 
      img.startsWith('http') ? img : `${baseUrl}${img}`
    );
  }

  // Add category if available
  if (product.category) {
    schema.category = product.category;
  }

  // Add ratings only if they exist and are valid
  if (product.ratings && product.numOfReviews > 0 && product.ratings > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": parseFloat(product.ratings).toFixed(1),
      "reviewCount": parseInt(product.numOfReviews),
      "bestRating": 5,
      "worstRating": 1
    };
  }

  // Add individual reviews if available
  if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
    schema.review = product.reviews.map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": parseInt(review.rating),
        "bestRating": 5,
        "worstRating": 1
      },
      "author": {
        "@type": "Person",
        "name": review.name || "Anonymous"
      },
      "reviewBody": review.comment || ""
    }));
  }

  return schema;
};

export const generateProductListSchema = (products) => {
  if (!products || products.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": products.length,
    "itemListElement": products.slice(0, 20).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": generateProductSchema(product)
    }))
  };
};