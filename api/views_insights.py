# api/views_insights.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SellerSettings


def get_seller_settings(user):
    """هر کاربر یک رکورد تنظیمات دارد؛ اگر نبود ساخته می‌شود."""
    settings, _ = SellerSettings.objects.get_or_create(user=user)
    return settings


# 1) حاشیه سود واقعی پس از کمیسیون
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profit_margin(request):
    sku = request.query_params.get("sku") or "A-101"
    s = get_seller_settings(request.user)

    # mock data برای قیمت و کمیسیون و قیمت خرید بر اساس SKU
    if sku == "A-101":
        title = "قهوه اسپرسو تک‌خاستگاه"
        price = 250_000
        commission_pct = 12.0
        buy_price = 150_000
    elif sku == "B-220":
        title = "ماگ سرامیکی آبی"
        price = 180_000
        commission_pct = 10.0
        buy_price = 90_000
    else:  # C-111 یا هر چیز دیگر
        title = "چای ماسالا ۲۵۰ گرمی"
        price = 220_000
        commission_pct = 11.0
        buy_price = 130_000

    commission_amount = price * commission_pct / 100
    other_costs = price * (s.extra_cost_pct / 100.0)
    net_profit = price - commission_amount - buy_price - other_costs
    margin_pct = round(net_profit / price * 100, 2) if price else 0.0

    data = {
        "sku": sku,
        "title": title,
        "price": price,
        "commission_pct": commission_pct,
        "buy_price": buy_price,
        "other_costs": int(other_costs),
        "net_profit": int(net_profit),
        "margin_pct": margin_pct,
    }
    return Response(data)


# 2) محصولات کم‌تحرک و پیشنهاد خروج
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def slow_movers(request):
    s = get_seller_settings(request.user)

    min_speed = s.slow_mover_min_speed
    min_margin = s.slow_mover_min_margin

    # mock list – بعداً می‌توانی این را براساس SKU یا دیتابیس بسازی
    items = [
        {
            "sku": "A-101",
            "title": "قهوه اسپرسو تک‌خاستگاه",
            "profit_pct": 8.5,
            "sell_speed_per_week": 0.9,
            "stock": 40,
        },
        {
            "sku": "B-220",
            "title": "ماگ سرامیکی آبی",
            "profit_pct": 15.0,
            "sell_speed_per_week": 1.2,
            "stock": 70,
        },
        {
            "sku": "C-111",
            "title": "چای ماسالا ۲۵۰ گرمی",
            "profit_pct": 9.5,
            "sell_speed_per_week": 0.6,
            "stock": 25,
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


# 3) نقطه سر به سر محصول
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def breakeven(request):
    sku = request.query_params.get("sku") or "A-101"

    if sku == "A-101":
        title = "قهوه اسپرسو تک‌خاستگاه"
        fixed_costs = 5_000_000
        variable_cost = 120_000
        price = 250_000
        current_month_sales = 380
    elif sku == "B-220":
        title = "ماگ سرامیکی آبی"
        fixed_costs = 3_000_000
        variable_cost = 60_000
        price = 180_000
        current_month_sales = 210
    else:
        title = "چای ماسالا ۲۵۰ گرمی"
        fixed_costs = 4_000_000
        variable_cost = 90_000
        price = 220_000
        current_month_sales = 150

    breakeven_units = int(round(fixed_costs / (price - variable_cost))) if price > variable_cost else 0
    progress_pct = (
        round(current_month_sales / breakeven_units * 100, 1)
        if breakeven_units
        else 0
    )

    data = {
        "title": title,
        "fixed_costs": fixed_costs,
        "variable_cost": variable_cost,
        "price": price,
        "breakeven_units": breakeven_units,
        "current_month_sales": current_month_sales,
        "progress_pct": progress_pct,
    }
    return Response(data)


# 5) زمان‌های طلایی فروش
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def golden_times(request):
    sku = request.query_params.get("sku") or "A-101"

    if sku == "A-101":
        title = "قهوه اسپرسو تک‌خاستگاه"
        best_hours = ["۹–۱۱ صبح", "۱۸–۲۱ شب"]
        best_days = ["پنج‌شنبه", "جمعه"]
    elif sku == "B-220":
        title = "ماگ سرامیکی آبی"
        best_hours = ["۱۰–۱۲ صبح", "۲۰–۲۲ شب"]
        best_days = ["سه‌شنبه", "پنج‌شنبه"]
    else:
        title = "چای ماسالا ۲۵۰ گرمی"
        best_hours = ["۸–۱۰ صبح", "۱۷–۱۹ عصر"]
        best_days = ["چهارشنبه", "جمعه"]

    heatmap = [
        {"day": "شنبه", "hour": "۹–۱۰", "orders": 5},
        {"day": "شنبه", "hour": "۱۸–۱۹", "orders": 9},
        {"day": "پنج‌شنبه", "hour": "۱۰–۱۱", "orders": 12},
        {"day": "جمعه", "hour": "۲۰–۲۱", "orders": 15},
    ]

    data = {
        "title": title,
        "best_hours": best_hours,
        "best_days": best_days,
        "heatmap": heatmap,
    }
    return Response(data)


# 6) پیش‌بینی درآمد ماه
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def revenue_forecast(request):
    sku = request.query_params.get("sku") or "A-101"

    if sku == "A-101":
        so_far = 18_000_000
        forecast = 32_000_000
        last = 28_000_000
        trend = "increasing"
    elif sku == "B-220":
        so_far = 9_000_000
        forecast = 14_000_000
        last = 15_000_000
        trend = "decreasing"
    else:
        so_far = 11_000_000
        forecast = 19_000_000
        last = 18_000_000
        trend = "stable"

    data = {
        "current_month": "آبان ۱۴۰۴",
        "so_far_revenue": so_far,
        "forecast_revenue": forecast,
        "last_month_revenue": last,
        "trend": trend,
        "confidence": 0.82,
    }
    return Response(data)


# 10) تخفیف مؤثر نسبت به رقبا
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def discount_competition(request):
    sku = request.query_params.get("sku") or "A-101"

    if sku == "A-101":
        your_price = 250_000
        your_discount_pct = 10
        competitors = [
            {"name": "SellerX", "price": 260_000},
            {"name": "SellerY", "price": 255_000},
            {"name": "SellerZ", "price": 270_000},
        ]
    elif sku == "B-220":
        your_price = 180_000
        your_discount_pct = 5
        competitors = [
            {"name": "SellerX", "price": 190_000},
            {"name": "SellerY", "price": 185_000},
        ]
    else:
        your_price = 220_000
        your_discount_pct = 12
        competitors = [
            {"name": "SellerX", "price": 230_000},
            {"name": "SellerY", "price": 225_000},
        ]

    effective_price = int(your_price * (100 - your_discount_pct) / 100)
    cheapest = min([c["price"] for c in competitors] + [effective_price])
    effective_discount_vs_cheapest_pct = round(
        (cheapest - effective_price) / cheapest * 100, 1
    )

    if effective_price <= cheapest:
        position = "cheapest"
    else:
        position = "above"

    data = {
        "your_price": your_price,
        "your_discount_pct": your_discount_pct,
        "effective_price": effective_price,
        "competitors": competitors,
        "effective_discount_vs_cheapest_pct": effective_discount_vs_cheapest_pct,
        "position": position,
    }
    return Response(data)


# 14) زمان تأمین موجودی
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def restock_time(request):
    sku = request.query_params.get("sku") or "A-101"
    s = get_seller_settings(request.user)
    lead_time = s.lead_time_days

    if sku == "A-101":
        title = "قهوه اسپرسو تک‌خاستگاه"
        daily_sales_avg = 12
        current_stock = 32
    elif sku == "B-220":
        title = "ماگ سرامیکی آبی"
        daily_sales_avg = 3
        current_stock = 80
    else:
        title = "چای ماسالا ۲۵۰ گرمی"
        daily_sales_avg = 6
        current_stock = 45

    days_to_stockout = current_stock / daily_sales_avg if daily_sales_avg > 0 else 9999
    days_to_stockout = round(days_to_stockout, 1)

    should_order = days_to_stockout <= lead_time
    recommended_order_qty = int(daily_sales_avg * (lead_time + 7))

    data = {
        "sku": sku,
        "title": title,
        "daily_sales_avg": daily_sales_avg,
        "current_stock": current_stock,
        "supplier_lead_time_days": lead_time,
        "days_to_stockout": days_to_stockout,
        "should_order": should_order,
        "recommended_order_qty": recommended_order_qty,
    }
    return Response(data)


# 17) مقایسه سرعت فروش محصول جدید و قدیمی
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def speed_compare(request):
    sku = request.query_params.get("sku") or "A-101"

    if sku == "A-101":
        old_title = "قهوه اسپرسو بسته‌بندی قدیمی"
        new_title = "قهوه اسپرسو بسته‌بندی جدید"
        old_speed = 8.0  # واحد/روز
        new_speed = 11.5
    elif sku == "B-220":
        old_title = "ماگ ساده"
        new_title = "ماگ سرامیکی آبی طرح جدید"
        old_speed = 2.0
        new_speed = 3.2
    else:
        old_title = "چای ماسالا طرح قدیم"
        new_title = "چای ماسالا با بسته‌بندی جدید"
        old_speed = 4.0
        new_speed = 3.5

    uplift_pct = round((new_speed - old_speed) / old_speed * 100, 1) if old_speed else 0

    if new_speed > old_speed:
        conclusion = "new_faster"
    elif new_speed < old_speed:
        conclusion = "old_faster"
    else:
        conclusion = "same_speed"

    data = {
        "old_title": old_title,
        "new_title": new_title,
        "old_speed_per_day": old_speed,
        "new_speed_per_day": new_speed,
        "uplift_pct": uplift_pct,
        "conclusion": conclusion,
    }
    return Response(data)


# 11) تحلیل تجربه مشتری از کامنت‌ها
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def comment_analysis(request):
    sku = request.query_params.get("sku") or "A-101"

    if sku == "A-101":
        positive_pct = 78
        negative_pct = 12
        sentiment_score = 0.7
        top_issues = [
            {"tag": "بسته‌بندی", "count": 5, "example": "ای‌کاش بسته‌بندی محکم‌تر بود."},
            {"tag": "تاخیر ارسال", "count": 3, "example": "یک روز دیرتر از موعد رسید."},
        ]
        top_likes = [
            {"tag": "طعم", "count": 15, "example": "طعم عالی و عطر فوق‌العاده."},
            {"tag": "کیفیت قهوه", "count": 9, "example": "نسبت به قیمت، کیفیت عالی است."},
        ]
        sample_comments = [
            "برای دومین بار خرید کردم، راضی‌ام.",
            "بسته‌بندی می‌توانست بهتر باشد ولی خود محصول خوب است.",
        ]
    elif sku == "B-220":
        positive_pct = 82
        negative_pct = 8
        sentiment_score = 0.76
        top_issues = [
            {"tag": "رنگ", "count": 2, "example": "رنگ کمی تیره‌تر از عکس بود."},
        ]
        top_likes = [
            {"tag": "کیفیت ساخت", "count": 10, "example": "خیلی محکم و باکیفیت است."},
        ]
        sample_comments = [
            "برای کادو گرفتم، خیلی دوستش داشت.",
            "اندازه و کیفیت دقیقا مطابق توضیحات بود.",
        ]
    else:
        positive_pct = 70
        negative_pct = 18
        sentiment_score = 0.55
        top_issues = [
            {"tag": "طعم", "count": 4, "example": "برای ذائقه من کمی تند بود."},
        ]
        top_likes = [
            {"tag": "بسته‌بندی", "count": 3, "example": "بسته‌بندی شیک و تمیز."},
        ]
        sample_comments = [
            "کلا بد نبود ولی دوباره نمی‌خرم.",
            "برای مهمان‌ها استفاده کردم، چند نفر خوششان آمد.",
        ]

    data = {
        "positive_pct": positive_pct,
        "negative_pct": negative_pct,
        "sentiment_score": sentiment_score,
        "top_issues": top_issues,
        "top_likes": top_likes,
        "sample_comments": sample_comments,
    }
    return Response(data)

