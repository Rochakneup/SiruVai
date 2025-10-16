import React, { useState, useEffect } from "react";
import { Plus, Package, Search } from "lucide-react";

const ADD_URL = "http://localhost:5000/siruvai/brands/add";
const GET_URL = "http://localhost:5000/siruvai/brands";

const BrandManager = () => {
  const [brands, setBrands] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBrands = async () => {
    try {
      const res = await fetch(GET_URL);
      const data = await res.json();
      setBrands(data);
    } catch (err) {
      console.error("Error fetching brands:", err);
      setError("Failed to fetch brands");
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleAddBrand = async () => {
    if (!brandName.trim()) {
      setError("Brand name cannot be empty");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(ADD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_name: brandName }),
      });

      const data = await res.json();

      if (res.ok) {
        setBrandName("");
        setSuccess("Brand added successfully!");
        fetchBrands();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to add brand");
      }
    } catch (err) {
      console.error("Error adding brand:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddBrand();
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Brands</h1>
          </div>
          
        </div>

        {/* Add Brand Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Brand</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter brand name..."
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-grow px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <button
                onClick={handleAddBrand}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                {loading ? "Adding..." : "Add Brand"}
              </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-xl">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Brand List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              All Brands ({brands.length})
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors w-64"
              />
            </div>
          </div>

          {filteredBrands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 transition-all hover:shadow-md group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-800 text-lg">
                      {brand.brand_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">
                {searchTerm ? "No brands match your search" : "No brands found. Add your first brand!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandManager;