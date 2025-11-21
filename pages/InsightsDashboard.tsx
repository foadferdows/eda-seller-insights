// src/pages/InsightsDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  getProducts,
  getProfitMargin,
  getSlowMovers,
  getBreakeven,
  getGoldenTimes,
  getRevenueForecast,
  getDiscountCompetition,
  getRestockTime,
  getSpeedCompare,
  getCommentAnalysis,
  type ProductSummary,
} from "../services/dk";

import { MetricCard, StatRow } from "../components/ui/MetricCard";
import type { ProfitMargin, SlowMovers } from "../types/insights";

type AnyObj = Record<string, any>;

export default function InsightsDashboard() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  const [profit, setProfit] = useState<ProfitMargin | null>(null);
  const [slow, setSlow] = useState<SlowMovers | null>(null);
  const [breakeven, setBreakeven] = useState<AnyObj | null>(null);
  const [golden, setGolden] = useState<AnyObj | null>(null);
  const [revenue, setRevenue] = useState<AnyObj | null>(null);
  const [discount, setDiscount] = useState<AnyObj | null>(null);
  const [restock, setRestock] = useState<AnyObj | null>(null);
  const [speed, setSpeed] = useState<AnyObj | null>(null);
  const [comments, setComments] = useState<AnyObj | null>(null);

  const [error, setError] = useState<string | null>(null);

  // ۱) گرفتن لیست محصولات
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const list = await getProducts();
        setProducts(list);
        if (list.length > 0) {
          setSelectedSku(String(list[0].product_id));
        }
      } catch (e: any) {
        console.error("getProducts error:", e);
        setError(e?.message || "خطا در دریافت لیست محصولات");
      }
    })();
  }, []);

  // ۲) گرفتن اینسایت‌ها براساس محصول انتخاب‌شده
  useEffect(() => {
    if (!selectedSku) return;

    (async () => {
      try {
        setError(null);
        setProfit(null);
        setSlow(null);
        setBreakeven(null);
        setGolden(null);
        setRevenue(null);
        setDiscount(null);
        setRestock(null);
        setSpeed(null);
        setComments(null);

        const [p, s, b, g, r, d, rs, sp, c] = await Promise.all([
          getProfitMargin(selectedSku),
          getSlowMovers(selectedSku),
          getBreakeven(selectedSku),
          getGoldenTimes(selectedSku),
          getRevenueForecast(selectedSku),
          getDiscountCompetition(selectedSku),
          getRestockTime(selectedSku),
          getSpeedCompare(selectedSku),
          getCommentAnalysis(selectedSku),
        ]);

        setProfit(p);
        setSlow(s);
        setBreakeven(b);
        setGolden(g);
        setRevenue(r);
        setDiscount(d);
        setRestock(rs);
        setSpeed(sp);
        setComments(c);
      } catch (e: any) {
        console.error("Insights error:", e);
        setError(e?.message || "خطا در دریافت داده‌های تحلیلی");
      }
    })();
  }, [selectedSku]);

  if (error) {
    return (
      <div className="mt-4">
        <div className="bg-red-900/40 border border-red-700 text-red-100 text-sm rounded-2xl px-4 py-3">
          <div className="font-semibold mb-1">خطا در داده‌ها</div>
          <div className="break-all">{error}</div>
        </div>
      </div>
    );
  }

  // اسکلت تا وقتی همه‌ی اینسایت‌های اصلی برسند
  if (
    !selectedSku ||
    !profit ||
    !slow ||
    !breakeven ||
    !golden ||
    !revenue ||
    !discount ||
    !restock ||
    !speed ||
    !comments
  ) {
    return (
      <div className="space-y-6 mt-8">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-gray-800 rounded" />
          <div className="h-8 w-64 bg-gray-800 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 p-4 rounded-2xl border border-gray-700 animate-pulse"
            >
              <div className="h-4 w-1/2 bg-gray-700 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded w-5/6" />
                <div className="h-3 bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-700 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const selectedProduct = products.find(
    (p) => String(p.product_id) === String(selectedSku)
  );

  const fmt = (n: number | null | undefined) =>
    (n ?? 0).toLocaleString();

  return (
    <div className="space-y-8 mt-8">
      {/* هدر + انتخاب محصول */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">🔍 تحلیل‌های هوشمند (Data)</h2>
          {selectedProduct && (
            <p className="text-sm text-gray-400 mt-1">
              {selectedProduct.title} (ID: {selectedProduct.product_id})
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">محصول انتخاب‌شده:</span>
          <select
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
            value={selectedSku}
            onChange={(e) => setSelectedSku(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.title} (ID: {p.product_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* کارت‌های اینسایت */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* 1. Real profit margin */}
        <MetricCard title="Real profit margin after commission">
          <StatRow
            label="Product"
            value={
              selectedProduct
                ? `${selectedProduct.title} (ID: ${selectedProduct.product_id})`
                : profit.title ?? "-"
            }
          />
          <StatRow
            label="Category"
            value={selectedProduct?.category ?? profit.category ?? "-"}
          />
          <StatRow
            label="Brand"
            value={selectedProduct?.brand ?? profit.brand ?? "-"}
          />
          <StatRow
            label="Selling price"
            value={`${fmt(profit.price)} Toman`}
          />
          <StatRow
            label="Commission"
            value={`${profit.commission_pct ?? 0}%`}
          />
          <StatRow
            label="Buy price"
            value={`${fmt(profit.buy_price)} Toman`}
          />
          <StatRow
            label="Other costs"
            value={`${fmt(profit.other_costs)} Toman`}
          />
          <StatRow
            label="Net profit"
            value={`${fmt(profit.net_profit)} Toman`}
          />
          <StatRow
            label="Profit margin"
            value={`${profit.margin_pct ?? 0}%`}
          />
        </MetricCard>


        {/* 2. Slow-moving products + exit recommendation */}
        <MetricCard title="Slow-moving products & exit recommendation">
          {(slow.items ?? []).map((it) => (
            <div
              key={it.sku ?? it.product_id}
              className="mb-3 border-b border-gray-700 pb-2 last:border-0 last:pb-0"
            >
              <div className="font-medium mb-1">
                {it.title ?? "Unnamed product"}
              </div>

              <StatRow
                label="SKU"
                value={it.sku ?? it.product_id ?? "-"}
              />

              <StatRow
                label="Profit margin"
                value={`${it.margin_pct ?? 0}%`}
              />

              <StatRow
                label="Weekly sales"
                value={it.weekly_sales ?? 0}
              />

              <StatRow
                label="Profitability index"
                value={it.profitability_index ?? 0}
              />

              <StatRow
                label="Stock"
                value={it.stock ?? 0}
              />

              <StatRow
                label="Recommendation"
                value={
                  it.recommendation === "remove"
                    ? "Remove from catalog"
                    : it.recommendation === "discount"
                    ? "Discount/Promotion suggested"
                    : it.recommendation ?? "-"
                }
              />

              <div className="text-xs text-gray-400 mt-1">
                {it.reason
                  ? it.reason
                  : "Low sales speed and weak profit margin detected."}
              </div>
            </div>
          ))}
        </MetricCard>



        {/* 3. Breakeven point for selected product */}
        <MetricCard title="Breakeven point for this product">
          <StatRow
            label="Product"
            value={
              breakeven?.title ??
              selectedProduct?.title ??
              "-"
            }
          />
          <StatRow
            label="Selling price"
            value={`${fmt(breakeven?.price)} Toman`}
          />
          <StatRow
            label="Fixed costs (allocated)"
            value={`${fmt(breakeven?.fixed_costs)} Toman`}
          />
          <StatRow
            label="Variable cost / unit"
            value={`${fmt(breakeven?.variable_cost)} Toman`}
          />
          <StatRow
            label="Units to breakeven"
            value={breakeven?.breakeven_units ?? 0}
          />
          <StatRow
            label="Units sold (period)"
            value={breakeven?.current_sold_units ?? 0}
          />
          <StatRow
            label="Progress towards breakeven"
            value={`${breakeven?.progress_pct ?? 0}%`}
          />
        </MetricCard>


        {/* 5. زمان‌های طلایی فروش */}
        <MetricCard title="زمان‌های طلایی فروش">
          <StatRow label="نام محصول" value={golden?.title ?? "-"} />
          <StatRow
            label="بهترین ساعات"
            value={(golden?.best_hours || []).join(" ، ")}
          />
          <StatRow
            label="بهترین روزها"
            value={(golden?.best_days || []).join(" ، ")}
          />
          <div className="mt-3 text-xs text-gray-400">
            نمونه نقاط اوج:
            <ul className="list-disc list-inside mt-1">
              {(golden?.heatmap || []).map((h: AnyObj, i: number) => (
                <li key={i}>
                  {h.day} - {h.hour}: {h.orders} سفارش
                </li>
              ))}
            </ul>
          </div>
        </MetricCard>


                {/* 6. Revenue forecast for this product */}
                <MetricCard title="Revenue forecast (per product)">
          <StatRow
            label="Current month"
            value={revenue?.current_month ?? "-"}
          />
          <StatRow
            label="Revenue so far (this month)"
            value={`${fmt(revenue?.so_far_revenue)} Toman`}
          />
          <StatRow
            label="Next month forecast"
            value={`${fmt(revenue?.forecast_revenue)} Toman`}
          />
          <StatRow
            label="Last month revenue"
            value={`${fmt(revenue?.last_month_revenue)} Toman`}
          />
          <StatRow
            label="Trend"
            value={
              revenue?.trend === "increasing"
                ? "Increasing"
                : revenue?.trend === "decreasing"
                ? "Decreasing"
                : "Flat"
            }
          />
          <StatRow
            label="Model confidence"
            value={`${Math.round((revenue?.confidence ?? 0) * 100)}%`}
          />
        </MetricCard>

        {/* 10. Discount vs competitors */}
<MetricCard title="Effective discount vs competitors">
  <StatRow
    label="Your price"
    value={`${fmt(discount?.your_price)} Toman`}
  />
  <StatRow
    label="Your discount"
    value={`${discount?.your_discount_pct ?? 0}%`}
  />
  <StatRow
    label="Effective price"
    value={`${fmt(discount?.effective_price)} Toman`}
  />

  <div className="mt-2 text-xs text-gray-400">
    Competitors:
    <ul className="list-disc list-inside mt-1">
      {(discount?.competitors || []).map((c: AnyObj) => (
        <li key={c.name}>
          {c.name}: {fmt(c.price)} Toman
        </li>
      ))}
      {(!discount?.competitors || discount.competitors.length === 0) && (
        <li>No competitor data</li>
      )}
    </ul>
  </div>

  <StatRow
    label="Advantage vs cheapest"
    value={
      discount?.effective_discount_vs_cheapest_pct != null
        ? `${discount.effective_discount_vs_cheapest_pct.toFixed(2)}%`
        : "-"
    }
  />
  <StatRow
    label="Position"
    value={
      discount?.position === "cheapest"
        ? "Cheapest"
        : discount?.position === "in_line"
        ? "In line"
        : discount?.position === "more_expensive"
        ? "More expensive"
        : discount?.position === "no_competitor"
        ? "No competitors"
        : "-"
    }
  />
</MetricCard>



        {/* 14. Restock timing recommendation */}
        <MetricCard title="Restock timing recommendation">
          <StatRow
            label="Product"
            value={restock?.title ?? selectedProduct?.title ?? "-"}
          />
          <StatRow
            label="Daily sales average"
            value={restock?.daily_sales_avg ?? 0}
          />
          <StatRow
            label="Current stock"
            value={restock?.current_stock ?? restock?.current_stock ?? 0}
          />
          <StatRow
            label="Projected days to stockout"
            value={restock?.days_to_stockout ?? 0}
          />
          <StatRow
            label="Typical restock delay after stockout"
            value={
              restock?.typical_restock_delay_days != null
                ? `${restock.typical_restock_delay_days} days`
                : "-"
            }
          />
          <StatRow
            label="Supplier lead time"
            value={
              restock?.supplier_lead_time_days != null
                ? `${restock.supplier_lead_time_days} days`
                : "-"
            }
          />
          <StatRow
            label="Risk level"
            value={restock?.risk_level ?? "-"}
          />
          <StatRow
            label="Recommended order quantity"
            value={restock?.recommended_order_qty ?? 0}
          />
          <div className="mt-2 text-xs text-gray-400">
            Recommendation:
            <div className="mt-1">
              {restock?.recommendation_text ??
                "No specific risk detected based on current sales and stock history."}
            </div>
          </div>
        </MetricCard>


        <MetricCard title="Sales speed comparison (old vs new)">
          <StatRow label="Old product" value={speed?.old_product_title ?? "-"} />
          <StatRow
            label="Old sales speed (units/day)"
            value={speed?.old_speed != null ? speed.old_speed.toFixed(2) : "-"}
          />

          <StatRow label="New product" value={speed?.new_product_title ?? "-"} />
          <StatRow
            label="New sales speed (units/day)"
            value={speed?.new_speed != null ? speed.new_speed.toFixed(2) : "-"}
          />

          <StatRow
            label="Speed change"
            value={
              speed?.speed_change_pct != null
                ? `${speed.speed_change_pct.toFixed(1)}%`
                : "-"
            }
          />

          <StatRow
            label="Conclusion"
            value={speed?.conclusion ?? "-"}
          />
</MetricCard>


        {/* 11. تحلیل کامنت‌ها */}


{/* 11. Comment analysis */}
<MetricCard title="Customer experience from comments">
  <StatRow
    label="Positive reviews"
    value={
      comments && typeof comments.positive_pct === "number"
        ? `${comments.positive_pct.toFixed(1)}%`
        : "-"
    }
  />
  <StatRow
    label="Negative reviews"
    value={
      comments && typeof comments.negative_pct === "number"
        ? `${comments.negative_pct.toFixed(1)}%`
        : "-"
    }
  />
  <StatRow
    label="Sentiment score"
    value={
      comments && typeof comments.sentiment_score === "number"
        ? comments.sentiment_score.toFixed(2)
        : "-"
    }
  />
  <StatRow
    label="Average rating"
    value={
      comments && typeof comments.avg_rating === "number"
        ? comments.avg_rating.toFixed(2)
        : "-"
    }
  />
  <StatRow
    label="Total reviews"
    value={comments?.total_reviews ?? 0}
  />

  <div className="mt-2 text-xs text-gray-400">
    Summary:
    <div className="mt-1">
      {comments?.summary_text ?? "No summary available yet."}
    </div>
  </div>

  <div className="mt-2 text-xs text-gray-400">
    Frequent issues:
    <ul className="list-disc list-inside mt-1">
      {(comments?.top_issues || []).map((i: AnyObj, idx: number) => (
        <li key={idx}>
          {i.tag} ({i.count})
        </li>
      ))}
    </ul>
  </div>

  <div className="mt-2 text-xs text-gray-400">
    Positive highlights:
    <ul className="list-disc list-inside mt-1">
      {(comments?.top_likes || []).map((i: AnyObj, idx: number) => (
        <li key={idx}>
          {i.tag} ({i.count})
        </li>
      ))}
    </ul>
  </div>

  <div className="mt-2 text-xs text-gray-400">
    Example comments:
    <ul className="list-disc list-inside mt-1">
      {(comments?.sample_comments || []).map(
        (c: string, idx: number) => (
          <li key={idx}>{c}</li>
        )
      )}
    </ul>
  </div>
</MetricCard>




      </div>
    </div>
  );
}
