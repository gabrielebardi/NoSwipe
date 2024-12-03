# core/models.py (Extended)

from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class CustomUser(AbstractUser):
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')], null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    groups = models.ManyToManyField(
        Group,
        related_name="customuser_set",  # Avoid conflict with default User
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_permissions_set",  # Avoid conflict with default User
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

class UserPreferences(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='preferences')
    preferred_gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')], null=True, blank=True)
    preferred_age_min = models.PositiveIntegerField(null=True, blank=True)
    preferred_age_max = models.PositiveIntegerField(null=True, blank=True)
    # Add other preference fields as needed

    def __str__(self):
        return f"{self.user.username}'s Preferences"

class Photo(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='user_photos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo {self.id} of {self.user.username}"

class PhotoRating(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='photo_ratings')
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(choices=[(1, 'Dislike'), (10, 'Like')])
    rated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} rated Photo {self.photo.id} as {self.get_rating_display()}"

class InterestRating(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='interest_ratings')
    interest = models.CharField(max_length=100)  # Or a ForeignKey to an Interest model if predefined
    rating = models.IntegerField(choices=[(1, 'Low'), (2, 'Medium'), (3, 'High')])
    rated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} rated Interest '{self.interest}' as {self.get_rating_display()}"