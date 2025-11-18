import React from "react";

export const MetricCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
    <h3 className="text-lg font-semibold mb-3 text-gray-100">{title}</h3>
    {children}
  </div>
);

export const StatRow: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <div className="flex justify-between text-sm py-1">
    <span className="text-gray-400">{label}</span>
    <span className="text-gray-100 font-medium">{value}</span>
  </div>
);

