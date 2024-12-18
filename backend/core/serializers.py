# /Users/gb/Desktop/Code/noswipe-app/backend/core/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Photo, Match, UserPreference

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'password2')

    def validate(self, attrs):
        print(f"DEBUG - RegisterSerializer validate - attrs: {attrs}")  # Debug print
        password1 = attrs.get('password', '')
        password2 = attrs.get('password2', '')
        
        if password1 != password2:
            print(f"DEBUG - Password mismatch: '{password1}' vs '{password2}'")  # Debug print
            raise serializers.ValidationError({
                "password": "Password fields didn't match. Please ensure both passwords are exactly the same."
            })
            
        return attrs

    def create(self, validated_data):
        print(f"DEBUG - RegisterSerializer create - validated_data: {validated_data}")  # Debug print
        validated_data.pop('password2')
        email = validated_data['email']
        
        # Set username equal to email - this will be used internally only
        validated_data['username'] = email
        
        try:
            # Ensure new users start with calibration_completed as False
            validated_data['calibration_completed'] = False
            user = User.objects.create_user(**validated_data)
            # Create empty preferences for the new user
            UserPreference.objects.create(user=user)
            print(f"DEBUG - User created successfully: {user.email}, calibration_completed: {user.calibration_completed}")
            return user
        except Exception as e:
            print(f"DEBUG - Error creating user: {str(e)}")
            raise serializers.ValidationError({"error": str(e)})

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)

    def validate(self, attrs):
        try:
            user = User.objects.get(email=attrs['email'])
            if user and authenticate(request=self.context.get('request'),
                                  username=user.username,
                                  password=attrs['password']):
                attrs['user'] = user
                return attrs
            raise serializers.ValidationError('Invalid credentials')
        except User.DoesNotExist:
            raise serializers.ValidationError('No user found with this email')

class UserProfileSerializer(serializers.ModelSerializer):
    location = serializers.JSONField(required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'username',
            'birth_date', 'gender', 'location', 'bio', 'profile_photo',
            'calibration_completed'
        ]
        read_only_fields = ['email', 'username']
        extra_kwargs = {
            'birth_date': {'required': False},
            'gender': {'required': False},
            'location': {'required': False},
            'bio': {'required': False},
            'profile_photo': {'required': False},
        }

    def update(self, instance, validated_data):
        # Convert location object to string if present
        if 'location' in validated_data and validated_data['location']:
            location_data = validated_data['location']
            location_str = f"{location_data.get('city', '')}"
            if location_data.get('region'):
                location_str += f", {location_data['region']}"
            if location_data.get('country'):
                location_str += f", {location_data['country']}"
            validated_data['location'] = location_str
            
        return super().update(instance, validated_data)

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ['id', 'image_url', 'gender', 'age', 'ethnicity', 'features']

class MatchSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    matched_user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'user', 'matched_user', 'status', 'created_at', 'compatibility_score']
        read_only_fields = ['user', 'matched_user', 'compatibility_score']

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            'preferred_gender', 'preferred_age_min', 'preferred_age_max',
            'preferred_location', 'max_distance'
        ]