# api/views_dk.py
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
# api/views_dk.py
from datetime import date, timedelta
from .views_insights import _load_existing_data, _build_index_by_product_id
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SellerCredential
from .digikala import (
    get_profile_with_user_token,
    DigikalaAPIError,
    AuthFailedError,
)


def _build_demo_profile():
    """
    پروفایل دمو برای حالت «دیتای موجود» (بدون اتصال به دیجی‌کالا).

    - total_products  : تعداد کل محصولات یکتا در CSV
    - active_products : تعداد محصولاتی که در ۳۰ روز اخیر فروخته شده‌اند
    - monthly_orders  : جمع quantity در ۳۰ روز اخیر
    - monthly_revenue : جمع (quantity * unit_price) در ۳۰ روز اخیر
    """
    data = _load_existing_data()

    # 1) تعداد کل محصولات
    product_ids = {p.get("product_id") for p in data.products if p.get("product_id")}
    total_products = len(product_ids)

    # 2) فروش ۳۰ روز اخیر
    today = date.today()
    window_start = today - timedelta(days=30)

    monthly_orders = 0
    monthly_revenue = 0.0
    active_products = set()

    for s in data.sales:
        d = s.get("date")
        if not d or d < window_start:
            continue

        pid = s.get("product_id")
        qty = s.get("quantity") or 0
        price = s.get("unit_price") or 0.0

        monthly_orders += int(qty)
        monthly_revenue += float(qty) * float(price)
        if pid:
            active_products.add(pid)

    # اگر هیچ فروش ۳۰ روزه نداشتیم، active را برابر total بگیر
    active_count = len(active_products) if active_products else total_products

    return {
        "seller_code": "EDA-DEMO-SELLER",
        "shop_title": "EDA demo store",
        "shop_url": "https://seller.digikala.com/",
        "city": "Tehran",
        "profile_type": "demo",
        "metrics": {
            "total_products": total_products,
            "active_products": active_count,
            "monthly_orders": monthly_orders,
            "monthly_revenue": int(monthly_revenue),
        },
    }



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def seller_profile(request):
    """
    برگرداندن پروفایل سلر.

    - اگر USE_FAKE_SELLER = True باشد → اصلاً به دیجی‌کالا درخواست نمی‌زنیم
      و یک پروفایل دمویی (لوکال) می‌دهیم.
    - اگر False باشد → از روی توکن ذخیره‌شده برای کاربر، پروفایل واقعی خوانده می‌شود.
    """
    user = request.user

    # حالت دیتای موجود (بدون اتصال واقعی به دیجی‌کالا)
    if getattr(settings, "USE_FAKE_SELLER", False):
        return Response(_build_demo_profile())

    # از اینجا به بعد: حالت «دیتای واقعی / دیجی‌کالا»
    try:
        cred = SellerCredential.objects.get(user=user)
    except ObjectDoesNotExist:
        return Response(
            {"detail": "No Digikala token found for this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    token = cred.token

    try:
        profile = get_profile_with_user_token(token)
    except AuthFailedError:
        return Response(
            {"detail": "Authentication with Digikala failed. Please re-connect your seller account."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    except DigikalaAPIError as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(profile)

