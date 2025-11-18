from django.urls import path
from .views import ping, sales_forecast, optimal_pricing, inventory_analysis, portfolio
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views_auth_seller import login_with_seller_token
from .views_dk import seller_profile
from .views_insights import (
#    products_list,
    profit_margin,
    slow_movers,
    breakeven,
    golden_times,
    revenue_forecast,
    discount_competition,
    restock_time,
    speed_compare,
    comment_analysis,
)
from .views_settings import seller_settings



urlpatterns = [
    path("auth/seller/login/", login_with_seller_token),  # POST
    path("dk/profile/", seller_profile),  
#    path("insights/products/", products_list),    
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("settings/", seller_settings, name="seller_settings"),

    path('ping/', ping),
    path('charts/sales-forecast/', sales_forecast),
    path('charts/optimal-pricing/', optimal_pricing),
    path('charts/inventory/', inventory_analysis),
    path('charts/portfolio/', portfolio),
    # --- Insights ---
    path("insights/profit-margin/", profit_margin, name="insights_profit_margin"),
    path("insights/slow-movers/", slow_movers, name="insights_slow_movers"),
    path("insights/breakeven/", breakeven, name="insights_breakeven"),
    path("insights/golden-times/", golden_times, name="insights_golden_times"),
    path("insights/revenue-forecast/", revenue_forecast, name="insights_revenue_forecast"),
    path("insights/discount-competition/", discount_competition, name="insights_discount_competition"),
    path("insights/restock-time/", restock_time, name="insights_restock_time"),
    path("insights/speed-compare/", speed_compare, name="insights_speed_compare"),
    path("insights/comment-analysis/", comment_analysis, name="insights_comment_analysis"),

]

