"""
ثبت مدل در پنل ادمین — تا بتوانی از صفحهٔ /admin/ رزروها را ببینی و ویرایش کنی.
"""
from django.contrib import admin
from .models import Booking, Port, Carrier


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('reference', 'origin_port', 'destination_port', 'departure_date', 'created_at', 'user')
    list_filter = ('document_type', 'has_passenger', 'has_baggage', 'has_vehicle')
    search_fields = ('reference', 'passenger_name', 'passport_number', 'passenger_id_number', 'origin_port', 'destination_port')


@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'created_at')
    search_fields = ('code', 'name')


@admin.register(Carrier)
class CarrierAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'created_at')
    search_fields = ('code', 'name')
