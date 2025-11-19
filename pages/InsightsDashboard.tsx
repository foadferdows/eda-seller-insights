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
        {/* 1. حاشیه سود */}
        <MetricCard title="حاشیه سود واقعی پس از کمیسیون">
          <StatRow label="SKU / ID" value={profit.sku ?? "-"} />
          <StatRow label="نام محصول" value={profit.title ?? "-"} />
          <StatRow
            label="قیمت فروش"
            value={`${fmt(profit.price)} تومان`}
          />
          <StatRow
            label="کمیسیون"
            value={`${profit.commission_pct ?? 0}%`}
          />
          <StatRow
            label="قیمت خرید"
            value={`${fmt(profit.buy_price)} تومان`}
          />
          <StatRow
            label="سایر هزینه‌ها"
            value={`${fmt(profit.other_costs)} تومان`}
          />
          <StatRow
            label="سود خالص"
            value={`${fmt(profit.net_profit)} تومان`}
          />
          <StatRow
            label="حاشیه سود"
            value={`${profit.margin_pct ?? 0}%`}
          />
        </MetricCard>

        {/* 2. محصولات کم‌تحرک */}
        <MetricCard title="محصولات کم‌تحرک و پیشنهاد خروج">
          {(slow.items ?? []).map((it) => (
            <div
              key={it.sku ?? it.product_id}
              className="mb-3 border-b border-gray-700 pb-2 last:border-0 last:pb-0"
            >
              <div className="font-medium">{it.title}</div>

              <StatRow
                label="SKU"
                value={it.sku ?? it.product_id ?? "-"}
              />

              <StatRow
                label="حاشیه سود"
                // از margin_pct که بک‌اند می‌فرستد
                value={`${it.margin_pct ?? 0}%`}
              />

              <StatRow
                label="سرعت فروش/هفته"
                // از weekly_sales که بک‌اند می‌فرستد
                value={it.weekly_sales ?? 0}
              />

              <StatRow
                label="شاخص سودآوری"
                // فرمول: (میانگین فروش هفتگی × حاشیه سود واحد) ÷ میانگین موجودی
                value={it.profitability_index ?? 0}
              />

              <StatRow
                label="موجودی"
                value={it.stock ?? 0}
              />

              <StatRow
                label="پیشنهاد"
                value={
                  it.recommendation === "remove"
                    ? "خروج از سبد"
                    : it.recommendation === "discount"
                    ? "تخفیف/پروموشن"
                    : it.recommendation ?? "-"
                }
              />

              <div className="text-xs text-gray-400 mt-1">
                {it.reason ?? ""}
              </div>
            </div>
          ))}
        </MetricCard>


        {/* 3. نقطه سر به سر */}
        <MetricCard title="نقطه سر به سر محصول">
          <StatRow label="نام محصول" value={breakeven?.title ?? "-"} />
          <StatRow
            label="هزینه ثابت"
            value={`${fmt(breakeven?.fixed_costs)} تومان`}
          />
          <StatRow
            label="هزینه متغیر/واحد"
            value={`${fmt(breakeven?.variable_cost)} تومان`}
          />
          <StatRow
            label="قیمت فروش"
            value={`${fmt(breakeven?.price)} تومان`}
          />
          <StatRow
            label="تعداد سر به سر"
            value={breakeven?.breakeven_units ?? 0}
          />
          <StatRow
            label="فروش فعلی ماه"
            value={breakeven?.current_month_sales ?? 0}
          />
          <StatRow
            label="پیشرفت به سمت سر به سر"
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

        {/* 6. پیش‌بینی درآمد ماه */}
        <MetricCard title="پیش‌بینی درآمد ماه">
          <StatRow label="ماه جاری" value={revenue?.current_month ?? "-"} />
          <StatRow
            label="درآمد تا الان"
            value={`${fmt(revenue?.so_far_revenue)} تومان`}
          />
          <StatRow
            label="پیش‌بینی پایان ماه"
            value={`${fmt(revenue?.forecast_revenue)} تومان`}
          />
          <StatRow
            label="درآمد ماه قبل"
            value={`${fmt(revenue?.last_month_revenue)} تومان`}
          />
          <StatRow
            label="روند"
            value={
              revenue?.trend === "increasing"
                ? "صعودی"
                : revenue?.trend === "decreasing"
                ? "نزولی"
                : "ثابت"
            }
          />
          <StatRow
            label="اعتماد مدل"
            value={`${Math.round((revenue?.confidence ?? 0) * 100)}%`}
          />
        </MetricCard>

        {/* 10. تخفیف مؤثر نسبت به رقبا */}
        <MetricCard title="تخفیف مؤثر نسبت به رقبا">
          <StatRow
            label="قیمت شما"
            value={`${fmt(discount?.your_price)} تومان`}
          />
          <StatRow
            label="تخفیف شما"
            value={`${discount?.your_discount_pct ?? 0}%`}
          />
          <StatRow
            label="قیمت مؤثر"
            value={`${fmt(discount?.effective_price)} تومان`}
          />
          <div className="mt-2 text-xs text-gray-400">
            رقبا:
            <ul className="list-disc list-inside mt-1">
              {(discount?.competitors || []).map((c: AnyObj) => (
                <li key={c.name}>
                  {c.name}: {fmt(c.price)} تومان
                </li>
              ))}
            </ul>
          </div>
          <StatRow
            label="مزیت vs ارزان‌ترین"
            value={`${discount?.effective_discount_vs_cheapest_pct ?? 0}%`}
          />
          <StatRow
            label="جایگاه"
            value={
              discount?.position === "cheapest"
                ? "ارزان‌ترین"
                : discount?.position ?? "-"
            }
          />
        </MetricCard>

        {/* 14. زمان تأمین موجودی */}
        <MetricCard title="پیش‌بینی زمان تأمین موجودی">
          <StatRow label="نام محصول" value={restock?.title ?? "-"} />
          <StatRow
            label="میانگین فروش روزانه"
            value={restock?.daily_sales_avg ?? 0}
          />
          <StatRow
            label="موجودی فعلی"
            value={restock?.current_stock ?? 0}
          />
          <StatRow
            label="زمان تأمین از تأمین‌کننده"
            value={`${restock?.supplier_lead_time_days ?? 0} روز`}
          />
          <StatRow
            label="زمان تا اتمام موجودی"
            value={`${restock?.days_to_stockout ?? 0} روز`}
          />
          <StatRow
            label="نیاز به سفارش"
            value={restock?.should_order ? "بله" : "خیر"}
          />
          <StatRow
            label="مقدار سفارش پیشنهادی"
            value={restock?.recommended_order_qty ?? 0}
          />
        </MetricCard>

        {/* 17. مقایسه سرعت فروش جدید/قدیم */}
        <MetricCard title="مقایسه سرعت فروش محصول جدید و قدیمی">
          <StatRow label="محصول قدیمی" value={speed?.old_title ?? "-"} />
          <StatRow
            label="سرعت فروش قدیمی (واحد/روز)"
            value={speed?.old_speed_per_day ?? 0}
          />
          <StatRow label="محصول جدید" value={speed?.new_title ?? "-"} />
          <StatRow
            label="سرعت فروش جدید (واحد/روز)"
            value={speed?.new_speed_per_day ?? 0}
          />
          <StatRow
            label="تغییر سرعت"
            value={`${speed?.uplift_pct ?? 0}%`}
          />
          <StatRow
            label="نتیجه"
            value={
              speed?.conclusion === "new_faster"
                ? "نسخه جدید سریع‌تر است"
                : speed?.conclusion ?? "-"
            }
          />
        </MetricCard>

        {/* 11. تحلیل کامنت‌ها */}
        <MetricCard title="تحلیل تجربه مشتری از کامنت‌ها">
          <StatRow
            label="نظرات مثبت"
            value={`${comments?.positive_pct ?? 0}%`}
          />
          <StatRow
            label="نظرات منفی"
            value={`${comments?.negative_pct ?? 0}%`}
          />
          <StatRow
            label="امتیاز احساسات"
            value={comments?.sentiment_score ?? 0}
          />
          <div className="mt-2 text-xs text-gray-400">
            مشکلات پرتکرار:
            <ul className="list-disc list-inside mt-1">
              {(comments?.top_issues || []).map(
                (i: AnyObj, idx: number) => (
                  <li key={idx}>
                    {i.tag} ({i.count}) — {i.example}
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            نکات مثبت:
            <ul className="list-disc list-inside mt-1">
              {(comments?.top_likes || []).map(
                (i: AnyObj, idx: number) => (
                  <li key={idx}>
                    {i.tag} ({i.count}) — {i.example}
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            نمونه نظرات:
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
