# api/views_dk.py
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

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
    پروفایل ساده برای حالت «دیتای موجود» (بدون اتصال به دیجی‌کالا).
    اگر دوست داشتی می‌تونی اینجا رو بعداً از روی CSVها هم غنی‌تر کنی.
    """
    return {
        "seller_code": "EDA-DEMO-SELLER",
        "shop_title": "فروشگاه آزمایشی EDA",
        "shop_url": "https://seller.digikala.com/",
        "city": "Tehran",
        "profile_type": "demo",
        "metrics": {
            "total_products": 120,
            "active_products": 95,
            "monthly_orders": 430,
            "monthly_revenue": 185_000_000,
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

