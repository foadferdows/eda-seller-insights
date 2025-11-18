// src/services/dk.ts
import { apiGet } from "./api";

// پروفایل سلر از بک‌اند: GET /api/dk/profile/
export async function getSellerProfile() {
  return apiGet("/dk/profile/");
}

// کمک‌کننده برای اضافه‌کردن sku به query string
function withSku(path: string, sku?: string) {
  if (!sku) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}sku=${encodeURIComponent(sku)}`;
}

// --- Insights endpoints ---

export async function getProfitMargin(sku?: string) {
  return apiGet(withSku("/insights/profit-margin/", sku));
}

export async function getSlowMovers(sku?: string) {
  return apiGet(withSku("/insights/slow-movers/", sku));
}

export async function getBreakeven(sku?: string) {
  return apiGet(withSku("/insights/breakeven/", sku));
}

export async function getGoldenTimes(sku?: string) {
  return apiGet(withSku("/insights/golden-times/", sku));
}

export async function getRevenueForecast(sku?: string) {
  return apiGet(withSku("/insights/revenue-forecast/", sku));
}

export async function getDiscountCompetition(sku?: string) {
  return apiGet(withSku("/insights/discount-competition/", sku));
}

export async function getRestockTime(sku?: string) {
  return apiGet(withSku("/insights/restock-time/", sku));
}

export async function getSpeedCompare(sku?: string) {
  return apiGet(withSku("/insights/speed-compare/", sku));
}

export async function getCommentAnalysis(sku?: string) {
  return apiGet(withSku("/insights/comment-analysis/", sku));
}

