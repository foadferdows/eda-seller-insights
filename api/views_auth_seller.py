from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import SellerCredential
from .digikala import validate_token_and_get_profile

User = get_user_model()

def issue_jwt_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


@api_view(["POST"])
@permission_classes([AllowAny])
def login_with_seller_token(request):
    """
    body: { "seller_token": "<DIGIKALA_SELLER_TOKEN or FAKE token>" }
    """
    token = (request.data or {}).get("seller_token")
    if not token:
        return Response({"detail": "seller_token is required"}, status=400)

    # 🔹 حالت فیک برای محیط توسعه
    if getattr(settings, "USE_FAKE_SELLER", False) and token == "FAKE_SELLER_TOKEN":
        seller_profile = {
            "id": 123456,
            "username": "fake_seller",
            "email": "fake@example.com",
            "shop_title": "فروشگاه تستی بیترویتی",
        }
    else:
        # حالت واقعی: توکن رو واقعاً با دیجی‌کالا چک می‌کنیم
        try:
            seller_profile = validate_token_and_get_profile(token)
        except Exception as e:
            return Response({"detail": f"Invalid seller token: {e}"}, status=401)

    # شناسه پایدار برای ساخت یوزر
    seller_id = str(
        seller_profile.get("id")
        or seller_profile.get("seller_id")
        or seller_profile.get("username")
        or seller_profile.get("email")
        or ""
    )

    if not seller_id:
        return Response({"detail": "Cannot determine seller identity from profile."}, status=400)

    username = f"dk_{seller_id}"
    user, _ = User.objects.get_or_create(username=username, defaults={"is_active": True})

    cred, _ = SellerCredential.objects.get_or_create(user=user)
    cred.token = token
    cred.save()

    jwt = issue_jwt_for_user(user)
    return Response({
        "access": jwt["access"],
        "refresh": jwt["refresh"],
        "seller_profile_preview": {
            "id": seller_id,
            "username": seller_profile.get("username"),
            "email": seller_profile.get("email"),
            "shop_title": seller_profile.get("shop_title"),
        },
        "is_fake": getattr(settings, "USE_FAKE_SELLER", False) and token == "FAKE_SELLER_TOKEN",
    }, status=200)

