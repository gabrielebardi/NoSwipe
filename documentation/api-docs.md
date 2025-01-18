# NoSwipe API Documentation

API Version: v1
Base URL: `http://localhost:8000/api`

## API Conventions

### Versioning
The API version is included in the response headers:
```http
X-API-Version: v1
```

### Rate Limiting
To ensure service stability, the API implements rate limiting:
- Authentication endpoints: 5 requests per minute
- User operations: 60 requests per minute
- Photo operations: 30 requests per minute

Rate limit headers in responses:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

### Security Headers
All responses include the following security headers:
```http
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Pagination
List endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10, max: 50)

Example response:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/endpoint/?page=3",
  "previous": "http://localhost:8000/api/endpoint/?page=1",
  "results": []
}
```

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
    {
      "id": 1,
      "image_url": "url_to_photo_1",
      "gender": "F"
    },
    {
      "id": 2,
      "image_url": "url_to_photo_2",
      "gender": "F"
    }
  ]
}
```

### Submit Photo Rating
```http
POST /api/photos/rate/
Authorization: Bearer your.access.token
Content-Type: application/json

{
  "photo_id": 1,
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
POST /api/calibration/complete/
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
GET /api/locations/search/?query=Zurich
Authorization: Bearer your.access.token

Response (200 OK):
[
  {
    "id": "123",
    "type": "city",
    "city": "Zurich",
    "region": "Zurich",
    "country": "Switzerland",
    "latitude": 47.3769,
    "longitude": 8.5417,
    "display_name": "Zurich, Switzerland"
  }
]
```

## User Photos

### Upload Photo
```http
POST /api/user/photos/
Authorization: Bearer your.access.token
Content-Type: multipart/form-data

{
  "photo": [binary_file]
}

Response (201 Created):
{
  "id": 1,
  "image_url": "url_to_photo",
  "is_profile_photo": true
}
```

### Get User Photos
```http
GET /api/user/photos/
Authorization: Bearer your.access.token

Response (200 OK):
[
  {
    "id": 1,
    "image_url": "url_to_photo_1",
    "is_profile_photo": true
  },
  {
    "id": 2,
    "image_url": "url_to_photo_2",
    "is_profile_photo": false
  }
]
```

### Delete Photo
```http
DELETE /api/user/photos/{photo_id}/
Authorization: Bearer your.access.token

Response (204 No Content)
```

## Health Check

### Check API Status
```http
GET /api/health/
Response (200 OK):
{
  "status": "healthy"
}
```

## Error Handling

All endpoints follow a consistent error response format:

### Validation Errors (400 Bad Request)
```json
{
  "errors": {
    "field_name": [
      "Error message for the field"
    ]
  }
}
```

### Authentication Errors (401 Unauthorized)
```json
{
  "error": "Invalid credentials",
  "code": "invalid_credentials"
}
```

### Permission Errors (403 Forbidden)
```json
{
  "error": "You do not have permission to perform this action",
  "code": "permission_denied"
}
```

### Not Found Errors (404 Not Found)
```json
{
  "error": "Requested resource not found",
  "code": "not_found"
}
```

### Rate Limit Errors (429 Too Many Requests)
```json
{
  "error": "Rate limit exceeded",
  "code": "rate_limit_exceeded",
  "retry_after": 60
}
```

### Server Errors (500 Internal Server Error)
```json
{
  "error": "An unexpected error occurred",
  "code": "internal_server_error",
  "request_id": "req_123abc"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error 