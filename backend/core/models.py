# /bakcend/core/models.py

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import numpy as np
from django.utils import timezone
from datetime import date
from django.core.cache import cache
import random
import os

class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)

class User(AbstractUser):
    """Extended user model with dating app specific fields."""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    username = None  # Remove username field
    email = models.EmailField(unique=True)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    location = models.TextField(max_length=500, null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    profile_photo = models.URLField(max_length=255, null=True, blank=True)
    calibration_completed = models.BooleanField(default=False)
    likes = models.JSONField(default=list, blank=True)
    dislikes = models.JSONField(default=list, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Remove username from required fields

    objects = UserManager()

    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email

    @property
    def age(self):
        """Calculate user's age from birth_date."""
        if not self.birth_date:
            return None
        today = date.today()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))

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

def user_photo_path(instance, filename):
    # File will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return f'user_{instance.user.id}/{filename}'

class Photo(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('B', 'Both'),
    ]
    
    image = models.ImageField(upload_to='photos/', null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, default='M')
    age = models.IntegerField(null=True, blank=True, default=25)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @classmethod
    def get_calibration_photos(cls, gender, count=10):
        """Get a random selection of valid calibration photos for the given gender."""
        import random
        import os
        from django.conf import settings
        
        if gender == 'B':
            # For 'Both', get 50/50 split of male and female photos
            male_count = count // 2
            female_count = count - male_count
            
            male_photos = cls.get_calibration_photos('M', male_count)
            female_photos = cls.get_calibration_photos('F', female_count)
            
            return male_photos + female_photos
            
        cache_key = f'calibration_photos_{gender.lower()}'
        valid_photos = cache.get(cache_key)
        
        if valid_photos is None:
            # Get all photos from database
            photos = list(cls.objects.filter(gender=gender.upper()))
            
            # Filter to only include photos that exist in the filesystem
            gender_dir = 'male' if gender == 'M' else 'female'
            valid_photos = []
            
            for photo in photos:
                photo_path = f'calibration_photos/{gender_dir}/{photo.id:06d}.jpg'
                source_path = os.path.join(settings.BASE_DIR, 'static', photo_path)
                target_path = os.path.join(settings.STATIC_ROOT, photo_path)
                
                if os.path.exists(source_path) and os.path.exists(target_path):
                    valid_photos.append(f'/static/{photo_path}')
            
            # Cache the valid photos
            cache.set(cache_key, valid_photos, timeout=None)
        
        # Select random photos
        return random.sample(valid_photos, min(count, len(valid_photos)))
    
    @classmethod
    def is_valid_calibration_photo(cls, gender, filename):
        """Check if a photo filename is valid for the given gender."""
        if gender == 'B':
            # For 'Both', check both male and female photos
            return (cls.is_valid_calibration_photo('M', filename) or 
                   cls.is_valid_calibration_photo('F', filename))
            
        cache_key = f'calibration_photos_{gender.lower()}'
        valid_photos = cache.get(cache_key)
        
        if valid_photos is None:
            # If cache is empty, check database
            gender_dir = 'male' if gender == 'M' else 'female'
            photo_path = f'calibration_photos/{gender_dir}/{filename}'
            return cls.objects.filter(
                gender=gender.upper(),
                id=int(os.path.splitext(filename)[0])
            ).exists()
            
        return filename in valid_photos

    class Meta:
        db_table = 'photos'
        ordering = ['-created_at']

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