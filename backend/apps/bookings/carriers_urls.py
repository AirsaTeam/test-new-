from django.urls import path
from . import views

urlpatterns = [
    path('', views.CarrierListCreateView.as_view()),
    path('<int:pk>/', views.CarrierDetailView.as_view()),
]
