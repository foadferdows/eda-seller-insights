import requests
from typing import Dict, Any
from django.conf import settings

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

