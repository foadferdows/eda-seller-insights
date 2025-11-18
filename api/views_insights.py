# api/views_insights.py
from __future__ import annotations

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


def _load_existing_data() -> ExistingData:
    products = _read_csv("products.csv")
    sales = _read_csv("sales.csv")
    inventory = _read_csv("inventory.csv")
    pricing = _read_csv("pricing.csv")
    reviews = _read_csv("reviews.csv")

    # نرمال‌سازی ساده‌ی انواع
    for p in products:
        p["cost_price"] = _safe_float(p.get("cost_price"))
        p["selling_price"] = _safe_float(p.get("selling_price"))

    for s in sales:
        s["quantity"] = _safe_int(s.get("quantity"))
        s["unit_price"] = _safe_float(s.get("unit_price"))
        s["discount_pct"] = _safe_float(s.get("discount_pct"))
        s["date"] = _parse_date(s.get("date"))

    for inv in inventory:
        inv["current_stock"] = _safe_int(inv.get("current_stock"))
        inv["reorder_point"] = _safe_int(inv.get("reorder_point"))
        inv["supplier_lead_time_days"] = _safe_int(inv.get("supplier_lead_time_days"))

    for pr in pricing:
        pr["your_price"] = _safe_float(pr.get("your_price"))
        pr["your_discount_pct"] = _safe_float(pr.get("your_discount_pct"))
        pr["competitor_min_price"] = _safe_float(pr.get("competitor_min_price"))
        pr["competitor_max_price"] = _safe_float(pr.get("competitor_max_price"))
        pr["competitor_avg_price"] = _safe_float(pr.get("competitor_avg_price"))

    for r in reviews:
        r["rating"] = _safe_int(r.get("rating"))
        # sentiment: "positive" / "neutral" / "negative" (همان رشته‌ی CSV)

    return ExistingData(
        products=products,
        sales=sales,
        inventory=inventory,
        pricing=pricing,
        reviews=reviews,
    )


def _get_seller_settings(user) -> SellerSettings:
    """
    گرفتن تنظیمات کاربر، با مقدارهای پیش‌فرض معقول اگر قبلاً چیزی ذخیره نشده باشد.
    """
    obj, _created = SellerSettings.objects.get_or_create(
        user=user,
        defaults={
            "extra_cost_pct": 3.0,
            "slow_mover_min_weekly_sales": 3,
            "slow_mover_min_profit_margin_pct": 10.0,
            "supplier_lead_time_days": 12,
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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def slow_movers(request):
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights are not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    data = _load_existing_data()
    settings_obj = _get_seller_settings(request.user)

    extra_cost_pct = float(settings_obj.extra_cost_pct or 0)
    min_weekly_sales = int(settings_obj.slow_mover_min_weekly_sales or 3)
    min_margin_pct = float(settings_obj.slow_mover_min_profit_margin_pct or 10.0)

    products_index = _build_index_by_product_id(data.products)
    totals_qty, _, min_date, max_date = _sales_by_product(data.sales)

    items = []
    for pid, product in products_index.items():
        total_qty = totals_qty.get(pid, 0)
        if pid in min_date and pid in max_date:
            days = max((max_date[pid] - min_date[pid]).days, 1)
            weeks = max(days / 7.0, 1.0)
        else:
            weeks = 1.0

        weekly_speed = total_qty / weeks

        margin = _margin_for_product(product, extra_cost_pct)
        margin_pct = margin["margin_pct"]

        if weekly_speed < min_weekly_sales and margin_pct < min_margin_pct:
            action = "remove"
        elif weekly_speed < min_weekly_sales:
            action = "discount"
        else:
            action = "keep"

        items.append(
            {
                "product_id": pid,
                "title": product.get("title"),
                "category": product.get("category"),
                "weekly_speed": round(weekly_speed, 2),
                "margin_pct": round(margin_pct, 2),
                "action": action,
            }
        )

    # کندترین‌ها در ابتدا
    items_sorted = sorted(items, key=lambda x: x["weekly_speed"])

    response = {
        "thresholds": {
            "min_weekly_sales": min_weekly_sales,
            "min_margin_pct": min_margin_pct,
        },
        "items": items_sorted[:20],
    }
    return Response(response)


# ============================================================
# 3) Breakeven (ساده، از روی دیتای موجود)
# ============================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def breakeven(request):
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights are not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    data = _load_existing_data()
    settings_obj = _get_seller_settings(request.user)
    extra_cost_pct = float(settings_obj.extra_cost_pct or 0)

    products_index = _build_index_by_product_id(data.products)
    totals_qty, _, _, _ = _sales_by_product(data.sales)

    breakeven_items = []
    for pid, product in products_index.items():
        margin = _margin_for_product(product, extra_cost_pct)
        price = margin["price"]
        net_profit = margin["net_profit"]
        fixed_costs = price * 50  # فرضی برای محاسبه‌ی تقریبی نقطه‌ی سر به سر
        units_to_breakeven = math.ceil(fixed_costs / net_profit) if net_profit > 0 else None

        breakeven_items.append(
            {
                "product_id": pid,
                "title": product.get("title"),
                "current_sold_units": totals_qty.get(pid, 0),
                "units_to_breakeven": units_to_breakeven,
            }
        )

    breakeven_items = [x for x in breakeven_items if x["units_to_breakeven"] is not None]
    breakeven_items.sort(key=lambda x: x["units_to_breakeven"])

    return Response(
        {
            "items": breakeven_items[:10],
            "assumptions": {
                "extra_cost_pct": extra_cost_pct,
                "fixed_costs_per_sku_factor": 50,
            },
        }
    )


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
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights are not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    data = _load_existing_data()
    if not data.sales:
        return Response({"detail": "No sales data."}, status=status.HTTP_400_BAD_REQUEST)

    # جمع فروش روزانه
    daily_revenue = defaultdict(float)
    min_d, max_d = None, None
    for s in data.sales:
        d = s.get("date")
        qty = _safe_int(s.get("quantity"))
        price = _safe_float(s.get("unit_price"))
        if not d:
            continue
        daily_revenue[d] += qty * price
        if not min_d or d < min_d:
            min_d = d
        if not max_d or d > max_d:
            max_d = d

    if not min_d or not max_d:
        return Response({"detail": "No valid dates in sales.csv"}, status=status.HTTP_400_BAD_REQUEST)

    days = max((max_d - min_d).days + 1, 1)
    total_revenue = sum(daily_revenue.values())
    avg_daily = total_revenue / days

    # پیش‌بینی ساده‌ی ماه آینده
    forecast_next_30 = avg_daily * 30.0

    timeline = [
        {"date": d.isoformat(), "revenue": round(v, 2)}
        for d, v in sorted(daily_revenue.items())
    ]

    return Response(
        {
            "total_revenue": round(total_revenue, 2),
            "days": days,
            "avg_daily_revenue": round(avg_daily, 2),
            "forecast_next_30_days": round(forecast_next_30, 2),
            "timeline": timeline,
        }
    )


# ============================================================
# 6) Discount vs competitors (pricing.csv)
# ============================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def discount_competition(request):
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights are not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    data = _load_existing_data()
    if not data.pricing:
        return Response({"detail": "No pricing data."}, status=status.HTTP_400_BAD_REQUEST)

    products_index = _build_index_by_product_id(data.products)

    items = []
    for pr in data.pricing:
        pid = pr.get("product_id")
        product = products_index.get(pid)
        if not product:
            continue

        your_price = _safe_float(pr.get("your_price"))
        your_discount_pct = _safe_float(pr.get("your_discount_pct"))
        effective_price = your_price * (1 - your_discount_pct / 100.0)

        comp_min = _safe_float(pr.get("competitor_min_price"))
        comp_avg = _safe_float(pr.get("competitor_avg_price"))
        if comp_min <= 0:
            position = "unknown"
            diff_vs_min_pct = None
        else:
            diff_vs_min_pct = (effective_price - comp_min) / comp_min * 100.0
            if diff_vs_min_pct < -2:
                position = "cheapest"
            elif diff_vs_min_pct <= 2:
                position = "in_line"
            else:
                position = "more_expensive"

        items.append(
            {
                "product_id": pid,
                "title": product.get("title"),
                "your_price": round(your_price, 2),
                "your_discount_pct": your_discount_pct,
                "effective_price": round(effective_price, 2),
                "competitor_min_price": comp_min,
                "competitor_avg_price": comp_avg,
                "diff_vs_min_pct": round(diff_vs_min_pct, 2) if diff_vs_min_pct is not None else None,
                "position": position,
            }
        )

    # محصولاتی که خیلی گران‌تر از حداقل رقیب هستند در اول لیست
    items.sort(key=lambda x: (x["diff_vs_min_pct"] if x["diff_vs_min_pct"] is not None else -999), reverse=True)

    return Response({"items": items[:20]})


# ============================================================
# 7) Restock time (inventory + sales)
# ============================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def restock_time(request):
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights are not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    data = _load_existing_data()
    products_index = _build_index_by_product_id(data.products)
    inv_index = {inv["product_id"]: inv for inv in data.inventory if inv.get("product_id")}

    totals_qty, _, min_date, max_date = _sales_by_product(data.sales)

    items = []
    for pid, inv in inv_index.items():
        current_stock = _safe_int(inv.get("current_stock"))
        if pid in min_date and pid in max_date:
            days = max((max_date[pid] - min_date[pid]).days, 1)
        else:
            days = 30  # فرضی
        daily_sales = totals_qty.get(pid, 0) / days if days > 0 else 0.0
        days_to_stockout = current_stock / daily_sales if daily_sales > 0 else None

        reorder_point = _safe_int(inv.get("reorder_point"))
        supplier_lead = _safe_int(inv.get("supplier_lead_time_days"))

        items.append(
            {
                "product_id": pid,
                "title": products_index.get(pid, {}).get("title"),
                "current_stock": current_stock,
                "daily_sales": round(daily_sales, 2),
                "days_to_stockout": round(days_to_stockout, 1) if days_to_stockout is not None else None,
                "reorder_point": reorder_point,
                "supplier_lead_time_days": supplier_lead,
            }
        )

    # محصولاتی که زودتر تمام می‌شوند بالاتر باشند
    items_with_eta = [x for x in items if x["days_to_stockout"] is not None]
    items_with_eta.sort(key=lambda x: x["days_to_stockout"])

    return Response({"items": items_with_eta[:20]})


# ============================================================
# 8) Speed compare (خیلی ساده؛ دو محصول قدیمی/جدید بر اساس فروش)
# ============================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def speed_compare(request):
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights are not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    data = _load_existing_data()
    products_index = _build_index_by_product_id(data.products)
    totals_qty, _, min_date, max_date = _sales_by_product(data.sales)

    if not totals_qty:
        return Response({"detail": "No sales data."}, status=status.HTTP_400_BAD_REQUEST)

    # محصولی با فروش زیاد و محصولی با فروش کم را برای مقایسه انتخاب می‌کنیم
    best_pid = max(totals_qty.items(), key=lambda x: x[1])[0]
    worst_pid = min(totals_qty.items(), key=lambda x: x[1])[0]

    def _build_speed(pid):
        total_qty = totals_qty[pid]
        if pid in min_date and pid in max_date:
            days = max((max_date[pid] - min_date[pid]).days, 1)
        else:
            days = 30
        daily = total_qty / days
        weekly = daily * 7
        return {
            "product_id": pid,
            "title": products_index.get(pid, {}).get("title"),
            "daily_sales": round(daily, 2),
            "weekly_sales": round(weekly, 2),
            "total_units": total_qty,
        }

    response = {
        "fast": _build_speed(best_pid),
        "slow": _build_speed(worst_pid),
    }
    return Response(response)


# ============================================================
# 9) Comment analysis (reviews.csv)
# ============================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def comment_analysis(request):
    if not getattr(settings, "USE_FAKE_SELLER", False):
        return Response(
            {"detail": "Real Digikala insights are not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    data = _load_existing_data()
    if not data.reviews:
        return Response({"detail": "No reviews data."}, status=status.HTTP_400_BAD_REQUEST)

    total = len(data.reviews)
    pos = sum(1 for r in data.reviews if str(r.get("sentiment")).lower() == "positive")
    neg = sum(1 for r in data.reviews if str(r.get("sentiment")).lower() == "negative")
    neu = total - pos - neg

    avg_rating = (
        sum(_safe_int(r.get("rating")) for r in data.reviews) / total if total > 0 else 0.0
    )

    # مهم‌ترین ایرادها و نقاط قوت از روی tag_main
    issue_counts = defaultdict(int)
    like_counts = defaultdict(int)
    for r in data.reviews:
        tag = r.get("tag_main") or ""
        sentiment = str(r.get("sentiment")).lower()
        if sentiment == "negative":
            issue_counts[tag] += 1
        elif sentiment == "positive":
            like_counts[tag] += 1

    top_issues = sorted(
        [{"tag": k, "count": v} for k, v in issue_counts.items()],
        key=lambda x: x["count"],
        reverse=True,
    )[:5]
    top_likes = sorted(
        [{"tag": k, "count": v} for k, v in like_counts.items()],
        key=lambda x: x["count"],
        reverse=True,
    )[:5]

    sample_negative = [
        {
            "product_id": r.get("product_id"),
            "rating": _safe_int(r.get("rating")),
            "comment": r.get("comment"),
            "tag_main": r.get("tag_main"),
        }
        for r in data.reviews
        if str(r.get("sentiment")).lower() == "negative"
    ][:5]

    response = {
        "summary": {
            "total_reviews": total,
            "avg_rating": round(avg_rating, 2),
            "positive": pos,
            "negative": neg,
            "neutral": neu,
        },
        "top_issues": top_issues,
        "top_likes": top_likes,
        "sample_negative_comments": sample_negative,
    }
    return Response(response)

