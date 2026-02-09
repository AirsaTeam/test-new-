"""
URLهای مربوط به احراز هویت و کاربر.
"""
from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("me/", views.MeView.as_view(), name="auth-me"),
    path("users/", views.UserListView.as_view(), name="auth-users"),
    path("users/<int:pk>/", views.UserDetailView.as_view(), name="auth-user-detail"),
]

