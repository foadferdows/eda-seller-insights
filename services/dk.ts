// src/services/dk.ts
import { apiGet } from "./api";

// حتماً export نام‌دار باشد (هم‌نام با import در SellerProfile)
export async function getSellerProfile() {
  // بک‌اند: GET /api/dk/profile/
  return apiGet("/dk/profile/");
}

