// src/pages/SellerLogin.tsx
import React, { useState } from "react";
import { post, setJwt } from "../services/api";

interface Props {
  onSuccess: () => void;
}

export default function SellerLogin({ onSuccess }: Props) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await post("/auth/seller/login/", {
        seller_token: token.trim(),
      });
      // انتظار داریم بک‌اند access/refresh بده؛ اگر نداده، خودمان fake می‌سازیم
      if (data.access) {
        setJwt(data.access, data.refresh);
      } else {
        // dev: JWT فیک
      //   setJwt("FAKE_JWT_ACCESS");
      // }
      throw new Error("Invalid token");
    }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">
      Login to EDA Seller Dashboard
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter your Digikala Seller Token"
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        {error && (
          <div className="text-red-400 text-xs whitespace-pre-wrap">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 text-sm font-medium"
        >
      {loading ? "Checking..." : "Login"}
      </button>
      </form>

    </div>
  );
}

