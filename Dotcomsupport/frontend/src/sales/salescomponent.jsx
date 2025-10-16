import React, { useState, useEffect } from "react";

const SALES_ADD_URL = "http://localhost:5000/siruvai/sales/add";
const SALES_URL = "http://localhost:5000/siruvai/sales";
const CUSTOMERS_URL = "http://localhost:5000/siruvai/customers";
const PRODUCTS_URL = "http://localhost:5000/siruvai/products";

const SalesComponent = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [activeTab, setActiveTab] = useState("add");
  const [saleData, setSaleData] = useState({
    bill_no: "",
    sale_date: new Date().toISOString().split('T')[0],
    customer_id: "",
    items: [{ product_id: "", quantity: "", unit_price: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSale, setExpandedSale] = useState(null);
  const [salesFilter, setSalesFilter] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchSales();
  }, []);

  const fetchCustomers = () => {
    fetch(CUSTOMERS_URL)
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error("Error fetching customers:", err));
  };

  const fetchProducts = () => {
    fetch(PRODUCTS_URL)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  };

  const fetchSales = () => {
    fetch(SALES_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSales(data);
        } else if (data.sales && Array.isArray(data.sales)) {
          setSales(data.sales);
        } else {
          console.error("Unexpected sales data format:", data);
          setSales([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching sales:", err);
        setSales([]);
      });
  };

  const handleChange = (e) => {
    setSaleData({ ...saleData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...saleData.items];
    newItems[index][field] = value;
    setSaleData({ ...saleData, items: newItems });
  };

  const addItemRow = () => {
    setSaleData({
      ...saleData,
      items: [...saleData.items, { product_id: "", quantity: "", unit_price: "" }],
    });
  };

  const removeItemRow = (index) => {
    if (saleData.items.length === 1) {
      setError("At least one item is required");
      return;
    }
    const newItems = saleData.items.filter((_, i) => i !== index);
    setSaleData({ ...saleData, items: newItems });
  };

  const calculateTotal = () => {
    return saleData.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + qty * price;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!saleData.bill_no.trim() || !saleData.sale_date || !saleData.customer_id) {
      setError("All fields are required.");
      return;
    }

    for (const item of saleData.items) {
      if (!item.product_id || !item.quantity || !item.unit_price) {
        setError("All sale item fields are required.");
        return;
      }
    }

    const totalAmount = calculateTotal();

    if (totalAmount <= 0) {
      setError("Total amount must be greater than 0.");
      return;
    }

    const payload = {
      bill_no: saleData.bill_no,
      sale_date: saleData.sale_date,
      total_amount: totalAmount,
      customer_id: parseInt(saleData.customer_id),
      items: saleData.items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
      })),
    };

    setLoading(true);
    try {
      const res = await fetch(SALES_ADD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Sale added successfully!");
        setSaleData({
          bill_no: "",
          sale_date: new Date().toISOString().split('T')[0],
          customer_id: "",
          items: [{ product_id: "", quantity: "", unit_price: "" }],
        });
        fetchSales();
        setActiveTab("view");
      } else {
        setError(data.error || "Failed to add sale.");
      }
    } catch (err) {
      console.error("Error adding sale:", err);
      setError("Error adding sale. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandSale = (saleId) => {
    setExpandedSale(expandedSale === saleId ? null : saleId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Sales Management</h1>

      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("add")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "add"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Add Sale
        </button>
        <button
          onClick={() => setActiveTab("view")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "view"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          View Sales ({sales.length})
        </button>
      </div>

      {activeTab === "add" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Add Sale Form */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bill Number *</label>
                <input
                  type="text"
                  name="bill_no"
                  placeholder="INV-20251017-01"
                  value={saleData.bill_no}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sale Date *</label>
                <input
                  type="date"
                  name="sale_date"
                  value={saleData.sale_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer *</label>
                <select
                  name="customer_id"
                  value={saleData.customer_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.name || c.customer_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-3">Sale Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">Quantity</th>
                      <th className="text-left p-2">Unit Price</th>
                      <th className="text-left p-2">Subtotal</th>
                      <th className="text-left p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleData.items.map((item, index) => {
                      const subtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            <select
                              value={item.product_id}
                              onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="">Select Product</option>
                              {products.map((p) => (
                                <option key={p.product_id} value={p.product_id}>
                                  {p.product_name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                              min="1"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              placeholder="Price"
                              value={item.unit_price}
                              onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                              step="0.01"
                              min="0"
                            />
                          </td>
                          <td className="p-2 font-semibold">{formatCurrency(subtotal)}</td>
                          <td className="p-2">
                            <button
                              type="button"
                              onClick={() => removeItemRow(index)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                              disabled={saleData.items.length === 1}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={addItemRow}
                className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
              >
                + Add Item
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total Amount:</span>
                <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Submitting..." : "Submit Sale"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "view" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Sales History</h2>
            <button
              onClick={fetchSales}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Date Filter */}
          <div className="flex gap-4 mb-4 items-center">
            <div>
              <label className="text-sm font-medium">Start Date:</label>
              <input
                type="date"
                value={salesFilter.start}
                onChange={(e) => setSalesFilter(prev => ({ ...prev, start: e.target.value }))}
                className="border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date:</label>
              <input
                type="date"
                value={salesFilter.end}
                onChange={(e) => setSalesFilter(prev => ({ ...prev, end: e.target.value }))}
                className="border px-2 py-1 rounded"
              />
            </div>
            <button
              onClick={() => setSalesFilter({ start: "", end: "" })}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              Reset
            </button>
          </div>

          {sales.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No sales found</p>
              <button
                onClick={() => setActiveTab("add")}
                className="mt-4 text-blue-500 hover:underline"
              >
                Add your first sale
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sales
                .filter((sale) => {
                  const saleDate = new Date(sale.sale_date);
                  const startDate = salesFilter.start ? new Date(salesFilter.start) : null;
                  const endDate = salesFilter.end ? new Date(salesFilter.end) : null;
                  if (startDate && saleDate < startDate) return false;
                  if (endDate && saleDate > endDate) return false;
                  return true;
                })
                .map((sale) => (
                  <div key={sale.sale_id} className="border rounded-lg overflow-hidden">
                    <div
                      className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleExpandSale(sale.sale_id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-lg">{sale.bill_no}</span>
                            <span className="text-gray-600">{formatDate(sale.sale_date)}</span>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {sale.customer_name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-xl text-green-600">
                            {formatCurrency(sale.total_amount)}
                          </span>
                          <span className="text-gray-400">
                            {expandedSale === sale.sale_id ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {expandedSale === sale.sale_id && sale.items && Array.isArray(sale.items) && sale.items.length > 0 && (
                      <div className="p-4 bg-white border-t">
                        <h4 className="font-semibold mb-3">Items:</h4>
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="text-left p-2">Product</th>
                              <th className="text-right p-2">Quantity</th>
                              <th className="text-right p-2">Unit Price</th>
                              <th className="text-right p-2">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sale.items.map((item, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="p-2">{item.product_name || `Product #${item.product_id}`}</td>
                                <td className="p-2 text-right">{item.quantity}</td>
                                <td className="p-2 text-right">{formatCurrency(item.unit_price)}</td>
                                <td className="p-2 text-right font-semibold">
                                  {formatCurrency(item.quantity * item.unit_price)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50 font-bold">
                              <td colSpan="3" className="p-2 text-right">Total:</td>
                              <td className="p-2 text-right text-green-600">
                                {formatCurrency(sale.total_amount)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesComponent;
