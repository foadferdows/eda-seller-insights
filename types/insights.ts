export type ProfitMargin = {
  sku: string;
  title: string;
  price: number;
  commission_pct: number;
  buy_price: number;
  other_costs: number;
  net_profit: number;
  margin_pct: number;
};

export type SlowMoverItem = {
  sku: string;
  product_id: string;
  title: string;
  category?: string;
  weekly_sales: number;
  total_sold: number;
  margin_pct: number;
  stock: number;
  days_active: number;
  profit_per_unit: number;
  profitability_index: number;
  recommendation: "remove" | "discount" | string;
  reason?: string;
};

export type SlowMoversResponse = {
  thresholds: {
    min_weekly_sales: number;
    min_margin_pct: number;
    min_days_active: number;
    extra_cost_pct: number;
  };
  items: SlowMoverItem[];
};


// بقیه typeها اگر خواستی بعداً اضافه می‌کنیم، فعلاً همین دو تا مهم‌ترند

