import { useEffect } from 'react';

const ProductSchema = ({ product }) => {
  useEffect(() => {
    if (!product) return;

    // Remove any existing dynamic schema
    const existingSchema = document.querySelector('script[data-dynamic-schema="true"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Create clean schema with proper structure
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name || product.title,
      "image": [product.image || product.thumbnail],
      "description": product.description ? product.description.replace(/<[^>]*>/g, '') : '', // Remove HTML tags
      "url": window.location.href,
      "sku": product.sku || product._id,
      "category": typeof product.category === 'string' ? product.category : product.category?.name,
      "brand": {
        "@type": "Brand",
        "name": typeof product.brand === 'string' ? product.brand : product.brand?.name || "Dell"
      },
      "manufacturer": {
        "@type": "Organization", 
        "name": typeof product.brand === 'string' ? product.brand : product.brand?.name || "Dell"
      },
      "offers": {
        "@type": "Offer",
        "price": product.price?.toString() || "0",
        "priceCurrency": "AED",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": window.location.href,
        "seller": {
          "@type": "Organization",
          "name": "Grab AtoZ"
        }
      }
    };

    // Add rating if exists
    if (product.rating && product.rating > 0) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.rating.toString(),
        "bestRating": "5",
        "worstRating": "1", 
        "ratingCount": (product.reviewCount || 1).toString()
      };
    }

    // Inject schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic-schema', 'true');
    script.innerHTML = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);

    // Cleanup
    return () => {
      const schemaToRemove = document.querySelector('script[data-dynamic-schema="true"]');
      if (schemaToRemove) {
        schemaToRemove.remove();
      }
    };
  }, [product]);

  return null;
};

export default ProductSchema;