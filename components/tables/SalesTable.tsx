import React from "react";
import Table from "../Table";
import { salesData } from "../../services/mockData";

type Row = { month: string; value: number };

export default function SalesTable() {
  const rows: Row[] = salesData.labels.map((label, i) => ({ month: label, value: salesData.series[i] }));
  const cols = [
    { key: "month", header: "Month" },
    { key: "value", header: "Forecast" },
  ] as const;
  // @ts-ignore
  return <Table<Row> title="Sales Forecast" data={rows} columns={cols} />;
}

