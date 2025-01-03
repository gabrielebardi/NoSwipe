# NoSwipe App File Structure

## Project Root
```
noswipe-app/
├── backend/             # Django backend
├── frontend/           # Next.js frontend
└── documentation/      # Project documentation
```

## Backend Structure
```
backend/
├── backend/            # Django project configuration
│   ├── __init__.py
│   ├── settings.py     # Project settings
│   ├── urls.py        # Main URL configuration
│   └── wsgi.py        # WSGI configuration
│
├── core/              # Main Django app
│   ├── __init__.py
│   ├── admin.py       # Admin interface configuration
│   ├── apps.py        # App configuration
│   ├── models.py      # Database models
│   ├── serializers.py # REST framework serializers
│   ├── urls.py        # App URL patterns
│   ├── views.py       # View logic
│   ├── authentication_backends.py  # Custom auth
│   └── management/    # Custom management commands
│       └── commands/
│           └── load_calibration_photos.py
│
├── media/            # User uploaded files
│   └── user_<id>/    # User-specific media
│
├── static/           # Static files
├── staticfiles/      # Collected static files
├── user_models/      # AI model storage
├── env/             # Virtual environment
├── requirements.txt  # Python dependencies
├── manage.py        # Django management script
└── .env             # Environment variables
```

## Frontend Structure
```
frontend/
├── src/
│   ├── app/          # Next.js app directory
│   │   ├── globals.css  # Global styles
│   │   ├── auth/     # Authentication pages
│   │   ├── onboarding/  # Onboarding flow
│   │   ├── profile/    # Profile management
│   │   └── dashboard/  # User dashboard
│   │
│   ├── components/   # Reusable React components
│   ├── lib/         # Utilities and services
│   │   ├── api/     # API integration
│   │   └── store/   # State management
│   │
│   └── types/       # TypeScript definitions
│
├── public/          # Static assets
├── node_modules/    # Node.js dependencies
├── .next/          # Next.js build output
├── package.json    # Node.js dependencies and scripts
└── .env.local      # Environment variables
```

## Documentation Structure
```
documentation/
├── MVP_steps.md     # MVP development steps
├── progress.md      # Development progress tracking
├── roadmap.md       # Project roadmap
└── file_structure.md  # This file structure documentation
```

## Important Files and Their Purposes

### Backend Key Files
- `backend/settings.py`: Django configuration, database settings, middleware
- `core/models.py`: Database schema and relationships
- `core/views.py`: API endpoints and business logic
- `core/urls.py`: API routing
- `core/serializers.py`: Data serialization/deserialization
- `requirements.txt`: Python package dependencies

### Frontend Key Files
- `src/app/layout.tsx`: Root layout component
- `src/lib/api/index.ts`: API service integration
- `src/lib/store/auth.ts`: Authentication state management
- `src/types/index.ts`: TypeScript type definitions
- `package.json`: Node.js dependencies and scripts
- `.env.local`: Frontend environment variables

## File Naming Conventions

1. Backend:
- Python files: snake_case
- Django apps: lowercase
- Class names: PascalCase
- Functions/variables: snake_case

2. Frontend:
- Components: PascalCase
- Utilities/hooks: camelCase
- Files containing components: PascalCase
- Other TypeScript/JavaScript files: camelCase

## Directory Structure Rules

1. New Django apps should be created at the same level as `core/`
2. Media files should always go in `backend/media/`
3. Frontend pages should be in `src/app/`
4. Reusable components should be in `src/components/`
5. API integration code should be in `src/lib/api/`
6. Documentation should be in the root `documentation/` folder

## Note on Generated Directories
- `backend/staticfiles/`: Generated by Django's collectstatic
- `frontend/.next/`: Generated by Next.js build
- `backend/media/`: Generated when users upload files
- `__pycache__/`: Python bytecode cache directories

This structure should be maintained for consistency and to avoid duplicate or misplaced files. 