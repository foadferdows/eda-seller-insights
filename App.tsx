// src/App.tsx
import React, { useState } from "react";
import SellerLogin from "./pages/SellerLogin";
import SellerProfile from "./pages/SellerProfile";
import InsightsDashboard from "./pages/InsightsDashboard";
import { getJwt } from "./services/api";

export default function App() {
  const [jwt, setJwt] = useState<string | null>(getJwt());

  const handleLoginSuccess = () => {
    // بعد از موفقیت در لاگین، توکن در localStorage ذخیره شده
    setJwt(getJwt());
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setJwt(null);
  };

  // اگر هنوز لاگین نشده
  if (!jwt) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-6 text-center">
          🔗 ورود با توکن دیجی‌کالا
        </h1>
        <SellerLogin onSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // بعد از لاگین
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      {/* هدر */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          📊 داشبورد فروشنده دیجی‌کالا
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm"
        >
          خروج
        </button>
      </div>

      {/* پروفایل فروشنده از /dk/profile/ */}
      <div className="mb-8">
        <SellerProfile />
      </div>

      {/* داشبورد اینسایت‌ها از /insights/... */}
      <InsightsDashboard />
    </div>
  );
}

