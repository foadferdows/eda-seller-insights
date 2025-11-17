import React from "react";
import { salesData, pricingData, inventoryData, portfolioData } from "../services/mockData";

import SalesForecastChart from "./charts/SalesForecastChart";
import OptimalPricingChart from "./charts/OptimalPricingChart";
import InventoryAnalysisChart from "./charts/InventoryAnalysisChart";
import PortfolioChart from "./charts/PortfolioChart";

const Box: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
    <h3 className="text-lg font-medium mb-3 text-gray-200">{title}</h3>
    {children}
  </div>
);

const Table: React.FC<{ headers: string[]; rows: (string | number | React.ReactNode)[][] }> = ({ headers, rows }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="bg-gray-700">
          {headers.map((h) => (
            <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td className="px-3 py-4 text-gray-400" colSpan={headers.length}>No data</td></tr>
        ) : (
          rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-700 hover:bg-gray-800/60">
              {r.map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default function Dashboard() {
  // جدول‌ها
  const inventoryRows = (inventoryData.items ?? []).map((it: any) => [
    it?.sku ?? "—",
    it?.days_of_cover ?? "—",
    <span className={
      it?.status === "low" ? "text-red-400" :
      it?.status === "healthy" ? "text-green-400" : "text-yellow-300"
    }>{it?.status ?? "unknown"}</span>
  ]);

  const pricingRows = (pricingData.price_points ?? []).map((p: number, i: number) => [
    p ?? "—",
    pricingData.profit_curve?.[i] ?? "—",
    pricingData.optimal?.price === p ? "✅" : ""
  ]);

  const salesRows = (salesData.labels ?? []).map((label: string, i: number) => [
    label ?? "—",
    salesData.series?.[i] ?? "—"
  ]);

  const portfolioRows = (portfolioData.allocation ?? []).map((a: any) => [
    a?.asset ?? "—",
    a?.pct ?? "—"
  ]);

  return (
    <div className="space-y-10">
      {/* چارت‌ها */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">نمودارهای تحلیلی</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Box title="📈 پیش‌بینی فروش">
            <SalesForecastChart data={salesData} />
          </Box>
          <Box title="💰 قیمت‌گذاری بهینه">
            <OptimalPricingChart data={pricingData} />
          </Box>
          <Box title="🏬 تحلیل موجودی">
            <InventoryAnalysisChart data={inventoryData} />
          </Box>
          <Box title="💼 پورتفولیو سرمایه‌گذاری">
            <PortfolioChart data={portfolioData} />
          </Box>
        </div>
      </section>

      {/* جدول‌ها */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">جداول داده‌ها</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Box title="🏬 Inventory">
            <Table headers={["SKU", "Days of Cover", "Status"]} rows={inventoryRows} />
          </Box>
          <Box title="💰 Optimal Pricing">
            <Table headers={["Price", "Profit", "Optimal"]} rows={pricingRows} />
          </Box>
          <Box title="📈 Sales Forecast">
            <Table headers={["Month", "Forecast"]} rows={salesRows} />
          </Box>
          <Box title="💼 Portfolio Allocation">
            <Table headers={["Asset", "Allocation (%)"]} rows={portfolioRows} />
          </Box>
        </div>
      </section>
    </div>
  );
}

