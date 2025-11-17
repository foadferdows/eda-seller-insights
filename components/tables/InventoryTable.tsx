import React from "react";
import Table from "../Table";
import { inventoryData } from "../../services/mockData";

type Row = (typeof inventoryData)["items"][number];

export default function InventoryTable() {
  const rows: Row[] = inventoryData.items;
  const cols = [
    { key: "sku", header: "SKU" },
    { key: "days_of_cover", header: "Days of Cover" },
    { key: "status", header: "Status", render: (r: Row) => (
        <span className={
          r.status === "low" ? "text-red-400" :
          r.status === "healthy" ? "text-green-400" : "text-yellow-300"
        }>
          {r.status}
        </span>
      )
    },
  ] as const;
  // @ts-ignore generic typing convenience for demo
  return <Table<Row> title="Inventory" data={rows} columns={cols} />;
}

