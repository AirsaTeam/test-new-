"""
سریالایزرها — پل بین «دادهٔ JSON که از فرانت می‌آید» و «مدل Django».

کار سریالایزر:
۱) ورودی (request body) را اعتبارسنجی کند (required، نوع داده، و غیره).
۲) دادهٔ معتبر را به مدل (Booking) تبدیل کند و ذخیره.
۳) هنگام برگرداندن پاسخ، مدل را به JSON با همان شکل مورد انتظار فرانت (camelCase) تبدیل کند.

چرا camelCase؟ چون فرانت Angular با originPort و departureDate کار می‌کند؛ پس API هم همین نام‌ها را برمی‌گرداند.
"""
from rest_framework import serializers
from .models import Booking, Port, Carrier


def _model_to_dict(booking):
    """
    تبدیل یک شیء Booking به دیکشنری با کلیدهای camelCase تا فرانت همان چیزی را ببیند که فرستاده.
    """
    dep = booking.departure_date
    dep_str = dep.isoformat() if dep else ''
    created = booking.created_at
    created_str = created.isoformat() if created else ''

    return {
        'reference': booking.reference,
        'createdAt': created_str,
        'hasPassenger': booking.has_passenger,
        'hasBaggage': booking.has_baggage,
        'hasVehicle': booking.has_vehicle,
        'passengerName': booking.passenger_name or None,
        'passengerIdNumber': booking.passenger_id_number or None,
        'passportNumber': booking.passport_number or None,
        'phoneNumber': booking.phone_number or None,
        'baggagePieces': booking.baggage_pieces,
        'baggageWeightKg': float(booking.baggage_weight_kg) if booking.baggage_weight_kg is not None else None,
        'baggageItems': booking.baggage_items or [],
        'vehicleItems': booking.vehicle_items or [],
        'vehiclePlateNumber': booking.vehicle_plate_number or None,
        'vehicleType': booking.vehicle_type or None,
        'vehicleLengthM': float(booking.vehicle_length_m) if booking.vehicle_length_m is not None else None,
        'originPort': booking.origin_port,
        'destinationPort': booking.destination_port,
        'departureDate': dep_str,
        'documentType': booking.document_type,
        'departureGate': booking.departure_gate or None,
        'seatNumber': booking.seat_number or None,
        'seatingArea': booking.seating_area or None,
        'arrivalDate': booking.arrival_date or None,
        'carrierName': booking.carrier_name or None,
        'ticketNumber': booking.ticket_number or None,
        'sequenceNumber': booking.sequence_number or None,
        'boardingTime': booking.boarding_time or None,
    }


class BookingSerializer(serializers.Serializer):
    """
    برای POST: دادهٔ ورودی را می‌گیرد و اعتبارسنجی می‌کند.
    برای پاسخ: از تابع _model_to_dict استفاده می‌کنیم تا خروجی camelCase باشد.
    """

    # فیلدهای اجباری (همان‌طور که فرانت می‌فرستد)
    originPort = serializers.CharField(max_length=64)
    destinationPort = serializers.CharField(max_length=64)
    departureDate = serializers.CharField()

    # نوع بار
    hasPassenger = serializers.BooleanField(default=False)
    hasBaggage = serializers.BooleanField(default=False)
    hasVehicle = serializers.BooleanField(default=False)

    # مسافر
    passengerName = serializers.CharField(required=False, allow_blank=True, default='')
    passengerIdNumber = serializers.CharField(required=False, allow_blank=True, default='')
    passportNumber = serializers.CharField(required=False, allow_blank=True, default='')
    phoneNumber = serializers.CharField(required=False, allow_blank=True, default='')

    # بار و وسیله
    baggagePieces = serializers.IntegerField(required=False, allow_null=True)
    baggageWeightKg = serializers.FloatField(required=False, allow_null=True)
    baggageItems = serializers.ListField(required=False, default=list)
    vehicleItems = serializers.ListField(required=False, default=list)
    vehiclePlateNumber = serializers.CharField(required=False, allow_blank=True, default='')
    vehicleType = serializers.CharField(required=False, allow_blank=True, default='')
    vehicleLengthM = serializers.DecimalField(
        max_digits=6, decimal_places=2, required=False, allow_null=True
    )

    # نوع سند
    documentType = serializers.ChoiceField(
        choices=['PASSENGER_TICKET', 'CARGO_BOARDING_CARD'],
        default='CARGO_BOARDING_CARD',
    )

    # اختیاری برای چاپ
    departureGate = serializers.CharField(required=False, allow_blank=True, default='')
    seatNumber = serializers.CharField(required=False, allow_blank=True, default='')
    seatingArea = serializers.CharField(required=False, allow_blank=True, default='')
    arrivalDate = serializers.CharField(required=False, allow_blank=True, default='')
    carrierName = serializers.CharField(required=False, allow_blank=True, default='')
    ticketNumber = serializers.CharField(required=False, allow_blank=True, default='')
    sequenceNumber = serializers.CharField(required=False, allow_blank=True, default='')
    boardingTime = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_departureDate(self, value):
        """رشتهٔ تاریخ/زمان را به datetime تبدیل می‌کنیم تا در مدل ذخیره شود."""
        from django.utils.dateparse import parse_datetime
        from django.utils import timezone
        if isinstance(value, str):
            parsed = parse_datetime(value)
            if parsed is None:
                raise serializers.ValidationError('فرمت تاریخ/زمان معتبر نیست.')
            if timezone.is_naive(parsed):
                parsed = timezone.make_aware(parsed)
            return parsed
        return value

    def create(self, validated_data):
        """
        بعد از اعتبارسنجی، ساخت رزرو را به لایهٔ سرویس می‌سپاریم.
        اگر کاربر لاگین کرده باشد (بعداً با JWT)، آن را به سرویس می‌دهیم تا رزرو به او وصل شود.
        """
        from .services import booking_service
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and not user.is_authenticated:
            user = None
        return booking_service.create_booking(validated_data, user=user)


class PortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Port
        fields = ['id', 'code', 'name', 'created_at']
        read_only_fields = ['created_at']


class CarrierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrier
        fields = ['id', 'code', 'name', 'created_at']
        read_only_fields = ['created_at']
