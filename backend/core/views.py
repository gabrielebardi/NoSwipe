# /Users/gb/Desktop/Code/noswipe-app/backend/core/views.py

from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth import authenticate, login, get_user_model
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import JsonResponse
from datetime import timedelta
import os
import random

from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer
from .models import (
    User, UserPreference, Photo, Interest,
    UserInterest, Match, Interaction, UserModel
)
from .ai.matching.engine import MatchingEngine
from .ai.matching.feedback_processor import FeedbackProcessor
from .ai.models.composite_model import CompositeModel

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
                {"detail": "Please provide both email and password"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Get user by email first
            user = User.objects.get(email=email)
            # Then authenticate with username and password
            auth_user = authenticate(request, username=user.username, password=password)
            
            if auth_user:
                login(request, auth_user)
                token, _ = Token.objects.get_or_create(user=auth_user)
                return Response({
                    "token": token.key,
                    "user": UserProfileSerializer(auth_user).data
                })
                
            return Response(
                {"detail": "Invalid credentials"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        except User.DoesNotExist:
            return Response(
                {"detail": "No user found with this email"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
        # Check if user has a trained model
        has_model = UserModel.objects.filter(user=user, is_active=True).exists()
        return Response({
            "isCalibrated": has_model
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

class MatchingViewSet(viewsets.ViewSet):
    """API endpoints for match-related operations."""
    permission_classes = [IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.matching_engine = MatchingEngine()
        self.feedback_processor = FeedbackProcessor()
    
    @action(detail=False, methods=['POST'])
    def calibrate(self, request):
        """Calibrate user's model with initial ratings."""
        user = request.user
        photo_paths = [photo.file_path for photo in user.photos.all()]
        interest_ratings = [
            [rating.rating for rating in user.interest_ratings.all()]
        ]
        
        try:
            model = CompositeModel()
            model.fit(
                photo_paths=photo_paths,
                interest_ratings=interest_ratings,
                target_ratings=request.data['ratings']
            )
            
            # Store the trained model
            user_model, _ = UserModel.objects.get_or_create(user=user)
            user_model.model_data = model
            user_model.save()
            
            return Response({'status': 'Model calibrated successfully'})
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['GET'])
    def get_matches(self, request):
        """Get current batch of matches for the user."""
        user = request.user
        
        # Get all potential candidates
        candidates = User.objects.exclude(id=user.id)
        
        # Generate matches using the matching engine
        matches = self.matching_engine.generate_matches(
            user=user,
            candidates=candidates
        )
        
        # Store matches in database
        stored_matches = []
        for candidate, score in matches:
            match = Match.objects.create(
                user1=user,
                user2=candidate,
                compatibility_score=score,
                expires_at=timezone.now() + timedelta(days=2)
            )
            stored_matches.append(match)
        
        # Return match data
        return Response({
            'matches': [{
                'id': match.id,
                'user': {
                    'id': match.user2.id,
                    'name': match.user2.get_full_name(),
                    'photos': [p.file_path for p in match.user2.photos.all()],
                    'compatibility': match.compatibility_score
                }
            } for match in stored_matches]
        })
    
    @action(detail=True, methods=['POST'])
    def process_feedback(self, request, pk=None):
        """Process user feedback on a match."""
        match = get_object_or_404(Match, id=pk)
        feedback_type = request.data.get('feedback_type')
        
        if feedback_type not in ['thumbs_up', 'thumbs_down']:
            return Response(
                {'error': 'Invalid feedback type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Record the interaction
        Interaction.objects.create(
            user=request.user,
            target=match.user2 if match.user1 == request.user else match.user1,
            interaction_type='U' if feedback_type == 'thumbs_up' else 'D'
        )
        
        # Update match status
        if feedback_type == 'thumbs_up':
            match.status = 'A'
        else:
            match.status = 'R'
        match.save()
        
        # Process feedback for model improvement
        self.feedback_processor.process_explicit_feedback(
            user_id=request.user.id,
            target_id=match.user2.id if match.user1 == request.user else match.user1.id,
            feedback_type=feedback_type
        )
        
        # Check if model retraining is needed
        if self.feedback_processor.should_retrain(request.user.id):
            # TODO: Implement async task for model retraining
            pass
        
        return Response({'status': 'Feedback processed successfully'})
    
    @action(detail=True, methods=['POST'])
    def record_interaction(self, request, pk=None):
        """Record user interaction with a match."""
        match = get_object_or_404(Match, id=pk)
        interaction_type = request.data.get('interaction_type')
        
        if interaction_type not in ['profile_view', 'chat_initiated',
                                  'chat_received_response', 'extended_chat']:
            return Response(
                {'error': 'Invalid interaction type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Map interaction types to database codes
        interaction_map = {
            'profile_view': 'V',
            'chat_initiated': 'C',
            'chat_received_response': 'R',
            'extended_chat': 'E'
        }
        
        # Record the interaction
        Interaction.objects.create(
            user=request.user,
            target=match.user2 if match.user1 == request.user else match.user1,
            interaction_type=interaction_map[interaction_type]
        )
        
        # Process implicit feedback
        self.feedback_processor.process_implicit_feedback(
            user_id=request.user.id,
            target_id=match.user2.id if match.user1 == request.user else match.user1.id,
            interaction_type=interaction_type
        )
        
        return Response({'status': 'Interaction recorded successfully'})