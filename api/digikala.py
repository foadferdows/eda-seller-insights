import requests
from typing import Dict, Any
from django.conf import settings


# api/digikala.py

import requests


# ---------- Custom Exceptions ----------
class DigikalaAPIError(Exception):
    """Raised when Digikala API returns an error or unexpected response."""
    pass


class AuthFailedError(Exception):
    """Raised when authentication with Digikala API fails."""
    pass


# ---------- Placeholder (for future real Digikala connection) ----------

def get_profile_with_user_token(token: str):
    """
    در مرحله فعلی از این استفاده نمیشود،
    ولی بعداً برای اتصال واقعی به دیجی‌کالا اینجا را تکمیل می‌کنی.
    """
    raise NotImplementedError("Real Digikala integration is not enabled yet.")


DK_BASE = getattr(settings, "DK_SELLER_BASE", "https://seller.digikala.com/api/v1")
TIMEOUT = 12

def _headers(token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {token}", "Accept": "application/json"}

def validate_token_and_get_profile(token: str) -> Dict[str, Any]:
    r = requests.get(f"{DK_BASE}/profile/", headers=_headers(token), timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()

def get_profile_with_user_token(token: str) -> Dict[str, Any]:
    r = requests.get(f"{DK_BASE}/profile/", headers=_headers(token), timeout=TIMEOUT)
    if r.status_code == 401:
        # توکن منقضی/باطل؛ به کاربر پیام بده دوباره وارد شود.
        r.raise_for_status()
    r.raise_for_status()
    return r.json()

import requests

def get_products_from_dk(token: str):
    url = "https://seller.digikala.com/api/v1/products/"
    headers = {"Authorization": f"Token {token}"}
    r = requests.get(url, headers=headers, timeout=20)
    if r.status_code != 200:
        raise Exception(f"Digikala error: {r.text}")
    return r.json()

