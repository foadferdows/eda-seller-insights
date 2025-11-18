// src/services/settings.ts
import { apiGet, post } from "./api";

export type SellerSettings = {
  extra_cost_pct: number;
  slow_mover_min_speed: number;
  slow_mover_min_margin: number;
  lead_time_days: number;
};

export async function getSellerSettings(): Promise<SellerSettings> {
  return apiGet("/settings/");
}

export async function updateSellerSettings(
  payload: Partial<SellerSettings>
): Promise<SellerSettings> {
  return post("/settings/", payload);
}

