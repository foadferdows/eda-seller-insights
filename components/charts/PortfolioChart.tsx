import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

type Alloc = { asset?: string; pct?: number };
type Props = { data: { allocation?: Alloc[] } };

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#a0e0ff", "#c084fc"];

export default function PortfolioChart({ data }: Props) {
  const allocs = Array.isArray(data?.allocation) ? data.allocation : [];
  const rows = allocs.map((a) => ({ name: a?.asset ?? "—", value: Number(a?.pct ?? 0) }));

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="name" outerRadius={90}>
            {rows.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

