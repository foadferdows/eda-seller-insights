import React from "react";
import * as mock from "../services/mockData";

const Box: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
    <h3 className="text-lg font-medium mb-3 text-gray-200">{title}</h3>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

const Table: React.FC<{ headers: string[]; rows: (string | number | React.ReactNode)[][] }> = ({ headers, rows }) => (
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
);

const Dashboard: React.FC = () => {
  // محافظ‌ها: اگر exportها نبودند، به آرایه خالی برگرد
  const inventoryItems = Array.isArray(mock?.inventoryData?.items) ? mock.inventoryData.items : [];
  const pricePoints   = Array.isArray(mock?.pricingData?.price_points) ? mock.pricingData.price_points : [];
  const profitCurve   = Array.isArray(mock?.pricingData?.profit_curve) ? mock.pricingData.profit_curve : [];
  const optimalPrice  = mock?.pricingData?.optimal?.price;
  const salesLabels   = Array.isArray(mock?.salesData?.labels) ? mock.salesData.labels : [];
  const salesSeries   = Array.isArray(mock?.salesData?.series) ? mock.salesData.series : [];
  const allocations   = Array.isArray(mock?.portfolioData?.allocation) ? mock.portfolioData.allocation : [];

  // لاگ تشخیصی در DevTools
  console.log("[Dashboard] shapes:", {
    inventoryItems: inventoryItems.length,
    pricePoints: pricePoints.length,
    profitCurve: profitCurve.length,
    salesLabels: salesLabels.length,
    salesSeries: salesSeries.length,
    allocations: allocations.length,
  });

  const inventoryRows = inventoryItems.map((it: any) => [
    it?.sku ?? "—",
    it?.days_of_cover ?? "—",
    <span className={
      it?.status === "low" ? "text-red-400" :
      it?.status === "healthy" ? "text-green-400" : "text-yellow-300"
    }>{it?.status ?? "unknown"}</span>
  ]);

  const pricingRows = pricePoints.map((p: number, i: number) => [
    p ?? "—",
    profitCurve[i] ?? "—",
    optimalPrice === p ? "✅" : ""
  ]);

  const salesRows = salesLabels.map((label: string, i: number) => [
    label ?? "—",
    salesSeries[i] ?? "—"
  ]);

  const portfolioRows = allocations.map((a: any) => [
    a?.asset ?? "—",
    a?.pct ?? "—"
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-semibold mb-4">جداول داده‌ها (Mock)</h2>
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
};

export default Dashboard;

