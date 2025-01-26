"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os
from pathlib import Path
from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise

# Define the base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Set the default settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Get the WSGI application
application = get_wsgi_application()

# Serve static files using WhiteNoise
application = WhiteNoise(application)

# Enforce detection of static files when in production
application.add_files(BASE_DIR / "staticfiles", prefix="static/")