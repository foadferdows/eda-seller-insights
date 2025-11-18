import React, { useEffect, useState } from "react";
import {
  getProfitMargin,
  getSlowMovers,
  getBreakeven,
  getGoldenTimes,
  getRevenueForecast,
  getDiscountCompetition,
  getRestockTime,
  getSpeedCompare,
  getCommentAnalysis,
} from "../services/dk";

import { MetricCard, StatRow } from "../components/ui/MetricCard";
import type { ProfitMargin, SlowMovers } from "../types/insights";

const PRODUCTS = [
  { sku: "A-101", label: "A-101 – قهوه اسپرسو تک‌خاستگاه" },
  { sku: "B-220", label: "B-220 – ماگ سرامیکی آبی" },
  { sku: "C-111", label: "C-111 – چای ماسالا ۲۵۰ گرمی" },
];

type AnyObj = Record<string, any>;

export default function InsightsDashboard() {
  const [selectedSku, setSelectedSku] = useState<string>(PRODUCTS[0].sku);

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

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const [
          p,
          s,
          b,
          g,
          r,
          d,
          rs,
          sp,
          c,
        ] = await Promise.all([
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
          <div className="font-semibold mb-1">خطا در دریافت داده‌های تحلیلی</div>
          <div className="break-all">{error}</div>
        </div>
      </div>
    );
  }

  if (
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
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
    );
  }

  return (
    <div className="space-y-8 mt-8">
      {/* هدر و انتخاب محصول */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-2xl font-semibold">🔍 تحلیل‌های هوشمند (Mock Data)</h2>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">محصول انتخاب‌شده:</span>
          <select
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
            value={selectedSku}
            onChange={(e) => setSelectedSku(e.target.value)}
          >
            {PRODUCTS.map((p) => (
              <option key={p.sku} value={p.sku}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* کارت‌های اینسایت */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 1. حاشیه سود */}
        <MetricCard title="۱. حاشیه سود واقعی پس از کمیسیون">
          <StatRow label="SKU" value={profit.sku} />
          <StatRow label="نام محصول" value={profit.title} />
          <StatRow
            label="قیمت فروش"
            value={`${profit.price.toLocaleString()} تومان`}
          />
          <StatRow
            label="کمیسیون"
            value={`${profit.commission_pct}%`}
          />
          <StatRow
            label="قیمت خرید"
            value={`${profit.buy_price.toLocaleString()} تومان`}
          />
          <StatRow
            label="سایر هزینه‌ها"
            value={`${profit.other_costs.toLocaleString()} تومان`}
          />
          <StatRow
            label="سود خالص"
            value={`${profit.net_profit.toLocaleString()} تومان`}
          />
          <StatRow
            label="حاشیه سود"
            value={`${profit.margin_pct}%`}
          />
        </MetricCard>

        {/* 2. محصولات کم‌تحرک */}
        <MetricCard title="۲. محصولات کم‌تحرک و پیشنهاد خروج">
          {slow.items.map((it) => (
            <div
              key={it.sku}
              className="mb-3 border-b border-gray-700 pb-2 last:border-0 last:pb-0"
            >
              <div className="font-medium">{it.title}</div>
              <StatRow label="SKU" value={it.sku} />
              <StatRow
                label="حاشیه سود"
                value={`${it.profit_pct}%`}
              />
              <StatRow
                label="سرعت فروش/هفته"
                value={it.sell_speed_per_week}
              />
              <StatRow label="موجودی" value={it.stock} />
              <StatRow
                label="پیشنهاد"
                value={
                  it.recommendation === "remove"
                    ? "خروج از سبد"
                    : it.recommendation === "discount"
                    ? "تخفیف/پروموشن"
                    : it.recommendation
                }
              />
              <div className="text-xs text-gray-400 mt-1">{it.reason}</div>
            </div>
          ))}
        </MetricCard>

        {/* 3. نقطه سر به سر */}
        <MetricCard title="۳. نقطه سر به سر محصول">
          <StatRow label="نام محصول" value={breakeven.title} />
          <StatRow
            label="هزینه ثابت"
            value={`${breakeven.fixed_costs.toLocaleString()} تومان`}
          />
          <StatRow
            label="هزینه متغیر/واحد"
            value={`${breakeven.variable_cost.toLocaleString()} تومان`}
          />
          <StatRow
            label="قیمت فروش"
            value={`${breakeven.price.toLocaleString()} تومان`}
          />
          <StatRow
            label="تعداد سر به سر"
            value={breakeven.breakeven_units}
          />
          <StatRow
            label="فروش فعلی ماه"
            value={breakeven.current_month_sales}
          />
          <StatRow
            label="پیشرفت به سمت سر به سر"
            value={`${breakeven.progress_pct}%`}
          />
        </MetricCard>

        {/* 5. زمان‌های طلایی فروش */}
        <MetricCard title="۵. زمان‌های طلایی فروش">
          <StatRow label="نام محصول" value={golden.title} />
          <StatRow
            label="بهترین ساعات"
            value={golden.best_hours.join(" ، ")}
          />
          <StatRow
            label="بهترین روزها"
            value={golden.best_days.join(" ، ")}
          />
          <div className="mt-3 text-xs text-gray-400">
            نمونه نقاط اوج:
            <ul className="list-disc list-inside mt-1">
              {golden.heatmap.map((h: AnyObj, i: number) => (
                <li key={i}>
                  {h.day} - {h.hour}: {h.orders} سفارش
                </li>
              ))}
            </ul>
          </div>
        </MetricCard>

        {/* 6. پیش‌بینی درآمد ماه */}
        <MetricCard title="۶. پیش‌بینی درآمد ماه">
          <StatRow label="ماه جاری" value={revenue.current_month} />
          <StatRow
            label="درآمد تا الان"
            value={`${revenue.so_far_revenue.toLocaleString()} تومان`}
          />
          <StatRow
            label="پیش‌بینی پایان ماه"
            value={`${revenue.forecast_revenue.toLocaleString()} تومان`}
          />
          <StatRow
            label="درآمد ماه قبل"
            value={`${revenue.last_month_revenue.toLocaleString()} تومان`}
          />
          <StatRow
            label="روند"
            value={
              revenue.trend === "increasing"
                ? "صعودی"
                : revenue.trend === "decreasing"
                ? "نزولی"
                : "ثابت"
            }
          />
          <StatRow
            label="اعتماد مدل"
            value={`${Math.round(revenue.confidence * 100)}%`}
          />
        </MetricCard>

        {/* 10. تخفیف مؤثر نسبت به رقبا */}
        <MetricCard title="۱۰. تخفیف مؤثر نسبت به رقبا">
          <StatRow
            label="قیمت شما"
            value={`${discount.your_price.toLocaleString()} تومان`}
          />
          <StatRow
            label="تخفیف شما"
            value={`${discount.your_discount_pct}%`}
          />
          <StatRow
            label="قیمت مؤثر"
            value={`${discount.effective_price.toLocaleString()} تومان`}
          />
          <div className="mt-2 text-xs text-gray-400">
            رقبا:
            <ul className="list-disc list-inside mt-1">
              {discount.competitors.map((c: AnyObj) => (
                <li key={c.name}>
                  {c.name}: {c.price.toLocaleString()} تومان
                </li>
              ))}
            </ul>
          </div>
          <StatRow
            label="مزیت vs ارزان‌ترین"
            value={`${discount.effective_discount_vs_cheapest_pct}%`}
          />
          <StatRow
            label="جایگاه"
            value={
              discount.position === "cheapest"
                ? "ارزان‌ترین"
                : discount.position
            }
          />
        </MetricCard>

        {/* 14. زمان تأمین موجودی */}
        <MetricCard title="۱۴. پیش‌بینی زمان تأمین موجودی">
          <StatRow label="نام محصول" value={restock.title} />
          <StatRow
            label="میانگین فروش روزانه"
            value={restock.daily_sales_avg}
          />
          <StatRow
            label="موجودی فعلی"
            value={restock.current_stock}
          />
          <StatRow
            label="زمان تأمین از تأمین‌کننده"
            value={`${restock.supplier_lead_time_days} روز`}
          />
          <StatRow
            label="زمان تا اتمام موجودی"
            value={`${restock.days_to_stockout} روز`}
          />
          <StatRow
            label="نیاز به سفارش"
            value={restock.should_order ? "بله" : "خیر"}
          />
          <StatRow
            label="مقدار سفارش پیشنهادی"
            value={restock.recommended_order_qty}
          />
        </MetricCard>

        {/* 17. مقایسه سرعت فروش جدید/قدیم */}
        <MetricCard title="۱۷. مقایسه سرعت فروش محصول جدید و قدیمی">
          <StatRow label="محصول قدیمی" value={speed.old_title} />
          <StatRow
            label="سرعت فروش قدیمی (واحد/روز)"
            value={speed.old_speed_per_day}
          />
          <StatRow label="محصول جدید" value={speed.new_title} />
          <StatRow
            label="سرعت فروش جدید (واحد/روز)"
            value={speed.new_speed_per_day}
          />
          <StatRow
            label="تغییر سرعت"
            value={`${speed.uplift_pct}%`}
          />
          <StatRow
            label="نتیجه"
            value={
              speed.conclusion === "new_faster"
                ? "نسخه جدید سریع‌تر است"
                : speed.conclusion
            }
          />
        </MetricCard>

        {/* 11. تحلیل کامنت‌ها */}
        <MetricCard title="۱۱. تحلیل تجربه مشتری از کامنت‌ها">
          <StatRow
            label="نظرات مثبت"
            value={`${comments.positive_pct}%`}
          />
          <StatRow
            label="نظرات منفی"
            value={`${comments.negative_pct}%`}
          />
          <StatRow
            label="امتیاز احساسات"
            value={comments.sentiment_score}
          />
          <div className="mt-2 text-xs text-gray-400">
            مشکلات پرتکرار:
            <ul className="list-disc list-inside mt-1">
              {comments.top_issues.map((i: AnyObj, idx: number) => (
                <li key={idx}>
                  {i.tag} ({i.count}) — {i.example}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            نکات مثبت:
            <ul className="list-disc list-inside mt-1">
              {comments.top_likes.map((i: AnyObj, idx: number) => (
                <li key={idx}>
                  {i.tag} ({i.count}) — {i.example}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            نمونه نظرات:
            <ul className="list-disc list-inside mt-1">
              {comments.sample_comments.map((c: string, idx: number) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
        </MetricCard>
      </div>
    </div>
  );
}

