"""
مسیریابی (URL) اپ bookings.

هر path یعنی: «اگر آدرس درخواست این بود، این View را صدا بزن».
مثلاً درخواست به /api/bookings/ از config/urls.py به این فایل include شده؛
پس GET/POST به /api/bookings/ به BookingListCreateView می‌رود.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingListCreateView.as_view()),
    path('<str:reference>/', views.BookingDetailView.as_view()),
]
