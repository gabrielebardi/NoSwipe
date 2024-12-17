# /Users/gb/Desktop/Code/noswipe-app/backend/core/views.py

from rest_framework import viewsets, status, views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model, login
from django.middleware.csrf import get_token
import requests
from datetime import date

from .models import User, Photo, Match, UserPreference, PhotoRating
from .serializers import (
    UserProfileSerializer, 
    PhotoSerializer, 
    MatchSerializer,
    RegisterSerializer,
    LoginSerializer,
    UserPreferenceSerializer
)
from .ai.ai_models import train_user_model

# ViewSets
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        gender = self.request.query_params.get('gender', 'all')
        if gender != 'all':
            return Photo.objects.filter(gender=gender)
        return Photo.objects.all()

class MatchViewSet(viewsets.ModelViewSet):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Match.objects.filter(user=self.request.user)

# Auth Views
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'user': UserProfileSerializer(user).data,
                'message': 'Registration successful'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            # Get the authentication backend
            backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user, backend=backend)
            # Set session cookie
            request.session.set_expiry(60 * 60 * 24 * 7)  # 7 days
            request.session.modified = True
            
            return Response({
                'user': UserProfileSerializer(user).data
            })
        return Response(serializer.errors, status=400)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.session.flush()
        return Response({'message': 'Logged out successfully'})

# User Profile Views
class UserDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class UserPreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            preferences = UserPreference.objects.get(user=request.user)
            serializer = UserPreferenceSerializer(preferences)
            return Response(serializer.data)
        except UserPreference.DoesNotExist:
            return Response({})

    def patch(self, request):
        try:
            preferences = UserPreference.objects.get(user=request.user)
            serializer = UserPreferenceSerializer(preferences, data=request.data, partial=True)
        except UserPreference.DoesNotExist:
            serializer = UserPreferenceSerializer(data=request.data)
            
        if serializer.is_valid():
            preferences = serializer.save(user=request.user)
            return Response(UserPreferenceSerializer(preferences).data)
        return Response(serializer.errors, status=400)

class OnboardingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Calculate age from birth_date if available
        age = None
        if user.birth_date:
            today = date.today()
            age = today.year - user.birth_date.year - ((today.month, today.day) < (user.birth_date.month, user.birth_date.day))
        
        # Check each step of onboarding
        has_basic_info = bool(user.gender and age and user.location)
        has_preferences = bool(user.preferences.preferred_gender and 
                            user.preferences.preferred_location)
        has_calibration = user.calibration_completed
        
        # Determine current step
        current_step = None
        if not has_basic_info:
            current_step = 'details'
        elif not has_preferences:
            current_step = 'preferences'
        elif not has_calibration:
            current_step = 'calibration'
            
        return Response({
            'is_completed': has_basic_info and has_preferences and has_calibration,
            'current_step': current_step
        })

# Location Views
class LocationSearchView(APIView):
    def get(self, request):
        query = request.GET.get('query', '')
        location_type = request.GET.get('type')
        
        if not query:
            return Response([])
            
        # Use Nominatim API for geocoding
        base_url = "https://nominatim.openstreetmap.org/search"
        params = {
            'q': query,
            'format': 'json',
            'addressdetails': 1,
            'limit': 5
        }
        
        headers = {
            'User-Agent': 'NoSwipe Dating App/1.0'
        }
        
        try:
            response = requests.get(base_url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json()
            
            formatted_results = []
            for result in results:
                address = result.get('address', {})
                
                # Determine the type of location
                result_type = 'city'
                if address.get('postcode'):
                    result_type = 'postal_code'
                elif address.get('state') or address.get('region'):
                    result_type = 'region'
                elif address.get('country'):
                    result_type = 'country'
                    
                # Filter by type if specified
                if location_type and location_type != result_type:
                    continue
                    
                formatted_result = {
                    'id': result['place_id'],
                    'type': result_type,
                    'postal_code': address.get('postcode'),
                    'city': address.get('city') or address.get('town') or address.get('village'),
                    'region': address.get('state') or address.get('region'),
                    'country': address.get('country'),
                    'latitude': float(result['lat']),
                    'longitude': float(result['lon']),
                    'display_name': result['display_name']
                }
                formatted_results.append(formatted_result)
                
            return Response(formatted_results)
            
        except requests.RequestException as e:
            return Response(
                {'detail': 'Failed to search locations'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

# Calibration Views
class CalibrationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            # Train the user model based on their ratings
            train_user_model(user.id)
            # Mark calibration as completed
            user.calibration_completed = True
            user.save()
            return Response({'status': 'success', 'message': 'Calibration completed and model trained successfully'})
        except Exception as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# CSRF Token View
class CsrfTokenView(APIView):
    def get(self, request):
        return Response({'csrfToken': get_token(request)})

class CalibrationPhotosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the user's preferred gender from preferences
        try:
            user_preferences = request.user.preferences
            preferred_gender = user_preferences.preferred_gender
        except UserPreference.DoesNotExist:
            return Response({'detail': 'User preferences not set'}, status=400)

        # Map preference to photo gender
        gender_map = {
            'M': 'male',
            'F': 'female',
            'B': None  # Will return both
        }
        
        target_gender = gender_map.get(preferred_gender)
        if not target_gender and preferred_gender != 'B':
            return Response({'detail': 'Invalid gender preference'}, status=400)

        # Get all photos from the Photo model based on gender
        if target_gender:
            photos = Photo.objects.filter(gender=preferred_gender).order_by('?')[:10]
        else:
            # For 'Both' preference, get 5 photos of each gender
            male_photos = Photo.objects.filter(gender='M').order_by('?')[:5]
            female_photos = Photo.objects.filter(gender='F').order_by('?')[:5]
            photos = list(male_photos) + list(female_photos)

        serializer = PhotoSerializer(photos, many=True)
        return Response(serializer.data)

class PhotoRatingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        photo_id = request.data.get('photo_id')
        rating = request.data.get('rating')

        if not photo_id or not rating:
            return Response(
                {'detail': 'Both photo_id and rating are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            rating = int(rating)
            if not (1 <= rating <= 5):
                raise ValueError('Rating must be between 1 and 5')
        except ValueError:
            return Response(
                {'detail': 'Rating must be an integer between 1 and 5'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            photo = Photo.objects.get(id=photo_id)
        except Photo.DoesNotExist:
            return Response(
                {'detail': 'Photo not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create or update the rating
        rating_obj, created = PhotoRating.objects.update_or_create(
            user=request.user,
            photo=photo,
            defaults={'rating': rating}
        )

        return Response({
            'id': rating_obj.id,
            'photo_id': photo_id,
            'rating': rating,
            'created_at': rating_obj.created_at
        })