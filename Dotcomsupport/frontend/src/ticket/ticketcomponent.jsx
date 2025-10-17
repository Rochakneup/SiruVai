import React, { useEffect, useState } from "react";
import axios from "axios";

const TicketsManager = () => {
  const API_TICKETS = "http://localhost:5000/siruvai/support";
  const API_CUSTOMERS = "http://localhost:5000/siruvai/customers";
  const API_PRODUCTS = "http://localhost:5000/siruvai/products";
  const API_USERS = "http://localhost:5000/siruvai/users";
  const API_SALES = "http://localhost:5000/siruvai/sales";

  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    customer_id: "",
    product_id: "",
    sale_id: "",
    assigned_to: "",
    issue_title: "",
    issue_description: "",
    status: "open",
    priority: "medium",
    response_text: "",
  });

  // Fetch everything
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cust, prod, usr, sale, tck] = await Promise.all([
          axios.get(API_CUSTOMERS),
          axios.get(API_PRODUCTS),
          axios.get(API_USERS),
          axios.get(API_SALES),
          axios.get(`${API_TICKETS}/view`),
        ]);

        setCustomers(Array.isArray(cust.data) ? cust.data : []);
        setProducts(Array.isArray(prod.data) ? prod.data : []);
        setUsers(Array.isArray(usr.data) ? usr.data : []);
        setSales(Array.isArray(sale.data?.sales) ? sale.data.sales : sale.data);
        setTickets(Array.isArray(tck.data) ? tck.data : []);
      } catch (err) {
        console.error("Error loading:", err);
        setError("Error fetching data. Check backend & console logs.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTicketId) {
        await axios.put(`${API_TICKETS}/update/${editingTicketId}`, formData);
      } else {
        await axios.post(`${API_TICKETS}/add`, formData);
      }
      setEditingTicketId(null);
      resetForm();
      const res = await axios.get(`${API_TICKETS}/view`);
      setTickets(res.data);
    } catch (err) {
      alert("Error saving ticket: " + (err.response?.data?.error || err.message));
    }
  };

  const resetForm = () =>
    setFormData({
      customer_id: "",
      product_id: "",
      sale_id: "",
      assigned_to: "",
      issue_title: "",
      issue_description: "",
      status: "open",
      priority: "medium",
      response_text: "",
    });

  const handleEdit = (ticket) => {
    setEditingTicketId(ticket.ticket_id);
    setFormData({
      customer_id: ticket.customer_id,
      product_id: ticket.product_id,
      sale_id: ticket.sale_id,
      assigned_to: ticket.assigned_to || "",
      issue_title: ticket.issue_title,
      issue_description: ticket.issue_description,
      status: ticket.status,
      priority: ticket.priority,
      response_text: ticket.response_text || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;
    await axios.delete(`${API_TICKETS}/delete/${id}`);
    setTickets((prev) => prev.filter((t) => t.ticket_id !== id));
  };

  // Filter tickets by status
  const filteredTickets = statusFilter === "all" 
    ? tickets 
    : tickets.filter(t => t.status === statusFilter);

  // Export to Excel (CSV format)
  const exportToExcel = () => {
    const headers = [
      "Ticket No",
      "Customer",
      "Product",
      "Sale",
      "Issue Title",
      "Issue Description",
      "Response",
      "Status",
      "Priority",
      "Assigned To",
      "Created At"
    ];

    const rows = filteredTickets.map(t => [
      t.ticket_no || "",
      t.customer_name || t.customer_id || "",
      t.product_name || t.product_id || "",
      t.bill_no || t.sale_id || "",
      t.issue_title || "",
      t.issue_description || "",
      t.response_text || "",
      t.status || "",
      t.priority || "",
      t.assigned_to 
        ? users.find((u) => u.user_id === t.assigned_to)?.full_name || "Unknown"
        : "Unassigned",
      t.created_at ? new Date(t.created_at).toLocaleString() : ""
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tickets_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-4">Loading data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Support Tickets</h1>

      {/* Tickets Table - Now at Top */}
      <div className="mb-6 bg-white rounded shadow">
        {/* Filter and Export Controls */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <label className="font-medium">Filter by Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <span className="text-gray-600 ml-4">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </span>
          </div>
          <button 
            onClick={exportToExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Export to Excel</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Ticket No</th>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Product</th>
                <th className="border p-2">Sale</th>
                <th className="border p-2">Issue</th>
                <th className="border p-2">Response</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Priority</th>
                <th className="border p-2">Assigned To</th>
                <th className="border p-2">Created</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center text-gray-500 p-4">
                    {statusFilter === "all" 
                      ? "No tickets yet." 
                      : `No ${statusFilter.replace('_', ' ')} tickets.`}
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.ticket_id}>
                    <td className="border p-2">{t.ticket_no}</td>
                    <td className="border p-2">{t.customer_name || t.customer_id}</td>
                    <td className="border p-2">{t.product_name || t.product_id}</td>
                    <td className="border p-2">{t.bill_no || t.sale_id}</td>
                    <td className="border p-2">{t.issue_title}</td>
                    <td className="border p-2 text-gray-700">
                      {t.response_text || <span className="italic text-gray-400">—</span>}
                    </td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        t.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        t.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        t.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        t.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        t.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        t.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="border p-2">
                      {t.assigned_to
                        ? users.find((u) => u.user_id === t.assigned_to)?.full_name || "Unknown"
                        : "Unassigned"}
                    </td>
                    <td className="border p-2">
                      {t.created_at ? new Date(t.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="border p-2 space-x-2">
                      <button onClick={() => handleEdit(t)} className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(t.ticket_id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Form - Now at Bottom */}
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow space-y-2 bg-white">
        <h2 className="text-xl font-semibold">
          {editingTicketId ? "Edit Ticket" : "Add Ticket"}
        </h2>

        {/* Customer */}
        <div>
          <label className="block text-sm font-medium mb-1">Customer</label>
          <select name="customer_id" value={formData.customer_id} onChange={handleChange} required className="border p-2 w-full">
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div>
          <label className="block text-sm font-medium mb-1">Product</label>
          <select name="product_id" value={formData.product_id} onChange={handleChange} required className="border p-2 w-full">
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
            ))}
          </select>
        </div>

        {/* Sale */}
        <div>
          <label className="block text-sm font-medium mb-1">Sale</label>
          <select name="sale_id" value={formData.sale_id} onChange={handleChange} required className="border p-2 w-full">
            <option value="">Select Sale</option>
            {sales.map((s) => (
              <option key={s.sale_id} value={s.sale_id}>
                Bill: {s.bill_no} - {s.name || s.customer_name}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium mb-1">Assign To</label>
          <select name="assigned_to" value={formData.assigned_to} onChange={handleChange} className="border p-2 w-full">
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.full_name || u.username}
              </option>
            ))}
          </select>
        </div>

        {/* Issue Title & Description */}
        <input
          type="text"
          name="issue_title"
          value={formData.issue_title}
          onChange={handleChange}
          placeholder="Issue Title"
          required
          className="border p-2 w-full"
        />
        <textarea
          name="issue_description"
          value={formData.issue_description}
          onChange={handleChange}
          placeholder="Describe the issue"
          className="border p-2 w-full"
          rows="3"
        />

        {/* Response Field */}
        <textarea
          name="response_text"
          value={formData.response_text}
          onChange={handleChange}
          placeholder="Response (optional)"
          className="border p-2 w-full"
          rows="2"
        />

        {/* Status / Priority */}
        <div className="flex space-x-2">
          <select name="status" value={formData.status} onChange={handleChange} className="border p-2 w-1/2">
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select name="priority" value={formData.priority} onChange={handleChange} className="border p-2 w-1/2">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex space-x-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            {editingTicketId ? "Update Ticket" : "Add Ticket"}
          </button>
          {editingTicketId && (
            <button type="button" onClick={() => { setEditingTicketId(null); resetForm(); }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TicketsManager;