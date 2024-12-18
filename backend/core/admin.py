# backend/core/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Photo, Match, UserPreference, PhotoRating

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'calibration_completed')
    list_filter = ('is_staff', 'is_superuser', 'calibration_completed')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'username', 'birth_date', 'gender', 'location', 'bio', 'profile_photo')}),
        ('Onboarding Status', {'fields': ('calibration_completed',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'preferred_gender', 'preferred_age_min', 'preferred_age_max', 'preferred_location')
    list_filter = ('preferred_gender',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name')

class PhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'image_url', 'is_profile_photo', 'uploaded_at')
    list_filter = ('is_profile_photo',)
    search_fields = ('user__email',)

class MatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'matched_user', 'status', 'created_at', 'compatibility_score')
    list_filter = ('status',)
    search_fields = ('user__email', 'matched_user__email')

class PhotoRatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'photo', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('user__email',)

admin.site.register(User, CustomUserAdmin)
admin.site.register(UserPreference, UserPreferenceAdmin)
admin.site.register(Photo, PhotoAdmin)
admin.site.register(Match, MatchAdmin)
admin.site.register(PhotoRating, PhotoRatingAdmin)