import React, { useState, useEffect } from 'react';
import { Upload, Calendar, FileText, User, Package, AlertCircle, CheckCircle, X, ShoppingCart, Search, Filter } from 'lucide-react';

const WarrantyManagement = () => {
  const [warranties, setWarranties] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    sale_item_id: '',
    customer_id: '',
    product_id: '',
    warranty_start_date: '',
    warranty_end_date: '',
    warranty_card_no: '',
    warranty_image: null
  });

  const [searchTerms, setSearchTerms] = useState({
    customer: '',
    product: '',
    sale: ''
  });

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    fetchWarranties();
    fetchCustomers();
    fetchProducts();
    fetchSales();
  }, []);

  useEffect(() => {
    if (formData.customer_id) {
      const customerSales = sales.filter(sale => sale.customer_id === parseInt(formData.customer_id));
      setFilteredSales(customerSales);
    } else {
      setFilteredSales(sales);
    }
  }, [formData.customer_id, sales]);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/siruvai/warranty`);
      if (!response.ok) throw new Error('Failed to fetch warranties');
      const data = await response.json();
      setWarranties(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE}/siruvai/customers`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/siruvai/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await fetch(`${API_BASE}/siruvai/sales`);
      if (!response.ok) throw new Error('Failed to fetch sales');
      const data = await response.json();
      const salesArray = Array.isArray(data.sales) ? data.sales : [];
      setSales(salesArray);
      setFilteredSales(salesArray);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setSales([]);
      setFilteredSales([]);
    }
  };

  const flattenSalesItems = () => {
    const items = [];
    sales.forEach(sale => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach(item => {
          items.push({
            sale_id: sale.sale_id,
            sale_item_id: item.sale_item_id,
            bill_no: sale.bill_no,
            sale_date: sale.sale_date,
            customer_id: sale.customer_id,
            product_id: item.product_id,
            product_name: item.product_name
          });
        });
      }
    });
    return items;
  };

  const getBillNo = (saleItemId) => {
    const saleItem = flattenSalesItems().find(item => item.sale_item_id === saleItemId);
    return saleItem ? saleItem.bill_no : `Sale #${saleItemId}`;
  };

  const searchFilteredSales = Array.isArray(filteredSales)
    ? flattenSalesItems().filter(s =>
        `${s.sale_item_id} ${s.bill_no} ${s.sale_date} ${s.product_name}`
          .toLowerCase()
          .includes(searchTerms.sale.toLowerCase())
      )
    : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'sale_item_id') {
      const selectedSale = flattenSalesItems().find(s => s.sale_item_id === parseInt(value));
      if (selectedSale) {
        setFormData(prev => ({
          ...prev,
          customer_id: selectedSale.customer_id || '',
          product_id: selectedSale.product_id || ''
        }));
      }
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchTerms(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, warranty_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!formData.sale_item_id || !formData.customer_id || !formData.product_id || 
        !formData.warranty_start_date || !formData.warranty_end_date || 
        !formData.warranty_card_no || !formData.warranty_image) {
      setError('Please fill in all required fields');
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) submitData.append(key, formData[key]);
    });

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/siruvai/warranty/add`, {
        method: 'POST',
        body: submitData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create warranty card');
      }

      const newWarranty = await response.json();
      setWarranties(prev => [newWarranty, ...prev]);
      setSuccess('Warranty card created successfully!');
      resetForm();
      setTimeout(() => {
        setShowForm(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sale_item_id: '',
      customer_id: '',
      product_id: '',
      warranty_start_date: '',
      warranty_end_date: '',
      warranty_card_no: '',
      warranty_image: null
    });
    setImagePreview(null);
    setSearchTerms({ customer: '', product: '', sale: '' });
  };

  const getWarrantyStatus = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { status: 'Expired', color: 'text-red-600', bgColor: 'bg-red-100', filterValue: 'expired' };
    if (daysLeft <= 30) return { status: 'Expiring Soon', color: 'text-orange-600', bgColor: 'bg-orange-100', filterValue: 'expiring' };
    return { status: 'Active', color: 'text-green-600', bgColor: 'bg-green-100', filterValue: 'active' };
  };

  const getCustomerName = (id) => {
    const customer = customers.find(c => c.id === id || c.customer_id === id);
    return customer ? `${customer.first_name || customer.name || ''} ${customer.last_name || ''}`.trim() : `Customer ${id}`;
  };

  const getProductName = (id) => {
    const product = products.find(p => p.id === id || p.product_id === id);
    return product ? product.name || product.product_name || `Product ${id}` : `Product ${id}`;
  };

  const filteredCustomers = Array.isArray(customers)
    ? customers.filter(c =>
        `${c.first_name || c.name || ''} ${c.last_name || ''} ${c.email || ''} ${c.phone || ''}`
          .toLowerCase()
          .includes(searchTerms.customer.toLowerCase())
      )
    : [];

  const filteredProducts = Array.isArray(products)
    ? products.filter(p =>
        `${p.name || p.product_name || ''} ${p.brand || ''} ${p.model || ''}`
          .toLowerCase()
          .includes(searchTerms.product.toLowerCase())
      )
    : [];

  // Filter warranties by status and customer name
  const filteredWarranties = warranties.filter(warranty => {
    const status = getWarrantyStatus(warranty.warranty_end_date);
    const matchesStatus = statusFilter === 'all' || status.filterValue === statusFilter;
    
    const customerName = getCustomerName(warranty.customer_id).toLowerCase();
    const matchesCustomer = customerName.includes(customerSearchQuery.toLowerCase());
    
    return matchesStatus && matchesCustomer;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <FileText className="text-blue-600" size={32} />
              Add Warranty Cards
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2 font-semibold"
          >
            {showForm ? <X size={20} /> : <Upload size={20} />}
            {showForm ? 'Cancel' : 'Add Warranty Card'}
          </button>
        </div>

        {/* Error & Success */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto"><X size={20} className="text-red-600" /></button>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Warranty Card</h2>
            <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Customer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="customer"
                    value={searchTerms.customer}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                    placeholder="Search customers..."
                  />
                </div>
                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Customer</option>
                  {filteredCustomers.map(customer => (
                    <option key={customer.id || customer.customer_id} value={customer.id || customer.customer_id}>
                      {customer.first_name || customer.name} {customer.last_name || ''} - {customer.email || customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sale / Invoice */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sale / Invoice <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="sale"
                    value={searchTerms.sale}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                    placeholder="Search sales..."
                  />
                </div>
                <select
                  name="sale_item_id"
                  value={formData.sale_item_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Sale</option>
                  {searchFilteredSales.map((sale) => (
                    <option key={sale.sale_item_id} value={sale.sale_item_id}>
                      Sale #{sale.sale_id} - {sale.bill_no} - {new Date(sale.sale_date).toLocaleDateString()} - {sale.product_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="product"
                    value={searchTerms.product}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                    placeholder="Search products..."
                  />
                </div>
                <select
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product.id || product.product_id} value={product.id || product.product_id}>
                      {product.name || product.product_name} - {product.brand || ''} {product.model || ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warranty Card No */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Warranty Card No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="warranty_card_no"
                  value={formData.warranty_card_no}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter warranty card number"
                />
              </div>

              {/* Warranty Dates */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Warranty Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="warranty_start_date"
                  value={formData.warranty_start_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Warranty End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="warranty_end_date"
                  value={formData.warranty_end_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Warranty Image */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Warranty Card Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="warranty-image"
                  />
                  <label htmlFor="warranty-image" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                        <p className="text-sm text-slate-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="mx-auto text-slate-400" size={48} />
                        <p className="text-slate-600">Click to upload warranty card image</p>
                        <p className="text-sm text-slate-500">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Warranty Card'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Warranty Cards Display */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-800">List of Warranty Cards</h2>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Customer Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  placeholder="Search by customer name..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="relative flex-1 sm:flex-initial">
                <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-48 pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4 text-sm text-slate-600">
            Showing {filteredWarranties.length} of {warranties.length} warranty cards
          </div>
          
          {loading && !warranties.length ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading warranties...</p>
            </div>
          ) : filteredWarranties.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-slate-300" size={64} />
              <p className="text-slate-600 mt-4">
                {warranties.length === 0 
                  ? 'No warranty cards found' 
                  : 'No warranty cards match your filters'}
              </p>
              {(statusFilter !== 'all' || customerSearchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setCustomerSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarranties.map((warranty) => {
                const status = getWarrantyStatus(warranty.warranty_end_date);
                return (
                  <div key={warranty.warranty_id} className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bgColor} ${status.color}`}>
                        {status.status}
                      </div>
                      <span className="text-xs text-slate-500 font-mono">#{warranty.warranty_card_no}</span>
                    </div>
                    
                    {warranty.warranty_card_image && (
                      <img
                        src={`${API_BASE}/${warranty.warranty_card_image}`}
                        alt="Warranty Card"
                        className="w-full h-48 object-cover rounded-lg mb-3 border border-slate-200"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-700">
                        <User size={16} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate font-medium">{getCustomerName(warranty.customer_id)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Package size={16} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{getProductName(warranty.product_id)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <ShoppingCart size={16} className="text-slate-400 flex-shrink-0" />
                        <span>Bill No: {getBillNo(warranty.sale_item_id)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                        <span>{new Date(warranty.warranty_start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                        <span>{new Date(warranty.warranty_end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarrantyManagement;