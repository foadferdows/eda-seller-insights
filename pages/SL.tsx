import React, { useState } from "react";
import { loginWithSellerToken } from "../services/dk";

export default function SellerLogin({ onSuccess }: { onSuccess: () => void }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      await loginWithSellerToken(token.trim());
      onSuccess();
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded-2xl border border-gray-700">
      <h2 className="text-xl font-semibold mb-4">ورود با توکن دیجی‌کالا</h2>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Seller API Token"
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2"
          required
        />
        {err && <div className="text-red-400 text-sm">{err}</div>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "در حال بررسی..." : "ورود"}
        </button>
      </form>
      <p className="text-gray-400 text-xs mt-3">
        * این توکن فقط روی سرور ذخیره می‌شود و برای دیجی‌کالا ارسال می‌گردد؛ در مرورگر نگه‌داری نمی‌کنیم.
      </p>
    </div>
  );
}

