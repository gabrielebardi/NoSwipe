# Onboarding Process

## Overview
The onboarding process is a crucial part of the user experience, designed to gather essential information about new users and their preferences. This process consists of several steps that must be completed in sequence.

## Steps

### 1. Basic Information
- First name
- Last name
- Birth date
- Gender (M/F/B)
- Location
- Bio (optional)

### 2. Preferences
Users specify their preferences for potential matches:
- Preferred gender(s):
  - Male (M)
  - Female (F)
  - Both (B)
  Note: When "Both" is selected, the calibration phase will provide a balanced 50/50 distribution of male and female photos.
- Age range (minimum and maximum)
- Preferred location
- Maximum distance (in kilometers/miles)

### 3. Calibration
The calibration phase helps the system understand the user's preferences through photo ratings:
- Users are presented with a series of photos to rate (1-5 stars)
- Photos are selected based on the user's gender preference:
  - If preference is Male or Female: shows photos of the selected gender
  - If preference is Both: shows an equal distribution (50/50) of male and female photos
- Each photo must be rated before proceeding
- Minimum number of photos required: 10
- Photos are pre-selected to represent a diverse range of appearances

### 4. Completion
- All steps must be completed in sequence
- Progress is saved after each step
- Users can return to complete remaining steps if interrupted
- Upon completion, users are directed to their personalized dashboard

## Technical Implementation

### API Endpoints
- GET `/api/user/onboarding-status/` - Check current onboarding status
- PATCH `/api/user/basic-info/` - Update basic information
- PATCH `/api/user/preferences/` - Update preferences
- GET `/api/photos/calibration/` - Get calibration photos
- POST `/api/photos/{id}/rate/` - Submit photo rating
- POST `/api/calibration/complete/` - Mark calibration as complete

### Data Validation
- Age must be 18+
- Location must be a valid place
- Preferences must be within reasonable ranges
- All required fields must be completed

### Photo Management
- Calibration photos are stored in gender-specific directories
- Photos are served through Django's static files system
- Equal distribution is maintained for users interested in both genders
- Photos are pre-processed and optimized for web delivery

## Error Handling
- Validation errors are clearly communicated
- Progress is saved to prevent data loss
- Users can retry failed steps
- Network errors are handled gracefully

## Security
- All endpoints require authentication
- Data is validated server-side
- Personal information is encrypted
- Rate limiting is implemented on API endpoints

## User Experience
- Clear progress indication
- Intuitive navigation
- Helpful error messages
- Smooth transitions between steps
- Mobile-responsive design

## Testing
- Unit tests for all components
- Integration tests for the complete flow
- Edge case handling
- Performance testing for photo loading
- Cross-browser compatibility testing 