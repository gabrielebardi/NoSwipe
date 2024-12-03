# /Users/gb/Desktop/Code/noswipe-app/backend/core/views.py

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer
from django.contrib.auth import get_user_model
from .models import PhotoRating
import os
from django.middleware.csrf import get_token
from django.http import JsonResponse
import random

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {"error": "Please provide both email and password"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user = authenticate(request, username=email, password=password)
        
        if user:
            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": UserProfileSerializer(user).data
            }, status=status.HTTP_200_OK)
            
        return Response(
            {"error": "Invalid credentials"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Delete the user's token
            request.user.auth_token.delete()
            return Response(
                {"message": "Successfully logged out"}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": "Something went wrong"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CalibrationStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        # Check if user has completed calibration
        has_ratings = PhotoRating.objects.filter(user=user).exists()
        return Response({
            "isCalibrated": has_ratings
        })

class CalibrationPhotosView(APIView):
    permission_classes = [IsAuthenticated]
    REQUIRED_PHOTOS = 30
    
    def get(self, request):
        gender = request.query_params.get('gender', '').lower()
        photo_dir = os.path.join('static', 'calibration_photos', gender)
        
        if not os.path.exists(photo_dir):
            return Response(
                {"error": f"No photos found for gender: {gender}"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Get all valid photo files
        valid_photos = [
            f for f in os.listdir(photo_dir) 
            if f.lower().endswith(('.jpg', '.jpeg', '.png'))
        ]
        
        if len(valid_photos) < self.REQUIRED_PHOTOS:
            return Response(
                {
                    "error": f"Insufficient calibration photos. Need {self.REQUIRED_PHOTOS}, found {len(valid_photos)}"
                }, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Randomly select exactly REQUIRED_PHOTOS photos
        selected_photos = random.sample(valid_photos, self.REQUIRED_PHOTOS)
        
        # Create photo objects
        photos = [
            {
                'id': idx + 1,
                'image_url': f'/static/calibration_photos/{gender}/{filename}'
            }
            for idx, filename in enumerate(selected_photos)
        ]
        
        return Response(photos)

@api_view(['GET'])
def health_check(request):
    return Response({"status": "healthy"})

@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    return Response({
        'isAuthenticated': True,
        'user': UserProfileSerializer(request.user).data
    })