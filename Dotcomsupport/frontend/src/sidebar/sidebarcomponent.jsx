import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  Activity,
  ShoppingCart,
  Package,
  AlertCircle,
  BarChart2,
  Menu,
  ChevronLeft,
  LogOut
} from "lucide-react";

export const Sidebar = ({ collapsed, setCollapsed, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard" },
    { id: "users", label: "Users", icon: Users, path: "/users" },
    { id: "customers", label: "Customers", icon: Activity, path: "/customers" },
    { id: "products", label: "Products", icon: Package, path: "/products" },
    { id: "sales", label: "Sales", icon: ShoppingCart, path: "/sales" },
    { id: "support", label: "Support Tickets", icon: AlertCircle, path: "/support" },
    { id: "brands", label: "Brands", icon: BarChart2, path: "/brands" },
    { id: "warranty", label: "Warranty", icon: FileText, path: "/warranty" },
    
  ];

  return (
    <div
      className={`bg-teal-700 text-white h-screen fixed top-0 left-0 transition-all duration-300 flex flex-col z-50 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-teal-600">
        {!collapsed && <h1 className="text-lg font-bold">Siru Vai</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-teal-600 rounded transition-colors"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-2 mt-2">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
              location.pathname === item.path ? "bg-teal-600" : "hover:bg-teal-600"
            }`}
          >
            <item.icon size={20} />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-teal-600">
        <button
          onClick={onLogout}
          className="flex items-center w-full p-2 hover:bg-red-600 rounded cursor-pointer text-left transition-colors"
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-teal-600 text-sm text-center">
        {!collapsed && "© 2025 Siru Vai"}
      </div>
    </div>
  );
};
