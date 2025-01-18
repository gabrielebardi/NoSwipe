# NoSwipe App Flow

## User Journey Overview

### 1. Initial Access & Authentication
- User lands on homepage (`/`)
- Two paths available:
  - New users: Register → Login
  - Existing users: Direct login
- All protected pages redirect to login if user is not authenticated

### 2. Registration Flow
- Simple registration form requiring:
  - Email
  - Password
  - Password confirmation
  - First name
  - Last name
- Upon successful registration:
  - Account is created
  - User is redirected to login page
  - Onboarding status is set to incomplete
  - Next step is set to 1 (basic info)

### 3. Login Flow
- User enters email and password
- Upon successful login:
  - Frontend receives user data including:
    - Basic user information
    - Onboarding completion status
    - Next onboarding step (if incomplete)
  - System checks onboarding status:
    - If incomplete: Redirect to appropriate onboarding step
    - If complete: Redirect to dashboard

### 4. Onboarding Process
Three mandatory sequential steps:

#### Step 1: Basic Information
- Gender selection (M/F/B)
- Birth date (18+ verification)
- Location (city/town search)
- All fields must be completed to proceed

#### Step 2: Partner Preferences
- Preferred gender(s)
- Age range preferences
  - Minimum: 18 years
  - Maximum: 65+ years
- Location preferences
  - Primary location
  - Maximum distance willing to travel
- All preferences must be set to proceed

#### Step 3: Photo Calibration
- User is presented with photos matching their gender preference
- Rates each photo from 1 to 5
- Minimum number of ratings required to complete
- Used to train the preference inference model
- Upon completion:
  - Model is trained with initial preferences
  - User is redirected to dashboard

### 5. Post-Onboarding Access
- Completed onboarding:
  - Direct access to dashboard on login
  - Full access to all app features
- Incomplete onboarding:
  - Redirected to next incomplete step
  - Limited access until completion

### 6. Protected Routes
All routes except public ones require:
- Valid authentication
- Completed onboarding (except onboarding routes)

## Technical Implementation

### Route Structure
```
Public Routes:
/                   # Landing page
/auth/login         # Login page
/auth/register      # Registration page

Protected Routes (require auth):
/onboarding         # Basic information (Step 1)
/onboarding/preferences    # Partner preferences (Step 2)
/onboarding/calibration    # Photo calibration (Step 3)
/dashboard          # Main app interface
/profile            # Profile management
/settings           # User settings
```

### Authentication Flow
- JWT-based authentication
- Token storage in secure cookies
- Automatic token refresh
- Session persistence across page reloads

### State Management
- Authentication state
- User data
- Onboarding progress
- Preferences data
- Calibration data

### Security Measures
- Protected route enforcement
- Token validation
- CSRF protection
- Secure cookie handling 