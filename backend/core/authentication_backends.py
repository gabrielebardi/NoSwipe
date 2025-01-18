# backend/core/authentication_backends.py

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailBackend(ModelBackend):
    """
    Custom authentication backend to allow login with email/username and password.
    """
    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        try:
            # Handle both username and email authentication
            if email is None:
                email = username  # Try using username as email for admin login
                
            print(f"DEBUG - EmailBackend authenticate - email/username: {email}")
            if not email:
                return None
                
            # Get user by email
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # If user not found by email, try username
                try:
                    user = User.objects.get(username=email)
                except User.DoesNotExist:
                    print(f"DEBUG - No user found with email/username: {email}")
                    return None
                    
            print(f"DEBUG - Found user: {user.email}")
            
            # Check password
            if user.check_password(password):
                print(f"DEBUG - Password check successful for user: {user.email}")
                return user
            else:
                print("DEBUG - Password check failed")
                return None
                
        except Exception as e:
            print(f"DEBUG - Authentication error: {str(e)}")
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None