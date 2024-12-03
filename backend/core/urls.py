# /Users/gb/Desktop/Code/noswipe-app/backend/core/urls.py

from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    UserProfileView, 
    LogoutView,
    CalibrationStatusView,
    CalibrationPhotosView,
    health_check,
    csrf_token,
    check_auth
)

urlpatterns = [
    path('csrf/', csrf_token, name='csrf-token'),
    path('auth/check/', check_auth, name='auth-check'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('user/profile/', UserProfileView.as_view(), name='profile'),
    path('user/calibration-status/', CalibrationStatusView.as_view(), name='calibration-status'),
    path('photos/', CalibrationPhotosView.as_view(), name='calibration-photos'),
    path('health-check/', health_check, name='health-check'),
]