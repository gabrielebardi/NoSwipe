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
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        # Generate username from email
        email = validated_data['email']
        username = email.split('@')[0]
        base_username = username
        counter = 1
        
        # Ensure unique username
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
            
        validated_data['username'] = username
        user = User.objects.create_user(**validated_data)
        return user

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