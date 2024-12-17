# /bakcend/core/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import numpy as np
from django.utils import timezone

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
    location = models.JSONField(null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    profile_photo = models.URLField(max_length=500, blank=True)
    calibration_completed = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email

class UserPreference(models.Model):
    """User preferences for matching."""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('B', 'Both'),
    ]
    
    user = models.OneToOneField('core.User', on_delete=models.CASCADE, related_name='preferences')
    preferred_gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    preferred_age_min = models.IntegerField(null=True, blank=True)
    preferred_age_max = models.IntegerField(null=True, blank=True)
    preferred_location = models.JSONField(null=True, blank=True)
    max_distance = models.IntegerField(default=50)  # in kilometers
    
    class Meta:
        db_table = 'user_preferences'

    def __str__(self):
        return f"{self.user.email}'s preferences"

class Photo(models.Model):
    """User photos."""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    image_url = models.URLField(max_length=500)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    age = models.IntegerField()
    ethnicity = models.CharField(max_length=50, blank=True)
    features = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'photos'

    def __str__(self):
        return f"{self.gender} - {self.age} years old"

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
    STATUS_CHOICES = [
        ('P', 'Pending'),
        ('A', 'Accepted'),
        ('R', 'Rejected'),
    ]
    
    user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='matches_as_user')
    matched_user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='matches_as_matched')
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')
    compatibility_score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'matches'
        unique_together = ['user', 'matched_user']

    def __str__(self):
        return f"{self.user.email} - {self.matched_user.email} ({self.get_status_display()})"

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

class PhotoRating(models.Model):
    """User ratings for calibration photos."""
    user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='photo_ratings')
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'photo_ratings'
        unique_together = ['user', 'photo']  # Each user can rate a photo only once

    def __str__(self):
        return f"{self.user.email} rated photo {self.photo.id}: {self.rating}"