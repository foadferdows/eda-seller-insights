// App.tsx
import React, { useState } from "react";
import SellerLogin from "./pages/SellerLogin";
import SellerProfile from "./pages/SellerProfile";
import InsightsDashboard from "./pages/InsightsDashboard";
import Dashboard from "./components/Dashboard"; // اگر فعلاً نمی‌خواهی، این و استفاده‌اش را حذف کن
import { getJwt } from "./services/api";

type Tab = "profile" | "insights" | "classic";

export default function App() {
  const [jwt, setJwt] = useState<string | null>(getJwt());
  const [activeTab, setActiveTab] = useState<Tab>("insights");

  const handleLoginSuccess = () => {
    setJwt(getJwt());
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setJwt(null);
  };

  if (!jwt) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="w-full max-w-md bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
          <h1 className="text-2xl font-bold mb-6 text-center">
            🔗 ورود به EDA برای سلر دیجی‌کالا
          </h1>
          <SellerLogin onSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <span>📊 EDA – Economic Decision Assistant</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400">
              تحلیل اقتصادی برای فروشندگان دیجی‌کالا (نسخه دمو / Mock Data)
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm"
          >
            خروج
          </button>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4 flex gap-2 overflow-x-auto">
            <TabButton
              label="پروفایل فروشنده"
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
            <TabButton
              label="داشبورد اینسایت‌ها"
              active={activeTab === "insights"}
              onClick={() => setActiveTab("insights")}
            />
            <TabButton
              label="داشبورد کلاسیک (چارت‌ها)"
              active={activeTab === "classic"}
              onClick={() => setActiveTab("classic")}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <SellerProfile />
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-6">
            <SellerProfile />
            <InsightsDashboard />
          </div>
        )}

        {activeTab === "classic" && (
          <div className="space-y-6">
            <SellerProfile />
            <Dashboard />
          </div>
        )}
      </main>
    </div>
  );
}

type TabButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 md:px-4 py-2 text-sm md:text-[13px] border-b-2 -mb-px transition " +
        (active
          ? "border-emerald-400 text-emerald-300"
          : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600")
      }
    >
      {label}
    </button>
  );
}

