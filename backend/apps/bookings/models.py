"""
مدل‌های اپ bookings — یعنی «داده‌هایی که می‌خواهیم در دیتابیس ذخیره کنیم».

هر کلاس زیر که از models.Model ارث می‌برد = یک جدول در دیتابیس.
فیلدها = ستون‌های آن جدول.
"""
from django.db import models
from django.conf import settings


class Booking(models.Model):
    """
    یک رزرو: مسافر و/یا بار و/یا وسیله، از یک بندر به بندر دیگر.
    معادل همان BookingRequest در فرانت Angular است.
    """

    # --- ارتباط با کاربر (اگر بعداً لاگین داشته باشیم، می‌دانیم رزرو مال کیه)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings',
        help_text='کاربری که این رزرو را ثبت کرده (اختیاری)',
    )

    # --- شناسه و زمان
    reference = models.CharField(
        max_length=64,
        unique=True,
        help_text='شمارهٔ یکتای رزرو مثلاً SC-ABC123-01',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # --- نوع بار (مسافر / چمدان / وسیله)
    has_passenger = models.BooleanField(default=False)
    has_baggage = models.BooleanField(default=False)
    has_vehicle = models.BooleanField(default=False)

    # --- اطلاعات مسافر
    passenger_name = models.CharField(max_length=255, blank=True)
    passenger_id_number = models.CharField(max_length=64, blank=True)
    phone_number = models.CharField(max_length=32, blank=True)

    # --- خلاصهٔ بار (تعداد قطعات و وزن کل — برای گزارش و نمایش)
    baggage_pieces = models.PositiveIntegerField(null=True, blank=True)
    baggage_weight_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    # --- جزئیات بار و وسیله به صورت JSON (همان ساختاری که فرانت می‌فرستد)
    baggage_items = models.JSONField(default=list, blank=True)
    vehicle_items = models.JSONField(default=list, blank=True)

    # --- فیلدهای قدیمی یک وسیله (برای سازگاری)
    vehicle_plate_number = models.CharField(max_length=32, blank=True)
    vehicle_type = models.CharField(max_length=64, blank=True)
    vehicle_length_m = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
    )

    # --- مسیر و زمان
    origin_port = models.CharField(max_length=64)
    destination_port = models.CharField(max_length=64)
    departure_date = models.DateTimeField()

    # --- نوع سند چاپی
    DOCUMENT_TYPES = [
        ('PASSENGER_TICKET', 'Passenger Ticket'),
        ('CARGO_BOARDING_CARD', 'Cargo Boarding Card'),
    ]
    document_type = models.CharField(
        max_length=32,
        choices=DOCUMENT_TYPES,
        default='CARGO_BOARDING_CARD',
    )

    # --- فیلدهای اختیاری برای چاپ (درگاه، صندلی، شرکت حمل و ...)
    departure_gate = models.CharField(max_length=32, blank=True)
    seat_number = models.CharField(max_length=32, blank=True)
    seating_area = models.CharField(max_length=32, blank=True)
    arrival_date = models.CharField(max_length=64, blank=True)
    carrier_name = models.CharField(max_length=128, blank=True)
    ticket_number = models.CharField(max_length=64, blank=True)
    sequence_number = models.CharField(max_length=32, blank=True)
    boarding_time = models.CharField(max_length=32, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'رزرو'
        verbose_name_plural = 'رزروها'

    def __str__(self):
        return f'{self.reference} ({self.origin_port} → {self.destination_port})'
