import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Item = { sku?: string; days_of_cover?: number; status?: string };
type Props = { data: { items?: Item[] } };

export default function InventoryAnalysisChart({ data }: Props) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const rows = items.map((it) => ({
    sku: it?.sku ?? "—",
    doc: Number(it?.days_of_cover ?? 0),
    status: it?.status ?? "unknown",
  }));

  const color = (status: string) =>
    status === "healthy" ? "#34d399" : status === "low" ? "#f87171" : "#fbbf24";

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sku" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="doc">
            {rows.map((r, i) => (
              <Cell key={i} fill={color(r.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

