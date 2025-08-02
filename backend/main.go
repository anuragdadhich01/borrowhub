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
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"borrowhub/config"
	"borrowhub/database"
	"borrowhub/database/seeds"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
	
	// Database drivers
	_ "github.com/lib/pq"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"
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
	Status      string    `json:"status"`      // "pending", "approved", "rejected"
	Category    string    `json:"category"`
	Location    string    `json:"location"`
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
	Role      string    `json:"role"`      // "user", "admin"
	Status    string    `json:"status"`    // "active", "suspended", "banned"
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
	PaymentID   string    `json:"paymentId,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// Payment model for tracking transactions
type Payment struct {
	ID            string    `json:"id"`
	BookingID     string    `json:"bookingId"`
	Amount        float64   `json:"amount"`
	Currency      string    `json:"currency"`
	Status        string    `json:"status"` // "pending", "success", "failed", "refunded"
	PaymentMethod string    `json:"paymentMethod"` // "razorpay", "card", "upi"
	GatewayID     string    `json:"gatewayId,omitempty"` // Razorpay payment ID
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// Rating model for user ratings
type Rating struct {
	ID         string    `json:"id"`
	ItemID     string    `json:"itemId"`
	UserID     string    `json:"userId"`
	BookingID  string    `json:"bookingId"`
	Rating     int       `json:"rating"` // 1-5 stars
	Review     string    `json:"review"`
	Photos     []string  `json:"photos,omitempty"`
	IsVerified bool      `json:"isVerified"` // Based on completed booking
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// Message model for in-app messaging
type Message struct {
	ID         string    `json:"id"`
	FromUserID string    `json:"fromUserId"`
	ToUserID   string    `json:"toUserId"`
	ItemID     string    `json:"itemId,omitempty"` // Optional: item-specific conversation
	BookingID  string    `json:"bookingId,omitempty"` // Optional: booking-specific conversation
	Content    string    `json:"content"`
	MessageType string   `json:"messageType"` // "text", "image", "file"
	FileURL    string    `json:"fileUrl,omitempty"`
	IsRead     bool      `json:"isRead"`
	CreatedAt  time.Time `json:"createdAt"`
}

// Admin Activity Log for tracking admin actions
type AdminLog struct {
	ID          string    `json:"id"`
	AdminUserID string    `json:"adminUserId"`
	Action      string    `json:"action"`     // "user_suspend", "item_approve", "item_reject", etc.
	TargetType  string    `json:"targetType"` // "user", "item", "booking", "payment"
	TargetID    string    `json:"targetId"`
	Details     string    `json:"details"`
	CreatedAt   time.Time `json:"createdAt"`
}

// Calendar availability response
type AvailabilityCalendar struct {
	Date      string `json:"date"`
	Available bool   `json:"available"`
	Price     float64 `json:"price,omitempty"`
}

// JWT Claims structure
type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// In-memory database
type Database struct {
	Users     map[string]*User     `json:"users"`
	Items     map[string]*Item     `json:"items"`
	Bookings  map[string]*Booking  `json:"bookings"`
	Payments  map[string]*Payment  `json:"payments"`
	Ratings   map[string]*Rating   `json:"ratings"`
	Messages  map[string]*Message  `json:"messages"`
	AdminLogs map[string]*AdminLog `json:"adminLogs"`
	mutex     sync.RWMutex
}

var (
	// Keep existing in-memory database for backward compatibility
	db        = &Database{
		Users:     make(map[string]*User),
		Items:     make(map[string]*Item),
		Bookings:  make(map[string]*Booking),
		Payments:  make(map[string]*Payment),
		Ratings:   make(map[string]*Rating),
		Messages:  make(map[string]*Message),
		AdminLogs: make(map[string]*AdminLog),
	}
	
	// New persistent database
	persistentDB database.Database
	appConfig    *config.AppConfig
	
	jwtSecret   = []byte("your-secret-key") // Will be updated from config
	counter     = 0
	counterMu   sync.Mutex
	httpHandler http.Handler // Global handler for Lambda
)

// Helper function to generate IDs
func generateID() string {
	counterMu.Lock()
	defer counterMu.Unlock()
	counter++
	return strconv.Itoa(counter)
}

// Initialize application configuration and database
func initializeApp() error {
	var err error
	
	// Load configuration
	appConfig, err = config.LoadConfig()
	if err != nil {
		return fmt.Errorf("failed to load configuration: %w", err)
	}
	
	// Update JWT secret from config
	jwtSecret = []byte(appConfig.JWTSecret)
	
	// Initialize database based on configuration
	switch appConfig.Database.Type {
	case "postgres", "mysql", "sqlite":
		persistentDB = database.NewSQLDatabase(&appConfig.Database)
		
		// Connect to database
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		
		if err := persistentDB.Connect(ctx); err != nil {
			log.Printf("Failed to connect to database: %v", err)
			log.Println("Falling back to in-memory database")
			persistentDB = nil
		} else {
			log.Printf("Connected to %s database successfully", appConfig.Database.Type)
			
			// Run migrations
			if err := persistentDB.Migrate(ctx); err != nil {
				log.Printf("Migration failed: %v", err)
			} else {
				log.Println("Database migrations completed")
				
				// Seed initial data in development
				if appConfig.IsDevelopment() {
					if err := seeds.SeedData(ctx, persistentDB); err != nil {
						log.Printf("Seeding failed: %v", err)
					} else {
						log.Println("Database seeded with sample data")
					}
				}
			}
		}
	default:
		log.Println("Using in-memory database")
	}
	
	return nil
}

// Enhanced admin dashboard with database integration
func getEnhancedAdminDashboard(w http.ResponseWriter, r *http.Request) {
	// If we have persistent database, use it for more accurate stats
	if persistentDB != nil {
		ctx := r.Context()
		stats, err := persistentDB.GetDashboardStats(ctx)
		if err != nil {
			log.Printf("Failed to get dashboard stats from database: %v", err)
			// Fall back to in-memory stats
			getAdminDashboard(w, r)
			return
		}
		
		// Add database connection info
		response := map[string]interface{}{
			"stats": stats,
			"database": map[string]interface{}{
				"type":      appConfig.Database.Type,
				"connected": true,
				"host":      appConfig.Database.Host,
				"port":      appConfig.Database.Port,
				"name":      appConfig.Database.Database,
			},
			"server": map[string]interface{}{
				"environment": appConfig.Environment,
				"uptime":      time.Since(time.Now().Add(-time.Hour)).String(), // Placeholder
			},
		}
		
		respondWithJSON(w, http.StatusOK, response)
		return
	}
	
	// Fall back to original implementation
	getAdminDashboard(w, r)
}

// Database management endpoints
func getDatabaseStatus(w http.ResponseWriter, r *http.Request) {
	if persistentDB == nil {
		response := map[string]interface{}{
			"type":      "in-memory",
			"connected": true,
			"message":   "Using in-memory database",
		}
		respondWithJSON(w, http.StatusOK, response)
		return
	}
	
	ctx := r.Context()
	err := persistentDB.Ping(ctx)
	
	response := map[string]interface{}{
		"type":      appConfig.Database.Type,
		"connected": err == nil,
		"host":      appConfig.Database.Host,
		"port":      appConfig.Database.Port,
		"database":  appConfig.Database.Database,
	}
	
	if err != nil {
		response["error"] = err.Error()
	}
	
	respondWithJSON(w, http.StatusOK, response)
}

func getDatabaseMetrics(w http.ResponseWriter, r *http.Request) {
	if persistentDB == nil {
		respondWithError(w, http.StatusNotImplemented, "Database metrics not available for in-memory database")
		return
	}
	
	// Placeholder for database metrics
	// In a real implementation, you'd query database-specific metrics
	metrics := map[string]interface{}{
		"type": appConfig.Database.Type,
		"connection_pool": map[string]interface{}{
			"max_open":     appConfig.Database.MaxOpenConns,
			"max_idle":     appConfig.Database.MaxIdleConns,
			"active":       "unknown", // Would need database-specific queries
			"idle":         "unknown",
		},
		"performance": map[string]interface{}{
			"queries_per_second": "unknown",
			"avg_query_time":     "unknown",
		},
	}
	
	respondWithJSON(w, http.StatusOK, metrics)
}

// System settings management
func getSystemSettings(w http.ResponseWriter, r *http.Request) {
	if persistentDB == nil {
		respondWithError(w, http.StatusNotImplemented, "System settings not available for in-memory database")
		return
	}
	
	ctx := r.Context()
	settings, err := persistentDB.ListSystemSettings(ctx)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch system settings")
		return
	}
	
	respondWithJSON(w, http.StatusOK, settings)
}

func updateSystemSetting(w http.ResponseWriter, r *http.Request) {
	if persistentDB == nil {
		respondWithError(w, http.StatusNotImplemented, "System settings not available for in-memory database")
		return
	}
	
	vars := mux.Vars(r)
	settingKey := vars["key"]
	
	var request struct {
		Value       string `json:"value"`
		Type        string `json:"type"`
		Description string `json:"description"`
		Category    string `json:"category"`
		IsPublic    bool   `json:"isPublic"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	
	setting := &database.SystemSetting{
		ID:          generateID(),
		Key:         settingKey,
		Value:       request.Value,
		Type:        request.Type,
		Description: request.Description,
		Category:    request.Category,
		IsPublic:    request.IsPublic,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	
	ctx := r.Context()
	if err := persistentDB.SetSystemSetting(ctx, setting); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update system setting")
		return
	}
	
	// Log admin action
	adminUserID := r.Header.Get("X-User-ID")
	createAdminLogEntry(ctx, adminUserID, "system_setting_update", "system", settingKey, 
		fmt.Sprintf("Updated setting %s to %s", settingKey, request.Value))
	
	respondWithJSON(w, http.StatusOK, setting)
}

// Helper function to create admin log entries
func createAdminLogEntry(ctx context.Context, adminUserID, action, targetType, targetID, details string) {
	if persistentDB == nil {
		// Fall back to in-memory logging
		createAdminLog(adminUserID, action, targetType, targetID, details)
		return
	}
	
	log := &database.AdminLog{
		ID:          generateID(),
		AdminUserID: adminUserID,
		Action:      action,
		TargetType:  targetType,
		TargetID:    targetID,
		Details:     details,
		CreatedAt:   time.Now(),
	}
	
	if err := persistentDB.CreateAdminLog(ctx, log); err != nil {
		// Fall back to in-memory if persistent fails
		createAdminLog(adminUserID, action, targetType, targetID, details)
	}
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
		Role:      "user",
		Status:    "active",
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
		Role:      "user",
		Status:    "active",
		CreatedAt: time.Now(),
	}

	// Create admin user
	admin := &User{
		ID:        generateID(),
		Username:  "admin",
		Email:     "admin@borrowhub.com",
		Password:  string(hashedPassword),
		FirstName: "Admin",
		LastName:  "User",
		Phone:     "1111111111",
		Address:   "Admin Office",
		Role:      "admin",
		Status:    "active",
		CreatedAt: time.Now(),
	}

	db.Users[user1.ID] = user1
	db.Users[user2.ID] = user2
	db.Users[admin.ID] = admin

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
		Status:      "approved",
		Category:    "Electronics",
		Location:    "Mumbai",
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
		Status:      "approved",
		Category:    "Sports",
		Location:    "Delhi",
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
		Status:      "approved",
		Category:    "Electronics",
		Location:    "Mumbai",
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

// Custom CORS middleware for better control
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		
		// Allow these origins
		allowedOrigins := []string{
			"https://borrowhubb.live",
			"http://localhost:5173",
			"http://127.0.0.1:5173",
			"http://localhost:3000",
		}
		
		// Check if origin is allowed
		originAllowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				originAllowed = true
				break
			}
		}
		
		if originAllowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "86400") // 24 hours
		
		// Handle preflight OPTIONS requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

// Utility functions
func respondWithJSON(w http.ResponseWriter, status int, payload interface{}) {
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
			// Let CORS middleware handle this
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

	// Parse query parameters for filtering
	searchTerm := r.URL.Query().Get("search")
	category := r.URL.Query().Get("category")
	location := r.URL.Query().Get("location")
	sortBy := r.URL.Query().Get("sortBy")
	availability := r.URL.Query().Get("availability")
	minRating := r.URL.Query().Get("minRating")
	maxPrice := r.URL.Query().Get("maxPrice")
	minPrice := r.URL.Query().Get("minPrice")

	items := make([]*Item, 0)
	
	// Filter items
	for _, item := range db.Items {
		// Skip items that are not approved for non-admin users
		if item.Status != "approved" {
			continue
		}

		// Availability filter
		if availability == "available" && !item.Available {
			continue
		}

		// Category filter
		if category != "" && strings.ToLower(item.Category) != strings.ToLower(category) {
			continue
		}

		// Location filter
		if location != "" && !strings.Contains(strings.ToLower(item.Location), strings.ToLower(location)) {
			continue
		}

		// Price range filter
		if minPrice != "" {
			if minPriceFloat, err := strconv.ParseFloat(minPrice, 64); err == nil {
				if item.DailyRate < minPriceFloat {
					continue
				}
			}
		}
		if maxPrice != "" {
			if maxPriceFloat, err := strconv.ParseFloat(maxPrice, 64); err == nil {
				if item.DailyRate > maxPriceFloat {
					continue
				}
			}
		}

		// Search term filter (search in name and description)
		if searchTerm != "" {
			searchLower := strings.ToLower(searchTerm)
			nameLower := strings.ToLower(item.Name)
			descLower := strings.ToLower(item.Description)
			categoryLower := strings.ToLower(item.Category)
			
			if !strings.Contains(nameLower, searchLower) && 
			   !strings.Contains(descLower, searchLower) && 
			   !strings.Contains(categoryLower, searchLower) {
				continue
			}
		}

		// Rating filter (calculate average rating for item)
		if minRating != "" {
			if minRatingFloat, err := strconv.ParseFloat(minRating, 64); err == nil {
				avgRating := calculateItemAverageRating(item.ID)
				if avgRating < minRatingFloat {
					continue
				}
			}
		}

		items = append(items, item)
	}

	// Sort items
	switch sortBy {
	case "price-low":
		sort.Slice(items, func(i, j int) bool {
			return items[i].DailyRate < items[j].DailyRate
		})
	case "price-high":
		sort.Slice(items, func(i, j int) bool {
			return items[i].DailyRate > items[j].DailyRate
		})
	case "rating":
		sort.Slice(items, func(i, j int) bool {
			ratingI := calculateItemAverageRating(items[i].ID)
			ratingJ := calculateItemAverageRating(items[j].ID)
			return ratingI > ratingJ
		})
	case "newest":
		sort.Slice(items, func(i, j int) bool {
			return items[i].CreatedAt.After(items[j].CreatedAt)
		})
	default: // relevance
		// For relevance, we'll sort by a combination of factors
		// For now, just sort by availability then by creation date
		sort.Slice(items, func(i, j int) bool {
			if items[i].Available != items[j].Available {
				return items[i].Available
			}
			return items[i].CreatedAt.After(items[j].CreatedAt)
		})
	}

	respondWithJSON(w, http.StatusOK, items)
}

// Helper function to calculate average rating for an item
func calculateItemAverageRating(itemID string) float64 {
	totalRating := 0
	count := 0
	
	for _, rating := range db.Ratings {
		if rating.ItemID == itemID {
			totalRating += rating.Rating
			count++
		}
	}
	
	if count == 0 {
		return 0.0
	}
	
	return float64(totalRating) / float64(count)
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

// Booking availability helpers
func checkBookingAvailability(itemID string, startDate, endDate time.Time) bool {
	db.mutex.RLock()
	defer db.mutex.RUnlock()
	
	for _, booking := range db.Bookings {
		if booking.ItemID == itemID && booking.Status != "cancelled" {
			// Check for date overlap
			if (startDate.Before(booking.EndDate) && endDate.After(booking.StartDate)) {
				return false
			}
		}
	}
	return true
}

func getItemAvailabilityCalendar(itemID string, month int, year int) []AvailabilityCalendar {
	if month == 0 {
		month = int(time.Now().Month())
	}
	if year == 0 {
		year = time.Now().Year()
	}
	
	// Get the first and last day of the month
	firstDay := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	lastDay := firstDay.AddDate(0, 1, -1)
	
	var calendar []AvailabilityCalendar
	
	db.mutex.RLock()
	defer db.mutex.RUnlock()
	
	item, exists := db.Items[itemID]
	if !exists {
		return calendar
	}
	
	// Generate calendar for each day of the month
	for d := firstDay; d.Before(lastDay.AddDate(0, 0, 1)); d = d.AddDate(0, 0, 1) {
		nextDay := d.AddDate(0, 0, 1)
		available := checkBookingAvailability(itemID, d, nextDay)
		
		calendar = append(calendar, AvailabilityCalendar{
			Date:      d.Format("2006-01-02"),
			Available: available,
			Price:     item.DailyRate,
		})
	}
	
	return calendar
}

// Item CRUD operations
func updateItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID := vars["id"]
	userID := r.Header.Get("X-User-ID")

	if itemID == "" {
		respondWithError(w, http.StatusBadRequest, "Item ID is required")
		return
	}

	var itemUpdates Item
	if err := json.NewDecoder(r.Body).Decode(&itemUpdates); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	item, exists := db.Items[itemID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Item not found")
		return
	}

	// Check if user is the owner
	if item.OwnerID != userID {
		respondWithError(w, http.StatusForbidden, "You can only update your own items")
		return
	}

	// Update only provided fields
	if itemUpdates.Name != "" {
		item.Name = itemUpdates.Name
		item.Title = itemUpdates.Name // Backward compatibility
	}
	if itemUpdates.Description != "" {
		item.Description = itemUpdates.Description
	}
	if itemUpdates.DailyRate > 0 {
		item.DailyRate = itemUpdates.DailyRate
		item.Price = int(itemUpdates.DailyRate) // Backward compatibility
	}
	if itemUpdates.ImageURL != "" {
		item.ImageURL = itemUpdates.ImageURL
	}

	respondWithJSON(w, http.StatusOK, item)
}

func deleteItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID := vars["id"]
	userID := r.Header.Get("X-User-ID")

	if itemID == "" {
		respondWithError(w, http.StatusBadRequest, "Item ID is required")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	item, exists := db.Items[itemID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Item not found")
		return
	}

	// Check if user is the owner
	if item.OwnerID != userID {
		respondWithError(w, http.StatusForbidden, "You can only delete your own items")
		return
	}

	// Check if item has active bookings
	for _, booking := range db.Bookings {
		if booking.ItemID == itemID && (booking.Status == "pending" || booking.Status == "confirmed") {
			respondWithError(w, http.StatusConflict, "Cannot delete item with active bookings")
			return
		}
	}

	delete(db.Items, itemID)
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Item deleted successfully"})
}

func getUserItems(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	db.mutex.RLock()
	defer db.mutex.RUnlock()

	userItems := make([]*Item, 0)
	for _, item := range db.Items {
		if item.OwnerID == userID {
			userItems = append(userItems, item)
		}
	}

	respondWithJSON(w, http.StatusOK, userItems)
}

func getAvailabilityCalendar(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID := vars["id"]

	if itemID == "" {
		respondWithError(w, http.StatusBadRequest, "Item ID is required")
		return
	}

	// Parse query parameters for month and year
	month := 0
	year := 0
	
	if monthStr := r.URL.Query().Get("month"); monthStr != "" {
		if m, err := strconv.Atoi(monthStr); err == nil {
			month = m
		}
	}
	
	if yearStr := r.URL.Query().Get("year"); yearStr != "" {
		if y, err := strconv.Atoi(yearStr); err == nil {
			year = y
		}
	}

	calendar := getItemAvailabilityCalendar(itemID, month, year)
	respondWithJSON(w, http.StatusOK, calendar)
}
// Enhanced Booking handlers
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

	if booking.StartDate.IsZero() || booking.EndDate.IsZero() {
		respondWithError(w, http.StatusBadRequest, "Start date and end date are required")
		return
	}

	if booking.StartDate.After(booking.EndDate) || booking.StartDate.Equal(booking.EndDate) {
		respondWithError(w, http.StatusBadRequest, "End date must be after start date")
		return
	}

	if booking.StartDate.Before(time.Now().Truncate(24 * time.Hour)) {
		respondWithError(w, http.StatusBadRequest, "Start date cannot be in the past")
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

	// Check if dates are available (no conflicting bookings)
	if !checkBookingAvailability(booking.ItemID, booking.StartDate, booking.EndDate) {
		respondWithError(w, http.StatusConflict, "Item is not available for the selected dates")
		return
	}

	// Prevent self-booking
	if item.OwnerID == userID {
		respondWithError(w, http.StatusBadRequest, "You cannot book your own item")
		return
	}

	// Calculate total price
	days := int(booking.EndDate.Sub(booking.StartDate).Hours() / 24)
	if days < 1 {
		days = 1
	}
	booking.TotalPrice = float64(days) * item.DailyRate

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

// Rating and Review handlers
func createRating(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	var rating Rating
	if err := json.NewDecoder(r.Body).Decode(&rating); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Basic validation
	if rating.ItemID == "" || rating.BookingID == "" {
		respondWithError(w, http.StatusBadRequest, "Item ID and Booking ID are required")
		return
	}

	if rating.Rating < 1 || rating.Rating > 5 {
		respondWithError(w, http.StatusBadRequest, "Rating must be between 1 and 5")
		return
	}

	if len(rating.Review) > 1000 {
		respondWithError(w, http.StatusBadRequest, "Review cannot exceed 1000 characters")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	// Check if booking exists and belongs to user
	booking, exists := db.Bookings[rating.BookingID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Booking not found")
		return
	}

	if booking.UserID != userID {
		respondWithError(w, http.StatusForbidden, "You can only rate bookings you made")
		return
	}

	if booking.Status != "completed" {
		respondWithError(w, http.StatusConflict, "You can only rate completed bookings")
		return
	}

	// Check if item exists
	_, itemExists := db.Items[rating.ItemID]
	if !itemExists {
		respondWithError(w, http.StatusNotFound, "Item not found")
		return
	}

	// Check if user already rated this booking
	for _, existingRating := range db.Ratings {
		if existingRating.BookingID == rating.BookingID && existingRating.UserID == userID {
			respondWithError(w, http.StatusConflict, "You have already rated this booking")
			return
		}
	}

	// Create new rating
	rating.ID = generateID()
	rating.UserID = userID
	rating.IsVerified = true // Verified since based on completed booking
	rating.CreatedAt = time.Now()
	rating.UpdatedAt = time.Now()

	db.Ratings[rating.ID] = &rating

	respondWithJSON(w, http.StatusCreated, rating)
}

func getItemRatings(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID := vars["id"]

	if itemID == "" {
		respondWithError(w, http.StatusBadRequest, "Item ID is required")
		return
	}

	db.mutex.RLock()
	defer db.mutex.RUnlock()

	itemRatings := make([]*Rating, 0)
	totalRating := 0
	ratingCount := 0

	for _, rating := range db.Ratings {
		if rating.ItemID == itemID {
			itemRatings = append(itemRatings, rating)
			totalRating += rating.Rating
			ratingCount++
		}
	}

	averageRating := 0.0
	if ratingCount > 0 {
		averageRating = float64(totalRating) / float64(ratingCount)
	}

	response := map[string]interface{}{
		"ratings":       itemRatings,
		"averageRating": averageRating,
		"totalReviews":  ratingCount,
	}

	respondWithJSON(w, http.StatusOK, response)
}

func updateRating(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	ratingID := vars["id"]
	userID := r.Header.Get("X-User-ID")

	if ratingID == "" {
		respondWithError(w, http.StatusBadRequest, "Rating ID is required")
		return
	}

	var updates Rating
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	rating, exists := db.Ratings[ratingID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Rating not found")
		return
	}

	if rating.UserID != userID {
		respondWithError(w, http.StatusForbidden, "You can only update your own ratings")
		return
	}

	// Update fields
	if updates.Rating >= 1 && updates.Rating <= 5 {
		rating.Rating = updates.Rating
	}
	if updates.Review != "" && len(updates.Review) <= 1000 {
		rating.Review = updates.Review
	}
	if updates.Photos != nil {
		rating.Photos = updates.Photos
	}
	rating.UpdatedAt = time.Now()

	respondWithJSON(w, http.StatusOK, rating)
}

func deleteRating(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	ratingID := vars["id"]
	userID := r.Header.Get("X-User-ID")

	if ratingID == "" {
		respondWithError(w, http.StatusBadRequest, "Rating ID is required")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	rating, exists := db.Ratings[ratingID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Rating not found")
		return
	}

	if rating.UserID != userID {
		respondWithError(w, http.StatusForbidden, "You can only delete your own ratings")
		return
	}

	delete(db.Ratings, ratingID)
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Rating deleted successfully"})
}

// Payment handlers for Razorpay integration
func createPaymentOrder(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	var request struct {
		BookingID string `json:"bookingId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	booking, exists := db.Bookings[request.BookingID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Booking not found")
		return
	}

	if booking.UserID != userID {
		respondWithError(w, http.StatusForbidden, "You can only pay for your own bookings")
		return
	}

	if booking.Status != "pending" {
		respondWithError(w, http.StatusConflict, "Booking is not in pending status")
		return
	}

	// Create payment record
	payment := &Payment{
		ID:            generateID(),
		BookingID:     booking.ID,
		Amount:        booking.TotalPrice,
		Currency:      "INR",
		Status:        "pending",
		PaymentMethod: "razorpay",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	// In a real implementation, you would create Razorpay order here
	// For now, we'll simulate it
	payment.GatewayID = "order_" + generateID()

	db.Payments[payment.ID] = payment
	booking.PaymentID = payment.ID

	// Return payment order details for frontend
	response := map[string]interface{}{
		"paymentId":    payment.ID,
		"orderId":      payment.GatewayID,
		"amount":       payment.Amount * 100, // Razorpay expects amount in paise
		"currency":     payment.Currency,
		"key":          "rzp_test_key", // Replace with actual Razorpay key
		"name":         "BorrowHub",
		"description":  "Booking payment for item",
		"bookingId":    booking.ID,
	}

	respondWithJSON(w, http.StatusCreated, response)
}

func verifyPayment(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	var request struct {
		PaymentID     string `json:"paymentId"`
		RazorpayPaymentID string `json:"razorpayPaymentId"`
		RazorpayOrderID   string `json:"razorpayOrderId"`
		RazorpaySignature string `json:"razorpaySignature"`
		Status        string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	payment, exists := db.Payments[request.PaymentID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Payment not found")
		return
	}

	booking, exists := db.Bookings[payment.BookingID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Booking not found")
		return
	}

	if booking.UserID != userID {
		respondWithError(w, http.StatusForbidden, "You can only verify your own payments")
		return
	}

	// In a real implementation, you would verify the signature with Razorpay
	// For now, we'll simulate successful payment
	if request.Status == "success" {
		payment.Status = "success"
		payment.GatewayID = request.RazorpayPaymentID
		payment.UpdatedAt = time.Now()

		booking.Status = "confirmed"
		booking.UpdatedAt = time.Now()

		respondWithJSON(w, http.StatusOK, map[string]interface{}{
			"status":  "success",
			"booking": booking,
			"payment": payment,
		})
	} else {
		payment.Status = "failed"
		payment.UpdatedAt = time.Now()

		respondWithJSON(w, http.StatusOK, map[string]interface{}{
			"status": "failed",
			"message": "Payment verification failed",
		})
	}
}

func getPaymentHistory(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	db.mutex.RLock()
	defer db.mutex.RUnlock()

	userPayments := make([]*Payment, 0)
	for _, payment := range db.Payments {
		if booking, exists := db.Bookings[payment.BookingID]; exists && booking.UserID == userID {
			userPayments = append(userPayments, payment)
		}
	}

	respondWithJSON(w, http.StatusOK, userPayments)
}
// Messaging handlers
func sendMessage(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	var message Message
	if err := json.NewDecoder(r.Body).Decode(&message); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Basic validation
	if message.ToUserID == "" || message.Content == "" {
		respondWithError(w, http.StatusBadRequest, "Recipient and content are required")
		return
	}

	if message.ToUserID == userID {
		respondWithError(w, http.StatusBadRequest, "You cannot send a message to yourself")
		return
	}

	if len(message.Content) > 2000 {
		respondWithError(w, http.StatusBadRequest, "Message cannot exceed 2000 characters")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	// Check if recipient exists
	_, recipientExists := db.Users[message.ToUserID]
	if !recipientExists {
		respondWithError(w, http.StatusNotFound, "Recipient not found")
		return
	}

	// Create new message
	message.ID = generateID()
	message.FromUserID = userID
	message.IsRead = false
	message.MessageType = "text"
	if message.MessageType == "" {
		message.MessageType = "text"
	}
	message.CreatedAt = time.Now()

	db.Messages[message.ID] = &message

	respondWithJSON(w, http.StatusCreated, message)
}

func getConversation(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	vars := mux.Vars(r)
	otherUserID := vars["userId"]

	if otherUserID == "" {
		respondWithError(w, http.StatusBadRequest, "Other user ID is required")
		return
	}

	db.mutex.RLock()
	defer db.mutex.RUnlock()

	conversation := make([]*Message, 0)
	for _, message := range db.Messages {
		if (message.FromUserID == userID && message.ToUserID == otherUserID) ||
		   (message.FromUserID == otherUserID && message.ToUserID == userID) {
			conversation = append(conversation, message)
		}
	}

	// Sort by creation time (you might want to implement a proper sorting mechanism)
	respondWithJSON(w, http.StatusOK, conversation)
}

func markMessageAsRead(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	vars := mux.Vars(r)
	messageID := vars["id"]

	if messageID == "" {
		respondWithError(w, http.StatusBadRequest, "Message ID is required")
		return
	}

	db.mutex.Lock()
	defer db.mutex.Unlock()

	message, exists := db.Messages[messageID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Message not found")
		return
	}

	if message.ToUserID != userID {
		respondWithError(w, http.StatusForbidden, "You can only mark your own messages as read")
		return
	}

	message.IsRead = true

	respondWithJSON(w, http.StatusOK, message)
}

func getUserConversations(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	db.mutex.RLock()
	defer db.mutex.RUnlock()

	// Get unique conversation partners
	conversationPartners := make(map[string]*Message) // Latest message with each partner
	
	for _, message := range db.Messages {
		var partnerID string
		if message.FromUserID == userID {
			partnerID = message.ToUserID
		} else if message.ToUserID == userID {
			partnerID = message.FromUserID
		} else {
			continue
		}

		// Keep only the latest message with each partner
		if existing, exists := conversationPartners[partnerID]; !exists || message.CreatedAt.After(existing.CreatedAt) {
			conversationPartners[partnerID] = message
		}
	}

	// Convert to slice with user details
	conversations := make([]map[string]interface{}, 0)
	for partnerID, lastMessage := range conversationPartners {
		if partner, exists := db.Users[partnerID]; exists {
			partnerInfo := *partner
			partnerInfo.Password = "" // Remove password
			
			conversations = append(conversations, map[string]interface{}{
				"partner":     partnerInfo,
				"lastMessage": lastMessage,
			})
		}
	}

	respondWithJSON(w, http.StatusOK, conversations)
}

// Admin middleware to check if user is admin
func adminMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := r.Header.Get("X-User-ID")
		if userID == "" {
			respondWithError(w, http.StatusUnauthorized, "User authentication required")
			return
		}

		db.mutex.RLock()
		user, exists := db.Users[userID]
		db.mutex.RUnlock()

		if !exists {
			respondWithError(w, http.StatusUnauthorized, "User not found")
			return
		}

		if user.Role != "admin" {
			respondWithError(w, http.StatusForbidden, "Admin access required")
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Helper function to create admin log
func createAdminLog(adminUserID, action, targetType, targetID, details string) {
	log := &AdminLog{
		ID:          generateID(),
		AdminUserID: adminUserID,
		Action:      action,
		TargetType:  targetType,
		TargetID:    targetID,
		Details:     details,
		CreatedAt:   time.Now(),
	}
	db.AdminLogs[log.ID] = log
}

// Admin Dashboard - Get statistics
func getAdminDashboard(w http.ResponseWriter, r *http.Request) {
	db.mutex.RLock()
	defer db.mutex.RUnlock()

	totalUsers := len(db.Users)
	totalItems := len(db.Items)
	totalBookings := len(db.Bookings)
	totalRevenue := 0.0

	// Calculate statistics
	activeUsers := 0
	pendingItems := 0
	activeBookings := 0

	for _, user := range db.Users {
		if user.Status == "active" {
			activeUsers++
		}
	}

	for _, item := range db.Items {
		if item.Status == "pending" {
			pendingItems++
		}
	}

	for _, booking := range db.Bookings {
		if booking.Status == "confirmed" || booking.Status == "completed" {
			activeBookings++
			if booking.Status == "completed" {
				totalRevenue += booking.TotalPrice
			}
		}
	}

	stats := map[string]interface{}{
		"totalUsers":     totalUsers,
		"activeUsers":    activeUsers,
		"totalItems":     totalItems,
		"pendingItems":   pendingItems,
		"totalBookings":  totalBookings,
		"activeBookings": activeBookings,
		"totalRevenue":   totalRevenue,
	}

	respondWithJSON(w, http.StatusOK, stats)
}

// Admin User Management
func getAdminUsers(w http.ResponseWriter, r *http.Request) {
	db.mutex.RLock()
	defer db.mutex.RUnlock()

	users := make([]*User, 0, len(db.Users))
	for _, user := range db.Users {
		responseUser := *user
		responseUser.Password = "" // Remove password
		users = append(users, &responseUser)
	}

	respondWithJSON(w, http.StatusOK, users)
}

func updateUserStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]
	adminUserID := r.Header.Get("X-User-ID")

	if userID == "" {
		respondWithError(w, http.StatusBadRequest, "User ID is required")
		return
	}

	var request struct {
		Status string `json:"status"`
		Reason string `json:"reason,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	validStatuses := []string{"active", "suspended", "banned"}
	isValidStatus := false
	for _, status := range validStatuses {
		if request.Status == status {
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

	user, exists := db.Users[userID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "User not found")
		return
	}

	oldStatus := user.Status
	user.Status = request.Status

	// Create admin log
	details := fmt.Sprintf("Status changed from %s to %s", oldStatus, request.Status)
	if request.Reason != "" {
		details += fmt.Sprintf(" - Reason: %s", request.Reason)
	}
	createAdminLog(adminUserID, "user_status_update", "user", userID, details)

	responseUser := *user
	responseUser.Password = ""

	respondWithJSON(w, http.StatusOK, responseUser)
}

// Admin Item Management
func getAdminItems(w http.ResponseWriter, r *http.Request) {
	db.mutex.RLock()
	defer db.mutex.RUnlock()

	// Parse query parameters
	status := r.URL.Query().Get("status")

	items := make([]*Item, 0)
	for _, item := range db.Items {
		if status == "" || item.Status == status {
			items = append(items, item)
		}
	}

	respondWithJSON(w, http.StatusOK, items)
}

func updateItemStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID := vars["id"]
	adminUserID := r.Header.Get("X-User-ID")

	if itemID == "" {
		respondWithError(w, http.StatusBadRequest, "Item ID is required")
		return
	}

	var request struct {
		Status string `json:"status"`
		Reason string `json:"reason,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	validStatuses := []string{"pending", "approved", "rejected"}
	isValidStatus := false
	for _, status := range validStatuses {
		if request.Status == status {
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

	item, exists := db.Items[itemID]
	if !exists {
		respondWithError(w, http.StatusNotFound, "Item not found")
		return
	}

	oldStatus := item.Status
	item.Status = request.Status

	// If rejected, make item unavailable
	if request.Status == "rejected" {
		item.Available = false
	}

	// Create admin log
	details := fmt.Sprintf("Status changed from %s to %s", oldStatus, request.Status)
	if request.Reason != "" {
		details += fmt.Sprintf(" - Reason: %s", request.Reason)
	}
	createAdminLog(adminUserID, "item_status_update", "item", itemID, details)

	respondWithJSON(w, http.StatusOK, item)
}

// Admin Booking Management
func getAdminBookings(w http.ResponseWriter, r *http.Request) {
	db.mutex.RLock()
	defer db.mutex.RUnlock()

	// Parse query parameters
	status := r.URL.Query().Get("status")

	bookings := make([]*Booking, 0)
	for _, booking := range db.Bookings {
		if status == "" || booking.Status == status {
			bookings = append(bookings, booking)
		}
	}

	respondWithJSON(w, http.StatusOK, bookings)
}

// Admin Analytics
func getAdminAnalytics(w http.ResponseWriter, r *http.Request) {
	db.mutex.RLock()
	defer db.mutex.RUnlock()

	// Revenue analytics
	revenueByMonth := make(map[string]float64)
	bookingsByStatus := make(map[string]int)
	usersByMonth := make(map[string]int)

	for _, booking := range db.Bookings {
		month := booking.CreatedAt.Format("2006-01")
		if booking.Status == "completed" {
			revenueByMonth[month] += booking.TotalPrice
		}
		bookingsByStatus[booking.Status]++
	}

	for _, user := range db.Users {
		month := user.CreatedAt.Format("2006-01")
		usersByMonth[month]++
	}

	analytics := map[string]interface{}{
		"revenueByMonth":   revenueByMonth,
		"bookingsByStatus": bookingsByStatus,
		"usersByMonth":     usersByMonth,
	}

	respondWithJSON(w, http.StatusOK, analytics)
}

// Admin Logs
func getAdminLogs(w http.ResponseWriter, r *http.Request) {
	db.mutex.RLock()
	defer db.mutex.RUnlock()

	logs := make([]*AdminLog, 0, len(db.AdminLogs))
	for _, log := range db.AdminLogs {
		logs = append(logs, log)
	}

	respondWithJSON(w, http.StatusOK, logs)
}

// Image upload handler (basic implementation)
func uploadImage(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "User authentication required")
		return
	}

	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Failed to parse form data")
		return
	}

	file, handler, err := r.FormFile("image")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Failed to get image file")
		return
	}
	defer file.Close()

	// Basic file validation
	if handler.Size > 10<<20 { // 10MB
		respondWithError(w, http.StatusBadRequest, "File size too large (max 10MB)")
		return
	}

	// Check file type
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/gif":  true,
	}

	contentType := handler.Header.Get("Content-Type")
	if !allowedTypes[contentType] {
		respondWithError(w, http.StatusBadRequest, "Invalid file type. Only JPEG, PNG, and GIF allowed")
		return
	}

	// In a real implementation, you would:
	// 1. Save the file to cloud storage (AWS S3, Google Cloud Storage, etc.)
	// 2. Generate a proper URL
	// 3. Optimize/resize the image
	
	// For now, we'll simulate a successful upload
	imageID := generateID()
	imageURL := fmt.Sprintf("https://placehold.co/600x400/556cd6/white?text=Image+%s", imageID)

	response := map[string]interface{}{
		"imageId":  imageID,
		"imageUrl": imageURL,
		"message":  "Image uploaded successfully",
	}

	respondWithJSON(w, http.StatusOK, response)
}

// Enhanced profile handlers
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

	// Add user statistics
	userItems := 0
	userBookings := 0
	totalEarnings := 0.0

	for _, item := range db.Items {
		if item.OwnerID == userID {
			userItems++
		}
	}

	for _, booking := range db.Bookings {
		if booking.UserID == userID {
			userBookings++
		}
		// Calculate earnings if user is item owner
		if item, exists := db.Items[booking.ItemID]; exists && item.OwnerID == userID && booking.Status == "completed" {
			totalEarnings += booking.TotalPrice
		}
	}

	response := map[string]interface{}{
		"user": responseUser,
		"stats": map[string]interface{}{
			"itemsListed":    userItems,
			"bookingsMade":   userBookings,
			"totalEarnings":  totalEarnings,
		},
	}

	respondWithJSON(w, http.StatusOK, response)
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

	// Authentication routes (no /api prefix to match frontend)
	router.HandleFunc("/register", register).Methods("POST", "OPTIONS")
	router.HandleFunc("/login", login).Methods("POST", "OPTIONS")

	// Item routes (support both /items and /api/items patterns)
	router.HandleFunc("/items", getItems).Methods("GET", "OPTIONS")
	router.HandleFunc("/items/{id}", getItemDetails).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/items", getItems).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/items/{id}", getItemDetails).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/items", addItem).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/items/{id}", updateItem).Methods("PUT", "OPTIONS")
	router.HandleFunc("/api/items/{id}", deleteItem).Methods("DELETE", "OPTIONS")

	// User's own items
	router.HandleFunc("/api/my-items", getUserItems).Methods("GET", "OPTIONS")

	// Availability calendar
	router.HandleFunc("/api/items/{id}/availability", getAvailabilityCalendar).Methods("GET", "OPTIONS")

	// Booking routes (with /api prefix to match frontend)
	router.HandleFunc("/api/bookings", createBooking).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/bookings", getUserBookings).Methods("GET", "OPTIONS")
	router.HandleFunc("/bookings", getUserBookings).Methods("GET", "OPTIONS") // Alternative endpoint
	router.HandleFunc("/api/bookings/{id}", updateBookingStatus).Methods("PUT", "OPTIONS")
	router.HandleFunc("/bookings/{id}", updateBookingStatus).Methods("PUT", "OPTIONS") // Alternative endpoint

	// Payment routes for Razorpay
	router.HandleFunc("/api/payments/create-order", createPaymentOrder).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/payments/verify", verifyPayment).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/payments/history", getPaymentHistory).Methods("GET", "OPTIONS")

	// Rating and Review routes
	router.HandleFunc("/api/ratings", createRating).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/items/{id}/ratings", getItemRatings).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/ratings/{id}", updateRating).Methods("PUT", "OPTIONS")
	router.HandleFunc("/api/ratings/{id}", deleteRating).Methods("DELETE", "OPTIONS")

	// Messaging routes
	router.HandleFunc("/api/messages", sendMessage).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/messages/conversations", getUserConversations).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/messages/conversation/{userId}", getConversation).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/messages/{id}/read", markMessageAsRead).Methods("PUT", "OPTIONS")

	// Admin routes (protected by admin middleware)
	adminRouter := router.PathPrefix("/api/admin").Subrouter()
	adminRouter.Use(adminMiddleware)
	
	// Enhanced dashboard with database integration
	adminRouter.HandleFunc("/dashboard", getEnhancedAdminDashboard).Methods("GET", "OPTIONS")
	adminRouter.HandleFunc("/users", getAdminUsers).Methods("GET", "OPTIONS")
	adminRouter.HandleFunc("/users/{id}/status", updateUserStatus).Methods("PUT", "OPTIONS")
	adminRouter.HandleFunc("/items", getAdminItems).Methods("GET", "OPTIONS")
	adminRouter.HandleFunc("/items/{id}/status", updateItemStatus).Methods("PUT", "OPTIONS")
	adminRouter.HandleFunc("/bookings", getAdminBookings).Methods("GET", "OPTIONS")
	adminRouter.HandleFunc("/analytics", getAdminAnalytics).Methods("GET", "OPTIONS")
	adminRouter.HandleFunc("/logs", getAdminLogs).Methods("GET", "OPTIONS")
	
	// Database management endpoints
	adminRouter.HandleFunc("/database/status", getDatabaseStatus).Methods("GET", "OPTIONS")
	adminRouter.HandleFunc("/database/metrics", getDatabaseMetrics).Methods("GET", "OPTIONS")
	
	// System settings management
	adminRouter.HandleFunc("/settings", getSystemSettings).Methods("GET", "OPTIONS")
	adminRouter.HandleFunc("/settings/{key}", updateSystemSetting).Methods("PUT", "OPTIONS")

	// Image upload
	router.HandleFunc("/api/upload/image", uploadImage).Methods("POST", "OPTIONS")

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
			// This will be handled by corsMiddleware
			w.WriteHeader(http.StatusOK)
			return
		}
		// Handle 404 for other requests
		respondWithError(w, http.StatusNotFound, "Endpoint not found")
	}).Methods("OPTIONS", "GET", "POST", "PUT", "DELETE")

	// Wrap router with custom CORS and authentication middleware
	httpHandler = corsMiddleware(authMiddleware(router))
}

func main() {
	// Initialize application configuration and database
	if err := initializeApp(); err != nil {
		log.Fatalf("Failed to initialize application: %v", err)
	}
	
	// Initialize sample data (fallback for in-memory database)
	if persistentDB == nil {
		initSampleData()
	}

	// Setup router
	setupRouter()

	// Check if running in Lambda environment
	if os.Getenv("AWS_LAMBDA_RUNTIME_API") != "" {
		// Start Lambda handler
		fmt.Println("BorrowHub backend starting as Lambda function")
		fmt.Printf("Database: %s\n", appConfig.Database.Type)
		fmt.Println("Sample users:")
		fmt.Println("- john@example.com / password123")
		fmt.Println("- jane@example.com / password123")
		fmt.Println("- admin@borrowhub.com / password123 (Admin)")
		
		lambda.Start(lambdaHandler)
	} else {
		// Start HTTP server for local development
		fmt.Printf("BorrowHub backend starting as HTTP server on :%d\n", appConfig.Port)
		fmt.Printf("Environment: %s\n", appConfig.Environment)
		fmt.Printf("Database: %s\n", appConfig.Database.Type)
		fmt.Println("Sample users:")
		fmt.Println("- john@example.com / password123")
		fmt.Println("- jane@example.com / password123")
		fmt.Println("- admin@borrowhub.com / password123 (Admin)")
		
		if persistentDB != nil {
			defer persistentDB.Close()
		}
		
		log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", appConfig.Port), httpHandler))
	}
}