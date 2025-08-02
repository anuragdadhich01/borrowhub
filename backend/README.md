# BorrowHub Backend

Complete REST API backend for the BorrowHub application with JWT authentication, in-memory database, and full CRUD operations.

## Features

- ✅ JWT-based authentication
- ✅ User management with profiles
- ✅ Item catalog management  
- ✅ Booking system with status tracking
- ✅ CORS enabled for frontend integration
- ✅ Thread-safe in-memory database

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login

### Items
- `GET /items` - List all available items
- `GET /items/{id}` - Get item details
- `GET /api/items` - List all available items (alternative endpoint)
- `GET /api/items/{id}` - Get item details (alternative endpoint)
- `POST /api/items` - Add new item (requires auth)

### Bookings
- `POST /api/bookings` - Create booking (requires auth)
- `GET /api/bookings` - Get user's bookings (requires auth)
- `PUT /api/bookings/{id}` - Update booking status (requires auth)

### Profile
- `GET /profile` - Get user profile (requires auth)
- `PUT /profile` - Update user profile (requires auth)
- `GET /api/profile` - Get user profile (alternative endpoint)
- `PUT /api/profile` - Update user profile (alternative endpoint)

### Health
- `GET /health` - Health check

## Quick Start

```bash
# Install dependencies
go mod tidy

# Build the application
go build .

# Run the server
./borrowhub
```

The server starts on port 8080.

## Sample Data

The application initializes with sample users and items:

**Users:**
- john@example.com / password123
- jane@example.com / password123

**Items:**
- Camera DSLR (₹50/day)
- Mountain Bike (₹30/day)  
- Gaming Console (₹25/day)

## Authentication

Protected endpoints require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <jwt_token>
```

Get a token by calling the `/login` endpoint with valid credentials.

## Example Usage

```bash
# Register a new user
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Get items
curl -X GET http://localhost:8080/items

# Create booking (with auth token)
curl -X POST http://localhost:8080/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"itemId":"3","startDate":"2025-08-03T00:00:00Z","endDate":"2025-08-04T00:00:00Z"}'
```

## Data Models

### User
- ID, Username, Email, Password (hashed)
- FirstName, LastName, Phone, Address
- CreatedAt

### Item  
- ID, Name, Description, DailyRate, ImageURL
- OwnerID, Available, CreatedAt
- Legacy fields: Title, Price (for backward compatibility)

### Booking
- ID, ItemID, UserID, StartDate, EndDate
- TotalPrice, Status, CreatedAt, UpdatedAt
- Status values: "pending", "confirmed", "completed", "cancelled"

## Security

- Passwords are hashed with bcrypt
- JWT tokens expire after 24 hours
- Passwords are never returned in API responses
- Thread-safe database operations with mutex locks

## Deployment Notes

For production deployment:
1. Use environment variables for JWT secret
2. Replace in-memory database with persistent storage (PostgreSQL, MySQL, etc.)
3. Configure specific CORS origins instead of "*"
4. Add rate limiting and request validation
5. Set up proper logging and monitoring