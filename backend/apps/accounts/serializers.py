"""
سریالایزرهای مربوط به کاربر و احراز هویت.

خروجی API را با مدل User و UserProfile هماهنگ می‌کنند و
فرمت موردنیاز فرانت (user.model.ts) را می‌سازند.
"""
from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers

from .models import UserProfile


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    تبدیل User + UserProfile به شیء کاربر مورد انتظار فرانت.
    """

    displayName = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    emailVerified = serializers.SerializerMethodField()
    createdAt = serializers.SerializerMethodField()
    updatedAt = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "displayName",
            "role",
            "emailVerified",
            "createdAt",
            "updatedAt",
        ]

    def get_profile(self, obj) -> UserProfile:
        profile, _ = UserProfile.objects.get_or_create(user=obj)
        return profile

    def get_displayName(self, obj):
        profile = self.get_profile(obj)
        return profile.display_name or obj.get_username()

    def get_role(self, obj):
        profile = self.get_profile(obj)
        return profile.role

    def get_emailVerified(self, obj):
        profile = self.get_profile(obj)
        return profile.email_verified

    def get_createdAt(self, obj):
        # ترجیحاً از created_at پروفایل استفاده می‌کنیم
        profile = self.get_profile(obj)
        return profile.created_at.isoformat()

    def get_updatedAt(self, obj):
        profile = self.get_profile(obj)
        return profile.updated_at.isoformat()


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(min_length=3, max_length=150)
    displayName = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(min_length=6, write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def create(self, validated_data):
        display_name = validated_data.pop("displayName", "") or validated_data["username"]
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        # پروفایل همراه با نقش و وضعیت ایمیل
        UserProfile.objects.create(
            user=user,
            display_name=display_name,
            role="user",
            email_verified=True,  # فعلاً ایمیل را تأیید‌شده در نظر می‌گیریم
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        user = authenticate(username=username, password=password)
        if not user:
            # تلاش دوم: اگر username ایمیل بود و بک‌اند ایمیل را پشتیبانی نکند
            user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid username or password")
        if not user.is_active:
            raise serializers.ValidationError("User is inactive")
        attrs["user"] = user
        return attrs


class UpdateUserSerializer(serializers.Serializer):
    displayName = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)

    def update(self, instance, validated_data):
        # instance = User
        profile, _ = UserProfile.objects.get_or_create(user=instance)
        if "username" in validated_data and validated_data["username"]:
            instance.username = validated_data["username"]
        if "displayName" in validated_data:
            profile.display_name = validated_data["displayName"]
        instance.save()
        profile.save()
        return instance

