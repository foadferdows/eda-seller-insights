# api/views_insights.py
from __future__ import annotations
from calendar import monthrange

import csv
import math
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, date
from pathlib import Path
from typing import Dict, List, Any, Optional

from django.conf import settings

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SellerSettings


# ---------- helpers: reading CSV & settings ----------


DATA_DIR = Path(settings.BASE_DIR) / "data"


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        if value is None or value == "":
            return default
        return int(float(value))
    except (TypeError, ValueError):
        return default


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .digikala import get_products_from_dk
from .data_loader import (
    load_fake_products,
    load_fake_sales,
    load_fake_inventory,
    load_fake_pricing,
    load_fake_reviews,
)

@api_view(["POST"])
def insights_products(request):
    """
    اگر توکن FAKE باشد → دیتا از CSV خوانده می‌شود
    اگر واقعی باشد → دیتا از دیجی‌کالا خوانده می‌شود
    """

    token = request.data.get("seller_token")
    if not token:
        return Response(
            {"error": "seller_token is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # حالت تست (FAKE)
    if token == "FAKE_SELLER_TOKEN":
        products = load_fake_products()
        sales = load_fake_sales()
        inventory = load_fake_inventory()
        pricing = load_fake_pricing()
        reviews = load_fake_reviews()

        # یکپارچه‌سازی داده‌ها
        result = []
        for p in products:
            pid = p["product_id"]

            result.append({
                "product_id": pid,
                "title": p.get("title"),
                "category": p.get("category"),
                "brand": p.get("brand"),
                "cost_price": p.get("cost_price"),
                "selling_price": p.get("selling_price"),

                "sales": [s for s in sales if s["product_id"] == pid],
                "inventory": next((i for i in inventory if i["product_id"] == pid), None),
                "pricing_history": [h for h in pricing if h["product_id"] == pid],
                "reviews": [r for r in reviews if r["product_id"] == pid],
            })

        return Response(result)

    # حالت واقعی → درخواست به دیجی‌کالا
    try:
        data = get_products_from_dk(token)
        return Response(data)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or value == "":
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _parse_date(s: str) -> Optional[date]:
    if not s:
        return None
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def _read_csv(name: str) -> List[Dict[str, Any]]:
    path = DATA_DIR / name
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [dict(row) for row in reader]


@dataclass
class ExistingData:
    products: List[Dict[str, Any]]
    sales: List[Dict[str, Any]]
    inventory: List[Dict[str, Any]]
    pricing: List[Dict[str, Any]]
    reviews: List[Dict[str, Any]]
    restocks: List[Dict[str, Any]]  


def _load_existing_data() -> ExistingData:
    products = _read_csv("products.csv")
    sales = _read_csv("sales.csv")
    inventory = _read_csv("inventory.csv")
    pricing = _read_csv("pricing.csv")
    reviews = _read_csv("reviews.csv")
    restocks = _read_csv("restocks.csv") 

    # نرمال‌سازی ساده‌ی انواع
    for r in restocks:
        r["typical_restock_delay_days"] = _safe_int(
            r.get("typical_restock_delay_days")
        )
        r["supplier_lead_time_days"] = _safe_int(
            r.get("supplier_lead_time_days")
        )
    for p in products:
        p["cost_price"] = _safe_float(p.get("cost_price"))
        p["selling_price"] = _safe_float(p.get("selling_price"))

    for s in sales:
        s["quantity"] = _safe_int(s.get("quantity"))
        s["unit_price"] = _safe_float(
            s.get("unit_price") or s.get("final_price")
        )
        s["discount_pct"] = _safe_float(s.get("discount_pct"))
        s["date"] = _parse_date(s.get("sale_date") or s.get("date"))




    for pr in pricing:
        pr["your_price"] = _safe_float(pr.get("your_price"))
        pr["your_discount_pct"] = _safe_float(pr.get("your_discount_pct"))
        pr["competitor_min_price"] = _safe_float(pr.get("competitor_min_price"))
        pr["competitor_max_price"] = _safe_float(pr.get("competitor_max_price"))
        pr["competitor_avg_price"] = _safe_float(pr.get("competitor_avg_price"))

    # load inventory.csv
    inventory_path = settings.BASE_DIR / "data" / "inventory.csv"
    inventory = []
    try:
        with open(inventory_path, "r", encoding="utf-8") as f:
            inventory = list(csv.DictReader(f))
    except:
        inventory = []

    # normalize inventory
    for inv in inventory:
        inv["current_stock"] = _safe_int(inv.get("current_stock"))


    # load restocks.csv
    restocks_path = settings.BASE_DIR / "data" / "restocks.csv"
    restocks = []
    try:
        with open(restocks_path, "r", encoding="utf-8") as f:
            restocks = list(csv.DictReader(f))
    except:
        restocks = []

    # normalize restocks
    for r in restocks:
        r["typical_restock_delay_days"] = _safe_float(r.get("typical_restock_delay_days"))
        r["supplier_lead_time_days"] = _safe_float(r.get("supplier_lead_time_days"))



    for r in reviews:
        r["rating"] = _safe_int(r.get("rating"))
        # sentiment: "positive" / "neutral" / "negative" (همان رشته‌ی CSV)

    return ExistingData(
        products=products,
        sales=sales,
        inventory=inventory,
        pricing=pricing,
        reviews=reviews,
        restocks=restocks, 
    )


def _get_seller_settings(user) -> SellerSettings:
    """
    گرفتن تنظیمات کاربر، با مقدارهای پیش‌فرض معقول اگر قبلاً چیزی ذخیره نشده باشد.
    """
    obj, _created = SellerSettings.objects.get_or_create(
        user=user,
        defaults={
            "extra_cost_pct": 3.0,
            "slow_mover_min_speed": 3,
            "slow_mover_min_margin": 10.0,
            "lead_time_days": 12,
        },
    )
    return obj


# ---------- helpers: basic aggregates ----------


def _build_index_by_product_id(products: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    return {p["product_id"]: p for p in products if p.get("product_id")}


def _sales_by_product(sales: List[Dict[str, Any]]):
    totals_qty: Dict[str, int] = defaultdict(int)
    totals_revenue: Dict[str, float] = defaultdict(float)
    min_date: Dict[str, date] = {}
    max_date: Dict[str, date] = {}

    for s in sales:
        pid = s.get("product_id")
        if not pid:
            continue
        qty = _safe_int(s.get("quantity"))
        price = _safe_float(s.get("unit_price"))
        d = s.get("date")
        totals_qty[pid] += qty
        totals_revenue[pid] += qty * price
        if d:
            if pid not in min_date or d < min_date[pid]:
                min_date[pid] = d
            if pid not in max_date or d > max_date[pid]:
                max_date[pid] = d

    return totals_qty, totals_revenue, min_date, max_date


def _margin_for_product(product: Dict[str, Any], extra_cost_pct: float, commission_pct: float = 19.0):
    price = _safe_float(product.get("selling_price"))
    cost = _safe_float(product.get("cost_price"))
    other_costs = price * (extra_cost_pct / 100.0)
    commission_fee = price * (commission_pct / 100.0)
    net_profit = price - cost - other_costs - commission_fee
    margin_pct = (net_profit / price * 100.0) if price > 0 else 0.0
    return {
        "price": price,
        "cost": cost,
        "other_costs": other_costs,
        "commission_fee": commission_fee,
        "net_profit": net_profit,
        "margin_pct": margin_pct,
    }


# ============================================================
# 1) Profit margin insight
# ============================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profit_margin(request):
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights are not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    data = _load_existing_data()
    if not data.products:
        return Response(
            {"detail": "No existing products data found."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    settings_obj = _get_seller_settings(request.user)
    extra_cost_pct = float(settings_obj.extra_cost_pct or 0)

    totals_qty, _, _, _ = _sales_by_product(data.sales)

    # اگر هیچ فروشی نباشد، اولین محصول را به عنوان نمونه نشان می‌دهیم
    focus_pid = None
    if totals_qty:
        focus_pid = max(totals_qty.items(), key=lambda x: x[1])[0]
    else:
        focus_pid = data.products[0]["product_id"]

    products_index = _build_index_by_product_id(data.products)
    product = products_index.get(focus_pid, data.products[0])

    margin = _margin_for_product(product, extra_cost_pct)

    response = {
        "product_id": product.get("product_id"),
        "title": product.get("title"),
        "category": product.get("category"),
        "brand": product.get("brand"),
        "price": round(margin["price"], 2),
        "buy_price": round(margin["cost"], 2),
        "commission_pct": 19.0,
        "other_costs": round(margin["other_costs"], 2),
        "net_profit": round(margin["net_profit"], 2),
        "margin_pct": round(margin["margin_pct"], 2),
        "sold_units": totals_qty.get(product.get("product_id"), 0),
    }

    return Response(response)


# ============================================================
# 2) Slow movers insight
# ============================================================



from collections import defaultdict
from datetime import date

def _compute_slow_movers(
    products,
    sales,
    extra_cost_pct: float = 10.0,
    min_weekly_sales: int = 3,
    min_margin_pct: float = 10.0,
    min_days_active: int = 14,
    sku_filter: str | None = None,
):
    """
    محاسبه محصولات کم‌تحرک (slow-mover):

    - فقط محصولاتی را نگه می‌داریم که سرعت فروش هفتگی‌شان کمتر از min_weekly_sales باشد.
    - اگر حاشیه سود هم از min_margin_pct کمتر باشد → پیشنهاد «حذف/خروج».
    - اگر حاشیه سود مناسب باشد ولی فروش کم باشد → پیشنهاد «تخفیف برای خروج موجودی».
    - محصولات بسیار تازه (کمتر از min_days_active روز) نادیده گرفته می‌شوند.
    - اگر sku_filter داده شود، فقط همان محصول بررسی می‌شود.
    """
    products_index = {p["product_id"]: p for p in products}

    totals_qty = defaultdict(int)
    first_date: dict[str, date] = {}
    last_date: dict[str, date] = {}

    # جمع‌کردن فروش‌ها بر اساس محصول
    for s in sales:
        pid = s["product_id"]

        if sku_filter and pid != sku_filter:
            continue

        d = s.get("date") or s.get("sale_date")
        if isinstance(d, str):
            d = date.fromisoformat(d)

        qty = int(s.get("quantity", 0) or 0)
        totals_qty[pid] += qty

        if pid not in first_date or d < first_date[pid]:
            first_date[pid] = d
        if pid not in last_date or d > last_date[pid]:
            last_date[pid] = d

    items = []

    for pid, product in products_index.items():
        if sku_filter and pid != sku_filter:
            continue

        total_qty = totals_qty.get(pid, 0)

        # اگر اصلاً فروشی ثبت نشده، بازه زمانی نداریم
        if pid in first_date and pid in last_date:
            days_active = max((last_date[pid] - first_date[pid]).days, 1)
        else:
            days_active = 1

        # نادیده گرفتن محصولات خیلی تازه
        if days_active < min_days_active:
            continue

        weeks_active = max(days_active / 7.0, 1.0)
        weekly_sales = total_qty / weeks_active

        # فقط کم‌تحرک‌ها
        if weekly_sales >= min_weekly_sales:
            continue

        # حاشیه سود (همان منطق عمومی)
        margin_info = _margin_for_product(
            product,
            extra_cost_pct=extra_cost_pct,
            commission_pct=19.0,  # فعلاً ثابت برای داده فیک
        )
        margin_pct = float(margin_info.get("margin_pct") or 0.0)

        # شاخص سودآوری بر اساس فرمول:
        # profitability_index = (میانگین فروش هفتگی × حاشیه سود واحد) ÷ میانگین موجودی
        selling_price = float(product.get("selling_price") or 0) or 1.0
        # حاشیه سود واحد به تومان
        profit_per_unit = (margin_pct / 100.0) * selling_price

        stock = float(product.get("stock", 0) or 0.0)
        avg_inventory = max(stock, 1.0)  # برای جلوگیری از تقسیم بر صفر

        profitability_index = (weekly_sales * profit_per_unit) / avg_inventory

        if margin_pct < min_margin_pct:
            action = "remove"
            reason = "Slow sales velocity and poor profit margins; suggest product withdrawal or replacement."
        else:
            action = "discount"
            reason = "Slow sales pace but acceptable profit margin; offer discounts to clear inventory."

        items.append(
            {
                "product_id": pid,
                "sku": pid,  # در دیتای فیک sku = product_id
                "title": product.get("title"),
                "category": product.get("category"),
                "weekly_sales": round(weekly_sales, 2),
                "total_sold": int(total_qty),
                "margin_pct": round(margin_pct, 1),
                "stock": stock,
                "days_active": days_active,
                "profit_per_unit": round(profit_per_unit, 2),
                "profitability_index": round(profitability_index, 2),
                "recommendation": action,
                "reason": reason,
            }
        )

    # کندترین‌ها اول
    items_sorted = sorted(items, key=lambda x: x["weekly_sales"])

    return {
        "thresholds": {
            "min_weekly_sales": min_weekly_sales,
            "min_margin_pct": min_margin_pct,
            "min_days_active": min_days_active,
            "extra_cost_pct": extra_cost_pct,
        },
        "items": items_sorted[:20],
    }


@api_view(["GET"])
def slow_movers(request: Request):
    """
    محصولات کم‌تحرک:

    - محصولاتی که سرعت فروش هفتگی‌شان از حد آستانه کمتر است.
    - آستانه‌ها از SellerSettings خوانده می‌شود و در UI (تب Settings) قابل تنظیم است.
    - اگر کوئری‌پارامتر ?sku= داده شود، فقط همان محصول بررسی و برگردانده می‌شود.
    """
    if not settings.USE_FAKE_SELLER:
        # در آینده: همین متد را روی داده واقعی دیجی‌کالا صدا می‌زنیم.
        return Response(
            {"detail": "Not implemented for real Digikala data yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    data = _load_existing_data()
    settings_obj = _get_seller_settings(request.user)

    # از تنظیمات کاربر بخوان
    extra_cost_pct = float(getattr(settings_obj, "extra_cost_pct", 0) or 0)
    min_weekly_sales = int(getattr(settings_obj, "slow_mover_min_speed", 3) or 3)
    min_margin_pct = float(getattr(settings_obj, "slow_mover_min_margin", 10.0) or 10.0)

    sku_filter = request.GET.get("sku") or None

    result = _compute_slow_movers(
        data.products,
        data.sales,
        extra_cost_pct=extra_cost_pct,
        min_weekly_sales=min_weekly_sales,
        min_margin_pct=min_margin_pct,
        min_days_active=14,  # اگر خواستی می‌تونیم این رو هم بعداً قابل تنظیم کنیم
        sku_filter=sku_filter,
    )

    return Response(result)


# ============================================================
# 3) Breakeven (ساده، از روی دیتای موجود)
# ============================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def breakeven(request):
    """
    Breakeven for a single product (selected SKU).

    - اگر ?sku= داده شود همان محصول را حساب می‌کند.
    - اگر نه، پرفروش‌ترین محصول را به‌عنوان نمونه استفاده می‌کند.
    """
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights are not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    data = _load_existing_data()
    if not data.products:
        return Response(
            {"detail": "No products data."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    settings_obj = _get_seller_settings(request.user)
    extra_cost_pct = float(getattr(settings_obj, "extra_cost_pct", 0) or 0)

    sku = request.GET.get("sku") or None

    products_index = _build_index_by_product_id(data.products)
    totals_qty, _, _, _ = _sales_by_product(data.sales)

    # انتخاب product_id
    if sku and sku in products_index:
        pid = sku
    elif totals_qty:
        pid = max(totals_qty.items(), key=lambda x: x[1])[0]
    else:
        pid = data.products[0].get("product_id")

    product = products_index.get(pid)
    if not product:
        return Response(
            {"detail": "Product not found for breakeven."},
            status=status.HTTP_404_NOT_FOUND,
        )

    margin = _margin_for_product(product, extra_cost_pct)
    price = margin["price"]
    net_profit = margin["net_profit"]

    # فرض ساده برای fixed cost؛ بعداً می‌توانی تنظیم‌پذیرش کنی
    fixed_costs = price * 50 if price > 0 else 0.0
    variable_cost = price - net_profit  # cost + other_costs + commission

    breakeven_units = (
        math.ceil(fixed_costs / net_profit) if net_profit > 0 else None
    )
    current_sold_units = totals_qty.get(pid, 0)

    if breakeven_units and breakeven_units > 0:
        progress_pct = min(current_sold_units / breakeven_units * 100.0, 999.0)
    else:
        progress_pct = 0.0

    payload = {
        "product_id": pid,
        "title": product.get("title"),
        "price": round(price, 2),
        "fixed_costs": round(fixed_costs, 2),
        "variable_cost": round(variable_cost, 2),
        "breakeven_units": int(breakeven_units or 0),
        "current_sold_units": int(current_sold_units),
        "progress_pct": round(progress_pct, 1),
    }
    return Response(payload)



# ============================================================
# 4) Golden times (از روی توزیع روزها، ساده)
# ============================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def golden_times(request):
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights are not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    data = _load_existing_data()
    if not data.sales:
        return Response({"detail": "No sales data."}, status=status.HTTP_400_BAD_REQUEST)

    # توزیع بر اساس روز هفته
    weekday_counts = defaultdict(int)
    for s in data.sales:
        d = s.get("date")
        qty = _safe_int(s.get("quantity"))
        if not d:
            continue
        weekday_counts[d.weekday()] += qty  # Monday=0

    weekday_map = {
        5: "شنبه",
        6: "یکشنبه",
        0: "دوشنبه",
        1: "سه‌شنبه",
        2: "چهارشنبه",
        3: "پنجشنبه",
        4: "جمعه",
    }
    items = [
        {"weekday": weekday_map.get(k, str(k)), "quantity": v}
        for k, v in weekday_counts.items()
    ]
    items.sort(key=lambda x: x["quantity"], reverse=True)

    response = {
        "best_days": items[:3],
        "suggested_hours": ["10-12", "18-21"],  # چون در CSV ساعت نداریم، ثابت است
    }
    return Response(response)


# ============================================================
# 5) Revenue forecast
# ============================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def revenue_forecast(request):
    """
    Revenue forecast for a single product (selected SKU).

    خروجی با UI هماهنگ است:
      - current_month          (e.g. "2024-07")
      - so_far_revenue         درآمد همین ماه تا امروز
      - forecast_revenue       پیش‌بینی درآمد ماه بعد
      - last_month_revenue     درآمد ماه قبل
      - trend                  "increasing" / "decreasing" / "flat"
      - confidence             عدد بین 0 و 1
    """
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights are not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    sku = request.GET.get("sku")
    if not sku:
        return Response(
            {"detail": "sku query param is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    data = _load_existing_data()
    # فقط فروش‌های همین محصول
    sales_sku = [s for s in data.sales if s.get("product_id") == sku]

    if not sales_sku:
        return Response(
            {"detail": "No sales data for given sku."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # جمع درآمد روزانه
    daily_rev = defaultdict(float)
    min_d, max_d = None, None
    for s in sales_sku:
        d = s.get("date")
        qty = _safe_int(s.get("quantity"))
        price = _safe_float(s.get("unit_price"))
        if not d:
            continue
        daily_rev[d] += qty * price
        if not min_d or d < min_d:
            min_d = d
        if not max_d or d > max_d:
            max_d = d

    if not min_d or not max_d:
        return Response(
            {"detail": "No valid dates in sales for this sku."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ماه جاری را از روی آخرین تاریخ فروش فرض می‌کنیم
    cur_year, cur_month = max_d.year, max_d.month
    if cur_month == 1:
        prev_year, prev_month = cur_year - 1, 12
    else:
        prev_year, prev_month = cur_year, cur_month - 1

    # درآمد ماه جاری
    cur_month_rev = sum(
        v
        for d, v in daily_rev.items()
        if d.year == cur_year and d.month == cur_month
    )
    # تعداد روزهایی که برای این ماه دیتا داریم
    cur_days_with_data = len(
        {d.day for d in daily_rev.keys() if d.year == cur_year and d.month == cur_month}
    )
    days_in_cur_month = monthrange(cur_year, cur_month)[1]

    if cur_days_with_data > 0:
        cur_daily_avg = cur_month_rev / cur_days_with_data
    else:
        cur_daily_avg = 0.0

    # پیش‌بینی ساده: ماه بعد = میانگین روزانه فعلی × تعداد روز ماه بعد
    if cur_month == 12:
        next_year, next_month = cur_year + 1, 1
    else:
        next_year, next_month = cur_year, cur_month + 1
    days_in_next_month = monthrange(next_year, next_month)[1]
    forecast_next_month = cur_daily_avg * days_in_next_month

    # درآمد ماه قبل
    last_month_rev = sum(
        v
        for d, v in daily_rev.items()
        if d.year == prev_year and d.month == prev_month
    )

    # trend
    eps = 0.05  # ۵٪ تلرانس
    if last_month_rev <= 0 and forecast_next_month > 0:
        trend = "increasing"
    elif last_month_rev <= 0 and forecast_next_month <= 0:
        trend = "flat"
    else:
        diff_ratio = (forecast_next_month - last_month_rev) / last_month_rev
        if diff_ratio > eps:
            trend = "increasing"
        elif diff_ratio < -eps:
            trend = "decreasing"
        else:
            trend = "flat"

    # confidence: چه‌قدر از روزهای ماه جاری را پوشش داده‌ایم
    confidence = 0.0
    if days_in_cur_month > 0:
        confidence = min(1.0, cur_days_with_data / days_in_cur_month)

    payload = {
        "product_id": sku,
        "current_month": f"{cur_year}-{cur_month:02d}",
        "so_far_revenue": round(cur_month_rev, 2),
        "forecast_revenue": round(forecast_next_month, 2),  # ماه بعد
        "last_month_revenue": round(last_month_rev, 2),
        "trend": trend,
        "confidence": round(confidence, 2),
    }
    return Response(payload)


# ============================================================
# 6) Discount vs competitors (تخفیف مؤثر نسبت به رقبا)
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def discount_competition(request):
    """
    Effective discount vs competitors for a selected SKU,
    based on pricing.csv.
    """
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights are not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    sku = request.GET.get("sku")
    if not sku:
        return Response(
            {"detail": "sku query param is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    data = _load_existing_data()
    products_index = _build_index_by_product_id(data.products)

    product = products_index.get(sku)
    if not product:
        return Response(
            {"detail": "Product not found for given sku."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # match row in pricing.csv
    pricing_row = next(
        (pr for pr in data.pricing if str(pr.get("product_id")) == str(sku)),
        None,
    )

    your_price = _safe_float(
        pricing_row.get("your_price") if pricing_row else product.get("selling_price")
    )
    your_discount_pct = _safe_float(
        pricing_row.get("your_discount_pct") if pricing_row else 0.0
    )
    effective_price = your_price * (1 - your_discount_pct / 100.0)

    comp_min = _safe_float(pricing_row.get("competitor_min_price")) if pricing_row else 0.0
    comp_avg = _safe_float(pricing_row.get("competitor_avg_price")) if pricing_row else 0.0

    if comp_min <= 0 and comp_avg <= 0:
        return Response(
            {
                "your_price": round(your_price, 2),
                "your_discount_pct": your_discount_pct,
                "effective_price": round(effective_price, 2),
                "effective_discount_vs_cheapest_pct": None,
                "position": "no_competitor",
                "competitors": [],
            }
        )

    if comp_min > 0:
        eff_discount_vs_cheapest_pct = ((comp_min - effective_price) / comp_min) * 100.0
    else:
        eff_discount_vs_cheapest_pct = None

    if eff_discount_vs_cheapest_pct is None:
        position = "unknown"
    elif eff_discount_vs_cheapest_pct > 2:
        position = "cheapest"
    elif eff_discount_vs_cheapest_pct < -2:
        position = "more_expensive"
    else:
        position = "in_line"

    competitors_payload = []
    if comp_min > 0:
        competitors_payload.append(
            {"name": "min_competitor_price", "price": round(comp_min, 2)}
        )
    if comp_avg > 0:
        competitors_payload.append(
            {"name": "avg_competitor_price", "price": round(comp_avg, 2)}
        )

    return Response(
        {
            "your_price": round(your_price, 2),
            "your_discount_pct": your_discount_pct,
            "effective_price": round(effective_price, 2),
            "effective_discount_vs_cheapest_pct": round(eff_discount_vs_cheapest_pct, 2)
            if eff_discount_vs_cheapest_pct is not None
            else None,
            "position": position,
            "competitors": competitors_payload,
        }
    )



# ============================================================
# 7) Restock time (inventory + sales)
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def restock_time(request):
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights not implemented"},
            status=501,
        )

    sku = request.GET.get("sku")
    if not sku:
        return Response({"detail": "sku is required"}, status=400)

    data = _load_existing_data()
    products_index = _build_index_by_product_id(data.products)

    product = products_index.get(sku)
    if not product:
        return Response({"detail": "product not found"}, status=404)

    # 1) read inventory
    inv_row = next((i for i in data.inventory if i["product_id"] == sku), None)
    current_stock = inv_row["current_stock"] if inv_row else 0

    # 2) read restock stats
    r_row = next((r for r in data.restocks if r["product_id"] == sku), None)
    typical_delay = r_row["typical_restock_delay_days"] if r_row else 0
    lead_time = r_row["supplier_lead_time_days"] if r_row else 0

    # 3) calculate daily sales avg from last 30 days
    sales_sku = [s for s in data.sales if s["product_id"] == sku]
    if sales_sku:
        daily = defaultdict(float)
        for s in sales_sku:
            if s["date"]:
                daily[s["date"]] += s["quantity"]
        daily_sales_avg = sum(daily.values()) / max(len(daily), 1)
    else:
        daily_sales_avg = 0

    # 4) calculate stockout time
    if daily_sales_avg > 0:
        days_to_stockout = current_stock / daily_sales_avg
    else:
        days_to_stockout = 999999  # practically infinite

    # 5) calculate order recommendation
    risk_level = "normal"
    should_order = False
    recommended_order_qty = 0

    if days_to_stockout <= typical_delay:
        risk_level = "high"
        should_order = True
        recommended_order_qty = int(daily_sales_avg * (typical_delay + 2))

    elif days_to_stockout > 60:
        risk_level = "overstock"

    payload = {
        "product_id": sku,
        "title": product.get("title"),
        "daily_sales_avg": round(daily_sales_avg, 2),
        "current_stock": current_stock,
        "days_to_stockout": round(days_to_stockout, 1),
        "typical_restock_delay_days": typical_delay,
        "supplier_lead_time_days": lead_time,
        "risk_level": risk_level,
        "should_order": should_order,
        "recommended_order_qty": recommended_order_qty,
        "recommendation_text": (
            "Stockout risk detected — ordering is recommended."
            if should_order else
            "Stock level is stable."
        )
    }

    return Response(payload)



# ============================================================
# 8) Speed compare (خیلی ساده؛ دو محصول قدیمی/جدید بر اساس فروش)
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def speed_comparison(request):
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response({"detail": "Not implemented"}, status=501)

    sku = request.GET.get("sku")
    if not sku:
        return Response({"detail": "sku is required"}, status=400)

    data = _load_existing_data()
    products_index = _build_index_by_product_id(data.products)

    product = products_index.get(sku)
    if not product:
        return Response({"detail": "product not found"}, status=404)

    # --- 1) compute sales speed of selected product ---
    sales_sku = [s for s in data.sales if s["product_id"] == sku]
    if sales_sku:
        daily = defaultdict(float)
        for s in sales_sku:
            if s["date"]:
                daily[s["date"]] += s["quantity"]
        new_speed = sum(daily.values()) / max(len(daily), 1)
    else:
        new_speed = 0

    # --- 2) find replacement product (if exists) ---
    replacements = _read_csv("replacements.csv") if os.path.exists(settings.BASE_DIR / "data" / "replacements.csv") else []
    old_product_id = None
    for r in replacements:
        if r["new_product_id"] == sku:
            old_product_id = r["old_product_id"]

    # if no explicit replacement → compare against category average
    if old_product_id:
        old_sales = [s for s in data.sales if s["product_id"] == old_product_id]
        if old_sales:
            daily_old = defaultdict(float)
            for s in old_sales:
                if s["date"]:
                    daily_old[s["date"]] += s["quantity"]
            old_speed = sum(daily_old.values()) / max(len(daily_old), 1)
        else:
            old_speed = 0
        old_title = products_index[old_product_id]["title"]
    else:
        # fallback to category average
        category = product.get("category")
        cat_products = [p for p in data.products if p.get("category") == category]

        speeds = []
        for p in cat_products:
            sales_p = [s for s in data.sales if s["product_id"] == p["product_id"]]
            if not sales_p:
                continue
            daily_p = defaultdict(float)
            for s in sales_p:
                if s["date"]:
                    daily_p[s["date"]] += s["quantity"]
            speed = sum(daily_p.values()) / max(len(daily_p), 1)
            speeds.append(speed)

        old_speed = sum(speeds) / max(len(speeds), 1) if speeds else 0
        old_title = f"Category average ({category})"

    # --- 3) compare speeds ---
    if old_speed == 0:
        change_pct = 0
    else:
        change_pct = ((new_speed - old_speed) / old_speed) * 100

    # --- 4) conclusion ---
    if change_pct > 5:
        conclusion = "New product performs better."
    elif change_pct < -5:
        conclusion = "New product performs worse."
    else:
        conclusion = "No meaningful change."

    return Response({
        "old_product_title": old_title,
        "old_speed": round(old_speed, 2),
        "new_product_title": product["title"],
        "new_speed": round(new_speed, 2),
        "speed_change_pct": round(change_pct, 2),
        "conclusion": conclusion,
    })


# # ============================================================
# # 9) Comment analysis (reviews.csv)
# # ============================================================

# 9) Comment analysis
@api_view(["GET"])
def comment_analysis(request):
    sku = request.query_params.get("sku")
    if not sku:
        return Response({"detail": "sku is required"}, status=status.HTTP_400_BAD_REQUEST)

    data = _load_existing_data()
    reviews = [r for r in data.reviews if r.get("product_id") == sku]
    review_count = len(reviews)

    # مقادیر پیش‌فرض
    total_reviews = review_count
    avg_rating = 0.0
    positive_pct = 0.0
    negative_pct = 0.0
    sentiment_score = 0.0
    summary = "Customer satisfaction is mixed."
    frequent_issues: list[str] = []
    positive_highlights: list[str] = []
    example_comments: list[str] = []

    # ---- ۱. تلاش برای خواندن از comments_summary.csv ----
    comments_rows = _read_csv("comments_summary.csv")
    row = next((r for r in comments_rows if str(r.get("product_id")) == str(sku)), None)

    def _to_float(v, default=0.0):
        try:
            if v is None or v == "":
                return default
            return float(v)
        except (TypeError, ValueError):
            return default

    def _to_int(v, default=0):
        try:
            if v is None or v == "":
                return default
            return int(float(v))
        except (TypeError, ValueError):
            return default

    if row:
        # اگر خلاصه آماده داری، مستقیم از CSV بخوان
        total_reviews = _to_int(row.get("total_reviews"), review_count)
        avg_rating = _to_float(row.get("avg_rating"), 0.0)
        positive_pct = _to_float(row.get("positive_share"), 0.0)      # 0–100
        negative_pct = _to_float(row.get("negative_share"), 0.0)      # 0–100
        sentiment_score = _to_float(row.get("sentiment_score"), 0.0)  # -1 … +1

        summary = row.get("summary_en") or summary

        issues_str = (row.get("top_issues_en") or "").strip()
        if issues_str:
            frequent_issues = [p.strip() for p in issues_str.split("|") if p.strip()]

        highlights_str = (row.get("top_highlights_en") or "").strip()
        if highlights_str:
            positive_highlights = [p.strip() for p in highlights_str.split("|") if p.strip()]

        examples_str = (row.get("sample_comments_fa") or "").strip()
        if examples_str:
            example_comments = [p.strip() for p in examples_str.split("||") if p.strip()][:3]

    else:
        # ---- ۲. اگر در CSV چیزی نبود، از ratingها تخمین بزن ----
        if review_count > 0:
            ratings = []
            for r in reviews:
                try:
                    ratings.append(float(r.get("rating", 0)))
                except (TypeError, ValueError):
                    continue

            if ratings:
                avg_rating = sum(ratings) / len(ratings)
                pos = sum(1 for v in ratings if v >= 4)
                neg = sum(1 for v in ratings if v <= 2)

                positive_pct = (pos / len(ratings)) * 100.0
                negative_pct = (neg / len(ratings)) * 100.0
                # ساده: مثبت‌ها منهای منفی‌ها روی تعداد
                sentiment_score = (pos - neg) / len(ratings)

                if avg_rating >= 4.2 and sentiment_score > 0.4:
                    summary = "Customer satisfaction is high."
                elif avg_rating <= 3.0 and sentiment_score < -0.2:
                    summary = "Customer satisfaction is low."
                else:
                    summary = "Customer satisfaction is mixed."

    result = {
        "sku": sku,
        "positive_pct": round(positive_pct, 1),
        "negative_pct": round(negative_pct, 1),
        "sentiment_score": round(sentiment_score, 2),
        "avg_rating": round(avg_rating, 2),
        "total_reviews": int(total_reviews or 0),
        "summary": summary,
        "frequent_issues": frequent_issues,
        "positive_highlights": positive_highlights,
        "example_comments": example_comments,
    }
    return Response(result)


import os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings

# ...

@api_view(["GET"])  # اگر الان ["POST"] است عوضش کن
@permission_classes([IsAuthenticated])
def products_list(request):
    # حالت دیتای موجود (CSVها)
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala products not implemented yet."},
            status=501,
        )

    data = _load_existing_data()
    items = [
        {
            "product_id": p.get("product_id"),
            "title": p.get("title", ""),
            "category": p.get("category"),
            "brand": p.get("brand"),
        }
        for p in data.products
        if p.get("product_id")
    ]
    return Response(items)
