# /Users/gb/Desktop/Code/noswipe-app/backend/core/urls.py

from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserViewSet,
    UserDetailsView,
    UserPreferencesView,
    OnboardingStatusView,
    LocationSearchView,
    PhotoViewSet,
    MatchViewSet,
    CalibrationView,
    CalibrationPhotosView,
    PhotoRatingView,
    UserPhotoView,
    health_check,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'photos', PhotoViewSet)
router.register(r'matches', MatchViewSet, basename='match')

urlpatterns = [
    # Health check endpoint
    path('health-check/', health_check.as_view(), name='health-check'),
   
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # User endpoints
    path('user/details/', UserDetailsView.as_view(), name='user-details'),
    path('user/preferences/', UserPreferencesView.as_view(), name='user-preferences'),
    path('user/onboarding-status/', OnboardingStatusView.as_view(), name='onboarding-status'),
    path('user/calibrate/', CalibrationView.as_view(), name='calibrate'),
    path('user/photos/', UserPhotoView.as_view(), name='user-photos'),
    path('user/photos/<int:photo_id>/', UserPhotoView.as_view(), name='user-photo-detail'),
    
    # Location endpoints
    path('locations/search/', LocationSearchView.as_view(), name='location-search'),
    
    # Calibration endpoints
    path('photos/calibration/', CalibrationPhotosView.as_view(), name='calibration-photos'),
    path('photos/rate/', PhotoRatingView.as_view(), name='photo-rating'),
] + router.urls