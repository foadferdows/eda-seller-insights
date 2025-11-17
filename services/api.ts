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
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function post(path: string, body: any) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

