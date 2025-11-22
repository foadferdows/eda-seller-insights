import React from "react";

export type Tab = "profile" | "insights" | "classic" | "settings";

interface AppLayoutProps {
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const tabs: { id: Tab; label: string }[] = [
  { id: "profile",  label: "Profile" },
  { id: "insights", label: "Insights Dashboard" },
  { id: "classic",  label: "Classic Dashboard" },
  { id: "settings", label: "Settings" },
];

export default function AppLayout({
  activeTab,
  onChangeTab,
  onLogout,
  children,
}: AppLayoutProps) {
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
              Demo version · Economic insights for Digikala sellers
            </p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4 flex gap-2 overflow-x-auto">
            {tabs.map((t) => (
              <TabButton
                key={t.id}
                label={t.label}
                active={activeTab === t.id}
                onClick={() => onChangeTab(t.id)}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

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

// import React from "react";

// export type Tab = "profile" | "insights" | "classic" | "settings";

// interface AppLayoutProps {
//   activeTab: Tab;
//   onChangeTab: (tab: Tab) => void;
//   onLogout: () => void;
//   children: React.ReactNode;
// }

// const tabs: { id: Tab; label: string }[] = [
//   { id: "profile",  label: "Profile" },
//   { id: "insights", label: "Insights Dashboard" },
//   { id: "classic",  label: "Classic Dashboard" },
//   { id: "settings", label: "Settings" },
// ];

// export default function AppLayout({
//   activeTab,
//   onChangeTab,
//   onLogout,
//   children,
// }: AppLayoutProps) {
//   return (
//     <div className="min-h-screen bg-gray-900 text-gray-100">
//       {/* Header */}
//       <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
//         <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
//           <div>
//             <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
//               <span>📊 EDA – Economic Decision Assistant</span>
//             </h1>
//             <p className="text-xs md:text-sm text-gray-400">
//               نسخه دمو | تحلیل اقتصادی برای فروشندگان دیجی‌کالا
//             </p>
//           </div>
//           <button
//             onClick={onLogout}
//             className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm"
//           >
//             خروج
//           </button>
//         </div>

//         {/* Tabs */}
//         <div className="border-t border-gray-800">
//           <div className="max-w-6xl mx-auto px-4 flex gap-2 overflow-x-auto">
//             {tabs.map((t) => (
//               <TabButton
//                 key={t.id}
//                 label={t.label}
//                 active={activeTab === t.id}
//                 onClick={() => onChangeTab(t.id)}
//               />
//             ))}
//           </div>
//         </div>
//       </header>

//       {/* Main content */}
//       <main className="max-w-6xl mx-auto px-4 py-8">
//         {children}
//       </main>
//     </div>
//   );
// }

// interface TabButtonProps {
//   label: string;
//   active: boolean;
//   onClick: () => void;
// }

// function TabButton({ label, active, onClick }: TabButtonProps) {
//   return (
//     <button
//       onClick={onClick}
//       className={
//         "px-3 md:px-4 py-2 text-sm md:text-[13px] border-b-2 -mb-px transition " +
//         (active
//           ? "border-emerald-400 text-emerald-300"
//           : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600")
//       }
//     >
//       {label}
//     </button>
//   );
// }

