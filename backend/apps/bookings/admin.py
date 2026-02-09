"""
ثبت مدل در پنل ادمین — تا بتوانی از صفحهٔ /admin/ رزروها را ببینی و ویرایش کنی.
"""
from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('reference', 'origin_port', 'destination_port', 'departure_date', 'created_at', 'user')
    list_filter = ('document_type', 'has_passenger', 'has_baggage', 'has_vehicle')
    search_fields = ('reference', 'passenger_name', 'origin_port', 'destination_port')
