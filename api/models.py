from django.db import models
from django.conf import settings


class SellerCredential(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="seller_cred")
    token = models.TextField()  # بهتره بعداً با یک لایه‌ی رمزنگاری (Fernet) ذخیره‌اش کنی
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



class SellerSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="seller_settings",
    )
    extra_cost_pct = models.FloatField(default=10.0)          # درصد هزینه جانبی
    slow_mover_min_speed = models.FloatField(default=1.0)     # واحد/هفته
    slow_mover_min_margin = models.FloatField(default=10.0)   # درصد
    lead_time_days = models.IntegerField(default=14)          # روز

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings for {self.user}"

