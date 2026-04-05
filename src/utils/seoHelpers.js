/**
 * SEO Helpers - Extract text from HTML for meta tags
 */

/**
 * Strip HTML tags and extract plain text from SEO content
 * @param {string} htmlContent - HTML content from TipTap editor
 * @returns {string} - Plain text without HTML tags
 */
export const extractTextFromHTML = (htmlContent) => {
  if (!htmlContent) return '';
  
  // Create a temporary div to parse HTML
  if (typeof window !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;
    return temp.textContent || temp.innerText || '';
  }
  
  // Fallback: Simple regex replacement (less accurate but works server-side)
  return htmlContent
    .replace(/<[^>]*>/g, ' ')  // Remove all HTML tags
    .replace(/\s+/g, ' ')       // Replace multiple spaces with single space
    .trim();
};

/**
 * Create SEO-optimized description from HTML content
 * @param {string} htmlContent - HTML content from TipTap editor
 * @param {number} maxLength - Maximum length for description (default 160)
 * @returns {string} - Truncated plain text suitable for meta description
 */
export const createMetaDescription = (htmlContent, maxLength = 160) => {
  const text = extractTextFromHTML(htmlContent);
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Truncate at word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
};

/**
 * Extract the first heading (h1, h2, h3) from HTML content
 * @param {string} htmlContent - HTML content from TipTap editor
 * @returns {string} - First heading text or empty string
 */
export const extractFirstHeading = (htmlContent) => {
  if (!htmlContent) return '';
  
  // Match h1, h2, or h3 tags
  const headingMatch = htmlContent.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
  
  if (headingMatch && headingMatch[1]) {
    return extractTextFromHTML(headingMatch[1]);
  }
  
  return '';
};

/**
 * Generate SEO title with keyword from content
 * @param {string} categoryName - Category or subcategory name
 * @param {string} htmlContent - HTML content from TipTap editor
 * @param {string} brandName - Site/brand name
 * @returns {string} - Optimized SEO title
 */
export const generateSEOTitle = (categoryName, htmlContent, brandName = 'Grabatoz') => {
  const heading = extractFirstHeading(htmlContent);
  
  if (heading) {
    return `${heading} | ${brandName}`;
  }
  
  return `${categoryName} — Shop | ${brandName}`;
};
