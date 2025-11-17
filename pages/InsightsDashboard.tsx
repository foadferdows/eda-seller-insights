import React, { useEffect, useState } from "react";
import { apiGet } from "../services/api";

type AnyObj = Record<string, any>;

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
    <h3 className="text-lg font-semibold mb-3 text-gray-100">{title}</h3>
    {children}
  </div>
);

const StatRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between text-sm py-1">
    <span className="text-gray-400">{label}</span>
    <span className="text-gray-100 font-medium">{value}</span>
  </div>
);

export default function InsightsDashboard() {
  const [profit, setProfit] = useState<AnyObj | null>(null);
  const [slow, setSlow] = useState<AnyObj | null>(null);
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
        const [
          p, s, b, g, r, d, rs, sp, c,
        ] = await Promise.all([
          apiGet("/insights/profit-margin/"),
          apiGet("/insights/slow-movers/"),
          apiGet("/insights/breakeven/"),
          apiGet("/insights/golden-times/"),
          apiGet("/insights/revenue-forecast/"),
          apiGet("/insights/discount-competition/"),
          apiGet("/insights/restock-time/"),
          apiGet("/insights/speed-compare/"),
          apiGet("/insights/comment-analysis/"),
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
        setError(e?.message || "خطا در دریافت داده‌ها");
      }
    })();
  }, []);

  if (error) {
    return <div className="text-red-400 text-sm">خطا: {error}</div>;
  }

  if (!profit || !slow || !breakeven || !golden || !revenue || !discount || !restock || !speed || !comments) {
    return <div className="text-gray-400 text-sm">در حال بارگذاری تحلیل‌ها...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">🔍 تحلیل‌های هوشمند (Mock Data)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* حاشیه سود واقعی */}
        <Card title="1. حاشیه سود واقعی پس از کمیسیون">
          <StatRow label="SKU" value={profit.sku} />
          <StatRow label="نام محصول" value={profit.title} />
          <StatRow label="قیمت فروش" value={`${profit.price.toLocaleString()} تومان`} />
          <StatRow label="کمیسیون" value={`${profit.commission_pct}%`} />
          <StatRow label="سود خالص" value={`${profit.net_profit.toLocaleString()} تومان`} />
          <StatRow label="حاشیه سود" value={`${profit.margin_pct}%`} />
        </Card>

        {/* کم‌تحرک‌ها */}
        <Card title="2. محصولات کم‌تحرک و پیشنهاد خروج">
          {slow.items.map((it: AnyObj) => (
            <div key={it.sku} className="mb-3 border-b border-gray-700 pb-2 last:border-0 last:pb-0">
              <div className="font-medium">{it.title}</div>
              <StatRow label="SKU" value={it.sku} />
              <StatRow label="حاشیه سود" value={`${it.profit_pct}%`} />
              <StatRow label="سرعت فروش/هفته" value={it.sell_speed_per_week} />
              <StatRow label="موجودی" value={it.stock} />
              <StatRow
                label="پیشنهاد"
                value={
                  it.recommendation === "remove"
                    ? "حذف از سبد"
                    : it.recommendation === "discount"
                    ? "تخفیف/پروموشن"
                    : it.recommendation
                }
              />
              <div className="text-xs text-gray-400 mt-1">{it.reason}</div>
            </div>
          ))}
        </Card>

        {/* نقطه سر به سر */}
        <Card title="3. نقطه سر به سر محصول">
          <StatRow label="نام محصول" value={breakeven.title} />
          <StatRow label="هزینه ثابت" value={`${breakeven.fixed_costs.toLocaleString()} تومان`} />
          <StatRow label="هزینه متغیر/واحد" value={`${breakeven.variable_cost.toLocaleString()} تومان`} />
          <StatRow label="قیمت فروش" value={`${breakeven.price.toLocaleString()} تومان`} />
          <StatRow label="تعداد سر به سر" value={breakeven.breakeven_units} />
          <StatRow label="فروش فعلی ماه" value={breakeven.current_month_sales} />
          <StatRow label="پیشرفت به سمت سر به سر" value={`${breakeven.progress_pct}%`} />
        </Card>

        {/* زمان‌های طلایی */}
        <Card title="5. زمان‌های طلایی فروش">
          <StatRow label="نام محصول" value={golden.title} />
          <StatRow label="بهترین ساعات" value={golden.best_hours.join(" ، ")} />
          <StatRow label="بهترین روزها" value={golden.best_days.join(" ، ")} />
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
        </Card>

        {/* پیش‌بینی درآمد */}
        <Card title="6. پیش‌بینی درآمد ماه">
          <StatRow label="ماه جاری" value={revenue.current_month} />
          <StatRow label="درآمد تا الان" value={`${revenue.so_far_revenue.toLocaleString()} تومان`} />
          <StatRow label="پیش‌بینی پایان ماه" value={`${revenue.forecast_revenue.toLocaleString()} تومان`} />
          <StatRow label="درآمد ماه قبل" value={`${revenue.last_month_revenue.toLocaleString()} تومان`} />
          <StatRow
            label="روند"
            value={revenue.trend === "increasing" ? "صعودی" : revenue.trend === "decreasing" ? "نزولی" : "ثابت"}
          />
          <StatRow label="اعتماد مدل" value={`${Math.round(revenue.confidence * 100)}%`} />
        </Card>

        {/* تخفیف مؤثر */}
        <Card title="10. تخفیف مؤثر نسبت به رقبا">
          <StatRow label="قیمت شما" value={`${discount.your_price.toLocaleString()} تومان`} />
          <StatRow label="تخفیف شما" value={`${discount.your_discount_pct}%`} />
          <StatRow label="قیمت مؤثر" value={`${discount.effective_price.toLocaleString()} تومان`} />
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
            label="مزیت شما نسبت ارزان‌ترین"
            value={`${discount.effective_discount_vs_cheapest_pct}%`}
          />
          <StatRow
            label="جایگاه"
            value={discount.position === "cheapest" ? "ارزان‌ترین در بین رقبا" : discount.position}
          />
        </Card>

        {/* زمان تأمین */}
        <Card title="14. پیش‌بینی زمان موردنیاز برای تأمین">
          <StatRow label="نام محصول" value={restock.title} />
          <StatRow label="میانگین فروش روزانه" value={restock.daily_sales_avg} />
          <StatRow label="موجودی فعلی" value={restock.current_stock} />
          <StatRow label="زمان تأمین از تأمین‌کننده" value={`${restock.supplier_lead_time_days} روز`} />
          <StatRow label="زمان تا اتمام موجودی" value={`${restock.days_to_stockout} روز`} />
          <StatRow
            label="نیاز به سفارش"
            value={restock.should_order ? "بله، باید سفارش دهید" : "هنوز نیازی نیست"}
          />
          <StatRow label="مقدار پیشنهادی سفارش" value={restock.recommended_order_qty} />
        </Card>

        {/* مقایسه سرعت فروش */}
        <Card title="17. مقایسه سرعت فروش محصول جدید و قدیمی">
          <StatRow label="محصول قدیمی" value={speed.old_title} />
          <StatRow label="سرعت فروش قدیمی (واحد/روز)" value={speed.old_speed_per_day} />
          <StatRow label="محصول جدید" value={speed.new_title} />
          <StatRow label="سرعت فروش جدید (واحد/روز)" value={speed.new_speed_per_day} />
          <StatRow label="تغییر سرعت" value={`${speed.uplift_pct}%`} />
          <StatRow
            label="نتیجه"
            value={speed.conclusion === "new_faster" ? "نسخه جدید سریع‌تر فروش می‌رود" : speed.conclusion}
          />
        </Card>

        {/* تحلیل کامنت‌ها */}
        <Card title="11. تحلیل تجربه مشتری از کامنت‌ها">
          <StatRow label="مثبت" value={`${comments.positive_pct}%`} />
          <StatRow label="منفی" value={`${comments.negative_pct}%`} />
          <StatRow label="امتیاز احساسات" value={comments.sentiment_score} />
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
        </Card>
      </div>
    </div>
  );
}

