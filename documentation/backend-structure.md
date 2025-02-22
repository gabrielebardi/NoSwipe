# Backend Structure Documentation

## Overview

The backend is built using Django and Django REST Framework, with JWT authentication for secure API access. The application follows a modular architecture with clear separation of concerns.

## Environment Setup

1. Always activate the environment from the project root using:
```bash
source env/bin/activate
```

2. Install all Python dependencies in this environment:
```bash
pip install -r backend/requirements.txt
```

3. Keep `requirements.txt` in the backend folder but use the virtual environment from the project root.

## Directory Structure

```
backend/
├── backend/                 # Project configuration
│   ├── settings.py        # Django settings
│   ├── urls.py           # Main URL routing
│   └── wsgi.py           # WSGI configuration
├── core/                   # Main application
│   ├── __init__.py       # Package initialization
│   ├── admin.py          # Admin interface configuration
│   ├── apps.py           # App configuration
│   ├── models.py         # Database models
│   ├── serializers.py    # API serializers
│   ├── views.py          # API views and logic
│   ├── urls.py           # App URL routing
│   ├── throttling.py     # Rate limiting configuration
│   ├── ai/               # AI functionality
│   │   └── ai_models.py  # AI model training and prediction
│   └── management/       # Custom management commands
│       └── commands/
│           └── load_calibration_photos.py
├── media/                  # User uploaded files
│   └── user_<id>/         # User-specific media
├── static/                 # Static files
├── staticfiles/           # Collected static files
├── user_models/           # AI model storage
├── env/                   # Virtual environment
├── requirements.txt       # Python dependencies
├── manage.py             # Django management script
└── .env                  # Environment variables
```

## Authentication

The application uses JWT (JSON Web Token) authentication with the following configuration:

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}
```

## Models

### User Model

The application uses a custom user model that extends Django's AbstractUser:

```python
# core/models.py
class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = None
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    profile_photo = models.URLField(max_length=500, null=True, blank=True)
    calibration_completed = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
```

### Photo Model

Handles photo management for calibration and user profiles:

```python
# core/models.py
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
        if gender == 'B':
            # For 'Both', get 50/50 split of male and female photos
            male_count = count // 2
            female_count = count - male_count
            male_photos = cls.get_calibration_photos('M', male_count)
            female_photos = cls.get_calibration_photos('F', female_count)
            return male_photos + female_photos
            
        return cls.objects.filter(gender=gender.upper()).order_by('?')[:count]
```

## Views

### Authentication Views

```python
# core/views.py
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'calibration_completed': user.calibration_completed
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

## Error Handling

The application implements consistent error handling across all views:

```python
# core/views.py
try:
    # View logic
except Exception as e:
    return Response(
        {'error': str(e)},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
```

## Security

### CORS Configuration

```python
# settings.py
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-requested-with',
]
```

## File Handling

### Media Files Configuration

```python
# settings.py
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# File Upload Settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755
```

## Development Guidelines

1. Always use type hints in Python code
2. Write docstrings for all models, views, and complex functions
3. Follow PEP 8 style guide
4. Use Django's built-in security features
5. Write tests for critical functionality
6. Keep views focused and simple
7. Use appropriate status codes in API responses
8. Handle errors gracefully
9. Log important events and errors
10. Document API endpoints 

## Deployment Configuration

### Production Settings

```python
# settings.py
DEBUG = False
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'your_domain.com', 'staging.your_domain.com']

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static'
]

# Database configuration
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL', 'sqlite:///db.sqlite3'),
        conn_max_age=600
    )
}
```

### Environment Variables

Required environment variables for production:
```
DEBUG=False
SECRET_KEY=<your-secret-key>
DATABASE_URL=<your-database-url>
ALLOWED_HOSTS=your_domain.com,staging.your_domain.com
```

### Deployment Files

1. `Procfile` (in backend root directory):
```
web: gunicorn backend.wsgi:application
```

2. `requirements.txt` additions:
```
gunicorn==21.2.0
dj-database-url==2.1.0
```

### Production Server

To test the production setup locally:
1. Collect static files:
```bash
python manage.py collectstatic
```

2. Run the production server:
```bash
gunicorn backend.wsgi:application
```

### Security Considerations for Production

1. Always use HTTPS in production
2. Set secure cookie settings:
```python
# settings.py
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

3. Update CORS settings for production:
```python
CORS_ALLOWED_ORIGINS = [
    'https://your_domain.com',
    'https://staging.your_domain.com',
]
``` 