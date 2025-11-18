from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SellerSettings
from .serializers_settings import SellerSettingsSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def seller_settings(request):
    # برای هر کاربر یک رکورد تنظیمات داریم
    obj, _ = SellerSettings.objects.get_or_create(user=request.user)

    if request.method == "GET":
        serializer = SellerSettingsSerializer(obj)
        return Response(serializer.data)

    # POST = به‌روزرسانی جزئی (partial update)
    serializer = SellerSettingsSerializer(obj, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)

