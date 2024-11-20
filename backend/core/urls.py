# /Users/gb/Desktop/Code/noswipe-app/backend/core/urls.py

from django.urls import path
from .views import RegisterView, LoginView, UserProfileView

urlpatterns = [
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/user/profile/', UserProfileView.as_view(), name='profile'),
]