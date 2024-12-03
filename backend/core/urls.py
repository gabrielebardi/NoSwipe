# /Users/gb/Desktop/Code/noswipe-app/backend/core/urls.py

from django.urls import path
from rest_framework.routers import DefaultRouter
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
    CsrfTokenView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'photos', PhotoViewSet)
router.register(r'matches', MatchViewSet, basename='match')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    
    # User endpoints
    path('user/details/', UserDetailsView.as_view(), name='user-details'),
    path('user/preferences/', UserPreferencesView.as_view(), name='user-preferences'),
    path('user/onboarding-status/', OnboardingStatusView.as_view(), name='onboarding-status'),
    path('user/calibrate/', CalibrationView.as_view(), name='calibrate'),
    
    # Location endpoints
    path('locations/search/', LocationSearchView.as_view(), name='location-search'),
    
    # CSRF token endpoint
    path('csrf/', CsrfTokenView.as_view(), name='csrf-token'),
] + router.urls