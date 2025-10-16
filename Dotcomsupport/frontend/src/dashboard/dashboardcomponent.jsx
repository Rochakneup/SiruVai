import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, FileText, Activity, Package, Headphones, TrendingUp, DollarSign, ShoppingCart,
  IndianRupeeIcon
} from "lucide-react";
import { Sidebar } from "../sidebar/sidebarcomponent";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area
} from "recharts";

// Helper to format date
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    salesCount: 0,
    products: 0,
    tickets: 0,
    revenue: 0,
    customers: 0
  });

  const [salesData, setSalesData] = useState([]);
  const [ticketsData, setTicketsData] = useState([]);
  const [salesFilter, setSalesFilter] = useState({ start: "", end: "" });
  const [ticketsFilter, setTicketsFilter] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);

  // Fetch APIs
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, salesRes, productsRes, ticketsRes] = await Promise.all([
        fetch("http://localhost:5000/siruvai/users"),
        fetch("http://localhost:5000/siruvai/sales"),
        fetch("http://localhost:5000/siruvai/products"),
        fetch("http://localhost:5000/siruvai/support/view")
      ]);

      const users = await usersRes.json();
      const sales = await salesRes.json();
      const products = await productsRes.json();
      const tickets = await ticketsRes.json();

      // Calculate total revenue
      let totalRevenue = 0;
      const flattenedSales = [];
      
      sales.sales?.forEach(sale => {
        sale.items.forEach(item => {
          const amount = item.unit_price * item.quantity;
          totalRevenue += amount;
          flattenedSales.push({
            date: formatDate(sale.sale_date),
            amount: amount
          });
        });
      });

      setStats({
        users: Array.isArray(users) ? users.length : 0,
        salesCount: sales?.count || 0,
        products: Array.isArray(products) ? products.length : 0,
        tickets: Array.isArray(tickets) ? tickets.length : 0,
        revenue: totalRevenue,
        customers: Array.isArray(users) ? users.filter(u => u.role === 'customer').length : 0
      });

      // Aggregate sales by date
      const salesByDate = {};
      flattenedSales.forEach(sale => {
        if (salesByDate[sale.date]) {
          salesByDate[sale.date] += sale.amount;
        } else {
          salesByDate[sale.date] = sale.amount;
        }
      });

      const aggregatedSales = Object.keys(salesByDate).map(date => ({
        date,
        amount: salesByDate[date]
      })).sort((a, b) => new Date(a.date) - new Date(b.date));

      setSalesData(aggregatedSales);

      // Prepare Support Tickets Pie Chart by status
      const statusCounts = {};
      tickets.forEach(ticket => {
        const status = ticket.status || "unknown";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const pieData = Object.keys(statusCounts).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: statusCounts[key]
      }));
      setTicketsData(pieData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const StatCard = ({ icon: Icon, value, label, color, gradient, trend, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 ${color} transform hover:-translate-y-1 cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
            <Icon size={28} className="text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
          </h3>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          {trend && (
            <div className="flex items-center mt-2 text-xs">
              <TrendingUp size={14} className="text-green-500 mr-1" />
              <span className="text-green-500 font-semibold">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const filterSalesData = () => {
    return salesData.filter(d => {
      const date = new Date(d.date);
      const start = salesFilter.start ? new Date(salesFilter.start) : null;
      const end = salesFilter.end ? new Date(salesFilter.end) : null;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-8 text-white shadow-xl">
          <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-teal-100 text-lg">Welcome back! Here's what's happening with your business today.</p>
          <div className="mt-4 text-sm text-teal-100">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            value={stats.users}
            label="Total Users"
            color="border-blue-500"
            gradient="from-blue-500 to-blue-600"
            trend="+12.5%"
            onClick={() => navigate('/users')}
          />
          <StatCard
            icon={ShoppingCart}
            value={stats.salesCount}
            label="Total Sales"
            color="border-green-500"
            gradient="from-green-500 to-green-600"
            trend="+8.2%"
            onClick={() => navigate('/sales')}
          />
          <StatCard
            icon={Package}
            value={stats.products}
            label="Total Products"
            color="border-purple-500"
            gradient="from-purple-500 to-purple-600"
            trend="+5.7%"
            onClick={() => navigate('/products')}
          />
          <StatCard
            icon={Headphones}
            value={stats.tickets}
            label="Support Tickets"
            color="border-orange-500"
            gradient="from-orange-500 to-orange-600"
            onClick={() => navigate('/support')}
          />
        </div>

        {/* Revenue and Customers Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            icon={IndianRupeeIcon}
            value={`RS${stats.revenue.toLocaleString()}`}
            label="Total Revenue"
            color="border-teal-500"
            gradient="from-teal-500 to-teal-600"
            trend="+15.3%"
          />
          <StatCard
            icon={Activity}
            value={stats.customers}
            label="Total Customers"
            color="border-indigo-500"
            gradient="from-indigo-500 to-indigo-600"
            trend="+9.8%"
            onClick={() => navigate('/customers')}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Support Tickets Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Support Tickets Status</h2>
              <button 
                onClick={() => navigate('/support')}
                className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
              >
                View All →
              </button>
            </div>
            <div className="flex gap-3 mb-4 flex-wrap">
              <input
                type="date"
                value={ticketsFilter.start}
                onChange={(e) => setTicketsFilter(prev => ({ ...prev, start: e.target.value }))}
                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={ticketsFilter.end}
                onChange={(e) => setTicketsFilter(prev => ({ ...prev, end: e.target.value }))}
                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="End Date"
              />
            </div>
            {ticketsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ticketsData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#14b8a6"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {ticketsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No ticket data available
              </div>
            )}
          </div>

          {/* Sales Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Sales Overview</h2>
              <button 
                onClick={() => navigate('/sales')}
                className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
              >
                View All →
              </button>
            </div>
            <div className="flex gap-3 mb-4 flex-wrap">
              <input
                type="date"
                value={salesFilter.start}
                onChange={(e) => setSalesFilter(prev => ({ ...prev, start: e.target.value }))}
                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={salesFilter.end}
                onChange={(e) => setSalesFilter(prev => ({ ...prev, end: e.target.value }))}
                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="End Date"
              />
            </div>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={filterSalesData()}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => ['$' + value.toLocaleString(), 'Amount']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#14b8a6" 
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No sales data available
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/users')}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all transform hover:scale-105 text-left"
            >
              <Users className="text-blue-600 mb-2" size={24} />
              <div className="font-semibold text-gray-800">Manage Users</div>
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all transform hover:scale-105 text-left"
            >
              <Package className="text-purple-600 mb-2" size={24} />
              <div className="font-semibold text-gray-800">View Products</div>
            </button>
            <button 
              onClick={() => navigate('/sales')}
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all transform hover:scale-105 text-left"
            >
              <ShoppingCart className="text-green-600 mb-2" size={24} />
              <div className="font-semibold text-gray-800">View Sales</div>
            </button>
            <button 
              onClick={() => navigate('/support')}
              className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-lg transition-all transform hover:scale-105 text-left"
            >
              <Headphones className="text-orange-600 mb-2" size={24} />
              <div className="font-semibold text-gray-800">Support Tickets</div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
};

export default Dashboard;