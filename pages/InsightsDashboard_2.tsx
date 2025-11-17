import React, { useEffect, useState } from "react";
import { apiGet } from "../services/api";

const Card = ({ title, children }) => (
  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

export default function InsightsDashboard() {
  const [profit, setProfit] = useState(null);
  const [slow, setSlow] = useState(null);
  const [breakeven, setBreakeven] = useState(null);
  // … بقیه state ها

  useEffect(() => {
    apiGet("/insights/profit-margin/").then(setProfit);
    apiGet("/insights/slow-movers/").then(setSlow);
    apiGet("/insights/breakeven/").then(setBreakeven);
    // … بقیه fetch ها
  }, []);

  return (
    <div className="space-y-6">
      <Card title="حاشیه سود واقعی">
        <pre>{JSON.stringify(profit, null, 2)}</pre>
      </Card>

      <Card title="محصولات کم‌تحرک">
        <pre>{JSON.stringify(slow, null, 2)}</pre>
      </Card>

      <Card title="نقطه سر به سر">
        <pre>{JSON.stringify(breakeven, null, 2)}</pre>
      </Card>

      {/* ... بقیه کارت‌ها */}
    </div>
  );
}

