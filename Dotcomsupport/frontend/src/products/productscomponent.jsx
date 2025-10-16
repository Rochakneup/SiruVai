import React, { useState, useEffect } from "react";
import { Package, Plus, Search, Box, Tag, Hash } from "lucide-react";

const ADD_URL = "http://localhost:5000/siruvai/products/add";
const GET_URL = "http://localhost:5000/siruvai/products";
const BRANDS_URL = "http://localhost:5000/siruvai/brands";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    product_name: "",
    model_no: "",
    serial_no: "",
    brand_name: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(GET_URL);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch(BRANDS_URL);
      const data = await res.json();
      setBrands(data);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleAddProduct = async () => {
    const { product_name, model_no, serial_no, brand_name } = formData;

    if (!product_name.trim() || !brand_name) {
      setError("Product name and brand are required.");
      return;
    }

    setLoading(true);
    try {
      const selectedBrand = brands.find((b) => b.brand_name === brand_name);
      if (!selectedBrand) {
        setError("Invalid brand selected.");
        setLoading(false);
        return;
      }

      const payload = {
        product_name: product_name.trim(),
        model_no: model_no.trim(),
        serial_no: serial_no.trim(),
        brand_name
      };

      const res = await fetch(ADD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setFormData({ product_name: "", model_no: "", serial_no: "", brand_name: "" });
        setSuccessMessage("Product added successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchProducts();
      } else {
        setError(data.error || "Failed to add product.");
      }
    } catch (err) {
      console.error("Error adding product:", err);
      setError("Error adding product. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddProduct();
    }
  };

  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.model_no && p.model_no.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Products 
          </h1>
        </div>

        {/* Add Product Form */}
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Add New Product</h2>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Box className="w-4 h-4" />
                  Product Name *
                </label>
                <input
                  type="text"
                  name="product_name"
                  placeholder="Enter product name"
                  value={formData.product_name}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Model Number
                </label>
                <input
                  type="text"
                  name="model_no"
                  placeholder="Enter model number"
                  value={formData.model_no}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Serial Number
                </label>
                <input
                  type="text"
                  name="serial_no"
                  placeholder="Enter serial number"
                  value={formData.serial_no}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Brand *
                </label>
                <select
                  name="brand_name"
                  value={formData.brand_name || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="">Select a brand</option>
                  {brands.map((b, index) => (
                    <option key={index} value={b.brand_name}>
                      {b.brand_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleAddProduct}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {loading ? "Adding..." : "Add Product"}
              </button>
              
              {error && (
                <div className="flex-1 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="flex-1 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm">
                  {successMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Products Inventory</h2>
                <p className="text-sm text-gray-500">{filteredProducts.length} products found</p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-full md:w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p, i) => (
                <div
                  key={p.id ?? i}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition">
                      <Box className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 text-lg mb-3 line-clamp-2">
                    {p.product_name}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium w-16">Model:</span>
                      <span className="text-gray-700">{p.model_no || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium w-16">Serial:</span>
                      <span className="text-gray-700">{p.serial_no || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <Tag className="w-4 h-4 text-indigo-600" />
                      <span className="text-indigo-600 font-medium text-sm">{p.brand_name}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-1">Add your first product to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;