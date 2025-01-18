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
├── core/              # Main Django app
│   ├── __init__.py
│   ├── admin.py       # Admin interface configuration
│   ├── apps.py        # App configuration
│   ├── models.py      # Database models
│   ├── serializers.py # REST framework serializers
│   ├── views.py       # API views and logic
│   ├── urls.py        # App URL routing
│   ├── throttling.py  # Rate limiting configuration
│   ├── ai/            # AI functionality
│   │   └── ai_models.py  # AI model training and prediction
│   └── management/    # Custom management commands
│       └── commands/
│           └── load_calibration_photos.py
├── media/            # User uploaded files
│   └── user_<id>/    # User-specific media
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
│   ├── app/                    # Next.js App Router pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx         # Landing page
│   │   ├── not-found.tsx    # 404 page
│   │   ├── auth/            # Authentication pages
│   │   │   ├── login/      # Login page
│   │   │   └── register/   # Registration page
│   │   ├── onboarding/     # Onboarding flow
│   │   │   ├── page.tsx   # Basic info
│   │   │   ├── location-search.tsx  # Location search
│   │   │   └── preferences/ # Preferences page
│   │   ├── calibration/    # Photo calibration
│   │   ├── profile/        # User profile
│   │   └── dashboard/      # Main dashboard
│   ├── components/          # Reusable components
│   │   ├── ErrorBoundary.tsx  # Error handling
│   │   ├── ProtectedRoute.tsx # Auth protection
│   │   ├── ClientLayout.tsx   # Client-side layout
│   │   ├── layout/         # Layout components
│   │   │   └── Navigation.tsx  # Main navigation
│   │   └── providers/      # Context providers
│   │       └── AuthProvider.tsx  # Authentication state
│   ├── lib/                 # Utilities and services
│   │   ├── api/            # API service
│   │   │   └── index.ts   # API client configuration
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   │       └── urls.ts    # URL handling utilities
│   └── middleware.ts        # Next.js middleware
├── public/                  # Static assets
│   └── images/             # Image assets
├── tailwind.config.ts      # Tailwind CSS configuration
├── postcss.config.mjs      # PostCSS configuration
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── .env.local             # Environment variables
```

## Documentation Structure
```
documentation/
├── api-docs.md          # API documentation
├── backend-structure.md # Backend architecture
├── frontend-structure.md # Frontend architecture
├── file-structure.md    # This file
├── app_flow.md         # Application flow
├── MVP_steps.md        # MVP development steps
├── progress.md         # Development progress
└── roadmap.md          # Project roadmap
```

## Important Files and Their Purposes

### Backend Key Files
- `backend/settings.py`: Django configuration, database settings, middleware
- `core/models.py`: Database schema and relationships
- `core/views.py`: API endpoints and business logic
- `core/urls.py`: API routing
- `core/serializers.py`: Data serialization/deserialization
- `core/throttling.py`: Rate limiting configuration
- `core/ai/ai_models.py`: AI model training and prediction
- `requirements.txt`: Python package dependencies

### Frontend Key Files
- `src/app/layout.tsx`: Root layout component
- `src/middleware.ts`: Auth and routing middleware
- `src/lib/api/index.ts`: API service integration
- `src/lib/store/auth.ts`: Authentication state management
- `src/lib/types/index.ts`: TypeScript type definitions
- `next.config.js`: Next.js configuration
- `tailwind.config.ts`: Styling configuration
- `package.json`: Dependencies and scripts

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