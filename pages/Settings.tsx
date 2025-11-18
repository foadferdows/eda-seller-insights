// src/pages/Settings.tsx
import React, { useEffect, useState } from "react";
import {
  getSellerSettings,
  updateSellerSettings,
  type SellerSettings,
} from "../services/settings";

export default function Settings() {
  const [form, setForm] = useState<SellerSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getSellerSettings();
        setForm(data);
      } catch (e: any) {
        console.error("getSellerSettings error:", e);
        setError(e?.message || "خطا در دریافت تنظیمات");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (field: keyof SellerSettings, value: number) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      setSaving(true);
      setError(null);
      const updated = await updateSellerSettings(form);
      setForm(updated);
      setSuccess("تنظیمات با موفقیت ذخیره شد.");
    } catch (e: any) {
      console.error("updateSellerSettings error:", e);
      setError(e?.message || "خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg max-w-xl animate-pulse">
        <div className="h-4 w-1/3 bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-3 bg-gray-700 rounded w-5/6" />
          <div className="h-3 bg-gray-700 rounded w-4/6" />
          <div className="h-3 bg-gray-700 rounded w-3/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg max-w-xl">
      <h2 className="text-xl font-semibold mb-4">⚙️ تنظیمات تحلیل‌ها</h2>
      <p className="text-sm text-gray-400 mb-4">
        این مقادیر در خروجی اینسایت‌ها استفاده می‌شوند (slow-mover، حاشیه سود، موجودی و…).
      </p>

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-100 text-xs rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-emerald-900/30 border border-emerald-600 text-emerald-100 text-xs rounded-lg px-3 py-2">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <SettingField
          label="درصد هزینه‌های جانبی (بسته‌بندی، ارسال، مالیات تقریبی)"
          value={form.extra_cost_pct}
          onChange={(v) => handleChange("extra_cost_pct", v)}
          suffix="%"
        />

        <SettingField
          label="حداقل سرعت فروش برای slow-mover (واحد در هفته)"
          value={form.slow_mover_min_speed}
          onChange={(v) => handleChange("slow_mover_min_speed", v)}
          suffix="واحد/هفته"
        />

        <SettingField
          label="حداقل حاشیه سود قابل قبول برای slow-mover"
          value={form.slow_mover_min_margin}
          onChange={(v) => handleChange("slow_mover_min_margin", v)}
          suffix="%"
        />

        <SettingField
          label="زمان تأمین معمول از تأمین‌کننده (lead time)"
          value={form.lead_time_days}
          onChange={(v) => handleChange("lead_time_days", v)}
          suffix="روز"
        />

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </button>
        </div>
      </form>
    </div>
  );
}

type SettingFieldProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
};

function SettingField({ label, value, onChange, suffix }: SettingFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-200">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 w-32 focus:outline-none focus:border-emerald-500"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        {suffix && <span className="text-xs text-gray-400">{suffix}</span>}
      </div>
    </div>
  );
}

