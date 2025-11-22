import React, { useState } from "react";
import SellerLogin from "./pages/SellerLogin";
import SellerProfile from "./pages/SellerProfile";
import InsightsDashboard from "./pages/InsightsDashboard";
import Dashboard from "./components/Dashboard"; // اگر فعلاً لازم نیست می‌توانی حذفش کنی
import { getJwt } from "./services/api";
import AppLayout, { Tab } from "./components/layout/AppLayout";
import Settings from "./pages/Settings";

export default function App() {
  const [jwt, setJwt] = useState<string | null>(getJwt());
  const [activeTab, setActiveTab] = useState<Tab>("insights");

  const handleLoginSuccess = () => {
    setJwt(getJwt());
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    } catch {}
    setJwt(null);
  };

  // صفحه لاگین
  if (!jwt) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="w-full max-w-md bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
          <h1 className="text-2xl font-bold mb-6 text-center">
          Make us your financial assistant.
                   </h1>
          <SellerLogin onSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  // بعد از لاگین
  // return (
  //   <AppLayout
  //     activeTab={activeTab}
  //     onChangeTab={setActiveTab}
  //     onLogout={handleLogout}
  //   >
  //     {activeTab === "profile" && (
  //       <div className="space-y-6">
  //         <SellerProfile />
  //       </div>
  //     )}

  //     {activeTab === "insights" && (
  //       <div className="space-y-6">
  //         <SellerProfile />
  //         <InsightsDashboard />
  //       </div>
  //     )}

  //     {activeTab === "classic" && (
  //       <div className="space-y-6">
  //         <SellerProfile />
  //         <Dashboard />
  //       </div>
  //     )}

  //     {activeTab === "settings" && (
  //       <div className="space-y-6">
  //         <Settings />
  //       </div>
  //     )}

  //   </AppLayout>
  // );


    // بعد از لاگین
    return (
      <AppLayout
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onLogout={handleLogout}
      >
        {activeTab === "profile" && (
          <div className="space-y-6">
            <SellerProfile />
          </div>
        )}
  
        {activeTab === "insights" && (
          <div className="space-y-6">
            <InsightsDashboard />
          </div>
        )}
  
        {activeTab === "classic" && (
          <div className="space-y-6">
            <Dashboard />
          </div>
        )}
  
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Settings />
          </div>
        )}
      </AppLayout>
    );
  }
  

