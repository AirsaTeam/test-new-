from django.urls import path
from . import views

urlpatterns = [
    path('', views.PortListCreateView.as_view()),
    path('<int:pk>/', views.PortDetailView.as_view()),
]
