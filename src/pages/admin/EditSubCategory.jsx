import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ImageUpload from "../../components/ImageUpload";
import TipTapEditor from "../../components/TipTapEditor";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import config from "../../config/config";

const EditSubCategory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories1, setSubCategories1] = useState([]); // For Level 3 & 4
  const [subCategories2, setSubCategories2] = useState([]); // For Level 4
  const [parentSubCategories, setParentSubCategories] = useState([]);
  
  // Detect level from URL
  const getLevel = () => {
    if (location.pathname.includes("subcategories-4")) return 4
    if (location.pathname.includes("subcategories-3")) return 3
    if (location.pathname.includes("subcategories-2")) return 2
    return 1
  }

  const level = getLevel()
  const parentLevel = level - 1

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    seoContent: "",
    metaTitle: "",
    metaDescription: "",
    customSchema: "",
    redirectUrl: "",
    image: "",
    category: "",
    subCategory1: "", // For Level 3 & 4
    subCategory2: "", // For Level 4
    parentSubCategory: "",
    level: level,
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchSubCategory();
    }
  }, [id]);

  // Fetch Level 1 subcategories when category is selected (for Level 3 & 4)
  useEffect(() => {
    if ((level === 3 || level === 4) && formData.category) {
      fetchSubCategories1(formData.category)
    } else {
      setSubCategories1([])
    }
  }, [level, formData.category])

  // Fetch Level 2 subcategories when Level 1 is selected (for Level 4)
  useEffect(() => {
    if (level === 4 && formData.subCategory1) {
      fetchSubCategories2(formData.subCategory1)
    } else {
      setSubCategories2([])
    }
  }, [level, formData.subCategory1])

  // Fetch parent subcategories based on level and selections
  useEffect(() => {
    if (level === 2 && formData.category) {
      // Level 2: Parent is Level 1 subcategory of selected category
      fetchParentSubCategories(formData.category)
    } else if (level === 3 && formData.subCategory1) {
      // Level 3: Parent is Level 2 subcategory of selected Level 1
      fetchParentSubCategoriesForLevel3(formData.subCategory1)
    } else if (level === 4 && formData.subCategory2) {
      // Level 4: Parent is Level 3 subcategory of selected Level 2
      fetchParentSubCategoriesForLevel4(formData.subCategory2)
    } else if (level > 1) {
      setParentSubCategories([])
    }
  }, [level, formData.category, formData.subCategory1, formData.subCategory2])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      // Use admin endpoint so inactive parent categories still appear (required for auto-select on edit)
      const response = await axios.get(`${config.API_URL}/api/categories/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(`${config.API_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (fallbackError) {
        showToast("Failed to load categories", "error");
      }
    }
  };

  const fetchSubCategories1 = async (categoryId) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await axios.get(`${config.API_URL}/api/subcategories/category/${categoryId}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // Filter to only show Level 1 subcategories (or those without level for backward compatibility)
      const level1Subs = response.data.filter(sub => !sub.level || sub.level === 1)
      setSubCategories1(level1Subs)
    } catch (error) {
      console.error("Error fetching level 1 subcategories:", error)
      showToast("Error fetching level 1 subcategories", "error")
      setSubCategories1([])
    }
  }

  const fetchSubCategories2 = async (subCategory1Id) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await axios.get(`${config.API_URL}/api/subcategories/children/${subCategory1Id}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSubCategories2(response.data)
    } catch (error) {
      console.error("Error fetching level 2 subcategories:", error)
      showToast("Error fetching level 2 subcategories", "error")
      setSubCategories2([])
    }
  }

  const fetchParentSubCategories = async (categoryId) => {
    try {
      const token = localStorage.getItem("adminToken")
      // For level 2, fetch subcategories of the selected category (level 1)
      const response = await axios.get(`${config.API_URL}/api/subcategories/category/${categoryId}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // Filter to only show Level 1 subcategories
      const level1Subs = response.data.filter(sub => !sub.level || sub.level === 1)
      setParentSubCategories(level1Subs)
    } catch (error) {
      console.error("Error fetching parent subcategories:", error)
      showToast("Error fetching parent subcategories", "error")
      setParentSubCategories([])
    }
  }

  const fetchParentSubCategoriesForLevel3 = async (subCategory1Id) => {
    try {
      const token = localStorage.getItem("adminToken")
      // For level 3, fetch children of level 1 subcategory (level 2 subcategories)
      const response = await axios.get(`${config.API_URL}/api/subcategories/children/${subCategory1Id}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setParentSubCategories(response.data)
    } catch (error) {
      console.error("Error fetching level 2 subcategories:", error)
      showToast("Error fetching level 2 subcategories", "error")
      setParentSubCategories([])
    }
  }

  const fetchParentSubCategoriesForLevel4 = async (subCategory2Id) => {
    try {
      const token = localStorage.getItem("adminToken")
      // For level 4, fetch children of level 2 subcategory (level 3 subcategories)
      const response = await axios.get(`${config.API_URL}/api/subcategories/children/${subCategory2Id}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setParentSubCategories(response.data)
    } catch (error) {
      console.error("Error fetching level 3 subcategories:", error)
      showToast("Error fetching level 3 subcategories", "error")
      setParentSubCategories([])
    }
  }

  const fetchSubCategory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${config.API_URL}/api/subcategories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const subCategoryData = response.data;

      const normalizeId = (value) => {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (typeof value === "object") return value._id || value.id || "";
        return "";
      };
      
      // For Level 3 and 4, we need to traverse up to find intermediate parents
      let subCat1 = "";
      let subCat2 = "";
      
      if (level === 3 || level === 4) {
        // Get the immediate parent to find the chain
        const parentId = subCategoryData.parentSubCategory?._id || subCategoryData.parentSubCategory;
        if (parentId) {
          try {
            const parentResponse = await axios.get(`${config.API_URL}/api/subcategories/${parentId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const parentData = parentResponse.data;
            
            if (level === 3) {
              // For Level 3: parent is Level 2, we need Level 1
              subCat1 = parentData.parentSubCategory?._id || parentData.parentSubCategory || "";
            } else if (level === 4) {
              // For Level 4: parent is Level 3, we need Level 2 and Level 1
              subCat2 = parentData.parentSubCategory?._id || parentData.parentSubCategory || "";
              
              if (subCat2) {
                const grandParentResponse = await axios.get(`${config.API_URL}/api/subcategories/${subCat2}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                subCat1 = grandParentResponse.data.parentSubCategory?._id || grandParentResponse.data.parentSubCategory || "";
              }
            }
          } catch (err) {
            console.error("Error fetching parent chain:", err);
          }
        }
      }
      
      setFormData({
        name: subCategoryData.name || "",
        description: subCategoryData.description || "",
        seoContent: subCategoryData.seoContent || "",
        metaTitle: subCategoryData.metaTitle || "",
        metaDescription: subCategoryData.metaDescription || "",
        customSchema: subCategoryData.customSchema || "",
        redirectUrl: subCategoryData.redirectUrl || "",
        image: subCategoryData.image || "",
        category: normalizeId(subCategoryData.category),
        subCategory1: subCat1,
        subCategory2: subCat2,
        parentSubCategory: normalizeId(subCategoryData.parentSubCategory),
        level: subCategoryData.level || level,
        isActive: subCategoryData.isActive !== undefined ? subCategoryData.isActive : true,
        sortOrder: subCategoryData.sortOrder || 0,
      });
    } catch (error) {
      showToast("Failed to load subcategory", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If category changes, clear all dependent fields
    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
        subCategory1: "",
        subCategory2: "",
        parentSubCategory: "",
      }));
    } 
    // If subCategory1 changes (Level 3 & 4), clear dependent fields
    else if (name === "subCategory1") {
      setFormData((prev) => ({
        ...prev,
        subCategory1: value,
        subCategory2: "",
        parentSubCategory: "",
      }));
    }
    // If subCategory2 changes (Level 4), clear parent
    else if (name === "subCategory2") {
      setFormData((prev) => ({
        ...prev,
        subCategory2: value,
        parentSubCategory: "",
      }));
    }
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  const handleSeoContentChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      seoContent: content,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      
      // Prepare submission data
      const submitData = {
        ...formData,
        level: level,
        parentSubCategory: level > 1 ? formData.parentSubCategory : undefined
      }

      await axios.put(`${config.API_URL}/api/subcategories/${id}`, submitData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      showToast("Subcategory updated successfully!", "success");
      
      // Navigate to appropriate list page
      if (level === 4) navigate("/admin/subcategories-4")
      else if (level === 3) navigate("/admin/subcategories-3")
      else if (level === 2) navigate("/admin/subcategories-2")
      else navigate("/admin/subcategories")
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update subcategory", "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getBackPath = () => {
    if (level === 4) return "/admin/subcategories-4"
    if (level === 3) return "/admin/subcategories-3"
    if (level === 2) return "/admin/subcategories-2"
    return "/admin/subcategories"
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <button
                onClick={() => navigate(getBackPath())}
                className="hover:text-blue-600 flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Sub Categories {level > 1 ? `Level ${level}` : ''}
              </button>
              <span>/</span>
              <span className="text-gray-900">Edit Sub Category {level > 1 ? level : ''}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Sub Category {level > 1 ? `Level ${level}` : ''}</h1>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter subcategory name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Parent Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Level 1 SubCategory Selection for Level 3 & 4 */}
                {(level === 3 || level === 4) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Level 1 Sub Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subCategory1"
                      value={formData.subCategory1}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!formData.category}
                    >
                      <option value="">Select Level 1 Sub Category</option>
                      {subCategories1.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Level 2 SubCategory Selection for Level 4 */}
                {level === 4 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Level 2 Sub Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subCategory2"
                      value={formData.subCategory2}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!formData.subCategory1}
                    >
                      <option value="">Select Level 2 Sub Category</option>
                      {subCategories2.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {level > 1 && (
                  <div className={level === 4 ? "col-span-2" : ""}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Sub Category (Level {parentLevel}) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="parentSubCategory"
                      value={formData.parentSubCategory}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={
                        (level === 2 && !formData.category) ||
                        (level === 3 && !formData.subCategory1) ||
                        (level === 4 && !formData.subCategory2)
                      }
                    >
                      <option value="">Select Parent Sub Category</option>
                      {parentSubCategories.map((parent) => (
                        <option key={parent._id} value={parent._id}>
                          {parent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter sort order..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subcategory description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Content</label>
                <TipTapEditor
                  content={formData.seoContent}
                  onChange={handleSeoContentChange}
                  placeholder="Enter detailed SEO content for this subcategory..."
                />
                <p className="text-sm text-gray-500 mt-1">This content will be displayed on the subcategory page for SEO purposes.</p>
              </div>

              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                  <span className="text-gray-500 text-xs ml-2">(Up to 100 characters)</span>
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Best Laser Printers in UAE | Grabatoz"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-500">
                    SEO title that appears in search engine results
                  </p>
                  <span className="text-xs text-gray-400">
                    {formData.metaTitle.length}/100
                  </span>
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                  <span className="text-gray-500 text-xs ml-2">(Up to 300 characters)</span>
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={3}
                  maxLength={300}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Discover high-quality laser printers for home and office. Fast printing, energy efficient. Free UAE delivery."
                />
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-500">
                    Description that appears below the title in search results
                  </p>
                  <span className="text-xs text-gray-400">
                    {formData.metaDescription.length}/300
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Schema Markup (HTML/JS)
                </label>
                <textarea
                  name="customSchema"
                  value={formData.customSchema}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder={'<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "CollectionPage",\n  "name": "Sub Category Name"\n}\n</script>'}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Paste schema script/HTML. It is injected into page head for Google and not shown to users.
                </p>
              </div>

              {/* Redirect URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redirect URL
                  <span className="text-gray-500 text-xs ml-2">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="redirectUrl"
                  value={formData.redirectUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., /shop/new-subcategory-name or https://example.com/page"
                />
                <p className="text-sm text-gray-500 mt-1">
                  If set, visitors will be redirected to this URL when accessing this subcategory
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category Image (WebP only)</label>
                <ImageUpload onImageUpload={handleImageUpload} currentImage={formData.image} isProduct={true} />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Active Sub Category</label>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(getBackPath())}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSubCategory;
