import React, { useEffect, useState } from "react";
import { getSellerProfile } from "../services/dk";

export default function SellerProfile() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSellerProfile();
        setData(res);
      } catch (e: any) {
        setErr(e?.message || "Failed to load profile");
      }
    })();
  }, []);

  if (err) return <div className="text-red-400">{err}</div>;
  if (!data) return <div className="text-gray-400">در حال بارگذاری پروفایل...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
      <h2 className="text-xl font-semibold mb-4">پروفایل فروشنده</h2>
      <pre className="text-xs bg-gray-900 p-3 rounded-lg overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

