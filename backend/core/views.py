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
        print(f"DEBUG - RegisterView POST - request data: {request.data}")  # Debug print
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            print("DEBUG - RegisterView - serializer is valid")  # Debug print
            user = serializer.save()
            return Response({
                'user': UserProfileSerializer(user).data,
                'message': 'Registration successful'
            })
        print(f"DEBUG - RegisterView - serializer errors: {serializer.errors}")  # Debug print
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
            
            # Set onboarding cookie based on calibration status
            response = Response({
                'user': UserProfileSerializer(user).data,
                'calibration_completed': user.calibration_completed
            })
            
            print(f"DEBUG - Setting cookies for user {user.email}:")
            print(f"DEBUG - calibration_completed: {user.calibration_completed}")
            
            response.set_cookie(
                'onboarding_completed',
                str(user.calibration_completed).lower(),
                max_age=60 * 60 * 24 * 7,  # 7 days
                httponly=False,  # Allow JS access
                samesite='Lax'
            )
            
            print(f"DEBUG - Cookie set: onboarding_completed={str(user.calibration_completed).lower()}")
            return response
            
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
        print("DEBUG - Updating user details:", request.data)
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            print("DEBUG - User details updated successfully:", UserProfileSerializer(user).data)
            
            # Check if this update completes the basic info step
            has_basic_info = all([
                user.gender,
                user.birth_date,
                user.location
            ])
            
            if has_basic_info:
                print("DEBUG - Basic info step completed")
            
            return Response({
                'user': UserProfileSerializer(user).data,
                'basic_info_complete': has_basic_info
            })
            
        print("DEBUG - User details update failed:", serializer.errors)
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
        print("DEBUG - Checking onboarding status for user:", request.user.email)
        user = request.user
        
        # For new users, ensure they have a preferences record
        try:
            preferences = UserPreference.objects.get(user=user)
        except UserPreference.DoesNotExist:
            print("DEBUG - Creating new preferences for user:", user.email)
            preferences = UserPreference.objects.create(user=user)
        
        # Check required fields for basic info (Step 1)
        basic_info_fields = {
            'gender': user.gender,
            'birth_date': user.birth_date,
            'location': user.location,
        }
        print("DEBUG - Basic info fields:", basic_info_fields)
        has_basic_info = all(basic_info_fields.values())
        
        # Check required fields for preferences (Step 2)
        preference_fields = {
            'preferred_gender': preferences.preferred_gender,
            'preferred_location': preferences.preferred_location,
            'preferred_age_min': preferences.preferred_age_min,
            'preferred_age_max': preferences.preferred_age_max,
        }
        print("DEBUG - Preference fields:", preference_fields)
        has_preferences = all(preference_fields.values())
        
        # Check calibration status (Step 3)
        has_calibration = user.calibration_completed
        print("DEBUG - Calibration status:", has_calibration)
        
        # Determine current step and next step
        if not has_basic_info:
            current_step = 'details'
            next_step = '/onboarding'
        elif not has_preferences:
            current_step = 'preferences'
            next_step = '/onboarding/preferences'
        elif not has_calibration:
            current_step = 'calibration'
            next_step = '/calibration'
        else:
            current_step = None
            next_step = '/dashboard'
            
        # Only mark as complete if ALL steps are done
        completion_status = 'complete' if (has_basic_info and has_preferences and has_calibration) else 'incomplete'
            
        response_data = {
            'status': completion_status,
            'current_step': current_step,
            'next_step': next_step,
            'steps_completed': {
                'basic_info': has_basic_info,
                'preferences': has_preferences,
                'calibration': has_calibration
            },
            'missing_fields': {
                'basic_info': {k: v is None or v == '' for k, v in basic_info_fields.items()},
                'preferences': {k: v is None or v == '' for k, v in preference_fields.items()},
                'calibration': not has_calibration
            }
        }
        
        print("DEBUG - Onboarding response:", response_data)
        return Response(response_data)

# Location Views
class LocationSearchView(APIView):
    def get(self, request):
        query = request.GET.get('query', '')
        location_type = request.GET.get('type')
        
        print(f"DEBUG - Location search request - Query: {query}, Type: {location_type}")
        
        if not query:
            print("DEBUG - Empty query, returning empty results")
            return Response([])
            
        # Use Nominatim API for geocoding
        base_url = "https://nominatim.openstreetmap.org/search"
        params = {
            'q': query,
            'format': 'json',
            'addressdetails': 1,
            'limit': 5,
            'featuretype': 'city'  # Prioritize city results
        }
        
        headers = {
            'User-Agent': 'NoSwipe Dating App/1.0'
        }
        
        try:
            print(f"DEBUG - Sending request to Nominatim API with params: {params}")
            response = requests.get(base_url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json()
            print(f"DEBUG - Nominatim API response: {results}")
            
            formatted_results = []
            for result in results:
                address = result.get('address', {})
                
                # Extract city name with fallbacks
                city = (
                    address.get('city') or 
                    address.get('town') or 
                    address.get('village') or 
                    address.get('municipality')
                )
                
                # Only include results that have a city
                if not city:
                    continue
                    
                formatted_result = {
                    'id': result['place_id'],
                    'type': 'city',
                    'city': city,
                    'region': address.get('state') or address.get('region'),
                    'country': address.get('country'),
                    'latitude': float(result['lat']),
                    'longitude': float(result['lon']),
                    'display_name': f"{city}, {address.get('country', '')}"
                }
                formatted_results.append(formatted_result)
                
            print(f"DEBUG - Returning formatted results: {formatted_results}")
            return Response(formatted_results)
            
        except requests.RequestException as e:
            print(f"ERROR - Failed to fetch locations: {str(e)}")
            return Response(
                {'detail': 'Failed to search locations. Please try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            print(f"ERROR - Unexpected error in location search: {str(e)}")
            return Response(
                {'detail': 'An unexpected error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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