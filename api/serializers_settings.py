# api/serializers_settings.py
from rest_framework import serializers
from .models import SellerSettings


class SellerSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerSettings
        fields = (
            "extra_cost_pct",
            "slow_mover_min_speed",
            "slow_mover_min_margin",
            "lead_time_days",
        )

