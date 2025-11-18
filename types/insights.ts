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
  title: string;
  profit_pct: number;
  sell_speed_per_week: number;
  stock: number;
  recommendation: string;
  reason: string;
};

export type SlowMovers = {
  items: SlowMoverItem[];
};

// بقیه typeها اگر خواستی بعداً اضافه می‌کنیم، فعلاً همین دو تا مهم‌ترند

