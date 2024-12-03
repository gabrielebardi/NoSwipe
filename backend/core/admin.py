from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserPreferences, Photo, PhotoRating, InterestRating

class PhotoRatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'photo', 'rating', 'rated_at')
    list_filter = ('rating', 'rated_at')
    search_fields = ('user__username', 'photo__id')

class PhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('user__username',)

admin.site.register(Photo, PhotoAdmin)
admin.site.register(PhotoRating, PhotoRatingAdmin)
admin.site.register(InterestRating)
# Register the CustomUser model with the admin site
admin.site.register(CustomUser, UserAdmin)

# Register other models
admin.site.register(UserPreferences)