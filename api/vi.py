from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import SellerSettings

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profit_margin(request):
    data = {
        "sku": "A-101",
        "title": "قهوه اسپرسو تک‌خاستگاه",
        "price": 199_000,
        "commission_pct": 12.0,
        "buy_price": 140_000,
        "other_costs": 8_400,
        "net_profit": 50_600,
        "margin_pct": 25.4,
    }
    return Response(data)


def get_seller_settings(user):
    settings, _ = SellerSettings.objects.get_or_create(user=user)
    return settings


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def slow_movers(request):
    s = get_seller_settings(request.user)

    # thresholds from settings
    min_speed = s.slow_mover_min_speed
    min_margin = s.slow_mover_min_margin

    # sample items (still mock – later you’ll plug real data here)
    items = [
        {
            "sku": "B-220",
            "title": "ماگ سرامیکی آبی",
            "profit_pct": 9.0,
            "sell_speed_per_week": 0.8,
            "stock": 45,
        },
        {
            "sku": "C-111",
            "title": "چای ماسالا 250 گرمی",
            "profit_pct": 12.0,
            "sell_speed_per_week": 1.4,
            "stock": 32,
        },
    ]

    enriched = []
    for it in items:
        speed = it["sell_speed_per_week"]
        margin = it["profit_pct"]

        if speed < min_speed and margin < min_margin:
            recommendation = "remove"
            reason = (
                f"سرعت فروش ({speed}) کمتر از آستانه ({min_speed}) و "
                f"حاشیه سود ({margin}٪) کمتر از حداقل ({min_margin}٪) است."
            )
        elif speed < min_speed:
            recommendation = "discount"
            reason = (
                f"سرعت فروش ({speed}) کمتر از آستانه ({min_speed}) است؛ "
                "پیشنهاد می‌شود با تخفیف/پروموشن تست شود."
            )
        else:
            recommendation = "keep"
            reason = "سرعت فروش بالاتر از آستانه تنظیمات شما است."

        enriched.append(
            {
                **it,
                "recommendation": recommendation,
                "reason": reason,
            }
        )

    data = {"items": enriched}
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def breakeven(request):
    data = {
        "sku": "A-101",
        "title": "قهوه اسپرسو تک‌خاستگاه",
        "fixed_costs": 15_000_000,
        "variable_cost": 120_000,
        "price": 199_000,
        "breakeven_units": 188,
        "current_month_sales": 96,
        "progress_pct": 51.0,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def golden_times(request):
    data = {
        "sku": "A-101",
        "title": "قهوه اسپرسو تک‌خاستگاه",
        "best_hours": ["11–13", "19–22"],
        "best_days": ["Thursday", "Friday"],
        "heatmap": [
            {"day": "Mon", "hour": "10–12", "orders": 4},
            {"day": "Thu", "hour": "11–13", "orders": 16},
            {"day": "Fri", "hour": "19–22", "orders": 21},
        ],
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def revenue_forecast(request):
    data = {
        "current_month": "1404-11",
        "so_far_revenue": 128_000_000,
        "forecast_revenue": 198_000_000,
        "last_month_revenue": 172_000_000,
        "trend": "increasing",
        "confidence": 0.78,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def discount_competition(request):
    data = {
        "sku": "A-101",
        "title": "قهوه اسپرسو تک‌خاستگاه",
        "your_price": 199_000,
        "your_discount_pct": 12.0,
        "effective_price": 175_000,
        "competitors": [
            {"name": "Seller A", "price": 185_000},
            {"name": "Seller B", "price": 195_000},
        ],
        "effective_discount_vs_cheapest_pct": 5.4,
        "position": "cheapest",
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def restock_time(request):
    s = get_seller_settings(request.user)
    lead_time = s.lead_time_days  # from settings

    # mock values for now
    daily_sales_avg = 12
    current_stock = 32

    days_to_stockout = current_stock / daily_sales_avg if daily_sales_avg > 0 else 9999
    days_to_stockout = round(days_to_stockout, 1)

    should_order = days_to_stockout <= lead_time
    recommended_order_qty = int(daily_sales_avg * (lead_time + 7))  # little buffer

    data = {
        "sku": "A-101",
        "title": "قهوه اسپرسو تک‌خاستگاه",
        "daily_sales_avg": daily_sales_avg,
        "current_stock": current_stock,
        "supplier_lead_time_days": lead_time,
        "days_to_stockout": days_to_stockout,
        "should_order": should_order,
        "recommended_order_qty": recommended_order_qty,
    }
    return Response(data)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def speed_compare(request):
    data = {
        "old_sku": "A-101",
        "old_title": "قهوه اسپرسو نسخه قدیم",
        "old_speed_per_day": 4.1,
        "new_sku": "A-101N",
        "new_title": "قهوه اسپرسو نسخه جدید",
        "new_speed_per_day": 7.9,
        "uplift_pct": 92.7,
        "conclusion": "new_faster",
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def comment_analysis(request):
    data = {
        "sku": "A-101",
        "title": "قهوه اسپرسو تک‌خاستگاه",
        "positive_pct": 76,
        "negative_pct": 24,
        "sentiment_score": 0.82,
        "top_issues": [
            {"tag": "delay", "count": 14, "example": "ارسال یک روز دیرتر رسید"},
            {"tag": "packaging", "count": 9, "example": "بسته‌بندی می‌توانست بهتر باشد"},
        ],
        "top_likes": [
            {"tag": "quality", "count": 35, "example": "طعم و عطر عالی"},
            {"tag": "value", "count": 21, "example": "نسبت به قیمتش خیلی خوبه"},
        ],
        "sample_comments": [
            "طعم قهوه فوق‌العاده بود، فقط ارسال کمی دیر شد.",
            "بسته‌بندی ساده بود ولی کیفیت محصول عالی بود.",
        ],
    }
    return Response(data)

