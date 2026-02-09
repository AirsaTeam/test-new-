"""
Viewها — لایهٔ «دریافت درخواست HTTP و برگرداندن پاسخ».

هر View:
۱) درخواست را می‌گیرد (مثلاً POST با بدنهٔ JSON).
۲) با سریالایزر اعتبارسنجی می‌کند.
۳) لایهٔ سرویس را صدا می‌زند (یا غیرمستقیم از serializer.save()).
۴) پاسخ را با همان شکل مورد انتظار فرانت (camelCase) برمی‌گرداند.

چرا AllowAny؟ فعلاً فرانت Angular ممکن است بدون توکن درخواست بزند؛ بعداً وقتی JWT وصل شد می‌توانی فقط برای لیست/جزئیات احراز هویت بگذاری و برای ساخت رزرو هم اگر خواستی فقط کاربر لاگین‌شده بتواند رزرو بزند، IsAuthenticated می‌گذاری.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Booking
from .serializers import BookingSerializer, _model_to_dict


class BookingListCreateView(APIView):
    """
    GET  /api/bookings/  → لیست همهٔ رزروها (برای ادمین یا بعداً فیلتر بر اساس کاربر).
    POST /api/bookings/  → ساخت رزرو جدید (همان چیزی که فرانت با Submit می‌زند).
    """
    permission_classes = [AllowAny]

    def get(self, request):
        """لیست رزروها — الان همه را برمی‌گردانیم؛ بعداً می‌توانی فیلتر کنی (مثلاً فقط رزروهای همین کاربر)."""
        bookings = Booking.objects.all()[:100]  # محدود به ۱۰۰ تا برای جلوگیری از پاسخ سنگین
        data = [_model_to_dict(b) for b in bookings]
        return Response(data)

    def post(self, request):
        """
        ساخت رزرو:
        ۱) دادهٔ بدنه را با BookingSerializer اعتبارسنجی می‌کنیم.
        ۲) serializer.save() صدا زده می‌شود که داخلش create() است و آن هم سرویس را صدا می‌زند.
        ۳) پاسخ را با _model_to_dict به camelCase برمی‌گردانیم تا فرانت همان ساختار را ببیند.
        """
        serializer = BookingSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        booking = serializer.save()
        return Response(_model_to_dict(booking), status=status.HTTP_201_CREATED)


class BookingDetailView(APIView):
    """
    GET /api/bookings/<reference>/ — جزئیات یک رزرو با شمارهٔ reference.
    """
    permission_classes = [AllowAny]

    def get(self, request, reference):
        try:
            booking = Booking.objects.get(reference=reference)
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'رزروی با این شماره یافت نشد.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(_model_to_dict(booking))
