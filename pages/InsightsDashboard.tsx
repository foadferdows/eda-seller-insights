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

  // 1) Load product list
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
        setError(e?.message || "Failed to fetch product list");
      }
    })();
  }, []);

  // 2) Load insights for selected product
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
        setError(e?.message || "Failed to fetch insights data");
      }
    })();
  }, [selectedSku]);

  if (error) {
    return (
      <div className="mt-4">
        <div className="bg-red-900/40 border border-red-700 text-red-100 text-sm rounded-2xl px-4 py-3">
          <div className="font-semibold mb-1">Data error</div>
          <div className="break-all">{error}</div>
        </div>
      </div>
    );
  }

  // Skeleton while insights are loading
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

  const fmt = (n: number | null | undefined) => (n ?? 0).toLocaleString();

  return (
    <div className="space-y-8 mt-8">
      {/* Header + product selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">
            🔍 Smart economic insights (Data mode)
          </h2>
          {selectedProduct && (
            <p className="text-sm text-gray-400 mt-1">
              {selectedProduct.title} (ID: {selectedProduct.product_id})
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Selected product:</span>
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

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 1. Real profit margin */}
        <MetricCard
  title="Real profit margin after commission"
  showMoreButton
  cardId="real_profit"
  productId={selectedProduct?.product_id}
  cardData={{
    title: selectedProduct?.title,
    category: selectedProduct?.category,
    brand: selectedProduct?.brand,
    price: profit.price,
    buy_price: profit.buy_price,
    commission_pct: profit.commission_pct,
    other_costs: profit.other_costs,
    net_profit: profit.net_profit,
    margin_pct: profit.margin_pct,
  }}
>
          <p className="text-xs text-gray-400 mb-2">
            Net profitability of this product after Digikala commission and
            extra costs.
          </p>
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

          <div className="border-t border-gray-700 my-2" />

          <StatRow label="Selling price" value={`${fmt(profit.price)} Toman`} />
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

          <div className="border-t border-gray-700 my-2" />

          <StatRow
            label="Net profit per unit"
            value={`${fmt(profit.net_profit)} Toman`}
          />
          <StatRow
            label="Profit margin"
            value={`${profit.margin_pct ?? 0}%`}
          />
        </MetricCard>

        {/* 2. Slow-moving products + exit recommendation */}
        <MetricCard
  title="Slow-moving products & exit suggestion"
  showMoreButton
  cardId="slow_movers"
  productId={selectedProduct?.product_id}
  cardData={{
    items: slow.items,
    thresholds: slow.thresholds,
  }}
>
          <p className="text-xs text-gray-400 mb-2">
            Items with low sales speed and weak margin that might need discount
            or removal.
          </p>
          {(slow.items ?? []).map((it) => (
            <div
              key={it.sku ?? it.product_id}
              className="mb-3 border-b border-gray-700 pb-2 last:border-0 last:pb-0"
            >
              <div className="font-medium mb-1">
                {it.title ?? "Unnamed product"}
              </div>

              <StatRow label="SKU" value={it.sku ?? it.product_id ?? "-"} />
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
              <StatRow label="Stock" value={it.stock ?? 0} />
              <StatRow
                label="Recommendation"
                value={
                  it.recommendation === "remove"
                    ? "Remove from catalog"
                    : it.recommendation === "discount"
                    ? "Run discount/promotion"
                    : it.recommendation ?? "-"
                }
              />

              <div className="text-xs text-gray-400 mt-1">
                {it.reason ||
                  "Low sales speed and weak profit margin detected for this item."}
              </div>
            </div>
          ))}
        </MetricCard>

        {/* 3. Breakeven point for selected product */}
        <MetricCard
  title="Breakeven point for this product"
  showMoreButton
  cardId="breakeven"
  productId={selectedProduct?.product_id}
  cardData={{
    price: breakeven?.price,
    fixed_costs: breakeven?.fixed_costs,
    variable_cost: breakeven?.variable_cost,
    breakeven_units: breakeven?.breakeven_units,
    sold_units: breakeven?.current_sold_units,
    progress_pct: breakeven?.progress_pct,
  }}
>
          <p className="text-xs text-gray-400 mb-2">
            How many units you need to sell to cover allocated fixed and
            variable costs.
          </p>
          <StatRow
            label="Product"
            value={breakeven?.title ?? selectedProduct?.title ?? "-"}
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

        {/* 4. Golden sales times */}
        <MetricCard
  title="Golden sales times"
  showMoreButton
  cardId="golden_times"
  productId={selectedProduct?.product_id}
  cardData={{
    best_hours: golden?.suggested_hours,
    best_days: golden?.best_days,
    peak_points: golden?.peak_points,
    upcoming_best_dates: golden?.upcoming_best_dates,
  }}
>
          <p className="text-xs text-gray-400 mb-2">
            Best time windows based on historical orders for this product.
          </p>
          <StatRow label="Product" value={selectedSku || "-"} />
          <StatRow
            label="Best hours"
            value={
              golden?.suggested_hours && golden.suggested_hours.length > 0
                ? golden.suggested_hours.join(", ")
                : "-"
            }
          />
          <StatRow
            label="Best days"
            value={
              golden?.best_days && golden.best_days.length > 0
                ? golden.best_days
                    .map((d: any) => d.weekday ?? String(d))
                    .join(", ")
                : "-"
            }
          />
          <StatRow
            label="Peak points"
            value={
              golden?.peak_points && golden.peak_points.length > 0
                ? golden.peak_points
                    .map((p: any) =>
                      typeof p === "string"
                        ? p
                        : `${p.date}${p.label ? ` (${p.label})` : ""}`
                    )
                    .join(", ")
                : "-"
            }
          />

          {golden?.upcoming_best_dates &&
            golden.upcoming_best_dates.length > 0 && (
              <div className="pt-2 mt-2 border-t border-gray-700 text-xs text-gray-400">
                Upcoming golden days:&nbsp;
                {golden.upcoming_best_dates
                  .map((d: AnyObj) => `${d.date} (${d.weekday})`)
                  .join(", ")}
              </div>
            )}
        </MetricCard>

        {/* 5. Revenue forecast for this product */}
        <MetricCard
  title="Revenue forecast (per product)"
  showMoreButton
  cardId="revenue_forecast"
  productId={selectedProduct?.product_id}
  cardData={{
    current_month: revenue?.current_month,
    so_far: revenue?.so_far_revenue,
    forecast: revenue?.forecast_revenue,
    last_month: revenue?.last_month_revenue,
    trend: revenue?.trend,
    confidence: revenue?.confidence,
  }}
>
          <p className="text-xs text-gray-400 mb-2">
            Short-term revenue forecast based on recent sales trend.
          </p>
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

        {/* 6. Discount vs competitors */}
        <MetricCard
  title="Effective discount vs competitors"
  showMoreButton
  cardId="discount_vs_competitors"
  productId={selectedProduct?.product_id}
  cardData={{
    your_price: discount?.your_price,
    your_discount_pct: discount?.your_discount_pct,
    effective_price: discount?.effective_price,
    competitors: discount?.competitors,
    advantage: discount?.effective_discount_vs_cheapest_pct,
    position: discount?.position,
  }}
>
          <p className="text-xs text-gray-400 mb-2">
            Compare your effective price and discount against main competitors.
          </p>
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

          <div className="mt-3 text-xs text-gray-400">
            <div className="font-semibold mb-1">Competitors</div>
            <ul className="list-disc list-inside space-y-1">
              {(discount?.competitors || []).map((c: AnyObj) => (
                <li key={c.name}>
                  {c.name}: {fmt(c.price)} Toman
                </li>
              ))}
              {(!discount?.competitors ||
                discount.competitors.length === 0) && (
                <li>No competitor data</li>
              )}
            </ul>
          </div>

          <div className="border-t border-gray-700 my-2" />

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

        {/* 7. Restock timing recommendation */}
        <MetricCard
  title="Restock timing recommendation"
  showMoreButton
  cardId="restock"
  productId={selectedProduct?.product_id}
  cardData={{
    daily_sales_avg: restock?.daily_sales_avg,
    current_stock: restock?.current_stock,
    days_to_stockout: restock?.days_to_stockout,
    supplier_lead_time_days: restock?.supplier_lead_time_days,
    risk_level: restock?.risk_level,
    recommended_order_qty: restock?.recommended_order_qty,
  }}
>
          <p className="text-xs text-gray-400 mb-2">
            When and how much to reorder based on sales speed and supplier lead
            time.
          </p>
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
            value={restock?.current_stock ?? 0}
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

        {/* 8. Sales speed comparison */}
        <MetricCard
  title="Sales speed comparison (old vs new)"
  showMoreButton
  cardId="speed_comparison"
  productId={selectedProduct?.product_id}
  cardData={{
    old_product: speed?.old_product_title,
    old_speed: speed?.old_speed,
    new_product: speed?.new_product_title,
    new_speed: speed?.new_speed,
    speed_change_pct: speed?.speed_change_pct,
    conclusion: speed?.conclusion,
  }}
>
          <p className="text-xs text-gray-400 mb-2">
            Compare sales speed of a new product vs an older reference item.
          </p>
          <StatRow
            label="Old product"
            value={speed?.old_product_title ?? "-"}
          />
          <StatRow
            label="Old sales speed (units/day)"
            value={
              speed?.old_speed != null ? speed.old_speed.toFixed(2) : "-"
            }
          />

          <div className="border-t border-gray-700 my-2" />

          <StatRow
            label="New product"
            value={speed?.new_product_title ?? "-"}
          />
          <StatRow
            label="New sales speed (units/day)"
            value={
              speed?.new_speed != null ? speed.new_speed.toFixed(2) : "-"
            }
          />

          <div className="border-t border-gray-700 my-2" />

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

        {/* 9. Comment analysis */}
        <MetricCard
  title="Customer experience from comments"
  showMoreButton
  cardId="comments_analysis"
  productId={selectedProduct?.product_id}
  cardData={{
    sentiment_score: comments?.sentiment_score,
    avg_rating: comments?.avg_rating,
    total_reviews: comments?.total_reviews,
    summary_en: comments?.summary_en,
    issues: comments?.top_issues_en,
    highlights: comments?.top_highlights_en,
  }}
>
          <p className="text-xs text-gray-400 mb-2">
            Sentiment, pain points, and highlights extracted from customer
            reviews.
          </p>
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

          <div className="mt-3 text-xs text-gray-400">
            <div className="font-semibold mb-1">Summary</div>
            <div>{comments?.summary_en ?? "No summary available yet."}</div>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            <div className="font-semibold mb-1">Frequent issues</div>
            <ul className="list-disc list-inside space-y-1">
              {(comments?.top_issues_en || []).map(
                (issue: string, idx: number) => (
                  <li key={idx}>{issue}</li>
                )
              )}
            </ul>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            <div className="font-semibold mb-1">Positive highlights</div>
            <ul className="list-disc list-inside space-y-1">
              {(comments?.top_highlights_en || []).map(
                (hi: string, idx: number) => (
                  <li key={idx}>{hi}</li>
                )
              )}
            </ul>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            <div className="font-semibold mb-1">Example comments (FA)</div>
            <ul className="list-disc list-inside space-y-1">
              {(comments?.sample_comments_fa || []).map(
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

