from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    return Response({"status": "ok"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_forecast(request):
    # دیتای نمونه برای نمودار SalesForecastChart
    return Response({
        "series": [120, 140, 180, 210, 260, 300],
        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def optimal_pricing(request):
    return Response({
        "price_points": [9.9, 11.9, 13.9, 15.9],
        "profit_curve": [200, 260, 290, 280],
        "optimal": {"price": 13.9, "profit": 290}
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_analysis(request):
    return Response({
        "items": [
            {"sku": "A-101", "days_of_cover": 12, "status": "low"},
            {"sku": "B-205", "days_of_cover": 38, "status": "healthy"},
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio(request):
    return Response({
        "allocation": [
            {"asset": "Equities", "pct": 55},
            {"asset": "Bonds", "pct": 25},
            {"asset": "Cash", "pct": 10},
            {"asset": "Alt", "pct": 10},
        ]
    })

