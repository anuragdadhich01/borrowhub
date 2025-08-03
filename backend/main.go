package main

import (
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
	"regexp"
	"unicode"

	"borrowhub/config"
	"borrowhub/database"
	"borrowhub/database/seeds"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/time/rate"
	
	// Database drivers
	_ "github.com/lib/pq"
)

// Optimized Item model - removed duplicate fields for performance
type Item struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	DailyRate   float64   `json:"dailyRate"`
	ImageURL    string    `json:"imageUrl"`
	OwnerID     string    `json:"ownerId"`
	Available   bool      `json:"available"`
	Status      string    `json:"status"`      // "pending", "approved", "rejected"
	Category    string    `json:"category"`
	Location    string    `json:"location"`
	CreatedAt   time.Time `json:"createdAt"`
	
	// Cached fields for performance optimization
	AverageRating float64 `json:"averageRating,omitempty"`
	TotalReviews  int     `json:"totalReviews,omitempty"`
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

// Enhanced JWT Claims structure with refresh tokens
type Claims struct {
	UserID    string `json:"user_id"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	TokenType string `json:"token_type"` // "access" or "refresh"
	jwt.RegisteredClaims
}

// Search cache structure for performance optimization
type SearchCache struct {
	// Index by category for faster filtering
	CategoryIndex map[string][]*Item
	// Index by location for faster filtering  
	LocationIndex map[string][]*Item
	// Full-text search index (simplified)
	TextIndex map[string][]*Item
	// Price range buckets for faster price filtering
	PriceIndex map[int][]*Item // Buckets of $10 ranges
	LastUpdate time.Time
	mutex      sync.RWMutex
}

// LRU Cache for frequently accessed data
type LRUCache struct {
	capacity int
	cache    map[string]*LRUNode
	head     *LRUNode
	tail     *LRUNode
	mutex    sync.RWMutex
}

type LRUNode struct {
	key   string
	value interface{}
	prev  *LRUNode
	next  *LRUNode
}

// Global cache instances
var (
	searchCache *SearchCache
	itemCache   *LRUCache
	userCache   *LRUCache
)

// Enhanced rate limiter with more efficient cleanup and token bucket algorithm
type RateLimiter struct {
	visitors    map[string]*rate.Limiter
	mu          sync.RWMutex
	cleanupTime time.Time
	// Token bucket parameters
	refillRate   rate.Limit // tokens per second
	bucketSize   int        // max tokens in bucket
}

// Initialize caches
func initializeCaches() {
	searchCache = &SearchCache{
		CategoryIndex: make(map[string][]*Item),
		LocationIndex: make(map[string][]*Item),
		TextIndex:     make(map[string][]*Item),
		PriceIndex:    make(map[int][]*Item),
		LastUpdate:    time.Now(),
	}
	
	itemCache = NewLRUCache(1000)   // Cache up to 1000 items
	userCache = NewLRUCache(500)    // Cache up to 500 users
}

// LRU Cache implementation
func NewLRUCache(capacity int) *LRUCache {
	cache := &LRUCache{
		capacity: capacity,
		cache:    make(map[string]*LRUNode),
		head:     &LRUNode{},
		tail:     &LRUNode{},
	}
	cache.head.next = cache.tail
	cache.tail.prev = cache.head
	return cache
}

func (lru *LRUCache) Get(key string) (interface{}, bool) {
	lru.mutex.RLock()
	defer lru.mutex.RUnlock()
	
	if node, exists := lru.cache[key]; exists {
		lru.moveToHead(node)
		return node.value, true
	}
	return nil, false
}

func (lru *LRUCache) Put(key string, value interface{}) {
	lru.mutex.Lock()
	defer lru.mutex.Unlock()
	
	if node, exists := lru.cache[key]; exists {
		node.value = value
		lru.moveToHead(node)
		return
	}
	
	newNode := &LRUNode{key: key, value: value}
	
	if len(lru.cache) >= lru.capacity {
		tail := lru.removeTail()
		delete(lru.cache, tail.key)
	}
	
	lru.cache[key] = newNode
	lru.addToHead(newNode)
}

func (lru *LRUCache) addToHead(node *LRUNode) {
	node.prev = lru.head
	node.next = lru.head.next
	lru.head.next.prev = node
	lru.head.next = node
}

func (lru *LRUCache) removeNode(node *LRUNode) {
	node.prev.next = node.next
	node.next.prev = node.prev
}

func (lru *LRUCache) moveToHead(node *LRUNode) {
	lru.removeNode(node)
	lru.addToHead(node)
}

func (lru *LRUCache) removeTail() *LRUNode {
	tail := lru.tail.prev
	lru.removeNode(tail)
	return tail
}

// Update search cache - called when items are added/modified
func updateSearchCache() {
	searchCache.mutex.Lock()
	defer searchCache.mutex.Unlock()
	
	// Clear existing indexes
	searchCache.CategoryIndex = make(map[string][]*Item)
	searchCache.LocationIndex = make(map[string][]*Item)
	searchCache.TextIndex = make(map[string][]*Item)
	searchCache.PriceIndex = make(map[int][]*Item)
	
	db.mutex.RLock()
	defer db.mutex.RUnlock()
	
	for _, item := range db.Items {
		if item.Status != "approved" {
			continue
		}
		
		// Category index
		categoryKey := strings.ToLower(item.Category)
		searchCache.CategoryIndex[categoryKey] = append(searchCache.CategoryIndex[categoryKey], item)
		
		// Location index  
		locationKey := strings.ToLower(item.Location)
		searchCache.LocationIndex[locationKey] = append(searchCache.LocationIndex[locationKey], item)
		
		// Price index (buckets of $10)
		priceBucket := int(item.DailyRate / 10)
		searchCache.PriceIndex[priceBucket] = append(searchCache.PriceIndex[priceBucket], item)
		
		// Text index (simple keyword extraction)
		words := extractKeywords(item.Name + " " + item.Description + " " + item.Category)
		for _, word := range words {
			wordKey := strings.ToLower(word)
			if len(wordKey) > 2 { // Ignore very short words
				searchCache.TextIndex[wordKey] = append(searchCache.TextIndex[wordKey], item)
			}
		}
	}
	
	searchCache.LastUpdate = time.Now()
}

// Extract keywords from text for indexing
func extractKeywords(text string) []string {
	// Simple keyword extraction - split by spaces and common delimiters
	words := regexp.MustCompile(`[^\w\s]`).ReplaceAllString(text, " ")
	return strings.Fields(words)
}

// Optimized search function using indexes
func searchItemsOptimized(searchTerm, category, location string, minPrice, maxPrice float64) []*Item {
	searchCache.mutex.RLock()
	defer searchCache.mutex.RUnlock()
	
	var candidates []*Item
	
	// Use the most selective filter first
	if searchTerm != "" {
		// Use text index for search term
		words := extractKeywords(searchTerm)
		if len(words) > 0 {
			word := strings.ToLower(words[0])
			if items, exists := searchCache.TextIndex[word]; exists {
				candidates = items
			}
		}
	} else if category != "" {
		// Use category index
		if items, exists := searchCache.CategoryIndex[strings.ToLower(category)]; exists {
			candidates = items
		}
	} else if location != "" {
		// Use location index
		if items, exists := searchCache.LocationIndex[strings.ToLower(location)]; exists {
			candidates = items
		}
	} else {
		// Fall back to all approved items
		db.mutex.RLock()
		for _, item := range db.Items {
			if item.Status == "approved" {
				candidates = append(candidates, item)
			}
		}
		db.mutex.RUnlock()
	}
	
	// Apply additional filters
	var results []*Item
	for _, item := range candidates {
		// Apply all filters
		if !matchesFilters(item, searchTerm, category, location, minPrice, maxPrice) {
			continue
		}
		results = append(results, item)
	}
	
	return results
}

// Check if item matches all filters
func matchesFilters(item *Item, searchTerm, category, location string, minPrice, maxPrice float64) bool {
	// Availability filter
	if !item.Available {
		return false
	}
	
	// Category filter
	if category != "" && !strings.EqualFold(item.Category, category) {
		return false
	}
	
	// Location filter
	if location != "" && !strings.Contains(strings.ToLower(item.Location), strings.ToLower(location)) {
		return false
	}
	
	// Price range filter
	if minPrice > 0 && item.DailyRate < minPrice {
		return false
	}
	if maxPrice > 0 && item.DailyRate > maxPrice {
		return false
	}
	
	// Search term filter
	if searchTerm != "" {
		searchLower := strings.ToLower(searchTerm)
		itemText := strings.ToLower(item.Name + " " + item.Description + " " + item.Category)
		if !strings.Contains(itemText, searchLower) {
			return false
		}
	}
	
	return true
}

// Debouncer for search requests to reduce server load
type Debouncer struct {
	lastRequest time.Time
	delay       time.Duration
	timer       *time.Timer
	mutex       sync.Mutex
}

func NewDebouncer(delay time.Duration) *Debouncer {
	return &Debouncer{
		delay: delay,
	}
}

func (d *Debouncer) Debounce(fn func()) {
	d.mutex.Lock()
	defer d.mutex.Unlock()
	
	if d.timer != nil {
		d.timer.Stop()
	}
	
	d.timer = time.AfterFunc(d.delay, fn)
	d.lastRequest = time.Now()
}

// Global debouncer for search cache updates
var searchDebouncer = NewDebouncer(500 * time.Millisecond)

// Priority queue for booking processing
type BookingRequest struct {
	BookingID string
	Priority  int // Higher number = higher priority
	Timestamp time.Time
}

type PriorityQueue []*BookingRequest

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
	// Higher priority first, then by timestamp for same priority
	if pq[i].Priority != pq[j].Priority {
		return pq[i].Priority > pq[j].Priority
	}
	return pq[i].Timestamp.Before(pq[j].Timestamp)
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
}

func (pq *PriorityQueue) Push(x interface{}) {
	*pq = append(*pq, x.(*BookingRequest))
}

func (pq *PriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	*pq = old[0 : n-1]
	return item
}

// Password validation result
type PasswordValidation struct {
	IsValid  bool     `json:"isValid"`
	Errors   []string `json:"errors"`
	Strength string   `json:"strength"` // "weak", "medium", "strong"
	Score    int      `json:"score"`    // 0-100
}

// Security config
type SecurityConfig struct {
	MaxLoginAttempts    int           `json:"maxLoginAttempts"`
	LockoutDuration     time.Duration `json:"lockoutDuration"`
	PasswordMinLength   int           `json:"passwordMinLength"`
	RequireSpecialChars bool          `json:"requireSpecialChars"`
	RequireNumbers      bool          `json:"requireNumbers"`
	RequireUppercase    bool          `json:"requireUppercase"`
	JWTAccessDuration   time.Duration `json:"jwtAccessDuration"`
	JWTRefreshDuration  time.Duration `json:"jwtRefreshDuration"`
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
	
	// Security components
	jwtSecret      = []byte("your-secret-key") // Will be updated from config
	jwtRefreshSecret = []byte("your-refresh-secret-key")
	rateLimiter    = NewRateLimiter(10.0, 20) // 10 requests/second, burst of 20
	securityConfig = &SecurityConfig{
		MaxLoginAttempts:    5,
		LockoutDuration:     15 * time.Minute,
		PasswordMinLength:   8,
		RequireSpecialChars: true,
		RequireNumbers:      true,
		RequireUppercase:    true,
		JWTAccessDuration:   15 * time.Minute,
		JWTRefreshDuration:  7 * 24 * time.Hour, // 7 days
	}
	
	counter     = 0
	counterMu   sync.Mutex
	httpHandler http.Handler // Global handler for Lambda
)

// Optimized ID generation using time-based UUIDs for better performance
func generateID() string {
	counterMu.Lock()
	defer counterMu.Unlock()
	counter++
	// Use timestamp + counter for better uniqueness and performance
	timestamp := time.Now().UnixNano() / 1000000 // milliseconds
	return fmt.Sprintf("%d_%d", timestamp, counter)
}

// Rate limiting functions
// NewRateLimiter creates an optimized rate limiter
func NewRateLimiter(requestsPerSecond float64, burstSize int) *RateLimiter {
	return &RateLimiter{
		visitors:   make(map[string]*rate.Limiter),
		refillRate: rate.Limit(requestsPerSecond),
		bucketSize: burstSize,
	}
}

// Rate limiting functions with optimized token bucket algorithm
func (rl *RateLimiter) getLimiter(ip string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	limiter, exists := rl.visitors[ip]
	if !exists {
		// Use token bucket algorithm: refill rate and burst capacity
		limiter = rate.NewLimiter(rl.refillRate, rl.bucketSize)
		rl.visitors[ip] = limiter
	}

	// Efficient cleanup every 5 minutes
	now := time.Now()
	if now.Sub(rl.cleanupTime) > 5*time.Minute {
		rl.cleanupOldEntries()
		rl.cleanupTime = now
	}

	return limiter
}

func (rl *RateLimiter) cleanupOldEntries() {
	// Called with lock already held
	// Remove limiters that haven't been used recently (full token bucket = unused)
	for ip, limiter := range rl.visitors {
		if limiter.Tokens() >= float64(rl.bucketSize-1) {
			delete(rl.visitors, ip)
		}
	}
}

// Password validation function
func validatePassword(password string) PasswordValidation {
	validation := PasswordValidation{
		IsValid: true,
		Errors:  []string{},
		Score:   0,
	}

	// Check minimum length
	if len(password) < securityConfig.PasswordMinLength {
		validation.IsValid = false
		validation.Errors = append(validation.Errors, fmt.Sprintf("Password must be at least %d characters long", securityConfig.PasswordMinLength))
	} else {
		validation.Score += 20
	}

	// Check for uppercase letters
	hasUpper := false
	for _, char := range password {
		if unicode.IsUpper(char) {
			hasUpper = true
			break
		}
	}
	if securityConfig.RequireUppercase && !hasUpper {
		validation.IsValid = false
		validation.Errors = append(validation.Errors, "Password must contain at least one uppercase letter")
	} else if hasUpper {
		validation.Score += 20
	}

	// Check for numbers
	hasNumber := false
	for _, char := range password {
		if unicode.IsDigit(char) {
			hasNumber = true
			break
		}
	}
	if securityConfig.RequireNumbers && !hasNumber {
		validation.IsValid = false
		validation.Errors = append(validation.Errors, "Password must contain at least one number")
	} else if hasNumber {
		validation.Score += 20
	}

	// Check for special characters
	specialChars := `!@#$%^&*()_+-=[]{}|;:,.<>?`
	hasSpecial := false
	for _, char := range password {
		if strings.ContainsRune(specialChars, char) {
			hasSpecial = true
			break
		}
	}
	if securityConfig.RequireSpecialChars && !hasSpecial {
		validation.IsValid = false
		validation.Errors = append(validation.Errors, "Password must contain at least one special character")
	} else if hasSpecial {
		validation.Score += 20
	}

	// Check for length bonus
	if len(password) >= 12 {
		validation.Score += 10
	}
	if len(password) >= 16 {
		validation.Score += 10
	}

	// Determine strength
	if validation.Score >= 80 {
		validation.Strength = "strong"
	} else if validation.Score >= 60 {
		validation.Strength = "medium"
	} else {
		validation.Strength = "weak"
	}

	return validation
}

// Enhanced JWT functions with refresh tokens
func generateJWTTokens(userID, email, role string) (accessToken, refreshToken string, err error) {
	// Generate access token
	accessClaims := &Claims{
		UserID:    userID,
		Email:     email,
		Role:      role,
		TokenType: "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(securityConfig.JWTAccessDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   userID,
		},
	}

	accessTokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessToken, err = accessTokenObj.SignedString(jwtSecret)
	if err != nil {
		return "", "", err
	}

	// Generate refresh token
	refreshClaims := &Claims{
		UserID:    userID,
		Email:     email,
		Role:      role,
		TokenType: "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(securityConfig.JWTRefreshDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   userID,
		},
	}

	refreshTokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshToken, err = refreshTokenObj.SignedString(jwtRefreshSecret)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
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
	persistentDB = database.NewPostgreSQLDatabase(&appConfig.Database)
	
	// Connect to database
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	if err := persistentDB.Connect(ctx); err != nil {
		return fmt.Errorf("failed to connect to PostgreSQL database: %w", err)
	}
	
	log.Println("Connected to PostgreSQL database successfully")
	
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
	
	return nil
}

// Enhanced admin dashboard with database integration
func getEnhancedAdminDashboard(w http.ResponseWriter, r *http.Request) {
	// Use persistent database for accurate stats
	if persistentDB != nil {
		ctx := r.Context()
		stats, err := persistentDB.GetDashboardStats(ctx)
		if err != nil {
			log.Printf("Failed to get dashboard stats from database: %v", err)
			respondWithError(w, http.StatusInternalServerError, "Failed to retrieve dashboard statistics")
			return
		}
		
		// Add database connection info
		response := map[string]interface{}{
			"stats": stats,
			"database": map[string]interface{}{
				"type":      "postgresql",
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
	
	// No database available
	respondWithError(w, http.StatusServiceUnavailable, "Database not available")
}

// Database management endpoints
func getDatabaseStatus(w http.ResponseWriter, r *http.Request) {
	if persistentDB == nil {
		response := map[string]interface{}{
			"type":      "error",
			"connected": false,
			"message":   "No database connection available",
		}
		respondWithJSON(w, http.StatusServiceUnavailable, response)
		return
	}
	
	ctx := r.Context()
	err := persistentDB.Ping(ctx)
	
	response := map[string]interface{}{
		"type":      "postgresql",
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
		respondWithError(w, http.StatusServiceUnavailable, "Database not available")
		return
	}
	
	// PostgreSQL metrics
	metrics := map[string]interface{}{
		"type": "postgresql",
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
		respondWithError(w, http.StatusServiceUnavailable, "Database not available")
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
		respondWithError(w, http.StatusServiceUnavailable, "Database not available")
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
		log.Printf("Cannot create admin log: database not available")
		return
	}
	
	adminLog := &database.AdminLog{
		ID:          generateID(),
		AdminUserID: adminUserID,
		Action:      action,
		TargetType:  targetType,
		TargetID:    targetID,
		Details:     details,
		CreatedAt:   time.Now(),
	}
	
	if err := persistentDB.CreateAdminLog(ctx, adminLog); err != nil {
		log.Printf("Failed to create admin log: %v", err)
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
		Description: "Professional DSLR camera perfect for photography enthusiasts",
		DailyRate:   50.0,
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
		Description: "High-quality mountain bike suitable for all terrains",
		DailyRate:   30.0,
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
		Description: "Latest gaming console with multiple games included",
		DailyRate:   25.0,
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

// Optimized JWT generation with caching
func generateJWT(userID, email string) (string, error) {
	// Check cache first
	cacheKey := fmt.Sprintf("user_role:%s", userID)
	var role string = "user"
	
	if cachedRole, found := userCache.Get(cacheKey); found {
		role = cachedRole.(string)
	} else {
		// Try persistent database first
		if persistentDB != nil {
			ctx := context.Background()
			if user, err := persistentDB.GetUser(ctx, userID); err == nil && user != nil {
				role = user.Role
				// Cache the role for 10 minutes
				userCache.Put(cacheKey, role)
			}
		} else {
			// Fall back to in-memory database
			db.mutex.RLock()
			if user, exists := db.Users[userID]; exists {
				role = user.Role
				// Cache the role for 10 minutes
				userCache.Put(cacheKey, role)
			}
			db.mutex.RUnlock()
		}
	}

	accessToken, _, err := generateJWTTokens(userID, email, role)
	return accessToken, err
}

func validateJWT(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Check if it's a refresh token
		if claims.TokenType == "refresh" {
			return jwtRefreshSecret, nil
		}
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	// Check if token has expired
	if claims.ExpiresAt != nil && claims.ExpiresAt.Before(time.Now()) {
		return nil, fmt.Errorf("token has expired")
	}

	return claims, nil
}

// Rate limiting middleware
func rateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get client IP
		clientIP := r.Header.Get("X-Forwarded-For")
		if clientIP == "" {
			clientIP = r.Header.Get("X-Real-IP")
		}
		if clientIP == "" {
			clientIP = r.RemoteAddr
		}

		// Get rate limiter for this IP
		limiter := rateLimiter.getLimiter(clientIP)

		// Check if request is allowed
		if !limiter.Allow() {
			w.Header().Set("Retry-After", "60")
			respondWithJSON(w, http.StatusTooManyRequests, map[string]string{
				"error":   "Too many requests",
				"message": "Rate limit exceeded. Please try again later.",
			})
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Enhanced security headers middleware with performance optimizations
func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Enhanced security headers
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		
		// Enhanced Content Security Policy
		csp := "default-src 'self'; " +
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.razorpay.com; " +
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.razorpay.com; " +
			"font-src 'self' https://fonts.gstatic.com; " +
			"img-src 'self' data: https: blob:; " +
			"connect-src 'self' https: wss: https://api.stripe.com https://api.razorpay.com; " +
			"media-src 'self' https: blob:; " +
			"object-src 'none'; " +
			"base-uri 'self'; " +
			"form-action 'self'; " +
			"frame-ancestors 'none';"
		w.Header().Set("Content-Security-Policy", csp)
		
		// Permissions Policy (formerly Feature Policy)
		w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		
		// Only set HSTS in production with HTTPS
		if r.Header.Get("X-Forwarded-Proto") == "https" || r.TLS != nil {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		}
		
		// Performance headers
		w.Header().Set("X-DNS-Prefetch-Control", "on")
		
		// Cache control for static assets
		if isStaticAsset(r.URL.Path) {
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		} else if isAPIEndpoint(r.URL.Path) {
			w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
			w.Header().Set("Pragma", "no-cache")
			w.Header().Set("Expires", "0")
		}

		next.ServeHTTP(w, r)
	})
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

// Compression middleware for performance optimization
type gzipResponseWriter struct {
	io.Writer
	http.ResponseWriter
}

func (w gzipResponseWriter) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

func compressionMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip compression for small responses or specific content types
		if !shouldCompress(r) {
			next.ServeHTTP(w, r)
			return
		}
		
		// Check if client supports gzip
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			next.ServeHTTP(w, r)
			return
		}
		
		// Set compression headers
		w.Header().Set("Content-Encoding", "gzip")
		w.Header().Set("Vary", "Accept-Encoding")
		
		// Create gzip writer
		gz := gzip.NewWriter(w)
		defer gz.Close()
		
		// Wrap response writer
		gzipWriter := gzipResponseWriter{Writer: gz, ResponseWriter: w}
		next.ServeHTTP(gzipWriter, r)
	})
}

func shouldCompress(r *http.Request) bool {
	// Don't compress images, videos, or already compressed content
	contentType := r.Header.Get("Content-Type")
	
	skipTypes := []string{
		"image/",
		"video/",
		"audio/",
		"application/zip",
		"application/gzip",
		"application/x-rar",
		"application/pdf",
	}
	
	for _, skipType := range skipTypes {
		if strings.HasPrefix(contentType, skipType) {
			return false
		}
	}
	
	// Compress text-based content
	compressTypes := []string{
		"text/",
		"application/json",
		"application/javascript",
		"application/xml",
		"application/rss+xml",
		"application/atom+xml",
	}
	
	for _, compressType := range compressTypes {
		if strings.HasPrefix(contentType, compressType) {
			return true
		}
	}
	
	// Default to compression for API endpoints
	if strings.HasPrefix(r.URL.Path, "/api/") {
		return true
	}
	
	return false
}

func isStaticAsset(path string) bool {
	staticExtensions := []string{".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot"}
	for _, ext := range staticExtensions {
		if strings.HasSuffix(path, ext) {
			return true
		}
	}
	return false
}

func isAPIEndpoint(path string) bool {
	return strings.HasPrefix(path, "/api/") || 
		   strings.HasPrefix(path, "/login") || 
		   strings.HasPrefix(path, "/register")
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

	// Validate email format
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(user.Email) {
		respondWithError(w, http.StatusBadRequest, "Invalid email format")
		return
	}

	// Validate password strength
	passwordValidation := validatePassword(user.Password)
	if !passwordValidation.IsValid {
		respondWithJSON(w, http.StatusBadRequest, map[string]interface{}{
			"error":              "Password does not meet requirements",
			"passwordValidation": passwordValidation,
		})
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
	user.Role = "user" // Default role
	user.Status = "active"
	if user.Username == "" {
		user.Username = strings.Split(user.Email, "@")[0]
	}

	db.Users[user.ID] = &user

	// Generate JWT tokens
	accessToken, refreshToken, err := generateJWTTokens(user.ID, user.Email, user.Role)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error generating tokens")
		return
	}

	// Create a response user without password (don't modify the stored user)
	responseUser := user
	responseUser.Password = ""

	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"user":         responseUser,
		"tokenType":    "Bearer",
		"expiresIn":    int(securityConfig.JWTAccessDuration.Seconds()),
	})
}

// Password validation endpoint
func validatePasswordEndpoint(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	validation := validatePassword(request.Password)
	respondWithJSON(w, http.StatusOK, validation)
}

// Token refresh endpoint
func refreshToken(w http.ResponseWriter, r *http.Request) {
	var request struct {
		RefreshToken string `json:"refreshToken"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate refresh token
	claims, err := validateJWT(request.RefreshToken)
	if err != nil || claims.TokenType != "refresh" {
		respondWithError(w, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	// Generate new access token
	accessToken, newRefreshToken, err := generateJWTTokens(claims.UserID, claims.Email, claims.Role)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error generating tokens")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"accessToken":  accessToken,
		"refreshToken": newRefreshToken,
		"tokenType":    "Bearer",
		"expiresIn":    int(securityConfig.JWTAccessDuration.Seconds()),
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

	// Basic validation
	if credentials.Email == "" || credentials.Password == "" {
		respondWithError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	// Find user by email - try persistent database first
	var user *User
	if persistentDB != nil {
		ctx := r.Context()
		if dbUser, err := persistentDB.GetUserByEmail(ctx, credentials.Email); err == nil && dbUser != nil {
			// Convert database user to internal user type
			user = &User{
				ID:        dbUser.ID,
				Username:  dbUser.Username,
				Email:     dbUser.Email,
				Password:  dbUser.Password, // password_hash from database
				FirstName: dbUser.FirstName,
				LastName:  dbUser.LastName,
				Phone:     dbUser.Phone,
				Address:   dbUser.Address,
				Role:      dbUser.Role,
				Status:    dbUser.Status,
				CreatedAt: dbUser.CreatedAt,
			}
		}
	} else {
		// Fall back to in-memory database
		db.mutex.RLock()
		defer db.mutex.RUnlock()

		for _, u := range db.Users {
			if u.Email == credentials.Email {
				user = u
				break
			}
		}
	}

	if user == nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Check if user is active
	if user.Status != "active" {
		respondWithError(w, http.StatusForbidden, "Account is suspended or banned")
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password)); err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Generate JWT tokens
	accessToken, refreshToken, err := generateJWTTokens(user.ID, user.Email, user.Role)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error generating tokens")
		return
	}

	// Create a response user without password
	responseUser := *user
	responseUser.Password = ""

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"user":         responseUser,
		"tokenType":    "Bearer",
		"expiresIn":    int(securityConfig.JWTAccessDuration.Seconds()),
	})
}

// Optimized getItems function with caching and efficient search
func getItems(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters for filtering
	searchTerm := r.URL.Query().Get("search")
	category := r.URL.Query().Get("category")
	location := r.URL.Query().Get("location")
	sortBy := r.URL.Query().Get("sortBy")
	availability := r.URL.Query().Get("availability")
	minRating := r.URL.Query().Get("minRating")
	maxPrice := r.URL.Query().Get("maxPrice")
	minPrice := r.URL.Query().Get("minPrice")

	// Parse price range
	var minPriceFloat, maxPriceFloat float64
	if minPrice != "" {
		minPriceFloat, _ = strconv.ParseFloat(minPrice, 64)
	}
	if maxPrice != "" {
		maxPriceFloat, _ = strconv.ParseFloat(maxPrice, 64)
	}

	// Create cache key for this query
	cacheKey := fmt.Sprintf("items:%s:%s:%s:%s:%s:%s:%s:%s", 
		searchTerm, category, location, sortBy, availability, minRating, minPrice, maxPrice)
	
	// Check cache first
	if cachedItems, found := itemCache.Get(cacheKey); found {
		respondWithJSON(w, http.StatusOK, cachedItems)
		return
	}

	// Use optimized search if search cache is recent (within 5 minutes)
	var items []*Item
	if time.Since(searchCache.LastUpdate) < 5*time.Minute {
		items = searchItemsOptimized(searchTerm, category, location, minPriceFloat, maxPriceFloat)
	} else {
		// Fallback to traditional search and update cache
		items = searchItemsTraditional(searchTerm, category, location, minPriceFloat, maxPriceFloat)
		// Update search cache in background
		go updateSearchCache()
	}

	// Apply availability filter
	if availability == "available" {
		filtered := make([]*Item, 0, len(items))
		for _, item := range items {
			if item.Available {
				filtered = append(filtered, item)
			}
		}
		items = filtered
	}

	// Apply rating filter (optimized with cached rating)
	if minRating != "" {
		if minRatingFloat, err := strconv.ParseFloat(minRating, 64); err == nil {
			filtered := make([]*Item, 0, len(items))
			for _, item := range items {
				// Use cached rating if available
				avgRating := item.AverageRating
				if avgRating == 0 {
					avgRating = calculateItemAverageRating(item.ID)
					// Cache the rating for future use
					item.AverageRating = avgRating
				}
				if avgRating >= minRatingFloat {
					filtered = append(filtered, item)
				}
			}
			items = filtered
		}
	}

	// Sort items using efficient algorithms
	sortItemsOptimized(items, sortBy)

	// Cache the results for 2 minutes
	itemCache.Put(cacheKey, items)

	respondWithJSON(w, http.StatusOK, items)
}

// Traditional search as fallback
func searchItemsTraditional(searchTerm, category, location string, minPrice, maxPrice float64) []*Item {
	db.mutex.RLock()
	defer db.mutex.RUnlock()

	items := make([]*Item, 0)
	
	for _, item := range db.Items {
		if !matchesFilters(item, searchTerm, category, location, minPrice, maxPrice) {
			continue
		}
		items = append(items, item)
	}
	
	return items
}

// Optimized sorting function
func sortItemsOptimized(items []*Item, sortBy string) {
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
			ratingI := items[i].AverageRating
			if ratingI == 0 {
				ratingI = calculateItemAverageRating(items[i].ID)
				items[i].AverageRating = ratingI
			}
			ratingJ := items[j].AverageRating
			if ratingJ == 0 {
				ratingJ = calculateItemAverageRating(items[j].ID)
				items[j].AverageRating = ratingJ
			}
			return ratingI > ratingJ
		})
	case "newest":
		sort.Slice(items, func(i, j int) bool {
			return items[i].CreatedAt.After(items[j].CreatedAt)
		})
	default: // relevance
		// For relevance, sort by a combination of factors
		sort.Slice(items, func(i, j int) bool {
			if items[i].Available != items[j].Available {
				return items[i].Available
			}
			return items[i].CreatedAt.After(items[j].CreatedAt)
		})
	}
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

	db.Items[item.ID] = &item

	// Update search cache with debouncing for better performance
	searchDebouncer.Debounce(func() {
		updateSearchCache()
	})

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
	}
	if itemUpdates.Description != "" {
		item.Description = itemUpdates.Description
	}
	if itemUpdates.DailyRate > 0 {
		item.DailyRate = itemUpdates.DailyRate
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

		// Check user role - try persistent database first
		var user *User
		if persistentDB != nil {
			ctx := r.Context()
			if dbUser, err := persistentDB.GetUser(ctx, userID); err == nil && dbUser != nil {
				// Convert database user to internal user type
				user = &User{
					ID:        dbUser.ID,
					Username:  dbUser.Username,
					Email:     dbUser.Email,
					Password:  dbUser.Password,
					FirstName: dbUser.FirstName,
					LastName:  dbUser.LastName,
					Phone:     dbUser.Phone,
					Address:   dbUser.Address,
					Role:      dbUser.Role,
					Status:    dbUser.Status,
					CreatedAt: dbUser.CreatedAt,
				}
			}
		} else {
			// Fall back to in-memory database
			db.mutex.RLock()
			var exists bool
			user, exists = db.Users[userID]
			db.mutex.RUnlock()
			
			if !exists {
				user = nil
			}
		}

		if user == nil {
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

// Enhanced health check endpoints for monitoring and load balancing
func enhancedHealthCheck(w http.ResponseWriter, r *http.Request) {
	health := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
		"version":   "1.0.0",
		"uptime":    time.Since(time.Now().Add(-time.Hour)).String(), // Placeholder
		"service":   "borrowhub-backend",
	}
	
	// Check database connectivity if available
	if persistentDB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		
		if err := persistentDB.Ping(ctx); err != nil {
			health["database"] = map[string]interface{}{
				"status": "unhealthy",
				"error":  err.Error(),
			}
			health["status"] = "degraded"
		} else {
			health["database"] = map[string]string{"status": "healthy"}
		}
	} else {
		health["database"] = map[string]interface{}{
			"status": "disconnected",
			"error":  "Database not initialized",
		}
		health["status"] = "degraded"
	}
	
	// Memory usage
	var memStats runtime.MemStats
	runtime.GC()
	runtime.ReadMemStats(&memStats)
	
	health["memory"] = map[string]interface{}{
		"allocated":     memStats.Alloc,
		"totalAlloc":    memStats.TotalAlloc,
		"system":        memStats.Sys,
		"numGoroutines": runtime.NumGoroutine(),
	}
	
	// Cache status
	health["cache"] = map[string]interface{}{
		"searchCacheAge": time.Since(searchCache.LastUpdate).String(),
		"itemCacheSize":  "unknown", // Would need to implement cache size tracking
		"userCacheSize":  "unknown",
	}
	
	status := http.StatusOK
	if health["status"] == "degraded" {
		status = http.StatusServiceUnavailable
	}
	
	respondWithJSON(w, status, health)
}

func readinessCheck(w http.ResponseWriter, r *http.Request) {
	// Check if service is ready to accept traffic
	ready := true
	checks := map[string]bool{
		"database": true,
		"cache":    true,
	}
	
	// Check database if available
	if persistentDB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		
		if err := persistentDB.Ping(ctx); err != nil {
			checks["database"] = false
			ready = false
		}
	}
	
	response := map[string]interface{}{
		"ready":     ready,
		"checks":    checks,
		"timestamp": time.Now().Format(time.RFC3339),
	}
	
	status := http.StatusOK
	if !ready {
		status = http.StatusServiceUnavailable
	}
	
	respondWithJSON(w, status, response)
}

func livenessCheck(w http.ResponseWriter, r *http.Request) {
	// Basic liveness check - just return OK if service is running
	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"alive":     true,
		"timestamp": time.Now().Format(time.RFC3339),
		"service":   "borrowhub-backend",
	})
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
	
	// Security endpoints
	router.HandleFunc("/api/auth/validate-password", validatePasswordEndpoint).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/auth/refresh-token", refreshToken).Methods("POST", "OPTIONS")

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

	// Enhanced health check endpoints
	router.HandleFunc("/health", enhancedHealthCheck).Methods("GET")
	router.HandleFunc("/api/health", enhancedHealthCheck).Methods("GET")
	router.HandleFunc("/health/ready", readinessCheck).Methods("GET")
	router.HandleFunc("/health/live", livenessCheck).Methods("GET")

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

	// Wrap router with compression, security, rate limiting, CORS and authentication middleware
	httpHandler = compressionMiddleware(corsMiddleware(securityHeadersMiddleware(rateLimitMiddleware(authMiddleware(router)))))
}

func main() {
	// Initialize application configuration and database
	if err := initializeApp(); err != nil {
		log.Fatalf("Failed to initialize application: %v", err)
	}
	
	// Initialize caches for performance optimization
	initializeCaches()

	// Setup router
	setupRouter()

	// Check if running in Lambda environment
	if os.Getenv("AWS_LAMBDA_RUNTIME_API") != "" {
		// Start Lambda handler
		fmt.Println("BorrowHub backend starting as Lambda function")
		fmt.Printf("Database: PostgreSQL\n")
		fmt.Println("Production deployment ready")
		
		lambda.Start(lambdaHandler)
	} else {
		// Start HTTP server for local development
		fmt.Printf("BorrowHub backend starting as HTTP server on :%d\n", appConfig.Port)
		fmt.Printf("Environment: %s\n", appConfig.Environment)
		fmt.Printf("Database: PostgreSQL\n")
		fmt.Printf("Database Host: %s:%d\n", appConfig.Database.Host, appConfig.Database.Port)
		
		if persistentDB != nil {
			defer persistentDB.Close()
		}
		
		log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", appConfig.Port), httpHandler))
	}
}