# /Users/gb/Desktop/Code/noswipe-app/backend/core/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Photo, Match, UserPreference

User = get_user_model()

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ['id', 'image_url', 'is_profile_photo', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'password2')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

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
        
        try:
            # Create user without username
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                calibration_completed=False
            )
            
            # Create empty preferences for the new user
            UserPreference.objects.create(user=user)
            print(f"DEBUG - User created successfully: {user.email}, calibration_completed: {user.calibration_completed}")
            return user
        except Exception as e:
            print(f"DEBUG - Error creating user: {str(e)}")
            raise serializers.ValidationError({"error": str(e)})

class LoginSerializer(serializers.Serializer):
    """Serializer for the user login process."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        print(f"DEBUG - LoginSerializer validate - received email: {attrs.get('email')}")
        
        # Authenticate using EmailBackend
        user = authenticate(
            request=self.context.get('request'),
            email=attrs['email'],
            password=attrs['password']
        )
        
        if user:
            print(f"DEBUG - Successfully authenticated user: {user.email}")
            attrs['user'] = user
            return attrs
        
        print("DEBUG - Authentication failed")
        raise serializers.ValidationError({
            'non_field_errors': ['Invalid email or password.']
        })

class UserProfileSerializer(serializers.ModelSerializer):
    location = serializers.JSONField(required=False)
    age = serializers.IntegerField(read_only=True)
    likes = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    dislikes = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    photos = PhotoSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'birth_date', 'gender', 'location', 'bio', 'profile_photo',
            'calibration_completed', 'age', 'likes', 'dislikes', 'photos'
        ]
        read_only_fields = ['email', 'age', 'photos']
        extra_kwargs = {
            'birth_date': {'required': False},
            'gender': {'required': False},
            'location': {'required': False},
            'bio': {'required': False},
            'profile_photo': {'required': False},
            'likes': {'required': False},
            'dislikes': {'required': False},
        }

    def update(self, instance, validated_data):
        # Handle likes and dislikes
        if 'likes' in validated_data:
            validated_data['likes'] = list(set(validated_data['likes']))  # Remove duplicates
        if 'dislikes' in validated_data:
            validated_data['dislikes'] = list(set(validated_data['dislikes']))  # Remove duplicates
            
        return super().update(instance, validated_data)

class MatchSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    matched_user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'user', 'matched_user', 'status', 'created_at', 'compatibility_score']
        read_only_fields = ['user', 'matched_user', 'compatibility_score']

class UserPreferenceSerializer(serializers.ModelSerializer):
    preferred_location = serializers.JSONField()
    
    class Meta:
        model = UserPreference
        fields = [
            'preferred_gender',
            'preferred_location',
            'preferred_age_min',
            'preferred_age_max',
        ]
    
    def validate(self, attrs):
        print(f"DEBUG - UserPreferenceSerializer validate - attrs: {attrs}")
        
        # Validate required fields
        required_fields = {
            'preferred_gender': 'Gender preference is required',
            'preferred_location': 'Location preference is required',
            'preferred_age_min': 'Minimum age preference is required',
            'preferred_age_max': 'Maximum age preference is required'
        }
        
        missing_fields = {
            field: message
            for field, message in required_fields.items()
            if field not in attrs or attrs[field] is None
        }
        
        if missing_fields:
            raise serializers.ValidationError(missing_fields)
        
        # Validate age range
        age_min = attrs['preferred_age_min']
        age_max = attrs['preferred_age_max']
        if age_min > age_max:
            raise serializers.ValidationError({
                'preferred_age_min': 'Minimum age cannot be greater than maximum age'
            })
        if age_min < 18:
            raise serializers.ValidationError({
                'preferred_age_min': 'Minimum age must be at least 18'
            })
        if age_max > 100:
            raise serializers.ValidationError({
                'preferred_age_max': 'Maximum age cannot exceed 100'
            })
        
        # Validate location format
        location = attrs['preferred_location']
        required_location_fields = ['id', 'type', 'city', 'country', 'latitude', 'longitude']
        missing_location_fields = [
            field for field in required_location_fields
            if field not in location or location[field] is None
        ]
        if missing_location_fields:
            raise serializers.ValidationError({
                'preferred_location': f'Location is missing required fields: {", ".join(missing_location_fields)}'
            })
        
        return attrs