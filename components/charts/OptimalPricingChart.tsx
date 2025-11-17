import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot, ResponsiveContainer } from "recharts";

type Props = {
  data: {
    price_points?: number[];
    profit_curve?: number[];
    optimal?: { price?: number; profit?: number };
  };
};

export default function OptimalPricingChart({ data }: Props) {
  const xs = Array.isArray(data?.price_points) ? data.price_points : [];
  const ys = Array.isArray(data?.profit_curve) ? data.profit_curve : [];
  const n = Math.min(xs.length, ys.length);
  const rows = Array.from({ length: n }, (_, i) => ({ price: xs[i], profit: ys[i] }));
  const opt = data?.optimal;

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="price" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={2} dot />
          {opt?.price != null && opt?.profit != null && (
            <ReferenceDot x={opt.price} y={opt.profit} r={6} stroke="red" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

