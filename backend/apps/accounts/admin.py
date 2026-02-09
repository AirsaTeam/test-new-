from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "display_name", "role", "email_verified", "created_at")
    list_filter = ("role", "email_verified")
    search_fields = ("user__username", "user__email", "display_name")

