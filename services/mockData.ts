// src/services/mockData.ts

// فروش
export const salesData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  series: [120, 140, 180, 210, 260, 300],
};

// قیمت‌گذاری
export const pricingData = {
  price_points: [9.9, 11.9, 13.9, 15.9],
  profit_curve: [200, 260, 290, 280],
  optimal: { price: 13.9, profit: 290 },
};

// موجودی
export const inventoryData = {
  items: [
    { sku: "A-101", days_of_cover: 12, status: "low" },
    { sku: "B-205", days_of_cover: 38, status: "healthy" },
    { sku: "C-330", days_of_cover: 22, status: "medium" },
  ],
};

// پورتفولیو
export const portfolioData = {
  allocation: [
    { asset: "Equities", pct: 55 },
    { asset: "Bonds", pct: 25 },
    { asset: "Cash", pct: 10 },
    { asset: "Alt", pct: 10 },
  ],
};

