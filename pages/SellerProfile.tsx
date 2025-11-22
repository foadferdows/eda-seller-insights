// import React, { useEffect, useState } from "react";
// import { getSellerProfile } from "../services/dk";

// export default function SellerProfile() {
//   const [data, setData] = useState<any>(null);
//   const [err, setErr] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await getSellerProfile();
//         setData(res);
//       } catch (e: any) {
//         setErr(e?.message || "Failed to load profile");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   if (loading) {
//     return (
//       <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg animate-pulse">
//         <div className="h-5 w-40 bg-gray-700 rounded mb-4" />
//         <div className="h-4 w-64 bg-gray-700 rounded mb-2" />
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <div className="h-16 bg-gray-700 rounded" />
//           <div className="h-16 bg-gray-700 rounded" />
//         </div>
//       </div>
//     );
//   }

//   if (err) {
//     return (
//       <div className="bg-red-900/40 border border-red-700 text-red-100 text-sm rounded-2xl px-4 py-3">
//         {err}
//       </div>
//     );
//   }

//   if (!data) return null;

//   const metrics = data.metrics || {};
//   const monthlyRevenue = metrics.monthly_revenue ?? metrics.monthlyRevenue;
//   const monthlyOrders = metrics.monthly_orders ?? metrics.monthlyOrders;

//   return (
//     <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg space-y-6">
//       {/* header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//         <div>
//           <h2 className="text-xl font-semibold mb-1">Seller profile</h2>
//           <p className="text-sm text-gray-300">
//             {data.shop_title || data.shopTitle || "Untitled shop"}
//           </p>
//           {data.shop_url && (
//             <a
//               href={data.shop_url}
//               target="_blank"
//               rel="noreferrer"
//               className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block"
//             >
//               {data.shop_url}
//             </a>
//           )}
//         </div>
//         <div className="flex items-center gap-2">
//           {data.profile_type && (
//             <span className="px-3 py-1 text-xs rounded-full bg-gray-900 border border-gray-700 text-gray-200">
//               Profile type: {data.profile_type}
//             </span>
//           )}
//           {data.seller_code && (
//             <span className="px-3 py-1 text-xs rounded-full bg-indigo-600/20 border border-indigo-500/60 text-indigo-200">
//               Seller code: {data.seller_code}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* main info + metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* left: basic info */}
//         <div className="space-y-3 text-sm">
//           <ProfileRow label="City" value={data.city || "-"} />
//           {data.email && <ProfileRow label="Email" value={data.email} />}
//           {data.username && (
//             <ProfileRow label="Username" value={data.username} />
//           )}
//         </div>

//         {/* right: metrics */}
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <MetricBox
//             label="Total products"
//             value={metrics.total_products ?? metrics.totalProducts ?? "-"}
//           />
//           <MetricBox
//             label="Active products"
//             value={metrics.active_products ?? metrics.activeProducts ?? "-"}
//           />
//           <MetricBox
//             label="Monthly orders"
//             value={
//               monthlyOrders != null ? monthlyOrders.toLocaleString() : "-"
//             }
//           />
//           <MetricBox
//             label="Monthly revenue"
//             value={
//               monthlyRevenue != null
//                 ? `${Number(monthlyRevenue).toLocaleString()} Toman`
//                 : "-"
//             }
//           />
//         </div>
//       </div>

//       {/* raw JSON for debugging */}
//       <details className="mt-4">
//         <summary className="text-xs text-gray-400 cursor-pointer">
//           Show full profile JSON
//         </summary>
//         <pre className="mt-2 text-[11px] bg-gray-900 p-3 rounded-lg overflow-auto max-h-72">
//           {JSON.stringify(data, null, 2)}
//         </pre>
//       </details>
//     </div>
//   );
// }

// type ProfileRowProps = {
//   label: string;
//   value: React.ReactNode;
// };

// function ProfileRow({ label, value }: ProfileRowProps) {
//   return (
//     <div className="flex items-center gap-3 text-sm">
//       <span className="text-gray-400 text-xs w-24">{label}</span>
//       <span className="text-gray-100">{value || "-"}</span>
//     </div>
//   );
// }

// type MetricBoxProps = {
//   label: string;
//   value: React.ReactNode;
// };

// function MetricBox({ label, value }: MetricBoxProps) {
//   return (
//     <div className="bg-gray-900/70 border border-gray-700 rounded-xl px-3 py-2">
//       <div className="text-[11px] text-gray-400 mb-1">{label}</div>
//       <div className="text-base font-semibold text-gray-100">{value}</div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { getSellerProfile } from "../services/dk";

export default function SellerProfile() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getSellerProfile();
        setData(res);
      } catch (e: any) {
        setErr(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg animate-pulse">
        <div className="h-5 w-40 bg-gray-700 rounded mb-4" />
        <div className="h-4 w-64 bg-gray-700 rounded mb-2" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="h-16 bg-gray-700 rounded" />
          <div className="h-16 bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="bg-red-900/40 border border-red-700 text-red-100 text-sm rounded-2xl px-4 py-3">
        {err}
      </div>
    );
  }

  if (!data) return null;

  const metrics = data.metrics || {};
  const monthlyRevenue = metrics.monthly_revenue ?? metrics.monthlyRevenue;
  const monthlyOrders = metrics.monthly_orders ?? metrics.monthlyOrders;

  // --- مهم: انگلیسی کردن عنوان فروشگاه آزمایشی ---
  const rawShopTitle = data.shop_title || data.shopTitle;
  const shopTitle =
    rawShopTitle === "فروشگاه آزمایشی EDA"
      ? "EDA demo store"
      : rawShopTitle || "Untitled shop";
  // -------------------------------------------------

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg space-y-6">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold mb-1">Seller profile</h2>
          <p className="text-sm text-gray-300">
            {shopTitle}
          </p>
          {data.shop_url && (
            <a
              href={data.shop_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block"
            >
              {data.shop_url}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data.profile_type && (
            <span className="px-3 py-1 text-xs rounded-full bg-gray-900 border border-gray-700 text-gray-200">
              Profile type: {data.profile_type}
            </span>
          )}
          {data.seller_code && (
            <span className="px-3 py-1 text-xs rounded-full bg-indigo-600/20 border border-indigo-500/60 text-indigo-200">
              Seller code: {data.seller_code}
            </span>
          )}
        </div>
      </div>

      {/* main info + metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* left: basic info */}
        <div className="space-y-3 text-sm">
          <ProfileRow label="City" value={data.city || "-"} />
          {data.email && <ProfileRow label="Email" value={data.email} />}
          {data.username && (
            <ProfileRow label="Username" value={data.username} />
          )}
        </div>

        {/* right: metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <MetricBox
            label="Total products"
            value={metrics.total_products ?? metrics.totalProducts ?? "-"}
          />
          <MetricBox
            label="Active products"
            value={metrics.active_products ?? metrics.activeProducts ?? "-"}
          />
          <MetricBox
            label="Monthly orders"
            value={
              monthlyOrders != null ? monthlyOrders.toLocaleString() : "-"
            }
          />
          <MetricBox
            label="Monthly revenue"
            value={
              monthlyRevenue != null
                ? `${Number(monthlyRevenue).toLocaleString()} Toman`
                : "-"
            }
          />
        </div>
      </div>

      {/* raw JSON for debugging */}
      <details className="mt-4">
        <summary className="text-xs text-gray-400 cursor-pointer">
          Show full profile JSON
        </summary>
        <pre className="mt-2 text-[11px] bg-gray-900 p-3 rounded-lg overflow-auto max-h-72">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}

type ProfileRowProps = {
  label: string;
  value: React.ReactNode;
};

function ProfileRow({ label, value }: ProfileRowProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-400 text-xs w-24">{label}</span>
      <span className="text-gray-100">{value || "-"}</span>
    </div>
  );
}

type MetricBoxProps = {
  label: string;
  value: React.ReactNode;
};

function MetricBox({ label, value }: MetricBoxProps) {
  return (
    <div className="bg-gray-900/70 border border-gray-700 rounded-xl px-3 py-2">
      <div className="text-[11px] text-gray-400 mb-1">{label}</div>
      <div className="text-base font-semibold text-gray-100">{value}</div>
    </div>
  );
}
