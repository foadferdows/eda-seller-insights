import React from "react";

type Col<T> = { key: keyof T; header: string; render?: (row: T) => React.ReactNode };
interface Props<T extends object> {
  data: T[];
  columns: Col<T>[];
  title?: string;
}

export default function Table<T extends object>({ data, columns, title }: Props<T>) {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-700">
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-700">
              {columns.map((c) => (
                <th key={String(c.key)} className="text-left px-3 py-2 font-medium">{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-gray-700 hover:bg-gray-750">
                {columns.map((c) => (
                  <td key={String(c.key)} className="px-3 py-2">
                    {c.render ? c.render(row) : (row[c.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td className="px-3 py-4 text-gray-400" colSpan={columns.length}>No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

