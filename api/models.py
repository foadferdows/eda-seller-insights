from django.db import models
from django.conf import settings


class SellerCredential(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="seller_cred")
    token = models.TextField()  # بهتره بعداً با یک لایه‌ی رمزنگاری (Fernet) ذخیره‌اش کنی
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

