// Lightweight Excel export using SheetJS (xlsx)
import * as XLSX from 'xlsx';

// Map product object to a flat row for Excel matching bulk upload template format
function mapProductToRow(p) {
  const brandName = p.brand?.name || p.brand?.toString?.() || '';
  const parentCategoryName = p.parentCategory?.name || p.parentCategory?.toString?.() || '';
  
  // Handle 4-level category structure
  const categoryLevel1 = p.category?.name || p.category?.toString?.() || '';
  const categoryLevel2 = p.subCategory2?.name || p.subCategory2?.toString?.() || '';
  const categoryLevel3 = p.subCategory3?.name || p.subCategory3?.toString?.() || '';
  const categoryLevel4 = p.subCategory4?.name || p.subCategory4?.toString?.() || '';
  
  const taxValue = (() => {
    if (p.tax === undefined || p.tax === null) return '';
    if (typeof p.tax === 'number') return p.tax;
    if (typeof p.tax === 'string') return p.tax;
    if (typeof p.tax === 'object') {
      return p.tax.rate ?? p.tax.percentage ?? p.tax.value ?? p.tax.name ?? '';
    }
    return '';
  })();

  return {
    _id: p._id || '', // MongoDB ObjectId for tracking updates
    name: p.name || '',
    slug: p.slug || '',
    sku: p.sku || '',
    barcode: p.barcode || '',
    parent_category: parentCategoryName,
    category_level_1: categoryLevel1,
    category_level_2: categoryLevel2,
    category_level_3: categoryLevel3,
    category_level_4: categoryLevel4,
    brand: brandName,
    buyingPrice: p.buyingPrice ?? '',
    price: p.price ?? '',
    offerPrice: p.offerPrice ?? '',
    discount: p.discount ?? '',
    tax: taxValue,
    stockStatus: p.stockStatus || '',
    countInStock: p.countInStock ?? '',
    showStockOut: p.showStockOut ? 'true' : 'false',
    canPurchase: p.canPurchase !== false ? 'true' : 'false',
    refundable: p.refundable !== false ? 'true' : 'false',
    maxPurchaseQty: p.maxPurchaseQty ?? '',
    lowStockWarning: p.lowStockWarning ?? '',
    unit: p.unit || '',
    weight: p.weight ?? '',
    tags: Array.isArray(p.tags) ? p.tags.join(',') : (p.tags || ''),
    description: p.description || '',
    shortDescription: p.shortDescription || '',
    specifications: p.specifications || '',
    details: p.details || '',
  };
}

export function exportProductsToExcel(products, filename = 'products.xlsx') {
  if (!Array.isArray(products) || products.length === 0) return;
  const rows = products.map(mapProductToRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  XLSX.writeFile(workbook, filename);
}

export function downloadSelectedProducts(products, selectedIds, filename) {
  const set = new Set(selectedIds || []);
  const filtered = Array.isArray(selectedIds) && selectedIds.length > 0
    ? (products || []).filter(p => set.has(p._id))
    : (products || []);
  exportProductsToExcel(filtered, filename);
}
