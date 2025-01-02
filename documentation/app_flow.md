# NoSwipe App Flow

## User Journey Overview

### 1. Initial Access
- Landing page with login/register options
- Clear value proposition and app description
- Simple registration form requiring only email and password

### 2. Authentication Flow
- Email-based authentication (no username required)
- Session management using Django sessions
- Cookie-based state tracking
  - `sessionid`: Authentication state
  - `onboarding_completed`: Onboarding progress
  - `csrftoken`: Security token

### 3. Onboarding Process (New Users)
Three-step mandatory process:

#### Step 1: User Profile & Self-Assessment
- Basic Information:
  - Gender selection (M/F/O)
  - Birth date (18+ verification)
  - Location (city/town search)
- Self-Interest Ratings:
  - 15 personality traits/interests rated 1-5
  - Topics from Work-Life Balance to Socio-Political Outlook
  - Mandatory completion of all ratings

#### Step 2: Partner Preferences & Trait Importance
- Match Criteria:
  - Preferred gender(s)
  - Age range preferences
  - Location/distance preferences
- Partner Interest Ratings:
  - Same 15 traits rated for importance in a partner
  - 1-5 scale for each trait
  - All ratings required to proceed

#### Step 3: Photo Calibration
- Rate 10-20 potential match photos
- Like/dislike or numeric rating system
- Builds initial preference model

### 4. Main Application Experience

#### Dashboard
- Match recommendations
- Profile completion status
- Recent activity

#### Profile Management
- Photo management (up to 6 photos)
- Bio and basic info editing
- Interest/trait updates

#### Match Interaction
- View potential matches
- Like/pass functionality
- Match chat system

#### Settings & Preferences
- Update match criteria
- Modify location preferences
- Option to restart onboarding

### 5. Session Management

#### Cookie Strategy
- Authentication state tracking
- Onboarding progress persistence
- CSRF protection
- Secure session handling

#### State Management
- Zustand for frontend state
- Django sessions for backend state
- Real-time updates where applicable

### 6. Re-Onboarding Process

#### Trigger Conditions
- User-initiated reset
- Significant preference changes
- Account reactivation

#### Reset Process
- Clear existing preferences
- Reset calibration data
- Maintain basic profile info
- Complete new onboarding flow

## Technical Implementation

### Frontend Routes
```
/                   # Landing page
/auth/login         # Login page
/auth/register      # Registration page
/onboarding/*       # Onboarding flow
/dashboard          # Main app interface
/profile            # Profile management
/settings           # User settings
```

### State Management
- Authentication state
- User preferences
- Onboarding progress
- Match data
- Chat sessions

### Error Handling
- Form validation
- API error responses
- Session timeout handling
- Network error recovery

### Security Measures
- CSRF protection
- Session security
- Input validation
- Rate limiting

## User Experience Considerations

### Progressive Disclosure
- Simple registration
- Guided onboarding
- Feature introduction
- Help documentation

### Validation & Feedback
- Real-time form validation
- Progress indicators
- Success/error messages
- Loading states

### Accessibility
- Keyboard navigation
- Screen reader support
- Color contrast
- Error announcements

### Performance
- Lazy loading
- Optimized images
- Caching strategy
- API response times 