import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login/logincomponent";
import MainLayout from "./dashboard/mainlayoutcomponent";
import BrandManager from "./brand/brandscomponent"; 
import CustomerManager from "./customers/customerscomponent";
import ProductManager from "./products/productscomponent";
import SalesManager from "./sales/salescomponent";
import UsersManager  from "./user/usercomponetn";
import TicketsManager from "./ticket/ticketcomponent";
import WarrantyManager from "./warranty/warrantycomponent";
import Dashboard from "./dashboard/dashboardcomponent";

function App() { 
  // Initialize user from localStorage for persistent login
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login onLoginSuccess={setUser} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <MainLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/brands" element={<BrandManager />} />
          <Route path="/customers" element={<CustomerManager />} />
          <Route path="/products" element={<ProductManager />} />
          <Route path="/sales" element={<SalesManager />} />
          <Route path="/users" element={<UsersManager />} />
          <Route path="/support" element={<TicketsManager />} />
          <Route path="/warranty" element={<WarrantyManager />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
