# Asmadiya API Documentation

A Node.js/Express.js REST API with user authentication and file upload capabilities.

## Table of Contents
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account (for file uploads)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Asmadiya

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the development server
npm run dev
```

### Environment Variables
Create a `.env` file with the following variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRY=1d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## API Endpoints

### User Registration
Register a new user with avatar upload.

**Endpoint:** `POST /api/v1/users/register`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | Yes | User's first name |
| lastName | string | Yes | User's last name |
| email | string | Yes | User's email address |
| password | string | Yes | User's password |
| phone | string | Yes | User's phone number |
| companyName | string | No | User's company name |
| avatar | file | Yes | User's profile picture |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john.doe@example.com" \
  -F "password=securePassword123" \
  -F "phone=+1234567890" \
  -F "companyName=Tech Corp" \
  -F "avatar=@/path/to/avatar.jpg"
```

**Success Response (201):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "companyName": "Tech Corp",
    "avatar": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/avatar.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "User Register Successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or avatar
- `409 Conflict`: User already exists (email or phone)
- `400 Bad Request`: Error uploading avatar to Cloudinary
- `500 Internal Server Error`: Error creating user

### User Login
Authenticate an existing user and receive access token.

**Endpoint:** `POST /api/v1/users/login`

**Content-Type:** `application/json`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "companyName": "Tech Corp",
      "avatar": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/avatar.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User LoggedIn Successfully"
}
```

**Note:** The access token is also set as an HTTP-only cookie for enhanced security.

**Error Responses:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: User does not exist or invalid password

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login, the access token is provided in both the response body and as an HTTP-only cookie.

### Using the Access Token
Include the access token in the Authorization header for protected routes:
```bash
Authorization: Bearer <access_token>
```

Or use the HTTP-only cookie that's automatically sent with requests.

## Error Handling

The API uses a standardized error response format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "success": false
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `409`: Conflict
- `500`: Internal Server Error

## File Upload

The API supports file uploads using Multer middleware and stores files on Cloudinary. Supported file types and size limits are configured in the multer middleware.

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running in Production
```bash
npm start
```

### Available Scripts
- `npm run dev`: Start development server with nodemon
- `npm start`: Start production server
- `npm run build`: Build TypeScript to JavaScript

## Technologies Used

- **Backend Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Password Hashing**: bcrypt
- **Development**: Nodemon

## License

This project is licensed under the MIT License.
