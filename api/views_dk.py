from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import SellerCredential
from .digikala import get_profile_with_user_token

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def seller_profile(request):
    user = request.user
    try:
        token = user.seller_cred.token  # OneToOne related name
    except SellerCredential.DoesNotExist:
        return Response({"detail": "Seller token not connected."}, status=status.HTTP_404_NOT_FOUND)

    try:
        data = get_profile_with_user_token(token)
        return Response(data)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

