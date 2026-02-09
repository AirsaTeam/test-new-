"""
لایهٔ سرویس — جایی که «منطق کسب‌وکار» قرار می‌گیرد.

چرا سرویس؟
- View فقط درخواست را می‌گیرد و جواب برمی‌گرداند؛ نباید داخلش پر از if/else و محاسبه باشد.
- مدل فقط تعریف فیلدهاست؛ منطق «چطور یک رزرو ساخته شود» و «reference چطور تولید شود» اینجا است.
- بعداً اگر بخواهی از همین منطق در یک دستور مدیریتی (manage.py) یا یک تسک پس‌زمینه استفاده کنی، همان تابع را صدا می‌زنی.

تابع اصلی: create_booking(data) — دادهٔ معتبر (از سریالایزر) را می‌گیرد، reference تولید می‌کند، یک Booking می‌سازد و برمی‌گرداند.
"""
import random
import string
from django.utils import timezone
from .models import Booking


def _generate_reference():
    """
    تولید یک شمارهٔ یکتا برای رزرو (مشابه فرانت: SC-xxx-xx).
    """
    ts = timezone.now().timestamp()
    part1 = format(int(ts * 1000), 'X')[:10]
    part2 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=2))
    return f'SC-{part1}-{part2}'


def _ensure_unique_reference():
    """تا وقتی reference تکراری است، یکی جدید بساز."""
    ref = _generate_reference()
    while Booking.objects.filter(reference=ref).exists():
        ref = _generate_reference()
    return ref


def _camel_to_model_data(data):
    """
    تبدیل دیکشنری با کلیدهای camelCase (همان خروجی validated_data سریالایزر) به فیلدهای مدل (snake_case).
    """
    return {
        'reference': data.get('reference') or _ensure_unique_reference(),
        'has_passenger': data.get('hasPassenger', False),
        'has_baggage': data.get('hasBaggage', False),
        'has_vehicle': data.get('hasVehicle', False),
        'passenger_name': (data.get('passengerName') or '').strip() or '',
        'passenger_id_number': (data.get('passengerIdNumber') or '').strip() or '',
        'phone_number': (data.get('phoneNumber') or '').strip() or '',
        'baggage_pieces': data.get('baggagePieces'),
        'baggage_weight_kg': data.get('baggageWeightKg'),
        'baggage_items': data.get('baggageItems') or [],
        'vehicle_items': data.get('vehicleItems') or [],
        'vehicle_plate_number': (data.get('vehiclePlateNumber') or '').strip() or '',
        'vehicle_type': (data.get('vehicleType') or '').strip() or '',
        'vehicle_length_m': data.get('vehicleLengthM'),
        'origin_port': (data.get('originPort') or '').strip(),
        'destination_port': (data.get('destinationPort') or '').strip(),
        'departure_date': data.get('departureDate'),
        'document_type': data.get('documentType') or 'CARGO_BOARDING_CARD',
        'departure_gate': (data.get('departureGate') or '').strip() or '',
        'seat_number': (data.get('seatNumber') or '').strip() or '',
        'seating_area': (data.get('seatingArea') or '').strip() or '',
        'arrival_date': (data.get('arrivalDate') or '').strip() or '',
        'carrier_name': (data.get('carrierName') or '').strip() or '',
        'ticket_number': (data.get('ticketNumber') or '').strip() or '',
        'sequence_number': (data.get('sequenceNumber') or '').strip() or '',
        'boarding_time': (data.get('boardingTime') or '').strip() or '',
    }


def create_booking(data, user=None):
    """
    یک رزرو جدید می‌سازد و برمی‌گرداند.

    - data: دیکشنری معتبر (خروجی serializer.validated_data با کلید camelCase).
    - user: کاربر لاگین‌شده (اختیاری؛ اگر بعداً JWT داشته باشی، از request.user می‌گیری).
    """
    kwargs = _camel_to_model_data(data)
    if user is not None:
        kwargs['user'] = user
    booking = Booking.objects.create(**kwargs)
    return booking


# یک «نقطهٔ دسترسی» برای راحتی (مثلاً از serializer صدا بزنیم)
class BookingService:
    create_booking = staticmethod(create_booking)


booking_service = BookingService()
