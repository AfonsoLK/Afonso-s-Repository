from django.urls import path
from app_interface import views

urlpatterns = [
    path("", views.home, name="home"),
]
