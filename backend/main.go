package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"golang.org/x/crypto/bcrypt"
)

// Enhanced Item model with all required fields
type Item struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Title       string    `json:"title"`       // Keep for backward compatibility
	Description string    `json:"description"`
	DailyRate   float64   `json:"dailyRate"`
	Price       int       `json:"price"`       // Keep for backward compatibility
	ImageURL    string    `json:"imageUrl"`
	OwnerID     string    `json:"ownerId"`
	Available   bool      `json:"available"`
	CreatedAt   time.Time `json:"createdAt"`
}

// Enhanced User model with profile fields
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"password,omitempty"` // Allow input but omit in output
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Phone     string    `json:"phone"`
	Address   string    `json:"address"`
	CreatedAt time.Time `json:"createdAt"`
}

// Enhanced Booking model with proper relationships and status
type Booking struct {
	ID          string    `json:"id"`
	ItemID      string    `json:"itemId"`
	UserID      string    `json:"userId"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
	TotalPrice  float64   `json:"totalPrice"`
	Status      string    `json:"status"` // "pending", "confirmed", "completed", "cancelled"
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// JWT Claims structure
type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// In-memory database
type Database struct {
	Users    map[string]*User    `json:"users"`
	Items    map[string]*Item    `json:"items"`
	Bookings map[string]*Booking `json:"bookings"`
	mutex    sync.RWMutex
}

var (
	db        = &Database{
		Users:    make(map[string]*User),
		Items:    make(map[string]*Item),
		Bookings: make(map[string]*Booking),
	}
	jwtSecret = []byte("your-secret-key") // In production, use environment variable
	counter   = 0
	counterMu sync.Mutex
	httpHandler http.Handler // Global handler for Lambda
)

// Helper function to generate IDs
func generateID() string {
	counterMu.Lock()
	defer counterMu.Unlock()
	counter++
	return strconv.Itoa(counter)
}

// Initialize some sample data
func initSampleData() {
	// Create sample users
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	
	user1 := &User{
		ID:        generateID(),
		Username:  "john_doe",
		Email:     "john@example.com",
		Password:  string(hashedPassword),
		FirstName: "John",
		LastName:  "Doe",
		Phone:     "1234567890",
		Address:   "123 Main St",
		CreatedAt: time.Now(),
	}
	
	user2 := &User{
		ID:        generateID(),
		Username:  "jane_smith",
		Email:     "jane@example.com",
		Password:  string(hashedPassword),
		FirstName: "Jane",
		LastName:  "Smith",
		Phone:     "0987654321",
		Address:   "456 Oak Ave",
		CreatedAt: time.Now(),
	}

	db.Users[user1.ID] = user1
	db.Users[user2.ID] = user2

	// Create sample items
	item1 := &Item{
		ID:          generateID(),
		Name:        "Camera DSLR",
		Title:       "Camera DSLR", // Backward compatibility
		Description: "Professional DSLR camera perfect for photography enthusiasts",
		DailyRate:   50.0,
		Price:       50, // Backward compatibility
		ImageURL:    "https://placehold.co/600x400/556cd6/white?text=Camera+DSLR",
		OwnerID:     user1.ID,
		Available:   true,
		CreatedAt:   time.Now(),
	}

	item2 := &Item{
		ID:          generateID(),
		Name:        "Mountain Bike",
		Title:       "Mountain Bike",
		Description: "High-quality mountain bike suitable for all terrains",
		DailyRate:   30.0,
		Price:       30,
		ImageURL:    "https://placehold.co/600x400/556cd6/white?text=Mountain+Bike",
		OwnerID:     user2.ID,
		Available:   true,
		CreatedAt:   time.Now(),
	}

	item3 := &Item{
		ID:          generateID(),
		Name:        "Gaming Console",
		Title:       "Gaming Console",
		Description: "Latest gaming console with multiple games included",
		DailyRate:   25.0,
		Price:       25,
		ImageURL:    "https://placehold.co/600x400/556cd6/white?text=Gaming+Console",
		OwnerID:     user1.ID,
		Available:   true,
		CreatedAt:   time.Now(),
	}

	db.Items[item1.ID] = item1
	db.Items[item2.ID] = item2
	db.Items[item3.ID] = item3
}

// Authentication helpers
func generateJWT(userID, email string) (string, error) {
	claims := &Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func validateJWT(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	return claims, nil
}

// CORS helper function
func setCORSHeaders(w http.ResponseWriter) {
	// Allow different origins based on environment
	origin := "https://borrowhubb.live"
	if os.Getenv("AWS_LAMBDA_RUNTIME_API") == "" {
		// Development mode - allow localhost
		origin = "*" // For development, allow all origins
	}
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With, Origin")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
}

// Utility functions
func respondWithJSON(w http.ResponseWriter, status int, payload interface{}) {
	setCORSHeaders(w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func respondWithError(w http.ResponseWriter, status int, message string) {
	respondWithJSON(w, status, map[string]string{"error": message})
}

// Authentication middleware
func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Handle OPTIONS preflight requests
		if r.Method == "OPTIONS" {
			setCORSHeaders(w)
			w.WriteHeader(http.StatusOK)
			return
		}

		// Skip auth for public endpoints
		if ((strings.HasPrefix(r.URL.Path, "/items") || strings.HasPrefix(r.URL.Path, "/api/items")) && r.Method == "GET") ||
		   r.URL.Path == "/login" ||
		   r.URL.Path == "/register" ||
		   r.URL.Path == "/health" {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			respondWithError(w, http.StatusUnauthorized, "Authorization header required")
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		claims, err := validateJWT(tokenString)
		if err != nil {
			respondWithError(w, http.StatusUnauthorized, "Invalid token")
			return
		}

		// Add user info to request context
		r.Header.Set("X-User-ID", claims.UserID)
		r.Header.Set("X-User-Email", claims.Email)
		
		next.ServeHTTP(w, r)
	})
}

// Authentication handlers
func register(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Basic validation
	if user.Email == "" || user.Password == "" {
		respondWithError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	// Check if user already exists
	for _, existingUser := range db.Users {
		if existingUser.Email == user.Email {
			respondWithError(w, http.StatusConflict, "User already exists")
			return
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error processing password")
		return
	}

	// Create new user
	user.ID = generateID()
	user.Password = string(hashedPassword)
	user.CreatedAt = time.Now()
	if user.Username == "" {
		user.Username = strings.Split(user.Email, "@")[0]
	}

	db.Users[user.ID] = &user

	// Generate JWT token
	token, err := generateJWT(user.ID, user.Email)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error generating token")
		return
	}

	// Create a response user without password (don't modify the stored user)
	responseUser := user
	responseUser.Password = ""

	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"token": token,
		"user":  responseUser,
	})
}

func login(w http.ResponseWriter, r *http.Request) {
	var credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	db.mutex.RLock()
	defer db.mutex.RUnlock()

	// Find user by email
	var user *User
	for _, u := range db.Users {
		if u.Email == credentials.Email {
			user = u
			break
		}
	}

	if user == nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password)); err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Generate JWT token
	token, err := generateJWT(user.ID, user.Email)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error generating token")
		return
	}

	// Create a response user without password
	responseUser := *user
	responseUser.Password = ""

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"token": token,
		"user":  responseUser,
	})
}

// Item handlers
func getItems(w http.ResponseWriter, r *http.Request) {
	db.mutex.RLock()
	defer db.mutex.RUnlock()

	items := make([]*Item, 0, len(db.Items))
	for _, item := range db.Items {
		if item.Available {
			items = append(items, item)
		}
	}

	respondWithJSON(w, http.StatusOK, items)
}

func getItemDetails(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID := vars["id"]

	if itemID == "" {
		respondWithError(w, http.StatusBadRequest, "Item ID is required")
		return
	}

	db.mutex.RLock()
	defer db.mutex.RUnlock()

	item, exists := db.Items[itemID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Item not found")
		return
	}

	respondWithJSON(w, http.StatusOK, item)
}

func addItem(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	var item Item
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Basic validation
	if item.Name == "" || item.DailyRate <= 0 {
		respondWithError(w, http.StatusBadRequest, "Name and daily rate are required")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	// Create new item
	item.ID = generateID()
	item.OwnerID = userID
	item.Available = true
	item.CreatedAt = time.Now()
	item.Title = item.Name // Backward compatibility
	item.Price = int(item.DailyRate) // Backward compatibility

	db.Items[item.ID] = &item

	respondWithJSON(w, http.StatusCreated, item)
}

// Booking handlers
func createBooking(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	var booking Booking
	if err := json.NewDecoder(r.Body).Decode(&booking); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Basic validation
	if booking.ItemID == "" {
		respondWithError(w, http.StatusBadRequest, "Item ID is required")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	// Check if item exists and is available
	item, exists := db.Items[booking.ItemID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Item not found")
		return
	}

	if !item.Available {
		respondWithError(w, http.StatusConflict, "Item is not available")
		return
	}

	// Set default dates if not provided
	if booking.StartDate.IsZero() {
		booking.StartDate = time.Now()
	}
	if booking.EndDate.IsZero() {
		booking.EndDate = booking.StartDate.Add(24 * time.Hour)
	}

	// Calculate total price if not provided
	if booking.TotalPrice == 0 {
		days := int(booking.EndDate.Sub(booking.StartDate).Hours() / 24)
		if days < 1 {
			days = 1
		}
		booking.TotalPrice = float64(days) * item.DailyRate
	}

	// Create new booking
	booking.ID = generateID()
	booking.UserID = userID
	booking.Status = "pending"
	booking.CreatedAt = time.Now()
	booking.UpdatedAt = time.Now()

	db.Bookings[booking.ID] = &booking

	respondWithJSON(w, http.StatusCreated, booking)
}

func getUserBookings(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	db.mutex.RLock()
	defer db.mutex.RUnlock()

	userBookings := make([]*Booking, 0)
	for _, booking := range db.Bookings {
		if booking.UserID == userID {
			userBookings = append(userBookings, booking)
		}
	}

	respondWithJSON(w, http.StatusOK, userBookings)
}

func updateBookingStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bookingID := vars["id"]
	userID := r.Header.Get("X-User-ID")

	if bookingID == "" {
		respondWithError(w, http.StatusBadRequest, "Booking ID is required")
		return
	}

	var statusUpdate struct {
		Status string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&statusUpdate); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate status
	validStatuses := []string{"pending", "confirmed", "completed", "cancelled"}
	isValidStatus := false
	for _, status := range validStatuses {
		if statusUpdate.Status == status {
			isValidStatus = true
			break
		}
	}

	if !isValidStatus {
		respondWithError(w, http.StatusBadRequest, "Invalid status")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	booking, exists := db.Bookings[bookingID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Booking not found")
		return
	}

	// Check if user can update this booking (either the booker or the item owner)
	item, itemExists := db.Items[booking.ItemID]
	if !itemExists {
		respondWithError(w, http.StatusNotFound, "Associated item not found")
		return
	}

	if booking.UserID != userID && item.OwnerID != userID {
		respondWithError(w, http.StatusForbidden, "You can only update your own bookings or bookings for your items")
		return
	}

	booking.Status = statusUpdate.Status
	booking.UpdatedAt = time.Now()

	respondWithJSON(w, http.StatusOK, booking)
}

// Profile handlers
func getUserProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	db.mutex.RLock()
	defer db.mutex.RUnlock()

	user, exists := db.Users[userID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "User not found")
		return
	}

	// Create a response user without password
	responseUser := *user
	responseUser.Password = ""

	respondWithJSON(w, http.StatusOK, responseUser)
}

func updateUserProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	var updates User
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	user, exists := db.Users[userID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "User not found")
		return
	}

	// Update only provided fields
	if updates.FirstName != "" {
		user.FirstName = updates.FirstName
	}
	if updates.LastName != "" {
		user.LastName = updates.LastName
	}
	if updates.Phone != "" {
		user.Phone = updates.Phone
	}
	if updates.Address != "" {
		user.Address = updates.Address
	}
	if updates.Username != "" {
		user.Username = updates.Username
	}

	// Create a response user without password
	responseUser := *user
	responseUser.Password = ""

	respondWithJSON(w, http.StatusOK, responseUser)
}

// Lambda handler function
func lambdaHandler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Convert API Gateway request to HTTP request
	req, err := apiGatewayRequestToHTTPRequest(request)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers: map[string]string{
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "https://borrowhubb.live",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-Requested-With",
				"Access-Control-Allow-Credentials": "true",
			},
			Body: `{"error": "Failed to process request"}`,
		}, err
	}

	// Create response recorder
	recorder := httptest.NewRecorder()

	// Handle the request using our existing router
	httpHandler.ServeHTTP(recorder, req)

	// Convert HTTP response to API Gateway response
	response := httpResponseToAPIGatewayResponse(recorder)
	
	return response, nil
}

// Convert API Gateway proxy request to standard HTTP request
func apiGatewayRequestToHTTPRequest(request events.APIGatewayProxyRequest) (*http.Request, error) {
	// Build URL with path and query parameters
	path := request.Path
	if request.PathParameters != nil {
		// Replace path parameters (e.g., {id} -> actual value)
		for key, value := range request.PathParameters {
			path = strings.Replace(path, "{"+key+"}", value, -1)
		}
	}

	// Add query parameters
	queryValues := url.Values{}
	for key, value := range request.QueryStringParameters {
		queryValues.Set(key, value)
	}
	for key, values := range request.MultiValueQueryStringParameters {
		for _, value := range values {
			queryValues.Add(key, value)
		}
	}

	fullURL := "https://example.com" + path
	if len(queryValues) > 0 {
		fullURL += "?" + queryValues.Encode()
	}

	// Create HTTP request
	req, err := http.NewRequest(request.HTTPMethod, fullURL, strings.NewReader(request.Body))
	if err != nil {
		return nil, err
	}

	// Set headers
	for key, value := range request.Headers {
		req.Header.Set(key, value)
	}
	for key, values := range request.MultiValueHeaders {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	// Set request context with API Gateway context
	req = req.WithContext(context.WithValue(req.Context(), "apiGatewayContext", request.RequestContext))

	return req, nil
}

// Convert HTTP response to API Gateway proxy response
func httpResponseToAPIGatewayResponse(recorder *httptest.ResponseRecorder) events.APIGatewayProxyResponse {
	headers := make(map[string]string)
	multiValueHeaders := make(map[string][]string)

	for key, values := range recorder.Header() {
		if len(values) == 1 {
			headers[key] = values[0]
		} else {
			multiValueHeaders[key] = values
		}
	}

	// Ensure CORS headers are always present
	if headers["Access-Control-Allow-Origin"] == "" {
		headers["Access-Control-Allow-Origin"] = "https://borrowhubb.live"
	}
	if headers["Access-Control-Allow-Methods"] == "" {
		headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
	}
	if headers["Access-Control-Allow-Headers"] == "" {
		headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, X-Requested-With"
	}
	if headers["Access-Control-Allow-Credentials"] == "" {
		headers["Access-Control-Allow-Credentials"] = "true"
	}

	return events.APIGatewayProxyResponse{
		StatusCode:        recorder.Code,
		Headers:           headers,
		MultiValueHeaders: multiValueHeaders,
		Body:              recorder.Body.String(),
	}
}

// setupRouter initializes and configures the HTTP router
func setupRouter() {
	router := mux.NewRouter()

	// Enhanced CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"https://borrowhubb.live", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"}, // Production and development origins
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "Accept", "X-Requested-With", "Origin"},
		AllowCredentials: true,
		Debug:           true, // Enable debug for development
	})

	// Authentication routes (no /api prefix to match frontend)
	router.HandleFunc("/register", register).Methods("POST", "OPTIONS")
	router.HandleFunc("/login", login).Methods("POST", "OPTIONS")

	// Item routes (support both /items and /api/items patterns)
	router.HandleFunc("/items", getItems).Methods("GET", "OPTIONS")
	router.HandleFunc("/items/{id}", getItemDetails).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/items", getItems).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/items/{id}", getItemDetails).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/items", addItem).Methods("POST", "OPTIONS")

	// Booking routes (with /api prefix to match frontend)
	router.HandleFunc("/api/bookings", createBooking).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/bookings", getUserBookings).Methods("GET", "OPTIONS")
	router.HandleFunc("/bookings", getUserBookings).Methods("GET", "OPTIONS") // Alternative endpoint
	router.HandleFunc("/api/bookings/{id}", updateBookingStatus).Methods("PUT", "OPTIONS")
	router.HandleFunc("/bookings/{id}", updateBookingStatus).Methods("PUT", "OPTIONS") // Alternative endpoint

	// Profile routes (support both patterns)
	router.HandleFunc("/api/profile", getUserProfile).Methods("GET", "OPTIONS")
	router.HandleFunc("/profile", getUserProfile).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/profile", updateUserProfile).Methods("PUT", "OPTIONS")
	router.HandleFunc("/profile", updateUserProfile).Methods("PUT", "OPTIONS")

	// Health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		respondWithJSON(w, http.StatusOK, map[string]string{"status": "healthy"})
	}).Methods("GET")

	// OPTIONS handler for preflight requests
	router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			setCORSHeaders(w)
			w.WriteHeader(http.StatusOK)
			return
		}
		// Handle 404 for other requests
		setCORSHeaders(w)
		respondWithError(w, http.StatusNotFound, "Endpoint not found")
	}).Methods("OPTIONS", "GET", "POST", "PUT", "DELETE")

	// Wrap router with CORS and authentication middleware
	httpHandler = c.Handler(authMiddleware(router))
}

func main() {
	// Initialize sample data
	initSampleData()

	// Setup router
	setupRouter()

	// Check if running in Lambda environment
	if os.Getenv("AWS_LAMBDA_RUNTIME_API") != "" {
		// Start Lambda handler
		fmt.Println("BorrowHub backend starting as Lambda function")
		fmt.Println("Sample users:")
		fmt.Println("- john@example.com / password123")
		fmt.Println("- jane@example.com / password123")
		
		lambda.Start(lambdaHandler)
	} else {
		// Start HTTP server for local development
		fmt.Println("BorrowHub backend starting as HTTP server on :8080")
		fmt.Println("Sample users:")
		fmt.Println("- john@example.com / password123")
		fmt.Println("- jane@example.com / password123")
		
		log.Fatal(http.ListenAndServe(":8080", httpHandler))
	}
}