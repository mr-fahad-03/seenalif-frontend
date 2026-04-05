// "use client"

// import config from "../../config/config"
// import { useState } from "react"
// import Papa from "papaparse"
// import AdminSidebar from "../../components/admin/AdminSidebar" // Add this import

// const AddBulkProducts = () => {
//   const [previewProducts, setPreviewProducts] = useState([])
//   const [invalidRows, setInvalidRows] = useState([])
//   const [fileName, setFileName] = useState("")
//   const [error, setError] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [saveResult, setSaveResult] = useState(null)

//   // Helper to get admin token
//   const getAdminToken = () => localStorage.getItem("adminToken")

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0]
//     setFileName(file?.name || "")
//     setError("")
//     setPreviewProducts([])
//     setInvalidRows([])
//     setSaveResult(null)

//     if (!file) return

//     // Check if file is CSV
//     if (!file.name.toLowerCase().endsWith(".csv")) {
//       setError("Please upload a CSV file")
//       return
//     }

//     setLoading(true)

//     try {
//       // Parse CSV file
//       Papa.parse(file, {
//         header: true,
//         skipEmptyLines: true,
//         complete: async (results) => {
//           console.log("CSV parsed:", results)

//           if (results.errors.length > 0) {
//             console.error("CSV parsing errors:", results.errors)
//             setError("Error parsing CSV file: " + results.errors[0].message)
//             setLoading(false)
//             return
//           }

//           // Send parsed data to backend for preview
//           try {
//             const token = getAdminToken()
//             const res = await fetch(`${config.API_URL}/api/products/bulk-preview-csv`, {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 ...(token ? { Authorization: `Bearer ${token}` } : {}),
//               },
//               body: JSON.stringify({ csvData: results.data }),
//             })

//             const data = await res.json()
//             if (!res.ok) throw new Error(data.message || "Preview failed")

//             console.log("Preview response:", data)
//             setPreviewProducts(data.previewProducts || [])
//             setInvalidRows(data.invalidRows || [])
//           } catch (err) {
//             console.error("Preview error:", err)
//             setError(err.message)
//           } finally {
//             setLoading(false)
//           }
//         },
//         error: (error) => {
//           console.error("CSV parsing error:", error)
//           setError("Error reading CSV file: " + error.message)
//           setLoading(false)
//         },
//       })
//     } catch (err) {
//       console.error("File upload error:", err)
//       setError(err.message)
//       setLoading(false)
//     }
//   }

//   const handleExport = () => {
//     const sampleData = [
//       {
//         name: "Sample Product",
//         slug: "sample-product",
//         sku: "SP001",
//         parent_category: "Electronics",
//         category: "Smartphones",
//         brand: "Sample Brand",
//         buyingPrice: 80,
//         price: 100,
//         offerPrice: 90,
//         tax: "VAT 5%",
//         stockStatus: "In Stock",
//         showStockOut: "true",
//         canPurchase: "true",
//         refundable: "true",
//         maxPurchaseQty: 10,
//         lowStockWarning: 5,
//         unit: "piece",
//         weight: 0.5,
//         tags: "electronics,smartphone,mobile",
//         description: "Sample product description with detailed features",
//         discount: 10,
//         specifications: "Display: 6.1 inch, RAM: 8GB, Storage: 128GB",
//         details: "Additional product details",
//         shortDescription: "Brief product description",
//         barcode: "1234567890123",
//       },
//     ]

//     // Convert to CSV
//     const csv = Papa.unparse(sampleData)
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
//     const link = document.createElement("a")
//     const url = URL.createObjectURL(blob)
//     link.setAttribute("href", url)
//     link.setAttribute("download", "products_sample.csv")
//     link.style.visibility = "hidden"
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   const handleBulkSave = async () => {
//     if (previewProducts.length === 0) {
//       setError("No products to save")
//       return
//     }

//     setLoading(true)
//     setError("")
//     setSaveResult(null)

//     try {
//       const token = getAdminToken()
//       if (!token) {
//         setError("No authentication token found")
//         setLoading(false)
//         return
//       }

//       const response = await fetch(`${config.API_URL}/api/products/bulk`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ products: previewProducts }),
//       })

//       const result = await response.json()

//       if (response.ok) {
//         // Structure the result properly
//         const structuredResult = {
//           total: previewProducts.length,
//           success: result.successCount || 0,
//           failed: result.failedCount || 0,
//           results: result.results || [], // This should contain both success and failed items
//           failedProducts: result.failedProducts || [], // Backup array of just failed products
//           successfulProducts: result.successfulProducts || []
//         }

//         setSaveResult(structuredResult)
        
//         // Clear preview if all successful
//         if (structuredResult.failed === 0) {
//           setPreviewProducts([])
//           setFileName("")
//         }
//       } else {
//         setError(result.message || "Failed to save products")
//       }
//     } catch (error) {
//       console.error("Error saving products:", error)
//       setError("Error saving products: " + error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const downloadFailedProducts = () => {
//     if (!saveResult) return

//     let failedProducts = []

//     // Try multiple ways to get failed products data
//     if (saveResult.results) {
//       failedProducts = saveResult.results
//         .filter((result) => result.status === "error" || result.success === false)
//         .map((result, index) => ({
//           name: result.product?.name || result.name || previewProducts[result.originalIndex || index]?.name || 'Unknown',
//           sku: result.product?.sku || result.sku || previewProducts[result.originalIndex || index]?.sku || '',
//           price: result.product?.price || result.price || previewProducts[result.originalIndex || index]?.price || '',
//           brand: result.product?.brand || result.brand || previewProducts[result.originalIndex || index]?.brand || '',
//           category: result.product?.category || result.category || previewProducts[result.originalIndex || index]?.category || '',
//           parent_category: result.product?.parent_category || result.parent_category || previewProducts[result.originalIndex || index]?.parent_category || '',
//           error_reason: result.message || result.error || result.errorMessage || 'Unknown error',
//           error_details: result.details || ''
//         }))
//     } else if (saveResult.failedProducts) {
//       failedProducts = saveResult.failedProducts.map((product) => ({
//         ...product,
//         error_reason: product.error || product.errorMessage || 'Unknown error'
//       }))
//     }

//     if (failedProducts.length === 0) {
//       alert('No failed products data available to download')
//       return
//     }

//     // Convert to CSV
//     const csv = Papa.unparse(failedProducts)
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
//     const link = document.createElement("a")
//     const url = URL.createObjectURL(blob)
//     link.setAttribute("href", url)
//     link.setAttribute("download", `failed_products_${new Date().toISOString().split('T')[0]}.csv`)
//     link.style.visibility = "hidden"
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <AdminSidebar />
//       <div className="ml-64 p-8">
//         <h1 className="text-2xl font-bold mb-6">Add Bulk Products</h1>

//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//           <h3 className="font-semibold text-yellow-800 mb-2">CSV Format Guidelines:</h3>
//           <ul className="text-sm text-yellow-700 space-y-1">
//             <li>• Use CSV format with column headers: name, parent_category, category, brand, price, etc.</li>
//             <li>
//               • <strong>parent_category</strong>: Main category (shown in navbar, e.g., "Electronics")
//             </li>
//             <li>
//               • <strong>category</strong>: Subcategory (shown in dropdown, e.g., "Smartphones")
//             </li>
//             <li>• Categories and Brands will be created automatically if they don't exist</li>
//             <li>• Required fields: name, parent_category, price</li>
//             <li>• Stock Status options: "In Stock", "Out of Stock", "PreOrder"</li>
//             <li>• Boolean fields (showStockOut, canPurchase, refundable): use "true" or "false"</li>
//           </ul>
//         </div>

//         <div className="flex gap-4 mb-6">
//           <label className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-2 rounded cursor-pointer">
//             Import CSV File
//             <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
//           </label>
//           <button onClick={handleExport} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
//             Download Sample CSV
//           </button>
//           {fileName && <span className="text-gray-600 ml-2 flex items-center">📄 {fileName}</span>}
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//             <p className="text-red-700">{error}</p>
//           </div>
//         )}

//         {loading && (
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//             <p className="text-blue-700">Processing...</p>
//           </div>
//         )}

//         {(previewProducts.length > 0 || invalidRows.length > 0) && (
//           <div className="mb-4">
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
//               <h3 className="font-semibold mb-2">Import Summary:</h3>
//               <div className="flex gap-6 mb-2">
//                 <span>Total Rows: {previewProducts.length + invalidRows.length}</span>
//                 <span className="text-green-600">✓ Valid: {previewProducts.length}</span>
//                 <span className="text-red-600">✗ Invalid: {invalidRows.length}</span>
//               </div>

//               {invalidRows.length > 0 && (
//                 <div className="mt-3">
//                   <h4 className="font-medium text-red-600 mb-2">Invalid Rows:</h4>
//                   <div className="max-h-32 overflow-y-auto">
//                     {invalidRows.slice(0, 5).map((row, i) => (
//                       <div key={i} className="text-sm text-red-600">
//                         Row {row.row}: {row.reason}
//                       </div>
//                     ))}
//                     {invalidRows.length > 5 && (
//                       <div className="text-sm text-red-600">...and {invalidRows.length - 5} more</div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {previewProducts.length > 0 && (
//                 <button
//                   onClick={handleBulkSave}
//                   className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mt-3"
//                   disabled={loading}
//                 >
//                   {loading ? "Saving..." : `Save ${previewProducts.length} Products`}
//                 </button>
//               )}
//             </div>
//           </div>
//         )}

//         {saveResult && (
//           <div className="mb-4">
//             <div className={`border rounded-lg p-4 ${
//               saveResult.failed > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
//             }`}>
//               <h3 className={`font-semibold mb-2 ${
//                 saveResult.failed > 0 ? 'text-yellow-800' : 'text-green-800'
//               }`}>
//                 Save Results:
//               </h3>
              
//               <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white rounded border">
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">{saveResult.total}</div>
//                   <div className="text-sm text-gray-600">Total</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-green-600">{saveResult.success}</div>
//                   <div className="text-sm text-gray-600">Success</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-red-600">{saveResult.failed}</div>
//                   <div className="text-sm text-gray-600">Failed</div>
//                 </div>
//               </div>

//               {saveResult.success > 0 && (
//                 <div className="mb-4 p-3 bg-green-100 rounded">
//                   <p className="text-green-800 font-medium">
//                     ✅ {saveResult.success} products saved successfully!
//                   </p>
//                 </div>
//               )}

//               {saveResult.failed > 0 && (saveResult.results || saveResult.failedProducts) && (
//                 <div className="mt-4">
//                   <h4 className="font-medium text-red-600 mb-3 flex items-center">
//                     ❌ Failed Products ({saveResult.failed}):
//                   </h4>
                  
//                   <div className="max-h-96 overflow-y-auto border rounded bg-white">
//                     <table className="min-w-full text-sm">
//                       <thead className="bg-red-50 sticky top-0">
//                         <tr>
//                           <th className="px-3 py-2 text-left border-b">#</th>
//                           <th className="px-3 py-2 text-left border-b">Product Name</th>
//                           <th className="px-3 py-2 text-left border-b">SKU</th>
//                           <th className="px-3 py-2 text-left border-b">Error Reason</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {/* Try multiple ways to get failed products */}
//                         {(() => {
//                           let failedItems = []
                          
//                           // Method 1: From results array
//                           if (saveResult.results) {
//                             failedItems = saveResult.results
//                               .map((result, index) => ({ ...result, originalIndex: index }))
//                               .filter((result) => result.status === "error" || result.success === false)
//                           }
                          
//                           // Method 2: From failedProducts array (backup)
//                           if (failedItems.length === 0 && saveResult.failedProducts) {
//                             failedItems = saveResult.failedProducts.map((product, index) => ({
//                               product: product,
//                               message: product.error || product.errorMessage || 'Unknown error',
//                               originalIndex: index
//                             }))
//                           }

//                           // Method 3: If still empty, show a message
//                           if (failedItems.length === 0) {
//                             return (
//                               <tr>
//                                 <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
//                                   No detailed error information available. Check console for more details.
//                                 </td>
//                               </tr>
//                             )
//                           }

//                           return failedItems.map((result, failedIndex) => (
//                             <tr key={failedIndex} className="border-b hover:bg-gray-50">
//                               <td className="px-3 py-2 text-gray-500">
//                                 {result.originalIndex + 1}
//                               </td>
//                               <td className="px-3 py-2">
//                                 <div className="font-medium text-gray-900">
//                                   {result.product?.name || result.name || previewProducts[result.originalIndex]?.name || 'Unknown Product'}
//                                 </div>
//                               </td>
//                               <td className="px-3 py-2 text-gray-600">
//                                 {result.product?.sku || result.sku || previewProducts[result.originalIndex]?.sku || 'N/A'}
//                               </td>
//                               <td className="px-3 py-2">
//                                 <div className="text-red-600">
//                                   {result.message || result.error || result.errorMessage || 'Unknown error'}
//                                 </div>
//                                 {result.details && (
//                                   <div className="text-xs text-red-500 mt-1">
//                                     {result.details}
//                                   </div>
//                                 )}
//                               </td>
//                             </tr>
//                           ))
//                         })()}
//                       </tbody>
//                     </table>
//                   </div>
                  
//                   {saveResult.failed > 10 && (
//                     <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
//                       💡 Tip: You can download the failed products as CSV to fix issues and re-upload
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Add download failed products button */}
//               {saveResult.failed > 0 && saveResult.results && (
//                 <div className="mt-4 flex gap-2">
//                   <button
//                     onClick={downloadFailedProducts}
//                     className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm"
//                   >
//                     📥 Download Failed Products CSV
//                   </button>
//                   <button
//                     onClick={() => {
//                       setSaveResult(null)
//                       setPreviewProducts([])
//                       setFileName("")
//                     }}
//                     className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
//                   >
//                     🔄 Start Over
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {previewProducts.length > 0 && (
//           <div className="overflow-x-auto bg-white rounded shadow p-4">
//             <h3 className="font-semibold mb-3">Preview Products ({previewProducts.length})</h3>
//             <table className="min-w-full text-sm">
//               <thead>
//                 <tr className="border-b">
//                   <th className="px-2 py-1 text-left">Name</th>
//                   <th className="px-2 py-1 text-left">Parent Category</th>
//                   <th className="px-2 py-1 text-left">Sub Category</th>
//                   <th className="px-2 py-1 text-left">Brand</th>
//                   <th className="px-2 py-1 text-left">Price</th>
//                   <th className="px-2 py-1 text-left">Stock Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {previewProducts.slice(0, 20).map((product, i) => (
//                   <tr key={i} className="border-b">
//                     <td className="px-2 py-1">{product.name || "N/A"}</td>
//                     <td className="px-2 py-1">{product.parentCategory?.name || product.parentCategory || "N/A"}</td>
//                     <td className="px-2 py-1">{product.category?.name || product.category || "N/A"}</td>
//                     <td className="px-2 py-1">{product.brand?.name || product.brand || "N/A"}</td>
//                     <td className="px-2 py-1">{product.price || 0}</td>
//                     <td className="px-2 py-1">{product.stockStatus || "In Stock"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {previewProducts.length > 20 && (
//               <div className="text-xs text-gray-500 mt-2">Showing first 20 of {previewProducts.length} products...</div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default AddBulkProducts



































































































"use client"

import config from "../../config/config"
import { useState } from "react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { exportProductsToExcel } from "../../utils/exportToExcel"

const AddBulkProducts = () => {
  const [previewProducts, setPreviewProducts] = useState([])
  const [invalidRows, setInvalidRows] = useState([])
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [saveResult, setSaveResult] = useState(null)
  const [fileType, setFileType] = useState("")
  const [importResults, setImportResults] = useState(null)

  // Helper to get admin token
  const getAdminToken = () => localStorage.getItem("adminToken")
  const clearStorefrontProductCache = () => {
    localStorage.removeItem("graba2z_products_cache")
    sessionStorage.removeItem("graba2z_products_cache")
    for (let i = 0; i < 20; i += 1) {
      localStorage.removeItem(`graba2z_products_chunk_${i}`)
      sessionStorage.removeItem(`graba2z_products_chunk_${i}`)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    setFileName(file?.name || "")
    setError("")
    setPreviewProducts([])
    setInvalidRows([])
    setSaveResult(null)
    setImportResults(null)

    if (!file) return

    const fileName = file.name.toLowerCase()
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls")
    const isCSV = fileName.endsWith(".csv")

    // Check if file is CSV or Excel
    if (!isCSV && !isExcel) {
      setError("Please upload a CSV or Excel file (.csv, .xlsx, .xls)")
      return
    }

    setFileType(isExcel ? "excel" : "csv")
    setLoading(true)

    // Handle Excel files with ObjectId support
    if (isExcel) {
      try {
        const token = getAdminToken()
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch(`${config.API_URL}/api/products/bulk-import-with-id`, {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        })

        const data = await res.json()
        if (!res.ok) {
          // If there are duplicate ObjectId errors, show them
          if (data.errors && data.errors.length > 0) {
            setImportResults(data)
            setError(data.message || "Import failed")
          } else {
            throw new Error(data.message || "Import failed")
          }
        } else {
          setImportResults(data)
          setError("")
          clearStorefrontProductCache()
        }
      } catch (err) {
        console.error("Excel import error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
      return
    }

    // Handle CSV files (existing logic)
    setLoading(true)

    try {
      // Read file as text with proper encoding first
      const reader = new FileReader()
      reader.onload = async (event) => {
        let csvText = event.target.result
        
        // Clean up common encoding issues
        csvText = csvText
          .replace(/\uFFFD/g, '') // Remove replacement character (�)
          .replace(/[\u0080-\u009F]/g, '') // Remove Windows-1252 control chars
          .replace(/\u2019/g, "'") // Smart single quote to regular
          .replace(/\u2018/g, "'") // Smart single quote to regular
          .replace(/\u201C/g, '"') // Smart double quote to regular
          .replace(/\u201D/g, '"') // Smart double quote to regular
          .replace(/\u2013/g, '-') // En dash to hyphen
          .replace(/\u2014/g, '-') // Em dash to hyphen
          .replace(/\u2022/g, '*') // Bullet to asterisk
          .replace(/\u00A0/g, ' ') // Non-breaking space to regular space
        
        // Parse CSV from cleaned text
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim().replace(/^\uFEFF/, ''), // Remove BOM from headers
          transform: (value) => {
            if (typeof value === 'string') {
              return value
                .replace(/\uFFFD/g, '') // Remove any remaining replacement characters
                .replace(/[\u0000-\u001F\u007F]/g, '') // Remove control characters
                .trim()
            }
            return value
          },
          complete: async (results) => {
          console.log("CSV parsed:", results)

          if (results.errors.length > 0) {
            console.error("CSV parsing errors:", results.errors)
            setError("Error parsing CSV file: " + results.errors[0].message)
            setLoading(false)
            return
          }

          // Send parsed data to backend for preview
          try {
            const token = getAdminToken()
            const res = await fetch(`${config.API_URL}/api/products/bulk-preview-csv`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ csvData: results.data }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Preview failed")

            console.log("Preview response:", data)
            setPreviewProducts(data.previewProducts || [])
            setInvalidRows(data.invalidRows || [])
          } catch (err) {
            console.error("Preview error:", err)
            setError(err.message)
          } finally {
            setLoading(false)
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error)
          setError("Error reading CSV file: " + error.message)
          setLoading(false)
        },
      })
      }
      
      reader.onerror = () => {
        setError("Error reading the file")
        setLoading(false)
      }
      
      // Read as UTF-8 text
      reader.readAsText(file, 'UTF-8')
    } catch (err) {
      console.error("File upload error:", err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    // Export Excel template with ObjectId column
    const sampleData = [
      {
        _id: '', // Leave empty for new products, or paste existing product ObjectId to update
        name: "Samsung Galaxy S24 Ultra 256GB",
        slug: "samsung-galaxy-s24-ultra-256gb",
        sku: "SAMS24U256",
        barcode: "8801643767891",
        parent_category: "Electronics",
        category_level_1: "Smartphones",
        category_level_2: "Android",
        category_level_3: "Flagship",
        category_level_4: "",
        brand: "Samsung",
        buyingPrice: 3500,
        price: 4500,
        offerPrice: 4200,
        discount: 7,
        tax: "VAT 5%",
        stockStatus: "In Stock",
        countInStock: 50,
        showStockOut: "true",
        canPurchase: "true",
        refundable: "true",
        maxPurchaseQty: 5,
        lowStockWarning: 10,
        unit: "piece",
        weight: 0.234,
        tags: "smartphone,samsung,5g,flagship",
        description: "The Samsung Galaxy S24 Ultra features a stunning 6.8-inch display",
        shortDescription: "Flagship smartphone with 200MP camera and S Pen",
        specifications: "Display: 6.8 inch AMOLED, RAM: 12GB, Storage: 256GB, Camera: 200MP",
        details: "Includes: Phone, USB-C Cable, SIM Ejector Tool, Quick Start Guide",
      },
    ]
    exportProductsToExcel(sampleData, "products_excel_template.xlsx")
  }

  const handleExport = () => {
    // Comprehensive sample data with multiple examples
    const sampleData = [
      {
        name: "Samsung Galaxy S24 Ultra 256GB",
        slug: "samsung-galaxy-s24-ultra-256gb",
        sku: "SAMS24U256",
        barcode: "8801643767891",
        parent_category: "Electronics",
        category_level_1: "Smartphones",
        category_level_2: "Android",
        category_level_3: "Flagship",
        category_level_4: "",
        brand: "Samsung",
        buyingPrice: 3500,
        price: 4500,
        offerPrice: 4200,
        discount: 7,
        tax: "VAT 5%",
        stockStatus: "In Stock",
        countInStock: 50,
        showStockOut: "true",
        canPurchase: "true",
        refundable: "true",
        maxPurchaseQty: 5,
        lowStockWarning: 10,
        unit: "piece",
        weight: 0.234,
        tags: "smartphone,samsung,5g,flagship",
        description: "The Samsung Galaxy S24 Ultra features a stunning 6.8-inch display, powerful Snapdragon processor, advanced AI camera system with 200MP main sensor, and S Pen support. Perfect for productivity and creativity.",
        shortDescription: "Flagship smartphone with 200MP camera and S Pen",
        specifications: "Display: 6.8 inch AMOLED, RAM: 12GB, Storage: 256GB, Camera: 200MP",
        details: "Includes: Phone, USB-C Cable, SIM Ejector Tool, Quick Start Guide",
      },
      {
        name: "Apple MacBook Air M2 13-inch 8GB 256GB",
        slug: "apple-macbook-air-m2-13-8gb-256gb",
        sku: "MBA13M28256",
        barcode: "194253081920",
        parent_category: "Electronics",
        category_level_1: "Laptops",
        category_level_2: "Apple MacBook",
        category_level_3: "MacBook Air",
        category_level_4: "M2 Series",
        brand: "Apple",
        buyingPrice: 4000,
        price: 5200,
        offerPrice: 4999,
        discount: 4,
        tax: "VAT 5%",
        stockStatus: "In Stock",
        countInStock: 25,
        showStockOut: "true",
        canPurchase: "true",
        refundable: "true",
        maxPurchaseQty: 3,
        lowStockWarning: 5,
        unit: "piece",
        weight: 1.24,
        tags: "laptop,apple,macbook,m2,portable",
        description: "The new MacBook Air with M2 chip delivers incredible performance in a thin and light design. Features a stunning Liquid Retina display, all-day battery life, and silent fanless operation.",
        shortDescription: "Ultra-portable laptop with M2 chip and all-day battery",
        specifications: "Display: 13.6 inch Liquid Retina, Chip: Apple M2, RAM: 8GB, Storage: 256GB SSD",
        details: "Includes: MacBook Air, USB-C Power Adapter, USB-C to MagSafe Cable",
      },
      {
        name: "Sony WH-1000XM5 Wireless Headphones",
        slug: "sony-wh-1000xm5-wireless-headphones",
        sku: "SONYWH1000XM5",
        barcode: "4548736134437",
        parent_category: "Electronics",
        category_level_1: "Audio",
        category_level_2: "Headphones",
        category_level_3: "Over-Ear",
        category_level_4: "Noise Cancelling",
        brand: "Sony",
        buyingPrice: 800,
        price: 1299,
        offerPrice: 1199,
        discount: 8,
        tax: "VAT 5%",
        stockStatus: "In Stock",
        countInStock: 100,
        showStockOut: "true",
        canPurchase: "true",
        refundable: "true",
        maxPurchaseQty: 10,
        lowStockWarning: 20,
        unit: "piece",
        weight: 0.25,
        tags: "headphones,sony,wireless,noise-cancelling,bluetooth",
        description: "Industry-leading noise cancellation with two processors controlling 8 microphones. Up to 30-hour battery life with quick charging. Premium sound quality with LDAC and DSEE Extreme.",
        shortDescription: "Premium wireless headphones with industry-leading noise cancellation",
        specifications: "Battery: 30 hours, Connectivity: Bluetooth 5.2, Driver: 30mm, Weight: 250g",
        details: "Includes: Headphones, Carrying Case, USB-C Cable, Audio Cable, Adapter",
      },
      {
        name: "LG 55-inch OLED C3 4K Smart TV",
        slug: "lg-55-oled-c3-4k-smart-tv",
        sku: "LG55OLEDC3",
        barcode: "8806098681471",
        parent_category: "Electronics",
        category_level_1: "TVs",
        category_level_2: "OLED TVs",
        category_level_3: "55 inch",
        category_level_4: "",
        brand: "LG",
        buyingPrice: 4500,
        price: 6500,
        offerPrice: 5999,
        discount: 8,
        tax: "VAT 5%",
        stockStatus: "In Stock",
        countInStock: 15,
        showStockOut: "true",
        canPurchase: "true",
        refundable: "false",
        maxPurchaseQty: 2,
        lowStockWarning: 5,
        unit: "piece",
        weight: 18.9,
        tags: "tv,oled,4k,smart-tv,lg,gaming",
        description: "Experience perfect blacks and infinite contrast with self-lit OLED pixels. Features α9 Gen6 AI Processor, Dolby Vision IQ, and support for NVIDIA G-SYNC and AMD FreeSync Premium for gaming.",
        shortDescription: "55-inch OLED 4K Smart TV with AI processor and gaming features",
        specifications: "Display: 55 inch OLED 4K, HDR: Dolby Vision IQ/HDR10/HLG, Refresh Rate: 120Hz, Smart OS: webOS",
        details: "Includes: TV, Remote Control, Power Cable, Stand, Wall Mount Compatible",
      },
      {
        name: "PlayStation 5 Console (Disc Edition)",
        slug: "playstation-5-console-disc-edition",
        sku: "PS5DISC",
        barcode: "0711719395003",
        parent_category: "Electronics",
        category_level_1: "Gaming",
        category_level_2: "Consoles",
        category_level_3: "PlayStation",
        category_level_4: "",
        brand: "Sony",
        buyingPrice: 1800,
        price: 2299,
        offerPrice: "",
        discount: 0,
        tax: "VAT 5%",
        stockStatus: "PreOrder",
        countInStock: 0,
        showStockOut: "true",
        canPurchase: "true",
        refundable: "true",
        maxPurchaseQty: 1,
        lowStockWarning: 5,
        unit: "piece",
        weight: 4.5,
        tags: "gaming,playstation,ps5,console,sony",
        description: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio. Play thousands of PS4 and PS5 games.",
        shortDescription: "Next-gen gaming console with ultra-high speed SSD",
        specifications: "CPU: AMD Zen 2, GPU: AMD RDNA 2, RAM: 16GB GDDR6, Storage: 825GB SSD, Resolution: Up to 8K",
        details: "Includes: PS5 Console, DualSense Controller, HDMI Cable, Power Cable, USB Cable, Stand",
      },
    ]

    // Convert to CSV
    const csv = Papa.unparse(sampleData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "products_sample_template.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBulkSave = async () => {
    setLoading(true)
    setSaveResult(null)
    try {
      const token = getAdminToken()
      const res = await fetch(`${config.API_URL}/api/products/bulk-save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ products: previewProducts }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Bulk save failed")

      console.log("Save response:", data)
      setSaveResult(data)
      clearStorefrontProductCache()
    } catch (err) {
      console.error("Save error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="ml-64 p-8">
        <h1 className="text-2xl font-bold mb-6">Add Bulk Products</h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Import Options:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded p-3 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Excel Import (Recommended)</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ Supports product updates via ObjectId (_id column)</li>
                <li>✓ Category matching by ID or name</li>
                <li>✓ Automatic category creation</li>
                <li>✓ Duplicate detection</li>
                <li>✓ Leave _id empty for new products</li>
                <li>✓ Paste _id from exported file to update</li>
              </ul>
            </div>
            <div className="bg-white rounded p-3 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">CSV Import (Legacy)</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ Simple text format</li>
                <li>✓ Preview before import</li>
                <li>✓ Creates new products only</li>
                <li>✓ No update support</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">CSV Format Guidelines:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Use CSV headers: name, slug(optional), sku(optional), parent_category, category_level_1, category_level_2, category_level_3, category_level_4, brand, price, offerPrice(optional), tax(optional), stockStatus(optional), showStockOut, canPurchase, refundable, maxPurchaseQty, lowStockWarning, unit, weight, tags, description, discount(optional), specifications(optional), details(optional), shortDescription(optional), barcode(optional)</li>
            <li>• <strong>parent_category</strong>: Main category (Level 0) shown in navbar (e.g., "Electronics")</li>
            <li>• <strong>category_level_1</strong>: First subcategory level (e.g., "Smartphones")</li>
            <li>• <strong>category_level_2/3/4</strong>: Optional deeper levels (will be auto-created & linked)</li>
            <li>• Any missing categories/brands/tax/unit will be created automatically</li>
            <li>• Required fields: name, parent_category, price (category_level_1 recommended)</li>
            <li>• Stock Status: "In Stock" | "Out of Stock" | "PreOrder" (defaults to In Stock)</li>
            <li>• Boolean fields: use "true" or "false"</li>
          </ul>
        </div>

        <div className="flex gap-4 mb-6">
          <label className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded cursor-pointer inline-flex items-center gap-2">
            📊 Import Excel File (with Update Support)
            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
          </label>
          <label className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-2 rounded cursor-pointer inline-flex items-center gap-2">
            📄 Import CSV File (Create Only)
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={handleExportExcel} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
            Download Excel Template
          </button>
          <button onClick={handleExport} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
            Download CSV Sample
          </button>
          {fileName && <span className="text-gray-600 ml-2 flex items-center">📄 {fileName}</span>}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-700">Processing...</p>
          </div>
        )}

        {/* Excel Import Results */}
        {importResults && fileType === "excel" && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Import Results</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-700">{importResults.created || 0}</div>
                <div className="text-sm text-green-600 mt-1">Products Created</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">{importResults.updated || 0}</div>
                <div className="text-sm text-blue-600 mt-1">Products Updated</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-700">{importResults.failed || 0}</div>
                <div className="text-sm text-red-600 mt-1">Failed</div>
              </div>
            </div>

            {importResults.errors && importResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-900 mb-3">Errors ({importResults.errors.length}):</h4>
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-red-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-red-800">Row</th>
                        <th className="px-3 py-2 text-left text-red-800">Product</th>
                        <th className="px-3 py-2 text-left text-red-800">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResults.errors.map((err, idx) => (
                        <tr key={idx} className="border-b border-red-200">
                          <td className="px-3 py-2 text-red-700 font-semibold">{err.row}</td>
                          <td className="px-3 py-2 text-red-700">{err.productName || 'N/A'}</td>
                          <td className="px-3 py-2 text-red-600">
                            {err.error}
                            {err.objectId && <span className="text-xs ml-2 text-red-500">(ID: {err.objectId})</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importResults.results && importResults.results.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Success Details ({importResults.results.length}):</h4>
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-700">Row</th>
                        <th className="px-3 py-2 text-left text-gray-700">Action</th>
                        <th className="px-3 py-2 text-left text-gray-700">Product</th>
                        <th className="px-3 py-2 text-left text-gray-700">SKU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResults.results.map((result, idx) => (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="px-3 py-2 text-gray-600">{result.row}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              result.action === 'created' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {result.action}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-700">{result.productName}</td>
                          <td className="px-3 py-2 text-gray-500">{result.sku || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CSV Preview Results */}

        {(previewProducts.length > 0 || invalidRows.length > 0) && (
          <div className="mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">Import Summary:</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                <div className="bg-white p-2 rounded shadow-sm text-center">
                  <div className="text-lg font-bold text-blue-600">{previewProducts.length + invalidRows.length}</div>
                  <div className="text-xs text-gray-600">Total Rows</div>
                </div>
                <div className="bg-white p-2 rounded shadow-sm text-center">
                  <div className="text-lg font-bold text-green-600">{previewProducts.length}</div>
                  <div className="text-xs text-gray-600">Valid</div>
                </div>
                <div className="bg-white p-2 rounded shadow-sm text-center">
                  <div className="text-lg font-bold text-emerald-600">
                    {previewProducts.filter(p => !p.willUpdate).length}
                  </div>
                  <div className="text-xs text-gray-600">Will Create</div>
                </div>
                <div className="bg-white p-2 rounded shadow-sm text-center">
                  <div className="text-lg font-bold text-amber-600">
                    {previewProducts.filter(p => p.willUpdate).length}
                  </div>
                  <div className="text-xs text-gray-600">Will Update</div>
                </div>
                <div className="bg-white p-2 rounded shadow-sm text-center">
                  <div className="text-lg font-bold text-red-600">{invalidRows.length}</div>
                  <div className="text-xs text-gray-600">Invalid</div>
                </div>
              </div>

              {invalidRows.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-red-600 mb-2">Invalid Rows:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {invalidRows.slice(0, 5).map((row, i) => (
                      <div key={i} className="text-sm text-red-600">
                        Row {row.row}: {row.reason}
                      </div>
                    ))}
                    {invalidRows.length > 5 && (
                      <div className="text-sm text-red-600">...and {invalidRows.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}

              {previewProducts.length > 0 && (
                <button
                  onClick={handleBulkSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mt-3"
                  disabled={loading}
                >
                  {loading ? "Saving..." : `Save ${previewProducts.length} Products`}
                </button>
              )}
            </div>
          </div>
        )}

        {saveResult && (
          <div className="mb-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Save Results:</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="bg-white p-3 rounded shadow-sm text-center">
                  <div className="text-2xl font-bold text-blue-600">{saveResult.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm text-center">
                  <div className="text-2xl font-bold text-green-600">{saveResult.success}</div>
                  <div className="text-xs text-gray-600">Success</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm text-center">
                  <div className="text-2xl font-bold text-emerald-600">{saveResult.created || 0}</div>
                  <div className="text-xs text-gray-600">Created</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm text-center">
                  <div className="text-2xl font-bold text-amber-600">{saveResult.updated || 0}</div>
                  <div className="text-xs text-gray-600">Updated</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm text-center">
                  <div className="text-2xl font-bold text-red-600">{saveResult.failed}</div>
                  <div className="text-xs text-gray-600">Failed</div>
                </div>
              </div>

              {saveResult.message && (
                <div className="mb-3 p-3 bg-green-100 rounded">
                  <p className="text-green-800 font-medium">✅ {saveResult.message}</p>
                </div>
              )}

              {saveResult.failed > 0 && saveResult.results && (
                <div className="mt-3">
                  <h4 className="font-medium text-red-600 mb-2">Failed Products:</h4>
                  <div className="max-h-64 overflow-y-auto bg-red-50 p-3 rounded">
                    {saveResult.results
                      .filter((r) => r.status === "failed")
                      .map((r, i) => (
                        <div key={i} className="text-sm text-red-700 mb-2 pb-2 border-b border-red-200 last:border-0">
                          <strong>#{i + 1}:</strong> {r.product?.name || `Product ${r.index + 1}`}
                          <br />
                          <span className="text-red-600">Error: {r.reason}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setSaveResult(null)
                    setPreviewProducts([])
                    setFileName("")
                    setError("")
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                >
                  🔄 Upload Another File
                </button>
              </div>
            </div>
          </div>
        )}

        {previewProducts.length > 0 && (
          <div className="overflow-x-auto bg-white rounded shadow p-4">
            <h3 className="font-semibold mb-3">
              Preview Products ({previewProducts.length})
              <span className="ml-3 text-sm text-emerald-600">
                ✨ {previewProducts.filter(p => !p.willUpdate).length} New
              </span>
              <span className="ml-2 text-sm text-amber-600">
                🔄 {previewProducts.filter(p => p.willUpdate).length} Updates
              </span>
            </h3>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1 text-left">Action</th>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">SKU</th>
                  <th className="px-2 py-1 text-left">Parent Cat</th>
                  <th className="px-2 py-1 text-left">Level 1</th>
                  <th className="px-2 py-1 text-left">Level 2</th>
                  <th className="px-2 py-1 text-left">Level 3</th>
                  <th className="px-2 py-1 text-left">Level 4</th>
                  <th className="px-2 py-1 text-left">Brand</th>
                  <th className="px-2 py-1 text-left">Price</th>
                  <th className="px-2 py-1 text-left">Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {previewProducts.slice(0, 20).map((product, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-1">
                      {product.willUpdate ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          UPDATE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          NEW
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1">{product.name || "N/A"}</td>
                    <td className="px-2 py-1 text-gray-600">{product.sku || "-"}</td>
                    <td className="px-2 py-1">{product.parentCategory?.name || product.parentCategory || "-"}</td>
                    <td className="px-2 py-1">{product.category?.name || product.category || "-"}</td>
                    <td className="px-2 py-1">{product.subCategory2?.name || product.subCategory2 || "-"}</td>
                    <td className="px-2 py-1">{product.subCategory3?.name || product.subCategory3 || "-"}</td>
                    <td className="px-2 py-1">{product.subCategory4?.name || product.subCategory4 || "-"}</td>
                    <td className="px-2 py-1">{product.brand?.name || product.brand || "N/A"}</td>
                    <td className="px-2 py-1">{product.price || 0}</td>
                    <td className="px-2 py-1">{product.stockStatus || "In Stock"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewProducts.length > 20 && (
              <div className="text-xs text-gray-500 mt-2">Showing first 20 of {previewProducts.length} products...</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddBulkProducts
