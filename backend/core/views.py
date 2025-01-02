# /Users/gb/Desktop/Code/noswipe-app/backend/core/views.py

from rest_framework import viewsets, status, views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
import requests
from datetime import date
import os

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

# Use settings.DEBUG instead of DEBUG directly
DEBUG = settings.DEBUG

# ViewSets
class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

class PhotoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer

    def get_queryset(self):
        gender = self.request.query_params.get('gender', 'all')
        if gender != 'all':
            return Photo.objects.filter(gender=gender)
        return Photo.objects.all()

class MatchViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MatchSerializer

    def get_queryset(self):
        return Match.objects.filter(user=self.request.user)

# Auth Views
class RegisterView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def post(self, request):
        print("DEBUG - Register attempt with data:", request.data)
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
            
        print("DEBUG - Registration validation failed:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def post(self, request):
        print("DEBUG - Login attempt with data:", request.data)
        serializer = LoginSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            print(f"DEBUG - User authenticated successfully: {user.email}")
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'calibration_completed': user.calibration_completed
            })
            
        print("DEBUG - Login validation failed:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get refresh token from request data
            refresh_token = request.data.get('refresh_token')
            
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                'message': 'Successfully logged out'
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

# User Profile Views
class UserDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            serializer = UserProfileSerializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request):
        try:
            serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                user = serializer.save()
                
                # Check if this update completes the basic info step
                has_basic_info = all([
                    user.gender,
                    user.birth_date,
                    user.location
                ])
                
                return Response({
                    'user': UserProfileSerializer(user).data,
                    'basic_info_complete': has_basic_info
                })
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserPreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            print(f"DEBUG - Getting preferences for user: {request.user.email}")
            preferences = UserPreference.objects.get(user=request.user)
            serializer = UserPreferenceSerializer(preferences)
            print(f"DEBUG - Retrieved preferences: {serializer.data}")
            return Response(serializer.data)
        except UserPreference.DoesNotExist:
            print(f"DEBUG - No preferences found for user: {request.user.email}")
            return Response({})
        except Exception as e:
            print(f"ERROR - Failed to get preferences: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request):
        try:
            print(f"DEBUG - Updating preferences for user: {request.user.email}")
            print(f"DEBUG - Received data: {request.data}")
            
            try:
                preferences = UserPreference.objects.get(user=request.user)
                print(f"DEBUG - Found existing preferences")
                serializer = UserPreferenceSerializer(preferences, data=request.data, partial=True)
            except UserPreference.DoesNotExist:
                print(f"DEBUG - Creating new preferences")
                serializer = UserPreferenceSerializer(data=request.data)
            
            if serializer.is_valid():
                print(f"DEBUG - Preferences data valid: {serializer.validated_data}")
                preferences = serializer.save(user=request.user)
                response_data = UserPreferenceSerializer(preferences).data
                print(f"DEBUG - Preferences updated successfully: {response_data}")
                return Response(response_data)
                
            print(f"DEBUG - Preferences validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"ERROR - Failed to update preferences: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
    permission_classes = [IsAuthenticated]

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
        try:
            # Train the user model based on their ratings
            train_user_model(request.user.id)
            # Mark calibration as completed
            request.user.calibration_completed = True
            request.user.save()
            return Response({
                'status': 'success',
                'message': 'Calibration completed and model trained successfully'
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CalibrationPhotosView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get user's preferences
            preferences = UserPreference.objects.get(user=request.user)
            preferred_gender = preferences.preferred_gender
            
            if not preferred_gender:
                return Response(
                    {'error': 'Preferred gender is required for calibration'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get calibration photos based on preferred gender
            photos = []
            for photo_url in Photo.get_calibration_photos(preferred_gender):
                photo_id = int(os.path.splitext(os.path.basename(photo_url))[0])
                photos.append({
                    'id': photo_id,
                    'image_url': photo_url,
                    'gender': preferred_gender
                })
            
            return Response({'photos': photos})
        except UserPreference.DoesNotExist:
            return Response(
                {'error': 'User preferences not set'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PhotoRatingView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            photo_id = request.data.get('photo_id')
            rating = request.data.get('rating')
            
            # Validate required fields
            if not photo_id:
                return Response(
                    {'error': 'Photo ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not rating:
                return Response(
                    {'error': 'Rating is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                photo = Photo.objects.get(id=photo_id)
            except Photo.DoesNotExist:
                return Response(
                    {'error': 'Photo not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create or update the rating
            photo_rating, created = PhotoRating.objects.get_or_create(
                user=request.user,
                photo=photo,
                defaults={'rating': rating}
            )
            
            if not created:
                photo_rating.rating = rating
                photo_rating.save()
            
            return Response({
                'status': 'success',
                'message': 'Rating saved successfully'
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserPhotoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'photo' not in request.FILES:
            return Response(
                {'detail': 'No photo file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the user's current photos count
        current_photos = Photo.objects.filter(user=request.user).count()
        if current_photos >= 6:
            return Response(
                {'detail': 'Maximum number of photos (6) reached'},
                status=status.HTTP_400_BAD_REQUEST
            )

        photo_file = request.FILES['photo']
        
        # Create the photo object
        photo = Photo.objects.create(
            user=request.user,
            image=photo_file,  # Using the new image field
            is_profile_photo=current_photos == 0  # First photo becomes profile photo
        )

        # If this is the first photo, set it as the user's profile photo
        if current_photos == 0:
            request.user.profile_photo = photo.image_url
            request.user.save()

        serializer = PhotoSerializer(photo)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request):
        photos = Photo.objects.filter(user=request.user)
        serializer = PhotoSerializer(photos, many=True)
        return Response(serializer.data)

    def delete(self, request, photo_id):
        try:
            photo = Photo.objects.get(id=photo_id, user=request.user)
            
            # If this was the profile photo, clear the user's profile_photo field
            if photo.is_profile_photo:
                request.user.profile_photo = None
                request.user.save()
            
            photo.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Photo.DoesNotExist:
            return Response(
                {'detail': 'Photo not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response(
            {"status": "healthy"},
            status=status.HTTP_200_OK
        )