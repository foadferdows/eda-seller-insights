import React from "react";
import Table from "../Table";
import { pricingData } from "../../services/mockData";

type Row = { price: number; profit: number; optimal?: boolean };

export default function PricingTable() {
  // تبدیل mockData به ردیف‌های جدولی
  const rows: Row[] = pricingData.price_points.map((p, i) => ({
    price: p,
    profit: pricingData.profit_curve[i],
    optimal: pricingData.optimal?.price === p
  }));

  const cols = [
    { key: "price", header: "Price" },
    { key: "profit", header: "Profit" },
    { key: "optimal", header: "Optimal", render: (r: Row) => r.optimal ? "✅" : "" },
  ] as const;
  // @ts-ignore
  return <Table<Row> title="Optimal Pricing" data={rows} columns={cols} />;
}


