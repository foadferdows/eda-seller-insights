import React from "react";
import Table from "../Table";
import { portfolioData } from "../../services/mockData";

type Row = (typeof portfolioData)["allocation"][number];

export default function PortfolioTable() {
  const rows: Row[] = portfolioData.allocation;
  const cols = [
    { key: "asset", header: "Asset" },
    { key: "pct", header: "Allocation (%)" },
  ] as const;
  // @ts-ignore
  return <Table<Row> title="Portfolio Allocation" data={rows} columns={cols} />;
}

