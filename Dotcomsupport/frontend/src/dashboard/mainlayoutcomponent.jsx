import React, { useState } from "react";
import { Sidebar } from "../sidebar/sidebarcomponent";

const MainLayout = ({ children, user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} onLogout={onLogout} />
      <main 
        className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 ${
          collapsed ? "ml-16" : "ml-60"
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;