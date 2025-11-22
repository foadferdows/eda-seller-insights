
// src/components/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { MetricCard, StatRow } from "./ui/MetricCard";
import { getClassicOverview } from "../services/dk";

export default function Dashboard() {
  const [salesData, setSalesData] = useState<any | null>(null);
  const [pricingData, setPricingData] = useState<any | null>(null);
  const [inventoryData, setInventoryData] = useState<any | null>(null);
  const [portfolioData, setPortfolioData] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await getClassicOverview();
        setSalesData(resp.salesData);
        setPricingData(resp.pricingData);
        setInventoryData(resp.inventoryData);
        setPortfolioData(resp.portfolioData);
      } catch (e: any) {
        console.error("classic overview error:", e);
        setError(e?.message || "Failed to load classic dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="bg-red-900/40 border border-red-700 text-red-200 p-4 rounded-xl">
        {error}
      </div>
    );
  }

  if (loading || !salesData || !pricingData || !inventoryData || !portfolioData) {
    return <div className="text-gray-400 mt-8">Loading dashboard…</div>;
  }

  const fmt = (n: any) => Number(n ?? 0).toLocaleString();

  return (
    <div className="space-y-10 mt-6">
      <h2 className="text-2xl font-semibold">📊 Classic Dashboard</h2>

      {/* Row 1: Sales trend + Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales chart */}
        <MetricCard title="Sales trend (last 6 months)">
          <p className="text-xs text-gray-400 mb-3">
            Total monthly revenue based on your actual sales data.
          </p>
          <div className="flex items-end gap-4 h-40">
            {salesData.labels.map((label: string, i: number) => {
              const value = salesData.series[i];
              const max = Math.max(...salesData.series, 1);
              const height = (value / max) * 100;
              return (
                <div key={label} className="flex-1 flex flex-col items-center">
                  <div className="w-full h-32 bg-gray-900 rounded-lg flex items-end justify-center overflow-hidden">
                    <div
                      className="w-7/12 bg-emerald-500/80 rounded-t-lg"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-300 mt-2">{label}</div>
                  <div className="text-[10px] text-gray-400">{fmt(value)} Toman</div>
                </div>
              );
            })}
          </div>
        </MetricCard>

        {/* Pricing curve */}
        <MetricCard title="Optimal pricing (sample product)">
          <p className="text-xs text-gray-400 mb-3">
            Price–profit curve built from your best-selling product.
          </p>
          <div className="flex items-end gap-4 h-40">
            {pricingData.price_points.map((p: number, i: number) => {
              const v = pricingData.profit_curve[i];
              const max = Math.max(...pricingData.profit_curve, 1);
              const height = (v / max) * 100;
              return (
                <div key={p} className="flex-1 flex flex-col items-center">
                  <div className="w-full h-32 bg-gray-900 rounded-lg flex items-end justify-center">
                    <div
                      className={`w-7/12 ${
                        pricingData.optimal.price === p
                          ? "bg-yellow-400"
                          : "bg-indigo-500/80"
                      } rounded-t-lg`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-300 mt-2">{p}</div>
                  <div className="text-[10px] text-gray-400">{fmt(v)}</div>
                </div>
              );
            })}
          </div>
        </MetricCard>
      </div>

      {/* Row 2: Inventory + Portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory health table */}
        <MetricCard title="Inventory health (coverage days)">
          <p className="text-xs text-gray-400 mb-3">
            SKUs with lowest days of cover based on your real sales & inventory.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-left">
                  <th className="py-2 pr-3">SKU</th>
                  <th className="py-2 pr-3">Days of cover</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.items.map((it: any) => {
                  const color =
                    it.status === "healthy"
                      ? "text-emerald-400"
                      : it.status === "medium"
                      ? "text-yellow-400"
                      : "text-red-400";

                  return (
                    <tr key={it.sku} className="border-b border-gray-800">
                      <td className="py-2 pr-3 text-gray-200">{it.sku}</td>
                      <td className="py-2 pr-3 text-gray-200">
                        {it.days_of_cover}
                      </td>
                      <td className={`py-2 pr-3 font-medium ${color}`}>
                        {it.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </MetricCard>

        {/* Portfolio: category revenue share */}
        <MetricCard title="Category revenue share">
          <p className="text-xs text-gray-400 mb-3">
            Share of each category based on revenue from all your sales.
          </p>

          <div className="flex items-center justify-center h-48 relative">
            {portfolioData.allocation.map((a: any, i: number) => {
              const cumulative = portfolioData.allocation
                .slice(0, i)
                .reduce((s: number, x: any) => s + x.pct, 0);

              return (
                <div
                  key={a.asset}
                  className="absolute w-40 h-40 rounded-full border-4 border-transparent"
                  style={{
                    borderTopColor: `hsl(${i * 60}, 70%, 60%)`,
                    transform: `rotate(${(cumulative / 100) * 360}deg)`,
                  }}
                >
                  <div
                    className="absolute inset-0 border-4 rounded-full border-transparent"
                    style={{
                      borderTopColor: `hsl(${i * 60}, 70%, 60%)`,
                      transform: `rotate(${(a.pct / 100) * 360}deg)`,
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="text-xs text-gray-300 mt-3 space-y-1">
            {portfolioData.allocation.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: `hsl(${i * 60}, 70%, 60%)` }}
                ></span>
                {a.asset} — {a.pct}%
              </div>
            ))}
          </div>
        </MetricCard>
      </div>
    </div>
  );
}

// // src/components/Dashboard.tsx


// import React, { useEffect, useState } from "react";
// import { MetricCard, StatRow } from "./ui/MetricCard";
// import {
//   getProducts,
//   getRevenueForecast,
//   getProfitMargin,
//   getSlowMovers,
//   getRestockTime,
//   type ProductSummary,
// } from "../services/dk";
// import type { ProfitMargin, SlowMovers } from "../types/insights";

// type AnyObj = Record<string, any>;

// export default function Dashboard() {
//   const [products, setProducts] = useState<ProductSummary[]>([]);
//   const [selectedSku, setSelectedSku] = useState<string | null>(null);

//   const [revenue, setRevenue] = useState<AnyObj | null>(null);
//   const [profit, setProfit] = useState<ProfitMargin | null>(null);
//   const [slow, setSlow] = useState<SlowMovers | null>(null);
//   const [restock, setRestock] = useState<AnyObj | null>(null);

//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Load product list first
//   useEffect(() => {
//     (async () => {
//       try {
//         setError(null);
//         const list = await getProducts();
//         setProducts(list);
//         if (list.length > 0) {
//           setSelectedSku(String(list[0].product_id));
//         }
//       } catch (e: any) {
//         console.error("getProducts error:", e);
//         setError(e?.message || "Failed to load products");
//       }
//     })();
//   }, []);

//   // Load classic metrics for selected product
//   useEffect(() => {
//     if (!selectedSku) return;

//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const [r, p, s, rs] = await Promise.all([
//           getRevenueForecast(selectedSku),
//           getProfitMargin(selectedSku),
//           getSlowMovers(selectedSku),
//           getRestockTime(selectedSku),
//         ]);

//         setRevenue(r);
//         setProfit(p);
//         setSlow(s);
//         setRestock(rs);
//       } catch (e: any) {
//         console.error("Classic dashboard error:", e);
//         setError(e?.message || "Failed to load classic dashboard data");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [selectedSku]);

//   const fmt = (n: number | null | undefined) =>
//     (n ?? 0).toLocaleString();

//   const selectedProduct = products.find(
//     (p) => String(p.product_id) === String(selectedSku)
//   );

//   // Fake small “portfolio” view based on slow vs non-slow products
//   const slowCount = slow?.items?.length ?? 0;
//   const totalProducts = products.length || 1;
//   const slowPct = (slowCount / totalProducts) * 100;
//   const healthyPct = 100 - slowPct;

//   const salesBars = (() => {
//     const vals = [
//       revenue?.last_month_revenue ?? 0,
//       revenue?.so_far_revenue ?? 0,
//       revenue?.forecast_revenue ?? 0,
//     ];
//     const max = Math.max(...vals, 1);
//     const labels = ["Last month", "This month (so far)", "Next month (forecast)"];
//     return vals.map((v, i) => ({
//       label: labels[i],
//       value: v,
//       height: (v / max) * 100,
//     }));
//   })();

//   if (error) {
//     return (
//       <div className="mt-4">
//         <div className="bg-red-900/40 border border-red-700 text-red-100 text-sm rounded-2xl px-4 py-3">
//           <div className="font-semibold mb-1">Data error</div>
//           <div className="break-all">{error}</div>
//         </div>
//       </div>
//     );
//   }

//   if (loading || !selectedSku || !profit || !revenue || !restock || !slow) {
//     return (
//       <div className="space-y-6 mt-8">
//         <div className="flex justify-between items-center">
//           <div className="h-6 w-48 bg-gray-800 rounded" />
//           <div className="h-8 w-64 bg-gray-800 rounded" />
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//           {Array.from({ length: 4 }).map((_, i) => (
//             <div
//               key={i}
//               className="bg-gray-800 p-4 rounded-2xl border border-gray-700 animate-pulse"
//             >
//               <div className="h-4 w-1/2 bg-gray-700 rounded mb-4" />
//               <div className="space-y-2">
//                 <div className="h-3 bg-gray-700 rounded w-5/6" />
//                 <div className="h-3 bg-gray-700 rounded w-2/3" />
//                 <div className="h-3 bg-gray-700 rounded w-4/5" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 mt-8">
//       {/* Header + product selector */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//         <div>
//           <h2 className="text-2xl font-semibold">📊 Classic dashboard</h2>
//           {selectedProduct && (
//             <p className="text-sm text-gray-400 mt-1">
//               Focus product: {selectedProduct.title} (ID: {selectedProduct.product_id})
//             </p>
//           )}
//         </div>

//         <div className="flex items-center gap-2 text-sm">
//           <span className="text-gray-400">Select product:</span>
//           <select
//             className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
//             value={selectedSku}
//             onChange={(e) => setSelectedSku(e.target.value)}
//           >
//             {products.map((p) => (
//               <option key={p.product_id} value={p.product_id}>
//                 {p.title} (ID: {p.product_id})
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Top charts */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Sales forecast */}
//         <MetricCard title="Sales & revenue forecast">
//           <p className="text-xs text-gray-400 mb-3">
//             How your revenue evolves from last month to this month and next month,
//             based on current trend.
//           </p>
//           <div className="h-40 flex items-end gap-4">
//             {salesBars.map((b) => (
//               <div key={b.label} className="flex-1 flex flex-col items-center">
//                 <div className="relative w-full h-32 bg-gray-900 rounded-xl flex items-end justify-center overflow-hidden">
//                   <div
//                     className="w-7/12 bg-emerald-500/80 rounded-t-xl"
//                     style={{ height: `${b.height}%` }}
//                   />
//                 </div>
//                 <div className="mt-2 text-[11px] text-gray-300 text-center">
//                   {b.label}
//                 </div>
//                 <div className="text-[11px] text-gray-400">
//                   {fmt(b.value)} Toman
//                 </div>
//               </div>
//             ))}
//           </div>
//         </MetricCard>

//         {/* Restock vs stockout */}
//         <MetricCard title="Inventory & restock risk">
//           <p className="text-xs text-gray-400 mb-3">
//             Stock coverage and risk of stockout for this product.
//           </p>

//           <StatRow
//             label="Daily sales average"
//             value={restock?.daily_sales_avg ?? 0}
//           />
//           <StatRow
//             label="Current stock"
//             value={restock?.current_stock ?? 0}
//           />
//           <StatRow
//             label="Projected days to stockout"
//             value={restock?.days_to_stockout ?? 0}
//           />
//           <StatRow
//             label="Supplier lead time (days)"
//             value={restock?.supplier_lead_time_days ?? "-"}
//           />
//           <StatRow
//             label="Recommended order qty"
//             value={restock?.recommended_order_qty ?? 0}
//           />

//           <div className="mt-3">
//             <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
//               <span>Coverage vs lead time</span>
//               <span>
//                 {restock?.days_to_stockout ?? 0} days /{" "}
//                 {restock?.supplier_lead_time_days ?? "-"} days
//               </span>
//             </div>
//             {/* simple gauge */}
//             <div className="w-full h-3 rounded-full bg-gray-900 overflow-hidden">
//               {(() => {
//                 const days = restock?.days_to_stockout ?? 0;
//                 const lead = restock?.supplier_lead_time_days ?? 1;
//                 const ratio = Math.max(0, Math.min(1, days / (lead * 2)));
//                 const color =
//                   ratio < 0.6
//                     ? "bg-red-500"
//                     : ratio < 1
//                     ? "bg-yellow-500"
//                     : "bg-emerald-500";
//                 return (
//                   <div
//                     className={`h-full ${color}`}
//                     style={{ width: `${ratio * 100}%` }}
//                   />
//                 );
//               })()}
//             </div>
//             <div className="mt-2 text-xs text-gray-400">
//               {restock?.recommendation_text ??
//                 "Based on current sales and stock, risk level is estimated above."}
//             </div>
//           </div>
//         </MetricCard>
//       </div>

//       {/* Bottom row: inventory table + pricing / portfolio */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Inventory table from slow movers */}
//         <MetricCard title="Inventory health (slow vs healthy)">
//           <p className="text-xs text-gray-400 mb-3">
//             Items flagged as slow-movers based on your thresholds.
//           </p>
//           <div className="overflow-x-auto">
//             <table className="w-full text-xs">
//               <thead>
//                 <tr className="text-gray-400 text-left border-b border-gray-700">
//                   <th className="py-2 pr-4">SKU</th>
//                   <th className="py-2 pr-4">Title</th>
//                   <th className="py-2 pr-4">Weekly sales</th>
//                   <th className="py-2 pr-4">Margin %</th>
//                   <th className="py-2 pr-4">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(slow.items ?? []).slice(0, 5).map((it) => {
//                   const margin = it.margin_pct ?? 0;
//                   const weekly = it.weekly_sales ?? 0;
//                   const status =
//                     weekly === 0 || margin < slow.thresholds.min_margin_pct
//                       ? "at risk"
//                       : weekly < slow.thresholds.min_weekly_sales
//                       ? "slow"
//                       : "healthy";
//                   const color =
//                     status === "healthy"
//                       ? "text-emerald-400"
//                       : status === "slow"
//                       ? "text-yellow-400"
//                       : "text-red-400";
//                   return (
//                     <tr
//                       key={it.sku ?? it.product_id}
//                       className="border-b border-gray-800 last:border-0"
//                     >
//                       <td className="py-2 pr-4 text-gray-200">
//                         {it.sku ?? it.product_id ?? "-"}
//                       </td>
//                       <td className="py-2 pr-4 text-gray-300">
//                         {it.title ?? "-"}
//                       </td>
//                       <td className="py-2 pr-4 text-gray-200">
//                         {weekly}
//                       </td>
//                       <td className="py-2 pr-4 text-gray-200">
//                         {margin.toFixed(1)}%
//                       </td>
//                       <td className={`py-2 pr-4 font-medium ${color}`}>
//                         {status}
//                       </td>
//                     </tr>
//                   );
//                 })}
//                 {(!slow.items || slow.items.length === 0) && (
//                   <tr>
//                     <td
//                       colSpan={5}
//                       className="py-3 text-center text-gray-400"
//                     >
//                       No slow-mover items detected based on current thresholds.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </MetricCard>

//         {/* Pricing + simple "portfolio" view */}
//         <MetricCard title="Pricing & product mix overview">
//           <p className="text-xs text-gray-400 mb-3">
//             Key pricing metrics for this product and share of slow vs healthy
//             items in your catalog.
//           </p>

//           {/* Pricing stats */}
//           <div className="mb-4">
//             <div className="text-[11px] text-gray-400 mb-1">
//               Pricing snapshot (selected product)
//             </div>
//             <div className="grid grid-cols-2 gap-3 text-sm">
//               <StatRow
//                 label="Selling price"
//                 value={`${fmt(profit.price)} Toman`}
//               />
//               <StatRow
//                 label="Buy price"
//                 value={`${fmt(profit.buy_price)} Toman`}
//               />
//               <StatRow
//                 label="Commission %"
//                 value={`${profit.commission_pct ?? 0}%`}
//               />
//               <StatRow
//                 label="Profit margin"
//                 value={`${profit.margin_pct ?? 0}%`}
//               />
//             </div>
//           </div>

//           {/* Mix “chart” */}
//           <div className="mt-2">
//             <div className="text-[11px] text-gray-400 mb-2">
//               Catalog mix (slow-movers vs others)
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="flex-1 h-3 rounded-full bg-gray-900 overflow-hidden flex">
//                 <div
//                   className="h-full bg-red-500/80"
//                   style={{ width: `${slowPct}%` }}
//                 />
//                 <div
//                   className="h-full bg-emerald-500/80"
//                   style={{ width: `${healthyPct}%` }}
//                 />
//               </div>
//               <div className="text-xs text-gray-400 whitespace-nowrap">
//                 {slowCount} slow / {totalProducts} total
//               </div>
//             </div>
//             <div className="mt-2 flex items-center gap-4 text-[11px] text-gray-400">
//               <div className="flex items-center gap-1">
//                 <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
//                 <span>Slow-movers</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
//                 <span>Healthy / normal</span>
//               </div>
//             </div>
//           </div>
//         </MetricCard>
//       </div>
//     </div>
//   );
// }
