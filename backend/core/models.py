# /bakcend/core/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import numpy as np

class User(AbstractUser):
    """Extended user model with dating app specific fields."""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    is_premium = models.BooleanField(default=False)
    last_active = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'

class UserPreference(models.Model):
    """User preferences for matching."""
    GENDER_CHOICES = [
        ('M', 'Man'),
        ('W', 'Woman'),
        ('NB', 'Non-Binary')
    ]
    
    user = models.OneToOneField('core.User', on_delete=models.CASCADE, related_name='preferences')
    min_age = models.IntegerField(validators=[MinValueValidator(18)])
    max_age = models.IntegerField(validators=[MinValueValidator(18)])
    preferred_gender = models.CharField(max_length=2, choices=GENDER_CHOICES)
    location_preference = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'user_preferences'

class Photo(models.Model):
    """User photos."""
    user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='photos')
    file_path = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)
    is_profile_photo = models.BooleanField(default=False)
    feature_vector = models.BinaryField(null=True)  # Stored as numpy array
    
    def set_features(self, features):
        """Store numpy array as binary."""
        self.feature_vector = features.tobytes()
    
    def get_features(self):
        """Retrieve numpy array from binary."""
        return np.frombuffer(self.feature_vector)
    
    class Meta:
        db_table = 'photos'

class Interest(models.Model):
    """Available interests that users can rate."""
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'interests'

class UserInterest(models.Model):
    """User ratings for interests."""
    user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='interest_ratings')
    interest = models.ForeignKey(Interest, on_delete=models.CASCADE)
    rating = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    
    class Meta:
        db_table = 'user_interests'
        unique_together = ['user', 'interest']

class Match(models.Model):
    """Matches between users."""
    user1 = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='matches_as_user1')
    user2 = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='matches_as_user2')
    score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'matches'
        unique_together = ['user1', 'user2']

class Interaction(models.Model):
    """User interactions with matches."""
    INTERACTION_TYPES = [
        ('L', 'Like'),
        ('P', 'Pass'),
        ('B', 'Block')
    ]
    
    user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='interactions_sent')
    target = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='interactions_received')
    interaction_type = models.CharField(max_length=1, choices=INTERACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interactions'
        unique_together = ['user', 'target']

class UserModel(models.Model):
    """AI model parameters for user preferences."""
    user = models.OneToOneField('core.User', on_delete=models.CASCADE, related_name='ai_model')
    photo_weights = models.BinaryField()  # Stored as numpy array
    interest_weights = models.BinaryField()  # Stored as numpy array
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_models'