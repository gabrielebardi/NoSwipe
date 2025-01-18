# NoSwipe Onboarding Process

## Overview

The onboarding process is designed to collect essential user information and preferences to enable accurate matching. The process is sequential and must be completed before accessing the main application features.

## Steps

### 1. Basic Information
- **Email Verification**
  - User receives verification email after registration
  - Must verify email before proceeding
- **Personal Details**
  - First name and last name
  - Gender selection (M/F/B)
  - Birth date (with 18+ verification)
  - Location (city/town search)

### 2. Partner Preferences
- **Basic Preferences**
  - Preferred gender(s)
  - Age range
  - Location preferences (distance range)
- **Interest Rating** (In Development)
  - 15 key traits assessment
  - Scale: 1-5 rating for each trait
  - Importance weighting for each trait

### 3. Photo Calibration
- **Photo Upload**
  - Profile photo selection
  - Additional photos (up to 5)
  - Photo guidelines and verification
- **Preference Learning**
  - Rate sample photos (minimum 10)
  - AI model training based on ratings
  - Preference pattern analysis

### 4. Interest Assessment (In Development)
- **Self Assessment**
  - Rate personal traits (15 key areas)
  - Scale: 1-5 for each trait
  - Optional trait descriptions
- **Partner Preferences**
  - Rate importance of each trait
  - Specify acceptable ranges
  - Set deal-breakers

## Validation Rules

### Basic Information
- Email must be verified
- Age must be 18+
- Location must be valid city/town
- First and last name required

### Photos
- At least one profile photo required
- Maximum 6 photos total
- Photos must meet content guidelines
- No explicit content allowed

### Preferences
- Must specify at least one gender preference
- Age range must be reasonable (18-100)
- Location range must be set

### Calibration
- Minimum 10 photo ratings required
- Ratings must show consistent patterns
- Multiple random checks for quality

## Technical Implementation

### Frontend Routes
```typescript
/onboarding           # Basic information
/onboarding/photos    # Photo upload
/onboarding/preferences  # Partner preferences
/onboarding/calibration  # Photo calibration
```

### API Endpoints
```http
POST   /api/user/details/
PATCH  /api/user/preferences/
POST   /api/user/photos/
GET    /api/photos/calibration/
POST   /api/photos/rate/
POST   /api/calibration/complete/
GET    /api/user/onboarding-status/
```

### State Management
- Progress tracking per section
- Validation state for each field
- Error handling and display
- Progress persistence

## Error Handling

### Validation Errors
- Immediate field validation
- Form-level validation
- Server-side validation
- Clear error messages

### Technical Errors
- API error handling
- Photo upload retry logic
- Progress auto-save
- Session management

## Security Measures

- Rate limiting on all endpoints
- Photo content verification
- Data validation
- CSRF protection
- Secure cookie handling

## Future Enhancements

1. **Smart Photo Analysis**
   - Automatic face detection
   - Photo quality assessment
   - Content moderation

2. **Enhanced Preference Learning**
   - Machine learning model improvements
   - Better pattern recognition
   - More accurate matches

3. **Progressive Profiling**
   - Gradual information collection
   - Dynamic preference updates
   - Behavioral analysis 