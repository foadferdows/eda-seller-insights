import { apiGet } from "./api";

export async function getSellerProfile() {
  return apiGet("/dk/profile/");
}

export async function getProfitMargin() {
  return apiGet("/insights/profit-margin/");
}

export async function getSlowMovers() {
  return apiGet("/insights/slow-movers/");
}

export async function getBreakeven() {
  return apiGet("/insights/breakeven/");
}

export async function getGoldenTimes() {
  return apiGet("/insights/golden-times/");
}

export async function getRevenueForecast() {
  return apiGet("/insights/revenue-forecast/");
}

export async function getDiscountCompetition() {
  return apiGet("/insights/discount-competition/");
}

export async function getRestockTime() {
  return apiGet("/insights/restock-time/");
}

export async function getSpeedCompare() {
  return apiGet("/insights/speed-compare/");
}

export async function getCommentAnalysis() {
  return apiGet("/insights/comment-analysis/");
}

