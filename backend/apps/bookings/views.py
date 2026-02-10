"""
Viewها — لایهٔ «دریافت درخواست HTTP و برگرداندن پاسخ».

هر View:
۱) درخواست را می‌گیرد (مثلاً POST با بدنهٔ JSON).
۲) با سریالایزر اعتبارسنجی می‌کند.
۳) لایهٔ سرویس را صدا می‌زند (یا غیرمستقیم از serializer.save()).
۴) پاسخ را با همان شکل مورد انتظار فرانت (camelCase) برمی‌گرداند.

چرا AllowAny؟ فعلاً فرانت Angular ممکن است بدون توکن درخواست بزند؛ بعداً وقتی JWT وصل شد می‌توانی فقط برای لیست/جزئیات احراز هویت بگذاری و برای ساخت رزرو هم اگر خواستی فقط کاربر لاگین‌شده بتواند رزرو بزند، IsAuthenticated می‌گذاری.
"""
from io import BytesIO
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import HttpResponse

from .models import Booking, Port, Carrier
from .serializers import BookingSerializer, _model_to_dict, PortSerializer, CarrierSerializer


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


def _generate_receipt_pdf(booking):
    """تولید PDF رسید برای یک رزرو (شماره پیگیری + خلاصه)."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except ImportError:
        return None
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    y = height - 80
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, y, "Shinas Port International Terminal - Registration Receipt")
    y -= 30
    c.setFont("Helvetica", 12)
    c.drawString(72, y, f"Tracking Number (PNR): {booking.reference}")
    y -= 22
    c.drawString(72, y, f"Date: {booking.created_at.strftime('%Y-%m-%d %H:%M') if booking.created_at else '—'}")
    y -= 22
    c.drawString(72, y, f"Passenger: {booking.passenger_name or '—'}")
    y -= 22
    c.drawString(72, y, f"Route: {booking.origin_port} → {booking.destination_port}")
    y -= 22
    c.drawString(72, y, f"Cargo: {booking.baggage_pieces or 0} pcs / {booking.baggage_weight_kg or 0} kg")
    c.save()
    buf.seek(0)
    return buf.getvalue()


class BookingReceiptPdfView(APIView):
    """
    GET /api/bookings/<reference>/receipt/pdf/ — دانلود PDF رسید با شماره پیگیری.
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
        pdf_bytes = _generate_receipt_pdf(booking)
        if pdf_bytes is None:
            return Response(
                {'detail': 'تولید PDF در سرور پیکربندی نشده (reportlab).'},
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="receipt-{booking.reference}.pdf"'
        return response


class BookingSearchView(APIView):
    """
    GET /api/bookings/search/?reference=...&passport=...&id_number=...
    جستجو بر اساس کد PNR (reference)، شماره پاسپورت یا شماره شناسایی (ID).
    هر پارامتر اختیاری است؛ در صورت ارسال، رزروهایی که با آن مطابقت دارند برگردانده می‌شوند.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        reference = (request.query_params.get('reference') or '').strip()
        passport = (request.query_params.get('passport') or '').strip()
        id_number = (request.query_params.get('id_number') or '').strip()

        if not reference and not passport and not id_number:
            return Response(
                {'detail': 'حداقل یکی از پارامترهای reference، passport یا id_number را ارسال کنید.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = Booking.objects.all()
        if reference:
            qs = qs.filter(reference__icontains=reference)
        if passport:
            qs = qs.filter(passport_number__icontains=passport)
        if id_number:
            qs = qs.filter(passenger_id_number__icontains=id_number)

        qs = qs[:50]
        data = [_model_to_dict(b) for b in qs]
        return Response(data)


class PortListCreateView(APIView):
    """GET/POST /api/ports/"""
    permission_classes = [AllowAny]

    def get(self, request):
        ports = Port.objects.all()
        serializer = PortSerializer(ports, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PortSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PortDetailView(APIView):
    """GET/PUT/PATCH/DELETE /api/ports/<id>/"""
    permission_classes = [AllowAny]

    def get_object(self, pk):
        from rest_framework.generics import get_object_or_404
        return get_object_or_404(Port, pk=pk)

    def get(self, request, pk):
        port = self.get_object(pk)
        serializer = PortSerializer(port)
        return Response(serializer.data)

    def put(self, request, pk):
        port = self.get_object(pk)
        serializer = PortSerializer(port, data=request.data, partial=False)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        port = self.get_object(pk)
        serializer = PortSerializer(port, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        port = self.get_object(pk)
        port.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CarrierListCreateView(APIView):
    """GET/POST /api/carriers/"""
    permission_classes = [AllowAny]

    def get(self, request):
        carriers = Carrier.objects.all()
        serializer = CarrierSerializer(carriers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CarrierSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CarrierDetailView(APIView):
    """GET/PUT/PATCH/DELETE /api/carriers/<id>/"""
    permission_classes = [AllowAny]

    def get_object(self, pk):
        from rest_framework.generics import get_object_or_404
        return get_object_or_404(Carrier, pk=pk)

    def get(self, request, pk):
        carrier = self.get_object(pk)
        serializer = CarrierSerializer(carrier)
        return Response(serializer.data)

    def put(self, request, pk):
        carrier = self.get_object(pk)
        serializer = CarrierSerializer(carrier, data=request.data, partial=False)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        carrier = self.get_object(pk)
        serializer = CarrierSerializer(carrier, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        carrier = self.get_object(pk)
        carrier.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
