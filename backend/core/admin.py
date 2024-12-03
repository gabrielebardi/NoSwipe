# backend/core/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, UserPreference, Photo, Interest,
    UserInterest, Match, Interaction, UserModel
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'gender', 'location', 'is_premium')
    list_filter = ('is_premium', 'gender', 'location')
    fieldsets = UserAdmin.fieldsets + (
        ('Dating Profile', {'fields': ('gender', 'birth_date', 'location', 'is_premium')}),
    )

@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'min_age', 'max_age', 'preferred_gender', 'location_preference')
    list_filter = ('preferred_gender',)
    search_fields = ('user__username', 'location_preference')

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('user', 'file_path', 'upload_date', 'is_profile_photo')
    list_filter = ('is_profile_photo', 'upload_date')
    search_fields = ('user__username',)

@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name', 'category')

@admin.register(UserInterest)
class UserInterestAdmin(admin.ModelAdmin):
    list_display = ('user', 'interest', 'rating')
    list_filter = ('interest__category',)
    search_fields = ('user__username', 'interest__name')

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('user1', 'user2', 'score', 'created_at', 'expires_at')  # Updated fields
    list_filter = ('created_at', 'expires_at')
    search_fields = ('user1__username', 'user2__username')

@admin.register(Interaction)
class InteractionAdmin(admin.ModelAdmin):
    list_display = ('user', 'target', 'interaction_type', 'created_at')  # Updated field
    list_filter = ('interaction_type', 'created_at')
    search_fields = ('user__username', 'target__username')

@admin.register(UserModel)
class UserModelAdmin(admin.ModelAdmin):
    list_display = ('user', 'last_updated')  # Updated fields
    list_filter = ('last_updated',)
    search_fields = ('user__username',)