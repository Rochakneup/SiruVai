import React, { useState, useEffect } from "react";
import { Plus, Users, Search, Mail, Phone, MapPin, User, Download } from "lucide-react";
import * as XLSX from 'xlsx';

const ADD_URL = "http://localhost:5000/siruvai/customers/add";
const GET_URL = "http://localhost:5000/siruvai/customers";

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    address: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await fetch(GET_URL);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to fetch customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCustomer = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(ADD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({ name: "", phone_no: "", address: "", email: "" });
        setSuccess("Customer added successfully!");
        fetchCustomers();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to add customer");
      }
    } catch (err) {
      console.error("Error adding customer:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredCustomers.map((customer, index) => ({
      'No.': index + 1,
      'Name': customer.name,
      'Email': customer.email,
      'Phone': customer.phone_no || 'N/A',
      'Address': customer.address || 'N/A',
      'Customer ID': customer.id
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 5 },  // No.
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 40 }, // Address
      { wch: 12 }  // Customer ID
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `Customers_${date}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone_no.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-600 p-3 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Customers</h1>
          </div>
         
        </div>

        {/* Add Customer Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Customer</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="phone_no"
                  placeholder="Phone Number"
                  value={formData.phone_no}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleAddCustomer}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              {loading ? "Adding Customer..." : "Add Customer"}
            </button>

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

        {/* Customer List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              All Customers ({customers.length})
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors w-full sm:w-64"
                />
              </div>
              <button
                onClick={exportToExcel}
                disabled={filteredCustomers.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <Download className="w-5 h-5" />
                Export to Excel
              </button>
            </div>
          </div>

          {filteredCustomers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-800 text-lg">{customer.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-2 ml-11">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                    {customer.phone_no && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{customer.phone_no}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{customer.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">
                {searchTerm ? "No customers match your search" : "No customers found. Add your first customer!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerManager;