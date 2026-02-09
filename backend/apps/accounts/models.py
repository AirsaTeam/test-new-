"""
مدل‌های مربوط به کاربر (پروفایل و نقش‌ها).

خود Django یک مدل User داخلی دارد (username, email, password, ...).
ما اینجا یک مدل مکمل به‌نام UserProfile تعریف می‌کنیم که:
- display_name (برای نمایش در فرانت)
- role (admin / user)
- email_verified (تأیید ایمیل)
را نگه می‌دارد.
"""
from django.conf import settings
from django.db import models


class UserProfile(models.Model):
  user = models.OneToOneField(
      settings.AUTH_USER_MODEL,
      on_delete=models.CASCADE,
      related_name="profile",
  )
  display_name = models.CharField(max_length=255, blank=True)
  role = models.CharField(
      max_length=16,
      choices=(("admin", "Admin"), ("user", "User")),
      default="user",
  )
  email_verified = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self) -> str:
      return self.display_name or self.user.get_username()

