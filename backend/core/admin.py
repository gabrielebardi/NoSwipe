# backend/core/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserPreference, Photo, Match

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'gender', 'birth_date', 'calibration_completed')
    list_filter = ('gender', 'calibration_completed')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'birth_date', 'gender', 'location', 'bio', 'profile_photo')}),
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
    list_display = ('user', 'preferred_gender', 'preferred_age_min', 'preferred_age_max', 'max_distance')
    list_filter = ('preferred_gender',)
    search_fields = ('user__email',)

class PhotoAdmin(admin.ModelAdmin):
    list_display = ('image_url', 'gender', 'age', 'ethnicity', 'created_at')
    list_filter = ('gender', 'created_at')
    search_fields = ('image_url', 'ethnicity')

class MatchAdmin(admin.ModelAdmin):
    list_display = ('user', 'matched_user', 'compatibility_score', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'matched_user__email')

admin.site.register(User, CustomUserAdmin)
admin.site.register(UserPreference, UserPreferenceAdmin)
admin.site.register(Photo, PhotoAdmin)
admin.site.register(Match, MatchAdmin)