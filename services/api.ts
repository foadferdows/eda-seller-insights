// src/services/api.ts
const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export function getJwt(): string | null {
  try {
    return localStorage.getItem("access");
  } catch {
    return null;
  }
}

export function setJwt(access: string, refresh?: string) {
  try {
    localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
  } catch {
    // نادیده گرفتن خطای localStorage در dev
  }
}

export async function apiGet(path: string) {
  const token = getJwt();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    // اگر توکن منقضی شده، localStorage را پاک کن و صفحه را رفرش کن
    if (res.status === 401 && text.includes("token_not_valid")) {
      try {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      } catch {}
      // برگرداندن کاربر به صفحه لاگین
      window.location.reload();
    }
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function post(path: string, body: any) {
  const token = getJwt();

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    // اگر توکن منقضی شده، مثل apiGet هندل کن
    if (res.status === 401 && text.includes("token_not_valid")) {
      try {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      } catch {}
      window.location.reload();
    }
    throw new Error(text || res.statusText);
  }

  return text ? JSON.parse(text) : null;
}

