"""
بک‌اند احراز هویت سفارشی — اجازهٔ لاگین با ایمیل به‌جای فقط username.

پیش‌فرض Django: فقط با username می‌شود لاگین کرد.
با این بک‌اند: اگر کاربر مقدار واردشده را به عنوان username نتوان پیدا کرد، با email جستجو می‌کنیم.
"""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model


class EmailOrUsernameBackend(ModelBackend):
    """
    اگر مقدار واردشده شبیه ایمیل باشد (حاوی @)، اول با email جستجو می‌کنیم؛
    وگرنه با username. بعد رمز را چک می‌کنیم.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        User = get_user_model()
        if username is None or password is None:
            return None

        user = None
        if '@' in username:
            try:
                user = User.objects.get(email=username)
            except User.DoesNotExist:
                pass
        if user is None:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return None

        if user.check_password(password):
            return user
        return None
