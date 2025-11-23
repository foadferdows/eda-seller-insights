import React from "react";
import { fetchCardAnalysis, CardAnalysisPayload } from "../../services/api"; // مسیر را مطابق پروژه اصلاح کن

type MetricCardProps = {
  title: string;
  children: React.ReactNode;

  // فعال کردن مودال و دکمه
  showMoreButton?: boolean;

  // برای فراخوانی تحلیل
  cardId?: string;
  productId?: string | null;
  cardData?: any;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  children,
  showMoreButton = false,
  cardId,
  productId,
  cardData,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // وقتی مودال باز شود، اگر cardId داریم و قبلاً تحلیل نگرفته‌ایم، ریکوئست بزن
  React.useEffect(() => {
    if (!expanded || !showMoreButton || !cardId) return;
    if (analysis !== null || loading) return;

    const payload: CardAnalysisPayload = {
      card_id: cardId,
      product_id: productId ?? undefined,
      card_data: cardData ?? {},
    };

    setLoading(true);
    setError(null);

    fetchCardAnalysis(payload)
      .then((text) => {
        setAnalysis(text || "");
      })
      .catch((e) => {
        console.error("fetchCardAnalysis error", e);
        setError("Could not load AI analysis.");
      })
      .finally(() => setLoading(false));
  }, [expanded, showMoreButton, cardId, productId, cardData, analysis, loading]);

  const body = (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-100">{title}</h3>

        {showMoreButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
            className="text-xs px-3 py-1 rounded-full border border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500 transition-colors"
          >
            More analysis
          </button>
        )}
      </div>

      <div className="text-sm text-gray-100 space-y-1">{children}</div>
    </>
  );

  return (
    <>
      <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
        {body}
      </div>

      {showMoreButton && expanded && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70"
          onClick={() => setExpanded(false)}
        >
          <div
            className="bg-gray-900 max-w-3xl w-full mx-4 rounded-2xl border border-gray-700 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-50">{title}</h3>

              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-xs px-3 py-1 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-400 transition-colors"
              >
                Close
              </button>
            </div>

            {/* دیتای اصلی کارت */}
            <div className="text-sm text-gray-100 space-y-2 max-h-[60vh] overflow-y-auto">
              {children}
            </div>

            {/* تحلیل GPT پایین دیتا */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <h4 className="text-sm font-semibold mb-2 text-gray-200">
                AI brief analysis
              </h4>

              {loading && (
                <p className="text-xs text-gray-400">
                  Generating analysis…
                </p>
              )}

              {!loading && error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              {!loading && !error && analysis && analysis.trim().length > 0 && (
                <p className="text-sm leading-relaxed text-gray-100 whitespace-pre-line">
                  {analysis}
                </p>
              )}

              {!loading && !error && (!analysis || analysis.trim().length === 0) && (
                <p className="text-xs text-gray-500">
                  No extra AI analysis configured for this card.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const StatRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between text-sm py-1">
    <span className="text-gray-400">{label}</span>
    <span className="text-gray-100 font-medium">{value}</span>
  </div>
);


// import React from "react";

// type MetricCardProps = {
//   title: string;
//   children: React.ReactNode;
//   /** فقط روی کارت‌هایی که می‌خواهی دکمه «More analysis» داشته باشند true بکن */
//   showMoreButton?: boolean;
// };

// export const MetricCard: React.FC<MetricCardProps> = ({
//   title,
//   children,
//   showMoreButton = false,
// }) => {
//   const [expanded, setExpanded] = React.useState(false);

//   // محتوای اصلی کارت
//   const body = (
//     <>
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-lg font-semibold text-gray-100">{title}</h3>

//         {showMoreButton && (
//           <button
//             type="button"
//             onClick={(e) => {
//               e.stopPropagation();
//               setExpanded(true);
//             }}
//             className="text-xs px-3 py-1 rounded-full border border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500 transition-colors"
//           >
//             More analysis
//           </button>
//         )}
//       </div>

//       <div className="text-sm text-gray-100 space-y-1">{children}</div>
//     </>
//   );

//   return (
//     <>
//       {/* حالت عادی کارت داخل گرید */}
//       <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
//         {body}
//       </div>

//       {/* حالت تمام‌صفحه برای تحلیل بیشتر */}
//       {showMoreButton && expanded && (
//         <div
//           className="fixed inset-0 z-40 flex items-center justify-center bg-black/70"
//           onClick={() => setExpanded(false)}
//         >
//           <div
//             className="bg-gray-900 max-w-3xl w-full mx-4 rounded-2xl border border-gray-700 shadow-2xl p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-xl font-semibold text-gray-50">{title}</h3>

//               <button
//                 type="button"
//                 onClick={() => setExpanded(false)}
//                 className="text-xs px-3 py-1 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-400 transition-colors"
//               >
//                 Close
//               </button>
//             </div>

//             <div className="text-sm text-gray-100 space-y-2 max-h-[70vh] overflow-y-auto">
//               {children}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export const StatRow: React.FC<{
//   label: string;
//   value: React.ReactNode;
// }> = ({ label, value }) => (
//   <div className="flex justify-between text-sm py-1">
//     <span className="text-gray-400">{label}</span>
//     <span className="text-gray-100 font-medium">{value}</span>
//   </div>
// );

// // import React from "react";

// // export const MetricCard: React.FC<{
// //   title: string;
// //   children: React.ReactNode;
// // }> = ({ title, children }) => (
// //   <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
// //     <h3 className="text-lg font-semibold mb-3 text-gray-100">{title}</h3>
// //     {children}
// //   </div>
// // );

// // export const StatRow: React.FC<{
// //   label: string;
// //   value: React.ReactNode;
// // }> = ({ label, value }) => (
// //   <div className="flex justify-between text-sm py-1">
// //     <span className="text-gray-400">{label}</span>
// //     <span className="text-gray-100 font-medium">{value}</span>
// //   </div>
// // );

