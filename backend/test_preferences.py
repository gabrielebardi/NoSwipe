from core.models import User, UserPreference
from core.serializers import UserPreferenceSerializer
from django.contrib.auth import get_user_model

# Get test user
User = get_user_model()
test_user = User.objects.first()

# Create test preferences data
test_prefs = {
    'preferred_gender': 'F',
    'preferred_age_min': 20,
    'preferred_age_max': 35,
    'preferred_location': {
        'id': 'test_loc',
        'type': 'city',
        'city': 'New York',
        'country': 'USA',
        'latitude': 40.7128,
        'longitude': -74.0060
    },
    'max_distance': 25
}

# Test serializer
serializer = UserPreferenceSerializer(data=test_prefs)
print("\nValidation result:", serializer.is_valid())
if not serializer.is_valid():
    print("Validation errors:", serializer.errors)

# Get user's current preferences
if test_user:
    current_prefs = UserPreference.objects.filter(user=test_user).first()
    if current_prefs:
        print("\nCurrent preferences:", UserPreferenceSerializer(current_prefs).data)
    else:
        print("\nNo preferences found for test user") 