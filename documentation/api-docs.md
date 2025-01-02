# API Documentation

## Authentication

The application uses JWT (JSON Web Token) authentication. All authenticated endpoints require a valid JWT token in the Authorization header.

### Authentication Flow

1. Register a new user
2. Login to get access and refresh tokens
3. Use access token for authenticated requests
4. Refresh token when access token expires
5. Logout to invalidate tokens

### Endpoints

#### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "password2": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}

Response (201 Created):
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "tokens": {
    "refresh": "your.refresh.token",
    "access": "your.access.token"
  },
  "message": "Registration successful"
}
```

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response (200 OK):
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "tokens": {
    "refresh": "your.refresh.token",
    "access": "your.access.token"
  },
  "calibration_completed": false
}
```

#### Logout
```http
POST /api/auth/logout/
Authorization: Bearer your.access.token
Content-Type: application/json

{
  "refresh_token": "your.refresh.token"
}

Response (200 OK):
{
  "message": "Successfully logged out"
}
```

#### Refresh Token
```http
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "your.refresh.token"
}

Response (200 OK):
{
  "access": "new.access.token"
}
```

## User Management

### User Profile

#### Get User Details
```http
GET /api/user/details/
Authorization: Bearer your.access.token

Response (200 OK):
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "gender": "male",
  "birth_date": "1990-01-01",
  "location": "New York, USA",
  "profile_photo": "url_to_photo"
}
```

#### Update User Details
```http
PATCH /api/user/details/
Authorization: Bearer your.access.token
Content-Type: application/json

{
  "gender": "male",
  "birth_date": "1990-01-01",
  "location": "New York, USA"
}

Response (200 OK):
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "gender": "male",
    "birth_date": "1990-01-01",
    "location": "New York, USA"
  },
  "basic_info_complete": true
}
```

### User Preferences

#### Get User Preferences
```http
GET /api/user/preferences/
Authorization: Bearer your.access.token

Response (200 OK):
{
  "preferred_gender": "female",
  "preferred_location": "New York, USA",
  "preferred_age_min": 18,
  "preferred_age_max": 35
}
```

#### Update User Preferences
```http
PATCH /api/user/preferences/
Authorization: Bearer your.access.token
Content-Type: application/json

{
  "preferred_gender": "female",
  "preferred_location": "New York, USA",
  "preferred_age_min": 18,
  "preferred_age_max": 35
}

Response (200 OK):
{
  "preferred_gender": "female",
  "preferred_location": "New York, USA",
  "preferred_age_min": 18,
  "preferred_age_max": 35
}
```

## Onboarding

### Get Onboarding Status
```http
GET /api/user/onboarding-status/
Authorization: Bearer your.access.token

Response (200 OK):
{
  "status": "incomplete",
  "current_step": "details",
  "next_step": "/onboarding",
  "steps_completed": {
    "basic_info": false,
    "preferences": false,
    "calibration": false
  },
  "missing_fields": {
    "basic_info": {
      "gender": true,
      "birth_date": true,
      "location": true
    },
    "preferences": {
      "preferred_gender": true,
      "preferred_location": true,
      "preferred_age_min": true,
      "preferred_age_max": true
    },
    "calibration": true
  }
}
```

## Calibration

### Get Calibration Photos
```http
GET /api/photos/calibration/
Authorization: Bearer your.access.token

Response (200 OK):
{
  "photos": [
    "url_to_photo_1",
    "url_to_photo_2",
    "url_to_photo_3"
  ]
}
```

### Submit Photo Rating
```http
POST /api/photos/rate/
Authorization: Bearer your.access.token
Content-Type: application/json

{
  "photo_url": "url_to_photo",
  "rating": 5
}

Response (200 OK):
{
  "status": "success",
  "message": "Rating saved successfully"
}
```

### Complete Calibration
```http
POST /api/user/calibrate/
Authorization: Bearer your.access.token

Response (200 OK):
{
  "status": "success",
  "message": "Calibration completed and model trained successfully"
}
```

## Location Search

### Search Locations
```http
GET /api/locations/search/?query=New York
Authorization: Bearer your.access.token

Response (200 OK):
[
  {
    "id": "123",
    "type": "city",
    "city": "New York",
    "region": "New York",
    "country": "United States",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "display_name": "New York, United States"
  }
]
```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Descriptive error message"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error 